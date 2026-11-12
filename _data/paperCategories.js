/* Where an uploaded login paper can belong — the Category list on /admin/upload-paper/.
   ----------------------------------------------------------------------------------
   Rule: only an exam whose hub page is OPEN on the site may be offered, because the paper has to
   have somewhere to appear (owner, 2026-11-12). So every entry names the hub page it belongs to,
   and the build STOPS if that page is not in the repo. That way the list can never drift away
   from the pages: a category exists only as long as its hub exists.

   examId must be a row of public.exams in Supabase (the database checks it too, and refuses an
   unknown one). TGT is deliberately absent: there is no TGT hub page yet.

   Add a line here when a new exam hub opens; nothing else needs to change. */

const fs = require("fs");
const path = require("path");

const CATEGORIES = [
  {
    examId: "ugc-net",
    label: "UGC NET / JRF / SET",
    hub: "exams/net/index.njk",
    hubUrl: "/exams/net/"
  },
  {
    examId: "pgt",
    label: "UP PGT English",
    hub: "exams/pgt/up-pgt/index.njk",
    hubUrl: "/exams/pgt/up-pgt/"
  },
  {
    examId: "state-psc",
    label: "UP Assistant Professor (State PSC)",
    hub: "exams/state-psc/up-assistant-professor/index.njk",
    hubUrl: "/exams/state-psc/up-assistant-professor/"
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
