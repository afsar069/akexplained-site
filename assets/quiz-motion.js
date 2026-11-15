/* Homepage practice icons. Self-hosted Lottie; static SVGs remain the fallback. */
(function () {
  'use strict';

  const zone = document.getElementById('quizzes');
  if (!zone || !('IntersectionObserver' in window)) return;

  const toggle = zone.querySelector('.quiz-motion-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const icons = [];
  let nearby = false;
  let visible = false;
  let paused = false;
  let loading = false;
  let runtime;

  function sync() {
    const reduced = reducedMotion.matches;
    toggle.hidden = reduced || !icons.length;
    toggle.textContent = paused ? 'Play animations' : 'Pause animations';
    toggle.setAttribute('aria-pressed', String(paused));
    icons.forEach(function (icon) {
      icon.container.classList.toggle('is-animated', !reduced);
      if (visible && !document.hidden && !paused && !reduced) icon.animation.play();
      else icon.animation.pause();
    });
  }

  function loadRuntime() {
    if (!runtime) runtime = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = '/assets/vendor/lottie-light-5.13.0.min.js';
      script.onload = function () { resolve(window.lottie); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return runtime;
  }

  async function prepare() {
    if (loading || !nearby || reducedMotion.matches) return;
    loading = true;
    try {
      const lottie = await loadRuntime();
      // A preference change while the player downloads should also stop JSON loading.
      if (reducedMotion.matches) { loading = false; return; }
      zone.querySelectorAll('[data-quiz-animation]').forEach(function (container, index) {
        let ready = false;
        const canvas = document.createElement('span');
        canvas.className = 'quiz-animation';
        container.appendChild(canvas);
        const animation = lottie.loadAnimation({
          container: canvas,
          renderer: 'svg',
          loop: true,
          autoplay: false,
          path: '/assets/animations/quiz-' + container.dataset.quizAnimation + '.json',
          rendererSettings: { focusable: false, progressiveLoad: false }
        });
        animation.addEventListener('DOMLoaded', function () {
          ready = true;
          animation.goToAndStop(index * 12, true);
          icons.push({ animation: animation, container: container });
          sync();
        });
        animation.addEventListener('data_failed', function () {
          ready = false;
          animation.destroy();
          canvas.remove();
        });
        container.closest('a').addEventListener('pointerenter', function () {
          if (ready && !paused && !reducedMotion.matches && !document.hidden) animation.goToAndPlay(0, true);
        });
        container.closest('a').addEventListener('focus', function () {
          if (ready && !paused && !reducedMotion.matches && !document.hidden) animation.goToAndPlay(0, true);
        });
      });
    } catch (_) {
      // The native links and their original SVG icons work without animation assets.
    }
  }

  const preload = new IntersectionObserver(function (entries) {
    nearby = entries[0].isIntersecting;
    if (nearby) prepare();
  }, { rootMargin: '240px' });
  preload.observe(zone);

  const viewport = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    sync();
  });
  viewport.observe(zone);

  toggle.addEventListener('click', function () { paused = !paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', function () { prepare(); sync(); });
})();
