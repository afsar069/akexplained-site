# Homepage practice cards

The homepage practice cards use ivory, teal, sage, gold and muted blue from the site's palette. Each card remains one native link; its button treatment is a visual label within that link.

## Motion assets

- Four original vector animations in `assets/animations/quiz-*.json`: target, checklist, past paper with clock, and test timer.
- Run `python3 tools/build-quiz-icons.py` to rebuild those JSON files.
- SVG Lottie Light 5.13.0 is self-hosted in `assets/vendor/`, with its MIT license alongside it. The player and four JSON files download only near this section. No production npm dependency or third-party animation service is required.
- Each six-second loop contains a short movement and a long rest. Hover or keyboard focus replays the icon.
- Pause/Play controls the loops. Icons pause outside the viewport or in a hidden tab. Reduced-motion users see static SVGs and skip the animation downloads on first visit.
- If the player or an individual JSON file fails, the original SVG icon remains visible and the link works.

## Verification

Eleventy build and internal link checks pass. Local Chromium tests with external services mocked verified four rendered, advancing animations; pause/play; keyboard focus; hover styling; original link destinations; offscreen pausing; live and initial reduced-motion preferences; blocked player fallback; and JavaScript-disabled fallback. Card bounds were checked at 390, 768, 1024 and 1440 pixels without overflow.

The desktop and mobile screenshots here show the local build. External web fonts were mocked during capture; screenshots use fallback fonts.
