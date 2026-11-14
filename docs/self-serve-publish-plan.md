# Self-serve publish — status + roadmap

> **Status (2026-11-14): 2 series live, 2 planned for later. Rulebook: `CLAUDE.md` rule 17 + rule 3.**
>
> **DONE — live on akexplained.com:**
> - **Series 1 — UP Assistant Professor Paper 2 mock tests: SHIPPED (merged, PR #75).**
>   `assets/paper-list.js` (runtime hub cards from the live catalog), `statePscMockTests.range` (pre-built
>   `test-1..30` + review routes), `data-catalog-check` gate in `assets/cbt.js`. 27 + 5 Playwright checks passed.
> - **Series 2 — English Literature login MCQ sets: SHIPPED (merged, PR #76).** Owner chose the **"flip planned
>   sets live"** approach (no `paper_catalog` metadata column, no upload-page change): a planned slot (live-login
>   or Coming-soon) flips live from the catalog at view time. `_data/mcqPendingSets.js` + `set-pending-test.njk`
>   / `set-pending-review.njk` (pre-built gated+catalog-checked pages for not-yet-live slots), `data-catalog-check`
>   on the live-login set/review pages, `data-catalog-set` on login/pending hub rows, `catalogFlip`/`flipOn`/
>   `flipOff` in `assets/mcq-age.js`. Free sets untouched. 28 Playwright checks + series-1 + regression all green.
>
> **TO BUILD LATER (owner, 2026-11-14 — "baad baad me build karenge"): see "Roadmap" at the bottom.**
> - **Series 3 — UP PGT login mock tests** (same pattern as series 1).
> - **Series 4 — UGC NET** (new owner ask, 2026-11-14): NET's English Literature MCQs already ride on series 2
>   (that resource points at `/quizzes/mcq/`); NET's **own** mock tests / Paper 1 need their pages built first.
>
> **Decision made (2026-11-14):** the richer card is delivered by keeping the set's existing registry card and
> flipping it live — so no `paper_catalog` metadata column and no upload-page change were needed. The
> metadata-column idea (option (a) below) is only for a set never planned in the registry; deferred.
>
> **Known gap (carry into every future series that uses the registry for the dashboard):** a login set published
> self-serve to a Coming-soon slot is playable immediately but is **not counted in the dashboard age pool**
> (rule 10, `tools/build-syllabus.js`) until the registry is edited to mark it live + a rebuild. Only the pool
> denominator lags; the set and its scores work. Closing this would need the pool to also read the live catalog
> (or a periodic registry sync). Not a blocker; decide with the owner if it should be closed.


**Owner's ask (2026-11-13 / 2026-11-14):** after the owner uploads a paper at `/admin/upload-paper/` and marks
it **Live**, it should appear on its page **with no rebuild and no Claude** — and this must work for **every
series**, not just one: UP Assistant Professor Paper 2 mock tests, UP PGT mock tests, and English Literature
login MCQ sets. The owner asked for this to be built in a **fresh session on a bigger model (Opus 5)**, one
series at a time.

> **Note (2026-11-14):** the design below was the original brief. Series 1 and 2 are now **built and live**
> (see the Status block above and the **Roadmap** at the bottom for what remains). The rest of this section is
> kept as the background design and the per-series notes.

## Why it needs a change
The site is static (Cloudflare Pages builds it from the GitHub repo). A button in the browser cannot rebuild
the site, and the owner chose **no service key and no Edge Function**, so the browser also cannot commit to the
repo. Today a new paper only appears after `tools/sync_catalog.py` + `npx eleventy` + merge to `main` (what
Claude does by hand). The only way to make a live paper appear instantly is to **render the paper lists in the
browser at view time** from the live database.

This is possible safely because `public.paper_catalog` already has a **public read policy for `status = 'live'`
rows** (a guest can read the live catalog; drafts stay hidden). The questions themselves are already read at
runtime by `assets/cbt.js` (`gatedPaper()`), login-gated.

**This changes CLAUDE.md rule 3's "hub pages stay static; nothing is fetched from Supabase when a page is
viewed."** The owner has approved that change *for the paper-list pages*. Update rule 3 and rule 15/16 when it
ships. No new data is collected (the catalog is already public for live rows), so `/privacy/` needs no change.

## The design (general, all series)
1. **A shared browser helper** (e.g. `assets/paper-list.js`) that reads `paper_catalog` live rows for a filter
   and renders the cards, reusing the existing guest-lock / Start swap (`data-guest-only` + `data-auth-only`,
   driven by `auth.js`) so a guest sees the padlock and a logged-in student sees Start. Filters:
   - UP AP Paper 2 mock tests: `exam_id = 'state-psc' AND kind = 'mock-test'`, ordered by `number`.
   - UP PGT mock tests (login ones): `exam_id = 'pgt' AND kind = 'mock-test'`.
   - English Literature login MCQ sets of an age: `set_id like '<age>-set-%' AND kind = 'mcq-set'`.
   It must wait for `window.akAuth` (like `cbt.js`), read with the publishable key, and fail quietly to the
   static fallback if the DB is unreachable.

2. **Routes must already exist** — a static host 404s on an unbuilt path. Pre-build a fixed range of routes per
   series (e.g. UP AP `test-1..30` + `review-1..30`; UP PGT already builds `test-1..60`). Each test route is the
   normal CBT page but it **checks the catalog at view time**: if its `set_id` is a live row → show the test
   (`gatedPaper`, exactly as now); if not → a plain "This test is not open yet" screen (no login wall for a set
   that does not exist). Raising the range later is a one-line change. (A single `?n=` dynamic route is the
   alternative but it breaks the clean `/test-5/` URLs — prefer pre-built routes.)

3. **Hub cards** render from the catalog at runtime. Keep a small **static fallback** (the papers known at
   build time) in the HTML so no-JS and search engines still see a list; JS replaces/extends it with the live
   list. The login-gated test pages need no SEO, so runtime-only is fine there.

## Per series, concretely
- **UP AP Paper 2** (`exams/state-psc/up-assistant-professor/paper-2-mock-tests/`): today `test.njk` /
  `review.njk` paginate over `_data/statePscMockTests.js` (only live catalog rows, at build). Change them to
  paginate over a fixed range (1..N). Give `index.njk` a runtime card list. Give `_includes/state-psc-cbt.njk`
  a runtime catalog check → "not open yet" when the set is not live. This series is **already catalog-backed**,
  so it is the easiest — do it first and prove the whole idea on it.
- **UP PGT** (`exams/pgt/up-pgt/mock-tests/`): keep the free Tests 1–5 (file-based) and the Coming-soon
  11–60 as they are; the **login** cards (6–10 and any new) come from the catalog at runtime. The login test
  routes check the catalog. `_data/pgtMockTests.js` stays for the free/coming-soon structure.
- **English Literature login MCQ sets** (`quizzes/mcq/<age>/`): the age hub is generated from
  `_data/mcqSpec.json` and its cards are rich (lede, topics) — richer than `paper_catalog` carries today. Two
  options: (a) add a small `meta jsonb` (or `lede` / `topic`) column to `paper_catalog` that the upload page
  fills, so literature cards read well; or (b) show a simple card (title + count). **Recommend (a)** — a tiny
  migration — so literature sets publish self-serve with a proper card. Decide with the owner.

## Keep working / test
Keep the gated test flow, the login lock swap, the "Questions and time" chooser, resume, result and review all
working. Browser-test each with Playwright + mocked Supabase: guest vs logged-in; a live set (shows/opens) vs a
not-yet-live set (coming-soon, no login wall); phone (375) and desktop width. **Prove the point:** a newly
added live `paper_catalog` row shows a card with no rebuild, and flipping it to draft on `/admin/papers/` hides
the card at once. The admin "All papers" Live/Draft toggle then becomes a real publish/unpublish button.

## Rollout
One series at a time, each tested and merged on its own, so a bug can never take down every mock-test page at
once. Start with UP AP (the active series). Update rule 3, rule 15/16 and this file as each ships.

## Where things stand when this plan was written (2026-11-14)
- The **mistake-proof upload** (the Where-does-it-go picker that builds the id) is on branch
  `claude/upload-paper-tool` and about to merge; `_data/paperDestinations.js` drives it.
- Paper pages are still static (built from `_data/paperCatalog.json` by `tools/sync_catalog.py`). The UP AP
  Paper 2 mock tests are the only series built straight from the catalog (`_data/statePscMockTests.js`).
- `paper_catalog` columns: `set_id, title, exam_id, kind, number, question_count, status`. Public read for
  `status = 'live'`; admins read all.

---

## Roadmap — future series to build later (owner, 2026-11-14: build these in a later session)

Both follow the **same two proven patterns** already live:
- **Mock-test pattern** (series 1): `assets/paper-list.js` runtime hub cards + a pre-built fixed route range +
  `data-catalog-check` in `cbt.js`. Use when the cards only show title + question count.
- **Flip-planned-slots pattern** (series 2): registry plans the slots; pre-built pending pages + hub flip in
  `assets/mcq-age.js`. Use when the cards are rich (lede, topics) and already planned per-item.

Do each on its own branch, test with Playwright + mocked Supabase (guest vs student, live vs not-live, 375px +
desktop, prove live-shows / draft-hides, and a regression pass on the already-live series), and merge on its own
(rule 5). Reuse the scratch test harness shape from series 1/2 (static server of `_site`, route-mock
`**<ref>.supabase.co/**`, seed `sb-<ref>-auth-token` for a logged-in student). Update rules 3/15/16/17 and this
file as each ships.

### Series 3 — UP PGT login mock tests
- **Scope:** the **login** mock tests at `/exams/pgt/up-pgt/mock-tests/` (today Tests 6–10 are login). Keep the
  **free** Tests 1–5 (file-based) and the **Coming-soon** 11–60 exactly as they are — do not touch them.
- **Pattern:** the **mock-test pattern** (series 1). The UP PGT cards are title + question count, so no metadata
  is needed. Catalog filter: `exam_id = 'pgt' AND kind = 'mock-test'` (prefix guard `up-pgt-mock-test-`).
- **Parts to build:**
  1. Give the login section of the hub (`exams/pgt/up-pgt/mock-tests/index.njk`, driven by `_data/pgtMockTests.js`)
     a `data-paper-list` grid for the login tests, with `assets/paper-list.js` and a static fallback. The free
     1–5 and Coming-soon 11–60 blocks stay static as they are.
  2. Pre-build the login test routes for a fixed range and add `data-catalog-check` to them. The UP PGT test
     pages use `_includes/up-pgt-cbt.njk`; today the routes come from `_data/pgtMockTests.js`. Add a `range`
     there (like `statePscMockTests.range`) for the login band, and add `data-catalog-check="{{ sid }}"` to
     `up-pgt-cbt.njk` (mirror `state-psc-cbt.njk`).
  3. Keep the sitemap listing only the live login tests.
- **Watch out:** UP PGT mixes free + login + coming-soon on one hub; keep each band isolated so only the login
  band becomes catalog-driven. `up-pgt-mock-test-N` ids already exist in `paper_catalog` (Tests 6–10 live).

### Series 4 — UGC NET (new ask, 2026-11-14)
- **Already covered:** NET's **"English Literature MCQs"** resource (`_data/netResources.json`) points at
  `/quizzes/mcq/`, which is series 2 — so NET's literature MCQ practice is **already self-serve**. Nothing to do
  there.
- **Not built yet (blockers):** NET's **own Mock Tests** and **Paper 1 MCQs** are `available: false` in
  `_data/netResources.json` ("will be added here"). There are **no NET mock-test / Paper 1 pages** in the repo
  yet (`exams/net/` has only `index.njk`, `about/`, `syllabus/`, `coming-soon.njk`), and **no NET destination**
  in `_data/paperDestinations.js` (the upload picker offers only UP AP Paper 2, UP PGT, English Literature MCQ
  set). So NET self-serve is **blocked on content pages being built first**.
- **Order to build NET self-serve (later):**
  1. Decide with the owner what NET needs: NET **mock tests** (CBT papers, like UP PGT) and/or NET **Paper 1
     MCQ sets**, and whether they are free or login.
  2. Build the NET hub + test/set pages (open the `available:false` resources), and add a NET **exams** row +
     a NET **destination** in `_data/paperDestinations.js` so uploads can target it (its hub page must exist, or
     the destination build-guard stops the build).
  3. Apply the matching self-serve pattern: mock-test pattern for NET mock tests (filter `exam_id = '<net>' AND
     kind = 'mock-test'`); flip-planned-slots pattern if NET MCQs are per-age registry sets like literature.
  4. Test + merge on its own branch, update the rules + this file.
- **Note:** the UGC NET MCQ generator skill (`tools/ugc-net-mcq-skill/`) already emits site-format question
  files; those currently publish as English Literature MCQ sets (per age), which are already self-serve. A
  NET-specific destination is only needed if the owner wants NET papers separate from the per-age literature sets.
