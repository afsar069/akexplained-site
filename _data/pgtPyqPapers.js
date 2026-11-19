// UP PGT English PYQs (previous-year papers), OLDEST year first (same order as the NET PYQs, CLAUDE.md rules 3 and 23).
// _data/pgtPyqs.json lists each paper (slug, year, question file, how many questions the printed paper had).
// What the page shows (title, number of questions) is read from the question file, so nothing is typed twice.
// Papers are FREE, no login: the questions are the public file assets/questions/<setId>.json (owner, 2026-11-19).
// The build STOPS with a plain message if a listed file is missing or a question is not scoreable
// (the CBT engine needs exactly four options and one right option, 0 to 3).
const fs = require("fs");
const path = require("path");

const BASE = "/exams/pgt/up-pgt/pyqs/";

module.exports = function () {
  const root = path.join(__dirname, "..");
  const registry = require("./pgtPyqs.json");
  const slugs = new Set();
  const papers = registry.map(function (entry) {
    const where = "_data/pgtPyqs.json (" + (entry.slug || "an entry without a slug") + ")";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.slug || "")) throw new Error(where + ": slug must be lower-case letters, digits and hyphens");
    if (slugs.has(entry.slug)) throw new Error(where + ": slug is used twice");
    slugs.add(entry.slug);
    if (!Number.isInteger(entry.year)) throw new Error(where + ": year must be a whole number");
    const rel = "assets/questions/" + entry.file + ".json";
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) throw new Error(where + ": the question file " + rel + " is missing");
    const data = JSON.parse(fs.readFileSync(abs, "utf8"));
    if (data.setId !== entry.file) throw new Error(rel + ": setId \"" + data.setId + "\" must equal the file name \"" + entry.file + "\"");
    ["title", "session", "setName", "ageName"].forEach(function (k) {
      if (!data[k]) throw new Error(rel + ": the file has no \"" + k + "\"");
    });
    if (!Array.isArray(data.questions) || !data.questions.length) throw new Error(rel + ": no questions");
    data.questions.forEach(function (q, i) {
      const w = rel + " question " + (q.questionNumber || i + 1);
      if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error(w + ": needs exactly 4 options");
      if (!Number.isInteger(q.correct_option_id) || q.correct_option_id < 0 || q.correct_option_id > 3) {
        throw new Error(w + ": correct_option_id must be one option, 0 to 3");
      }
    });
    const count = data.questions.length;
    const printed = entry.printedCount || count;
    if (printed < count) throw new Error(where + ": printedCount is smaller than the number of questions in the file");
    return {
      slug: entry.slug,
      year: entry.year,
      setId: data.setId,
      title: data.title,
      session: data.session,
      count: count,
      printedCount: printed,
      leftOut: printed - count,
      leftOutNote: entry.leftOutNote || "",   // optional own sentence (simple English) when the reason is not "damaged options"
      href: BASE + entry.slug + "/",
      reviewHref: BASE + entry.slug + "/review/",
    };
  });
  papers.sort(function (a, b) { return a.year - b.year || a.slug.localeCompare(b.slug); });
  return papers;
};
