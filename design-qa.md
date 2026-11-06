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
