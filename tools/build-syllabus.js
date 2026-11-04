/* ============================================================
   Build the British-literature syllabus file for the dashboard.

   WHY
   The dashboard's "Your level in English literature" needs to know, per age,
   how many Daily questions make up that age (the denominator for "60% covered")
   and which question-id prefix identifies it. That count lives only in the Daily
   question files, so we read them at build time and write one small JSON the
   browser can fetch: assets/syllabus-british.json.

   THE MODEL (owner's, 2026-11-04)
   British literature = the 20 Daily ages, each worth an equal 5% (20 x 5 = 100%).
   An age is "cleared" when the learner has COVERED at least `coverGate` of its
   questions AND answered at least `accGate` of those correctly (latest answer).
   Five stages, Beginner -> Master, one per 20% band (4 ages each).

   Renaissance and Neoclassical span two ages in the taxonomy, so their questions
   are tagged to other period nodes — the id PREFIX (rn-, nc-) is the only clean
   per-age key, which is why the dashboard groups by prefix, not by period_id.

   The build fails loudly if an age's questions do not share one single prefix,
   so a tagging slip can never ship a wrong denominator.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

// The 20 ages in the site's chronological order (same order as the Daily page /
// home.js). The first age, "Old English", is served by the `anglo-saxon` bank.
const ORDER = [
  'anglo-saxon', 'anglo-norman', 'age-of-chaucer', 'fifteenth-century', 'renaissance',
  'early-tudor', 'elizabethan', 'jacobean', 'caroline', 'commonwealth', 'neoclassical',
  'restoration', 'augustan', 'age-of-sensibility', 'romantic', 'victorian', 'edwardian',
  'georgian', 'modern', 'postmodern'
];

module.exports = function buildSyllabus(root) {
  const dir = path.join(root, 'assets', 'instant');
  const ages = ORDER.map(function (slug) {
    const prefixes = {};
    let total = 0, name = slug;
    ['easy', 'hard'].forEach(function (lvl) {
      const f = path.join(dir, slug + '-' + lvl + '.json');       // the Age bank only, never -literature
      if (!fs.existsSync(f)) return;
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (d.period) name = d.period;
      (d.questions || []).forEach(function (q) {
        total++;
        const m = /^([a-z]+)-/.exec(String(q.id || ''));
        if (m) prefixes[m[1]] = 1;
      });
    });
    const pref = Object.keys(prefixes);
    if (!total) throw new Error('[syllabus] no questions found for age "' + slug + '"');
    if (pref.length !== 1) {
      throw new Error('[syllabus] age "' + slug + '" must share one id prefix, found: ' + JSON.stringify(pref));
    }
    return { slug: slug, name: name, prefix: pref[0], total: total };
  });

  // Prefixes must be unique across ages, or an attempt could count twice.
  const seen = {};
  ages.forEach(function (a) {
    if (seen[a.prefix]) throw new Error('[syllabus] prefix "' + a.prefix + '" used by two ages');
    seen[a.prefix] = 1;
  });

  const out = {
    journey: 'british',
    name: 'British Literature',
    coverGate: 0.6,                                    // must answer 60% of an age's questions
    accGate: 0.6,                                      // ...and get 60% of those right (latest answer)
    ladder: ['Beginner', 'Reader', 'Scholar', 'Critic', 'Master'],
    ages: ages
  };
  fs.writeFileSync(path.join(root, 'assets', 'syllabus-british.json'), JSON.stringify(out, null, 2) + '\n');
  return { ages: ages.length, questions: ages.reduce(function (n, a) { return n + a.total; }, 0) };
};
