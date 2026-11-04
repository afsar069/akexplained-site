/* ==========================================================
   AK Explained — shared auth glue (runs on every page)
   ----------------------------------------------------------
   - Makes one Supabase client for the whole site.
   - Keeps the login/name control in the header up to date.
   - Session is stored by supabase-js in localStorage, so it
     survives page loads and is shared across the whole site.

   This file NEVER gates content. If Supabase is not configured
   yet, or the network fails, the header simply shows "Login"
   and every page keeps working exactly as before.
   ========================================================== */
(function () {
  'use strict';

  // www.akexplained.com and akexplained.com are two different sites to a browser: the login and the
  // saved quiz progress do not carry over, and Google sign-in is only allowed to return to the bare
  // domain. So anyone who lands on www is sent to the same page on the bare domain. (The proper fix is a
  // 301 redirect rule at Cloudflare; this is the safety net that works whatever the host does.)
  if (location.hostname === 'www.akexplained.com') {
    location.replace('https://akexplained.com' + location.pathname + location.search + location.hash);
    return;
  }

  var cfg = window.AK_SUPABASE || {};
  var configured =
    cfg.url &&
    cfg.publishableKey &&
    cfg.url.indexOf('__') !== 0 &&
    cfg.publishableKey.indexOf('__') !== 0;

  // A password-reset or email-confirm link lands back on the site with its tokens in the URL
  // (implicit flow). Read the link TYPE synchronously now, before supabase-js consumes and clears
  // the hash, so /login/ knows to show the "set a new password" screen instead of bouncing away.
  var urlType = '';
  try {
    var _frag = (location.hash || '').replace(/^#/, '') + '&' + (location.search || '').replace(/^\?/, '');
    var _m = /(?:^|&)type=([a-z_]+)/.exec(_frag);
    urlType = _m ? _m[1] : '';
  } catch (e) { /* ignore */ }

  // Remember the last known name so the header shows it instantly on the next
  // page, before the network answers. Per-browser convenience only.
  function cacheName(name) {
    try { if (name) localStorage.setItem('ak:name', name); else localStorage.removeItem('ak:name'); }
    catch (e) { /* private mode: ignore */ }
  }
  function cachedName() {
    try { return localStorage.getItem('ak:name') || ''; } catch (e) { return ''; }
  }

  // A readable name from whatever we have: profile display name, the name given
  // at signup, or the part of the email before the @.
  function nameFrom(user, profileName) {
    if (profileName) return profileName;
    var md = (user && user.user_metadata) || {};
    if (md.display_name) return md.display_name;
    if (md.name) return md.name;
    var email = (user && user.email) || '';
    return email ? email.split('@')[0] : 'My account';
  }

  // Update every header control marked data-auth-link.
  function paintHeader(loggedIn, name) {
    var links = document.querySelectorAll('[data-auth-link]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var label = a.querySelector('[data-auth-label]') || a;
      if (loggedIn) {
        a.setAttribute('href', '/account/');
        label.textContent = name;
        a.setAttribute('data-state', 'in');
      } else {
        a.setAttribute('href', '/login/');
        label.textContent = 'Login';
        a.setAttribute('data-state', 'out');
      }
    }
    // Menu items only for logged-in people (for example "My Dashboard"): shown or hidden with the login state.
    var only = document.querySelectorAll('[data-auth-only]');
    for (var j = 0; j < only.length; j++) only[j].hidden = !loggedIn;
    // Aur iska ulta: sirf guest ke liye (jaise "Create a free account" wala dabba).
    var guest = document.querySelectorAll('[data-guest-only]');
    for (var k = 0; k < guest.length; k++) guest[k].hidden = loggedIn;
  }

  // Paint from the cache first (no flicker), then correct from the network.
  var cached = cachedName();
  paintHeader(!!cached, cached || 'Login');

  if (!configured) {
    // Not wired up yet: make sure the header reads "Login" and stop here.
    cacheName('');
    paintHeader(false, 'Login');
    window.akAuth = { ready: false, configured: false };
    return;
  }

  var client = window.supabase.createClient(cfg.url, cfg.publishableKey);

  // Look up the profile row's display name (own row only, by RLS).
  function fetchProfileName(userId) {
    return client.from('profiles').select('display_name').eq('id', userId).maybeSingle()
      .then(function (res) { return (res.data && res.data.display_name) || ''; })
      .catch(function () { return ''; });
  }

  function refresh(session) {
    if (session && session.user) {
      var user = session.user;
      // Show something at once, then refine with the profile name.
      var quick = nameFrom(user, '');
      cacheName(quick);
      paintHeader(true, quick);
      fetchProfileName(user.id).then(function (pn) {
        var name = nameFrom(user, pn);
        cacheName(name);
        paintHeader(true, name);
      });
    } else {
      cacheName('');
      paintHeader(false, 'Login');
    }
  }

  // supabase-js fires PASSWORD_RECOVERY once it has processed a reset link. Latch it so /login/ can
  // react whether it subscribes before or after the event fires.
  var recoveryFired = false, recoverySession = null, recoveryCbs = [];
  function onRecovery(cb) {
    if (recoveryFired) { try { cb(recoverySession); } catch (e) { /* ignore */ } }
    else recoveryCbs.push(cb);
  }

  // Expose a tiny API for the login/account pages.
  window.akAuth = {
    ready: true,
    configured: true,
    client: client,
    urlType: urlType,
    onRecovery: onRecovery,
    nameFrom: nameFrom,
    cacheName: cacheName,
    refreshHeader: refresh,
    session: function () { return client.auth.getSession().then(function (r) { return r.data.session; }); }
  };

  client.auth.getSession().then(function (r) { refresh(r.data.session); });
  client.auth.onAuthStateChange(function (event, session) {
    if (event === 'PASSWORD_RECOVERY') {
      recoveryFired = true; recoverySession = session;
      var cbs = recoveryCbs; recoveryCbs = [];
      cbs.forEach(function (cb) { try { cb(session); } catch (e) { /* ignore */ } });
    }
    refresh(session);
  });
})();
