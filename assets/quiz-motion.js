/* Homepage exam and practice icons. One self-hosted Lottie player, static fallbacks. */
(function () {
  'use strict';

  if (!('IntersectionObserver' in window)) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let runtime;

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

  function initZone(zone) {
    const toggle = zone.querySelector('.quiz-motion-toggle');
    const icons = [];
    let nearby = false;
    let visible = false;
    let paused = false;
    let loading = false;

    function sync() {
      const reduced = reducedMotion.matches;
      toggle.hidden = reduced || !icons.length;
      toggle.textContent = paused ? 'Play animations' : 'Pause animations';
      toggle.setAttribute('aria-pressed', String(paused));
      if (zone.id === 'exams') toggle.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' exam animations');
      icons.forEach(function (icon) {
        icon.container.classList.toggle('is-animated', !reduced);
        if (visible && !document.hidden && !paused && !reduced) icon.animation.play();
        else icon.animation.pause();
      });
    }

    async function prepare() {
      if (loading || !nearby || reducedMotion.matches) return;
      loading = true;
      try {
        const lottie = await loadRuntime();
        // A preference change while the player downloads should also stop JSON loading.
        if (reducedMotion.matches) { loading = false; return; }
        zone.querySelectorAll('[data-quiz-animation], [data-exam-animation]').forEach(function (container) {
          const exam = Boolean(container.dataset.examAnimation);
          const name = container.dataset.examAnimation || container.dataset.quizAnimation;
          const revision = exam ? 'exam-icons-1' : 'full-turn-1';
          let ready = false;
          const canvas = document.createElement('span');
          canvas.className = 'quiz-animation';
          container.appendChild(canvas);
          const animation = lottie.loadAnimation({
            container: canvas,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            // Dynamic assets do not pass through Eleventy's HTML cache-busting transform.
            path: '/assets/animations/' + (exam ? 'exam-' : 'quiz-') + name + '.json?v=' + revision,
            rendererSettings: { focusable: false, progressiveLoad: false }
          });
          animation.addEventListener('DOMLoaded', function () {
            ready = true;
            animation.goToAndStop(0, true);
            icons.push({ animation: animation, container: container });
            sync();
          });
          animation.addEventListener('data_failed', function () {
            ready = false;
            animation.destroy();
            canvas.remove();
          });
          function replay() {
            if (ready && !paused && !reducedMotion.matches && !document.hidden) animation.goToAndPlay(0, true);
          }
          container.closest('a').addEventListener('pointerenter', replay);
          container.addEventListener('pointerenter', replay);
          container.closest('a').addEventListener('focus', replay);
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
  }

  document.querySelectorAll('#exams, #quizzes').forEach(initZone);
})();
