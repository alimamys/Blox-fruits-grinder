"""Group logs/qa.txt into runs: scene, name, issue kind, scene-frame ranges (with seconds)."""
import re, sys
from collections import defaultdict
rows = defaultdict(list)
for l in open('logs/qa.txt'):
    m = re.match(r'(\S+) f=(\d+) (\w+): (.*)', l.strip())
    if not m: continue
    sc, f, name, issue = m.groups()
    kind = re.sub(r'\s*\(\d+%\)|\(\d+ px\)', '', issue)
    rows[(sc, name, kind)].append(int(f))
out = []
for (sc, name, kind), fr in rows.items():
    fr.sort(); runs = []; a = b = fr[0]
    for x in fr[1:]:
        if x - b <= 6: b = x
        else: runs.append((a, b)); a = b = x
    runs.append((a, b))
    for a, b in runs: out.append((sc, a, b, name, kind))
for sc, a, b, name, kind in sorted(out, key=lambda r: (r[0], r[1])):
    print(f'{sc:11s} {a/24:6.1f}-{b/24:6.1f}s  {name:8s} {kind}')
