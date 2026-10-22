/* =========================================================
   ONE AGE'S PRACTICE PAGE  —  /quizzes/mcq/<age>/
   assets/mcq-age.js

   Ye file har age ke page par chalti hai. Page iske bina bhi
   poora padha ja sakta hai: saare set, saare label aur notes ke
   saare link HTML me hi likhe hain. Ye script sirf wo hissa
   jodti hai jo is browser me rakhe hisaab par tika hai.

   Chhe kaam:
     1. Kaun se set chalu hain — LIVE_SETS se tay hota hai.
     2. Topic aur level se list chhanna (?topic= / ?level= se bhi).
     3. Upar ke chaar gine-gine dabbe bharna.
     4. "Kaisa chal raha hai" card banana, weakest set pehle.
     5. "Build your own set" — kitne sawal, kitna waqt (?n= / ?t= se bhi).
     6. Is device ka hisaab mitana.

   Quiz engine isi localStorage me likhta hai, aur yahi padha jata hai:
     key   akq:<setId>:v1
     value { setId, count, pick:{}, done, wrongCount|wrongIds, endedAt }
   right = answered - wrong. Naya engine inhi naamo se likhe.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. KAUN SE SET CHALU HAIN
     Jis din us set ke 25 sawal taiyar ho jaayein, uska id
     yahan jod dein — bas. Row apne aap link ban jaati hai.
     Jo yahan nahi hai, uspar "Coming soon" likha rehta hai
     aur wo link nahi banta, taaki koi khali page par na pahunche.
     --------------------------------------------------------- */
  var LIVE_SETS = [
    'old-english-set-1',
    // 'old-english-set-2',
    // 'old-english-set-3',
    // 'old-english-set-4',
    // 'old-english-set-5',
    // 'old-english-set-6'
  ];

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var page = $('[data-agehub]');
  if (!page) return;

  var AGE = page.getAttribute('data-age') || '';
  var FILTER_KEY = 'ak:agehub:' + AGE + ':v2';   /* v2: Easy bhi filter me aaya, purana Medium+Hard wala chunav chhod do */

  /* Page par likhi har set row ek object ban jaati hai. */
  var sets = $$('.agehub-set', page).map(function (row) {
    return {
      row: row,
      id: row.getAttribute('data-set') || '',
      topics: (row.getAttribute('data-topic') || '').split(/\s+/).filter(Boolean),
      levels: (row.getAttribute('data-level') || '').split(/\s+/).filter(Boolean),
      name: (($('.agehub-settitle', row) || {}).textContent || '').trim(),
      count: parseInt(row.getAttribute('data-count'), 10) || 0,
      size: parseInt(row.getAttribute('data-count'), 10) || 0,   /* count record se badal jata hai, size nahi */
      rev: parseInt(row.getAttribute('data-rev'), 10) || 0,
      level: '',
      more: '',
      live: false,
      answered: 0,
      wrong: 0,
      done: false,
      open: false
    };
  });
  if (!sets.length) return;

  /* ---------------------------------------------------------
     Is device par rakha hisaab padhna
     --------------------------------------------------------- */
  function store() {
    try { return window.localStorage || null; } catch (e) { return null; }
  }

  function readProgress() {
    var s = store();
    if (!s) return;

    sets.forEach(function (set) {
      if (!set.id) return;
      var raw, data;
      try { raw = s.getItem('akq:' + set.id + ':v1'); } catch (e) { return; }
      if (!raw) return;
      try { data = JSON.parse(raw); } catch (e) { return; }
      if (!data || typeof data !== 'object') return;

      /* Row par data-rev likha ho aur attempt ka rev na mile, to ye attempt
         purane sawalo ka hai — gina nahi jata. (Cbt engine bhi yahi karta hai.) */
      if (set.rev && data.rev !== set.rev) return;
      set.level = typeof data.level === 'string' ? data.level : '';
      set.more = typeof data.more === 'string' ? data.more : '';   /* doosre level se bhare sawal */

      set.answered = (data.pick && typeof data.pick === 'object')
        ? Object.keys(data.pick).length : 0;
      set.wrong = typeof data.wrongCount === 'number' ? data.wrongCount
        : Array.isArray(data.wrongIds) ? data.wrongIds.length : 0;
      if (typeof data.count === 'number' && data.count > 0) set.count = data.count;
      set.done = data.done === true || (set.count > 0 && set.answered >= set.count);
      set.open = !set.done && set.answered > 0;
    });
  }

  /* ---------------------------------------------------------
     2. KAUN SE SET CHALU HAIN — row ko link banana
     Markup me href nahi hai, isliye script band ho to bhi
     adhoora set link nahi banta.
     --------------------------------------------------------- */
  function openSets() {
    sets.forEach(function (set) {
      set.live = set.id && LIVE_SETS.indexOf(set.id) > -1;
      if (!set.live) return;

      var slot = $('.agehub-soon', set.row);
      if (!slot) return;

      var a = document.createElement('a');
      a.className = 'agehub-go' + (set.open ? ' is-solid' : '');
      a.href = '/quizzes/mcq/' + AGE + '/' + set.id.replace(AGE + '-', '') + '/';
      a.textContent = set.done ? 'Do it again' : set.open ? 'Carry on' : 'Start';
      slot.parentNode.replaceChild(a, slot);
    });
  }

  /* Row par badge, haal aur patli progress patti. */
  function paintSets() {
    sets.forEach(function (set) {
      var badge = $('.agehub-badge', set.row);
      var meta = $('.agehub-setmeta', set.row);
      var bar = $('.mcq-bar', set.row);
      var fill = bar ? $('i', bar) : null;

      set.row.classList.toggle('is-done', set.done);
      set.row.classList.toggle('is-open', set.open);

      if (set.done && badge) badge.textContent = '✓';

      if (!set.answered) { if (bar) bar.hidden = true; return; }

      if (bar && set.count) {
        bar.hidden = false;
        var pc = Math.min(100, Math.round(set.answered / set.count * 100));
        if (fill) {
          fill.style.width = pc + '%';
          fill.className = set.done ? 'is-done' : '';
        }
      } else if (bar) {
        bar.hidden = true;
      }

      if (!meta) return;
      var cap = function (w) { return w.charAt(0).toUpperCase() + w.slice(1); };
      var lv = set.level ? ' · ' + cap(set.level) + (set.more ? ' + ' + cap(set.more) : '') : '';
      if (set.done) {
        meta.className = 'agehub-setmeta is-done';
        meta.textContent = 'Finished' + lv + ' · ' + (set.answered - set.wrong) +
          ' of ' + set.answered + ' right';
      } else {
        meta.className = 'agehub-setmeta is-open';
        meta.textContent = set.answered + ' of ' + set.count + ' answered' + lv;
      }
    });
  }

  /* ---------------------------------------------------------
     3. UPAR KE CHAAR DABBE
     Kuch answer nahi kiya to chaar khali dabbe dikhane ka
     koi matlab nahi — tab unki jagah ek chhoti patti rehti hai.
     --------------------------------------------------------- */
  function paintStats() {
    var strip = $('#ageStats');
    var fresh = $('#ageFresh');
    if (!strip) return;

    /* "Still to see" sirf un sets ko ginta hai jo sach me khule hain.
       Poore age ka plan 300 ka hai, par jo abhi likha nahi gaya use
       "baaki bacha hua" batana jhooth hoga. */
    var answered = 0, wrong = 0, total = 0;
    sets.forEach(function (s) {
      answered += s.answered; wrong += s.wrong;
      if (s.live) total += s.count;
    });

    if (!answered) return; /* HTML me patti pehle se dikh rahi hai */

    var right = answered - wrong;
    var pc = Math.round(right / answered * 100);

    set('#statAnswered', answered);
    set('#statRight', pc + '%');
    set('#statRedo', wrong);
    set('#statLeft', Math.max(0, total - answered));

    strip.hidden = false;
    if (fresh) fresh.hidden = true;

    function set(sel, value) {
      var el = $(sel);
      if (el) el.textContent = String(value);
    }
  }

  /* ---------------------------------------------------------
     4. "KAISA CHAL RAHA HAI" — kamzor set pehle
     Topic ke hisaab se nahi, set ke hisaab se: set 6 kai topic
     chhoota hai, to topic ka hisaab sach nahi hota.
     --------------------------------------------------------- */
  function paintPerformance() {
    var card = $('#agePerf');
    var list = $('#agePerfList');
    var redo = $('#ageRedo');
    if (!card || !list) return;

    var tried = sets.filter(function (s) { return s.answered > 0; });
    if (!tried.length) return;

    tried.sort(function (a, b) {
      return (a.answered - a.wrong) / a.answered - (b.answered - b.wrong) / b.answered;
    });

    list.innerHTML = tried.map(function (s) {
      var right = s.answered - s.wrong;
      var pc = Math.round(right / s.answered * 100);
      var tone = pc >= 80 ? 'is-done' : pc >= 55 ? 'is-weak' : '';
      var colour = pc >= 80 ? 'var(--teal)' : pc >= 55 ? 'var(--gold)' : 'var(--mcq-red)';
      return '<div class="agehub-perf">' +
        '<div class="agehub-perftop"><span>' + esc(shortName(s.name)) + '</span>' +
        '<i style="color:' + colour + '">' + right + ' of ' + s.answered + '</i></div>' +
        '<span class="mcq-bar"><i class="' + tone + '" style="width:' + pc + '%"></i></span>' +
        '</div>';
    }).join('');

    /* Markup me is button par href nahi hai — jis set me sabse zyada
       galtiyan hain, usi ke test screen par ?only=wrong ke saath bhejte
       hain. Us set ka chalu hona zaroori hai, warna link kahin nahi jata. */
    var worst = tried.filter(function (s) { return s.wrong > 0 && s.live; })
      .sort(function (a, b) { return b.wrong - a.wrong; })[0];

    if (redo && worst) {
      redo.href = '/quizzes/mcq/' + AGE + '/' +
        worst.id.replace(AGE + '-', '') + '/?only=wrong';
      redo.textContent = 'Go through my ' + worst.wrong + ' mistake' +
        (worst.wrong === 1 ? '' : 's');
      redo.hidden = false;
    }

    card.hidden = false;
  }

  /* "Set 2 · Poets and poems" se sirf "Poets and poems" rakho —
     card patla hai, dono nahi samate. */
  function shortName(name) {
    var cut = name.split('·');
    return (cut.length > 1 ? cut.slice(1).join('·') : name).trim() || name;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------------------------------------------------
     5. CHHANNA — topic aur level
     Teen level hain, Easy, Medium aur Hard, aur teeno alag-alag
     on/off hote hain. Aakhri chalu level band nahi hota, warna
     list khali ho jaati aur wajah dikhti nahi.
     --------------------------------------------------------- */
  var ALL_LEVELS = ['easy', 'medium', 'hard'];
  var state = { topic: 'all', levels: ALL_LEVELS.slice() };

  function readState() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(FILTER_KEY) || 'null'); } catch (e) {}
    if (saved && typeof saved === 'object') {
      if (typeof saved.topic === 'string') state.topic = saved.topic;
      if (Array.isArray(saved.levels) && saved.levels.length) state.levels = saved.levels;
    }

    /* URL ka hukum chalega — bhej kar share kiya gaya link waisa hi khulna chahiye. */
    var q = new URLSearchParams(location.search);
    var t = q.get('topic');
    var l = q.get('level');
    if (t) state.topic = t;
    if (l) {
      var asked = l.split(',').map(function (x) { return x.trim().toLowerCase(); })
        .filter(function (x) { return ALL_LEVELS.indexOf(x) > -1; });
      if (asked.length) state.levels = asked;
    }
  }

  function saveState() {
    try { localStorage.setItem(FILTER_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* Pata patti me filter dikhta rahe, taaki page share kiya ja sake. */
  function stampUrl() {
    if (!window.history || !history.replaceState) return;
    var q = new URLSearchParams(location.search);
    state.topic === 'all' ? q.delete('topic') : q.set('topic', state.topic);
    state.levels.length === ALL_LEVELS.length ? q.delete('level') : q.set('level', state.levels.join(','));
    /* Apna banaya hua set bhi link me jaye, taaki bheja ja sake.
       Build card page par na ho to build.minutes abhi 0 hai — tab kuch nahi. */
    if (build.minutes > 0) {
      build.count === COUNT_DEFAULT ? q.delete('n') : q.set('n', build.count);
      build.minutes === defaultMinutes(build.count) ? q.delete('t') : q.set('t', build.minutes);
    }
    var qs = q.toString();
    try {
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    } catch (e) {}
  }

  function apply() {
    var topicSel = $('#ageTopic');
    if (topicSel) topicSel.value = state.topic;

    $$('.agehub-level', page).forEach(function (b) {
      var on = state.levels.indexOf(b.getAttribute('data-level')) > -1;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    var shown = 0;
    sets.forEach(function (set) {
      var okTopic = state.topic === 'all' || set.topics.indexOf(state.topic) > -1;
      var okLevel = set.levels.some(function (l) { return state.levels.indexOf(l) > -1; });
      var on = okTopic && okLevel;
      set.row.classList.toggle('is-hidden', !on);
      if (on) shown++;
    });

    var empty = $('#ageEmpty');
    if (empty) empty.hidden = shown > 0;

    var count = $('#ageCount');
    if (count) {
      count.textContent = shown === sets.length
        ? 'All ' + sets.length + ' sets'
        : shown === 0 ? 'No set matches'
        : shown + ' of ' + sets.length + ' sets';
    }

    var clear = $('#ageClear');
    if (clear) clear.hidden = state.topic === 'all' && state.levels.length === ALL_LEVELS.length;

    saveState();
    stampUrl();
  }

  function wireFilters() {
    var topicSel = $('#ageTopic');
    if (topicSel) {
      topicSel.addEventListener('change', function () {
        state.topic = topicSel.value;
        apply();
      });
    }

    $$('.agehub-level', page).forEach(function (b) {
      b.addEventListener('click', function () {
        var level = b.getAttribute('data-level');
        var at = state.levels.indexOf(level);
        if (at > -1) {
          if (state.levels.length === 1) return; /* aakhri level band nahi hota */
          state.levels.splice(at, 1);
        } else {
          state.levels.push(level);
        }
        apply();
      });
    });

    var clear = $('#ageClear');
    if (clear) {
      clear.addEventListener('click', function () {
        state.topic = 'all';
        state.levels = ALL_LEVELS.slice();
        apply();
        if (topicSel) topicSel.focus();
      });
    }
  }

  /* ---------------------------------------------------------
     5. APNA SET BANAO — kitne sawal, kitna waqt

     Sawal : 10 se 100, default 50.
     Waqt  : har sawal ke liye 30 se 60 second, default 40.
             Isi se poora waqt nikalta hai, aur 100 sawal x 60 second
             theek 100 minute par ja kar rukte hain — yahi upar ki hadd hai.
             50 sawal ka default isliye 33 minute banta hai.

     Reader waqt badalta hai to hum second-per-sawal yaad rakh lete hain,
     naki minute. Isliye baad me sawal ki ginti badle to uski chuni hui
     raftaar bani rehti hai, aur waqt usi hisaab se apne aap badal jata hai.
     --------------------------------------------------------- */
  var COUNT_MIN = 10, COUNT_MAX = 100, COUNT_DEFAULT = 50;
  var RATE_MIN = 30, RATE_MAX = 60, RATE_DEFAULT = 40;   /* second per sawal */
  var MINUTES_CAP = 100;

  var build = { count: COUNT_DEFAULT, rate: RATE_DEFAULT, minutes: 0 };

  function clamp(n, lo, hi) { return n < lo ? lo : n > hi ? hi : n; }

  function minMinutes(count) { return Math.ceil(count * RATE_MIN / 60); }
  function maxMinutes(count) {
    return Math.min(MINUTES_CAP, Math.max(minMinutes(count), Math.floor(count * RATE_MAX / 60)));
  }
  function defaultMinutes(count) {
    return clamp(Math.round(count * RATE_DEFAULT / 60), minMinutes(count), maxMinutes(count));
  }
  /* Jo minute dikh rahe hain, unse asli raftaar — hint ke liye. */
  function secondsEach(count, minutes) { return Math.round(minutes * 60 / count); }

  function wireBuild() {
    var card = $('.agehub-build', page);
    if (!card) return;

    var countBox = $('#buildCount'), countBar = $('#buildCountRange');
    var timeBox = $('#buildTime'), timeBar = $('#buildTimeRange');
    var rateHint = $('#buildRate'), sum = $('#buildSum'), poolNote = $('#buildPool');
    var startBtn = $('#buildStart'), reset = $('#buildReset');
    if (!countBox || !timeBox) return;

    /* ---- yaad rakha hua, phir URL ka hukum ---- */
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('ak:agebuild:' + AGE) || 'null'); } catch (e) {}
    if (saved && typeof saved === 'object') {
      if (saved.count) build.count = clamp(Math.round(saved.count), COUNT_MIN, COUNT_MAX);
      if (saved.rate) build.rate = clamp(Math.round(saved.rate), RATE_MIN, RATE_MAX);
    }
    build.minutes = clamp(Math.round(build.count * build.rate / 60),
      minMinutes(build.count), maxMinutes(build.count));

    var q = new URLSearchParams(location.search);
    var askedN = parseInt(q.get('n'), 10);
    var askedT = parseInt(q.get('t'), 10);
    if (askedN) setCount(askedN, true);
    if (askedT) setMinutes(askedT, true);

    function setCount(value, quiet) {
      build.count = clamp(Math.round(value) || COUNT_DEFAULT, COUNT_MIN, COUNT_MAX);
      /* Ginti badli — reader ki chuni hui raftaar wahi rakho, waqt naya. */
      build.minutes = clamp(Math.round(build.count * build.rate / 60),
        minMinutes(build.count), maxMinutes(build.count));
      if (!quiet) render();
    }

    function setMinutes(value, quiet) {
      build.minutes = clamp(Math.round(value) || defaultMinutes(build.count),
        minMinutes(build.count), maxMinutes(build.count));
      build.rate = clamp(secondsEach(build.count, build.minutes), RATE_MIN, RATE_MAX);
      if (!quiet) render();
    }

    function render() {
      var lo = minMinutes(build.count), hi = maxMinutes(build.count);
      var each = secondsEach(build.count, build.minutes);

      countBox.value = countBar.value = build.count;
      timeBox.value = timeBar.value = build.minutes;
      /* Waqt ki hadd sawal ki ginti par tiki hai, isliye har baar nayi. */
      timeBox.min = timeBar.min = lo;
      timeBox.max = timeBar.max = hi;

      if (rateHint) {
        rateHint.textContent = 'That is about ' + each + ' seconds a question. ' +
          'You can go from ' + lo + ' to ' + hi + ' minutes.';
      }
      if (sum) {
        sum.textContent = build.count + ' question' + (build.count === 1 ? '' : 's') +
          ' \u00b7 ' + build.minutes + ' minute' + (build.minutes === 1 ? '' : 's') +
          ' \u00b7 about ' + each + ' seconds each';
      }
      if (reset) {
        reset.hidden = build.count === COUNT_DEFAULT &&
          build.minutes === defaultMinutes(COUNT_DEFAULT);
      }
      /* Start usi set par jata hai jo khula hai. Pehle yahan /custom/ tha, jo
         kabhi bana hi nahi — 404. Set me jitne sawal hain usse zyada maange
         to utne hi milte hain, aur waqt bhi unhi ke hisaab se.
         Har level ki file me size sawal hain, aur ek set ke dono level
         milakar pool bante hain: 50 se upar ke sawal doosre level se aate hain. */
      var live = sets.filter(function (x) { return x.live; })[0];
      var pool = live ? live.size * Math.max(1, live.levels.length) : 0;
      var eff = pool ? Math.min(build.count, pool) : build.count;
      var effMin = clamp(Math.round(eff * build.rate / 60), minMinutes(eff), maxMinutes(eff));
      if (startBtn && startBtn.tagName === 'A' && live) {
        startBtn.href = '/quizzes/mcq/' + AGE + '/' + live.id.replace(AGE + '-', '') +
          '/?n=' + eff + '&t=' + effMin;
      }
      if (poolNote) {
        var over = pool > 0 && build.count > pool;
        var topUp = pool > 0 && !over && eff > live.size;
        poolNote.hidden = !(over || topUp);
        if (over) {
          poolNote.textContent = 'Only ' + pool + ' questions are written so far, so Start will give ' +
            'you ' + pool + ' of them, in ' + effMin + ' minutes.';
        } else if (topUp) {
          poolNote.textContent = 'One level holds ' + live.size + ' questions, so the last ' +
            (eff - live.size) + ' come from the other level.';
        }
      }

      try {
        localStorage.setItem('ak:agebuild:' + AGE,
          JSON.stringify({ count: build.count, rate: build.rate }));
      } catch (e) {}
      stampUrl();
    }

    /* Likhte waqt beech ki adhoori ginti ("1" jo "15" banne wali hai) ko
       pakad kar 10 mat bana do — wo chhed-chhad blur par hoti hai. */
    function loose(box, bar, commit) {
      box.addEventListener('input', function () {
        var n = parseInt(box.value, 10);
        if (!isNaN(n) && n >= +box.min && n <= +box.max) { commit(n); bar.value = n; }
      });
      box.addEventListener('change', function () { commit(parseInt(box.value, 10)); });
      box.addEventListener('blur', function () { commit(parseInt(box.value, 10)); });
      bar.addEventListener('input', function () { commit(parseInt(bar.value, 10)); });
    }

    loose(countBox, countBar, function (n) { setCount(n); });
    loose(timeBox, timeBar, function (n) { setMinutes(n); });

    if (reset) {
      reset.addEventListener('click', function () {
        build.rate = RATE_DEFAULT;
        setCount(COUNT_DEFAULT);
        countBox.focus();
      });
    }

    /* Sawal taiyar hone se pehle Start kahin nahi le jata, isliye wo abhi
       link hai hi nahi — markup me sirf ek halka label hai. */
    if (startBtn && LIVE_SETS.length) {
      var a = document.createElement('a');
      a.className = 'agehub-start';
      a.id = 'buildStart';
      a.textContent = 'Start';
      startBtn.parentNode.replaceChild(a, startBtn);
      startBtn = a;
    }

    render();
  }

  /* ---------------------------------------------------------
     Is device ka hisaab mitana
     --------------------------------------------------------- */
  function wireWipe() {
    var btn = $('#ageWipe');
    if (!btn) return;

    var any = sets.some(function (s) { return s.answered > 0; });
    if (!any) return;
    btn.hidden = false;

    btn.addEventListener('click', function () {
      if (!window.confirm('Clear your ' + (page.getAttribute('data-agename') || 'practice') +
        ' progress on this device? This cannot be undone.')) return;
      var s = store();
      if (s) {
        sets.forEach(function (set) {
          try { s.removeItem('akq:' + set.id + ':v1'); } catch (e) {}
        });
      }
      location.reload();
    });
  }

  /* --------------------------------------------------------- */
  function start() {
    try { readProgress(); } catch (e) {}
    try { openSets(); } catch (e) {}
    try { paintSets(); } catch (e) {}
    try { paintStats(); } catch (e) {}
    try { paintPerformance(); } catch (e) {}
    try { readState(); } catch (e) {}
    try { wireBuild(); } catch (e) {}
    try { wireFilters(); apply(); } catch (e) {}
    try { wireWipe(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
