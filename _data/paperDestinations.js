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

   minNumber / maxNumber: the numbers that have a page. A self-serve series pre-builds its pages
   for a fixed range, so a paper saved outside it could never be opened; the upload page refuses
   such a number and shows numberNote. Both ends are read from the series' own data file, so they
   follow the range by themselves. */

const fs = require("fs");
const path = require("path");
const mcqSpec = require("./mcqSpec.json");

const pgtMockTests = require("./pgtMockTests");
const statePscMockTests = require("./statePscMockTests");
const pgtLoginNumbers = pgtMockTests.filter(function (t) { return t.access === "login"; }).map(function (t) { return t.number; });
const pgtFreeNumbers = pgtMockTests.filter(function (t) { return t.access === "free"; }).map(function (t) { return t.number; });
const apNumbers = statePscMockTests.range.map(function (t) { return t.number; });

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
    numberNote: "Mock Tests " + Math.min.apply(null, pgtFreeNumbers) + " to " + Math.max.apply(null, pgtFreeNumbers) +
      " are the free tests. A login test here must be number " + Math.min.apply(null, pgtLoginNumbers) + " to " +
      Math.max.apply(null, pgtLoginNumbers) + ".",
    hub: "exams/pgt/up-pgt/mock-tests/index.njk"
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
    ages: AGES,
    hub: "quizzes/mcq/index.html"
  }
];

module.exports = DESTINATIONS.map(function (d) {
  if (!fs.existsSync(path.join(__dirname, "..", d.hub))) {
    throw new Error(
      "[paperDestinations] " + d.label + " is offered on the upload page, but its page " +
      d.hub + " is not in the repo. Open the page first, or remove the destination."
    );
  }
  return d;
});
