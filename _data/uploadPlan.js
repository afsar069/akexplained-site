/* What the registry plans for each English Literature set — read by the upload page's final check
   (admin/upload-paper, owner, 2026-11-15). The page compares what was saved in the database with this,
   and says plainly what is missing (a level, a different count, no page for that slot yet).
   Only plain facts go in: set id, planned levels and count, and whether the set is already open as a
   free set or as a login set. No question text. `json` is safe to print inside a <script> tag. */
const ages = require("./mcqAges.js")().map(function (a) { return a; });

const sets = {};
ages.forEach(function (age) {
  (age.sets || []).forEach(function (s) {
    sets[age.slug + "-set-" + s.n] = {
      age: age.name,
      n: s.n,
      levels: s.levels,
      count: s.count,
      // "planned" = Coming soon slot (page is pre-built, opens when Live); "login" = live login set; "free" = live free set
      state: !s.live ? "planned" : (s.access === "login" ? "login" : "free"),
      rev: s.live && s.access === "login" ? s.rev : null,
      path: "/quizzes/mcq/" + age.slug + "/set-" + s.n + "/"
    };
  });
});

module.exports = {
  sets: sets,
  json: JSON.stringify({ sets: sets }).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026")
};
