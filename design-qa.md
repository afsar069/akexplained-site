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
