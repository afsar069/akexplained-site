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
        .select('id, is_correct, answered_at, period_id, topic_id, question_id', total === null ? { count: 'exact' } : {})
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

  // The ranking: top students and where the caller stands. One RPC (public.leaderboard,
  // SECURITY DEFINER — the only cross-student read there is). null if it is not available
  // (migration not run, or the call failed), and then the rank/top-student cards stay hidden.
  function loadBoard(client) {
    return client.rpc('leaderboard').then(function (res) {
      if (res && !res.error && res.data) return res.data;
      return null;
    }, function () { return null; });
  }

  // The British-literature syllabus (per-age question counts + id prefixes),
  // generated at build time. null if it cannot be fetched — then the level
  // card shows a "could not load" line instead of a wrong number.
  function loadSyllabus() {
    try {
      return fetch('/assets/syllabus-british.json', { cache: 'no-cache' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }

  // The person's display name (own profile row only, by RLS). '' if none.
  function loadProfileName(client, uid) {
    return client.from('profiles').select('display_name').eq('id', uid).maybeSingle()
      .then(function (res) { return (res.data && res.data.display_name) || ''; })
      .catch(function () { return ''; });
  }

  // Everything below is worked out from the one set of rows, so all the
  // numbers on the page always agree with each other.
  function computeStats(rows, now) {
    var startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();   // visitor's calendar day
    var weekAgo = now.getTime() - 7 * DAY;                                                    // rolling 7 days
    var s = { total: rows.length, correct: 0, today: 0, todayCorrect: 0, week: 0,
      periods: {}, topics: {}, days: {}, unique: 0 };
    var qseen = {};
    function bump(map, key, ok) {
      var m = map[key] || (map[key] = { n: 0, ok: 0 });
      m.n++; if (ok) m.ok++;
    }
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], ok = r.is_correct === true;
      if (ok) s.correct++;
      // trim microseconds so every browser parses the timestamp
      var t = Date.parse(String(r.answered_at).replace(/(\.\d{3})\d+/, '$1'));
      if (t >= startToday) { s.today++; if (ok) s.todayCorrect++; }
      if (t >= weekAgo) s.week++;
      if (!isNaN(t)) { var d = new Date(t); s.days[dayKey(d)] = true; }   // active-day set (visitor's local day)
      if (r.question_id && !qseen[r.question_id]) { qseen[r.question_id] = 1; s.unique++; }
      bump(s.periods, r.period_id || '', ok);
      bump(s.topics, r.topic_id || '', ok);
    }
    return s;
  }

  // One key per calendar day, in the visitor's own time zone.
  function dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  // The daily streak worked out from the active-day set.
  //  run      = days in a row ending today (or, if nothing today, ending yesterday)
  //  weekDone = how many days this week (Mon–Sun) had at least one answer
  //  week     = seven flags, Monday first: { active, future }
  function computeStreak(days, now) {
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var probe = new Date(today);
    if (!days[dayKey(probe)]) probe.setDate(probe.getDate() - 1);   // today still open: count the run up to yesterday
    var run = 0;
    while (days[dayKey(probe)]) { run++; probe.setDate(probe.getDate() - 1); }

    var mondayOffset = (today.getDay() + 6) % 7;                    // 0 = Mon … 6 = Sun
    var weekStart = new Date(today); weekStart.setDate(today.getDate() - mondayOffset);
    var week = [], weekDone = 0;
    for (var i = 0; i < 7; i++) {
      var dd = new Date(weekStart); dd.setDate(weekStart.getDate() + i);
      var active = !!days[dayKey(dd)];
      if (active) weekDone++;
      week.push({ active: active, future: dd > today });
    }
    return { run: run, weekDone: weekDone, week: week };
  }

  /* ---------- sections ---------- */

  var sections = [];
  function addSection(def) { sections.push(def); }

  function stat(value, label, sub) {
    return '<div class="dashstat"><div class="dashnum">' + value + '</div>' +
      '<div class="dashlbl">' + esc(label) + '</div>' +
      (sub ? '<div class="dashsub">' + esc(sub) + '</div>' : '') + '</div>';
  }

  // One line-art icon for a KPI card.
  function icon(path) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }

  // A big KPI card: a tinted icon, the number, its label and a small note.
  function kpi(tone, ic, value, label, sub) {
    return '<div class="dashkpi ' + tone + '">' +
      '<span class="dashkpi-ic">' + ic + '</span>' +
      '<span class="dashkpi-body">' +
        '<b class="dashkpi-num">' + value + '</b>' +
        '<span class="dashkpi-lbl">' + esc(label) + '</span>' +
        (sub ? '<em class="dashkpi-sub">' + esc(sub) + '</em>' : '') +
      '</span>' +
    '</div>';
  }

  var IC_LIST = '<path d="M4 6h16M4 12h16M4 18h10"/>';
  var IC_CHECK = '<circle cx="12" cy="12" r="9"/><path d="m8.4 12.2 2.4 2.4 4.8-5.2"/>';
  var IC_TARGET = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.4"/>';
  var IC_CAL = '<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16"/>';
  var IC_CALOK = IC_CAL + '<path d="m9.2 15 1.7 1.7 3.9-3.9"/>';
  var IC_TROPHY = '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>';
  var IC_FLAME = '<path d="M12 3c1 3-1.5 4.5-1.5 7A3.5 3.5 0 0 0 14 13c0-1 .6-1.8.6-1.8.8 1 1.4 2.3 1.4 3.8a4 4 0 1 1-8 0c0-3.2 3-4.5 4-12Z"/>';

  function ordinal(n) {
    var tens = n % 100;
    if (tens >= 11 && tens <= 13) return n + 'th';
    return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
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

  // 1. Totals — three headline figures.
  addSection({
    id: 'totals', order: 10, title: 'Your overall progress', needs: 'attempts',
    render: function (ctx) {
      var s = ctx.stats;
      return '<div class="dashkpis">' +
        kpi('is-ink', icon(IC_LIST), fmt(s.total), 'Questions attempted', 'Including repeats') +
        kpi('is-ok', icon(IC_CHECK), fmt(s.correct), 'Correct answers', 'Out of ' + answers(s.total)) +
        kpi('is-gold', icon(IC_TARGET), pct(s.correct, s.total) + '%', 'Accuracy', 'Correct out of all answers') +
        '</div>' +
        (ctx.truncated ? '<p class="small dashnote">These figures use your latest ' + fmt(MAX_ROWS) + ' answers.</p>' : '');
    }
  });

  /* ---------------------------------------------------------
     Your level in English literature  (owner's model, 2026-11-04)

     British literature = the 20 Daily ages, each worth an equal 5% (20 x 5 = 100%).
     An age is CLEARED when the learner has covered at least `coverGate` of its
     questions AND answered at least `accGate` of those right (each question once,
     by its latest answer — repeat-proof, same rule as the leaderboard). Five
     stages, Beginner -> Master, one per 20% band (4 cleared ages each).

     The per-age denominators (how many questions, and the id prefix that marks
     an age) come from assets/syllabus-british.json, generated at build time from
     the Daily files (tools/build-syllabus.js). Reading is not used (no data yet).
     Only British literature is measured for now; the other journeys are empty
     until their syllabus and questions exist.
     --------------------------------------------------------- */
  // Work out, per age, what the learner has covered and how much is right.
  // rows are newest-first, so the FIRST time a question id is seen is its latest
  // answer. Only ids whose prefix belongs to a Daily age are counted (MCQ ids,
  // with their longer prefixes, fall through and are ignored).
  function computeBritish(rows, syl) {
    if (!syl || !syl.ages) return null;
    var byPrefix = {}, ages = syl.ages.map(function (a) {
      var o = { slug: a.slug, name: a.name, total: a.total, answered: 0, correct: 0 };
      byPrefix[a.prefix] = o;
      return o;
    });
    var seen = {};
    for (var i = 0; i < rows.length; i++) {
      var qid = rows[i].question_id;
      if (!qid || seen[qid]) continue;
      var m = /^([a-z]+)-/.exec(String(qid));
      if (!m) continue;
      var age = byPrefix[m[1]];
      if (!age) continue;                 // not a British Daily question (e.g. an MCQ)
      seen[qid] = 1;
      age.answered++;
      if (rows[i].is_correct === true) age.correct++;
    }
    var cover = syl.coverGate || 0.6, accG = syl.accGate || 0.6, clearedN = 0;
    ages.forEach(function (a) {
      a.coverage = a.total ? a.answered / a.total : 0;
      a.acc = a.answered ? a.correct / a.answered : 0;
      a.cleared = a.coverage >= cover && a.acc >= accG;
      if (a.cleared) clearedN++;
      // What is still needed to clear this age.
      if (a.cleared) a.hint = '';
      else if (a.coverage < cover) a.hint = 'Answer ' + Math.max(1, Math.ceil(cover * a.total) - a.answered) + ' more';
      else a.hint = Math.max(1, Math.ceil(accG * a.answered) - a.correct) + ' more right to clear';
    });
    var unit = 100 / ages.length;                       // 5% per age
    var pctClear = Math.round(clearedN * unit);
    var perBand = ages.length / syl.ladder.length;      // 20 ages / 5 stages = 4 ages per stage
    var levelIdx = Math.min(syl.ladder.length - 1, Math.floor(clearedN / perBand));
    return {
      ages: ages, cleared: clearedN, total: ages.length, pct: pctClear,
      levelIdx: levelIdx, levelName: syl.ladder[levelIdx], ladder: syl.ladder,
      perBand: perBand, coverGate: cover, accGate: accG
    };
  }

  function stars(n) {
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += '<svg class="dashstar' + (i <= n ? ' on' : '') + '" viewBox="0 0 24 24" width="13" height="13" ' +
        'fill="currentColor" aria-hidden="true"><path d="m12 2.6 2.9 6.2 6.6.8-4.9 4.6 1.3 6.7L12 17.6 ' +
        '6.1 20.9l1.3-6.7L2.5 9.6l6.6-.8Z"/></svg>';
    }
    return '<span class="dashstars">' + out + '</span>';
  }

  // 2. Your level in English literature — British literature, the 20 ages.
  addSection({
    id: 'level', order: 15, title: 'Your level in English literature', needs: 'attempts',
    render: function (ctx) {
      var B = ctx.british;
      if (!B) {
        return '<p class="small">We could not load the syllabus for your level. Please refresh the page to try again.</p>';
      }
      var at = B.levelIdx, next = B.ladder[at + 1];
      var toNext = (at + 1) * B.perBand;                 // ages cleared needed for the next stage
      var need = next
        ? 'Clear ' + (toNext - B.cleared) + ' more age' + ((toNext - B.cleared) === 1 ? '' : 's') + ' to reach ' + next
        : 'You have mastered every age.';

      // Overall bar with the four stage boundaries at 20/40/60/80.
      var marks = [20, 40, 60, 80].map(function (m) {
        return '<span class="dashbarmark" style="left:' + m + '%"></span>';
      }).join('');

      // One tile per age: cleared (reward tick) or its progress to the gate.
      var tiles = B.ages.map(function (a) {
        var accPc = Math.round(a.acc * 100);
        var state = a.cleared ? 'is-cleared' : a.answered ? 'is-doing' : '';
        var right = a.cleared
          ? '<span class="dashage-done">✓ Cleared</span>'
          : '<span class="dashage-hint">' + esc(a.hint) + '</span>';
        return '<li class="dashage ' + state + '">' +
          '<div class="dashage-top"><b>' + esc(a.name) + '</b>' + right + '</div>' +
          '<div class="dashage-meta">' + a.answered + ' / ' + a.total + ' answered' +
            (a.answered ? ' &middot; ' + accPc + '% correct' : '') + '</div>' +
          '<div class="dashbar" aria-hidden="true"><span class="' + (a.acc >= B.accGate ? 'ok' : '') +
            '" style="width:' + accPc + '%"></span><i class="dashbar-gate" style="left:' +
            Math.round(B.accGate * 100) + '%"></i></div>' +
        '</li>';
      }).join('');

      return '<div class="dashlevel">' +
        '<div class="dashlevel-now">' +
          '<span class="dashlevel-badge">' + stars(at + 1) + '<b>' + esc(B.levelName) + '</b></span>' +
          '<span class="dashlevel-next">' + esc(need) + '</span>' +
        '</div>' +
        '<div class="dashkpis dashkpis-2">' +
          kpi('is-gold', icon(IC_TARGET), B.pct + '%', 'British literature covered', B.cleared + ' of ' + B.total + ' ages cleared') +
          kpi('is-ink', icon(IC_LIST), B.cleared + ' / ' + B.total, 'Ages cleared', 'Each age is 60% answered at 60% correct') +
        '</div>' +
        '<div class="dashbigbar" aria-hidden="true"><span style="width:' + B.pct + '%"></span>' + marks + '</div>' +
        '<ol class="dashladder">' +
          B.ladder.map(function (L, i) {
            return '<li class="' + (i === at ? 'is-now' : i < at ? 'is-done' : '') + '">' +
              '<i></i><b>' + esc(L) + '</b>' + stars(i + 1) + '</li>';
          }).join('') +
        '</ol>' +
        '<details class="dashages"><summary>Your ' + B.total + ' ages, one by one</summary>' +
          '<ol class="dashagelist">' + tiles + '</ol>' +
        '</details>' +
      '</div>';
    }
  });

  // 3. Your rank — where the caller stands on the all-ages ranking (leaderboard RPC).
  addSection({
    id: 'rank', order: 18, title: 'Your rank', needs: 'attempts',
    render: function (ctx) {
      var b = ctx.board;
      if (!b || !b.you) return '';            // RPC not available: hide quietly
      var you = b.you, min = b.min_questions || 100;
      if (you.eligible && you.rank) {
        return '<div class="dashkpis dashkpis-2">' +
          kpi('is-gold', icon(IC_TROPHY), ordinal(you.rank), 'Your rank',
            'of ' + fmt(b.total_ranked || you.rank) + ' ranked students') +
          kpi('is-ok', icon(IC_TARGET), (you.accuracy != null ? you.accuracy + '%' : '—'), 'Your ranked accuracy',
            'Each question counted once') +
          '</div>';
      }
      var needed = you.needed || Math.max(0, min - (you.questions || 0));
      return '<div class="dashkpis dashkpis-2">' +
        kpi('is-ink', icon(IC_TROPHY), fmt(needed), 'More questions to get a rank',
          'Answer ' + fmt(min) + ' different questions to join the ranking') +
        kpi('is-ok', icon(IC_LIST), fmt(you.questions || 0), 'Different questions ranked so far',
          'Each question counted once') +
        '</div>';
    }
  });

  // 4. Today's activity — what has been done since midnight (visitor's day).
  addSection({
    id: 'today', order: 20, title: "Today's activity", needs: 'attempts',
    render: function (ctx) {
      var s = ctx.stats;
      return '<div class="dashkpis dashkpis-2">' +
        kpi('is-ink', icon(IC_CAL), fmt(s.today), 'Questions attempted today', 'Since midnight, your time') +
        kpi('is-ok', icon(IC_CALOK), fmt(s.todayCorrect), 'Correct answers today',
          s.today ? 'Out of ' + answers(s.today) + ' today' : 'No answers yet today') +
        '</div>';
    }
  });

  // 5. Your daily streak — days in a row and this week, from the active-day set.
  addSection({
    id: 'streak', order: 25, title: 'Your daily streak', needs: 'attempts',
    render: function (ctx) {
      var k = computeStreak(ctx.stats.days, ctx.now);
      var names = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      var grid = '<div class="dashweek" aria-hidden="true">' +
        k.week.map(function (d, i) {
          var cls = d.active ? 'is-on' : d.future ? 'is-future' : '';
          return '<span class="' + cls + '">' + names[i] + '</span>';
        }).join('') + '</div>';
      return '<div class="dashstreak">' +
        '<div class="dashkpis dashkpis-2">' +
          kpi('is-gold', icon(IC_FLAME), fmt(k.run) + (k.run === 1 ? ' day' : ' days'), 'In a row',
            k.run ? 'Keep it going today' : 'Answer one question to start a streak') +
          kpi('is-ink', icon(IC_CAL), fmt(k.weekDone) + ' / 7', 'Days this week', 'Monday to Sunday') +
        '</div>' + grid +
      '</div>';
    }
  });

  // 6. By period
  addSection({
    id: 'periods', order: 30, title: 'Your progress by period', needs: 'attempts',
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
    id: 'topics', order: 40, title: 'Your progress by topics', needs: 'attempts',
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

  // Topics measured enough to judge (at least 3 answers), split by accuracy.
  function measuredTopics(ctx) {
    var rows = sortedGroups(ctx.stats.topics, function (k) { return topicName(ctx, k); });
    var measured = rows.filter(function (r) { return r.g.n >= 3; });
    return {
      strong: measured.filter(function (r) { return pct(r.g.ok, r.g.n) >= 70; })
        .sort(function (a, b) { return pct(b.g.ok, b.g.n) - pct(a.g.ok, a.g.n); }),
      weak: measured.filter(function (r) { return pct(r.g.ok, r.g.n) < 70; })
        .sort(function (a, b) { return pct(a.g.ok, a.g.n) - pct(b.g.ok, b.g.n); })
    };
  }
  function topicRowOf(ctx, r) {
    var t = ctx.names[r.key];
    return groupRow(r.name, t ? (KIND_LABEL[t.kind] || '') : '', r.g);
  }

  // 9. Your strengths — topics you answer well (3+ answers, 70%+).
  addSection({
    id: 'strengths', order: 45, title: 'Your strengths', needs: 'attempts',
    render: function (ctx) {
      if (ctx.namesError) return '';
      var m = measuredTopics(ctx);
      if (!m.strong.length) {
        return '<p class="small">No topic has reached 70% yet, over at least three answers. Keep going — they will show here.</p>';
      }
      return '<ul class="dashlist">' + m.strong.slice(0, 6).map(function (r) { return topicRowOf(ctx, r); }).join('') + '</ul>';
    }
  });

  // 10. Areas to improve — topics that need work (3+ answers, under 70%).
  addSection({
    id: 'areas', order: 46, title: 'Areas to improve', needs: 'attempts',
    render: function (ctx) {
      if (ctx.namesError) return '';
      var m = measuredTopics(ctx);
      if (!m.weak.length) {
        return '<p class="small">Every topic with at least three answers is above 70%. Keep it that way.</p>';
      }
      return '<ul class="dashlist">' + m.weak.slice(0, 6).map(function (r) { return topicRowOf(ctx, r); }).join('') + '</ul>';
    }
  });

  // 11. Top students — the all-ages ranking (leaderboard RPC). Names and
  // accuracy only; the function is the privacy wall (see its migration).
  addSection({
    id: 'board', order: 100, title: 'Top students', needs: 'attempts',
    render: function (ctx) {
      var b = ctx.board;
      if (!b) return '';                                  // RPC not available: hide quietly
      var board = b.board || [];
      if (!board.length) {
        return '<p class="small">No student has reached the ranking yet. Answer ' +
          fmt(b.min_questions || 100) + ' different questions to be the first on the board.</p>';
      }
      return '<ol class="dashboardlb">' + board.map(function (s) {
        return '<li class="dashlb' + (s.is_you ? ' is-you' : '') + '">' +
          '<b>' + esc(ordinal(s.rank)) + '</b>' +
          '<span class="dashlb-name">' + esc(s.is_you ? 'You' : s.name) + '</span>' +
          '<em>' + esc(String(s.accuracy)) + '% correct</em></li>';
      }).join('') + '</ol>' +
        '<p class="small dashnote">Ranked by accuracy, each question counted once. You join after ' +
        fmt(b.min_questions || 100) + ' different questions.</p>';
    }
  });

  // 12. Paths picked (read-only here; they are changed on My Account)
  addSection({
    id: 'paths', order: 110, title: 'Your paths', needs: '',
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

  // A friendly greeting with the person's name, above the cards.
  function welcomeHero(ctx) {
    var name = ctx.name || 'there';
    var fresh = !ctx.attemptsError && !ctx.rows.length;
    var greet = (fresh ? 'Welcome, ' : 'Welcome back, ') + name;
    var line = fresh
      ? 'This is your dashboard. Take a quiz while you are logged in and your progress will start to show here.'
      : 'Here is how your learning is going, from the quizzes you have taken while logged in.';
    var primary = (ctx.exams || []).filter(function (e) { return e.primary; })[0];
    return '<section class="dashhero">' +
      '<h2 class="dashhero-title">' + esc(greet) + '</h2>' +
      '<p class="dashhero-line">' + esc(line) + '</p>' +
      (primary ? '<p class="dashhero-path">Your main path: <b>' + esc(primary.name) + '</b></p>' : '') +
    '</section>';
  }

  function renderAll(ctx) {
    var html = welcomeHero(ctx) +
      (ctx.attemptsError ? ERROR_CARD : (ctx.rows.length ? '' : EMPTY_CARD));
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

  function start(client, uid, root, user, auth) {
    root.innerHTML = '<p class="dashloading">Loading your progress…</p>';
    var ctx = {
      now: new Date(), rows: [], truncated: false, stats: null,
      names: {}, namesError: false, exams: [], attemptsError: false,
      name: (auth && user && auth.nameFrom(user, '')) || '',  // quick name; refined by the profile below
      board: null, syllabus: null, british: null
    };

    var pName = loadProfileName(client, uid).then(function (pn) {
      if (pn && auth && user) ctx.name = auth.nameFrom(user, pn);
    }, function () { /* keep the quick name */ });

    var pBoard = loadBoard(client).then(function (b) { ctx.board = b; }, function () { ctx.board = null; });
    var pSyl = loadSyllabus().then(function (s) { ctx.syllabus = s; }, function () { ctx.syllabus = null; });

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

    Promise.all([pAttempts, pExams, pName, pBoard, pSyl]).then(function () {
      try { ctx.british = computeBritish(ctx.rows, ctx.syllabus); } catch (e) { ctx.british = null; }
      root.innerHTML = renderAll(ctx);
    });
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
        start(auth.client, session.user.id, root, session.user, auth);
      }, function () {
        notice.hidden = false;
        notice.textContent = 'We could not check your login. Please refresh the page to try again.';
      });
    });
  });
})();
