const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// base.njk se asli (naya) header aur footer ek baar padh lo
const base = fs.readFileSync(path.join(__dirname, "_includes", "base.njk"), "utf8");
const NEW_HEADER = base.slice(
  base.indexOf('<header class="site-header">'),
  base.indexOf("</header>") + "</header>".length
);
const NEW_FOOTER = base.slice(
  base.indexOf('<footer class="site-footer">'),
  base.indexOf("</footer>") + "</footer>".length
);

const checkTopics = require("./tools/check-topics.js");
const buildSyllabus = require("./tools/build-syllabus.js");

// Link-card picture (owner, 2026-11-21: "jo maine diya tha wapas usi ko lagao"): when any page link is
// shared (WhatsApp, Facebook, X, LinkedIn, Telegram...) the card shows the owner's own card art (logo,
// "English Literature, explained.", the four exam areas): 1200 x 600, 2:1, a light JPEG made by
// tools/make-share-card.py from tools/share-card-source.webp. The portrait logo stays the site's logo
// (tab icon, header, JSON-LD logo), not the link card. If the picture is ever changed it needs a NEW file
// name, because the apps remember the old one. The alt text says only what the picture says (rule 2).
const SHARE_IMAGE = "https://akexplained.com/assets/share-card.jpg";
const SHARE_ALT = "AK Explained: English Literature, explained. Notes, literary timeline, topic-wise MCQs and PYQs for UGC NET/JRF, PGT/TGT, BA/MA and state exams.";

module.exports = function (eleventyConfig) {
  // Publish-time safety: every question's topicId must exist in the master
  // taxonomy, and no two questions may share an id. Throwing fails the build.
  eleventyConfig.on("eleventy.before", function () {
    const r = checkTopics(__dirname);
    console.log("[check-topics] " + r.files + " question files checked against " + r.validTopics + " valid topic ids — OK");
    const s = buildSyllabus(__dirname);
    console.log("[syllabus] British literature: " + s.ages + " ages, " + s.questions + " Daily + " + s.mcq + " MCQ questions (" + (s.mcqAges.join(", ") || "no live MCQ set") + ") — assets/syllabus-british.json");
  });

  // Article ke upar "X min read" dikhane ke liye. 200 words/minute
  // aam padhne ki raftaar hai.
  eleventyConfig.addFilter("readingTime", function (content) {
    const words = String(content).replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  });

  // Literary-age articles estimate the main reading, excluding study aids.
  eleventyConfig.addFilter("mainReadingTime", function (content) {
    const main = String(content).split(/<h2\b[^>]*>\s*(?:Writers and works|Key terms|Important points to remember|Quick revision|Quick quiz|Frequently asked questions|Sources)\b/i)[0];
    const prose = main.replace(/<figure\b[\s\S]*?<\/figure>/gi, " ").replace(/<[^>]*>/g, " ");
    const words = prose.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  });

  // "Updated" tarikh ko saaf roop me dikhane ke liye. Pages CMS date ko
  // 2026-10-12 likhta hai, aur YAML use Date bana deta hai — bina is filter ke
  // page par lambi technical date ("Mon Oct 12 2026 00:00:00 GMT...") dikhti hai.
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  eleventyConfig.addFilter("niceDate", function (value) {
    if (!value) return "";
    const d = value instanceof Date ? value
      : /^\d{4}-\d{2}-\d{2}/.test(String(value)) ? new Date(String(value)) : null;
    if (!d || isNaN(d.getTime())) return String(value); // jaisa likha hai waisa hi dikhao
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  });

  // Article ke extra hisse: On this page, Related articles, FAQ aur Quick revision patti.
  require("./eleventy.article.js")(eleventyConfig);

  eleventyConfig.ignores.add("404.html");
  // Internal file hai — isse koi public page nahi banna chahiye.
  eleventyConfig.ignores.add("CLAUDE.md");
  eleventyConfig.ignores.add("AGENTS.md");   // dusre AI ke liye ek page ka note — site ka page nahi
  // Review system ab chalu hai (login-gated, auto-live). /write-a-review/ build hota hai.
  // tools/ me skill aur checker hain (maintainers ke liye) — site ka hissa nahi.
  eleventyConfig.ignores.add("tools/**");
  // docs/ me maintainers ke liye notes hain (DB notes, plans) — koi public page nahi banna chahiye.
  eleventyConfig.ignores.add("docs/**");
  eleventyConfig.ignores.add("design-qa.md");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("404.html");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("robots.txt");

  // Purane pages ka header/footer nikaal kar base.njk wala naya laga do
  eleventyConfig.addTransform("syncChrome", function (content) {
    if (!(this.page && this.page.outputPath && this.page.outputPath.endsWith(".html"))) return content;
    if (!content.includes('<header class="site-header">')) return content; // yeh page pehle se base.njk use karta hai

    let out = content;

    const hStart = out.indexOf('<header class="site-header">');
    const hEnd = out.indexOf("</header>");
    if (hStart !== -1 && hEnd !== -1) {
      out = out.slice(0, hStart) + NEW_HEADER + out.slice(hEnd + "</header>".length);
    }

    const fStart = out.indexOf('<footer class="site-footer">');
    const fEnd = out.indexOf("</footer>", fStart);
    if (fStart !== -1 && fEnd !== -1) {
      out = out.slice(0, fStart) + NEW_FOOTER + out.slice(fEnd + "</footer>".length);
    }

    // Standalone plain page heads previously received reader-motif.webp here.
    // Article layouts already carry their original artwork or motif; preserve it.
    if (!out.includes('class="motif"')) {
      out = out.replace('<section class="pagehead">',
        '<section class="pagehead pagehead-practice">');
    }

    // Sidebar ko chalane ke liye nav.js chahiye. Purane pages me wo tag nahi hai,
    // isliye yahan jod dete hain — tabhi mobile ka hamburger aur submenu kaam karega.
    if (!out.includes("/assets/nav.js") && out.includes("</body>")) {
      out = out.replace("</body>", '<script src="/assets/nav.js" defer></script>\n</body>');
    }

    // Supabase auth glue on every page: header Login/name control + session.
    // Loads the vendored library, the (public) config, then our auth.js — in
    // that order. Never gates content; if unconfigured the header reads "Login".
    if (!out.includes("/assets/auth.js") && out.includes("</body>")) {
      out = out.replace("</body>",
        '<script src="/assets/pass-gate.js" defer></script>\n' +
        '<script src="/assets/supabase-2.118.0.js" defer></script>\n' +
        '<script src="/assets/supabase-config.js" defer></script>\n' +
        '<script src="/assets/auth.js" defer></script>\n' +
        '<script src="/assets/track.js" defer></script>\n</body>');
    }

    // The account bar (shared header) is wired by account-menu.js. Add it on its
    // own, not tied to the auth.js block above, so pages that already ship their
    // own auth.js (login, account) still get it. account-menu.js waits for
    // window.akAuth, so the load order does not matter.
    if (!out.includes("/assets/account-menu.js") && out.includes("</body>")) {
      out = out.replace("</body>", '<script src="/assets/account-menu.js" defer></script>\n</body>');
    }

    return out;
  });

  // SEO safety net (owner, 2026-11-19): every public page that Google may index gets a canonical
  // link and share tags (Open Graph + Twitter card). A page that already has a tag keeps its own;
  // this only fills the gaps, built from the page's own URL, <title> and meta description.
  // Pages marked noindex (admin, login, review, coming soon...) are left alone.
  eleventyConfig.addTransform("seoTags", function (content) {
    if (!(this.page && this.page.outputPath && this.page.outputPath.endsWith(".html"))) return content;
    if (!this.page.url || !content.includes("</head>")) return content;
    if (/<meta\s+name=["']robots["'][^>]*noindex/i.test(content)) return content;
    const url = "https://akexplained.com" + this.page.url;
    const title = (content.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
    const desc = (content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || [])[1];
    const add = [];
    if (!/<link\s+rel=["']canonical["']/i.test(content)) add.push('<link rel="canonical" href="' + url + '">');
    if (!/property=["']og:title["']/i.test(content) && title) add.push('<meta property="og:title" content="' + title.trim() + '">');
    if (!/property=["']og:description["']/i.test(content) && desc) add.push('<meta property="og:description" content="' + desc + '">');
    if (!/property=["']og:image["']/i.test(content)) add.push('<meta property="og:image" content="' + SHARE_IMAGE + '">');
    if (!/property=["']og:url["']/i.test(content)) add.push('<meta property="og:url" content="' + url + '">');
    if (!/property=["']og:type["']/i.test(content)) add.push('<meta property="og:type" content="website">');
    if (!/name=["']twitter:card["']/i.test(content)) add.push('<meta name="twitter:card" content="summary_large_image">');
    if (!add.length) return content;
    return content.replace("</head>", add.join("\n") + "\n</head>");
  });

  // Link card on EVERY page, noindex ones too (owner, 2026-11-21: "har page ke link par vohi laga do").
  // seoTags above skips noindex pages (login, test, review, coming soon, admin...), so a shared link to
  // one of those used to show a card with no picture. Here every built page gets the card picture, its
  // size, its type and a plain alt text, and the wide "summary_large_image" card. The picture is 2:1;
  // Facebook and LinkedIn trim it to 1.91:1 (about 2.4% off each side), so all text and the logo stay
  // inside the middle of the art (checked 2026-11-21). A page that sets its own different og:image keeps
  // it, and gets no size tags.
  eleventyConfig.addTransform("shareImage", function (content) {
    if (!(this.page && this.page.outputPath && this.page.outputPath.endsWith(".html"))) return content;
    if (!content.includes("</head>")) return content;
    const add = [];
    const hasImage = /property=["']og:image["']/i.test(content);
    if (!hasImage) add.push('<meta property="og:image" content="' + SHARE_IMAGE + '">');
    if (!hasImage || content.includes('content="' + SHARE_IMAGE + '"')) {
      if (!/property=["']og:image:width["']/i.test(content)) add.push('<meta property="og:image:width" content="1200">');
      if (!/property=["']og:image:height["']/i.test(content)) add.push('<meta property="og:image:height" content="600">');
      if (!/property=["']og:image:type["']/i.test(content)) add.push('<meta property="og:image:type" content="image/jpeg">');
      if (!/property=["']og:image:alt["']/i.test(content)) add.push('<meta property="og:image:alt" content="' + SHARE_ALT + '">');
      if (!/name=["']twitter:card["']/i.test(content)) add.push('<meta name="twitter:card" content="summary_large_image">');
    }
    if (!add.length) return content;
    return content.replace("</head>", add.join("\n") + "\n</head>");
  });

  // Cache se purani file na dikhe: har CSS/JS link me file ka chhota "version" jod do
  // (jaise /assets/site.css?v=1a2b3c4d). File badalte hi version badal jata hai,
  // isliye browser nayi file mangta hai — hard refresh ki zarurat nahi padti.
  const versions = new Map();
  const versionOf = (rel) => {
    if (!versions.has(rel)) {
      try {
        versions.set(rel, crypto.createHash("md5").update(fs.readFileSync(path.join(__dirname, rel))).digest("hex").slice(0, 8));
      } catch (e) { versions.set(rel, null); }
    }
    return versions.get(rel);
  };
  eleventyConfig.addTransform("cacheBust", function (content) {
    if (!(this.page && this.page.outputPath && this.page.outputPath.endsWith(".html"))) return content;
    return content.replace(/\b(href|src)="(\/assets\/[^"?#]+\.(?:css|js))"/g, (m, attr, url) => {
      const v = versionOf(url.slice(1));
      return v ? attr + '="' + url + "?v=" + v + '"' : m;
    });
  });

  return {
    dir: { input: ".", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
    templateFormats: ["html", "md", "njk"],
  };
};
