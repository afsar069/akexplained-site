"""Dry run of the topic matcher over every Daily bank that already carries a periodId. Writes nothing to the site.

    python3 tools/tagging/dry_run.py              # print the match rate
    python3 tools/tagging/dry_run.py out.json     # also save every result
"""
import collections
import glob
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import match_topics as mt  # noqa: E402

m = mt.Matcher()
res = []
for f in sorted(glob.glob(os.path.join(mt.ROOT, 'assets', 'instant', '*.json'))):
    d = json.load(open(f, encoding='utf-8'))
    for q in d['questions']:
        if 'periodId' not in q:
            continue
        r = m.match(q, q['periodId'])
        res.append(dict(r, id=q['id'], bank=d['bankId'], level=d['level'], periodId=q['periodId'],
                        question=q['question'], answer=q['options'][q['correct_option_id']]))
n = len(res)
hit = sum(r['matched'] for r in res)
print(f"questions {n} | matched {hit} ({100 * hit / n:.1f}%) | at the period {n - hit}")
print('rung reached:', dict(collections.Counter(r['rung'] for r in res)))
print('from a neighbouring age:', sum(r['crossed_age'] for r in res), '| from another area:', sum(r.get('crossed_area', False) for r in res))
if len(sys.argv) > 1:
    json.dump(res, open(sys.argv[1], 'w'), indent=1, ensure_ascii=False)
