/* =========================================================
   ONE AGE'S PRACTICE PAGE  —  /quizzes/mcq/<age>/
   assets/mcq-age.js

   Ye file har age ke page par chalti hai. Page iske bina bhi
   poora padha ja sakta hai: saare set, saare label aur notes ke
   saare link HTML me hi likhe hain. Ye script sirf wo hissa
   jodti hai jo is browser me rakhe hisaab par tika hai.

   Chhe kaam:
     1. Kaun se set chalu hain — row par data-live se tay hota hai.
     2. Topic aur level se list chhanna (?topic= / ?level= se bhi).
     3. Upar ke chaar gine-gine dabbe bharna.
     4. "Kaisa chal raha hai" card banana, weakest set pehle.
     5. "Build your own test" ab alag page par hai (build/, assets/mcq-build.js).
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
     Jo set chalu hain unki row par data-live hota hai (_data/mcqSpec.json me
     "live": true se). Row apne aap link ban jaati hai. Jis par nahi hai,
     uspar "Coming soon" likha rehta hai aur wo link nahi banta, taaki
     koi khali page par na pahunche.
     --------------------------------------------------------- */

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
      /* Self-serve publish (rule 17): login/pending set rows carry data-catalog-set — their real
         live/draft state comes from the live paper_catalog, not from the build. */
      catalogSet: row.getAttribute('data-catalog-set') || '',
      topics: (row.getAttribute('data-topic') || '').split(/\s+/).filter(Boolean),
      levels: (row.getAttribute('data-level') || '').split(/\s+/).filter(Boolean),
      name: (($('.agehub-settitle', row) || {}).textContent || '').trim(),
      count: parseInt(row.getAttribute('data-count'), 10) || 0,
      size: parseInt(row.getAttribute('data-count'), 10) || 0,   /* count record se badal jata hai, size nahi */
      rev: parseInt(row.getAttribute('data-rev'), 10) || 0,
      level: '',
      more: '',
      base: '',
      link: null,
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
      set.live = !!set.id && set.row.hasAttribute('data-live');
      if (!set.live) return;

      var slot = $('.agehub-soon', set.row);
      if (!slot) return;

      var a = document.createElement('a');
      a.className = 'agehub-go' + (set.open ? ' is-solid' : '');
      set.base = '/quizzes/mcq/' + AGE + '/' + set.id.replace(AGE + '-', '') + '/';
      set.link = a;
      a.href = set.base;
      a.textContent = set.done ? 'Do it again' : set.open ? 'Carry on' : 'Start';
      slot.parentNode.replaceChild(a, slot);

      /* Login wale set: guest ko Start ki jagah lock dikhta hai (template me), logged-in ko Start.
         auth.js [data-guest-only] / [data-auth-only] ko login ki haalat se dikhata-chhupata hai. Start abhi bana hai,
         isliye uski haalat lock se mila lo (lock dikh raha ho = guest = Start chhupa). */
      var lock = $('.agehub-go-lock', set.row);
      if (lock) {
        a.setAttribute('data-auth-only', '');
        a.hidden = !lock.hidden;
      }
    });
  }

  /* ---------------------------------------------------------
     SELF-SERVE PUBLISH (rule 17) — login/pending set rows ka asli haal paper_catalog se

     Jis row par data-catalog-set hai uska live/draft build se nahi, live catalog se tay hota hai:
       - Coming-soon slot jiska set ab LIVE hai  -> Start/lock (login card),
       - live login set jo Draft kar diya gaya   -> wapas "Coming soon",
       - baaki                                   -> jaisa tha waisa hi.
     Free set (bina data-catalog-set) ko chhua tak nahi jata. Padhne me dikkat (network) ho to
     page jaisa bana tha waisa hi rehta hai — kuch nahi badalta, isliye fail-safe hai.
     --------------------------------------------------------- */
  var LOCK_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
    '<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/>' +
    '<path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

  /* auth.js har page par Supabase client banata hai (guest ke paas bhi). ~3s intezaar. */
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

  /* Coming-soon slot ko login card bana do (Start + lock). */
  function flipOn(s, row) {
    if (s.live) return;
    s.live = true;
    if (row && row.question_count > 0 && !s.count) { s.count = row.question_count; s.size = row.question_count; }
    s.base = '/quizzes/mcq/' + AGE + '/' + s.id.replace(AGE + '-', '') + '/';

    var start = document.createElement('a');
    start.className = 'agehub-go' + (s.open ? ' is-solid' : '');
    start.href = s.base;
    start.textContent = s.done ? 'Do it again' : s.open ? 'Carry on' : 'Start';
    start.setAttribute('data-auth-only', '');
    start.hidden = true;               /* guest ko default me lock dikhe, Start nahi */
    s.link = start;

    var slot = $('.agehub-soon', s.row);
    if (slot) slot.parentNode.replaceChild(start, slot);
    else s.row.appendChild(start);

    if (!$('.agehub-go-lock', s.row)) {
      var lock = document.createElement('a');
      lock.className = 'agehub-go agehub-go-lock';
      lock.setAttribute('data-guest-only', '');
      lock.href = '/login/?next=' + encodeURIComponent(s.base);
      lock.setAttribute('aria-label', 'This set needs a login. Log in to open it.');
      lock.setAttribute('title', 'This set needs a login. Log in to open it.');
      lock.innerHTML = LOCK_SVG;
      start.parentNode.insertBefore(lock, start);
    }
  }

  /* Live login set jo Draft ho gaya — wapas "Coming soon". */
  function flipOff(s) {
    if (!s.live) return;
    s.live = false;
    if (s.link && s.link.parentNode) {
      var soon = document.createElement('span');
      soon.className = 'agehub-soon';
      soon.textContent = 'Coming soon';
      s.link.parentNode.replaceChild(soon, s.link);
    }
    s.link = null;
    var lock = $('.agehub-go-lock', s.row);
    if (lock && lock.parentNode) lock.parentNode.removeChild(lock);
    s.row.classList.remove('is-open', 'is-done');
  }

  function catalogFlip() {
    var managed = sets.filter(function (s) { return s.catalogSet; });
    if (!managed.length) return;
    whenAuth().then(function (a) {
      if (!a || !a.configured || !a.client) return;   /* Supabase off — page jaisa hai waisa hi */
      a.client.from('paper_catalog').select('set_id,question_count').eq('kind', 'mcq-set')
        .then(function (res) {
          if (res.error || !Array.isArray(res.data)) return;   /* read fail — koi badlaav nahi */
          var live = {};
          res.data.forEach(function (r) { if (r && r.set_id) live[r.set_id] = r; });
          var changed = false;
          managed.forEach(function (s) {
            var nowLive = !!live[s.catalogSet];
            if (nowLive === s.live) return;
            if (nowLive) flipOn(s, live[s.catalogSet]); else flipOff(s);
            changed = true;
          });
          if (!changed) return;
          /* Naye Start/lock ko login ki haalat se dikhao/chhupao. */
          try { a.session().then(function (ss) { if (a.refreshHeader) a.refreshHeader(ss); }); } catch (e) {}
          try { paintSets(); } catch (e) {}
          try { apply(); } catch (e) {}
          try { paintStats(); } catch (e) {}
        }, function () {});
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
     Level ka chunav ek hi hota hai: All, Easy, Medium ya Hard.
     Test bhi ek waqt me ek hi level ka hota hai, isliye teeno ek saath
     "on" dikhna bhramit karta tha. All matlab koi chhanna nahi.

     Level chuna ho to set ka link ?level= ke saath jata hai, taaki set
     usi level par khule. Par jis set ka attempt is browser me rakha hai
     uska link seedha rehta hai — wo apne rakhe level par hi khulta hai,
     warna naya level chunne par purana result dab jata.
     --------------------------------------------------------- */
  var LEVEL_CHOICES = ['all', 'easy', 'medium', 'hard'];
  var state = { topic: 'all', level: 'all' };

  function readState() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(FILTER_KEY) || 'null'); } catch (e) {}
    if (saved && typeof saved === 'object') {
      if (typeof saved.topic === 'string') state.topic = saved.topic;
      if (LEVEL_CHOICES.indexOf(saved.level) > -1) state.level = saved.level;
    }

    /* URL ka hukum chalega — bhej kar share kiya gaya link waisa hi khulna chahiye. */
    var q = new URLSearchParams(location.search);
    var t = q.get('topic');
    var l = q.get('level');
    if (t) state.topic = t;
    if (l) {
      /* Purane link me ?level=easy,medium bhi ho sakta hai — wo ek nahi, to All. */
      l = l.trim().toLowerCase();
      state.level = LEVEL_CHOICES.indexOf(l) > -1 ? l : 'all';
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
    state.level === 'all' ? q.delete('level') : q.set('level', state.level);
    var qs = q.toString();
    try {
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    } catch (e) {}
  }

  function apply() {
    var topicSel = $('#ageTopic');
    if (topicSel) topicSel.value = state.topic;

    $$('.agehub-level', page).forEach(function (b) {
      var on = b.getAttribute('data-level') === state.level;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    var shown = 0;
    sets.forEach(function (set) {
      var okTopic = state.topic === 'all' || set.topics.indexOf(state.topic) > -1;
      var okLevel = state.level === 'all' || set.levels.indexOf(state.level) > -1;
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
    if (clear) clear.hidden = state.topic === 'all' && state.level === 'all';

    /* Set ke links chune hue level ke saath. */
    sets.forEach(function (set) {
      if (set.link) set.link.href = set.base + levelQuery(set, '?');
    });

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
        state.level = b.getAttribute('data-level');
        apply();
      });
    });

    var clear = $('#ageClear');
    if (clear) {
      clear.addEventListener('click', function () {
        state.topic = 'all';
        state.level = 'all';
        apply();
        if (topicSel) topicSel.focus();
      });
    }
  }

  /* Link me jodne ke liye "?level=easy"; kuch nahi jodna ho to khali.
     Tab nahi jodte jab level chuna na ho, set me wo level na ho, ya is browser me
     us set ka attempt rakha ho (set.level tabhi bharta hai). */
  function levelQuery(set, glue) {
    if (state.level === 'all' || !set || set.level || set.levels.indexOf(state.level) < 0) return '';
    return glue + 'level=' + state.level;
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
    try { wireFilters(); apply(); } catch (e) {}
    try { wireWipe(); } catch (e) {}
    try { catalogFlip(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
