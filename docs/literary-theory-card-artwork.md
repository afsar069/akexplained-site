# Literary Theory card pictures

Two sets of cards can each carry a picture:

1. **The eight part cards** in the Literary Theory section of `/literary-criticism/`.
2. **The chapter cards** on each part page,
   `/literary-criticism/literary-theory/<part slug>/` — one card per chapter, the same
   shape as the part cards (owner, 2026-11-25).

No picture is supplied yet, so every card shows its number on a plain tinted panel
instead — the page is never broken by a missing picture.

## Adding a picture

Two WebP files per card, in `assets/literary-theory/`:

    <name>.webp        480 x 300, under 200 KB
    <name>-240.webp    240 x 150, the same picture, smaller

For a part, `<name>` is that part's slug. For a chapter, use its own slug (the one that
will become `/notes/<slug>/`), so the file is easy to place later.

Then set `image` and `alt` on that part — or on that chapter — in `_data/literaryTheory.js`:

    image: "mind-and-myth",
    alt: "Painted interpretation of ...",

That is all. The card shows the picture, and the browser picks the smaller file on a
phone. A part card with a picture also gets a small "Part N" badge in its corner; a
chapter card has no badge, because the chapter number is printed right under the
picture. Nothing has to be done at once: a card with a picture and a card without sit
side by side without looking odd.

## The eight part slugs

    form-language-and-structure
    reader-and-meaning
    beyond-structure
    society-history-and-culture
    mind-and-myth
    gender-and-sexuality
    race-empire-and-nation
    postmodern-and-contemporary

The chapter slugs are listed in `_data/literaryTheory.js`, under each part.

## Rules these pictures follow

- WebP, 200 KB or less, at the sizes above (CLAUDE.md image rule). Check the exported
  file size, and look at the picture at card size before using it.
- The `alt` text says only what the picture shows (rule 2).
- A generated painting is described as a painted interpretation. It is never presented as
  a surviving historical object, a photograph, or an authentic portrait of a real person.
- These files are their own set. Do not reuse `assets/age-cards/` files here, and do not
  use these as article headers.
