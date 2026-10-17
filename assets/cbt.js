/* =========================================================
   CBT TEST ENGINE  —  /quizzes/mcq/<age>/set-<n>/
   assets/cbt.js

   Ek waqt me ek sawal, upar ulti ginti wali ghadi, neeche
   Previous / Review / Next, side me poori palette. Submit
   dabane par hi result banta hai — pehle nahi.

   Page khud batata hai use kya chalana hai:
     <div data-cbt data-src="/assets/questions/<file>.json"
          data-back="/quizzes/mcq/old-english/">

   Hub se aaya hua ?n= aur ?t= yahan maana jata hai, isliye
   "Build your own set" wala chunav seedha yahan chalta hai.

   Sab kuch is browser me rehta hai, kahin bheja nahi jata:
     key   akq:<setId>:v1
     value { setId, count, pick:{}, done, wrongCount, endedAt,
             marked:[], seen:[], at, endsAt }
   Pehle paanch field wahi hain jo hub (mcq-age.js) padhta hai.
   ========================================================= */
(function () {
  'use strict';

  var SEC_PER_Q = 40;          /* default raftaar, hub wali hi */
  var SEC_MIN = 30, SEC_MAX = 60, MINUTES_CAP = 100;
  var LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clamp(n, lo, hi) { return n < lo ? lo : n > hi ? hi : n; }

  var root = $('[data-cbt]');
  if (!root) return;

  var arrived = 0;             /* is sawal par kab pahunche */
  var paper = null;            /* file se aaya hua set */
  var Q = [];                  /* is attempt ke sawal */
  var key = '';
  var st = { pick: {}, marked: {}, seen: {}, at: 0, endsAt: 0, done: false };
  var tick = null;

  /* ---------------------------------------------------------
     File uthao
     --------------------------------------------------------- */
  function load() {
    var src = root.getAttribute('data-src');
    fetch(src, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.questions) || !data.questions.length) {
          throw new Error('no questions in the file');
        }
        paper = data;
        key = 'akq:' + (data.setId || 'set') + ':v1';
        begin();
      })
      .catch(function (e) { broke(e); });
  }

  /* File na mile to khali page nahi — saaf baat aur wapas jane ka rasta. */
  function broke(e) {
    root.innerHTML =
      '<div class="cbt-start">' +
        '<h1>The questions did not load</h1>' +
        '<p class="lede">Something went wrong on the way to this test. ' +
        'Check that you are online and try once more.</p>' +
        '<p class="small muted">' + esc(e && e.message ? e.message : 'unknown') + '</p>' +
        '<p><a class="btn" href="' + esc(root.getAttribute('data-back') || '/quizzes/mcq/') +
        '">Back to the age</a></p>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     Kitne sawal, kitna waqt
     Hub ka ?n= aur ?t= yahan chalta hai; na ho to poora set
     aur 40 second per sawal.
     --------------------------------------------------------- */
  function plan() {
    var all = paper.questions.length;
    var q = new URLSearchParams(location.search);

    var n = parseInt(q.get('n'), 10);
    n = n ? clamp(n, 1, all) : all;

    var lo = Math.ceil(n * SEC_MIN / 60);
    var hi = Math.min(MINUTES_CAP, Math.max(lo, Math.floor(n * SEC_MAX / 60)));
    var t = parseInt(q.get('t'), 10);
    t = t ? clamp(t, lo, hi) : clamp(Math.round(n * SEC_PER_Q / 60), lo, hi);

    return { n: n, minutes: t };
  }

  function begin() {
    if (new URLSearchParams(location.search).get('only') === 'wrong') { beginWrongOnly(); return; }

    var p = plan();
    Q = paper.questions.slice(0, p.n);

    var old = read();
    if (old && !old.done && old.endsAt > Date.now() && old.count === Q.length) {
      st = old;
      runTest();              /* adhoora test chhoda tha — wahin se */
      return;
    }
    if (old && old.done && old.count === Q.length) {
      st = old;
      showResult();           /* pehle de chuke hain — result dikhao */
      return;
    }
    showStart(p);
  }

  /* ---------------------------------------------------------
     Sirf galat waale — hub ke "Practise my mistakes" se

     Ye pichhle poore attempt me se wahi sawal uthata hai jo galat
     gaye the. Iska hisaab alag chabhi me jata hai (akqx:, akq: nahi),
     taaki set ka asli record aur hub ki ginti is dobara-abhyas se
     na badle.
     --------------------------------------------------------- */
  function beginWrongOnly() {
    var main = null;
    try { main = JSON.parse(localStorage.getItem('akq:' + paper.setId + ':v1') || 'null'); } catch (e) {}

    var wrong = [];
    if (main && main.done && main.pick) {
      paper.questions.slice(0, main.count || paper.questions.length).forEach(function (q, i) {
        var p = main.pick[i];
        if (p !== undefined && p !== q.correct_option_id) wrong.push(q);
      });
    }

    if (!wrong.length) {
      root.innerHTML =
        '<div class="cbt-start">' +
          '<h1>Nothing to go back over</h1>' +
          '<p class="lede">You have no wrong answers saved for this set on this device. ' +
          'Take the set first, and anything you get wrong will be waiting here.</p>' +
          '<p><a class="btn" href="' + esc(location.pathname) + '">Take the set</a></p>' +
        '</div>';
      return;
    }

    Q = wrong;
    key = 'akqx:' + paper.setId + ':wrong:v1';
    var minutes = Math.max(1, Math.round(Q.length * SEC_PER_Q / 60));

    var old = read();
    if (old && !old.done && old.endsAt > Date.now() && old.count === Q.length) { st = old; runTest(); return; }

    root.innerHTML =
      '<div class="cbt-start">' +
        '<p class="eyebrow">' + esc(paper.ageName || '') + ' &middot; Set ' +
          esc(String(paper.setNumber || 1)) + '</p>' +
        '<h1>The ' + Q.length + ' you got wrong</h1>' +
        '<p class="lede">Only the questions you missed last time, in the same test screen. ' +
          'Your score for the full set stays as it was.</p>' +
        '<div class="cbt-facts">' +
          '<div class="cbt-fact"><b>' + Q.length + '</b><span>Questions</span></div>' +
          '<div class="cbt-fact"><b>' + minutes + ' min</b><span>Time</span></div>' +
          '<div class="cbt-fact"><b>' + esc(paper.levelName || 'Mixed') + '</b><span>Level</span></div>' +
        '</div>' +
        '<button type="button" class="cbt-begin" id="cbtBegin">Begin</button>' +
      '</div>';

    $('#cbtBegin').addEventListener('click', function () {
      st = { pick: {}, marked: {}, seen: {}, spent: {}, at: 0, done: false, count: Q.length,
             startedAt: Date.now(), endsAt: Date.now() + minutes * 60000 };
      save();
      runTest();
    });
  }

  /* ---------------------------------------------------------
     Parda 1 — shuru karne se pehle
     --------------------------------------------------------- */
  function showStart(p) {
    root.innerHTML =
      '<div class="cbt-start">' +
        '<p class="eyebrow">' + esc(paper.ageName || '') + ' &middot; Set ' +
          esc(String(paper.setNumber || 1)) + '</p>' +
        '<h1>' + esc(paper.setName || 'Practice set') + '</h1>' +
        '<p class="lede">Read each question, pick one answer, and move on. ' +
          'You can go back to any question until you press Submit.</p>' +
        '<div class="cbt-facts">' +
          '<div class="cbt-fact"><b>' + p.n + '</b><span>Questions</span></div>' +
          '<div class="cbt-fact"><b>' + p.minutes + ' min</b><span>Time</span></div>' +
          '<div class="cbt-fact"><b>' + esc(paper.levelName || 'Mixed') + '</b><span>Level</span></div>' +
        '</div>' +
        '<ul class="cbt-rules">' +
          '<li>One question on the screen at a time. The clock runs from the moment you begin.</li>' +
          '<li>Use <b>Mark for review</b> on anything you want to come back to.</li>' +
          '<li>The grid on the side shows every question and how it stands. Tap a number to jump.</li>' +
          '<li>Nothing is marked until you press <b>Submit</b>. When the clock runs out it submits itself.</li>' +
          '<li>Your answers stay in this browser. Nothing is sent anywhere, and no sign-in is needed.</li>' +
        '</ul>' +

        /* Har exam negative marking nahi lagata, isliye ye chunav reader ka
           hai aur default band hai. Jo laga, wo yaad rakha jata hai. */
        '<div class="cbt-neg">' +
          '<p class="lbl" id="cbtNegLbl">Negative marking</p>' +
          '<div class="cbt-negrow" role="group" aria-labelledby="cbtNegLbl">' +
            '<button type="button" class="cbt-negbtn" data-neg="0">None</button>' +
            '<button type="button" class="cbt-negbtn" data-neg="0.25">\u2212 0.25</button>' +
            '<button type="button" class="cbt-negbtn" data-neg="0.33">\u2212 0.33</button>' +
          '</div>' +
          '<p class="cbt-neghint" id="cbtNegHint"></p>' +
        '</div>' +

        '<button type="button" class="cbt-begin" id="cbtBegin">Begin the test</button>' +
      '</div>';

    wireNeg();

    $('#cbtBegin').addEventListener('click', function () {
      st = { pick: {}, marked: {}, seen: {}, spent: {}, at: 0, done: false, count: Q.length,
             neg: negRate, startedAt: Date.now(), endsAt: Date.now() + p.minutes * 60000 };
      save();
      runTest();
    });
  }

  /* Negative marking: 0 (band), 0.25 ya 0.33 har galat jawab par.
     Chunav is browser me yaad rehta hai, taaki har baar na chunna pade. */
  var negRate = 0;
  var NEG_KEY = 'ak:neg';

  function wireNeg() {
    try { negRate = parseFloat(localStorage.getItem(NEG_KEY)) || 0; } catch (e) { negRate = 0; }

    function paint() {
      $$('.cbt-negbtn').forEach(function (b) {
        b.setAttribute('aria-pressed',
          parseFloat(b.getAttribute('data-neg')) === negRate ? 'true' : 'false');
      });
      var hint = $('#cbtNegHint');
      if (hint) {
        hint.textContent = negRate
          ? 'Every wrong answer takes off ' + negRate + ' of a mark. Questions you leave blank cost nothing.'
          : 'Nothing is taken off for a wrong answer. Turn this on to match an exam that does.';
      }
      try { localStorage.setItem(NEG_KEY, String(negRate)); } catch (e) {}
    }

    $$('.cbt-negbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        negRate = parseFloat(b.getAttribute('data-neg')) || 0;
        paint();
      });
    });
    paint();
  }

  /* ---------------------------------------------------------
     Parda 2 — test
     --------------------------------------------------------- */
  function runTest() {
    root.innerHTML =
      '<div class="cbt-bar">' +
        '<div class="cbt-bar-name">' + esc(paper.setName || 'Practice set') +
          '<span>' + esc(paper.ageName || '') + ' &middot; Set ' +
          esc(String(paper.setNumber || 1)) + ' &middot; ' + esc(paper.levelName || '') + '</span>' +
        '</div>' +
        '<p class="cbt-count" id="cbtCount"></p>' +
        '<div class="cbt-clock" id="cbtClock" role="timer" aria-label="Time left">' +
          '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="2.1" stroke-linecap="round" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.4l3.3 2"/></svg>' +
          '<span id="cbtTime">--:--</span>' +
        '</div>' +
      '</div>' +

      '<div class="cbt-layout">' +
        '<div>' +
          '<div class="cbt-qcard">' +
            '<p class="cbt-qnum" id="cbtQNum"></p>' +
            '<p class="cbt-q" id="cbtQ"></p>' +
            '<fieldset class="cbt-opts" id="cbtOpts">' +
              '<legend>Choose one answer</legend>' +
            '</fieldset>' +
            '<div class="cbt-nav">' +
              '<button type="button" class="cbt-btn" id="cbtPrev">&larr; Previous</button>' +
              '<button type="button" class="cbt-btn is-mark" id="cbtMark" aria-pressed="false">Mark for review</button>' +
              '<button type="button" class="cbt-btn" id="cbtClear">Clear answer</button>' +
              '<button type="button" class="cbt-btn is-next" id="cbtNext">Next &rarr;</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<aside class="cbt-side">' +
          '<h2>All questions</h2>' +
          '<div class="cbt-legend">' +
            '<div><span class="cbt-dot done"></span>Answered</div>' +
            '<div><span class="cbt-dot is-skip"></span>Seen, not answered</div>' +
            '<div><span class="cbt-dot mark"></span>Marked for review</div>' +
            '<div><span class="cbt-dot"></span>Not opened yet</div>' +
          '</div>' +
          '<div class="cbt-pal" id="cbtPal" role="group" aria-label="Jump to a question"></div>' +
          '<p class="cbt-tally" id="cbtTally"></p>' +
          '<button type="button" class="cbt-submit" id="cbtSubmit">Submit the test</button>' +
        '</aside>' +
      '</div>';

    $('#cbtPrev').addEventListener('click', function () { go(st.at - 1); });
    $('#cbtNext').addEventListener('click', function () { go(st.at + 1); });
    $('#cbtClear').addEventListener('click', function () {
      delete st.pick[st.at]; save(); paintQ(); paintPal();
    });
    $('#cbtMark').addEventListener('click', function () {
      st.marked[st.at] ? delete st.marked[st.at] : (st.marked[st.at] = 1);
      save(); paintQ(); paintPal();
    });
    $('#cbtSubmit').addEventListener('click', askSubmit);
    document.addEventListener('keydown', keys);

    buildPal();
    arrived = Date.now();
    go(st.at || 0);
    startClock();
  }

  function buildPal() {
    var pal = $('#cbtPal');
    pal.innerHTML = Q.map(function (_, i) {
      return '<button type="button" class="cbt-cell" data-i="' + i + '">' + (i + 1) + '</button>';
    }).join('');
    pal.addEventListener('click', function (e) {
      var cell = e.target.closest('.cbt-cell');
      if (cell) go(parseInt(cell.getAttribute('data-i'), 10));
    });
  }

  /* Jo sawal chhod rahe hain, uske khate me beeta hua waqt jod do.
     Isi se baad me pata chalta hai kis sawal ne sabse zyada waqt liya. */
  function bank() {
    if (!arrived) return;
    var sec = Math.round((Date.now() - arrived) / 1000);
    if (sec > 0 && sec < 3600) {
      st.spent = st.spent || {};
      st.spent[st.at] = (st.spent[st.at] || 0) + sec;
    }
    arrived = Date.now();
  }

  function go(i) {
    if (i < 0 || i >= Q.length) return;
    bank();
    st.at = i;
    st.seen[i] = 1;
    save();
    paintQ();
    paintPal();
  }

  function paintQ() {
    var i = st.at, q = Q[i];
    $('#cbtQNum').textContent = 'Question ' + (i + 1) + ' of ' + Q.length;
    $('#cbtCount').textContent = 'Question ' + (i + 1) + ' of ' + Q.length;
    $('#cbtQ').textContent = q.question;

    var box = $('#cbtOpts');
    $$('.cbt-opt', box).forEach(function (n) { n.remove(); });
    q.options.forEach(function (opt, k) {
      var on = st.pick[i] === k;
      var lab = document.createElement('label');
      lab.className = 'cbt-opt' + (on ? ' is-picked' : '');
      lab.innerHTML =
        '<input type="radio" name="opt" value="' + k + '"' + (on ? ' checked' : '') + '>' +
        '<span class="key" aria-hidden="true">' + LETTERS[k] + '</span>' +
        '<span class="txt">' + esc(opt) + '</span>';
      lab.querySelector('input').addEventListener('change', function () {
        st.pick[i] = k; save(); paintQ(); paintPal();
      });
      box.appendChild(lab);
    });

    var mark = $('#cbtMark');
    mark.setAttribute('aria-pressed', st.marked[i] ? 'true' : 'false');
    mark.textContent = st.marked[i] ? 'Marked for review' : 'Mark for review';

    $('#cbtPrev').disabled = i === 0;
    $('#cbtNext').disabled = i === Q.length - 1;
    $('#cbtClear').disabled = st.pick[i] === undefined;
  }

  function paintPal() {
    $$('.cbt-cell', $('#cbtPal')).forEach(function (cell, i) {
      var has = st.pick[i] !== undefined;
      cell.className = 'cbt-cell' +
        (st.marked[i] ? ' s-mark' + (has ? ' has-ans' : '')
          : has ? ' s-done'
          : st.seen[i] ? ' s-skip' : '') +
        (i === st.at ? ' is-here' : '');
      cell.setAttribute('aria-label', 'Question ' + (i + 1) + ', ' +
        (st.marked[i] ? (has ? 'answered and marked for review' : 'marked for review')
          : has ? 'answered' : st.seen[i] ? 'seen but not answered' : 'not opened yet'));
      cell.setAttribute('aria-current', i === st.at ? 'true' : 'false');
    });

    var done = Object.keys(st.pick).length;
    var mk = Object.keys(st.marked).length;
    $('#cbtTally').innerHTML =
      '<span><b>' + done + '</b> answered</span>' +
      '<span><b>' + (Q.length - done) + '</b> left</span>' +
      '<span><b>' + mk + '</b> marked</span>';
  }

  /* Number keys answer chunte hain, teer nishan aage-peeche le jate hain. */
  function keys(e) {
    if (st.done || !$('#cbtOpts')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' && e.target.type !== 'radio') return;

    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= Q[st.at].options.length) {
      st.pick[st.at] = n - 1; save(); paintQ(); paintPal(); e.preventDefault(); return;
    }
    if (e.key === 'ArrowRight') { go(st.at + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { go(st.at - 1); e.preventDefault(); }
    else if (e.key.toLowerCase() === 'm') { $('#cbtMark').click(); e.preventDefault(); }
  }

  /* ---------------------------------------------------------
     Ghadi
     Bacha hua waqt ghadi ke time par tika hai, ginti par nahi —
     isliye tab badalne ya page refresh hone se waqt nahi badalta.
     --------------------------------------------------------- */
  function startClock() {
    stopClock();
    paintClock();
    tick = setInterval(paintClock, 1000);
  }
  function stopClock() { if (tick) { clearInterval(tick); tick = null; } }

  function paintClock() {
    var left = Math.max(0, Math.round((st.endsAt - Date.now()) / 1000));
    var box = $('#cbtClock'), out = $('#cbtTime');
    if (!box || !out) return;

    var m = Math.floor(left / 60), s = left % 60;
    out.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    box.className = 'cbt-clock' + (left <= 60 ? ' is-out' : left <= 300 ? ' is-low' : '');
    box.setAttribute('aria-label', 'Time left: ' + m + ' minutes ' + s + ' seconds');

    if (left <= 0) { stopClock(); finish(true); }
  }

  /* ---------------------------------------------------------
     Submit
     --------------------------------------------------------- */
  function askSubmit() {
    var left = Q.length - Object.keys(st.pick).length;
    var mk = Object.keys(st.marked).length;
    var say = 'Submit the test now?';
    if (left) say += '\n\n' + left + ' question' + (left === 1 ? '' : 's') + ' not answered.';
    if (mk) say += '\n' + mk + ' still marked for review.';
    say += '\n\nYou cannot change your answers after this.';
    if (window.confirm(say)) finish(false);
  }

  function finish(ranOut) {
    bank();
    arrived = 0;
    stopClock();
    document.removeEventListener('keydown', keys);
    st.done = true;
    st.ranOut = ranOut;
    st.endedAt = Date.now();
    st.wrongCount = Q.reduce(function (n, q, i) {
      return n + (st.pick[i] !== undefined && st.pick[i] !== q.correct_option_id ? 1 : 0);
    }, 0);
    save();
    showResult();
    window.scrollTo(0, 0);
  }

  /* ---------------------------------------------------------
     Parda 3 — result
     --------------------------------------------------------- */
  function showResult() {
    var t = tally();

    root.innerHTML =
      headCard(t) + statRows(t) + topicTable(t) + strongWeak(t) +
      analysis(t) + actions() + nextSteps(t) +

      '<div class="cbt-filters" role="group" aria-label="Which questions to show">' +
        '<button type="button" class="cbt-filter" data-show="all" aria-pressed="true">' +
          'All ' + Q.length + '</button>' +
        '<button type="button" class="cbt-filter" data-show="wrong" aria-pressed="false">' +
          'Wrong ' + t.wrong + '</button>' +
        '<button type="button" class="cbt-filter" data-show="skip" aria-pressed="false">' +
          'Not answered ' + t.skipped + '</button>' +
        '<button type="button" class="cbt-filter" data-show="right" aria-pressed="false">' +
          'Right ' + t.right + '</button>' +
      '</div>' +

      '<div id="cbtReview">' + Q.map(card).join('') + '</div>';

    wireResult(t);
  }

  /* ---------------------------------------------------------
     Sab ginti ek jagah
     Negative marking lagi ho to net score hi asli score hai.
     --------------------------------------------------------- */
  function tally() {
    var right = 0, wrong = 0, skipped = 0, byTopic = {};

    Q.forEach(function (q, i) {
      var key = q.topic || 'other';
      var o = byTopic[key] || (byTopic[key] = { key: key, right: 0, total: 0, read: q.read });
      o.total++;

      if (st.pick[i] === undefined) skipped++;
      else if (st.pick[i] === q.correct_option_id) { right++; o.right++; }
      else wrong++;
    });

    var neg = st.neg || 0;
    var net = Math.max(0, right - wrong * neg);
    var pc = Math.round(net / Q.length * 100);

    return {
      right: right, wrong: wrong, skipped: skipped,
      answered: right + wrong,
      acc: (right + wrong) ? Math.round(right / (right + wrong) * 100) : 0,
      neg: neg, lost: +(wrong * neg).toFixed(2), net: +net.toFixed(2), pc: pc,
      topics: Object.keys(byTopic).map(function (k) {
        var o = byTopic[k];
        o.pc = Math.round(o.right / o.total * 100);
        o.name = (paper.topics && paper.topics[k]) || k;
        return o;
      }).sort(function (a, b) { return a.pc - b.pc || b.total - a.total; })
    };
  }

  /* ---------- sabse upar ka card ---------- */
  function headCard(t) {
    var g = grade(t.pc);
    var past = history(t.right);
    var score = t.neg
      ? t.net + '/' + Q.length
      : t.right + '/' + Q.length;

    return '<div class="cbt-score ' + g.cls + '">' +
      '<div class="cbt-ringwrap">' +
        '<svg class="cbt-ring" viewBox="0 0 120 120" aria-hidden="true">' +
          '<circle class="track" cx="60" cy="60" r="52"></circle>' +
          '<circle class="fill" cx="60" cy="60" r="52"></circle>' +
        '</svg>' +
        '<p class="cbt-ringtxt"><b>' + score + '</b><span>' + t.pc + '%</span></p>' +
      '</div>' +
      '<div class="cbt-score-txt">' +
        '<p class="cbt-done">Test complete · ' + esc(paper.ageName || '') +
          ' · Set ' + esc(String(paper.setNumber || 1)) + '</p>' +
        '<h1>' + g.name + '</h1><p>' + g.line + '</p>' +
        (t.neg ? '<p class="cbt-negnote">' + t.right + ' right, less ' + t.lost +
          ' for ' + t.wrong + ' wrong at −' + t.neg + ' each.</p>' : '') +
        past.banner +
      '</div>' +
    '</div>' + past.chart;
  }

  /* ---------- do patti: ginti aur haalat ---------- */
  function statRows(t) {
    var used = (st.startedAt && st.endedAt)
      ? Math.max(1, Math.round((st.endedAt - st.startedAt) / 1000)) : 0;
    var allowed = (st.endsAt && st.startedAt)
      ? Math.round((st.endsAt - st.startedAt) / 1000) : 0;

    return '<section class="cbt-nums" aria-label="How the paper went">' +
        '<div class="cbt-num ok"><b>' + t.right + '</b><span>Correct</span></div>' +
        '<div class="cbt-num no"><b>' + t.wrong + '</b><span>Incorrect</span></div>' +
        '<div class="cbt-num is-skip"><b>' + t.skipped + '</b><span>Unanswered</span></div>' +
        '<div class="cbt-num"><b>' + (used ? clock(used) : '—') + '</b><span>Time taken</span>' +
          (allowed ? '<em>of ' + clock(allowed) + '</em>' : '') + '</div>' +
      '</section>' +

      '<section class="cbt-nums cbt-nums3" aria-label="Accuracy and level">' +
        '<div class="cbt-num"><b>' + t.acc + '%</b><span>Your accuracy</span>' +
          '<em>of the ' + t.answered + ' you answered</em></div>' +
        '<div class="cbt-num is-soon"><b>Coming soon</b><span>Percentile</span>' +
          '<em>Needs an account — we will not guess a number</em></div>' +
        '<div class="cbt-num"><b>' + esc(paper.levelName || 'Mixed') + '</b><span>Difficulty</span>' +
          '<em>' + Q.length + ' questions in this set</em></div>' +
      '</section>';
  }

  /* ---------- topic ke hisaab se ---------- */
  function topicTable(t) {
    if (t.topics.length < 2) return '';
    return '<section class="cbt-card cbt-topics" aria-label="How each topic went">' +
      '<h2>Topic by topic</h2>' +
      '<p class="sub">Weakest first. Every topic links to the part of the notes it came from.</p>' +
      '<table class="cbt-ttable"><thead><tr>' +
        '<th scope="col">Topic</th><th scope="col">Right</th>' +
        '<th scope="col">How it went</th><th scope="col">Score</th>' +
      '</tr></thead><tbody>' +
      t.topics.map(function (o) {
        var tone = o.pc >= 80 ? 'ok' : o.pc >= 55 ? 'mid' : 'low';
        return '<tr>' +
          '<td><a href="' + esc(paper.notes || '/notes/') + '#' + esc(o.read || '') + '">' +
            esc(o.name) + '</a></td>' +
          '<td class="num">' + o.right + ' / ' + o.total + '</td>' +
          '<td><span class="cbt-tbar"><i class="' + tone + '" style="width:' + o.pc + '%"></i></span></td>' +
          '<td class="num ' + tone + '">' + o.pc + '%</td>' +
        '</tr>';
      }).join('') +
      '</tbody></table></section>';
  }

  /* ---------- kya majboot, kya kamzor ----------
     Dono sirf is attempt se nikle hain. Teen se kam sawal wale topic par
     koi faisla nahi sunaya jata — itne se pata hi nahi chalta. */
  function strongWeak(t) {
    var solid = t.topics.filter(function (o) { return o.total >= 3 && o.pc >= 75; });
    var weak  = t.topics.filter(function (o) { return o.total >= 3 && o.pc < 60; });
    var thin  = t.topics.filter(function (o) { return o.total < 3; });
    if (!solid.length && !weak.length) return '';

    var li = function (o, tone) {
      return '<li class="' + tone + '"><a href="' + esc(paper.notes || '/notes/') + '#' +
        esc(o.read || '') + '">' + esc(o.name) + '</a> <span>' + o.right + ' of ' + o.total + '</span></li>';
    };

    return '<div class="cbt-two">' +
      '<section class="cbt-card">' +
        '<h2>What is solid</h2>' +
        (solid.length
          ? '<ul class="cbt-list">' + solid.map(function (o) { return li(o, 'ok'); }).join('') + '</ul>'
          : '<p class="sub">Nothing reached three quarters this time. The list below is where to start.</p>') +
      '</section>' +
      '<section class="cbt-card">' +
        '<h2>Where the work is</h2>' +
        (weak.length
          ? '<ul class="cbt-list">' + weak.map(function (o) { return li(o, 'low'); }).join('') + '</ul>'
          : '<p class="sub">No topic fell below sixty per cent. Keep it that way.</p>') +
        (thin.length ? '<p class="cbt-thin">' + thin.map(function (o) {
            return esc(o.name) + ' (' + o.right + '/' + o.total + ')'; }).join(', ') +
          ' had too few questions here to call either way.</p>' : '') +
      '</section>' +
    '</div>';
  }

  /* ---------- gol hisaab, sawal ki patti, aur ek pankti ---------- */
  function analysis(t) {
    var C = 2 * Math.PI * 42;
    var seg = function (n, offsetFrom, cls) {
      var len = n / Q.length * C;
      return '<circle class="' + cls + '" cx="60" cy="60" r="42" ' +
        'stroke-dasharray="' + len.toFixed(1) + ' ' + (C - len).toFixed(1) + '" ' +
        'stroke-dashoffset="' + (-offsetFrom / Q.length * C).toFixed(1) + '"></circle>';
    };

    var grid = Q.map(function (q, i) {
      var state = st.pick[i] === undefined ? 'skip'
        : st.pick[i] === q.correct_option_id ? 'right' : 'wrong';
      return '<button type="button" class="cbt-qcell q-' + state + '" data-go="' + i + '" ' +
        'aria-label="Question ' + (i + 1) + ', ' + state + '">' + (i + 1) + '</button>';
    }).join('');

    return '<div class="cbt-three">' +
      '<section class="cbt-card">' +
        '<h2>At a glance</h2>' +
        '<div class="cbt-donutwrap">' +
          '<svg class="cbt-donut" viewBox="0 0 120 120" aria-hidden="true">' +
            seg(t.right, 0, 'd-ok') +
            seg(t.wrong, t.right, 'd-no') +
            seg(t.skipped, t.right + t.wrong, 'd-skip') +
          '</svg>' +
          '<p class="cbt-donuttxt"><b>' + Q.length + '</b><span>Questions</span></p>' +
        '</div>' +
        '<ul class="cbt-key">' +
          '<li><i class="k-ok"></i>' + t.right + ' correct</li>' +
          '<li><i class="k-no"></i>' + t.wrong + ' incorrect</li>' +
          '<li><i class="k-skip"></i>' + t.skipped + ' unanswered</li>' +
        '</ul>' +
      '</section>' +

      '<section class="cbt-card">' +
        '<h2>Question by question</h2>' +
        '<p class="sub">Tap a number to read that one.</p>' +
        '<div class="cbt-qgrid">' + grid + '</div>' +
      '</section>' +

      (paper.quote && paper.quote.text
        ? '<section class="cbt-card cbt-quote">' +
            '<blockquote>' + esc(paper.quote.text) + '</blockquote>' +
            '<cite>' + esc(paper.quote.source || '') + '</cite>' +
          '</section>'
        : '') +
    '</div>';
  }

  /* ---------- neeche ke button ---------- */
  function actions() {
    return '<div class="cbt-after">' +
      '<button type="button" class="cbt-btn is-lead" id="cbtCards">Go through the wrong ones, one by one</button>' +
      '<button type="button" class="cbt-btn" id="cbtPrint">Save my result</button>' +
      '<button type="button" class="cbt-btn" id="cbtAgain">Take this set again</button>' +
      '<a class="cbt-btn" href="' + esc(paper.notes || '/notes/') + '">Read the notes</a>' +
      '<a class="cbt-btn" href="' + esc(root.getAttribute('data-back') || '/quizzes/mcq/') +
        '">Back to ' + esc(paper.ageName || 'the age') + '</a>' +
    '</div>';
  }

  /* ---------- aage kya ---------- */
  function nextSteps(t) {
    var weak = t.topics.filter(function (o) { return o.total >= 3 && o.pc < 60; });
    var tip = weak.length
      ? 'Start with ' + weak.slice(0, 2).map(function (o) { return esc(o.name).toLowerCase(); }).join(' and ') +
        '. Read that part of the notes, then take this set again and watch those numbers move.'
      : t.skipped
      ? 'You know the material. The ' + t.skipped + ' you left blank are the cheapest marks on the paper — answer them next time, even on a half-guess.'
      : 'Nothing is badly weak. Come back in a week and see how much has stayed without a reread.';

    return '<div class="cbt-two">' +
      '<section class="cbt-card cbt-tip">' +
        '<h2>What to do next</h2>' +
        '<p>' + tip + '</p>' +
        advice(t.right, t.wrong, t.skipped, t.acc) +
      '</section>' +
      '<section class="cbt-card cbt-soon">' +
        '<h2>Coming with student accounts</h2>' +
        '<ul class="cbt-list">' +
          '<li class="soon">Your learning journey <span>a path across all twelve ages</span></li>' +
          '<li class="soon">Come back on the right day <span>a nudge when a set is going cold</span></li>' +
          '<li class="soon">Where you stand <span>your percentile against other students</span></li>' +
          '<li class="soon">Your progress on every device <span>not just this browser</span></li>' +
        '</ul>' +
        '<p class="sub">None of these can be honest without an account, so none of them are guessed at here.</p>' +
      '</section>' +
    '</div>';
  }

  /* ---------------------------------------------------------
     Paanch darje
     Naam aur lines sirf yahan hain — badalna ho to bas yahi
     paanch panktiyan badalni hain, aur kahin kuch nahi.
     Rang CSS me hain: .cbt-score.b1 se .b5 tak.
     --------------------------------------------------------- */
  function grade(pc) {
    if (pc >= 85) return { cls: 'b5', name: 'Outstanding',
      line: 'Almost nothing got past you. Keep it warm with a short run every week, and move on to the next age.' };
    if (pc >= 70) return { cls: 'b4', name: 'Strong',
      line: 'A strong paper. Close the few gaps below and this age is as good as finished.' };
    if (pc >= 55) return { cls: 'b3', name: 'Good ground',
      line: 'You know this age. What is left is the fine print \u2014 the dates, the manuscripts, who signed what.' };
    if (pc >= 40) return { cls: 'b2', name: 'Finding your feet',
      line: 'The shape of the age is there. The detail is what is missing, and detail is the easiest thing to fix.' };
    return { cls: 'b1', name: 'Begin again',
      line: 'This one got away. Read the notes through once, then come straight back \u2014 the second run is always different.' };
  }

  /* ---------------------------------------------------------
     Raftaar
     Asli exam me waqt hi haraata hai, isliye wo dikhana zaroori
     hai. Sab kuch us attempt ke apne hisaab se nikla hai.
     --------------------------------------------------------- */
  function clock(sec) {
    var m = Math.floor(sec / 60), r = sec % 60;
    return m ? m + ' min ' + (r ? r + ' sec' : '') : sec + ' sec';
  }

  function pace() {
    var used = (st.startedAt && st.endedAt)
      ? Math.max(1, Math.round((st.endedAt - st.startedAt) / 1000)) : 0;
    if (!used) return '';   /* purane attempt me ye hisaab nahi tha */

    var allowed = st.endsAt && st.startedAt
      ? Math.round((st.endsAt - st.startedAt) / 1000) : 0;
    var each = Math.max(1, Math.round(used / Q.length));

    /* Sabse lamba sawal — par tabhi dikhao jab wo sach me alag se bada ho */
    var worst = -1, worstSec = 0;
    Object.keys(st.spent || {}).forEach(function (i) {
      if (st.spent[i] > worstSec) { worstSec = st.spent[i]; worst = +i; }
    });
    /* Teesra khana: koi ek sawal sach me bhaari pada ho to wo dikhao.
       Warna ghadi par kitna bacha tha — wo khud ek kaam ki baat hai, aur
       doosre khane ki nakal nahi hoti. */
    var left = allowed ? Math.max(0, allowed - used) : 0;
    var slow = (worst >= 0 && worstSec >= Math.max(20, each * 2))
      ? '<div><span>Longest on one</span><b>' + clock(worstSec) +
        '</b><em>Question ' + (worst + 1) + '</em></div>'
      : '<div><span>Clock left</span><b>' + (left ? clock(left) : 'None') +
        '</b><em>' + (left ? 'still to spare' : 'you used every minute') + '</em></div>';

    return '<section class="cbt-pace" aria-label="How the time went">' +
      '<div><span>Time used</span><b>' + clock(used) + '</b>' +
        (allowed ? '<em>of ' + clock(allowed) + ' allowed</em>' : '') + '</div>' +
      '<div><span>Per question</span><b>' + each + ' sec</b><em>on average</em></div>' +
      slow +
      '</section>';
  }

  /* ---------------------------------------------------------
     Pichhle attempt
     Alag chabhi me (akqh:, akq: nahi), taaki hub ki ginti par
     koi asar na pade. Sirf is browser me, aakhri dus attempt.
     --------------------------------------------------------- */
  function history(right) {
    /* Sirf-galat wali dobara-koshish set ki history me nahi jati: uska
       total alag hota hai (4 me se 4), aur wo poore paper ke 38 me se 50
       ke saath ek hi chart me rakhna galat tasveer deta hai. */
    if (key.indexOf('akqx:') === 0) return { banner: '', chart: '' };

    var hkey = 'akqh:' + paper.setId + ':v1';
    var list = [];
    try { list = JSON.parse(localStorage.getItem(hkey) || '[]'); } catch (e) {}
    if (!Array.isArray(list)) list = [];

    /* Ek hi attempt do baar darj na ho — result page dobara khul sakta hai. */
    var stamp = st.endedAt || Date.now();
    if (!list.some(function (a) { return a.at === stamp; })) {
      list.push({ at: stamp, score: right, total: Q.length });
      list = list.slice(-10);
      try { localStorage.setItem(hkey, JSON.stringify(list)); } catch (e) {}
    }

    if (list.length < 2) return { banner: '', chart: '' };

    var best = list.reduce(function (a, b) { return b.score > a.score ? b : a; });
    var prev = list[list.length - 2];
    var diff = right - prev.score;

    var move = diff > 0 ? '<b>' + diff + ' better</b> than last time'
      : diff < 0 ? '<b>' + (-diff) + ' fewer</b> than last time'
      : 'the same as last time';

    var banner = '<p class="cbt-best">' +
      '<span>Attempt <b>' + list.length + '</b></span>' +
      '<span>Your best: <b>' + best.score + '/' + best.total + '</b></span>' +
      '<span>' + move + '</span>' +
      '</p>';

    var top = Math.max(1, best.score);
    var chart = '<section class="cbt-hist" aria-label="Your past attempts at this set">' +
      '<h2>Every time you have taken this set</h2>' +
      '<p class="sub">Kept in this browser only. Oldest on the left.</p>' +
      '<div class="cbt-bars">' +
      list.map(function (a, i) {
        var now = i === list.length - 1;
        var isBest = !now && a.score === best.score;
        return '<div class="' + (now ? 'is-now' : isBest ? 'is-best' : '') + '">' +
          '<i style="height:' + Math.max(4, Math.round(a.score / top * 100)) + '%"></i>' +
          '<small>' + a.score + '</small></div>';
      }).join('') +
      '</div></section>';

    return { banner: banner, chart: chart };
  }

  /* Salah sirf usi par jo is paper me asal me hua. */
  function advice(right, wrong, skipped, acc) {
    var out = [];
    if (skipped) {
      out.push('You left <b>' + skipped + '</b> unanswered. Nothing is taken away for a wrong guess here, ' +
        'so on a question you half-know it is worth narrowing the options and choosing.');
    }
    if (wrong) {
      out.push('<b>' + wrong + '</b> went the wrong way. Read the reason under each one below &mdash; ' +
        'a wrong answer you understand is worth more than a right one you guessed.');
    }
    if (right + wrong > 0 && acc < 60 && skipped === 0) {
      out.push('You answered everything but got ' + acc + '% of them right. ' +
        'Slowing down on the ones you are unsure of will lift that more than extra speed will.');
    }
    if (st.ranOut) {
      out.push('The clock ran out before you finished. Try the same set again and watch where the ' +
        'time goes &mdash; most of it usually goes on two or three questions.');
    }
    var marked = Object.keys(st.marked).filter(function (i) { return st.pick[i] === undefined; }).length;
    if (marked) {
      out.push('<b>' + marked + '</b> question' + (marked === 1 ? ' you marked for review was' : 's you marked for review were') +
        ' never answered. Marking helps only if you leave time at the end to come back.');
    }
    if (!out.length) {
      out.push('Every question answered, and a clean paper. Come back to this set in a week ' +
        'and see how much has stayed.');
    }
    return '<ul class="cbt-advice"><li>' + out.join('</li><li>') + '</li></ul>';
  }

  /* ---------------------------------------------------------
     Result ke sab button
     --------------------------------------------------------- */
  function wireResult(t) {
    /* Gol agle frame me bharta hai, warna browser shuruati haalat
       dikhata hi nahi aur animation gayab ho jati hai. */
    var ring = $('.cbt-ring .fill');
    if (ring) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          ring.style.strokeDashoffset = (327 - 327 * t.pc / 100).toFixed(1);
        });
      });
    }

    $$('.cbt-filter').forEach(function (b) {
      b.addEventListener('click', function () {
        var show = b.getAttribute('data-show');
        $$('.cbt-filter').forEach(function (o) {
          o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
        });
        $$('#cbtReview .cbt-review').forEach(function (c) {
          c.classList.toggle('is-hidden', show !== 'all' && c.getAttribute('data-state') !== show);
        });
      });
    });

    /* Ginti wali patti se seedha us sawal par */
    var grid = $('.cbt-qgrid');
    if (grid) {
      grid.addEventListener('click', function (e) {
        var cell = e.target.closest('[data-go]');
        if (!cell) return;
        var all = $('.cbt-filter[data-show="all"]');
        if (all && all.getAttribute('aria-pressed') !== 'true') all.click();
        var target = $$('#cbtReview .cbt-review')[+cell.getAttribute('data-go')];
        if (!target) return;
        target.scrollIntoView({ block: 'center',
          behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });
        target.classList.add('is-lit');
        setTimeout(function () { target.classList.remove('is-lit'); }, 1800);
      });
    }

    var cards = $('#cbtCards');
    if (cards) {
      var wrongIdx = Q.map(function (q, i) { return i; }).filter(function (i) {
        return st.pick[i] !== undefined && st.pick[i] !== Q[i].correct_option_id;
      });
      if (!wrongIdx.length) cards.hidden = true;
      else cards.addEventListener('click', function () { flashcards(wrongIdx); });
    }

    var pr = $('#cbtPrint');
    if (pr) pr.addEventListener('click', function () { window.print(); });

    $('#cbtAgain').addEventListener('click', function () {
      try { localStorage.removeItem(key); } catch (e) {}
      location.href = location.pathname;
    });
  }

  /* ---------------------------------------------------------
     Galat jawaabon ko ek-ek karke dekhna

     Pehle sirf sawal dikhta hai, taaki dimag use dobara uthane ki
     koshish kare. Khud khol kar hi jawab aata hai — padh lene se
     yaad nahi hota, yaad karne ki koshish se hota hai.
     --------------------------------------------------------- */
  function flashcards(list) {
    var back = root.innerHTML;    /* result waapas lane ke liye */
    var at = 0, shown = false;

    function draw() {
      var i = list[at], q = Q[i];
      root.innerHTML =
        '<div class="cbt-fc">' +
          '<div class="cbt-fctop">' +
            '<p>Wrong answer <b>' + (at + 1) + '</b> of <b>' + list.length + '</b></p>' +
            '<button type="button" class="cbt-btn" id="fcBack">Back to the result</button>' +
          '</div>' +
          '<div class="cbt-fccard">' +
            '<p class="cbt-qnum">Question ' + (i + 1) +
              (q.topic && paper.topics ? ' · ' + esc(paper.topics[q.topic] || '') : '') + '</p>' +
            '<p class="cbt-fcq">' + esc(q.question) + '</p>' +
            (shown
              ? '<div class="cbt-fcans">' +
                  '<p class="cbt-fcrow is-right"><span class="key">' +
                    LETTERS[q.correct_option_id] + '</span>' +
                    esc(q.options[q.correct_option_id]) +
                    '<span class="note">The answer</span></p>' +
                  (st.pick[i] !== undefined && st.pick[i] !== q.correct_option_id
                    ? '<p class="cbt-fcrow is-yours"><span class="key">' + LETTERS[st.pick[i]] +
                      '</span>' + esc(q.options[st.pick[i]]) + '<span class="note">You chose</span></p>'
                    : '') +
                  (q.explanation ? '<p class="cbt-why"><b>Why:</b> ' + esc(q.explanation) + '</p>' : '') +
                  (q.read ? '<p class="cbt-read"><a href="' + esc(paper.notes || '/notes/') + '#' +
                    esc(q.read) + '">Read this part of the notes →</a></p>' : '') +
                '</div>'
              : '<button type="button" class="cbt-begin" id="fcShow">Show the answer</button>') +
          '</div>' +
          '<div class="cbt-fcnav">' +
            '<button type="button" class="cbt-btn" id="fcPrev"' + (at === 0 ? ' disabled' : '') + '>&larr; Previous</button>' +
            '<span class="cbt-fcdots">' + list.map(function (_, k) {
              return '<i class="' + (k === at ? 'is-here' : k < at ? 'is-done' : '') + '"></i>'; }).join('') + '</span>' +
            '<button type="button" class="cbt-btn is-lead" id="fcNext">' +
              (at === list.length - 1 ? 'Finish' : 'Next &rarr;') + '</button>' +
          '</div>' +
        '</div>';

      var show = $('#fcShow');
      if (show) show.addEventListener('click', function () { shown = true; draw(); });
      $('#fcPrev').addEventListener('click', function () { if (at > 0) { at--; shown = false; draw(); } });
      $('#fcNext').addEventListener('click', function () {
        if (at < list.length - 1) { at++; shown = false; draw(); } else leave();
      });
      $('#fcBack').addEventListener('click', leave);
      window.scrollTo(0, 0);
    }

    function leave() { root.innerHTML = back; wireResult(tally()); window.scrollTo(0, 0); }

    draw();
  }

  function card(q, i) {
    var picked = st.pick[i];
    var state = picked === undefined ? 'skip'
      : picked === q.correct_option_id ? 'right' : 'wrong';
    var tag = state === 'right' ? '<span class="cbt-tag ok">Right</span>'
      : state === 'wrong' ? '<span class="cbt-tag no">Wrong</span>'
      : '<span class="cbt-tag is-skip">Not answered</span>';

    var opts = q.options.map(function (o, k) {
      var isRight = k === q.correct_option_id;
      var isYours = k === picked;
      var note = isRight && isYours ? 'Your answer &middot; correct'
        : isRight ? 'Correct answer'
        : isYours ? 'Your answer' : '';
      return '<div class="cbt-ropt' + (isRight ? ' is-right' : isYours ? ' is-yours' : '') + '">' +
        '<span class="key" aria-hidden="true">' + LETTERS[k] + '</span>' +
        '<span>' + esc(o) + '</span>' +
        (note ? '<span class="note">' + note + '</span>' : '') +
        '</div>';
    }).join('');

    return '<article class="cbt-review" data-state="' + state + '">' +
      '<div class="cbt-rtop"><span class="cbt-qnum">Question ' + (i + 1) + '</span>' + tag + '</div>' +
      '<p class="cbt-rq">' + esc(q.question) + '</p>' + opts +
      (q.explanation ? '<p class="cbt-why"><b>Why:</b> ' + esc(q.explanation) + '</p>' : '') +
      '</article>';
  }

  /* --------------------------------------------------------- */
  function save() {
    st.setId = paper.setId;
    st.count = Q.length;
    try { localStorage.setItem(key, JSON.stringify(st)); } catch (e) {}
  }
  function read() {
    try {
      var raw = localStorage.getItem(key);
      var d = raw ? JSON.parse(raw) : null;
      if (!d || typeof d !== 'object') return null;
      d.pick = d.pick || {}; d.marked = d.marked || {}; d.seen = d.seen || {}; d.spent = d.spent || {};
      return d;
    } catch (e) { return null; }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
