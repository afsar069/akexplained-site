/* ==========================================================
   AK Explained — owner-only "correct a Daily quiz" page
   ----------------------------------------------------------
   /admin/upload-daily/ par chalti hai (owner, 2026-11-27: "daily quiz wali
   function add karo lekin ek new section admin page par, ek new card means").

   Daily quiz ki file bhi ek PUBLIC file hai: assets/instant/<period>-<level>.json
   (rule 8). Isliye raasta article aur free MCQ set wala hi hai: file repo me
   jaati hai, Cloudflare build karta hai, 2-3 minute me quiz badal jaata hai.

   Ek baat jo doosre do page se alag hai: saare 40 bank pehle se site par hain,
   isliye yahan ka kaam **naya bank banana nahi, chal rahe bank ko sudharna** hai.
   Isliye page pehle website par chal rahi file padhta hai aur dikhata hai ki
   kya-kya badal raha hai. Do cheezein khaas:
     1. **ids jami hui hain** (rule 8/12) — student ka saved progress inhi par
        tika hai. Isliye id hatana ya prefix badalna roka jata hai.
     2. **reason (explanation) optional hai** — Age of Chaucer ke do bank me
        reasons nahi hain. Jo reasons site par hain wo kho na jaayein, ye roka
        jata hai; aur jahan naye reasons aa rahe hain wahan page ka text badalna
        Claude ka kaam hai (rule 8), isliye wo bataya jata hai.
   Asli darwaza server hai: Edge Function publish-article sab dobara jaanchta
   hai aur sirf us file ko likhta hai jo pehle se maujood hai.
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

  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' '); }

  /* ---------- the banks (build ke waqt page me daale gaye) ---------- */
  var PLAN = (function () {
    try {
      var box = el('dqPlan');
      return box ? JSON.parse(box.textContent || '{}') : {};
    } catch (e) { return {}; }
  })();
  var BANKS = Array.isArray(PLAN.banks) ? PLAN.banks : [];
  var TOPIC_IDS = {};
  var PERIOD_IDS = {};
  (PLAN.topicIds || []).forEach(function (id) { TOPIC_IDS[id] = true; });
  (PLAN.periodIds || []).forEach(function (id) { PERIOD_IDS[id] = true; });

  var state = {
    bank: null,      // chuna hua bank (plan se)
    now: null,       // website par chal rahi file
    sibling: null,   // usi period ka doosra level (rule 8 step 2 ka duplicate check)
    body: null,      // jo file bhejni hai
    name: '',
    blocking: 0,
    changes: []
  };

  /* ---------- 1. kaunsa quiz ---------- */

  function fillBanks() {
    var sel = el('dqBank');
    if (!sel) return;
    var byPeriod = {};
    var order = [];
    BANKS.forEach(function (b) {
      if (!byPeriod[b.period]) { byPeriod[b.period] = []; order.push(b.period); }
      byPeriod[b.period].push(b);
    });
    var html = '<option value="">Choose a quiz&hellip;</option>';
    order.forEach(function (period) {
      html += '<optgroup label="' + esc(period) + '">';
      byPeriod[period].forEach(function (b) {
        html += '<option value="' + esc(b.file) + '">' + esc(b.period) + ' &mdash; ' +
          esc(b.level) + ' (' + b.count + ' questions)</option>';
      });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
    var hint = el('dqBankHint');
    if (hint) hint.textContent = BANKS.length + ' quizzes are on the website.';
  }

  function levelFile(bank) { return '/assets/instant/' + bank.file; }

  function pickBank() {
    var sel = el('dqBank');
    var file = sel && sel.value;
    state.bank = BANKS.filter(function (b) { return b.file === file; })[0] || null;
    state.now = null;
    state.sibling = null;
    state.body = null;
    state.name = '';
    hide(el('dqChecksCard')); hide(el('dqPreviewCard')); hide(el('dqGo')); hide(el('dqDone'));
    var note = el('dqBankNow');
    if (!state.bank) {
      if (note) note.textContent = '';
      hide(el('dqFileCard'));
      return;
    }
    var b = state.bank;
    if (note) {
      note.innerHTML = 'On the website now: <strong>' + b.count + ' questions</strong>, ids like <code>' +
        esc(b.prefix) + '01</code>, rev ' + b.rev + ', ' +
        (b.reasons ? 'every question has a reason' : '<strong>no reasons</strong>') +
        '. Its file is <code>assets/instant/' + esc(b.file) + '</code>.';
    }
    var fileBox = el('dqFile');
    if (fileBox) fileBox.value = '';
    show(el('dqFileCard'));

    // Website par chal rahi file, aur usi period ka doosra level (duplicate check ke liye).
    var sib = BANKS.filter(function (x) { return x.period === b.period && x.file !== b.file; })[0] || null;
    fetchJson(levelFile(b)).then(function (d) { state.now = d; });
    if (sib) fetchJson(levelFile(sib)).then(function (d) { state.sibling = { bank: sib, data: d }; });
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      return r.ok ? r.json() : null;
    }).catch(function () { return null; });
  }

  /* ---------- 2. the file ---------- */

  function fileError(msg) {
    var box = el('dqFileError');
    if (!box) return;
    if (!msg) { hide(box); box.textContent = ''; return; }
    box.textContent = msg;
    show(box);
  }

  /* Owner ka generator kabhi sirf questions ki list deta hai. Aisi file ko lapet dete hain:
     bankId, period aur level hamesha chune hue quiz ke, taaki file kabhi galat quiz par na jaye. */
  function readFile(f) {
    fileError('');
    state.body = null;
    state.name = f ? f.name : '';
    var reader = new FileReader();
    reader.onload = function () {
      var parsed = null;
      try { parsed = JSON.parse(String(reader.result || '')); } catch (e) { parsed = null; }
      if (!parsed || (!Array.isArray(parsed) && !Array.isArray(parsed.questions))) {
        fileError('This is not a question file this page can read. It should be the list of questions, or the whole file with its questions inside.');
        hide(el('dqChecksCard')); hide(el('dqGo'));
        return;
      }
      var b = state.bank;
      var body = Array.isArray(parsed) ? { questions: parsed } : parsed;
      body.bankId = b.bankId;
      body.period = b.period;
      body.level = b.level;
      var rev = Number(body.rev);
      // rev hamesha aage badhta hai: file ne bada rev likha ho to wahi, warna agla.
      // Daily file me paanch hi cheezein hoti hain, usi kram me (rule 8); questions ka
      // apna kram jaisa bheja gaya waisa hi rehta hai.
      state.body = {
        bankId: b.bankId,
        period: b.period,
        level: b.level,
        rev: Number.isInteger(rev) && rev > b.rev ? rev : b.rev + 1,
        questions: body.questions
      };
      runChecks();
    };
    reader.onerror = function () { fileError('The file could not be read. Try choosing it again.'); };
    if (f) reader.readAsText(f);
  }

  /* ---------- 3. checks ---------- */

  function runChecks() {
    var list = el('dqChecks');
    var b = state.bank;
    if (!list || !b || !state.body) return;
    var out = [];
    state.blocking = 0;
    state.changes = [];
    function bad(t) { state.blocking++; out.push(row('no', t)); }
    function warn(t) { out.push(row('warn', t)); }
    function ok(t) { out.push(row('ok', t)); }
    function info(t) { out.push(row('info', t)); }

    var qs = state.body.questions;
    if (!Array.isArray(qs) || !qs.length) {
      bad('This file has no questions.');
      list.innerHTML = out.join('');
      show(el('dqChecksCard')); show(el('dqGo'));
      hide(el('dqPreviewBtn'));
      updateGo();
      return;
    }

    /* --- per-question --- */
    var trouble = [];
    var ids = {};
    var seenText = {};
    var noReason = 0;
    for (var i = 0; i < qs.length; i++) {
      var q = qs[i] || {};
      var at = 'Question ' + (i + 1);
      var id = String(q.id || '');
      if (!id) { trouble.push(at + ' has no id.'); continue; }
      if (id.indexOf(b.prefix) !== 0) {
        trouble.push(at + ': its id "' + id + '" does not start with ' + b.prefix + ', so it does not belong to this quiz.');
        continue;
      }
      if (ids[id]) { trouble.push(at + ': the id ' + id + ' is used twice.'); continue; }
      ids[id] = i + 1;
      if (!String(q.question || '').trim()) { trouble.push(at + ' has no question.'); continue; }
      var opts = q.options;
      if (!Array.isArray(opts) || (opts.length !== 4 && opts.length !== 2)) {
        trouble.push(at + ' has ' + (Array.isArray(opts) ? opts.length : 0) +
          ' options. It needs four, or two for a True / False question.');
        continue;
      }
      var clean = opts.map(function (o) { return String(o == null ? '' : o).trim(); });
      if (clean.some(function (o) { return !o; })) { trouble.push(at + ' has an empty option.'); continue; }
      var uniq = {};
      clean.forEach(function (o) { uniq[o] = true; });
      if (Object.keys(uniq).length !== clean.length) { trouble.push(at + ' has two options the same.'); continue; }
      var right = q.correct_option_id;
      if (!Number.isInteger(right) || right < 0 || right >= clean.length) {
        trouble.push(at + ': the right option is not marked 0 to ' + (clean.length - 1) + '.');
        continue;
      }
      if (!String(q.explanation || '').trim()) noReason++;
      if (!q.topicId) { trouble.push(at + ' has no topicId.'); continue; }
      if (!TOPIC_IDS[q.topicId]) { trouble.push(at + ': the topicId "' + q.topicId + '" is not in the topic list.'); continue; }
      if (q.periodId && !PERIOD_IDS[q.periodId]) { trouble.push(at + ': the periodId "' + q.periodId + '" is not a period.'); continue; }
      var key = norm(q.question);
      if (seenText[key]) trouble.push(at + ' repeats the words of question ' + seenText[key] + '.');
      else seenText[key] = i + 1;
    }

    if (trouble.length) {
      bad('This file has ' + trouble.length + ' thing' + (trouble.length === 1 ? '' : 's') +
        ' to fix:<ul><li>' + trouble.slice(0, 8).map(esc).join('</li><li>') + '</li></ul>' +
        (trouble.length > 8 ? '<em>and ' + (trouble.length - 8) + ' more.</em>' : ''));
    } else {
      ok('All ' + qs.length + ' questions have an id of this quiz, their options, a right answer and a real topic.');
    }

    /* --- reasons (rule 8: reason optional hai, par site par jo hai wo khona nahi chahiye) --- */
    if (b.reasons && noReason > 0) {
      bad(noReason + ' question' + (noReason === 1 ? ' has' : 's have') + ' no reason, but every question on the website has one. ' +
        'Readers would stop seeing the reason for ' + (noReason === 1 ? 'it' : 'them') + '. Add the reasons, or ask Claude if this is on purpose.');
    } else if (b.reasons && noReason === 0) {
      ok('Every question has its reason, as on the website now.');
    } else if (!b.reasons && noReason === 0) {
      warn('This quiz has no reasons on the website, and this file has one for every question. That is good, but the quiz page still says nothing about reasons &mdash; ask Claude to change that page text, or readers will not be told.');
    } else if (!b.reasons && noReason < qs.length) {
      warn((qs.length - noReason) + ' of the ' + qs.length + ' questions have a reason and the rest do not. On this quiz the website shows no reasons at all today, so ask Claude before publishing a half-and-half file.');
    } else {
      info('This file has no reasons, the same as the quiz on the website.');
    }

    /* --- ids: jami hui hain (rule 8/12) --- */
    if (state.now && Array.isArray(state.now.questions)) {
      var old = {};
      state.now.questions.forEach(function (q) { if (q && q.id) old[String(q.id)] = q; });
      var oldIds = Object.keys(old);
      var missing = oldIds.filter(function (id) { return !ids[id]; });
      var added = Object.keys(ids).filter(function (id) { return !old[id]; });
      if (missing.length) {
        bad(missing.length + ' question' + (missing.length === 1 ? '' : 's') + ' on the website ' +
          (missing.length === 1 ? 'is' : 'are') + ' not in this file (' + esc(missing.slice(0, 6).join(', ')) +
          (missing.length > 6 ? ', and more' : '') + '). Ids are never taken away, because students&rsquo; saved answers hang on them. ' +
          'Send the whole quiz, or ask Claude to retire those numbers.');
      } else if (added.length) {
        warn(added.length + ' question' + (added.length === 1 ? ' is' : 's are') + ' new (' +
          esc(added.slice(0, 6).join(', ')) + (added.length > 6 ? ', and more' : '') + '). ' +
          'The quiz would go from ' + oldIds.length + ' to ' + qs.length + ' questions. ' +
          'The quiz page says how many questions it has, so ask Claude to change that line.');
      } else {
        ok('The same ' + oldIds.length + ' questions, with the same ids. No reader loses their progress.');
      }

      /* --- kya badal raha hai --- */
      var same = 0;
      Object.keys(ids).forEach(function (id) {
        var o = old[id];
        if (!o) return;
        var n = qs[ids[id] - 1];
        var changed = [];
        if (norm(o.question) !== norm(n.question)) changed.push('the question');
        var oo = (o.options || []).map(norm).join(' | ');
        var no = (n.options || []).map(norm).join(' | ');
        if (oo !== no) changed.push('the options');
        var oRight = norm((o.options || [])[o.correct_option_id]);
        var nRight = norm((n.options || [])[n.correct_option_id]);
        if (oRight !== nRight) changed.push('the answer');
        if (norm(o.explanation) !== norm(n.explanation)) changed.push('the reason');
        if (changed.length) state.changes.push({ id: id, at: ids[id], was: o, now: n, what: changed });
        else same++;
      });
      if (state.changes.length) {
        var answers = state.changes.filter(function (c) { return c.what.indexOf('the answer') !== -1; }).length;
        info(state.changes.length + ' question' + (state.changes.length === 1 ? '' : 's') + ' would change' +
          (answers ? ', and ' + answers + ' of them a different answer' : '') + '. ' + same + ' stay exactly as they are. Press the button below to read them.');
      } else if (!added.length) {
        warn('Nothing in this file is different from the quiz on the website. Publishing would change nothing.');
      }
    } else {
      warn('The quiz on the website could not be read just now, so this page cannot say what changes. The website will still check the file when you publish.');
    }

    /* --- doosre level ki hi file nahi hai? (rule 8 step 2) --- */
    if (state.sibling && state.sibling.data && Array.isArray(state.sibling.data.questions)) {
      var sibText = {};
      state.sibling.data.questions.forEach(function (q) { if (q) sibText[norm(q.question)] = true; });
      var match = 0;
      qs.forEach(function (q) { if (sibText[norm(q.question)]) match++; });
      var share = Math.round((match / qs.length) * 100);
      if (share >= 60) {
        bad(share + '% of these questions are the ' + esc(state.sibling.bank.level) +
          ' quiz of the same period, word for word. This looks like the wrong file. Check which level you meant.');
      } else if (match > 0) {
        info(match + ' question' + (match === 1 ? '' : 's') + ' here also appear' + (match === 1 ? 's' : '') +
          ' in the ' + esc(state.sibling.bank.level) + ' quiz of this period. That is allowed, but worth a look.');
      }
    }

    info('This file will be saved as rev ' + state.body.rev + ' (the website has rev ' + b.rev + ').');

    list.innerHTML = out.join('');
    show(el('dqChecksCard'));
    show(el('dqGo'));
    var pv = el('dqPreviewBtn');
    if (pv) { if (state.changes.length) show(pv); else hide(pv); }
    updateGo();
  }

  function updateGo() {
    var btn = el('dqButton');
    var sum = el('dqSummary');
    var confirmed = el('dqConfirm') && el('dqConfirm').checked;
    if (!btn) return;
    btn.disabled = state.blocking > 0 || !confirmed || !state.body;
    if (!sum) return;
    if (state.blocking) {
      sum.innerHTML = '<strong>' + state.blocking + ' thing' + (state.blocking === 1 ? '' : 's') +
        ' above must be fixed first.</strong>';
    } else if (!confirmed) {
      sum.innerHTML = 'Tick the box to say you have checked the changes.';
    } else {
      sum.innerHTML = 'This will put <strong>' + (state.body.questions || []).length + ' questions</strong> on the <strong>' +
        esc(state.bank.period) + ' &mdash; ' + esc(state.bank.level) + '</strong> quiz, open to everyone.';
    }
  }

  /* ---------- 4. what changes ---------- */

  function optList(q) {
    var html = '<ol class="fqq-o">';
    (q.options || []).forEach(function (o, k) {
      html += '<li' + (k === q.correct_option_id ? ' class="right"' : '') + '>' + esc(o) +
        (k === q.correct_option_id ? ' <strong>&larr; the answer</strong>' : '') + '</li>';
    });
    return html + '</ol>';
  }

  function renderPreview() {
    var box = el('dqPreview');
    if (!box) return;
    var html = '';
    state.changes.slice(0, 10).forEach(function (c) {
      html += '<div class="fqq"><p class="fqq-t"><code>' + esc(c.id) + '</code> &middot; ' + esc(c.what.join(', ')) + '</p>' +
        '<p class="fqq-q">On the website now</p><p>' + esc(c.was.question) + '</p>' + optList(c.was) +
        (String(c.was.explanation || '').trim() ? '<p class="fqq-x">' + esc(c.was.explanation) + '</p>' : '') +
        '<p class="fqq-q">In this file</p><p>' + esc(c.now.question) + '</p>' + optList(c.now) +
        (String(c.now.explanation || '').trim() ? '<p class="fqq-x">' + esc(c.now.explanation) + '</p>' : '') +
        '</div>';
    });
    if (state.changes.length > 10) {
      html += '<p class="small">and ' + (state.changes.length - 10) + ' more.</p>';
    }
    box.innerHTML = html;
    show(el('dqPreviewCard'));
    el('dqPreviewCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- 5. publish ---------- */

  function publish(auth) {
    var btn = el('dqButton');
    var errBox = el('dqError');
    hide(errBox);
    if (btn) { btn.disabled = true; btn.textContent = 'Publishing…'; }

    var cfg = window.AK_SUPABASE || {};
    var text = JSON.stringify(state.body, null, 2) + '\n';

    return auth.session().then(function (s) {
      var token = s && s.access_token;
      if (!token) throw new Error('Please log in again.');
      return fetch(cfg.url + '/functions/v1/publish-article', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'apikey': cfg.publishableKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish-daily', file: state.bank.file, text: text })
      });
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (d) { return { ok: res.ok, status: res.status, data: d }; });
    }).then(function (r) {
      if (btn) { btn.textContent = 'Publish this quiz'; btn.disabled = false; }
      if (!r.ok || !r.data.ok) {
        var msg = (r.data && r.data.error) || 'The quiz could not be published (' + r.status + ').';
        if (errBox) { errBox.textContent = msg; show(errBox); }
        done(false, msg);
        return;
      }
      done(true, '', r.data);
    }).catch(function (e) {
      if (btn) { btn.textContent = 'Publish this quiz'; btn.disabled = false; }
      var msg = (e && e.message) || 'The quiz could not be published.';
      if (errBox) { errBox.textContent = msg; show(errBox); }
      done(false, msg);
    });
  }

  function done(okay, errMsg, data) {
    var card = el('dqDone');
    var verdict = el('dqVerdict');
    var rep = el('dqDoneReport');
    show(card);

    if (!okay) {
      el('dqDoneTitle').textContent = 'Not published';
      verdict.className = 'upverdict is-no';
      verdict.textContent = 'The quiz was not published. Nothing on the website changed.';
      rep.innerHTML = row('no', esc(errMsg));
      hide(el('dqCheckBtn'));
      showCopy('Publishing a Daily quiz failed on /admin/upload-daily/.\n\nQuiz: ' +
        (state.bank ? state.bank.period + ' — ' + state.bank.level + ' (' + state.bank.file + ')' : '(none)') +
        '\nFile: ' + state.name + '\nMessage: ' + errMsg);
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    el('dqDoneTitle').textContent = 'Published';
    verdict.className = 'upverdict is-ok';
    verdict.textContent = 'Saved. These questions replaced the ones that were there.';
    var url = state.bank.hub || data.url || '/quizzes/daily/';
    rep.innerHTML = [
      row('ok', 'Saved: <code>assets/instant/' + esc(state.bank.file) + '</code>, rev ' + (data.rev || state.body.rev) + '.'),
      row('ok', 'The quiz: <a href="' + esc(url) + '">akexplained.com' + esc(url) + '</a>'),
      row('warn', 'The website is building now. The quiz usually has the new questions in about two to three minutes.')
    ].join('');
    hide(el('dqCopy'));
    var btn = el('dqCheckBtn');
    show(btn);
    btn.onclick = function () {
      var note = el('dqCheckNote');
      note.textContent = 'Looking…';
      fetchJson(levelFile(state.bank)).then(function (d) {
        if (d && Number(d.rev) >= Number(state.body.rev)) {
          note.innerHTML = 'It is live. <a href="' + esc(url) + '">Open the quiz</a>';
        } else {
          note.textContent = 'Not ready yet. Wait a little and press again.';
        }
      });
    };
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showCopy(text) {
    var box = el('dqCopy');
    var area = el('dqCopyText');
    if (!box || !area) return;
    area.value = text;
    show(box);
    el('dqCopyBtn').onclick = function () {
      area.select();
      var note = el('dqCopyNote');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(area.value).then(
          function () { if (note) note.textContent = 'Copied.'; },
          function () { if (note) note.textContent = 'Press Ctrl+C to copy.'; });
      } else if (note) { note.textContent = 'Press Ctrl+C to copy.'; }
    };
  }

  /* ---------- start ---------- */

  function start() {
    var notice = el('dqNotice');
    whenAuth().then(function (auth) {
      function no() { notice.textContent = 'You are not allowed to use this page.'; }
      if (!auth || !auth.configured || !auth.client) return no();
      auth.session().then(function (s) {
        if (!s || !s.user) return no();
        auth.client.from('paper_admins').select('user_id').maybeSingle().then(function (res) {
          if (res.error || !res.data) return no();
          hide(notice);
          show(el('dqBody'));
          fillBanks();
          el('dqBank').addEventListener('change', pickBank);
          el('dqFile').addEventListener('change', function (e) {
            if (!state.bank) return;
            readFile((e.target.files || [])[0]);
          });
          el('dqPreviewBtn').addEventListener('click', renderPreview);
          el('dqConfirm').addEventListener('change', updateGo);
          el('dqButton').addEventListener('click', function () { publish(auth); });
        }, no);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
