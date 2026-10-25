/* ==========================================================
   AK Explained — account page
   Runs only on /account/. Requires a logged-in user.
   ========================================================== */
(function () {
  'use strict';

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

  document.addEventListener('DOMContentLoaded', function () {
    var notice = document.getElementById('acctNotice');
    var body   = document.getElementById('acctBody');

    waitForAuth(function (auth) {
      if (!auth || !auth.configured) {
        notice.hidden = false;
        notice.textContent = 'Accounts are not switched on yet. Please check back soon.';
        return;
      }
      var client = auth.client;

      auth.session().then(function (session) {
        if (!session || !session.user) { location.replace('/login/'); return; }
        body.hidden = false;
        var user = session.user;
        loadName(client, auth, user);
        loadExams(client, user);
        wireLogout(client);
      });
    });

    function loadName(client, auth, user) {
      var input = document.getElementById('nameInput');
      var form  = document.getElementById('nameForm');
      var saved = document.getElementById('nameSaved');
      var box   = form.querySelector('.formerror');

      client.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
        .then(function (res) {
          var name = (res.data && res.data.display_name) || auth.nameFrom(user, '');
          input.value = name;
        });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        box.hidden = true; saved.hidden = true;
        var name = input.value.trim();
        if (!name) { box.textContent = 'Please enter a name.'; box.hidden = false; return; }
        var btn = form.querySelector('button[type=submit]');
        btn.disabled = true;
        client.from('profiles').update({ display_name: name }).eq('id', user.id)
          .then(function (res) {
            btn.disabled = false;
            if (res.error) { box.textContent = res.error.message; box.hidden = false; return; }
            auth.cacheName(name);
            if (auth.refreshHeader) auth.session().then(auth.refreshHeader);
            saved.hidden = false;
            setTimeout(function () { saved.hidden = true; }, 2500);
          })
          .catch(function (err) {
            btn.disabled = false;
            box.textContent = (err && err.message) || 'Could not save.';
            box.hidden = false;
          });
      });
    }

    function loadExams(client, user) {
      var list = document.getElementById('examList');
      // Join exams for display names, mark the primary one.
      client.from('user_exams')
        .select('exam_id, is_primary, exams ( name, kind, institution, level )')
        .eq('user_id', user.id)
        .then(function (res) {
          if (res.error) { list.innerHTML = '<li class="small">Could not load your paths.</li>'; return; }
          var rows = res.data || [];
          if (!rows.length) {
            list.innerHTML = '<li class="small">You have not picked a path yet. ' +
              '<a href="/login/?path=1">Choose one</a>.</li>';
            return;
          }
          // Primary first, then the rest.
          rows.sort(function (a, b) { return (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0); });
          list.innerHTML = rows.map(function (r) {
            var e = r.exams || {};
            var name = e.name || r.exam_id;
            return '<li class="examitem">' +
              '<span class="examname">' + esc(name) + '</span>' +
              (r.is_primary ? '<span class="primtag">Main path</span>' : '') +
              '</li>';
          }).join('');
        });
    }

    function wireLogout(client) {
      document.getElementById('logoutBtn').addEventListener('click', function () {
        var btn = this;
        btn.disabled = true; btn.textContent = 'Logging out…';
        client.auth.signOut().then(function () {
          try { localStorage.removeItem('ak:name'); } catch (e) {}
          location.replace('/');
        }).catch(function () {
          btn.disabled = false; btn.textContent = 'Log out';
        });
      });
    }
  });
})();
