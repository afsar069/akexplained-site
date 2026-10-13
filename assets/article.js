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

  // Share: menu <details> hai, isliye JS ke bina bhi khulta hai. JS sirf ye sudhar jodta hai:
  // phone par phone ka apna share sheet, bahar click / Escape par band hona, aur "Copy link".
  // (Print button seedha window.print() chalata hai, uske liye JS nahi chahiye.)
  var wrap = document.querySelector('.sharewrap');
  var copyBtn = document.getElementById('copyLink');
  if (wrap) {
    var url = copyBtn ? copyBtn.getAttribute('data-url') : location.href;
    var summary = wrap.querySelector('summary');
    summary.addEventListener('click', function (e) {
      var touch = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
      if (touch && navigator.share) {
        e.preventDefault();
        navigator.share({ title: document.title, url: url }).catch(function () {});
      }
    });
    document.addEventListener('click', function (e) {
      if (wrap.open && !wrap.contains(e.target)) wrap.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.open) { wrap.open = false; summary.focus(); }
    });
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var done = function () {
        copyBtn.textContent = 'Link copied';
        setTimeout(function () { copyBtn.textContent = 'Copy link'; wrap.open = false; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { window.prompt('Copy this link', url); });
      } else {
        window.prompt('Copy this link', url);
      }
    });
  }
})();
