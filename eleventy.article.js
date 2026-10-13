// Article pages ke extra hisse — base.njk ye filters use karta hai.
// Author ko kuch alag nahi karna: bas article me ye headings aur format rakhna hai
//   ## Quick revision — 50 points      (iske neeche ek numbered ya bullet list)
//   ## Frequently asked questions      (har sawal **bold** line me, uske baad jawab)
// Baaki sab (On this page, Related articles) article ki headings aur notes/ folder se
// apne aap banta hai. Koi plugin nahi — build ke samay HTML par ye functions chalte hain.
const fs = require("fs");
const path = require("path");

// Ages ka kram (English Literature page jaisa). Related list isi kram me dikhti hai
// aur thumbnail assets/ages/<slug>.webp se aata hai.
const AGES = ["old-english", "middle-english", "renaissance", "jacobean", "restoration",
  "augustan", "romantic", "victorian", "modern", "contemporary"];

// Notes kam hon (4 se kam) to related box me ye jagahein judti hain, taaki box me
// hamesha kam se kam 4 link rahein. Naye notes aate hi ye apne aap kam ho jaate hain.
const PADDING = [
  { title: "English Literature — all ages", url: "/english-literature/" },
  { title: "MCQ Practice", url: "/quizzes/mcq/" },
  { title: "Previous Year Questions (PYQ)", url: "/quizzes/pyq/" },
  { title: "All notes", url: "/notes/" },
];

function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, " ");
}
function plain(html) {
  return decode(String(html).replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}
function slugify(text) {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
}

// Har <h2>/<h3> ko id do (On this page ke links ke liye).
function addHeadingIds(html) {
  const used = new Set();
  return html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (m, lvl, attrs, inner) => {
    attrs = attrs || "";
    const existing = attrs.match(/\sid="([^"]+)"/);
    if (existing) { used.add(existing[1]); return m; }
    const base = slugify(plain(inner));
    let id = base, n = 2;
    while (used.has(id)) id = base + "-" + n++;
    used.add(id);
    return "<h" + lvl + attrs + ' id="' + id + '">' + inner + "</h" + lvl + ">";
  });
}

// Kisi <h2> (jiska text titleRe se mile) ke neeche ke section par fn chalao.
// fn null de to kuch nahi badalta — galat format par page kharab nahi hota.
function mapSection(html, titleRe, fn) {
  const re = /<h2(?:\s[^>]*)?>([\s\S]*?)<\/h2>/g;
  let m;
  while ((m = re.exec(html))) {
    if (!titleRe.test(plain(m[1]))) continue;
    const start = m.index + m[0].length;
    const next = html.indexOf("<h2", start);
    const end = next === -1 ? html.length : next;
    const out = fn(html.slice(start, end));
    if (out == null) return html;
    return html.slice(0, start) + out + html.slice(end);
  }
  return html;
}

const BLOCK = /<(p|ul|ol|blockquote|table|h3|h4)\b[^>]*>[\s\S]*?<\/\1>/g;

// FAQ: **Sawal** wali line patti ban jaati hai, click par jawab khulta hai.
function buildFaq(section) {
  const blocks = section.match(BLOCK) || [];
  if (section.replace(BLOCK, "").trim() !== "") return null; // anjaana HTML mila
  const parts = [];
  let cur = null;
  const close = () => { if (cur) { parts.push(cur); cur = null; } };
  for (const b of blocks) {
    const q = b.match(/^<p>\s*<strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/p>$/);
    if (q) {
      close();
      cur = { q: q[1].trim(), a: [] };
      const rest = q[2].replace(/^(\s|<br\s*\/?>)+/, "").trim();
      if (rest) cur.a.push("<p>" + rest + "</p>");
    } else if (/^<h[34]\b/.test(b)) {
      close();
      parts.push({ html: b });
    } else if (cur) {
      cur.a.push(b);
    } else {
      parts.push({ html: b });
    }
  }
  close();
  if (!parts.some((p) => p.q)) return null;
  const html = parts.map((p) => p.q
    ? '<details class="faq-item"><summary>' + p.q + '</summary><div class="faq-a">' + p.a.join("\n") + "</div></details>"
    : p.html).join("\n");
  return "\n" + html + "\n";
}

// Quick revision: poori list ek patti ke andar band rehti hai.
function buildRevision(section) {
  const m = section.match(/<(ol|ul)\b[^>]*>[\s\S]*?<\/\1>/);
  if (!m) return null;
  const n = (m[0].match(/<li\b/g) || []).length;
  if (n < 2) return null;
  const wrapped = '<details class="revbox"><summary><span class="when-closed">Open the ' + n +
    ' points</span><span class="when-open">Close the list</span></summary>' + m[0] + "</details>";
  return section.replace(m[0], () => wrapped);
}

// Chaudi table phone par page ko chaudai me na phailaye: table apne dabbe me side-scroll hoti hai.
function wrapTables(html) {
  return html.replace(/<table\b[\s\S]*?<\/table>/g, (t) => '<div class="tablewrap">' + t + "</div>");
}

function articleHtml(content) {
  let html = wrapTables(addHeadingIds(String(content)));
  html = mapSection(html, /^frequently asked questions\b|^faqs?\b/i, buildFaq);
  html = mapSection(html, /^quick revision\b/i, buildRevision);
  return html;
}

// "On this page" ki list: h2 hon to h2, warna h3.
function tocItems(html) {
  const items = [];
  const re = /<h([23])\s[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(html))) items.push({ level: +m[1], id: m[2], text: plain(m[3]) });
  const level = items.some((i) => i.level === 2) ? 2 : 3;
  return items.filter((i) => i.level === level);
}

function ageIndex(item) {
  const d = item.data || {};
  const hay = ((d.age || "") + " " + (item.url || "")).toLowerCase();
  return AGES.findIndex((slug) => hay.includes(slug));
}

function relatedArticles(notes, currentUrl) {
  const MIN = 4, MAX = 6;
  const list = (notes || [])
    .filter((n) => n.url !== currentUrl && n.data && n.data.title)
    .map((n) => {
      const idx = ageIndex(n);
      const thumbFile = idx >= 0 ? "assets/ages/" + AGES[idx] + ".webp" : null;
      return {
        title: n.data.title, url: n.url, idx: idx < 0 ? 99 : idx,
        thumb: thumbFile && fs.existsSync(path.join(__dirname, thumbFile)) ? "/" + thumbFile : null,
      };
    })
    .sort((a, b) => a.idx - b.idx || a.title.localeCompare(b.title))
    .slice(0, MAX);
  for (const p of PADDING) {
    if (list.length >= MIN) break;
    if (p.url !== currentUrl && !list.some((x) => x.url === p.url)) list.push({ title: p.title, url: p.url, thumb: null });
  }
  return list;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("articleHtml", articleHtml);
  eleventyConfig.addFilter("tocItems", tocItems);
  eleventyConfig.addFilter("relatedArticles", relatedArticles);
  // notes/<folder>/index.md — CMS se bane naye articles bhi isme apne aap aa jaate hain.
  eleventyConfig.addCollection("notes", (api) => api.getFilteredByGlob("./notes/*/index.md"));
};
