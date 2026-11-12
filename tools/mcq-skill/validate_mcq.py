#!/usr/bin/env python3
"""
AK Explained: MCQ file checker.

Checks one or more question files (easy / medium of the same set) against the
format the site loads, and lints them for the mistakes that cost the most time
to fix later. Python 3 only, no packages.

It understands both the plain sets (set 1-3 style) and the "complex" generator
sets (Old English set 5 style): a top-level "passages" list with questions that
point at it by "passageId", line breaks inside a question (List I / List II,
A. B. C. D.), and the extra fields id / topicId / periodId / qtype. None of those
are errors. The tags are not matched against the master list here (make_gated_sql.py
does that for a login set, and the build gate does it for a free set).

  python3 validate_mcq.py easy.json medium.json
  python3 validate_mcq.py easy.json medium.json --notes article.md
  python3 validate_mcq.py easy.json medium.json --notes article.md --others set1-easy.json set1-medium.json
  python3 validate_mcq.py easy.json --count 30

--notes   the age's notes article as Markdown (the file in the repo, or the page
          text saved as .md). Needed to check that every "read" anchor exists.
--others  question files of OTHER sets of the same age, to catch repeated facts.
--count   questions expected in each file (default 50).
--strict  "site-ready" mode, for NEW files (the skill runs it): ids, tags and qtype are required, the file name,
          setId, age, ageName, notes, setName and ids must match what the site builds from, no inert fields
          (examCode, examName, difficulty), explanations must not name their source, and tags are checked
          against the master taxonomy. Without it these are warnings (old live files stay valid).
--taxonomy / --registry  paths of taxonomy-master-reference.csv and of _data/mcqSpec.json (or the skill's
          references/site-plan.json). Found automatically next to the script or in the repo when not given.

Exit code 0 = no errors (warnings are advice), 1 = errors, 2 = bad usage.
"""
import csv, io, json, os, re, sys, unicodedata, argparse
from collections import Counter

# ---- the one place that lists what may be cited (edit here to change sources) ----
ALLOWED_DOMAINS = ['akexplained.com', 'wikipedia.org', 'britannica.com', 'bl.uk', 'gutenberg.org']
OWN_DOMAIN = 'akexplained.com'

# The 20 hub slugs = the "slug" of every age in _data/mcqSpec.json. A new file's "age" must be one of these.
HUB_PERIODS = {
    'old-english': {'anglo-saxon'}, 'anglo-norman': {'anglo-norman'}, 'age-of-chaucer': {'age-of-chaucer'},
    'fifteenth-century': {'fifteenth-century'},
    'renaissance': {'early-tudor', 'elizabethan', 'jacobean-era', 'caroline', 'commonwealth'},
    'early-tudor': {'early-tudor'}, 'elizabethan': {'elizabethan'}, 'jacobean': {'jacobean-era'},
    'caroline': {'caroline'}, 'commonwealth': {'commonwealth'},
    'neoclassical': {'restoration-era', 'augustan', 'age-of-sensibility'}, 'restoration': {'restoration-era'},
    'augustan-age': {'augustan'}, 'age-of-sensibility': {'age-of-sensibility'}, 'romantic-age': {'romantic'},
    'victorian-age': {'victorian'}, 'edwardian': {'edwardian'}, 'georgian': {'georgian'}, 'modern': {'modern-era'},
    'postmodern': {'postmodern'},
}
HUB_AGES = list(HUB_PERIODS)
# older files (before the hub slugs were fixed) also used the notes-article slugs; still accepted, but not in --strict
AGES = HUB_AGES + ['middle-english', 'contemporary']
LEVELS = ['easy', 'medium', 'hard']
LEVEL_LETTER = {'easy': 'e', 'medium': 'm', 'hard': 'h'}
# share of "complex" questions (anything but qtype direct) the owner wants per level; outside +-15 points is a warning
COMPLEX_TARGET = {'easy': 0.10, 'medium': 0.50, 'hard': 0.80}
# a student reads questions, options and reasons: they must not name the book or note they came from
SOURCE_WORDS = re.compile(r"study notes?|guide ?book|(?:easy )?handbook for (?:ugc )?net|course ?hero|lit ?charts|spark ?notes|shmoop|cliffs ?notes|upkar|"
                          r"world literature in your fist|complete guide for|ugc[- ]?net (?:folder|drive|notes?|study)|\bdrive (?:notes?|folder)\b", re.I)
REASON_PREFIX = re.compile(r"^\s*(?:per|as per|according to)\b", re.I)
BAD_SETNAME = re.compile(r"\bbatch\b|\((?:easy|medium|hard)\)|\b(?:easy|medium|hard)\s*$", re.I)
INERT_SET_FIELDS = ['examCode', 'examName']
INERT_Q_FIELDS = ['difficulty']
SKIP_ANCHORS = {'quick-quiz-25-questions', 'frequently-asked-questions', 'sources',
                'important-points-to-remember', 'important-points-to-remember-2',
                'important-points-to-remember-3', 'quick-revision-50-points',
                'the-world-of-this-age', 'literature-in-this-age', 'section'}
SET_KEYS = ['setId', 'rev', 'age', 'ageName', 'setNumber', 'setName', 'notes', 'notesTitle',
            'topics', 'topicRead', 'level', 'levelName', 'levelNote', 'questions']
SAME_IN_PAIR = ['setId', 'rev', 'age', 'ageName', 'setNumber', 'setName', 'notes', 'notesTitle',
                'topics', 'topicRead', 'quote']
Q_CORE = ['question', 'options', 'correct_option_id', 'explanation', 'topic']
Q_ALLOWED = Q_CORE + ['src', 'read', 'id', 'topicId', 'periodId', 'qtype', 'passageId', 'difficulty']
QTYPES = {'passage', 'direct', 'combination', 'match', 'chrono'}
PASSAGE_KEYS = {'id', 'title', 'attribution', 'text', 'src'}
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

STRICT = False
TAX = None       # {id: {'kind', 'parent', 'name'}} from taxonomy-master-reference.csv, when found
REG = None       # {age slug: {...}} from the registry, when found
_rule_n, _rule_label = Counter(), {}

def rule(kind, key, where, msg, strict_only=False, limit=3):
    """One finding of a per-question rule. Shows the first `limit`, then one line with the count (no flood of 50 lines).
    kind 'err' or 'warn'. strict_only: only reported in --strict (silent otherwise)."""
    if strict_only and not STRICT: return
    _rule_n[(kind, key)] += 1
    _rule_label[(kind, key)] = msg
    if _rule_n[(kind, key)] <= limit:
        (err if kind == 'err' else warn)(where, msg)

def flush_rules():
    for (kind, key), n in _rule_n.items():
        if n > 3:
            (err if kind == 'err' else warn)('files', '... and %d more with the same problem: %s' % (n - 3, _rule_label[(kind, key)]))

def qt_direct(q): return q.get('qtype') in (None, 'direct')

def here(*parts): return os.path.join(os.path.dirname(os.path.abspath(__file__)), *parts)

def find_file(cands):
    for c in cands:
        if c and os.path.exists(c): return c
    return None

def load_taxonomy(path):
    rows = csv.DictReader(io.open(path, encoding='utf-8', newline=''))
    return {r['id']: {'kind': r['kind'], 'parent': r['parent_id'], 'name': r['name']} for r in rows}

def norm_name(t):
    t = unicodedata.normalize('NFKD', t)
    t = ''.join(c for c in t if not unicodedata.combining(c)).lower()
    return re.sub(r'[^a-z0-9]+', ' ', t).strip()

_name_index = None
def name_index():
    """normalised name -> node id, for writers, works and concepts whose name is unique (same-name rule: ambiguous names are left out)"""
    global _name_index
    if _name_index is None:
        seen, dup = {}, set()
        for nid, r in (TAX or {}).items():
            if r['kind'] not in ('writer', 'work', 'concept'): continue
            k = norm_name(r['name'])
            if len(k) < 6: continue
            if k in seen: dup.add(k)
            seen[k] = nid
        _name_index = {k: v for k, v in seen.items() if k not in dup}
    return _name_index

def answer_node(option):
    """the one taxonomy node a single-answer option names (None if it names none, several, or is a list)"""
    if re.search(r',|\band\b|;|/', option): return None
    o = norm_name(re.sub(r'\([^)]*\)', '', option))     # "Thomas Hoccleve (Occleve)" -> "thomas hoccleve"
    o = re.sub(r'^(?:the|a|an) ', '', o)
    # the option must BE the node's name (at least 70% of it), not merely contain a short word such as "legend"
    hits = [(len(k), v) for k, v in name_index().items()
            if re.search(r'(?<![a-z0-9])' + re.escape(k) + r'(?![a-z0-9])', o) and len(k) >= 0.7 * len(o)]
    if not hits: return None
    hits.sort(reverse=True)
    top = hits[0][1]
    return top if all(v == top or len(norm_name(TAX[v]['name'])) < hits[0][0] and norm_name(TAX[v]['name']) in norm_name(TAX[top]['name']) for _, v in hits) else None

def load_registry(path):
    d = json.load(io.open(path, encoding='utf-8'))
    out = {}
    for a in d.get('ages', []):
        out[a['slug']] = {'name': a.get('name'), 'article': a.get('article'), 'notesName': a.get('notesName'),
                          'sets': {s['n']: s for s in a.get('sets', [])}}
    return out

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
    # examCode / examName: inert header fields of the UGC NET batch generator (the site does not read them).
    extra = [k for k in d if k not in SET_KEYS + ['quote', 'passages', 'examCode', 'examName']]
    if extra: err(w, 'unknown top-level field(s): %s' % ', '.join(extra))
    if any(k not in d for k in SET_KEYS if k != 'topicRead'): return False
    d.setdefault('topicRead', {})   # a missing topicRead is already reported above; keep checking so ALL problems show in one run

    if not (isinstance(d['rev'], int) and not isinstance(d['rev'], bool) and d['rev'] >= 1): err(w, '"rev" must be a whole number, 1 or more')
    if not (isinstance(d['setNumber'], int) and not isinstance(d['setNumber'], bool) and d['setNumber'] >= 1): err(w, '"setNumber" must be a whole number, 1 or more')
    for k in ('setId', 'age', 'ageName', 'setName', 'notes', 'notesTitle', 'level', 'levelName', 'levelNote'):
        if not isinstance(d[k], str) or not d[k].strip(): err(w, '"%s" must be a non-empty string' % k)
    if errors and any(e.startswith(w) and '"' in e and 'must be' in e for e in errors): return False

    if d['age'] not in AGES: warn(w, 'age "%s" is not in the known list: %s' % (d['age'], ', '.join(AGES)))
    elif STRICT and d['age'] not in HUB_AGES:
        err(w, 'age "%s" is a notes-article slug; use the hub slug of the age (one of: %s)' % (d['age'], ', '.join(HUB_AGES)))
    if d['setId'] != '%s-set-%s' % (d['age'], d['setNumber']): err(w, 'setId must be "<age>-set-<number>", here "%s-set-%s"' % (d['age'], d['setNumber']))
    if not (d['notes'].startswith('/notes/') and d['notes'].endswith('/')): err(w, '"notes" must look like /notes/<article>/')
    if d['level'] not in LEVELS: err(w, 'level must be one of %s' % ', '.join(LEVELS))
    elif d['levelName'] != d['level'].capitalize(): err(w, 'levelName must be "%s"' % d['level'].capitalize())
    if len(d['levelNote']) > 140: warn(w, 'levelNote is long; keep it to one short sentence')
    if len(d['setName']) > 45: warn(w, 'setName is long (%d characters)' % len(d['setName']))

    # ---- site-ready checks: errors in --strict, advice otherwise (old live files must stay valid) ----
    def sr(msg): (err if STRICT else warn)(w, msg)
    base = os.path.basename(path)
    if base != '%s-%s.json' % (d['setId'], d['level']):
        sr('the file must be named "%s-%s.json" (the build looks for exactly that name), not "%s"' % (d['setId'], d['level'], base))
    if BAD_SETNAME.search(d['setName']):
        sr('setName "%s" looks like a batch or level label. It is the page title of the set (for example "Across the whole age"); '
           'the level is shown separately, and both level files must carry the same setName' % d['setName'])
    elif d['setName'].lower().startswith(d['ageName'].lower() + ' -'):
        warn(w, 'setName starts with the age name; the page already shows "%s"' % d['ageName'])
    if SOURCE_WORDS.search(d['levelNote']):
        sr('levelNote names a source ("%s"); say what the level tests instead' % SOURCE_WORDS.search(d['levelNote']).group(0))
    if STRICT:
        for k in INERT_SET_FIELDS:
            if k in d: err(w, '"%s" is not read by the site; remove it' % k)
        if 'passages' in d and d['passages'] == []: err(w, 'remove the empty "passages" list (leave the key out when the set has no passages)')
    if REG is not None and d['age'] in REG:
        a = REG[d['age']]
        if a['name'] and d['ageName'] != a['name']: sr('ageName is "%s"; the site calls this age "%s"' % (d['ageName'], a['name']))
        if a['article'] and d['notes'] != '/notes/%s/' % a['article']: sr('notes should be "/notes/%s/" for this age' % a['article'])
        nt = ('%s \u2014 the full notes' % a['notesName']) if a['notesName'] else None
        if nt and d['notesTitle'] != nt: warn(w, 'notesTitle is usually "%s"' % nt)
        st = a['sets'].get(d['setNumber'])
        if st:
            if st.get('title') and d['setName'].strip().lower() != st['title'].strip().lower():
                warn(w, 'the site plan names Set %d "%s"; setName here is "%s" (keep the plan title unless the owner chose another)' % (d['setNumber'], st['title'], d['setName']))
            if st.get('levels') and d['level'] not in st['levels']:
                warn(w, 'the site plan has Set %d at %s level, not %s' % (d['setNumber'], ' and '.join(st['levels']), d['level']))
        else:
            warn(w, 'the site plan has no Set %s for this age' % d['setNumber'])

    t = d['topics']
    if not isinstance(t, dict) or not t: err(w, '"topics" must be an object of key: label'); return False
    for k, v in t.items():
        if not re.match(r'^[a-z][a-z0-9-]{1,23}$', k): err(w, 'topic key "%s": use 2-24 lowercase letters, digits or hyphens' % k)
        if not isinstance(v, str) or not v.strip(): err(w, 'topic "%s" needs a label' % k)
        elif len(v) > 30: warn(w, 'topic label "%s" is long; keep it under 30 characters' % v)
    if not 3 <= len(t) <= 8: warn(w, 'a set usually has 4 to 6 topics; this one has %d' % len(t))
    tr = d['topicRead']
    if not isinstance(tr, dict): err(w, '"topicRead" must be an object of topic key: anchor'); return False
    # topicRead links are optional helpers. A complex set leaves it {} on purpose (no error).
    # A set that uses them should cover every topic, so nudge only when it uses them at all.
    if tr:
        for k in t:
            if k not in tr: warn(w, 'topic "%s" has no "read" link in topicRead' % k)
    for k, v in tr.items():
        if k not in t: err(w, 'topicRead names "%s" which is not in topics' % k)
        if not isinstance(v, str) or not re.match(r'^[a-z0-9-]+$', v): err(w, 'topicRead "%s": "%s" is not a valid anchor' % (k, v))
        elif v in SKIP_ANCHORS: warn(w, 'topicRead "%s" points to "%s", which is not a real part of the article' % (k, v))
        elif anchors and v not in anchors: err(w, 'topicRead "%s": anchor "%s" is not in the article' % (k, v))
    if 'quote' in d:
        q = d['quote']
        if not (isinstance(q, dict) and set(q) == {'text', 'source'} and all(isinstance(x, str) and x.strip() for x in q.values())):
            err(w, '"quote" must be {"text": "...", "source": "..."} or left out')

    # "passages": optional. Questions point at one by "passageId" (checked per question).
    if 'passages' in d:
        ps = d['passages']
        if not isinstance(ps, list):
            err(w, '"passages" must be a list when present')
        elif ps:   # an empty list is fine (the batch generator writes "passages": [] when a set has none)
            seen = set()
            for i, p in enumerate(ps, 1):
                pw = '%s passage %d' % (w, i)
                if not isinstance(p, dict): err(pw, 'must be an object'); continue
                pid = p.get('id')
                if not isinstance(pid, str) or not re.match(r'^[a-z0-9-]+$', pid or ''):
                    err(pw, 'needs an "id" like "p1"')
                elif pid in seen: err(pw, 'id "%s" is used twice' % pid)
                else: seen.add(pid)
                for key in ('title', 'text'):
                    if not isinstance(p.get(key), str) or not p.get(key, '').strip():
                        err(pw, 'needs a non-empty "%s"' % key)
                bad = [k for k in p if k not in PASSAGE_KEYS]
                if bad: err(pw, 'unknown field(s): %s' % ', '.join(bad))

    qs = d['questions']
    if not isinstance(qs, list): err(w, '"questions" must be a list'); return False
    if len(qs) != count: err(w, 'has %d questions, expected %d' % (len(qs), count))
    return True

def check_questions(path, d, anchors):
    qs, topics = d['questions'], d['topics']
    pass_ids = {p['id'] for p in d.get('passages', []) if isinstance(p, dict) and isinstance(p.get('id'), str)}
    ids_seen = {}
    pos, own, per_topic, longest, stats = [], 0, Counter(), 0, Counter()
    id_nums, fallback, cx = [], 0, 0
    for i, q in enumerate(qs, 1):
        w = '%s Q%d' % (path, i)
        if not isinstance(q, dict): err(w, 'must be an object'); continue
        for k in Q_CORE:
            if k not in q: err(w, 'missing "%s"' % k)
        extra = [k for k in q if k not in Q_ALLOWED]
        if extra: err(w, 'unknown field(s): %s' % ', '.join(extra))
        if any(k not in q for k in Q_CORE): continue

        # optional complex-format fields
        if 'id' in q:
            qid = q['id']
            if not isinstance(qid, str) or not qid.strip(): err(w, '"id" must be a non-empty string')
            elif qid in ids_seen: err(w, 'id "%s" is also used by %s' % (qid, ids_seen[qid]))
            else: ids_seen[qid] = w
        if 'qtype' in q and q['qtype'] not in QTYPES:
            warn(w, 'qtype "%s" is unusual (known: %s)' % (q['qtype'], ', '.join(sorted(QTYPES))))
        if 'passageId' in q and q['passageId'] not in pass_ids:
            err(w, 'passageId "%s" has no matching passage in "passages"' % q['passageId'])

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
            # the question may hold line breaks (List I / List II, A. B. C. D.); options and the explanation may not
            allow_nl = (label == 'question')
            if txt != txt.strip() or '  ' in txt or '\r' in txt or ('\n' in txt and not allow_nl):
                err(w, '%s has stray spaces or a line break' % label)
            if re.search(r'\*\*|`|^#|</?[a-z]+>', txt): err(w, '%s contains markdown or HTML' % label)
            if re.search(r'[ऀ-ॿ]', txt): err(w, '%s contains Hindi script; site text must be simple English' % label)
            if re.search(r'\bTODO\b|\bXXX\b|\?\?', txt): err(w, '%s has a placeholder' % label)
        for o in opts:
            if o.strip().lower().rstrip('.') in BAD_OPTIONS: err(w, 'option "%s" is not allowed' % o)
        # statement / chronology / match / passage questions end with "Choose the correct answer:" and are long by design
        complex_q = q.get('qtype') in ('combination', 'chrono', 'match', 'passage')
        if not stem.rstrip().endswith('?') and not complex_q: warn(w, 'question does not end with "?"')
        if words(stem) > (130 if complex_q else 45): warn(w, 'question is long (%d words)' % words(stem))
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

        # ---- site-ready checks: errors in --strict, advice otherwise ----
        kind = 'err' if STRICT else 'warn'
        letter = LEVEL_LETTER.get(d['level'])
        qid = q.get('id')
        if qid is None:
            rule('err', 'id-missing', w, 'every question needs an "id" like "%s-%s-01"' % (d['setId'], letter), strict_only=True)
        elif isinstance(qid, str):
            m = re.match(r'^(.+)-([emh])-(\d{2,3})$', qid)
            if not m or m.group(1) != d['setId']:
                rule(kind, 'id-format', w, 'id "%s" should look like "%s-%s-NN" (the build needs <setId>-<e|m|h>-<number>)' % (qid, d['setId'], letter))
            elif m.group(2) != letter:
                rule(kind, 'id-letter', w, 'id "%s" has level letter "%s" but this file is %s (use "%s"). One file holds one level, never a mix' % (qid, m.group(2), d['level'], letter))
            else:
                id_nums.append(int(m.group(3)))
        tid, pid = q.get('topicId'), q.get('periodId')
        if tid is None: rule('err', 'tid-missing', w, 'every question needs a "topicId" copied from the master taxonomy', strict_only=True)
        if pid is None: rule('err', 'pid-missing', w, 'every question needs a "periodId" (one of the 18 British period ids)', strict_only=True)
        if TAX is not None:
            if tid is not None and tid not in TAX: rule('err', 'tid-bad', w, 'topicId "%s" is not in the master taxonomy (the build would stop)' % tid)
            if pid is not None:
                if pid not in TAX: rule('err', 'pid-bad', w, 'periodId "%s" is not in the master taxonomy (the build would stop)' % pid)
                elif TAX[pid]['kind'] != 'period': rule('err', 'pid-kind', w, 'periodId "%s" is a %s node, not a period (the build would stop)' % (pid, TAX[pid]['kind']))
                elif TAX[pid]['parent'] == 'british-literature':
                    rule(kind, 'pid-broad', w, 'periodId "%s" is a broad age node; use the inner period (for example jacobean-era, restoration-era, modern-era, romantic, victorian)' % pid)
                elif d['age'] in HUB_PERIODS and pid not in HUB_PERIODS[d['age']]:
                    rule('warn', 'pid-outside', w, 'periodId "%s" is outside the periods of this age (%s); right only if textbook placement puts the fact there (CLAUDE.md rule 12)' % (pid, ', '.join(sorted(HUB_PERIODS[d['age']]))), strict_only=True)
            if tid is not None and tid == pid: fallback += 1
            if STRICT and tid in TAX and qt_direct(q):
                node = answer_node(opts[ans])
                if node and node != tid:
                    rule('warn', 'answer-subject', w, 'the right answer is "%s" (topic %s) but topicId is "%s". The owner\'s rule: when the right answer is a node, the answer is the subject; tag %s unless the stem is really about something else' % (opts[ans], node, tid, node))
        qt = q.get('qtype')
        if qt is None: rule('err', 'qtype-missing', w, 'every question needs a "qtype" (direct, combination, chrono, match or passage)', strict_only=True)
        else:
            if qt != 'direct': cx += 1
            if qt == 'passage' and 'passageId' not in q: rule('err', 'passage-no-id', w, 'a passage question needs "passageId"')
            if 'passageId' in q and qt != 'passage': rule('warn', 'passage-type', w, '"passageId" is set but qtype is "%s"' % qt)
            if qt in ('combination', 'chrono', 'match') and '\n' not in stem:
                rule('warn', 'qtype-nl', w, 'a %s question needs line breaks (\\n) so the statements or lists show on separate lines' % qt)
        for k in INERT_Q_FIELDS:
            if k in q: rule('err', 'inert-' + k, w, '"%s" is not read by the site; remove it' % k, strict_only=True)
        for label, txt in [('question', stem), ('explanation', q['explanation'])] + [('option %d' % (j + 1), o) for j, o in enumerate(opts)]:
            mm = SOURCE_WORDS.search(txt)
            if mm: rule(kind, 'src-words', w, '%s names its source ("%s"). Students read this and the repo is public: put the source only in "src"' % (label, mm.group(0)))
        if REASON_PREFIX.match(q['explanation']):
            rule(kind, 'reason-prefix', w, 'the explanation starts with "Per ..." / "According to ..."; write the reason itself, as the site\'s other sets do')

        s = q.get('src')
        if s is None and LEGACY: stats['none (legacy)'] += 1
        elif not isinstance(s, str) or not s.strip(): err(w, 'missing or empty "src": every question needs the page that proves it')
        elif s.startswith('user-supplied:'):
            stats['user-supplied'] += 1
            title = s.split(':', 1)[1].strip()
            if not title: err(w, '"src" says user-supplied but names nothing; give the book or note title')
            elif re.search(r'ugc net folder|drive folder', title, re.I): rule('warn', 'src-folder', w, '"src" names the Drive folder; give the book or note title instead', strict_only=True)
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
    if STRICT and id_nums and sorted(id_nums) != list(range(1, len(id_nums) + 1)):
        warn(path, 'ids do not run 01..%02d in order (fine when adding to an existing set; a new set starts at 01)' % len(id_nums))
    if TAX is not None and n and fallback / n > 0.25:
        warn(path, '%d of %d questions carry the period as their topicId (%.0f%%). The period is the last rung: climb to the work, writer or concept node where one exists (CLAUDE.md rule 12)' % (fallback, n, 100.0 * fallback / n))
    if STRICT and n >= 20 and d['level'] in COMPLEX_TARGET and cx is not None and any('qtype' in q for q in qs if isinstance(q, dict)):
        share, want = cx / float(n), COMPLEX_TARGET[d['level']]
        if abs(share - want) > 0.15:
            warn(path, '%.0f%% of the questions are complex (not direct); a %s file aims for about %.0f%%' % (100 * share, d['level'], 100 * want))
    return {'topics': dict(per_topic), 'pos': dict(Counter(pos)), 'sources': dict(stats), 'own': own, 'n': n, 'fallback': fallback, 'complex': cx}

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
    ap.add_argument('--strict', action='store_true', help='site-ready mode for new files (see the top of this file)')
    ap.add_argument('--taxonomy', help='path of taxonomy-master-reference.csv (found automatically when not given)')
    ap.add_argument('--registry', help='path of _data/mcqSpec.json or references/site-plan.json (found automatically when not given)')
    a = ap.parse_args()
    global LEGACY, STRICT, TAX, REG
    LEGACY = a.legacy
    STRICT = a.strict

    tp = a.taxonomy or find_file([here('..', 'references', 'taxonomy-master-reference.csv'), here('..', '..', 'supabase', 'data', 'taxonomy-master-reference.csv')])
    rp = a.registry or find_file([here('..', 'references', 'site-plan.json'), here('..', '..', '_data', 'mcqSpec.json')])
    try:
        if tp: TAX = load_taxonomy(tp)
        if rp: REG = load_registry(rp)
    except Exception as e:
        print('cannot read the taxonomy or registry file: %s' % e); return 2
    print('Taxonomy: %s' % ('%s (%d nodes)' % (tp, len(TAX)) if TAX else 'not found, so topicId / periodId are NOT checked against the master list'))
    print('Site plan: %s' % ('%s' % rp if REG else 'not found, so ageName / notes / setName are NOT compared with the site'))
    print('Mode: %s' % ('STRICT (new files: everything the site builds from must be right)' if STRICT else 'normal (site-ready problems are advice only)'))

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

    flush_rules()
    print()
    for p, s in summary.items():
        print('%s' % p)
        print('  questions: %d   topics: %s' % (s['n'], s['topics']))
        print('  correct-answer positions A/B/C/D: %s' % [s['pos'].get(i, 0) for i in range(4)])
        print('  sources: %s   (our own article: %d of %d)' % (s['sources'], s['own'], s['n']))
        if TAX is not None: print('  tags: %d at the period (topicId = periodId), %d more specific; complex questions: %d of %d' % (s['fallback'], s['n'] - s['fallback'], s['complex'], s['n']))
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
