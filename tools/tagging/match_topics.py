"""Topic matcher - the ladder (DRY RUN ONLY: returns tags, writes nothing).

Run `python3 tools/tagging/dry_run.py` for the match rate, `python3 tools/tagging/owner_checks.py` for the owner's 20 checks.
Data: supabase/data/taxonomy-master-reference.csv (nodes) and supabase/data/taxonomy-aliases.csv (other names).

Ladder, owner's rule: work -> writer -> movement/concept -> period.
Go down ONE rung at a time, and only when the rung above has no node in the master.
Falling to the period while a usable writer/work/concept IS in the master is wrong.

At each rung:
  1. look in the question's own AGE first, then (last resort) in the neighbouring British ages;
  2. evidence = the question text and the CORRECT answer (a wrong option never counts);
     the explanation only breaks ties / backs a name up;
  3. if several nodes of the rung are named, tag what the ANSWER is about:
       the node in the correct answer  >  not the 'subject of' name (death of X, friend of X)
       >  the maker ('composed by X', "X's poem")  >  the one the explanation names;
     still tied (true co-subjects, e.g. "Wyatt and Surrey") -> the group that holds both
     (a shared writer or movement), else the next rung.
Every question comes back with a log of the rungs tried, so a skipped rung is visible.
"""
import csv
import os
import re
import unicodedata

ROOT = os.environ.get('SITE_ROOT') or os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HONORIFICS = {'sir', 'dr', 'lord', 'lady', 'saint', 'st'}
# bare surnames that are also ordinary words / titles: never used alone
SURNAME_BLOCK = {'pope', 'swift', 'gray', 'gay', 'young', 'smart', 'butler', 'sterne', 'marvell'}
# bare surnames that are also common given names / very common surnames: need a second source
NAME_LIKE = {'smith', 'thomas'}
POPE_TITLE = re.compile(r'\bPope\s+[A-Z]')
INITIALS_NAME = re.compile(r'\b(?:[A-Z]\.\s?){1,3}[A-Z][a-z]+')
META_CAPS = re.compile(r'\bNOT (?:correct|true|accurate|matched|a\b)')          # capitals only: "do not a prison make" is not a trick question
META_WORDS = re.compile(r'which of the following (?:statements|pairings|is)|\bexcept\b', re.I)
CREATOR_BEFORE = re.compile(r"(?:\bby|composed by|written by|authored by|penned by|created by|edited by|translated by)\s+(?:the\s+)?(?:(?:Sir|Dr|Lord|Lady)\.?\s+)?$", re.I)
SUBJECT_BEFORE = re.compile(r"(?:death of|elegy (?:for|on|upon)|mourns?|mourning|friend of|patron(?:ess)? of|brother of|sister of|wife of|husband of|son of|daughter of|dedicated to|addressed to|satiri[sz]\w*|portrays?|attacks?|attacking|lampoons?|against|critici[sz]\w*|condemn\w*|mock\w*|ridicul\w*|parod\w*|respond\w* to|repl(?:y|ied|ies) to|answer\w* to)\s+(?:the\s+)?(?:(?:late|deceased|great|famous|fellow|young|elder|younger)\s+)?(?:(?:poet|dramatist|playwright|novelist|writer|critic|author|diarist|painter|actor)\s+)?(?:(?:Sir|Dr|Lord|Lady)\.?\s+)?$", re.I)
CREATOR_LIST = re.compile(r"(?:\bby|composed by|written by|authored by|penned by|created by|edited by|translated by)\s+(?:(?:[A-Z][\w.'’-]*\s+){0,3}[A-Z][\w.'’-]*(?:,\s*(?:and\s+)?|\s+and\s+|\s*&\s*))+$")
# "staged by Garrick", "dedicated to / praised by X": not the maker of the work (a plain "by" is too wide on its own)
NOT_MAKER_BY = re.compile(r"(?:staged|performed|produced|directed|managed|acted|published|printed|reviewed|praised|criticis?ed|attacked|rejected|banned|sponsored|commissioned|patronis?ed|defended|supported|opposed|read|heard|seen|preparation|performance|production|prefaced|introduced|illustrated|dedicated|endorsed)\s+(?:\w+\s+)?by\s+(?:the\s+)?(?:(?:Sir|Dr|Lord|Lady)\.?\s+)?(?:(?:[\w.'’-]+(?:\s+[\w.'’-]+){0,3})(?:,\s*(?:and\s+)?|\s+and\s+))*$", re.I)
NICK_BEFORE = re.compile(r"(?:name|names|nickname|called|dubbed|known as|termed|labell?ed)\s+(?:the\s+)?$", re.I)
TITLE_WORDS = {'sir', 'dr', 'doctor', 'lord', 'lady', 'mr', 'mrs', 'miss', 'ms', 'saint', 'st', 'king', 'queen', 'earl', 'duke', 'bishop',
               'dean', 'poet', 'laureate', 'playwright', 'dramatist', 'novelist', 'critic', 'essayist', 'author', 'satirist', 'diarist', 'divine', 'professor', 'captain', 'general', 'reverend', 'father', 'the', 'a', 'an', 'and', 'of', 'by', 'for', 'in', 'to'}
# "brother of the deceased poet X", "to silence the satires of X": X only describes the person asked for, he is not the subject
ANCHOR_BEFORE = re.compile(r"(?:(?:brother|sister|son|daughter|wife|husband|widow|nephew|niece|cousin|father|mother|heir)s? of|(?:silenc\w+|suppress\w*|censor\w*|curb\w*|persecut\w*|prosecut\w*)\s+(?:the\s+)?(?:[\w-]+\s+){0,3}of)\s+(?:the\s+)?(?:(?:late|deceased|great|famous|fellow|young|elder|younger)\s+)?(?:(?:poet|dramatist|playwright|novelist|writer|critic|author|diarist|painter|actor)\s+)?(?:(?:Sir|Dr|Lord|Lady)\.?\s+)?$", re.I)
COMPARE_BEFORE = re.compile(r"(?:since|like|unlike|than|following|inspired by|influenced by|modell?ed (?:on|after)|compared (?:with|to)|contemporar(?:y|ies) of|rival of|successor to|predecessor of|inspiration from|drawing (?:on|from)|derived from|based on|borrowed from|adapted from)\s+(?:the\s+)?(?:(?:Sir|Dr|Lord|Lady)\.?\s+)?$", re.I)
YEAR = re.compile(r'\b(1[0-9]{3}|20[0-2][0-9])\b')
FAR_YEARS = 100  # with no year in the text, a neighbouring-age node more than this many years from the question's period is refused (two Samuel Butlers)
YEAR_TOL = 40   # a neighbouring-age node is used only if every year in the question is within this many years of that age
REGNAL = re.compile(r'^(?:King )?(?:Richard|Henry|Edward|John)(?: [IVX]+)?(?:,? Part \d)?$')   # play titles that are also a monarch's name
WORK_NOUN = re.compile(r"^\s*(?:[\w-]+\s+){0,3}?(?:poem|poetry|play|tragedy|comedy|masque|novel|epic|romance|satire|elegy|ode|sonnets?|treatise|essay|essays|drama|collection|anthology|translation|biography|diary|sermon|pamphlet|tale|lyric|ballad|verse|work|book|story|stories|trilogy|sequence)\b", re.I)
SUBJECT_IN_TITLE = re.compile(r"(?:life|lives|memoirs?|biography|letters?|elegy|ode|epistle|essay|lines|lament|tribute|portrait) (?:of|on|to|for|upon)\s+(?:the\s+)?(?:(?:Sir|Dr|Lord|Lady)\.?\s+)?$", re.I)
QUOTED = re.compile(r"(?<![A-Za-z])['\"‘“]([A-Z].{2,60}?)['\"’”](?![A-Za-z])")


def strip_marks(s):
    s = s.replace('Æ', 'Ae').replace('æ', 'ae').replace('Œ', 'Oe').replace('œ', 'oe')
    s = unicodedata.normalize('NFKD', s)
    return ''.join(c for c in s if not unicodedata.combining(c))


def norm(s, keep_case=False):
    s = strip_marks(s).replace('’', "'").replace('‘', "'")
    s = re.sub(r"'s\b", '', s)          # possessives: Marlowe's -> Marlowe
    s = s.replace("'", '')
    s = re.sub(r'[^A-Za-z0-9]+', ' ', s).strip()
    return s if keep_case else s.lower()


class Taxonomy:
    def __init__(self):
        rows = list(csv.DictReader(open(f'{ROOT}/supabase/data/taxonomy-master-reference.csv', encoding='utf-8', newline='')))
        self.by = {r['id']: r for r in rows}
        self._age = {}

    def parent(self, i):
        return self.by[i]['parent_id']

    def age_range(self, age_id):
        m = re.search(r'\((\d{3,4})-(\d{4})?\)', self.by[age_id]['name'])
        return (int(m.group(1)), int(m.group(2)) if m.group(2) else 2030) if m else (0, 2030)

    def age_of(self, i):
        """The British age node (child of british-literature) above this node, or None."""
        if i in self._age:
            return self._age[i]
        j, res = i, None
        while j:
            if self.by[j]['parent_id'] == 'british-literature':
                res = j
                break
            j = self.by[j]['parent_id']
        self._age[i] = res
        return res

    def chain(self, i):
        out = []
        while i:
            out.append(i)
            i = self.by[i]['parent_id']
        return out

    def lca(self, ids):
        """lowest common ancestor of several nodes (excluding the nodes themselves)"""
        chains = [self.chain(self.by[i]['parent_id']) if self.by[i]['parent_id'] else [] for i in ids]
        common = [n for n in chains[0] if all(n in c for c in chains[1:])]
        return common[0] if common else None


def aliases_for(node, surnames_in_age):
    """[(alias_normalised, alias_original, needs_capital)]"""
    name, kind = node['name'], node['kind']
    if kind == 'writer':
        name = re.sub(r'\s*\([^)]*\)', '', name).strip()
    out = []
    if kind == 'writer':
        toks = [t for t in re.split(r'\s+', name) if t]
        no_hon = [t for t in toks if norm(t) not in HONORIFICS]
        full = ' '.join(no_hon)
        out.append((norm(full), full, False))
        if toks and toks[0].lower() == 'the':
            return [(norm(full), full, False)]
        if ' '.join(toks) != full:
            out.append((norm(' '.join(toks)), ' '.join(toks), False))
        if len(no_hon) >= 3:
            fl = no_hon[0] + ' ' + no_hon[-1]
            out.append((norm(fl), fl, False))
        sur = no_hon[-1] if no_hon else ''
        if len(norm(sur)) >= 4 and norm(sur) not in SURNAME_BLOCK and surnames_in_age.get(norm(sur)) == 1:
            out.append((norm(sur), sur, True))
    else:
        variants = {name}
        for sep in (':', ' (', ', or ', ' or '):
            if sep in name:
                variants.add(name.split(sep)[0])
        for v in list(variants):
            variants.add(re.sub(r'^(The|A|An)\s+', '', v))
        for v in variants:
            n = norm(v)
            if len(n) >= 4:
                out.append((n, v, len(n.split()) == 1))
    seen, res = set(), []
    for a in out:
        if a[0] and a[0] not in seen:
            seen.add(a[0])
            res.append(a)
    return res


def load_aliases():
    """{node_id: [alias, ...]} from supabase/data/taxonomy-aliases.csv"""
    out = {}
    path = f'{ROOT}/supabase/data/taxonomy-aliases.csv'
    if os.path.exists(path):
        for r in csv.DictReader(open(path, encoding='utf-8', newline='')):
            out.setdefault(r['node_id'], []).append(r['alias'])
    return out


# Cross-area guard (owner): a match that rests ONLY on a period or area word is refused.
# "Old English", "Victorian", "English" name an age or a language, not a topic of another area.
GENERIC = set("""old middle modern english anglo saxon norman victorian romantic georgian edwardian elizabethan jacobean
caroline augustan renaissance restoration commonwealth tudor neoclassical postmodern medieval early late age ages period
periods century british american indian african caribbean canadian australian irish scottish welsh literature literary
literatures poetry poem poems drama fiction prose novel novels writing writers writer studies
history language languages world the of and in a an to for on or with by from""".split())


def distinctive(alias_norm):
    """True if the alias has at least one word that is not a period, area or filler word."""
    return any(t not in GENERIC for t in alias_norm.split())


PERSON_NOUNS = {'poet', 'dramatist', 'novelist', 'writer', 'playwright', 'critic', 'satirist', 'essayist', 'play', 'raphaelite', 'wit'}


def number_variants(s):
    """Owner's general rule: a group term matches in the singular and the plural
    ("Cavalier Poets" = "Cavalier poet"). Only the last word changes, and only on names of 2+ words."""
    w = s.split()
    if len(w) < 2 and '-' not in s:
        return []
    last = w[-1]
    if last.lower().endswith('s') and not last.lower().endswith('ss') and len(last) > 3:
        return [' '.join(w[:-1] + [last[:-1]])]
    if last.lower() in PERSON_NOUNS:
        return [' '.join(w[:-1] + [last + 's'])]
    return []


def extra_aliases(node, alias_map):
    """alias entries (normalised, original, needs_capital) from the aliases file, plus number variants for groups"""
    names = list(alias_map.get(node['id'], []))
    if node['kind'] in ('concept', 'movement'):
        base = re.sub(r'^(The|A|An)\s+', '', node['name'])
        names += [base] + list(names)
        names = list(dict.fromkeys(names))
        for n in list(names):
            names += number_variants(n)
    out, seen = [], set()
    for n in names:
        k = norm(n)
        if len(k) >= 4 and k not in seen:
            seen.add(k)
            out.append((k, n, len(k.split()) == 1 and n[:1].isupper()))
    return out


class Matcher:
    def __init__(self):
        self.tx = Taxonomy()
        self.alias_map = load_aliases()
        # SAME-NAME RULE (owner). When two people in the master share a surname, neither may be matched on the bare surname;
        # when they share a whole name, neither may be matched on it. A disambiguator (given name, initial, title, work or date)
        # must appear in the question; if none does, the match is refused and the ladder climbs.
        self.sharers_surname, self.sharers_name, self.works_of = {}, {}, {}
        for r in self.tx.by.values():
            if r['kind'] == 'writer':
                nm = re.sub(r'\s*\([^)]*\)', '', r['name']).strip()
                toks = [t for t in nm.split() if norm(t) not in HONORIFICS]
                if toks:
                    self.sharers_name.setdefault(norm(' '.join(toks)), set()).add(r['id'])
                    self.sharers_surname.setdefault(norm(toks[-1]), set()).add(r['id'])
            elif r['kind'] == 'work' and r['parent_id'] in self.tx.by and self.tx.by[r['parent_id']]['kind'] == 'writer':
                for v in {r['name'], re.sub(r'^(The|A|An)\s+', '', r['name'])}:
                    n = norm(v)
                    if len(n.split()) >= 2 or len(n) >= 7:
                        self.works_of.setdefault(r['parent_id'], []).append(n)
        brit = [r for r in self.tx.by.values()
                if r['area'] == 'British Literature' and r['kind'] in ('writer', 'work', 'concept', 'movement')]
        by_age = {}
        for r in brit:
            by_age.setdefault(self.tx.age_of(r['id']), []).append(r)
        self.pool = {}
        self.all_alias = set()
        for age, nodes in by_age.items():
            sur = {}
            for r in nodes:
                if r['kind'] == 'writer':
                    s = norm(r['name'].split()[-1])
                    sur[s] = sur.get(s, 0) + 1
            self.pool[age] = []
            for r in nodes:
                als = aliases_for(r, sur)
                have = {a[0] for a in als}
                als += [a for a in extra_aliases(r, self.alias_map) if a[0] not in have]
                self.pool[age].append((r['id'], r['kind'], als))
            for _, _, als in self.pool[age]:
                for an, _, _ in als:
                    self.all_alias.add(an)
        # ---- other areas (cross-area matching). No bare surnames: a surname alone is not a distinctive name.
        surn_all = {}
        for r in self.tx.by.values():
            if r['kind'] == 'writer':
                k = norm(r['name'].split()[-1])
                surn_all[k] = surn_all.get(k, 0) + 1
        self.xpool, self.xrefused = [], []
        for r in self.tx.by.values():
            if r['area'] == 'British Literature' or r['kind'] not in ('writer', 'work', 'concept', 'movement'):
                continue
            als = [a for a in aliases_for(r, surn_all) if not (r['kind'] == 'writer' and a[2])]
            good = [a for a in als if distinctive(a[0])]
            bad = [a for a in als if not distinctive(a[0])]
            if good:
                self.xpool.append((r['id'], r['kind'], good))
            if bad:
                self.xrefused.append((r['id'], r['kind'], bad))
        # a bare surname inside a longer title/name of ANOTHER node is not a mention of the person ("Cry, the Peacock")
        self.longer = {}
        for r in self.tx.by.values():
            for v in {r['name'], re.sub(r'^(The|A|An)\s+', '', r['name'])}:
                n = norm(v)
                if len(n.split()) >= 2:
                    for tok in set(n.split()):
                        if len(tok) >= 4:
                            self.longer.setdefault(tok, []).append((n, r['id']))
        for nid_, al_list in self.alias_map.items():
            for al in al_list:
                n = norm(al)
                if len(n.split()) >= 2:
                    for tok in set(n.split()):
                        if len(tok) >= 4:
                            self.longer.setdefault(tok, []).append((n, nid_))
        # every non-British node's names too, so "not in the master" is true to the whole master
        for r in self.tx.by.values():
            if r['area'] != 'British Literature':
                self.all_alias.add(norm(r['name']))
                self.all_alias.add(norm(re.sub(r'^(The|A|An)\s+', '', r['name'])))

    def _years_range(self, i):
        n = self.tx.age_of(i)
        if n:
            return self.tx.age_range(n)
        par = self.tx.by[i]['parent_id']
        return self.tx.age_range(par) if par and re.search(r'\(\d{3,4}-', self.tx.by[par]['name']) else (0, 2030)

    def disambiguated(self, nid, an, stem, ans):
        """Does the question itself tell the sharers apart? A work of THIS writer is named, or a year fits his age and no other sharer's."""
        text = stem + ' ' + ans
        t = ' ' + norm(text) + ' '
        if any((' ' + w + ' ') in t for w in self.works_of.get(nid, ())):
            return True
        years = [int(y) for y in YEAR.findall(text)]
        if not years:
            return False
        sharers = self.sharers_name.get(an) if len(self.sharers_name.get(an, ())) >= 2 else self.sharers_surname.get(an, set())
        lo, hi = self._years_range(nid)
        mine = any(lo <= y <= hi for y in years)
        others = any(l <= y <= h for i in sharers if i != nid for (l, h) in [self._years_range(i)] for y in years)
        return mine and not others

    def other_given_name(self, alias_orig, nid, text):
        """True if EVERY occurrence of this bare surname follows someone else's given name ("Francis Godolphin" is not
        Sidney Godolphin; "Sir Robert Walpole" is not Horace Walpole). Only when that name starts with a different
        letter than the node's own given names/initials, so "William Butler Yeats" and "Benjamin Jonson" still count."""
        toks = [t for t in self.tx.by[nid]['name'].split() if t]
        own_given = [norm(t) for t in toks[:-1]]
        if not own_given or 'and' in own_given:
            return False
        initials = {g[0] for g in own_given if g}
        plain = strip_marks(text).replace('’', "'")
        occ = list(re.finditer(r'(?<![A-Za-z])' + re.escape(strip_marks(alias_orig)) + r"(?![A-Za-z])", plain))
        if not occ:
            return False
        for m in occ:
            pre = plain[:m.start()].rstrip()
            w = re.search(r"([A-Za-z][A-Za-z'-]*)$", pre)
            if not w:
                return False
            word, head = w.group(1), pre[:w.start()].rstrip()
            # in a short text (an answer such as "Francis Godolphin") the first word IS the given name, not a sentence start
            sentence_start = ((not head) or head[-1] in '.?!:"\'') and len(plain.split()) > 4
            wn = norm(word)
            if word[0].isupper() and not sentence_start and wn not in TITLE_WORDS and wn not in GENERIC and wn[:1] not in initials:
                continue
            return False
        return True

    @staticmethod
    def inside_quotes(alias_orig, text):
        plain = strip_marks(text).replace('’', "'")
        spans = [(m.start(1), m.end(1)) for m in QUOTED.finditer(plain)]
        cap = strip_marks(alias_orig)
        occ = [m.start() for m in re.finditer(r'(?<![A-Za-z])' + re.escape(cap) + r'(?![A-Za-z])', plain)]
        return bool(occ and spans and all(any(x <= o < y for x, y in spans) for o in occ))

    def inside_longer(self, token, nid, text):
        t = ' ' + norm(text) + ' '
        occ = [m.start() for m in re.finditer(r'(?<= )' + re.escape(token) + r'(?= )', t)]
        if not occ:
            return False
        cover = []
        for n, oid in self.longer.get(token, []):
            if oid != nid:
                cover += [(m.start(), m.end()) for m in re.finditer(r'(?<= )' + re.escape(n) + r'(?= )', t)]
        return all(any(a <= o < b for a, b in cover) for o in occ)

    # ---------- evidence ----------
    @staticmethod
    def hit(alias_norm, alias_orig, needs_capital, text):
        t = ' ' + norm(text) + ' '
        if (' ' + alias_norm + ' ') not in t:
            return False
        if needs_capital:
            cap = norm(alias_orig, keep_case=True)
            tc = norm(text, keep_case=True)
            if not re.search(r'(?<![A-Za-z])' + re.escape(cap[:1].upper() + cap[1:]) + r'(?![A-Za-z])', tc):
                return False
            if cap == 'Pope' and POPE_TITLE.search(text):
                return False
        return True

    def collect(self, nodes, stem, ans, expl):
        stem_s = strip_marks(stem).replace('’', "'")
        quotes = [m.group(1).strip() for m in QUOTED.finditer(stem)]
        qset = {norm(x) for x in quotes} | {norm(re.sub(r'^(The|A|An)\s+', '', x)) for x in quotes}
        out = []
        for nid, kind, als in nodes:
            where, via, bare, creator, subject, compare, quoted, span, anchor = set(), None, False, False, False, False, False, None, False
            for an, ao, nc in als:
                s, a, e = (self.hit(an, ao, nc, stem), self.hit(an, ao, nc, ans), self.hit(an, ao, nc, expl))
                if kind == 'writer' and (len(self.sharers_name.get(an, ())) >= 2 or (nc and len(an.split()) == 1 and len(self.sharers_surname.get(an, ())) >= 2)):
                    if not self.disambiguated(nid, an, stem, ans):
                        s = a = e = False
                if nc and kind == 'writer' and len(an.split()) == 1:
                    s, a, e = (s and not self.inside_longer(an, nid, stem) and not self.other_given_name(ao, nid, stem),
                               a and not self.inside_longer(an, nid, ans) and not self.other_given_name(ao, nid, ans),
                               e and not self.inside_longer(an, nid, expl) and not self.other_given_name(ao, nid, expl))
                if kind == 'work' and len(an.split()) <= 2:      # 'The Temple' is not 'The Temple of Glass'
                    pre = re.compile(re.escape(strip_marks(ao)) + r'\s+of\s+(?:the\s+)?[A-Z]')
                    s, a, e = (s and not pre.search(strip_marks(stem)), a and not pre.search(strip_marks(ans)), e and not pre.search(strip_marks(expl)))
                if s and an in qset: quoted = True
                if a and kind in ('concept', 'movement') and any(norm(m.group(1)) == an for m in QUOTED.finditer(ans)): quoted = True
                if s and span is None:
                    t = ' ' + norm(stem) + ' '
                    k = t.find(' ' + an + ' ')
                    span = (k, k + len(an) + 2)
                if a:
                    am = re.search(r'(?<![A-Za-z])' + re.escape(strip_marks(ao)) + r"(?![A-Za-z])", strip_marks(ans), re.I)
                    if am and SUBJECT_IN_TITLE.search(strip_marks(ans)[max(0, am.start() - 30):am.start()]):
                        subject = True
                        a = False
                        where.add('answer-subject')
                if s: where.add('stem')
                if a: where.add('answer')
                if e: where.add('explanation')
                if (s or a or e) and via is None:
                    via, bare = ao, (nc and kind == 'writer')
                if s:
                    m = re.search(r'(?<![A-Za-z])' + re.escape(strip_marks(ao)) + r"(?:'s)?(?![A-Za-z])", stem_s, re.I)
                    if m:
                        before = stem_s[max(0, m.start() - 45):m.start()]
                        poss = stem_s[m.end() - 2:m.end()] == "'s" and WORK_NOUN.match(stem_s[m.end():m.end() + 60])
                        if ((CREATOR_BEFORE.search(before) or CREATOR_LIST.search(before)) and not NOT_MAKER_BY.search(before)) or poss:
                            creator = True
                        if SUBJECT_BEFORE.search(before):
                            subject = True
                        if ANCHOR_BEFORE.search(before):
                            anchor = True
                        if COMPARE_BEFORE.search(before):
                            compare = True
            if kind == 'work' and REGNAL.match(self.tx.by[nid]['name']) and not quoted:
                continue          # 'Richard II' in a history question is the king, not the play
            if where & {'stem', 'answer'}:
                where.discard('answer-subject')
                out.append({'id': nid, 'kind': kind, 'where': sorted(where), 'alias': via, 'bare': bare,
                            'creator': creator, 'subject': subject, 'compare': compare, 'quoted': quoted, 'span': span, 'anchor': anchor})
        return out

    def seen_titles(self, stem, ans):
        """-> (quoted strings in the question that are NOT nodes, the short right answer if it looks like a name/title and is NOT a node)"""
        quoted = []
        for m in QUOTED.finditer(stem):
            c = m.group(1).strip()
            n = norm(c)
            if n and n not in self.all_alias and not any(n == norm(r) for r in quoted):
                quoted.append(c)
        small = {'of', 'the', 'and', 'a', 'an', 'in', 'to', 'de', 'on', 'for', 'or'}
        words = ans.split()
        answer = None
        if 0 < len(words) <= 6 and all(w[:1].isupper() or w.lower() in small or not w[:1].isalpha() for w in words):
            c = ans.strip(" '\"")
            if norm(c) and norm(c) not in self.all_alias:
                answer = c
        return quoted, answer

    # ---------- the ladder ----------
    GAP_STOP = {'of', 'by', 'in', 'for', 'to', 'from', 'at', 'on', 'as', 'than', 'that', 'which', 'who', 'whom', 'whose', 'was', 'were', 'is', 'are',
                'had', 'has', 'did', 'does', 'his', 'her', 'their', 'its', 'after', 'before', 'when', 'while', 'because', 'about', 'against', 'into'}

    def _gap_joined(self, a, b, wide=False):
        """True if only a 'and' / 'or' / list comma (or, when wide, a few filler words such as 'and rival playwrights') sit between two names"""
        stem_t = ' ' + norm(self._stem) + ' '
        first, second = sorted([a, b], key=lambda c: c['span'][0])
        if second['span'][0] < first['span'][1]:
            return False
        toks = stem_t[first['span'][1]:second['span'][0]].split()
        if not wide:
            return not toks or toks in (['and'], ['or'], ['vs'], ['versus'])
        return len(toks) <= 6 and not any(t in self.GAP_STOP or t.endswith('ed') for t in toks)

    def _joined(self, cs):
        """names side by side in the stem ('A and B', 'A, B, C'): true co-subjects"""
        if len(cs) < 2 or not all(c.get('span') for c in cs):
            return False
        first = sorted(cs, key=lambda c: c['span'][0])
        return self._gap_joined(first[0], first[1])

    def pick(self, cs):
        """-> (chosen candidate | None, why, tied candidates)"""
        if len(cs) == 1:
            return cs[0], 'only one named', cs
        a = [c for c in cs if 'answer' in c['where']]
        if len(a) == 1:
            return a[0], 'it is the answer', cs
        if a:
            cs = a
        ns = [c for c in cs if not (c['subject'] or c['compare'])]
        if 0 < len(ns) < len(cs):
            dropped = [c['id'] for c in cs if (c['subject'] or c['compare'])]
            cs = ns
            if len(cs) == 1:
                return cs[0], f"the other name ({', '.join(dropped)}) is only the subject of the question", cs
        cr = [c for c in cs if c['creator']]
        if len(cr) == 1:
            return cr[0], 'named as the maker ("by X" / "X\'s")', cs
        if cr:
            cs = cr
        ex = [c for c in cs if 'explanation' in c['where']]
        if self._joined(cs) and all('answer' not in c['where'] for c in cs):
            ex = []             # "A and B": the explanation naming one of them does not make it the subject
        if len(ex) == 1:
            return ex[0], 'only this one is named in the explanation', cs
        if ex:
            cs = ex
        if all('answer' not in c['where'] for c in cs) and all(c.get('span') for c in cs) and len(cs) > 1:
            stem_t = ' ' + norm(self._stem) + ' '
            first = sorted(cs, key=lambda c: c['span'][0])
            gap = stem_t[first[0]['span'][1]:first[1]['span'][0]].strip()
            joined = re.search(r'\b(both|between|versus|compar\w+|differ\w*|contrast\w*|shared|share|together)\b', self._stem, re.I) or \
                gap in ('', 'and', 'or', 'vs', 'versus')          # names side by side in a list are co-subjects, not "first wins"
            makers = all(c['creator'] for c in cs)               # "written by A, B and C": every one is a maker
            if not joined and not makers and first[0]['span'][0] != first[1]['span'][0]:
                return first[0], 'the first name in the question is its subject', cs
        spans = [c.get('span') for c in cs]
        if all(spans) and len(cs) > 1 and all(a[0] < b[1] and b[0] < a[1] for i, a in enumerate(spans) for b in spans[i + 1:]):
            best = max(cs, key=lambda c: c['span'][1] - c['span'][0])
            if sum(1 for c in cs if c['span'][1] - c['span'][0] == best['span'][1] - best['span'][0]) == 1:
                return best, 'the longer of two names that overlap in the same phrase', cs
        return None, 'co-subjects', cs

    def rung(self, label, kinds, pool_all, stem, prefix=''):
        """-> (candidate or None, log text)"""
        # a concept/movement whose exact name is quoted as a title ranks with works, unless a WRITER is the answer
        writer_is_answer = any(c['kind'] == 'writer' and 'answer' in c['where'] for c in pool_all)
        pool_all = [c for c in pool_all if c['id'] not in getattr(self, '_tie_block', ())]
        pool = [c for c in pool_all if c['kind'] in kinds or (label == 'work' and c['kind'] in ('concept', 'movement') and c['quoted'] and not writer_is_answer)]
        if not pool:
            return None, f"{prefix}{label}: none"
        # a bare surname named once is only used if nothing else casts doubt on it
        usable, doubts = [], []
        stem_named = any('stem' in c['where'] for c in pool)
        for c in pool:
            if c.get('anchor') and 'answer' not in c['where'] and not c['creator']:
                doubts.append(f"'{c['alias']}' only describes the person asked for (a relative, or the target of an action)")
                continue
            if getattr(self, '_ans_sentence', False) and stem_named and set(c['where']) == {'answer'}:
                doubts.append(f"'{c['alias']}' only inside a sentence-long answer")
                continue
            if c['compare'] and len(c['where']) < 2:
                doubts.append(f"'{c['alias']}' only as a comparison")
                continue
            if c['bare'] and len(c['where']) < 2:
                if norm(c['alias']) in NAME_LIKE:
                    doubts.append(f"'{c['alias']}' (a common name) named once")
                    continue
                if INITIALS_NAME.search(stem):
                    doubts.append(f"'{c['alias']}' named once next to another person")
                    continue
            usable.append(c)
        if not usable:
            return None, f"{prefix}{label}: none ({'; '.join(doubts)} - not used)"
        best, why, tied = self.pick(usable)
        if best and label == 'writer' and not prefix and 'answer' not in best['where'] and not best['creator'] and best.get('span'):
            near = [c for c in getattr(self, '_co_named', []) if c['id'] != best['id'] and c.get('span') and self._gap_joined(best, c, wide=True)
                    and not self.inside_quotes(c['alias'], stem)]
            if near:
                ids = [best['id']] + [c['id'] for c in near]
                self._tie_block = set(ids)          # a name that took part in the tie is not "rescued" afterwards
                return None, f"{prefix}{label}: co-subjects ({', '.join(ids)}; one is of a neighbouring age); no single one, and no group node holds them"
        if best:
            return best, f"{prefix}{label}: {best['id']} ✓ ({why}; named in {' + '.join(best['where'])})"
        # true co-subjects: the group that holds them all, if it is a node
        ids = [c['id'] for c in tied]
        g = self.tx.lca(ids)
        if g and self.tx.by[g]['area'] == 'British Literature' and self.tx.by[g]['kind'] in ('writer', 'concept', 'movement'):
            node = {'id': g, 'kind': self.tx.by[g]['kind'], 'where': ['stem'], 'alias': self.tx.by[g]['name'],
                    'bare': False, 'creator': False, 'subject': False, 'compare': False, 'quoted': False}
            return node, f"{prefix}{label}: {', '.join(ids)} are co-subjects; the group that holds them is {g} ✓"
        return None, f"{prefix}{label}: co-subjects ({', '.join(ids)}); no single one, and no group node holds them"

    def match(self, q, period_id, cross_age=True, cross_area=True):
        age = self.tx.parent(period_id)
        stem, ans = q['question'], q['options'][q['correct_option_id']]
        self._stem = stem
        self._tie_block = set()
        _w = ans.split()
        _quoted_whole = bool(re.fullmatch(r"\s*['\"‘“].+['\"’”]\s*", ans))
        _small = {'of', 'the', 'and', 'a', 'an', 'in', 'to', 'de', 'on', 'for', 'or'}
        self._ans_sentence = len(_w) > 6 and not _quoted_whole and sum(1 for w in _w if w[:1].islower() and w.lower() not in _small) >= 3
        expl = q.get('explanation', '') or ''
        meta = bool(META_CAPS.search(stem) or META_WORDS.search(stem))
        if meta:
            ans, expl = '', ''   # in a "which statement is wrong" question the answer is not the subject
        inage = self.collect(self.pool.get(age, []), stem, ans, expl)
        cross, rejected = [], []
        if cross_age:
            other = [n for a, ns in self.pool.items() if a != age for n in ns]
            years = [int(y) for y in YEAR.findall(stem + ' ' + ans + ' ' + expl)]
            for c in self.collect(other, stem, ans, expl):
                if c['bare'] or c['subject'] or c['compare'] or c['kind'] not in ('work', 'writer'):
                    continue            # neighbouring-age concepts are not reliable ("The Symbolist Movement")
                strong = len(c['where']) >= 2 or 'answer' in c['where']
                title = c['kind'] == 'work' and c['quoted']           # the exact title, in quotes
                maker = c['kind'] == 'writer' and c['creator']         # named as the maker ("by X", "X's poem")
                if not (strong or title or maker):
                    continue
                lo, hi = self.tx.age_range(self.tx.age_of(c['id']))
                plo, phi = self.tx.age_range(period_id) if re.search(r'\(\d{3,4}-', self.tx.by[period_id]['name']) else self.tx.age_range(age)
                far_away = (not years) and max(0, plo - hi, lo - phi) > FAR_YEARS     # no dates in the text: a whole century away is another person
                if far_away or any(y < lo - YEAR_TOL or y > hi + YEAR_TOL for y in years):
                    rejected.append(c['id'])
                else:
                    cross.append(c)
        xarea = []
        if cross_area:
            ans_plain = norm(re.sub(r'^\s*(?:The|A|An)\s+', '', ans.strip(" '\"‘’“”")))
            for c in self.collect(self.xpool, stem, ans, expl):
                if c['subject'] or c['compare'] or c['bare']:
                    continue
                words = len(norm(c['alias']).split())
                if words == 1:
                    # a one-word name or term ("Nature", "Road", "Plot", "Character") must be the WHOLE answer or the exact quoted title;
                    # inside "The Ghost Road" or "The Gunpowder Plot" it is just a word
                    if not (ans_plain == norm(c['alias']) or c['quoted']):
                        continue
                    xarea.append(c)
                    continue
                strong = len(c['where']) >= 2 or 'answer' in c['where']
                title = c['kind'] == 'work' and c['quoted']
                maker = c['kind'] == 'writer' and c['creator']
                # a full personal name in the stem is enough ONLY if no writer of the question's own age is competing for it
                fullname = c['kind'] == 'writer' and not any(x['kind'] == 'writer' for x in inage)
                if strong or title or maker or fullname:
                    xarea.append(c)
        self._co_named = []
        if cross_age:
            other_all = [n for a, ns in self.pool.items() if a != age for n in ns]
            self._co_named = [c for c in self.collect(other_all, stem, ans, expl)
                              if c['kind'] == 'writer' and not c['bare'] and 'stem' in c['where'] and not c['subject'] and not c['compare'] and not c['anchor']]
        quoted_nn, ans_nn = self.seen_titles(stem, ans)
        suffix = f" [the answer, '{ans_nn}', is not a node]" if ans_nn else ''
        log = []
        if meta:
            log.append('which-statement question: only its wording is read')
        # "Which writer wrote 'A', 'B' and 'C'?" is about the writer's range, not about any one work
        listed = sum(1 for m in QUOTED.finditer(stem) if not NICK_BEFORE.search(stem[max(0, m.start() - 20):m.start()]))
        range_w = [c for c in inage if c['kind'] == 'writer' and 'answer' in c['where'] and not c['subject']]
        range_x = False
        if not range_w:
            range_w = [c for c in xarea if c['kind'] == 'writer' and 'answer' in c['where'] and not c['subject']]
            range_x = bool(range_w)
        any_work_ans = any(c['kind'] == 'work' and 'answer' in c['where'] for c in inage + xarea)
        if not meta and listed >= 2 and len(range_w) == 1 and not any_work_ans:
            # the work rung is always reported, even when the writer's-range rule answers first
            named_works = [c['id'] for c in inage + xarea if c['kind'] == 'work' and 'stem' in c['where']]
            if named_works:
                log.append(f"work: {', '.join(named_works)} named, but the question lists {listed} works and asks for the writer")
            else:
                log.append('work: none (no work node is named' + (("; quoted in the question, not a node: " + ', '.join(f"'{x}'" for x in quoted_nn[:3])) if quoted_nn else '') + ')')
            log.append(f"{'other area: ' if range_x else ''}writer: {range_w[0]['id']} ✓ (the question lists {listed} works and asks for the writer: it is about the writer's range)")
            area = self.tx.by[range_w[0]['id']]['area']
            return {'topicId': range_w[0]['id'], 'matched': True, 'rung': 'writer', 'crossed_age': False, 'crossed_area': range_x,
                    'trace': ' → '.join(log) + (f" [area: {area}]" if range_x else '') + suffix, 'where': range_w[0]['where'], 'bare': range_w[0]['bare'], 'alias': range_w[0]['alias']}
        phases = [('', inage, [('work', {'work'}), ('writer', {'writer'}), ('concept', {'concept', 'movement'})])]   # a quoted concept title also ranks as a work (rung())
        if cross:
            phases.append(('neighbouring age: ', cross, [('work', {'work'}), ('writer', {'writer'})]))
        if xarea:
            phases.append(('other area: ', xarea, [('work', {'work'}), ('writer', {'writer'}), ('concept', {'concept', 'movement'})]))
        for prefix, pool, rungs in phases:
            for i, (label, kinds) in enumerate(rungs):
                best, text = self.rung(label, kinds, pool, stem, prefix if i == 0 else '')
                if best is None and label == 'work' and not prefix:
                    text += ' (no work node is named' + (("; quoted in the question, not a node: " + ', '.join(f"'{x}'" for x in quoted_nn[:3])) if quoted_nn else '') + ')'
                log.append(text)
                if best:
                    area = self.tx.by[best['id']]['area']
                    tr = ' → '.join(log) + (f" [area: {area}]" if prefix.startswith('other area') else '') + suffix
                    return {'topicId': best['id'], 'matched': True, 'rung': label,
                            'crossed_age': prefix.startswith('neighbouring'), 'crossed_area': prefix.startswith('other area'),
                            'trace': tr, 'where': best['where'], 'bare': best.get('bare', False), 'alias': best.get('alias')}
        if rejected:
            log.append('not used: ' + ', '.join(rejected) + ' (another age; its dates do not fit the question)')
        log.append(f"period: {period_id} ✓ (ladder exhausted)")
        return {'topicId': period_id, 'matched': False, 'rung': 'period', 'crossed_age': False, 'crossed_area': False,
                'trace': ' → '.join(log) + suffix, 'where': [], 'bare': False}
