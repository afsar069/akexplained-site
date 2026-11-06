# Looking at `/dashboard/` while logged in

This session (and every cloud session) cannot reach Supabase, so the dashboard
normally shows only the signed-out card. `preview.js` gets around that **without
touching the live project**: it puts a made-up session in `localStorage` and answers
every Supabase REST call with made-up rows, so the real page code runs — `dashboard.js`,
`auth.js`, `site.css`, all of it.

```
npx @11ty/eleventy
python3 -m http.server 8099 --directory _site &
OUT_DIR=/tmp/shots node tools/dashboard-preview/preview.js
```

It writes one picture per width (1680, 1280, 900, 390) of the tile row, and one of the
page. Change the `rows` block near the top to try a different student: a new one with
three answers, somebody with no path picked, a very long name.

**Every number it shows is invented, for looking at the design only.** Never copy one
into the site, into chat, or into a document (rule 2 — nothing is invented).

Routes it answers: `attempts`, `topics`, `user_exams`, `profiles`, `rpc/leaderboard`.
If the dashboard starts reading something else, add it there or the page will hang on
that request.
