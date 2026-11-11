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
        loadAvatar(client, user);
        loadExams(client, user);
        wireLogout(client);
        wireDelete(client, auth);
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

    function loadAvatar(client, user) {
      var grid = document.getElementById('avatarGrid');
      var saved = document.getElementById('avatarSaved');
      if (!grid || !window.akAvatars) return;

      function paint(current) {
        window.akAvatars.buildPicker(grid, current, function (id) {
          // '' = default (graduation cap) -> null store karo; warna character id.
          client.from('profiles').update({ avatar_id: id || null }).eq('id', user.id)
            .then(function (res) {
              if (res.error) return;
              if (saved) {
                saved.hidden = false;
                setTimeout(function () { saved.hidden = true; }, 2000);
              }
            }, function () { /* ignore */ });
        });
      }

      client.from('profiles').select('avatar_id').eq('id', user.id).maybeSingle()
        .then(function (res) { paint((res.data && res.data.avatar_id) || ''); },
              function () { paint(''); });
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

    // Account delete: browser sirf token bhejta hai; asli delete Edge Function `delete-account` karta hai
    // (supabase/functions/delete-account). Baaki data cascade se apne-aap hat jaata hai.
    function wireDelete(client, auth) {
      var openBtn = document.getElementById('deleteBtn');
      var panel   = document.getElementById('deletePanel');
      var input   = document.getElementById('delConfirm');
      var go      = document.getElementById('delGo');
      var cancel  = document.getElementById('delCancel');
      var box     = document.getElementById('delError');
      if (!openBtn || !panel) return;

      function close() {
        panel.hidden = true; box.hidden = true; input.value = ''; go.disabled = true;
        openBtn.hidden = false; openBtn.setAttribute('aria-expanded', 'false');
        openBtn.focus({ preventScroll: true });
      }
      openBtn.addEventListener('click', function () {
        panel.hidden = false; openBtn.hidden = true; openBtn.setAttribute('aria-expanded', 'true');
        input.focus({ preventScroll: true });
      });
      cancel.addEventListener('click', close);
      panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      input.addEventListener('input', function () {
        go.disabled = input.value.trim() !== 'DELETE';
      });

      function fail(msg) {
        box.textContent = msg; box.hidden = false;
        go.disabled = input.value.trim() !== 'DELETE'; cancel.disabled = false; go.textContent = 'Delete everything';
      }

      go.addEventListener('click', function () {
        if (input.value.trim() !== 'DELETE') return;
        box.hidden = true; go.disabled = true; cancel.disabled = true; go.textContent = 'Deleting…';
        var cfg = window.AK_SUPABASE || {};
        client.auth.getSession().then(function (r) {
          var token = r && r.data && r.data.session && r.data.session.access_token;
          if (!token) { fail('Please log in again, then try once more.'); return; }
          return fetch(cfg.url + '/functions/v1/delete-account', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'apikey': cfg.publishableKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirm: 'DELETE' })
          }).then(function (res) {
            if (!res.ok) { fail('We could not delete your account. Please try again in a moment.'); return; }
            done(client);
          });
        }).catch(function () {
          fail('We could not reach the server. Check your connection and try again.');
        });
      });
    }

    function done(client) {
      // Account ab server par nahi hai; is browser ka saved data bhi saaf karo.
      var finish = function () {
        try {
          var gone = [];
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && (k.indexOf('ak:') === 0 || k.indexOf('akd:') === 0)) gone.push(k);
          }
          gone.forEach(function (k) { localStorage.removeItem(k); });
        } catch (e) {}
        document.getElementById('acctBody').hidden = true;
        var notice = document.getElementById('acctNotice');
        notice.hidden = false;
        notice.innerHTML = 'Your account and all your data have been deleted. <a href="/">Go to the home page</a>.';
        notice.setAttribute('tabindex', '-1');
        notice.focus({ preventScroll: true });
      };
      client.auth.signOut({ scope: 'local' }).then(finish, finish);
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
