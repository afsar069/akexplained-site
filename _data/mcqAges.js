/* =========================================================
   MCQ ages — registry (mcqSpec.json) plus everything worked out from it
   and from the notes articles. The MCQ templates under quizzes/mcq/_templates/
   read this; nothing here is typed by hand twice.

   Naya set live karna: mcqSpec.json me us set par "live": true, aur
   assets/questions/ me uski files. Page, hub row aur build page apne aap bante hain.
   Notes me jo heading hai wahi link banta hai — jo heading nahi hai uska link nahi banta.
   ========================================================= */
const fs = require("fs");
const path = require("path");
const spec = require("./mcqSpec.json");

function slugify(text) {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
}

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function words(n) {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10), o = n % 10;
  return o ? TENS[t] + "-" + ONES[o] : TENS[t];
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const ORDINALS = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth",
  "ninth", "tenth", "eleventh", "twelfth"];

// Article ke title ke bracket ke saal ("Renaissance Literature (1500-1603)" -> "1500 to 1603").
// Kai ages ek article baantte hain, isliye card par article ke saal dikhte hain, age ke nahi.
function articleYears(article) {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "..", "notes", article, "index.md"), "utf8");
    const t = (raw.match(/^title:\s*(.+)$/m) || [])[1] || "";
    const y = (t.match(/\(([^)]*)\)/) || [])[1];
    return y ? y.replace(/\s*[-\u2013]\s*/, " to ") : "";
  } catch (e) { return ""; }
}

// Notes article ki headings, site jaisi ids ke saath
function headings(article) {
  let raw = "";
  try { raw = fs.readFileSync(path.join(__dirname, "..", "notes", article, "index.md"), "utf8"); } catch (e) { return []; }
  const body = raw.split("---").slice(2).join("---");
  const used = new Set(), out = [];
  body.split("\n").forEach((line) => {
    const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!m) return;
    const text = m[2].replace(/[*_`]/g, "");
    const base = slugify(text);
    let id = base, n = 2;
    while (used.has(id)) id = base + "-" + n++;
    used.add(id);
    out.push({ text, id });
  });
  return out;
}

// Live set ki files se rev padho (spec me alag se likhna nahi padta, isliye mel khane ka darr nahi).
// File na ho, ya levels ki rev alag ho, to build yahin rok deta hai — adhoora set live nahi hota.
function fileRev(setId, levels) {
  const revs = levels.map((l) => {
    const f = path.join(__dirname, "..", "assets", "questions", setId + "-" + l + ".json");
    if (!fs.existsSync(f)) throw new Error("mcqSpec: " + setId + " is live but assets/questions/" + setId + "-" + l + ".json is missing");
    const d = JSON.parse(fs.readFileSync(f, "utf8"));
    if (d.setId !== setId) throw new Error("mcqSpec: " + setId + "-" + l + '.json has setId "' + d.setId + '"');
    if (d.level !== l) throw new Error("mcqSpec: " + setId + "-" + l + '.json has level "' + d.level + '"');
    return d.rev;
  });
  if (new Set(revs).size !== 1) throw new Error("mcqSpec: " + setId + " has different rev in its level files");
  return revs[0];
}

const levelsText = (levels) => levels.join(" or ");
const yearsText = (y) => y.replace("–", " to ");

module.exports = function () {
  const total = spec.ages.length;
  const ages = spec.ages.map((a, i) => {
    const hs = headings(a.article);
    const has = (id) => hs.some((h) => h.id === id);
    const notes = "/notes/" + a.article + "/";
    const sets = (a.sets || []).map((s) => {
      const id = a.slug + "-set-" + s.n;
      const tags = s.levels.map(cap).concat(s.extraTags || []);
      return Object.assign({}, s, {
        id, live: !!s.live, tags, rev: s.live ? fileRev(id, s.levels) : undefined,
        topicAttr: s.topics.join(" "), levelAttr: s.levels.join(" "),
        countWords: cap(words(s.count)), levelsText: levelsText(s.levels),
        defaultLevel: s.levels[0],
        titleCase: s.titleCase || s.title,
      });
    });
    const liveSets = sets.filter((s) => s.live);
    const levels = ["easy", "medium", "hard"].filter((l) => liveSets.some((s) => s.levels.includes(l)));

    const qq = hs.find((h) => /^quick quiz/i.test(h.text));
    const qn = qq && (qq.text.match(/(\d+)\s+questions/i) || [])[1];
    const quickQuiz = qq && qn ? { anchor: qq.id, words: cap(words(+qn)) } : null;

    const subs = Object.assign({
      notes: articleYears(a.article) || "The full notes for this age",
      revision: "The whole age on one screen",
      writers: "Who wrote what, and when — as a table",
      terms: "The terms to know",
      criticism: "Who studied the age, and what they argued",
    }, a.readSubs || {});
    if (a.notesSub) subs.notes = a.notesSub;
    const read = [{ href: notes, title: a.notesName + " &mdash; the full notes", sub: subs.notes, icon: "book" }];
    if (has("quick-revision-50-points")) read.push({ href: notes + "#quick-revision-50-points", title: "Quick revision &mdash; 50 points", sub: subs.revision, icon: "revision" });
    if (has("writers-and-works")) read.push({ href: notes + "#writers-and-works", title: "Writers and works", sub: subs.writers, icon: "person" });
    if (has("key-terms")) read.push({ href: notes + "#key-terms", title: "Key terms", sub: subs.terms, icon: "terms" });
    if (has("criticism-and-scholarship")) read.push({ href: notes + "#criticism-and-scholarship", title: "Criticism and scholarship", sub: subs.criticism, icon: "search" });

    const hubIn = a.hub || {};
    const hub = {
      title: hubIn.title || (a.name + " MCQ Practice (" + a.years.replace("–", "&ndash;") + ") | AK Explained"),
      description: hubIn.description || (a.name + " literature MCQ practice (" + a.years + "). The questions are being written; the notes are ready to read."),
      ogTitle: hubIn.ogTitle || (a.name + " MCQ Practice — AK Explained"),
      ogDescription: hubIn.ogDescription || ("MCQ practice for " + a.name + " literature. The questions are being written; read the notes in the meantime."),
      heroSub: hubIn.heroSub || (yearsText(a.years) + (sets.length
        ? " &middot; " + words(sets.length) + " sets of fifty questions"
        : " &middot; questions coming soon")),
    };

    const pos = i + 1;
    const posText = pos === 1 ? a.name + " is the first. " + cap(words(total - 1)) + " more follow it."
      : pos === total ? a.name + " is the last of " + words(total) + "."
      : a.name + " is the " + ORDINALS[pos] + " of " + words(total) + " ages.";

    return Object.assign({}, a, {
      pos, posText, notes, notesName: a.notesName, yearsText: yearsText(a.years),
      image: "/assets/ages/" + a.image + ".webp",
      sets, liveSets, levels, levelAttr: levels.join(","), hasPlan: sets.length > 0, hasLive: liveSets.length > 0,
      setsWord: words(sets.length), totalQuestions: sets.reduce((n, s) => n + s.count, 0),
      quickQuiz, read, hub, topics: a.topics || [],
    });
  });

  // Agla / pichhla age: live ho to uska hub, warna uske notes
  ages.forEach((a, i) => {
    const link = (b) => b && { name: b.name, yearsText: b.yearsText, href: b.hasLive ? "/quizzes/mcq/" + b.slug + "/" : b.notes };
    a.next = link(ages[i + 1]);
    a.prev = link(ages[i - 1]);
  });
  return ages;
};
