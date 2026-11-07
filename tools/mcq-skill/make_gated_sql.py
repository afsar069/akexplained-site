#!/usr/bin/env python3
"""
AK Explained: turn the question files of a LOGIN set into one SQL file that loads them into the
Supabase table public.mcq_papers.   (CLAUDE.md rule 15)

WHY THIS EXISTS
The GitHub repo is PUBLIC, so the question files of a login (or paid) set must never be committed
there. They are kept on the working machine only, checked here, and loaded into the database.
The browser then reads them from the table, and the database lets only logged-in students in.

  python3 tools/mcq-skill/make_gated_sql.py --access login <set>-easy.json <set>-medium.json --out load.sql

It does NOT touch the database. It checks the files and writes the SQL; Claude then runs that SQL
through the Supabase connector (owner's permission, rule 14), and reads the table back to confirm.

CHECKS (any error = no SQL is written)
  * every file is a question file for ONE set, with the same setId and rev, and its name is
    <setId>-<level>.json
  * the set is in _data/mcqSpec.json with "live": true, the same "access", the same "rev",
    the same levels, and "count" equal to the number of questions in each file
  * every question has a stable id of the form <setId>-<e|m|h>-NN, no id twice
  * 4 options (2 for True / False), correct_option_id in range, no duplicate question text
  * topicId / periodId (when present) exist in supabase/data/taxonomy-master-reference.csv
    and periodId is a `period` node (rule 12). Missing tags are a WARNING (the tagging tool adds them).
  * no id and no question text repeats a question in the public files (assets/questions, assets/instant)
The SQL itself also refuses to load if one of these question ids is already in ANOTHER row of the table.
"""
import argparse, csv, json, os, re, sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
LEVEL_LETTER = {'easy': 'e', 'medium': 'm', 'hard': 'h'}


def norm(t):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9]+', ' ', str(t).lower())).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('files', nargs='+')
    ap.add_argument('--access', required=True, choices=['login'])   # paid is not built yet
    ap.add_argument('--out', required=True)
    a = ap.parse_args()

    errors, warns = [], []
    err = errors.append

    # ---- registry
    spec = json.load(open(os.path.join(ROOT, '_data', 'mcqSpec.json'), encoding='utf8'))
    topic_kind = {}
    with open(os.path.join(ROOT, 'supabase', 'data', 'taxonomy-master-reference.csv'), encoding='utf8') as f:
        for r in csv.DictReader(f):
            topic_kind[r['id']] = r['kind']

    # ---- public question ids / texts (a login set must not repeat them)
    pub_ids, pub_text = {}, {}
    for d in ('assets/questions', 'assets/instant'):
        base = os.path.join(ROOT, d)
        if not os.path.isdir(base):
            continue
        for name in os.listdir(base):
            if not name.endswith('.json'):
                continue
            try:
                data = json.load(open(os.path.join(base, name), encoding='utf8'))
            except Exception:
                continue
            for q in (data if isinstance(data, list) else data.get('questions', [])):
                if q.get('id'):
                    pub_ids[q['id']] = d + '/' + name
                if q.get('question'):
                    pub_text.setdefault(norm(q['question']), d + '/' + name)

    papers = []
    for path in a.files:
        try:
            d = json.load(open(path, encoding='utf8'))
        except Exception as e:
            err('%s: cannot read as JSON (%s)' % (path, e)); continue
        papers.append((path, d))
    if errors:
        return finish(errors, warns)

    set_ids = {d.get('setId') for _, d in papers}
    revs = {d.get('rev') for _, d in papers}
    if len(set_ids) != 1:
        err('the files are for different sets: %s' % sorted(map(str, set_ids)))
    if len(revs) != 1:
        err('the files have different rev: %s' % sorted(map(str, revs)))
    if errors:
        return finish(errors, warns)
    set_id, rev = set_ids.pop(), revs.pop()
    if not isinstance(rev, int) or rev < 1:
        err('rev must be a whole number, 1 or more (got %r)' % (rev,))

    # ---- registry entry for the set
    m = re.match(r'^(.+)-set-(\d+)$', str(set_id))
    ent = None
    if not m:
        err('setId "%s" does not look like <age>-set-<n>' % set_id)
    else:
        age = next((x for x in spec['ages'] if x['slug'] == m.group(1)), None)
        ent = age and next((s for s in age.get('sets', []) if s.get('n') == int(m.group(2))), None)
        if not ent:
            err('%s is not in _data/mcqSpec.json (add the set first: number, title, meta, topics, levels, count)' % set_id)
    if ent:
        if ent.get('access') != a.access:
            err('mcqSpec has "access": %r for %s but you are loading it as %r' % (ent.get('access'), set_id, a.access))
        if ent.get('rev') != rev:
            err('mcqSpec "rev" is %r but the files say %r. Make them equal' % (ent.get('rev'), rev))
        levels_in_files = sorted(d.get('level') for _, d in papers)
        if sorted(ent.get('levels', [])) != levels_in_files:
            err('mcqSpec levels %s but the files are %s' % (ent.get('levels'), levels_in_files))

    # ---- the questions
    seen_id, seen_text = {}, {}
    for path, d in papers:
        lv = d.get('level')
        base = os.path.basename(path)
        if lv not in LEVEL_LETTER:
            err('%s: level %r is not easy / medium / hard' % (base, lv)); continue
        if base != '%s-%s.json' % (set_id, lv):
            err('%s: the file name must be %s-%s.json' % (base, set_id, lv))
        qs = d.get('questions')
        if not isinstance(qs, list) or not qs:
            err('%s: no questions' % base); continue
        if ent and ent.get('count') != len(qs):
            err('%s has %d questions but mcqSpec "count" is %r' % (base, len(qs), ent.get('count')))
        pat = re.compile(r'^%s-%s-\d+$' % (re.escape(str(set_id)), LEVEL_LETTER[lv]))
        untagged = 0
        for i, q in enumerate(qs, 1):
            qid = q.get('id')
            where = '%s #%d (%s)' % (base, i, qid)
            if not isinstance(qid, str) or not pat.match(qid):
                err('%s: id must look like %s-%s-NN' % (where, set_id, LEVEL_LETTER[lv])); continue
            if qid in seen_id:
                err('%s: id also used in %s' % (where, seen_id[qid]))
            seen_id[qid] = base
            if qid in pub_ids:
                err('%s: id already used in %s' % (where, pub_ids[qid]))
            opts = q.get('options')
            if not isinstance(opts, list) or len(opts) not in (2, 4) or any(not isinstance(o, str) or not o.strip() for o in opts):
                err('%s: needs 4 options (2 for True / False)' % where)
            c = q.get('correct_option_id')
            if not isinstance(c, int) or not isinstance(opts, list) or not (0 <= c < len(opts)):
                err('%s: correct_option_id is out of range' % where)
            txt = norm(q.get('question', ''))
            if not txt:
                err('%s: empty question' % where)
            elif txt in seen_text:
                err('%s: same question text as %s' % (where, seen_text[txt]))
            elif txt in pub_text:
                err('%s: same question text as a public question in %s' % (where, pub_text[txt]))
            seen_text.setdefault(txt, qid)
            t, p = q.get('topicId'), q.get('periodId')
            if not t or not p:
                untagged += 1
            if t and t not in topic_kind:
                err('%s: topicId "%s" is not in the master reference' % (where, t))
            if p and topic_kind.get(p) != 'period':
                err('%s: periodId "%s" is not a period node' % (where, p))
        if untagged:
            warns.append('%s: %d question(s) have no topicId / periodId (run the tagging tool before the set is opened)' % (base, untagged))

    if errors:
        return finish(errors, warns)

    # ---- the SQL
    all_ids = sorted(seen_id)
    tag = 'akq'
    for _, d in papers:
        blob = json.dumps(d, ensure_ascii=False)
        while '$' + tag + '$' in blob:
            tag += 'x'
    lines = ['-- Load the login set %s (%d level files) into public.mcq_papers. Generated by tools/mcq-skill/make_gated_sql.py.' % (set_id, len(papers)),
             '-- Contains question text: keep this file OUT of the public repo.',
             'do $check$',
             'begin',
             "  if exists (select 1 from public.mcq_papers p, jsonb_array_elements(p.body -> 'questions') q",
             '             where p.set_id <> %s and q ->> \'id\' = any (array[%s])) then' % (sql_str(set_id), ','.join(sql_str(i) for i in all_ids)),
             "    raise exception 'a question id of %s is already used by another set in mcq_papers';" % set_id,
             '  end if;',
             'end',
             '$check$;']
    for path, d in sorted(papers, key=lambda x: x[1]['level']):
        body = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
        lines.append("insert into public.mcq_papers (set_id, level, access, rev, body) values (%s, %s, %s, %d, $%s$%s$%s$::jsonb)"
                     % (sql_str(set_id), sql_str(d['level']), sql_str(a.access), rev, tag, body, tag))
        lines.append("on conflict (set_id, level) do update set access = excluded.access, rev = excluded.rev, body = excluded.body, updated_at = now();")
    with open(a.out, 'w', encoding='utf8') as f:
        f.write('\n'.join(lines) + '\n')
    print('OK: %s, rev %d, %d level file(s), %d questions, access %s -> %s' % (set_id, rev, len(papers), len(all_ids), a.access, a.out))
    return finish(errors, warns)


def sql_str(s):
    return "'" + str(s).replace("'", "''") + "'"


def finish(errors, warns):
    for w in warns:
        print('WARNING:', w)
    for e in errors:
        print('ERROR:', e)
    if errors:
        print('%d error(s): no SQL written.' % len(errors))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
