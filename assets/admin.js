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
    { page: 'papers', label: 'All papers', href: '/admin/papers/' },
    { page: 'notify', label: 'Send a notice', href: '/admin/notify/' },
    { page: 'students', label: 'Students', href: '/admin/students/' },
    { page: 'reviews', label: 'Reviews', href: '/admin/reviews/' }
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
      .select('set_id, title, exam_id, kind, number, question_count, status')
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
            '<td><span class="admtag ' + (live ? 'is-live' : 'is-draft') + '">' + (live ? 'Live' : 'Draft') + '</span></td>' +
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

  var SECTIONS = {
    papers: papersSection,
    notify: notifySection,
    students: studentsSection,
    reviews: reviewsSection
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
