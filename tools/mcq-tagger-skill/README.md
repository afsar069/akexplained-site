# MCQ Tagger — kaise use karein (Hinglish, sirf aapke liye)

Ye skill **pehle se bane** MCQ JSON file ko **tag** karti hai — matlab har question me
`topicId` aur `periodId` daal deti hai (aur `id` agar missing ho), taaki aapki website ka
**login wala progress tracker / dashboard** student ki learning ko age aur topic ke hisaab se
follow kar sake. Question ka text, options, answer, explanation — **kuch nahi badalta.**

Ye **generator** skill se alag hai. Generator naye question banati hai; ye sirf **tagging**
karti hai. Dono alag kaam, alag skill.

> **Owner ki baat:** "mujhe mathematical accuracy nahi chahiye." Ye skill rough tracking ke
> liye hai. Agar koi topic do age ke beech me aata hai, kisi bhi barabar wali age me tag
> karna theek hai. Pakka na ho to tag period par chhod do — safe rehta hai.

## Isme kya hai

- `SKILL.md` — asli skill. AI ko batati hai kaise tag karna hai (flexible ladder), aur
  **sirf** `references/taxonomy-master-reference.csv` ke andar ke id use karne hain.
- `references/taxonomy-master-reference.csv` — ~1,711 id ki master list. **Yahi id ka
  ekmatra source hai.** Isse bahar ka koi id website build me reject ho jata hai.
- `references/period-nodes.md` — valid `periodId` ki chhoti list + age→period map.
- `references/taxonomy-aliases.csv` — kuch node ke doosre naam (dhoondhne me madad).
- `scripts/tag_mcq.py` — checker + id-assigner (Python 3, koi package nahi). Ye garanti
  deta hai ki file website par chadh jayegi: har `topicId` asli hai, har `periodId` sahi
  period node hai, aur koi `id` repeat nahi.

## Claude (claude.ai / Work) me laga kar
1. Is poore folder ko zip karo (folder ka naam `mcq-tagger-akexplained`, andar `SKILL.md`
   seedha dikhe). Main aapko ye zip bana kar bhej bhi raha hoon.
2. Claude me *Settings → Capabilities → Skills → Upload skill* se zip upload karo, skill ON karo.
3. Apni MCQ JSON file do aur likho, jaise:
   > Is Romantic Age set ko tag kar do. Ye Romantic period ka hai.
4. Claude tagged file(s) wapas dega, aur ek chhoti summary (kitne specific tag lage, kitne
   period par, kaun se period use hue).

## Kisi aur AI (ChatGPT, Gemini) me
`SKILL.md` ka poora text pehle paste karo, phir `references/taxonomy-master-reference.csv`
bhi paste/upload karo (ya ye keh do ki usme se hi id lene hain). Phir apni JSON file do.
Dhyan: us AI ko bolo ki id **copy** kare, apne se **na banaye**.

## Khud check karna ho (Claude Code / jahan Python chale)
Single-age set (jaise ek Romantic Age set) ke liye:

```
python3 scripts/tag_mcq.py your-set-easy.json your-set-medium.json \
    --period romantic --fallback --assign-ids --write
```

- `--period <id>` — poore set par ek hi period lagata hai (period-nodes.md me list).
- `--age <slug>` — ya age se period khud nikal lega (jaise `--age old-english` → anglo-saxon).
- `--fallback` — jahan topicId khaali chhoda, usse periodId bana deta hai (safe rough tag).
- `--assign-ids` — missing `id` bhar deta hai (`<setId>-<e|m|h>-NN`), purane number se aage.
- `--write` — badlav file me save karta hai. Bina iske sirf report dikhata hai (kuch likhta nahi).

Report me **"0 errors"** aaye to file website par chadhne ko taiyaar hai.

Chhoti dhoondh (file ki zaroorat nahi):
- `python3 scripts/tag_mcq.py --list-periods` — saare valid period dekho.
- `python3 scripts/tag_mcq.py --find "milton"` — naam se topic id dhoondho.

## Tag hone ke baad — free ya login
Tagging dono me ek jaisi hai. File tag hone ke baad:
- **Free set:** `CLAUDE.md` rule 7 / `tools/mcq-skill/PUBLISH.md` ke hisaab se
  `assets/questions/` me rakho aur registry me live karo.
- **Login set:** rule 15 / PUBLISH.md ke hisaab se `make_gated_sql.py` se database me
  daalo (file repo me nahi jaati).

Is skill ka kaam yahin tak: **sahi, valid tag laga kar file taiyaar karna.** Publish owner
ka step hai.

## Yaad rahe
- Id kabhi invent nahi — sirf `references/taxonomy-master-reference.csv` se.
- Period hamesha **inner** period (`jacobean-era`), broad age node (`jacobean`) nahi.
- Pakka na ho to topicId = periodId. Rough-but-right galat-but-confident se behtar hai.
