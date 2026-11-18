/* ==========================================================
   AK Explained — owner-only "upload a paper" page
   ----------------------------------------------------------
   /admin/upload-paper/ par chalti hai. Login wala paper (mock test
   ya login MCQ set) seedha public.mcq_papers me jaata hai: browser
   publishable key aur owner ke apne login se likhta hai. Koi secret
   key nahi, koi Edge Function nahi.

   Yahan ke saare check SIRF jaldi feedback ke liye hain. Asli
   darwaza database ka trigger hai (mcq_papers_check_body) — browser
   ka code bypass ho sakta hai, trigger nahi. Isliye yahan ka check
   fail hone par upload rok dete hain, aur trigger ka sandesh
   jaisa aata hai waisa dikha dete hain.

   Ye file auth.js se PEHLE chal sakti hai, isliye window.akAuth ka
   thoda intezaar — bilkul cbt.js aur review-form.js ki tarah.
   ========================================================== */
(function () {
  'use strict';

  var LEVELS = ['easy', 'medium', 'hard'];

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

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function el(id) { return document.getElementById(id); }
  function show(x) { if (x) x.hidden = false; }
  function hide(x) { if (x) x.hidden = true; }

  /* ---------- the fingerprint ----------
     One short code for everything a student would see: ids, questions, options, the right
     answer, the reason and the tags. Uploaded file and the row read back from the database
     must give the same code, which proves the database holds exactly what was sent. */
  function canonical(body) {
    var qs = (body && body.questions) || [];
    var lines = qs.map(function (q) {
      return [
        q.id,
        String(q.question).replace(/\s+/g, ' ').trim(),
        (q.options || []).map(function (o) { return String(o).replace(/\s+/g, ' ').trim(); }).join('\u001f'),
        String(q.correct_option_id),
        String(q.explanation == null ? '' : q.explanation).replace(/\s+/g, ' ').trim(),
        q.topicId || '',
        q.periodId || ''
      ].join('\u001e');
    });
    return [body.setId, body.level, String(body.rev), String(qs.length)].join('\u001e') + '\n' + lines.join('\n');
  }

  // sha256 jahan mile wahan; warna ek chhota apna hash (sirf milan dekhna hai).
  function fingerprint(text) {
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
        .then(function (buf) {
          return Array.prototype.map.call(new Uint8Array(buf), function (b) {
            return ('0' + b.toString(16)).slice(-2);
          }).join('').slice(0, 32);
        })
        .catch(function () { return Promise.resolve(simpleHash(text)); });
    }
    return Promise.resolve(simpleHash(text));
  }

  function simpleHash(text) {
    var a = 0x811c9dc5, b = 0x01000193, out = '';
    for (var i = 0; i < text.length; i++) {
      a = (a ^ text.charCodeAt(i)) >>> 0;
      a = (a * 16777619) >>> 0;
      b = (b + a + text.charCodeAt(i) * (i + 1)) >>> 0;
    }
    out = ('00000000' + a.toString(16)).slice(-8) + ('00000000' + b.toString(16)).slice(-8);
    return out + ('00000000' + (text.length >>> 0).toString(16)).slice(-8);
  }

  /* ---------- the quick checks ---------- */

  /* Some question makers hand over just the LIST of questions, with nothing around it. That is a
     real question file too: the set it belongs to is the owner's choice on this page anyway, and the
     level and the rev are asked for below. So a plain list is wrapped here and goes on as usual. */
  function unwrap(parsed) {
    if (Array.isArray(parsed)) return { questions: parsed, bare: true };
    return parsed;
  }

  function checkOneFile(name, body) {
    var problems = [];
    function bad(m) { problems.push(m); }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      bad('This is not a question file.');
      return problems;
    }
    /* A file may leave the level and the rev out; it may not get them wrong. */
    if (body.level != null && LEVELS.indexOf(body.level) < 0) bad('The level must be easy, medium or hard. This says "' + body.level + '".');
    if (body.rev != null && !(parseInt(body.rev, 10) >= 1)) bad('The rev must be a whole number, 1 or more.');
    if (!Array.isArray(body.questions) || !body.questions.length) {
      bad('It has no questions.');
      return problems;
    }

    var seenId = {}, seenQ = {};
    body.questions.forEach(function (q, i) {
      var at = 'Question ' + (i + 1) + ' (' + (q && q.id ? q.id : 'no id') + '): ';
      if (!q || typeof q !== 'object') { bad(at + 'is not a question.'); return; }
      if (!q.id) bad(at + 'has no id.');
      else if (seenId[q.id]) bad(at + 'this id is used twice in this file.');
      else seenId[q.id] = 1;

      var stem = String(q.question == null ? '' : q.question).trim();
      if (!stem) bad(at + 'has no question text.');
      else if (seenQ[stem]) bad(at + 'this question is in the file twice.');
      else seenQ[stem] = 1;

      if (!Array.isArray(q.options) || q.options.length !== 4) {
        bad(at + 'must have exactly 4 options.');
      } else {
        var opts = q.options.map(function (o) { return String(o == null ? '' : o).trim(); });
        if (opts.some(function (o) { return !o; })) bad(at + 'has an empty option.');
        var uniq = {}; opts.forEach(function (o) { uniq[o] = 1; });
        if (Object.keys(uniq).length !== 4) bad(at + 'has the same option twice.');
      }
      if (typeof q.correct_option_id !== 'number' || !/^[0-3]$/.test(String(q.correct_option_id))) {
        bad(at + 'must mark the right option as 0, 1, 2 or 3.');
      }
      if (!String(q.explanation == null ? '' : q.explanation).trim()) bad(at + 'has no explanation.');
      if (!q.topicId) bad(at + 'has no topic tag (topicId).');
    });

    return problems;
  }

  /* The id a destination + number (+ age) make. The file's own id is ignored, so a wrong id in
     the file cannot send the paper to the wrong place. A series may name the id of a paper that
     was loaded before the series became self-serve (UP PGT MCQ Days 11 and 12): that id wins, so
     uploading the same day again replaces it instead of making a second copy. */
  function slugFor(dest, number, age, paperId) {
    /* A previous-year paper has no number: its id is the paper the owner picked from the planned list. */
    if (dest && dest.needsPaper) return paperId || '';
    if (!dest || !(number >= 1)) return '';
    if (dest.needsAge) return age ? age + '-set-' + number : '';
    if (dest.ids && dest.ids[String(number)]) return dest.ids[String(number)];
    return dest.prefix + number;
  }

  /* ---------- the page ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    var notice = el('upNotice');
    var body = el('upBody');
    var filesInput = el('upFiles');
    if (!notice || !body || !filesInput) return;

    var fileError = el('upFileError');
    var report = el('upReport');
    var details = el('upDetails');
    var destSelect = el('upDest');
    var ageWrap = el('upAgeWrap');
    var ageSelect = el('upAge');
    var paperWrap = el('upPaperWrap');
    var paperSelect = el('upPaper');
    var numberWrap = el('upNumberWrap');
    var numberInput = el('upNumber');
    var slugPreview = el('upSlugPreview');
    var levelWrap = el('upLevelWrap');
    var levelSelect = el('upLevel');
    var titleInput = el('upTitle');
    var titleNote = el('upTitleNote');
    var statusSelect = el('upStatus');
    var goCard = el('upGo');
    var goError = el('upError');
    var summary = el('upSummary');
    var goButton = el('upButton');
    var doneCard = el('upDone');
    var doneReport = el('upDoneReport');
    var doneTitle = el('upDoneTitle');
    var verdictBox = el('upVerdict');
    var copyBox = el('upCopy');
    var copyText = el('upCopyText');
    var copyBtn = el('upCopyBtn');
    var copyNote = el('upCopyNote');
    /* Registry ka plan (har English Literature set ke liye): levels, count, aur page ki haalat. */
    var plan = {};
    try { plan = JSON.parse(el('upPlan').textContent).sets || {}; } catch (e) { plan = {}; }

    var client = null;      // Supabase client, once we know the person is an admin
    var papers = [];        // one per chosen file: { name, body }
    var titleTouched = false;

    function line(kind, text) { return '<li class="' + kind + '">' + esc(text) + '</li>'; }
    function paint(items) { report.innerHTML = items.join(''); }
    function fail(box, text) { if (box) { box.textContent = text; show(box); } }
    function clearFail(box) { if (box) { box.textContent = ''; hide(box); } }

    function parseIds(raw) {
      if (!raw) return {};
      try { var v = JSON.parse(raw); return (v && typeof v === 'object') ? v : {}; } catch (e) { return {}; }
    }

    // The destination the owner picked, as a plain object read from the <option>.
    function currentDest() {
      var o = destSelect.options[destSelect.selectedIndex];
      if (!o || !o.value) return null;
      return {
        id: o.value,
        examId: o.getAttribute('data-exam') || '',
        kind: o.getAttribute('data-kind') || 'mcq-set',
        prefix: o.getAttribute('data-prefix') || '',
        needsAge: o.getAttribute('data-needs-age') === 'yes',
        needsPaper: o.getAttribute('data-needs-paper') === 'yes',
        titleWord: o.getAttribute('data-title-word') || 'Set',
        autoPage: o.getAttribute('data-auto') === 'yes',
        /* Self-serve series (rule 17): Live karte hi page par aa jata hai, bina rebuild.
           min/max = jin numbers ke page pehle se bane hain; bahar ka number kabhi khul nahi sakta. */
        selfServe: o.getAttribute('data-self-serve') === 'yes',
        min: parseInt(o.getAttribute('data-min'), 10) || 0,
        max: parseInt(o.getAttribute('data-max'), 10) || 0,
        numberNote: o.getAttribute('data-number-note') || '',
        pageBase: o.getAttribute('data-page-base') || '',
        /* How the page address is built, e.g. test-{n}/ or day-{n}/ */
        pageRoute: o.getAttribute('data-page-route') || 'test-{n}/',
        /* The levels the series' pages can read. A file saved at any other level is saved
           safely but the page would never show it, so the final check says so. */
        pageLevels: (o.getAttribute('data-page-levels') || '').split(',').filter(Boolean),
        /* Only the English Literature sets are planned set by set in the registry. */
        registryPlan: o.getAttribute('data-registry-plan') === 'yes',
        ids: parseIds(o.getAttribute('data-ids')),
        titleNote: o.getAttribute('data-title-note') || '',
        label: (o.textContent || '').trim()
      };
    }
    // Is this number one the series has a page for? (No limits on a destination = any number.)
    function numberFits(dest, number) {
      if (!dest || !number) return true;
      if (dest.min && number < dest.min) return false;
      if (dest.max && number > dest.max) return false;
      return true;
    }
    /* The planned paper picked in the "Which paper?" list (only for a destination that needs one). */
    function chosenPaper() {
      var o = paperSelect && paperSelect.options[paperSelect.selectedIndex];
      if (!o || !o.value) return null;
      return { id: o.value, title: o.getAttribute('data-title') || '', path: o.getAttribute('data-path') || '' };
    }
    function currentNumber() {
      var n = parseInt(numberInput.value, 10);
      return (n >= 1 && String(n) === String(numberInput.value).trim()) ? n : 0;
    }

    /* A file that does not name its level takes the one chosen on the page (Medium by default,
       which is what every CBT page of a mock series reads). */
    function needsLevel() {
      return papers.some(function (p) { return !p.body.level; });
    }
    function chosenLevel() {
      return (levelSelect && LEVELS.indexOf(levelSelect.value) > -1) ? levelSelect.value : 'medium';
    }

    // Live preview: show the id that will be used, and fill the title unless the owner typed one.
    function refreshPreview() {
      var dest = currentDest();
      if (needsLevel()) { show(levelWrap); } else { hide(levelWrap); }
      var number = currentNumber();
      var age = ageSelect.value;
      var picked = chosenPaper();
      if (dest && dest.needsAge) { show(ageWrap); } else { hide(ageWrap); }
      if (dest && dest.needsPaper) { show(paperWrap); hide(numberWrap); } else { hide(paperWrap); show(numberWrap); }

      var slug = slugFor(dest, number, age, picked && picked.id);
      if (!dest) {
        slugPreview.textContent = '';
      } else if (dest.needsPaper && !picked) {
        slugPreview.textContent = 'Now choose the paper.';
      } else if (!dest.needsPaper && !number) {
        slugPreview.textContent = 'Now type the number.';
      } else if (dest.needsAge && !age) {
        slugPreview.textContent = 'Now choose the age.';
      } else if (!dest.needsPaper && !numberFits(dest, number)) {
        slugPreview.textContent = 'This number cannot be used here. ' + dest.numberNote;
      } else {
        slugPreview.innerHTML = 'It will be saved as <strong>' + esc(slug) + '</strong>' +
          (needsLevel() ? ' at the ' + esc(cap(chosenLevel())) + ' level' : '') +
          (dest.selfServe ? ' — once it is Live it shows on its page at once. No rebuild is needed.'
            : dest.autoPage ? ' — it will show on its page after the site is next built.'
                         : ' — the questions go into the database. When you upload, this page checks that the set has a page on the site.');
      }

      if (dest && dest.needsPaper) {
        if (picked && !titleTouched) titleInput.value = picked.title;
      } else if (dest && number && !titleTouched) {
        titleInput.value = dest.titleWord + ' ' + number;
      }
      if (titleNote) titleNote.textContent = dest ? dest.titleNote : '';
    }

    destSelect && destSelect.addEventListener('change', function () { refreshPreview(); });
    ageSelect && ageSelect.addEventListener('change', function () { refreshPreview(); });
    paperSelect && paperSelect.addEventListener('change', function () { refreshPreview(); });
    numberInput && numberInput.addEventListener('input', function () { refreshPreview(); });
    levelSelect && levelSelect.addEventListener('change', function () { refreshPreview(); });
    titleInput && titleInput.addEventListener('input', function () { titleTouched = true; });

    /* --- who is this? --- */
    whenAuth().then(function (auth) {
      if (!auth || !auth.configured || !auth.client) { notice.textContent = 'You are not allowed to use this page.'; return; }
      return auth.session().then(function (s) {
        if (!s || !s.user) { notice.textContent = 'You are not allowed to use this page.'; return; }
        return auth.client.from('paper_admins').select('user_id').maybeSingle()
          .then(function (res) {
            if (res.error || !res.data) { notice.textContent = 'You are not allowed to use this page.'; return; }
            client = auth.client;
            notice.textContent = 'Signed in as the owner. Choose a question file to begin.';
            show(body);
          });
      });
    }).catch(function () { notice.textContent = 'You are not allowed to use this page.'; });

    /* --- a file was chosen --- */
    filesInput.addEventListener('change', function () {
      clearFail(fileError); clearFail(goError);
      hide(details); hide(goCard); hide(doneCard);
      paint([]);
      papers = []; titleTouched = false;

      var chosen = Array.prototype.slice.call(filesInput.files || []);
      if (!chosen.length) return;
      if (chosen.length > 3) { fail(fileError, 'Choose at most three files — one for each level.'); return; }

      paint([line('info', 'Reading ' + chosen.length + ' file(s)…')]);

      Promise.all(chosen.map(function (f) {
        return f.text().then(function (text) {
          var parsed = null, err = '';
          try { parsed = unwrap(JSON.parse(text)); } catch (e) { err = e.message || 'it is not readable JSON'; }
          return { name: f.name, body: parsed, err: err };
        });
      })).then(function (read) {
        var items = [], problems = [];

        read.forEach(function (r) {
          if (r.err) {
            problems.push(r.name + ': ' + r.err);
            items.push(line('no', r.name + ' — this file is not readable JSON.'));
            return;
          }
          var probs = checkOneFile(r.name, r.body);
          if (probs.length) {
            probs.slice(0, 12).forEach(function (p) { items.push(line('no', r.name + ' — ' + p)); });
            if (probs.length > 12) items.push(line('no', r.name + ' — and ' + (probs.length - 12) + ' more problem(s).'));
            problems = problems.concat(probs);
          } else {
            var told = (r.body.level ? r.body.level + ' level' : '') +
              (r.body.level && r.body.rev ? ', ' : '') + (r.body.rev ? 'rev ' + r.body.rev : '');
            items.push(line('ok', r.name + ' — ' + r.body.questions.length + ' questions' + (told ? ', ' + told : '') + '.'));
            if (!r.body.level) items.push(line('info', r.name + ' — it does not say which level it is. Choose the level below.'));
            if (!r.body.rev) items.push(line('info', r.name + ' — it does not say which rev it is. This page will use the next free rev.'));
            papers.push({ name: r.name, body: r.body });
          }
        });

        if (problems.length || !papers.length) {
          paint(items);
          fail(fileError, 'This file cannot be uploaded yet. Fix what is marked above, or ask for a corrected file.');
          return;
        }

        // The files must be one set (same inner id), each level once, same rev. The inner id is a
        // sanity check that they belong together; it does NOT decide where the paper goes.
        /* A file with no level of its own takes the level chosen below, and there is only one such
           choice — so only one such file can be uploaded at a time. */
        var noLevel = papers.filter(function (p) { return !p.body.level; });
        if (noLevel.length && papers.length > 1) {
          paint(items);
          fail(fileError, 'One of these files does not say which level it is (' + noLevel[0].name +
            '). Upload that one on its own and choose its level, or ask for files that name their level.');
          return;
        }
        var sets = {}, levels = {};
        papers.forEach(function (p) { if (p.body.setId) sets[p.body.setId] = 1; if (p.body.level) levels[p.body.level] = (levels[p.body.level] || 0) + 1; });
        if (Object.keys(sets).length > 1) {
          paint(items);
          fail(fileError, 'These files look like different sets (' + Object.keys(sets).join(', ') + '). Upload the levels of one set at a time.');
          return;
        }
        var twice = Object.keys(levels).filter(function (l) { return levels[l] > 1; });
        if (twice.length) { paint(items); fail(fileError, 'Two files say they are the same level (' + twice.join(', ') + ').'); return; }
        var revs = {};
        papers.forEach(function (p) { if (p.body.rev) revs[String(p.body.rev)] = 1; });
        if (Object.keys(revs).length > 1) { paint(items); fail(fileError, 'The files are at different revs (' + Object.keys(revs).join(', ') + '). All levels of one set must share a rev.'); return; }

        items.push(line('info', papers.length + ' level(s) · ' +
          papers.reduce(function (n, p) { return n + p.body.questions.length; }, 0) + ' questions in all' +
          (papers[0].body.rev ? ' · rev ' + papers[0].body.rev : '') + '.'));
        paint(items);

        // Check the tags against the live topic list (this does not need to know where it goes).
        var tags = {};
        papers.forEach(function (p) {
          p.body.questions.forEach(function (q) {
            if (q.topicId) tags['t:' + q.topicId] = q.topicId;
            if (q.periodId) tags['p:' + q.periodId] = q.periodId;
          });
        });
        var topicIds = [], periodIds = [];
        Object.keys(tags).forEach(function (k) { if (k.charAt(0) === 't') topicIds.push(tags[k]); else periodIds.push(tags[k]); });
        var all = topicIds.concat(periodIds).filter(function (v, i, a) { return a.indexOf(v) === i; });

        client.from('topics').select('id, kind').in('id', all).then(function (res) {
          var known = {};
          if (!res.error && res.data) res.data.forEach(function (r) { known[r.id] = r.kind; });
          var missingTopics = topicIds.filter(function (id) { return !known[id]; });
          var notPeriods = periodIds.filter(function (id) { return known[id] !== 'period'; });

          if (res.error) {
            items.push(line('info', 'Could not check the tags against the topic list: ' + res.error.message));
          } else if (missingTopics.length) {
            items.push(line('no', 'These topic tags are not in the topic list: ' + missingTopics.slice(0, 8).join(', ') + (missingTopics.length > 8 ? '…' : '')));
          } else if (notPeriods.length) {
            items.push(line('no', 'These period tags are not a period: ' + notPeriods.slice(0, 8).join(', ') + (notPeriods.length > 8 ? '…' : '')));
          } else {
            items.push(line('ok', 'All ' + all.length + ' tags are real nodes of the topic list.'));
          }
          paint(items);

          if (missingTopics.length || notPeriods.length) {
            fail(fileError, 'This file cannot be uploaded yet. Fix what is marked above, or ask for a corrected file.');
            return;
          }
          show(details);
          show(goCard);
          refreshPreview();
        }).catch(function (e) {
          paint(items);
          fail(fileError, 'Could not reach the database: ' + (e && e.message ? e.message : 'unknown error'));
        });
      }).catch(function (e) {
        fail(fileError, 'Could not read the file: ' + (e && e.message ? e.message : 'unknown error'));
      });
    });

    /* --- the final check (owner, 2026-11-15) ---
       Upload ke baad page khud dekhta hai ki paper sach me page par khulega ya nahi, aur jo kami hai
       saaf shabdon me likhta hai. Agar kuch theek karna ho to ek "Copy for Claude" text deta hai. */
    function pageUrlFor(dest, setId, number) {
      if (dest && dest.needsPaper && dest.paperPath) return dest.paperPath;
      if (plan[setId] && plan[setId].path) return plan[setId].path;
      if (dest && dest.pageBase && number) return dest.pageBase + (dest.pageRoute || 'test-{n}/').replace('{n}', number);
      return '';
    }
    function getPage(url) {
      return fetch(url, { cache: 'no-store' }).then(
        function (r) { return { ok: r.ok, status: r.status }; },
        function () { return { ok: null, status: 0 }; }
      );
    }
    function cap(w) { return w ? w.charAt(0).toUpperCase() + w.slice(1) : w; }

    function finalChecks(ctx) {
      var items = [];
      var dest = ctx.dest, setId = ctx.setId, saved = ctx.saved || [];
      var p = plan[setId] || null;
      var isLit = !!dest.registryPlan;
      var url = pageUrlFor(dest, setId, ctx.number);

      return Promise.all([
        client.from('paper_catalog').select('set_id, status, question_count, title').eq('set_id', setId).maybeSingle()
          .then(function (r) { return r; }, function (e) { return { error: e }; }),
        url ? getPage(url) : Promise.resolve(null),
        url ? getPage(url + 'review/') : Promise.resolve(null)
      ]).then(function (got) {
        var cat = got[0], test = got[1], rev = got[2];

        // 1. Is it in the public paper list?
        if (cat.error) {
          items.push({ k: 'warn', t: 'Could not read the paper list to check it: ' + (cat.error.message || 'unknown error') + '.' });
        } else if (!cat.data) {
          items.push({ k: 'no', t: 'It is not in the public paper list. The database should add it by itself, so this needs Claude.' });
        } else if (cat.data.status === 'live') {
          items.push({ k: 'ok', t: 'It is in the public paper list as Live (' + cat.data.question_count + ' questions).' });
        } else {
          items.push({ k: 'info', t: 'It is in the paper list as Draft, so students do not see it.' });
        }

        // 2. Levels and count against the registry plan (English Literature sets).
        if (isLit) {
          if (!p) {
            items.push({ k: 'no', t: 'No page is planned for this set yet (' + setId + '). The questions are saved safely, but nobody can open this set until Claude adds the set to the registry. Send Claude the text below.' });
          } else {
            var have = saved.map(function (r) { return r.level; });
            var missing = p.levels.filter(function (l) { return have.indexOf(l) < 0; });
            var extra = have.filter(function (l) { return p.levels.indexOf(l) < 0; });
            if (!missing.length && !extra.length) {
              items.push({ k: 'ok', t: 'Levels match the plan: ' + p.levels.map(cap).join(' and ') + '.' });
            }
            if (missing.length) {
              items.push({ k: 'warn', t: 'The plan for this set has ' + p.levels.map(cap).join(' and ') + ', but ' + missing.map(cap).join(' and ') + (missing.length > 1 ? ' are' : ' is') + ' not uploaded yet. A student who picks ' + missing.map(cap).join(' or ') + ' will see "This set is not open to you yet." Upload the missing file (same age, same set number), or ask Claude to take that level out of the plan.' });
            }
            if (extra.length) {
              items.push({ k: 'warn', t: 'You uploaded ' + extra.map(cap).join(' and ') + ', which is not in the plan for this set. The page will not offer it until Claude adds it to the plan.' });
            }
            var badCount = saved.filter(function (r) {
              var n = (r.body && r.body.questions) ? r.body.questions.length : 0;
              return p.count && n !== p.count;
            });
            if (badCount.length) {
              items.push({ k: 'warn', t: 'The plan says ' + p.count + ' questions at each level, but ' + badCount.map(function (r) { return cap(r.level) + ' has ' + r.body.questions.length; }).join(' and ') + '. The page text may be wrong until Claude updates the plan.' });
            }
            var revSet = {};
            saved.forEach(function (r) { revSet[r.rev] = 1; });
            if (Object.keys(revSet).length > 1) {
              items.push({ k: 'warn', t: 'The levels of this set are saved at different revs (' + saved.map(function (r) { return r.level + ' rev ' + r.rev; }).join(', ') + '). It is tidier when they match. Tell Claude if this was not on purpose.' });
            }
            if (p.state === 'free') {
              items.push({ k: 'warn', t: 'Set ' + p.n + ' of this age is already open to everyone as a free set. This login copy will not replace it on the page. Check the set number.' });
            }
            if (p.state === 'login' && p.rev && saved.length && saved[0].rev !== p.rev) {
              items.push({ k: 'warn', t: 'The registry says rev ' + p.rev + ' for this set, but you saved rev ' + saved[0].rev + '. Tell Claude so the two match.' });
            }
          }
        }

        // 2b. Can the page read the levels that were saved? (Its page asks for one level only.)
        if (dest.pageLevels && dest.pageLevels.length) {
          var unread = saved.map(function (r) { return r.level; })
            .filter(function (l) { return dest.pageLevels.indexOf(l) < 0; });
          if (unread.length) {
            items.push({ k: 'no', t: 'The page for this paper only opens the ' + dest.pageLevels.map(cap).join(' and ') +
              ' level, but you saved ' + unread.map(cap).join(' and ') + '. Students would see nothing. Ask for the file at the ' +
              dest.pageLevels.map(cap).join(' or ') + ' level, or send Claude the text below.' });
          }
        }

        // 3. Does the page itself exist on the site?
        if (url && (!isLit || p)) {
          if (test && test.ok === true && rev && rev.ok === true) {
            items.push({ k: 'ok', t: 'Its test page and review page are on the site (' + url + ').' });
          } else if (test && test.ok === null) {
            items.push({ k: 'warn', t: 'Could not check whether the page ' + url + ' is on the site (no network answer). Open it yourself to be sure.' });
          } else {
            var which = (test && test.ok === false ? 'test page' : '') + (test && test.ok === false && rev && rev.ok === false ? ' and ' : '') + (rev && rev.ok === false ? 'review page' : '');
            items.push({ k: 'no', t: 'The ' + (which || 'page') + ' for this paper (' + url + ') is not on the site yet. If a new site build was only just started, wait a few minutes and check again by opening the link. If it is still missing, send Claude the text below.' });
          }
        }
        return items;
      });
    }

    function verdictFor(items, status) {
      var no = items.filter(function (i) { return i.k === 'no'; }).length;
      var warn = items.filter(function (i) { return i.k === 'warn'; }).length;
      if (no) return { k: 'no', t: 'Saved, but students cannot open it yet. See what is marked below.' };
      if (status === 'draft') {
        return warn
          ? { k: 'warn', t: 'Saved as a Draft. Check the points below before you make it Live.' }
          : { k: 'ok', t: 'Saved as a Draft. Students cannot see it yet. Make it Live on the All papers page when you are ready.' };
      }
      if (warn) return { k: 'warn', t: 'It is Live, but check the points below.' };
      return { k: 'ok', t: 'It is Live. Logged-in students can open it now. No rebuild is needed.' };
    }

    function claudeText(ctx, verdict, items) {
      var tag = { ok: 'OK', warn: 'WARNING', no: 'PROBLEM', info: 'NOTE' };
      var out = [];
      out.push('Upload check from /admin/upload-paper/ (' + new Date().toISOString().slice(0, 10) + ')');
      out.push('Paper: ' + ctx.setId + ' (' + (ctx.title || '') + ')');
      out.push('Where: ' + (ctx.dest.label || ctx.dest.id));
      out.push('Status chosen: ' + ctx.status);
      if (ctx.saved && ctx.saved.length) {
        out.push('Saved in the database: ' + ctx.saved.map(function (r) {
          return r.level + ' (' + ((r.body && r.body.questions) ? r.body.questions.length : '?') + ' questions, rev ' + r.rev + ', ' + r.status + ')';
        }).join('; '));
      }
      out.push('Result: ' + verdict.t);
      out.push('');
      items.forEach(function (i) { out.push('[' + (tag[i.k] || i.k) + '] ' + i.t); });
      out.push('');
      out.push('Please look into the warnings and problems above, find the cause and fix it. Do not add any questions of your own.');
      return out.join('\n');
    }

    function showOutcome(ctx, verdict, items, heading) {
      doneTitle.textContent = heading || 'Done';
      verdictBox.className = 'upverdict is-' + verdict.k;
      verdictBox.textContent = verdict.t;
      doneReport.innerHTML = items.map(function (i) { return line(i.k, i.t); }).join('');
      var needsHelp = items.some(function (i) { return i.k === 'no' || i.k === 'warn'; }) || verdict.k === 'no';
      if (needsHelp) {
        copyText.value = claudeText(ctx, verdict, items);
        copyNote.textContent = '';
        show(copyBox);
      } else {
        hide(copyBox);
      }
      show(doneCard);
      doneCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    copyBtn && copyBtn.addEventListener('click', function () {
      var text = copyText.value;
      function done(ok) { copyNote.textContent = ok ? ' Copied. Now paste it to Claude.' : ' Could not copy by itself: select the text above and copy it.'; }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, function () { copyText.select(); done(false); });
          return;
        }
      } catch (e) {}
      try { copyText.select(); done(document.execCommand('copy')); } catch (e) { done(false); }
    });

    /* --- upload --- */
    goButton && goButton.addEventListener('click', function () {
      clearFail(goError);
      if (!client || !papers.length) return;

      var dest = currentDest();
      var number = currentNumber();
      var age = ageSelect.value;
      var picked = chosenPaper();
      var title = String(titleInput.value || '').trim();
      var status = statusSelect.value === 'live' ? 'live' : 'draft';

      if (!dest) { fail(goError, 'Choose where this paper goes (the exam / series).'); return; }
      if (dest.needsAge && !age) { fail(goError, 'Choose the age for this MCQ set.'); return; }
      if (dest.needsPaper) {
        if (!picked) { fail(goError, 'Choose which paper this is.'); return; }
        dest.paperPath = picked.path;
        number = 0;       /* a previous-year paper has no number */
      } else {
        if (!number) { fail(goError, 'Type the test or set number (a whole number, 1 or more).'); return; }
        if (!numberFits(dest, number)) { fail(goError, 'This number cannot be used here. ' + dest.numberNote); return; }
      }
      if (!title) { fail(goError, 'Give the paper a title.'); return; }

      var setId = slugFor(dest, number, age, picked && picked.id);
      /* A file may name its own level and rev. When it does not, the level is the one chosen above
         and the rev is worked out below, once we know what is already saved under this id. */
      var fileRev = parseInt(papers[0].body.rev, 10);
      var levelOf = function (p) { return p.body.level || chosenLevel(); };

      goButton.disabled = true;
      goButton.textContent = 'Checking…';

      // Is this id already taken? If so, the file's rev must be higher to replace it.
      // Only the SAME level counts: a new level (for example medium, when easy is already saved) may
      // use the same rev. The database rule is the same: it only refuses a rev that goes down.
      client.from('mcq_papers').select('set_id, level, rev, status').eq('set_id', setId).then(function (res) {
        var chosenLevels = papers.map(levelOf);
        var existing = (!res.error && res.data) ? res.data : [];
        var same = existing.filter(function (r) { return chosenLevels.indexOf(r.level) > -1; });
        var highest = same.reduce(function (n, r) { return Math.max(n, r.rev); }, 0);
        var newRev = (fileRev >= 1) ? fileRev : highest + 1;
        if (fileRev >= 1 && same.length && !(newRev > highest)) {
          var lv = same.map(function (r) { return r.level; }).join(' and ');
          goButton.disabled = false; goButton.textContent = 'Upload this paper';
          fail(goError, setId + ' (' + lv + ') already exists at rev ' + highest + '. To replace it, raise the file\'s rev above ' + highest + '. This file is rev ' + newRev + '.');
          return;
        }

        // Build each level's row, with the id, the level, the rev and the catalog fields set from the
        // owner's choice, not from the file. Question ids inside are left exactly as supplied (frozen).
        var rows = papers.map(function (p) {
          var out = {};
          Object.keys(p.body).forEach(function (k) { out[k] = p.body[k]; });
          delete out.bare;
          out.setId = setId;
          if (number) { out.setNumber = number; } else { delete out.setNumber; }
          out.title = title;
          out.kind = dest.kind;
          out.level = levelOf(p);
          out.rev = newRev;
          if (dest.examId) { out.examId = dest.examId; } else { delete out.examId; }
          return { set_id: setId, level: out.level, access: 'login', rev: newRev, status: status, body: out };
        });

        goButton.textContent = 'Uploading…';
        client.from('mcq_papers').upsert(rows, { onConflict: 'set_id,level' })
          .then(function (res2) {
            if (res2.error) throw new Error(res2.error.message || 'the database refused it');
            return client.from('mcq_papers').select('set_id, level, rev, status, body').eq('set_id', setId);
          })
          .then(function (res3) {
            if (res3.error) throw new Error(res3.error.message || 'could not read it back');
            var saved = res3.data || [];
            var jobs = rows.map(function (r) {
              var back = saved.filter(function (s) { return s.level === r.level; })[0];
              return Promise.all([
                fingerprint(canonical(r.body)),
                back ? fingerprint(canonical(back.body)) : Promise.resolve('')
              ]).then(function (f) {
                return { level: r.level, sent: f[0], got: f[1], count: (r.body.questions || []).length, back: back };
              });
            });
            return Promise.all(jobs).then(function (results) { return { results: results, saved: saved }; });
          })
          .then(function (out) {
            var results = out.results;
            var ctx = { dest: dest, setId: setId, number: number, title: title, status: status, saved: out.saved };
            var items = [], allMatch = true;
            results.forEach(function (r) {
              if (r.back && r.sent === r.got) {
                items.push({ k: 'ok', t: r.level + ': ' + r.count + ' questions saved, rev ' + r.back.rev + ', ' + r.back.status + '. Code ' + r.sent + '.' });
              } else {
                allMatch = false;
                items.push({ k: 'no', t: r.level + ': what the database holds does not match the file. Upload it again.' });
              }
            });
            goButton.textContent = 'Checking the site…';
            var next = allMatch
              ? finalChecks(ctx).then(function (more) { return items.concat([{ k: 'info', t: 'Saved as ' + setId + '.' }], more); })
              : Promise.resolve(items);
            return next.then(function (all) {
              var verdict = allMatch ? verdictFor(all, status)
                : { k: 'no', t: 'It was not saved correctly. Upload it again.' };
              showOutcome(ctx, verdict, all);
              goButton.textContent = 'Upload this paper';
              goButton.disabled = false;
            });
          })
          .catch(function (e) {
            var msg = 'It was not uploaded. The database said: ' + (e && e.message ? e.message : 'unknown error');
            fail(goError, msg);
            try {
              showOutcome({ dest: dest, setId: setId, number: number, title: title, status: status, saved: [] },
                { k: 'no', t: 'It was not uploaded.' }, [{ k: 'no', t: msg }], 'Not uploaded');
            } catch (e2) {}
            goButton.textContent = 'Upload this paper';
            goButton.disabled = false;
          });
      }).catch(function (e) {
        goButton.disabled = false; goButton.textContent = 'Upload this paper';
        fail(goError, 'Could not reach the database: ' + (e && e.message ? e.message : 'unknown error'));
      });
    });
  });
})();
