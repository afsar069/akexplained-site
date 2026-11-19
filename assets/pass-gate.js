/* =========================================================
   PASS GATE — "Get access" on paid cards  (owner, 2026-11-19; CLAUDE.md rule 22)

   Before: a logged-in student pressed Start on a paid test, the test page opened,
   and only THEN a middle page said "needs the All Access pass". Now the card
   itself says it:
     - guest (not logged in)         -> the padlock, as always (goes to login)
     - logged in, with a running pass, or an admin -> Start
     - logged in, no running pass    -> "Get access" (goes to /pass/?next=<test>)
   After paying, /pass/ sends the student back to the test.

   Which buttons: a paid card marks its Start button with data-pass-start (the
   templates and paper-list.js / mcq-age.js / net-pyq-live.js do that). This script
   puts a "Get access" twin right after it and shows one of the two. Both carry
   data-auth-only, so auth.js still hides them from a guest; the swap here uses
   its own class (.pass-hide), never `hidden`, so the two do not fight.

   It only reads the student's OWN rows (RLS): paper_admins and passes. If either
   read fails nothing is held back: Start stays (the test page still protects the
   questions, the real lock is the database). Pages with no paid card make no
   request at all.

   The other half: when a logged-in student without a pass opens a paid test page
   directly (a shared link, a bookmark), cbt.js sends them to that exam's page and
   leaves a note in sessionStorage ('ak:passNeeded'). This script shows it as a
   banner there: "That test needs the All Access pass. You can try the free tests
   on this page first..." with a Get access button that returns to that test.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var state = null;        // { loggedIn, access }  access: true | false | null (unknown)
  var loading = false;

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

  function stamp(v) { return Date.parse(String(v).replace(/(\.\d{3})\d+/, '$1')); }

  /* true = can open paid tests now (admin, or a running pass); false = cannot; null = unknown. */
  function readState() {
    return whenAuth().then(function (a) {
      if (!a || !a.configured || !a.client) return { loggedIn: false, access: null };
      return a.session().then(function (s) {
        if (!s || !s.user) return { loggedIn: false, access: null };
        return a.client.from('paper_admins').select('user_id').maybeSingle().then(function (r) {
          if (r && r.error) return { loggedIn: true, access: null };
          if (r && r.data) return { loggedIn: true, access: true };
          return a.client.from('passes').select('starts_at, ends_at')
            .gt('ends_at', new Date().toISOString()).limit(20).then(function (p) {
              if (p.error || !Array.isArray(p.data)) return { loggedIn: true, access: null };
              var now = Date.now();
              var ok = p.data.some(function (x) { return stamp(x.starts_at) <= now && stamp(x.ends_at) > now; });
              return { loggedIn: true, access: ok };
            });
        });
      });
    }).then(null, function () { return { loggedIn: false, access: null }; });
  }

  function twinOf(start) {
    var ga = start.nextElementSibling;
    if (ga && ga.hasAttribute('data-pass-getaccess')) return ga;
    ga = document.createElement('a');
    ga.className = start.className.replace(/\bpass-hide\b/g, '').trim() +
      (/\bagehub-go\b/.test(start.className) && !/\bis-solid\b/.test(start.className) ? ' is-solid' : '') + ' pass-hide';
    ga.setAttribute('data-pass-getaccess', '');
    ga.setAttribute('data-auth-only', '');
    ga.hidden = start.hidden;
    ga.href = '/pass/?next=' + encodeURIComponent(start.getAttribute('href') || '/');
    ga.textContent = 'Get access';
    var label = start.getAttribute('aria-label');
    if (label) ga.setAttribute('aria-label', 'Get access to ' + label.replace(/^Start\s*/i, ''));
    start.parentNode.insertBefore(ga, start.nextSibling);
    return ga;
  }

  function paint() {
    var noPass = !!(state && state.loggedIn && state.access === false);
    var starts = document.querySelectorAll('a[data-pass-start]');
    for (var i = 0; i < starts.length; i++) {
      var st = starts[i], ga = twinOf(st);
      st.classList.toggle('pass-hide', noPass);
      ga.classList.toggle('pass-hide', !noPass);
    }
  }

  function settle(s) {
    state = s;
    html.classList.remove('pass-gate-pending');
    paint();
  }

  /* Called on load and by the hub scripts right after they build cards. */
  function refresh() {
    if (!document.querySelector('a[data-pass-start]')) return;   // no paid card: no request, no change
    if (state) { paint(); return; }
    if (loading) return;
    loading = true;
    html.classList.add('pass-gate-pending');                      // keep Start hidden until we know
    readState().then(settle);
    setTimeout(function () { if (!state) settle({ loggedIn: false, access: null }); }, 5000);
  }

  /* The note left by cbt.js when it sent a student without a pass here. */
  function banner() {
    var raw = null;
    try { raw = sessionStorage.getItem('ak:passNeeded'); sessionStorage.removeItem('ak:passNeeded'); } catch (e) { return; }
    if (!raw) return;
    var d = null;
    try { d = JSON.parse(raw); } catch (e) { return; }
    if (!d || typeof d.next !== 'string' || !/^\/(?![\/\\])/.test(d.next)) return;
    if (Date.now() - (d.t || 0) > 10 * 60 * 1000) return;       // an old note: ignore
    if (/^\/pass\//.test(location.pathname)) return;
    var main = document.getElementById('main') || document.querySelector('main');
    if (!main) return;
    var box = document.createElement('div');
    box.className = 'pass-notice';
    box.setAttribute('role', 'status');
    box.innerHTML =
      '<div class="wrap pass-notice-in">' +
        '<p><strong>That test needs the All Access pass.</strong> You can try the free tests on this page first. ' +
        'When you are ready, get access and you will come straight back to that test.</p>' +
        '<a class="btn" href="/pass/?next=' + encodeURIComponent(d.next) + '">Get access</a>' +
        '<button type="button" class="pass-notice-x" aria-label="Close this message">&times;</button>' +
      '</div>';
    var head = main.querySelector('.pagehead');
    if (head && head.parentNode) head.parentNode.insertBefore(box, head.nextSibling);
    else main.insertBefore(box, main.firstChild);
    box.querySelector('.pass-notice-x').addEventListener('click', function () {
      if (box.parentNode) box.parentNode.removeChild(box);
    });
  }

  window.akPass = { refresh: refresh };

  try { banner(); } catch (e) {}
  refresh();
})();
