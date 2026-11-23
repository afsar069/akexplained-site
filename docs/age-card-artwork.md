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

## Indian English Literature section (owner, 23 November 2026)

`/english-literature/` has a third section, "Indian English Literature"
(`#indian-english-literature`), under the American one, with the same `.age-grid` and
`.age-tile` markup. It holds one card per article so far, all supplied by the owner:

1. The introduction, `/notes/indian-english-introduction/`
   (`notes/indian-english-introduction/index.md`). Its title, era line ("All periods", the
   article's own `period` value) and three names (Mahomet, Roy, Tagore, from the article's writers
   table) come from that article.
2. **Beginnings to 1857**, `/notes/indian-english-beginnings/`
   (`notes/indian-english-beginnings/index.md`). The title is the article's `crumb_label`, the era
   line is 1794 – 1857 (the article's own working boundaries, shown in its opening) and the three
   names (Roy, Derozio, Dutt) come from its writers table.
3. **1857 to 1920**, `/notes/indian-english-early-growth/`
   (`notes/indian-english-early-growth/index.md`). The title is the article's `crumb_label`, the era
   line is 1857 – 1920 (its `period` value) and the three names (Toru Dutt, Tagore, Aurobindo) are the
   first three in the article's description.

Two more period articles follow in the series; add each one's card here in order.

**Card 1 painting.** `assets/age-cards/indian-english-painted.webp` (480 × 300, 40,816 bytes) and
`indian-english-painted-240.webp` (240 × 150, 12,112 bytes). It is an imagined early
nineteenth-century Calcutta college verandah: young students and a teacher around a low table with
English books, a globe and palm-leaf manuscripts, a hand printing press, and sailing ships on the
river. No real person is shown and no text is readable. It was made with vidIQ from a text prompt
only (the tool picked GPT Image 2.6, 2048 × 1152), centre-cropped from 16:9 to 1.6:1 (102 px off
each side) and exported to WebP.

**Card 2 painting.** `assets/age-cards/indian-english-beginnings-painted.webp` (480 × 300,
28,688 bytes) and `indian-english-beginnings-painted-240.webp` (240 × 150, 8,302 bytes). It is an
imagined young poet writing by lamplight at a desk with English poetry volumes and palm-leaf
manuscripts, with the Hooghly and a sailing ship at dusk in the window. One figure, at night, so
it differs from card 1's daytime group scene. No real person is shown and no text is readable.
Made the same way (vidIQ, GPT Image 2.6, 2048 × 1152), cropped to 1.6:1 with the window starting
150 px from the left (55 px off the right) instead of centred, because a centred crop cut off
the ship's stern.

**Card 3 painting.** `assets/age-cards/indian-english-early-growth-painted.webp` (480 × 300,
40,428 bytes) and `indian-english-early-growth-painted-240.webp` (240 × 150, 11,690 bytes). It is
an imagined late nineteenth-century Bengal garden at golden hour: two young women reading on a
bench under a tall casuarina tree with a flowering creeper (a nod to the poem *Our Casuarina
Tree*; they are not portraits of Toru Dutt or anyone else), a white colonnaded house, and the river
with a sailing boat at sunset. Outdoor and warm-lit, so it differs from card 1 (a daytime group
scene) and card 2 (one figure at night). No text is readable. Made the same way (vidIQ, GPT
Image 2.6, 2048 × 1152) and centre-cropped to 1.6:1 (102 px off each side).

The line under the section heading says the card pictures are original painted
interpretations, so they are not presented as historical images.

The "Intro" badge must stay short: the phone thumbnail is 84px wide and the first badge text,
"Introduction", overflowed it by 4px (measured at 320 to 520px). None of the three articles has a
`hero_image` yet, so all use the plain article header.

It is not in the 20 British ages or the five American ones (`ages`, `americanAges` in
`assets/home.js`, `_data/mcqSpec.json`). All three articles are in the home search and the sitemap.
The landing page now shows the Indian cards too (added 23 November 2026, see the end of this file).


## Indian English Literature: 1920 to 1947 (added 23 November 2026)

The fourth article card links to `/notes/indian-english-freedom-years/`. Its title and period come from the article front matter; its names are Anand, Narayan and Raja Rao. Its distinct original painted interpretation shows a 1930s Indian town, a writer with books, local readers and a woman working a spinning wheel. The scene depicts imagined people, not identifiable historical figures. Two responsive WebP files are `assets/age-cards/indian-english-freedom-years-painted.webp` (480 x 300) and `assets/age-cards/indian-english-freedom-years-painted-240.webp` (240 x 150). Both are under 200 KB. The article, card, search index and sitemap were added together.

## Indian English Literature: 1947 to 1980 (added 23 November 2026)

The fifth article card links to `/notes/indian-english-independence-era/`. Its names, Ezekiel, Desai and Karnad, come from the supplied article. The original painted interpretation shows an imagined 1960s Indian publishing room with writers, readers and a printing press. It portrays no identifiable person. The generated image was cropped to a 1.6:1 card and exported as `assets/age-cards/indian-english-independence-era-painted.webp` (480 x 300, 39,158 bytes) and `indian-english-independence-era-painted-240.webp` (240 x 150, 11,438 bytes). The article, card, search index and sitemap were added together.

## Indian English Literature: 1980 to 2000 (added 23 November 2026)

The sixth article card links to `/notes/indian-english-late-twentieth/`. Its names, Rushdie, Ghosh and Seth, come from the supplied article. The original generated painting depicts an imagined 1990s Indian bookshop with readers, a typewriter and a suitcase suggesting migration. It portrays no identifiable person. The responsive WebP files are `assets/age-cards/indian-english-late-twentieth-painted.webp` (480 x 300, 48,296 bytes) and `indian-english-late-twentieth-painted-240.webp` (240 x 150, 14,354 bytes). The supplied article text is unchanged. The card, homepage search and sitemap were added together.

## Indian English Literature on the landing page (owner, 23 November 2026)

`index.html` has a band "Indian English Literature by Ages" (`#indian-ages`) under the American one,
asked for "like the American one". Unlike the British and American bands, its cards are **plain HTML in
`index.html`** (not drawn by `assets/home.js`): the first version drew them from a list in `home.js`, and the
owner's screenshot of 23 November 2026 showed the band with no cards when an older `home.js` ran against the
new HTML. The same `.agecard` markup and the same card files as the timeline are used, so no artwork is
duplicated. The six cards copy the timeline's name, years, three writers, "Intro" or year badge, article
link and alt text; if a timeline card changes, change the card in `index.html` too. The introduction card's
picture is `indian-english-painted.webp` while its article is `indian-english-introduction`. The line under the heading, "Start
with the introduction, then read each period in order.", repeats what the timeline section already says.
"View complete timeline" goes to `/english-literature/#indian-english-literature`.

Layout (changed the same day, owner: "5 hi cards rakho"): the Indian band is a **slider**, not a grid. The
cards sit in one row that scrolls sideways (`#indianTrack`); five are in view from 1000px (three from 620px,
two from 560px), so the sixth card and any later one wait off to the right. A round arrow button at the right
end slides the row on by one screenful (caption "More"); when the last card is in view the same spot becomes a
link to `/english-literature/#indian-english-literature` (caption "Full timeline"), and a small back arrow
appears once the row has slid. The header link "View complete timeline" stays. On a phone (under 560px) the
band is a plain list of the first five cards with a full-width "Read the full timeline" link under it; the sixth
card is only on the timeline page there. Touch swipe, trackpad and keyboard also move the row. The track
has padding and a negative margin so the card's hover lift and shadow are not cut off. The band is on the page
background (#FDFBF5) with a 1px top line, because the American band above it is the sand tint, so the three
bands alternate. When another period article gets its card, add it to the track in `index.html` and to the
timeline section; the slider needs no other change.
