/* ==========================================================
   AK Explained — home page account bar (landing page only)
   ----------------------------------------------------------
   The thin strip above the hero on the home page. For a
   logged-in student it shows their avatar, their name and a
   notification bell — the SAME bell as the dashboard — so they
   can read a notice and reach their account without opening the
   dashboard. Clicking the avatar opens a small menu (My account,
   My dashboard, Write a review, Log out). A guest sees the
   "Log in" and "Sign up" buttons instead.

   Login state (guest vs student), the name and the avatar are
   painted by assets/auth.js through the shared [data-auth-*]
   controls, so there is no flicker and no second source of truth.
   This file only adds the bell and the drop-down menu. It never
   gates anything: with accounts switched off it does nothing and
   the guest buttons simply stay.
   ========================================================== */
(function () {
  'use strict';

  var bar = document.querySelector('.homebar');
  if (!bar) return;
  // The dashboard has its own top bar (.dashtop) with the same bell and profile.
  // Never run a second one there (CSS also hides .homebar on that page).
  if (document.querySelector('.dashtop')) { bar.style.display = 'none'; return; }

  function waitForAuth(cb) {
    var n = 0;
    (function look() {
      if (window.akAuth) return cb(window.akAuth);
      if (n++ > 150) return cb(null);          // ~4.5s, then give up quietly
      setTimeout(look, 30);
    })();
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- the account drop-down (avatar → menu) ---------- */
  function wireMenu() {
    var btn = bar.querySelector('.homebar-user');
    var menu = bar.querySelector('.homebar-menu');
    if (!btn || !menu) return;
    function close() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    function open() { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (menu.hidden) open(); else close();
    });
    document.addEventListener('click', function (e) {
      if (menu.hidden) return;
      if (e.target === btn || btn.contains(e.target) || menu.contains(e.target)) return;
      close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  // The name and avatar for the menu's header line. The button label itself is
  // painted by auth.js; this just mirrors it inside the open menu.
  function fillMenuHead(auth, name, avatar) {
    var head = bar.querySelector('.homebar-menu-head');
    if (!head) return;
    var ava = (auth && auth.avatarUrl) ? auth.avatarUrl(avatar) : '/assets/avatars/default.svg';
    head.innerHTML = '<img src="' + esc(ava) + '" alt="" width="40" height="40">' +
      '<span><b>' + esc(name || 'Student') + '</b><i>You are logged in</i></span>';
  }

  function wireLogout(auth) {
    var out = bar.querySelector('[data-homebar-logout]');
    if (!out) return;
    out.addEventListener('click', function (e) {
      e.preventDefault();
      out.textContent = 'Logging out…';
      function done() {
        try { localStorage.removeItem('ak:name'); localStorage.removeItem('ak:avatar'); } catch (x) { /* ignore */ }
        location.replace('/');
      }
      try {
        if (auth && auth.client) auth.client.auth.signOut().then(done, done);
        else done();
      } catch (x) { done(); }
    });
  }

  /* ---------- the bell (same source as the dashboard) ----------
     Messages come from public.notifications, sent by an admin at
     /admin/notify/. The bell stays disabled while the student has NO
     notification at all — never a dot "for looks" (CLAUDE.md rule 10).
     Opening the panel marks the unread ones read (notification_reads),
     so the dot clears here and on the dashboard and on every device. */
  var NMON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function notifDate(v) {
    var d = new Date(v); if (isNaN(d.getTime())) return '';
    return d.getDate() + ' ' + NMON[d.getMonth()] + ' ' + d.getFullYear();
  }
  function safePath(p) {                         // only a same-site path may be a link
    return (typeof p === 'string' && /^\/[^/]/.test(p)) ? p : '';
  }

  function wireBell(client, uid) {
    var bell = bar.querySelector('.homebar-bell');
    if (!bell) return;
    Promise.all([
      client.from('notifications').select('id, title, body, link, created_at')
        .order('created_at', { ascending: false }).limit(50),
      client.from('notification_reads').select('notification_id')
    ]).then(function (r) {
      if (r[0].error) return;                    // on any error, leave the bell disabled
      var notifs = r[0].data || [];
      if (!notifs.length) return;                // nothing behind it — stays disabled (rule 10)
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

    function isUnread(n) { return unread.some(function (u) { return u.id === n.id; }); }
    var panel = document.createElement('div');
    panel.className = 'dashbell-panel homebar-bellpanel';
    panel.hidden = true;
    panel.innerHTML = '<div class="dashbell-head">Notifications</div>' +
      '<ul class="dashbell-list">' + notifs.map(function (n) {
        var link = safePath(n.link);
        var inner = '<b>' + esc(n.title) + '</b>' +
          (n.body ? '<span>' + esc(n.body) + '</span>' : '') +
          '<i>' + notifDate(n.created_at) + '</i>';
        return '<li class="dashbell-item' + (isUnread(n) ? ' is-unread' : '') + '">' +
          (link ? '<a href="' + esc(link) + '">' + inner + '</a>' : '<div>' + inner + '</div>') +
          '</li>';
      }).join('') + '</ul>';
    bell.parentNode.appendChild(panel);

    function close() { panel.hidden = true; bell.setAttribute('aria-expanded', 'false'); }
    bell.setAttribute('aria-expanded', 'false');
    bell.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var open = panel.hidden;
      panel.hidden = !open;
      bell.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && unread.length) {
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
      close();
    });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') close(); });
  }

  /* ---------- go ---------- */
  wireMenu();                                    // menu toggle works even before the network answers

  waitForAuth(function (auth) {
    if (!auth || !auth.configured) return;       // accounts off: the guest buttons simply stay
    wireLogout(auth);
    auth.session().then(function (session) {
      if (!session || !session.user) return;     // a guest: nothing to wire, bell stays hidden
      var uid = session.user.id, name = '', avatar = '';
      try { name = localStorage.getItem('ak:name') || ''; } catch (e) { /* ignore */ }
      try { avatar = localStorage.getItem('ak:avatar') || ''; } catch (e) { /* ignore */ }
      fillMenuHead(auth, name, avatar);
      wireBell(auth.client, uid);
    }, function () { /* could not read the session: leave the guest buttons */ });
  });
})();
