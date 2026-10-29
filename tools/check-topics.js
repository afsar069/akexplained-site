/* ==========================================================
   AK Explained — publish-time topic/id safety check
   ----------------------------------------------------------
   Runs during `npx eleventy` (see eleventy.config.js). It fails
   the build if:
     1. any question's `topicId` is not an id in
        supabase/data/taxonomy-master-reference.csv (the single
        source of truth), or
     2. two questions anywhere share the same `id`
        (question_id must stay globally unique).

   A question with no `topicId` is fine (skipped for check 1).
   A question with no `id` is skipped for check 2 (can't collide).
   This is tools/ code: ignored by the build, not published.
   ========================================================== */
const fs = require('fs');
const path = require('path');

function readValidTopicIds(root) {
  const file = path.join(root, 'supabase/data/taxonomy-master-reference.csv');
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).filter(function (l) { return l.trim() !== ''; });
  lines.shift(); // header: id,name,kind,parent_id,area
  const valid = new Set();
  // The id is the first column and is a slug (no commas/quotes), so a plain
  // split is safe for this column even though names later in the row may quote.
  for (const line of lines) {
    const id = line.split(',')[0].trim();
    if (id) valid.add(id);
  }
  return valid;
}

function listQuestionFiles(root) {
  const out = [];
  for (const dir of ['assets/instant', 'assets/questions']) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) continue;
    for (const name of fs.readdirSync(abs)) {
      if (name.endsWith('.json')) out.push(path.join(dir, name));
    }
  }
  return out;
}

module.exports = function checkTopics(root) {
  root = root || path.join(__dirname, '..');
  const valid = readValidTopicIds(root);
  const files = listQuestionFiles(root);

  const badTopic = [];       // { file, q, topicId }
  const seen = new Map();     // question id -> [files]

  for (const rel of files) {
    const data = JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
    const qs = Array.isArray(data) ? data : (data.questions || []);
    qs.forEach(function (q, i) {
      const qid = q && q.id;
      if (qid) {
        if (!seen.has(qid)) seen.set(qid, []);
        seen.get(qid).push(rel);
      }
      const t = q && q.topicId;
      if (t != null && t !== '' && !valid.has(t)) {
        badTopic.push({ file: rel, q: qid || ('#' + i), topicId: t });
      }
    });
  }

  const dupIds = [];
  for (const [qid, where] of seen) {
    if (where.length > 1) dupIds.push({ id: qid, files: where });
  }

  const errs = [];
  if (badTopic.length) {
    errs.push('Unknown topicId(s) — not found in taxonomy-master-reference.csv (' + badTopic.length + '):');
    badTopic.forEach(function (b) { errs.push('  ' + b.file + '  q=' + b.q + '  topicId=' + b.topicId); });
  }
  if (dupIds.length) {
    errs.push('Duplicate question id(s) across question files (' + dupIds.length + '):');
    dupIds.forEach(function (d) { errs.push('  ' + d.id + '  in ' + d.files.join(', ')); });
  }
  if (errs.length) {
    throw new Error('\n[check-topics] Build stopped — fix these before publishing:\n' + errs.join('\n') + '\n');
  }

  return { files: files.length, validTopics: valid.size };
};
