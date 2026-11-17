/* The 60 day slots of /exams/pgt/up-pgt/mcqs/.
   ---------------------------------------------------------------------------------------------
   Days 1..freeMax are FREE public files (_data/pgtMcqLiveDays.js). They stay exactly as they are.

   Every other day is a LOGIN day and is self-serve-published (CLAUDE.md rule 17): its questions
   are rows in Supabase (public.mcq_papers), and whether it is open is decided by the LIVE
   public.paper_catalog when the page is viewed, not by the build:
     - the hub card flips between "Coming soon" and lock/Start (assets/paper-list.js, slot mode),
     - the pre-built day + review page opens only for a live row (assets/cbt.js,
       data-catalog-check), else "This set is not open yet".
   So the owner uploads Day 13, marks it Live on /admin/papers/, and it appears with no rebuild;
   Draft hides it at once.

   `setId` is the registry's word on a paper's id: the days already in the database keep the id
   they were loaded with (_data/pgtMcqLoginDays.js), and every other day uses the canonical
   prefix + number, which is the id /admin/upload-paper/ builds.

   Nothing here is invented. A day's title and question count come either from the registry (the
   free days and Days 11 and 12) or from _data/paperCatalog.json, the owner's own upload read back
   from the database by tools/sync_catalog.py. That is only the BUILD-TIME picture: it makes the
   static fallback cards and the sitemap lines, so a day published self-serve also gets a proper
   card and a sitemap line at the next rebuild. A day nobody has uploaded carries no title and no
   count at all, and its page fills them in from the live catalog when it opens. */
const series = require("./pgtMcqSeries");
const catalog = require("./paperCatalog.json");

if (!catalog || !Array.isArray(catalog.papers)) {
  throw new Error("[pgtMcqDays] _data/paperCatalog.json is missing or damaged. " +
    "Rebuild it with tools/sync_catalog.py --from <rows.json>.");
}

const known = new Map(
  [].concat(require("./pgtMcqLiveDays"), require("./pgtMcqLoginDays"))
    .map(day => [day.number, day])
);

/* Days uploaded by the owner, as the catalog last saw them (live rows only). */
const uploaded = {};
catalog.papers.forEach(paper => {
  if (paper.status === "live" && String(paper.setId).indexOf(series.prefix) === 0) {
    uploaded[paper.setId] = paper;
  }
});

/* "Day 13" as a title says nothing the card does not already say, so it is not a title. */
const topicOf = row => {
  const title = String((row && row.title) || "").trim();
  return /^day\s*\d+$/i.test(title) ? "" : title;
};

module.exports = Array.from({ length: series.total }, (_, index) => {
  const number = index + 1;
  const day = known.get(number) || {};
  const free = day.access === "free";
  const setId = day.setId || series.prefix + number;
  const row = (!day.access && uploaded[setId]) || null;
  return {
    number,
    label: String(number).padStart(2, "0"),
    level: "medium",
    levelName: "Mixed",
    ...day,
    setId,
    title: day.title || topicOf(row) || "",
    questionCount: day.questionCount || (row ? row.questionCount : null),
    /* managed = the live catalog decides this slot (every day that is not a free file). */
    managed: !free,
    liveAtBuild: free || day.access === "login" || !!row,
    url: series.base + "day-" + number + "/",
    reviewUrl: series.base + "day-" + number + "/review/",
  };
});
