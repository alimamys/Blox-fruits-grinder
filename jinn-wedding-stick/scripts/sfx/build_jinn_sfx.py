#!/usr/bin/env python3
"""Sounds for "The Jinn Wedding", built from REAL recordings (FSD50K CC0 / CC-BY clips), with the machinery of
build_real_sfx.py (normalising, seamless bed loops, credits):

  drums_wedding  - a Gulf wedding rhythm: tabla strokes for the tabl, tambourine for the riq, many women clapping
  crowd_women    - a big hall of women talking, before the music
  hooves_click   - small hooves clicking on marble, in time with the drums
  donkey_bray    - something braying behind the walls (goat + horse, slowed and muffled)
  wrong_laugh    - laughing that is not laughing (slowed, partly reversed, far away)
  wrong_singing  - voices singing along in a language nobody knows (a sung line reversed, layered, far away)
  coffee_pour    - Arabic coffee poured from the dallah into a small cup

    .venv/bin/python scripts/sfx/build_jinn_sfx.py            # build all of them
    .venv/bin/python scripts/sfx/build_jinn_sfx.py drums_wedding
"""
from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import build_real_sfx as B  # noqa: E402
import sfxlib as L  # noqa: E402
from sfxlib import (SR, fade, hits, hp, lp, mix, norm, pan, place, reverb, reverse, secs, semis, src, st, vari, zeros)  # noqa: E402

META = L.CACHE / 'meta'

# FSD50K clips used here (all CC0 or CC-BY); registered in sources.json on first run
FSD_IDS = [
    130404, 130406, 130408, 130414, 130416, 130419, 130420, 130418, 130422, 130426, 130430,  # tabla strokes (CC0)
    99860, 276315,  # tambourine hits (CC0)
    411059, 417594, 424768, 432910, 262660, 180753,  # single hand claps (CC0)
    260122, 424866,  # indoor crowd murmur (CC0)
    345656,  # horse walk with shoes (CC0)
    385913, 347036,  # goat bleat, horse whinny (CC0)
    433960, 399089,  # laughter (CC0)
    419326,  # sung female line (CC-BY)
    432775,  # pouring coffee (CC0)
]


def register_sources() -> None:
    """Add the FSD50K clips above to sources.json (title, author, licence) from the dataset metadata."""
    srcs = json.loads((HERE / 'sources.json').read_text())
    need = [i for i in FSD_IDS if f'fsd:{i}' not in srcs]
    if not need:
        return
    info = {}
    for split in ('dev', 'eval'):
        d = json.loads((META / f'{split}_clips_info_FSD50K.json').read_text())
        for k, v in d.items():
            v['split'] = split
            info[int(k)] = v
    for i in need:
        v = info[i]
        lic = v['license']
        if 'publicdomain/zero' in lic:
            name = 'CC0-1.0'
        elif '/by/' in lic:
            ver = lic.rstrip('/').split('/')[-1]
            name = f'CC-BY-{ver}'
        else:
            raise SystemExit(f'{i}: licence not allowed: {lic}')
        srcs[f'fsd:{i}'] = {
            'author': v.get('uploader', ''),
            'dataset': 'FSD50K (Fonseca et al. 2022), file mirror huggingface.co/datasets/Fhrozen/FSD50k',
            'freesound_id': i,
            'license': name,
            'split': v['split'],
            'title': v.get('title', ''),
            'url': f'https://freesound.org/s/{i}/',
        }
    (HERE / 'sources.json').write_text(json.dumps(srcs, indent=1, sort_keys=True))
    L.SOURCES.update(srcs)


register_sources()

sfx = B.sfx
RNG = np.random.default_rng(1997)


def first_hit(key: str, max_len=1.2, thr=-34.0) -> np.ndarray:
    hs = hits(src(key), thr_db=thr, max_len=max_len)
    return hs[0] if hs else src(key, 0, max_len)


def strokes(keys, max_len=1.0) -> list:
    return [fade(first_hit(f'fsd:{k}', max_len), 0.0, 0.05) for k in keys]


# ----------------------------------------------------------------------------- the wedding drums
BPM = 100.0
E8 = 60.0 / BPM / 2  # one eighth note


def _drum_pattern(total: float, unison: float = 0.0) -> np.ndarray:
    """A Gulf wedding groove (two bars of 8 eighths): deep tabl strokes, open 'tak's, riq jingles on the offbeats and
    the women's clapping on the syncopated beats. unison 0..1: how perfectly the clappers are together."""
    dum = strokes([130404, 130406, 130408, 130414])
    tak = strokes([130416, 130419, 130420, 130422])
    tek = strokes([130418, 130426, 130430])
    riq = strokes([99860, 276315], 0.6)
    claps = strokes([411059, 417594, 424768, 432910, 262660, 180753], 0.5)
    # bar A: D . . D T . T t | bar B: D . . D T T . t
    bars = [
        [(0, 'D', 1.0), (3, 'D', 0.8), (4, 'T', 0.8), (6, 'T', 0.7), (7, 't', 0.45)],
        [(0, 'D', 1.0), (3, 'D', 0.85), (4, 'T', 0.8), (5, 'T', 0.6), (7, 't', 0.45)],
    ]
    clap_at = [2, 6]  # syncopated claps every bar
    n = secs(total)
    out = np.zeros((n, 2))
    t = 0.0
    bar = 0
    while t < total:
        for pos, kind, g in bars[bar % 2]:
            at = t + pos * E8 + RNG.normal(0, 0.004)
            pool = {'D': dum, 'T': tak, 't': tek}[kind]
            hit = pool[RNG.integers(len(pool))] * g * (1 + RNG.normal(0, 0.06))
            place(out, pan(hit, RNG.uniform(-0.1, 0.1)), at)
        for e in range(8):  # riq on every eighth, accents on the beat
            r = riq[RNG.integers(len(riq))] * (0.32 if e % 2 else 0.18) * (1 + RNG.normal(0, 0.1))
            place(out, pan(r, 0.25), t + e * E8 + RNG.normal(0, 0.003))
        for c in clap_at:  # a crowd of women clapping: many hands, tighter as unison -> 1
            for _k in range(14):
                cl = claps[RNG.integers(len(claps))] * RNG.uniform(0.35, 0.7)
                jit = RNG.normal(0, 0.012 * (1 - unison) + 0.0008)
                place(out, pan(cl, RNG.uniform(-0.8, 0.8)), t + c * E8 + jit)
        t += 8 * E8
        bar += 1
    out = reverb(out, 'hall', wet=0.28)
    return out


@sfx('drums_wedding', 'bed', -20.0, None, 'a Gulf wedding groove: tabl, riq and a hall full of women clapping')
def drums_wedding():
    bar = 8 * E8
    total = bar * 12  # 12 bars ~ 23 s, an exact number of bars so the loop is seamless
    return _drum_pattern(total + 3.0)[secs(1.5): secs(1.5) + secs(total)]


# ----------------------------------------------------------------------------- the hall of women
@sfx('crowd_women', 'bed', -30.0, None, 'a big hall of women talking before the music')
def crowd_women():
    a = src('fsd:260122')
    b = src('fsd:424866')
    a = vari(a, semis(1.5))  # a touch brighter: a hall of women
    b = vari(b, semis(1.0))
    T = 16.0
    la = L.loop(a, T, 2.0) if len(a) > secs(T + 2.2) else L.loop(np.concatenate([a, a]), T, 2.0)
    lb = L.loop(b, T, 2.0) if len(b) > secs(T + 2.2) else L.loop(np.concatenate([b, b]), T, 2.0)
    x = mix((la, 0.0, 1.0), (lb, 0.0, 0.7), length=T)
    x = lp(hp(x, 180), 6000)
    return reverb(x, 'hall', wet=0.3)


# ----------------------------------------------------------------------------- hooves on the marble
@sfx('hooves_click', 'oneshot', -3.0, 4.2, 'small hooves clicking on marble, in time with the drums')
def hooves_click():
    hs = hits(src('fsd:345656'), thr_db=-32, max_len=0.25)
    hs = [hp(h, 300) for h in hs[:24]] or [src('fsd:345656', 0, 0.2)]
    out = zeros(4.2)
    t = 0.05
    k = 0
    while t < 4.0:
        dens = 1 + int(t * 1.6)  # more and more hooves join in
        for _j in range(dens):
            h = hs[RNG.integers(len(hs))]
            h = vari(h, semis(RNG.uniform(3.0, 7.0)))  # small, sharp hooves
            place(out, pan(h * RNG.uniform(0.4, 0.9), RNG.uniform(-0.9, 0.9)), t + RNG.normal(0, 0.01))
        t += E8
        k += 1
    out = reverb(out, 'hall', wet=0.35)
    return fade(out, 0.0, 0.4)


# ----------------------------------------------------------------------------- behind the walls
def _behind_wall(x, cut=1400, wet=0.5):
    return reverb(lp(hp(x, 90), cut), 'hall', wet=wet, tail=1.0)


@sfx('donkey_bray', 'oneshot', -6.0, 3.6, 'something braying behind the walls')
def donkey_bray():
    goat = vari(src('fsd:385913'), semis(-6))
    horse = vari(src('fsd:347036'), semis(-4))
    x = mix((goat[: secs(2.6)], 0.0, 1.0), (horse[: secs(2.6)], 0.1, 0.7), length=2.6)
    return fade(_behind_wall(x), 0.05, 0.6)


@sfx('wrong_laugh', 'oneshot', -6.0, 4.0, 'laughing that is not laughing')
def wrong_laugh():
    a = vari(src('fsd:433960'), semis(-5))
    b = reverse(vari(src('fsd:399089'), semis(-7)))
    x = mix((a[: secs(3.0)], 0.0, 1.0), (b[: secs(3.0)], 0.2, 0.8), length=3.0)
    return fade(_behind_wall(x, 2200, 0.55), 0.1, 0.8)


@sfx('wrong_singing', 'oneshot', -6.0, 5.5, 'voices singing along in a language nobody knows')
def wrong_singing():
    s = reverse(src('fsd:419326'))
    s = s[: secs(4.5)]
    x = zeros(5.0)
    for n, (st_, d, g, p) in enumerate([(0.0, 0.0, 1.0, -0.3), (-3.0, 0.045, 0.8, 0.35), (4.0, 0.09, 0.6, 0.0)]):
        place(x, pan(vari(s, semis(st_)) * g, p), d)
    return fade(_behind_wall(x, 3200, 0.6), 0.3, 1.0)


# ----------------------------------------------------------------------------- the majlis
@sfx('coffee_pour', 'oneshot', -8.0, 2.0, 'Arabic coffee poured from the dallah into a small cup')
def coffee_pour():
    x = src('fsd:432775')
    on = L.onsets(x, thr_db=-40)
    t0 = on[0] / SR if on else 0.0
    x = x[secs(t0): secs(t0 + 1.9)]
    return fade(reverb(x, 'bedroom', wet=0.12), 0.02, 0.4)


JINN = ['drums_wedding', 'crowd_women', 'hooves_click', 'donkey_bray', 'wrong_laugh', 'wrong_singing', 'coffee_pour']

if __name__ == '__main__':
    names = sys.argv[1:] or JINN
    out = B.OUT_DEFAULT
    print(f'building {len(names)} sounds -> {out}')
    B.build(names, out)
    used = L.credits_used()
    (HERE.parent.parent / 'build').mkdir(exist_ok=True)
    (HERE.parent.parent / 'build' / 'jinn_sfx_sources.json').write_text(json.dumps({k: sorted(v) for k, v in used.items()}, indent=1))
    print('sources used -> build/jinn_sfx_sources.json')
