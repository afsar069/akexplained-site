# Literary Theory part card pictures

The eight cards in the Literary Theory section of `/literary-criticism/` can each carry a
picture. None is supplied yet, so every card shows its part number on a plain tinted panel
instead — the page is never broken by a missing picture.

## Adding a picture

Two WebP files per part, both named after that part's slug, in `assets/literary-theory/`:

    <slug>.webp        480 x 300, under 200 KB
    <slug>-240.webp    240 x 150, the same picture, smaller

Then set `image` and `alt` on that part in `_data/literaryTheory.js`:

    image: "mind-and-myth",
    alt: "Painted interpretation of ...",

That is all. The card shows the picture, with a small "Part N" badge in its corner, and
the browser picks the smaller file on a phone. The eight cards do not have to be done at
once: a part with a picture and a part without sit side by side without looking odd.

## The eight slugs

    form-language-and-structure
    reader-and-meaning
    beyond-structure
    society-history-and-culture
    mind-and-myth
    gender-and-sexuality
    race-empire-and-nation
    postmodern-and-contemporary

## Rules these pictures follow

- WebP, 200 KB or less, at the sizes above (CLAUDE.md image rule). Check the exported
  file size, and look at the picture at card size before using it.
- The `alt` text says only what the picture shows (rule 2).
- A generated painting is described as a painted interpretation. It is never presented as
  a surviving historical object, a photograph, or an authentic portrait of a real person.
- These files are their own set. Do not reuse `assets/age-cards/` files here, and do not
  use these as article headers.
