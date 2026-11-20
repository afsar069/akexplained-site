/* Video Lessons page (/video-lessons/) ka data.

   Yeh list AK Explained YouTube channel ke ASLI videos ki hai (vidIQ se padhi, 2026-11-20).
   Titles YouTube par jaise chhape hain bilkul waise hi hain (typo bhi), kuch badla nahi (rule 2).
   Channel par aur bhi videos hain; list me nayi line jodne ke liye sirf [id, topic, title, duration] likho.
   - id: YouTube video id (youtu.be/<id>)
   - topic: neeche `topics` me se ek key
   - duration: "M:SS" ya "H:MM:SS" (YouTube par jo dikhta hai)
   Topic ka bucket sirf title dekh kar rakha gaya hai; galat lage to key badal do.
   `yt` = channel ki asli YouTube playlist (vidIQ se mili, 2026-11-20): page par "More on YouTube" link banta hai.
   Wahan jo videos hain woh is list se alag ho sakte hain; link sirf naam ke hisaab se jodi gayi hai. */

const topics = [
  { key: "poems", label: "Poem explanations",
    yt: { id: "PLohpgCZBUVMgTmnYsZBernKOiIxTe6zyT", title: "English Poem in Hindi" },
    icon: '<path d="M20 4C10 5 5.5 10.5 4.5 19.5"/><path d="M20 4c0 8-4.5 11.5-10 11.5H6.5"/><path d="M4 20h3"/>' },
  { key: "novels", label: "Novel summaries",
    icon: '<path d="M12 6.5S10 4.8 6.5 4.8 3 6 3 6v12s1-1.2 3.5-1.2S12 18.5 12 18.5Z"/><path d="M12 6.5s2-1.7 5.5-1.7S21 6 21 6v12s-1-1.2-3.5-1.2S12 18.5 12 18.5Z"/>' },
  { key: "novel-types", label: "Types of novel",
    yt: { id: "PLohpgCZBUVMj0Xl7C50msVS0leNAe8qM_", title: "Types of Novel" },
    icon: '<path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>' },
  { key: "stories", label: "Short stories",
    yt: { id: "PLohpgCZBUVMjoTkP0Lm7Kt8fr7KicZDLe", title: "Short Stories in Hindi" },
    icon: '<path d="M7 3h8l4 4v14H7Z"/><path d="M15 3v4h4"/><path d="M10 12h6M10 16h6"/>' },
  { key: "essays", label: "Essays",
    yt: { id: "PLohpgCZBUVMgord9J__jMEsfNw2J0CoFS", title: "English Essay and in Hindi" },
    icon: '<path d="m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19Z"/><path d="m13 8 3 3"/>' },
  { key: "drama", label: "Plays and drama",
    yt: { id: "PLohpgCZBUVMjL12_F5lJQ3hUPYNCAti5N", title: "English plays/drama" },
    icon: '<path d="M4 5h16v6a8 8 0 0 1-16 0Z"/><path d="M9 10h.01M15 10h.01"/><path d="M9 14.5c1 1 5 1 6 0"/>' },
  { key: "biographies", label: "Biographies of writers",
    yt: { id: "PLohpgCZBUVMjBUe85c08782wnzENsP-uE", title: "Biography" },
    icon: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.9-3.8 3.9-5.8 7.5-5.8s6.6 2 7.5 5.8"/>' },
  { key: "theory", label: "Literary theory and criticism",
    yt: { id: "PLohpgCZBUVMg56rrhB_AdVuJ1vpzjh-OU", title: "Literary Theory / Culture Study" },
    icon: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>' },
  { key: "philosophy", label: "Philosophy",
    yt: { id: "PLohpgCZBUVMiRKr-6ZN1poULNmNCMzLfg", title: "Philosophy" },
    icon: '<circle cx="12" cy="12" r="9"/><path d="M12 8.5a2.6 2.6 0 1 1 1.6 2.4c-.9.5-1.6 1.2-1.6 2.3"/><path d="M12 16.3h.01"/>' },
  { key: "terms", label: "Literary terms and devices",
    yt: { id: "PLohpgCZBUVMiUNKpYYIec0wg-1MrWH6qO", title: "Literary Terms" },
    icon: '<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>' },
  { key: "syllabus", label: "University syllabus",
    icon: '<path d="m12 4 9 4.5-9 4.5-9-4.5L12 4Z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>' },
];

// Landing page par jo 4 video hain (assets/home.js `videos`): yahan sabse upar aate hain.
const featuredIds = ["D9Smtxac0B4", "sQ-PS8MT7cI", "95rzAsRpbEk", "M5gV6mMxf_k"];

const rows = [
  // ---- Poems
  ["D9Smtxac0B4", "poems", "Rime of the Ancient Mariner line by line Hindi explanation | Coleridge | BA & NET", "59:35"],
  ["sQ-PS8MT7cI", "poems", "The Solitary Reaper by William Wordsworth | Line by Line Explain in Hindi", "8:59"],
  ["5aWK0mof_Oc", "poems", "Daffodils' by William Wordsworth: Complete Line-by-Line Analysis & Summary", "6:25"],
  ["jn3TTdJGq-o", "poems", "London, 1802 by William Wordsworth Explained in Hindi | Summary, Analysis & Themes", "4:42"],
  ["ie3vE9zge8E", "poems", "Lines Written a Few Miles Above Tintern Abbey Explained in Hindi | William Wordsworth |", "13:24"],
  ["lVWZykg7LfU", "poems", "Elegy Written in a Country Churchyard by Thomas Gray | Hindi Summary, Theme & Critical Analysis", "8:00"],
  ["EJxVrSD2ng4", "poems", "The Lake Isle of Innisfree by William Butler Yeats | CCS University 2 SEM | Poem Summary in Hindi", "8:56"],
  ["X2IWZtDXknw", "poems", "Son of Man Explained in Hindi | Waste Land by  T.S. Eliot | BA 2nd Sem CCSU", "6:05"],
  ["NbsIrDpMIEk", "poems", "The Easy Way to Understand Endymion by John Keats", "4:46"],
  ["-Rm11uaJ2Hc", "poems", "In Memoriam A. H.H. by Alfred Lord Tennyson Critical Analysis in Hindi | English Literature.", "6:32"],
  ["WlcV_MBUj9E", "poems", "The Lady of Shalott by Alfred Lord Tennyson Short Summary in Hindi", "6:30"],
  ["nzm-fwAJnEQ", "poems", "Fra Lippo Lippi Robert Browning Summary in Hindi | English Literarture", "5:20"],
  ["OEq4hIb6j9U", "poems", "A POEM OF DEDICATION BY NISSIM EZEKIEL Explain in Hindi | English Literature", "11:13"],
  ["CXLv3kZ9Y8I", "poems", "Anxiety by A.K. Ramanujan | Anxiety explain In Hindi | Anxiety In English Literature", "8:34"],
  ["Dp78YlMV3uQ", "poems", "The Unrest of Desire by Keki N. Daruwalla explain in Hindi | English LIterature", "7:09"],
  ["KvUhm-cAvLA", "poems", "Mac Flecknoe | Mac Flecknoe Summary in Hindi | Mac Flecknoe Mock-Heroic Epic by Dryden", "3:58"],
  ["6g33jCf_5bY", "poems", "Keeping Quite | Keeping Quite by Pablo Neruda | Keeping Quite Summary in Hindi | Class 12", "7:25"],
  ["gfGWtzJ2Q6U", "poems", "The Elementary School Classroom in a Slum | The Elementary School Classroom in a Slum Summary", "15:14"],
  ["crhFXNC1l5Y", "poems", "Aunt Jennifer's Tigers | Aunt Jennifer's Tigers by  Adrienne Rich | Aunt Jennifer's Tigers in Hindi", "6:00"],

  // ---- Novels
  ["L5SFeJdi6rM", "novels", "Why Is The Mill on the Floss So Heartbreaking? | Complete Hindi Explanation", "7:24"],
  ["Lmk2KCFycKM", "novels", "Far From the Madding Crowd | Far From the Madding Crowd By Thomas Hardy Summary in Hindi", "9:11"],
  ["CenkZIhQIbk", "novels", "The Grapes of Wrath | The Grapes of Wrath by John Steinbeck | The Grapes of Wrath Summary in Hindi", "5:06"],
  ["OHQufZkKeBQ", "novels", "Nectar in a Sieve | Nectar in a Sieve by Kamala Markandaya | Nectar in a Sieve Summary in Hindi", "8:37"],
  ["k92UpDpx394", "novels", "The Room on the Roof | The Room on the Roof by Ruskin Bond | The Room on the Roof Summary in Hindi", "4:38"],
  ["DVfeF8ePyr0", "novels", "A Tale of Two Cities | A Tale of Two Cities by Charles Dickens | A Tale of Two Cities Summary", "5:33"],
  ["WHSnaZ1XyTc", "novels", "The Old Man and the Sea | The Old Man and the Sea by  Ernest Hemingway Summary in Hindi", "4:18"],
  ["xuTnbgPYz80", "novels", "The Home and the World | The Home and the World by Rabindranath Tagore Summary in Hindi", "4:40"],
  ["T8s5qPnkTU4", "novels", "The Girl Who Wanted Blue Eyes | Toni Morrison’s Darkest Story | The Bluest Eye Summary In Hindi", "5:03"],
  ["1LyMHR1rsik", "novels", "David Copperfield | David Copperfield By Charles Dickens in Hindi summary with Character analysis", "20:55"],
  ["Wb6RrtSGwfk", "novels", "The Financial Expert by R K Narayan | The Financial Expert Summary in Hindi", "8:27"],

  // ---- Plays and drama
  ["ta6j7AAnHAA", "drama", "The Lion and the Jewel Explained in Hindi | Wole Soyinka’s Famous African Drama", "7:48"],
  ["iXPzoQkmKkE", "drama", "Morning Raga | Morning Raga by Mahesh Dattani | Morning Raga Summary In Hindi | Morning Raga BA 3", "11:17"],
  ["StbnbHPJ6Zs", "drama", "Tragedy | Greek Tragedy | Roman Tragedy | Classical Tragedy | English Literature | for BA/MA/NET", "13:16"],
  ["57k7BYNg6Vs", "drama", "Comedy | Comedy Drama | types of comedy | comedy in English literature for BA/MA/NET", "6:47"],
  ["ZiukL97GFpQ", "drama", "Elements of Drama | What is Drama ? | Drama In English Literature", "13:28"],
  ["MbJbymINyeg", "drama", "Elements of Drama | Elements of Drama in Hindi | Elements of Drama in English Literature BA 3 CCSU", "10:19"],
  ["0Y8w0qf_bC4", "drama", "Expressionist Drama | What is Expressionism? | English Literature Expressionism", "4:42"],

  // ---- Short stories and essays
  ["3bz9I_07Ma0", "stories", "A Rose for Emily | A Rose for Emily by William Faulkner | A Rose for Emily Summary In Hindi", "4:07"],
  ["CHUQFpWels8", "stories", "Kbuliwala by Rabindranath Tagore English Literature", "19:43"],
  ["jTfBCGKYz08", "stories", "Pret | भूत | Short Story by Anton Chekhov | हिंदी कहानियां | Updated", "8:19"],
  ["yPhNZbtUuIg", "stories", "The Lament | The Lament by Anton Chekhov complete story in Hindi", "12:33"],
  ["k4Q7QxnHjAc", "stories", "The Lament | The Lament by Anton Chekhov in Hindi | The Lament Short Story CCSU BA 1", "6:27"],
  ["mCz5DQZkqek", "stories", "The Last Leaf | The Last Leaf By Short story by O. Henry Whole story in Hindi | आखरी पत्ता", "16:01"],
  ["ftDE5T25jj0", "stories", "अमृतसर आ गया है | Amritsar AA Gya hai By Bhisham Sahani Full Audio Book", "26:13"],
  ["Uqzdhz5ETfE", "stories", "THE HOME COMING | by RABINDRANATH TAGORE in Hindi | English Literature", "10:13"],
  ["-UTqy7rvZlQ", "stories", "A flight of Pigeons by Ruskin Bond | A flight of Pigeons Summary in Hindi", "5:06"],
  ["k7hyDjo45iM", "stories", "A Hot Noon in Malabar | A hot noon in Malabar In English Literature | A Hot noon in Malabar In Hindi", "9:13"],
  ["k6Ky7r95-Yo", "essays", "An Apology for idlers by R. L. Stevenson short summary in Hindi and English", "13:58"],
  ["AuPnCUdfjBw", "essays", "On Running After one's Hat by G. K. Chesterton short summary in Hindi", "6:42"],
  ["RC8gsYeI0vM", "essays", "On shaking Hands by Alfred George Gardiner short summary  in Hindi", "7:08"],
  ["1kyhH80iQak", "essays", "On Doing Nothing by J. B. Priestley short summary  in Hindi", "9:17"],
  ["cdXx9TFnSI0", "essays", "Patriotism Beyond Politics and Religion  by A. P. J. Abdul Kalam for BA 1 CCSU Meerut", "5:55"],
  ["7_WMyh6BPtY", "essays", "Professions for Women | Professions for Women By Virginia  Woolf Explain In Hindi BA 1 CCSU Meerut", "7:03"],

  // ---- Theory, criticism and thought
  ["95rzAsRpbEk", "theory", "क्या भाषा कभी सच बोलती है? | Paul de Man Theory Explained in Hindi", "12:07"],
  ["94nyij4f3rw", "theory", "Hélène Cixous | Biography of Hélène Cixous | Philosophy of Hélène Cixous in English literature", "8:02"],
  ["ki9fGYBATfg", "theory", "Jean Baudrillard | Jean Baudrillard Philosophy | Jean Baudrillard Major Concepts in Literature", "9:10"],
  ["VM4VxhOGQnY", "theory", "Michel Foucault | Philosophy of Michel Foucault | Biography of Michel Foucault | English Literature", "16:58"],
  ["2x0MegP5Fvw", "philosophy", "Jean-Paul Sartre | Jean-Paul Sartre Biography | Jean-Paul Sartre Philosophy | Sartre Existentialism", "12:17"],
  ["0gh0dbyQnj0", "philosophy", "Friedrich Nietzsche | Philosophy of Friedrich Nietzsche | Biography of Friedrich Nietzsche", "13:49"],
  ["j8tCO0vQNcM", "philosophy", "Epicurus | Biography of Epicurus | Philosophy of Epicurus in English Literature", "6:41"],
  ["rjRcmIySa8c", "philosophy", "The Republic | The Republic Book Summary | The Republic By Plato in HIndi", "7:00"],
  ["lMwkqt-boIo", "theory", "Langue and Parole | Ferdinand De Saussure | In HIndi | English Literature", "3:12"],
  ["e1c6vLXT9Ho", "theory", "F. R. Leavis | F. R. Leavis New Criticism | F. R. Leavis  Theory | F. R. Leavis in Literature", "6:55"],
  ["wRoYfK8Kz3I", "theory", "What is Postmodernism | PostModernism In English Literature | PostModernism Literary theory.", "11:22"],
  ["zMIaKV1N7c0", "theory", "Psychoanalytic Criticism | Psychoanalytic Theory | Psychoanalytic criticism in English Literature", "17:36"],
  ["LGCyD4hYZ3A", "theory", "Humanism | Liberal Humanism | Humanist Literary theory in English Literature in Hindi.", "8:13"],
  ["gQOhZJ7OMX8", "theory", "Ecocriticism | Ecocriticism or Green Studies | Ecocriticism In English Literature | Ecocriticism NET", "8:06"],
  ["IwZEKlEK-y8", "theory", "Modernism | Modernism In English Literature | 20th Century English Literature In Hindi | NET English", "15:28"],

  // ---- Literary terms and forms
  ["1xgIzA-FfIU", "terms", "What is a Motif in Literature? | Literary Devices Explained", "2:56"],
  ["4sfao4BrOok", "terms", "Foreshadowing Explained in Hindi | BA & NET English Literature", "3:36"],
  ["xuXBUSKUyT0", "terms", "What is a foil character in English literature? | Easy Definition & Examples", "3:47"],
  ["vxOaXsfhqAM", "terms", "Flashback (Analepsis) Explained in Easy Hindi | Literary Devices", "3:45"],
  ["ox_p5F49gtQ", "novel-types", "Regional novel  |  Regional Novel in English Literature |  Regional Novel Types and In Hindi", "4:17"],
  ["BLuPCV50yD0", "novel-types", "Science Fiction | Science Fiction in Hindi | Science Fiction Types  | TGT PGT NET", "8:01"],
  ["EXOyUD1Fc-M", "terms", "Kinds of Characterization | Characters | Kinds of Characters | Characterization in Hindi", "4:49"],
  ["BTP69QCNN2A", "terms", "What is narrative technique | Kinds of narrative technique |  narrative technique In Literature", "4:38"],
  ["S5i3AO6_YGA", "novel-types", "Historical novel | Historical novel Types | Historical novel explained in Hindi for BA MA NET", "4:14"],
  ["nlKThL_tk6w", "novel-types", "Picaresque novel | Picaresque novel Explain In Hindi | Picaresque novel In English Literature", "4:51"],
  ["V9k7a4N60dM", "novel-types", "Gothic novel | Gothic novel explained in Hindi | Gothic novel in  English NET/JRF TGT PGT", "2:51"],
  ["B_3556oDM7k", "terms", "What is short story | types of short story | Elements of short story Explain in hindi", "13:19"],
  ["FKJaPIFZat0", "terms", "Elements of Short Stories | What is Short Story Explain In Hindi for BA 1st year CCS University", "8:30"],
  ["bNVN-lJyb_8", "terms", "Types of Prose and Prose Style | What is Prose and Prose Style in Hindi for CCS University BA 1st", "17:04"],
  ["HafttlePbXk", "terms", "What is Ballad ? | explain Ballad in Hindi and English | Ballad in English Literature", "2:14"],
  ["IXhtO-a-MZs", "terms", "what is lyric ? | lyric explain in Hindi and English | lyric literary form", "2:30"],
  ["wocGX5Wy6O0", "terms", "What is Theme ?| Definition of Theme | Theme In Novel and Short Stories For BA 1st CCSU Meerut", "4:49"],
  ["lDlWXsf02xw", "terms", "What is imagery? | Types Of Imagery | Imagery in Literature | Example of Imagery in Hindi", "8:25"],
  ["x2cbyuwcCyE", "terms", "Rhetoric and Prosody | Rhetoric and Prosody in Hindi | Rhetoric and ProsodyExplain  BA 2 CCSU Meerut", "6:23"],
  ["PSMxAP1jCAE", "terms", "What is Plot in Fiction | Types of Plot in Hindi | Elements of Plot Explain Hindi | Plot in Hindi", "5:44"],

  // ---- Writers' lives
  ["M5gV6mMxf_k", "biographies", "Franz Kafka Explained in Hindi | Biography, Works & The Dark World of Kafka", "10:27"],
  ["qBCTEndWlGM", "biographies", "William Shakespeare | Biography of William Shakespeare | Works of William Shakespeare", "10:00"],
  ["UqKVfP5kMIk", "biographies", "Oscar Wilde | Biography of Oscar Wilde | Works & Contribution in English Literature", "8:21"],
  ["DRJiS0BeDFY", "biographies", "John Milton | Biography of John Milton | John Milton In English Literature", "4:55"],
  ["_fq6jSkg2qQ", "biographies", "Virginia Woolf | Biography of Virginia Woolf | Works of Virginia Woolf", "6:57"],
  ["MgV9icrr3DM", "biographies", "Mulk Raj Anand | Mulk Raj Anand Biography and Works In Hindi For PGT NET English Literature", "24:24"],
  ["FzVEbqoudGs", "biographies", "Jayanta Mahapatra | Biography of Jayanta Mahapatra | Life and Works Of Jayanta Mahapatra", "6:25"],
  ["yFfYp4KcB8c", "biographies", "Nissim Ezekiel | Biography of Nissim Ezekiel | Life and Works of Nissim Ezekiel in Hindi", "7:00"],
  ["n-3EeHpZePA", "biographies", "Vikram Seth | Vikram Seth Biography | Vikram Seth Works and Life | Vikram Seth Biography in Hindi", "4:20"],
  ["QnWV6mDlFR0", "biographies", "Biography of Sarojini Naidu | Life and Wors of Sarojini Naidu | Sarojini Naidu In Indian English Lit", "5:31"],

  // ---- Syllabus help
  ["K6pEeO6vi8w", "syllabus", "CCS University BA 1st Semester English Complete Syllabus 2025 | NEP Pattern", "2:26:49"],
];

const known = new Set(topics.map((t) => t.key));
const seen = new Set();
rows.forEach(([id, topic]) => {
  if (!known.has(topic)) throw new Error("videoLessons: unknown topic '" + topic + "' for " + id);
  if (seen.has(id)) throw new Error("videoLessons: video listed twice: " + id);
  seen.add(id);
});
featuredIds.forEach((id) => {
  if (!seen.has(id)) throw new Error("videoLessons: featured video not in the list: " + id);
});

const all = rows.map(([id, topic, title, duration]) => ({ id, topic, title, duration }));
const featured = featuredIds.map((id) => all.find((v) => v.id === id));
const order = topics.map((t) => t.key);
const rest = all.filter((v) => !featuredIds.includes(v.id))
  .sort((a, b) => order.indexOf(a.topic) - order.indexOf(b.topic)); // tiles ke order me (stable sort)

module.exports = {
  // Pehle landing page wale 4, phir baaki topic ke order me.
  videos: featured.concat(rest),
  topics: topics.map((t) => ({ ...t, count: all.filter((v) => v.topic === t.key).length })),
  total: all.length,
};
