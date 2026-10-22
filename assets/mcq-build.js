/* =========================================================
   BUILD YOUR OWN TEST  —  /quizzes/mcq/<age>/build/
   assets/mcq-build.js

   Ye page test shuru nahi karta. Reader yahan chunta hai:
     1. kaun se sets (ek ya zyada),
     2. kaun sa level (ek hi),
     3. kitne sawal (10 se 100) aur kitna waqt.
   Start dabane par /quizzes/mcq/<age>/custom/ khulta hai, jahan
   cbt.js sawal random chun kar test chalata hai:
     ?sets=a,b&lv=easy&more=medium&n=80&t=53
   "more" tabhi jata hai jab chune hue sets ke us level me jitne sawal
   hain, usse zyada maange gaye — baki doosre level se bharte hain.

   Waqt ke niyam: har sawal ke liye 30 se 60 second (default 40), upar
   ki hadd 100 minute. Reader waqt badalta hai to raftaar (second per
   sawal) yaad rakhi jati hai, minute nahi.
   ========================================================= */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  var page = $('[data-build]');
  if (!page) return;

  var AGE = page.getAttribute('data-age') || '';
  var LEVELS = (page.getAttribute('data-levels') || 'easy,medium').split(',')
    .map(function (x) { return x.trim(); }).filter(Boolean);
  var LIVE = window.AK_LIVE_SETS || [];
  var SAVE_KEY = 'ak:agebuild2:' + AGE;
  var CUSTOM_KEY = 'akq:' + AGE + '-custom:v1';
  var CUSTOM_URL = '/quizzes/mcq/' + AGE + '/custom/';

  var COUNT_MIN = 10, COUNT_MAX = 100, COUNT_DEFAULT = 50;
  var RATE_MIN = 30, RATE_MAX = 60, RATE_DEFAULT = 40;     /* second per sawal */
  var MINUTES_CAP = 100;

  function clamp(n, lo, hi) { return n < lo ? lo : n > hi ? hi : n; }
  function minMinutes(count) { return Math.ceil(count * RATE_MIN / 60); }
  function maxMinutes(count) {
    return Math.min(MINUTES_CAP, Math.max(minMinutes(count), Math.floor(count * RATE_MAX / 60)));
  }
  function defaultMinutes(count) {
    return clamp(Math.round(count * RATE_DEFAULT / 60), minMinutes(count), maxMinutes(count));
  }
  function secondsEach(count, minutes) { return Math.round(minutes * 60 / count); }
  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  /* Page par likhi har set row ek object. Chalu wahi hai jo mcq-live.js me hai. */
  var sets = $$('.mcqb-set', page).map(function (row) {
    var id = row.getAttribute('data-set') || '';
    return {
      row: row, id: id, box: $('input', row), soon: $('.mcqb-soon', row),
      num: (id.match(/(\d+)$/) || [])[1] || '',
      size: parseInt(row.getAttribute('data-count'), 10) || 0,    /* har level me itne sawal */
      levels: (row.getAttribute('data-level') || '').split(/\s+/).filter(Boolean),
      live: LIVE.indexOf(id) > -1
    };
  });
  var live = sets.filter(function (s) { return s.live; });

  var state = { chosen: [], level: LEVELS[0] || '', count: COUNT_DEFAULT, rate: RATE_DEFAULT, minutes: 0 };

  var countBox = $('#buildCount'), countBar = $('#buildCountRange');
  var timeBox = $('#buildTime'), timeBar = $('#buildTimeRange');
  var rateHint = $('#buildRate'), sum = $('#buildSum'), poolNote = $('#buildPool');
  var setsHint = $('#buildSetsHint'), levelHint = $('#buildLevelHint');
  var startBtn = $('#buildStart'), reset = $('#buildReset');
  var levelBtns = $$('.agehub-level', page);
  if (!countBox || !timeBox || !startBtn) return;

  /* ---------- shuru ka chunav: link, phir yaad rakha hua, phir sab chalu sets ---------- */
  function init() {
    sets.forEach(function (s) {
      if (s.live) {
        s.box.disabled = false;
        if (s.soon) s.soon.hidden = true;
      } else {
        s.row.classList.add('is-off');
      }
    });

    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch (e) {}
    if (!saved || typeof saved !== 'object') saved = {};
    var q = new URLSearchParams(location.search);

    function onlyLive(list) {
      return (list || []).filter(function (id) {
        return live.some(function (s) { return s.id === id; });
      });
    }
    var fromUrl = onlyLive((q.get('sets') || '').split(',').map(function (x) { return x.trim(); }));
    var fromSaved = onlyLive(saved.sets);
    state.chosen = fromUrl.length ? fromUrl : fromSaved.length ? fromSaved
      : live.map(function (s) { return s.id; });

    var lv = q.get('lv') || saved.level;
    if (LEVELS.indexOf(lv) > -1) state.level = lv;

    if (saved.rate) state.rate = clamp(Math.round(saved.rate), RATE_MIN, RATE_MAX);
    var n = parseInt(q.get('n'), 10) || saved.count;
    state.count = clamp(Math.round(n) || COUNT_DEFAULT, COUNT_MIN, COUNT_MAX);
    state.minutes = clamp(Math.round(state.count * state.rate / 60), minMinutes(state.count), maxMinutes(state.count));
    var t = parseInt(q.get('t'), 10);
    if (t) setMinutes(t, true);

    /* Start pehle span hai (markup me); link bana do. */
    var a = document.createElement('a');
    a.className = 'agehub-start';
    a.id = 'buildStart';
    a.textContent = 'Start the test';
    startBtn.parentNode.replaceChild(a, startBtn);
    startBtn = a;

    sets.forEach(function (s) {
      if (!s.live) return;
      s.box.addEventListener('change', function () {
        var at = state.chosen.indexOf(s.id);
        if (s.box.checked && at < 0) state.chosen.push(s.id);
        if (!s.box.checked && at > -1) state.chosen.splice(at, 1);
        render();
      });
    });
    levelBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.disabled) return;
        state.level = b.getAttribute('data-level');
        render();
      });
    });

    function loose(box, bar, commit) {
      box.addEventListener('input', function () {
        var v = parseInt(box.value, 10);
        if (!isNaN(v) && v >= +box.min && v <= +box.max) { commit(v); bar.value = v; }
      });
      box.addEventListener('change', function () { commit(parseInt(box.value, 10)); });
      box.addEventListener('blur', function () { commit(parseInt(box.value, 10)); });
      bar.addEventListener('input', function () { commit(parseInt(bar.value, 10)); });
    }
    loose(countBox, countBar, function (v) { setCount(v); });
    loose(timeBox, timeBar, function (v) { setMinutes(v); });

    if (reset) {
      reset.addEventListener('click', function () {
        state.rate = RATE_DEFAULT;
        setCount(COUNT_DEFAULT);
        countBox.focus();
      });
    }

    paintResume();
    render();
  }

  function setCount(value, quiet) {
    state.count = clamp(Math.round(value) || COUNT_DEFAULT, COUNT_MIN, COUNT_MAX);
    state.minutes = clamp(Math.round(state.count * state.rate / 60), minMinutes(state.count), maxMinutes(state.count));
    if (!quiet) render();
  }

  function setMinutes(value, quiet) {
    state.minutes = clamp(Math.round(value) || defaultMinutes(state.count),
      minMinutes(state.count), maxMinutes(state.count));
    state.rate = clamp(secondsEach(state.count, state.minutes), RATE_MIN, RATE_MAX);
    if (!quiet) render();
  }

  /* Chune hue sets, unka saanjha level, aur kitne sawal mil sakte hain. */
  function figure() {
    var chosen = live.filter(function (s) { return state.chosen.indexOf(s.id) > -1; });
    var avail = LEVELS.filter(function (lv) {
      return chosen.length && chosen.every(function (s) { return s.levels.indexOf(lv) > -1; });
    });
    var level = avail.indexOf(state.level) > -1 ? state.level : (avail[0] || '');
    var more = avail.filter(function (l) { return l !== level; })[0] || '';
    var main = chosen.reduce(function (n, s) { return n + s.size; }, 0);
    return { chosen: chosen, avail: avail, level: level, more: more,
             main: main, pool: main + (more ? main : 0) };
  }

  function render() {
    var f = figure();
    var eff = f.pool ? Math.min(state.count, f.pool) : state.count;
    var effMin = clamp(Math.round(eff * state.rate / 60), minMinutes(eff), maxMinutes(eff));
    var useMore = f.more && eff > f.main;

    /* set ke dabbe */
    sets.forEach(function (s) {
      if (!s.live) return;
      var on = state.chosen.indexOf(s.id) > -1;
      s.box.checked = on;
      s.row.classList.toggle('is-on', on);
    });
    if (setsHint) {
      setsHint.textContent = !live.length ? 'No set is open yet.'
        : !f.chosen.length ? 'Tick at least one set to build a test.'
        : plural(f.chosen.length, 'set', 'sets') + ' ticked · ' + f.main + ' questions at each level.';
    }

    /* level ke button */
    levelBtns.forEach(function (b) {
      var lv = b.getAttribute('data-level');
      var ok = f.avail.indexOf(lv) > -1;
      b.disabled = !ok;
      b.setAttribute('aria-pressed', ok && lv === f.level ? 'true' : 'false');
    });
    if (levelHint) {
      levelHint.textContent = !f.level ? 'The sets you ticked have no level in common.'
        : f.main + ' ' + cap(f.level) + ' questions in these sets.';
    }

    /* ginti aur waqt */
    countBox.value = countBar.value = state.count;
    timeBox.value = timeBar.value = effMin;
    timeBox.min = timeBar.min = minMinutes(eff);
    timeBox.max = timeBar.max = maxMinutes(eff);
    var each = secondsEach(eff, effMin);
    if (rateHint) {
      rateHint.textContent = 'That is about ' + each + ' seconds a question. ' +
        'You can go from ' + minMinutes(eff) + ' to ' + maxMinutes(eff) + ' minutes.';
    }

    if (poolNote) {
      var over = f.pool > 0 && state.count > f.pool;
      poolNote.hidden = !(over || useMore);
      if (over) {
        poolNote.textContent = 'Only ' + f.pool + ' questions are written for these sets, so you will get ' +
          f.pool + ' of them, in ' + effMin + ' minutes.';
      } else if (useMore) {
        poolNote.textContent = 'These sets hold ' + f.main + ' ' + cap(f.level) + ' questions, so the last ' +
          (eff - f.main) + ' come from the ' + cap(f.more) + ' level.';
      }
    }

    var names = f.chosen.length === 1 ? 'Set ' + f.chosen[0].num
      : f.chosen.length === 2 ? 'Set ' + f.chosen[0].num + ' and Set ' + f.chosen[1].num
      : f.chosen.length + ' sets';
    if (sum) {
      sum.textContent = !f.chosen.length || !f.level ? 'Choose a set and a level to see your test.'
        : plural(eff, 'question', 'questions') + ' from ' + names + ' · ' +
          cap(f.level) + (useMore ? ' + ' + cap(f.more) : '') + ' · ' +
          plural(effMin, 'minute', 'minutes') + ' · about ' + each + ' seconds each';
    }
    if (reset) reset.hidden = state.count === COUNT_DEFAULT && state.minutes === defaultMinutes(COUNT_DEFAULT);

    /* Start */
    var go = f.chosen.length && f.level;
    if (go) {
      startBtn.href = CUSTOM_URL + '?sets=' + f.chosen.map(function (s) { return s.id; }).join(',') +
        '&lv=' + f.level + (useMore ? '&more=' + f.more : '') + '&n=' + eff + '&t=' + effMin;
      startBtn.removeAttribute('aria-disabled');
      startBtn.classList.remove('is-off');
    } else {
      startBtn.removeAttribute('href');
      startBtn.setAttribute('aria-disabled', 'true');
      startBtn.classList.add('is-off');
    }

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        sets: state.chosen, level: f.level || state.level, count: state.count, rate: state.rate }));
    } catch (e) {}
  }

  /* Pichhla custom test: adhoora ho to jaari rakhne ka rasta, poora ho to result. */
  function paintResume() {
    var box = $('#buildResume');
    if (!box) return;
    var d = null;
    try { d = JSON.parse(localStorage.getItem(CUSTOM_KEY) || 'null'); } catch (e) {}
    if (!d || !d.custom || typeof d.count !== 'number') return;

    var answered = d.pick && typeof d.pick === 'object' ? Object.keys(d.pick).length : 0;
    if (d.done) {
      var right = answered - (d.wrongCount || 0);
      box.innerHTML = '<p><b>Your last test</b> · ' + right + ' of ' + d.count + ' right. ' +
        'Building a new one replaces it.</p>' +
        '<p class="mcqb-links"><a href="' + CUSTOM_URL + '">See the result</a>' +
        '<a href="' + CUSTOM_URL + 'review/">Review the answers</a></p>';
      box.hidden = false;
    } else if (d.endsAt > Date.now()) {
      box.innerHTML = '<p><b>A test is in progress</b> · ' + answered + ' of ' + d.count + ' answered. ' +
        'Beginning a new one replaces it.</p>' +
        '<p class="mcqb-links"><a href="' + CUSTOM_URL + '">Carry on</a></p>';
      box.hidden = false;
    }
  }

  init();
})();
