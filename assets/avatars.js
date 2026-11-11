/* ==========================================================
   AK Explained — ready-made avatars (shared)
   ----------------------------------------------------------
   Student koi apni picture upload nahi karta; neeche di hui
   ready-made avatars me se ek chun leta hai. Uski choice
   profiles.avatar_id me ek chhota id ('a1'..'a10') ke roop me
   rehti hai — koi file upload, koi storage nahi.

   Jo kuch nahi chunta use DEFAULT ('a9') milta hai (owner, 2026-11-11).

   Mapping (owner ke avatars, preview order):
     a1 Male Student     a2 Male Class Clown  a3 Male Macho Man
     a4 Male Scientist   a5 Male Professor    a6 Female Reader
     a7 Female Teacher   a8 Female Scientist  a9 Female Professor (default)
     a10 Female Class Clown

   Ye file login (signup step), account page, review form aur home
   par load hoti hai, taaki picker aur dikhane ka tarika ek jaisa rahe.
   ========================================================== */
(function () {
  'use strict';

  var IDS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'];
  var DEFAULT = 'a9';

  function isValid(id) { return IDS.indexOf(id) !== -1; }
  // Jo id valid na ho (null/khaali bhi) use default maan lo.
  function resolve(id) { return isValid(id) ? id : DEFAULT; }
  function url(id) { return '/assets/avatars/' + resolve(id) + '.svg'; }

  // Picker grid container me bana do. current = chuna hua id (ya khaali -> default).
  // onPick(id) har choose par chalta hai. Hamesha ek avatar chuna rehta hai (koi "None" nahi).
  function buildPicker(container, current, onPick) {
    if (!container) return;
    var sel = resolve(current);
    container.innerHTML = IDS.map(function (id) {
      var on = id === sel;
      return '<button type="button" class="avpick' + (on ? ' sel' : '') +
        '" data-av="' + id + '" aria-pressed="' + (on ? 'true' : 'false') +
        '" title="Avatar ' + id.slice(1) + '">' +
        '<img src="' + url(id) + '" alt="Avatar ' + id.slice(1) + '" width="60" height="60" loading="lazy"></button>';
    }).join('');

    container.addEventListener('click', function (e) {
      var b = e.target.closest('.avpick');
      if (!b || !container.contains(b)) return;
      var id = b.getAttribute('data-av');
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

  window.akAvatars = {
    ids: IDS,
    defaultId: DEFAULT,
    isValid: isValid,
    resolve: resolve,
    url: url,
    buildPicker: buildPicker
  };
})();
