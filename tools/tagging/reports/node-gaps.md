# Nodes the master does not have yet: one batch for the next migration

Nothing here is added. The owner decides which of these become nodes (rule 11: invent no topics).
The full list of questions that stayed on the period, with the reason and any quoted title that has
no node, is `period-fallbacks.csv` (507 rows: 406 Daily, 23 overlap, 78 MCQ on the age fallback).

## 1. Named by the owner

| Proposed node | Kind | Questions it would catch | Found in |
|---|---|---|---|
| `vorticism` (BLAST) | concept (Modern) | 4 mention Vorticism or BLAST | ed-h-01, ed-h-38, ed-h-39, gr-h-26 |
| `war-of-the-theatres` (the Poetomachia) | concept (Jacobean drama) | 2 | el-h-32, el-h-35 |
| `theatrical-licensing-act-1737` | concept, owner's call | 7 questions mention a "Licensing Act", but some are the 1662 or 1695 press-licensing acts, so check each before counting | au-e-41, au-e-42, au-h-21, au-h-49, rs-e-04, rs-h-34, rs-h-50 |

## 2. Found while tagging

| Gap | Questions | Note |
|---|---|---|
| `gorboduc`, Thomas Norton, Thomas Sackville | el-e-35, rn-e-48 | el-e-35 is tagged `elizabethan` (the owner's ruling) until these exist. The tree has only Charles Sackville (Restoration) and Vita Sackville-West. |
| Hudibras and its author Samuel Butler (17th century) | rs-e-42, rs-h-41, rn-h-33 and 4 more mention Hudibras | The id `samuel-butler` is already the Victorian Samuel Butler (Erewhon). A new node needs a different id. The matcher now refuses the Victorian one for a Restoration question, so these stay on the period. |
| Wulfstan the voyager (Orosius, with Ohthere) | old-english-set-3-m-04 | The tree's `wulfstan` is the Archbishop. One name, two people; this question is tagged `king-alfred` by its set key. |

## 3. Quoted titles with no node (the separate titles pass)

143 distinct quoted strings sit in questions that stayed on the period. They are not all titles
("Middle English", "Peasants" and "Three Estates" are quoted terms), so each needs a look. Those
that appear in two or more questions would pay for themselves first:

Ancrene Wisse (3); Roman de Brut, Sumer is icumen in, Sawles Warde, The Song of Roland, Ayenbite of Inwit,
Cotton Vitellius A.xv, Christ and Satan, The Beaux (the Beaux' Stratagem is meant, check), Holy Living,
Songes and Sonettes, The Kingis Quair, Paston Letters, Hudibras, The Masque of Anarchy, The Ruin,
The Phoenix, Andreas, Exodus, Genesis B (2 each). The rest appear once; see `period-fallbacks.csv`.

Answers that are a name or title with no node and recur (1642, The Black Death, Joan of Kent, William the
Conqueror, Harold Godwinson, Battle of Hastings, 1649 and similar) are history, not literature; they are
listed in the CSV and probably should stay on the period.
