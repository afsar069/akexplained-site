// What is FREE on the site, counted from the site's own files at build time (rule 2: never typed by hand).
// Used by the pass page (/pass/) for the "Free vs All Access pass" table. The paid side is counted in the
// browser from the live paper_catalog (assets/pass.js), because paid papers are self-serve (rule 17).
const fs = require("fs");
const path = require("path");

module.exports = function () {
  const root = path.join(__dirname, "..");
  const readQ = function (f) { return JSON.parse(fs.readFileSync(path.join(root, f), "utf8")).questions.length; };

  // Daily quiz: every file in assets/instant/.
  const dailyFiles = fs.readdirSync(path.join(root, "assets", "instant")).filter(function (f) { return /\.json$/.test(f); });
  const dailyQ = dailyFiles.reduce(function (n, f) { return n + readQ("assets/instant/" + f); }, 0);
  const dailyAges = new Set(dailyFiles.map(function (f) { return f.replace(/-(easy|hard)\.json$/, ""); })).size;

  // English Literature MCQ sets that are public files (live and not login).
  const sets = require("./mcqLiveSets.js")().filter(function (x) { return x.set.access !== "login"; });
  const setsQ = sets.reduce(function (n, x) { return n + x.set.count * x.set.levels.length; }, 0);
  const setsAges = new Set(sets.map(function (x) { return x.age.slug; })).size;

  // UP PGT free mock tests (public files).
  const pgtFree = require("./pgtMockTests.js").filter(function (t) { return t.live && t.access === "free"; });
  const pgtFreeQ = pgtFree.reduce(function (n, t) { return n + readQ("assets/questions/up-pgt-mock-test-" + t.number + ".json"); }, 0);

  // UP PGT free MCQ days (public files).
  const days = require("./pgtMcqLiveDays.js");
  const daysQ = days.reduce(function (n, d) { return n + (d.questionCount || 0); }, 0);

  // UGC NET previous-year papers that are free files.
  const net = require("./netPyqPapers.js")().filter(function (p) { return p.access !== "login"; });
  const netQ = net.reduce(function (n, p) { return n + (p.count || 0); }, 0);
  const netYears = Array.from(new Set(net.map(function (p) { return p.year; }))).sort();

  // UP PGT English previous-year papers (free public files, rule 23): _data/pgtPyqPapers.js reads the question files.
  const pgtPyq = require("./pgtPyqPapers.js")();
  const pgtPyqQ = pgtPyq.reduce(function (n, p) { return n + p.count; }, 0);
  const pgtPyqYears = Array.from(new Set(pgtPyq.map(function (p) { return p.year; }))).sort();

  // UP Assistant Professor English PYQ 2026 (free Quick Quiz file, rule 3): counted only while its card is live.
  // The question range ("31 to 120") is read from the ids, upap26-q031 ... upap26-q120, so it is never typed by hand.
  const apCard = require("./statePscResources.json").filter(function (r) { return r.slug === "english-pyq-2026" && r.live; });
  let apPyq = { count: 0, questions: "0", from: 0, to: 0 };
  if (apCard.length) {
    const qs = JSON.parse(fs.readFileSync(path.join(root, "assets", "questions", "up-ap-english-2026.json"), "utf8")).questions;
    const nums = qs.map(function (q) { return parseInt(String(q.id).replace(/^.*q0*/, ""), 10); }).filter(function (n) { return !isNaN(n); });
    apPyq = { count: 1, questions: qs.length, from: Math.min.apply(null, nums), to: Math.max.apply(null, nums) };
  }

  const c = function (n) { return Number(n).toLocaleString("en-US"); };   // 2000 -> "2,000"
  apPyq.questions = c(apPyq.questions);
  return {
    daily: { ages: dailyAges, questions: c(dailyQ) },
    sets: { count: sets.length, questions: c(setsQ), ages: setsAges },
    pgtMock: { count: pgtFree.length, questions: c(pgtFreeQ) },
    pgtDays: { count: days.length, questions: c(daysQ) },
    pgtPyq: { count: pgtPyq.length, questions: c(pgtPyqQ), years: pgtPyqYears.join(", ") },
    apPyq: apPyq,
    netPyq: { count: net.length, questions: c(netQ), years: netYears.join(", ") }
  };
};
