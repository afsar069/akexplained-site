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
      return 'Wrong email or password. Please try again. If you made your account with Google, use the Continue with Google button.';
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
      var introTitle = document.querySelector('.login-left h1');
      var introSubtitle = document.querySelector('.login-subtitle');
      if (introTitle) introTitle.textContent = view === 'signup' ? 'Create your account' : 'Welcome back';
      if (introSubtitle) introSubtitle.textContent = view === 'signup'
        ? 'Save your study progress with a free account.'
        : 'Pick up where your learning left off.';
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
      var forceReset = /[?&]reset=1\b/.test(location.search);   // test aid, like ?google=1
      var resetReady = forceReset;                               // the settings fetch may turn this on

      // Did we just come back from Google? (set just before we leave for Google)
      var fromGoogle = false;
      try { fromGoogle = sessionStorage.getItem('ak:oauth') === 'google'; } catch (e) { /* private mode */ }
      showReturnError();

      // Landing from an email link? 'recovery' = password reset, 'signup' = email confirmation.
      var isRecovery = auth.urlType === 'recovery';
      var isConfirm  = auth.urlType === 'signup';
      if (isRecovery) openNewPassword();               // show the form at once; the session arrives via the hash
      auth.onRecovery(function () { openNewPassword(); });  // backup, in case the event fires after we subscribe

      // Already logged in? Leave /login/ for /account/ — unless ?path=1 asked explicitly to change the
      // chosen path, a first Google sign-in, a brand-new email confirmation, or a password reset.
      auth.session().then(function (session) {
        if (isRecovery) return;                        // never bounce a reset link away to /account/
        if (session && session.user) {
          if (forcePath) openPath(session);
          else if (fromGoogle) finishGoogle(session);
          else if (isConfirm) finishConfirm(session);
          else location.replace('/account/');
        } else if (fromGoogle) {
          try { sessionStorage.removeItem('ak:oauth'); } catch (e) { /* ignore */ }
        }
      });

      // ---- Continue with Google ----
      // The button stays hidden until Google is switched on in Supabase. The public
      // settings endpoint says which sign-in providers are on, so nothing breaks
      // if the owner has not finished the setup yet.
      var cfg = window.AK_SUPABASE || {};
      var googleBlocks = document.querySelectorAll('[data-google]');
      // Test aid: /login/?google=1 shows the button even if the check below fails.
      var forceGoogle = /[?&]google=1\b/.test(location.search);
      if (forceGoogle) googleBlocks.forEach(function (b) { b.hidden = false; });
      fetch(cfg.url + '/auth/v1/settings', { headers: { apikey: cfg.publishableKey } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (st) {
          if ((st && st.external && st.external.google === true) || forceGoogle) {
            googleBlocks.forEach(function (b) { b.hidden = false; });
          }
          // Confirm-email ON (mailer_autoconfirm === false) means custom SMTP is live, so the reset
          // email will actually be delivered. Only then does "Forgot password?" offer the real form.
          if (st && st.mailer_autoconfirm === false) resetReady = true;
        })
        .catch(function () { /* no Google button; email login still works */ });

      document.querySelectorAll('[data-google-btn]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var form = btn.closest('form');
          var box = form ? form.querySelector('.formerror') : null;
          clearError(box);
          btn.disabled = true;
          function failed() {
            btn.disabled = false;
            showError(box, 'Could not start Google sign-in. Please try again, or use your email.');
          }
          try { sessionStorage.setItem('ak:oauth', 'google'); } catch (e) { /* private mode */ }
          client.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: location.origin + '/login/',
              queryParams: { prompt: 'select_account' } // let people on a shared computer pick the right Google account
            }
          }).then(function (res) {
            if (res && res.error) failed();
            // On success the browser is already on its way to Google.
          }).catch(failed);
        });
      });

      // Back from Google with a logged-in session. A new person gets the same
      // "Choose your path" screen as a new email signup, and their Google name is
      // saved to their profile. Someone who already has a path goes to /account/.
      function finishGoogle(session) {
        try { sessionStorage.removeItem('ak:oauth'); } catch (e) { /* ignore */ }
        var u = session.user;
        var md = u.user_metadata || {};
        var gname = md.full_name || md.name || '';
        Promise.all([
          client.from('profiles').select('display_name').eq('id', u.id).maybeSingle(),
          client.from('user_exams').select('exam_id').eq('user_id', u.id).limit(1)
        ]).then(function (r) {
          var profile = r[0].data;
          var exams = r[1];
          var needName = gname && !(profile && profile.display_name);
          var saved = needName ? saveName(client, u.id, gname).then(function () {
            auth.cacheName(gname);
            if (auth.refreshHeader) auth.refreshHeader(session);
          }) : Promise.resolve();
          return saved.then(function () {
            if (!exams.error && (!exams.data || exams.data.length === 0)) openPath(session);
            else location.replace('/account/');
          });
        }).catch(function () { location.replace('/account/'); });
      }

      // Google (or Supabase) can send the person back with an error in the address.
      function showReturnError() {
        var raw = (location.hash || '').replace(/^#/, '') + '&' + (location.search || '').replace(/^\?/, '');
        var params = {};
        raw.split('&').forEach(function (kv) {
          var i = kv.indexOf('=');
          if (i > 0) { try { params[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); } catch (e) { /* skip */ } }
        });
        if (!params.error && !params.error_description) return;
        var box = loginForm.querySelector('.formerror');
        showError(box, 'Google sign-in did not finish. Please try again, or use your email.' +
          (params.error_description ? ' (' + params.error_description + ')' : ''));
        try { sessionStorage.removeItem('ak:oauth'); } catch (e) { /* ignore */ }
        try { history.replaceState(null, '', location.pathname); } catch (e) { /* ignore */ }
      }

      // ---- forgot password: request a reset email ----
      // "Forgot password?" shows the real form once email is live (resetReady); until then it shows the
      // honest contact note. The success message is the same whether or not the email exists.
      var forgotLink = document.getElementById('forgotLink');
      var forgotNote = document.getElementById('forgotNote');
      var resetBlock = document.getElementById('resetBlock');
      if (forgotLink) forgotLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (resetReady && resetBlock) {
          resetBlock.hidden = false;
          var re = document.getElementById('resetEmail');
          if (re) { re.value = (loginForm.email.value || '').trim(); try { re.focus({ preventScroll: true }); } catch (x) { re.focus(); } }
        } else if (forgotNote) {
          forgotNote.hidden = false;
        }
      });
      var resetSend = document.getElementById('resetSend');
      if (resetSend) resetSend.addEventListener('click', function () {
        var done = document.getElementById('resetDone');
        var field = document.getElementById('resetEmail');
        var email = (field.value || '').trim();
        if (!email) { try { field.focus({ preventScroll: true }); } catch (x) { field.focus(); } return; }
        resetSend.disabled = true; resetSend.textContent = 'Sending…';
        function neutral() { if (done) done.hidden = false; field.disabled = true; resetSend.hidden = true; }
        client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/login/' })
          .then(neutral, neutral);   // stay neutral either way: never reveal whether an account exists
      });

      // ---- set a new password (arrived from a reset email) ----
      var newPassShown = false;
      function openNewPassword() {
        if (newPassShown) return; newPassShown = true;
        split.hidden = true;
        if (pathScreen) pathScreen.hidden = true;
        notice.hidden = true;
        var screen = document.getElementById('newPassScreen');
        if (screen) screen.hidden = false;
        var inp = document.querySelector('#newPassForm input[name=password]');
        if (inp) { try { inp.focus({ preventScroll: true }); } catch (x) { inp.focus(); } }
      }
      var npForm = document.getElementById('newPassForm');
      if (npForm) npForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var box = npForm.querySelector('.formerror'); clearError(box);
        var pw = npForm.password.value;
        if (pw.length < 6) { showError(box, 'That password is too weak. Use at least 6 characters.'); return; }
        var submit = npForm.querySelector('button[type=submit]');
        submit.disabled = true; submit.textContent = 'Saving…';
        client.auth.updateUser({ password: pw }).then(function (res) {
          submit.disabled = false; submit.textContent = 'Set new password';
          if (res.error) { showError(box, friendly(res.error)); return; }
          if (auth.refreshHeader) auth.session().then(function (s) { auth.refreshHeader(s); });
          location.replace('/account/');
        }).catch(function (err) {
          submit.disabled = false; submit.textContent = 'Set new password';
          showError(box, friendly(err));
        });
      });

      // A brand-new user who just confirmed their email: save the name they gave at signup (it is in
      // user_metadata, because there was no session to save it at signup time) and show the path chooser.
      function finishConfirm(session) {
        var u = session.user, md = u.user_metadata || {};
        var nm = md.display_name || md.name || '';
        Promise.all([
          client.from('profiles').select('display_name').eq('id', u.id).maybeSingle(),
          client.from('user_exams').select('exam_id').eq('user_id', u.id).limit(1)
        ]).then(function (r) {
          var profile = r[0].data, exams = r[1];
          var needName = nm && !(profile && profile.display_name);
          var saved = needName ? saveName(client, u.id, nm).then(function () {
            auth.cacheName(nm); if (auth.refreshHeader) auth.refreshHeader(session);
          }) : Promise.resolve();
          return saved.then(function () {
            if (!exams.error && (!exams.data || exams.data.length === 0)) openPath(session);
            else location.replace('/account/');
          });
        }).catch(function () { location.replace('/account/'); });
      }

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
            notice.hidden = false;
            notice.textContent = 'Account created. Open the confirmation link we just emailed you — it brings you back here and signs you in.';
          }
        }).catch(function (err) {
          submit.disabled = false; submit.textContent = 'Create account';
          showError(box, friendly(err));
        });
      });

      // Build the "already registered" message with a link into the login form.
      function showRegisteredError(box, email) {
        box.textContent = 'This email is already registered. If you used Google before, use the Continue with Google button. ';
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
        // The big heading above must say what is on screen (it used to say "Welcome back").
        var left = document.querySelector('.login-left');
        var introTitle = document.querySelector('.login-left h1');
        var introSubtitle = document.querySelector('.login-subtitle');
        if (left) left.classList.add('is-path');
        if (introTitle) introTitle.textContent = 'Choose your path';
        if (introSubtitle) introSubtitle.textContent = 'Pick what you are preparing for.';
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

    function isActive(r) { return r.status === 'active'; }

    // Inside a group: what you can pick today first, then the "Coming soon" ones, kept small and
    // under their own label. Nothing here is typed by hand per row: it all follows the exams table.
    function listHtml(rows) {
      var on = rows.filter(isActive), soon = rows.filter(function (r) { return !isActive(r); });
      return on.map(optHtml).join('') + soonHtml(soon.map(optHtml).join(''), soon.length);
    }

    function soonHtml(inner, count) {
      return count ? '<div class="pathsoon"><p class="pathsoon-label">Coming soon</p>' + inner + '</div>' : '';
    }

    // Degrees are grouped by university; each university lists its BA and MA.
    function instHtml(rows) {
      var byInst = {}, order = [];
      rows.forEach(function (r) {
        var key = r.institution || r.name;
        if (!byInst[key]) { byInst[key] = []; order.push(key); }
        byInst[key].push(r);
      });
      return order.map(function (inst) {
        return '<div class="pathinst"><h4>' + esc(inst) + '</h4>' + byInst[inst].map(optHtml).join('') + '</div>';
      }).join('');
    }

    function degreeHtml(rows) {
      var on = rows.filter(isActive), soon = rows.filter(function (r) { return !isActive(r); });
      return instHtml(on) + soonHtml(instHtml(soon), soon.length);
    }

    function render(rows) {
      var exams = rows.filter(function (r) { return r.kind === 'exam'; });
      var degrees = rows.filter(function (r) { return r.kind === 'degree'; });
      var journeys = rows.filter(function (r) { return r.kind === 'journey'; });

      var groups = [];
      if (exams.length) groups.push({ title: 'Competitive exams', rows: exams, html: listHtml(exams) });
      if (degrees.length) groups.push({ title: 'University degree', rows: degrees, html: degreeHtml(degrees) });
      if (journeys.length) groups.push({ title: 'Literature journey', rows: journeys, html: listHtml(journeys) });

      // A group with something you can pick today comes before one where everything is "Coming soon"
      // (otherwise the Literature journey sat at the very bottom, below fourteen rows you cannot pick).
      // The order inside each class stays as the table gives it.
      var ready = groups.filter(function (g) { return g.rows.some(isActive); });
      var later = groups.filter(function (g) { return !g.rows.some(isActive); });

      wrap.innerHTML = ready.concat(later).map(function (g) { return groupHtml(g.title, g.html); }).join('');
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
      var row = e.target.closest('.pathopt');
      if (row) row.classList.toggle('is-on', e.target.checked);   // picked rows stand out
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
        // Journey chosen: take the person straight to their dashboard.
        location.replace('/dashboard/');
      }).catch(function (err) {
        btnSave.disabled = false; btnSkip.disabled = false;
        showError(box, (err && err.message) || 'Could not save. Please try again.');
      });
    }

    function clearError(b) { if (b) { b.textContent = ''; b.hidden = true; } }
    function showError(b, m) { if (b) { b.textContent = m; b.hidden = false; } }
  }
})();
