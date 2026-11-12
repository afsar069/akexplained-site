# UGC NET MCQ skill — kaise use karein (Hinglish, sirf aapke liye)

Ye skill aapke Google Drive ke **"UGC NET"** folder ke notes se UGC NET MCQ files banati hai, aur unhe **website ke
exact format me** tag karke deti hai, taaki Claude Code ko baad me kuch rename ya edit na karna pade.

## Pehle kya galat tha (aur ab kya theek hai)

| Pehle | Ab |
|---|---|
| File ka naam/ids me `batch-1`, `batch-2` | `<age>-set-<n>-easy.json` aur `-medium.json`, ids `…-set-1-e-01` / `…-m-01`. Website me "batch" hota hi nahi. |
| Medium file par `setNumber` 2 | `setNumber` set ka number hai, dono level files me same |
| `setName` = "Age of Chaucer - Batch 1 (Easy)" | `setName` = set ka title (jaise "Across the whole age"), dono files me same |
| `age` = "middle-english" | `age` = hub slug (jaise `age-of-chaucer`); poori list `references/site-ages.md` me |
| `topicRead` nahi tha | hamesha hai (`{}` agar asli anchor nahi) |
| `examCode`, `examName`, `difficulty`, khali `passages` | nikaal diye (site inhe padhti hi nahi) |
| "Medium & Hard Mix" ek file me | ek file = ek level. "medium/hard" = do files |
| Explanation: "Per Upkar Guide Book..." (students ko dikhta hai, repo public hai) | sirf wajah likhi jaati hai; book ka naam sirf `src` me |
| Tag: sawal ke naam se, jawab ke nahi (jaise Hoccleve wale sawal par `geoffrey-chaucer`) | owner ka rule: **jawab hi subject hai** (`thomas-hoccleve`) |
| Sirf `tag_mcq.py` (tags check karta tha, format nahi) | **site ka apna validator** `--strict`: file ka naam, ids, set-header, tags, fields aur explanation ka style, sab check karta hai |
| "UGC NET" naam se search: purane paper ("Solved Papers", "PYQs Telegram Polls") bhi mil sakte the | in files ko fact-source banana mana hai; folder ka exact naam na mile to skill aapse link maangegi |

## Claude me lagana

1. GitHub se zip download karo: `tools/dist/ugc-net-mcq-generator-tagger.zip` (ya chat me bheji file).
2. Claude me *Settings → Capabilities → Skills → Upload skill* se zip upload karo.
   **Pehle wali `ugc-net-mcq-generator-tagger` skill ko hata do ya OFF kar do** (naam wahi hai, warna purani wali chal sakti hai).
3. Chat me likho, jaise: `topic :: Age of Chaucer, Set 2, 50 easy, 50 medium`.
4. Claude files dega (`…-easy.json`, `…-medium.json`, `…-report.md`) aur batayega ki validator "No errors" aaya.
5. Files Claude Code ko dete waqt bolo: **"free"** ya **"login me lagao"**. Ye faisla sirf aapka hai.

## Claude Code ke liye (maintainer note)

- Skill ka zip `python3 tools/build_skill_zip.py` se banta hai. Wo taxonomy CSV, `tools/mcq-skill/validate_mcq.py`,
  `tag_mcq.py` aur registry (`_data/mcqSpec.json`) se saari cheezein khud sync karta hai.
- **Jab bhi taxonomy, registry (koi set live ho / title badle) ya validator badle: zip dobara banao aur commit karo.**
  `python3 tools/build_skill_zip.py --check` batata hai ki zip purana hai ya nahi.
- Is skill ki files ko publish karne se pehle: `python3 tools/mcq-skill/validate_mcq.py <easy> <medium> --strict`
  (agar owner ne files kisi aur AI se banwayi hain to bhi chala sakte ho; `--strict` galtiyan ek hi baar me saari dikhata hai).
- Free set: `CLAUDE.md` rule 7. Login set: rule 15.
