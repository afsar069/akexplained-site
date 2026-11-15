// Exam cards on /quizzes/mock-tests/ (the mock-test front door). Code comment, Hinglish allowed.
// Naya exam jodna ho: neeche ek entry add karo. Jab uske mock tests ban jayein to `href` + `meta` do aur `live: true` karo.
// `live: false` card sirf "Coming soon" dikhata hai, koi link nahi (404 nahi).
// Counts file/catalog se aate hain, haath se nahi likhe. UP AP self-serve hai (rule 17): uske tests runtime par badalte hain,
// isliye uske card par tests ki ginti nahi dikhate, sirf "har test me kitne sawal" (build ke time ke catalog se).
const fs = require("fs");
const path = require("path");

module.exports = function () {
  const root = path.join(__dirname, "..");
  const catalog = require("./paperCatalog.json").papers;
  const pgtTests = require("./pgtMockTests.js").filter(function (t) { return t.live; });

  // UP PGT: free tests are public files, login tests are in the catalog. Say "N questions each" only if all agree.
  const pgtCounts = pgtTests.map(function (t) {
    if (t.access === "free") {
      const f = path.join(root, "assets", "questions", "up-pgt-mock-test-" + t.number + ".json");
      return JSON.parse(fs.readFileSync(f, "utf8")).questions.length;
    }
    const row = catalog.find(function (p) { return p.setId === "up-pgt-mock-test-" + t.number && p.status === "live"; });
    return row ? row.questionCount : null;
  });
  const pgtSame = pgtCounts.length && pgtCounts.every(function (c) { return c && c === pgtCounts[0]; });
  const pgtFree = pgtTests.filter(function (t) { return t.access === "free"; }).length;
  const pgtLogin = pgtTests.length - pgtFree;

  const ap = require("./statePscMockTests.js");
  const apCounts = ap.tests.map(function (t) { return t.questionCount; }).filter(function (v, i, a) { return a.indexOf(v) === i; });

  return [
    {
      slug: "up-pgt",
      title: "UP PGT English",
      icon: "target",
      blurb: "Full-length UP PGT English mock tests, with a clock and a full review.",
      meta: pgtTests.length + " tests" + (pgtSame ? " · " + pgtCounts[0] + " questions each" : "") +
        " · " + pgtFree + " free, " + pgtLogin + " with login",
      href: "/exams/pgt/up-pgt/mock-tests/",
      live: true
    },
    {
      slug: "up-assistant-professor",
      title: "UP Assistant Professor English",
      icon: "layers",
      blurb: "Paper 2 English Literature mock tests, with a clock and a full review.",
      meta: (apCounts.length === 1 ? apCounts[0] + " questions each · " : "") + "Log in to take them",
      href: "/exams/state-psc/up-assistant-professor/paper-2-mock-tests/",
      live: true
    },
    {
      slug: "net",
      title: "UGC NET English",
      icon: "book-open",
      blurb: "UGC-NET mock tests will be added here.",
      live: false
    },
    {
      slug: "tgt",
      title: "TGT English",
      icon: "file-text",
      blurb: "Mock tests for TGT English will be added here.",
      live: false
    }
  ];
};
