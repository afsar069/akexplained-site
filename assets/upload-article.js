/* ==========================================================
   AK Explained — owner-only "publish an article" page
   ----------------------------------------------------------
   /admin/upload-article/ par chalti hai (owner, 2026-11-26). Ek markdown
   file se notes article site par chadh jata hai: file repo ke
   notes/<slug>/index.md par likhi jati hai (Edge Function publish-article),
   Cloudflare Pages khud rebuild karta hai, aur 2-3 minute me article asli
   static page ban jata hai — poora design, Google ke liye indexable.

   MCQ paper se farq: wo database se turant khulta hai. Article ko rebuild
   chahiye, kyunki Google ko asli HTML page chahiye (CLAUDE.md rule 24).

   Yahan ke saare check SIRF jaldi feedback ke liye hain. Asli darwaza
   Edge Function hai: wahan admin hona, folder, slug, front matter aur
   <script> dobara jaanche jate hain. Browser ka code bypass ho sakta hai,
   wo nahi.

   Preview wahi markdown-it chalata hai jo site build karta hai (14.3.3,
   options { html: true } — Eleventy ka default), isliye preview aur asli
   page ek jaise padhte hain.

   Ye file auth.js se PEHLE chal sakti hai, isliye window.akAuth ka thoda
   intezaar — upload-paper.js aur cbt.js ki tarah.
   ========================================================== */
(function () {
  'use strict';

  var MAX_BYTES = 400 * 1024;
  var MAX_FETCH_CHECKS = 40;   // itne se zyada link/tasveer na jaancho, page slow ho jata hai

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
  function show(x) { if (x) x.hidden = false; }
  function hide(x) { if (x) x.hidden = true; }

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- the file ---------- */

  var state = {
    content: '',       // file ka poora text (layout line jodne ke baad)
    front: {},         // front matter ke kuch kaam ke field
    body: '',          // article ka hissa
    name: '',          // file ka naam
    addedLayout: false,
    exists: false,     // is pate par pehle se article hai?
    blocking: 0        // kitne check rok rahe hain
  };

  function slugify(s) {
    return String(s || '').toLowerCase()
      .replace(/[‘’'"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  /* Front matter ka chhota reader. Poora YAML parse nahi karte — sirf wahi
     top-level field padhte hain jo page par dikhane aur jaanchne hain.
     Baaki sab Eleventy padhta hai. */
  function readFront(text) {
    var out = { ok: false, fields: {}, front: '', body: text };
    if (text.slice(0, 3) !== '---') return out;
    var end = text.indexOf('\n---', 3);
    if (end === -1) return out;
    out.ok = true;
    out.front = text.slice(3, end);
    out.body = text.slice(end + 4);
    out.front.split('\n').forEach(function (line) {
      var m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):[ \t]*(.*)$/);
      if (!m) return;                       // nested lines (list, object) chhod do
      var v = m[2].trim().replace(/^["']|["']$/g, '');
      out.fields[m[1]] = v;
    });
    return out;
  }

  function setContent(text, name) {
    state.name = name || '';
    state.addedLayout = false;
    var read = readFront(text);

    // layout line na ho to jod do (bina iske page article ka design nahi leta),
    // aur neeche check me saaf saaf bata do ki jodi gayi hai.
    if (read.ok && !read.fields.layout) {
      text = '---\nlayout: base.njk' + text.slice(3);
      state.addedLayout = true;
      read = readFront(text);
    }

    state.content = text;
    state.front = read.fields;
    state.body = read.body;
    state.frontOk = read.ok;

    // slug: file ke naam se, warna title se
    var guess = '';
    var base = String(name || '').replace(/\.(md|markdown|txt)$/i, '');
    if (base && base.toLowerCase() !== 'index') guess = slugify(base);
    if (!guess) guess = slugify(read.fields.title || '');
    var slugBox = el('arSlug');
    if (slugBox && !slugBox.value) slugBox.value = guess;

    show(el('arWhere'));
    show(el('arChecksCard'));
    hide(el('arPreviewCard'));
    hide(el('arDone'));
    updateUrl();
    runChecks();
  }

  function fileError(msg) {
    var box = el('arFileError');
    if (!box) return;
    if (!msg) { hide(box); box.textContent = ''; return; }
    box.textContent = msg;
    show(box);
  }

  function wireFile() {
    var input = el('arFile');
    if (input) {
      input.addEventListener('change', function () {
        fileError('');
        var f = input.files && input.files[0];
        if (!f) return;
        if (f.size > MAX_BYTES) {
          fileError('This file is too big (' + Math.round(f.size / 1024) + ' KB). The limit is 400 KB.');
          return;
        }
        var reader = new FileReader();
        reader.onload = function () { setContent(String(reader.result || ''), f.name); };
        reader.onerror = function () { fileError('That file could not be read. Please try again.'); };
        reader.readAsText(f);
      });
    }
    var paste = el('arPaste');
    if (paste) {
      paste.addEventListener('change', function () {
        var t = paste.value;
        if (!t.trim()) return;
        fileError('');
        setContent(t, '');
      });
      paste.addEventListener('blur', function () {
        var t = paste.value;
        if (t.trim() && t !== state.content) { fileError(''); setContent(t, ''); }
      });
    }
  }

  /* ---------- where it goes ---------- */

  function folder() {
    var sel = el('arFolder');
    return sel ? sel.value : '';
  }

  function slug() {
    var box = el('arSlug');
    return box ? box.value.trim().toLowerCase() : '';
  }

  function pageUrl() {
    var f = folder();
    return '/notes/' + (f ? f + '/' : '') + slug() + '/';
  }

  function updateUrl() {
    var note = el('arUrlPreview');
    var s = slug();
    if (!note) return;
    if (!s) { note.innerHTML = '<strong>Web address:</strong> not set yet.'; return; }
    note.innerHTML = '<strong>Web address:</strong> akexplained.com' + esc(pageUrl());
  }

  /* Is pate par pehle se article hai? Ye page live site par hi chalta hai,
     isliye seedha us page ko maang kar dekh lete hain. */
  function checkExists() {
    var s = slug();
    if (!s) return Promise.resolve(false);
    return fetch(pageUrl(), { method: 'GET', cache: 'no-store' })
      .then(function (r) { return r.ok; })
      .catch(function () { return false; });   // padh na sake to "naya" maan lo; function wahan rok dega
  }

  /* ---------- the checks ---------- */

  /* Report ki ek line. Classes site ki apni hain: .uprep li.ok / .warn / .no / .info
     (nishaan CSS ::before se aata hai, markup me nahi). */
  function row(kind, text) {
    return '<li class="' + kind + '">' + text + '</li>';
  }

  // article me jo tasveerein aur site ke andar ke link hain, unke pate nikaalo
  function refs(text) {
    var imgs = [], links = [], m;
    var reImgMd = /!\[[^\]]*\]\(([^)\s]+)/g;
    var reImgTag = /<img\b[^>]*\bsrc="([^"]+)"/gi;
    var reSrcset = /\bsrcset="([^"]+)"/gi;
    var reLinkMd = /(^|[^!])\[[^\]]*\]\((\/[^)\s]*)/g;
    var reLinkTag = /<a\b[^>]*\bhref="(\/[^"]*)"/gi;
    while ((m = reImgMd.exec(text))) if (m[1].charAt(0) === '/') imgs.push(m[1]);
    while ((m = reImgTag.exec(text))) if (m[1].charAt(0) === '/') imgs.push(m[1]);
    while ((m = reSrcset.exec(text))) {
      m[1].split(',').forEach(function (part) {
        var p = part.trim().split(/\s+/)[0];
        if (p && p.charAt(0) === '/') imgs.push(p);
      });
    }
    while ((m = reLinkMd.exec(text))) links.push(m[2]);
    while ((m = reLinkTag.exec(text))) links.push(m[1]);
    function uniq(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }
    return { imgs: uniq(imgs), links: uniq(links.map(function (l) { return l.split('#')[0]; })).filter(Boolean) };
  }

  function head(path) {
    return fetch(path, { method: 'GET', cache: 'no-store' })
      .then(function (r) { return { path: path, ok: r.ok, status: r.status }; })
      .catch(function () { return { path: path, ok: false, status: 0 }; });
  }

  function runChecks() {
    var list = el('arChecks');
    if (!list) return;
    var out = [];
    state.blocking = 0;
    function bad(t) { state.blocking++; out.push(row('no', t)); }
    function warn(t) { out.push(row('warn', t)); }
    function ok(t) { out.push(row('ok', t)); }

    var f = state.front || {};

    if (!state.frontOk) {
      bad('The heading block at the top is missing or not closed. An article starts with three dashes, then title, description and so on, then three dashes again.');
      list.innerHTML = out.join('');
      afterChecks();
      return;
    }
    ok('The heading block was read.');

    if (f.title) ok('Title: <strong>' + esc(f.title) + '</strong>');
    else bad('There is no title in the heading block.');

    if (!f.description) {
      bad('There is no description. Google shows this line under the heading, so an article needs one.');
    } else if (f.description.length < 50 || f.description.length > 160) {
      warn('The description is ' + f.description.length + ' letters long. Between 50 and 160 reads best on Google.');
    } else {
      ok('Description: ' + f.description.length + ' letters, a good length.');
    }

    if (state.addedLayout) warn('The file did not say <code>layout: base.njk</code>, so that line was added for you. Without it the page would not use the article design.');
    else if (f.layout === 'base.njk') ok('It uses the article design (<code>layout: base.njk</code>).');
    else warn('The layout line says <code>' + esc(f.layout) + '</code>, not <code>base.njk</code>. Check that this is what you want.');

    if (f.eyebrow) ok('Small label above the heading: ' + esc(f.eyebrow));
    else warn('There is no small label above the heading (<code>eyebrow</code>). The page works without it.');

    if (!f.updated) warn('There is no date (<code>updated</code>). The page will show no "last updated" line.');

    var s = slug();
    if (!s) bad('The web address is empty.');
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) bad('The web address may use only small letters, numbers and hyphens, for example my-new-article.');
    else ok('Web address: akexplained.com' + esc(pageUrl()));

    if (/^#\s/m.test(state.body)) {
      bad('The article has a line starting with a single <code>#</code>. The page makes the big heading from the title, so a second one would be wrong on Google. Use <code>##</code> for the first heading inside the article.');
    } else {
      var h2 = (state.body.match(/^##\s/gm) || []).length;
      if (h2) ok(h2 + ' section heading' + (h2 === 1 ? '' : 's') + ' inside the article.');
      else warn('The article has no section headings (<code>##</code>). A long article reads better with them.');
    }

    if (/<script\b/i.test(state.content)) bad('The file has a <code>&lt;script&gt;</code> tag. An article page may not carry one.');

    var bytes = new Blob([state.content]).size;
    if (bytes > MAX_BYTES) bad('The file is too big (' + Math.round(bytes / 1024) + ' KB). The limit is 400 KB.');
    else ok('Size: ' + Math.round(bytes / 1024) + ' KB.');

    var words = state.body.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    ok('About ' + words + ' words, roughly ' + Math.max(1, Math.round(words / 200)) + ' min read.');

    list.innerHTML = out.join('');

    // Jo cheezein site se poochhni hain (pehle se maujood article, tasveerein, link)
    var r = refs(state.content);
    var toCheck = r.imgs.concat(r.links).slice(0, MAX_FETCH_CHECKS);
    Promise.all([checkExists()].concat(toCheck.map(head))).then(function (res) {
      var exists = res[0];
      var found = res.slice(1);
      state.exists = exists;

      var extra = [];
      if (exists) {
        extra.push(row('warn', 'An article is already at this address. Tick the replace box below to put this file in its place.'));
        show(el('arReplaceWrap'));
      } else {
        hide(el('arReplaceWrap'));
        var cb = el('arReplace');
        if (cb) cb.checked = false;
        extra.push(row('ok', 'This address is free &mdash; it will be a new article.'));
      }

      var missingImgs = found.filter(function (x) { return r.imgs.indexOf(x.path) !== -1 && !x.ok; });
      var missingLinks = found.filter(function (x) { return r.imgs.indexOf(x.path) === -1 && !x.ok; });

      if (r.imgs.length) {
        if (missingImgs.length) {
          state.blocking += 1;
          extra.push(row('no', missingImgs.length + ' of the ' + r.imgs.length + ' pictures are not on the website yet: ' +
            missingImgs.map(function (x) { return '<code>' + esc(x.path) + '</code>'; }).join(', ') +
            '. Add the pictures first, or take them out of the file &mdash; otherwise the article shows empty boxes.'));
        } else {
          extra.push(row('ok', 'All ' + r.imgs.length + ' picture' + (r.imgs.length === 1 ? ' is' : 's are') + ' on the website.'));
        }
      }
      if (r.links.length) {
        if (missingLinks.length) {
          extra.push(row('warn', missingLinks.length + ' of the ' + r.links.length + ' links inside the article do not open a page yet: ' +
            missingLinks.map(function (x) { return '<code>' + esc(x.path) + '</code>'; }).join(', ') +
            '. That is fine if the page is still coming; otherwise fix the link.'));
        } else {
          extra.push(row('ok', 'All ' + r.links.length + ' link' + (r.links.length === 1 ? '' : 's') + ' inside the article open a real page.'));
        }
      }
      if (toCheck.length === MAX_FETCH_CHECKS) {
        extra.push(row('warn', 'Only the first ' + MAX_FETCH_CHECKS + ' pictures and links were checked.'));
      }

      list.innerHTML = out.join('') + extra.join('');
      afterChecks();
    });
  }

  function afterChecks() {
    var go = el('arGo');
    var btn = el('arButton');
    var sum = el('arSummary');
    show(go);
    if (state.blocking) {
      if (btn) btn.disabled = true;
      if (sum) sum.innerHTML = '<strong>' + state.blocking + ' thing' + (state.blocking === 1 ? '' : 's') + ' above must be fixed first.</strong> Change the file and choose it again.';
      return;
    }
    if (btn) btn.disabled = false;
    if (sum) {
      sum.innerHTML = state.exists
        ? 'This will <strong>replace</strong> the article at akexplained.com' + esc(pageUrl()) + '.'
        : 'This will publish a <strong>new</strong> article at akexplained.com' + esc(pageUrl()) + '.';
    }
  }

  /* ---------- the preview ---------- */

  function renderPreview() {
    var box = el('arPvBody');
    if (!box) return;
    var html = '';
    if (window.markdownit) {
      // Site ka build bhi markdown-it ko inhi options se chalata hai (Eleventy default).
      html = window.markdownit({ html: true }).render(state.body);
    } else {
      html = '<p>The preview tool did not load, so the text is shown as it is.</p><pre>' + esc(state.body) + '</pre>';
    }
    box.innerHTML = html;
    var f = state.front || {};
    el('arPvTitle').textContent = f.title || '';
    el('arPvDesc').textContent = f.description || '';
    var eb = el('arPvEyebrow');
    eb.textContent = f.eyebrow || '';
    eb.hidden = !f.eyebrow;
    show(el('arPreviewCard'));
    el('arPreviewCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- publishing ---------- */

  function publish(auth) {
    var btn = el('arButton');
    var errBox = el('arError');
    hide(errBox);
    if (btn) { btn.disabled = true; btn.textContent = 'Publishing…'; }

    var cfg = window.AK_SUPABASE || {};
    return auth.session().then(function (s) {
      var token = s && s.access_token;
      if (!token) throw new Error('Please log in again.');
      return fetch(cfg.url + '/functions/v1/publish-article', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'apikey': cfg.publishableKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: folder(),
          slug: slug(),
          content: state.content,
          replace: !!(el('arReplace') && el('arReplace').checked)
        })
      });
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    }).then(function (r) {
      if (btn) { btn.textContent = 'Publish this article'; btn.disabled = false; }
      if (!r.ok || !r.data.ok) {
        var msg = r.data && r.data.error ? r.data.error : 'The article could not be published (' + r.status + ').';
        if (errBox) { errBox.textContent = msg; show(errBox); }
        done(false, msg);
        return;
      }
      done(true, '', r.data);
    }).catch(function (e) {
      if (btn) { btn.textContent = 'Publish this article'; btn.disabled = false; }
      var msg = (e && e.message) || 'The article could not be published.';
      if (errBox) { errBox.textContent = msg; show(errBox); }
      done(false, msg);
    });
  }

  function done(okay, errMsg, data) {
    var card = el('arDone');
    var verdict = el('arVerdict');
    var rep = el('arDoneReport');
    var title = el('arDoneTitle');
    show(card);

    if (!okay) {
      title.textContent = 'Not published';
      verdict.className = 'upverdict is-no';
      verdict.textContent = 'The article was not published. Nothing on the website changed.';
      rep.innerHTML = row('no', esc(errMsg));
      hide(el('arCheckBtn'));
      showCopy('Publishing an article failed on /admin/upload-article/.\n\nAddress: ' + pageUrl() +
        '\nFile: ' + (state.name || '(pasted)') +
        '\nMessage: ' + errMsg);
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    title.textContent = 'Published';
    verdict.className = 'upverdict is-ok';
    verdict.textContent = data.replaced
      ? 'Saved. This replaced the article that was there.'
      : 'Saved. The new article is on its way to the website.';
    var url = data.url || pageUrl();
    rep.innerHTML = [
      row('ok', 'Saved to the website&rsquo;s files' + (data.commit ? ' (' + esc(data.commit) + ')' : '') + '.'),
      row('ok', 'Address: <a href="' + esc(url) + '">akexplained.com' + esc(url) + '</a>'),
      row('warn', 'The website is building now. The page is usually ready in about two to three minutes. Use the button below to see whether it is live.')
    ].join('');
    hide(el('arCopy'));
    var btn = el('arCheckBtn');
    show(btn);
    btn.onclick = function () {
      var note = el('arCheckNote');
      note.textContent = 'Looking…';
      fetch(url, { method: 'GET', cache: 'no-store' }).then(function (r) {
        note.innerHTML = r.ok
          ? 'It is live. <a href="' + esc(url) + '">Open the article</a>'
          : 'Not ready yet. The build takes a couple of minutes &mdash; wait a little and press again.';
      }).catch(function () {
        note.textContent = 'Could not check just now. Wait a little and press again.';
      });
    };
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showCopy(text) {
    var box = el('arCopy');
    var area = el('arCopyText');
    if (!box || !area) return;
    area.value = text;
    show(box);
    var btn = el('arCopyBtn');
    btn.onclick = function () {
      area.select();
      var note = el('arCopyNote');
      function said(msg) { if (note) note.textContent = msg; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(area.value).then(function () { said('Copied.'); }, function () { said('Press Ctrl+C to copy.'); });
      } else {
        said('Press Ctrl+C to copy.');
      }
    };
  }

  /* ---------- start ---------- */

  function start() {
    var notice = el('arNotice');
    whenAuth().then(function (auth) {
      if (!auth || !auth.configured || !auth.client) {
        notice.textContent = 'You are not allowed to use this page.';
        return;
      }
      auth.session().then(function (s) {
        if (!s || !s.user) {
          notice.textContent = 'You are not allowed to use this page.';
          return;
        }
        auth.client.from('paper_admins').select('user_id').maybeSingle().then(function (res) {
          if (res.error || !res.data) {
            notice.textContent = 'You are not allowed to use this page.';
            return;
          }
          hide(notice);
          show(el('arBody'));
          wireFile();
          var fsel = el('arFolder');
          if (fsel) fsel.addEventListener('change', function () { updateUrl(); if (state.content) runChecks(); });
          var sbox = el('arSlug');
          if (sbox) {
            sbox.addEventListener('input', updateUrl);
            sbox.addEventListener('change', function () { if (state.content) runChecks(); });
          }
          var pv = el('arPreviewBtn');
          if (pv) pv.addEventListener('click', renderPreview);
          var go = el('arButton');
          if (go) go.addEventListener('click', function () { publish(auth); });
        }, function () { notice.textContent = 'You are not allowed to use this page.'; });
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
