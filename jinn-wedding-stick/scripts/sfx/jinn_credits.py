#!/usr/bin/env python3
"""Write public/audio/sfx/CREDITS.md for "The Jinn Wedding": the sounds built here (build/jinn_sfx_sources.json, from
build_jinn_sfx.py) plus the sounds copied unchanged from the earlier films (credited from that film's CREDITS.md;
the copy is matched by file hash, so the credit is the one of the exact file in this folder).

    python3 scripts/sfx/jinn_credits.py
"""
from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SFX = ROOT / 'public' / 'audio' / 'sfx'
SIBLINGS = ['rake-stick', 'widemouth-stick', 'goatman-stick', 'frame240-stick', 'door306-stick']
ALIAS = {'majlis_tone': 'house_tone', 'car_interior': 'truck_idle'}  # renamed copies
JINN = ['drums_wedding', 'crowd_women', 'hooves_click', 'donkey_bray', 'wrong_laugh', 'wrong_singing', 'coffee_pour']


def md5(p: Path) -> str:
    return hashlib.md5(p.read_bytes()).hexdigest()


def table_rows(credits: Path):
    for line in credits.read_text().splitlines():
        if not line.startswith('| ') or line.startswith('| source') or line.startswith('|---'):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split(' | ')]
        if len(cells) != 5:
            continue
        src, title, who, lic, used = cells
        yield src, title, who, lic, [u.strip() for u in used.split(',')]


def main() -> None:
    rows: dict[str, dict] = {}
    used: dict[str, set] = defaultdict(set)
    # 1. copied sounds
    for wav in sorted(SFX.glob('*.wav')):
        name = wav.stem
        if name in JINN:
            continue
        orig = ALIAS.get(name, name)
        h = md5(wav)
        proj = next((p for p in SIBLINGS if (ROOT.parent / p / 'public/audio/sfx' / f'{orig}.wav').exists() and md5(ROOT.parent / p / 'public/audio/sfx' / f'{orig}.wav') == h), None)
        if proj is None:
            raise SystemExit(f'{name}: no identical file in the earlier films - credit it by hand')
        found = False
        for src, title, who, lic, us in table_rows(ROOT.parent / proj / 'public/audio/sfx/CREDITS.md'):
            if orig in us:
                rows.setdefault(src, {'title': title, 'who': who, 'license': lic})
                used[src].add(name)
                found = True
        if not found:
            print(f'note: {name} ({proj}:{orig}) has no recorded source (synthetic or built from nothing credited)')
    # 2. the sounds built for this film
    srcs = json.loads((HERE / 'sources.json').read_text())
    for k, names in json.loads((ROOT / 'build/jinn_sfx_sources.json').read_text()).items():
        v = srcs[k]
        key = f"FSD50K {v['split']}/{v['freesound_id']}.wav"
        rows.setdefault(key, {'title': v['title'].replace('|', '/'), 'who': f"{v['author']} ([freesound {v['freesound_id']}]({v['url']}))", 'license': v['license']})
        used[key].update(names)

    lines = ['# Sound effect credits', '',
             'Every file in this folder is built from the recordings below (layered, filtered, pitched and convolved with',
             'recorded room impulses) by `scripts/sfx/build_jinn_sfx.py` (the wedding drums, the crowd, the hooves, the',
             'sounds behind the walls, the coffee) and, for the sounds shared with the earlier films, `build_real_sfx.py`.',
             'Licences: CC0-1.0 (no attribution required, listed for provenance) and CC-BY (attribution required - keep this',
             'file with the project and credit these authors in the video description/credits).', '',
             'FSD50K: E. Fonseca, X. Favory, J. Pons, F. Font, X. Serra, "FSD50K: an Open Dataset of Human-Labeled Sound Events",',
             'IEEE/ACM TASLP 2022 - clips are Freesound uploads, each under its own licence (only CC0 and CC-BY clips are used).',
             'VSCO-2 CE orchestral samples (Versilian Studios, uploaded to Freesound by Samulis, CC0).',
             'bank-sfx v1 (CC0 collection: Kenney.nl packs and CC0 Freesound uploads).', '']
    by = sorted((k for k in rows if rows[k]['license'].startswith('CC-BY')), key=lambda k: rows[k]['who'].lower())
    lines += [f'## Attribution required (CC-BY): {len(by)} recordings', '']
    for k in by:
        r = rows[k]
        m = re.match(r'(.*?) \(\[freesound (\d+)\]\((\S+)\)\)', r['who'])
        author, url = (m.group(1), m.group(3)) if m else (r['who'], '')
        ver = r['license'].split('-')[-1]
        lines.append(f"- \"{r['title']}\" by {author} - {url} - CC BY {ver} (https://creativecommons.org/licenses/by/{ver}/) - used in: {', '.join(sorted(used[k]))}")
    lines += ['', '## All sources', '', '| source | title | author / origin | licence | used in |', '|---|---|---|---|---|']
    for k in sorted(rows):
        r = rows[k]
        lines.append(f"| {k} | {r['title']} | {r['who']} | {r['license']} | {', '.join(sorted(used[k]))} |")
    lines.append('')
    (SFX / 'CREDITS.md').write_text('\n'.join(lines))
    print(f'wrote {SFX / "CREDITS.md"}: {len(rows)} sources, {len(by)} CC-BY')


if __name__ == '__main__':
    main()
