/* =========================================================
   CBT TEST ENGINE  —  /quizzes/mcq/<age>/set-<n>/
   assets/cbt.js

   Ek waqt me ek sawal, upar ulti ginti wali ghadi, neeche
   Previous / Review / Next, side me poori palette. Submit
   dabane par hi result banta hai — pehle nahi.

   Page khud batata hai use kya chalana hai:
     <div data-cbt data-back="/quizzes/mcq/old-english/"
          data-set="old-english-set-1"
          data-levels="easy,medium"           (na likho to ek hi file)
          data-default-level="easy"
          data-src="/assets/questions/old-english-set-1-{level}.json">

   Ek set ke kai level ho sakte hain. Reader start screen par chunta
   hai; jo attempt browser me rakha hai uska level wahi rehta hai.
   Question file me "rev" hota hai: sawal badalne par rev badhao aur
   purane attempt apne aap bekar ho jaate hain (purane jawab naye
   sawalo par galat chipak jaate, warna).

   Hub se aaya hua ?n= aur ?t= yahan maana jata hai.

   Apna test (data-custom): kai sets ke sawal ek hi test me. Page par
     <div data-cbt data-custom data-age="old-english" data-levels="easy,medium"
          data-src="/assets/questions/{set}-{level}.json"
          data-back="/quizzes/mcq/old-english/"
          data-new="/quizzes/mcq/old-english/build/">
   Link: ?sets=a,b&lv=easy&more=medium&n=80&t=53 (build page banata hai).
   Sawal Begin dabane par random chune jate hain aur unki list (ref) record
   me rakhi jati hai, taaki review aur dobara khulna wahi sawal dikhaye.
   Record: akq:<age>-custom:v1.

   Sab kuch is browser me rehta hai, kahin bheja nahi jata:
     key   akq:<setId>:v1
     value { setId, level, rev, count, pick:{}, done, wrongCount,
             endedAt, marked:[], seen:[], at, endsAt }
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
  var paper = null;            /* file se aaya hua set (custom me: milaya hua) */
  var CUSTOM = root.hasAttribute('data-custom');
  var AGE = root.getAttribute('data-age') || '';
  var cfg = null;              /* custom: URL ya rakhe hue attempt se aaya mel */
  var cpapers = {};            /* custom: 'set|level' -> file */
  var Q = [];                  /* is attempt ke sawal */
  var key = '';
  var st = { pick: {}, marked: {}, seen: {}, at: 0, endsAt: 0, done: false };
  var tick = null;

  /* ---------------------------------------------------------
     File uthao

     Level na likha ho to purani tarah ek hi file (data-src seedha).
     Ek baar uthayi file dobara nahi uthti — level badalne par bhi nahi.
     --------------------------------------------------------- */
  var SET_ID = root.getAttribute('data-set') || '';
  var LEVELS = (root.getAttribute('data-levels') || '').split(',')
    .map(function (x) { return x.trim(); }).filter(Boolean);
  var DEFAULT_LEVEL = root.getAttribute('data-default-level') || LEVELS[0] || '';
  var papers = {};
  var level = '';
  var more = '';      /* sawal is level se kam pade to jis doosre level se bhare gaye */

  function srcFor(lv) {
    var src = root.getAttribute('data-src') || '';
    return lv ? src.replace('{level}', lv) : src;
  }

  function getJson(url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.questions) || !data.questions.length) {
          throw new Error('no questions in the file');
        }
        return data;
      });
  }

  function fetchPaper(lv) {
    if (papers[lv]) return Promise.resolve(papers[lv]);
    return getJson(srcFor(lv)).then(function (data) { papers[lv] = data; return data; });
  }

  /* Doosra level (abhi do hi hain). Ginti isse zyada maangi jaye to
     bache hue sawal wahin se aate hain. */
  function otherLevel() {
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i] !== level) return LEVELS[i];
    return '';
  }

  /* Doosre level ki file tab uthao jab zaroorat ho: ?n= is level se bada ho,
     ya rakha hua attempt usse bana ho. Pehle wale me file na aaye to bas
     itne hi sawal milte hain; doosre me attempt adhoora dikhta, isliye error. */
  function wantMore() {
    var other = otherLevel();
    if (!other || papers[other]) return Promise.resolve();
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    if (saved && saved.more === other) return fetchPaper(other);
    var n = parseInt(new URLSearchParams(location.search).get('n'), 10);
    if (n > paper.questions.length) return fetchPaper(other).catch(function () {});
    return Promise.resolve();
  }

  /* Pehle n sawal: is level ke, phir (ho to) doosre level ke. */
  function questionsFor(n, mix) {
    var list = paper.questions;
    if (mix && papers[mix]) list = list.concat(papers[mix].questions);
    return list.slice(0, n);
  }

  /* "Easy" ya, mila hua ho to, "Easy + Medium". */
  function levelLabel() {
    var name = paper.levelName || 'Mixed';
    if (CUSTOM) return more && paper.moreName ? name + ' + ' + paper.moreName : name;
    return more && papers[more] ? name + ' + ' + (papers[more].levelName || more) : name;
  }

  /* "Set 2" ya custom me "Your own test"; "this set" / "this test". */
  function setTag() { return CUSTOM ? 'Your own test' : 'Set ' + String(paper.setNumber || 1); }
  function testName() { return CUSTOM ? 'Your own test' : 'Practice Test ' + (paper.setNumber || 1); }
  function thisSet() { return CUSTOM ? 'this test' : 'this set'; }
  function retake() { return CUSTOM ? 'build another test from the same sets' : 'take this set again'; }

  /* Kaun sa level kholna hai: pehle jo attempt is browser me rakha hai
     uska (taaki adhoora test wahin se chale), phir ?level=, phir default. */
  function chooseLevel() {
    if (!LEVELS.length) return '';
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    if (saved && LEVELS.indexOf(saved.level) > -1) return saved.level;
    var asked = new URLSearchParams(location.search).get('level');
    if (asked && LEVELS.indexOf(asked) > -1) return asked;
    return DEFAULT_LEVEL;
  }

  function load() {
    if (CUSTOM) { loadCustom(); return; }
    if (SET_ID) key = 'akq:' + SET_ID + ':v1';
    level = chooseLevel();
    fetchPaper(level)
      .then(function (data) {
        paper = data;
        if (!paper.setId) paper.setId = SET_ID;
        if (!key) key = 'akq:' + (data.setId || 'set') + ':v1';
        return wantMore();
      })
      .then(function () {
        if (root.getAttribute('data-mode') === 'review') { showReview(); return; }
        begin();
      })
      .catch(function (e) { broke(e); });
  }

  /* Start screen par level badalna */
  function switchLevel(next) {
    if (next === level || LEVELS.indexOf(next) < 0) return;
    fetchPaper(next)
      .then(function (data) {
        paper = data; level = next;
        return wantMore();
      })
      .then(function () {
        /* window.history likhna zaroori hai — is file me history() naam ka
           apna function hai jo seedhe likhne par isse dab jata. */
        try {
          var q = new URLSearchParams(location.search);
          q.set('level', next);
          window.history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
        } catch (e) {}
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
    var other = CUSTOM ? (cfg.more || '') : otherLevel();
    var pool = CUSTOM ? all + (other ? paper.extra.length : 0)
                      : all + (other && papers[other] ? papers[other].questions.length : 0);
    var q = new URLSearchParams(location.search);

    var n = parseInt(q.get('n'), 10);
    n = n ? clamp(n, 1, pool) : all;

    var lo = Math.ceil(n * SEC_MIN / 60);
    var hi = Math.min(MINUTES_CAP, Math.max(lo, Math.floor(n * SEC_MAX / 60)));
    var t = parseInt(q.get('t'), 10);
    t = t ? clamp(t, lo, hi) : clamp(Math.round(n * SEC_PER_Q / 60), lo, hi);

    return { n: n, minutes: t, more: n > all ? other : '' };
  }

  function begin() {
    if (new URLSearchParams(location.search).get('only') === 'wrong') { beginWrongOnly(); return; }

    var p = plan();
    more = p.more;
    Q = questionsFor(p.n, more);

    var old = read();
    if (old && (old.more || '') !== more) old = null;     /* alag mel ka attempt — ye wala nahi */
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
     Apna test — kai sets ke sawal ek test me (data-custom)

     Kaun se sets, kaun sa level, kitne sawal aur kitna waqt — ye sab
     build page link me bhejta hai. Sawal Begin dabane par random chune
     jate hain, aur unki list record me rakhi jati hai.
     --------------------------------------------------------- */
  function slug(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other'; }

  function shuffle(a) {
    var r = a.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }

  function fetchSet(sid, lv) {
    var k = sid + '|' + lv;
    if (cpapers[k]) return Promise.resolve(cpapers[k]);
    var url = (root.getAttribute('data-src') || '').replace('{set}', sid).replace('{level}', lv);
    return getJson(url).then(function (d) { cpapers[k] = d; return d; });
  }

  /* Link se mel. Galat ya adhoori ho to null — tab rakha hua attempt dekha jata hai. */
  function cfgFromUrl() {
    var q = new URLSearchParams(location.search);
    var raw = q.get('sets'), lv = q.get('lv');
    if (!raw || LEVELS.indexOf(lv) < 0) return null;
    var re = new RegExp('^' + AGE + '-set-[0-9]+$'), sets = [];
    raw.split(',').forEach(function (s) {
      s = s.trim();
      if (re.test(s) && sets.indexOf(s) < 0 && sets.length < 12) sets.push(s);
    });
    if (!sets.length) return null;
    var more = q.get('more');
    if (LEVELS.indexOf(more) < 0 || more === lv) more = '';
    return { sets: sets, level: lv, more: more,
             sig: sets.join(',') + '|' + lv + '|' + more + '|' + (q.get('n') || '') + '|' + (q.get('t') || '') };
  }

  function loadCustom() {
    key = 'akq:' + AGE + '-custom:v1';
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    if (!saved || !saved.custom || !Array.isArray(saved.custom.sets)) saved = null;

    var fromUrl = cfgFromUrl();
    cfg = fromUrl || (saved && { sets: saved.custom.sets, level: saved.custom.level,
                                 more: saved.custom.more || '', sig: saved.custom.sig });
    if (!cfg || LEVELS.indexOf(cfg.level) < 0) { noCustom(); return; }

    var jobs = [];
    cfg.sets.forEach(function (sid) {
      jobs.push(fetchSet(sid, cfg.level));
      if (cfg.more) jobs.push(fetchSet(sid, cfg.more));
    });
    Promise.all(jobs).then(function () {
      makeCustomPaper();
      level = cfg.level;
      if (root.getAttribute('data-mode') === 'review') { showReview(); return; }
      beginCustom(fromUrl);
    }).catch(function (e) { broke(e); });
  }

  /* Chune hue sets ki files ko ek "paper" me milao. Topic naam se milte hain
     (do sets ka "Poetry" ek hi topic), taaki result me ek hi row bane. */
  function makeCustomPaper() {
    var topics = {}, topicRead = {}, pool = [], extra = [], revs = [], names = [], first = null;

    function add(lv, into, plus) {
      cfg.sets.forEach(function (sid) {
        var p = cpapers[sid + '|' + lv];
        if (!first) first = p;
        if (!plus) names.push({ n: p.setNumber, name: p.setName });
        revs.push(sid + (plus ? '+' : ':') + lv + ':' + p.rev);
        p.questions.forEach(function (q, i) {
          var label = (p.topics && p.topics[q.topic]) || q.topic || 'Other';
          var tk = slug(label), c = {}, k;
          topics[tk] = label;
          if (!topicRead[tk] && p.topicRead && p.topicRead[q.topic]) topicRead[tk] = p.topicRead[q.topic];
          for (k in q) c[k] = q[k];
          c.topic = tk; c.ref = [sid, lv, i];
          into.push(c);
        });
      });
    }
    add(cfg.level, pool, false);
    if (cfg.more) add(cfg.more, extra, true);

    var moreFile = cfg.more ? cpapers[cfg.sets[0] + '|' + cfg.more] : null;
    paper = {
      setId: AGE + '-custom', rev: revs.join('|'),
      age: first.age, ageName: first.ageName, setNumber: 0, setName: 'Your own test',
      notes: first.notes, notesTitle: first.notesTitle,
      topics: topics, topicRead: topicRead,
      level: cfg.level, levelName: first.levelName, levelNote: '',
      moreName: moreFile ? (moreFile.levelName || cfg.more) : '',
      questions: pool, extra: extra, sets: names
    };
  }

  function pickCustom(n) {
    var main = shuffle(paper.questions), out = main.slice(0, n);
    if (n > main.length) out = out.concat(shuffle(paper.extra).slice(0, n - main.length));
    return shuffle(out);
  }

  /* Rakhe hue attempt ke sawal, ref ki list se. Koi ref na mile to null. */
  function questionsOfRecord(rec) {
    var idx = {};
    paper.questions.concat(paper.extra).forEach(function (q) { idx[q.ref.join('|')] = q; });
    var refs = (rec.custom && rec.custom.refs) || [];
    var out = refs.map(function (r) { return idx[r.join('|')]; }).filter(Boolean);
    return out.length === refs.length ? out : [];
  }

  function beginCustom(fromUrl) {
    if (!fromUrl && new URLSearchParams(location.search).get('only') === 'wrong') { beginWrongOnly(); return; }

    var rec = read();                                   /* rev aur level mile to hi */
    if (rec && fromUrl && (!rec.custom || rec.custom.sig !== fromUrl.sig)) rec = null;
    if (rec && rec.custom) {
      var qs = questionsOfRecord(rec);
      if (qs.length && qs.length === rec.count) {
        st = rec; Q = qs; more = rec.more || '';
        if (st.done) { showResult(); return; }
        if (st.endsAt > Date.now()) { runTest(); return; }
        closeExpired();                                 /* waqt khatam, page band tha */
        return;
      }
    }
    if (!fromUrl) { noCustom(); return; }

    var p = plan();
    more = p.more;
    Q = [];
    showStart(p);
  }

  /* Page band tha aur waqt khatam ho gaya: jo jawab diye, wahi jama. */
  function closeExpired() {
    st.done = true; st.ranOut = true; st.endedAt = st.endsAt;
    st.wrongCount = Q.reduce(function (n, q, i) {
      return n + (st.pick[i] !== undefined && st.pick[i] !== q.correct_option_id ? 1 : 0);
    }, 0);
    save();
    showResult();
  }

  function noCustom() {
    root.innerHTML =
      '<div class="cbt-start">' +
        '<h1>No custom test here yet</h1>' +
        '<p class="lede">Choose the sets, how many questions and how long on the build page, ' +
          'and your test will open here.</p>' +
        '<p><a class="btn" href="' + esc(root.getAttribute('data-new') || root.getAttribute('data-back') || '/quizzes/mcq/') +
          '">Build a test</a></p>' +
      '</div>';
  }

  /* Start screen: kin sets se bana, aur badalne ka rasta (wahi chunav bhar kar). */
  function customBlock() {
    var q = new URLSearchParams(location.search);
    var again = (root.getAttribute('data-new') || '') +
      (q.get('sets') ? '?' + q.toString() : '');
    var other = null;
    try { other = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    var busy = other && other.custom && !other.done && other.endsAt > Date.now() &&
               (!cfg || other.custom.sig !== cfg.sig);

    return '<div class="cbt-neg cbt-lvl cbt-custom">' +
      '<p class="lbl">Made from</p>' +
      '<ul class="cbt-madefrom">' +
        paper.sets.map(function (s) {
          return '<li>Set ' + esc(String(s.n)) + ' &middot; ' + esc(s.name) + '</li>';
        }).join('') +
      '</ul>' +
      '<p class="cbt-neghint">The questions are picked at random, so each test is different.' +
      (more && paper.moreName
        ? ' The ' + esc(paper.levelName || level) + ' questions in these sets come to ' + paper.questions.length +
          ', so the other ' + (plan().n - paper.questions.length) + ' come from the ' + esc(paper.moreName) + ' level.'
        : '') + '</p>' +
      (busy ? '<p class="cbt-neghint cbt-lvlmix">You have another custom test in progress. Beginning this one replaces it.</p>' : '') +
      (again ? '<p class="cbt-neghint"><a href="' + esc(again) + '">Change these choices</a></p>' : '') +
    '</div>';
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
    try { main = JSON.parse(localStorage.getItem(CUSTOM ? 'akq:' + AGE + '-custom:v1' : 'akq:' + paper.setId + ':v1') || 'null'); } catch (e) {}
    if (!validFor(main)) main = null;      /* purane sawalo ka record yahan kaam nahi aata */

    var wrong = [];
    more = (main && main.more) || '';
    if (main && main.done && main.pick) {
      (CUSTOM ? questionsOfRecord(main) : questionsFor(main.count || paper.questions.length, more)).forEach(function (q, i) {
        var p = main.pick[i];
        if (p !== undefined && p !== q.correct_option_id) wrong.push(q);
      });
    }

    if (!wrong.length) {
      root.innerHTML =
        '<div class="cbt-start">' +
          '<h1>Nothing to go back over</h1>' +
          '<p class="lede">You have no wrong answers saved for ' + thisSet() + ' on this device. ' +
          (CUSTOM ? 'Build a test first' : 'Take the set first') + ', and anything you get wrong will be waiting here.</p>' +
          '<p><a class="btn" href="' + esc(CUSTOM ? (root.getAttribute('data-new') || location.pathname) : location.pathname) +
            '">' + (CUSTOM ? 'Build a test' : 'Take the set') + '</a></p>' +
        '</div>';
      return;
    }

    Q = wrong;
    key = 'akqx:' + paper.setId + ':' + (paper.level || 'all') + (more ? '+' + more : '') + ':wrong:v1';
    var minutes = Math.max(1, Math.round(Q.length * SEC_PER_Q / 60));

    var old = read();
    if (old && !old.done && old.endsAt > Date.now() && old.count === Q.length) { st = old; runTest(); return; }

    root.innerHTML =
      '<div class="cbt-start">' +
        '<p class="eyebrow">' + esc(paper.ageName || '') + ' &middot; ' + esc(setTag()) + '</p>' +
        '<h1>The ' + Q.length + ' you got wrong</h1>' +
        '<p class="lede">Only the questions you missed last time, in the same test screen. ' +
          'Your score for the full ' + (CUSTOM ? 'test' : 'set') + ' stays as it was.</p>' +
        '<div class="cbt-facts">' +
          '<div class="cbt-fact"><b>' + Q.length + '</b><span>Questions</span></div>' +
          '<div class="cbt-fact"><b>' + minutes + ' min</b><span>Time</span></div>' +
          '<div class="cbt-fact"><b>' + esc(levelLabel()) + '</b><span>Level</span></div>' +
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
        '<p class="eyebrow">' + esc(paper.ageName || '') + ' &middot; ' + esc(setTag()) + '</p>' +
        '<h1>' + esc(paper.setName || 'Practice set') + '</h1>' +
        '<p class="lede">Read each question, pick one answer, and move on. ' +
          'You can go back to any question until you press Submit.</p>' +
        levelBlock() +
        '<div class="cbt-facts">' +
          '<div class="cbt-fact"><b>' + p.n + '</b><span>Questions</span></div>' +
          '<div class="cbt-fact"><b>' + p.minutes + ' min</b><span>Time</span></div>' +
          '<div class="cbt-fact"><b>' + esc(levelLabel()) + '</b><span>Level</span></div>' +
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
    $$('.cbt-lvlbtn').forEach(function (b) {
      b.addEventListener('click', function () { switchLevel(b.getAttribute('data-level')); });
    });

    $('#cbtBegin').addEventListener('click', function () {
      if (CUSTOM) Q = pickCustom(p.n);
      st = { pick: {}, marked: {}, seen: {}, spent: {}, at: 0, done: false, count: Q.length,
             neg: negRate, startedAt: Date.now(), endsAt: Date.now() + p.minutes * 60000 };
      if (CUSTOM) {
        st.custom = { sig: cfg.sig, sets: cfg.sets, level: cfg.level, more: more,
                      refs: Q.map(function (q) { return q.ref; }) };
      }
      save();
      runTest();
    });
  }

  /* Level ka chunav: sirf tab dikhta hai jab ek se zyada level likhe hon.
     Naam page ke data-levels se aate hain, samjhane wali line chune hue
     level ki file se (paper.levelNote). */
  function levelBlock() {
    if (CUSTOM) return customBlock();
    if (LEVELS.length < 2) return '';
    return '<div class="cbt-neg cbt-lvl">' +
      '<p class="lbl" id="cbtLvlLbl">Level</p>' +
      '<div class="cbt-negrow" role="group" aria-labelledby="cbtLvlLbl">' +
        LEVELS.map(function (lv) {
          return '<button type="button" class="cbt-lvlbtn" data-level="' + esc(lv) + '" aria-pressed="' +
            (lv === level) + '">' + esc(lv.charAt(0).toUpperCase() + lv.slice(1)) + '</button>';
        }).join('') +
      '</div>' +
      (paper.levelNote ? '<p class="cbt-neghint">' + esc(paper.levelNote) + '</p>' : '') +
      (more && papers[more]
        ? '<p class="cbt-neghint cbt-lvlmix">One level holds ' + paper.questions.length + ' questions. ' +
          'The first ' + paper.questions.length + ' here are ' + esc(paper.levelName || level) +
          '; the other ' + (Q.length - paper.questions.length) + ' come from the ' +
          esc(papers[more].levelName || more) + ' level.</p>'
        : '') +
    '</div>';
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
          '<span>' + esc(paper.ageName || '') + ' &middot; ' + esc(setTag()) +
          ' &middot; ' + esc(levelLabel()) + '</span>' +
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

    /* Page ka apna header hi badal dete hain — do header nahi. */
    setHead('Your Final Score Board',
      (paper.ageName || '') + ' — ' + testName(),
      'You have completed the test. Here is your detailed performance analysis.');

    root.innerHTML =
      cheerRow(t) + streakStrip() + topicRow(t) + analysisRow(t) +
      actionRow() + journeyRow(t) + levelCard() + suggestRow(t);

    wireResult(t);
  }

  /* Pagehead ke teen text badal do (start, test aur result ke liye alag). */
  function setHead(title, eyebrow, lede) {
    var h = $('#cbtTitle'), e = $('#cbtEyebrow'), l = $('#cbtLede');
    if (h) h.textContent = title;
    if (e) e.textContent = eyebrow;
    if (l) l.textContent = lede;
  }

  /* ---------------------------------------------------------
     Sab ginti ek jagah
     --------------------------------------------------------- */
  function tally() {
    var right = 0, wrong = 0, skipped = 0, byTopic = {};

    Q.forEach(function (q, i) {
      var k = q.topic || 'other';
      var o = byTopic[k] || (byTopic[k] = { key: k, right: 0, total: 0,
        read: (paper.topicRead && paper.topicRead[k]) || q.read });
      o.total++;
      if (st.pick[i] === undefined) skipped++;
      else if (st.pick[i] === q.correct_option_id) { right++; o.right++; }
      else wrong++;
    });

    var neg = st.neg || 0;
    var net = Math.max(0, right - wrong * neg);

    return {
      right: right, wrong: wrong, skipped: skipped,
      answered: right + wrong,
      acc: (right + wrong) ? Math.round(right / (right + wrong) * 100) : 0,
      neg: neg, lost: +(wrong * neg).toFixed(2), net: +net.toFixed(2),
      pc: Math.round(net / Q.length * 100),
      topics: Object.keys(byTopic).map(function (k) {
        var o = byTopic[k];
        o.pc = Math.round(o.right / o.total * 100);
        o.name = (paper.topics && paper.topics[k]) || k;
        return o;
      }).sort(function (a, b) { return a.pc - b.pc || b.total - a.total; })
    };
  }

  /* ---------- 1. sabse upar, saada: teen pankti, koi tasveer nahi ---------- */
  function pageHead() {
    /* Patti hai, par iske peeche koi tasveer nahi — abhi ke liye saada. */
    return '<header class="cbt-head">' +
      '<span class="cbt-headmark" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" ' +
        'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M9 11.5l2.2 2.2L16 9"/><rect x="4" y="3.5" width="16" height="17" rx="2.5"/></svg>' +
      '</span>' +
      '<div class="cbt-headtxt">' +
        '<h1>Your Final Score Board</h1>' +
        '<h2>' + esc(paper.ageName || '') + ' — ' + esc(testName()) + '</h2>' +
        '<h3>You have completed the test. Here is your detailed performance analysis.</h3>' +
      '</div>' +
    '</header>';
  }

  /* ---------- 2. jashn ka card, aur bagal me dono pattiyan ---------- */
  function cheerRow(t) {
    var g = grade(t.pc);
    var score = t.neg ? t.net + '/' + Q.length : t.right + '/' + Q.length;
    var used = (st.startedAt && st.endedAt)
      ? Math.max(1, Math.round((st.endedAt - st.startedAt) / 1000)) : 0;
    var allowed = (st.endsAt && st.startedAt)
      ? Math.round((st.endsAt - st.startedAt) / 1000) : 0;

    return '<div class="cbt-top">' +
      '<section class="cbt-cheer ' + g.cls + '" aria-label="Your score">' +
        '<div class="cbt-cheertop">' +
          /* Yahan aapki tasveer aayegi. Tab tak jagah khali hai, par gol
             jitni oonchi — taaki tasveer lagte hi naap theek baithe.
             Image aane par bas is span ke andar <img> daal dein. */
          '<span class="cbt-cup" aria-hidden="true">' +
            '<img src="/assets/trophy.webp" alt="" width="420" height="293">' +
          '</span>' +
          '<div class="cbt-ringwrap">' +
            '<svg class="cbt-ring" viewBox="0 0 120 120" aria-hidden="true">' +
              '<circle class="track" cx="60" cy="60" r="52"></circle>' +
              '<circle class="fill" cx="60" cy="60" r="52"></circle>' +
            '</svg>' +
            '<p class="cbt-ringtxt"><em>Your score</em><b' +
              (score.length > 6 ? ' class="is-long"' : '') + '>' + score +
              '</b><span>' + t.pc + '%</span></p>' +
          '</div>' +
        '</div>' +
        '<p class="cbt-who">' + esc(whoAmI()) + '</p>' +
        '<p class="cbt-badge">' + g.name + '</p>' +
        '<p class="cbt-cheermsg">' + g.line + '</p>' +
        (t.neg ? '<p class="cbt-negnote">' + t.right + ' right, less ' + t.lost +
          ' for ' + t.wrong + ' wrong at −' + t.neg + ' each.</p>' : '') +
        /* history() attempt ko ek hi baar darj karta hai, isliye yahan aur
           neeche dono jagah bulana surakshit hai. */
        history(t.right).banner +
      '</section>' +

      '<div class="cbt-stats">' +
        '<section class="cbt-nums" aria-label="How the paper went">' +
          numCell('ok', ic('<circle cx="12" cy="12" r="9"/><path d="m8.4 12.2 2.5 2.5 4.7-4.9"/>'),
            t.right, 'Correct') +
          numCell('no', ic('<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>'),
            t.wrong, 'Incorrect') +
          numCell('is-skip', ic('<circle cx="12" cy="12" r="9"/><path d="M8.5 12h7"/>'),
            t.skipped, 'Unanswered') +
          numCell('is-time', ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.3 2"/>'),
            (used ? clock(used) : '—'), 'Time taken',
            allowed ? 'out of ' + clock(allowed) : '') +
        '</section>' +
        '<section class="cbt-nums cbt-nums3" aria-label="Accuracy, level and standing">' +
          numCell('is-acc', ic('<path d="M4 19V9M10 19V5M16 19v-6M3 20h18"/>'),
            t.acc + '%', 'Your accuracy', 'of the ' + t.answered + ' you answered',
            '<span class="cbt-meter"><i style="width:' + t.acc + '%"></i></span>') +
          numCell('is-diff', ic('<path d="M5 20v-5M12 20V8M19 20v-9M3 20h18"/>'),
            esc(levelLabel()), 'Difficulty level',
            Q.length + ' questions in this test') +
          numCell('is-locked', lockIcon(), 'Locked', 'Percentile · you vs others',
            '<a href="/login/">Needs a student account</a>') +
        '</section>' +
      '</div>' +
    '</div>';
  }

  /* Login abhi nahi hai. Jis din hoga, wo naam yahan rakhega; tab tak
     har koi Guest User hai — koi naam gada nahi ja raha. */
  function whoAmI() {
    var name = '';
    try { name = (window.AK && window.AK.user && window.AK.user.name) || ''; } catch (e) {}
    return name || 'Guest User';
  }

  /* Ginti wala ek dabba: bagal me nishaan, phir badi ginti aur uska naam. */
  function numCell(cls, icon, big, label, note, extra) {
    return '<div class="cbt-num ' + cls + '">' +
      '<span class="cbt-numic" aria-hidden="true">' + icon + '</span>' +
      '<span class="cbt-numtxt">' +
        '<b>' + big + '</b><span>' + label + '</span>' +
        (note ? '<em>' + note + '</em>' : '') +
        (extra || '') +
      '</span>' +
    '</div>';
  }

  function ic(path) {
    return '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }

  function lockIcon() {
    return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round" aria-hidden="true" class="cbt-lockico">' +
      '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/>' +
      '<path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/></svg>';
  }

  /* ---------- 3. topic ka poora hisaab (band) | majboot aur kamzor (khula) ---------- */
  function topicRow(t) {
    if (t.topics.length < 2) return '';

    var rows = t.topics.map(function (o) {
      var tone = o.pc >= 80 ? 'ok' : o.pc >= 55 ? 'mid' : 'low';
      return '<tr><td>' + esc(o.name) + '</td>' +
        '<td class="num">' + o.right + ' / ' + o.total + '</td>' +
        '<td><span class="cbt-tbar"><i class="' + tone + '" style="width:' + o.pc + '%"></i></span></td>' +
        '<td class="num ' + tone + '">' + o.pc + '%</td></tr>';
    }).join('');

    /* Table asli aankdo ki hai, par dhundhli. Screen reader ise nahi padhta —
       uske liye niche wala saaf sandesh hi kaafi hai. */
    return '<div class="cbt-two cbt-two-wide">' +
      '<section class="cbt-card cbt-topics is-locked" aria-label="Topic by topic, locked">' +
        '<h2>' + lockIcon() + 'Topic-wise performance</h2>' +
        '<p class="sub">Every question is tagged by topic. The full breakdown opens with a student account.</p>' +
        '<div class="cbt-blur" aria-hidden="true">' +
          '<table class="cbt-ttable"><thead><tr>' +
            '<th scope="col">Topic</th><th scope="col">Correct / Total</th>' +
            '<th scope="col">How it went</th><th scope="col">Accuracy</th>' +
          '</tr></thead><tbody>' + rows + '</tbody></table>' +
        '</div>' +
        '<div class="cbt-lockbox">' +
          '<p><b>' + t.topics.length + ' topics measured on this paper.</b> ' +
            'See exactly where every mark went, and how each topic moves across every test you take.</p>' +
          '<a class="cbt-begin" href="/login/">Student accounts — coming soon</a>' +
        '</div>' +
      '</section>' +
      strongWeak(t) +
    '</div>';
  }

  /* ---------------------------------------------------------
     3. Kya dikhega "Your strengths" aur "Areas to improve" me

     Niyam ek hi hai, aur har naapa hua topic kahin na kahin jata hai:
       tin ya zyada sawal + 70% ya upar  -> strengths
       tin ya zyada sawal + 70% se neeche -> areas
       tin se kam sawal                   -> kisi me nahi, alag likha
     Har pankti me teen cheezein: naam, ginti (7 of 8), aur wahi patli
     patti jo topic table me hai. Isliye dono box kabhi khali nahi dikhte.
     --------------------------------------------------------- */
  function strongWeak(t) {
    var measured = t.topics.filter(function (o) { return o.total >= 3; });
    var thin     = t.topics.filter(function (o) { return o.total < 3; });
    var solid = measured.filter(function (o) { return o.pc >= 70; })
      .sort(function (a, b) { return b.pc - a.pc; });
    var weak  = measured.filter(function (o) { return o.pc < 70; })
      .sort(function (a, b) { return a.pc - b.pc; });

    var li = function (o, tone) {
      return '<li class="' + tone + '">' +
        '<span class="cbt-liTop">' +
          '<a href="' + esc(paper.notes || '/notes/') + '#' + esc(o.read || '') + '">' +
            esc(o.name) + '</a>' +
          '<em>' + o.right + ' of ' + o.total + '</em>' +
          '<b>' + o.pc + '%</b>' +
        '</span>' +
        '<span class="cbt-tbar"><i class="' + tone + '" style="width:' + o.pc + '%"></i></span>' +
      '</li>';
    };

    return '<div class="cbt-sw">' +
      '<section class="cbt-card">' +
        '<h2><span class="cbt-ic ok" aria-hidden="true">✓</span>Your strengths</h2>' +
        (solid.length
          ? '<ul class="cbt-list">' + solid.map(function (o) { return li(o, 'ok'); }).join('') + '</ul>'
          : '<p class="sub">No topic reached seventy per cent on this paper. Everything measured is in the box below.</p>') +
      '</section>' +
      '<section class="cbt-card">' +
        '<h2><span class="cbt-ic low" aria-hidden="true">!</span>Areas to improve</h2>' +
        (weak.length
          ? '<ul class="cbt-list">' + weak.map(function (o) { return li(o, 'low'); }).join('') + '</ul>'
          : '<p class="sub">Every measured topic cleared seventy per cent. Keep it that way.</p>') +
        (thin.length ? '<p class="cbt-thin">Too few questions to judge: ' + thin.map(function (o) {
            return esc(o.name) + ' (' + o.right + '/' + o.total + ')'; }).join(', ') + '.</p>' : '') +
      '</section>' +
    '</div>';
  }

  /* ---------- 4. gol hisaab | sawal ki patti ---------- */
  function analysisRow(t) {
    var C = 2 * Math.PI * 42;
    var seg = function (n, from, cls) {
      var len = n / Q.length * C;
      return '<circle class="' + cls + '" cx="60" cy="60" r="42" stroke-dasharray="' +
        len.toFixed(1) + ' ' + (C - len).toFixed(1) + '" stroke-dashoffset="' +
        (-from / Q.length * C).toFixed(1) + '"></circle>';
    };
    var pct = function (n) { return Math.round(n / Q.length * 100); };

    var grid = Q.map(function (q, i) {
      var state = st.pick[i] === undefined ? 'skip'
        : st.pick[i] === q.correct_option_id ? 'right' : 'wrong';
      return '<button type="button" class="cbt-qcell q-' + state + '" data-go="' + i + '" ' +
        'aria-label="Question ' + (i + 1) + ', ' + state + '">' + (i + 1) + '</button>';
    }).join('');

    return '<div class="cbt-two cbt-two-an">' +
      '<section class="cbt-card">' +
        '<h2>Question analysis</h2>' +
        '<div class="cbt-anrow cbt-anside">' +
          '<div class="cbt-donutwrap cbt-donutbig">' +
            '<svg class="cbt-donut" viewBox="0 0 120 120" aria-hidden="true">' +
              seg(t.right, 0, 'd-ok') + seg(t.wrong, t.right, 'd-no') +
              seg(t.skipped, t.right + t.wrong, 'd-skip') +
            '</svg>' +
            '<p class="cbt-donuttxt"><b>' + Q.length + '</b><span>Questions</span></p>' +
          '</div>' +
          '<ul class="cbt-key">' +
            '<li><i class="k-ok"></i>' + t.right + ' correct (' + pct(t.right) + '%)</li>' +
            '<li><i class="k-no"></i>' + t.wrong + ' incorrect (' + pct(t.wrong) + '%)</li>' +
            '<li><i class="k-skip"></i>' + t.skipped + ' unanswered (' + pct(t.skipped) + '%)</li>' +
          '</ul>' +
        '</div>' +
      '</section>' +
      '<section class="cbt-card">' +
        '<h2>Question-wise summary</h2>' +
        '<p class="sub">Tap a number to read that one.</p>' +
        '<div class="cbt-qgrid">' + grid + '</div>' +
      '</section>' +
    '</div>';
  }

  /* ---------- 5. paanch button ----------
     Review ab isi page par nahi khulta — uske liye apna page hai,
     taaki score board yahin khatam ho jaye. */
  function actionRow() {
    var rev = (location.pathname.replace(/\/+$/, '') + '/review/');
    return '<div class="cbt-after">' +
      '<a class="cbt-btn is-lead" href="' + esc(rev) + '">Review all questions</a>' +
      '<a class="cbt-btn" href="' + esc(rev) + '?only=wrong">Review incorrect only</a>' +
      '<button type="button" class="cbt-btn" id="cbtPrint">Download result (PDF)</button>' +
      '<button type="button" class="cbt-btn" id="cbtAgain">Take a new test</button>' +
      '<a class="cbt-btn is-gold" href="' + esc(root.getAttribute('data-back') || '/quizzes/mcq/') +
        '">Back to ' + esc(paper.ageName || 'the age') + '</a>' +
    '</div>';
  }

  /* ---------- 6. aage ka rasta: ek patli patti, sifar se sau tak ---------- */
  function journeyRow(t) {
    var at = Math.max(0, Math.min(100, t.pc));
    var marks = [
      { pc: 30, label: 'Getting started' },
      { pc: 50, label: 'Good effort' },
      { pc: 75, label: 'Strong ground' },
      { pc: 90, label: 'Exam ready' }
    ];
    var next = marks.filter(function (m) { return m.pc > at; })[0];

    return '<section class="cbt-card cbt-journey">' +
      '<div class="cbt-jhead">' +
        '<div>' +
          '<h2>Your journey through ' + esc(paper.ageName || 'this age') + '</h2>' +
          '<p class="sub">Where this paper puts you on the scale for ' + thisSet() + '.</p>' +
        '</div>' +
        '<p class="cbt-jnow"><b>' + at + '%</b>' +
          '<span>' + (next ? (next.pc - at) + ' more to reach ' + esc(next.label).toLowerCase()
                            : 'the top of the scale') + '</span></p>' +
      '</div>' +
      '<div class="cbt-track">' +
        '<span class="cbt-trackfill" style="width:' + at + '%"></span>' +
        marks.map(function (m) {
          return '<span class="cbt-tick' + (at >= m.pc ? ' is-past' : '') + '" style="left:' + m.pc + '%">' +
            '<i></i><b>' + m.pc + '%</b><em>' + esc(m.label) + '</em></span>';
        }).join('') +
        '<span class="cbt-you" style="left:' + at + '%"><i></i></span>' +
      '</div>' +
      '<p class="cbt-scale"><span>0%</span><span>100%</span></p>' +
    '</section>';
  }

  /* ---------------------------------------------------------
     7. English literature me darja — poore page par, aur band

     Ye ginti sach me ek hi khaate ki ho sakti hai. Ek browser ka
     hisaab phone aur laptop ke beech toot jata hai, isliye yahan
     koi aankda bhara nahi gaya — sirf khaane bane hain aur unke
     naam, taaki khaata chalu hote hi bhar jaayein.
     --------------------------------------------------------- */
  /* Paanch darje, pehle se aakhri tak. Har agle darje par ek sitara
     zyada — isliye Beginner ek, Master paanch. */
  /* Naam LADDER hai, LEVELS nahi: LEVELS ab page ke Easy/Medium hain. */
  var LADDER = ['Beginner', 'Reader', 'Scholar', 'Critic', 'Master'];

  function stars(n) {
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += '<svg class="' + (i <= n ? 'on' : '') + '" viewBox="0 0 24 24" width="13" height="13" ' +
        'fill="currentColor" aria-hidden="true"><path d="m12 2.6 2.9 6.2 6.6.8-4.9 4.6 1.3 6.7L12 17.6 ' +
        '6.1 20.9l1.3-6.7L2.5 9.6l6.6-.8Z"/></svg>';
    }
    return '<span class="cbt-stars">' + out + '</span>';
  }

  function levelCard() {
    var cells = [
      ['Tests taken', 'across every age'],
      ['Questions answered', 'all sets together'],
      ['Answered wrongly', 'waiting to be fixed'],
      ['Left unanswered', 'never attempted'],
      ['Your level', 'in English literature']
    ];

    return '<section class="cbt-card cbt-level is-locked" aria-label="Your level, locked">' +
      '<div class="cbt-levelhead">' +
        '<div>' +
          '<h2>' + lockIcon() + 'Your level in English literature</h2>' +
          '<p class="sub">Everything you have done, in one line — kept with your account, not with this browser.</p>' +
        '</div>' +
        '<a class="cbt-streaklink" href="/login/">Coming with student accounts</a>' +
      '</div>' +
      '<div class="cbt-levelrow">' +
        cells.map(function (c) {
          return '<div class="cbt-levelcell"><b>—</b><span>' + c[0] + '</span><em>' + c[1] + '</em></div>';
        }).join('') +
      '</div>' +
      '<ol class="cbt-ladder">' +
        LADDER.map(function (n, i) {
          return '<li><i></i><b>' + n + '</b>' + stars(i + 1) + '</li>';
        }).join('') +
      '</ol>' +
    '</section>';
  }

  /* ---------------------------------------------------------
     8. Aage kya padhein, aage kya karein — ek patli patti, do dabbe
     --------------------------------------------------------- */
  function suggestRow(t) {
    var weak = t.topics.filter(function (o) { return o.total >= 3 && o.pc < 70; })
      .sort(function (a, b) { return a.pc - b.pc; }).slice(0, 3);
    var pick = weak.length ? weak : t.topics.slice(0, 3);

    return '<div class="cbt-two cbt-suggest">' +
      '<section class="cbt-card">' +
        '<h2>Suggested reading</h2>' +
        '<ul class="cbt-sug">' +
          pick.map(function (o) {
            return '<li><a href="' + esc(paper.notes || '/notes/') + '#' + esc(o.read || '') + '">' +
              esc(o.name) + '</a><span>' + o.right + ' of ' + o.total + ' here</span></li>';
          }).join('') +
          '<li><a href="' + esc(paper.notes || '/notes/') + '#quick-revision-50-points">' +
            'Quick revision — 50 points</a><span>the whole age on one screen</span></li>' +
        '</ul>' +
      '</section>' +
      '<section class="cbt-card">' +
        '<h2>Where to go next</h2>' +
        '<ul class="cbt-sug">' +
          '<li><a href="' + esc(paper.notes || '/notes/') + '">' +
            esc(paper.ageName || 'This age') + ' — the full notes</a><span>the reading behind this age</span></li>' +
          '<li><a href="' + esc(root.getAttribute('data-back') || '/quizzes/mcq/') + '">' +
            'More sets in ' + esc(paper.ageName || 'this age') + '</a><span>six in all, opening one by one</span></li>' +
          '<li><a href="/quizzes/mcq/">Every age</a><span>Old English to the present day</span></li>' +
        '</ul>' +
      '</section>' +
    '</div>';
  }

  /* ---------------------------------------------------------
     11. Roz ki laga-taar — abhi band

     Ye sach me kaam tabhi karega jab khaata hoga: ek hi browser ki
     ginti phone aur laptop ke beech toot jati hai. Isliye yahan koi
     ginti dikhane ke bajay saaf likha hai ke ye kiske saath aayega.
     --------------------------------------------------------- */
  function streakStrip() {
    var days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return '<section class="cbt-card cbt-streak" aria-label="Daily streak, locked">' +
      '<div class="cbt-streakhead">' +
        '<h2>' + lockIcon() + 'Your daily streak</h2>' +
        '<a class="cbt-streaklink" href="/login/">Coming with student accounts</a>' +
      '</div>' +
      '<div class="cbt-streakrow">' +
        '<div class="cbt-streaknum"><b>—</b><span>Days in a row</span></div>' +
        '<div class="cbt-streaknum"><b>—</b><span>Days this week</span></div>' +
        '<div class="cbt-streakweek" aria-hidden="true">' +
          days.map(function (d) { return '<i>' + d + '</i>'; }).join('') +
        '</div>' +
        '<div class="cbt-streaknum"><b>—</b><span>Level across all ages</span></div>' +
      '</div>' +
    '</section>';
  }

  /* ---------------------------------------------------------
     Paanch darje
     Naam aur lines sirf yahan hain — badalna ho to bas yahi
     paanch panktiyan badalni hain, aur kahin kuch nahi.
     Rang CSS me hain: .cbt-score.b1 se .b5 tak.
     --------------------------------------------------------- */
  function grade(pc) {
    if (pc >= 90) return { cls: 'b5', name: 'Outstanding! You nailed it!',
      line: 'You are awesome. Almost nothing on this paper got past you. Keep it warm with a short run every week, and move on to the next age.' };
    if (pc >= 75) return { cls: 'b4', name: 'Bravo! You did a great job.',
      line: 'A strong paper. Close the few gaps below and this age is as good as finished.' };
    if (pc >= 50) return { cls: 'b3', name: "Good effort. You're getting there!",
      line: 'You know this age. What is left is the fine print — the dates, the manuscripts, who signed what.' };
    if (pc >= 30) return { cls: 'b2', name: 'Needs hard work!',
      line: 'The shape of the age is there, but not the detail. Read the notes through once, then ' + retake() + ' — detail is the easiest thing to fix.' };
    return { cls: 'b1', name: 'Very bad — but only for today.',
      line: 'Almost everyone’s first run on a hard set looks like this. Do it in order: read the full notes, then the fifty quick-revision points, then ' + retake() + '. Nobody learns an age by taking tests on it; the tests only show what the reading left behind.' };
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
    if (key.indexOf('akqx:') === 0 || CUSTOM) return { banner: '', chart: '' };

    /* Easy aur Medium ke score ek chart me milte to "pichhli baar se behtar"
       jhooth bolta. Har level ki apni list, aur rev badalne par nayi. */
    var hkey = 'akqh:' + paper.setId + ':' + (paper.level || 'all') + (more ? '+' + more : '') + ':r' + (paper.rev || 1);
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
      out.push('The clock ran out before you finished. Try ' + (CUSTOM ? 'another test' : 'the same set again') + ' and watch where the ' +
        'time goes &mdash; most of it usually goes on two or three questions.');
    }
    var marked = Object.keys(st.marked).filter(function (i) { return st.pick[i] === undefined; }).length;
    if (marked) {
      out.push('<b>' + marked + '</b> question' + (marked === 1 ? ' you marked for review was' : 's you marked for review were') +
        ' never answered. Marking helps only if you leave time at the end to come back.');
    }
    if (!out.length) {
      out.push('Every question answered, and a clean paper. Come back to ' + thisSet() + ' in a week ' +
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

    /* Ginti wali patti se seedha us sawal ke review par, agle page par. */
    var grid = $('.cbt-qgrid');
    if (grid) {
      grid.addEventListener('click', function (e) {
        var cell = e.target.closest('[data-go]');
        if (!cell) return;
        location.href = location.pathname.replace(/\/+$/, '') + '/review/#q' +
          (+cell.getAttribute('data-go') + 1);
      });
    }

    var pr = $('#cbtPrint');
    if (pr) pr.addEventListener('click', function () { window.print(); });

    var again = $('#cbtAgain');
    if (again) {
      again.addEventListener('click', function () {
        try { localStorage.removeItem(key); } catch (e) {}
        location.href = CUSTOM ? (root.getAttribute('data-new') || root.getAttribute('data-back') || '/quizzes/mcq/')
                               : location.pathname;
      });
    }
  }

  /* ---------------------------------------------------------
     Review ka apna page

     Score board wahin khatam ho jata hai. Ye page wahi attempt
     padhta hai jo browser me rakha hai, aur saare sawal dikhata hai.
     ?only=wrong ke saath seedha galat waalo par khulta hai.
     --------------------------------------------------------- */
  function showReview() {
    var done = read();
    if (!done || !done.done || !done.pick) {
      root.innerHTML =
        '<div class="cbt-start">' +
          '<h1>Nothing to review yet</h1>' +
          '<p class="lede">This page shows the answers from your last ' + (CUSTOM ? 'custom test' : 'run at this set') + ', ' +
            'and there is no finished run saved in this browser.</p>' +
          '<p><a class="btn" href="' + esc(CUSTOM ? (root.getAttribute('data-new') || root.getAttribute('data-back') || '/quizzes/mcq/')
                                                 : (root.getAttribute('data-back') || '/quizzes/mcq/')) +
            '">' + (CUSTOM ? 'Build a test' : 'Take the set first') + '</a></p>' +
        '</div>';
      return;
    }

    st = done;
    more = st.more || '';
    Q = CUSTOM ? questionsOfRecord(st) : questionsFor(st.count || paper.questions.length, more);

    var right = 0, wrong = 0, skipped = 0;
    Q.forEach(function (q, i) {
      if (st.pick[i] === undefined) skipped++;
      else if (st.pick[i] === q.correct_option_id) right++;
      else wrong++;
    });

    var want = new URLSearchParams(location.search).get('only') === 'wrong' ? 'wrong' : 'all';
    setHead(want === 'wrong' ? 'The ones you got wrong' : 'Review your answers',
      (paper.ageName || '') + ' — ' + testName(),
      want === 'wrong'
        ? 'Only the questions that went the wrong way, with the reason behind each right answer.'
        : 'Every question from ' + thisSet() + ', with your answer beside the right one.');

    root.innerHTML =
      '<div class="cbt-revtop">' +
        '<p class="cbt-revscore"><b>' + right + '/' + Q.length + '</b>' +
          '<span>' + right + ' right · ' + wrong + ' wrong · ' + skipped + ' unanswered</span></p>' +
        '<div class="cbt-revacts">' +
          (wrong ? '<button type="button" class="cbt-btn is-lead" id="cbtCards">Take them one at a time</button>' : '') +
          '<a class="cbt-btn" href="' + esc(root.getAttribute('data-back') || '/quizzes/mcq/') +
            '">Back to the score board</a>' +
        '</div>' +
      '</div>' +

      '<div class="cbt-filters" role="group" aria-label="Which questions to show">' +
        '<button type="button" class="cbt-filter" data-show="all" aria-pressed="' +
          (want === 'all') + '">All ' + Q.length + '</button>' +
        '<button type="button" class="cbt-filter" data-show="wrong" aria-pressed="' +
          (want === 'wrong') + '">Incorrect ' + wrong + '</button>' +
        '<button type="button" class="cbt-filter" data-show="skip" aria-pressed="false">' +
          'Unanswered ' + skipped + '</button>' +
        '<button type="button" class="cbt-filter" data-show="right" aria-pressed="false">' +
          'Correct ' + right + '</button>' +
      '</div>' +

      '<div id="cbtReview">' + Q.map(card).join('') + '</div>';

    function apply(show) {
      $$('.cbt-filter').forEach(function (o) {
        o.setAttribute('aria-pressed', o.getAttribute('data-show') === show ? 'true' : 'false');
      });
      $$('#cbtReview .cbt-review').forEach(function (c) {
        c.classList.toggle('is-hidden', show !== 'all' && c.getAttribute('data-state') !== show);
      });
    }

    $$('.cbt-filter').forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-show')); });
    });
    apply(want);

    var cards = $('#cbtCards');
    if (cards) {
      var wrongIdx = Q.map(function (q, i) { return i; }).filter(function (i) {
        return st.pick[i] !== undefined && st.pick[i] !== Q[i].correct_option_id;
      });
      cards.addEventListener('click', function () { flashcards(wrongIdx); });
    }

    /* Score board ki ginti se seedha #q17 par aaye hain to wahin le jao. */
    var m = /^#q(\d+)$/.exec(location.hash);
    if (m) {
      var el = $$('#cbtReview .cbt-review')[+m[1] - 1];
      if (el) {
        el.scrollIntoView({ block: 'center' });
        el.classList.add('is-lit');
      }
    }
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

    function leave() {
      root.innerHTML = back;
      /* Score board par ring aur ginti dobara jodni padti hai; review
         page par wo hai hi nahi, isliye wahan page naye sire se bana lo. */
      if (root.getAttribute('data-mode') === 'review') showReview();
      else wireResult(tally());
      window.scrollTo(0, 0);
    }

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

    return '<article class="cbt-review" id="q' + (i + 1) + '" data-state="' + state + '">' +
      '<div class="cbt-rtop"><span class="cbt-qnum">Question ' + (i + 1) + '</span>' + tag +
        (q.topic && paper.topics ? '<span class="cbt-rtopic">' +
          esc(paper.topics[q.topic] || '') + '</span>' : '') + '</div>' +
      '<p class="cbt-rq">' + esc(q.question) + '</p>' + opts +
      (q.explanation ? '<p class="cbt-why"><b>Why:</b> ' + esc(q.explanation) +
        (q.read ? ' <a href="' + esc(paper.notes || '/notes/') + '#' + esc(q.read) +
          '">Read this part \u2192</a>' : '') + '</p>' : '') +
      '</article>';
  }

  /* --------------------------------------------------------- */
  function save() {
    st.setId = paper.setId;
    st.count = Q.length;
    st.level = paper.level;
    st.rev = paper.rev;
    st.more = more;
    try { localStorage.setItem(key, JSON.stringify(st)); } catch (e) {}
  }

  /* Ye attempt isi file ka hai? Level aur rev dono milne chahiye. Purane
     attempt (jab sawal kuch aur the) me ye nahi hote, isliye wo bekar. */
  function validFor(d) {
    if (!d || typeof d !== 'object') return false;
    if (paper && paper.rev != null && d.rev !== paper.rev) return false;
    if (paper && paper.level && d.level !== paper.level) return false;
    return true;
  }

  function read() {
    try {
      var raw = localStorage.getItem(key);
      var d = raw ? JSON.parse(raw) : null;
      if (!validFor(d)) return null;
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
