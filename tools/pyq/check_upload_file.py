#!/usr/bin/env python3
"""
AK Explained: check a PYQ question file BEFORE it goes to /admin/upload-paper/.

It runs the same checks the upload page and the database run (assets/upload-paper.js, trigger
mcq_papers_check_body), plus the site's own rules for a PYQ file (tags are real master nodes,
inner period only, no Devanagari, a note must not give the answer away, and so on).

  python3 tools/pyq/check_upload_file.py <file.json> [--taxonomy path/to/taxonomy-master-reference.csv]

Exit 0 = no errors (warnings may still be printed). Exit 1 = fix the errors first.
Python 3 only, no packages. Instruction for the generator: tools/pyq/PYQ-TAGGER-INSTRUCTIONS.md
"""
import argparse, csv, io, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
QTYPES = {'direct', 'combination', 'match', 'chrono', 'passage'}
LEVELS = {'easy', 'medium', 'hard'}
DEVANAGARI = re.compile('[ऀ-ॿ]')
# Broad ages: never a periodId (the 18 inner periods are used instead). Error for the three traps, warning for the rest.
BROAD_ERROR = {'jacobean', 'restoration', 'modern'}
BROAD_WARN = {'old-english', 'middle-english', 'renaissance', 'augustan-age', 'romantic-age', 'victorian-age', 'contemporary'}
SOURCE_WORDS = re.compile(r'\b(the source|given in the source|according to the (pdf|paper|source)|as per the (pdf|paper|source))\b', re.I)
LETTER_IN_NOTE = re.compile(r'\([a-d]\)|\boption\s+\(?[a-d1-4]\)?\b|\b(is|are) (the )?(right|correct)\b', re.I)


def load_taxonomy(path):
    kinds = {}
    for r in csv.DictReader(io.open(path, encoding='utf-8', newline='')):
        kinds[r['id'].strip()] = r['kind'].strip()
    return kinds


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('file')
    ap.add_argument('--taxonomy', default=os.path.join(ROOT, 'supabase', 'data', 'taxonomy-master-reference.csv'))
    a = ap.parse_args()

    errors, warns = [], []
    def err(m): errors.append(m)
    def warn(m): warns.append(m)

    try:
        raw = io.open(a.file, encoding='utf-8').read()
        data = json.loads(raw)
    except Exception as e:
        print('NOT READABLE JSON: %s' % e); return 1
    if DEVANAGARI.search(raw):
        err('the file contains Devanagari letters. Use English only (Hinglish is for chat, not for files).')
    if not os.path.exists(a.taxonomy):
        print('taxonomy file not found: %s (use --taxonomy)' % a.taxonomy); return 1
    kinds = load_taxonomy(a.taxonomy)

    # Shape: the full object is expected. A bare list is accepted by the upload page, but then no level/rev/topics are known.
    if isinstance(data, list):
        warn('this is a bare list of questions. The upload page accepts it, but the full object (setId, level, topics...) is better.')
        qs, top = data, {}
    elif isinstance(data, dict):
        qs, top = data.get('questions'), data
    else:
        print('This is not a question file.'); return 1
    if not isinstance(qs, list) or not qs:
        print('It has no questions.'); return 1

    topics_map = top.get('topics') if isinstance(top.get('topics'), dict) else {}
    if top:
        for k in ('setId', 'rev', 'level', 'setName', 'title', 'ageName', 'topics'):
            if k not in top:
                err('the file has no "%s"' % k)
        if top.get('level') not in LEVELS:
            err('level must be easy, medium or hard (the database refuses "all"). Use "medium". It says %r.' % (top.get('level'),))
        if top.get('rev') is not None and not (isinstance(top.get('rev'), int) and top['rev'] >= 1):
            err('rev must be a whole number, 1 or more')
        for bad in ('answerKey', 'correctAnswer', 'categoryId', 'answerStatus', 'originalAnswer'):
            if bad in top:
                warn('top-level key "%s" is not used by the site' % bad)

    seen_id, seen_q = set(), set()
    n_period_fallback = 0
    spread = {}
    n_notes = 0
    for i, q in enumerate(qs):
        w = 'Q%s' % (q.get('questionNumber', i + 1) if isinstance(q, dict) else i + 1)
        if not isinstance(q, dict):
            err('%s: is not a question' % w); continue
        qid = q.get('id')
        if not qid: err('%s: has no id' % w)
        elif qid in seen_id: err('%s: id %s is used twice' % (w, qid))
        else: seen_id.add(qid)
        if qid and not re.match(r'^[a-z0-9]+(-[a-z0-9]+)*$', qid): warn('%s: id "%s" should be lower-case letters, digits and hyphens' % (w, qid))

        stem = str(q.get('question') or '').strip()
        if not stem: err('%s: has no question text' % w)
        elif stem in seen_q: err('%s: this question is in the file twice' % w)
        else: seen_q.add(stem)

        opts = q.get('options')
        if not (isinstance(opts, list) and len(opts) == 4 and all(isinstance(o, str) for o in opts)):
            err('%s: options must be a list of exactly 4 plain strings (not objects, not {"key","text"})' % w)
        else:
            o = [x.strip() for x in opts]
            if any(not x for x in o): err('%s: an option is empty' % w)
            if len(set(o)) != 4: err('%s: two options are the same' % w)
            for x in o:
                if re.match(r'^\(?[A-Da-d1-4][\).]\s', x): warn('%s: option "%s" starts with a letter or number label. The site adds its own labels.' % (w, x[:20])); break
        cid = q.get('correct_option_id')
        if not (isinstance(cid, int) and not isinstance(cid, bool) and 0 <= cid <= 3):
            err('%s: correct_option_id must be one option, 0 to 3 (the site counts ONE right option; a dropped or two-answer key needs a decision)' % w)
        else:
            spread[cid] = spread.get(cid, 0) + 1

        ex = str(q.get('explanation') or '').strip()
        if not ex: err('%s: has no explanation' % w)
        elif SOURCE_WORDS.search(ex): warn('%s: the explanation mentions "the source" / the PDF. Students should not see that.' % w)

        tid = q.get('topicId')
        if not tid: err('%s: has no topicId' % w)
        elif tid not in kinds: err('%s: topicId "%s" is not a node of the master taxonomy' % (w, tid))
        pid = q.get('periodId')
        if pid:
            if kinds.get(pid) != 'period': err('%s: periodId "%s" is not a period node of the master taxonomy' % (w, pid))
            if pid in BROAD_ERROR: err('%s: periodId "%s" is a broad age. Use the inner period (jacobean-era, restoration-era, modern-era).' % (w, pid))
            elif pid in BROAD_WARN: warn('%s: periodId "%s" is a broad age. Use the inner period if one fits.' % (w, pid))
            if tid == pid: n_period_fallback += 1
        if q.get('qtype') not in QTYPES: err('%s: qtype must be one of %s (it says %r)' % (w, sorted(QTYPES), q.get('qtype')))
        if topics_map and q.get('topic') not in topics_map: err('%s: topic "%s" is not in the file\'s topics map' % (w, q.get('topic')))
        if not q.get('src'): warn('%s: has no src (e.g. "UGC NET English Paper II, June 2013")' % w)
        for bad in ('answerKey', 'correctAnswer', 'categoryId', 'answerStatus', 'originalAnswer', 'number'):
            if bad in q: warn('%s: key "%s" is not used by the site. Remove it.' % (w, bad)); break

        note = q.get('note')
        if note is not None:
            n_notes += 1
            if not isinstance(note, str) or not note.strip(): err('%s: note must be a short sentence or left out' % w)
            else:
                if len(note) > 220: err('%s: note is %d characters. Keep it to one short line (220 or less).' % (w, len(note)))
                if LETTER_IN_NOTE.search(note): err('%s: the note must not name an option or say which is right. It shows during the test.' % w)

    total = len(qs)
    if n_period_fallback > total * 0.25:
        warn('%d of %d questions are tagged at the period itself. Climb the ladder again (work, writer, concept) before using the period.' % (n_period_fallback, total))
    if spread and max(spread.values()) > total * 0.5:
        warn('one option position is right in more than half the questions: %s. Check the key.' % dict(sorted(spread.items())))

    print('%s: %d questions, %d with a note, key spread %s' % (os.path.basename(a.file), total, n_notes, dict(sorted(spread.items()))))
    for m in warns: print('  warning: ' + m)
    if errors:
        print('NOT READY. %d error(s):' % len(errors))
        for m in errors[:60]: print('  ERROR: ' + m)
        if len(errors) > 60: print('  ... and %d more' % (len(errors) - 60))
        return 1
    print('No errors. This file can go to /admin/upload-paper/.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
