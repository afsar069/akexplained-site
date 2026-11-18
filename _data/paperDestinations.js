/* Where an uploaded login paper goes — the "Where does it go?" picker on /admin/upload-paper/.
   ---------------------------------------------------------------------------------------------
   The owner picks a destination and a number; the upload page builds the paper's id ITSELF from
   that (never from the file), so a file made with the wrong id cannot land in the wrong place
   (owner, 2026-11-13: "upload hi aisa ho jo galti hi na ho"). Each destination names a page that is
   OPEN on the site, and the build STOPS if that page is missing, so the list never drifts.

   A destination builds the set id like this:
     - needsAge = false : id = prefix + number          (e.g. up-ap-p2-mock-test-5)
     - needsAge = true  : id = <age slug>-set-number     (e.g. elizabethan-set-1)
   examId must be a real public.exams row (null for the English Literature sets). kind is
   'mock-test' or 'mcq-set'. autoPage = true means a new live paper needs no page wiring.
   selfServe = true means more: the series is self-serve-published (CLAUDE.md rule 17), so a paper
   marked Live shows on its page AT ONCE, with no rebuild (UP AP Paper 2 and UP PGT mock tests).
   For the others the id is still made correct here; wiring the page is a separate step.

   needsPaper = true (UGC NET previous-year papers, rule 18): the paper has no number. The owner picks it from
   `papers` (the login PYQs planned in _data/netPyqs.json, each with its set id and its page address) and the id is
   exactly that paper's set id. The page is already built; Live shows it at once (rule 17).

   minNumber / maxNumber: the numbers that have a page. A self-serve series pre-builds its pages
   for a fixed range, so a paper saved outside it could never be opened; the upload page refuses
   such a number and shows numberNote. Both ends are read from the series' own data file, so they
   follow the range by themselves. */

const fs = require("fs");
const path = require("path");
const mcqSpec = require("./mcqSpec.json");

const pgtMockTests = require("./pgtMockTests");
const statePscMockTests = require("./statePscMockTests");
const pgtMcqSeries = require("./pgtMcqSeries");
const pgtMcqDays = require("./pgtMcqDays");
const pgtLoginNumbers = pgtMockTests.filter(function (t) { return t.access === "login"; }).map(function (t) { return t.number; });
const pgtFreeNumbers = pgtMockTests.filter(function (t) { return t.access === "free"; }).map(function (t) { return t.number; });
const apNumbers = statePscMockTests.range.map(function (t) { return t.number; });

/* UP PGT MCQ days: every login day (11 upward) has a page. Days 11 and 12 were loaded into the
   database under their own ids before this series became self-serve, so the id of a day is taken
   from the registry, not guessed: dayIds holds the ones that are not prefix + number. */
const pgtDayNumbers = pgtMcqDays.filter(function (d) { return d.managed; }).map(function (d) { return d.number; });
const pgtDayIds = {};
pgtMcqDays.forEach(function (d) {
  if (d.managed && d.setId !== pgtMcqSeries.prefix + d.number) pgtDayIds[d.number] = d.setId;
});

/* UGC NET previous-year papers that are login papers (no public file, rule 18). The owner picks one by name. */
const netLoginPapers = require("./netPyqPapers")().filter(function (p) { return p.access === "login"; });

const AGES = (mcqSpec.ages || []).map(function (a) { return { slug: a.slug, name: a.name }; });

const DESTINATIONS = [
  {
    id: "up-ap-p2-mock",
    label: "UP Assistant Professor — Paper 2 Mock Test",
    examId: "state-psc",
    kind: "mock-test",
    prefix: "up-ap-p2-mock-test-",
    titleWord: "Mock Test",
    needsAge: false,
    autoPage: true,
    selfServe: true,
    minNumber: Math.min.apply(null, apNumbers),
    maxNumber: Math.max.apply(null, apNumbers),
    pageBase: "/exams/state-psc/up-assistant-professor/paper-2-mock-tests/",
    pageRoute: "test-{n}/",
    pageLevels: ["medium"],
    numberNote: "Pages are ready for Mock Tests " + Math.min.apply(null, apNumbers) + " to " + Math.max.apply(null, apNumbers) +
      ". For a higher number, ask Claude to make more pages first.",
    hub: "exams/state-psc/up-assistant-professor/paper-2-mock-tests/index.njk"
  },
  {
    id: "up-pgt-mock",
    label: "UP PGT English — Mock Test",
    examId: "pgt",
    kind: "mock-test",
    prefix: "up-pgt-mock-test-",
    titleWord: "Mock Test",
    needsAge: false,
    autoPage: true,
    selfServe: true,
    minNumber: Math.min.apply(null, pgtLoginNumbers),
    maxNumber: Math.max.apply(null, pgtLoginNumbers),
    pageBase: "/exams/pgt/up-pgt/mock-tests/",
    pageRoute: "test-{n}/",
    pageLevels: ["medium"],
    numberNote: "Mock Tests " + Math.min.apply(null, pgtFreeNumbers) + " to " + Math.max.apply(null, pgtFreeNumbers) +
      " are the free tests. A login test here must be number " + Math.min.apply(null, pgtLoginNumbers) + " to " +
      Math.max.apply(null, pgtLoginNumbers) + ".",
    hub: "exams/pgt/up-pgt/mock-tests/index.njk"
  },
  {
    id: "up-pgt-day",
    label: "UP PGT English — MCQ Day",
    examId: "pgt",
    kind: "mcq-set",
    prefix: pgtMcqSeries.prefix,
    titleWord: "Day",
    needsAge: false,
    autoPage: true,
    selfServe: true,
    ids: pgtDayIds,
    minNumber: Math.min.apply(null, pgtDayNumbers),
    maxNumber: Math.max.apply(null, pgtDayNumbers),
    pageBase: pgtMcqSeries.base,
    pageRoute: "day-{n}/",
    pageLevels: ["medium"],
    titleNote: "Type the day's topic here, for example \u201cShakespeare 3: Tragedies\u201d. Students see this on the day's card.",
    numberNote: "Days 1 to " + pgtMcqSeries.freeMax + " are the free days. A login day here must be number " +
      Math.min.apply(null, pgtDayNumbers) + " to " + Math.max.apply(null, pgtDayNumbers) + ".",
    hub: "exams/pgt/up-pgt/mcqs/index.njk"
  },
  {
    id: "net-pyq",
    label: "UGC NET English \u2014 Previous-year paper",
    examId: "ugc-net",
    kind: "mcq-set",
    prefix: null,
    titleWord: "Paper",
    needsAge: false,
    needsPaper: true,
    papers: netLoginPapers.map(function (p) { return { id: p.setId, title: p.title, path: p.href }; }),
    autoPage: true,
    selfServe: true,
    pageBase: "/exams/net/english-pyqs/",
    pageLevels: ["medium"],
    titleNote: "Filled in from the paper you choose. Students see this name on the paper's pages.",
    hub: "exams/net/english-pyqs/index.njk"
  },
  {
    id: "lit-mcq",
    label: "English Literature — MCQ set",
    examId: null,
    kind: "mcq-set",
    prefix: null,
    titleWord: "Set",
    needsAge: true,
    autoPage: false,
    usesRegistryPlan: true,
    ages: AGES,
    hub: "quizzes/mcq/index.html"
  }
];

/* No planned login PYQ = nothing to pick, so the destination is not offered. */
module.exports = DESTINATIONS.filter(function (d) { return !d.needsPaper || d.papers.length; }).map(function (d) {
  if (!fs.existsSync(path.join(__dirname, "..", d.hub))) {
    throw new Error(
      "[paperDestinations] " + d.label + " is offered on the upload page, but its page " +
      d.hub + " is not in the repo. Open the page first, or remove the destination."
    );
  }
  /* ids is printed on the page as one attribute, so it must be safe inside HTML. */
  d.idsJson = JSON.stringify(d.ids || {});
  return d;
});
