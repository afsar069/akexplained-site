// /admin/articles/ ke liye: site par jo articles hain, aur jo chapters abhi likhe jane hain.
// (owner, 2026-11-26: "saare articles ki list").
//
// Sab kuch build ke waqt banta hai — notes/ ke folder aur series ki registries se. Isliye ye wahi
// tasveer hai jo abhi site par hai. Abhi-abhi publish hua article agli build par (2-3 minute) is
// list me aata hai; page par ye likha bhi hai.

const notes = require("./notesIndex.js");
const plan = require("./articlePlan.js");

function plain(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

module.exports = function () {
  const all = notes();
  const chapters = plan().chapters;

  // Kaunsa article kis series ka chapter hai
  const chapterByUrl = new Map();
  for (const c of chapters) chapterByUrl.set("/notes/" + c.slug + "/", c);

  const articles = all.map(function (a) {
    const c = chapterByUrl.get(a.url);
    return {
      title: a.title || a.slug,
      url: a.url,
      slug: a.slug,
      folder: a.folder,
      description: a.description,
      eyebrow: a.eyebrow,
      series: c ? c.series : "",
      chapter: c ? c.n : 0,
    };
  });
  articles.sort(function (x, y) {
    return x.title.localeCompare(y.title);
  });

  // Jo chapters abhi likhe nahi gaye, series ke kram me
  const waiting = [];
  const bySeries = new Map();
  for (const c of chapters) {
    if (c.live) continue;
    if (!bySeries.has(c.series)) bySeries.set(c.series, []);
    bySeries.get(c.series).push({ n: c.n, title: c.title, slug: c.slug });
  }
  for (const [series, list] of bySeries) waiting.push({ series: series, chapters: list });

  const counts = {
    articles: articles.length,
    chapters: articles.filter(function (a) { return a.series; }).length,
    waiting: chapters.filter(function (c) { return !c.live; }).length,
    planned: chapters.length,
  };

  return { articles: articles, waiting: waiting, counts: counts };
};
