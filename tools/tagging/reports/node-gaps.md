# Nodes the master does not have yet

Nothing here is added without the owner's approval (rule 11: invent no topics).
`period-fallbacks.csv` lists every question that stayed on the period or the age, with the reason and
any quoted title that has no node.

## Batch 2: added (migration 20261031120000, 9 nodes, 1,702 -> 1,711)

vorticism; war-of-the-theatres; gorboduc; thomas-norton; thomas-sackville; three-estates;
samuel-butler-hudibras; ohthere-and-wulfstan; theatrical-licensing-act-1737. Ten questions were re-tagged.
Notes for the owner:
- `ac-e-13` ("Which of these was NOT a social 'estate' in the medieval period?") is about the estates but
  never says "Three Estates", so it stays on the period. The word "estate" alone is too common to be an alias.
- `rn-h-33` (Hudibras, "composed by Samuel Butler ... during the Civil War") stays on the period: it gives
  no year and no work node, so under the same-name rule it cannot choose between the two Samuel Butlers.
  A `hudibras` work node (below) would settle it.
- The 1737 Act is the subject of two questions (au-e-41, au-e-42). The other five "Licensing Act" mentions are
  wrong options. One press act is a subject: rs-h-50 (the 1695 lapse). No node for it was added.

## Batch 3: the 21 quoted strings that recur in two or more questions (for approval in one pass)

| Quoted string | Real title or quoted term | Questions | Suggested home |
|---|---|---|---|
| Ancrene Wisse | real title | an-h-05, an-h-17, an-h-18 | work under middle-english |
| Roman de Brut | real title | an-e-03, an-h-02 | work under middle-english (no node for its author, Wace) |
| Sumer is icumen in | real title | an-e-10, an-h-47 | work under middle-english |
| Sawles Warde | real title | an-h-07, an-h-08 | work under middle-english |
| The Song of Roland | real title (Old French) | an-h-13, an-h-14 | work under world-literature |
| Ayenbite of Inwit | real title | an-h-39, an-h-40 | work under dan-michel (exists) |
| The Kingis Quair | real title | fc-e-06, fc-h-10 | work under middle-english |
| Paston Letters | real title (a collection) | fc-e-24, fc-h-17 | work under middle-english |
| Songes and Sonettes | **alias, not a node**: the original title of Tottel's Miscellany | et-e-49, et-h-33 | alias of `tottels-miscellany` (exists) |
| Holy Living | real title | cw-h-27, cw-h-28 | work under jacobean; Jeremy Taylor has no node either |
| Hudibras | real title | rs-e-42, rs-h-41 (and nc-e-08, rn-h-33) | work under samuel-butler-hudibras (new) |
| The Beaux | **cut short by the apostrophe**: the title is *The Beaux' Stratagem* | au-e-33, au-e-34 | work under augustan-age; Farquhar has no node |
| The Masque of Anarchy | real title | rm-e-37, rm-h-33 | work under percy-bysshe-shelley (exists) |
| The Ruin | real title | old-english-set-1-e-46, set-1-m-40 | work under old-english |
| The Phoenix | real title | old-english-set-1-m-09, set-2-m-29 | work under old-english |
| Andreas | real title | old-english-set-1-m-41, set-2-m-28 | work under old-english |
| Exodus | real title (the Old English poem) | old-english-set-2-e-37, set-2-m-23 | work under old-english |
| Genesis B | real title | old-english-set-2-m-21, set-2-m-22 | work under old-english |
| Christ and Satan | real title | as-h-23, old-english-set-2-e-38 | work under old-english |
| Cotton Vitellius A.xv | a manuscript shelfmark, not a title | as-h-02, as-h-47 | owner's call: an alias of `nowell-codex` (exists), or a new manuscript node. The volume holds two codices, so an alias may be too loose. |
| Middle English | **quoted term** (the language), not a title | ac-e-37, ac-e-45 | no node; the guard keeps it off the language nodes |

Attributions (author, patron or copyist) are left out of "Suggested home" on purpose where scholars differ;
the age is the safe parent. The remaining one-off quoted strings wait for the proper titles pass.

Answers that are a name or title with no node and recur (1642, The Black Death, Joan of Kent, William the
Conqueror, Harold Godwinson, Battle of Hastings, 1649 and similar) are history, not literature; they are
listed in the CSV and probably should stay on the period.
