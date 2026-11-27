/* ==========================================================
   AK Explained — admin area (/admin/...)
   ----------------------------------------------------------
   Sirf owner (public.paper_admins me jiska row hai) ise use kar sakta
   hai. Browser publishable key + admin ke apne login se likhta hai;
   asli darwaza database ka RLS hai, ye page nahi.

   Ek hi file saare admin pages chalati hai. Har page ke <body> par
   data-admin="<naam>" hota hai; gate pass hone par us naam ka section
   chalta hai. Upload page ka apna script hai (upload-paper.js); yahan
   wo sirf upar ki nav banata hai.

   Ye file auth.js se PEHLE chal sakti hai, isliye window.akAuth ka
   thoda intezaar — cbt.js / review-form.js ki tarah.
   ========================================================== */
(function () {
  'use strict';

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

  function el(id) { return document.getElementById(id); }
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function show(x) { if (x) x.hidden = false; }
  function hide(x) { if (x) x.hidden = true; }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function niceDate(v) {
    if (!v) return '—';
    var d = new Date(v);
    if (isNaN(d.getTime())) return '—';
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function sinceDays(v) {
    if (!v) return null;
    var d = new Date(v); if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }
  function ago(v) {
    var n = sinceDays(v);
    if (n == null) return 'never';
    if (n <= 0) return 'today';
    if (n === 1) return 'yesterday';
    if (n < 30) return n + ' days ago';
    return niceDate(v);
  }

  // The tools, in order. Home first.
  var TOOLS = [
    { page: 'home', label: 'Admin home', href: '/admin/' },
    { page: 'upload', label: 'Upload a paper', href: '/admin/upload-paper/' },
    { page: 'article', label: 'Publish an article', href: '/admin/upload-article/' },
    { page: 'articles', label: 'All articles', href: '/admin/articles/' },
    { page: 'freemcq', label: 'Free MCQ set', href: '/admin/upload-mcq/' },
    { page: 'daily', label: 'Correct a Daily quiz', href: '/admin/upload-daily/' },
    { page: 'papers', label: 'All papers', href: '/admin/papers/' },
    { page: 'notify', label: 'Send a notice', href: '/admin/notify/' },
    { page: 'students', label: 'Students', href: '/admin/students/' },
    { page: 'reviews', label: 'Reviews', href: '/admin/reviews/' },
    { page: 'payments', label: 'Payments', href: '/admin/payments/' }
  ];

  function buildNav(active) {
    var nav = el('adminNav');
    if (!nav) return;
    nav.innerHTML = TOOLS.map(function (t) {
      var on = t.page === active ? ' aria-current="page"' : '';
      return '<a href="' + t.href + '"' + on + '>' + esc(t.label) + '</a>';
    }).join('');
    show(nav);
  }

  /* The gate: who is this? Resolves {client, uid} for an admin, or null. */
  function gate() {
    return whenAuth().then(function (auth) {
      if (!auth || !auth.configured || !auth.client) return null;
      return auth.session().then(function (s) {
        if (!s || !s.user) return null;
        return auth.client.from('paper_admins').select('user_id').maybeSingle()
          .then(function (res) {
            if (res.error || !res.data) return null;
            return { client: auth.client, uid: s.user.id, auth: auth };
          });
      });
    }).catch(function () { return null; });
  }

  /* Read every row of a table in pages of 1000 (PostgREST caps a request). */
  function readAll(client, table, columns, tweak) {
    var out = [];
    function page(from) {
      var q = client.from(table).select(columns).range(from, from + 999);
      if (tweak) q = tweak(q);
      return q.then(function (res) {
        if (res.error) throw new Error(res.error.message);
        var rows = res.data || [];
        out = out.concat(rows);
        if (rows.length === 1000) return page(from + 1000);
        return out;
      });
    }
    return page(0);
  }

  /* ---------------- ALL PAPERS ---------------- */
  function papersSection(ctx) {
    var box = el('admPapers');
    if (!box) return;
    box.innerHTML = '<p class="small">Loading your papers…</p>';

    ctx.client.from('paper_catalog')
      .select('set_id, title, exam_id, kind, number, question_count, status, access')
      .then(function (res) {
        if (res.error) { box.innerHTML = '<p class="admerr">Could not load the papers: ' + esc(res.error.message) + '</p>'; return; }
        var rows = (res.data || []).slice().sort(function (a, b) {
          return String(a.exam_id || '~').localeCompare(String(b.exam_id || '~'))
            || (a.number || 0) - (b.number || 0)
            || String(a.set_id).localeCompare(String(b.set_id));
        });
        if (!rows.length) { box.innerHTML = '<p class="small">No papers yet.</p>'; return; }
        box.innerHTML = tableHtml(rows);
      });

    function examLabel(id) {
      if (!id) return 'English Literature';
      if (id === 'state-psc') return 'UP Assistant Professor';
      if (id === 'pgt') return 'UP PGT';
      if (id === 'ugc-net') return 'UGC NET';
      return id;
    }
    function tableHtml(rows) {
      return '<table class="admtable"><thead><tr>' +
        '<th>Paper</th><th>For</th><th>Questions</th><th>Status</th><th>Change</th>' +
        '</tr></thead><tbody>' +
        rows.map(function (r) {
          var live = r.status === 'live';
          return '<tr data-set="' + esc(r.set_id) + '">' +
            '<td><strong>' + esc(r.title || r.set_id) + '</strong><span class="admsub">' + esc(r.set_id) + '</span></td>' +
            '<td>' + esc(examLabel(r.exam_id)) + '<span class="admsub">' + (r.kind === 'mock-test' ? 'Mock test' : 'MCQ set') + '</span></td>' +
            '<td>' + esc(r.question_count) + '</td>' +
            '<td><span class="admtag ' + (live ? 'is-live' : 'is-draft') + '">' + (live ? 'Live' : 'Draft') + '</span>' +
              (r.access === 'paid' ? ' <span class="admtag is-paid">Paid</span>' : '') + '</td>' +
            '<td><button class="btn alt admbtn" data-toggle data-set="' + esc(r.set_id) + '" data-to="' + (live ? 'draft' : 'live') + '">' +
              (live ? 'Make draft' : 'Make live') + '</button></td>' +
            '</tr>';
        }).join('') + '</tbody></table>' +
        '<p class="small admnote">Live = students can take it. Draft = only you can see it. A change takes effect at once in the database; the public page updates the next time the site is built.</p>';
    }

    box.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('[data-toggle]') : null;
      if (!btn) return;
      var sid = btn.getAttribute('data-set');
      var to = btn.getAttribute('data-to');
      btn.disabled = true; btn.textContent = 'Saving…';
      ctx.client.from('mcq_papers').update({ status: to }).eq('set_id', sid)
        .then(function (res) {
          if (res.error) { btn.disabled = false; btn.textContent = 'Try again'; alert('Could not change it: ' + res.error.message); return; }
          var tr = btn.closest('tr');
          var live = to === 'live';
          tr.querySelector('.admtag').className = 'admtag ' + (live ? 'is-live' : 'is-draft');
          tr.querySelector('.admtag').textContent = live ? 'Live' : 'Draft';
          btn.disabled = false;
          btn.textContent = live ? 'Make draft' : 'Make live';
          btn.setAttribute('data-to', live ? 'draft' : 'live');
        });
    });
  }

  /* ---------------- SEND A NOTICE ---------------- */
  function notifySection(ctx) {
    var form = el('admNotifyForm');
    if (!form) return;
    var audience = el('admAudience');
    var studentWrap = el('admStudentWrap');
    var studentSel = el('admStudent');
    var titleIn = el('admTitle');
    var bodyIn = el('admBody');
    var linkIn = el('admLink');
    var errBox = el('admNotifyError');
    var okBox = el('admNotifyOk');
    var listBox = el('admNotifList');

    // students for the "one student" picker
    ctx.client.from('profiles').select('id, display_name').then(function (res) {
      var rows = (res.data || []).slice().sort(function (a, b) {
        return String(a.display_name || '').localeCompare(String(b.display_name || ''));
      });
      studentSel.innerHTML = '<option value="">Choose a student…</option>' +
        rows.map(function (r) {
          return '<option value="' + esc(r.id) + '">' + esc(r.display_name || '(no name)') + '</option>';
        }).join('');
    });

    audience.addEventListener('change', function () {
      if (audience.value === 'user') { show(studentWrap); } else { hide(studentWrap); }
    });

    function fail(m) { errBox.textContent = m; show(errBox); hide(okBox); }

    function loadList() {
      listBox.innerHTML = '<li class="small">Loading…</li>';
      ctx.client.from('notifications')
        .select('id, audience, user_id, title, body, link, created_at')
        .order('created_at', { ascending: false }).limit(30)
        .then(function (res) {
          if (res.error) { listBox.innerHTML = '<li class="admerr">Could not load: ' + esc(res.error.message) + '</li>'; return; }
          var rows = res.data || [];
          if (!rows.length) { listBox.innerHTML = '<li class="small">No notices sent yet.</li>'; return; }
          listBox.innerHTML = rows.map(function (r) {
            var who = r.audience === 'all' ? 'Everyone' : 'One student';
            return '<li data-id="' + esc(r.id) + '"><div><strong>' + esc(r.title) + '</strong>' +
              '<span class="admsub">' + who + ' · ' + niceDate(r.created_at) + '</span>' +
              (r.body ? '<span class="admnbody">' + esc(r.body) + '</span>' : '') + '</div>' +
              '<button class="btn alt admbtn" data-del="' + esc(r.id) + '">Delete</button></li>';
          }).join('');
        });
    }
    loadList();

    listBox.addEventListener('click', function (ev) {
      var btn = ev.target.closest ? ev.target.closest('[data-del]') : null;
      if (!btn) return;
      if (!window.confirm('Delete this notice? Students will no longer see it.')) return;
      var id = btn.getAttribute('data-del');
      btn.disabled = true;
      ctx.client.from('notifications').delete().eq('id', id).then(function (res) {
        if (res.error) { btn.disabled = false; alert('Could not delete: ' + res.error.message); return; }
        loadList();
      });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      hide(errBox); hide(okBox);
      var who = audience.value;
      var title = String(titleIn.value || '').trim();
      var body = String(bodyIn.value || '').trim();
      var link = String(linkIn.value || '').trim();

      if (!title) return fail('Write a short title.');
      if (title.length > 120) return fail('The title is too long (120 letters at most).');
      if (body.length > 1000) return fail('The message is too long (1000 letters at most).');
      if (link && !/^\/[^/]/.test(link)) return fail('A link must be a page on this site, starting with one "/", for example /exams/ . Leave it empty for no link.');
      var row = { audience: who, title: title, body: body || null, link: link || null };
      if (who === 'user') {
        if (!studentSel.value) return fail('Choose which student this is for.');
        row.user_id = studentSel.value;
      }

      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending…';
      ctx.client.from('notifications').insert(row).then(function (res) {
        btn.disabled = false; btn.textContent = 'Send notice';
        if (res.error) return fail('It was not sent. The database said: ' + res.error.message);
        okBox.textContent = who === 'all'
          ? 'Sent to every student. It will show on their dashboard bell.'
          : 'Sent to that student. It will show on their dashboard bell.';
        show(okBox);
        form.reset(); hide(studentWrap);
        loadList();
      });
    });
  }

  /* ---------------- STUDENTS ---------------- */
  function studentsSection(ctx) {
    var box = el('admStudents');
    if (!box) return;
    box.innerHTML = '<p class="small">Loading students…</p>';

    Promise.all([
      ctx.client.from('profiles').select('id, display_name, created_at'),
      readAll(ctx.client, 'attempts', 'user_id, is_correct, answered_at'),
      ctx.client.from('quiz_runs').select('user_id, completed_at')
    ]).then(function (r) {
      if (r[0].error) { box.innerHTML = '<p class="admerr">Could not load students: ' + esc(r[0].error.message) + '</p>'; return; }
      var profiles = r[0].data || [];
      var attempts = r[1] || [];
      var runs = (r[2] && r[2].data) || [];

      var by = {};
      profiles.forEach(function (p) {
        by[p.id] = { name: p.display_name || '(no name)', joined: p.created_at,
          answers: 0, correct: 0, last: null, quizzes: 0 };
      });
      function touch(id) { if (!by[id]) by[id] = { name: '(no name)', joined: null, answers: 0, correct: 0, last: null, quizzes: 0 }; return by[id]; }
      attempts.forEach(function (a) {
        var s = touch(a.user_id);
        s.answers++; if (a.is_correct) s.correct++;
        if (!s.last || a.answered_at > s.last) s.last = a.answered_at;
      });
      runs.forEach(function (q) {
        var s = touch(q.user_id);
        s.quizzes++;
        if (!s.last || q.completed_at > s.last) s.last = q.completed_at;
      });

      var list = Object.keys(by).map(function (id) { return by[id]; });
      list.sort(function (a, b) { return String(b.last || '').localeCompare(String(a.last || '')); });

      var active7 = list.filter(function (s) { var n = sinceDays(s.last); return n != null && n <= 7; }).length;

      box.innerHTML =
        '<div class="admstat"><span><b>' + list.length + '</b> students</span>' +
        '<span><b>' + active7 + '</b> active in the last 7 days</span></div>' +
        '<table class="admtable"><thead><tr>' +
        '<th>Name</th><th>Joined</th><th>Answers</th><th>Accuracy</th><th>Quizzes</th><th>Last active</th>' +
        '</tr></thead><tbody>' +
        list.map(function (s) {
          var acc = s.answers ? Math.round(s.correct * 100 / s.answers) + '%' : '—';
          return '<tr><td><strong>' + esc(s.name) + '</strong></td>' +
            '<td>' + niceDate(s.joined) + '</td>' +
            '<td>' + s.answers + '</td>' +
            '<td>' + acc + '</td>' +
            '<td>' + s.quizzes + '</td>' +
            '<td>' + esc(ago(s.last)) + '</td></tr>';
        }).join('') + '</tbody></table>' +
        '<p class="small admnote">This is what the quiz records show. It does not include email addresses. "Last active" is the last time the student answered a question or finished a quiz.</p>';
    }).catch(function (e) {
      box.innerHTML = '<p class="admerr">Could not load students: ' + esc(e && e.message ? e.message : 'unknown error') + '</p>';
    });
  }

  /* ---------------- REVIEWS ---------------- */
  function reviewsSection(ctx) {
    var box = el('admReviews');
    if (!box) return;
    box.innerHTML = '<p class="small">Loading reviews…</p>';

    function load() {
      ctx.client.from('reviews')
        .select('id, name, role, heading, stars, body, visible, created_at')
        .order('created_at', { ascending: false })
        .then(function (res) {
          if (res.error) { box.innerHTML = '<p class="admerr">Could not load reviews: ' + esc(res.error.message) + '</p>'; return; }
          var rows = res.data || [];
          if (!rows.length) { box.innerHTML = '<p class="small">No reviews yet.</p>'; return; }
          box.innerHTML = rows.map(function (r) {
            var stars = '★★★★★'.slice(0, r.stars) + '☆☆☆☆☆'.slice(0, 5 - r.stars);
            return '<div class="admreview' + (r.visible ? '' : ' is-hidden') + '" data-id="' + esc(r.id) + '">' +
              '<div class="admreview-head"><strong>' + esc(r.name) + '</strong>' +
              (r.role ? '<span class="admsub">' + esc(r.role) + '</span>' : '') +
              '<span class="admstars" aria-label="' + r.stars + ' out of 5">' + stars + '</span>' +
              (r.visible ? '' : '<span class="admtag is-draft">Hidden</span>') + '</div>' +
              (r.heading ? '<p class="admreview-h">' + esc(r.heading) + '</p>' : '') +
              '<p class="admreview-b">' + esc(r.body) + '</p>' +
              '<div class="admreview-act">' +
              '<button class="btn alt admbtn" data-hide="' + esc(r.id) + '" data-to="' + (r.visible ? 'hide' : 'show') + '">' +
                (r.visible ? 'Hide' : 'Show') + '</button>' +
              '<button class="btn danger admbtn" data-del="' + esc(r.id) + '">Delete</button>' +
              '</div></div>';
          }).join('') +
          '<p class="small admnote">Hide or delete a review only for rude or inappropriate language (owner\'s rule). A low rating is kept.</p>';
        });
    }
    load();

    box.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target : null;
      var hideBtn = ev.target.closest ? ev.target.closest('[data-hide]') : null;
      var delBtn = ev.target.closest ? ev.target.closest('[data-del]') : null;
      if (hideBtn) {
        var id = hideBtn.getAttribute('data-hide');
        var to = hideBtn.getAttribute('data-to');
        hideBtn.disabled = true;
        ctx.client.from('reviews').update({ visible: to === 'show' }).eq('id', id).then(function (res) {
          hideBtn.disabled = false;
          if (res.error) { alert('Could not change it: ' + res.error.message); return; }
          load();
        });
      } else if (delBtn) {
        if (!window.confirm('Delete this review for good? This cannot be undone.')) return;
        var did = delBtn.getAttribute('data-del');
        delBtn.disabled = true;
        ctx.client.from('reviews').delete().eq('id', did).then(function (res) {
          delBtn.disabled = false;
          if (res.error) { alert('Could not delete: ' + res.error.message); return; }
          load();
        });
      }
    });
  }

  /* ---------------- PAYMENTS (owner, 2026-11-18) ----------------
     Pass ki price (pass_plans), promo codes (promo_codes) aur orders (pass_orders).
     Sab RLS se admin-only. Order sirf "refunded" me badal sakta hai (DB trigger). */
  function paymentsSection(ctx) {
    var PLAN = 'all-access';
    function rupees(p) { return p == null ? '—' : '₹' + (p / 100).toLocaleString('en-IN'); }
    function timeOf(v) {
      if (!v) return '';
      var d = new Date(v); if (isNaN(d.getTime())) return '';
      return niceDate(v) + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }
    function msg(box, text) { box.textContent = text; if (text) show(box); else hide(box); }

    /* -- the plan -- */
    var pf = el('admPlanForm'), pErr = el('admPlanError'), pOk = el('admPlanOk');
    ctx.client.from('pass_plans').select('*').eq('id', PLAN).maybeSingle().then(function (res) {
      if (res.error || !res.data) { msg(pErr, 'Could not load the pass: ' + ((res.error && res.error.message) || 'not found')); return; }
      var p = res.data;
      el('admPlanTitle').value = p.title || '';
      el('admPlanDesc').value = p.description || '';
      el('admPlanPrice').value = p.price_paise == null ? '' : String(p.price_paise / 100);
      el('admPlanDays').value = p.days_per_unit;
      el('admPlanMax').value = p.max_units;
      el('admPlanActive').checked = !!p.active;
    });
    pf.addEventListener('submit', function (ev) {
      ev.preventDefault(); msg(pErr, ''); msg(pOk, '');
      var title = el('admPlanTitle').value.trim();
      var priceTxt = el('admPlanPrice').value.trim();
      var price = priceTxt === '' ? null : Math.round(parseFloat(priceTxt) * 100);
      var days = parseInt(el('admPlanDays').value, 10);
      var max = parseInt(el('admPlanMax').value, 10);
      var active = el('admPlanActive').checked;
      if (!title) { msg(pErr, 'Give the pass a name.'); return; }
      if (price !== null && !(price >= 100)) { msg(pErr, 'The price must be at least 1 rupee.'); return; }
      if (!(days >= 1 && days <= 366)) { msg(pErr, 'Days must be from 1 to 366.'); return; }
      if (!(max >= 1 && max <= 24)) { msg(pErr, 'Periods must be from 1 to 24.'); return; }
      if (active && price === null) { msg(pErr, 'Set a price before putting the pass on sale.'); return; }
      ctx.client.from('pass_plans').update({
        title: title, description: el('admPlanDesc').value.trim(), price_paise: price,
        days_per_unit: days, max_units: max, active: active, updated_at: new Date().toISOString()
      }).eq('id', PLAN).select('id').then(function (res) {
        if (res.error || !res.data || !res.data.length) { msg(pErr, 'Could not save: ' + ((res.error && res.error.message) || 'no change was saved')); return; }
        msg(pOk, active ? 'Saved. The pass is on sale at ' + rupees(price) + ' for ' + days + ' days.' : 'Saved. The pass is not on sale.');
      });
    });

    /* -- promo codes -- */
    var kind = el('admPromoKind'), valLabel = el('admPromoValLabel');
    kind.addEventListener('change', function () {
      valLabel.textContent = kind.value === 'percent' ? 'How many percent off (100 = free)' : 'How many rupees off';
    });
    var promoBox = el('admPromos');
    function loadPromos() {
      Promise.all([
        ctx.client.from('promo_codes').select('*').order('created_at', { ascending: false }),
        readAll(ctx.client, 'pass_orders', 'promo_code, status', function (q) { return q.not('promo_code', 'is', null); }),
        ctx.client.from('pass_plans').select('featured_promo').eq('id', PLAN).maybeSingle()
      ]).then(function (r) {
        var shown = r[2] && r[2].data ? r[2].data.featured_promo : null;
        if (r[0].error) { promoBox.innerHTML = '<p class="admerr">Could not load the codes: ' + esc(r[0].error.message) + '</p>'; return; }
        var used = {};
        (r[1] || []).forEach(function (o) {
          if (o.status === 'paid' || o.status === 'refunded') used[o.promo_code] = (used[o.promo_code] || 0) + 1;
        });
        var rows = r[0].data || [];
        if (!rows.length) { promoBox.innerHTML = '<p class="small">No promo codes yet.</p>'; return; }
        promoBox.innerHTML = '<table class="admtable"><thead><tr><th>Code</th><th>Discount</th><th>Used</th><th>Last day</th><th>Status</th><th>Change</th><th>On the pass page</th></tr></thead><tbody>' +
          rows.map(function (c) {
            var off = c.percent_off != null ? c.percent_off + '% off' : rupees(c.amount_off_paise) + ' off';
            return '<tr><td><strong>' + esc(c.code) + '</strong>' + (c.note ? '<span class="admsub">' + esc(c.note) + '</span>' : '') + '</td>' +
              '<td>' + esc(off) + '<span class="admsub">' + (c.once_per_student ? 'Once per student' : 'Many times per student') + '</span></td>' +
              '<td>' + (used[c.code] || 0) + (c.max_uses ? ' of ' + c.max_uses : '') + '</td>' +
              '<td>' + (c.valid_until ? esc(niceDate(new Date(new Date(c.valid_until).getTime() - 1))) : 'No end') + '</td>' +
              '<td><span class="admtag ' + (c.active ? 'is-live' : 'is-draft') + '">' + (c.active ? 'On' : 'Off') + '</span></td>' +
              '<td><button class="btn alt admbtn" data-code="' + esc(c.code) + '" data-to="' + (c.active ? 'off' : 'on') + '">' + (c.active ? 'Turn off' : 'Turn on') + '</button></td>' +
              '<td>' + (shown === c.code
                ? '<span class="admtag is-live">Shown</span> <button class="btn alt admbtn" data-feature="" >Hide</button>'
                : (c.active ? '<button class="btn alt admbtn" data-feature="' + esc(c.code) + '" data-label="' + esc(off) + '">Show to everyone</button>' : '')) + '</td></tr>';
          }).join('') + '</tbody></table>';
      }).catch(function (e) { promoBox.innerHTML = '<p class="admerr">Could not load the codes: ' + esc(e.message) + '</p>'; });
    }
    loadPromos();
    promoBox.addEventListener('click', function (ev) {
      /* Ek hi code pass page par sabko dikhta hai (pass_plans.featured_promo). */
      var f = ev.target.closest ? ev.target.closest('[data-feature]') : null;
      if (f) {
        var code = f.getAttribute('data-feature') || null;
        f.disabled = true;
        ctx.client.from('pass_plans').update({ featured_promo: code, featured_label: code ? f.getAttribute('data-label') : '' })
          .eq('id', PLAN).select('id').then(function (res) {
            if (res.error || !res.data || !res.data.length) { f.disabled = false; alert('Could not change it: ' + ((res.error && res.error.message) || 'not saved')); return; }
            loadPromos();
          });
        return;
      }
      var b = ev.target.closest ? ev.target.closest('[data-code]') : null;
      if (!b) return;
      b.disabled = true;
      var turningOff = b.getAttribute('data-to') === 'off', code = b.getAttribute('data-code');
      ctx.client.from('promo_codes').update({ active: !turningOff })
        .eq('code', code).then(function (res) {
          if (res.error) { b.disabled = false; alert('Could not change it: ' + res.error.message); return; }
          // A code that is turned off is no longer shown on the pass page either.
          var after = turningOff
            ? ctx.client.from('pass_plans').update({ featured_promo: null, featured_label: '' }).eq('id', PLAN).eq('featured_promo', code)
            : Promise.resolve();
          Promise.resolve(after).then(loadPromos, loadPromos);
        });
    });

    var mf = el('admPromoForm'), mErr = el('admPromoError'), mOk = el('admPromoOk');
    mf.addEventListener('submit', function (ev) {
      ev.preventDefault(); msg(mErr, ''); msg(mOk, '');
      var code = el('admPromoCode').value.trim().toUpperCase();
      var val = parseInt(el('admPromoVal').value, 10);
      var maxTxt = el('admPromoMax').value.trim();
      var until = el('admPromoUntil').value;
      if (!/^[A-Z0-9_-]{3,30}$/.test(code)) { msg(mErr, 'The code must be 3 to 30 letters or numbers (no spaces).'); return; }
      var row = { code: code, once_per_student: el('admPromoOnce').checked, note: el('admPromoNote').value.trim() };
      if (kind.value === 'percent') {
        if (!(val >= 1 && val <= 100)) { msg(mErr, 'Percent off must be from 1 to 100.'); return; }
        row.percent_off = val;
      } else {
        if (!(val >= 1)) { msg(mErr, 'Rupees off must be at least 1.'); return; }
        row.amount_off_paise = val * 100;
      }
      if (maxTxt !== '') {
        var mx = parseInt(maxTxt, 10);
        if (!(mx >= 1)) { msg(mErr, 'The limit must be 1 or more, or empty.'); return; }
        row.max_uses = mx;
      }
      if (until) {
        /* "Last day it works" = us din ke ant tak (India time): agle din 00:00 IST se band. */
        var end = new Date(until + 'T00:00:00+05:30');
        if (isNaN(end.getTime())) { msg(mErr, 'The last day is not a date.'); return; }
        row.valid_until = new Date(end.getTime() + 86400000).toISOString();
      }
      ctx.client.from('promo_codes').insert(row).then(function (res) {
        if (res.error) {
          msg(mErr, /duplicate|unique/i.test(res.error.message) ? 'There is already a code called ' + code + '.' : 'Could not make it: ' + res.error.message);
          return;
        }
        msg(mOk, 'Made. Students can now type ' + code + ' on the pass page.');
        mf.reset(); kind.dispatchEvent(new Event('change'));
        loadPromos();
      });
    });


    /* -- free passes given by an admin (owner, 2026-11-18) -- */
    var gSel = el('admGiftStudent'), gForm = el('admGiftForm'), gErr = el('admGiftError'), gOk = el('admGiftOk'), gBox = el('admGifts');
    var gNames = {};
    readAll(ctx.client, 'profiles', 'id, display_name').then(function (rows) {
      rows = rows.slice().sort(function (a, b) { return String(a.display_name || '').localeCompare(String(b.display_name || '')); });
      rows.forEach(function (r) { gNames[r.id] = r.display_name; });
      gSel.innerHTML = '<option value="">Choose a student…</option>' + rows.map(function (r) {
        return '<option value="' + esc(r.id) + '">' + esc(r.display_name || '(no name)') + '</option>';
      }).join('');
      loadGifts();
    }).catch(function (e) { gSel.innerHTML = '<option value="">Could not load students</option>'; msg(gErr, 'Could not load the students: ' + e.message); });

    function loadGifts() {
      ctx.client.from('passes').select('id, user_id, starts_at, ends_at, note, created_at')
        .eq('source', 'admin').order('created_at', { ascending: false }).limit(200)
        .then(function (res) {
          if (res.error) { gBox.innerHTML = '<p class="admerr">Could not load: ' + esc(res.error.message) + '</p>'; return; }
          var rows = res.data || [];
          if (!rows.length) { gBox.innerHTML = '<p class="small">None yet.</p>'; return; }
          var now = Date.now();
          gBox.innerHTML = '<table class="admtable"><thead><tr><th>Student</th><th>From</th><th>Until</th><th>Status</th><th>Change</th></tr></thead><tbody>' +
            rows.map(function (p) {
              /* "Ended" = the same rule the database uses for Delete: it is over, or it was stopped before it began (until <= from). */
              var endMs = new Date(p.ends_at).getTime();
              var running = endMs > now && endMs > new Date(p.starts_at).getTime();
              return '<tr><td>' + esc(gNames[p.user_id] || 'Student') + (p.note ? '<span class="admsub">' + esc(p.note) + '</span>' : '') + '</td>' +
                '<td>' + esc(niceDate(p.starts_at)) + '</td><td>' + esc(niceDate(p.ends_at)) + '</td>' +
                '<td><span class="admtag ' + (running ? 'is-live' : 'is-draft') + '">' + (running ? 'Open' : 'Ended') + '</span></td>' +
                '<td>' + (running
                  ? '<button class="btn alt admbtn" data-stop="' + esc(p.id) + '" data-start="' + esc(p.starts_at) + '">Stop now</button>'
                  : '<button class="btn danger admbtn" data-delgift="' + esc(p.id) + '">Delete</button>') + '</td></tr>';
            }).join('') + '</tbody></table>';
        });
    }
    gBox.addEventListener('click', function (ev) {
      /* Delete an ENDED free pass from the list (owner, 2026-11-21). The database allows it only for an admin, only for a free
         pass (source admin, no order) and only when it has ended; a running pass must be stopped first. */
      var d = ev.target.closest ? ev.target.closest('[data-delgift]') : null;
      if (d) {
        if (!window.confirm('Delete this ended free pass from the list? This cannot be undone. The student loses nothing, because the pass is already over.')) return;
        d.disabled = true;
        ctx.client.from('passes').delete().eq('id', d.getAttribute('data-delgift')).eq('source', 'admin').select('id').then(function (res) {
          if (res.error) { d.disabled = false; alert('Could not delete it: ' + res.error.message); return; }
          if (!res.data || !res.data.length) { d.disabled = false; alert('Nothing was deleted. The pass may still be running. Stop it first, then try again.'); loadGifts(); return; }
          loadGifts();
        });
        return;
      }
      var b = ev.target.closest ? ev.target.closest('[data-stop]') : null;
      if (!b) return;
      if (!window.confirm('Stop this free pass now? The student will lose access to paid tests at once (unless they have another pass).')) return;
      b.disabled = true;
      var start = new Date(b.getAttribute('data-start')).getTime();
      var end = new Date(Math.max(start, Date.now())).toISOString();
      ctx.client.from('passes').update({ ends_at: end }).eq('id', b.getAttribute('data-stop')).then(function (res) {
        if (res.error) { b.disabled = false; alert('Could not stop it: ' + res.error.message); return; }
        loadGifts();
      });
    });
    gForm.addEventListener('submit', function (ev) {
      ev.preventDefault(); msg(gErr, ''); msg(gOk, '');
      var uid = gSel.value;
      var days = parseInt(el('admGiftDays').value, 10);
      if (!uid) { msg(gErr, 'Choose a student.'); return; }
      if (!(days >= 1 && days <= 3650)) { msg(gErr, 'Days must be from 1 to 3650.'); return; }
      var btn = gForm.querySelector('button[type=submit]'); btn.disabled = true;
      // Naye din purane pass ke khatam hone ke baad se (koi din bekar na jaye).
      ctx.client.from('passes').select('ends_at').eq('user_id', uid).order('ends_at', { ascending: false }).limit(1)
        .then(function (r) {
          var last = r.data && r.data[0] ? new Date(r.data[0].ends_at).getTime() : 0;
          var start = new Date(Math.max(Date.now(), last));
          var end = new Date(start.getTime() + days * 86400000);
          return ctx.client.from('passes').insert({
            user_id: uid, plan_id: PLAN, source: 'admin', starts_at: start.toISOString(), ends_at: end.toISOString(),
            note: el('admGiftNote').value.trim()
          });
        }).then(function (res) {
          btn.disabled = false;
          if (res.error) { msg(gErr, 'Could not give the pass: ' + res.error.message); return; }
          msg(gOk, 'Done. ' + (gNames[uid] || 'The student') + ' now has a free pass for ' + days + ' days.');
          el('admGiftNote').value = '';
          loadGifts();
        }).catch(function (e) { btn.disabled = false; msg(gErr, 'Could not give the pass: ' + e.message); });
    });

    /* -- orders -- */
    var oBox = el('admOrders');
    function loadOrders() {
      Promise.all([
        ctx.client.from('pass_orders').select('*').order('created_at', { ascending: false }).limit(300),
        readAll(ctx.client, 'profiles', 'id, display_name'),
        readAll(ctx.client, 'paper_opens', 'user_id, set_id, first_opened_at')
      ]).then(function (r) {
        if (r[0].error) { oBox.innerHTML = '<p class="admerr">Could not load the orders: ' + esc(r[0].error.message) + '</p>'; return; }
        var names = {}; (r[1] || []).forEach(function (p) { names[p.id] = p.display_name; });
        var opens = {}; (r[2] || []).forEach(function (o) { (opens[o.user_id] = opens[o.user_id] || []).push(o); });
        var rows = (r[0].data || []).filter(function (o) { return o.status !== 'created'; });
        if (!rows.length) { oBox.innerHTML = '<p class="small">No orders yet.</p>'; return; }
        oBox.innerHTML = '<table class="admtable"><thead><tr><th>When</th><th>Student</th><th>Bought</th><th>Paid</th><th>Status</th><th>Paid test opened?</th><th>Change</th></tr></thead><tbody>' +
          rows.map(function (o) {
            var after = (opens[o.user_id] || []).filter(function (x) { return o.paid_at && x.first_opened_at >= o.paid_at; })
              .sort(function (a, b) { return a.first_opened_at < b.first_opened_at ? -1 : 1; });
            var opened = after.length ? 'Yes, ' + esc(timeOf(after[0].first_opened_at)) + '<span class="admsub">' + after.length + ' test' + (after.length > 1 ? 's' : '') + '</span>' : (o.status === 'paid' ? 'No' : '—');
            var within = o.paid_at && (Date.now() - new Date(o.paid_at).getTime()) < 86400000;
            var hint = o.status === 'paid' && !after.length && within && o.amount_paise > 0 ? '<span class="admsub">Can be refunded if asked</span>' : '';
            var tag = { paid: 'is-live', refunded: 'is-draft', failed: 'is-draft' }[o.status] || '';
            var label = { paid: 'Paid', refunded: 'Refunded', failed: 'Failed' }[o.status] || o.status;
            return '<tr><td>' + esc(timeOf(o.paid_at || o.created_at)) + '</td>' +
              '<td>' + esc(names[o.user_id] || 'Student') + '</td>' +
              '<td>' + o.days + ' days' + (o.promo_code ? '<span class="admsub">Code ' + esc(o.promo_code) + ' (' + rupees(o.discount_paise) + ' off)</span>' : '') + '</td>' +
              '<td>' + (o.amount_paise === 0 ? 'Free' : rupees(o.amount_paise)) + (o.rzp_payment_id ? '<span class="admsub">' + esc(o.rzp_payment_id) + '</span>' : '') + '</td>' +
              '<td><span class="admtag ' + tag + '">' + esc(label) + '</span>' + (o.note ? '<span class="admsub">' + esc(o.note) + '</span>' : '') + '</td>' +
              '<td>' + opened + hint + '</td>' +
              '<td>' + (o.status === 'paid' && o.amount_paise > 0 ? '<button class="btn alt admbtn" data-refund="' + esc(o.id) + '">Mark refunded</button>' : '') + '</td></tr>';
          }).join('') + '</tbody></table>';
      }).catch(function (e) { oBox.innerHTML = '<p class="admerr">Could not load the orders: ' + esc(e.message) + '</p>'; });
    }
    loadOrders();
    oBox.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('[data-refund]') : null;
      if (!b) return;
      if (!window.confirm('Mark this order refunded? Do this only after you have refunded it in Razorpay. The student\'s pass from this order stops at once.')) return;
      b.disabled = true;
      ctx.client.from('pass_orders').update({ status: 'refunded' }).eq('id', b.getAttribute('data-refund')).then(function (res) {
        if (res.error) { b.disabled = false; alert('Could not change it: ' + res.error.message); return; }
        loadOrders();
      });
    });
  }

  var SECTIONS = {
    papers: papersSection,
    notify: notifySection,
    students: studentsSection,
    reviews: reviewsSection,
    payments: paymentsSection
  };

  document.addEventListener('DOMContentLoaded', function () {
    var page = (document.body.getAttribute('data-admin') || '').trim();
    var notice = el('adminNotice');
    var body = el('adminBody');

    gate().then(function (ctx) {
      if (!ctx) {
        if (notice) { notice.textContent = 'You are not allowed to use this page.'; show(notice); }
        return;
      }
      buildNav(page);
      hide(notice);
      show(body);
      var fn = SECTIONS[page];
      if (fn) fn(ctx);
    });
  });
})();
