#!/usr/bin/env node
/* Literary Criticism MCQ plan, version 2 (DRAFT, 2026-11-27) — the plan as data, plus the checks that back it.
   --------------------------------------------------------------------------------------------------------
   Nothing here is published. `docs/literary-criticism-mcq-plan.md` is the readable version; its tables are
   printed by `--md` from THIS file, so the two cannot differ.

   The owner's rules (2026-11-27), all applied below:
     - Every section of the Literary Criticism hub is covered: History of Literary Criticism, Literary Theory,
       Cultural Studies, Indian Poetics, Key Terms & Concepts.
     - A chapter is NOT limited to one set. It gets as many sets as it takes to cover the chapter well, and never
       fewer than three. "Covered well" is checked, not promised: every sub-heading of the chapter's article must sit
       in exactly one set (`--check`).
     - A chapter whose article is not written yet is NOT planned. It is listed as waiting; when its article is
       published, its sets are planned the same way.
     - New Criticism is kept apart from Russian Formalism, in one small set that shows how they differ.
     - The first set of every hub is free; every other set is paid.
     - A hub and its section keep the names they have on the Literary Criticism pages. They appear section by
       section on /quizzes/mcq/.
     - No `periodId` (the owner said "theek hai" to the recommendation).

   Rule for the number of sets (the owner may change the divisor): sets = max(3, ceil(sub-headings / 6)); a set is
   100 questions (50 at each of two levels) drawn from about six sub-headings, 1,800 to 2,400 words of the article.
   Levels: the first set of a chapter is easy + medium, every later set medium + hard (the pattern of the American
   and Indian English series).

   Usage:
     node tools/criticism-mcq-plan.js --units <article-slug>   numbered sub-headings of one article
     node tools/criticism-mcq-plan.js --check                  verify the plan against the articles
     node tools/criticism-mcq-plan.js --md                     print the plan tables (markdown)
     node tools/criticism-mcq-plan.js --gaps                   writers named in the ready chapters with no taxonomy node
*/
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const articleFile = (slug) => path.join(root, "notes", slug, "index.md");
const articleText = (slug) => (fs.existsSync(articleFile(slug)) ? fs.readFileSync(articleFile(slug), "utf8") : null);

/* The units of an article: every `###` sub-heading, in order, except the boxes that belong to no part of the argument.
   "Critics and works" (a table) and the key-terms list are shared sources: any set of the chapter may use them. */
const NOT_UNITS = /^(Key terms|Important points to remember|An interesting story|Did you know\??)/i;
const SKIP_SECTIONS = /^(Quick revision|Quick quiz|Frequently asked|Sources|Critics and works)/i;
function units(slug) {
  const t = articleText(slug);
  if (t === null) return null;
  const out = [];
  let sec = "";
  t.split("\n").forEach((line) => {
    let m;
    if ((m = line.match(/^## (.*)/))) sec = m[1].replace(/\*/g, "").trim();
    else if ((m = line.match(/^### (.*)/)) && !SKIP_SECTIONS.test(sec) && !NOT_UNITS.test(m[1].trim()))
      out.push({ n: out.length + 1, section: sec, title: m[1].replace(/\*/g, "").trim() });
  });
  return out;
}
module.exports = { units, norm, root };

/* ============================================================ the registries ============================================================ */
const quiet = (f) => { const l = console.log; console.log = () => {}; try { return f(); } finally { console.log = l; } };
const theory = quiet(() => require(path.join(root, "_data", "literaryTheory.js")));
const theoryParts = Array.isArray(theory) ? theory : theory.parts || theory;
const history = require(path.join(root, "_data", "criticismHistory.json"));
const csParts = quiet(() => require(path.join(root, "_data", "culturalStudies.js")));
const ipParts = quiet(() => require(path.join(root, "_data", "indianPoetics.js")));
const ktParts = quiet(() => require(path.join(root, "_data", "keyTerms.js")));
const asArr = (m) => (Array.isArray(m) ? m : m.parts || m.series || m);

/* ============================================================ the plan ============================================================ */
/* A set is { t: title, u: [[from,to], ...] } = which sub-headings of the chapter's own article it covers.
   `x` (optional) = sub-headings of OTHER articles it also draws on, as { slug, titles: [...] } (not counted for completeness).
   `n` (optional) = questions per level when not 50. */
const CH = {
  // ---- Literary Theory, Part 1 ----
  "literary-theory-introduction": [
    { t: "What literary theory is, and what came before it", u: [[1, 7]] },
    { t: "The rise of Theory, and the ideas many theories share", u: [[8, 13]] },
    { t: "How theory works, the case against it, and the landmark works of each school", u: [[14, 17]] } ],
  "russian-formalism-new-criticism": [
    { t: "Where Russian Formalism came from; literariness and defamiliarization", u: [[1, 5]] },
    { t: "Practical language, fabula and syuzhet, the dominant; Shklovsky and Jakobson", u: [[6, 10]] },
    { t: "Eichenbaum, Tynianov, Propp and the Prague Circle", u: [[11, 14]] },
    { t: "Reading with Russian Formalism, its limits and its legacy", u: [[15, 17], [19, 20]] } ],
  "literary-theory-saussure": [
    { t: "Where structural linguistics came from; langue, parole and the sign", u: [[1, 7]] },
    { t: "Value, synchrony and syntagmatic relations; Saussure's Course and semiology", u: [[8, 13]] },
    { t: "Reading with structural linguistics, its limits and what remained", u: [[14, 18]] } ],
  "structuralism": [
    { t: "Where structuralism came from; difference, binary opposition, signs and codes", u: [[1, 6]] },
    { t: "Narrative grammar and roles; Lévi-Strauss, Barthes, Todorov and Greimas", u: [[7, 12]] },
    { t: "Reading with structuralism, its limits and its legacy", u: [[13, 17]] } ],
  "narratology": [
    { t: "Where narratology came from; story and discourse, order, duration and frequency", u: [[1, 6]] },
    { t: "Voice and focalization; Genette, Bal, Prince and Chatman", u: [[7, 12]] },
    { t: "Reading with narratology, its limits and its legacy", u: [[13, 17]] } ],
  "semiotics": [
    { t: "Where semiotics came from; the sign, icon, index, symbol, semiosis and codes", u: [[1, 5]] },
    { t: "Denotation, connotation and myth; Peirce, Eco and Barthes", u: [[6, 9]] },
    { t: "Reading with semiotics, its limits and its legacy", u: [[10, 14]] } ],
  "bakhtin-dialogism": [
    { t: "Where dialogism came from; the utterance, dialogism and polyphony", u: [[1, 6]] },
    { t: "Heteroglossia, double-voiced discourse, the chronotope and carnival", u: [[7, 10]] },
    { t: "Bakhtin's major works", u: [[11, 14]] },
    { t: "Reading with dialogism, its limits and its legacy", u: [[15, 19]] } ],
  // ---- Literary Theory, Part 2 ----
  "phenomenology-hermeneutics": [
    { t: "Where phenomenology came from; intentionality, the epoché and being-in-the-world", u: [[1, 5]] },
    { t: "The hermeneutic circle, from speech to text; Husserl, Heidegger, Gadamer and Ricoeur", u: [[6, 11]] },
    { t: "Reading with phenomenology and hermeneutics, its limits and what lasted", u: [[12, 16]] } ],
  "reader-response-reception-theory": [
    { t: "Where reader-response came from; the reader, the implied reader and the horizon of expectations", u: [[1, 6]] },
    { t: "Communities of readers and transaction; Rosenblatt, Holland, Jauss and Iser", u: [[7, 12]] },
    { t: "Fish, reading with reader-response, its limits and what lasted", u: [[13, 18]] } ],
  // ---- Literary Theory, Part 3 (the first chapter) ----
  "literary-theory-post-structuralism": [
    { t: "Where post-structuralism came from; the limits of final meaning, discourse and power-knowledge", u: [[1, 5]] },
    { t: "Intertextuality and the divided subject; Barthes, Foucault, Kristeva and Lacan", u: [[6, 11]] },
    { t: "Reading with post-structuralism, its limits and what lasted", u: [[12, 16]] } ],
  // ---- History of Literary Criticism: one hub per article ----
  "literary-criticism-introduction": [
    { t: "What criticism is, and what critics do", u: [[1, 7]] },
    { t: "Kinds of criticism", u: [[8, 12]] },
    { t: "A map of the whole history", u: [[13, 20]] },
    { t: "Why criticism matters", u: [[21, 24]] } ],
  "literary-criticism-classical": [
    { t: "The world of classical criticism, and Plato", u: [[1, 7]] },
    { t: "Aristotle's Poetics I: imitation, tragedy and plot", u: [[8, 11]] },
    { t: "Aristotle's Poetics II: the tragic hero, catharsis, poetry and history", u: [[12, 15]] },
    { t: "Horace: the Art of Poetry", u: [[16, 19]] },
    { t: "Longinus: On the Sublime, and how classical criticism shaped what came after", u: [[20, 27]] } ],
  "literary-criticism-renaissance": [
    { t: "The world of Renaissance criticism, and the Puritan attack", u: [[1, 6]] },
    { t: "Sir Philip Sidney: An Apology for Poetry", u: [[7, 11]] },
    { t: "Handbooks and the quarrel over rhyme, Ben Jonson, and the legacy", u: [[12, 20]] } ],
  "literary-criticism-neoclassical": [
    { t: "The world of neoclassical criticism, and John Dryden", u: [[1, 6]] },
    { t: "Alexander Pope and Joseph Addison", u: [[7, 12]] },
    { t: "Samuel Johnson, and how neoclassical criticism shaped what came after", u: [[13, 18]] } ],
  "literary-criticism-romantic": [
    { t: "The world of Romantic criticism, and William Wordsworth", u: [[1, 6]] },
    { t: "Samuel Taylor Coleridge and Percy Bysshe Shelley", u: [[7, 12]] },
    { t: "William Hazlitt, and how Romantic criticism shaped what came after", u: [[13, 18]] } ],
  "literary-criticism-victorian": [
    { t: "The world of Victorian criticism, and Matthew Arnold", u: [[1, 6]] },
    { t: "John Ruskin and Walter Pater", u: [[7, 10]] },
    { t: "Oscar Wilde, and how Victorian criticism shaped what came after", u: [[11, 16]] } ],
  "literary-criticism-early-twentieth": [
    { t: "The world of early twentieth-century criticism, and A. C. Bradley", u: [[1, 5]] },
    { t: "The reaction to Bradley, T. S. Eliot, and I. A. Richards on language", u: [[6, 10]] },
    { t: "I. A. Richards' Practical Criticism, and the legacy", u: [[11, 14]] } ],
  "literary-criticism-mid-twentieth": [
    { t: "The world of mid twentieth-century criticism, and William Empson", u: [[1, 5]] },
    { t: "F. R. Leavis and the New Critics", u: [[6, 10]] },
    { t: "Northrop Frye, and how mid twentieth-century criticism shaped what came after", u: [[11, 15]] } ],
};
/* The one small set the owner asked for (2026-11-27): New Criticism kept apart from Russian Formalism, only to show how they differ. */
const NC_SET = {
  t: "New Criticism and how it differs from Russian Formalism", n: 25, after: "russian-formalism-new-criticism",
  own: ["A comparison with New Criticism"],
  x: { slug: "literary-criticism-mid-twentieth", titles: ["The autonomous text and the two fallacies", "Paradox, irony, tension and the heresy of paraphrase"] },
};
/* Whole-part sets (Set 1 of a Literary Theory part: free, easy + medium): only when EVERY chapter of the part has an article. */
const WHOLE = {
  "form-language-and-structure": ["Shklovsky", "Jakobson", "Propp", "Saussure", "Lévi-Strauss", "Barthes", "Genette", "Peirce", "Umberto Eco", "Bakhtin"],
  "reader-and-meaning": ["Husserl", "Heidegger", "Gadamer", "Ricoeur", "Iser", "Jauss", "Fish", "Rosenblatt", "Holland"],
};

/* ============================================================ building the hubs ============================================================ */
const SECTIONS = [];
const hubSets = (hub) => hub.chapters.reduce((a, c) => a.concat(c.sets || []), []).concat(hub.whole ? [hub.whole] : []);

/* History of Literary Criticism: eight hubs, each is one article */
SECTIONS.push({ id: "history", name: "History of Literary Criticism", hubs: history.map((h) => ({
  id: "history-" + h.slug, name: h.title, chapters: [{ title: h.title, slug: "literary-criticism-" + h.slug }] })) });

/* Literary Theory: eight hubs (the parts), chapters in the registry's order */
let chN = 0;
SECTIONS.push({ id: "theory", name: "Literary Theory", hubs: theoryParts.map((p) => ({
  id: "theory-" + p.slug, partSlug: p.slug, name: p.name,
  chapters: (p.chapters || []).map((c) => ({ n: ++chN, title: c.title, slug: c.slug, people: c.people || "" })) })) });

/* Waiting series (no live article yet): hubs and chapter counts only */
const waitingSeries = (id, name, parts, termsOf) => ({ id, name, waiting: true, hubs: asArr(parts).map((p) => ({
  id: id + "-" + p.slug, name: p.name || p.title, chapters: (p.chapters || []).map((c) => ({ title: c.title, slug: c.slug, terms: termsOf ? (c.sub || []).length : 0 })) })) });
SECTIONS.push(waitingSeries("cultural-studies", "Cultural Studies", csParts));
SECTIONS.push(waitingSeries("indian-poetics", "Indian Poetics", ipParts));
SECTIONS.push(waitingSeries("key-terms", "Key Terms & Concepts", ktParts, true));

/* attach sets to the ready chapters, and the whole-part set and the New Criticism set */
const ALL_READY = [];
SECTIONS.forEach((sec) => sec.hubs.forEach((hub) => {
  hub.sec = sec;
  hub.chapters.forEach((c) => {
    c.units = units(c.slug);
    c.ready = !!c.units && !!CH[c.slug];
    if (c.ready) { c.sets = CH[c.slug].map((s) => Object.assign({ n: 50 }, s)); ALL_READY.push(c); }
    if (c.slug === NC_SET.after) c.sets.push(Object.assign({ nc: true }, NC_SET));
  });
  if (sec.id === "theory") {
    const allReady = hub.chapters.length > 0 && hub.chapters.every((c) => c.ready);
    hub.whole = { t: "Across the whole part", whole: true, ready: allReady, names: WHOLE[hub.partSlug] || [], chapters: hub.chapters.map((c) => c.n) };
  }
}));

/* number the sets of each hub in the order planned: the whole-part set first (Set 1), then the chapters in order */
SECTIONS.forEach((sec) => sec.hubs.forEach((hub) => {
  let k = 0;
  if (hub.whole) hub.whole.k = ++k;
  hub.chapters.forEach((c) => (c.sets || []).forEach((s) => { s.k = ++k; }));
  hub.setCount = k;
  // layer and levels: the first set of the hub is free; the first set of a chapter is easy + medium, later ones medium + hard
  const all = [];
  if (hub.whole) all.push(hub.whole);
  hub.chapters.forEach((c) => (c.sets || []).forEach((s, i) => { s.levels = i === 0 && !s.nc ? ["easy", "medium"] : ["medium", "hard"]; all.push(s); }));
  if (hub.whole) hub.whole.levels = ["easy", "medium"];
  all.forEach((s) => { s.free = s.k === 1; s.id = hub.id + "-set-" + s.k; });
  // History hubs have no whole-part set: the first set is free. A Theory hub with no whole-part set ready still reserves Set 1.
  hub.reservedWhole = hub.whole && !hub.whole.ready;
}));

/* ============================================================ checks ============================================================ */
function check() {
  const bad = [];
  const fail = (m) => bad.push(m);
  let nSets = 0, nCh = 0;
  ALL_READY.forEach((c) => {
    nCh++;
    const own = c.sets.filter((s) => !s.nc);
    nSets += c.sets.length;
    if (own.length < 3) fail(c.slug + ": only " + own.length + " sets, the owner's minimum is 3");
    // completeness: every sub-heading of the article is in exactly one set of this chapter (the New Criticism set's own unit counts)
    const seen = {};
    own.forEach((s) => s.u.forEach(([a, b]) => { for (let i = a; i <= b; i++) seen[i] = (seen[i] || 0) + 1; }));
    c.sets.filter((s) => s.nc).forEach((s) => s.own.forEach((tt) => { const u = c.units.find((x) => norm(x.title) === norm(tt)); if (!u) fail(c.slug + ": New Criticism set names a sub-heading that is not there: " + tt); else seen[u.n] = (seen[u.n] || 0) + 1; }));
    c.units.forEach((u) => { if (seen[u.n] !== 1) fail(c.slug + ": sub-heading " + u.n + " (" + u.title + ") is in " + (seen[u.n] || 0) + " sets, not exactly 1"); });
    own.forEach((s) => { const cnt = s.u.reduce((a, [x, y]) => a + (y - x + 1), 0); s.units = cnt; if (cnt < 3 || cnt > 9) fail(c.slug + ": '" + s.t + "' covers " + cnt + " sub-headings (allowed 3 to 9)"); });
  });
  // borrowed sub-headings of the New Criticism set exist in their article
  [NC_SET].forEach((s) => { const u = units(s.x.slug) || []; s.x.titles.forEach((tt) => { if (!u.some((x) => norm(x.title) === norm(tt))) fail("New Criticism set borrows a sub-heading that is not in " + s.x.slug + ": " + tt); }); });
  // whole-part sets: every name is in the articles of the part
  SECTIONS.forEach((sec) => sec.hubs.forEach((hub) => {
    if (hub.whole && hub.whole.ready) {
      const hay = norm(hub.chapters.map((c) => articleText(c.slug)).join("\n"));
      hub.whole.names.forEach((w) => { if (!hay.includes(norm(w))) fail(hub.id + " whole-part set: '" + w + "' is not in the part's articles"); });
    }
    // hub names must be the names the Literary Criticism pages use
    if (!hub.name) fail(hub.id + ": no hub name");
  }));
  // History: titles come from the registry file, so each hub's article must exist
  SECTIONS[0].hubs.forEach((h) => { if (!articleText(h.chapters[0].slug)) fail("History hub without an article: " + h.id); });
  // levels and layer
  SECTIONS.forEach((sec) => sec.hubs.forEach((hub) => { const first = hub.setCount ? 1 : 0; if (first && hubSets(hub).filter((s) => s.free).length !== 1) fail(hub.id + ": exactly one free set expected"); }));
  console.log(bad.length ? bad.join("\n") + "\n" + bad.length + " problem(s)." :
    "OK: " + nCh + " ready chapters, " + nSets + " sets; each chapter has at least 3 sets, every sub-heading of every article is in exactly one set, every set covers 3 to 9 sub-headings, and every whole-part name is in its articles.");
  process.exitCode = bad.length ? 1 : 0;
}

/* ============================================================ the markdown ============================================================ */
const cap = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
function covers(c, s) {
  if (s.nc) return "From Formalism: “" + s.own.join(", ") + "”. Also from the History article on mid twentieth-century criticism: “" + s.x.titles.join("” and “") + "”.";
  const t = [];
  s.u.forEach(([a, b]) => { for (let i = a; i <= b; i++) t.push(cap(c.units[i - 1].title, 52)); });
  return t.length + " sub-headings: " + t.join("; ");
}
function md() {
  const out = [];
  let ready = 0, free = 0;
  SECTIONS.forEach((sec) => {
    out.push("## " + sec.name);
    out.push("");
    if (sec.waiting) {
      const ch = sec.hubs.reduce((a, h) => a + h.chapters.length, 0);
      const terms = sec.hubs.reduce((a, h) => a + h.chapters.reduce((b, c) => b + c.terms, 0), 0);
      out.push("**Waiting: no article is live yet, so no set is planned.** " + sec.hubs.length + " hubs, " + ch + " chapters" + (terms ? ", " + terms + " terms (each term has its own article)" : "") +
        ". When an article is published its sets are planned by the same rule. At the owner's minimum of 3 sets per chapter this series will need at least " + ch * 3 + " sets" + (sec.id === "key-terms" ? " (counting a chapter of terms as one chapter)" : "") + ".");
      out.push("");
      out.push("| Hub (named as on the Literary Criticism page) | Chapters waiting |");
      out.push("|---|---|");
      sec.hubs.forEach((h) => out.push("| " + h.name + " | " + h.chapters.length + " |"));
      out.push("");
      return;
    }
    sec.hubs.forEach((hub, hi) => {
      out.push("### " + (hi + 1) + ". " + hub.name + " (`" + hub.id + "`)");
      out.push("");
      out.push("| Set | Chapter | Title | Levels | Layer | Covers |");
      out.push("|---|---|---|---|---|---|");
      if (hub.whole) {
        const w = hub.whole;
        out.push("| " + w.k + " | whole part | Across the whole part | easy + medium | **free** | " +
          (w.ready ? "**Ready.** A review across all chapters of the part: " + w.names.join(", ") : "**Reserved.** Planned when every chapter of the part has an article.") + " |");
        if (w.ready) { ready++; free++; }
      }
      hub.chapters.forEach((c) => {
        if (!c.sets) return;
        c.sets.forEach((s, i) => {
          ready++; if (s.free) free++;
          out.push("| " + s.k + " | " + c.title + (s.nc ? " (compared)" : "") + " | " + s.t + (s.n !== 50 ? " (" + s.n + " per level)" : "") + " | " + s.levels.join(" + ") + " | " + (s.free ? "**free**" : "paid") + " | " + covers(c, s) + " |");
        });
      });
      const wait = hub.chapters.filter((c) => !c.sets);
      out.push("");
      if (wait.length) out.push("*Chapters waiting for their article, not planned yet (" + wait.length + "):* " + wait.map((c) => (c.n ? c.n + ". " : "") + c.title).join("; ") + ".");
      out.push("");
    });
  });
  out.push("**Totals (ready now):** " + ready + " sets, " + ready * 100 + " questions at the standard 50 per level (the New Criticism set is smaller); " + free + " of the sets are free, the rest paid.");
  console.log(out.join("\n"));
}

/* writers named in the ready chapters: is each one a taxonomy node now? */
function gaps() {
  const rows = fs.readFileSync(path.join(root, "supabase", "data", "taxonomy-master-reference.csv"), "utf8").split(/\r?\n/).slice(1).filter(Boolean);
  const ids = new Set(rows.map((l) => l.split(",")[0]));
  const approved = ["edmund-husserl", "martin-heidegger", "hans-georg-gadamer", "paul-ricoeur", "friedrich-schleiermacher", "wilhelm-dilthey", "roman-ingarden", "e-d-hirsch", "louise-rosenblatt", "norman-n-holland", "mikhail-bakhtin", "valentin-voloshinov", "pavel-medvedev", "charles-sanders-peirce", "umberto-eco", "yuri-tynianov", "jan-mukarovsky", "mieke-bal", "gerald-prince", "seymour-chatman", "richard-hoggart"];
  const missing = approved.filter((i) => !ids.has(i));
  console.log("The 21 approved writer nodes missing from the master: " + missing.length + (missing.length ? "\n  " + missing.join("\n  ") : "  (all 21 are in)"));
}

const arg = process.argv[2];
if (require.main === module) {
  if (arg === "--check") check(); else if (arg === "--md") md(); else if (arg === "--gaps") gaps();
  else if (arg !== "--units") console.log("Use --units <slug>, --check, --md or --gaps");
}
