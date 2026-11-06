/* ============================================================
   Build the British-literature syllabus file for the dashboard.

   WHY
   The dashboard's "Your level in English literature" needs to know, per age,
   how many Daily questions make up that age (the denominator for "60% covered")
   and which question-id prefix identifies it. That count lives only in the Daily
   question files, so we read them at build time and write one small JSON the
   browser can fetch: assets/syllabus-british.json.

   THE MODEL (owner's, 2026-11-04; MCQs added 2026-11-06)
   British literature = the 20 ages, each worth an equal 5% (20 x 5 = 100%).
   An age is "cleared" when the learner has COVERED at least `coverGate` of its
   questions AND answered at least `accGate` of those correctly (latest answer).
   Five stages, Beginner -> Master, one per 20% band (4 ages each).

   WHAT "ITS QUESTIONS" MEANS (owner, 2026-11-06: MCQ answers must count too)
   An age's pool = its Daily questions + the questions of its LIVE MCQ sets.
   So a Daily answer and an MCQ answer in the same age count the same way,
   for coverage and for accuracy. A set that is not live is not in the pool.
   The MCQ registry (_data/mcqSpec.json) lists the same 20 ages in the same
   order as ORDER below (CLAUDE.md, section 3), so the two lists are matched by
   position; the MCQ age slug can differ from the Daily slug (old-english is
   served by the anglo-saxon Daily bank, augustan-age by augustan, and so on).

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

// The live MCQ questions of each age, from the registry and the question files.
// Returns [{ slug, total }] in registry order (one per age; total 0 = no live set yet).
function mcqPools(root) {
  const spec = JSON.parse(fs.readFileSync(path.join(root, '_data', 'mcqSpec.json'), 'utf8'));
  const qdir = path.join(root, 'assets', 'questions');
  return (spec.ages || []).map(function (age) {
    let total = 0;
    const ids = {};
    (age.sets || []).forEach(function (set) {
      if (!set.live) return;                                    // only live sets count
      const setId = age.slug + '-set-' + set.n;
      (set.levels || []).forEach(function (lvl) {
        const f = path.join(qdir, setId + '-' + lvl + '.json');
        if (!fs.existsSync(f)) throw new Error('[syllabus] live MCQ set file missing: ' + path.relative(root, f));
        const d = JSON.parse(fs.readFileSync(f, 'utf8'));
        (d.questions || []).forEach(function (q) {
          const ok = new RegExp('^' + age.slug.replace(/[-]/g, '\\-') + '-set-' + set.n + '-[em]-\\d+$').test(String(q.id || ''));
          if (!ok) throw new Error('[syllabus] MCQ id "' + q.id + '" does not look like ' + setId + '-<e|m>-NN');
          if (ids[q.id]) throw new Error('[syllabus] MCQ id used twice: ' + q.id);
          ids[q.id] = 1;
          total++;
        });
      });
    });
    return { slug: age.slug, total: total };
  });
}

module.exports = function buildSyllabus(root) {
  const dir = path.join(root, 'assets', 'instant');
  const mcq = mcqPools(root);
  if (mcq.length !== ORDER.length) {
    throw new Error('[syllabus] the MCQ registry has ' + mcq.length + ' ages but the Daily list has ' + ORDER.length +
      ' — the two lists must stay in step (CLAUDE.md, section 3)');
  }
  const ages = ORDER.map(function (slug, idx) {
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
    // total = the whole pool the dashboard measures (Daily + live MCQ).
    return {
      slug: slug, name: name, prefix: pref[0],
      dailyTotal: total, mcqSlug: mcq[idx].slug, mcqTotal: mcq[idx].total,
      total: total + mcq[idx].total
    };
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
  return {
    ages: ages.length,
    questions: ages.reduce(function (n, a) { return n + a.dailyTotal; }, 0),
    mcq: ages.reduce(function (n, a) { return n + a.mcqTotal; }, 0),
    mcqAges: ages.filter(function (a) { return a.mcqTotal > 0; }).map(function (a) { return a.slug + '<-' + a.mcqSlug + ' (' + a.mcqTotal + ')'; })
  };
};
