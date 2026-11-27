# AK Explained — future plans (checked against `origin/main`, 2026-11-15; **section 7 added 2026-11-27**)

**Newest first: section 7 holds the four plans the owner asked for on 2026-11-27 (UP PGT paid PYQs, UGC NET Paper 1 PYQs, UGC NET mock tests, Literary Theory MCQs). Sections 1 to 6 are older and were last checked on 2026-11-15.**

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
1. **Series 3 — UP PGT login mock tests (6–60): BUILT 2026-11-15, on the branch, not merged.** Slot mode of
   `assets/paper-list.js` + pre-built login pages with `data-catalog-check`. Free Tests 1–5 untouched. See rule 17 and
   `docs/self-serve-publish-plan.md`. Same quirk still open in series 2: `assets/mcq-age.js` `catalogFlip` does not ask for
   `status = 'live'`, so the owner (admin) still sees a Draft literature set as open on the age hub; students do not.
2. **Series 4 — UGC NET mock tests and Paper 1 MCQs.** Blocked: those pages do not exist yet (`available: false` in
   `_data/netResources.json`), and the upload picker has no NET destination. The owner must first say what NET needs and whether it is free or login.
   **Update 2026-11-27:** the owner has now asked for NET mock tests and NET Paper 1 PYQs; see section 7.2 and 7.3.

## 2. Paid layer (rule 22) — LAUNCHED and on sale (2026-11-18); what is still ahead
The pass, promo codes and Razorpay are live (state: `docs/accounts-status.md` "START HERE"; rules: CLAUDE.md rule 22).
Ahead, none started:
- **Paid-card tag — BUILT 2026-11-19 as a "Get access" button** (`assets/pass-gate.js`, CLAUDE.md rule 22): the owner decided
  the same day to replace the idea of a tag and the middle "needs the pass" page with it. Nothing left to do here.
- **One pass per course** (owner: later, "alag alag course ke alag alag price or plan"): one more `pass_plans` row per course,
  the paid read policy (`mcq_papers_paid_read`) must then check the plan, `pass.js` has one `PLAN_ID` and must become a choice.
- **A real-money check of the live keys** (owner: "abhi nahi"): a small real payment, then a refund in Razorpay.
Big PDFs on **Cloudflare R2**: nothing built, ask first.

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
- ~~`/quizzes/pyq/` stale~~ — **done 2026-11-15** (branch): it is now the PYQ front door with exam cards (rule 19). New exams are one entry in `_data/pyqHub.js`.
- ~~`/quizzes/mock-tests/` stale~~ — **done 2026-11-15** (branch): it is now the mock-test front door with exam cards (rule 20).
- `CLAUDE.md` rule 18 ("First paper …") and `docs/accounts-status.md` do not yet describe the June 2012 papers and the two Paper III papers. `tools/pyq/decisions/` has files for three of the four papers (none for December 2012 Paper III); not checked whether that paper needed one.
- Two old remote branches (`fix/pgt-shared-footer`, `fix/result-pdf-question-summary-20261113`) show commits not in `main`'s history; likely already merged by another route. Not verified.

## 6. Decisions owed by the owner
- Taxonomy node-gaps batch 3 (21 titles, `tools/tagging/reports/node-gaps.md`).
- "Meet the Author" bio wording.
- Names and default for the Literature-bank buttons.
- Random-N question picking in the CBT chooser (today the first N questions are used; ask before building).

## 7. The owner's new plans, 2026-11-27 — none started
The owner's words: "UP PGT English PYQs paid upload bnana hai. UGC NET paper 1 pyq free and paid dono bnane hai. UGC NET mock
tests banana hai. or literary theory ke complete section ke free and paid mcqs bnane hai, but pehle unko plan karna hai. in sabko
future plan me rakh do." Nothing below is built, and nothing is decided beyond what the owner said; every "Decisions owed" line is
the owner's to answer (rule 2: no invented years, counts, titles or topics). Facts about today were read from the repo and from
the live database on 2026-11-27.

**What the admin can upload today** (so the gaps below are clear): `/admin/upload-paper/` takes paid papers for UP AP Paper 2 mock
tests (1–30), UP PGT mock tests (6–60), UP PGT MCQ days (11–60), the 39 planned login UGC NET English Paper II PYQs, and
British / American / Indian English literature MCQ sets. `/admin/upload-mcq/` takes the 136 planned free literature sets.
`/admin/upload-daily/` only corrects the 40 existing Daily quizzes. A free PYQ of any exam has **no upload page**: it is a
registry line plus a build (rules 18 and 23).

### 7.1 UP PGT English PYQs — paid
- **Today:** the PYQs at `/exams/pgt/up-pgt/pyqs/` are **free public files** for 2000, 2002 and 2006 (rule 23, registry
  `_data/pgtPyqs.json`). There is no paid PYQ card, no paid PYQ page and no upload destination for them.
- **The three free years stay free.** A file that went live is public in git history for good (rule 15); never move it to paid.
  Paid is for **new** years only.
- **Pattern to copy:** the UGC NET login PYQs (rule 18). (1) Plan each paid year as a registry line with `access: "login"` and no
  `file`. (2) Pre-build its test and review pages with `data-gated` + `data-catalog-check` (from `_includes/up-pgt-pyq-cbt.njk`),
  noindex until live. (3) On the hub, a paid year's card says Coming soon until its paper is a **live** `paper_catalog` row, then
  shows the padlock to a guest and Start (with `data-pass-start`, rule 22) to a student, flipped at view time like
  `assets/net-pyq-live.js`. (4) A new destination **UP PGT English — Previous-year paper** in `_data/paperDestinations.js`
  (examId `pgt`, the owner picks the planned paper by name, as for NET). (5) Update the `/quizzes/pyq/` card words (it says free
  today) and keep the PGT PYQ disclaimer (`_includes/pgt-pyq-disclaimer.njk`) on every paid page.
- **Tools that already exist:** `tools/pyq/UP-PGT-PYQ-TAGGER-INSTRUCTIONS.md` (ChatGPT can tag the paper) and
  `tools/pyq/check_upload_file.py`; the database trigger refuses a paid upload that fails its checks.
- **Decisions owed:** which years are paid (the owner supplies them), question counts, and how a printed-but-left-out question is
  worded (the free hub uses `printedCount` and `leftOutNote`).

### 7.2 UGC NET Paper 1 PYQs — free and paid
- **Today:** `paper-1-pyqs` is `available: false` in `_data/netResources.json`. `/exams/net/english-pyqs/` is Paper II only and rule 18
  says not to mix Paper 1 into it, so Paper 1 needs **its own hub**. The site's own NET pages already describe Paper 1 (common
  to all subjects; "General Paper on Teaching & Research Aptitude"; 50 questions, 100 marks as `/exams/net/about/` states).
- **Blocker, must be settled first: the master taxonomy has no Paper 1 topics.** Checked 2026-11-27: its areas are literature,
  criticism and theory, literary terms, ELT, research methods and world literature; there is nothing for teaching aptitude,
  reasoning, comprehension, data interpretation, ICT, environment or higher education. Every question needs a real `topicId`:
  the build gate (rule 12) stops a free file without one and the database trigger refuses a paid upload without one. Rule 11:
  invent no topics, the owner supplies them. So the order is: the owner approves new Paper 1 nodes, then one migration plus
  `taxonomy-master-reference.csv` (and the tagger skill's copy, `python3 tools/build_skill_zip.py`), then the papers.
- **Free part:** public files in `assets/questions/` plus a registry line and a build, like the NET and PGT PYQs today. An option
  to consider later, not decided: an upload page for free PYQs, in the style of `/admin/upload-mcq/` (rule 25).
- **Paid part:** the same pattern as 7.1 and the NET login PYQs: planned slots, pre-built gated pages, a destination in
  `_data/paperDestinations.js`, self-serve flip at view time (rule 17).
- **Also touches:** `_data/pyqHub.js` (the UGC NET card says English only) and `/quizzes/pyq/`; `netResources.json` card flips to
  available; sitemap lines for the free pages only.
- **Decisions owed:** which Paper 1 papers are free and which paid (decide **before** the first commit, because free is for
  good), which years exist, whether a paper that was held in shifts is listed by shift, and the taxonomy nodes above.

### 7.3 UGC NET mock tests
- **Today:** `mock-tests` and `paper-1-mock-tests` are both `available: false` in `_data/netResources.json`; the UGC NET English
  card on `/quizzes/mock-tests/` (`_data/mockHub.js`) is a non-link Coming soon card; there is no NET mock-test page and no
  upload destination. (`docs/self-serve-publish-plan.md`, Series 5, has the old notes.)
- **Pattern:** the mock-test self-serve pattern of UP AP and UP PGT (rule 17, series 1 and 3): a fixed range of pre-built pages
  with `data-catalog-check`, hub cards from `assets/paper-list.js`, `data-pass-start` on paid cards, a destination such as
  **UGC NET English — Mock Test** in `_data/paperDestinations.js` (examId `ugc-net` already exists because the NET PYQs use it),
  the NET hub card turned on, the `/quizzes/mock-tests/` card turned on, and sitemap lines for live free tests only.
- **Decisions owed:** English Paper II only, or Paper 1 mock tests as well (two cards exist); how many tests the range holds;
  how many questions a test has (never invent); which tests are free (a free test is a public file, like PGT Tests 1 to 5) and
  which paid (a new upload is paid by default while the pass is on sale). A Paper 1 mock test has the same taxonomy blocker as 7.2.

### 7.4 Literary Theory MCQs — free and paid; **plan first**
- **Today:** the Literary Theory series is 8 parts and 28 chapters (rule 3). **10 chapter articles are live** (chapters 1 to 10,
  Introduction to Literary Theory up to Post-structuralism), 18 are Coming soon (parts 4 to 8 and chapters 11 onward). Part 1
  (7) and Part 2 (2) are fully live, Part 3 is 1 of 2. MCQ practice exists only **by literary age** in three series (British 20,
  American 5, Indian English 6; `_data/mcqSpec.json`); there are no theory MCQs. The master taxonomy has the area
  *Literary Criticism and Theory* with schools and thinkers (for example structuralism, post-structuralism, psychoanalytic,
  Marxist and feminist criticism, each with writers and concepts under it).
- **PLAN DRAFTED 2026-11-27: `docs/literary-theory-mcq-plan.md`** (8 hubs, 34 sets, 3,400 questions; 10 sets can be made now because
  their articles are live, 24 wait for articles; every name in every scope line is checked by `node tools/theory-mcq-plan.js --check`).
  **Awaiting the owner's answers (its section 7)**, and one blocker found: 21 thinkers named in the ten live chapters have no node in
  the master taxonomy (Bakhtin, Husserl, Heidegger, Gadamer, Ricoeur, Peirce, Eco and others), so the owner must approve a node batch
  or accept coarse fallback tags before the first set is made.
- **Step 1 is the plan, and nothing else starts until the owner approves it.** Follow the American and Indian English precedent
  (rule 3, `quizzes/mcq`): Claude drafts the plan **from the site's own chapter articles** (every thinker, work and term named in
  a set's one-line scope must be in that article; nothing from outside; checked name by name with a script), and the owner may
  change any title, scope or level. The scope rule for Literary Theory is NET Unit IX (rule 3); Cultural Studies, Indian Poetics
  and Key Terms are other series and are not part of this unless the owner says so.
- **Questions to put to the owner when planning:** (a) does "complete section" mean the 8-part Literary Theory series only, or the
  whole Literary Criticism hub; (b) sets per part, per chapter, or a mix (the age series use "Set 1 = the whole age", then one
  group per set); (c) for the 18 chapters with no article yet, wait for the article or plan from the registry's title and
  thinkers line only; (d) which sets are **free** and which **paid**, decided in the plan, because a free set is public forever
  (rule 15); (e) levels and counts per set (the British pattern is 50 per level, easy then medium and hard); (f) whether a
  Literary Theory part needs a `period` node the way the Indian English articles did (the owner's rule there: "if there is no
  node, build it"; it was not given for theory), and which `topicId` each question takes (writer, work or concept already in the
  master).
- **Step 2, after the plan is approved (needs Claude once):** a fourth series in `_data/mcqSpec.json` with a `tradition` value,
  the series words in `_data/mcqAges.js` and `_data/freeMcqSlots.js`, a section on `/quizzes/mcq/` and its hub slugs in
  `assets/mcq.js` `SOON_HUBS`, a **Literary Theory — MCQ set** destination in `_data/paperDestinations.js` for the paid sets
  (the free ones come through `/admin/upload-mcq/` once the slots are planned), and leaving the series out of the British
  dashboard pool and the UGC NET skill zip as the American and Indian ones are (`tools/build-syllabus.js`,
  `tools/build_skill_zip.py`). After that, publishing is self-serve (rule 17, rule 25).

### Suggested order (Claude's suggestion, not a decision)
1. **7.4 plan** and **7.1** can start at once: neither is blocked.
2. **7.3** NET Paper II mock tests next: the pattern is proven, only the owner's numbers are needed.
3. **7.2** and any Paper 1 mock test come last, because they wait for the Paper 1 taxonomy nodes.
