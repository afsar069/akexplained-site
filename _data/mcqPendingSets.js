/* Self-serve publish for English Literature login MCQ sets (owner, 2026-11-14, rule 17).

   Every planned set that is NOT yet live in the registry (a "Coming soon" slot) is a
   slot the owner can publish by themselves: upload its questions at /admin/upload-paper/
   and mark it Live on /admin/papers/, and it appears with no rebuild. For that to work the
   set PAGE must already exist (a static host 404s on an unbuilt path), so this file lists
   those slots and the pending set/review templates pre-build their routes as login-gated,
   catalog-checked pages (NO question file in the repo, rule 15). assets/cbt.js opens such a
   page only when its `<age>-set-N` is a LIVE row in public.paper_catalog; until then it shows
   "This set is not open yet" (never a login wall for a slot nobody has filled).

   A free set that later takes one of these slots becomes a LIVE registry set (built from
   mcqLiveSets), so it drops out of this list — the two never build the same route.

   The set keeps its full registry card (title, summary, topic tags) on the age hub; this is
   only about the set's own page route. The hub card is flipped Coming soon -> Start/lock at
   view time by assets/mcq-age.js. */
module.exports = function () {
  const out = [];
  require("./mcqAges.js")().forEach((age) => {
    (age.sets || []).forEach((set) => {
      if (!set.live) out.push({ age, set });
    });
  });
  return out;
};
