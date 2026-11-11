/* ==========================================================
   AK Explained — ready-made avatars (shared)
   ----------------------------------------------------------
   Student koi apni picture upload nahi karta; neeche di hui
   ready-made avatars me se ek chun leta hai. Uski choice
   profiles.avatar_id me ek chhota id ('a1'..'a10') ke roop me
   rehti hai — koi file upload, koi storage nahi.

   DEFAULT = graduation cap (assets/avatars/default.svg). Jo kuch
   nahi chunta use yahi milta hai (owner, 2026-11-11). Default ko
   avatar_id = null se dikhaya jaata hai (koi character id nahi).

   Mapping (owner ke 10 character avatars, preview order):
     a1 Male Student     a2 Male Class Clown  a3 Male Macho Man
     a4 Male Scientist   a5 Male Professor    a6 Female Reader
     a7 Female Teacher   a8 Female Scientist  a9 Female Professor
     a10 Female Class Clown

   Ye file login (signup step), account page, review form aur home
   par load hoti hai, taaki picker aur dikhane ka tarika ek jaisa rahe.
   ========================================================== */
(function () {
  'use strict';

  var IDS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10'];
  var DEFAULT_URL = '/assets/avatars/default.svg';

  function isValid(id) { return IDS.indexOf(id) !== -1; }
  // Character chuna ho to uska svg; warna (null/khaali) default graduation cap.
  function url(id) { return isValid(id) ? '/assets/avatars/' + id + '.svg' : DEFAULT_URL; }

  // Picker grid: pehla tile default (graduation cap, data-av=""), phir 10 characters.
  // current = chosen id, ya khaali/null = default. onPick(id) chalta hai ('' matlab default).
  function buildPicker(container, current, onPick) {
    if (!container) return;
    var sel = isValid(current) ? current : '';          // '' => default tile

    var html = '<button type="button" class="avpick avpick-default' + (sel === '' ? ' sel' : '') +
      '" data-av="" aria-pressed="' + (sel === '' ? 'true' : 'false') +
      '" title="Default picture"><img src="' + DEFAULT_URL +
      '" alt="Default picture" width="60" height="60"></button>';

    html += IDS.map(function (id) {
      var on = id === sel;
      return '<button type="button" class="avpick' + (on ? ' sel' : '') +
        '" data-av="' + id + '" aria-pressed="' + (on ? 'true' : 'false') +
        '" title="Avatar ' + id.slice(1) + '">' +
        '<img src="' + url(id) + '" alt="Avatar ' + id.slice(1) + '" width="60" height="60" loading="lazy"></button>';
    }).join('');

    container.innerHTML = html;

    container.addEventListener('click', function (e) {
      var b = e.target.closest('.avpick');
      if (!b || !container.contains(b)) return;
      var id = b.getAttribute('data-av') || '';          // '' => default
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
    defaultUrl: DEFAULT_URL,
    isValid: isValid,
    url: url,
    buildPicker: buildPicker
  };
})();
