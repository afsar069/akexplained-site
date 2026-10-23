/* =========================================================
   MCQ PRACTICE PAGE  —  /quizzes/mcq/
   assets/mcq.js

   The Daily MCQ page (/quizzes/daily/) loads this too, for the
   "Carry On Where You Left" strip and the exam chips. It has no
   age cards, so the age jobs below simply find nothing to do.

   The page works perfectly well with this file missing or
   blocked: every link is already in the HTML. This script only
   adds the parts that depend on what the reader has done
   before, which is kept in this browser and nowhere else.

   Three jobs:
     1. Grey out the ages whose questions are not written yet.
     2. Fill each age card's progress bar from past attempts.
     3. Build the "Carry On Where You Left" strip.

   It reads the same localStorage the quiz engine writes:
     key   akq:<setId>:v1
     value { setId, count, pick:{}, done, ... }
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. WHICH AGES ARE READY
     LIVE_AGES: ages with questions. The card links to the hub and
     shows progress. Add a slug here the day its first set goes live
     (and take it out of SOON_HUBS).

     SOON_HUBS: ages whose hub page is open (notes and a "questions
     are being written" note) but with no questions yet. The card
     links to the hub and keeps saying "Questions coming soon".

     An age in neither list is not clickable.
     --------------------------------------------------------- */
  var LIVE_AGES = [
    'old-english'
  ];

  var SOON_HUBS = [
    'anglo-norman',
    'age-of-chaucer',
    'fifteenth-century',
    'renaissance',
    'early-tudor',
    'elizabethan',
    'jacobean',
    'caroline',
    'commonwealth',
    'neoclassical',
    'restoration',
    'augustan-age',
    'age-of-sensibility',
    'romantic-age',
    'victorian-age',
    'edwardian',
    'georgian',
    'modern',
    'postmodern'
  ];

  /* How many questions each age holds, once it is live.
     Used for the progress bars. Leave an age out and the card
     simply says how many have been answered. */
  var TOTALS = {
    // 'romantic-age': 150
  };

  /* Readable names for the resume card. */
  var AGE_NAMES = {
    'old-english': 'Old English',
    'middle-english': 'Middle English',
    'renaissance': 'Renaissance',
    'elizabethan': 'Elizabethan',
    'jacobean': 'Jacobean',
    'caroline': 'Caroline',
    'restoration': 'Restoration',
    'augustan-age': 'Augustan',
    'romantic-age': 'Romantic Age',
    'victorian-age': 'Victorian Age',
    'modern': 'Modern',
    'contemporary': 'Contemporary'
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------------------------------------------------------
     Reading past attempts
     --------------------------------------------------------- */
  function readAttempts() {
    var out = [];
    var store;
    try { store = window.localStorage; } catch (e) { return out; }
    if (!store) return out;

    for (var i = 0; i < store.length; i++) {
      var key;
      try { key = store.key(i); } catch (e) { continue; }
      if (!key || key.indexOf('akq:') !== 0) continue;

      var raw, data;
      try { raw = store.getItem(key); data = JSON.parse(raw); } catch (e) { continue; }
      if (!data || typeof data !== 'object') continue;

      var setId = typeof data.setId === 'string' ? data.setId : key.slice(4).replace(/:v\d+$/, '');
      var picks = (data.pick && typeof data.pick === 'object') ? Object.keys(data.pick).length : 0;

      out.push({
        key: key,
        setId: setId,
        age: ageOf(setId),
        answered: picks,
        total: typeof data.count === 'number' ? data.count : 0,
        done: data.done === true,
        wrong: countWrong(data),
        at: typeof data.endedAt === 'number' ? data.endedAt : 0
      });
    }
    return out;
  }

  /* A set id always begins with its age slug, so the longest
     matching slug wins: 'romantic-age-set-2' -> 'romantic-age'. */
  function ageOf(setId) {
    var best = '';
    for (var slug in AGE_NAMES) {
      if (!Object.prototype.hasOwnProperty.call(AGE_NAMES, slug)) continue;
      if (setId.indexOf(slug) === 0 && slug.length > best.length) best = slug;
    }
    return best;
  }

  /* The engine keeps the answer key out of saved state, so a
     finished attempt carries its own tally when it has one. */
  function countWrong(data) {
    if (typeof data.wrongCount === 'number') return data.wrongCount;
    if (Array.isArray(data.wrongIds)) return data.wrongIds.length;
    return 0;
  }

  /* ---------------------------------------------------------
     2. AGE CARDS
     --------------------------------------------------------- */
  function paintAges(attempts) {
    var byAge = {};
    attempts.forEach(function (a) {
      if (!a.age) return;
      var o = byAge[a.age] || (byAge[a.age] = { answered: 0, wrong: 0, sets: 0, open: null });
      o.answered += a.answered;
      o.wrong += a.wrong;
      o.sets += 1;
      if (!a.done && a.answered > 0 && a.answered < a.total) o.open = a;
    });

    $$('.mcq-agecard').forEach(function (card) {
      var slug = card.getAttribute('data-age');
      var state = $('.mcq-state', card);
      var fill = $('.mcq-bar i', card);
      var live = LIVE_AGES.indexOf(slug) > -1;
      var soon = SOON_HUBS.indexOf(slug) > -1;

      /* The markup carries no href, so an age with no page yet is
         never a link, even with this script blocked. A live age, or one
         with an open hub, gets its link here. */
      if (!live && !soon) {
        card.setAttribute('aria-disabled', 'true');
        card.removeAttribute('href');
        return;
      }
      if (soon) {                      /* hub only: the card text stays "Questions coming soon" */
        card.setAttribute('href', '/quizzes/mcq/' + slug + '/');
        card.removeAttribute('aria-disabled');
        card.classList.add('is-soon');
        return;
      }
      card.setAttribute('href', '/quizzes/mcq/' + slug + '/');
      card.removeAttribute('aria-disabled');

      var total = TOTALS[slug] || 0;
      var o = byAge[slug];

      if (!o || !o.answered) {
        if (state) {
          state.textContent = total
            ? total + ' questions · not started'
            : 'Ready when you are';
        }
        return;
      }

      var pc = total ? Math.min(100, Math.round(o.answered / total * 100)) : 0;
      if (fill && total) fill.style.width = pc + '%';

      if (state) {
        if (total && o.answered >= total) {
          state.textContent = 'All ' + total + ' done';
          state.className = 'mcq-state is-done';
          if (fill) fill.className = 'is-done';
        } else if (o.open) {
          state.textContent = o.answered + (total ? ' of ' + total : '') + ' · in progress';
          state.className = 'mcq-state is-going';
          card.classList.add('is-current');
        } else {
          state.textContent = o.answered + (total ? ' of ' + total : '') + ' done';
          state.className = 'mcq-state';
        }
      }
    });
  }

  /* ---------------------------------------------------------
     3. CARRY ON
     One row per thing to pick up again, inside the brown strip.
     --------------------------------------------------------- */
  function paintResume(attempts) {
    var sec = $('#carryOn');
    var grid = $('#resumeGrid');
    if (!sec || !grid) return;

    /* the most recent unfinished attempt */
    var open = attempts.filter(function (a) {
      return !a.done && a.answered > 0 && a.total > 0 && a.answered < a.total;
    }).sort(function (a, b) { return b.at - a.at; })[0];

    /* everything answered wrongly, across every age */
    var wrong = attempts.reduce(function (n, a) { return n + a.wrong; }, 0);

    var rows = [];

    if (open) {
      var name = AGE_NAMES[open.age] || 'Practice set';
      var pc = Math.round(open.answered / open.total * 100);
      /* a set that belongs to no age has no age page to go back to */
      var href = open.age ? '/quizzes/mcq/' + esc(open.age) + '/' : '/quizzes/mcq/';
      rows.push(
        '<a class="mcq-carry-row" href="' + href + '">' +
          '<span class="mcq-start-ic" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">' +
            '<path d="M8 5.1v13.8L19 12 8 5.1Z"/></svg>' +
          '</span>' +
          '<span class="mcq-start-txt">' +
            '<strong>' + esc(name) + '</strong>' +
            '<span>' + open.answered + ' of ' + open.total + ' answered</span>' +
            '<span class="mcq-carry-bar" aria-hidden="true"><i style="width:' + pc + '%"></i></span>' +
          '</span>' +
          '<span class="mcq-start-go">Continue</span>' +
        '</a>'
      );
    }

    if (wrong > 0) {
      rows.push(
        '<a class="mcq-carry-row" href="/quizzes/mcq/build/?only=wrong">' +
          '<span class="mcq-start-ic" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round"><path d="M20 11.5A8 8 0 1 1 17.7 6"/>' +
            '<path d="M20 4v4.5h-4.5"/></svg>' +
          '</span>' +
          '<span class="mcq-start-txt">' +
            '<strong>' + wrong + ' You Got Wrong</strong>' +
            '<span>Worth another look before they settle in wrongly.</span>' +
          '</span>' +
          '<span class="mcq-start-go">Practise these</span>' +
        '</a>'
      );
    }

    if (!rows.length) return;
    grid.innerHTML = rows.join('');
    sec.hidden = false;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------------------------------------------------
     Exam filter
     The choice is remembered and handed on to the set pages as
     ?exam=…, so a PGT reader keeps seeing PGT questions.
     --------------------------------------------------------- */
  var EXAM_KEY = 'ak:exam';

  function wireExams() {
    var chips = $$('.mcq-chip[data-exam]');
    if (!chips.length) return;

    var saved = 'all';
    try { saved = localStorage.getItem(EXAM_KEY) || 'all'; } catch (e) {}

    function apply(value) {
      chips.forEach(function (c) {
        var on = c.getAttribute('data-exam') === value;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      try { localStorage.setItem(EXAM_KEY, value); } catch (e) {}
      stampLinks(value);
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () { apply(c.getAttribute('data-exam')); });
    });

    apply(saved);
  }

  /* Add ?exam=… to every practice link, and take it off again
     when the reader goes back to "Every exam". */
  function stampLinks(value) {
    $$('a[href^="/quizzes/mcq/"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      var base = href.split('?')[0];
      var rest = href.indexOf('?') > -1 ? href.slice(href.indexOf('?') + 1) : '';
      var parts = rest ? rest.split('&').filter(function (p) { return p.indexOf('exam=') !== 0; }) : [];
      if (value && value !== 'all') parts.push('exam=' + encodeURIComponent(value));
      a.setAttribute('href', parts.length ? base + '?' + parts.join('&') : base);
    });
  }

  /* --------------------------------------------------------- */
  function start() {
    var attempts = [];
    try { attempts = readAttempts(); } catch (e) { attempts = []; }
    try { paintAges(attempts); } catch (e) {}
    try { paintResume(attempts); } catch (e) {}
    try { wireExams(); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
