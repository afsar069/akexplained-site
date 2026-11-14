// UGC-NET English PYQs (previous-year papers), newest first. CLAUDE.md rule 18.
// _data/netPyqs.json lists each paper (slug, year, month, question file). Everything the page shows
// — title, paper, number of questions — is read from the question file itself, so nothing is typed twice.
// The build STOPS with a plain message if a listed file is missing or any question is not scoreable
// (the CBT engine needs exactly four options and one right option, 0 to 3).
const fs = require("fs");
const path = require("path");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
const PAPER_ORDER = { I: 1, II: 2, III: 3 };
const BASE = "/exams/net/english-pyqs/";

module.exports = function () {
  const root = path.join(__dirname, "..");
  const registry = require("./netPyqs.json");
  const slugs = new Set();
  const papers = registry.map(function (entry) {
    const where = "_data/netPyqs.json (" + (entry.slug || "an entry without a slug") + ")";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.slug || "")) throw new Error(where + ": slug must be lower-case letters, digits and hyphens");
    if (slugs.has(entry.slug)) throw new Error(where + ": slug is used twice");
    slugs.add(entry.slug);
    if (!Number.isInteger(entry.year) || !Number.isInteger(entry.month) || entry.month < 1 || entry.month > 12) {
      throw new Error(where + ": year and month must be whole numbers (month 1 to 12)");
    }
    const rel = "assets/questions/" + entry.file + ".json";
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) throw new Error(where + ": the question file " + rel + " is missing");
    const data = JSON.parse(fs.readFileSync(abs, "utf8"));
    if (data.setId !== entry.file) throw new Error(rel + ": setId \"" + data.setId + "\" must equal the file name \"" + entry.file + "\"");
    ["title", "paper", "session", "setName", "ageName"].forEach(function (k) {
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
    return {
      slug: entry.slug,
      year: entry.year,
      month: entry.month,
      monthName: MONTHS[entry.month - 1],
      setId: data.setId,
      title: data.title,
      paper: data.paper,
      session: data.session,
      count: data.questions.length,
      href: BASE + entry.slug + "/",
      reviewHref: BASE + entry.slug + "/review/",
    };
  });
  papers.sort(function (a, b) {
    return b.year - a.year || b.month - a.month ||
      (PAPER_ORDER[a.paper] || 9) - (PAPER_ORDER[b.paper] || 9) || a.slug.localeCompare(b.slug);
  });
  return papers;
};
