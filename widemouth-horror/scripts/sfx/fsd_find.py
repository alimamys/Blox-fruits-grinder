#!/usr/bin/env python3
"""Find FSD50K clips for a sound (CC0 / CC-BY only), from the local metadata cache.

    .venv/bin/python scripts/sfx/fsd_find.py "Cricket|Insect" "night|crickets" [--n 12]

First argument: FSD50K labels (regex, matched against the clip's label list). Second: words that
must appear in the title or tags (regex). Prints id, split, licence, uploader and title, CC0 first.
Add a chosen clip to scripts/sfx/sources.json as "fsd:<id>" before using it in a builder.
"""
import argparse
import csv
import json
import os
import re
from pathlib import Path

META = Path(os.environ.get('P63_SFX_CACHE', Path.home() / '.cache' / 'p63-sfx')) / 'meta'


def load():
    rows = {}
    for split in ('dev', 'eval'):
        info = json.loads((META / f'{split}_clips_info_FSD50K.json').read_text())
        with open(META / f'{split}.csv') as fh:
            for r in csv.DictReader(fh):
                i = info.get(r['fname'])
                if not i:
                    continue
                rows[r['fname']] = {'split': 'dev' if split == 'dev' else 'eval', 'labels': r['labels'], **i}
    return rows


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('labels')
    ap.add_argument('words', nargs='?', default='.')
    ap.add_argument('--n', type=int, default=12)
    ap.add_argument('--exclude', default='')
    a = ap.parse_args()
    lab = re.compile(a.labels, re.I)
    words = re.compile(a.words, re.I)
    excl = re.compile(a.exclude, re.I) if a.exclude else None
    hits = []
    for fid, r in load().items():
        lic = r.get('license', '')
        if 'publicdomain/zero' not in lic and '/licenses/by/' not in lic:
            continue
        text = r.get('title', '') + ' ' + ' '.join(r.get('tags', []))
        if not lab.search(r['labels']) or not words.search(text) or (excl and excl.search(text)):
            continue
        hits.append((0 if 'zero' in lic else 1, fid, r))
    hits.sort(key=lambda h: (h[0], h[1]))
    for cc, fid, r in hits[: a.n]:
        print(f"  fsd:{fid:<7} {r['split']:<4} {'CC0' if cc == 0 else 'BY '} {r.get('uploader', '')[:16]:<16} {r.get('title', '')[:70]}")
    print(f'  ({len(hits)} matches)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
