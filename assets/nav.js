/* ==========================================================
   AK Explained — sidebar menu
   Desktop: always open on the left.  Mobile: hamburger drawer.
   ========================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const body = document.body;
    const btn = document.getElementById('navToggle');
    const nav = document.getElementById('sideNav');
    const scrim = document.getElementById('navScrim');
    if (!btn || !nav) return;

    function setOpen(open) {
      body.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    btn.addEventListener('click', function () {
      setOpen(!body.classList.contains('nav-open'));
    });

    if (scrim) scrim.addEventListener('click', function () { setOpen(false); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('nav-open')) {
        setOpen(false);
        btn.focus();
      }
    });

    // Following a link on mobile should close the drawer behind you.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.matchMedia('(max-width:1023px)').matches) setOpen(false);
    });

    /* Submenus (Exams, Quizzes) — click to expand, keyboard friendly. */
    nav.querySelectorAll('.subtoggle').forEach(function (t) {
      t.addEventListener('click', function () {
        const group = t.closest('.navgroup');
        const open = group.classList.toggle('open');
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    /* Mark the page you are on. */
    const here = location.pathname.replace(/\/+$/, '/') || '/';
    nav.querySelectorAll('ul a[href]').forEach(function (a) {
      const href = a.getAttribute('href');
      if (href === here) {
        a.setAttribute('aria-current', 'page');
        const group = a.closest('.navgroup');
        if (group) { group.classList.add('open'); }
      }
    });
  });
})();
