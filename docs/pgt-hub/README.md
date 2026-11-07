# PGT exam hub

The owner selected `reference.png` on 2026-11-07, approved the desktop and phone refinement, and explicitly authorized merging PR #13 to publish this implementation through Cloudflare Pages.

## Scope and files

- `/exams/pgt/`: approved illustrated header, active full-width UP PGT action, ten state Coming soon cards, three central Coming soon cards. No extra content sections.
- `/exams/pgt/up-pgt/`: English reading, literature and preparation guidance from the former PGT article, clearly distinguished from an official UP-specific syllabus. The owner supplied UPESSC and the exam labels. No eligibility figures, paper weights, dates or marks were invented.
- State labels/grouping, including HTET PGT and the combined OAVS/SSB Odisha card, follow the owner's list. Verify exam-specific rules when opening future destinations.
- Only UP PGT is interactive; Coming soon cards have no fake link or empty child page.
- Templates: `exams/pgt/index.njk`, `exams/pgt/up-pgt/index.njk`, `_includes/pgt-layout.njk`, `_includes/pgt-exam-card.njk`.
- Data/style: `_data/pgtExams.json`, `assets/pgt.css`. Fonts reuse `assets/fonts/net/` and its OFL licenses.

## Assets

- Hero: Image Gen teacher/books/botanical illustration based on the approved mock, generated at 2103 × 748px. WebP variants: `assets/exams/pgt-hero-{1200,1800}.webp`. Heading and UI text remain live HTML.
- Logo: existing `assets/logo.png`.
- Icons: existing Feather book-open/layers/arrows; new MIT-licensed Tabler 3.31.0 school (graduation cap) and building-bank. Existing `assets/icons/tabler/LICENSE.txt` retained; color/weight adapted to match existing icons. Source: `https://cdn.jsdelivr.net/npm/@tabler/icons@3.31.0/icons/outline/`.

## Review evidence

Primary artifacts: `reference.png`, `desktop.png`, `mobile.png`, `tablet.png`, `up-pgt.png`, `up-pgt-mobile.png`. Combined comparisons: `comparison.png`, `controls-comparison.png`. Initial captures document the width/spacing fixes. Current root `design-qa.md` contains the complete findings/history.

`checks.json` records six screen widths, font/image/overflow checks, keyboard/menu flow, console results and 62 resolved local references. `npm run build` passed. Chromium/Playwright ran against `_site` served on port 4173 with Supabase configuration mocked. These captures do not claim the changes are live.

## Approved phone refinement

The owner approved desktop unchanged and requested text over the left side of the phone hero image, accepting smaller type. Only max-width 760px hero CSS changed. `mobile-hero-comparison.png` shows the old stacked layout beside the overlay at 390px; `mobile-top.png` shows the page context. `mobile-hero-checks.json` verifies containment at six widths and confirms a fresh desktop screenshot is pixel-identical to the approved pre-edit capture.
