#!/usr/bin/env python3
"""Search the Fish Audio public voice library (for casting).

    .venv/bin/python scripts/voice/fish_search.py "southern teen boy" "deep narrator" ...

Prints id, title, tags, languages and like/task counts of the best matches for each query, so
candidates can be added to fish_cast.py CANDIDATES. Uses FISH_API_KEY from .env (never printed).
"""
from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def load_env() -> None:
    env = ROOT / '.env'
    if env.exists():
        for raw in env.read_text().splitlines():
            raw = raw.strip()
            if raw and not raw.startswith('#') and '=' in raw:
                k, v = raw.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def search(q: str, n: int = 12) -> list[dict]:
    params = urllib.parse.urlencode({'title': q, 'page_size': n, 'page_number': 1, 'sort_by': 'task_count', 'language': 'en'})
    req = urllib.request.Request(f'https://api.fish.audio/model?{params}', headers={'Authorization': f'Bearer {os.environ["FISH_API_KEY"]}'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read()).get('items', [])


def main(queries: list[str]) -> int:
    load_env()
    for q in queries:
        print(f'\n== {q}')
        for m in search(q):
            if m.get('visibility') not in (None, 'public'):
                continue
            tags = ','.join(m.get('tags') or [])[:60]
            print(f"  {m['_id']}  {m.get('title', '')[:44]:<44} tasks={m.get('task_count', 0):>8} likes={m.get('like_count', 0):>6}  [{tags}]")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
