const fs = require("fs");
const path = require("path");
const markdownIt = require("markdown-it");
const mdContainer = require("markdown-it-container");

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

// ---------------------------------------------------------------------------
// Literary-age pages (layout: age.njk)
// ---------------------------------------------------------------------------

// Article ke beech ka "Important points to remember" box.
// Author CMS me ye likhta hai:   ::: points   ...   :::
// Pages CMS ka rich-text editor raw HTML hata deta hai, par ye plain paragraph
// ki tarah save/load ho jata hai — isliye isi syntax ko chuna gaya.
const LIGHTBULB =
  '<svg class="abox__ico" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
  'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M9 18h6"/><path d="M10 21h4"/>' +
  '<path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"/></svg>';

const md = markdownIt({ html: true }).use(mdContainer, "points", {
  validate: (params) => /^points\b/i.test(params.trim()),
  render(tokens, idx) {
    if (tokens[idx].nesting === 1) {
      return '<div class="abox abox--points" role="note" aria-label="Important points to remember">\n' +
             '<p class="abox__title">' + LIGHTBULB + 'Important points to remember</p>\n';
    }
    return "</div>\n";
  },
});

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

// YAML ki date kabhi Date object aati hai, kabhi string — dono chalte hain.
function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

// In ids ko end-wale boxes (age.njk) use karte hain, isliye article ke headings inse na takraayein.
const RESERVED_IDS = ["key-terms", "criticism", "quick-revision", "faq", "sources"];

function slugify(text) {
  const s = text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "section";
}

// Article ke har <h2> ko id do aur TOC ke liye list banao.
// Sirf age pages par chalta hai, isliye purane pages ka HTML nahi badalta.
function scanHeadings(html) {
  const used = new Set(RESERVED_IDS);
  const items = [];
  const out = String(html).replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (match, attrs, inner) => {
    attrs = attrs || "";
    const label = inner.replace(/<[^>]*>/g, "").trim();
    const existing = attrs.match(/\sid="([^"]+)"/);
    let id;
    if (existing) {
      id = existing[1];
    } else {
      const base = slugify(label.replace(/&[#a-z0-9]+;/gi, " "));
      id = base;
      for (let n = 2; used.has(id); n++) id = base + "-" + n;
      attrs += ' id="' + id + '"';
    }
    used.add(id);
    items.push({ id, label });
    return "<h2" + attrs + ">" + inner + "</h2>";
  });
  return { html: out, items };
}

module.exports = function (eleventyConfig) {
  // Markdown ka apna instance (Eleventy ke default jaisa: html:true) + ::: points box.
  eleventyConfig.setLibrary("md", md);

  // Article ke upar "X min read" dikhane ke liye. 200 words/minute
  // aam padhne ki raftaar hai.
  eleventyConfig.addFilter("readingTime", function (content) {
    const words = String(content).replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  });


  // ---- age.njk ke filters ----
  // "12 October 2026"
  eleventyConfig.addFilter("humanDate", function (value) {
    const d = toDate(value);
    if (!d) return String(value || "");
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  });
  // "2026-10-12" — <time datetime="..."> ke liye
  eleventyConfig.addFilter("isoDate", function (value) {
    const d = toDate(value);
    return d ? d.toISOString().slice(0, 10) : "";
  });
  // Khaali items hatao. Strings ki list ho to key mat do; objects ki list ho to key do.
  eleventyConfig.addFilter("filled", function (list, key) {
    if (!Array.isArray(list)) return [];
    return list.filter((item) => {
      const v = key ? item && item[key] : item;
      return typeof v === "string" ? v.trim() !== "" : Boolean(v);
    });
  });
  // Frontmatter me likha markdown (criticism, FAQ answer) HTML banao.
  eleventyConfig.addFilter("md", (text) => md.render(String(text || "")));
  eleventyConfig.addFilter("mdInline", (text) => md.renderInline(String(text || "")));
  eleventyConfig.addFilter("headingIds", (html) => scanHeadings(html).html);
  eleventyConfig.addFilter("tocItems", (html) => scanHeadings(html).items);

  // Author ne ::: points galat likha to build log me chetawani aaye.
  eleventyConfig.addTransform("checkPointsBoxes", function (content) {
    const out = this.page && this.page.outputPath;
    if (!(out && out.endsWith(".html"))) return content;
    const where = this.page.inputPath;
    if (/<p>\s*:::/.test(content)) {
      console.warn("[boxes] " + where + ": a line starting with ':::' was not turned into a box. Check the spelling: ::: points");
    }
    const raw = this.page.rawInput;
    if (typeof raw === "string") {
      const opens = (raw.match(/^:::[ \t]*\S/gm) || []).length;
      const closes = (raw.match(/^:::[ \t]*$/gm) || []).length;
      if (opens !== closes) {
        console.warn("[boxes] " + where + ": " + opens + " box(es) opened but " + closes + " closed. Each '::: points' needs a closing ':::'.");
      }
    }
    return content;
  });

  eleventyConfig.ignores.add("404.html");
  // Internal file hai — isse koi public page nahi banna chahiye.
  eleventyConfig.ignores.add("CLAUDE.md");
  // Review system login ke saath chalu hoga. Tab tak ye page build nahi hota —
  // file repo me padi hai, chalu karne ke liye bas ye line hata dein.
  eleventyConfig.ignores.add("write-a-review/**");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("404.html");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");

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

    // Har page ke pagehead me wahi halka floral motif lagao, taaki hub pages
    // aur article pages dono par brand ka ek jaisa feel rahe.
    const MOTIF = '<img class="motif" src="/assets/reader-motif.webp" alt="" ' +
                  'width="440" height="525" aria-hidden="true">';
    if (out.includes('<section class="pagehead">') && !out.includes('class="motif"')) {
      out = out.replace('<section class="pagehead">', '<section class="pagehead">\n  ' + MOTIF);
    }

    // Sidebar ko chalane ke liye nav.js chahiye. Purane pages me wo tag nahi hai,
    // isliye yahan jod dete hain — tabhi mobile ka hamburger aur submenu kaam karega.
    if (!out.includes("/assets/nav.js") && out.includes("</body>")) {
      out = out.replace("</body>", '<script src="/assets/nav.js" defer></script>\n</body>');
    }

    return out;
  });

  return {
    dir: { input: ".", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
    templateFormats: ["html", "md", "njk"],
  };
};
