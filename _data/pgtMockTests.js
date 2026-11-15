/* UP PGT English mock tests — the 60 slots on /exams/pgt/up-pgt/mock-tests/.
   ---------------------------------------------------------------------------------------------
   Tests 1..FREE_MAX are FREE public files (assets/questions/up-pgt-mock-test-N.json): hand-written
   test-N.njk / review-N.njk pages, never catalog-checked. They stay exactly as they are.

   Every other slot (FREE_MAX+1 .. TOTAL) is a LOGIN slot and is self-serve-published (owner,
   2026-11-15, CLAUDE.md rule 17): its questions are rows in Supabase (public.mcq_papers,
   `up-pgt-mock-test-N`), and whether it is open is decided by the LIVE public.paper_catalog when
   the page is viewed, not by the build:
     - the hub card flips between "Coming soon" and lock/Start (assets/paper-list.js, slot mode),
     - the pre-built test + review page opens only for a live row (assets/cbt.js,
       data-catalog-check), else "This test is not open yet".
   So the owner uploads Mock Test 11, marks it Live on /admin/papers/, and it appears with no
   rebuild; Draft hides it at once.

   `live` and `questionCount` here are only the BUILD-TIME picture (from _data/paperCatalog.json,
   written by tools/sync_catalog.py): they make the static fallback cards, the sitemap lines and
   the counts on /quizzes/mock-tests/. Nothing here invents a count. */

const catalog = require("./paperCatalog.json");

const TOTAL = 60;
const FREE_MAX = 5;
const PREFIX = "up-pgt-mock-test-";
const BASE = "/exams/pgt/up-pgt/mock-tests/";

if (!catalog || !Array.isArray(catalog.papers)) {
  throw new Error("[pgtMockTests] _data/paperCatalog.json is missing or damaged. " +
    "Rebuild it with tools/sync_catalog.py --from <rows.json>.");
}

const liveRows = {};
catalog.papers.forEach(function (p) {
  if (p.status === "live" && p.kind === "mock-test" && String(p.setId).indexOf(PREFIX) === 0) {
    liveRows[p.setId] = p;
  }
});

module.exports = Array.from({ length: TOTAL }, (_, index) => {
  const number = index + 1;
  const setId = PREFIX + number;
  const free = number <= FREE_MAX;
  const row = free ? null : liveRows[setId];
  return {
    number,
    label: String(number).padStart(2, "0"),
    setId,
    access: free ? "free" : "login",
    live: free || !!row,
    questionCount: row ? row.questionCount : null,
    url: BASE + "test-" + number + "/",
    reviewUrl: BASE + "test-" + number + "/review/",
  };
});
