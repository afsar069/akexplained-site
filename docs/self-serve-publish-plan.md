# Self-serve publish — plan (series 1 of 3 shipped on the branch)

> **Progress (2026-11-14):** **UP Assistant Professor Paper 2 mock tests — BUILT and tested on branch
> `claude/affectionate-brown-ahs63h`, not yet merged.** The design below is implemented exactly:
> `assets/paper-list.js` (runtime hub cards from the live catalog), `statePscMockTests.range` (pre-built
> `test-1..30` + review routes), and a `data-catalog-check` gate in `assets/cbt.js` (live → opens login-gated;
> not-live → "This test is not open yet", no login wall; read-fail → fail-open). Rules 3, 15, 16 and the new
> **rule 17** in `CLAUDE.md` record it. 27 Playwright checks pass (guest/student × live/not-live, the
> draft-hides / live-shows proof, 375px, Supabase-off fallback) + 5 regression checks on untouched series.
> **Still to do (one at a time, each its own branch + merge):** UP PGT login mock tests, then the English
> Literature login MCQ sets (decide the card-richness question with the owner — see "Per series" below).


**Owner's ask (2026-11-13 / 2026-11-14):** after the owner uploads a paper at `/admin/upload-paper/` and marks
it **Live**, it should appear on its page **with no rebuild and no Claude** — and this must work for **every
series**, not just one: UP Assistant Professor Paper 2 mock tests, UP PGT mock tests, and English Literature
login MCQ sets. The owner asked for this to be built in a **fresh session on a bigger model (Opus 5)**, one
series at a time.

Nothing here is built yet. This is the design to implement and test.

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
