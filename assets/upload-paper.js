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

  function checkOneFile(name, body) {
    var problems = [];
    function bad(m) { problems.push(m); }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      bad('This is not a question file.');
      return problems;
    }
    if (!body.setId) bad('It does not say which set it is (setId).');
    if (LEVELS.indexOf(body.level) < 0) bad('The level must be easy, medium or hard. This says "' + body.level + '".');
    if (!(parseInt(body.rev, 10) >= 1)) bad('The rev must be a whole number, 1 or more.');
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
     the file cannot send the paper to the wrong place. */
  function slugFor(dest, number, age) {
    if (!dest || !(number >= 1)) return '';
    if (dest.needsAge) return age ? age + '-set-' + number : '';
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
    var numberInput = el('upNumber');
    var slugPreview = el('upSlugPreview');
    var titleInput = el('upTitle');
    var statusSelect = el('upStatus');
    var goCard = el('upGo');
    var goError = el('upError');
    var summary = el('upSummary');
    var goButton = el('upButton');
    var doneCard = el('upDone');
    var doneReport = el('upDoneReport');

    var client = null;      // Supabase client, once we know the person is an admin
    var papers = [];        // one per chosen file: { name, body }
    var titleTouched = false;

    function line(kind, text) { return '<li class="' + kind + '">' + esc(text) + '</li>'; }
    function paint(items) { report.innerHTML = items.join(''); }
    function fail(box, text) { if (box) { box.textContent = text; show(box); } }
    function clearFail(box) { if (box) { box.textContent = ''; hide(box); } }

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
        titleWord: o.getAttribute('data-title-word') || 'Set',
        autoPage: o.getAttribute('data-auto') === 'yes'
      };
    }
    function currentNumber() {
      var n = parseInt(numberInput.value, 10);
      return (n >= 1 && String(n) === String(numberInput.value).trim()) ? n : 0;
    }

    // Live preview: show the id that will be used, and fill the title unless the owner typed one.
    function refreshPreview() {
      var dest = currentDest();
      var number = currentNumber();
      var age = ageSelect.value;
      if (dest && dest.needsAge) { show(ageWrap); } else { hide(ageWrap); }

      var slug = slugFor(dest, number, age);
      if (!dest) {
        slugPreview.textContent = '';
      } else if (!number) {
        slugPreview.textContent = 'Now type the number.';
      } else if (dest.needsAge && !age) {
        slugPreview.textContent = 'Now choose the age.';
      } else {
        slugPreview.innerHTML = 'It will be saved as <strong>' + esc(slug) + '</strong>' +
          (dest.autoPage ? ' — it will show on its page after the site is next built.'
                         : ' — the questions go live in the database; its page is wired separately.');
      }

      if (dest && number && !titleTouched) {
        titleInput.value = dest.titleWord + ' ' + number;
      }
    }

    destSelect && destSelect.addEventListener('change', function () { refreshPreview(); });
    ageSelect && ageSelect.addEventListener('change', function () { refreshPreview(); });
    numberInput && numberInput.addEventListener('input', function () { refreshPreview(); });
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
          try { parsed = JSON.parse(text); } catch (e) { err = e.message || 'it is not readable JSON'; }
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
            items.push(line('ok', r.name + ' — ' + r.body.questions.length + ' questions, ' + r.body.level + ' level, rev ' + r.body.rev + '.'));
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
        var sets = {}, levels = {};
        papers.forEach(function (p) { sets[p.body.setId] = 1; levels[p.body.level] = (levels[p.body.level] || 0) + 1; });
        if (Object.keys(sets).length > 1) {
          paint(items);
          fail(fileError, 'These files look like different sets (' + Object.keys(sets).join(', ') + '). Upload the levels of one set at a time.');
          return;
        }
        var twice = Object.keys(levels).filter(function (l) { return levels[l] > 1; });
        if (twice.length) { paint(items); fail(fileError, 'Two files say they are the same level (' + twice.join(', ') + ').'); return; }
        var revs = {};
        papers.forEach(function (p) { revs[String(p.body.rev)] = 1; });
        if (Object.keys(revs).length > 1) { paint(items); fail(fileError, 'The files are at different revs (' + Object.keys(revs).join(', ') + '). All levels of one set must share a rev.'); return; }

        items.push(line('info', papers.length + ' level(s) · ' +
          papers.reduce(function (n, p) { return n + p.body.questions.length; }, 0) + ' questions in all · rev ' + papers[0].body.rev + '.'));
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

    /* --- upload --- */
    goButton && goButton.addEventListener('click', function () {
      clearFail(goError);
      if (!client || !papers.length) return;

      var dest = currentDest();
      var number = currentNumber();
      var age = ageSelect.value;
      var title = String(titleInput.value || '').trim();
      var status = statusSelect.value === 'live' ? 'live' : 'draft';

      if (!dest) { fail(goError, 'Choose where this paper goes (the exam / series).'); return; }
      if (dest.needsAge && !age) { fail(goError, 'Choose the age for this MCQ set.'); return; }
      if (!number) { fail(goError, 'Type the test or set number (a whole number, 1 or more).'); return; }
      if (!title) { fail(goError, 'Give the paper a title.'); return; }

      var setId = slugFor(dest, number, age);
      var newRev = parseInt(papers[0].body.rev, 10);

      // Build each level's row, with the id and the catalog fields set from the owner's choice,
      // not from the file. Question ids inside are left exactly as supplied (they are frozen).
      var rows = papers.map(function (p) {
        var out = {};
        Object.keys(p.body).forEach(function (k) { out[k] = p.body[k]; });
        out.setId = setId;
        out.setNumber = number;
        out.title = title;
        out.kind = dest.kind;
        if (dest.examId) { out.examId = dest.examId; } else { delete out.examId; }
        return { set_id: setId, level: p.body.level, access: 'login', rev: newRev, status: status, body: out };
      });

      goButton.disabled = true;
      goButton.textContent = 'Checking…';

      // Is this id already taken? If so, the file's rev must be higher to replace it.
      client.from('mcq_papers').select('set_id, level, rev, status').eq('set_id', setId).then(function (res) {
        var existing = (!res.error && res.data) ? res.data : [];
        var highest = existing.reduce(function (n, r) { return Math.max(n, r.rev); }, 0);
        if (existing.length && !(newRev > highest)) {
          goButton.disabled = false; goButton.textContent = 'Upload this paper';
          fail(goError, setId + ' already exists at rev ' + highest + '. To replace it, raise the file\'s rev above ' + highest + '. This file is rev ' + newRev + '.');
          return;
        }

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
            return Promise.all(jobs);
          })
          .then(function (results) {
            var items = [], allMatch = true;
            results.forEach(function (r) {
              if (r.back && r.sent === r.got) {
                items.push(line('ok', r.level + ': ' + r.count + ' questions saved, rev ' + r.back.rev + ', ' + r.back.status + '. Code ' + r.sent + '.'));
              } else {
                allMatch = false;
                items.push(line('no', r.level + ': what the database holds does not match the file. Upload it again.'));
              }
            });
            if (allMatch) {
              items.push(line('info', 'Saved as ' + setId + '.'));
              if (status === 'draft') {
                items.push(line('info', 'It is a Draft, so students cannot see it yet. Upload it again as Live when its page is ready, or make it live from the All papers page.'));
              } else if (dest.autoPage) {
                items.push(line('info', 'It is Live. It will show on its page after the site is next built — tell Claude to publish it, or it appears on the next build.'));
              } else {
                items.push(line('info', 'It is Live in the database. Its page still needs wiring — tell Claude to put it on the site.'));
              }
            }
            doneReport.innerHTML = items.join('');
            show(doneCard);
            goButton.textContent = 'Upload this paper';
            goButton.disabled = false;
            doneCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          })
          .catch(function (e) {
            fail(goError, 'It was not uploaded. The database said: ' + (e && e.message ? e.message : 'unknown error'));
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
