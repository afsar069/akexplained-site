#!/usr/bin/env python3
"""Turn the live paper catalog into the site's _data/paperCatalog.json.

WHY
The question papers live in Supabase (public.mcq_papers, login only). Their public METADATA --
title, which exam, mock test or MCQ set, number, how many questions, draft or live -- lives in
public.paper_catalog and is kept in step by a trigger. The hub pages, the test routes and the
sitemap lines are built from that metadata, so adding a paper does not mean hand-editing pages.

The site is a static build, so nothing is fetched from Supabase at page-view time (owner's
decision, 2026-11-12). This script is the one step in between: it writes _data/paperCatalog.json,
which Eleventy reads at build time.

HOW TO USE IT
A cloud session cannot reach Supabase over the network, so the rows come in as a file. Any AI with
the Supabase connector can make that file with:

    select set_id, title, exam_id, kind, number, question_count, status
    from public.paper_catalog
    where status = 'live'
    order by exam_id nulls last, kind, number, set_id;

Save the result as JSON (a list of objects) and run:

    python3 tools/sync_catalog.py --from rows.json

    python3 tools/sync_catalog.py --from rows.json --check    # says what would change, writes nothing

Only LIVE papers are written: a draft must not make a page. The script refuses a file that carries
question text (rule 15: questions never enter the repo).

tools/ is ignored by the build and is not published.
"""

import argparse
import json
import os
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "_data", "paperCatalog.json")

FIELDS = {
    "set_id": "setId",
    "title": "title",
    "exam_id": "examId",
    "kind": "kind",
    "number": "number",
    "question_count": "questionCount",
    "status": "status",
}
FORBIDDEN = {"body", "questions", "options", "explanation", "correct_option_id"}
KINDS = ("mock-test", "mcq-set")


def die(message):
    print("sync_catalog: " + message, file=sys.stderr)
    sys.exit(1)


def read_rows(path):
    with open(path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    # A connector may hand back {"rows": [...]} or the bare list.
    if isinstance(data, dict):
        for key in ("rows", "result", "data"):
            if isinstance(data.get(key), list):
                data = data[key]
                break
    if not isinstance(data, list):
        die("the file must hold a list of catalog rows.")
    return data


def tidy(rows):
    out = []
    for i, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            die("row %d is not a catalog row." % i)
        leaked = FORBIDDEN & set(row)
        if leaked:
            die("row %d carries question data (%s). The catalog holds metadata only; "
                "question text must never enter the repo." % (i, ", ".join(sorted(leaked))))
        missing = [k for k in ("set_id", "title", "kind", "status") if not row.get(k)]
        if missing:
            die("row %d is missing %s." % (i, ", ".join(missing)))
        if row["kind"] not in KINDS:
            die("row %d has kind %r; it must be one of %s." % (i, row["kind"], ", ".join(KINDS)))
        if row["status"] not in ("draft", "live"):
            die("row %d has status %r." % (i, row["status"]))
        if row["status"] != "live":
            continue
        paper = {}
        for src, dest in FIELDS.items():
            value = row.get(src)
            paper[dest] = value if value != "" else None
        if paper["number"] is not None:
            paper["number"] = int(paper["number"])
        paper["questionCount"] = int(paper["questionCount"] or 0)
        out.append(paper)
    out.sort(key=lambda p: (p["examId"] or "~", p["kind"], p["number"] if p["number"] is not None else 0, p["setId"]))
    return out


def load_current():
    try:
        with open(OUT, "r", encoding="utf-8") as handle:
            return json.load(handle).get("papers", [])
    except (IOError, ValueError):
        return []


def main():
    ap = argparse.ArgumentParser(description="Write _data/paperCatalog.json from the live catalog rows.")
    ap.add_argument("--from", dest="source", required=True, help="JSON file of paper_catalog rows")
    ap.add_argument("--check", action="store_true", help="say what would change; write nothing")
    args = ap.parse_args()

    papers = tidy(read_rows(args.source))
    if not papers:
        die("no live papers in that file. Nothing was written.")

    before = load_current()
    was = {p["setId"]: p for p in before}
    now = {p["setId"]: p for p in papers}

    added = [s for s in now if s not in was]
    gone = [s for s in was if s not in now]
    changed = [s for s in now if s in was and now[s] != was[s]]

    print("Live papers in the catalog: %d" % len(papers))
    for exam in sorted({(p["examId"] or "(no exam)") for p in papers}):
        mine = [p for p in papers if (p["examId"] or "(no exam)") == exam]
        print("  %-12s %d paper(s): %s" % (exam, len(mine), ", ".join(p["setId"] for p in mine)))
    for label, ids in (("new", added), ("no longer live", gone), ("changed", changed)):
        if ids:
            print("  %s: %s" % (label, ", ".join(sorted(ids))))
    if not (added or gone or changed):
        print("  nothing changed.")

    if args.check:
        print("--check: nothing was written.")
        sys.exit(1 if (added or gone or changed) else 0)

    with open(OUT, "w", encoding="utf-8") as handle:
        json.dump({"papers": papers}, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
    print("Written: _data/paperCatalog.json")
    print("Now run: npx @11ty/eleventy   (then check the pages and push)")


if __name__ == "__main__":
    main()
