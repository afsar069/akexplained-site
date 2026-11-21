# English Literature card artwork

The owner requested original, representative paintings for the 20 cards on
`/english-literature/` on 20 November 2026. Each age has a distinct scene, with
consistent gouache-style brushwork and a teal, gold and terracotta palette.
These are modern imagined interpretations, not historical paintings or portraits
copied from public-domain sources. The page labels them accordingly.

The timeline, landing page and MCQ Practice age cards share the same series.
The landing page and MCQ Practice cards select each painting by its age and use the same responsive
WebP variants, so no artwork is duplicated. Daily, article illustrations and article
headers retain their existing artwork. Card names, dates, writers and links are
unchanged.

## American Literature section (owner, 20 November 2026)

`/english-literature/` has a second section, "American Literature by Age"
(`#american-literature`), under the British one. It uses the same `.age-grid` and
`.age-tile` markup. Card 1 is **Colonial and Early National (1600 – 1830)**, linking to
`/notes/ages/american-colonial/` (`notes/ages/american-colonial/index.md`, written by the
owner; the three names on the card come from that article). Its painting is
`assets/age-cards/american-colonial-painted.webp` (480 × 300, 33,460 bytes) and
`american-colonial-painted-240.webp` (240 × 150, 9,322 bytes): a New England meeting house,
villagers on a dirt path and a sailing ship in the harbour. It was generated with vidIQ
(GPT Image 2.6) from a text prompt only, cropped from 16:9 to 1.6:1 and exported to WebP.
Card 2 is **American Renaissance (1830 – 1865)**, linking to
`/notes/ages/american-renaissance/` (`notes/ages/american-renaissance/index.md`, supplied by
the owner). Its original gouache-style painting shows a nineteenth-century writer's
desk beside a woodland river. The WebP copies are
`assets/age-cards/american-renaissance-painted.webp` (480 × 300, 39,836 bytes) and
`american-renaissance-painted-240.webp` (240 × 150, 9,646 bytes).
Card 3 is **Realism and Naturalism (1865 – 1914)**, linking to
`/notes/ages/american-realism/` (`notes/ages/american-realism/index.md`, supplied by
the owner). Its original painting depicts a late nineteenth-century American
street with a family, horse-drawn streetcar and factories. The WebP copies are
`assets/age-cards/american-realism-painted.webp` (480 × 300, 48,892 bytes) and
`american-realism-painted-240.webp` (240 × 150, 12,214 bytes).
Card 4 is **American Modernism (1914 – 1945)**, linking to
`/notes/ages/american-modernism/` (`notes/ages/american-modernism/index.md`, supplied by
the owner). Its original painting shows an imagined 1920s Harlem cafe with a writer
and jazz musicians. The WebP copies are
`assets/age-cards/american-modernism-painted.webp` (480 × 300, 40,970 bytes) and
`american-modernism-painted-240.webp` (240 × 150, 11,546 bytes).
Card 5 is **Postwar and Contemporary (1945 – present)**, linking to
`/notes/ages/american-contemporary/` (`notes/ages/american-contemporary/index.md`,
supplied by the owner). Its original painting shows an imagined modern public
library with readers of several generations. The WebP copies are
`assets/age-cards/american-contemporary-painted.webp` (480 × 300, 39,774 bytes) and
`american-contemporary-painted-240.webp` (240 × 150, 11,262 bytes).
The five American cards now cover the sequence through the present. The 20-age
lists in `assets/home.js` (`ages`) and `_data/mcqSpec.json` are the British ages only
and were not changed.
**Landing page (owner, 21 November 2026):** `index.html` has a section
"American Literature by Ages" (`#american-ages`) under the British one. `assets/home.js`
draws it from its own `americanAges` list (same names, years, writers, article links and
alt text as the timeline cards) with the shared `ageCardsHtml()` and the same `.agecard`
markup and the same card files, so no artwork is duplicated. At 1000px and wider the
landing grid has five columns, so the five cards fill exactly one line; the British grid
above it stays collapsed to two lines with its "+" tab. The American grid has no "+" tab
(five cards only), so on tablet (3 columns) it wraps to 3 + 2 and on a phone it stacks
like the British cards. The American band has its own background, the sand tint
`--tint` (#F4F1E6) with a 1px top border, so it reads as a separate group from the
British section above it, which stays on the page background (#FDFBF5); the Videos
section below it is back on the paper colour. Its "View complete timeline" link goes to
`/english-literature/#american-literature`. If an American card changes on the timeline,
change `americanAges` too. Each American article has its own painted header, an illustrated scene, and a
labelled modern portrait; artwork lives in `assets/articles/american-<age>/`.
On wide screens (1260px and up), the American cards use five equal columns so
they fill one row; the British cards keep their six-column layout. Smaller screens
keep the shared responsive grid.

## Files and export

- `assets/age-cards/<age>-painted.webp`: 480 × 300, 17,180–34,524 bytes.
- `assets/age-cards/<age>-painted-240.webp`: 240 × 150, 5,294–10,220 bytes.
- The page uses `srcset` and `sizes` to choose the appropriate copy, with lazy loading.
- The 20 larger copies total 487,822 bytes; the smaller copies total 152,436 bytes.
- Previously, this page's 20 images totalled 617,554 bytes.

The original paintings were generated as five four-panel sheets, then exported
as separate WebP thumbnails. Keep source sheets out of the published assets.
The Commonwealth panel was corrected to remove an anachronistic domed cathedral;
its window now shows ordinary pitched seventeenth-century rooftops.

## Subjects, in card order

1. Old English: timber mead hall, lyre and shield.
2. Anglo-Norman: stone castle and mounted traveller.
3. Chaucer: pilgrims travelling towards a cathedral.
4. Fifteenth century: early wooden printing press.
5. Renaissance: humanist study, globe and armillary sphere.
6. Early Tudor: palace courtyard, Tudor rose and lute.
7. Elizabethan: open-air playhouse.
8. Jacobean: candlelit tragedy stage, skull and theatrical mask.
9. Caroline: country garden, Cavalier hat and lute.
10. Commonwealth: plain writing desk, pamphlets and quill.
11. Neoclassical: ordered classical library courtyard, bust and laurel.
12. Restoration: indoor theatre with red curtains.
13. Augustan: coffeehouse conversation.
14. Sensibility: solitary reader in a country churchyard.
15. Romantic: wanderer above a mountain lake.
16. Victorian: London street and steam railway.
17. Edwardian: terrace, bicycle and parasol.
18. Georgian: pastoral poet beneath an apple tree.
19. Modern: fragmented city reflections and typewriter.
20. Postmodern: imagined library with interlocking staircases.
