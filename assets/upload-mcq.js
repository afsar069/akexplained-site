/* ==========================================================
   AK Explained — owner-only "publish a free MCQ set" page
   ----------------------------------------------------------
   /admin/upload-mcq/ par chalti hai (owner, 2026-11-27: "jo mcqs login ke
   bahar sbke liye free hote hai"). Free set ek PUBLIC file hoti hai
   (assets/questions/<setId>-<level>.json), database ki row nahi (rule 15),
   isliye raasta article wala hi hai: file repo me jaati hai, Cloudflare
   build karta hai, 2-3 minute me set live — hub row, set page, review page,
   "Build your own test", sab apne aap (_data/mcqAges.js: free set apni file
   aate hi live ho jata hai).

   Yahan ke check zyada sakht hain, do wajah se:
     1. galat tag se SITE KA BUILD ruk jata hai (check-topics gate, rule 12);
     2. free matlab hamesha ke liye public — galti wapas nahi hoti (rule 15).
   Phir bhi asli darwaza server hai: Edge Function publish-article har file
   dobara jaanchta hai (registry se slot, master taxonomy se tags).

   Sirf wahi set yahan dikhte hain jo registry me pehle se PLAN hain aur FREE
   hain. Login/paid set kabhi nahi: uski file repo me jaa hi nahi sakti.
   ========================================================== */
(function () {
  'use strict';

  function el(id) { return document.getElementById(id); }
  function show(x) { if (x) x.hidden = false; }
  function hide(x) { if (x) x.hidden = true; }

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function whenAuth() {
    return new Promise(function (resolve) {
      var tries = 0;
      (function check() {
        if (window.akAuth) return resolve(window.akAuth);
        if (tries++ > 100) return resolve(null);
        setTimeout(check, 30);
      })();
    });
  }

  function row(kind, text) { return '<li class="' + kind + '">' + text + '</li>'; }

  /* ---------- the plan (build ke waqt page me daala gaya) ---------- */
  var PLAN = (function () {
    try {
      var box = el('fqPlan');
      return box ? JSON.parse(box.textContent || '{}') : {};
    } catch (e) { return {}; }
  })();
  var SLOTS = Array.isArray(PLAN.slots) ? PLAN.slots : [];
  var TOPIC_IDS = {};
  var PERIOD_IDS = {};
  (PLAN.topicIds || []).forEach(function (id) { TOPIC_IDS[id] = true; });
  (PLAN.periodIds || []).forEach(function (id) { PERIOD_IDS[id] = true; });

  var state = {
    slot: null,      // chuna hua set
    files: {},       // level -> { name, body, text }
    blocking: 0
  };

  /* ---------- 1. kaunsa set ---------- */

  function fillSlots() {
    var sel = el('fqSlot');
    if (!sel) return;
    var bySeries = {};
    SLOTS.forEach(function (s) { (bySeries[s.series] || (bySeries[s.series] = [])).push(s); });
    var html = '<option value="">Choose a set&hellip;</option>';
    Object.keys(bySeries).forEach(function (series) {
      html += '<optgroup label="' + esc(series) + '">';
      bySeries[series].forEach(function (s) {
        html += '<option value="' + esc(s.setId) + '">' + esc(s.ageName) + ' &mdash; Set ' + s.n + ': ' +
          esc(s.title) + (s.published ? ' (already on the website)' : '') + '</option>';
      });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
    var hint = el('fqSlotHint');
    if (hint) {
      hint.textContent = PLAN.slots.filter(function (s) { return !s.published; }).length +
        ' of the ' + PLAN.slots.length + ' planned free sets have no questions yet.';
    }
  }

  function pickSlot() {
    var sel = el('fqSlot');
    state.slot = SLOTS.filter(function (s) { return s.setId === (sel && sel.value); })[0] || null;
    state.files = {};
    var note = el('fqSlotPlan');
    hide(el('fqPreviewCard'));
    hide(el('fqDone'));
    if (!state.slot) {
      if (note) note.textContent = '';
      hide(el('fqFilesCard')); hide(el('fqChecksCard')); hide(el('fqGo'));
      return;
    }
    var s = state.slot;
    if (note) {
      note.innerHTML = '<strong>The plan for this set:</strong> ' + s.count + ' questions at each level, ' +
        'levels ' + s.levels.join(' and ') + ', topics ' + s.topics.join(', ') + '. ' +
        'Its files are <code>' + s.files.map(function (f) { return esc(f.name); }).join('</code> and <code>') + '</code>.' +
        (s.published ? ' <strong>This set is already on the website.</strong>' : '');
    }
    var hint = el('fqFilesHint');
    if (hint) hint.textContent = 'One file for each level: ' + s.levels.join(' and ') + '.';
    var fileBox = el('fqFiles');
    if (fileBox) fileBox.value = '';
    el('fqFileList').innerHTML = '';
    show(el('fqFilesCard'));
    hide(el('fqChecksCard'));
    hide(el('fqGo'));
  }

  /* ---------- 2. files ---------- */

  function fileError(msg) {
    var box = el('fqFileError');
    if (!box) return;
    if (!msg) { hide(box); box.textContent = ''; return; }
    box.textContent = msg;
    show(box);
  }

  /* Owner ka generator kabhi sirf questions ki list deta hai (upload-paper me yahi hua tha).
     Aisi file ko yahan lapet dete hain: set ka naam aur level hamare chune hue slot se aate hain,
     rev 1. Jo file khud apna setId/level likhti hai, uska wahi rakha jata hai aur jaanch hoti hai. */
  function wrap(parsed, level) {
    if (Array.isArray(parsed)) {
      return { setId: state.slot.setId, setNumber: state.slot.n, setName: state.slot.title,
        level: level, rev: 1, questions: parsed };
    }
    return parsed;
  }

  function levelOf(name, body) {
    if (body && typeof body.level === 'string') return body.level.toLowerCase();
    var m = String(name || '').toLowerCase().match(/-(easy|medium|hard)\.json$/);
    return m ? m[1] : '';
  }

  function readFiles(list) {
    fileError('');
    state.files = {};
    var jobs = Array.prototype.map.call(list, function (f) {
      return new Promise(function (resolve) {
        var reader = new FileReader();
        reader.onload = function () {
          var text = String(reader.result || '');
          var parsed = null;
          try { parsed = JSON.parse(text); } catch (e) { /* neeche batate hain */ }
          resolve({ name: f.name, text: text, parsed: parsed });
        };
        reader.onerror = function () { resolve({ name: f.name, text: '', parsed: null }); };
        reader.readAsText(f);
      });
    });
    Promise.all(jobs).then(function (got) {
      var notes = [];
      got.forEach(function (g) {
        if (!g.parsed) { notes.push(row('no', esc(g.name) + ' is not a question file this page can read.')); return; }
        var level = levelOf(g.name, Array.isArray(g.parsed) ? null : g.parsed);
        if (!level) {
          notes.push(row('no', esc(g.name) + ' does not say which level it is. Name it like <code>' +
            esc(state.slot.setId) + '-' + esc(state.slot.levels[0]) + '.json</code>.'));
          return;
        }
        var body = wrap(g.parsed, level);
        // Set ka naam aur level hamesha chune hue slot ke, taaki file kabhi galat jagah na jaye
        // (upload-paper bhi yahi karta hai).
        body.setId = state.slot.setId;
        body.setNumber = state.slot.n;
        body.level = level;
        if (!Number.isInteger(body.rev) || body.rev < 1) body.rev = 1;
        state.files[level] = { name: g.name, body: body, text: JSON.stringify(body, null, 2) + '\n' };
        notes.push(row('ok', esc(g.name) + ' &rarr; the <strong>' + esc(level) + '</strong> level, ' +
          (body.questions || []).length + ' questions.'));
      });
      el('fqFileList').innerHTML = notes.join('');
      show(el('fqChecksCard'));
      runChecks();
    });
  }

  /* ---------- 3. checks ---------- */

  function runChecks() {
    var list = el('fqChecks');
    if (!list || !state.slot) return;
    var out = [];
    state.blocking = 0;
    function bad(t) { state.blocking++; out.push(row('no', t)); }
    function warn(t) { out.push(row('warn', t)); }
    function ok(t) { out.push(row('ok', t)); }

    var s = state.slot;
    var given = Object.keys(state.files);
    var missing = s.levels.filter(function (l) { return given.indexOf(l) === -1; });
    var extra = given.filter(function (l) { return s.levels.indexOf(l) === -1; });

    if (extra.length) bad('This set has no ' + extra.join(' or ') + ' level, so that file cannot go here.');
    if (missing.length) {
      bad('The ' + missing.join(' and ') + ' file' + (missing.length === 1 ? ' is' : 's are') +
        ' still missing. A set goes live only when every level is there.');
    } else if (!extra.length) {
      ok('Both levels are here: ' + s.levels.join(' and ') + '.');
    }

    var allIds = {};
    s.levels.forEach(function (level) {
      var f = state.files[level];
      if (!f) return;
      var qs = f.body.questions;
      if (!Array.isArray(qs) || !qs.length) { bad('The ' + level + ' file has no questions.'); return; }
      if (qs.length !== s.count) {
        bad('The plan says ' + s.count + ' questions, but the ' + level + ' file has ' + qs.length +
          '. Send the right file, or ask Claude to change the plan.');
      } else {
        ok('The ' + level + ' file has ' + qs.length + ' questions, as the plan says.');
      }

      var trouble = [];
      var seenText = {};
      for (var i = 0; i < qs.length; i++) {
        var q = qs[i] || {};
        var at = 'Question ' + (i + 1);
        var id = String(q.id || '');
        if (!id) { trouble.push(at + ' has no id.'); continue; }
        if (id.indexOf(s.setId + '-') !== 0) { trouble.push(at + ': its id does not belong to this set.'); continue; }
        if (allIds[id]) { trouble.push(at + ': the id ' + id + ' is used twice.'); continue; }
        allIds[id] = true;
        if (!String(q.question || '').trim()) { trouble.push(at + ' has no question.'); continue; }
        var opts = q.options;
        if (!Array.isArray(opts) || opts.length !== 4) { trouble.push(at + ' does not have four options.'); continue; }
        var clean = opts.map(function (o) { return String(o == null ? '' : o).trim(); });
        if (clean.some(function (o) { return !o; })) { trouble.push(at + ' has an empty option.'); continue; }
        var uniq = {};
        clean.forEach(function (o) { uniq[o] = true; });
        if (Object.keys(uniq).length !== 4) { trouble.push(at + ' has two options the same.'); continue; }
        var right = q.correct_option_id;
        if (!(right === 0 || right === 1 || right === 2 || right === 3)) { trouble.push(at + ': the right option is not marked 0 to 3.'); continue; }
        if (!String(q.explanation || '').trim()) { trouble.push(at + ' has no explanation.'); continue; }
        if (!q.topicId) { trouble.push(at + ' has no topicId.'); continue; }
        if (!TOPIC_IDS[q.topicId]) { trouble.push(at + ': the topicId "' + q.topicId + '" is not in the topic list.'); continue; }
        if (q.periodId && !PERIOD_IDS[q.periodId]) { trouble.push(at + ': the periodId "' + q.periodId + '" is not a period.'); continue; }
        var key = String(q.question || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (seenText[key]) trouble.push(at + ' repeats the words of question ' + seenText[key] + '.');
        else seenText[key] = i + 1;
      }
      if (trouble.length) {
        bad('The ' + level + ' file has ' + trouble.length + ' thing' + (trouble.length === 1 ? '' : 's') +
          ' to fix:<ul><li>' + trouble.slice(0, 8).map(esc).join('</li><li>') + '</li></ul>' +
          (trouble.length > 8 ? '<em>and ' + (trouble.length - 8) + ' more.</em>' : ''));
      } else {
        ok('Every question in the ' + level + ' file has an id, four options, a right answer, an explanation and a real topic.');
      }
    });

    if (s.published) {
      warn('This set is already on the website. Publishing will replace its questions &mdash; tick the box below.');
    }

    list.innerHTML = out.join('');
    show(el('fqGo'));
    var pv = el('fqPreviewBtn');
    if (pv) { if (Object.keys(state.files).length) show(pv); else hide(pv); }
    if (s.published) show(el('fqReplaceWrap')); else hide(el('fqReplaceWrap'));
    updateGo();
  }

  function updateGo() {
    var btn = el('fqButton');
    var sum = el('fqSummary');
    var confirmed = el('fqConfirm') && el('fqConfirm').checked;
    var replaceOk = !state.slot || !state.slot.published || (el('fqReplace') && el('fqReplace').checked);
    if (!btn) return;
    btn.disabled = state.blocking > 0 || !confirmed || !replaceOk;
    if (!sum) return;
    if (state.blocking) {
      sum.innerHTML = '<strong>' + state.blocking + ' thing' + (state.blocking === 1 ? '' : 's') +
        ' above must be fixed first.</strong>';
    } else if (!confirmed) {
      sum.innerHTML = 'Tick the box to say you know these questions become free for everyone.';
    } else if (!replaceOk) {
      sum.innerHTML = 'Tick the replace box: this set already has questions on the website.';
    } else {
      sum.innerHTML = 'This will put <strong>' + Object.keys(state.files).join(' and ') +
        '</strong> on the website for <strong>' + esc(state.slot.ageName) + ' Set ' + state.slot.n + '</strong>, open to everyone.';
    }
  }

  /* ---------- 4. preview ---------- */

  function renderPreview() {
    var box = el('fqPreview');
    if (!box || !state.slot) return;
    var html = '';
    state.slot.levels.forEach(function (level) {
      var f = state.files[level];
      if (!f) return;
      html += '<h3>' + esc(level) + '</h3>';
      (f.body.questions || []).slice(0, 3).forEach(function (q, i) {
        html += '<div class="fqq"><p class="fqq-q">' + (i + 1) + '. ' + esc(q.question) + '</p><ol class="fqq-o">';
        (q.options || []).forEach(function (o, k) {
          html += '<li' + (k === q.correct_option_id ? ' class="right"' : '') + '>' + esc(o) +
            (k === q.correct_option_id ? ' <strong>&larr; the answer</strong>' : '') + '</li>';
        });
        html += '</ol><p class="fqq-x">' + esc(q.explanation) + '</p>' +
          '<p class="fqq-t">topic: <code>' + esc(q.topicId) + '</code>' +
          (q.periodId ? ' &middot; period: <code>' + esc(q.periodId) + '</code>' : '') + '</p></div>';
      });
    });
    box.innerHTML = html;
    show(el('fqPreviewCard'));
    el('fqPreviewCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- 5. publish ---------- */

  function publish(auth) {
    var btn = el('fqButton');
    var errBox = el('fqError');
    hide(errBox);
    if (btn) { btn.disabled = true; btn.textContent = 'Publishing…'; }

    var cfg = window.AK_SUPABASE || {};
    var files = Object.keys(state.files).map(function (level) {
      return { level: level, text: state.files[level].text };
    });

    return auth.session().then(function (s) {
      var token = s && s.access_token;
      if (!token) throw new Error('Please log in again.');
      return fetch(cfg.url + '/functions/v1/publish-article', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'apikey': cfg.publishableKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish-questions',
          setId: state.slot.setId,
          files: files,
          replace: !!(el('fqReplace') && el('fqReplace').checked)
        })
      });
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (d) { return { ok: res.ok, status: res.status, data: d }; });
    }).then(function (r) {
      if (btn) { btn.textContent = 'Publish this set'; btn.disabled = false; }
      if (!r.ok || !r.data.ok) {
        var msg = (r.data && r.data.error) || 'The set could not be published (' + r.status + ').';
        if (errBox) { errBox.textContent = msg; show(errBox); }
        done(false, msg);
        return;
      }
      done(true, '', r.data);
    }).catch(function (e) {
      if (btn) { btn.textContent = 'Publish this set'; btn.disabled = false; }
      var msg = (e && e.message) || 'The set could not be published.';
      if (errBox) { errBox.textContent = msg; show(errBox); }
      done(false, msg);
    });
  }

  function done(okay, errMsg, data) {
    var card = el('fqDone');
    var verdict = el('fqVerdict');
    var rep = el('fqDoneReport');
    show(card);

    if (!okay) {
      el('fqDoneTitle').textContent = 'Not published';
      verdict.className = 'upverdict is-no';
      verdict.textContent = 'The set was not published. Nothing on the website changed.';
      rep.innerHTML = row('no', esc(errMsg));
      hide(el('fqCheckBtn'));
      showCopy('Publishing a free MCQ set failed on /admin/upload-mcq/.\n\nSet: ' +
        (state.slot ? state.slot.setId : '(none)') + '\nFiles: ' + Object.keys(state.files).join(', ') +
        '\nMessage: ' + errMsg);
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    el('fqDoneTitle').textContent = 'Published';
    verdict.className = 'upverdict is-ok';
    verdict.textContent = data.replaced
      ? 'Saved. These questions replaced the ones that were there.'
      : 'Saved. The set is on its way to the website.';
    var url = data.url || '/quizzes/mcq/';
    rep.innerHTML = [
      row('ok', 'Saved: ' + (data.levels || []).join(' and ') + '.'),
      row('ok', 'Address: <a href="' + esc(url) + '">akexplained.com' + esc(url) + '</a>'),
      row('warn', 'The website is building now. The set, its page and its review page are usually ready in about two to three minutes.')
    ].join('');
    hide(el('fqCopy'));
    var btn = el('fqCheckBtn');
    show(btn);
    btn.onclick = function () {
      var note = el('fqCheckNote');
      note.textContent = 'Looking…';
      fetch(url, { cache: 'no-store' }).then(function (r) {
        note.innerHTML = r.ok
          ? 'It is live. <a href="' + esc(url) + '">Open the set</a>'
          : 'Not ready yet. Wait a little and press again.';
      }).catch(function () { note.textContent = 'Could not check just now. Wait a little and press again.'; });
    };
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showCopy(text) {
    var box = el('fqCopy');
    var area = el('fqCopyText');
    if (!box || !area) return;
    area.value = text;
    show(box);
    el('fqCopyBtn').onclick = function () {
      area.select();
      var note = el('fqCopyNote');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(area.value).then(
          function () { if (note) note.textContent = 'Copied.'; },
          function () { if (note) note.textContent = 'Press Ctrl+C to copy.'; });
      } else if (note) { note.textContent = 'Press Ctrl+C to copy.'; }
    };
  }

  /* ---------- start ---------- */

  function start() {
    var notice = el('fqNotice');
    whenAuth().then(function (auth) {
      function no() { notice.textContent = 'You are not allowed to use this page.'; }
      if (!auth || !auth.configured || !auth.client) return no();
      auth.session().then(function (s) {
        if (!s || !s.user) return no();
        auth.client.from('paper_admins').select('user_id').maybeSingle().then(function (res) {
          if (res.error || !res.data) return no();
          hide(notice);
          show(el('fqBody'));
          fillSlots();
          el('fqSlot').addEventListener('change', pickSlot);
          el('fqFiles').addEventListener('change', function (e) {
            if (!state.slot) return;
            readFiles(e.target.files || []);
          });
          el('fqPreviewBtn').addEventListener('click', renderPreview);
          el('fqConfirm').addEventListener('change', updateGo);
          el('fqReplace').addEventListener('change', updateGo);
          el('fqButton').addEventListener('click', function () { publish(auth); });
        }, no);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
