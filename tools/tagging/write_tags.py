"""Write topicId (and, for the overlap banks and MCQ sets, periodId) into the question files.

    python3 tools/tagging/write_tags.py daily      # the 18 single-age Daily banks (periodId is already there)
    python3 tools/tagging/write_tags.py overlap    # Renaissance + Neoclassical banks (periodId from the owner-approved table)
    python3 tools/tagging/write_tags.py mcq        # the 6 Old English MCQ files
    add --dry to print the summary and write nothing

The tag comes from match_topics.py (the ladder). A few tags are the owner's rulings and are listed in OVERRIDES,
each with its reason. Files are rewritten with the layout they already have (Daily: indent 1; MCQ: indent 2), so the
only change in the diff is the added key. Set-local MCQ keys (topic / topicRead / read) are left exactly as they are.
"""
import csv
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import match_topics as mt  # noqa: E402

ROOT = mt.ROOT
DRY = '--dry' in sys.argv
MODE = next((a for a in sys.argv[1:] if not a.startswith('--')), '')

# question id -> (tag, reason). The owner's rulings; the matcher alone would say something else.
OVERRIDES = {}      # none now. el-e-35 (Gorboduc) was one until the gorboduc node existed.

# MCQ: a set-local key that matches a master node by name -> that node (owner's table). Other keys are tagged per question.
MCQ_KEYS = {'beowulf': 'beowulf', 'elegies': 'old-english-elegies', 'riddles': 'old-english-riddles', 'alfred': 'king-alfred',
            'chronicle': 'anglo-saxon-chronicle', 'aelfric': 'aelfric', 'wulfstan': 'wulfstan'}
MCQ_PERIOD, MCQ_FALLBACK = 'anglo-saxon', 'old-english'      # the set fallback is the age node, not the period (owner)

m = mt.Matcher()
tx = m.tx


def tag_for(q, period_id):
    if q['id'] in OVERRIDES:
        return OVERRIDES[q['id']][0], 'override', OVERRIDES[q['id']][1]
    r = m.match(q, period_id)
    return r['topicId'], r['rung'], r['trace']


def put(q, topic_id, period_id):
    """question dict with topicId then periodId added after the existing keys (replaced in place if already there)"""
    out = {k: v for k, v in q.items() if k not in ('topicId', 'periodId')}
    out['topicId'] = topic_id
    out['periodId'] = period_id
    return out


def dump(path, data, indent):
    if not DRY:
        open(path, 'w', encoding='utf-8', newline='').write(json.dumps(data, indent=indent, ensure_ascii=False) + '\n')


def is_descendant(node, ancestor):
    return ancestor in tx.chain(node) and node != ancestor


DECISIONS_PATH = f'{HERE}/reports/overlap-period-decisions.json'
decisions = {r['id']: r['periodId'] for r in json.load(open(DECISIONS_PATH, encoding='utf-8'))}


def is_overlap_bank(d):
    return all(q['id'] in decisions for q in d['questions'])


rows = []          # audit rows for the summary
if MODE == 'daily':
    for path in sorted(glob.glob(f'{ROOT}/assets/instant/*.json')):
        d = json.load(open(path, encoding='utf-8'))
        if is_overlap_bank(d) or not all('periodId' in q for q in d['questions']):
            continue                                   # an overlap bank: handled by `overlap`
        qs = []
        for q in d['questions']:
            t, rung, why = tag_for(q, q['periodId'])
            rows.append((q['id'], t, q['periodId'], rung))
            qs.append(put(q, t, q['periodId']))
        d['questions'] = qs
        dump(path, d, 1)
elif MODE == 'overlap':
    seen = 0
    for path in sorted(glob.glob(f'{ROOT}/assets/instant/*.json')):
        d = json.load(open(path, encoding='utf-8'))
        if not is_overlap_bank(d):
            continue
        qs = []
        for q in d['questions']:
            p = decisions[q['id']]
            assert tx.by[p]['kind'] == 'period', p
            t, rung, why = tag_for(q, p)
            rows.append((q['id'], t, p, rung))
            qs.append(put(q, t, p))
            seen += 1
        d['questions'] = qs
        dump(path, d, 1)
    assert seen == len(decisions) == 200, (seen, len(decisions))
elif MODE == 'mcq':
    disagree = []
    for path in sorted(glob.glob(f'{ROOT}/assets/questions/*.json')):
        d = json.load(open(path, encoding='utf-8'))
        qs = []
        for q in d['questions']:
            r = m.match(q, MCQ_PERIOD)
            key_node = MCQ_KEYS.get(q.get('topic'))
            if key_node:
                assert key_node in tx.by, key_node
                # the key is coarse. A node UNDER the key, a titled work the question names, or a node that IS the answer is more
                # specific, so it wins; a writer or a container (the Exeter Book around a riddle) does not beat the key.
                if r['matched'] and (is_descendant(r['topicId'], key_node) or r['rung'] == 'work' or 'answer' in r['where']):
                    t, rung = r['topicId'], 'ladder (more specific than the key)'
                else:
                    t, rung = key_node, 'set key'
                    if r['matched'] and r['topicId'] != key_node:
                        disagree.append((q['id'], q['topic'], r['topicId'], q['question'][:80]))
            else:
                t, rung = (r['topicId'], r['rung']) if r['matched'] else (MCQ_FALLBACK, 'age fallback')
            rows.append((q['id'], t, MCQ_PERIOD, rung))
            qs.append(put(q, t, MCQ_PERIOD))
        d['questions'] = qs
        dump(path, d, 2)
    print(f'matcher and set key disagree on {len(disagree)} questions (the key was used):')
    for x in disagree:
        print('  ', x)
else:
    sys.exit(__doc__)

import collections
n = len(rows)
print(f'{MODE}: {n} questions tagged{" (dry run, nothing written)" if DRY else ""}')
print('by rung:', dict(collections.Counter(r[3] for r in rows)))
print('at the period/age fallback:', sum(1 for r in rows if r[1] in (r[2], MCQ_FALLBACK)))
bad = [r for r in rows if r[1] not in tx.by or tx.by[r[2]]['kind'] != 'period']
assert not bad, bad[:3]
