/* Article pages: "On this page" me abhi padha ja raha section highlight karna,
   aur print karte waqt saari FAQ / Quick revision patti khol dena.
   Ye na chale tab bhi page poora padha ja sakta hai (links aur patti dono bina JS ke chalte hain). */
(function () {
  var box = document.querySelector('.tocbox');
  if (box) {
    var links = [].slice.call(box.querySelectorAll('a[href^="#"]'));
    var heads = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var current = -1, queued = false;

    var mark = function () {
      queued = false;
      var idx = 0;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i] && heads[i].getBoundingClientRect().top <= 140) idx = i;
      }
      if (idx === current) return;
      current = idx;
      links.forEach(function (a, i) {
        var on = i === idx;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      // Lambi list me active item hamesha dikhta rahe
      var list = box.querySelector('.toclist');
      var a = links[idx];
      if (list && a) {
        var top = a.offsetTop - list.offsetTop;
        if (top < list.scrollTop || top + a.offsetHeight > list.scrollTop + list.clientHeight) {
          list.scrollTop = top - list.clientHeight / 2;
        }
      }
    };
    var onScroll = function () { if (!queued) { queued = true; requestAnimationFrame(mark); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    mark();
  }

  // Print: band patti ka text bhi chhapna chahiye
  window.addEventListener('beforeprint', function () {
    [].forEach.call(document.querySelectorAll('.article details'), function (d) { d.open = true; });
  });
})();
