/* ==========================================================
   AK Explained — login / signup / choose-your-path
   Runs only on /login/. Uses the shared client from auth.js.
   Login is the default view; signup is one click away.
   ========================================================== */
(function () {
  'use strict';

  // Turn a raw Supabase error into a short, plain message. We still fall back
  // to the raw text so nothing ever fails silently.
  function friendly(err) {
    var m = (err && err.message ? err.message : String(err || 'Something went wrong')).trim();
    var low = m.toLowerCase();
    if (low.indexOf('invalid login') > -1 || low.indexOf('invalid credentials') > -1) {
      return 'Wrong email or password. Please try again.';
    }
    if (low.indexOf('password') > -1 && (low.indexOf('6') > -1 || low.indexOf('short') > -1 || low.indexOf('weak') > -1 || low.indexOf('least') > -1)) {
      return 'That password is too weak. Use at least 6 characters.';
    }
    if (low.indexOf('email') > -1 && low.indexOf('valid') > -1) {
      return 'Please enter a valid email address.';
    }
    if (low.indexOf('email not confirmed') > -1) {
      return 'Please confirm your email first, then log in.';
    }
    return m;
  }

  function isAlreadyRegistered(err) {
    var low = (err && err.message ? err.message : '').toLowerCase();
    return low.indexOf('already registered') > -1 ||
           low.indexOf('already exists') > -1 ||
           low.indexOf('already been registered') > -1 ||
           low.indexOf('user already') > -1;
  }

  function showError(box, msg) { if (box) { box.textContent = msg; box.hidden = false; } }
  function clearError(box) { if (box) { box.textContent = ''; box.hidden = true; } }

  function waitForAuth(cb) {
    var tries = 0;
    (function check() {
      if (window.akAuth) return cb(window.akAuth);
      if (tries++ > 150) return cb(null); // ~4.5s
      setTimeout(check, 30);
    })();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var signupForm = document.getElementById('signupForm');
    var loginForm  = document.getElementById('loginForm');
    var split      = document.getElementById('authSplit');
    var pathScreen = document.getElementById('pathScreen');
    var notice     = document.getElementById('authNotice');

    // Switch between login and signup. prefillEmail (optional) is dropped into
    // whichever form we switch to.
    function switchTo(view, prefillEmail) {
      signupForm.hidden = (view !== 'signup');
      loginForm.hidden  = (view !== 'login');
      clearError(signupForm.querySelector('.formerror'));
      clearError(loginForm.querySelector('.formerror'));
      var target = (view === 'signup') ? signupForm : loginForm;
      if (prefillEmail && target.email) target.email.value = prefillEmail;
      // Put the cursor where the user will type next.
      var focusEl = (view === 'login' && prefillEmail) ? target.password : target.email;
      if (focusEl && focusEl.focus) { try { focusEl.focus({ preventScroll: true }); } catch (e) { focusEl.focus(); } }
    }

    document.querySelectorAll('[data-view]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); switchTo(a.getAttribute('data-view')); });
    });

    // Forgot password: no SMTP yet, so be honest instead of failing silently.
    var forgotLink = document.getElementById('forgotLink');
    var forgotNote = document.getElementById('forgotNote');
    if (forgotLink && forgotNote) {
      forgotLink.addEventListener('click', function (e) { e.preventDefault(); forgotNote.hidden = false; });
    }

    waitForAuth(function (auth) {
      if (!auth || !auth.configured) {
        split.hidden = true;
        if (pathScreen) pathScreen.hidden = true;
        notice.hidden = false;
        notice.textContent = 'Accounts are not switched on yet. Please check back soon — the rest of the site is open as usual.';
        return;
      }
      wire(auth);
    });

    function wire(auth) {
      var client = auth.client;
      var forcePath = /[?&]path=1\b/.test(location.search);

      // Already logged in? Leave /login/ for /account/ — unless ?path=1 asked
      // explicitly to change the chosen path.
      auth.session().then(function (session) {
        if (session && session.user) {
          if (forcePath) openPath(session);
          else location.replace('/account/');
        }
      });

      // ---- signup ----
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var box = signupForm.querySelector('.formerror');
        clearError(box);
        var name = signupForm.name.value.trim();
        var email = signupForm.email.value.trim();
        var password = signupForm.password.value;
        if (!name) { showError(box, 'Please enter your name.'); return; }
        if (!email) { showError(box, 'Please enter your email.'); return; }
        if (password.length < 6) { showError(box, 'That password is too weak. Use at least 6 characters.'); return; }

        var submit = signupForm.querySelector('button[type=submit]');
        submit.disabled = true; submit.textContent = 'Creating…';

        client.auth.signUp({
          email: email,
          password: password,
          options: { data: { display_name: name } }
        }).then(function (res) {
          submit.disabled = false; submit.textContent = 'Create account';
          if (res.error) {
            if (isAlreadyRegistered(res.error)) { showRegisteredError(box, email); return; }
            showError(box, friendly(res.error));
            return;
          }
          if (res.data.session && res.data.user) {
            // Confirmation is off: logged in now. Save the name, choose path.
            saveName(client, res.data.user.id, name).then(function () {
              auth.cacheName(name);
              if (auth.refreshHeader) auth.refreshHeader(res.data.session);
              openPath(res.data.session);
            });
          } else {
            // Fallback only if email confirmation is ever turned back on.
            split.querySelector('.authforms').hidden = true;
            document.querySelector('.authbenefits').hidden = true;
            notice.hidden = false;
            notice.textContent = 'Account created. Please check your email to confirm it, then come back and log in.';
          }
        }).catch(function (err) {
          submit.disabled = false; submit.textContent = 'Create account';
          showError(box, friendly(err));
        });
      });

      // Build the "already registered" message with a link into the login form.
      function showRegisteredError(box, email) {
        box.textContent = 'This email is already registered. ';
        var a = document.createElement('a');
        a.href = '#';
        a.textContent = 'Log in instead';
        a.addEventListener('click', function (e) { e.preventDefault(); switchTo('login', email); });
        box.appendChild(a);
        box.hidden = false;
      }

      // ---- login ----
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var box = loginForm.querySelector('.formerror');
        clearError(box);
        var email = loginForm.email.value.trim();
        var password = loginForm.password.value;
        if (!email || !password) { showError(box, 'Please enter your email and password.'); return; }

        var submit = loginForm.querySelector('button[type=submit]');
        submit.disabled = true; submit.textContent = 'Signing in…';

        client.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
          submit.disabled = false; submit.textContent = 'Sign in';
          if (res.error) { showError(box, friendly(res.error)); return; }
          if (auth.refreshHeader) auth.refreshHeader(res.data.session);
          // Returning user → their account. (Path was chosen at signup.)
          location.replace('/account/');
        }).catch(function (err) {
          submit.disabled = false; submit.textContent = 'Sign in';
          showError(box, friendly(err));
        });
      });

      // ---- choose your path ----
      function openPath(session) {
        split.hidden = true;
        notice.hidden = true;
        pathScreen.hidden = false;
        buildPath(client, session);
      }
    }
  });

  // Save the display name onto the profile row (created by the DB trigger).
  function saveName(client, userId, name) {
    return client.from('profiles').update({ display_name: name }).eq('id', userId)
      .then(function () {}).catch(function () {});
  }

  // Build the grouped path chooser from the exams table (never hardcoded).
  function buildPath(client, session) {
    var wrap = document.getElementById('pathGroups');
    var box = document.querySelector('#pathScreen .formerror');
    var selection = []; // exam ids, in the order the user picked them

    client.from('exams').select('*').order('sort_order', { ascending: true })
      .then(function (res) {
        if (res.error) { wrap.innerHTML = '<p class="small">Could not load the options. Please refresh.</p>'; return; }
        render(res.data || []);
      });

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    }); }

    function render(rows) {
      var exams = rows.filter(function (r) { return r.kind === 'exam'; });
      var degrees = rows.filter(function (r) { return r.kind === 'degree'; });
      var journeys = rows.filter(function (r) { return r.kind === 'journey'; });

      var html = '';
      if (exams.length) html += groupHtml('Competitive exams', exams.map(optHtml).join(''));

      var byInst = {}, instOrder = [];
      degrees.forEach(function (r) {
        var key = r.institution || r.name;
        if (!byInst[key]) { byInst[key] = []; instOrder.push(key); }
        byInst[key].push(r);
      });
      var degHtml = '';
      instOrder.forEach(function (inst) {
        degHtml += '<div class="pathinst"><h4>' + esc(inst) + '</h4>' +
                   byInst[inst].map(optHtml).join('') + '</div>';
      });
      if (degrees.length) html += groupHtml('University degree', degHtml);

      if (journeys.length) html += groupHtml('Literature journey', journeys.map(optHtml).join(''));

      wrap.innerHTML = html;
      wrap.querySelectorAll('input[type=checkbox]').forEach(function (cb) { cb.addEventListener('change', onToggle); });
      wrap.querySelectorAll('.notifybtn').forEach(function (b) { b.addEventListener('click', onNotify); });
    }

    function groupHtml(title, inner) {
      return '<section class="pathgroup"><h3>' + esc(title) + '</h3>' + inner + '</section>';
    }

    function optHtml(r) {
      var active = r.status === 'active';
      var label = r.name;
      if (r.kind === 'degree' && r.level) {
        label = (r.level === 'ba' ? 'BA English' : r.level === 'ma' ? 'MA English' : r.level);
      }
      if (active) {
        return '<label class="pathopt" data-id="' + esc(r.id) + '">' +
               '<input type="checkbox" value="' + esc(r.id) + '">' +
               '<span class="optname">' + esc(label) + '</span>' +
               '<span class="primtag" hidden>Main</span>' +
               '</label>';
      }
      return '<div class="pathopt is-soon" data-id="' + esc(r.id) + '">' +
             '<span class="optname">' + esc(label) + '</span>' +
             '<span class="soontag">Coming soon</span>' +
             '<button type="button" class="notifybtn" data-id="' + esc(r.id) + '">Notify me when ready</button>' +
             '</div>';
    }

    function onToggle(e) {
      var id = e.target.value;
      if (e.target.checked) { if (selection.indexOf(id) < 0) selection.push(id); }
      else { var i = selection.indexOf(id); if (i > -1) selection.splice(i, 1); }
      paintPrimary();
    }

    function paintPrimary() {
      wrap.querySelectorAll('.pathopt').forEach(function (opt) {
        var tag = opt.querySelector('.primtag');
        if (!tag) return;
        tag.hidden = !(selection.length && selection[0] === opt.getAttribute('data-id'));
      });
    }

    function onNotify(e) {
      var btn = e.currentTarget;
      var id = btn.getAttribute('data-id');
      btn.disabled = true;
      client.from('notify_requests').upsert(
        { user_id: session.user.id, exam_id: id },
        { onConflict: 'user_id,exam_id', ignoreDuplicates: true }
      ).then(function (res) {
        if (res.error) { btn.disabled = false; btn.textContent = 'Try again'; return; }
        btn.textContent = "We'll let you know ✓";
      }).catch(function () { btn.disabled = false; btn.textContent = 'Try again'; });
    }

    document.getElementById('pathSave').addEventListener('click', function () {
      clearError(box);
      if (!selection.length) { showError(box, 'Pick at least one path, or press Skip for now.'); return; }
      commit(selection, selection[0]);
    });
    document.getElementById('pathSkip').addEventListener('click', function () {
      commit(['literature-journey'], 'literature-journey');
    });

    function commit(ids, primaryId) {
      var btnSave = document.getElementById('pathSave');
      var btnSkip = document.getElementById('pathSkip');
      btnSave.disabled = true; btnSkip.disabled = true;
      client.from('user_exams').delete().eq('user_id', session.user.id).then(function () {
        var rows = ids.map(function (id) {
          return { user_id: session.user.id, exam_id: id, is_primary: id === primaryId };
        });
        return client.from('user_exams').insert(rows);
      }).then(function (res) {
        if (res && res.error) {
          btnSave.disabled = false; btnSkip.disabled = false;
          showError(box, res.error.message || 'Could not save. Please try again.');
          return;
        }
        location.replace('/account/');
      }).catch(function (err) {
        btnSave.disabled = false; btnSkip.disabled = false;
        showError(box, (err && err.message) || 'Could not save. Please try again.');
      });
    }

    function clearError(b) { if (b) { b.textContent = ''; b.hidden = true; } }
    function showError(b, m) { if (b) { b.textContent = m; b.hidden = false; } }
  }
})();
