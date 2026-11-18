// UGC-NET English PYQs (previous-year papers), OLDEST first (owner, 2026-11-18: the free 2012 papers
// stay at the top, newer papers come below them). CLAUDE.md rule 18.
// _data/netPyqs.json lists each paper (slug, year, month, question file). Everything the page shows
// — title, paper, number of questions — is read from the question file itself, so nothing is typed twice.
//
// EXAM PATTERNS (owner, 2026-11-18; the engine already takes any of them, the registry just labels them):
//   - 2012–2017 (CBSE, 3-paper era): one subject paper is "Paper II" (50 questions) and one is
//     "Paper III" (75 questions). "paper": "II" or "III", "count": 50 or 75.
//   - 2018 onward (NTA, 2-paper era): one subject paper, "Paper II" with 100 questions, held in shifts.
//     Add "shift": "Shift 1" (or "Shift 2") so two papers of the same month/year/paper read apart.
//   The slug and the setId are written in the registry line, so they carry the shift when there is one
//   (e.g. slug "2019-june-paper-ii-shift-1", setId "ugc-net-english-2019-jun-paper-ii-shift-1").
// The build STOPS with a plain message if a listed file is missing or any question is not scoreable
// (the CBT engine needs exactly four options and one right option, 0 to 3).
//
// LOGIN PAPERS ("access": "login", owner 2026-11-18, rule 18 + rule 15): there is NO question file. The
// questions are rows in Supabase (public.mcq_papers, set id = "setId"), so the registry line itself carries
// what the page needs (setId, title, paper, session, count, rev). The build STOPS if a public question file
// with that id exists in the repo (the repo is public: a login paper must never be one). `live` is only the
// BUILD-TIME picture, read from _data/paperCatalog.json (written by tools/sync_catalog.py): it sets the first
// state of the hub card, the sitemap line and the noindex flag. Whether the paper is open is decided by the
// LIVE public.paper_catalog when the page is viewed (assets/net-pyq-live.js on the hub, data-catalog-check on
// the test page), so the owner uploads it, marks it Live, and it opens with no rebuild.
const fs = require("fs");
const path = require("path");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
const PAPER_ORDER = { I: 1, II: 2, III: 3 };
const BASE = "/exams/net/english-pyqs/";

module.exports = function () {
  const root = path.join(__dirname, "..");
  const registry = require("./netPyqs.json");
  const catalog = require("./paperCatalog.json");
  const liveRows = {};
  ((catalog && catalog.papers) || []).forEach(function (p) {
    if (p.status === "live") liveRows[p.setId] = p;
  });
  const slugs = new Set();
  const setIds = new Set();
  const papers = registry.map(function (entry) {
    const where = "_data/netPyqs.json (" + (entry.slug || "an entry without a slug") + ")";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(entry.slug || "")) throw new Error(where + ": slug must be lower-case letters, digits and hyphens");
    if (slugs.has(entry.slug)) throw new Error(where + ": slug is used twice");
    slugs.add(entry.slug);
    if (!Number.isInteger(entry.year) || !Number.isInteger(entry.month) || entry.month < 1 || entry.month > 12) {
      throw new Error(where + ": year and month must be whole numbers (month 1 to 12)");
    }
    const access = entry.access || "free";
    if (access !== "free" && access !== "login") throw new Error(where + ": access must be \"free\" or \"login\"");
    const shift = String(entry.shift || "").trim();
    if (shift && !/^[A-Za-z0-9][A-Za-z0-9 ]{0,18}$/.test(shift)) {
      throw new Error(where + ": shift must be a short label such as \"Shift 1\"");
    }

    let data;
    let count;
    let live = true;
    if (access === "login") {
      ["setId", "title", "paper", "session"].forEach(function (k) {
        if (!entry[k]) throw new Error(where + ": a login paper needs \"" + k + "\"");
      });
      if (!Number.isInteger(entry.count) || entry.count < 1) throw new Error(where + ": a login paper needs \"count\" (a whole number, 1 or more)");
      if (!Number.isInteger(entry.rev) || entry.rev < 1) throw new Error(where + ": a login paper needs \"rev\" (a whole number, 1 or more)");
      if (entry.file) throw new Error(where + ": a login paper has no question file (rule 15). Remove \"file\".");
      const leak = path.join(root, "assets", "questions", entry.setId + ".json");
      if (fs.existsSync(leak)) {
        throw new Error(where + ": assets/questions/" + entry.setId + ".json exists, but this is a login paper. " +
          "The repo is public, so the file must not be there (rule 15). Delete it and load the questions through /admin/upload-paper/.");
      }
      if (setIds.has(entry.setId)) throw new Error(where + ": setId is used twice");
      data = { setId: entry.setId, title: entry.title, paper: entry.paper, session: entry.session };
      count = entry.count;
      live = !!liveRows[entry.setId];
    } else {
      const rel = "assets/questions/" + entry.file + ".json";
      const abs = path.join(root, rel);
      if (!fs.existsSync(abs)) throw new Error(where + ": the question file " + rel + " is missing");
      data = JSON.parse(fs.readFileSync(abs, "utf8"));
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
      count = data.questions.length;
    }
    setIds.add(data.setId);
    return {
      slug: entry.slug,
      year: entry.year,
      month: entry.month,
      monthName: MONTHS[entry.month - 1],
      setId: data.setId,
      title: data.title,
      paper: data.paper,
      session: data.session,
      shift: shift,
      count: count,
      access: access,
      live: live,
      href: BASE + entry.slug + "/",
      reviewHref: BASE + entry.slug + "/review/",
    };
  });
  // Oldest first: year, then month, then Paper II before Paper III, then the shift, then the slug.
  papers.sort(function (a, b) {
    return a.year - b.year || a.month - b.month ||
      (PAPER_ORDER[a.paper] || 9) - (PAPER_ORDER[b.paper] || 9) ||
      (a.shift || "").localeCompare(b.shift || "") || a.slug.localeCompare(b.slug);
  });
  return papers;
};
