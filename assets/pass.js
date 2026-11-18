/* ==========================================================
   AK Explained — All Access pass page (/pass/)
   ----------------------------------------------------------
   Price, din aur "kitne mahine" database ki pass_plans se aate hain
   (owner /admin/payments/ par badalta hai). Promo ka hisaab aur order
   Edge Function `pass-checkout` banata hai; browser ka bheja amount
   kabhi nahi mana jata. Payment Razorpay Checkout me hota hai; uske baad
   wahi function signature jaanch kar pass deta hai.

   ?next=<same-site path> ho to pass milne ke baad "Back to your test"
   wahan le jata hai (test page ka "Get the pass" button yahi bhejta hai).
   ========================================================== */
(function () {
  'use strict';

  var CHECKOUT_JS = 'https://checkout.razorpay.com/v1/checkout.js';
  var PLAN_ID = 'all-access';
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function el(id) { return document.getElementById(id); }
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function rupees(paise) {
    var r = (Number(paise) || 0) / 100;
    var s = r % 1 === 0 ? String(r) : r.toFixed(2);
    return '₹' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function niceDate(v) {
    var d = new Date(v);
    if (isNaN(d.getTime())) return '';
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function safeNext() {
    try {
      var n = new URLSearchParams(location.search).get('next') || '';
      if (/^\/(?![\/\\])/.test(n) && n.indexOf('javascript:') === -1) return n;
    } catch (e) {}
    return '';
  }

  function whenAuth() {
    return new Promise(function (resolve) {
      var tries = 0;
      (function check() {
        if (window.akAuth) return resolve(window.akAuth);
        if (tries++ > 100) return resolve(null);
        setTimeout(check, 30);
      })();
    });
  }

  var auth = null, session = null, plan = null, quote = null, busy = false;

  function call(action, extra) {
    var cfg = window.AK_SUPABASE || {};
    var body = { action: action, plan: PLAN_ID };
    Object.keys(extra || {}).forEach(function (k) { body[k] = extra[k]; });
    return auth.session().then(function (s) {
      var token = s && s.access_token;
      if (!token) throw new Error('Please log in again, then try once more.');
      return fetch(cfg.url + '/functions/v1/pass-checkout', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'apikey': cfg.publishableKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok && !(data && data.error)) throw new Error('The server did not answer. Please try again.');
        return data || {};
      });
    });
  }

  function showError(msg) {
    var b = el('passError');
    if (!b) return;
    b.textContent = msg || ''; b.hidden = !msg;
  }
  function codeMsg(msg, good) {
    var m = el('passCodeMsg');
    m.textContent = msg || ''; m.hidden = !msg;
    m.className = 'small ' + (good ? 'passok' : 'passbad');
  }

  /* Bina server ke, sirf plan se: promo ke bina ka hisaab (guest ko bhi dikhe). */
  function localSummary() {
    var units = parseInt(el('passUnits').value, 10) || 1;
    el('sumBase').textContent = rupees(plan.price_paise * units);
    el('sumDiscRow').hidden = true;
    el('sumTotal').textContent = rupees(plan.price_paise * units);
  }
  function quoteSummary(q) {
    el('sumBase').textContent = rupees(q.base_paise);
    el('sumDiscRow').hidden = !q.discount_paise;
    el('sumDisc').textContent = '− ' + rupees(q.discount_paise);
    el('sumTotal').textContent = q.amount_paise === 0 ? 'Free' : rupees(q.amount_paise);
  }

  function myPass() {
    if (!session) return Promise.resolve(null);
    return auth.client.from('passes').select('starts_at, ends_at')
      .gt('ends_at', new Date().toISOString()).order('ends_at', { ascending: false })
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) return null;
        var now = Date.now();
        var running = res.data.some(function (p) { return new Date(p.starts_at).getTime() <= now; });
        return { until: res.data[0].ends_at, running: running };
      });
  }

  function showMine(p, justBought) {
    var box = el('passMine');
    var next = safeNext();
    if (!session) { box.hidden = true; return; }
    if (!p) {
      box.innerHTML = '<h2>Your pass</h2><p class="small">You do not have a pass yet.</p>';
    } else {
      box.innerHTML = '<h2>' + (justBought ? 'Your pass is ready' : 'Your pass') + '</h2>' +
        '<p>Your All Access pass is open until <strong>' + esc(niceDate(p.until)) + '</strong>.</p>' +
        (next ? '<p><a class="btn" href="' + esc(next) + '">Go back to your test</a></p>' : '') +
        (p.running ? '' : '<p class="small muted">It starts when your current pass ends.</p>');
    }
    box.hidden = false;
    if (justBought) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function loadCheckout() {
    if (window.Razorpay) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = CHECKOUT_JS; s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('The payment window could not load. Check your connection and try again.')); };
      document.head.appendChild(s);
    });
  }

  function setBusy(on, label) {
    busy = on;
    var go = el('passGo');
    go.disabled = on;
    go.textContent = label || 'Pay and open the pass';
    el('passApply').disabled = on;
    el('passUnits').disabled = on;
  }

  function finished(res) {
    setBusy(false);
    if (!res || !res.ok) { showError((res && res.error) || 'This payment could not be confirmed. If money was taken, it will be returned.'); return; }
    showError('');
    myPass().then(function (p) { showMine(p || { until: res.ends_at, running: true }, true); });
  }

  function pay() {
    if (busy) return;
    showError('');
    var units = parseInt(el('passUnits').value, 10) || 1;
    var code = el('passCode').value.trim();
    setBusy(true, 'Starting the payment…');
    call('order', { units: units, code: code }).then(function (o) {
      if (!o.ok) { setBusy(false); showError(o.error || 'Could not start the payment.'); return; }
      if (o.granted) { finished(o); return; }            /* 100% promo: pass abhi mila */
      return loadCheckout().then(function () {
        var user = session && session.user;
        var rzp = new window.Razorpay({
          key: o.key_id,
          order_id: o.rzp_order_id,
          amount: o.amount,
          currency: o.currency || 'INR',
          name: 'AK Explained',
          description: (o.title || 'All Access pass') + ' — ' + o.days + ' days',
          prefill: { email: (user && user.email) || '' },
          theme: { color: '#0F766E' },
          handler: function (r) {
            setBusy(true, 'Confirming the payment…');
            call('verify', {
              rzp_order_id: r.razorpay_order_id,
              rzp_payment_id: r.razorpay_payment_id,
              rzp_signature: r.razorpay_signature
            }).then(finished, function () {
              finished({ ok: false, error: 'We could not confirm the payment just now. If money was taken, your pass will open in a few minutes, or the money will be returned.' });
            });
          },
          modal: { ondismiss: function () { setBusy(false); } }
        });
        rzp.on('payment.failed', function () {
          showError('The payment did not go through. No pass was opened. If money was taken, it will be returned.');
        });
        rzp.open();
      });
    }).catch(function (e) {
      setBusy(false);
      showError((e && e.message) || 'Could not start the payment.');
    });
  }

  function applyCode() {
    var code = el('passCode').value.trim();
    var units = parseInt(el('passUnits').value, 10) || 1;
    if (!code) { codeMsg(''); quote = null; localSummary(); return; }
    if (!session) { codeMsg('Log in first to use a promo code.', false); return; }
    el('passApply').disabled = true;
    call('quote', { units: units, code: code }).then(function (q) {
      el('passApply').disabled = false;
      if (!q.ok) { quote = null; localSummary(); codeMsg(q.error || 'This promo code is not valid.', false); return; }
      quote = q; quoteSummary(q);
      codeMsg(q.amount_paise === 0 ? 'Code applied. The pass is free.' : 'Code applied. You save ' + rupees(q.discount_paise) + '.', true);
    }).catch(function (e) {
      el('passApply').disabled = false;
      codeMsg((e && e.message) || 'Could not check the code.', false);
    });
  }

  function setup() {
    el('passTitle').textContent = plan.title;
    el('passDesc').textContent = plan.description || '';
    el('passPrice').textContent = rupees(plan.price_paise);
    el('passDays').textContent = plan.days_per_unit;
    var sel = el('passUnits');
    var html = '';
    for (var i = 1; i <= plan.max_units; i++) {
      var days = plan.days_per_unit * i;
      html += '<option value="' + i + '">' + days + ' days' + (plan.days_per_unit === 30 ? ' (' + i + (i === 1 ? ' month' : ' months') + ')' : '') +
        ' — ' + esc(rupees(plan.price_paise * i)) + '</option>';
    }
    sel.innerHTML = html;
    localSummary();
    sel.addEventListener('change', function () {
      if (el('passCode').value.trim() && quote) applyCode(); else localSummary();
    });
    el('passApply').addEventListener('click', applyCode);
    el('passCode').addEventListener('input', function () {
      if (quote) { quote = null; localSummary(); codeMsg(''); }
    });
    el('passForm').addEventListener('submit', function (e) { e.preventDefault(); pay(); });
    var next = safeNext();
    if (next) el('passLogin').href = '/login/?next=' + encodeURIComponent('/pass/?next=' + encodeURIComponent(next));
    el('passBuy').hidden = false;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var notice = el('passNotice');
    whenAuth().then(function (a) {
      auth = a;
      if (!a || !a.configured || !a.client) throw new Error('setup');
      return a.session();
    }).then(function (s) {
      session = s && s.user ? s : null;
      return auth.client.from('pass_plans').select('id, title, description, price_paise, days_per_unit, max_units')
        .eq('id', PLAN_ID).eq('active', true).maybeSingle();
    }).then(function (res) {
      if (res.error || !res.data || res.data.price_paise == null) {
        notice.textContent = 'The pass is not on sale yet. Please check back soon.';
        return myPass().then(function (p) { if (p) showMine(p, false); });
      }
      plan = res.data;
      notice.hidden = true;
      setup();
      if (window.akAuth && window.akAuth.refreshHeader) window.akAuth.refreshHeader(session);
      return myPass().then(function (p) { showMine(p, false); });
    }).catch(function () {
      notice.textContent = 'The pass could not be loaded. Check your connection and try again.';
    });
  });
})();
