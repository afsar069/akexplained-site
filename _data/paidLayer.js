// Paid layer launch switch (owner, 2026-11-18; CLAUDE.md rule 22).
// false = today: the exam tests (mock tests, UP PGT MCQ days, UGC NET login PYQs) open with a free login,
//         and the hub / test pages say so.
// true  = launch day, set in the same commit as the one-time UPDATE that makes those papers paid:
//         the same pages say "needs the All Access pass" and link to /pass/.
// English Literature practice sets, every free file, and the dashboard are not touched by this switch.
module.exports = { live: false };
