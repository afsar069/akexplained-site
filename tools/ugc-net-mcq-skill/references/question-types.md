# Question types — the exact shapes

Every question has a `qtype`: `direct`, `combination`, `chrono`, `match` or `passage`.
Everything except `direct` is **complex**. In the JSON a line break inside a stem is `\n`
(the site shows it as a real line break). Options are plain strings: no `(A)`, no `1.`, no line breaks.

Write the statements as short, checkable facts. A false statement must be false according to the
source, not "debatable". In the explanation, say which statement or pairing fails and why, in plain
words, without naming a book.

## `direct`

One stem that ends with `?`, four options, one right.

## `combination` — three or four statements

```
Consider the following statements regarding <topic>:
I. <fact>
II. <fact>
III. <fact>
Which of the statements given above are correct?
```

Options are four different groupings, for example: `I and II only` · `II and III only` · `I and III only` ·
`I, II and III`. Never a bare "All of the above". Vary which grouping is right across the file.
Three statements → 3 true/false combinations; four statements → use `I, II and IV only` and similar.

## `combination` — Statement I and Statement II

```
Given below are two statements:
Statement I: <fact>
Statement II: <fact>
In light of the above statements, choose the correct answer:
```

Options (fixed wording, any order): `Both Statement I and Statement II are true` ·
`Both Statement I and Statement II are false` · `Statement I is true, but Statement II is false` ·
`Statement I is false, but Statement II is true`.

## `combination` — Assertion and Reason

```
Given below are two statements, one labelled as Assertion (A) and the other as Reason (R):
Assertion (A): <fact or claim>
Reason (R): <fact that may or may not explain it>
In light of the above statements, choose the correct answer:
```

Options (fixed wording, any order): `Both (A) and (R) are true, and (R) is the correct explanation of (A)` ·
`Both (A) and (R) are true, but (R) is NOT the correct explanation of (A)` · `(A) is true, but (R) is false` ·
`(A) is false, but (R) is true`.
Use "(R) is the correct explanation" only when the source really makes R the reason for A.

## `chrono` — order

```
Arrange the following <things> in the correct chronological order:
1. <item>
2. <item>
3. <item>
4. <item>
Choose the correct sequence:
```

Options are four different sequences of the numbers: `2, 4, 1, 3`. Every item needs a date or a
position the source gives. Do not use items whose dates sources disagree on. The explanation lists the
right order with the dates (`c.` where the source says "about").

## `match` — two lists

```
Match List I (<kind>) with List II (<kind>):
List I:
a. <item>
b. <item>
c. <item>
d. <item>
List II:
1. <item>
2. <item>
3. <item>
4. <item>
Choose the correct option:
```

Options are four different pairings written `a-3, b-1, c-4, d-2`. Every List II item belongs to exactly
one List I item. The explanation gives the right pairs.

## `passage` — a passage and its questions

Only when the owner's material has a real extract (quoted exactly, never from memory). The file gets a
top-level `passages` list; the questions carry `passageId`:

```json
"passages": [
  { "id": "p1", "title": "From <work>", "attribution": "<work>, lines or chapter", "text": "<exact text>", "src": "user-supplied: <title>" }
],
```

Stems start "In the passage above, ..." and test what the passage says or does (tone, figure, argument),
not an outside fact. One passage carries 2 or 3 questions. If the set has no passages, leave the
`passages` key out completely (not `[]`).

## Shares per level (the owner's UGC NET pattern)

| File | Complex share | Typical mix of 50 |
|---|---|---|
| easy | about 10% | 45 direct, 5 simple combination / chrono / match |
| medium | about 50% | 24 direct, 13 combination, 6 chrono, 4 match, 3 passage (or more combination / chrono if there is no passage) |
| hard | about 80% | 10 deep direct, 22 combination, 10 chrono, 5 match, 3 passage |

The validator warns when a file is more than 15 points away from its share. If the owner names another
mix, theirs wins.
