#!/usr/bin/env python3
"""Build the zip of the UGC NET MCQ skill (the file the owner uploads to Claude).

    python3 tools/build_skill_zip.py            # write tools/dist/ugc-net-mcq-generator-tagger.zip
    python3 tools/build_skill_zip.py --check    # exit 1 if the committed zip is out of date (nothing is written)
    python3 tools/build_skill_zip.py --unpack DIR   # also write the unpacked skill folder into DIR (for testing)

The skill is assembled from the site's own files, so nothing is typed twice:
  SKILL.md, references/question-types.md  tools/ugc-net-mcq-skill/                 (hand-written, the only copy)
  references/taxonomy-*.csv               supabase/data/                            (master topic list)
  references/period-nodes.md              tools/mcq-tagger-skill/references/
  scripts/validate_mcq.py                 tools/mcq-skill/validate_mcq.py           (the site's own checker)
  scripts/tag_mcq.py                      tools/mcq-tagger-skill/scripts/
  references/site-ages.md, site-plan.md,  generated here from _data/mcqSpec.json    (ages, notes paths, set plan)
  references/site-plan.json

Run it again, and commit the new zip, whenever the taxonomy, the registry (a set goes live, a title changes) or one
of those scripts changes. `--check` tells you when. Python 3 only, no packages.
"""
import html
import importlib.util
import io
import json
import os
import re
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKILL = 'ugc-net-mcq-generator-tagger'
OUT = os.path.join(ROOT, 'tools', 'dist', SKILL + '.zip')


def p(*parts):
    return os.path.join(ROOT, *parts)


def read(path):
    with io.open(path, 'rb') as fh:
        return fh.read()


def validator_module():
    spec = importlib.util.spec_from_file_location('validate_mcq', p('tools', 'mcq-skill', 'validate_mcq.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def plain(text):
    """meta line of the registry -> plain text (no tags, no entities)"""
    t = re.sub(r'<[^>]+>', '', html.unescape(text or ''))
    return re.sub(r'\s+', ' ', t).strip()


def scope_of(meta):
    t = plain(meta)
    parts = t.split(' · ', 1)
    return parts[1].strip() if len(parts) == 2 else ''


def generated():
    vm = validator_module()
    spec = json.loads(read(p('_data', 'mcqSpec.json')).decode('utf-8'))
    ages, plan = [], []
    md_ages = ['# The 20 ages of the site\n',
               'Generated from `_data/mcqSpec.json` and the validator. **Copy these values exactly** into a set file.\n',
               '| `age` (hub slug) | `ageName` | Years | `notes` | `notesTitle` | `periodId` values used by this age |',
               '|---|---|---|---|---|---|']
    md_plan = ['# The set plan, age by age\n',
               'Generated from `_data/mcqSpec.json`. **Status** says what exists on the site now. A planned set has a title and a scope but no',
               'questions yet. "live, free" means its files are public; "live, login" means only logged-in students read them. Use the title as',
               '`setName` and the scope to choose the set-local `topics`. The levels column is what the plan expects.\n']
    for a in spec['ages']:
        slug = a['slug']
        nt = '%s — the full notes' % a.get('notesName', '')
        periods = ', '.join('`%s`' % x for x in sorted(vm.HUB_PERIODS.get(slug, [])))
        md_ages.append('| `%s` | %s | %s | `/notes/%s/` | %s | %s |' % (slug, a['name'], a['years'], a['article'], nt, periods))
        sets = []
        md_plan.append('## `%s` — %s (%s)\n' % (slug, a['name'], a['years']))
        md_plan.append('Notes: `/notes/%s/` (%s). `age` = `%s`, `ageName` = `%s`.\n' % (a['article'], nt, slug, a['name']))
        if a.get('sets'):
            md_plan.append('| Set | Title (`setName`) | Levels | Status | Scope |')
            md_plan.append('|---|---|---|---|---|')
        else:
            md_plan.append('_No sets planned yet._\n')
        for s in a.get('sets', []):
            status = 'planned'
            if s.get('live'):
                status = 'live, login' if s.get('access') == 'login' else 'live, free'
            sc = scope_of(s.get('meta', ''))
            md_plan.append('| %d | %s | %s | %s | %s |' % (s['n'], s['title'], ' + '.join(s['levels']), status, sc))
            sets.append({'n': s['n'], 'title': s['title'], 'levels': s['levels'], 'count': s.get('count', 50),
                         'live': bool(s.get('live')), 'access': s.get('access'), 'scope': sc})
        if a.get('sets'):
            md_plan.append('')
            tp = ', '.join('%s (%s)' % (t['label'], t['value']) for t in a.get('topics', []))
            if tp:
                md_plan.append('Hub topics the plan uses: %s.\n' % tp)
        ages.append({'slug': slug, 'name': a['name'], 'years': a['years'], 'article': a['article'],
                     'notesName': a.get('notesName', ''), 'sets': sets})
    md_ages.append('')
    md_ages.append('`renaissance` and `neoclassical` span several periods. Place each question by the rules in SKILL.md section 5. '
                   'A period outside the list above is allowed only when textbook placement says so.')
    return {
        'references/site-ages.md': ('\n'.join(md_ages) + '\n').encode('utf-8'),
        'references/site-plan.md': ('\n'.join(md_plan) + '\n').encode('utf-8'),
        'references/site-plan.json': (json.dumps({'_about': 'Generated by tools/build_skill_zip.py from _data/mcqSpec.json. Do not edit.',
                                                  'ages': ages}, indent=2, ensure_ascii=False) + '\n').encode('utf-8'),
    }


def files():
    out = {
        'SKILL.md': read(p('tools', 'ugc-net-mcq-skill', 'SKILL.md')),
        'references/question-types.md': read(p('tools', 'ugc-net-mcq-skill', 'references', 'question-types.md')),
        'references/period-nodes.md': read(p('tools', 'mcq-tagger-skill', 'references', 'period-nodes.md')),
        'references/taxonomy-master-reference.csv': read(p('supabase', 'data', 'taxonomy-master-reference.csv')),
        'references/taxonomy-aliases.csv': read(p('supabase', 'data', 'taxonomy-aliases.csv')),
        'scripts/validate_mcq.py': read(p('tools', 'mcq-skill', 'validate_mcq.py')),
        'scripts/tag_mcq.py': read(p('tools', 'mcq-tagger-skill', 'scripts', 'tag_mcq.py')),
    }
    out.update(generated())
    return out


def build_zip(content):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for name in sorted(content):
            zi = zipfile.ZipInfo('%s/%s' % (SKILL, name), date_time=(2026, 1, 1, 0, 0, 0))   # fixed time: the same input gives the same zip
            zi.compress_type = zipfile.ZIP_DEFLATED
            zi.external_attr = (0o755 if name.startswith('scripts/') else 0o644) << 16
            z.writestr(zi, content[name])
    return buf.getvalue()


def main():
    args = sys.argv[1:]
    content = files()
    data = build_zip(content)
    if '--check' in args:
        if not os.path.exists(OUT):
            print('MISSING: %s. Run: python3 tools/build_skill_zip.py' % os.path.relpath(OUT, ROOT))
            return 1
        old = zipfile.ZipFile(OUT)
        have = {n[len(SKILL) + 1:]: old.read(n) for n in old.namelist() if n.startswith(SKILL + '/')}
        stale = sorted(n for n in set(have) | set(content) if have.get(n) != content.get(n))
        if stale:
            print('OUT OF DATE: %s differs from its sources in: %s' % (os.path.relpath(OUT, ROOT), ', '.join(stale)))
            print('Run: python3 tools/build_skill_zip.py   and commit the new zip.')
            return 1
        print('OK: %s matches its sources (%d files).' % (os.path.relpath(OUT, ROOT), len(content)))
        return 0
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'wb') as fh:
        fh.write(data)
    print('wrote %s (%d files, %d bytes)' % (os.path.relpath(OUT, ROOT), len(content), len(data)))
    if '--unpack' in args:
        dest = args[args.index('--unpack') + 1]
        for name, blob in content.items():
            fp = os.path.join(dest, SKILL, name)
            os.makedirs(os.path.dirname(fp), exist_ok=True)
            with open(fp, 'wb') as fh:
                fh.write(blob)
        print('unpacked into %s' % os.path.join(dest, SKILL))
    return 0


if __name__ == '__main__':
    sys.exit(main())
