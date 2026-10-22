/* =========================================================
   DAILY MCQ PAGE  —  /quizzes/daily/
   assets/daily.js

   The page reads fine with this file missing or blocked: every
   topic card is already in the HTML. This script only adds the
   two controls above the cards:
     1. a period filter  (data-period on each card)
     2. a sort           (time order = the order in the HTML, or A to Z)

   The controls start hidden in the HTML and are shown here, so a
   reader without JavaScript never sees a dropdown that does nothing.
   ========================================================= */
(function () {
  'use strict';

  var grid = document.getElementById('dqGrid');
  var period = document.getElementById('dqPeriod');
  var sort = document.getElementById('dqSort');
  if (!grid || !period || !sort) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.dq-card'));

  function titleOf(card) {
    var t = card.querySelector('.dq-title');
    return t ? t.textContent.trim() : '';
  }

  function apply() {
    var want = period.value;

    cards.forEach(function (card) {
      var tags = (card.getAttribute('data-period') || '').split(' ');
      card.hidden = !(want === 'all' || tags.indexOf(want) > -1);
    });

    /* Move the cards themselves, so the reading order matches the screen. */
    var list = cards.slice();
    if (sort.value === 'az') {
      list.sort(function (a, b) { return titleOf(a).localeCompare(titleOf(b)); });
    }
    list.forEach(function (card) { grid.appendChild(card); });
  }

  period.addEventListener('change', apply);
  sort.addEventListener('change', apply);

  var box = period.parentNode;
  if (box) box.hidden = false;
  apply();
})();
