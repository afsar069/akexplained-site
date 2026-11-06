/* ==========================================================
   AK Explained — attempt tracker (fire-and-forget)
   ----------------------------------------------------------
   One row per answered question, written to the `attempts`
   table ONLY for a logged-in user. It never blocks or slows
   the quiz: the write is not awaited, and any error (logged
   out, offline, not configured) is swallowed. Guests keep
   playing exactly as before; their progress stays in
   localStorage (the engines handle that, not this file).

   Engines call:
     window.akTrack.record({ questionId, topicId, periodId, isCorrect, source })
     window.akTrack.recordMany([ {…}, {…} ])
     window.akTrack.recordRun({ source, bankId, level, totalQuestions, answered, correct })
       -> one row in `quiz_runs` when a quiz is FINISHED (the dashboard's "Quizzes taken").
          Same rules: logged-in only, fire-and-forget, never blocks the quiz. If the table
          is not there yet the insert simply fails and nothing happens.

   question_id must be a STABLE id carried by the question
   (never an array index). A row with no questionId is skipped.
   topicId is written as-is, or null when absent.
   periodId (a `period` node, e.g. 'elizabethan') is written to
   period_id only when the question has one. An untagged question
   sends no period_id at all, so the insert still works on a
   database that does not have the column yet.
   source is 'daily' (Daily quiz) or 'cbt' (MCQ/CBT tests).
   ========================================================== */
(function () {
  'use strict';

  function client() {
    try {
      if (window.akAuth && window.akAuth.configured && window.akAuth.client) return window.akAuth.client;
    } catch (e) { /* ignore */ }
    return null;
  }

  function recordMany(items) {
    try {
      var c = client();
      if (!c || !items || !items.length) return;
      var clean = [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it || !it.questionId) continue;          // need a stable id
        clean.push(it);
      }
      if (!clean.length) return;

      c.auth.getSession().then(function (r) {
        var s = r && r.data && r.data.session;
        if (!s || !s.user) return;                    // logged out: write nothing
        var uid = s.user.id;
        var rows = clean.map(function (it) {
          var row = {
            user_id: uid,
            question_id: String(it.questionId),
            topic_id: (it.topicId != null && it.topicId !== '') ? String(it.topicId) : null,
            is_correct: !!it.isCorrect,
            source: it.source
          };
          if (it.periodId != null && it.periodId !== '') row.period_id = String(it.periodId);
          return row;
        });
        // Fire-and-forget: do not await, swallow any error.
        c.from('attempts').insert(rows).then(function () {}, function () {});
      }, function () { /* ignore */ });
    } catch (e) { /* never throw into the quiz */ }
  }

  function record(it) { recordMany([it]); }

  // One finished quiz. Needs at least one answer and a bank id; anything else is skipped.
  function recordRun(it) {
    try {
      var c = client();
      if (!c || !it || !it.bankId) return;
      var total = it.totalQuestions | 0, answered = it.answered | 0, correct = it.correct | 0;
      if (answered < 1 || total < answered || correct < 0 || correct > answered) return;
      if (it.source !== 'daily' && it.source !== 'cbt') return;
      c.auth.getSession().then(function (r) {
        var s = r && r.data && r.data.session;
        if (!s || !s.user) return;                    // logged out: write nothing
        c.from('quiz_runs').insert({
          user_id: s.user.id,
          source: it.source,
          bank_id: String(it.bankId),
          level: it.level ? String(it.level) : null,
          total_questions: total,
          answered: answered,
          correct: correct
        }).then(function () {}, function () {});
      }, function () { /* ignore */ });
    } catch (e) { /* never throw into the quiz */ }
  }

  window.akTrack = { record: record, recordMany: recordMany, recordRun: recordRun };
})();
