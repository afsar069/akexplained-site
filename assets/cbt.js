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
      st = { pick: {}, marked: {}, seen: {}, at: 0, done: false,
             count: Q.length, endsAt: Date.now() + minutes * 60000 };
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
        '<button type="button" class="cbt-begin" id="cbtBegin">Begin the test</button>' +
      '</div>';

    $('#cbtBegin').addEventListener('click', function () {
      st = { pick: {}, marked: {}, seen: {}, at: 0, done: false,
             count: Q.length, endsAt: Date.now() + p.minutes * 60000 };
      save();
      runTest();
    });
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

  function go(i) {
    if (i < 0 || i >= Q.length) return;
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
    var right = 0, wrong = 0, skipped = 0;
    Q.forEach(function (q, i) {
      if (st.pick[i] === undefined) skipped++;
      else if (st.pick[i] === q.correct_option_id) right++;
      else wrong++;
    });
    var answered = right + wrong;
    var pc = Math.round(right / Q.length * 100);
    var acc = answered ? Math.round(right / answered * 100) : 0;

    var band = pc >= 80 ? ['Very strong.', 'You have this age well in hand. Keep it warm with a quick run every week.']
      : pc >= 60 ? ['A good paper.', 'The ground is solid. The gaps below are small and worth closing one at a time.']
      : pc >= 40 ? ['Halfway there.', 'You know the shape of the age but not yet the detail. Read the notes again, then take this set once more.']
      : ['Early days.', 'Go back to the notes first. This set will feel very different on a second reading.'];

    root.innerHTML =
      '<div class="cbt-score">' +
        '<div class="cbt-score-big"><b>' + right + '/' + Q.length + '</b><span>Your score</span></div>' +
        '<div class="cbt-score-txt">' +
          '<h1>' + band[0] + '</h1><p>' + band[1] + '</p>' +
        '</div>' +
      '</div>' +

      '<section class="cbt-nums" aria-label="How the paper went">' +
        '<div class="cbt-num ok"><b>' + right + '</b><span>Right</span></div>' +
        '<div class="cbt-num no"><b>' + wrong + '</b><span>Wrong</span></div>' +
        '<div class="cbt-num is-skip"><b>' + skipped + '</b><span>Not answered</span></div>' +
        '<div class="cbt-num"><b>' + pc + '%</b><span>Score</span></div>' +
      '</section>' +

      advice(right, wrong, skipped, acc) +

      '<div class="cbt-filters" role="group" aria-label="Which questions to show">' +
        '<button type="button" class="cbt-filter" data-show="all" aria-pressed="true">' +
          'All ' + Q.length + '</button>' +
        '<button type="button" class="cbt-filter" data-show="wrong" aria-pressed="false">' +
          'Wrong ' + wrong + '</button>' +
        '<button type="button" class="cbt-filter" data-show="skip" aria-pressed="false">' +
          'Not answered ' + skipped + '</button>' +
        '<button type="button" class="cbt-filter" data-show="right" aria-pressed="false">' +
          'Right ' + right + '</button>' +
      '</div>' +

      '<div id="cbtReview">' + Q.map(card).join('') + '</div>' +

      '<div class="cbt-after">' +
        '<button type="button" class="cbt-btn" id="cbtAgain">Take this set again</button>' +
        '<a class="cbt-btn" href="' + esc(paper.notes || '/notes/') + '">Read the notes</a>' +
        '<a class="cbt-btn" href="' + esc(root.getAttribute('data-back') || '/quizzes/mcq/') +
          '">Back to ' + esc(paper.ageName || 'the age') + '</a>' +
      '</div>';

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

    $('#cbtAgain').addEventListener('click', function () {
      try { localStorage.removeItem(key); } catch (e) {}
      location.href = location.pathname;
    });
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
    out.push('Everything here comes from one page: <a href="' + esc(paper.notes || '/notes/') +
      '">the ' + esc(paper.ageName || '') + ' notes</a>. When a set goes badly, that is the place to go.');

    return '<section class="cbt-advice"><h2>What to do next</h2><ul><li>' +
      out.join('</li><li>') + '</li></ul></section>';
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
      d.pick = d.pick || {}; d.marked = d.marked || {}; d.seen = d.seen || {};
      return d;
    } catch (e) { return null; }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
