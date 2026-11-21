# English Literature card artwork

The owner requested original, representative paintings for the 20 cards on
`/english-literature/` on 20 November 2026. Each age has a distinct scene, with
consistent gouache-style brushwork and a teal, gold and terracotta palette.
These are modern imagined interpretations, not historical paintings or portraits
copied from public-domain sources. The page labels them accordingly.

The timeline and landing page share the same series (owner, 20 November 2026).
The landing page selects each painting by its age slug and uses the same responsive
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
Add the next American age as one more `.age-tile` in that section, with its own scene. The
landing page and the 20-age lists in `assets/home.js` and `_data/mcqSpec.json` are the British
ages only and were not changed. The article has no painted header yet (`hero_image`), and no
body illustrations.

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
