/* UP Assistant Professor, Paper 2 English Literature mock tests — built from the paper catalog.
   ---------------------------------------------------------------------------------------------
   The questions live in Supabase (public.mcq_papers, login only). Their public metadata lives in
   public.paper_catalog, and `tools/sync_catalog.py` copies the LIVE rows into
   _data/paperCatalog.json. This file turns those rows into the list the pages need: the hub
   cards, the test route, the review route and the sitemap lines all read it, so a new mock test
   needs no new page in the repo (owner, 2026-11-12).

   A draft paper is not in paperCatalog.json, so it makes no page and no sitemap line.
   Nothing here invents a title or a count: both come from the uploaded file itself. */

const catalog = require("./paperCatalog.json");

const PREFIX = "up-ap-p2-mock-test-";
const BASE = "/exams/state-psc/up-assistant-professor/paper-2-mock-tests/";

if (!catalog || !Array.isArray(catalog.papers)) {
  throw new Error("[statePscMockTests] _data/paperCatalog.json is missing or damaged. " +
    "Rebuild it with tools/sync_catalog.py --from <rows.json>.");
}

const tests = catalog.papers
  .filter(p => p.status === "live" && p.kind === "mock-test" && String(p.setId).indexOf(PREFIX) === 0)
  .map(function (p) {
    const number = parseInt(p.number, 10);
    if (!(number > 0)) {
      throw new Error("[statePscMockTests] " + p.setId + " has no test number in the catalog, " +
        "so its page address cannot be worked out.");
    }
    return {
      number: number,
      label: String(number).padStart(2, "0"),
      setId: p.setId,
      title: p.title,
      questionCount: p.questionCount,
      url: BASE + "test-" + number + "/",
      reviewUrl: BASE + "test-" + number + "/review/"
    };
  })
  .sort((a, b) => a.number - b.number);

// "1" / "1 and 2" / "1, 2 and 3" — for the sentences on the hub page.
function numbersPhrase(numbers) {
  if (!numbers.length) return "";
  if (numbers.length === 1) return String(numbers[0]);
  return numbers.slice(0, -1).join(", ") + " and " + numbers[numbers.length - 1];
}

const counts = tests.map(t => t.questionCount).filter((v, i, a) => a.indexOf(v) === i);

/* Self-serve publish (owner, 2026-11-14): the test and review pages are built for a FIXED
   range of numbers (1..RANGE_MAX), not only for the tests that are live at build time. A static
   host 404s on an address it never built, so the routes must already exist; each page then
   checks the live catalog when it is opened (assets/cbt.js, data-catalog-check):
     - the set_id is a LIVE paper_catalog row -> the test opens exactly as before (login-gated),
     - otherwise -> a plain "This test is not open yet" screen (never a login wall).
   So the owner can upload a Mock Test 5, mark it Live, and its page works with no rebuild.
   The hub cards and the sitemap still list only the live tests (see `tests` above). To make
   room for more than RANGE_MAX tests, raise this one number. */
const RANGE_MAX = 30;
const range = [];
for (let i = 1; i <= RANGE_MAX; i++) {
  range.push({ number: i, setId: PREFIX + i });
}

module.exports = {
  tests: tests,
  range: range,
  numbers: numbersPhrase(tests.map(t => t.number)),
  // Said only when every test is the same length, so the page can never claim a wrong number.
  countPhrase: counts.length === 1 ? ", with " + counts[0] + " questions each" : ""
};
