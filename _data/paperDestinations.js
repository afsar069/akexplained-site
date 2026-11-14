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
   'mock-test' or 'mcq-set'. autoPage = true means a new live paper shows on the page after the
   normal rebuild with no extra wiring (today only the UP AP Paper 2 mock tests, which are built
   straight from the paper catalog). For the others the id is still made correct here; wiring the
   page is a separate step. */

const fs = require("fs");
const path = require("path");
const mcqSpec = require("./mcqSpec.json");

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
    autoPage: false,
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
