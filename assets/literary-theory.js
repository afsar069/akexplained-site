/* /literary-criticism/ — Literary Theory section: aath Part cards. Ek card dabao to usi part ka
   panel neeche khulta hai, jisme us part ke chapters ki list hoti hai. Link
   /literary-criticism/#lt-part-4 seedha us part ka panel kholta hai. JavaScript na chale to
   saare panels khule rehte hain (card ek anchor hai jo us panel tak jump karta hai). */
(function () {
  var root = document.getElementById('ltx');
  if (!root) return;
  var cards = Array.prototype.slice.call(root.querySelectorAll('.ltx-card'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('.ltx-panel'));
  if (!cards.length || !panels.length) return;
  root.classList.add('is-js');

  function show(id, scroll) {
    var found = panels.some(function (p) { return p.id === id; });
    panels.forEach(function (p) { p.hidden = !(found && p.id === id); });
    cards.forEach(function (c) {
      c.setAttribute('aria-expanded', found && c.getAttribute('aria-controls') === id ? 'true' : 'false');
    });
    if (found && scroll) {
      var el = document.getElementById(id);
      var top = el.getBoundingClientRect().top;
      // Sirf tab scroll karo jab panel ka upar ka hissa dikh nahi raha (phone par cards ke neeche hota hai).
      if (top > window.innerHeight * 0.7 || top < 0) el.scrollIntoView({ block: 'start' });
    }
  }

  cards.forEach(function (c) {
    c.addEventListener('click', function (e) {
      e.preventDefault();
      var id = c.getAttribute('aria-controls');
      // Khula hua card dobara dabao to band ho jaye.
      var open = c.getAttribute('aria-expanded') === 'true';
      show(open ? '' : id, !open);
      if (history.replaceState) history.replaceState(null, '', open ? location.pathname : '#' + id);
    });
  });

  window.addEventListener('hashchange', function () { show(location.hash.slice(1), true); });
  show(location.hash.slice(1), false);
})();
