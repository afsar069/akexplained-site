/* ==========================================================
   AK Explained — owner-only "All articles" page
   ----------------------------------------------------------
   /admin/articles/ par chalti hai (owner, 2026-11-26). List khud build ke
   waqt page me likhi ja chuki hai (_data/articleAdmin.js) — ye file sirf
   do kaam karti hai: admin ka darwaza, aur upar ke box se list chhantna.

   Darwaza wahi hai jo har admin page ka hai: public.paper_admins me row.
   ========================================================== */
(function () {
  'use strict';

  function el(id) { return document.getElementById(id); }
  function show(x) { if (x) x.hidden = false; }
  function hide(x) { if (x) x.hidden = true; }

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

  function wireFind() {
    var box = el('alFind');
    var list = el('alList');
    var none = el('alNone');
    if (!box || !list) return;
    box.addEventListener('input', function () {
      var q = box.value.trim().toLowerCase();
      var rows = list.children;
      var seen = 0;
      for (var i = 0; i < rows.length; i++) {
        var hay = rows[i].getAttribute('data-hay') || '';
        var on = !q || hay.indexOf(q) !== -1;
        rows[i].hidden = !on;
        if (on) seen++;
      }
      if (none) none.hidden = seen !== 0;
    });
  }

  function start() {
    var notice = el('alNotice');
    whenAuth().then(function (auth) {
      function no() { notice.textContent = 'You are not allowed to use this page.'; }
      if (!auth || !auth.configured || !auth.client) return no();
      auth.session().then(function (s) {
        if (!s || !s.user) return no();
        auth.client.from('paper_admins').select('user_id').maybeSingle().then(function (res) {
          if (res.error || !res.data) return no();
          hide(notice);
          show(el('alBody'));
          wireFind();
        }, no);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
