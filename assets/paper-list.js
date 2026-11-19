/* =========================================================
   LIVE PAPER LIST  —  assets/paper-list.js

   Self-serve publish (owner, 2026-11-14): a paper-list page draws its cards
   from the LIVE public.paper_catalog when the page is opened, so a paper the
   owner uploads and marks Live appears with no rebuild and no Claude — and
   flipping it back to Draft removes its card at once.

   The page already ships a STATIC list of the papers that were live at build
   time (good for no-JS and search engines). This script quietly replaces that
   list with the live one. If Supabase is off or the read fails, the static
   list stays — the page never ends up blank.

   The host element carries the filter and how to build each card:
     <div class="..." data-paper-list
          data-exam-id="state-psc"            exams row id ('' = no exam)
          data-kind="mock-test"               mock-test | mcq-set
          data-prefix="up-ap-p2-mock-test-"   extra set_id guard (optional)
          data-base="/exams/.../paper-2-mock-tests/"
          data-route="test-{n}/"              link = base + route (number for {n})
          data-label="Mock Test"              card heading, e.g. "Mock Test 05"
          data-copy="count|title"             second line: "90 questions" (default)
                                              or the paper's own title
          data-empty="No mock tests are open yet.">
       ...static fallback cards...
     </div>

   RLS on paper_catalog only ever returns status = 'live' rows to a guest or a
   student (drafts stay hidden). An ADMIN can read drafts too, so the read below
   also asks for status = 'live': the owner then sees the page exactly as a
   student does, and "Draft hides the card" is true for the owner as well.
   It reuses the site's guest-lock / Start swap: each card carries
   data-guest-only (the padlock) and data-auth-only (Start), which auth.js shows
   or hides by login state.

   SLOT MODE (UP PGT mock tests and UP PGT MCQ days). Some hubs show a FIXED set
   of numbered slots (for example 60, in groups of ten), where a slot is either an
   open login paper or "Coming soon", next to free papers the script must never
   touch. There the host carries data-paper-slots instead of data-paper-list
   (same attributes), and every managed card carries its number:
     <div|a class="pgt-practice-card" data-paper-slot="11"
          data-slot-id="up-pgt-mcq-day-11"   the paper's id, when it is not
                                             prefix + number (optional)
          data-slot-state="soon|live" data-slot-copy="90 questions">
   The script asks the catalog for exactly those ids, and flips each slot to
   match: a slot whose id is a live row becomes the lock/Start card; any other
   slot becomes the "Coming soon" card. A card without data-paper-slot (a free
   paper) is left alone. On a failed read nothing changes.
   ========================================================= */
(function () {
  'use strict';

  var host = document.querySelector('[data-paper-list]');
  var SLOTS = false;
  if (!host) {
    host = document.querySelector('[data-paper-slots]');
    SLOTS = !!host;
  }
  if (!host) return;

  var EXAM_ID = host.getAttribute('data-exam-id') || '';
  var KIND = host.getAttribute('data-kind') || '';
  var PREFIX = host.getAttribute('data-prefix') || '';
  var BASE = host.getAttribute('data-base') || '';
  var ROUTE = host.getAttribute('data-route') || 'test-{n}/';
  var LABEL = host.getAttribute('data-label') || 'Mock Test';
  var COPY = host.getAttribute('data-copy') === 'title' ? 'title' : 'count';
  var EMPTY = host.getAttribute('data-empty') || 'No tests are open yet.';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* auth.js har page par ek Supabase client banata hai (guest ke paas bhi).
     cbt.js ki tarah ~3 second uska intezaar; na bane to guest/static maan lo. */
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

  var LOCK_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
    '<rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/>' +
    '<path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';

  function labelNum(n) { return String(n).length < 2 ? '0' + n : String(n); }
  function urlFor(n) { return BASE + ROUTE.replace('{n}', n); }

  /* Card ki doosri line. data-copy="title" par paper ka apna naam (MCQ days), warna ginti.
     Naam agar sirf "Day 13" jaisa hai (upload page ka default), to usse dohrana bekaar hai —
     tab ginti dikha do. Kuch na ho to doosri line hoti hi nahi; kabhi kuch gadha nahi jata. */
  function copyFor(row) {
    var n = row.number;
    var count = (row.question_count > 0) ? row.question_count + ' questions' : '';
    if (COPY !== 'title') return count;
    var title = String(row.title == null ? '' : row.title).trim();
    var plain = [LABEL + ' ' + n, LABEL + ' ' + labelNum(n)];
    if (!title || plain.indexOf(title) > -1) return count;
    return title;
  }

  function cardHtml(row, slot) {
    var n = row.number;
    var url = urlFor(n);
    var name = LABEL + ' ' + n;
    var copy = copyFor(row);
    var slotAttrs = slot
      ? ' data-paper-slot="' + esc(n) + '"' +
        (row.set_id ? ' data-slot-id="' + esc(row.set_id) + '"' : '') +
        ' data-slot-state="live" data-slot-copy="' + esc(copy) + '"'
      : '';
    return '<div class="pgt-practice-card"' + slotAttrs + '>' +
      '<span class="pgt-practice-card-copy"><strong>' + esc(LABEL + ' ' + labelNum(n)) + '</strong>' +
        (copy ? '<span>' + esc(copy) + '</span>' : '') + '</span>' +
      '<a class="agehub-go agehub-go-lock" data-guest-only hidden href="/login/?next=' + encodeURIComponent(url) + '" ' +
        'aria-label="' + esc(name) + ' needs a login. Log in to open it." title="' + esc('Log in to open ' + name) + '">' +
        LOCK_SVG + '</a>' +
      '<a class="agehub-go is-solid" data-auth-only' + (row.access === 'paid' ? ' data-pass-start' : '') +
        ' hidden href="' + esc(url) + '">Start</a>' +
      '</div>';
  }

  /* Slot jo live nahi: wahi "Coming soon" card jo build ke waqt banta hai. */
  function soonHtml(n, setId) {
    return '<a class="pgt-practice-card" data-paper-slot="' + esc(n) + '"' +
      (setId ? ' data-slot-id="' + esc(setId) + '"' : '') +
      ' data-slot-state="soon" data-slot-copy="" href="' + esc(urlFor(n)) + '" ' +
      'aria-label="' + esc(LABEL + ' ' + n + ' — coming soon') + '">' +
      '<span class="pgt-practice-card-copy"><strong>' + esc(LABEL + ' ' + labelNum(n)) + '</strong>' +
        '<span>Coming soon</span></span>' +
      '<img src="/assets/icons/feather/arrow-right.svg" alt="" width="24" height="24"></a>';
  }

  /* Cards abhi-abhi bane hain, isliye auth.js se dobara paint karwa lo taaki
     guest ko lock aur logged-in ko Start theek dikhe. Baad me login/logout hone
     par auth.js khud in [data-*-only] cards ko sambhal lega. */
  function repaintAuth() {
    if (window.akAuth && window.akAuth.refreshHeader && window.akAuth.session) {
      window.akAuth.session().then(function (s) {
        try { window.akAuth.refreshHeader(s); } catch (e) {}
      }, function () {});
    }
    /* A paid card's Start becomes "Get access" for a student with no pass (assets/pass-gate.js). */
    try { if (window.akPass) window.akPass.refresh(); } catch (e) {}
  }

  function render(rows) {
    if (!rows.length) {
      host.innerHTML = '<p class="muted">' + esc(EMPTY) + '</p>';
      return;
    }
    host.innerHTML = rows.map(function (row) { return cardHtml(row, false); }).join('');
    repaintAuth();
  }

  /* Har managed slot ka paper id: card ka apna data-slot-id, warna prefix + number.
     (Day 11 aur 12 apni purani id ke saath database me hain, isliye id card par likhi hai.) */
  function slotList() {
    var out = [];
    var slots = host.querySelectorAll('[data-paper-slot]');
    for (var i = 0; i < slots.length; i++) {
      var el = slots[i];
      var n = parseInt(el.getAttribute('data-paper-slot'), 10);
      if (!(n > 0)) continue;
      var id = el.getAttribute('data-slot-id') || (PREFIX ? PREFIX + n : '');
      if (!id) continue;
      out.push({ el: el, number: n, setId: id });
    }
    return out;
  }

  /* SLOT MODE: har slot ko live catalog se milao. Sirf wahi card badalta hai jiska haal
     (ya doosri line) badla ho, taaki bina wajah lock/Start na jhapke. Page ka test usi
     set_id se khulta hai (cbt.js data-catalog-check), isliye yahan bhi wahi id dekhi jati
     hai — card aur page kabhi alag jawab nahi dete. */
  function renderSlots(slots, rows) {
    var live = {};
    rows.forEach(function (r) { if (r && r.set_id) live[String(r.set_id)] = r; });
    var changed = false;
    slots.forEach(function (slot) {
      var el = slot.el;
      var row = live[slot.setId];
      var isLive = el.getAttribute('data-slot-state') === 'live';
      if (row) {
        var copy = copyFor({ number: slot.number, title: row.title, question_count: row.question_count });
        if (isLive && (el.getAttribute('data-slot-copy') || '') === copy) return;
        el.outerHTML = cardHtml({ number: slot.number, set_id: slot.setId, title: row.title, question_count: row.question_count, access: row.access }, true);
        changed = true;
      } else if (isLive) {
        el.outerHTML = soonHtml(slot.number, slot.setId);
        changed = true;
      }
    });
    if (changed) repaintAuth();
  }

  function matches(row) {
    if (KIND && row.kind !== KIND) return false;
    if (EXAM_ID && row.exam_id !== EXAM_ID) return false;
    if (PREFIX && String(row.set_id).indexOf(PREFIX) !== 0) return false;
    return row.number > 0;
  }

  whenAuth().then(function (a) {
    if (!a || !a.configured || !a.client) return;   /* Supabase off — static fallback rahne do */
    var slots = SLOTS ? slotList() : null;
    if (SLOTS && !slots.length) return;

    var q = a.client.from('paper_catalog').select('set_id,title,exam_id,kind,number,question_count,access').eq('status', 'live');
    if (SLOTS) {
      /* Slot mode: id se hi poocho — purani id wale din (11, 12) bhi isi se mil jate hain. */
      q = q.in('set_id', slots.map(function (s) { return s.setId; }));
    } else {
      if (KIND) q = q.eq('kind', KIND);
      if (EXAM_ID) q = q.eq('exam_id', EXAM_ID);
    }
    q.order('number', { ascending: true }).then(function (res) {
      if (res.error || !Array.isArray(res.data)) return;   /* read fail — static fallback */
      if (SLOTS) { renderSlots(slots, res.data); return; }
      render(res.data.filter(matches));
    }, function () { /* ignore — static fallback */ });
  });
})();
