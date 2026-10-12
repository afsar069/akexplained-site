/* ==========================================================
   AK Explained — literary age pages: Print and Share buttons
   ========================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var printBtn = document.querySelector('[data-print]');
    var shareBtn = document.querySelector('[data-share]');
    var msg = document.querySelector('[data-share-msg]');
    var timer;

    if (printBtn) {
      printBtn.addEventListener('click', function () { window.print(); });
    }

    /* FAQ answers sit inside closed <details>, which print as hidden.
       Open them just for printing, then put them back as they were. */
    var reopened = [];
    window.addEventListener('beforeprint', function () {
      reopened = [];
      document.querySelectorAll('details:not([open])').forEach(function (d) {
        d.open = true;
        reopened.push(d);
      });
    });
    window.addEventListener('afterprint', function () {
      reopened.forEach(function (d) { d.open = false; });
      reopened = [];
    });

    function say(text) {
      if (!msg) return;
      msg.textContent = text;
      clearTimeout(timer);
      timer = setTimeout(function () { msg.textContent = ''; }, 3000);
    }

    /* Old browsers and non-secure pages have no clipboard API. */
    function copyOldWay(text) {
      var box = document.createElement('textarea');
      box.value = text;
      box.setAttribute('readonly', '');
      box.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(box);
      box.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(box);
      return ok;
    }

    async function copyLink(url) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
          return true;
        }
      } catch (e) { /* fall through to the old way */ }
      return copyOldWay(url);
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', async function () {
        var url = location.origin + location.pathname;
        var title = shareBtn.getAttribute('data-share-title') || document.title;

        if (navigator.share) {
          try {
            await navigator.share({ title: title, url: url });
            return;
          } catch (e) {
            if (e && e.name === 'AbortError') return; // reader closed the share sheet
            /* any other error: copy the link instead */
          }
        }

        var copied = await copyLink(url);
        say(copied ? 'Link copied' : 'Could not copy the link. Please copy it from the address bar.');
      });
    }
  });
})();
