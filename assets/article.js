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

  // Quiz: login ki zarurat nahi. Option par click karte hi sahi / galat dikhta hai, aur sahi jawab bhi.
  // Score sirf is page par dikhta hai, kahin save nahi hota. "Try again" se dobara shuru.
  [].forEach.call(document.querySelectorAll('.quiz'), function (quiz) {
    quiz.classList.add('qz-live'); // ab "Answer: ..." wali line chhup jati hai (JS na chale to wahi dikhti rahti hai)
    var qs = [].slice.call(quiz.querySelectorAll('.qz'));
    var scoreEl = quiz.querySelector('.qz-score');
    var resetBtn = quiz.querySelector('.qz-reset');
    var right = 0, done = 0;

    var render = function () {
      if (!done) scoreEl.textContent = qs.length + ' questions \u00b7 pick an answer to begin';
      else if (done === qs.length) scoreEl.textContent = 'Finished! You scored ' + right + ' out of ' + qs.length + '.';
      else scoreEl.textContent = 'Score: ' + right + ' / ' + done + ' answered \u00b7 ' + (qs.length - done) + ' left';
      resetBtn.hidden = !done;
    };

    qs.forEach(function (q) {
      var correct = +q.getAttribute('data-correct');
      var opts = [].slice.call(q.querySelectorAll('.qz-opt'));
      var fb = q.querySelector('.qz-fb');
      opts.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          if (q.classList.contains('is-done')) return;
          q.classList.add('is-done');
          done++;
          var ok = i === correct;
          if (ok) right++; else btn.classList.add('is-wrong');
          opts[correct].classList.add('is-right');
          opts.forEach(function (o) { o.disabled = true; });
          var exp = q.querySelector('.qz-exp');
          fb.innerHTML = '<strong>' + (ok ? 'Correct!' : 'Not quite.') + '</strong> ' +
            (ok ? '' : 'The right answer is ' + String.fromCharCode(65 + correct) + '. ') + (exp ? exp.innerHTML : '');
          fb.className = 'qz-fb ' + (ok ? 'ok' : 'no');
          fb.hidden = false;
          render();
        });
      });
    });

    resetBtn.addEventListener('click', function () {
      qs.forEach(function (q) {
        q.classList.remove('is-done');
        [].forEach.call(q.querySelectorAll('.qz-opt'), function (o) {
          o.disabled = false; o.classList.remove('is-right', 'is-wrong');
        });
        var fb = q.querySelector('.qz-fb'); fb.hidden = true; fb.innerHTML = ''; fb.className = 'qz-fb';
      });
      right = 0; done = 0; render();
      quiz.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    render();
  });

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
