/* =========================================================
   INSTANT QUIZ  —  /quizzes/daily/<period>/
   assets/instant.js

   Reader picks a level and a number of questions, then taps an answer:
   it turns green or red at once and the reason shows underneath.
   Different from the exam-style engine (cbt.js), which gives no answer
   until Submit.

   The page tells this file what to run:
     <div data-iq data-bank="anglo-saxon"
          data-src="/assets/instant/anglo-saxon-{level}.json"
          data-back="/quizzes/daily/">

   Question file:
     { bankId, period, level, rev, questions:[
         { id, question, options:[..], correct_option_id, explanation? } ] }
   "explanation" is optional: without it the reader sees right or wrong and the
   right answer, and no reason.
   Change a question's meaning -> raise "rev". Old records for that level
   are then dropped, so they never stick to a different question.

   Defaults (reader chooses nothing): Easy, 10 questions. Range 10 to 50.

   Which questions: ones never seen first, then ones missed last time,
   then ones answered right. Inside each group the order is random.
   Options are shuffled too, except where an option points at the others
   ("All of the above", "Both A and B") and True / False - those keep their order.

   Everything stays in this browser:
     akd:<bank>:v1      { v, rev:{level:n}, seen:{id:{r,w,l,t}}, runs:[{t,level,n,right}] }
                        r = times right, w = times wrong, l = last result (1 or 0), t = time
     akd:<bank>:run:v1  the quiz in progress, so a refresh does not lose it
   The record is kept per question id so it can follow the reader to an
   account later.
   ========================================================= */
(function () {
  'use strict';

  var root = document.querySelector('[data-iq]');
  if (!root) return;

  var BANK = root.getAttribute('data-bank');
  var SRC = root.getAttribute('data-src');
  var BACK = root.getAttribute('data-back') || '/quizzes/daily/';
  var LEVELS = ['easy', 'hard'];
  var LEVEL_NAME = { easy: 'Easy', hard: 'Hard' };
  var MIN = 10, MAX = 50, DEF_LEVEL = 'easy', DEF_N = 10;
  var KEY = 'akd:' + BANK + ':v1';
  var RUN = 'akd:' + BANK + ':run:v1';
  var LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  /* An option that points at the other options must not move. */
  var POINTS_AT_OTHERS_1 = /\b(all|none|both|neither)\b[^,]*\b(above|below)\b/i;
  var POINTS_AT_OTHERS_2 = /\bboth\s+[A-D]\b|\b[A-D]\s+(and|&)\s+[A-D]\b|^\s*[A-D]\s*$/;

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    setup: $('iqSetup'), play: $('iqPlay'), result: $('iqResult'),
    resume: $('iqResume'), resumeTxt: $('iqResumeTxt'),
    resumeGo: $('iqResumeGo'), resumeDrop: $('iqResumeDrop'),
    count: $('iqCount'), minus: $('iqMinus'), plus: $('iqPlus'), hint: $('iqHint'),
    chips: root.querySelectorAll('[data-n]'),
    sum: $('iqSum'), start: $('iqStart'), loadErr: $('iqLoadErr'),
    meta: $('iqMeta'), score: $('iqScore'), bar: $('iqBar'),
    q: $('iqQ'), opts: $('iqOpts'), fb: $('iqFb'), verdict: $('iqVerdict'),
    right: $('iqRight'), why: $('iqWhy'), next: $('iqNext'), stop: $('iqStop'),
    rRight: $('iqRRight'), rTotal: $('iqRTotal'), rPct: $('iqRPct'),
    rNote: $('iqRNote'), rSeen: $('iqRSeen'), rMissed: $('iqRMissed'),
    again: $('iqAgain'), change: $('iqChange')
  };

  var banks = null;          /* { easy:{rev,questions,byId}, hard:{...} } once loaded */
  var banksPromise = null;
  var stats = null;
  var run = null;            /* the quiz on screen */
  var last = { level: DEF_LEVEL, n: DEF_N };

  /* ---------- storage (every read and write may fail) ---------- */
  function read(key) {
    try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private window: carry on */ }
  }
  function drop(key) {
    try { localStorage.removeItem(key); } catch (e) { /* nothing to do */ }
  }
  function readStats() {
    var s = read(KEY);
    if (!s || s.v !== 1 || typeof s.seen !== 'object') s = { v: 1, rev: {}, seen: {}, runs: [] };
    if (!s.rev) s.rev = {};
    if (!Array.isArray(s.runs)) s.runs = [];
    return s;
  }

  /* ---------- helpers ---------- */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function clampN(v) {
    var n = parseInt(v, 10);
    if (isNaN(n)) n = DEF_N;
    return Math.min(MAX, Math.max(MIN, n));
  }
  function show(which) {
    ['setup', 'play', 'result'].forEach(function (k) { el[k].hidden = (k !== which); });
    bringIntoView(root);
  }
  /* Scroll only if the top of this box is above the screen (so it cannot be seen).
     If it is already in view, leave the page alone. */
  function bringIntoView(node) {
    var top = node.getBoundingClientRect().top;
    if (top < 70) window.scrollTo(0, Math.max(0, top + window.pageYOffset - 90));
  }
  function currentLevel() {
    var r = root.querySelector('input[name="iqLevel"]:checked');
    return r ? r.value : DEF_LEVEL;
  }
  function setLevel(level) {
    var r = root.querySelector('input[name="iqLevel"][value="' + level + '"]');
    if (r) r.checked = true;
  }
  function plural(n) { return n + (n === 1 ? ' question' : ' questions'); }

  /* ---------- load the two question files ---------- */
  function loadBanks() {
    if (banksPromise) return banksPromise;
    banksPromise = Promise.all(LEVELS.map(function (l) {
      return fetch(SRC.replace('{level}', l)).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    })).then(function (files) {
      var out = {};
      files.forEach(function (d, i) {
        if (!d || !Array.isArray(d.questions) || d.questions.length < MIN) throw new Error('bad file');
        var byId = {};
        d.questions.forEach(function (q) { byId[q.id] = q; });
        out[LEVELS[i]] = { rev: d.rev, questions: d.questions, byId: byId };
      });
      banks = out;
      reconcile();
      return out;
    });
    banksPromise.catch(function () { banksPromise = null; });
    return banksPromise;
  }

  /* A raised rev drops that level's old record, so it cannot stick to new questions. */
  function reconcile() {
    stats = readStats();
    var changed = false;
    LEVELS.forEach(function (l) {
      if (stats.rev[l] === banks[l].rev) return;
      /* A different rev was seen before: forget this level's old answers (only this level's). */
      if (stats.rev[l] !== undefined) {
        Object.keys(stats.seen).forEach(function (id) { if (banks[l].byId[id]) delete stats.seen[id]; });
      }
      stats.rev[l] = banks[l].rev;
      changed = true;
    });
    if (changed) write(KEY, stats);
    var saved = read(RUN);
    if (saved && (!banks[saved.level] || saved.rev !== banks[saved.level].rev)) drop(RUN);
  }

  function seenCount(level) {
    if (!banks || !stats) return 0;
    var n = 0;
    banks[level].questions.forEach(function (q) { if (stats.seen[q.id]) n++; });
    return n;
  }
  function paintInfo() {
    LEVELS.forEach(function (l) {
      var node = $('iqInfo' + LEVEL_NAME[l]);
      if (!node || !banks) return;
      var total = banks[l].questions.length, seen = seenCount(l);
      node.textContent = seen ? (total + ' questions · you have seen ' + seen) : (total + ' questions');
    });
  }

  /* ---------- set-up screen ---------- */
  function paintSum() {
    var n = parseInt(el.count.value, 10);
    var ok = !isNaN(n) && n >= MIN && n <= MAX;
    el.hint.classList.toggle('is-bad', !ok);
    el.hint.textContent = ok
      ? 'Choose any number from ' + MIN + ' to ' + MAX + '.'
      : 'Please choose a number from ' + MIN + ' to ' + MAX + '.';
    var shown = ok ? n : clampN(el.count.value);
    el.sum.textContent = LEVEL_NAME[currentLevel()] + ' · ' + plural(shown);
    Array.prototype.forEach.call(el.chips, function (c) {
      c.setAttribute('aria-pressed', ok && String(n) === c.getAttribute('data-n') ? 'true' : 'false');
      c.classList.toggle('is-on', ok && String(n) === c.getAttribute('data-n'));
    });
  }
  function setCount(n) { el.count.value = clampN(n); paintSum(); }

  el.count.addEventListener('input', paintSum);
  el.count.addEventListener('change', function () { setCount(el.count.value); });
  el.minus.addEventListener('click', function () { setCount(clampN(el.count.value) - 1); });
  el.plus.addEventListener('click', function () { setCount(clampN(el.count.value) + 1); });
  Array.prototype.forEach.call(el.chips, function (c) {
    c.addEventListener('click', function () { setCount(c.getAttribute('data-n')); });
  });
  Array.prototype.forEach.call(root.querySelectorAll('input[name="iqLevel"]'), function (r) {
    r.addEventListener('change', paintSum);
  });

  /* ---------- choosing the questions ---------- */
  function keepsOrder(q) {
    /* True / False (or Yes / No) always reads in that order. */
    if (q.options.length === 2 && q.options.every(function (o) { return /^(true|false|yes|no)$/i.test(String(o).trim()); })) return true;
    return q.options.some(function (o) {
      var s = String(o);
      return POINTS_AT_OTHERS_1.test(s) || POINTS_AT_OTHERS_2.test(s);
    });
  }
  function orderFor(q) {
    var perm = q.options.map(function (_, i) { return i; });
    return keepsOrder(q) ? perm : shuffle(perm);
  }
  function choose(level, n) {
    var fresh = [], missed = [], done = [];
    banks[level].questions.forEach(function (q) {
      var r = stats.seen[q.id];
      if (!r) fresh.push(q); else if (r.l === 0) missed.push(q); else done.push(q);
    });
    var picked = shuffle(fresh).concat(shuffle(missed), shuffle(done)).slice(0, n);
    shuffle(picked);
    return picked.map(function (q) { return { id: q.id, perm: orderFor(q) }; });
  }

  /* ---------- the quiz ---------- */
  function begin(level, n) {
    el.loadErr.hidden = true;
    el.start.disabled = true;
    el.start.textContent = 'Loading…';
    loadBanks().then(function () {
      el.start.disabled = false;
      el.start.textContent = 'Start Quiz →';
      var size = Math.min(n, banks[level].questions.length);
      last = { level: level, n: n };
      run = { level: level, n: size, rev: banks[level].rev, items: choose(level, size), picks: {}, i: 0 };
      write(RUN, run);
      el.resume.hidden = true;
      show('play');
      paint();
    }).catch(function () {
      el.start.disabled = false;
      el.start.textContent = 'Start Quiz →';
      el.loadErr.hidden = false;
    });
  }

  function itemQ(item) { return banks[run.level].byId[item.id]; }
  function rightSoFar() {
    var c = 0;
    run.items.forEach(function (it) {
      var p = run.picks[it.id];
      if (p !== undefined && it.perm[p] === itemQ(it).correct_option_id) c++;
    });
    return c;
  }

  function paint() {
    var item = run.items[run.i], q = itemQ(item);
    var answered = run.picks[item.id] !== undefined;
    el.meta.textContent = LEVEL_NAME[run.level] + ' · Question ' + (run.i + 1) + ' of ' + run.n;
    el.score.textContent = 'Right so far: ' + rightSoFar();
    el.bar.style.width = Math.round((run.i + (answered ? 1 : 0)) / run.n * 100) + '%';
    el.q.textContent = q.question;

    el.opts.textContent = '';
    item.perm.forEach(function (orig, k) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'iq-opt';
      b.setAttribute('data-k', k);
      var letter = document.createElement('span');
      letter.className = 'iq-letter';
      letter.setAttribute('aria-hidden', 'true');
      letter.textContent = LETTERS[k];
      var text = document.createElement('span');
      text.className = 'iq-text';
      text.textContent = q.options[orig];
      var note = document.createElement('span');
      note.className = 'iq-sr';
      b.appendChild(letter); b.appendChild(text); b.appendChild(note);
      li.appendChild(b);
      el.opts.appendChild(li);
    });

    el.fb.hidden = true;
    el.next.hidden = true;
    if (answered) markAnswer(item, run.picks[item.id], false);
    else { el.q.focus({ preventScroll: true }); bringIntoView(el.meta); }
  }

  function markAnswer(item, pick, fresh) {
    var q = itemQ(item);
    var correctK = item.perm.indexOf(q.correct_option_id);
    var ok = pick === correctK;
    Array.prototype.forEach.call(el.opts.querySelectorAll('.iq-opt'), function (b) {
      var k = +b.getAttribute('data-k');
      var note = b.querySelector('.iq-sr');
      b.setAttribute('aria-disabled', 'true');
      if (k === correctK) { b.classList.add('is-right'); note.textContent = ' (correct answer)'; }
      else if (k === pick) { b.classList.add('is-wrong'); note.textContent = ' (your answer, not correct)'; }
      else b.classList.add('is-dim');
    });
    el.fb.hidden = false;
    el.fb.className = 'iq-fb ' + (ok ? 'is-right' : 'is-wrong');
    el.verdict.textContent = ok ? 'Correct' : 'Not quite';
    if (ok) {
      el.right.hidden = true;
    } else {
      el.right.hidden = false;
      el.right.textContent = 'The right answer is ' + LETTERS[correctK] + ': ' + q.options[q.correct_option_id] + '.';
    }
    /* A question may come without a reason (some banks have none yet): then show no reason at all. */
    el.why.textContent = q.explanation || '';
    el.why.hidden = !q.explanation;
    el.next.hidden = false;
    el.next.textContent = run.i < run.n - 1 ? 'Next question →' : 'See your result →';
    el.score.textContent = 'Right so far: ' + rightSoFar();
    el.bar.style.width = Math.round((run.i + 1) / run.n * 100) + '%';
    /* Focus goes to Next (so Enter works) but the page stays where it is.
       The reader scrolls down for the reason if they want it. */
    if (fresh) el.next.focus({ preventScroll: true });
  }

  el.opts.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.iq-opt') : null;
    if (!b || !run) return;
    var item = run.items[run.i];
    if (run.picks[item.id] !== undefined) return;
    var k = +b.getAttribute('data-k');
    run.picks[item.id] = k;
    var q = itemQ(item);
    var ok = item.perm[k] === q.correct_option_id;
    var prev = stats.seen[item.id] || { r: 0, w: 0 };
    stats.seen[item.id] = { r: prev.r + (ok ? 1 : 0), w: prev.w + (ok ? 0 : 1), l: ok ? 1 : 0, t: Date.now() };
    write(KEY, stats);
    write(RUN, run);
    markAnswer(item, k, true);
    // Logged-in users: record this answer in the DB (fire-and-forget).
    // question_id = q.id (stable, never index-based). Guests: localStorage only.
    try {
      if (window.akTrack) window.akTrack.record({
        questionId: q.id, topicId: q.topicId || null, periodId: q.periodId || null, isCorrect: ok, source: 'daily'
      });
    } catch (e) { /* never break the quiz */ }
  });

  el.next.addEventListener('click', function () {
    if (run.i < run.n - 1) { run.i++; write(RUN, run); paint(); }
    else finish(false);
  });
  el.stop.addEventListener('click', function () { finish(true); });

  /* A, B, C, D or 1 to 4 answers; nothing else is taken over. */
  document.addEventListener('keydown', function (e) {
    if (el.play.hidden || !run || e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var k = '1234'.indexOf(e.key);
    if (k < 0) k = 'abcd'.indexOf(String(e.key).toLowerCase());
    if (k < 0 || String(e.key).length !== 1) return;
    var btn = el.opts.querySelector('.iq-opt[data-k="' + k + '"]');
    if (btn) btn.click();
  });

  /* ---------- the result ---------- */
  function finish(early) {
    var answered = run.items.filter(function (it) { return run.picks[it.id] !== undefined; });
    if (!answered.length) { drop(RUN); run = null; show('setup'); return; }
    var missed = answered.filter(function (it) {
      return it.perm[run.picks[it.id]] !== itemQ(it).correct_option_id;
    });
    var right = answered.length - missed.length;
    var pct = Math.round(right / answered.length * 100);

    stats.runs.push({ t: Date.now(), level: run.level, n: answered.length, right: right });
    if (stats.runs.length > 100) stats.runs = stats.runs.slice(-100);
    write(KEY, stats);
    drop(RUN);

    el.rRight.textContent = right;
    el.rTotal.textContent = answered.length;
    el.rPct.textContent = pct + '% right · ' + LEVEL_NAME[run.level] + (early ? ' · stopped early' : '');
    el.rNote.textContent = pct >= 80
      ? 'Very good. Try the other level, or more questions.'
      : pct >= 50
        ? 'A good start. Look at the ones you missed below, then try again.'
        : 'Read the notes, look at the ones you missed below, then try again.';
    el.rSeen.textContent = 'You have now seen ' + seenCount(run.level) + ' of ' +
      banks[run.level].questions.length + ' ' + LEVEL_NAME[run.level] + ' questions.';

    el.rMissed.textContent = '';
    if (missed.length) {
      var h = document.createElement('h3');
      h.textContent = 'Questions to look at again';
      el.rMissed.appendChild(h);
      missed.forEach(function (it) {
        var q = itemQ(it);
        var box = document.createElement('div');
        box.className = 'iq-miss';
        var t = document.createElement('p'); t.className = 'iq-miss-q'; t.textContent = q.question;
        var you = document.createElement('p');
        you.textContent = 'Your answer: ' + q.options[it.perm[run.picks[it.id]]];
        var ans = document.createElement('p'); ans.className = 'iq-miss-a';
        ans.textContent = 'Right answer: ' + q.options[q.correct_option_id];
        box.appendChild(t); box.appendChild(you); box.appendChild(ans);
        if (q.explanation) {
          var why = document.createElement('p'); why.className = 'iq-miss-why'; why.textContent = q.explanation;
          box.appendChild(why);
        }
        el.rMissed.appendChild(box);
      });
    } else {
      var p = document.createElement('p');
      p.className = 'iq-allright';
      p.textContent = 'You got every question right.';
      el.rMissed.appendChild(p);
    }

    last = { level: run.level, n: run.n };
    run = null;
    paintInfo();
    show('result');
    $('iqRHead').focus({ preventScroll: true });
  }

  el.again.addEventListener('click', function () { begin(last.level, last.n); });
  el.change.addEventListener('click', function () {
    setLevel(last.level); setCount(last.n); paintSum(); show('setup');
  });
  el.start.addEventListener('click', function () {
    var n = clampN(el.count.value);
    el.count.value = n;
    begin(currentLevel(), n);
  });

  /* ---------- a quiz left half-way ---------- */
  function offerResume() {
    var saved = read(RUN);
    if (!saved || !saved.items || !saved.items.length || saved.i >= saved.n) { drop(RUN); return; }
    var done = Object.keys(saved.picks || {}).length;
    el.resumeTxt.textContent = 'You have a quiz in progress: ' + LEVEL_NAME[saved.level] + ', ' +
      done + ' of ' + saved.n + ' answered.';
    el.resume.hidden = false;
    el.resumeGo.onclick = function () {
      loadBanks().then(function () {
        var s = read(RUN);
        if (!s || !banks[s.level] || s.rev !== banks[s.level].rev) { el.resume.hidden = true; return; }
        run = s;
        last = { level: s.level, n: s.n };
        el.resume.hidden = true;
        show('play');
        paint();
      }).catch(function () { el.loadErr.hidden = false; });
    };
    el.resumeDrop.onclick = function () { drop(RUN); el.resume.hidden = true; };
  }

  /* ---------- go ---------- */
  stats = readStats();
  setLevel(DEF_LEVEL);
  setCount(DEF_N);
  show('setup');
  window.scrollTo(0, 0);
  offerResume();
  loadBanks().then(paintInfo).catch(function () { /* the Start button reports it when pressed */ });
})();
