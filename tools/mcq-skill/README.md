# MCQ generator — kaise use karein (Hinglish, sirf aapke liye)

Is folder me teen cheezein hain:

- `SKILL.md` — asli skill. AI ko bataata hai ki question kaise, kahan se aur kis format me banane hain.
- `validate_mcq.py` — checker. Files bante hi isse chala kar galtiyan pakadi ja sakti hain (Python 3, koi package nahi).
- `README.md` — yeh page.

## Claude (claude.ai / Work) me
1. Is poore folder ko zip karo (folder ka naam `mcq-generator`, andar `SKILL.md` direct dikhe).
2. Claude me *Settings → Capabilities → Skills → Upload skill* se zip upload karo, aur skill ON karo.
3. Chat me likho, jaise:
   > Old English, Set 3 — Prose and its writers (Alfred, the Chronicle, Ælfric, Wulfstan, law codes). 50 easy aur 50 medium.
4. Claude teen files dega: `…-easy.json`, `…-medium.json`, `…-report.md`.

## Kisi aur AI (ChatGPT, Gemini, etc.) me
`SKILL.md` ka poora text pehle message me paste karo, phir apni request likho. Dhyan rakho: us AI ko web pages kholne aate hon. Agar nahi aate to woh aapse article ka text maangega — woh paste kar do. Bina web ke woh memory se question nahi banayega (skill me yehi likha hai).

## Mujhe (Claude Code) kya dena hai
Teeno files aur likho: **"Old English Set 3 publish karo"**. Main:
1. `validate_mcq.py` chalaunga (galti ho to wapas bhejunga),
2. kuch sawal source se mila kar dekhunga,
3. files `assets/questions/` me rakh kar `_data/mcqSpec.json` me set ko `live` karunga (pages, hub row, build aur custom test apne aap bante hain), test karunga, aur branch par push karunga. `main` par tab hi jab aap kahoge.

## Sources (kahan se facts aate hain)
1. Hamara apna notes article (us age ka) — sabse pehle.
2. Wikipedia, 3. Encyclopaedia Britannica, 4. British Library (bl.uk), 5. Project Gutenberg (sirf asli text check karne ke liye).
Inke alawa kuch nahi. Badalna ho to `SKILL.md` ke section 3 aur `validate_mcq.py` ke upar `ALLOWED_DOMAINS` me badlo.

## Login wale set (database me jata hai, repo me nahi)
Repo public hai, isliye login wale set ki files kabhi repo me nahi jaati. Unke liye teen cheezein hain:

- `make_gated_sql.py` — files ko registry, topic list aur public files se milakar check karta hai, phir Supabase
  ke liye SQL banata hai (`--chunk 25` se chhote hisson me). Ye database ko chhuta nahi.
- `load.check.sql` aur "fingerprint" — load ke baad database se wahi md5 aana chahiye jo tool ne chhapa tha,
  tabhi pakka hota hai ki ek bhi akshar nahi badla.
- Poori vidhi: `CLAUDE.md` rule 15. Chhota roop: `AGENTS.md`.

Command ka namuna (files kisi bhi folder me rakh sakte hain, repo ke andar nahi):
`python3 tools/mcq-skill/make_gated_sql.py --access login easy.json medium.json --out load.sql --chunk 25`
