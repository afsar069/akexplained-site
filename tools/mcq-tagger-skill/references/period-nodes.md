# The valid `periodId` values — quick lookup

`periodId` must be **copied exactly** from this list. Every value here is a
`kind = period` row in `taxonomy-master-reference.csv`, and the site's build
requires a `kind = period` node.

**One catch the build does not stop you from getting wrong:** the 10 broad British
**age** nodes (`old-english`, `middle-english`, `renaissance`, `jacobean`,
`restoration`, `augustan-age`, `romantic-age`, `victorian-age`, `modern`,
`contemporary`) are *also* marked `kind = period` in the data, so the build will
**accept** one as a `periodId` — but it is the **wrong rung**. The dashboard tracks
a student by the **inner** period (the 18 below), and an age node rolls up as its
own parent, blurring the meter. So always use the inner period, never the broad
age node. `tag_mcq.py` warns you if an age node slips in.

## British literature — the 18 periods (use one of these for a British question)

| `periodId` | Name & years | Sits inside the age | Common names |
|---|---|---|---|
| `anglo-saxon` | Anglo-Saxon Period (450–1066) | old-english | Old English |
| `anglo-norman` | Anglo-Norman Period (1066–1340) | middle-english | — |
| `age-of-chaucer` | Age of Chaucer (1340–1400) | middle-english | — |
| `fifteenth-century` | Fifteenth Century (1400–1500) | middle-english | — |
| `early-tudor` | Early Tudor Period (1500–1558) | renaissance | part of "Renaissance" |
| `elizabethan` | Elizabethan Age (1558–1603) | renaissance | part of "Renaissance" |
| `jacobean-era` | Jacobean Age (1603–1625) | jacobean | **not** `jacobean` |
| `caroline` | Caroline Age (1625–1649) | jacobean | — |
| `commonwealth` | Commonwealth Period (1649–1660) | jacobean | Interregnum, Puritan |
| `restoration-era` | Restoration Age (1660–1700) | restoration | **not** `restoration` |
| `augustan` | Augustan Age (1700–1745) | augustan-age | part of "Neoclassical" |
| `age-of-sensibility` | Age of Sensibility (1745–1785) | augustan-age | part of "Neoclassical" |
| `romantic` | Romantic Period (1785–1832) | romantic-age | Romantic Age |
| `victorian` | Victorian Period (1832–1901) | victorian-age | Victorian Age |
| `edwardian` | Edwardian Period (1901–1914) | modern | — |
| `georgian` | Georgian Period (1910–1936) | modern | — |
| `modern-era` | Modern Period (1914–1945) | modern | **not** `modern` |
| `postmodern` | Postmodern Period (1945– ) | contemporary | Contemporary |

**Watch the three `-era` traps:** the period is `jacobean-era`, `restoration-era`,
`modern-era`. The plain words `jacobean`, `restoration`, `modern` are the parent
**ages**, not periods — never use them as a `periodId`.

**"Renaissance" and "Neoclassical" are two periods each.** Rough rule (flexibility
is fine): Renaissance before 1558 → `early-tudor`, 1558–1603 → `elizabethan`;
Neoclassical before ~1745 → `augustan`, after → `age-of-sensibility`. If a
question sits on the line, either neighbour is acceptable.

## Other areas (use these only for non-British questions)

American literature:
`american-colonial` (1600–1830), `american-renaissance` (1830–1865),
`american-realism` (1865–1914), `american-modernism` (1914–1945),
`american-contemporary` (1945– ).

Indian Writing in English:
`iwe-beginnings`, `iwe-poetry`, `iwe-fiction`, `iwe-drama`, `iwe-prose`.

New Literatures (Postcolonial):
`african-literature`, `caribbean-literature`, `canadian-literature`,
`australian-literature`.

## When a question has no period at all

A pure literary term, a theory concept, a research-methods question, or a
world-literature fact may have **no** sensible period. Leave `periodId` out of
that question (the site allows a missing `periodId`). Say so in your summary.
Do **not** stretch a British period onto it.
