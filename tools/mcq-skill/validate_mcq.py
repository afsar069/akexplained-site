#!/usr/bin/env python3
"""
AK Explained: MCQ file checker.

Checks one or more question files (easy / medium of the same set) against the
format the site loads, and lints them for the mistakes that cost the most time
to fix later. Python 3 only, no packages.

  python3 validate_mcq.py easy.json medium.json
  python3 validate_mcq.py easy.json medium.json --notes article.md
  python3 validate_mcq.py easy.json medium.json --notes article.md --others set1-easy.json set1-medium.json
  python3 validate_mcq.py easy.json --count 30

--notes   the age's notes article as Markdown (the file in the repo, or the page
          text saved as .md). Needed to check that every "read" anchor exists.
--others  question files of OTHER sets of the same age, to catch repeated facts.
--count   questions expected in each file (default 50).

Exit code 0 = no errors (warnings are advice), 1 = errors, 2 = bad usage.
"""
import io, json, re, sys, unicodedata, argparse
from collections import Counter

# ---- the one place that lists what may be cited (edit here to change sources) ----
ALLOWED_DOMAINS = ['akexplained.com', 'wikipedia.org', 'britannica.com', 'bl.uk', 'gutenberg.org']
OWN_DOMAIN = 'akexplained.com'

AGES = ['old-english', 'middle-english', 'renaissance', 'elizabethan', 'jacobean', 'caroline',
        'restoration', 'augustan-age', 'romantic-age', 'victorian-age', 'modern', 'contemporary']
LEVELS = ['easy', 'medium', 'hard']
SKIP_ANCHORS = {'quick-quiz-25-questions', 'frequently-asked-questions', 'sources',
                'important-points-to-remember', 'important-points-to-remember-2',
                'important-points-to-remember-3', 'quick-revision-50-points',
                'the-world-of-this-age', 'literature-in-this-age', 'section'}
SET_KEYS = ['setId', 'rev', 'age', 'ageName', 'setNumber', 'setName', 'notes', 'notesTitle',
            'topics', 'topicRead', 'level', 'levelName', 'levelNote', 'questions']
SAME_IN_PAIR = ['setId', 'rev', 'age', 'ageName', 'setNumber', 'setName', 'notes', 'notesTitle',
                'topics', 'topicRead', 'quote']
Q_CORE = ['question', 'options', 'correct_option_id', 'explanation', 'topic']
Q_ALLOWED = Q_CORE + ['src', 'read']
LEGACY = False        # --legacy: older files without "src"
# words that appear in many stems and options without being a clue
GENERIC = {'manuscript', 'manuscripts', 'poem', 'poems', 'poetry', 'riddle', 'riddles', 'english',
           'called', 'named', 'famous', 'during', 'between', 'through', 'about', 'literature',
           'writer', 'author', 'which', 'following', 'describing', 'according', 'century'}
BAD_OPTIONS = ['all of the above', 'none of the above', 'both a and b', 'all of these',
               'none of these', 'a and b', 'b and c', 'a and c', 'both of the above']

errors, warnings = [], []
def err(where, msg): errors.append('%s: %s' % (where, msg))
def warn(where, msg): warnings.append('%s: %s' % (where, msg))

def slugify(text):
    s = unicodedata.normalize('NFKD', text)
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-') or 'section'

def anchors_from_markdown(path):
    raw = io.open(path, encoding='utf-8-sig').read()
    body = raw.split('---', 2)[2] if raw.lstrip().startswith('---') and raw.count('---') >= 2 else raw
    used, out = set(), []
    for line in body.split('\n'):
        m = re.match(r'^(#{2,3})\s+(.+?)\s*$', line)
        if not m: continue
        base = slugify(re.sub(r'[*_`]', '', m.group(2)))
        s, n = base, 2
        while s in used: s = '%s-%d' % (base, n); n += 1
        used.add(s); out.append(s)
    return out

def toks(s):
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    return set(w for w in re.findall(r"[a-z0-9]+", s) if len(w) > 3)

def words(s): return len(s.split())

def load(path):
    try:
        raw = io.open(path, encoding='utf-8').read()
    except Exception as e:
        err(path, 'cannot read file: %s' % e); return None
    if raw.startswith('﻿'):
        warn(path, 'file starts with a byte-order mark; save it as plain UTF-8')
        raw = raw.lstrip('﻿')
    try:
        d = json.loads(raw)
    except Exception as e:
        err(path, 'not valid JSON: %s' % e); return None
    if not isinstance(d, dict):
        err(path, 'the file must be one JSON object, not a list (the site needs the set details too)')
        return None
    return d

def check_set(path, d, anchors, count):
    w = path
    for k in SET_KEYS:
        if k not in d: err(w, 'missing "%s"' % k)
    extra = [k for k in d if k not in SET_KEYS + ['quote']]
    if extra: err(w, 'unknown top-level field(s): %s' % ', '.join(extra))
    if any(k not in d for k in SET_KEYS): return False

    if not (isinstance(d['rev'], int) and not isinstance(d['rev'], bool) and d['rev'] >= 1): err(w, '"rev" must be a whole number, 1 or more')
    if not (isinstance(d['setNumber'], int) and not isinstance(d['setNumber'], bool) and d['setNumber'] >= 1): err(w, '"setNumber" must be a whole number, 1 or more')
    for k in ('setId', 'age', 'ageName', 'setName', 'notes', 'notesTitle', 'level', 'levelName', 'levelNote'):
        if not isinstance(d[k], str) or not d[k].strip(): err(w, '"%s" must be a non-empty string' % k)
    if errors and any(e.startswith(w) and '"' in e and 'must be' in e for e in errors): return False

    if d['age'] not in AGES: warn(w, 'age "%s" is not in the known list: %s' % (d['age'], ', '.join(AGES)))
    if d['setId'] != '%s-set-%s' % (d['age'], d['setNumber']): err(w, 'setId must be "<age>-set-<number>", here "%s-set-%s"' % (d['age'], d['setNumber']))
    if not (d['notes'].startswith('/notes/') and d['notes'].endswith('/')): err(w, '"notes" must look like /notes/<article>/')
    if d['level'] not in LEVELS: err(w, 'level must be one of %s' % ', '.join(LEVELS))
    elif d['levelName'] != d['level'].capitalize(): err(w, 'levelName must be "%s"' % d['level'].capitalize())
    if len(d['levelNote']) > 140: warn(w, 'levelNote is long; keep it to one short sentence')
    if len(d['setName']) > 45: warn(w, 'setName is long (%d characters)' % len(d['setName']))

    t = d['topics']
    if not isinstance(t, dict) or not t: err(w, '"topics" must be an object of key: label'); return False
    for k, v in t.items():
        if not re.match(r'^[a-z][a-z0-9-]{1,23}$', k): err(w, 'topic key "%s": use 2-24 lowercase letters, digits or hyphens' % k)
        if not isinstance(v, str) or not v.strip(): err(w, 'topic "%s" needs a label' % k)
        elif len(v) > 30: warn(w, 'topic label "%s" is long; keep it under 30 characters' % v)
    if not 3 <= len(t) <= 8: warn(w, 'a set usually has 4 to 6 topics; this one has %d' % len(t))
    tr = d['topicRead']
    if not isinstance(tr, dict): err(w, '"topicRead" must be an object of topic key: anchor'); return False
    for k in t:
        if k not in tr: err(w, 'topicRead has no anchor for topic "%s"' % k)
    for k, v in tr.items():
        if k not in t: err(w, 'topicRead names "%s" which is not in topics' % k)
        if not isinstance(v, str) or not re.match(r'^[a-z0-9-]+$', v): err(w, 'topicRead "%s": "%s" is not a valid anchor' % (k, v))
        elif v in SKIP_ANCHORS: warn(w, 'topicRead "%s" points to "%s", which is not a real part of the article' % (k, v))
        elif anchors and v not in anchors: err(w, 'topicRead "%s": anchor "%s" is not in the article' % (k, v))
    if 'quote' in d:
        q = d['quote']
        if not (isinstance(q, dict) and set(q) == {'text', 'source'} and all(isinstance(x, str) and x.strip() for x in q.values())):
            err(w, '"quote" must be {"text": "...", "source": "..."} or left out')

    qs = d['questions']
    if not isinstance(qs, list): err(w, '"questions" must be a list'); return False
    if len(qs) != count: err(w, 'has %d questions, expected %d' % (len(qs), count))
    return True

def check_questions(path, d, anchors):
    qs, topics = d['questions'], d['topics']
    pos, own, per_topic, longest, stats = [], 0, Counter(), 0, Counter()
    for i, q in enumerate(qs, 1):
        w = '%s Q%d' % (path, i)
        if not isinstance(q, dict): err(w, 'must be an object'); continue
        for k in Q_CORE:
            if k not in q: err(w, 'missing "%s"' % k)
        extra = [k for k in q if k not in Q_ALLOWED]
        if extra: err(w, 'unknown field(s): %s' % ', '.join(extra))
        if any(k not in q for k in Q_CORE): continue

        stem, opts, ans = q['question'], q['options'], q['correct_option_id']
        if not isinstance(stem, str) or not stem.strip(): err(w, 'question text is empty'); continue
        if not isinstance(opts, list) or len(opts) != 4 or not all(isinstance(o, str) and o.strip() for o in opts):
            err(w, 'options must be exactly four non-empty strings'); continue
        if isinstance(ans, bool) or not isinstance(ans, int) or not 0 <= ans <= 3:
            err(w, 'correct_option_id must be 0, 1, 2 or 3'); continue
        if len({o.strip().lower() for o in opts}) != 4: err(w, 'two options are the same')
        if not isinstance(q['explanation'], str) or not q['explanation'].strip(): err(w, 'explanation is empty'); continue
        if q['topic'] not in topics: err(w, 'topic "%s" is not in topics' % q['topic'])
        per_topic[q['topic']] += 1; pos.append(ans)

        for label, txt in [('question', stem), ('explanation', q['explanation'])] + [('option %d' % j, o) for j, o in enumerate(opts)]:
            if txt != txt.strip() or '  ' in txt or '\n' in txt: err(w, '%s has stray spaces or a line break' % label)
            if re.search(r'\*\*|`|^#|</?[a-z]+>', txt): err(w, '%s contains markdown or HTML' % label)
            if re.search(r'[ऀ-ॿ]', txt): err(w, '%s contains Hindi script; site text must be simple English' % label)
            if re.search(r'\bTODO\b|\bXXX\b|\?\?', txt): err(w, '%s has a placeholder' % label)
        for o in opts:
            if o.strip().lower().rstrip('.') in BAD_OPTIONS: err(w, 'option "%s" is not allowed' % o)
        if not stem.rstrip().endswith('?'): warn(w, 'question does not end with "?"')
        if words(stem) > 45: warn(w, 'question is long (%d words)' % words(stem))
        if max(words(o) for o in opts) > 18: warn(w, 'an option is long; keep options short')
        n = words(q['explanation'])
        if n > 50: warn(w, 'explanation is long (%d words)' % n)
        if n < 4: warn(w, 'explanation is too short to teach anything')
        if len(opts[ans]) == max(len(o) for o in opts) and len(set(len(o) for o in opts)) > 1: longest += 1

        # does the stem give the answer away?
        stem_t = toks(stem)
        others = set().union(*[toks(o) for j, o in enumerate(opts) if j != ans])
        leak = [t for t in toks(opts[ans]) if t in stem_t and t not in others and len(t) >= 6 and t not in GENERIC]
        if leak: warn(w, 'the stem may give the answer away (shares "%s" only with the right option)' % leak[0])

        s = q.get('src')
        if s is None and LEGACY: stats['none (legacy)'] += 1
        elif not isinstance(s, str) or not s.strip(): err(w, 'missing or empty "src": every question needs the page that proves it')
        elif s.startswith('user-supplied:'): stats['user-supplied'] += 1
        else:
            m = re.match(r'^https?://([^/\s]+)(/\S*)?$', s)
            if not m: err(w, '"src" must be a full web address or "user-supplied: <title>"')
            else:
                host = m.group(1).lower()
                dom = next((a for a in ALLOWED_DOMAINS if host == a or host.endswith('.' + a)), None)
                if not dom: err(w, 'source %s is not an allowed site (%s)' % (host, ', '.join(ALLOWED_DOMAINS)))
                else:
                    stats[dom] += 1
                    if dom == OWN_DOMAIN:
                        own += 1
                        frag = re.search(r'#([a-z0-9-]+)$', s)
                        if not frag: warn(w, 'article source should end with #anchor of the section used')
                        elif 'read' in q and q['read'] != frag.group(1): warn(w, 'src anchor "%s" and read "%s" differ' % (frag.group(1), q['read']))

        if 'read' in q:
            r = q['read']
            if not isinstance(r, str) or not re.match(r'^[a-z0-9-]+$', r): err(w, '"read" must be an anchor like "poetry"')
            elif r in SKIP_ANCHORS: err(w, '"read" points to "%s", which is not a real part of the article' % r)
            elif anchors and r not in anchors: err(w, '"read" anchor "%s" is not in the article' % r)

    n = len(qs)
    if n >= 20 and len(pos) == n:
        c = Counter(pos)
        lo, hi = int(n * 0.16), int(n * 0.34 + 0.999)
        for p in range(4):
            if not lo <= c[p] <= hi: warn(path, 'correct answer sits in position %d (%s) %d times of %d; spread them evenly' % (p, 'ABCD'[p], c[p], n))
        run = 1
        for a, b in zip(pos, pos[1:]):
            run = run + 1 if a == b else 1
            if run == 5: warn(path, 'the correct answer is in the same position five times in a row'); break
        if longest / n > 0.40: warn(path, 'the right answer is the longest option in %d of %d questions; make distractors as long' % (longest, n))
    for k in topics:
        if per_topic[k] < 4: warn(path, 'topic "%s" has only %d question(s); aim for at least 4 so the result page can judge it' % (k, per_topic[k]))
    return {'topics': dict(per_topic), 'pos': dict(Counter(pos)), 'sources': dict(stats), 'own': own, 'n': n}

def pair_checks(files):
    ds = [d for _, d in files]
    for k in SAME_IN_PAIR:
        vals = [json.dumps(d.get(k), sort_keys=True, ensure_ascii=False) for d in ds]
        if len(set(vals)) > 1: err('files', 'the files disagree on "%s"; they must be identical in both' % k)
    lv = [d['level'] for d in ds]
    if len(set(lv)) != len(lv): err('files', 'two files have the same level: %s' % ', '.join(lv))

def dup_checks(files, others):
    items = []
    for path, d in files:
        for i, q in enumerate(d['questions'], 1):
            if isinstance(q, dict) and isinstance(q.get('options'), list) and isinstance(q.get('correct_option_id'), int) and 0 <= q['correct_option_id'] < len(q['options']):
                items.append((path, i, toks(q.get('question', '') + ' ' + q['options'][q['correct_option_id']]), 'this set'))
    base = len(items)
    for path, d in others:
        for i, q in enumerate(d.get('questions', []), 1):
            try: items.append((path, i, toks(q['question'] + ' ' + q['options'][q['correct_option_id']]), 'other set'))
            except Exception: pass
    for a in range(base):
        for b in range(a + 1, len(items)):
            ta, tb = items[a][2], items[b][2]
            if not ta or not tb: continue
            j = len(ta & tb) / len(ta | tb)
            if j >= 0.5:
                warn('%s Q%d' % (items[a][0], items[a][1]), 'looks like the same fact as %s Q%d (%s, %.0f%% alike)' % (items[b][0], items[b][1], items[b][3], j * 100))

def main():
    ap = argparse.ArgumentParser(description='Check AK Explained MCQ files.')
    ap.add_argument('files', nargs='+')
    ap.add_argument('--notes'); ap.add_argument('--count', type=int, default=50)
    ap.add_argument('--legacy', action='store_true', help='do not require "src" (files made before it existed)')
    ap.add_argument('--others', nargs='*', default=[])
    a = ap.parse_args()
    global LEGACY
    LEGACY = a.legacy

    anchors = None
    if a.notes:
        try: anchors = anchors_from_markdown(a.notes)
        except Exception as e: print('cannot read --notes file: %s' % e); return 2
        print('Article anchors found: %d' % len(anchors))
    else:
        print('No --notes given: anchors are only checked for format, not against the article.')

    files = []
    for p in a.files:
        d = load(p)
        if d is not None and check_set(p, d, anchors, a.count): files.append((p, d))
    summary = {}
    for p, d in files: summary[p] = check_questions(p, d, anchors)
    if len(files) > 1: pair_checks(files)
    others = []
    for p in a.others:
        d = load(p)
        if d is not None: others.append((p, d))
    if files: dup_checks(files, others)

    print()
    for p, s in summary.items():
        print('%s' % p)
        print('  questions: %d   topics: %s' % (s['n'], s['topics']))
        print('  correct-answer positions A/B/C/D: %s' % [s['pos'].get(i, 0) for i in range(4)])
        print('  sources: %s   (our own article: %d of %d)' % (s['sources'], s['own'], s['n']))
    if warnings:
        print('\nWARNINGS (%d) - advice, fix what is real:' % len(warnings))
        for w in warnings: print('  - ' + w)
    if errors:
        print('\nERRORS (%d) - must be fixed before the files go out:' % len(errors))
        for e in errors: print('  x ' + e)
        return 1
    print('\nNo errors.')
    return 0

if __name__ == '__main__':
    sys.exit(main())
