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
     window.akTrack.record({ questionId, topicId, isCorrect, source })
     window.akTrack.recordMany([ {…}, {…} ])

   question_id must be a STABLE id carried by the question
   (never an array index). A row with no questionId is skipped.
   topicId is written as-is, or null when absent.
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
          return {
            user_id: uid,
            question_id: String(it.questionId),
            topic_id: (it.topicId != null && it.topicId !== '') ? String(it.topicId) : null,
            is_correct: !!it.isCorrect,
            source: it.source
          };
        });
        // Fire-and-forget: do not await, swallow any error.
        c.from('attempts').insert(rows).then(function () {}, function () {});
      }, function () { /* ignore */ });
    } catch (e) { /* never throw into the quiz */ }
  }

  function record(it) { recordMany([it]); }

  window.akTrack = { record: record, recordMany: recordMany };
})();
