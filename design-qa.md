# PGT exam hub and NET hero — design QA

final result: passed

## UP PGT Mock Tests index — 2026-11-08

- The approved UP PGT MCQ day page is the visual reference. The Mock Tests page uses the same responsive header art, typography, 60-card hierarchy, six native expandable groups, shared footer and content insets; only the practice labels and stopwatch icons change. Final captures: `docs/up-pgt-mock-tests/390.png` and `1440.png`, with a phone comparison beside the existing MCQ page in `comparison.png`.
- Every card reads Mock Test 01–60 and Coming soon. Each opens a distinct noindex placeholder page without invented questions or test details. The Mock Tests resource card links to the new index. A screenshot pixel comparison found the MCQ page unchanged after sharing its styles with Mock Tests.
- Chromium checks at 320, 390, 768, 1024 and 1440px found 60 test links, six groups, a loaded header image, the default footer, no horizontal overflow and no page errors. Opening the last group exposed Test 60; its route, noindex marker and footer work. Test 1 also opens its placeholder. Results: `docs/up-pgt-mock-tests/checks.json`. No actionable visual issues remain; final result: passed.

## UP PGT MCQ day index — 2026-11-08

- Approved visual proposal: `docs/up-pgt-mcq-days/reference.png`; final local browser captures: `1440.png` and `390.png`; side-by-side composition check: `comparison.png`. The quiz press artwork is a separate optimized WebP image, while the `UP PGT` and `English MCQs` heading remains selectable HTML. The hero keeps the existing compact UP PGT subpage height, site fonts, sidebar, content insets and shared footer.
- The MCQ resource card opens six native expandable groups covering Days 01–60. The owner clarified that topics are chosen only when questions are uploaded, so all day cards now say Coming soon. The sample Elizabethan Age label and Day 1 highlight in the visual proposal are deliberately absent. All day links have individual noindex Coming soon routes, ready for later question sets.
- Chromium checks at 320, 390, 768, 1024 and 1440px found 60 day links, six groups, a loaded hero image, the default footer, no horizontal overflow and no page errors. Opening the last group exposes Day 60; its route, noindex marker and footer work. Day 1 and Day 60 both show the pending topic and MCQ message. Measurements and results: `docs/up-pgt-mcq-days/checks.json`. No actionable visual issues remain; final result: passed.

## UP PGT type and spacing correction — 2026-11-07

- Captured the published UP PGT page and the PGT and NET hubs in the current browser run at 390px and 1440px. The hero heading and shared content insets already agreed. The four resource titles, helpers and icons were too large compared with both hubs; see `docs/up-pgt-card-scale/before-metrics.json` and `comparison.md`.
- Aligned resource typography, icon width, card dimensions and featured phone title with the PGT hub. Rebuilt and recaptured at 320, 390, 768, 1024 and 1440px. Opened `docs/up-pgt-card-scale/side-by-side.png` to compare the final desktop page against the current PGT hub at the same viewport. `checks.json`, `up-390.png` and `up-1440.png` show the final result, with no overflow or browser errors. final result: passed.

## UP PGT resource cards — 2026-11-07

- Selected visual source: `docs/up-pgt-cards/reference.png`; implementation capture: `docs/up-pgt-cards/1440.png`; side-by-side evidence: `docs/up-pgt-cards/comparison.png`. The source image is a visual proposal rather than a pixel-spec screenshot, so the approved existing faded hero and shared site chrome are authoritative.
- The final desktop view has the full-width teal course card above four cream cards in a two-column grid, matching the proposed hierarchy, palette and icon placement. The first comparison exposed navy course-title text and black resource icons; both were corrected and recaptured. The final image retains small Coming soon labels so unfinished resources are described truthfully, plus a link to the preserved study guide.
- Browser captures at 390px and 1440px show the final responsive layout and shared footer. No actionable P0/P1/P2 visual differences remain; final result: passed.

## UP PGT detail header — 2026-11-07

- Reference: the PGT hub's existing illustration and live text overlay. The detail page uses that same art with a 58% image opacity and a shorter desktop hero so the breadcrumb and back link clearly mark it as a subpage. The four study sections and shared footer remain below.
- Captures: `docs/up-pgt-hero/390.png` and `1440.png`; measurements and checks: `checks.json`. At 320, 390, 768, 1024 and 1440px, text stays within the hero, the image loads, and there are no page errors or horizontal overflow. The back link returns to `/exams/pgt/`.
- Build and 7,556 internal reference checks pass. No actionable visual issues remain; final result: passed.

## NET hero reuse — 2026-11-07

- Visual source: the released PGT header, `docs/pgt-hub/desktop.png` and `mobile-top.png`. NET browser captures at the same 1440px desktop and 390px phone widths are `docs/net-pgt-hero/net-1440.png` and `net-390.png`.
- The illustration asset, image alignment, hero height, left text column, typography scale and phone overlay follow the PGT header. NET-specific heading and description replace the PGT copy; the longer NET title uses two lines. The rest of the NET hub keeps its existing layout.
- At 320, 390, 768, 1024 and 1440px the hero copy stays inside the illustration. Browser checks found no horizontal overflow or console errors, and the shared footer is present. NET About, back navigation and syllabus links open their expected routes. Eleventy build and internal link checks passed. No actionable visual issues remain; final result: passed.

## Reference and evidence

- Selected source: `docs/pgt-hub/reference.png`, approved revised Image Gen result `exec-5e53ea29-d701-4116-8e46-3d4dca4f792d.png`.
- Source raster: 1036 × 1518 pixels; CSS viewport and density are not encoded. The existing site's 272px sidebar, 1180px maximum width, 22px insets and normal typography remain authoritative.
- Browser implementation: `/exams/pgt/`, `docs/pgt-hub/desktop.png`, 1440 × 1705 full-page pixels, 1440 × 1000 CSS viewport, deviceScaleFactor 1.
- Full comparison: `docs/pgt-hub/comparison.png`; source left, implementation right, each uniformly resized to 620px width without stretching. This compares composition, not pixel equality across unknown source density.
- Focused comparison: `controls-comparison.png`, the primary action, state heading and first card row from both artifacts together; browser region in `controls.png`.
- Additional rendered evidence: `mobile.png` (390 × 1000 CSS viewport), `tablet.png` (1024 × 1000), `mobile-menu.png` (390 × 844), `up-pgt.png` and `up-pgt-mobile.png`.
- State: English, light theme, guest, exams menu expanded; drawer closed except in the labelled menu capture. Supabase config mocked to an empty configuration, no live account used.

## Findings and comparison history

1. **Initial: blocked — P1 grid width, P2 spacing.** `desktop-initial.png` and `comparison-initial.png` showed shared list max-width constraining the grid to roughly 607px instead of the available 1124px. Shared section padding/list margins also inflated gaps. Fixed scoped grid max-width, section padding and card margins. The final `desktop.png` shows both grids aligned with the full-width UP action.
2. **Responsive: blocked — P2 hero text clearance.** At 1024px the long title/description approached the illustrated books. Intermediate-width copy now uses half the content width and a 32ch description. Final `tablet.png` shows a natural title wrap and clear text on blank paper.
3. **Polish:** kept `(Grade 1)` together at narrow widths. Responsive screenshots initially caught the shared sidebar mid-transition; final screenshots wait for its 300ms transition to settle. Final `mobile.png` and `tablet.png` show the correct stable state.
4. **Content:** removed implementation-history wording from the UP page. Its older general study guidance is clearly distinguished from an official UP PGT syllabus. No cross-board weightage/eligibility rule is presented as an official UP fact.
5. **Final: passed.** Reopened the full and focused combined comparisons and the final desktop, mobile and narrow-desktop captures. No actionable P0/P1/P2 findings remain within the approved structure and existing site constraints.

## Required fidelity surfaces

- **Fonts:** self-hosted Literata and Source Sans 3 loaded in-browser. Hero 36.8px, section headings 27.52px, card headings 16.96px, metadata/status 14.72px on desktop. These intentionally retain the site's normal scale rather than the generated raster's exaggerated relative sizes. No clipping; longer names wrap; Grade 1 stays together.
- **Spacing/layout:** one full-width active UP action; ten state cards in five desktop rows; three central cards in one desktop row. Consistent 22px outer insets, 16px grid gaps, icon dividers and 8px card radii. Mobile uses one column and a two-row primary action. Existing sidebar dimensions/styles retained.
- **Colors:** ivory/cream, navy `#16304A`, teal `#0F766E`, muted gold borders and dark gold status text. White primary text; no disabled-opacity readability loss, fabricated metrics or new decorative gradients.
- **Assets:** separate generated teacher/books/botanical hero based on the approved mock, with live HTML heading text. Responsive WebP variants: 1200px/54KB and 1800px/104KB. Real existing logo; licensed Feather and Tabler icons. No custom SVG/CSS illustration substitutes. Tabler building-bank is a library approximation of the source's school symbol.
- **Copy:** all 14 destinations occur once. UP PGT is the only main content link; all other 13 destinations say Coming soon and are non-interactive list items. English only, no Devanagari. No extra hub sections. Seven literature areas and preparation method remain on the UP detail page; outdated UPSESSB and unsupported cross-board weighting claims are not copied as UP facts.

## Verification

- `npm run build` passed: 105 pages; topic gate checked 46 files against 1711 topic IDs.
- Chromium/Playwright: widths 320, 390, 768, 1024, 1440 and 1920; no document/card horizontal overflow, missing images or unloaded local fonts.
- Enter on the visibly focused primary link opens UP PGT; back link returns to the hub. Parent PGT menu selection remains correct.
- Mobile menu opens; Escape closes it and resets aria-expanded. UP table scrolls within its own container on mobile.
- 62 local link/asset references resolved against output or existing redirect rules. Zero local HTTP, page or console errors with Supabase mocked.
- Semantic headings/lists, decorative empty-alt images, skip link, existing labelled mobile controls, large primary tap target and reduced-motion override for new transitions checked.
- Machine-readable results: `docs/pgt-hub/checks.json`.

## Follow-up polish and limits

- P3: regenerated illustration and institutional library icon are not identical source pixels. Typography/sidebar dimensions intentionally follow the existing site. No mobile mock was supplied; the responsive arrangement was designed and browser-checked.
- Live-domain capture is unavailable under this environment's network policy. These are local browser captures, not a claim of production publication. No backend/account behavior changed.

## Phone hero revision — 2026-11-07

- The owner approved desktop without changes and requested smaller phone text over the left side of the illustration, replacing the earlier stacked mobile adaptation.
- Changed only hero rules within max-width 760px. The illustration stays behind live HTML text, at a 2.8:1 proportion, with a 55%-wide left text column.
- Compared `docs/pgt-hub/mobile-hero-comparison.png`: before left and revised right at the same 390px width, opened together. Final detail: `mobile-hero.png`; page context: `mobile-top.png` and refreshed `mobile.png`.
- At 320, 360, 390, 430, 600 and 760px, the text stays within the illustration and left of 60% of its width, with no horizontal overflow. At 390px the hero is 140.28px high and the heading is 15.21px. Small hero typography is the owner's explicit preference; other controls retain their sizes.
- A fresh 1440px desktop screenshot is identical in decoded pixels to the approved pre-edit capture. The original six-width navigation/link/font/image checks and Eleventy build passed again. Results: `checks.json` and `mobile-hero-checks.json`.
- No actionable P0/P1/P2 findings remain. final result: passed.

## Default footer correction — 2026-11-07

- The owner clarified that every page must keep the default site footer; this instruction supersedes the initial mock's compact custom footer.
- Authoritative footer source: `_includes/base.njk`. Both PGT output files now contain its exact shared footer markup, supplied by `syncChrome`. Removed custom footer CSS.
- Opened and inspected the browser captures `docs/pgt-footer/desktop.png` (1440px browser viewport, 1168px footer region) and `mobile.png` (390px viewport). Branding, Study/Explore/More, social links and Privacy/Terms are present in the standard layout.
- Both PGT routes passed at 390px and 1440px: one default footer, 24 links, valid local destinations, no overflow or console errors. Pixel comparison confirms the desktop above the footer is unchanged. Results: `docs/pgt-footer/checks.json`.
- `npm run build` passed. No actionable P0/P1/P2 findings remain; final result: passed.

## Implementation checklist

- [x] Approved hero, active UP button and all 13 Coming soon cards.
- [x] Existing study information on the new UP route.
- [x] Layout fixes recaptured and compared together with the source.
- [x] Build, navigation, mobile, keyboard and local links checked.
- [x] Owner explicitly authorized merging PR #13 and publishing, on 2026-11-07 (`CLAUDE.md`, rule 5).
