# AK Explained — working rules

## 1. Site text is in simple English. Always.
Anything a visitor can read — headings, labels, buttons, form hints, error
messages, empty states, alt text — is written in **simple, plain English**.
**No Hinglish on the site.** This holds even when the conversation is in Hinglish.

Code comments may stay in Hinglish; they are for the maintainers, not visitors.

## 2. Nothing is invented
Dates, authorship, syllabus details, subscriber counts, student reviews, video
titles — none of it is made up. If a fact is not supplied or verifiable, leave a
placeholder and ask. The site's own About page states this rule to readers, so
breaking it breaks a promise already made.

## 3. Structure
- `index.html` — landing page (plain HTML + `assets/home.css` + `assets/home.js`)
- `_includes/base.njk` — layout for markdown article pages (Pages CMS publishes these)
- Other `*/index.html` — hub and utility pages, standalone HTML
- `assets/site.css` — everything shared; `eleventy.config.js` syncs the header,
  footer, page-head motif and `nav.js` into every built page

The menu lives in two places and must stay in step: `_includes/base.njk` and the
sidebar markup copied into `index.html`.

## 4. Before pushing
`npx eleventy` must build clean, and no internal link may 404.

## 5. Deploys
Work goes on the feature branch. Merging to `main` publishes to akexplained.com,
so do that only when asked.

## 6. Off for now
- `write-a-review/` — built form, excluded from the build in `eleventy.config.js`.
  Turns on with student accounts; remove the one ignore line.
- Reviews on the home page show "Coming soon" until then. Published reviews live
  in `assets/reviews.json` (Pages CMS → Student Reviews).
