/* =========================================================
   NET PYQ HUB — login papers flip live from the paper catalog
   (/exams/net/english-pyqs/, CLAUDE.md rule 18 + rule 17)

   A login PYQ card is printed at build time in one of two states
   (data-slot-state="soon" | "live"). That is only the picture at build
   time. When the page opens, this script asks the LIVE public.paper_catalog
   which of these papers are Live and flips each card to match:
     - Live      -> the lock (guest) / Start (student) buttons show,
     - not Live  -> the "Coming soon" label shows.
   So the owner uploads a paper, marks it Live on /admin/papers/, and its
   card opens with no rebuild; Draft hides it again at once.

   The card marks its two parts with data-slot-live and data-slot-soon.
   The lock / Start swap by login state is auth.js's own job
   (data-guest-only / data-auth-only), so it is not touched here.
   If Supabase is off or the read fails, nothing changes: the build-time
   state stays, the page is never blank. A card without data-net-pyq-slot
   (a free paper) is never touched.

   Like paper-list.js, the read asks for status = 'live' itself: an admin can
   read drafts by RLS, and without this the owner would see a Draft as open.
   ========================================================= */
(function () {
  'use strict';

  var cards = document.querySelectorAll('[data-net-pyq-slot]');
  if (!cards.length) return;

  /* auth.js builds window.akAuth after this script may already have run (same wait as paper-list.js). */
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

  /* The card shows the exam's standard count (50 / 75 / 100) before the paper is live. Once it is live
     the real count from the catalog is shown, so a paper with a dropped question reads exactly right. */
  function setCount(card, count) {
    if (!(count > 0)) return;
    var el = card.querySelector('[data-pyq-count]');
    if (el) el.textContent = count + ' question' + (count === 1 ? '' : 's');
  }

  function setState(card, isLive) {
    if ((card.getAttribute('data-slot-state') === 'live') === isLive) return false;
    card.setAttribute('data-slot-state', isLive ? 'live' : 'soon');
    var live = card.querySelectorAll('[data-slot-live]');
    var soon = card.querySelectorAll('[data-slot-soon]');
    var i;
    for (i = 0; i < live.length; i++) live[i].hidden = !isLive;
    for (i = 0; i < soon.length; i++) soon[i].hidden = isLive;
    return true;
  }

  whenAuth().then(function (a) {
    if (!a || !a.configured || !a.client) return;   /* Supabase off: keep the build-time state */

    var ids = [];
    for (var i = 0; i < cards.length; i++) {
      var id = cards[i].getAttribute('data-net-pyq-slot');
      if (id) ids.push(id);
    }
    if (!ids.length) return;

    a.client.from('paper_catalog').select('set_id,question_count').eq('status', 'live').in('set_id', ids)
      .then(function (res) {
        if (res.error || !Array.isArray(res.data)) return;   /* read failed: keep the build-time state */
        var live = {};
        res.data.forEach(function (r) { if (r && r.set_id) live[String(r.set_id)] = r; });
        var changed = false;
        for (var j = 0; j < cards.length; j++) {
          var row = live[cards[j].getAttribute('data-net-pyq-slot')];
          if (row) setCount(cards[j], parseInt(row.question_count, 10));
          if (setState(cards[j], !!row)) changed = true;
        }
        /* The buttons now showing were printed hidden; let auth.js paint them for the login state. */
        if (changed && window.akAuth && window.akAuth.refreshHeader && window.akAuth.session) {
          window.akAuth.session().then(function (s) {
            try { window.akAuth.refreshHeader(s); } catch (e) {}
          }, function () {});
        }
        try { if (window.akPass) window.akPass.refresh(); } catch (e) {}   // Start -> "Get access" with no pass
      }, function () { /* ignore: keep the build-time state */ });
  });
})();
