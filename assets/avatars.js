/* ==========================================================
   AK Explained — ready-made avatars (shared)
   ----------------------------------------------------------
   Student koi apni picture upload nahi karta; neeche di hui
   ready-made avatars me se ek chun leta hai. Uski choice
   profiles.avatar_id me ek chhota id ('a1'..'a10') ke roop me
   rehti hai — koi file upload, koi storage nahi.

   Ye file account page, review form aur home par load hoti hai,
   taaki picker aur dikhane ka tarika ek jaisa rahe.
   ========================================================== */
(function () {
  'use strict';

  var IDS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'];
  var FALLBACK = '/assets/avatar-placeholder.webp';

  function isValid(id) { return IDS.indexOf(id) !== -1; }
  function url(id) { return isValid(id) ? '/assets/avatars/' + id + '.svg' : FALLBACK; }

  // Picker grid container me bana do. current = chuna hua id (ya khaali).
  // onPick(id) har choose par chalta hai. Ek "None" option bhi hai (default avatar).
  function buildPicker(container, current, onPick) {
    if (!container) return;
    var html = '<button type="button" class="avpick avpick-none' +
      (isValid(current) ? '' : ' sel') + '" data-av="" aria-pressed="' +
      (isValid(current) ? 'false' : 'true') + '" title="No picture (default)">' +
      '<img src="' + FALLBACK + '" alt="Default picture" width="56" height="56"></button>';
    html += IDS.map(function (id) {
      var on = id === current;
      return '<button type="button" class="avpick' + (on ? ' sel' : '') +
        '" data-av="' + id + '" aria-pressed="' + (on ? 'true' : 'false') +
        '" title="Avatar ' + id.slice(1) + '">' +
        '<img src="' + url(id) + '" alt="Avatar ' + id.slice(1) + '" width="56" height="56"></button>';
    }).join('');
    container.innerHTML = html;

    container.addEventListener('click', function (e) {
      var b = e.target.closest('.avpick');
      if (!b || !container.contains(b)) return;
      var id = b.getAttribute('data-av') || '';
      var all = container.querySelectorAll('.avpick');
      for (var i = 0; i < all.length; i++) {
        all[i].classList.remove('sel');
        all[i].setAttribute('aria-pressed', 'false');
      }
      b.classList.add('sel');
      b.setAttribute('aria-pressed', 'true');
      if (onPick) onPick(id);
    });
  }

  window.akAvatars = { ids: IDS, isValid: isValid, url: url, buildPicker: buildPicker };
})();
