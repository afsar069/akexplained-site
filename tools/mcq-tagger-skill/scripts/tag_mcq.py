#!/usr/bin/env python3
"""tag_mcq.py — tag + check an MCQ JSON file for AK Explained's quiz engine.

Self-contained: needs only Python 3 (no packages) and the bundled
references/taxonomy-master-reference.csv next to this script's folder.

It does the safe, mechanical parts of tagging and then checks the file against the
exact three things the website's build enforces:
  1. every topicId is a real id in taxonomy-master-reference.csv
  2. every periodId is a node of kind = period
  3. no two questions share an id

Typical use (single-age set, e.g. a Romantic Age set):
    python3 scripts/tag_mcq.py romantic-age-set-2-easy.json romantic-age-set-2-medium.json \
        --period romantic --fallback --assign-ids --write

Flags:
    --period <id>   stamp this periodId on every question that has none (single-age set)
    --age <slug>    same, but resolve the single period from an age slug (e.g. old-english -> anglo-saxon)
    --fallback      where a question has no topicId, set topicId = its periodId (the safe rough tag)
    --assign-ids    fill a missing id as <setId>-<e|m|h>-NN, continuing from the highest already used
    --write         save the changes back into the file(s); without it, dry run (report only)
    --indent <n>    JSON indent when writing (default 2, matching assets/questions/)

Lookups (no files needed):
    --list-periods          print every valid periodId
    --find "<text>"         find topic ids whose name contains <text>

Exit code is non-zero if any ERROR is found (so it can gate a publish).
"""
import argparse
import csv
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(HERE, '..', 'references', 'taxonomy-master-reference.csv')

# One age slug -> its single period, for the unambiguous single-age sets. Ambiguous
# ages (middle-english, renaissance, modern, augustan-age) are left out on purpose:
# pass --period for those, because the set could sit in either child period.
AGE_TO_PERIOD = {
    'old-english': 'anglo-saxon',
    'anglo-norman': 'anglo-norman',
    'age-of-chaucer': 'age-of-chaucer',
    'fifteenth-century': 'fifteenth-century',
    'early-tudor': 'early-tudor',
    'elizabethan': 'elizabethan',
    'jacobean': 'jacobean-era',
    'caroline': 'caroline',
    'commonwealth': 'commonwealth',
    'restoration': 'restoration-era',
    'romantic-age': 'romantic',
    'romantic': 'romantic',
    'victorian-age': 'victorian',
    'victorian': 'victorian',
    'edwardian': 'edwardian',
    'georgian': 'georgian',
    'contemporary': 'postmodern',
    'postmodern': 'postmodern',
}

# the key order the site's own question files use; unknown keys are kept after these
KEY_ORDER = ['id', 'question', 'options', 'correct_option_id', 'explanation',
             'topic', 'topicId', 'periodId', 'qtype', 'passageId', 'read', 'src']

LEVEL_LETTER = {'easy': 'e', 'medium': 'm', 'hard': 'h'}


def load_taxonomy():
    if not os.path.exists(CSV_PATH):
        sys.exit('ERROR: cannot find %s' % CSV_PATH)
    rows = list(csv.DictReader(open(CSV_PATH, encoding='utf-8', newline='')))
    by_id = {r['id']: r for r in rows}
    periods = {r['id'] for r in rows if r['kind'] == 'period'}
    # the 10 broad British AGE nodes are also kind=period, so the build accepts them,
    # but they are the wrong rung for the dashboard — warn, don't fail.
    broad = {r['id'] for r in rows if r['kind'] == 'period' and r['parent_id'] == 'british-literature'}
    return by_id, periods, broad


def questions_of(data):
    """Return (questions list, 'array' | 'object') so we can write it back the same way."""
    if isinstance(data, list):
        return data, 'array'
    if isinstance(data, dict) and isinstance(data.get('questions'), list):
        return data['questions'], 'object'
    return None, None


def reorder(q):
    out = {}
    for k in KEY_ORDER:
        if k in q:
            out[k] = q[k]
    for k in q:
        if k not in out:
            out[k] = q[k]
    return out


def blank(v):
    return v is None or (isinstance(v, str) and v.strip() == '')


def main():
    ap = argparse.ArgumentParser(add_help=True, description='Tag and check an AK Explained MCQ JSON file.')
    ap.add_argument('files', nargs='*', help='the question JSON file(s)')
    ap.add_argument('--period', help='periodId to stamp on questions that have none')
    ap.add_argument('--age', help='age slug to resolve a single period from (single-age sets)')
    ap.add_argument('--fallback', action='store_true', help='set topicId = periodId where topicId is missing')
    ap.add_argument('--assign-ids', action='store_true', help='fill missing question ids')
    ap.add_argument('--write', action='store_true', help='write changes back (default: dry run)')
    ap.add_argument('--indent', type=int, default=2, help='JSON indent when writing (default 2)')
    ap.add_argument('--list-periods', action='store_true', help='print every valid periodId and exit')
    ap.add_argument('--find', metavar='TEXT', help='find topic ids whose name contains TEXT and exit')
    args = ap.parse_args()

    by_id, periods, broad = load_taxonomy()
    warnings = []

    if args.list_periods:
        print('Valid periodId values (kind = period):\n')
        for pid in sorted(periods):
            print('  %-22s %s' % (pid, by_id[pid]['name']))
        return 0

    if args.find:
        needle = args.find.lower()
        hits = [r for r in by_id.values() if needle in r['name'].lower() or needle in r['id'].lower()]
        if not hits:
            print('No topic id matches %r.' % args.find)
            return 0
        print('%d match(es) for %r (copy the id exactly):\n' % (len(hits), args.find))
        for r in sorted(hits, key=lambda r: (r['area'], r['name']))[:60]:
            print('  %-28s  %-10s  %s' % (r['id'], r['kind'], r['name']))
        if len(hits) > 60:
            print('  ... and %d more; narrow the search.' % (len(hits) - 60))
        return 0

    if not args.files:
        ap.error('give at least one JSON file (or use --list-periods / --find)')

    # resolve the period to stamp
    stamp_period = args.period
    if args.age and not stamp_period:
        stamp_period = AGE_TO_PERIOD.get(args.age)
        if not stamp_period:
            sys.exit('ERROR: --age %r is ambiguous or unknown here; pass --period <id> instead '
                     '(see references/period-nodes.md)' % args.age)
    if stamp_period and stamp_period not in periods:
        sys.exit('ERROR: --period %r is not a valid period node. Run --list-periods.' % stamp_period)
    if stamp_period in broad:
        warnings.append('--period %r is a broad AGE node; the build accepts it but the dashboard '
                        'wants the inner period (see references/period-nodes.md).' % stamp_period)

    errors, notes = [], []
    seen_ids = {}       # id -> "file:qindex"
    totals = dict(files=0, questions=0, specific=0, fallback=0, no_period=0, ids_assigned=0, periods={})

    for path in args.files:
        if not os.path.exists(path):
            errors.append('%s: file not found' % path)
            continue
        data = json.load(open(path, encoding='utf-8'))
        qs, shape = questions_of(data)
        if qs is None:
            errors.append('%s: not an MCQ file (no questions array)' % path)
            continue
        totals['files'] += 1
        set_id = data.get('setId') if isinstance(data, dict) else None
        level = (data.get('level') if isinstance(data, dict) else None) or ''
        letter = LEVEL_LETTER.get(level.lower())

        # highest NN already used for this set+level, so --assign-ids continues, never reuses
        next_nn = 0
        if set_id and letter:
            pref = '%s-%s-' % (set_id, letter)
            for q in qs:
                qid = q.get('id') or ''
                if qid.startswith(pref):
                    m = re.search(r'(\d+)$', qid)
                    if m:
                        next_nn = max(next_nn, int(m.group(1)))

        new_qs = []
        for i, q in enumerate(qs):
            totals['questions'] += 1

            # id
            if blank(q.get('id')) and args.assign_ids:
                if not (set_id and letter):
                    errors.append('%s q#%d: cannot assign id (file needs setId and a known level)' % (path, i))
                else:
                    next_nn += 1
                    q['id'] = '%s-%s-%02d' % (set_id, letter, next_nn)
                    totals['ids_assigned'] += 1

            # periodId
            if blank(q.get('periodId')) and stamp_period:
                q['periodId'] = stamp_period
            pid = q.get('periodId')

            # topicId fallback
            if blank(q.get('topicId')) and args.fallback and not blank(pid):
                q['topicId'] = pid

            # ---- checks (the three the website build enforces) ----
            qid = q.get('id')
            if not blank(qid):
                if qid in seen_ids:
                    errors.append('duplicate id %r: %s and %s' % (qid, seen_ids[qid], '%s q#%d' % (path, i)))
                else:
                    seen_ids[qid] = '%s q#%d' % (path, i)

            tid = q.get('topicId')
            if not blank(tid):
                if tid not in by_id:
                    errors.append('%s %s: topicId %r is not in the taxonomy' % (path, qid or ('q#%d' % i), tid))
                elif not blank(pid) and tid == pid:
                    totals['fallback'] += 1
                else:
                    totals['specific'] += 1
            else:
                notes.append('%s %s: no topicId' % (path, qid or ('q#%d' % i)))

            if not blank(pid):
                if pid not in by_id:
                    errors.append('%s %s: periodId %r is not in the taxonomy' % (path, qid or ('q#%d' % i), pid))
                elif pid not in periods:
                    errors.append('%s %s: periodId %r is a %r node, not a period' % (path, qid or ('q#%d' % i), pid, by_id[pid]['kind']))
                else:
                    totals['periods'][pid] = totals['periods'].get(pid, 0) + 1
                    if pid in broad:
                        warnings.append('%s %s: periodId %r is a broad age node, not an inner period' % (path, qid or ('q#%d' % i), pid))
            else:
                totals['no_period'] += 1
                notes.append('%s %s: no periodId' % (path, qid or ('q#%d' % i)))

            new_qs.append(reorder(q))

        # write back
        if args.write:
            if shape == 'array':
                out = new_qs
            else:
                data['questions'] = new_qs
                out = data
            with open(path, 'w', encoding='utf-8', newline='') as fh:
                fh.write(json.dumps(out, indent=args.indent, ensure_ascii=False) + '\n')

    # ---- report ----
    print('=' * 60)
    print('tag_mcq: %d file(s), %d question(s)%s' % (totals['files'], totals['questions'],
          '' if args.write else '   (DRY RUN — nothing written; add --write)'))
    print('  specific topic tags : %d' % totals['specific'])
    print('  at period fallback  : %d' % totals['fallback'])
    print('  no topicId          : %d' % max(0, totals['questions'] - totals['specific'] - totals['fallback']))
    if totals['ids_assigned']:
        print('  ids assigned        : %d' % totals['ids_assigned'])
    if totals['no_period']:
        print('  no periodId         : %d' % totals['no_period'])
    if totals['periods']:
        print('  periods used        : ' + ', '.join('%s=%d' % (k, v) for k, v in sorted(totals['periods'].items())))
    if notes and (totals['no_period'] or any('no topicId' in n for n in notes)):
        shown = [n for n in notes][:12]
        print('  gaps:')
        for n in shown:
            print('    - ' + n)
        if len(notes) > len(shown):
            print('    ... and %d more' % (len(notes) - len(shown)))

    if warnings:
        uniq = list(dict.fromkeys(warnings))
        print('\nWARNINGS (%d) — the file still publishes, but check these:' % len(uniq))
        for wmsg in uniq[:20]:
            print('  ! ' + wmsg)
        if len(uniq) > 20:
            print('  ... and %d more' % (len(uniq) - 20))

    if errors:
        print('\nERRORS (%d) — these block publishing, fix them:' % len(errors))
        for e in errors[:40]:
            print('  ✗ ' + e)
        if len(errors) > 40:
            print('  ... and %d more' % (len(errors) - 40))
        print('=' * 60)
        return 1
    print('\n✓ 0 errors — tags are valid and ids are unique. The file will publish.')
    print('=' * 60)
    return 0


if __name__ == '__main__':
    sys.exit(main())
