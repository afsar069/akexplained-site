---
permalink: false
---

# AK Explained — Landing Page Redesign Plan

**Status:** Landing page BAN GAYA. Inner / article page design abhi baaki hai.
**Images:** mil gayi — `assets/hero-floral.webp`, `assets/books-stack.webp`
**Branch:** `claude/determined-davinci-33jhlj`
**Reference:** Mockup screenshot jo chat me diya gaya (right-side drawer menu wala).

---

## 1. Menu (final list)

Vertical sidebar menu. **Left side** (jidhar se English likhna shuru hota hai).
Mobile par ☰ hamburger ban jayega.

| # | Menu item | Link | Status |
|---|---|---|---|
| 1 | Home | `/` | hai |
| 2 | **Exams** (dropdown) | `/exams/` | hai |
| 2a | — UGC NET / JRF / SET English Literature | `/exams/net/` | hai |
| 2b | — PGT | `/exams/pgt/` | hai |
| 2c | — State PSC | `/exams/state-psc/` | **naya banana hai** |
| 2d | — MA / BA | `/exams/ma-ba/` | `/exams/university/` ko rename/reuse karenge |
| 3 | English Literature | `/english-literature/` | **naya — ages ka main hub** |
| 4 | **Quizzes** (dropdown) | `/quizzes/` | hai |
| 4a | — MCQ | `/quizzes/mcq/` | hai |
| 4b | — PYQ | `/quizzes/pyq/` | hai |
| 5 | My Publisher | `/publish-with-us/` | "Your Creativity" ka naya naam |
| 6 | Research Support | `/research-support/` | **naya — Coming Soon page** |
| 7 | Download | `/download/` | **naya** |
| 8 | Video Lessons | `/video-lessons/` | **naya — saari videos ka page** |
| 9 | Login | `/login/` | **naya — Coming Soon page** |
| 10 | Contact Us | `/contact/` | hai |
| 11 | About | `/about/` | hai |

**Menu do jagah hai — dono sync rakhni hai:**
- `_includes/base.njk` — baaki saare inner pages ka menu
- `index.html` ka `navMenus` array — home page ka menu

---

## 2. Home page sections (is order me)

1. **Hero header** — floral + books wali picture (user degा). Title: *English Literature Across All Ages*
2. **Daily birthday subtitle** — "Today in Literary History" card. Roz badlega.
   - Data already hai: `bdayEvents` (~95 authors ki birth/death dates)
   - Ise thoda advance/bada card banana hai (accepted suggestion)
3. **Search section** — already kaam karta hai, naye design me
4. **Animated quotation line** — already hai: `typeLines` (typing animation)
5. **Pick Your Exam** — NET/SET/JRF · PGT · MA/BA · State PSC · Others
   - Ye hi naye students ka entry point hai, isliye alag "start here" section nahi
6. **Quizzes & Practice Zone** — MCQs, PYQ
7. **English Literature by Ages** — Old, Middle, Renaissance... Modern, Contemporary
8. **Video Lessons** — channel ki 4 videos. Click → `/video-lessons/` par saari videos
9. **Meet the Author** — Prof. Afsar Khan ka introduction
10. **Our Community** — YouTube, Telegram, subscriber counts
11. **What Our Students Say** — testimonials
12. **Footer** — saare menu buttons

---

## 3. Locked decisions

| # | Decision |
|---|---|
| 1 | Daily birthday subtitle — **rakhenge**, advance card ke saath |
| 2 | Animated quotation line — **rakhenge** |
| 3 | Search section — **rakhenge** |
| 4 | Pick exam / Quizzes / Ages / Videos / Meet author / Community / Students say — **rakhenge, par image ke according naya look** |
| 5 | Colour theme + button style — **image jaisa** (teal + cream) |
| 6 | "Your Creativity" → **"My Publisher"** rename |
| 7 | Research Support → **Coming Soon** |
| 8 | English Literature → **ages ke according main hub** |
| 9 | Hero floral picture → **user provide karega** |
| 10 | Login → **Coming Soon**. Dashboard baad me (Phase 2) |
| 11 | Quizzes → **menu me add** |
| 12 | Menu → **left side vertical**, mobile par hamburger |
| 13 | "Today in Literary History" → **accepted** |
| 14 | Naye student ke liye alag section → **nahi** (Pick Your Exam hi kaafi hai) |
| 15 | Latest Notes strip → **abhi nahi**, baad me |
| 16 | Hinglish/English toggle → **abhi nahi**, baad me |
| 17 | Email signup → **Login ke saath aayega** |
| 18 | Video section → 4 videos, click par **full dedicated page** |

---

## 4. Deleted pages — DECIDED

User ne delete karne ko kaha. Delete kar diye gaye, har ek ka **301 redirect** `_redirects` me daal diya
taaki purane link aur Google ranking na toote:

| Deleted page | Redirect jaata hai |
|---|---|
| `/exams/tgt/` | `/exams/pgt/` |
| `/guides/` | `/english-literature/` |
| `/help/` | `/contact/` |
| `/exams/university/` | `/exams/ma-ba/` (rename, delete nahi) |

**Zinda rakhe gaye** (menu me nahi, par page chalu hai, MA/BA page se link hain):
`/university/ccs-meerut/`, `/university/ignou/`, `/university/du/`

---

## 5. Phase 2 — Login + Student Dashboard (baad me)

Abhi sirf Coming Soon page. Poora system baad me.

**Zaroori baat:** ye site static hai (Eleventy). Static site akeli login nahi chala sakti.
Iske liye chahiye hoga:
- Ek auth + database service — Firebase ya Supabase (dono ka free tier hai aur static site ke saath chalte hain), **ya** Netlify/Cloudflare functions
- Student account, quiz score save, progress tracking, bookmarks
- Privacy policy update (`/privacy/`) — student data store karne par ye legally zaroori hai

**Redesign me iske liye jagah chhod rahe hain:** menu me Login button + `/login/` page, taaki baad me wahi page asli login ban jaye. Dobara se design nahi badalna padega.

---

## 6. Technical approach

**Route (A) — recommended:** home page ko saaf HTML + `assets/site.css` me rebuild karna.

Abhi home page ek alag export format me hai (`<sc-for>`, `<sc-if>`, inline styles) jo baaki site se match nahi karta. Route A ke baad:
- Header/footer ek hi jagah se chalega (`base.njk`)
- Naya section add/remove/reorder karna aasaan ho jayega
- Har section ek alag block hoga — modular

**Cost:** search box, quiz widget, "on this day" aur typing animation dobara plain JavaScript me likhne padenge. (Data wahi reuse hoga, sirf code naya.)

---

## 7. Kaam ka tareeka

1. Sab kuch branch `claude/determined-davinci-33jhlj` par hoga — **main branch ko haath nahi lagega**
2. Push se pehle Chromium se desktop + mobile screenshot le kar chat me preview dikhaya jayega
3. Repo me `_redirects` file hai → site Netlify ya Cloudflare Pages par hai. Dono branch push par **automatic preview URL** dete hain, to asli browser me bhi check ho sakega
4. Live site tabhi badlegi jab ye branch `main` me merge hoga
5. Pull request tabhi banega jab user bolega

---

## 8. Nayi pages jo banani hain

| Page | Content |
|---|---|
| `/english-literature/` | Ages ka main hub |
| `/video-lessons/` | Saari YouTube videos |
| `/exams/state-psc/` | State PSC syllabus |
| `/exams/ma-ba/` | MA/BA (purana `/exams/university/` reuse) |
| `/research-support/` | Coming Soon |
| `/download/` | Coming Soon |
| `/login/` | Coming Soon |

**Note:** in pages ka content **user dega** ya user ke approve kiye hue source se aayega. Koi bhi fact, date ya syllabus detail khud se nahi banayi jayegi.

---

## 9. Pehle se maujood problem (redesign me theek karna hai)

Home page par **43+ links aise hain jo un pages par jaate hain jo bane hi nahi** —
jaise saare writer pages (`/notes/chaucer/` etc.), 8 video pages, 6 Hindi pages, 8 quiz pages.

Redesign ke waqt tay karna hai: in cards ko **hide** karein, ya **"Coming Soon"** badge lagayein.

---

## 10. Landing page — ban gaya (Phase 1 complete)

**Nayi files:**
- `index.html` — landing page, plain HTML (113 KB → 25 KB)
- `assets/home.css`, `assets/home.js` — landing-only style aur behaviour
- `assets/nav.js` — sidebar menu (har page par)
- `assets/hero-floral.webp`, `assets/books-stack.webp` — user ki di hui artwork
- Nayi pages: `/english-literature/`, `/video-lessons/`, `/exams/state-psc/`,
  `/research-support/`, `/download/`, `/login/`

**Build:** 25 pages, 0 dead internal links.

### Abhi bhi user se chahiye

1. **4 asli YouTube video links** — abhi video cards placeholder hain aur `/video-lessons/`
   par jaate hain. Asli link milte hi real thumbnail lag jayega.
2. **Asli student reviews** — "What Our Students Say" me koi banaya hua review nahi daala gaya.
   Abhi wahan review bhejne ka invite hai. Asli reviews aate hi lag jayenge.
3. **Subscriber / member counts** — mockup me "700+ YouTube", "5,000+ Telegram" tha.
   Confirm nahi tha isliye number nahi daale. Confirm karke bhejein to add ho jayenge.
4. **Ages ke naam** — mockup me "Middle English" aur "Contemporary" tha; site ki apni
   purani periodisation ("Age of Chaucer", "Postmodern") rakhi gayi hai. Badalna ho to bolein.
5. **State PSC ka asli syllabus** — koi pattern/syllabus khud se nahi likha gaya.
   Commission batayein to uska page banega.

### Agla kaam
Inner / article page ka design (user ne kaha: "usko baad me change karenge").
