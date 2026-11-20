/* /video-lessons/ — topic chips and "Show more".
   Bina JavaScript ke saare videos seedhe dikhte hain; chips tab tak hidden rehte hain. */
(function () {
  'use strict';
  var grid = document.getElementById('vlGrid');
  var chipsBox = document.getElementById('vlChips');
  if (!grid || !chipsBox) return;

  var PAGE = 12;                         // ek baar me kitne videos
  var cards = Array.prototype.slice.call(grid.children);
  var chips = Array.prototype.slice.call(chipsBox.querySelectorAll('.vl-chip'));
  var foot = document.getElementById('vlFoot');
  var status = document.getElementById('vlStatus');
  var more = document.getElementById('vlMore');
  var topic = 'all';
  var shown = PAGE;

  function valid(key) {
    return chips.some(function (c) { return c.getAttribute('data-topic') === key; });
  }

  function apply() {
    var match = cards.filter(function (c) {
      return topic === 'all' || c.getAttribute('data-topic') === topic;
    });
    cards.forEach(function (c) { c.hidden = true; });
    match.forEach(function (c, i) { c.hidden = i >= shown; });
    chips.forEach(function (c) {
      c.setAttribute('aria-pressed', c.getAttribute('data-topic') === topic ? 'true' : 'false');
    });
    var visible = Math.min(shown, match.length);
    if (status) status.textContent = 'Showing ' + visible + ' of ' + match.length + ' lessons';
    if (more) more.hidden = visible >= match.length;
    if (foot) foot.hidden = false;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      topic = chip.getAttribute('data-topic');
      shown = PAGE;
      apply();
      try { history.replaceState(null, '', topic === 'all' ? location.pathname : '#' + topic); } catch (e) {}
    });
  });

  if (more) {
    more.addEventListener('click', function () {
      shown += PAGE;
      apply();
    });
  }

  var fromHash = (location.hash || '').replace('#', '');
  if (fromHash && valid(fromHash)) topic = fromHash;

  chipsBox.hidden = false;
  apply();
})();
