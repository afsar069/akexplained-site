// Ek chapter ka card khulna chahiye ya "Coming soon" rehna chahiye — ye uske article se tay
// hota hai, haath se likhe `live: true` se nahi (owner, 2026-11-26).
//
// Kyun: /admin/upload-article/ se article publish karne ke baad pehle ek aur kaam bachta tha —
// us chapter me `live: true` likhna, jiske liye Claude chahiye tha. Ab article ki file maujood
// hone par card khud link ban jata hai. Series ki registry me `live: true` likha rahe to bhi
// chalta hai (purani lines waisi hi kaam karti hain), par us slug ka article hona zaroori hai —
// warna card 404 par bhej dega, isliye build saaf sandesh ke saath ruk jata hai.
//
// NAAM SE MILAN (2026-11-26, do baar hone ke baad joda gaya): article us pate par chadh sakta hai
// jo registry me likhe pate se alag ho — Phenomenology aur Reader-Response dono baar aisa hua.
// Article live tha, bilkul theek, aur uska card "Coming soon" hi kehta raha, kyunki hum sirf
// registry ke slug par dekhte the. Ab, us slug par article na mile to uske THEEK WAHI title wale
// article ko dhoondh lete hain: card khud khul jata hai aur link us asli pate par jata hai.
// Build me ek line chhap jaati hai, taaki agli baar registry ka slug sudhar diya jaye.

const fs = require("fs");
const path = require("path");

const NOTES = path.join(__dirname, "..", "notes");

function hasArticle(slug) {
  if (!slug) return false;
  return fs.existsSync(path.join(NOTES, slug, "index.md"));
}

// Har article ka title -> uska slug. Ek hi baar bana lete hain.
let byTitle = null;
function titleIndex() {
  if (byTitle) return byTitle;
  byTitle = new Map();
  let names = [];
  try { names = fs.readdirSync(NOTES, { withFileTypes: true }); } catch { return byTitle; }
  for (const entry of names) {
    if (!entry.isDirectory() || entry.name === "ages") continue;
    const file = path.join(NOTES, entry.name, "index.md");
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    const m = text.match(/^title:[ \t]*(.*)$/m);
    if (!m) continue;
    const title = m[1].trim().replace(/^["']|["']$/g, "");
    const key = plain(title);
    if (key && !byTitle.has(key)) byTitle.set(key, entry.name);
  }
  return byTitle;
}

// Do naam ek hi cheez hain ya nahi, ye dekhne ke liye unhe ek saade roop me le aao.
function plain(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// Series ki registry ke ek chapter ke liye: khulna chahiye ya nahi, aur kis pate par.
function resolveChapter(registry, chapter) {
  if (hasArticle(chapter.slug)) return { live: true, slug: chapter.slug };

  const found = titleIndex().get(plain(chapter.title));
  if (found) {
    console.log(
      "[article-live] " + registry + ': "' + chapter.title + '" is published at /notes/' + found +
      "/, not at the registry's /notes/" + chapter.slug + "/. The card is linked to the published " +
      "address. Point that chapter's slug at it when you next touch the registry."
    );
    return { live: true, slug: found };
  }

  if (chapter.live === true) {
    throw new Error(
      registry + ": the chapter '" + (chapter.title || chapter.slug) + "' says live: true, but " +
      "notes/" + chapter.slug + "/index.md does not exist, and no article carries that title. " +
      "Write the article, or take live: true out."
    );
  }
  return { live: false, slug: chapter.slug };
}

// Purana naam, taaki koi bhi seedha live/not hi poochh sake.
function chapterLive(registry, chapter) {
  return resolveChapter(registry, chapter).live;
}

module.exports = { hasArticle, chapterLive, resolveChapter };
