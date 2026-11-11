/* ==========================================================
   AK Explained — review form (login-gated, auto-live)
   ----------------------------------------------------------
   Sirf logged-in student review likh sakta hai. Review seedha
   Supabase ki public.reviews table me jaata hai aur home page
   par turant dikh jaata hai (koi approval step nahi). Ek
   student = ek review (table me unique constraint). Ganda review
   owner connector se hata deta hai.

   Ye file auth.js se PEHLE chalti hai (page ke <head> me), isliye
   window.akAuth ke aane ka thoda intezaar karte hain — bilkul
   cbt.js ki tarah.
   ========================================================== */
(function () {
  'use strict';

  // ~3 second tak window.akAuth ka intezaar; na mile to guest maan lo.
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

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function starLine(n) {
    n = Math.max(1, Math.min(5, parseInt(n, 10) || 5));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('reviewForm');
    if (!form) return;
    var checking = document.getElementById('reviewChecking');
    var gate = document.getElementById('reviewGate');
    var done = document.getElementById('reviewDone');
    var how = document.getElementById('reviewHow');
    var msg = document.getElementById('formMsg');
    var btn = form.querySelector('button[type=submit]');
    var nameInput = document.getElementById('rvName');

    function hide(el) { if (el) el.hidden = true; }
    function show(el) { if (el) el.hidden = false; }
    function say(kind, html) {
      if (!msg) return;
      msg.className = 'formmsg show ' + kind;
      msg.innerHTML = html;
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Shuru me sab chhupa; sirf "Loading…" dikhe.
    hide(form); hide(gate); hide(done); hide(how); show(checking);

    // Jab review post ho jaaye (ya pehle se ho), to yahi dikhega.
    function showDone(r, justPosted) {
      hide(form); hide(gate); hide(how); hide(checking);
      var card =
        '<p class="stars" aria-hidden="true" style="color:var(--gold);font-size:1.2rem;letter-spacing:2px">' +
        starLine(r.stars) + '</p>' +
        (r.heading ? '<p><strong>' + esc(r.heading) + '</strong></p>' : '') +
        '<p>“' + esc(r.body) + '”</p>' +
        '<p class="muted">— ' + esc(r.name) + (r.role ? ', ' + esc(r.role) : '') + '</p>';
      done.innerHTML =
        '<p><strong>' + (justPosted ? 'Thank you — your review is live.' : 'You have already shared a review.') + '</strong></p>' +
        '<p>' + (justPosted ? 'It now appears on the home page.' : 'This is the review shown on the site.') +
        ' You can write one review per account.</p>' +
        '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">' + card + '</div>' +
        '<p style="margin-top:14px"><a class="btn alt" href="/#reviews">See it on the home page &rarr;</a></p>';
      show(done);
    }

    whenAuth().then(function (a) {
      hide(checking);
      if (!a || !a.configured || !a.client) { show(gate); return; }

      a.session().then(function (s) {
        if (!s || !s.user) { show(gate); return; }
        var client = a.client, user = s.user;

        // Pehle se review hai? (apni row RLS se padh sakte hain.)
        client.from('reviews').select('name,role,heading,stars,body')
          .eq('user_id', user.id).maybeSingle()
          .then(function (res) {
            if (res && res.data) { showDone(res.data, false); return; }
            prefillAndShow(client, user, a);
          }, function () {
            // Read fail ho to bhi likhne do.
            prefillAndShow(client, user, a);
          });
      }, function () { show(gate); });
    });

    function prefillAndShow(client, user, a) {
      // Naam profile se bhar do (badal bhi sakte hain).
      client.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
        .then(function (p) {
          var pn = (p && p.data && p.data.display_name) || '';
          var nm = a.nameFrom(user, pn);
          if (nameInput && !nameInput.value && nm && nm !== 'My account') nameInput.value = nm;
        }, function () { /* ignore */ });
      wireSubmit(client, user);
      show(form); show(how);
    }

    var wired = false;
    function wireSubmit(client, user) {
      if (wired) return;
      wired = true;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var d = new FormData(form);
        var v = {
          name: (d.get('name') || '').trim(),
          role: (d.get('role') || '').trim(),
          heading: (d.get('heading') || '').trim(),
          stars: Math.max(1, Math.min(5, parseInt(d.get('stars') || '5', 10) || 5)),
          body: (d.get('review') || '').trim()
        };
        if (!v.name || !v.body) return say('bad', 'Please fill in your name and your review.');
        if (v.body.length < 10) return say('bad', 'Please write a little more — at least 10 characters.');

        btn.disabled = true;
        btn.textContent = 'Posting…';

        client.from('reviews').insert({
          user_id: user.id,
          name: v.name,
          role: v.role || null,
          heading: v.heading || null,
          stars: v.stars,
          body: v.body
        }).then(function (res) {
          if (res && res.error) {
            var err = res.error;
            // 23505 = unique violation: is account se pehle hi ek review hai.
            if (err.code === '23505' || /duplicate|unique/i.test(err.message || '')) {
              showDone(v, false);
              return;
            }
            throw new Error(err.message || 'insert failed');
          }
          showDone(v, true);
        }, function (err) {
          say('bad', 'That did not go through. Please check your connection and try again.');
          btn.disabled = false; btn.textContent = 'Post my review';
          return;
        }).catch(function () {
          say('bad', 'That did not go through. Please check your connection and try again.');
          btn.disabled = false; btn.textContent = 'Post my review';
        });
      });
    }
  });
})();
