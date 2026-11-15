# Homepage practice cards

The homepage practice cards use ivory, teal, sage, gold and muted blue from the site's palette. Each card remains one native link; its button treatment is a visual label within that link.

## Motion assets

- Four original vector animations in `assets/animations/quiz-*.json`: a target with a revolving arrow, checklist with sequential ticks and a clock, past paper with sequential ticks and a clock, and test timer with a completion tick.
- Run `python3 tools/build-quiz-icons.py` to rebuild the quiz JSON files and the five exam icons and their matching static SVGs.
- SVG Lottie Light 5.13.0 is self-hosted in `assets/vendor/`, with its MIT license alongside it. One shared player downloads near either homepage section; each section loads its own JSON files only when nearby. The two sections have independent pause/play controls. No production npm dependency or third-party animation service is required.
- Each six-second loop includes a complete 360-degree rotation over four seconds, then a two-second rest. Checklist and past-paper ticks draw one at a time. The test completion tick draws after the timer's full turn. Entering either the card or the icon with the pointer, or focusing the card with the keyboard, replays from the beginning.
- The dynamic JSON URLs carry an animation revision in `quiz-motion.js`; change that revision when the JSON changes so returning visitors receive the updated artwork.
- Pause/Play controls the loops. Icons pause outside the viewport or in a hidden tab. Reduced-motion users see static SVGs and skip the animation downloads on first visit.
- If the player or an individual JSON file fails, the original SVG icon remains visible and the link works.

## Verification

Eleventy build and internal link checks pass. Local Chromium tests with external services mocked verified four rendered, advancing animations; pause/play; keyboard focus; hover styling; original link destinations; offscreen pausing; live and initial reduced-motion preferences; blocked player fallback; and JavaScript-disabled fallback. Card bounds were checked at 390, 768, 1024 and 1440 pixels without overflow.

The desktop and mobile screenshots here show the local build. External web fonts were mocked during capture; screenshots use fallback fonts.
