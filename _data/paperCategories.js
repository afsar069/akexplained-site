/* Where an uploaded login paper can belong — the Category list on /admin/upload-paper/.
   ----------------------------------------------------------------------------------
   Rule: a category may be offered only if the paper has somewhere to appear, so every entry names a
   hub page that is OPEN on the site, and the build STOPS if that page is not in the repo. That way
   the list can never drift away from the pages (owner, 2026-11-12).

   A category is one of two kinds:
   - an EXAM: `examId` is a row of `public.exams` in Supabase (the database checks it too, and refuses
     an unknown one). TGT is deliberately absent — there is no TGT hub page yet.
   - the English Literature MCQ sets, which belong to NO exam (`examId` is null). These are the login
     MCQ sets that live under /quizzes/mcq/<age>/ (owner asked for this category, 2026-11-13). The
     upload page sends no `examId` for them, so `paper_catalog.exam_id` stays null, exactly like the
     login MCQ sets loaded before this tool.

   `value` is what the dropdown sends (and what `assets/upload-paper.js` reads); `examId` is the real
   exam id or null. Add a line here when a new exam hub opens; nothing else needs to change. */

const fs = require("fs");
const path = require("path");

const CATEGORIES = [
  {
    value: "ugc-net",
    examId: "ugc-net",
    label: "UGC NET / JRF / SET",
    hub: "exams/net/index.njk",
    hubUrl: "/exams/net/"
  },
  {
    value: "pgt",
    examId: "pgt",
    label: "UP PGT English",
    hub: "exams/pgt/up-pgt/index.njk",
    hubUrl: "/exams/pgt/up-pgt/"
  },
  {
    value: "state-psc",
    examId: "state-psc",
    label: "UP Assistant Professor (State PSC)",
    hub: "exams/state-psc/up-assistant-professor/index.njk",
    hubUrl: "/exams/state-psc/up-assistant-professor/"
  },
  {
    value: "literature",
    examId: null,
    label: "English Literature MCQ set (no exam)",
    hub: "quizzes/mcq/index.html",
    hubUrl: "/quizzes/mcq/"
  }
];

module.exports = CATEGORIES.map(function (c) {
  if (!fs.existsSync(path.join(__dirname, "..", c.hub))) {
    throw new Error(
      "[paperCategories] " + c.label + " is offered on the upload page, but its hub page " +
      c.hub + " is not in the repo. Open the hub page first, or remove the category."
    );
  }
  return c;
});
