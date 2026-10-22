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
