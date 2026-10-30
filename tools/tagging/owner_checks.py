"""The owner's 20 checks: question id -> the tag the owner said is right. Run: python3 tools/tagging/owner_checks.py"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import match_topics  # noqa: E402
m = match_topics.Matcher()
byid = {}
for f in glob.glob(os.path.join(match_topics.ROOT, 'assets', 'instant', '*.json')):
    for q in json.load(open(f, encoding='utf-8'))['questions']: byid[q['id']] = q
# (id, what the owner said is right)
CHECK = [('el-h-05','edmund-spenser'),('cw-h-22','izaak-walton'),('ac-e-13','age-of-chaucer'),('vc-h-10','alfred-tennyson'),
         ('cr-h-31','john-milton'),('fc-e-33','mystery-plays'),
         ('as-e-49','deor'),('as-h-48','beowulf'),('el-h-22','edward-ii'),('rm-e-41','john-keats'),('cr-e-08','john-suckling'),
         ('jb-h-25','the-white-devil'),('vc-e-23','vanity-fair'),('au-e-21','gullivers-travels'),('gr-e-03','georgian-poetry'),
         ('pm-h-01','the-movement'),('gr-e-39','lady-chatterleys-lover'),('md-e-12','the-love-song-of-j-alfred-prufrock'),
         ('cw-h-20','commonwealth'),('ac-h-07','age-of-chaucer')]
ok = 0
for i, want in CHECK:
    q = byid[i]; r = m.match(q, q['periodId'])
    good = r['topicId'] == want; ok += good
    print(f"{'OK ' if good else 'DIFF'} {i:8} -> {r['topicId']:36} (want {want}) | {r['trace'][:230]}")
print(f"\n{ok}/{len(CHECK)} as the owner said")
