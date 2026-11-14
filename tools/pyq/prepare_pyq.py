#!/usr/bin/env python3
"""
AK Explained: turn a tagged PYQ file (UGC NET previous-year paper) into the file the site loads.

The tagged file arrives with an `answerKey` on every question:
  status "single"             -> one right option (correct_option_id)
  status "multiple_accepted"  -> the official key accepts two or more options
  status "credit_all"         -> the official key gave marks to every candidate
The CBT engine (assets/cbt.js) scores ONE right option per question, so every question that is not
"single" needs a decision from the owner/Claude: which ONE option this site counts, and an explanation that
says so honestly. The decisions live in a small JSON file (kept in the repo as the audit trail):

  { "10": { "correct": 2, "explanation": "The updated UGC answer key accepts both (c) and (d). This test counts (c)..." } }

The key is the question number in the paper; "correct" must be one of the options the official key accepts.

  python3 tools/pyq/prepare_pyq.py --in tagged.json --decisions tools/pyq/decisions/<setId>.json \
      --out assets/questions/<setId>.json

It stops (exit 1) when anything is wrong: a question that is not "single" and has no decision, a decision that picks an
option the key does not accept, an option count other than 4, a repeated id, a topicId or periodId that is not in
supabase/data/taxonomy-master-reference.csv (a periodId must be a `period` node), a topic missing from the topics map.
It never invents a fact: the question text, options, ids and tags are copied exactly as supplied.
Python 3 only, no packages.
"""
import argparse, csv, io, json, os, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
QTYPES = {'direct', 'combination', 'match', 'chrono', 'passage'}
KEEP_Q = ['id', 'questionNumber', 'question', 'options', 'correct_option_id', 'explanation',
          'topic', 'topicId', 'periodId', 'qtype', 'src']


def load_taxonomy():
    path = os.path.join(ROOT, 'supabase', 'data', 'taxonomy-master-reference.csv')
    kinds = {}
    for r in csv.DictReader(io.open(path, encoding='utf-8', newline='')):
        kinds[r['id'].strip()] = r['kind'].strip()
    return kinds


def existing_ids(skip_path):
    """Question ids already used by the other files in assets/ (the build gate needs them unique)."""
    ids = set()
    for sub in ('questions', 'instant'):
        d = os.path.join(ROOT, 'assets', sub)
        if not os.path.isdir(d):
            continue
        for name in os.listdir(d):
            p = os.path.join(d, name)
            if not name.endswith('.json') or os.path.abspath(p) == os.path.abspath(skip_path):
                continue
            try:
                data = json.load(io.open(p, encoding='utf-8'))
            except ValueError:
                continue
            for q in (data if isinstance(data, list) else data.get('questions', [])):
                if isinstance(q, dict) and q.get('id'):
                    ids.add(q['id'])
    return ids


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--in', dest='src', required=True, help='the tagged PYQ file as supplied')
    ap.add_argument('--decisions', help='JSON file with one decision per question that is not "single"')
    ap.add_argument('--out', required=True, help='where to write the site file (assets/questions/<setId>.json)')
    ap.add_argument('--age-name', default='UGC NET English', help='the exam name shown on the test screens')
    a = ap.parse_args()

    d = json.load(io.open(a.src, encoding='utf-8'))
    decisions = {}
    if a.decisions:
        decisions = json.load(io.open(a.decisions, encoding='utf-8'))
    kinds = load_taxonomy()
    errors = []
    def err(msg): errors.append(msg)

    for k in ('setId', 'title', 'paper', 'session', 'topics', 'questions'):
        if k not in d:
            err('the file has no "%s"' % k)
    if errors:
        print('\n'.join(errors)); return 1

    qs = d['questions']
    clash = existing_ids(a.out)
    seen = set()
    used_decisions = set()
    out_qs = []
    for i, q in enumerate(qs):
        n = q.get('questionNumber', i + 1)
        w = 'Q%s' % n
        key = q.get('answerKey') or {}
        status = key.get('status')
        accepted = key.get('accepted_option_ids') or []
        opts = q.get('options')
        if not (isinstance(opts, list) and len(opts) == 4 and all(isinstance(o, str) and o.strip() for o in opts)
                and len(set(o.strip() for o in opts)) == 4):
            err('%s: needs exactly 4 different, non-empty options' % w)
            continue
        if not q.get('explanation'):
            err('%s: no explanation' % w)
        qid = q.get('id')
        if not qid:
            err('%s: no id' % w)
        elif qid in seen:
            err('%s: id %s repeated in this file' % (w, qid))
        elif qid in clash:
            err('%s: id %s is already used in another question file' % (w, qid))
        seen.add(qid)
        if q.get('topicId') not in kinds:
            err('%s: topicId "%s" is not in the master taxonomy' % (w, q.get('topicId')))
        pid = q.get('periodId')
        if pid and kinds.get(pid) != 'period':
            err('%s: periodId "%s" is not a period node' % (w, pid))
        if q.get('qtype') not in QTYPES:
            err('%s: qtype "%s" is not one of %s' % (w, q.get('qtype'), sorted(QTYPES)))
        if q.get('topic') not in d['topics']:
            err('%s: topic "%s" is not in the topics map' % (w, q.get('topic')))

        item = {k: q[k] for k in KEEP_Q if k in q}
        if status == 'single':
            if len(accepted) != 1 or q.get('correct_option_id') != accepted[0]:
                err('%s: status is single but correct_option_id %r does not match the key %r' % (w, q.get('correct_option_id'), accepted))
        elif status in ('multiple_accepted', 'credit_all'):
            dec = decisions.get(str(n))
            if not dec:
                err('%s: the official key is "%s" (accepts options %s). Add a decision for "%s" in the decisions file.' % (w, status, accepted, n))
            else:
                used_decisions.add(str(n))
                c = dec.get('correct')
                if c not in accepted:
                    err('%s: decision picks option %r, but the official key accepts only %s' % (w, c, accepted))
                if not (isinstance(dec.get('explanation'), str) and dec['explanation'].strip()):
                    err('%s: the decision needs an "explanation" that says what this site counts and why' % w)
                item['correct_option_id'] = c
                item['explanation'] = dec.get('explanation', '')
        else:
            err('%s: unknown answerKey status %r' % (w, status))
        if not isinstance(item.get('correct_option_id'), int) or not 0 <= item['correct_option_id'] <= 3:
            err('%s: correct_option_id must be 0 to 3' % w)
        out_qs.append(item)

    for n in decisions:
        if n not in used_decisions:
            err('decision for "%s" is not used: that question is "single" in the file or does not exist' % n)

    if errors:
        print('NOT written. %d problem(s):' % len(errors))
        print('\n'.join('  ' + e for e in errors))
        return 1

    out = {
        'setId': d['setId'],
        'rev': d.get('rev', 1),
        'ageName': a.age_name,
        'setName': 'Paper %s — %s' % (d['paper'], d['session']),
        'level': 'all',
        'levelName': 'Full paper',
        'title': d['title'],
        'exam': d.get('exam'),
        'subject': d.get('subject'),
        'paper': d['paper'],
        'session': d['session'],
        'topics': d['topics'],
        'topicRead': d.get('topicRead') or {},
        'sourceQuestionPaper': d.get('sourceQuestionPaper'),
        'sourceAnswerKey': d.get('sourceAnswerKey'),
        'questions': out_qs,
    }
    out = {k: v for k, v in out.items() if v is not None}
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with io.open(a.out, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print('Wrote %s: %d questions, %d decision(s) applied.' % (a.out, len(out_qs), len(used_decisions)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
