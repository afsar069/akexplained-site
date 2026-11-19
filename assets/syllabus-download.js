/* Download Syllabus page (/exams/pgt/up-pgt/syllabus-download/):
   jab koi Download PDF dabata hai, us card ka button dusre rang ka ho jata hai aur "Download again" likha aata hai.
   Download khud nahi rokta: link ka apna download chalta rehta hai, dobara dabane par phir se download hota hai.
   Ye sirf is page ke liye hai; JavaScript na chale to button jaisa tha waisa hi kaam karta hai. */
(function () {
  var buttons = document.querySelectorAll('.pgt-download-btn');
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.add('is-done');
      var label = btn.querySelector('.pgt-download-label');
      if (label) label.textContent = 'Download again';
      // Screen reader ko batao (har click par phir se bolne ke liye pehle khali karte hain).
      var card = btn.closest('.pgt-download-card');
      var status = card ? card.querySelector('.pgt-download-status') : null;
      if (status) {
        status.textContent = '';
        setTimeout(function () { status.textContent = 'Download started.'; }, 60);
      }
    });
  });
})();
