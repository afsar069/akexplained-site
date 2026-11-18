# PYQ tagging generator: instruction (AK Explained)

Ye instruction us AI ke liye hai jo UGC NET (ya PGT / TGT) ke **previous-year paper** ko tag karke JSON file banata hai.
Is poore text ko generator me paste karo, ya skill ke andar rakho. Maksad ek hi hai: **jo file bane, wo bina kisi badlav ke
`/admin/upload-paper/` par chadh jaye** aur site par bilkul sahi dikhe.

Hinglish sirf is instruction ko samajhne ke liye hai. **JSON file ke andar sab kuch simple English me hota hai, aur
Devanagari (Hindi ke akshar) kahin nahi.** Chat me Roman Hinglish chalega, Devanagari nahi.

---

## 0. Pehle ye samjho (site ka mahaul)

- Site ek **static** site hai; PYQ ke sawal **login ke andar** hote hain aur database (Supabase) me jaate hain, repo me nahi.
  Isliye file ka format ek-ek akshar tak tay hai. Database khud file ko check karta hai aur galat file ko mana kar deta hai.
- Engine **ek sahi option** ginta hai. UGC ki official key kabhi do option maanti hai, kabhi sawal drop kar deti hai. Aise sawal
  ke liye **tum ek option chuno** (section 3), aur sach likho ki kya gina gaya.
- Tag (`topicId`, `periodId`) **sirf site ki master list se** aate hain. Apna slug mat banao. (Pichli baar sab 50 tag
  `harold-pinter-the-birthday-party` jaise apne slug the. Database ne unhe mana kar diya hota. Aisa dobara nahi hona chahiye.)
- Facts ya options ya sawal ka text **kabhi nahi badalte**. Shak ho to likh do, andaza mat lagao.

## 1. Kya banana hai

Ek paper = **ek JSON file**, naam `<setId>.json`. `setId` ka dhancha:
`ugc-net-english-<saal>-<jun|dec>-paper-<i|ii|iii>`, jaise `ugc-net-english-2013-jun-paper-ii`.
Saath me ek chhoti **report** (section 6).

File ka dhancha (poora object, sirf list nahi):

```json
{
  "setId": "ugc-net-english-2013-jun-paper-ii",
  "rev": 1,
  "ageName": "UGC NET English",
  "setName": "Paper II — June 2013",
  "level": "medium",
  "levelName": "Full paper",
  "title": "UGC NET English Paper II — June 2013",
  "exam": "UGC NET",
  "subject": "English",
  "paper": "II",
  "session": "June 2013",
  "topics": {
    "british": "British Literature",
    "american": "American Literature",
    "criticism": "Literary Criticism",
    "terms": "Literary Terms",
    "world": "World Literature"
  },
  "topicRead": {},
  "questions": [ ]
}
```

- `level` hamesha `"medium"` (database sirf easy / medium / hard leta hai; `"all"` mana hai). `levelName` `"Full paper"`.
- `rev` pehli baar `1`. Paper theek karke dobara bhejna ho to `rev` ek badhao.
- `topics` = is paper ke liye set-local naam. Har sawal ka `topic` in keys me se ek hona chahiye. Keys sirf wahi rakho jo
  paper me kaam aayein. Naye label mat gadho; sawal ki category (British, American, criticism, terms, world) ke naam hi lo.
- Sourcelink wali cheez (`sourceQuestionPaper`, `sourceAnswerKey`) tabhi do jab asli URL pata ho; kabhi gadho mat.

## 2. Har sawal ka dhancha

```json
{
  "id": "ugc-net-english-paper-2-jun-2013-q31",
  "questionNumber": 31,
  "question": "...exactly as printed...",
  "options": ["A lifeless ocean", "The caverns measureless", "A fountain", "The waves"],
  "correct_option_id": 1,
  "explanation": "...",
  "topic": "british",
  "topicId": "kubla-khan",
  "periodId": "romantic",
  "qtype": "direct",
  "src": "UGC NET English Paper II, June 2013",
  "note": "The UGC key accepts two options for this question. This site counts one of them."
}
```

Niyam, ek-ek karke:

1. **`id`**: `ugc-net-english-paper-<1|2|3>-<jun|dec>-<saal>-qNN` (NN = do ankon ka number). Ek baar diya to kabhi nahi badalta,
   kabhi dobara use nahi hota.
2. **`question`**: jaisa chhapa hai waisa, shabd-ba-shabd. List wale sawal (List I / List II, I. II. III. IV., A. B. C. D.)
   me har item naye line par `\n` se. Ek lambi line me mat chipkao. Typo bhi mat sudharo (alag se report karo).
3. **`options`**: **bilkul 4 saade strings**. `{"key":"a","text":"..."}` jaisa object **nahi**. Aage `(A)`, `1.` jaisa label **nahi**
   (site apne label lagati hai). Chaaron alag. Jodi-milan wale sawal me option sirf code hota hai, jaise `"2 1 4 3"`.
4. **`correct_option_id`**: sirf ek number, 0 se 3 (pehla option = 0). Option ki jagah-badal (shuffle) site nahi karti; jo
   order paper me hai wahi rakho.
5. **`explanation`**: zaroor likho, 1 se 3 chhote vaakya, simple English. **"the source", "the PDF", "according to the paper" jaise
   shabd nahi** (student ko wo document dikhta hi nahi). Sahi jawab ka naam likho; option ka letter likhna ho to jawab ka text
   bhi saath likho. Kisi book ka naam gadhkar mat likho.
6. **`topic`**: `topics` ki ek key. **`qtype`**: `direct`, `combination`, `match`, `chrono` ya `passage`.
7. **`src`**: `"UGC NET English Paper II, June 2013"` jaisa, har sawal me.
8. **`note`** (option ki cheez, section 3 aur 4): ek chhoti, halki line jo sawal ke neeche test ke dauran dikhti hai.
9. In ke alawa koi key nahi: `answerKey`, `correctAnswer`, `answerStatus`, `originalAnswer`, `categoryId`, `number` **mat rakho**.

## 3. Official key ka kya karna hai

Official (updated) answer key lo. Key na ho to **ruk kar poochho**, andaza mat lagao.

| Key kya kehti hai | Tum kya karo |
|---|---|
| Ek option | Wahi `correct_option_id`. Note nahi. |
| Do ya zyada option sahi | **Ek chuno** jo bharosemand page se sabse pakka ho (Britannica, poets.org, Wikisource, Gutenberg, university page). Explanation me likho: `The updated UGC answer key accepts both (a) and (b). ... This test counts (b) because ...`. Note: `The UGC key accepts two options for this question. This site counts one of them.` |
| Sawal drop (marks to all) | Jo option **tathyatah sahi** hai wahi chuno. Explanation: `The UGC updated answer key dropped this question and gave marks to all candidates. This test counts (a): ...`. Note: `The UGC key dropped this question and gave marks to all candidates. This site counts one answer.` |
| Sawal me chhapai ki galti (jaise ek jodi ka naam galat) par jawab nikal sakta hai | Jawab chuno, aur note me galti batao **bina jawab bataye**. Jaise: `One pair is misprinted: ... Only one option fits the other three pairs.` |

Chunne ke liye zaroori: jo option tum chunte ho uska fact **kisi bharosemand page par dekha ho**. Na dekh paao to report me
`UNVERIFIED` likho aur wajah batao. Jis page ko khol nahi paaye uska naam bhi likho.

## 4. Note (halki line) ke niyam

- Sirf unhi sawalon par jahan key do option maanti hai, sawal drop hua, ya chhapai me galti hai. Baaki par **koi note nahi**.
- Simple English, ek line, **220 akshar se kam**.
- **Jawab nahi batana**: note me `(a)`, `option b`, `is correct` jaisa kuch nahi (note test ke dauran dikhta hai).
  Kaun sa option gina gaya, wo sirf `explanation` me jaata hai (wo sirf review me dikhta hai).

## 5. Tag lagana (sabse zaroori)

Sirf `supabase/data/taxonomy-master-reference.csv` ke `id` use karo (kul 1,711). Tagger skill me iski copy
`references/taxonomy-master-reference.csv` hai. Id **copy** karo, apne se **mat** banao. Kuch bhi shak ho to us id ko CSV me
dhoondo; mile nahi to wo id nahi hai.

**`topicId`: sidhi par chadho (ladder).** Ek sidhi ek baar me, upar wali par node ho to neeche mat jao:
`work` -> `writer` -> `movement / concept` -> `period`. Period **aakhri sidhi** hai, bachne ka rasta nahi.

- Sawal ka jawab khud ek node ho to **jawab hi subject hai** (jaise jawab `irony`, `kitchen-sink-drama`, `cavalier-poets`,
  `Walt Whitman` ho to wahi tag). Jis aadmi ya kitab ka naam sirf mahaul ke liye aaya, wo subject nahi.
- "Which is **not** ...?" wale sawal me jawab (jo galat nikla) subject nahi; **samooh** subject hai.
- **Jodi-milan / list wale sawal** (4 lekhak, 4 kitab): agar sab ek hi lekhak ya kitab ke baare me hain to wahi tag. Alag-alag
  logon ke hon to **saajha samooh** (movement, group, desh ka node) ya period. **Koi ek naam arbitrarily mat uthao.**
  (Jaise Achebe ki 4 kitabon ka kram poochne wala sawal: sahi tag `chinua-achebe`, koi ek kitab nahi.)
- Ek hi surname wale do log (jaise do Samuel Butler, Richardson) ho to sirf surname se match mat karo; naam, initial ya kitab
  ka naam sawal me hona chahiye.
- **Naya node mat banao.** Node na mile to ek sidhi upar chadho, ant me period. Aise sawal report me `Taxonomy gaps` me likho.

**`periodId`: 18 inner period me se ek, ya chhod do.** Hamesha **andar wala** period, bada age kabhi nahi:
`anglo-saxon`, `anglo-norman`, `age-of-chaucer`, `fifteenth-century`, `early-tudor`, `elizabethan`, `jacobean-era`, `caroline`,
`commonwealth`, `restoration-era`, `augustan`, `age-of-sensibility`, `romantic`, `victorian`, `edwardian`, `georgian`, `modern-era`,
`postmodern`.
Bade age (`jacobean`, `restoration`, `modern`, `middle-english`, `renaissance`, `contemporary` ...) **galat** hain.
Gair-British sawal ke liye ye period node bhi valid hain: `american-colonial`, `american-renaissance`, `american-realism`,
`american-modernism`, `american-contemporary`, `iwe-beginnings`, `iwe-poetry`, `iwe-fiction`, `iwe-drama`, `iwe-prose`,
`african-literature`, `caribbean-literature`, `canadian-literature`, `australian-literature`.
**Ye naam period nahi hain, kabhi mat likhna:** `neoclassical`, `postwar`, `postcolonial`, `literary-theory`.
Sirf theory / term ka sawal jiska koi period nahi (trope, paradox, Foucault) -> `periodId` **chhod do** (key hi mat likho).

Period chunne ka kram:
1. Sawal ka apna text jis period ka naam le, wahi.
2. **Kitabon me jahan lekhak ko padhaya jaata hai** wahi, tareekh se upar (Milton, Traherne -> `commonwealth`; Swift, Defoe ->
   `augustan`; Richardson, Fielding, Sterne -> `age-of-sensibility`; Donne -> `jacobean-era`; Conrad -> `edwardian`).
3. Tareekh sirf tab, jab kitabein chup hon.

**`topicId = periodId`** tabhi, jab sach me koi node na mile. Agar 25% se zyada sawal period par aa gaye to tumne sidhi poori
nahi chadhi.

## 6. Report (file ke saath, chhoti aur sahi)

- Kitne sawal; kitne par note; key ka phailaav (a/b/c/d ginti).
- **Faisle**: har sawal jahan key do option maanti thi ya drop thi: kya chuna, kisliye, kis page par dekha (ya `UNVERIFIED`).
- **Chhapai ki galtiyan** (galat option ka naam, sawal me galat jodi, "Nun's Tale" jaisa chhota naam): sawal number aur kya galat hai.
  Text **badla nahi**, sirf bataya.
- **Taxonomy gaps**: kaun sa sawal kis node ki kami ki wajah se period/samooh par rukha.
- **Periods**: kaun sa period kitni baar; jahan tareekh ke bajaye kitab-ki-parampara se rakha wo sawal.
- Jo explanation me "the source" ya similar mila, wo sawal number.

## 7. Dene se pehle khud jaancho

Agar tumhare paas shell hai to repo ka checker chalao (Python 3, koi package nahi):

```bash
python3 tools/pyq/check_upload_file.py <setId>.json
```

Ye wahi sab jaanchta hai jo upload page aur database jaanchte hain. **"No errors" aaye tabhi file do.** Shell na ho to ye
list haath se dekho:

- [ ] Sawal ginti paper ke barabar; har `id` alag; koi sawal do baar nahi.
- [ ] Har sawal me bilkul 4 alag saade string options; `correct_option_id` 0-3.
- [ ] Har sawal me `explanation`; usme "the source" nahi.
- [ ] Har `topicId` CSV me hai; har `periodId` upar ki 18 / non-British list me hai; `neoclassical`, `postwar`, `postcolonial`, `literary-theory` nahi.
- [ ] `level` `"medium"`; `rev` ek poora number; `topics` me har `topic` key maujood.
- [ ] List wale sawal me `\n`; `qtype` thik (`match`, `combination`, `chrono`, `direct`).
- [ ] Jahan key do-option / drop / chhapai-galti thi wahan `note` hai (aur jawab nahi batata); baaki par nahi.
- [ ] File me Devanagari nahi, saari baat simple English me.

## 8. Kya nahi karna

- Sawal, option, jawab ya explanation ke facts apni taraf se mat badlo ya mat gadho. Naya sawal mat jodo.
- Kabhi andaza mat lagao: tag, key, ya source. Pakka na ho to `UNVERIFIED` / `Taxonomy gaps` me likho.
- Master list ke bahar ka id, ya bada age, ya `categoryId` jaisa apna field.
- File ko repo me daalne ki baat mat karo. Login paper ke sawal repo me kabhi nahi jaate (repo public hai).
  Owner file ko `/admin/upload-paper/` se chadhate hain.
