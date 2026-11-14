/* =========================================================
   LIVE PAPER LIST  —  assets/paper-list.js

   Self-serve publish (owner, 2026-11-14): a paper-list page draws its cards
   from the LIVE public.paper_catalog when the page is opened, so a paper the
   owner uploads and marks Live appears with no rebuild and no Claude — and
   flipping it back to Draft removes its card at once.

   The page already ships a STATIC list of the papers that were live at build
   time (good for no-JS and search engines). This script quietly replaces that
   list with the live one. If Supabase is off or the read fails, the static
   list stays — the page never ends up blank.

   The host element carries the filter and how to build each card:
     <div class="..." data-paper-list
          data-exam-id="state-psc"            exams row id ('' = no exam)
          data-kind="mock-test"               mock-test | mcq-set
          data-prefix="up-ap-p2-mock-test-"   extra set_id guard (optional)
          data-base="/exams/.../paper-2-mock-tests/"
          data-route="test-{n}/"              link = base + route (number for {n})
          data-label="Mock Test"              card heading, e.g. "Mock Test 05"
          data-empty="No mock tests are open yet.">
       ...static fallback cards...
     </div>

   RLS on paper_catalog only ever returns status = 'live' rows to a guest or a
   student (drafts stay hidden), so this script needs no status logic of its own.
   It reuses the site's guest-lock / Start swap: each card carries
   data-guest-only (the padlock) and data-auth-only (Start), which auth.js shows
   or hides by login state.
   ========================================================= */
(function () {
  'use strict';

  var host = document.querySelector('[data-paper-list]');
  if (!host) return;

  var EXAM_ID = host.getAttribute('data-exam-id') || '';
  var KIND = host.getAttribute('data-kind') || '';
  var PREFIX = host.getAttribute('data-prefix') || '';
  var BASE = host.getAttribute('data-base') || '';
  var ROUTE = host.getAttribute('data-route') || 'test-{n}/';
  var LABEL = host.getAttribute('data-label') || 'Mock Test';
  var EMPTY = host.getAttribute('data-empty') || 'No tests are open yet.';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* auth.js har page par ek Supabase client banata hai (guest ke paas bhi).
     cbt.js ki tarah ~3 second uska intezaar; na bane to guest/static maan lo. */
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

  var LOCK_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
    '<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/>' +
    '<path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

  function labelNum(n) { return String(n).length < 2 ? '0' + n : String(n); }
  function urlFor(n) { return BASE + ROUTE.replace('{n}', n); }

  function cardHtml(row) {
    var n = row.number;
    var url = urlFor(n);
    var name = LABEL + ' ' + n;
    var count = (row.question_count > 0) ? row.question_count + ' questions' : '';
    return '<div class="pgt-practice-card">' +
      '<span class="pgt-practice-card-copy"><strong>' + esc(LABEL + ' ' + labelNum(n)) + '</strong>' +
        (count ? '<span>' + esc(count) + '</span>' : '') + '</span>' +
      '<a class="agehub-go agehub-go-lock" data-guest-only hidden href="/login/?next=' + encodeURIComponent(url) + '" ' +
        'aria-label="' + esc(name) + ' needs a login. Log in to open it." title="' + esc('Log in to open ' + name) + '">' +
        LOCK_SVG + '</a>' +
      '<a class="agehub-go is-solid" data-auth-only hidden href="' + esc(url) + '">Start</a>' +
      '</div>';
  }

  function render(rows) {
    if (!rows.length) {
      host.innerHTML = '<p class="muted">' + esc(EMPTY) + '</p>';
      return;
    }
    host.innerHTML = rows.map(cardHtml).join('');
    /* Cards abhi-abhi bane hain, isliye auth.js se dobara paint karwa lo taaki
       guest ko lock aur logged-in ko Start theek dikhe. Baad me login/logout hone
       par auth.js khud in [data-*-only] cards ko sambhal lega. */
    if (window.akAuth && window.akAuth.refreshHeader && window.akAuth.session) {
      window.akAuth.session().then(function (s) {
        try { window.akAuth.refreshHeader(s); } catch (e) {}
      }, function () {});
    }
  }

  function matches(row) {
    if (KIND && row.kind !== KIND) return false;
    if (EXAM_ID && row.exam_id !== EXAM_ID) return false;
    if (PREFIX && String(row.set_id).indexOf(PREFIX) !== 0) return false;
    return row.number > 0;
  }

  whenAuth().then(function (a) {
    if (!a || !a.configured || !a.client) return;   /* Supabase off — static fallback rahne do */
    var q = a.client.from('paper_catalog').select('set_id,title,exam_id,kind,number,question_count');
    if (KIND) q = q.eq('kind', KIND);
    if (EXAM_ID) q = q.eq('exam_id', EXAM_ID);
    q.order('number', { ascending: true }).then(function (res) {
      if (res.error || !Array.isArray(res.data)) return;   /* read fail — static fallback */
      render(res.data.filter(matches));
    }, function () { /* ignore — static fallback */ });
  });
})();
