/* ==========================================================
   AK Explained — dashboard (v2 layout, 2026-11-06; MCQs, quiz count and top ten added 2026-11-06)
   Runs on /dashboard/, /dashboard/ages/ and /dashboard/topics/.
   Needs a logged-in user.
   ----------------------------------------------------------
   READ-ONLY. It shows only what public.attempts (and public.quiz_runs,
   the count of finished quizzes) can honestly support today: totals, a
   rank, today, the streak, the level model, progress by age and by
   topic, strengths and weak spots, the weekly accuracy trend and the
   next age to clear. It does NOT show study time, mastery decay or
   exam-readiness meters: that tracking does not exist yet. Do not
   approximate any of it here (CLAUDE.md rule 2).

   THE LAYOUT (owner's, 2026-11-06)
     1  Welcome header
     2  six tiles in one line  (courses, questions, correct, average, streak, progress)
     3  Your rank  |  Today's activity            (two cards, two tiles each)
     4  Your daily streak      (two tiles + the week line)
     5  Your level in English literature (five stages)
     6  Progress by British age  |  Progress by topic   (five rows each, "+" opens the full page)
     7  Your strengths  |  Areas to improve            (five rows each)
     8  Top students  |  Your paths
     9  Performance trend  |  Your next goal           (side by side, last row)

   HOW TO ADD A SECTION LATER
   Call addSection({ id, order, title, needs, col, bare, more, render }).
     id      short unique name
     order   number; sections are shown from low to high
     title   the card heading (simple English)
     needs   'attempts' = shown only when the user has answers
             ''         = always tried (it may still return '')
     col     'half' = this card shares its line with the next 'half' card
             (left out = the card takes the full width)
     bare    true = no card box and no heading, just the HTML
     more    { href, label } = a "+" button in the card corner that
             opens a page with the full list
     render  function (ctx) -> an HTML string, or '' to hide the card.
   ctx holds what was loaded once: ctx.rows (the attempts), ctx.stats
   (totals and groups worked out from them), ctx.names (topic names
   by id), ctx.exams, ctx.british (the level model), ctx.board (the
   ranking), ctx.now. A section that throws is skipped; the other
   sections still show.

   PICTURES ON THE TILES
   Every tile asks art() for its artwork. Today that returns a line
   drawing. To use a PNG instead, drop the file in /assets/dash/ and
   name it in KPI_ART below — nothing else changes.

   KNOWN v1 LIMIT (also in docs/accounts-status.md): every attempt row
   of the user is loaded into the browser (small columns, newest
   first, 1,000 per request, at most MAX_ROWS). The fix is a grouped
   view or RPC on the server; it is planned with the mastery work.
   ========================================================== */
(function () {
  'use strict';

  var PAGE = 1000;                 // rows asked for per request
  var MAX_ROWS = 10000;            // safety cap for v1 (see the limit above)
  var TOP_TOPICS = 8;              // topic rows shown before "Show all" (detail page)
  var CARD_ROWS = 5;               // rows in a summary card on the main page (owner's rule)
  var BOARD_ROWS = 10;             // students on the Top students card (owner's rule, 2026-11-06)
  var NEED_ANSWERS = 3;            // a topic needs this many answers before it is judged
  var STRONG_AT = 70;              // % correct: at or above is a strength, below needs work
  var TREND_WEEKS = 8;             // weeks on the performance chart
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
          if (name) out.push({ id: r.exam_id, name: name, primary: !!r.is_primary });   // no name: skip, never show an id
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

  // How many quizzes the person has finished (public.quiz_runs, own rows by RLS).
  // null when the table is not there yet or the call fails: the first tile then keeps
  // saying "Questions answered", which is always true.
  function loadRuns(client, uid) {
    return client.from('quiz_runs').select('id', { count: 'exact', head: true }).eq('user_id', uid)
      .then(function (res) { return (!res.error && typeof res.count === 'number') ? res.count : null; },
            function () { return null; });
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

  // The person's display name and chosen avatar (own profile row only, by RLS).
  function loadProfile(client, uid) {
    return client.from('profiles').select('display_name, avatar_id').eq('id', uid).maybeSingle()
      .then(function (res) {
        return { name: (res.data && res.data.display_name) || '', avatar: (res.data && res.data.avatar_id) || '' };
      })
      .catch(function () { return { name: '', avatar: '' }; });
  }

  /* ---------- working the numbers out ---------- */

  // Timestamps from the server carry microseconds; trim them so every
  // browser parses the value.
  function stamp(v) { return Date.parse(String(v).replace(/(\.\d{3})\d+/, '$1')); }

  // Everything below is worked out from the one set of rows, so all the
  // numbers on the page always agree with each other.
  function computeStats(rows, now) {
    var startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();   // visitor's calendar day
    var w1Start = now.getTime() - 7 * DAY;                                                   // rolling 7 days
    var w2Start = now.getTime() - 14 * DAY;                                                  // the 7 days before that
    var s = { total: rows.length, correct: 0, today: 0, todayCorrect: 0,
      w1: { n: 0, ok: 0 }, w2: { n: 0, ok: 0 },
      periods: {}, topics: {}, days: {}, unique: 0 };
    var qseen = {};
    function bump(map, key, ok) {
      var m = map[key] || (map[key] = { n: 0, ok: 0 });
      m.n++; if (ok) m.ok++;
    }
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], ok = r.is_correct === true;
      if (ok) s.correct++;
      var t = stamp(r.answered_at);
      if (t >= startToday) { s.today++; if (ok) s.todayCorrect++; }
      if (t >= w1Start) { s.w1.n++; if (ok) s.w1.ok++; }
      else if (t >= w2Start) { s.w2.n++; if (ok) s.w2.ok++; }
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
  //  week     = seven flags, Monday first: { active, future, today }
  //             a past day that is not active is a missed day (shown in red)
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
      week.push({ active: active, future: dd > today, today: dd.getTime() === today.getTime() });
    }
    return { run: run, weekDone: weekDone, week: week };
  }

  /* ---------------------------------------------------------
     Your level in English literature  (owner's model, 2026-11-04)

     British literature = the 20 ages, each worth an equal 5% (20 x 5 = 100%).
     An age is CLEARED when the learner has covered at least `coverGate` of its
     questions AND answered at least `accGate` of those right (each question once,
     by its latest answer — repeat-proof, same rule as the leaderboard). Five
     stages, Beginner -> Master, one per 20% band (4 cleared ages each).

     "Its questions" = the age's Daily questions + the questions of its live MCQ
     sets (owner, 2026-11-06: MCQ answers count too). The pool sizes and the id
     rules come from assets/syllabus-british.json, generated at build time
     (tools/build-syllabus.js). Reading is not used (no data yet).
     Only British literature is measured for now; the other journeys are empty
     until their syllabus and questions exist.
     --------------------------------------------------------- */

  // Which age does a question id belong to? Daily ids look like "as-e-01" (prefix
  // per age); MCQ ids look like "old-english-set-1-e-01" (the MCQ age slug first).
  // Anything else (for example the Literature banks, "asl-e-01") belongs to no
  // age yet and is not counted here.
  function ageOfQuestion(qid, B) {
    var m = /^([a-z]+)-[eh]-\d+$/.exec(String(qid || ''));
    if (m) return { age: B.byDaily[m[1]] || null, mcq: false };
    m = /^(.+)-set-\d+-[emh]-\d+$/.exec(String(qid || ''));   // e / m / h: a hard level exists (Old English Set 6)
    if (m) return { age: B.byMcq[m[1]] || null, mcq: true };
    return { age: null, mcq: false };
  }

  // Work out, per age, what the learner has covered and how much is right.
  // rows are newest-first, so the FIRST time a question id is seen is its latest answer.
  function computeBritish(rows, syl) {
    if (!syl || !syl.ages) return null;
    var byDaily = {}, byMcq = {}, ages = syl.ages.map(function (a) {
      var o = { slug: a.slug, name: a.name, prefix: a.prefix, total: a.total,
        dailyTotal: a.dailyTotal != null ? a.dailyTotal : a.total, mcqTotal: a.mcqTotal || 0,
        answered: 0, correct: 0, dAnswered: 0, mAnswered: 0 };
      byDaily[a.prefix] = o;
      if (a.mcqSlug) byMcq[a.mcqSlug] = o;
      return o;
    });
    var B0 = { byDaily: byDaily, byMcq: byMcq };
    var seen = {};
    for (var i = 0; i < rows.length; i++) {
      var qid = rows[i].question_id;
      if (!qid || seen[qid]) continue;
      var hit = ageOfQuestion(qid, B0);
      if (!hit.age) continue;             // not a question of any British age
      seen[qid] = 1;
      hit.age.answered++;
      if (hit.mcq) hit.age.mAnswered++; else hit.age.dAnswered++;
      if (rows[i].is_correct === true) hit.age.correct++;
    }
    var cover = syl.coverGate || 0.6, accG = syl.accGate || 0.6, clearedN = 0;
    ages.forEach(function (a) {
      a.coverage = a.total ? Math.min(1, a.answered / a.total) : 0;
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
      perBand: perBand, coverGate: cover, accGate: accG, byDaily: byDaily, byMcq: byMcq
    };
  }

  // The age the learner is working on now: the one their newest answer
  // (Daily or MCQ) belongs to. '' when no answer belongs to a British age.
  function currentAge(rows, B) {
    if (!B) return '';
    for (var i = 0; i < rows.length; i++) {               // rows are newest first
      var hit = ageOfQuestion(rows[i].question_id, B);
      if (hit.age) return hit.age.slug;
    }
    return '';
  }

  // Weekly buckets (Monday to Sunday) for the performance chart.
  function weeklyTrend(rows, now, weeks) {
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var mon = new Date(today); mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    var out = [];
    for (var i = weeks - 1; i >= 0; i--) {
      var st = new Date(mon); st.setDate(mon.getDate() - i * 7);
      var en = new Date(st); en.setDate(st.getDate() + 7);
      out.push({ start: st, from: st.getTime(), to: en.getTime(), n: 0, ok: 0 });
    }
    for (var r = 0; r < rows.length; r++) {
      var t = stamp(rows[r].answered_at);
      if (isNaN(t) || t < out[0].from) continue;
      for (var b = out.length - 1; b >= 0; b--) {
        if (t >= out[b].from && t < out[b].to) {
          out[b].n++; if (rows[r].is_correct === true) out[b].ok++;
          break;
        }
      }
    }
    return out;
  }

  /* ---------- pieces of markup ---------- */

  var sections = [];
  function addSection(def) { sections.push(def); }

  // One line-art icon for a tile.
  function icon(path) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }

  var IC_LIST = '<path d="M4 6h16M4 12h16M4 18h10"/>';
  var IC_CHECK = '<circle cx="12" cy="12" r="9"/><path d="m8.4 12.2 2.4 2.4 4.8-5.2"/>';
  var IC_TARGET = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.4"/>';
  var IC_CAL = '<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16"/>';
  var IC_CALOK = IC_CAL + '<path d="m9.2 15 1.7 1.7 3.9-3.9"/>';
  var IC_TROPHY = '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>';
  var IC_FLAME = '<path d="M12 3c1 3-1.5 4.5-1.5 7A3.5 3.5 0 0 0 14 13c0-1 .6-1.8.6-1.8.8 1 1.4 2.3 1.4 3.8a4 4 0 1 1-8 0c0-3.2 3-4.5 4-12Z"/>';
  var IC_BOOKS = '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10v16H5.5A1.5 1.5 0 0 1 4 18.5Z"/><path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14Z"/><path d="M10 9h4M10 14h4"/>';
  var IC_CHART = '<path d="M4 19V5M4 19h16"/><path d="m7.5 15 3.5-4 3 2.5L19 8"/>';
  var IC_UP = '<path d="M4 17 10 11l3.5 3L20 7"/><path d="M15 7h5v5"/>';

  /* PICTURES
     Each tile and card asks art() for its artwork and gets a line drawing.
     When a PNG is ready, put it in /assets/dash/ and name it here, for
     example: courses: 'courses.png'. Nothing else needs to change. Keep the
     pictures square and small (about 96x96), with a see-through background. */
  var ART_DIR = '/assets/dash/';
  var KPI_ART = {
    courses: '', questions: '', correct: '', average: '', streak: '', progress: '',
    rank: '', rankacc: '', today: '', todayok: '', week: '', trend: '', goal: ''
  };

  function art(key, fallback) {
    var file = KPI_ART[key];
    if (!file) return fallback;
    return '<img src="' + esc(ART_DIR + file) + '" alt="" width="44" height="44" loading="lazy">';
  }

  // A tile: artwork, the number, its label and a small note.
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

  function ordinal(n) {
    var tens = n % 100;
    if (tens >= 11 && tens <= 13) return n + 'th';
    return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  }

  // One row: name, count and accuracy, and a thin bar for the accuracy.
  function groupRow(name, kind, g, extraClass, hidden, hint) {
    var p = pct(g.ok, g.n);
    return '<li class="dashrow' + (extraClass ? ' ' + extraClass : '') + '"' + (hidden ? ' hidden' : '') + '>' +
      '<div class="dashrow-top"><span class="dashname">' + esc(name) +
      (kind ? '<span class="dashkind">' + esc(kind) + '</span>' : '') + '</span>' +
      '<span class="dashmeta">' + answers(g.n) + ' &middot; ' + p + '% correct</span></div>' +
      '<div class="dashbar" aria-hidden="true"><span style="width:' + p + '%"></span></div>' +
      (hint ? '<p class="dashrow-hint">' + esc(hint) + '</p>' : '') + '</li>';
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

  function stars(n) {
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += '<svg class="dashstar' + (i <= n ? ' on' : '') + '" viewBox="0 0 24 24" width="13" height="13" ' +
        'fill="currentColor" aria-hidden="true"><path d="m12 2.6 2.9 6.2 6.6.8-4.9 4.6 1.3 6.7L12 17.6 ' +
        '6.1 20.9l1.3-6.7L2.5 9.6l6.6-.8Z"/></svg>';
    }
    return '<span class="dashstars">' + out + '</span>';
  }

  // One age row for a summary card: how much of the age is answered, with the
  // 60% gate marked, plus how well it has been answered.
  function ageRow(a, B, isCurrent) {
    var cov = Math.round(a.coverage * 100), accPc = Math.round(a.acc * 100);
    return '<li class="dashrow dashrow-age' + (a.cleared ? ' is-cleared' : '') + '">' +
      '<div class="dashrow-top"><span class="dashname">' + esc(a.name) +
        (isCurrent ? '<span class="dashkind is-now">Now</span>' : '') +
        (a.cleared ? '<span class="dashkind is-ok">Cleared</span>' : '') + '</span>' +
      '<span class="dashmeta">' + cov + '% answered' + (a.answered ? ' &middot; ' + accPc + '% correct' : '') +
      '</span></div>' +
      '<div class="dashbar" aria-hidden="true"><span class="' + (a.cleared ? 'ok' : '') +
        '" style="width:' + cov + '%"></span>' +
        '<i class="dashbar-gate" style="left:' + Math.round(B.coverGate * 100) + '%"></i></div></li>';
  }

  // The five ages for the summary card: the age being worked on now first,
  // then the ages that are furthest along (owner's order).
  function cardAges(ctx) {
    var B = ctx.british;
    if (!B) return [];
    var head = null;
    if (ctx.currentAge) {
      B.ages.forEach(function (a) { if (a.slug === ctx.currentAge) head = a; });
    }
    var rest = B.ages.filter(function (a) { return a !== head; });
    rest.sort(function (a, b) { return (b.coverage - a.coverage) || (b.acc - a.acc); });
    return (head ? [head].concat(rest) : rest).slice(0, CARD_ROWS);
  }

  // Topic rows worth showing on the main page: the most specific tags only
  // (writer, work, movement, concept), never a whole period and never the
  // "not sorted" group, so these cards do not just repeat the ages beside them.
  function specificTopics(ctx) {
    var rows = sortedGroups(ctx.stats.topics, function (k) { return topicName(ctx, k); });
    return rows.filter(function (r) {
      return r.key && ctx.names[r.key] && ctx.names[r.key].kind !== 'period';
    });
  }

  // Specific topics measured enough to judge (at least NEED_ANSWERS answers),
  // split by accuracy. Strongest first; weakest first, and on a tie the one with
  // more answers (more evidence) first.
  function measuredTopics(ctx) {
    var measured = specificTopics(ctx).filter(function (r) { return r.g.n >= NEED_ANSWERS; });
    return {
      measured: measured.length,
      strong: measured.filter(function (r) { return pct(r.g.ok, r.g.n) >= STRONG_AT; })
        .sort(function (a, b) { return (pct(b.g.ok, b.g.n) - pct(a.g.ok, a.g.n)) || (b.g.n - a.g.n); }),
      weak: measured.filter(function (r) { return pct(r.g.ok, r.g.n) < STRONG_AT; })
        .sort(function (a, b) { return (pct(a.g.ok, a.g.n) - pct(b.g.ok, b.g.n)) || (b.g.n - a.g.n); })
    };
  }

  // How many more right answers would lift a weak topic to 70%: the smallest k with
  // (ok + k) / (n + k) >= 0.70, worked out in whole numbers. Plain arithmetic on the
  // person's own counts, nothing guessed.
  function rightToReach(g) {
    return Math.max(1, Math.ceil((7 * g.n - 10 * g.ok) / 3));
  }

  function topicRowOf(ctx, r, withHint) {
    var t = ctx.names[r.key];
    var hint = '';
    if (withHint) {
      var k = rightToReach(r.g);
      hint = k + ' more right ' + (k === 1 ? 'answer' : 'answers') + ' would bring this to ' + STRONG_AT + '%.';
    }
    return groupRow(r.name, t ? (KIND_LABEL[t.kind] || '') : '', r.g, '', false, hint);
  }

  var TOPIC_RULE = 'Only topics with at least ' + NEED_ANSWERS + ' answers are judged. ' +
    'A whole period is not listed here; see the ages for that.';
  var NOT_MEASURED_YET = '<p class="small">A topic is judged once you have given at least ' + NEED_ANSWERS +
    ' answers in it. Keep taking quizzes and your topics will show here.</p>';

  /* ---------- the sections, in the owner's order ---------- */

  // Row 2 — six tiles in one line.
  addSection({
    id: 'kpis', order: 10, title: '', needs: 'attempts', bare: true,
    render: function (ctx) {
      var s = ctx.stats, B = ctx.british;
      var main = (ctx.exams || []).filter(function (e) { return e.primary; })[0];

      // Average score, with the real change from last week when both weeks
      // have enough answers to compare (never a made-up trend).
      var acc = pct(s.correct, s.total), accSub = 'Correct out of all answers';
      if (s.w1.n >= 5 && s.w2.n >= 5) {
        var d = pct(s.w1.ok, s.w1.n) - pct(s.w2.ok, s.w2.n);
        accSub = d > 0 ? 'Up ' + d + ' points on last week'
          : d < 0 ? 'Down ' + (-d) + ' points on last week'
          : 'Same as last week';
      }
      var k = computeStreak(s.days, ctx.now);

      // "Quizzes taken" is a real count of finished quizzes (public.quiz_runs). Until the
      // first finished quiz is on record (or if the count cannot be read) the tile keeps
      // saying "Questions answered", which is always true.
      var quizTile = (typeof ctx.runs === 'number' && ctx.runs > 0)
        ? kpi('is-ink', art('questions', icon(IC_LIST)), fmt(ctx.runs), 'Quizzes taken',
            fmt(s.total) + (s.total === 1 ? ' question answered' : ' questions answered'))
        : kpi('is-ink', art('questions', icon(IC_LIST)), fmt(s.total), 'Questions answered', 'Including repeats');

      return '<div class="dashkpis dashkpis-6">' +
        kpi('is-ink', art('courses', icon(IC_BOOKS)), fmt((ctx.exams || []).length), 'Enrolled courses',
          main ? 'Main: ' + main.name : 'Pick a path on My Account') +
        quizTile +
        kpi('is-ok', art('correct', icon(IC_CHECK)), fmt(s.correct), 'Correct answers', 'Out of ' + answers(s.total)) +
        kpi('is-gold', art('average', icon(IC_TARGET)), acc + '%', 'Average score', accSub) +
        kpi('is-gold', art('streak', icon(IC_FLAME)), fmt(k.run), 'Day streak',
          k.run ? 'Days in a row' : 'Answer one question today') +
        kpi('is-ok', art('progress', icon(IC_UP)), (B ? B.pct + '%' : '—'), 'Overall progress',
          B ? B.cleared + ' of ' + B.total + ' ages cleared' : 'We could not load the syllabus') +
        '</div>' +
        (ctx.truncated ? '<p class="small dashnote">These figures use your latest ' + fmt(MAX_ROWS) + ' answers.</p>' : '');
    }
  });

  // Row 3, left — your rank on the all-ages ranking (leaderboard RPC).
  addSection({
    id: 'rank', order: 20, title: 'Your rank', needs: 'attempts', col: 'half',
    render: function (ctx) {
      var b = ctx.board;
      if (!b || !b.you) return '';            // RPC not available: hide quietly
      var you = b.you, min = (b.min_questions != null ? b.min_questions : 1);
      if (you.eligible && you.rank) {
        return '<div class="dashkpis dashkpis-2">' +
          kpi('is-gold', art('rank', icon(IC_TROPHY)), ordinal(you.rank), 'Your rank',
            'of ' + fmt(b.total_ranked || you.rank) + ' ranked students') +
          (you.score != null
            ? kpi('is-ok', art('rankacc', icon(IC_TARGET)), fmt(you.score), 'Your points',
                (you.accuracy != null ? you.accuracy + '% correct, ' : '') + 'each question once')
            // The database function has not been updated yet (no points sent): keep the accuracy tile.
            : kpi('is-ok', art('rankacc', icon(IC_TARGET)), (you.accuracy != null ? you.accuracy + '%' : '—'),
                'Your rank accuracy', 'Each question counted once')) +
          '</div>';
      }
      var needed = you.needed || Math.max(0, min - (you.questions || 0));
      return '<div class="dashkpis dashkpis-2">' +
        kpi('is-ink', art('rank', icon(IC_TROPHY)), fmt(needed),
          needed === 1 ? 'More question to get a rank' : 'More questions to get a rank',
          min <= 1 ? 'Answer one question to join the ranking'
            : 'Answer ' + fmt(min) + ' different questions to join the ranking') +
        kpi('is-ok', art('rankacc', icon(IC_LIST)), fmt(you.questions || 0), 'Different questions so far',
          'Each question counted once') +
        '</div>';
    }
  });

  // Row 3, right — what has been done since midnight (visitor's day).
  addSection({
    id: 'today', order: 21, title: "Today's activity", needs: 'attempts', col: 'half',
    render: function (ctx) {
      var s = ctx.stats;
      return '<div class="dashkpis dashkpis-2">' +
        kpi('is-ink', art('today', icon(IC_CAL)), fmt(s.today), 'Questions attempted today', 'Since midnight, your time') +
        kpi('is-ok', art('todayok', icon(IC_CALOK)), fmt(s.todayCorrect), 'Correct answers today',
          s.today ? 'Out of ' + answers(s.today) + ' today' : 'No answers yet today') +
        '</div>';
    }
  });

  // Row 4 — the daily streak: two tiles, then the week line.
  addSection({
    id: 'streak', order: 30, title: 'Your daily streak', needs: 'attempts',
    render: function (ctx) {
      var k = computeStreak(ctx.stats.days, ctx.now);
      var names = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      var full = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      var grid = '<div class="dashweek">' +
        k.week.map(function (d, i) {
          var cls = d.active ? 'is-on' : d.future ? 'is-future' : d.today ? 'is-today' : 'is-missed';
          var what = d.active ? 'answered' : d.future ? 'still to come' : d.today ? 'nothing yet today' : 'missed';
          return '<span class="' + cls + '"><b aria-hidden="true">' + names[i] + '</b>' +
            '<i class="sr-only">' + full[i] + ': ' + what + '</i></span>';
        }).join('') + '</div>' +
        '<p class="small dashnote">Green is a day you answered. Red is a day you missed. ' +
        'The days still to come are plain.</p>';
      return '<div class="dashstreak">' +
        '<div class="dashkpis dashkpis-2">' +
          kpi('is-gold', art('streak', icon(IC_FLAME)), fmt(k.run) + (k.run === 1 ? ' day' : ' days'), 'In a row',
            k.run ? 'Keep it going today' : 'Answer one question to start a streak') +
          kpi('is-ink', art('week', icon(IC_CAL)), fmt(k.weekDone) + ' / 7', 'Days this week', 'Monday to Sunday') +
        '</div>' + grid +
      '</div>';
    }
  });

  // Row 5 — your level in English literature (five stages).
  addSection({
    id: 'level', order: 40, title: 'Your level in English literature', needs: 'attempts',
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

      return '<div class="dashlevel">' +
        '<div class="dashlevel-now">' +
          '<span class="dashlevel-badge">' + stars(at + 1) + '<b>' + esc(B.levelName) + '</b></span>' +
          '<span class="dashlevel-next">' + esc(need) + '</span>' +
        '</div>' +
        '<div class="dashkpis dashkpis-2">' +
          kpi('is-gold', art('progress', icon(IC_TARGET)), B.pct + '%', 'British literature covered',
            B.cleared + ' of ' + B.total + ' ages cleared') +
          kpi('is-ink', art('questions', icon(IC_LIST)), B.cleared + ' / ' + B.total, 'Ages cleared',
            'Each age is 60% answered at 60% correct') +
        '</div>' +
        '<div class="dashbigbar" aria-hidden="true"><span style="width:' + B.pct + '%"></span>' + marks + '</div>' +
        '<p class="small dashnote">Daily quiz answers and MCQ answers both count. ' +
          'Each question is counted once, by your latest answer.</p>' +
        '<ol class="dashladder">' +
          B.ladder.map(function (L, i) {
            return '<li class="' + (i === at ? 'is-now' : i < at ? 'is-done' : '') + '">' +
              '<i></i><b>' + esc(L) + '</b>' + stars(i + 1) + '</li>';
          }).join('') +
        '</ol>' +
      '</div>';
    }
  });

  // Row 6, left — five ages: the one in hand, then the furthest along.
  addSection({
    id: 'ages', order: 50, title: 'Your progress by British ages', needs: 'attempts', col: 'half',
    more: { href: '/dashboard/ages/', label: 'See all 20 ages' },
    render: function (ctx) {
      var B = ctx.british;
      if (!B) return '<p class="small">We could not load the ages. Please refresh the page to try again.</p>';
      var five = cardAges(ctx);
      if (!five.length) return '';
      return '<ul class="dashlist">' + five.map(function (a) {
        return ageRow(a, B, a.slug === ctx.currentAge);
      }).join('') + '</ul>' +
        '<p class="small dashnote">The gold line is the 60% you need to clear an age.</p>';
    }
  });

  // Row 6, right — five topics, the ones you have answered most.
  addSection({
    id: 'topics', order: 51, title: 'Your progress by topic', needs: 'attempts', col: 'half',
    more: { href: '/dashboard/topics/', label: 'See all your topics' },
    render: function (ctx) {
      if (ctx.namesError) return NAMES_FAILED;
      var rows = specificTopics(ctx);
      if (!rows.length) {
        return '<p class="small">Your answers are not sorted into single topics yet. They will show here as you take more quizzes.</p>';
      }
      return '<ul class="dashlist">' + rows.slice(0, CARD_ROWS).map(function (r) {
        return topicRowOf(ctx, r);
      }).join('') + '</ul>' +
        (rows.length > CARD_ROWS
          ? '<p class="small dashnote">' + fmt(rows.length) + ' topics in all.</p>' : '');
    }
  });

  // Row 7, left — topics you answer well (3+ answers, 70%+). Specific topics only.
  addSection({
    id: 'strengths', order: 60, title: 'Your strengths', needs: 'attempts', col: 'half',
    more: { href: '/dashboard/topics/', label: 'See all your topics' },
    render: function (ctx) {
      if (ctx.namesError) return '';
      var m = measuredTopics(ctx);
      if (!m.measured) return NOT_MEASURED_YET;
      if (!m.strong.length) {
        return '<p class="small">No topic has reached ' + STRONG_AT + '% yet. Keep going — they will show here.</p>';
      }
      return '<ul class="dashlist">' + m.strong.slice(0, CARD_ROWS).map(function (r) {
        return topicRowOf(ctx, r, false);
      }).join('') + '</ul>' +
        '<p class="small dashnote">' + esc(TOPIC_RULE) + '</p>';
    }
  });

  // Row 7, right — topics that need work (3+ answers, under 70%), the weakest first,
  // each with how many more right answers would lift it to 70%.
  addSection({
    id: 'areas', order: 61, title: 'Areas to improve', needs: 'attempts', col: 'half',
    more: { href: '/dashboard/topics/', label: 'See all your topics' },
    render: function (ctx) {
      if (ctx.namesError) return '';
      var m = measuredTopics(ctx);
      if (!m.measured) return NOT_MEASURED_YET;
      if (!m.weak.length) {
        return '<p class="small">Every topic you have been judged on is at ' + STRONG_AT + '% or more. Keep it that way.</p>';
      }
      return '<ul class="dashlist">' + m.weak.slice(0, CARD_ROWS).map(function (r) {
        return topicRowOf(ctx, r, true);
      }).join('') + '</ul>' +
        '<p class="small dashnote">' + esc(TOPIC_RULE) + '</p>';
    }
  });

  // Row 8 — the all-ages ranking, one line right across the page (owner's
  // layout). Rank, name, points and accuracy only; the function is the privacy wall
  // (see its migration).
  addSection({
    id: 'board', order: 70, title: 'Top students', needs: 'attempts',
    render: function (ctx) {
      var b = ctx.board;
      if (!b) return '';                                  // RPC not available: hide quietly
      var board = b.board || [];
      var min = (b.min_questions != null ? b.min_questions : 1);
      if (!board.length) {
        return '<p class="small">No student is ranked yet. ' +
          (min <= 1 ? 'Answer a question to be the first on the board.'
            : 'Answer ' + fmt(min) + ' different questions to be the first on the board.') + '</p>';
      }
      var shown = board.slice(0, BOARD_ROWS);
      var byPoints = shown.every(function (s) { return s.score != null; });   // false while the old database function is live
      var you = b.you || {};
      // Up to ten cards, five to a line (fewer cards stretch across the line). Each card: the student's
      // picture with the rank on a small badge, then name, points, accuracy (owner, 2026-11-11).
      var cards = '<ol class="dashlbrow" style="--lb-cols:' + Math.min(5, shown.length) + '">' + shown.map(function (s) {
        var ava = (window.akAuth && window.akAuth.avatarUrl) ? window.akAuth.avatarUrl(s.avatar) : '/assets/avatars/default.svg';
        return '<li class="dashlbcard' + (s.is_you ? ' is-you' : '') + (s.rank <= 3 ? ' is-top is-top' + s.rank : '') + '">' +
          '<span class="dashlbcard-ava"><img src="' + esc(ava) + '" alt="" width="64" height="64" loading="lazy">' +
          '<b class="dashlbcard-rank" aria-label="Rank ' + esc(String(s.rank)) + '">' + esc(String(s.rank)) + '</b></span>' +
          '<span class="dashlbcard-name">' + esc(s.is_you ? 'You' : s.name) + '</span>' +
          (s.score != null ? '<span class="dashlbcard-pts">' + esc(fmt(s.score)) + (s.score === 1 ? ' point' : ' points') + '</span>' : '') +
          '<em class="dashlbcard-acc">' + (s.accuracy == null ? 'No answers yet' : esc(String(s.accuracy)) + '% correct') + '</em></li>';
      }).join('') + '</ol>';
      // One short line under the cards, side by side with your own place when you are outside the top ten.
      var rule = esc(byPoints ? 'Points = right answers × accuracy' : 'Ranked by accuracy') +
        '<span class="dashlb-more"> · each question counted once' +
        (min > 1 ? ' · you join after ' + esc(fmt(min)) + ' questions' : '') + '</span>';
      var foot = '<div class="dashlb-foot"><span>' + rule + '</span>' +
        (you.eligible && you.rank && you.rank > shown.length
          ? '<b>You are ' + esc(ordinal(you.rank)) + ' of ' + fmt(b.total_ranked || you.rank) + '</b>' : '') +
        '</div>';
      return cards + foot;
    }
  });

  // Row 9, left — how your accuracy has moved, week by week. Real weekly
  // buckets from your answers; nothing is smoothed or guessed.
  addSection({
    id: 'trend', order: 90, title: 'Your performance', needs: 'attempts', col: 'half',
    render: function (ctx) {
      var weeks = weeklyTrend(ctx.rows, ctx.now, TREND_WEEKS);
      var live = weeks.filter(function (w) { return w.n > 0; });
      if (live.length < 2) {
        return '<p class="small">Your weekly score will be drawn here once you have answered questions in at least two different weeks.</p>';
      }
      var W = 360, H = 158, L = 34, R = 352, T = 12, Bm = 118;
      var step = (R - L) / Math.max(1, weeks.length - 1);
      var pts = [], dots = '', labels = '';
      weeks.forEach(function (w, i) {
        var x = L + i * step;
        if (w.n > 0) {
          var a = pct(w.ok, w.n);
          var y = Bm - (a / 100) * (Bm - T);
          pts.push(x.toFixed(1) + ',' + y.toFixed(1));
          dots += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.6" class="dashdot"><title>' +
            esc(weekLabel(w.start)) + ': ' + a + '% correct, ' + answers(w.n) + '</title></circle>';
        }
        if (i % 2 === 0 || i === weeks.length - 1) {
          labels += '<text x="' + x.toFixed(1) + '" y="' + (H - 8) + '" class="dashaxis" text-anchor="middle">' +
            esc(weekLabel(w.start)) + '</text>';
        }
      });
      var grid = [0, 50, 100].map(function (v) {
        var y = Bm - (v / 100) * (Bm - T);
        return '<line x1="' + L + '" x2="' + R + '" y1="' + y + '" y2="' + y + '" class="dashgrid"/>' +
          '<text x="' + (L - 6) + '" y="' + (y + 4) + '" class="dashaxis" text-anchor="end">' + v + '</text>';
      }).join('');
      var last = live[live.length - 1], prev = live[live.length - 2];
      var dlt = pct(last.ok, last.n) - pct(prev.ok, prev.n);
      var note = dlt > 0 ? 'Up ' + dlt + ' points on the week before.'
        : dlt < 0 ? 'Down ' + (-dlt) + ' points on the week before.'
        : 'The same as the week before.';
      return '<div class="dashchart">' +
        '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
          'aria-label="Your correct answers as a percentage, week by week">' +
          grid +
          '<polyline class="dashline" points="' + pts.join(' ') + '"/>' + dots + labels +
        '</svg></div>' +
        '<p class="small dashnote">Out of every 100 answers you gave that week, how many were right. ' + note + '</p>';
    }
  });

  // Row 9, right — the next age to clear, in the site's own order.
  addSection({
    id: 'goal', order: 91, title: 'Your next goal', needs: 'attempts', col: 'half',
    render: function (ctx) {
      var B = ctx.british;
      if (!B) return '';
      var next = null;
      for (var i = 0; i < B.ages.length; i++) { if (!B.ages[i].cleared) { next = B.ages[i]; break; } }
      if (!next) {
        return '<p class="small">You have cleared all ' + B.total + ' ages. There is no next age left — ' +
          'keep your scores up and watch this page for new question sets.</p>';
      }
      var cov = Math.round(next.coverage * 100);
      var stage = B.ladder[B.levelIdx + 1];
      var toStage = (B.levelIdx + 1) * B.perBand - B.cleared;
      return '<div class="dashgoal">' +
        '<div class="dashgoal-head">' +
          '<span class="dashkpi-ic">' + art('goal', icon(IC_CHART)) + '</span>' +
          '<div><b class="dashgoal-name">' + esc(next.name) + '</b>' +
          '<span class="dashgoal-sub">Next age in the English literature order</span></div>' +
        '</div>' +
        '<div class="dashbar dashbar-lg" aria-hidden="true"><span style="width:' + cov + '%"></span>' +
          '<i class="dashbar-gate" style="left:' + Math.round(B.coverGate * 100) + '%"></i></div>' +
        '<p class="dashgoal-line">' + esc(next.answered + ' of ' + next.total + ' questions answered') +
          (next.hint ? ' &middot; ' + esc(next.hint) : '') + '</p>' +
        (stage ? '<p class="small dashnote">Clear ' + toStage + ' more age' + (toStage === 1 ? '' : 's') +
          ' to reach ' + esc(stage) + '.</p>' : '') +
        '<div class="dashactions">' +
          '<a class="btn" href="/quizzes/daily/' + esc(next.slug) + '/">Start the ' + esc(next.name) + ' quiz</a>' +
        '</div>' +
      '</div>';
    }
  });

  // The last block of the page — the paths picked, each one a link where the site has a page for it,
  // and under them direct links to the study tools (owner, 2026-11-11). Paths are changed on My Account.
  // Only pages that exist are linked; a path with no page yet (UPSC CSE) is shown as a label, never a dead link.
  var PATH_PAGE = {
    'ugc-net': '/exams/net/', 'pgt': '/exams/pgt/', 'state-psc': '/exams/state-psc/',
    'ccsu-ba': '/exams/ma-ba/', 'ccsu-ma': '/exams/ma-ba/', 'du-ba': '/exams/ma-ba/', 'du-ma': '/exams/ma-ba/',
    'amu-ba': '/exams/ma-ba/', 'amu-ma': '/exams/ma-ba/', 'ignou-ba': '/exams/ma-ba/', 'ignou-ma': '/exams/ma-ba/',
    'literature-journey': '/english-literature/'
  };
  var QUICK_LINKS = [
    { href: '/notes/', label: 'Reading' },
    { href: '/quizzes/mcq/', label: 'MCQs' },
    { href: '/quizzes/daily/', label: 'Quick MCQs' },
    { href: '/quizzes/mock-tests/', label: 'Mock Tests' },
    { href: '/quizzes/pyq/', label: 'PYQs' },
    { href: '/video-lessons/', label: 'Video Lessons' },
    { href: '/english-literature/', label: 'English Literature' },
    { href: '/download/', label: 'Download' }
  ];
  // Extra links that show only when that path is picked (both pages are live).
  var PATH_LINKS = {
    'pgt': [
      { href: '/exams/pgt/up-pgt/mcqs/', label: 'PGT MCQs' },
      { href: '/exams/pgt/up-pgt/mock-tests/', label: 'PGT Mock Tests' }
    ]
  };

  addSection({
    id: 'paths', order: 120, title: '', needs: '', bare: true,
    render: function (ctx) {
      var picked = ctx.exams || [];
      var pathRow = picked.length
        ? '<div class="dashstrip-row">' +
            '<span class="dashstrip-lbl">Your paths</span>' +
            '<span class="dashstrip-items">' + picked.map(function (e) {
              var page = PATH_PAGE[e.id];
              var tag = e.primary ? '<i>Main path</i>' : '';
              return page
                ? '<a class="dashstrip-pill" href="' + page + '">' + esc(e.name) + tag + '</a>'
                : '<span class="dashstrip-pill is-plain">' + esc(e.name) + tag + '</span>';
            }).join('') + '</span>' +
            '<a class="dashstrip-link" href="/account/">Change on My Account</a>' +
          '</div>'
        : '';
      var extra = [];
      picked.forEach(function (e) { (PATH_LINKS[e.id] || []).forEach(function (l) { extra.push(l); }); });
      var quickRow = '<div class="dashstrip-row">' +
        '<span class="dashstrip-lbl">Go straight to</span>' +
        '<span class="dashstrip-items">' + extra.concat(QUICK_LINKS).map(function (l) {
          return '<a class="dashstrip-pill is-tool" href="' + l.href + '">' + esc(l.label) + '</a>';
        }).join('') + '</span>' +
      '</div>';
      return '<div class="dashstrip">' + pathRow + quickRow + '</div>';
    }
  });

  /* ---------- the page ---------- */

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

  /* The header: the banner painting with the owner's own quote, then a
     centred greeting on its own painted panel. Both pictures carry their own
     artwork and wording, so nothing here changes when one is replaced:
       /assets/dash-banner.webp   the wide painting at the top
       /assets/dash-box.webp      the panel the greeting sits on (CSS) */
  var HERO_ALT = 'Professor AK beside a university building, with his words: ' +
    '“Literature is not just to read, but to think, question and connect with life.”';

  function welcomeHero(ctx) {
    var name = ctx.name || 'there';
    var fresh = !ctx.attemptsError && !ctx.rows.length;
    var line = fresh
      ? 'Start your English literature journey.'
      : 'Continue your English literature journey.';
    var primary = (ctx.exams || []).filter(function (e) { return e.primary; })[0];
    return '<section class="dashhero">' +
      '<div class="dashhero-banner">' +
        '<img src="/assets/dash-banner.webp" alt="' + esc(HERO_ALT) + '" width="1460" height="324">' +
      '</div>' +
      '<div class="dashhero-box">' +
        '<img class="dashhero-ava" src="' + ((window.akAuth && window.akAuth.avatarUrl) ? window.akAuth.avatarUrl(ctx.avatar) : '/assets/avatars/default.svg') + '" alt="" width="74" height="74">' +
        '<p class="eyebrow">Your progress</p>' +
        '<h2 class="dashhero-title">' +
          '<span class="dashhero-hi">' + (fresh ? 'Welcome,' : 'Welcome back,') +
            '<i aria-hidden="true">🙏</i></span>' +
          '<span class="dashhero-name">' + esc(name) + '<i aria-hidden="true">😊</i></span>' +
        '</h2>' +
        '<p class="dashhero-line">' + esc(line) + '</p>' +
        (primary ? '<p class="dashhero-path">Your main path: <b>' + esc(primary.name) + '</b></p>' : '') +
      '</div>' +
    '</section>';
  }

  // One card, with its heading and the "+" button when it has a full page.
  function card(def, body) {
    var head = '';
    if (def.title || def.more) {
      head = '<div class="acctcard-head">' +
        (def.title ? '<h2>' + esc(def.title) + '</h2>' : '') +
        (def.more ? '<a class="dashplus" href="' + esc(def.more.href) + '" title="' + esc(def.more.label) + '">' +
          '<span aria-hidden="true">+</span><span class="sr-only">' + esc(def.more.label) + '</span></a>' : '') +
        '</div>';
    }
    return '<section class="acctcard dashcard" data-section="' + esc(def.id) + '">' + head + body + '</section>';
  }

  // Sections in order. A run of 'half' cards is paired two to a line.
  function renderMain(ctx) {
    var html = welcomeHero(ctx) +
      (ctx.attemptsError ? ERROR_CARD : (ctx.rows.length ? '' : EMPTY_CARD));
    var hasAttempts = !ctx.attemptsError && ctx.rows.length > 0;

    // Work out every card first, so an empty one never leaves a hole in a pair.
    var made = [];
    sections.slice().sort(function (a, b) { return a.order - b.order; }).forEach(function (def) {
      if (def.needs === 'attempts' && !hasAttempts) return;
      var body = '';
      try { body = def.render(ctx) || ''; } catch (e) { body = ''; }    // one broken section never breaks the page
      if (!body) return;
      made.push({ def: def, html: def.bare ? body : card(def, body) });
    });

    for (var i = 0; i < made.length; i++) {
      if (made[i].def.col === 'half' && made[i + 1] && made[i + 1].def.col === 'half') {
        html += '<div class="dashpair">' + made[i].html + made[i + 1].html + '</div>';
        i++;
      } else {
        html += made[i].html;
      }
    }
    return html;
  }

  /* ---------- the two full-list pages ---------- */

  // /dashboard/ages/ — all 20 ages, one tile each, plus the period breakdown.
  function renderAges(ctx) {
    if (ctx.attemptsError) return ERROR_CARD;
    if (!ctx.rows.length) return EMPTY_CARD;
    var B = ctx.british, out = '';
    if (!B) {
      out += card({ id: 'ages', title: 'Your 20 ages' },
        '<p class="small">We could not load the syllabus. Please refresh the page to try again.</p>');
    } else {
      var tiles = B.ages.map(function (a) {
        var accPc = Math.round(a.acc * 100), cov = Math.round(a.coverage * 100);
        var state = a.cleared ? 'is-cleared' : a.answered ? 'is-doing' : '';
        var right = a.cleared
          ? '<span class="dashage-done">✓ Cleared</span>'
          : '<span class="dashage-hint">' + esc(a.hint) + '</span>';
        return '<li class="dashage ' + state + (a.slug === ctx.currentAge ? ' is-now' : '') + '">' +
          '<div class="dashage-top"><b>' + esc(a.name) + '</b>' + right + '</div>' +
          '<div class="dashage-meta">' + a.answered + ' / ' + a.total + ' answered (' + cov + '%)' +
            (a.answered ? ' &middot; ' + accPc + '% correct' : '') + '</div>' +
          (a.mcqTotal
            ? '<div class="dashage-split">Daily quiz ' + a.dAnswered + ' of ' + a.dailyTotal +
              ' &middot; MCQ ' + a.mAnswered + ' of ' + a.mcqTotal + '</div>' : '') +
          '<div class="dashbar" aria-hidden="true"><span class="' + (a.acc >= B.accGate ? 'ok' : '') +
            '" style="width:' + accPc + '%"></span><i class="dashbar-gate" style="left:' +
            Math.round(B.accGate * 100) + '%"></i></div>' +
          '<div class="dashage-foot"><a href="/quizzes/daily/' + esc(a.slug) + '/">Take this quiz</a></div>' +
        '</li>';
      }).join('');
      out += card({ id: 'agesall', title: 'Your 20 British ages' },
        '<p class="small">An age is cleared when you have answered 60% of its questions and got 60% of those right. ' +
        'Its questions are the Daily quiz questions and the MCQs of that age. ' +
        'The bar shows how well you have answered; the gold line is the 60% mark.</p>' +
        '<ol class="dashagelist">' + tiles + '</ol>');
    }
    if (!ctx.namesError) {
      var rows = sortedGroups(ctx.stats.periods, function (k) { return periodName(ctx, k); });
      if (rows.length) {
        out += card({ id: 'periodsall', title: 'Your answers by period' },
          '<ul class="dashlist">' + rows.map(function (r) { return groupRow(r.name, '', r.g); }).join('') + '</ul>');
      }
    }
    return out + backLink();
  }

  // /dashboard/topics/ — every topic, then strengths and weak spots in full.
  function renderTopics(ctx) {
    if (ctx.attemptsError) return ERROR_CARD;
    if (!ctx.rows.length) return EMPTY_CARD;
    if (ctx.namesError) return card({ id: 'topicsall', title: 'Your topics' }, NAMES_FAILED) + backLink();
    var out = '';
    var rows = sortedGroups(ctx.stats.topics, function (k) { return topicName(ctx, k); });
    if (rows.length) {
      out += card({ id: 'topicsall', title: 'Your answers by topic' },
        '<ul class="dashlist">' + rows.map(function (r, i) {
          var t = ctx.names[r.key];
          var kind = t ? (KIND_LABEL[t.kind] || '') : '';
          return groupRow(r.name, kind, r.g, i >= TOP_TOPICS ? 'dashrow-extra' : '', i >= TOP_TOPICS);
        }).join('') + '</ul>' +
        (rows.length > TOP_TOPICS
          ? '<button class="chip dashmore" type="button" data-dash-toggle aria-expanded="false" ' +
            'data-more="Show all ' + rows.length + ' topics" data-less="Show fewer">Show all ' +
            rows.length + ' topics</button>' : ''));
    }
    var m = measuredTopics(ctx);
    var rule = '<p class="small dashnote">' + esc(TOPIC_RULE) + '</p>';
    out += '<div class="dashpair">' +
      card({ id: 'strengthsall', title: 'Your strengths' },
        !m.measured ? NOT_MEASURED_YET
          : m.strong.length
            ? '<ul class="dashlist">' + m.strong.map(function (r) { return topicRowOf(ctx, r, false); }).join('') + '</ul>' + rule
            : '<p class="small">No topic has reached ' + STRONG_AT + '% yet.</p>') +
      card({ id: 'areasall', title: 'Areas to improve' },
        !m.measured ? NOT_MEASURED_YET
          : m.weak.length
            ? '<ul class="dashlist">' + m.weak.map(function (r) { return topicRowOf(ctx, r, true); }).join('') + '</ul>' + rule
            : '<p class="small">Every topic you have been judged on is at ' + STRONG_AT + '% or more.</p>') +
      '</div>';
    return out + backLink();
  }

  function backLink() {
    return '<p class="dashback"><a href="/dashboard/">&larr; Back to my dashboard</a></p>';
  }

  function renderAll(ctx, view) {
    if (view === 'ages') return renderAges(ctx);
    if (view === 'topics') return renderTopics(ctx);
    return renderMain(ctx);
  }

  // The profile button in the top bar. Until the name is known it keeps the
  // "Log in" wording the page ships with, so nothing is ever guessed.
  function fillUserButton(name, avatar) {
    var el = document.getElementById('dashUser');
    if (!el || !name) return;
    var ava = (window.akAuth && window.akAuth.avatarUrl) ? window.akAuth.avatarUrl(avatar) : '/assets/avatars/default.svg';
    el.setAttribute('href', '/account/');
    el.innerHTML = '<span class="dashtop-ava"><img src="' + ava + '" alt="" width="34" height="34"></span>' +
      '<span class="dashtop-who"><b>' + esc(name) + '</b><i>Student</i></span>' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="m9 5 7 7-7 7"/></svg>';
    el.setAttribute('aria-label', 'My Account — ' + name);
  }

  /* The dashboard bell. Messages come from public.notifications (an admin sends them
     from /admin/notify/). The bell stays disabled while the student has NO notification
     at all — never a dot "for looks" (CLAUDE.md rule 10). Once there is at least one, the
     bell wakes up; a dot with the count shows while any are unread. Opening the panel marks
     them read (public.notification_reads), so the dot clears here and on every device. */
  var NMON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function notifDate(v) {
    var d = new Date(v); if (isNaN(d.getTime())) return '';
    return d.getDate() + ' ' + NMON[d.getMonth()] + ' ' + d.getFullYear();
  }
  function safePath(p) {   // only a same-site path may be a link
    return (typeof p === 'string' && /^\/[^/]/.test(p)) ? p : '';
  }
  function wireBell(client, uid) {
    var bell = document.querySelector('.dashtop-bell');
    if (!bell) return;
    Promise.all([
      client.from('notifications').select('id, title, body, link, created_at')
        .order('created_at', { ascending: false }).limit(50),
      client.from('notification_reads').select('notification_id')
    ]).then(function (r) {
      if (r[0].error) return;                 // on any error, leave the bell disabled
      var notifs = r[0].data || [];
      if (!notifs.length) return;             // nothing behind it — stays disabled (rule 10)
      var read = {};
      ((r[1] && r[1].data) || []).forEach(function (x) { read[x.notification_id] = 1; });
      var unread = notifs.filter(function (n) { return !read[n.id]; });
      enableBell(bell, notifs, unread, client, uid);
    }, function () { /* leave the bell as it is */ });
  }
  function enableBell(bell, notifs, unread, client, uid) {
    bell.disabled = false;
    bell.title = 'Notifications';
    bell.setAttribute('aria-label', 'Notifications' + (unread.length ? ' (' + unread.length + ' new)' : ''));
    if (unread.length) {
      var dot = document.createElement('span');
      dot.className = 'dashbell-dot';
      dot.textContent = unread.length > 9 ? '9+' : String(unread.length);
      bell.appendChild(dot);
    }

    var panel = document.createElement('div');
    panel.className = 'dashbell-panel';
    panel.hidden = true;
    panel.innerHTML = '<div class="dashbell-head">Notifications</div>' +
      '<ul class="dashbell-list">' + notifs.map(function (n) {
        var link = safePath(n.link);
        var inner = '<b>' + esc(n.title) + '</b>' +
          (n.body ? '<span>' + esc(n.body) + '</span>' : '') +
          '<i>' + notifDate(n.created_at) + '</i>';
        var cls = 'dashbell-item' + (read_is_unread(n) ? ' is-unread' : '');
        return '<li class="' + cls + '">' +
          (link ? '<a href="' + esc(link) + '">' + inner + '</a>' : '<div>' + inner + '</div>') +
          '</li>';
      }).join('') + '</ul>';
    function read_is_unread(n) { return unread.some(function (u) { return u.id === n.id; }); }
    bell.parentNode.appendChild(panel);

    function closePanel() { panel.hidden = true; bell.setAttribute('aria-expanded', 'false'); }
    bell.setAttribute('aria-expanded', 'false');
    bell.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var open = panel.hidden;
      panel.hidden = !open;
      bell.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && unread.length) {
        // mark the unread ones read, clear the dot
        var rows = unread.map(function (u) { return { user_id: uid, notification_id: u.id }; });
        client.from('notification_reads').insert(rows).then(function () {}, function () {});
        unread = [];
        var d = bell.querySelector('.dashbell-dot'); if (d) d.remove();
        var items = panel.querySelectorAll('.dashbell-item.is-unread');
        for (var i = 0; i < items.length; i++) items[i].classList.remove('is-unread');
      }
    });
    document.addEventListener('click', function (ev) {
      if (panel.hidden) return;
      if (ev.target === bell || bell.contains(ev.target) || panel.contains(ev.target)) return;
      closePanel();
    });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closePanel(); });
  }

  function start(client, uid, root, user, auth) {
    var view = root.getAttribute('data-view') || 'main';
    wireBell(client, uid);
    root.innerHTML = '<p class="dashloading">Loading your progress…</p>';
    var ctx = {
      now: new Date(), rows: [], truncated: false, stats: null,
      names: {}, namesError: false, exams: [], attemptsError: false,
      name: (auth && user && auth.nameFrom(user, '')) || '',  // quick name; refined by the profile below
      board: null, syllabus: null, british: null, currentAge: '', runs: null,
      avatar: ''   // chosen avatar id; empty = default (graduation cap)
    };

    fillUserButton(ctx.name, ctx.avatar);                   // the quick name, right away
    var pName = loadProfile(client, uid).then(function (p) {
      if (auth && user) {
        if (p.name) ctx.name = auth.nameFrom(user, p.name);
        ctx.avatar = p.avatar || '';
        fillUserButton(ctx.name, ctx.avatar);
      }
    }, function () { /* keep the quick name */ });

    var pBoard = loadBoard(client).then(function (b) { ctx.board = b; }, function () { ctx.board = null; });
    var pSyl = loadSyllabus().then(function (s) { ctx.syllabus = s; }, function () { ctx.syllabus = null; });
    var pRuns = loadRuns(client, uid).then(function (n) { ctx.runs = n; }, function () { ctx.runs = null; });

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

    Promise.all([pAttempts, pExams, pName, pBoard, pSyl, pRuns]).then(function () {
      try { ctx.british = computeBritish(ctx.rows, ctx.syllabus); } catch (e) { ctx.british = null; }
      try { ctx.currentAge = currentAge(ctx.rows, ctx.british); } catch (e) { ctx.currentAge = ''; }
      root.innerHTML = renderAll(ctx, view);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var notice = document.getElementById('dashNotice');
    var signin = document.getElementById('dashSignin');
    var body = document.getElementById('dashBody');
    var root = document.getElementById('dashSections');
    if (!root) return;

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

  // "Week of 3 Nov" style label for the chart.
  function weekLabel(d) {
    var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + m[d.getMonth()];
  }
})();
