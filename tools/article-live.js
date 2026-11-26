// Ek chapter ka card khulna chahiye ya "Coming soon" rehna chahiye — ye uske article se tay
// hota hai, haath se likhe `live: true` se nahi (owner, 2026-11-26).
//
// Kyun: /admin/upload-article/ se article publish karne ke baad pehle ek aur kaam bachta tha —
// us chapter me `live: true` likhna, jiske liye Claude chahiye tha. Ab article ki file maujood
// hone par card khud link ban jata hai. Series ki registry me `live: true` likha rahe to wo bhi
// chalta hai (purani lines waisi hi kaam karti hain), par us slug ka article hona zaroori hai —
// warna card 404 par bhej dega, isliye build saaf sandesh ke saath ruk jata hai.

const fs = require("fs");
const path = require("path");

const NOTES = path.join(__dirname, "..", "notes");

function hasArticle(slug) {
  if (!slug) return false;
  return fs.existsSync(path.join(NOTES, slug, "index.md"));
}

// Series ki registry ke ek chapter ke liye: khulna chahiye ya nahi.
function chapterLive(registry, chapter) {
  const written = hasArticle(chapter.slug);
  if (chapter.live === true && !written) {
    throw new Error(
      registry + ": the chapter '" + (chapter.title || chapter.slug) + "' says live: true, but " +
      "notes/" + chapter.slug + "/index.md does not exist. Write the article, or take live: true out."
    );
  }
  return written;
}

module.exports = { hasArticle, chapterLive };
