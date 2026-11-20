/* /video-lessons/ — "Choose Your Playlist" bar, playlist panel and "Show more".
   Bina JavaScript ke saare videos seedhe dikhte hain; bar aur panel tab tak hidden rehte hain. */
(function () {
  'use strict';
  var grid = document.getElementById('vlGrid');
  var picker = document.getElementById('vlPicker');
  var bar = document.getElementById('vlBar');
  var panel = document.getElementById('vlPanel');
  if (!grid || !picker || !bar || !panel) return;

  var PAGE = 12;                           // ek baar me kitne videos
  var cards = Array.prototype.slice.call(grid.children);
  var lists = Array.prototype.slice.call(panel.querySelectorAll('.vl-list'));
  var head = document.getElementById('vlHead');
  var title = document.getElementById('vlTitle');
  var yt = document.getElementById('vlYt');
  var ytName = document.getElementById('vlYtName');
  var barNow = document.getElementById('vlBarNow');
  var foot = document.getElementById('vlFoot');
  var status = document.getElementById('vlStatus');
  var more = document.getElementById('vlMore');
  var topic = 'all';
  var shown = PAGE;

  function find(key) {
    for (var i = 0; i < lists.length; i++) if (lists[i].getAttribute('data-topic') === key) return lists[i];
    return null;
  }
  function plural(n) { return n + (n === 1 ? ' lesson' : ' lessons'); }

  function setOpen(open) {
    bar.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  function apply() {
    var match = cards.filter(function (c) {
      return topic === 'all' || c.getAttribute('data-topic') === topic;
    });
    cards.forEach(function (c) { c.hidden = true; });
    match.forEach(function (c, i) { c.hidden = i >= shown; });
    lists.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-topic') === topic ? 'true' : 'false');
    });

    var cur = find(topic);
    var name = topic === 'all' ? 'All lessons' : (cur.getAttribute('data-name') || 'Lessons');
    if (title) title.textContent = name;
    if (barNow) barNow.textContent = name + ' · ' + match.length;

    var ytId = cur && cur.getAttribute('data-yt-id');
    if (yt) {
      if (ytId) {
        yt.href = 'https://www.youtube.com/playlist?list=' + encodeURIComponent(ytId);
        if (ytName) ytName.textContent = cur.getAttribute('data-yt-title') || '';
        yt.hidden = false;
      } else {
        yt.hidden = true;
      }
    }

    var visible = Math.min(shown, match.length);
    if (status) status.textContent = 'Showing ' + visible + ' of ' + plural(match.length);
    if (more) more.hidden = visible >= match.length;
    if (head) head.hidden = false;
    if (foot) foot.hidden = false;
  }

  bar.addEventListener('click', function () {
    setOpen(bar.getAttribute('aria-expanded') !== 'true');
  });

  lists.forEach(function (b) {
    b.addEventListener('click', function () {
      topic = b.getAttribute('data-topic');
      shown = PAGE;
      apply();
      setOpen(false);
      bar.focus();
      try { history.replaceState(null, '', topic === 'all' ? location.pathname : '#' + topic); } catch (e) {}
    });
  });

  // Bahar click ya Escape par panel band.
  document.addEventListener('click', function (e) {
    if (!panel.hidden && !picker.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) { setOpen(false); bar.focus(); }
  });

  if (more) {
    more.addEventListener('click', function () {
      shown += PAGE;
      apply();
    });
  }

  var fromHash = (location.hash || '').replace('#', '');
  if (fromHash && find(fromHash)) topic = fromHash;

  picker.hidden = false;
  apply();
})();
