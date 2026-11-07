---
permalink: false
eleventyExcludeFromCollections: true
---

# Login page design QA

## Visual references

- Approved concept: `/workspace/generated_images/exec-a57adbcf-bf22-4b19-8b20-9b2daf906494.png` (1487 × 1058 px)
- Implemented desktop: `/workspace/scratch/login-new-user-art-desktop.png` (1440 px viewport, device scale 1)
- Implemented mobile: `/workspace/scratch/login-new-user-art-mobile.png` (390 px viewport, device scale 1)
- New lower-banner source: the user's “A World of Literature Banner” attachment, matched by `/workspace/generated_images/exec-dd3473c7-55ed-4244-9d71-79b81baaea74.png` (1819 × 865 px)
- Current desktop and mobile captures: `/workspace/scratch/login-world-banner-1440.png` and `/workspace/scratch/login-world-banner-390.png` (1440 px and 390 px viewports, device scale 1)
- Normalized source/implementation comparison: `/workspace/scratch/login-banner-qa-comparison.png` (source resized to the banner's 1168 × 555 CSS pixel region, paired with the rendered banner crop)

## Fidelity review

| Surface | Result |
| --- | --- |
| Layout | The welcome form, study illustration, and benefits retain the concept's hierarchy. The shared sidebar remains fixed on desktop and is available through the shared hamburger on mobile. A compact account header sits over the desktop content. |
| Typography | Large navy serif headings, italic supporting copy, and clear sans-serif form labels match the reference direction. |
| Color and spacing | Warm paper background, navy text, teal action, gold details, and spacious desktop/mobile gutters are consistent. |
| Imagery | The supplied English Literature Study Space picture occupies the full right column. Its benefits text is part of the picture. The new full-width lower banner includes its own heading, subtitle, six writer portraits and names; the former separate heading and old gallery are removed. |
| Responsive and behavior | Desktop uses two columns. At 900 px and below, the study illustration and writers gallery are hidden for a simple form-focused page. Existing login, signup, reset, and Google-provider flows remain wired. |

The concept's always-visible Google button is shown on the implemented page only when the site's existing Google sign-in configuration enables it.

## Checks and fixes

- Restored the shared sidebar on login and removed the login-only rule that cancelled its desktop space.
- Replaced the separately rotated dashboard overlay with screen art integrated into the illustration, then replaced that illustration with the user's preferred study-space picture.
- Reduced the intro, form, benefits, and writers-section spacing; removed the duplicate signup heading and tightened alternate auth screens.
- `npm run build` passed.
- Browser checks passed at 1440 px, 1100 px, 390 px, and 320 px: no horizontal body overflow, signup/login switching worked, and there were no page errors.
- Home-to-login navigation preserved the desktop sidebar and the mobile hamburger. Scrolling kept the desktop sidebar fixed.
- At 390 px and 320 px, both illustrations are hidden and neither image is requested by the browser. Desktop still loads both images.
- The preferred study-space picture loads at desktop width; it remains hidden and unloaded on mobile.
- Browser checks passed for empty sign-in validation, password help, and the enabled Google-provider state.
- The new banner was visually compared with the source at the same rendered size. Its typography, spacing, colors, image detail and copy match; all names remain readable. A further focused crop was unnecessary because the normalized comparison shows all text and portraits clearly. No actionable P0/P1/P2 mismatch remains.
- Current Chromium checks at 1440 px and 390 px passed: desktop loads both images, mobile loads neither, no horizontal overflow or page errors, and the desktop side menu remains visible after pressing Sign in. The built banner asset link resolves.

final result: passed

---

# NET banner verification — 7 November 2026

Scope: replace only the hero on `/exams/net/` with the owner's supplied banner.

## Evidence

- Source visual truth: the owner-attached UGC-NET English Literature banner, prepared at `/workspace/generated_images/exec-b3990451-9df5-453d-be48-59feeb45c729.png` (1915 × 821 px).
- Responsive production assets: `assets/exams/net-banner-{768,1168,1915}.webp` (768 × 329, 1168 × 501, and 1915 × 821 px).
- Full rendered page: `/workspace/net-banner-review/after-desktop.png` (1440 × 1000 px viewport, device scale factor 1).
- Mobile rendered page: `/workspace/net-banner-review/after-mobile.png` (390 × 1000 px viewport, device scale factor 1).
- Focused rendered banner: `/workspace/net-banner-review/rendered-banner.png` (1168 × 501 px).
- Combined source/implementation comparison: `/workspace/net-banner-review/banner-comparison.png`. Source above, rendered banner below; both normalized to 1168 × 501 px.
- State: guest, top of the NET page, menu closed. Local Eleventy build; external services mocked. Live-site access is blocked by the environment network policy.

## Findings

No actionable P0/P1/P2 differences within the requested banner replacement.

- Fonts/typography: the supplied image's typography stays part of the image; the original semantic H1 and description remain in HTML. They are visible on phones, accessible to screen readers on desktop, and readable in print.
- Spacing/layout: the full banner fits the available page column without cropping or stretching. At a 1440 px viewport, the previous hero was 1168 × 290 px; the new image is 1168 × 501 px (502 px section including its existing border). The height increase intentionally preserves the supplied composition. The sidebar, breadcrumb, and following sections retain their layout and content.
- Colors/tokens: the banner's ivory, navy, teal, and gold are retained. Existing site tokens are unchanged; all new rules are scoped to the NET hero.
- Image fidelity: source and rendered full-view comparison retains all edges, title, statistics, book stack, bust, notebook, and subject tiles. Focused comparison confirms no clipped text, overlays, motif, or duplicate desktop heading. WebP compression and integer resizing introduce only expected sampling differences.
- Copy/content: the owner's artwork is retained, including its embedded wording. The original HTML title/description and all content below the hero are preserved.

## Verification

- Eleventy build passes, including its topic and syllabus checks.
- Browser checks pass at widths 320, 390, 768, 1024, 1440, 1920, and 2560 px: image loads, aspect ratio stays within one pixel of the source, one H1, no injected floral motif, and no horizontal overflow.
- Mobile menu opens and closes with Escape. The supplied banner is not an interactive control.
- All 26 local links resolve to built files or configured Cloudflare redirects.
- Browser console and page errors: none.
- Print hides the raster banner and shows the original text heading.
- Unrelated PGT hero remains at its original 290 px height.
- This QA document uses `permalink: false` so it is not published as a page.

## Comparison history

First visual comparison passed. No P0/P1/P2 visual fixes were necessary. Browser-check adjustments for integer image rounding, the menu's existing Escape behavior, and Cloudflare short-link redirects did not change the implementation.

## Implementation checklist

- [x] Full banner and three optimized image sizes installed.
- [x] Desktop, mobile, accessibility, print, and links checked.
- [x] Existing page content and other exam headers preserved.

## Follow-up polish

None required for the requested scope. Live deployment has not been verified from this environment.

final result: passed

---

# NET preparation hub — 7 November 2026

## Source and implementation evidence

- Selected visual truth: `docs/net-hub/reference.png` (959 × 1639 px), generated from and selected in this chat. Original: `/workspace/generated_images/exec-a3803080-cdc2-48b4-be4c-dad9a4cdb15c.png`.
- Desktop implementation: `docs/net-hub/desktop.png` (1440 × 2799 px full-page capture; 1440 × 1000 CSS viewport, device scale factor 1).
- Mobile implementation: `docs/net-hub/mobile.png` (390 × 3769 px full-page capture; 390 × 1000 CSS viewport, device scale factor 1).
- Full-view combined comparison: `docs/net-hub/comparison.png` (1620 × 1728 px). Source main content is on the left, implementation on the right.
- Normalization: the source main-content region (x=200, width=759 px) and implementation main-content region (x=272, width=1168 CSS px) were both resized to 800 px wide, preserving their own aspect ratios. Shared navigation/sidebar differences caused by source image scaling are excluded from this comparison. The actual sidebar stays at its existing 272 CSS px width.
- Focused combined comparison: `docs/net-hub/resources-comparison.png` (1104 × 628 px), source above and implemented resource links below. This shows all resource labels, icon treatment, dividers and status copy at a readable scale.
- Related-page captures: `/workspace/net-hub-review/about-final.png`, `/workspace/net-hub-review/syllabus-final.png`, `/workspace/net-hub-review/books-final.png`; mobile examples also captured in that folder.
- State: logged-out user, default top-of-page view, menu closed. Actual Chromium-rendered Eleventy build, external services mocked; local licensed fonts fully loaded.

## Required fidelity surfaces

- **Typography:** self-hosted Literata normal/italic and Source Sans 3 follow the selected editorial serif/sans system. Heading hierarchy, italic introduction, paper labels, action titles and helper text match the visual roles. Resource titles fit on one line at the 1440 px target after the correction below; mobile wrapping is intentional and unclipped.
- **Spacing/layout:** the existing full banner leads into the large introduction, four resource rows in two columns, two paper groups, a teal mock-test band and full-width text overview. The source's grouping, generous gaps, small radii, icon/text separators and fine gold rules are retained. Below 720 px of content width the resources and paper groups stack. Mobile retains readable HTML text under the banner, as established before this redesign.
- **Colors/tokens:** warm ivory/cream, navy headings, teal actions, pale sage paper headers and muted gold rules/status text use existing site tokens. Flat CSS surfaces replace the concept image's incidental painted shading; no additional decorative illustration was introduced under the banner.
- **Image/icon fidelity:** the actual supplied banner and portrait logo are reused, uncropped and unstretched. Standard icons come from licensed Feather SVGs; the Mock Tests target-arrow comes from Tabler. Only stroke color/weight and the lightning fill were styled to match. No handcrafted SVG or CSS illustration substitutes for artwork. The icon sets and fonts carry their original licenses.
- **Copy/content:** all ten requested functions appear in the correct groups. The user's subsequent availability instruction intentionally replaces eight helper labels and the mock-test CTA with “Coming soon”. About and Syllabus have real pages; each other action opens its own honest coming-soon page. Shared quiz pages are not changed or gated. The full-width introduction has no painting. The fuller exam information and English unit guide now live on the related pages.

## Comparison history and corrections

1. First combined review: `/workspace/net-hub-review/comparison-first.png`. **[P2]** “Download Complete Syllabus” wrapped at the desktop target while the selected design kept it on one line. Result at this stage: blocked. Fix: scoped resource-title scale reduced to a maximum of 26 px, preserving the two-column layout and helper line. The mock-test icon was also refined to a library target-arrow and the lightning fill matched to the reference.
2. Post-fix Chromium captures were produced and reviewed in the final combined full-view and focused comparisons listed above. The download label now fits, the icon matches the intended motif, no labels clip, and all required status changes are visible. No actionable P0/P1/P2 difference remains.

## Functional verification

- Eleventy build passes, including its existing topic/syllabus checks.
- Hub browser checks at 320, 390, 768, 1024, 1440, 1920 and 2560 px: no horizontal overflow; all images and local fonts load; one semantic H1 per page.
- All ten hub actions were clicked through to their destination and back: two available information pages and eight resource-specific coming-soon pages.
- Related pages checked at 320, 390 and 768 px. Both Paper 2 and Paper 1 contain ten syllabus units/headings. Native details expand/collapse with Enter; the Paper 1 jump link works.
- Mobile menu opens and closes with Escape. About navigation works by keyboard. Print hides the raster hero and retains the HTML heading.
- All 36 local link paths resolve to built files or configured redirects. No local HTTP error, console error or uncaught page error was observed.
- Only the two information pages enter the sitemap; all eight coming-soon pages have `noindex,follow`.
- `docs/` and this report remain excluded from the public build. The unrelated quiz engine, question files and access rules are untouched.

## Implementation checklist

- [x] Selected design implemented as responsive, semantic HTML/CSS.
- [x] Supplied artwork, matching licensed icons and local fonts installed.
- [x] About, Syllabus and all coming-soon destinations implemented.
- [x] Desktop/mobile visual comparison and primary journeys passed.

## Follow-up polish and limitations

- P3: a generated mock does not establish an exact font file or pixel-perfect paper texture. The implementation uses the site's real Literata family and clean ivory surfaces while preserving the design's hierarchy and proportions.
- The shared footer remains the site's existing footer, outside the selected hub visual. Full-page screenshots show the fixed sidebar only within the captured viewport; this is browser screenshot behavior, not a missing sidebar during scrolling.
- Live production verification is blocked by the environment network policy. The owner approved publication of PR #9 on 7 November 2026; the visual QA above covers its tested implementation.

final result: passed

---

# NET compact layout and cropped hero — 7 November 2026

## Scope and visual targets

This follow-up supersedes the initial hub mock's oversized text and spacing. The owner supplied a new wide hero crop (approximately 2.8:1) and explicitly requested consistency with the other site pages. Resource grouping, destinations and availability remain as before.

- Crop truth: the owner's latest image attachment, inspected in this chat, and the existing source `assets/exams/net-banner-1915.webp` (1915 × 821 px). The requested crop is implemented as a responsive 14:5 display frame, without editing or stretching the image file.
- Site-scale truth: shared rules in `assets/site.css`, checked against rendered Quizzes, English Literature and PGT pages. Quizzes is the primary comparator for standard section headings and card titles.
- Before/after combined evidence: `docs/net-compact/before-after.png` (same 1440 px viewport, source before on the left and revised page on the right; both scaled uniformly to 650 px wide for comparison).
- Desktop implementation: `docs/net-compact/desktop.png` (1440 × 2032 px full-page capture, 1440 × 1000 CSS viewport, device scale factor 1).
- Mobile implementation: `docs/net-compact/mobile.png` (390 px CSS viewport, device scale factor 1, full-page capture).
- Focused hero evidence: `docs/net-compact/hero.png` (1168 px wide, approximately 417 px high). The full title, subtitle, four statistic badges and lower label line remain visible; upper foliage and lower desk artwork are intentionally trimmed to follow the owner's crop.
- Site reference capture: `/workspace/net-compact-review/quizzes-reference.png`; measured before/after values are recorded in `/workspace/net-compact-review/baseline.json` and `/workspace/net-compact-review/after-metrics.json`.

## Measured findings and fixes

| Surface at 1440 px | Before | Revised | Shared-site comparator |
| --- | --- | --- | --- |
| Intro heading | 68.448 px | 36.8 px | 36.8 px page heading |
| Section headings | 45.264 px | 27.52 px | 27.52 px H2 |
| Resource/action labels | 26 / 28 px | 16.96 px | 16.96 px card H3 |
| Helper text | 20 px | 14.72 px | 14.72 px card paragraph |
| Side padding | 32 px | 22 px | 22 px `.wrap` |
| Maximum content width | None | 1180 px | 1180 px `.wrap` |
| Hero height at 1168 px wide | 501 px | 417.14 px | Owner's approximately 2.8:1 crop |

At a 1920 px viewport, the content container is 1180 px wide and starts at x=506; its text starts at x=528, exactly matching Quizzes. At 1440 px both pages' text starts at x=294. This fixes the unusually wide content area on large screens as well as the extra inner side padding on normal desktop screens.

## Fidelity and interaction review

- **Typography:** shared title/H2/H3/helper sizes and 600-weight headings replace the large custom scale. The real Literata and Source Sans 3 families remain. Body text is 16.5 px. Related NET pages follow the shared heading scale too.
- **Layout/spacing:** 16 px grid gaps, standard card-like padding and corners, smaller icons and 84–88 px action rows restore the site's normal density. The mock button uses the shared 15.2 px size, 12 × 22 px padding and 11 px corners. Touch targets remain at least 44 px tall.
- **Colors:** existing navy, teal, cream, sage and gold are retained. Focus and hover affordances remain.
- **Imagery:** the narrower display frame uses `object-fit: cover`, with a vertical focal position selected to preserve all image lettering. Crop ratio is checked at every viewport. No raster regeneration or distortion was introduced.
- **Copy/content:** all existing hub text, ten resource destinations, two available pages and eight coming-soon states remain. The examination overview remains text-only and fills the shared content area.

## Verification and comparison history

- Initial measurement established the size and margin drift shown in the table. The requested crop and compact theme adjustments were applied, then the revised desktop, mobile, wide-screen and focused hero captures were inspected.
- Final combined before/after comparison shows the thinner hero and consistent hierarchy; no P0/P1/P2 issue remains in the requested scope.
- Eleventy build passes. Chromium checks pass at widths 320, 390, 600, 768, 1024, 1440, 1920 and 2560 px: no overflow, missing images, or browser errors; expected 14:5 crop and 22 px side padding at every size.
- Computed font sizes, container width and left content edges match Quizzes exactly at both 1440 and 1920 px. Reference Google font requests are fulfilled with the same local font files in the test so the comparison does not depend on CDN access.
- About, Syllabus and example coming-soon pages were checked at 320, 390, 1440 and 1920 px. Mobile menu opens and closes with Escape.
- No destinations or availability values were changed. The shared stylesheet and other site pages are untouched.

## Follow-up polish and limitations

None required. The owner approved publishing PR #10 on 7 November 2026. Production browsing remains constrained by the environment network policy; deployment can be checked through the Cloudflare check on the merge commit.

final result: passed
