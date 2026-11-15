# AK Explained — future plans (checked against `origin/main`, 2026-11-15)

A maintainers' note. It lists what is **not built yet** and what the owner still has to decide.
Source of each line: the repo itself (data files, pages) first, then the older notes in
`docs/accounts-status.md`, `docs/self-serve-publish-plan.md` and `CLAUDE.md`.
Nothing here is invented: where a fact came only from an old note, it says so.
The live site (akexplained.com) cannot be opened from a cloud session (rule 14), so this list
reads the repo, not the live pages.

## What changed since the last list (found on `main`, 2026-11-15)
- **British MCQ Set 1 is now live for 17 of the 20 ages** (Victorian and Edwardian were added; all free, easy + medium).
  Only **Georgian, Modern and Postmodern** have no live set yet (`_data/mcqSpec.json`; their hubs are still in `SOON_HUBS`).
- **UGC NET English PYQs: 4 papers are live, not 1** — Paper II and Paper III for June 2012 and December 2012
  (`_data/netPyqs.json`; 50, 75, 50 and 74 questions). The older notes still say "first paper only".
- Header artwork and the home hero were changed (cosmetic; shared Daily picture on PYQ and Mock Tests pages).
- Catalog today (`_data/paperCatalog.json`): UP PGT mock tests 6–10 live, UP Assistant Professor Paper 2 mock tests 1–4 live,
  login MCQ sets live 2, 4, 5, 6 (Old English).

## 1. Self-serve publish (rule 17) — next series
1. **Series 3 — UP PGT login mock tests (6–10 and new).** Same pattern as UP AP: runtime hub cards, pre-built route range,
   `data-catalog-check`. Free Tests 1–5 and Coming-soon 11–60 stay exactly as they are. Plan: `docs/self-serve-publish-plan.md`.
2. **Series 4 — UGC NET mock tests and Paper 1 MCQs.** Blocked: those pages do not exist yet (`available: false` in
   `_data/netResources.json`), and the upload picker has no NET destination. The owner must first say what NET needs and whether it is free or login.

## 2. Paid layer (rules 13 and 15) — owner said "build next"
Entitlements table, promo codes, server-side redeem, one more RLS policy, then allow `"paid"` in the registry.
Payment gateway: **not chosen**; no fee or limit is to be invented. Big PDFs on **Cloudflare R2**: nothing built, ask first.
The "no paid tier" lines in `/terms/`, `/contact/` and About change in the same commit that makes paid real.

## 3. Content waiting for the owner's files
- **British MCQ sets:** Set 1 for Georgian, Modern, Postmodern. Later sets: most ages still have Sets 2 to 5 planned
  (the registry lists every planned slot; Old English is the only age with all its sets live).
- **UGC NET:** Paper 1 PYQs, Paper 1 MCQs, Paper 1 Mock Tests, NET Mock Tests, "Download Important Books", "Download Complete Syllabus"
  (all `available: false`). More English PYQ papers beyond 2012 can be added with a registry line (rule 18).
- **UP PGT:** 60 MCQ day pages (topics not assigned), Mock Tests 11–60, the other resource cards, and the other state and central exam cards.
- **UP Assistant Professor:** four resource cards still Coming soon.
- **UPSC CSE:** no page exists (the dashboard shows it as a plain label).
- **Daily quiz second bank, "The Literature"** (Anglo-Saxon first): waiting for files. The three button names and the default are undecided.

## 4. Dashboard and accounts backlog
- Streak section (agreed, not built; computable from `answered_at`).
- Mastery meter (roll attempts up the topic tree), and the richer dashboard redesign (`docs/dashboard-redesign-plan.md`).
- "Your level" card waits for the owner's cut-offs; "Tests taken" and "Left unanswered" are not in the database.
- Move a guest's `localStorage` attempts into the account on login.
- Known gap: a login set published self-serve into a Coming-soon slot is not in the dashboard age pool until the next registry edit and rebuild.
- Fix the old 404s `/quizzes/mcq/build/` and `/quizzes/mcq/topic/*`.
- NET taxonomy mapping (the owner supplies the data).

## 5. Small clean-ups found in this check
- `/quizzes/pyq/` still says papers are "being added" and does not link to the live NET PYQs hub (`/exams/net/english-pyqs/`). The owner said earlier it could.
- `/quizzes/mock-tests/` meta description still says "coming soon" although UP PGT and UP AP mock tests are live. Needs the owner's wording.
- `CLAUDE.md` rule 18 ("First paper …") and `docs/accounts-status.md` do not yet describe the June 2012 papers and the two Paper III papers. `tools/pyq/decisions/` has files for three of the four papers (none for December 2012 Paper III); not checked whether that paper needed one.
- Two old remote branches (`fix/pgt-shared-footer`, `fix/result-pdf-question-summary-20261113`) show commits not in `main`'s history; likely already merged by another route. Not verified.

## 6. Decisions owed by the owner
- Taxonomy node-gaps batch 3 (21 titles, `tools/tagging/reports/node-gaps.md`).
- "Meet the Author" bio wording.
- Names and default for the Literature-bank buttons.
- Random-N question picking in the CBT chooser (today the first N questions are used; ask before building).
