/* ==========================================================
   AK Explained — review form
   Review Prof. Afsar Khan ko jaata hai. Wo approve karte hain,
   tabhi site par dikhta hai.
   ========================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     EMAIL SETUP — ek hi line badalni hai.
     web3forms.com par apna email daalein, wahan se ek access key
     email par aa jayegi. Us key ko neeche quotes ke andar chipka dein.
     Jab tak key nahi hai, form WhatsApp par bhej dega — kuch tootega nahi.
     --------------------------------------------------------- */
  const ACCESS_KEY = '';
  const WHATSAPP = 'https://api.whatsapp.com/send?phone=919760001569&text=';

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('reviewForm');
    if (!form) return;
    const msg = document.getElementById('formMsg');
    const btn = form.querySelector('button[type=submit]');

    function say(kind, html) {
      msg.className = 'formmsg show ' + kind;
      msg.innerHTML = html;
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function values() {
      const d = new FormData(form);
      return {
        name: (d.get('name') || '').trim(),
        role: (d.get('role') || '').trim(),
        heading: (d.get('heading') || '').trim(),
        stars: d.get('stars') || '5',
        review: (d.get('review') || '').trim(),
        email: (d.get('email') || '').trim(),
      };
    }

    function asText(v) {
      return 'New review — AK Explained\n\n' +
             'Name: ' + v.name + '\n' +
             (v.role ? 'Preparing for: ' + v.role + '\n' : '') +
             'Heading: ' + v.heading + '\n' +
             'Stars: ' + v.stars + '/5\n' +
             (v.email ? 'Email: ' + v.email + '\n' : '') +
             '\nReview:\n' + v.review;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const v = values();

      if (!v.name || !v.heading || !v.review) {
        return say('bad', 'Please fill in your name, a heading and your review.');
      }
      if (v.review.length < 20) {
        return say('bad', 'Please write a little more — at least 20 characters.');
      }

      // Key nahi lagi hai to WhatsApp par bhej do, taaki review kabhi khoye nahi.
      if (!ACCESS_KEY) {
        window.open(WHATSAPP + encodeURIComponent(asText(v)), '_blank', 'noopener');
        return say('ok', '<strong>Thank you.</strong> Your review has opened in WhatsApp — just press send. ' +
                         'Prof. Afsar Khan will read it, and it will appear on the site once he approves it.');
      }

      btn.disabled = true;
      btn.textContent = 'Sending…';

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: 'Naya review — AK Explained',
          from_name: 'AK Explained website',
          name: v.name, role: v.role, heading: v.heading,
          stars: v.stars + '/5', email: v.email, review: v.review,
        }),
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.success) throw new Error(d.message || 'send failed');
          form.reset();
          say('ok', '<strong>Thank you.</strong> Your review has reached Prof. Afsar Khan. ' +
                    'It will appear on the site once he has approved it.');
        })
        .catch(function () {
          say('bad', 'That did not go through. <a href="' + WHATSAPP + encodeURIComponent(asText(v)) +
                     '" target="_blank" rel="noopener">Send it on WhatsApp instead</a> — it will reach him.');
        })
        .then(function () { btn.disabled = false; btn.textContent = 'Send my review'; });
    });
  });
})();
