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
1. **Series 3 — UP PGT login mock tests (6–60): BUILT 2026-11-15, on the branch, not merged.** Slot mode of
   `assets/paper-list.js` + pre-built login pages with `data-catalog-check`. Free Tests 1–5 untouched. See rule 17 and
   `docs/self-serve-publish-plan.md`. Same quirk still open in series 2: `assets/mcq-age.js` `catalogFlip` does not ask for
   `status = 'live'`, so the owner (admin) still sees a Draft literature set as open on the age hub; students do not.
2. **Series 4 — UGC NET mock tests and Paper 1 MCQs.** Blocked: those pages do not exist yet (`available: false` in
   `_data/netResources.json`), and the upload picker has no NET destination. The owner must first say what NET needs and whether it is free or login.

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

## 7. Android app (owner asked on 2026-11-19; PARKED: "abhi future plan me rakho")
Nothing is built. Do not start it unasked. This section keeps what was found so the next session does not repeat it.
**Facts below came from web search summaries only.** Google's own help pages (`support.google.com`) could not be opened from the
cloud session (network policy), so anything about Google Play rules must be checked on Google's page before it is relied on.

**State of the site today (checked in the repo, 2026-11-19):** no web app manifest, no service worker, no `theme-color`; the only icon is
`assets/logo.png` (120 x 120, too small: Android needs 192 and 512). Viewport meta, HTTPS, one domain, `/privacy/`, `/terms/` and account
deletion (`/account/`) are in place.

**Recommended route (Claude's advice, owner has not confirmed):**
1. **PWA first** (no Play Store, no payment problem): manifest, icons 192/512, `theme-color`, small service worker; one change in the
   chrome transform (`eleventy.config.js` `syncChrome`) puts the tags on every built page.
2. **App mode in the same repo**: CSS under `@media (display-mode: standalone)` (bottom tab bar, smaller header, bigger buttons), and
   optionally an app home route (`/app/`). **Owner decision needed first:** CLAUDE.md says the default footer stays on every public page
   (owner, 2026-11-07); a bottom bar in app mode may need the footer hidden there. Ask.
3. **Android package only after that**: a Trusted Web Activity (PWABuilder or Bubblewrap) needs `/.well-known/assetlinks.json` with the
   SHA-256 fingerprint of the owner's signing key (the fingerprint is public; the key itself never goes in the repo or chat). Check that
   Eleventy copies the dot-folder `.well-known/`. Capacitor is the next step up (push, offline); Flutter, React Native and Kotlin would be
   a rewrite of the CBT engine, dashboard and admin, and are not advised.
4. **Offline:** free question files and Daily quizzes may be cached; **paid papers must never be cached offline** (it would break the pass lock).

**Payment is the one big risk (not verified on Google's page):** search summaries say Google Play's Payments policy generally requires
Google Play Billing for digital goods and services sold in an app, and does not allow leading users from the app to another payment
method, except under India's alternative billing programme (offered next to Play Billing; users see a choice screen; fee reduced by 4
percentage points; every transaction must be reported to Google within 24 hours; refunds still need the Google API call). The All Access
pass is a digital product. Not confirmed: whether Razorpay is accepted in that programme (a Supreme Court case on "Authorised Provider"
is pending), the exact fee, and how Google treats a student who bought the pass on the website and uses it in the app. Options:
A) no pass sale in the app (risky for review), B) India alternative billing with Razorpay (new backend work), C) Play Billing only
(fee from 15%, new `passes.source`, purchase verification in an Edge Function), or skip the Play Store and ship the PWA only.
**Ask Google Play support before choosing.**

**Existing students:** passes live in `public.passes` by `user_id`, and the paid read policy checks "any running pass", so a student who
logs in to the app with the same account keeps the pass, progress and dashboard. Nobody pays again. Test Google sign-in inside the
TWA on a real phone. A Play-Billing pass would need its own `source`; Razorpay passes would stay valid beside it.

**Work size (Claude's estimate):** PWA basics about one session; app mode one to two; Android package small; Play Console forms are
the owner's (a few hours of clicking; Google's review and any required testing period are outside our control, check Google's page);
payment integration (B or C) is large, several sessions.

**What the owner supplies:** app name, a 512 x 512 logo, screenshots, descriptions (simple English, rule 1; nothing invented, rule 2),
a Google Play developer account (fee and verification: see Google's page), the signing-key fingerprint. No new connector is needed to start;
no Play Console connector was found in the registry search. Allowing `support.google.com` and `developer.android.com` in the session's
network settings would let Claude read the policy pages itself.
