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

  const c = function (n) { return Number(n).toLocaleString("en-US"); };   // 2000 -> "2,000"
  return {
    daily: { ages: dailyAges, questions: c(dailyQ) },
    sets: { count: sets.length, questions: c(setsQ), ages: setsAges },
    pgtMock: { count: pgtFree.length, questions: c(pgtFreeQ) },
    pgtDays: { count: days.length, questions: c(daysQ) },
    netPyq: { count: net.length, questions: c(netQ), years: netYears.join(", ") }
  };
};
