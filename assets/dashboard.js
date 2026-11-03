/* ==========================================================
   AK Explained — dashboard (v1)
   Runs only on /dashboard/. Needs a logged-in user.
   ----------------------------------------------------------
   READ-ONLY. It shows only what public.attempts can honestly
   support today: totals, recent activity, a breakdown by period
   and by topic, and the paths the user picked. It does NOT show
   mastery or levels, decay, a suggested next step, knowledge or
   exam-readiness meters, or exam-wise progress: that computation
   does not exist yet (and exam_topics has no rows). Do not
   approximate any of it here.

   HOW TO ADD A SECTION LATER
   Call addSection({ id, order, title, needs, render }) below.
     id      short unique name
     order   number; sections are shown from low to high
     title   the card heading (simple English)
     needs   'attempts' = shown only when the user has answers
                          (a new user sees the empty state instead)
             ''         = always tried (it may still return '')
     render  function (ctx) -> an HTML string, or '' to hide the card.
   ctx holds what was loaded once: ctx.rows (the attempts), ctx.stats
   (totals and groups worked out from them), ctx.names (topic names
   by id), ctx.exams, ctx.now. A section that throws is skipped; the
   other sections still show.

   KNOWN v1 LIMIT (also in docs/accounts-status.md): every attempt row
   of the user is loaded into the browser (4 small columns, newest
   first, 1,000 per request, at most MAX_ROWS). The fix is a grouped
   view or RPC on the server; it is planned with the mastery work.
   ========================================================== */
(function () {
  'use strict';

  var PAGE = 1000;                 // rows asked for per request
  var MAX_ROWS = 10000;            // safety cap for v1 (see the limit above)
  var TOP_TOPICS = 8;              // topic rows shown before "Show all"
  var DAY = 24 * 60 * 60 * 1000;

  var KIND_LABEL = {
    area: 'Area', period: 'Period', movement: 'Movement',
    writer: 'Writer', work: 'Work', concept: 'Concept'
  };

  /* ---------- small helpers ---------- */

  function waitForAuth(cb) {
    var tries = 0;
    (function check() {
      if (window.akAuth) return cb(window.akAuth);
      if (tries++ > 150) return cb(null);
      setTimeout(check, 30);
    })();
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function fmt(n) {
    try { return Number(n).toLocaleString('en-IN'); } catch (e) { return String(n); }
  }

  function answers(n) { return fmt(n) + (n === 1 ? ' answer' : ' answers'); }

  function pct(part, whole) { return whole ? Math.round(part * 100 / whole) : 0; }

  /* ---------- loading ---------- */

  // The user's attempts, newest first, 1,000 per request, until all are
  // loaded (or MAX_ROWS). Keyset paging on id, so rows that arrive while
  // we load can never be skipped or counted twice. Own rows only: RLS
  // enforces it, and the explicit user_id filter keeps the index in use.
  function loadAttempts(client, uid) {
    var rows = [], total = null, minId = null;
    function next() {
      var q = client.from('attempts')
        .select('id, is_correct, answered_at, period_id, topic_id', total === null ? { count: 'exact' } : {})
        .eq('user_id', uid)
        .order('id', { ascending: false })
        .limit(PAGE);
      if (minId !== null) q = q.lt('id', minId);
      return q.then(function (res) {
        if (res.error) throw res.error;
        var page = res.data || [];
        if (total === null) total = (typeof res.count === 'number') ? res.count : -1;
        for (var i = 0; i < page.length; i++) rows.push(page[i]);
        if (page.length) minId = page[page.length - 1].id;
        var all = total >= 0 && rows.length >= total;
        if (!page.length || all || rows.length >= MAX_ROWS) {
          return { rows: rows, truncated: total >= 0 && rows.length < total };
        }
        return next();
      });
    }
    return next();
  }

  // Human names for the period and topic ids that appear (public table).
  function loadTopicNames(client, idMap) {
    var out = {}, list = Object.keys(idMap), chunks = [];
    for (var i = 0; i < list.length; i += 80) chunks.push(list.slice(i, i + 80));
    return Promise.all(chunks.map(function (c) {
      return client.from('topics').select('id, name, kind').in('id', c).then(function (res) {
        if (res.error) throw res.error;
        (res.data || []).forEach(function (t) { out[t.id] = t; });
      });
    })).then(function () { return out; });
  }

  // The exams the user picked, by name (same query as /account/).
  function loadExams(client, uid) {
    return client.from('user_exams')
      .select('exam_id, is_primary, exams ( name )')
      .eq('user_id', uid)
      .then(function (res) {
        if (res.error) throw res.error;
        var rows = (res.data || []).slice();
        rows.sort(function (a, b) { return (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0); });
        var out = [];
        rows.forEach(function (r) {
          var name = r.exams && r.exams.name;
          if (name) out.push({ name: name, primary: !!r.is_primary });   // no name: skip, never show an id
        });
        return out;
      });
  }

  // Everything below is worked out from the one set of rows, so all the
  // numbers on the page always agree with each other.
  function computeStats(rows, now) {
    var startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();   // visitor's calendar day
    var weekAgo = now.getTime() - 7 * DAY;                                                    // rolling 7 days
    var s = { total: rows.length, correct: 0, today: 0, week: 0, periods: {}, topics: {} };
    function bump(map, key, ok) {
      var m = map[key] || (map[key] = { n: 0, ok: 0 });
      m.n++; if (ok) m.ok++;
    }
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], ok = r.is_correct === true;
      if (ok) s.correct++;
      // trim microseconds so every browser parses the timestamp
      var t = Date.parse(String(r.answered_at).replace(/(\.\d{3})\d+/, '$1'));
      if (t >= startToday) s.today++;
      if (t >= weekAgo) s.week++;
      bump(s.periods, r.period_id || '', ok);
      bump(s.topics, r.topic_id || '', ok);
    }
    return s;
  }

  /* ---------- sections ---------- */

  var sections = [];
  function addSection(def) { sections.push(def); }

  function stat(value, label, sub) {
    return '<div class="dashstat"><div class="dashnum">' + value + '</div>' +
      '<div class="dashlbl">' + esc(label) + '</div>' +
      (sub ? '<div class="dashsub">' + esc(sub) + '</div>' : '') + '</div>';
  }

  // One row: name, count and accuracy, and a thin bar for the accuracy.
  function groupRow(name, kind, g, extraClass, hidden) {
    var p = pct(g.ok, g.n);
    return '<li class="dashrow' + (extraClass ? ' ' + extraClass : '') + '"' + (hidden ? ' hidden' : '') + '>' +
      '<div class="dashrow-top"><span class="dashname">' + esc(name) +
      (kind ? '<span class="dashkind">' + esc(kind) + '</span>' : '') + '</span>' +
      '<span class="dashmeta">' + answers(g.n) + ' &middot; ' + p + '% correct</span></div>' +
      '<div class="dashbar" aria-hidden="true"><span style="width:' + p + '%"></span></div></li>';
  }

  // Groups sorted by number of answers (most first), then by name.
  function sortedGroups(map, nameOf) {
    var out = Object.keys(map).map(function (k) { return { key: k, g: map[k], name: nameOf(k) }; });
    out.sort(function (a, b) { return (b.g.n - a.g.n) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0); });
    return out;
  }

  function periodName(ctx, key) {
    if (!key) return 'Not sorted into a period';
    return (ctx.names[key] && ctx.names[key].name) || 'Other period';   // never show the raw id
  }
  function topicName(ctx, key) {
    if (!key) return 'Not sorted into a topic';
    return (ctx.names[key] && ctx.names[key].name) || 'Other topic';
  }

  var NAMES_FAILED = '<p class="small">We could not load the period and topic names. Please refresh the page to try again.</p>';

  // 1. Totals
  addSection({
    id: 'totals', order: 10, title: 'Your answers', needs: 'attempts',
    render: function (ctx) {
      var s = ctx.stats;
      return '<div class="dashstats">' +
        stat(fmt(s.total), 'Questions answered (including repeats)', 'A question you answer twice counts twice.') +
        stat(fmt(s.correct), 'Correct answers', 'Out of ' + answers(s.total)) +
        stat(pct(s.correct, s.total) + '%', 'Accuracy', 'Correct answers out of all answers') +
        '</div>' +
        (ctx.truncated ? '<p class="small dashnote">These figures use your latest ' + fmt(MAX_ROWS) + ' answers.</p>' : '');
    }
  });

  // 2. Recent activity
  addSection({
    id: 'recent', order: 20, title: 'Recent activity', needs: 'attempts',
    render: function (ctx) {
      var s = ctx.stats;
      return '<div class="dashstats">' +
        stat(fmt(s.today), 'Answers today', 'Since midnight, your time') +
        stat(fmt(s.week), 'Answers in the last 7 days', 'The past 7 days, including today') +
        '</div>';
    }
  });

  // 3. By period
  addSection({
    id: 'periods', order: 30, title: 'By period', needs: 'attempts',
    render: function (ctx) {
      if (ctx.namesError) return NAMES_FAILED;
      var rows = sortedGroups(ctx.stats.periods, function (k) { return periodName(ctx, k); });
      return '<ul class="dashlist">' + rows.map(function (r) {
        return groupRow(r.name, '', r.g);
      }).join('') + '</ul>';
    }
  });

  // 4. By topic. Skipped when it would only repeat the periods above
  // (every answer tagged to a period itself and nothing more specific).
  addSection({
    id: 'topics', order: 40, title: 'By topic', needs: 'attempts',
    render: function (ctx) {
      if (ctx.namesError) return NAMES_FAILED;
      var rows = sortedGroups(ctx.stats.topics, function (k) { return topicName(ctx, k); });
      var specific = rows.some(function (r) {
        return r.key && ctx.names[r.key] && ctx.names[r.key].kind !== 'period';
      });
      if (!specific) return '';
      var html = '<ul class="dashlist">' + rows.map(function (r, i) {
        var t = ctx.names[r.key];
        var kind = t ? (KIND_LABEL[t.kind] || '') : '';
        return groupRow(r.name, kind, r.g, i >= TOP_TOPICS ? 'dashrow-extra' : '', i >= TOP_TOPICS);
      }).join('') + '</ul>';
      if (rows.length > TOP_TOPICS) {
        html += '<button class="chip dashmore" type="button" data-dash-toggle aria-expanded="false" ' +
          'data-more="Show all ' + rows.length + ' topics" data-less="Show fewer">Show all ' + rows.length + ' topics</button>';
      }
      return html;
    }
  });

  // 5. Paths picked (read-only here; they are changed on My Account)
  addSection({
    id: 'paths', order: 50, title: 'Your paths', needs: '',
    render: function (ctx) {
      if (!ctx.exams.length) return '';
      return '<ul class="examlist">' + ctx.exams.map(function (e) {
        return '<li class="examitem"><span class="examname">' + esc(e.name) + '</span>' +
          (e.primary ? '<span class="primtag">Main path</span>' : '') + '</li>';
      }).join('') + '</ul>' +
        '<p class="small dashnote"><a href="/account/">Change your paths on My Account</a></p>';
    }
  });

  /* ---------- page ---------- */

  var EMPTY_CARD =
    '<section class="acctcard dashempty">' +
    '<h2>You have not answered any questions yet</h2>' +
    '<p>Your dashboard fills in as you take quizzes while you are logged in. Answers you give when you are logged out are not counted here.</p>' +
    '<div class="dashactions">' +
    '<a class="btn" href="/quizzes/daily/">Start a Daily Quiz</a>' +
    '<a class="btn alt" href="/quizzes/mcq/">Try the MCQs</a>' +
    '</div></section>';

  var ERROR_CARD =
    '<section class="acctcard dashempty">' +
    '<h2>We could not load your progress</h2>' +
    '<p>Something went wrong while loading your answers. Please refresh the page to try again.</p>' +
    '</section>';

  function renderAll(ctx) {
    var html = ctx.attemptsError ? ERROR_CARD : (ctx.rows.length ? '' : EMPTY_CARD);
    var hasAttempts = !ctx.attemptsError && ctx.rows.length > 0;
    sections.slice().sort(function (a, b) { return a.order - b.order; }).forEach(function (def) {
      if (def.needs === 'attempts' && !hasAttempts) return;
      var body = '';
      try { body = def.render(ctx) || ''; } catch (e) { body = ''; }    // one broken section never breaks the page
      if (!body) return;
      html += '<section class="acctcard dashcard" data-section="' + esc(def.id) + '">' +
        '<div class="acctcard-head"><h2>' + esc(def.title) + '</h2></div>' + body + '</section>';
    });
    return html;
  }

  function start(client, uid, root) {
    root.innerHTML = '<p class="dashloading">Loading your progress…</p>';
    var ctx = {
      now: new Date(), rows: [], truncated: false, stats: null,
      names: {}, namesError: false, exams: [], attemptsError: false
    };

    var pAttempts = loadAttempts(client, uid).then(function (r) {
      ctx.rows = r.rows; ctx.truncated = r.truncated;
      ctx.stats = computeStats(r.rows, ctx.now);
      var ids = {};
      Object.keys(ctx.stats.periods).concat(Object.keys(ctx.stats.topics)).forEach(function (k) { if (k) ids[k] = 1; });
      return loadTopicNames(client, ids).then(
        function (n) { ctx.names = n; },
        function () { ctx.namesError = true; }
      );
    }, function () { ctx.attemptsError = true; });

    var pExams = loadExams(client, uid).then(
      function (e) { ctx.exams = e; },
      function () { ctx.exams = []; }
    );

    Promise.all([pAttempts, pExams]).then(function () { root.innerHTML = renderAll(ctx); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var notice = document.getElementById('dashNotice');
    var signin = document.getElementById('dashSignin');
    var body = document.getElementById('dashBody');
    var root = document.getElementById('dashSections');

    // "Show all topics" / "Show fewer"
    root.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('[data-dash-toggle]') : null;
      if (!btn) return;
      var card = btn.closest('.dashcard');
      var open = btn.getAttribute('aria-expanded') !== 'true';
      var extra = card.querySelectorAll('.dashrow-extra');
      for (var i = 0; i < extra.length; i++) extra[i].hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = btn.getAttribute(open ? 'data-less' : 'data-more');
    });

    waitForAuth(function (auth) {
      if (!auth || !auth.configured) {
        notice.hidden = false;
        notice.textContent = 'Accounts are not switched on yet. Please check back soon.';
        return;
      }
      auth.session().then(function (session) {
        if (!session || !session.user) { signin.hidden = false; return; }
        body.hidden = false;
        start(auth.client, session.user.id, root);
      }, function () {
        notice.hidden = false;
        notice.textContent = 'We could not check your login. Please refresh the page to try again.';
      });
    });
  });
})();
