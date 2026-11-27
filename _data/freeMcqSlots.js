// /admin/upload-mcq/ ke liye: kaun se FREE MCQ set yahan se publish ho sakte hain, aur tags ki asli list.
// (owner, 2026-11-27: "jo mcqs login ke bahar sbke liye free hote hai")
//
// Ek free set ek PUBLIC file hoti hai (assets/questions/<setId>-<level>.json), database ki row nahi
// (rule 15). Isliye use publish karna article publish karne jaisa hai: file repo me jaati hai, Cloudflare
// build karta hai, aur 2-3 minute me set live. `live` ab file ke hone se hi tay hota hai
// (_data/mcqAges.js), isliye registry me kuch likhna nahi padta.
//
// Yahan sirf wahi slots aate hain jo registry me pehle se PLAN hain (owner ka faisla, 2026-11-27).
// Bilkul naya set plan karna registry ka kaam hai — wo Claude karega, ek baar.
// Login/paid set is page par kabhi nahi aata: uski file repo me jaa hi nahi sakti.

const fs = require("fs");
const path = require("path");

const spec = require("./mcqSpec.json");
// Master taxonomy ki list ab ek hi jagah se (Daily wala page bhi yahi maangta hai).
const tags = require("../tools/taxonomy-ids.js");

const SERIES = { american: "American Literature", indian: "Indian English Literature" };

module.exports = function () {
  const slots = [];
  for (const age of spec.ages) {
    for (const set of age.sets || []) {
      if (set.access) continue;                       // login/paid: kabhi file me nahi (rule 15)
      const setId = age.slug + "-set-" + set.n;
      const files = (set.levels || []).map((l) => ({
        level: l,
        name: setId + "-" + l + ".json",
        there: fs.existsSync(path.join(__dirname, "..", "assets", "questions", setId + "-" + l + ".json")),
      }));
      slots.push({
        setId,
        age: age.slug,
        ageName: age.name,
        series: SERIES[age.tradition] || "British Literature",
        n: set.n,
        title: set.title,
        levels: set.levels || [],
        count: set.count,
        topics: set.topics || [],
        files,
        published: files.length > 0 && files.every((f) => f.there),
      });
    }
  }
  const t = tags();
  return {
    slots,
    waiting: slots.filter((s) => !s.published).length,
    published: slots.filter((s) => s.published).length,
    json: JSON.stringify({ slots, topicIds: t.ids, periodIds: t.periods }),
  };
};
