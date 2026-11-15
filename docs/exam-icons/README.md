# Pick Your Exam icons

The five original homepage exam icons replace the old SVG artwork. Each has a matching static SVG and six-second Lottie loop, generated with `python3 tools/build-quiz-icons.py`.

- NET / JRF / SET: graduation cap with a floating cap, swinging tassel and diploma.
- PGT: an open book with a page turning from right to left and back.
- State PSC: an institution with three columns appearing in order.
- MA / BA: a study book with lines writing in sequence and a moving pencil.
- Others: a compass needle making a full 360-degree turn.

The existing exam-card artwork, titles and destinations are retained. Each pastel background now mixes in 10% of its own deeper accent, with slightly stronger artwork opacity. Full-width action labels replace the small circular arrows; their surfaces match the blue, peach, green, lilac and gold card palettes. Hover adds a further 10% accent overlay and fills the action label with that card's accent. Keyboard focus receives the same filled action treatment. Icon surfaces use warm ivory, with muted blue, rust, sage, teal and gold linework.

`assets/quiz-motion.js` now manages both homepage sections with one shared Lottie player download. Each section has its own pause/play control and viewport observer. Entering an icon or its card replays that icon; keyboard focus does the same. Reduced motion and a hidden tab pause animation. On an initial reduced-motion visit, neither the player nor the animation JSON is downloaded. The new static artwork remains available when animation assets or JavaScript fail.

## Verification

The Eleventy build passes. Local Chromium checks verify five visibly changing icons, a single player for all nine homepage animations, hover replay, independent section pause/play, keyboard focus, original destinations, no card overflow at 390/768/1024/1440 pixels, offscreen pausing, reduced motion, a failed animation JSON, and JavaScript-disabled fallback. The existing quiz rotation and ordered-tick behavior also passes regression checks. The internal-link check found no missing links.

The screenshots show the local build with external web fonts mocked, so text uses fallback fonts.

The colour/button refinement also passes local Chromium checks for five full-width action labels, distinct colour-matched hover fills, darker card overlays, four responsive widths without content overflow, and normal button-text contrast ratios of at least 4.5:1. `hover.png` shows an active card.
