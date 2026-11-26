// Series ke article ke neeche "previous / next chapter" ke link — apne aap (owner, 2026-11-26).
//
// Kyun: ye link article ki front matter me `prev:` / `next:` se aate hain, aur unhe abhi tak haath se
// likha jata tha. /admin/upload-article/ se publish hue pehle do articles (Phenomenology aur
// Reader-Response) me ye reh hi gaye, yaani padhne wala us chapter se aage nahi badh sakta tha.
// Ab series ki registry (jo chapter ka kram pehle se janti hai) se ye khud ban jate hain.
//
// Niyam:
//   * Article ki apni front matter HAMESHA jeetti hai. `prev:` ya `next:` likha ho to use haath nahi lagta.
//   * Link sirf us chapter par jata hai jiska article maujood hai; jo likha nahi gaya use chhod kar
//     aage/peeche wale par chala jata hai (warna 404 par bhej dete).
//   * Ek series ke andar hi — Literary Theory ka aakhri chapter Cultural Studies se nahi judta.
//   * Jo article kisi series ka chapter nahi hai (age notes, criticism ke articles) wo waisa hi rehta hai.
//
// Ye file har page ke liye chalti hai (global eleventyComputed), isliye yahan sirf prev/next tay hote
// hain aur baaki har page ka data jaisa tha waisa hi laut jata hai.

const chapters = require("./articlePlan.js")().chapters;

// Jis pate par article hai, us chapter ko pehchanne ke liye: "/notes/<slug>/" -> chapter
const byUrl = new Map();
for (const c of chapters) byUrl.set("/notes/" + c.slug + "/", c);

/* Ek chapter se step (-1 = pichhla, +1 = agla) ki disha me chalte hue pehla aisa chapter
   jiska article maujood hai. Usi series ke andar. */
function neighbour(chapter, step) {
  const list = chapters.filter((c) => c.series === chapter.series);
  const at = list.findIndex((c) => c.slug === chapter.slug);
  if (at === -1) return null;
  for (let i = at + step; i >= 0 && i < list.length; i += step) {
    if (list[i].live) return list[i];
  }
  return null;
}

function link(data, step, direction) {
  const own = step < 0 ? data.prev : data.next;
  if (own && own.href) return own;              // article ne khud likha hai — wahi rakho
  const url = data.page && data.page.url;
  if (!url) return own;
  const chapter = byUrl.get(url);
  if (!chapter || !chapter.live) return own;
  const found = neighbour(chapter, step);
  if (!found) return own;
  return { label: found.title, href: "/notes/" + found.slug + "/", direction: direction };
}

module.exports = {
  prev: (data) => link(data, -1, "Previous chapter"),
  next: (data) => link(data, 1, "Next chapter"),
};
