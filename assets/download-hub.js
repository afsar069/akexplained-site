/* /download/ — exam cards: ek card dabao to neeche usi exam ka panel (Syllabus / Important Books / Notes) khulta hai.
   Link /download/#dl-up-pgt seedha us exam ka panel kholta hai. JavaScript na chale to saare panels khule rehte hain
   (card ek anchor link hai jo panel tak jump karta hai). Download button dabane par light green + "Download again";
   download khud kabhi nahi rokta. */
(function () {
  var root = document.getElementById('dlx');
  if (!root) return;
  var cards = Array.prototype.slice.call(root.querySelectorAll('.dlx-card'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('.dlx-panel'));
  if (!cards.length || !panels.length) return;
  root.classList.add('is-js');

  function show(id, scroll) {
    var found = false;
    panels.forEach(function (p) { if (p.id === id) found = true; });
    if (!found) id = panels[0].id;
    panels.forEach(function (p) { p.hidden = p.id !== id; });
    cards.forEach(function (c) { c.setAttribute('aria-expanded', c.getAttribute('aria-controls') === id ? 'true' : 'false'); });
    if (scroll) {
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
      show(id, true);
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    });
  });

  window.addEventListener('hashchange', function () { show(location.hash.slice(1), true); });
  show(location.hash.slice(1), false);

  var status = document.getElementById('dlxStatus');
  Array.prototype.forEach.call(root.querySelectorAll('.dlx-btn[download]'), function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.add('is-done');
      var label = btn.querySelector('.dlx-label');
      if (label) label.textContent = 'Download again';
      if (status) {
        status.textContent = '';
        setTimeout(function () { status.textContent = 'Download started.'; }, 60);
      }
    });
  });
})();
