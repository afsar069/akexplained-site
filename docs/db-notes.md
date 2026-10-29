# Database notes — user accounts

These notes cover the first database migration for user accounts:
`supabase/migrations/20261024120000_create_user_accounts.sql`.

This change is **database only**. There is no sign-up screen, login screen, or
any other front-end code yet. The tables and rules below are the foundation the
app will sit on later.

## What the migration sets up

It creates three tables, one trigger, the grants that expose the tables to the
Data API, and the row-level security (RLS) rules that keep each user's data
private.

### 1. `profiles`

One row per user. It holds the small amount of profile data the app needs that
does not belong in Supabase's built-in `auth.users` table.

| Column          | Meaning |
| --------------- | ------- |
| `id`            | The user's ID. It is the same value as the user's ID in `auth.users`. If the user is deleted, this row is deleted too. |
| `display_name`  | The name shown on screen. Starts empty until the user sets one. |
| `avatar_id`     | Which avatar the user picked. Empty until they choose one. |
| `created_at`    | When the row was created. |

**A profile is made for you automatically.** A trigger runs whenever a new user
is added to `auth.users` and inserts a matching `profiles` row (with `id` set
and the rest left at their defaults). The app never has to create this row
itself. `display_name` and `avatar_id` are filled in later, by the user.

> **Note:** an earlier migration gave `profiles` a `primary_track` column. The
> second migration (below) drops it — which exam a user is preparing for now
> lives in the `user_exams` table, where a user can pick several exams.

### 2. `attempts`

One row for every question a user answers, across every quiz surface.

| Column        | Meaning |
| ------------- | ------- |
| `id`          | A unique number for the row, assigned by the database. The app does not set it. |
| `user_id`     | Who answered. Points at `auth.users`. If the user is deleted, their attempts are deleted too. |
| `question_id` | Which question was answered (a text id). |
| `topic_id`    | Which topic the question belongs to. Empty for now, because questions are not tagged with a topic yet. |
| `is_correct`  | `true` if the answer was right, `false` if it was wrong. |
| `source`      | Where the question was answered. One of `daily`, `cbt`, `pyq`, `mock`, or `diagnostic`. No other value is allowed. |
| `answered_at` | When the question was answered. |

Two indexes make the common lookups fast: all of a user's attempts for one topic
(`user_id, topic_id`), and all of a user's attempts in time order
(`user_id, answered_at`).

### 3. `reading_progress`

One row per user per article. It records whether a user has finished an article
and when they last opened it.

| Column         | Meaning |
| -------------- | ------- |
| `user_id`      | Whose progress this is. Points at `auth.users`. Deleted with the user. |
| `article_slug` | Which article, by its slug (for example `old-english`). |
| `completed`    | `true` once the user marks the article finished. Starts `false`. |
| `last_read_at` | When the user last opened the article. |

The primary key is the pair `(user_id, article_slug)`, so each user has at most
one row per article.

## Second migration — exams, topics, and user selections

File: `supabase/migrations/20261025120000_exams_topics_and_profile_update.sql`.

The idea: a question is tagged with a **subject topic** (like `beowulf` or
`kenning`), never with an exam. Exams are mapped to topics separately, so adding
a new exam later means inserting a few rows, not re-tagging questions. It also
changes `profiles` (drops `primary_track`, adds `avatar_id` — see the note under
`profiles` above).

There are two kinds of table here.

### Reference data (everyone can read, nobody writes from the client)

- **`exams`** — the exams and tracks shown in the picker. `id` is a slug
  (`ugc-net`, `cuet-pg`, …), `name` is the display name, `status` is `active` or
  `coming_soon`, and `sort_order` sets the order. A later migration adds three
  more columns: `kind` (`exam`, `degree`, or `journey` — the family the signup
  screen groups by), `institution` (university name for a degree, null
  otherwise), and `level` (`ba` or `ma` for a degree, null otherwise). BA and MA
  are always separate rows with separate syllabi. Seeded with the seven
  competitive exams (`kind = exam`), the `literature-journey` track
  (`kind = journey`), and eight university degree tracks (`kind = degree`:
  CCSU, Delhi University, AMU, and IGNOU, each as a BA and an MA). `ugc-net` and
  `literature-journey` are `active`; everything else starts `coming_soon`.
- **`topics`** — subject topics used to tag questions, arranged as a **tree**
  (area > period > movement / writer > work). `id` is a slug, `name` is the
  display name, `parent_id` points at the parent topic (empty for a top-level
  area), `kind` says what the node is (`area`, `period`, `movement`, `writer`,
  `work`, or `concept`), and `sort_order` sets the order among siblings.
  Mastery is worked out at a parent level by rolling up its children, so the
  depth of the tree matters. Starts empty; the topic list is supplied later.
  Each British age (for example Old English) also has child period nodes for the
  site's own literary periods (for example Anglo-Saxon), added by
  `20261029170000_add_british_sub_periods.sql`.
  (A later migration, `20261027120000_topics_tree.sql`, replaced the earlier
  flat `age_slug` column with `parent_id` and `kind`.)
- **`exam_topics`** — which topics belong to which exam, grouped into units
  (`unit_label` like `Unit 3`, plus `unit_order`). Keyed by `(exam_id, topic_id)`.

These three have RLS on with a single read-only policy: **anyone** (signed in or
not) may `SELECT`; no client role is granted insert, update, or delete. They are
edited only from the Supabase dashboard or a trusted server.

### Per-user data (own rows only)

- **`user_exams`** — the exams a user picked (a user may pick several). Keyed by
  `(user_id, exam_id)`. `is_primary` marks their main exam; a partial unique
  index allows **at most one** `is_primary = true` row per user. `selected_at`
  records when they added it.
- **`notify_requests`** — a record that a user clicked "notify me" on a
  coming-soon exam. Keyed by `(user_id, exam_id)`, with `requested_at`.

These follow the same rule as `attempts`: a signed-in user can `SELECT`,
`INSERT`, and `UPDATE` only their own rows (`user_id = auth.uid()`), and `anon`
gets nothing. The one difference: **`user_exams` also allows `DELETE`** of your
own rows (a user may remove an exam). `notify_requests` has no delete.

## Who can see and change what

*(This section and the test checklist below cover the first migration's three
tables — `profiles`, `attempts`, `reading_progress`. The second migration's
tables follow the patterns described just above.)*

### Grants (what the Data API exposes)

The project setting **"Automatically expose new tables" is off**, so the
migration grants access by hand:

- The **`authenticated`** role (any signed-in user) can `SELECT`, `INSERT`, and
  `UPDATE` all three tables. It is **not** granted `DELETE`.
- The **`anon`** role (a visitor who is not signed in) is granted **nothing** on
  any of the three tables.

### Row-level security (whose rows)

Grants decide which *actions* are allowed; RLS decides which *rows*. RLS is
turned on for all three tables, and the rules are:

- A signed-in user can read, insert, and update **only their own rows**:
  - `profiles`: rows where `id` equals their own user id.
  - `attempts` and `reading_progress`: rows where `user_id` equals their own
    user id.
- **No one can delete** any row through the Data API: there is no delete rule,
  and `DELETE` is not granted. (Rows still disappear automatically when the user
  is deleted, because of the `on delete cascade` links to `auth.users`.)
- Every rule is written for the `authenticated` role only. A not-signed-in
  visitor (`anon`) matches no rule and has no grant, so they get nothing.

The net effect: user A can never see or change user B's profile, attempts, or
reading progress, and a logged-out visitor can see none of it at all.

## Manual test checklist — prove A cannot read B's rows

Do this once after applying the migration. You need two real accounts. The goal
is to confirm, from the client side (the same path the app will use), that one
user cannot see the other's rows.

**What you need**

- The **Project URL** and the **publishable** (anon) key from
  Supabase → Project Settings → API. Use the publishable key only — never the
  secret key.
- Two test users. Create them in Supabase → Authentication → Users (for example
  `a@test.com` and `b@test.com`), or sign them up through the API.

### Step 1 — confirm the profiles exist

In Supabase → Table Editor → `profiles`, check there is one row for each user,
with `id` matching the user ids in Authentication → Users. This proves the
auto-create trigger fired. (Viewing in the dashboard bypasses RLS — that is
expected; it is only a setup check.)

### Step 2 — sign in as A and write a row

Using the Project URL and publishable key, sign in as **A** and insert some data
as A. The quickest way is the browser console on any page where the Supabase JS
client is loaded, or a tiny script. For example:

```js
const { createClient } = supabase; // or import it
const sb = createClient(PROJECT_URL, PUBLISHABLE_KEY);

await sb.auth.signInWithPassword({ email: 'a@test.com', password: '...' });

// A writes one attempt and one reading_progress row.
await sb.from('attempts').insert({
  question_id: 'as-e-01', is_correct: true, source: 'daily'
});
await sb.from('reading_progress').insert({
  article_slug: 'old-english', completed: true
});
```

Both inserts should succeed. Note: do not send `user_id` — the policies require
it to equal your own id, so let it default from the session, or set it to A's id
explicitly.

### Step 3 — as A, read back and count

Still signed in as A:

```js
const { data: mine } = await sb.from('attempts').select('*');
console.log('A sees attempts:', mine);          // should list A's own rows
const { data: myProfile } = await sb.from('profiles').select('*');
console.log('A sees profiles:', myProfile);      // should be exactly ONE row: A's
```

A should see only A's own rows. The `profiles` read should return exactly one
row (A's), never B's.

### Step 4 — sign in as B and try to read A's rows

Sign out, then sign in as **B** in the same client:

```js
await sb.auth.signOut();
await sb.auth.signInWithPassword({ email: 'b@test.com', password: '...' });

const { data: attempts } = await sb.from('attempts').select('*');
console.log('B sees attempts:', attempts);       // should NOT include A's rows
const { data: profiles } = await sb.from('profiles').select('*');
console.log('B sees profiles:', profiles);       // should be exactly ONE row: B's
```

**Pass if:** B sees none of A's attempts and none of A's reading progress, and
the `profiles` query returns only B's own row. B has written nothing yet, so
`attempts` and `reading_progress` should come back empty for B.

### Step 5 — as B, try to read a specific A row by id

Targeting A's row directly must also return nothing:

```js
// Use an id you saw in Step 3 as one of A's attempts.
const { data } = await sb.from('attempts').select('*').eq('id', A_ATTEMPT_ID);
console.log('B targeting A row:', data);          // should be [] (empty)
```

**Pass if:** the result is empty. RLS filters the row out even though B asked for
it by id.

### Step 6 — confirm no delete and no anon access

```js
// Still as B: delete is not allowed for anyone.
const del = await sb.from('attempts').delete().eq('user_id', (await sb.auth.getUser()).data.user.id);
console.log('B delete own rows:', del.error); // should error / affect 0 rows

// Signed out: anon sees nothing.
await sb.auth.signOut();
const anon = await sb.from('profiles').select('*');
console.log('anon sees profiles:', anon.data, anon.error); // empty data / permission error
```

**Pass if:** the delete does not remove rows (no delete policy and no `DELETE`
grant), and the logged-out read returns no data.

---

If every step passes, isolation is working: each user reaches only their own
rows, deletes are blocked, and logged-out visitors get nothing.
