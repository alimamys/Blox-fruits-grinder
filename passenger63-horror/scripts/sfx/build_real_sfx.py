#!/usr/bin/env python3
"""Sound design for "The 63rd Passenger" built from REAL recordings.

Every file in public/audio/sfx is rebuilt from CC0 / CC-BY field recordings and
orchestral samples (FSD50K CC0+CC-BY subset, VSCO-2 CE orchestra samples via FSD50K,
bank-sfx CC0 one-shots), layered, EQ'd, pitched and placed in real recorded spaces
(convolution with clap impulse responses). A few device sounds (UI beeps, radio
squelch, mains hum) are partly synthetic by nature; see CREDITS.md.

Usage:
  .venv/bin/python scripts/sfx/build_real_sfx.py                 # build everything
  .venv/bin/python scripts/sfx/build_real_sfx.py impact_hull wind  # just these
  options: --out DIR (default public/audio/sfx), --list

Sources are downloaded once into $P63_SFX_CACHE (default ~/.cache/p63-sfx):
FSD50K clips individually from huggingface.co/datasets/Fhrozen/FSD50k and the
196 MB bank-sfx zip from huggingface.co/datasets/Jacob121294/bank-sfx.
Output: 48 kHz / 16-bit / stereo WAV + public/audio/sfx/CREDITS.md.
"""
from __future__ import annotations

import argparse
import math
import sys
import time
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import sfxlib as L  # noqa: E402
from sfxlib import (SR, balance, bp, chain, db, decay_env, decorrelate, env, fade, fit, hits, hp, hshelf,  # noqa: E402
                    limit, loop, lp, lshelf, mix, mono, norm, onsets, pan, peq, place, reverb, reverse, sat,
                    secs, semis, seg, src, st, stretch, vari, vari_curve, width, zeros)

ROOT = HERE.parent.parent
OUT_DEFAULT = ROOT / 'public' / 'audio' / 'sfx'

REGISTRY: dict = {}


def sfx(name: str, kind: str, level: float, length: float | None = None, note: str = ''):
    """Register a builder. kind: 'oneshot' (level = peak dBFS) or 'bed' (level = LUFS, seamless loop)."""

    def deco(fn):
        REGISTRY[name] = dict(fn=fn, kind=kind, level=level, length=length, note=note)
        return fn

    return deco


RNG = np.random.default_rng(6363)


def rng(seed: int) -> np.random.Generator:
    return np.random.default_rng(seed)


def first_onset(x, thr_db=-40.0) -> float:
    on = onsets(x, thr_db, 0.05, 6.0)
    return on[0] / SR if on else 0.0


def from_onset(x, thr_db=-40.0, pre=0.005, dur: float | None = None):
    t = max(0.0, first_onset(x, thr_db) - pre)
    return seg(x, t, None if dur is None else t + dur)


def loudest(x, dur: float) -> np.ndarray:
    """The loudest `dur`-second window of x."""
    m = mono(x) ** 2
    n = secs(dur)
    if len(m) <= n:
        return st(x).copy()
    c = np.concatenate([[0], np.cumsum(m)])
    e = c[n:] - c[:-n]
    i = int(np.argmax(e))
    return st(x)[i:i + n].copy()


def shuffle_bed(x, total: float, seg_len=(6.0, 11.0), xfade=1.8, seed=1) -> np.ndarray:
    """Extend a stationary recording to `total` seconds by chaining random segments of it
    with long equal-power crossfades (sample-library style round robin)."""
    r = rng(seed)
    x = st(x)
    dur = len(x) / SR
    parts = []
    acc = 0.0
    last = -1.0
    while acc < total + xfade:
        ln = float(r.uniform(*seg_len))
        ln = min(ln, dur - 0.2)
        for _ in range(8):
            t0 = float(r.uniform(0, max(0.01, dur - ln)))
            if abs(t0 - last) > ln * 0.5:
                break
        last = t0
        parts.append(seg(x, t0, t0 + ln))
        acc += ln - xfade
    return chain(parts, xfade)[: secs(total)]


def fold_loop(x, length: float) -> np.ndarray:
    """Musical loop: render longer than `length`, then add the overflow (reverb tails,
    ringing notes) back onto the start. The result repeats seamlessly."""
    x = st(x)
    n = secs(length)
    y = x[:n].copy()
    rest = x[n:]
    while len(rest):
        k = min(len(rest), n)
        y[:k] += rest[:k]
        rest = rest[k:]
    return y


def one_hit(key, dur=None, thr=-45.0):
    """A whole short clip from its first transient (faded)."""
    x = from_onset(src(key), thr, 0.003, dur)
    return fade(x, 0.002, min(0.03, len(x) / SR / 4))


def thru_hull(x, bright=4500):
    """Sound heard through steel plate from the other side: lows + mids pass, highs damped."""
    y = lp(x, bright, 2)
    y = peq(y, 700, 3, 0.8)
    return y


# ============================================================================
# IMPACTS / KNOCKS / SCRAPES (the hull)
# ============================================================================
def _rattle(seed: int, dur=2.6, gain=1.0):
    """Loose fittings rattling after a hit: real radiator / cutlery 'earthquake' recordings."""
    r = rng(seed)
    a = src('bank:1745')
    on = onsets(a, -40, 0.4, 9)
    t0 = on[int(r.integers(0, max(1, len(on))))] / SR if on else 0.0
    ra = hp(seg(a, t0, t0 + dur), 250)
    b = src('fsd:51105')
    t1 = float(r.uniform(0, 5))
    rb = hp(seg(b, t1, t1 + dur), 600)
    y = fit(ra, dur) * 0.9 + fit(rb, dur) * 0.35
    y = decay_env(fade(y, 0.01, 0.6), 0.15, dur * 1.1)
    return width(y, 1.3) * gain


def _hull_hit(seed: int, body_key: str, body_ratio: float, pan_to: float = 0.0, groan_at=1.7, length=4.3):
    r = rng(seed)
    n = length
    # 1) the metal body of the hit, pitched down so it reads as a huge steel structure
    if body_key == 'door':
        body = from_onset(src('fsd:406197'), -35, 0.003, 2.6)
    elif body_key == 'doors2':
        hs = hits(src('fsd:369924'), -40, 0.5, 10, 1.9)
        body = hs[1] if len(hs) > 1 else hs[0]
    else:  # thumps
        hs = hits(src('fsd:400866'), -40, 0.3, 10, 1.6)
        body = hs[int(r.integers(0, len(hs)))]
    body = vari(body, body_ratio)
    # 2) a second, brighter metal crash on top (clang + ring)
    clang = from_onset(src('fsd:209772'), -35, 0.002, 1.5)
    clang = vari(mono(clang), float(r.uniform(0.74, 0.86)))
    clang = fade(clang, 0, 0.5)
    # 3) a deep explosion-like boom for weight (low passed)
    boom = from_onset(src('fsd:147583'), -40, 0.0, 3.2)
    boom = lp(vari(boom, float(r.uniform(0.78, 0.9))), 220, 4)
    # 4) a low tonal metal hit
    deep = from_onset(src('bank:1304'), -40, 0.0, 3.5)
    deep = vari(deep, float(r.uniform(0.85, 0.95)))
    # 5) hull ring: a gong an octave down, quiet, long
    ring = from_onset(src('fsd:375533'), -40, 0.0, 6.0)
    ring = hp(vari(ring, 0.5), 70)
    # 6) loose fittings rattling
    rat = _rattle(seed + 11, 2.8)
    # 7) the structure groans afterwards
    g = src('fsd:73257')
    gt = float(r.uniform(2, 15))
    groan = vari(loudest(seg(g, gt, gt + 4), 2.2), 0.82)
    groan = fade(groan, 0.4, 0.9)
    x = mix(
        (st(body), 0.0, 1.0),
        (st(clang), 0.006, 0.55),
        (st(boom), 0.0, 1.0),
        (st(deep), 0.004, 0.55),
        (st(ring), 0.01, 0.20),
        (rat, 0.035, 0.50),
        (st(groan), groan_at, 0.30),
        length=n + 1.5,
    )
    x = sat(x * 1.6, 1.4)
    x = reverb(x, 'hull', wet=0.42, pre_ms=12, lo_cut=60)
    x = peq(x, 180, 2.5, 0.9)
    x = peq(x, 1200, 2.0, 0.9)
    x = lshelf(x, 70, 2.0)
    if pan_to:
        x = balance(width(x, 0.7), pan_to)
    return fade(fit(x, n), 0.004, 0.9)


@sfx('impact_hull', 'oneshot', -1.0, 4.3, 'something huge hits the steel hull from below')
def impact_hull():
    return _hull_hit(101, 'door', 0.62)


@sfx('impact_hull_l', 'oneshot', -1.0, 4.3, 'hull impact, left')
def impact_hull_l():
    return _hull_hit(202, 'doors2', 0.66, -0.62, groan_at=1.5)


@sfx('impact_hull_r', 'oneshot', -1.0, 4.3, 'hull impact, right')
def impact_hull_r():
    return _hull_hit(303, 'thumps', 0.72, 0.62, groan_at=1.9)


def _knock_pool():
    """Individual knocks/bangs on metal doors, pipes and plates (all real recordings)."""
    pool = []
    for key, thr, gap in [('fsd:254981', -45, 0.15), ('fsd:187284', -45, 0.12), ('fsd:402612', -42, 0.12),
                          ('fsd:211497', -40, 0.12), ('fsd:211498', -40, 0.12), ('fsd:211502', -40, 0.12),
                          ('fsd:211503', -40, 0.12), ('fsd:400866', -40, 0.3), ('fsd:104364', -40, 0.2),
                          ('bank:1886', -40, 0.2), ('bank:1882', -40, 0.2), ('bank:1885', -40, 0.2), ('bank:1270', -40, 0.2),
                          ('fsd:164219', -45, 0.2), ('fsd:164220', -45, 0.2)]:
        for h in hits(src(key), thr, gap, 10, 1.2):
            if np.max(np.abs(h)) > 0.02 and len(h) > secs(0.05):
                pool.append((key, norm(h, -3)))
    return pool


@sfx('knocking_hull', 'oneshot', -1.5, 10.6, 'knocks on the hull from below, irregular, getting denser')
def knocking_hull():
    r = rng(4242)
    pool = _knock_pool()
    n = 10.6
    buf = zeros(n + 2)
    # timing: sparse at first (the first 1.3 s is used alone as a teaser), then denser
    times = [0.0, 0.62, 0.86]
    t = 1.75
    while t < n - 0.25:
        prog = t / n
        gap = float(r.uniform(0.55, 1.0) * (1 - prog) ** 1.6 + r.uniform(0.07, 0.16))
        cluster = r.random() < 0.25 + 0.4 * prog
        times.append(t)
        if cluster:
            for _ in range(int(r.integers(1, 3))):
                t += float(r.uniform(0.11, 0.2))
                times.append(t)
        t += gap
    for i, t in enumerate(times):
        key, h = pool[int(r.integers(0, len(pool)))]
        prog = t / n
        ratio = float(r.uniform(0.62, 0.9))
        k = vari(h, ratio)
        body = lp(k, 240, 2) * 1.6
        k = thru_hull(k + body, bright=float(r.uniform(3500, 6000)))
        g = db(-9 + 9 * prog + float(r.uniform(-2.5, 2.0)))
        if i < 3:
            g = db(-5 + i * 0.5)
        p = float(np.clip(r.normal(0, 0.55), -0.95, 0.95))
        place(buf, pan(k, p), t, g)
    # a few heavier bangs as it builds
    for t, p, gg in [(6.7, -0.5, -6), (8.35, 0.55, -4), (9.75, -0.15, -2.5)]:
        hs = hits(src('fsd:369924'), -40, 0.5, 10, 1.9)
        b = vari(hs[int(r.integers(0, len(hs)))], float(r.uniform(0.6, 0.7)))
        place(buf, pan(thru_hull(b), p), t, db(gg))
    x = reverb(buf, 'hull', wet=0.32, pre_ms=8, lo_cut=70)
    x = reverb(x, 'steel', wet=0.12)
    x = sat(x * 1.3, 1.2)
    return fade(fit(x, n), 0.003, 0.35)


@sfx('scratch_hull', 'oneshot', -2.0, 3.45, 'clawing / scraping along the steel hull')
def scratch_hull():
    r = rng(77)
    n = 3.45
    buf = zeros(n + 2)
    a = src('fsd:392055')
    b = src('bank:1831')
    c = src('fsd:391752')
    strokes = [(0.0, 0.9, -0.6), (0.82, 0.75, 0.1), (1.5, 1.05, 0.55), (2.45, 0.8, -0.2)]
    for i, (t, d, p) in enumerate(strokes):
        srcs = [a, b, c]
        s = srcs[i % 3]
        t0 = float(r.uniform(0, len(s) / SR - d - 0.1))
        k = loudest(seg(s, t0, t0 + d * 3), d)
        k = norm(k, -3)
        k = vari(k, float(r.uniform(0.6, 0.75)))[: secs(d)]
        k = env(k, [(0, 0.0), (d * 0.18, 1.0), (d * 0.65, 0.85), (d, 0.0)])
        k = thru_hull(k, 3800)
        place(buf, pan(k, p), t)
    # metallic hull resonance under the strokes: real gong scrapes, an octave+ down
    for key, t, ratio, g in [('fsd:375550', 0.0, 0.5, 0.7), ('fsd:375551', 1.4, 0.42, 0.6)]:
        gs = norm(src(key), -3)
        gs = hp(vari(gs, ratio), 90)
        place(buf, width(st(gs), 1.2), t, g)
    x = reverb(buf, 'hull', wet=0.35, pre_ms=6)
    x = peq(x, 450, 3, 0.8)
    return fade(fit(x, n), 0.01, 0.5)


# ============================================================================
# AMBIENCE BEDS (seamless loops)
# ============================================================================
def _sb(key, total, seed, seg_len=(6.0, 11.0), xfade=1.8, t0=0.0, t1=None):
    return shuffle_bed(seg(src(key), t0, t1), total, seg_len, xfade, seed)


def _stereo_pair(a, b, w=1.0):
    """Two different (mono) recordings as left/right: a natural, wide, uncorrelated stereo bed."""
    return width(np.stack([mono(a), mono(b)], axis=1), w)


@sfx('ocean_ambience', 'bed', -27.0, 60.0, 'night sea, waves, water slapping the hull')
def ocean_ambience():
    T, XF = 60.0, 4.0
    n = T + XF
    wash = _stereo_pair(_sb('fsd:400660', n, 1), _sb('fsd:364694', n, 2), 0.9)
    wash = lp(hp(wash, 40), 9000)
    lap = _stereo_pair(_sb('fsd:388970', n, 3, (5, 9)), _sb('fsd:58504', n, 4, (5, 9)), 0.8)
    lap = peq(bp(lap, 120, 7000), 420, 3, 0.9)  # hollow slap of water on a steel hull
    lap = reverb(lap, 'cabin', wet=0.12)
    swell = lp(vari(_sb('fsd:400660', n * 0.65 + 1, 5), 0.62), 500, 2)
    swell = decorrelate(swell, 14)
    far = _stereo_pair(_sb('fsd:392663', n, 6), _sb('fsd:392663', n, 7))
    far = hp(far, 60)
    x = mix((wash, 0, 1.0), (lap, 0, 0.75), (swell, 0, 0.55), (norm(far, -12), 0, 0.5), length=n)
    return loop(x, T, XF)


@sfx('ferry_engine', 'bed', -26.0, 60.0, 'diesel ferry engine through the steel structure')
def ferry_engine():
    T, XF = 60.0, 4.0
    n = T + XF
    low = _sb('fsd:91533', n, 11, (4, 8), 1.5)
    low = lp(low, 320, 4)
    mid = _sb('fsd:109578', n, 12, (6, 10))
    mid = bp(mid, 70, 3500)
    pulse = _sb('fsd:55053', n, 13, (1.2, 2.2), 0.4)
    pulse = lp(pulse, 2200)
    rattle = _sb('fsd:398675', n, 14, (3, 6), 1.0)
    rattle = hp(rattle, 280)
    ferry = _sb('fsd:55025', n, 15, (1.5, 3.2), 0.6)
    x = mix((decorrelate(norm(low, -6), 9), 0, 0.42), (_stereo_pair(norm(mid, -6), norm(_sb('fsd:109578', n, 16, (6, 10)), -6)), 0, 1.0),
            (decorrelate(norm(pulse, -6), 13, seed=3), 0, 0.42), (decorrelate(norm(rattle, -6), 7, seed=4), 0, 0.30),
            (decorrelate(norm(ferry, -6), 17, seed=5), 0, 0.38), length=n)
    x = reverb(x, 'steel', wet=0.22, lo_cut=60)
    x = lp(x, 5200, 2)
    x = peq(x, 110, 2.0, 0.8)
    x = peq(x, 850, 1.5, 0.9)
    return loop(x, T, XF)


@sfx('wind', 'bed', -22.0, 30.0, 'gusty sea wind with howl (also used as a one-shot)')
def wind():
    T, XF = 30.0, 3.0
    n = T + XF
    base = _sb('fsd:78430', n, 21, (6, 10))
    base = hp(base, 90)
    howl = _sb('bank:1716', n, 22, (2.5, 4.5), 1.2)
    howl2 = _sb('bank:1715', n, 23, (2.0, 3.5), 1.0)
    gust = hp(_sb('fsd:182912', n, 24, (5, 9)), 110)
    rumble = lp(hp(_sb('fsd:256862', n, 25, (6, 10)), 45), 400)
    # slow gust envelope
    t = np.arange(secs(n)) / SR
    g = 0.75 + 0.25 * np.sin(2 * np.pi * t / 7.3) * np.sin(2 * np.pi * t / 11.9 + 1)
    x = mix((_stereo_pair(base, gust), 0, 1.0), (_stereo_pair(howl, howl2, 0.8), 0, 0.45), (decorrelate(rumble, 11), 0, 0.4), length=n)
    x = x * g[:, None]
    return loop(x, T, XF)


@sfx('crowd_murmur', 'bed', -30.0, 46.0, 'hushed indoor passenger murmur in a steel lounge')
def crowd_murmur():
    T, XF = 46.0, 3.0
    n = T + XF
    a = _sb('fsd:260123', n, 31, (5, 9), 1.6)
    b = _sb('fsd:174229', n, 32, (5, 9), 1.6)
    a2 = _sb('fsd:260123', n, 33, (5, 9), 1.6)
    b2 = _sb('fsd:174229', n, 34, (5, 9), 1.6)
    x = mix((_stereo_pair(norm(a, -6), norm(b2, -6)), 0, 1.0), (_stereo_pair(norm(b, -6), norm(a2, -6)), 0, 0.6), length=n)
    x = hp(lp(x, 6500), 140)
    x = reverb(x, 'steel', wet=0.3)
    return loop(x, T, XF)


@sfx('daylight_ambience', 'bed', -30.0, 40.0, 'busy daytime harbour / deck: gulls, water, distant people')
def daylight_ambience():
    T, XF = 40.0, 3.0
    n = T + XF
    marina = hp(_sb('fsd:275617', n, 41, (6, 10)), 80)
    gulls = hp(_sb('fsd:331685', n, 42, (6, 10)), 180)
    gulls2 = hp(_sb('fsd:174885', n, 43, (6, 10)), 180)
    gulls3 = hp(_sb('fsd:192766', n, 44, (6, 10)), 200)
    water = _sb('fsd:364694', n, 45, (6, 10))
    people = hp(lp(_sb('fsd:174229', n, 46, (5, 8)), 4000), 200)
    x = mix((_stereo_pair(norm(marina, -10), norm(water, -14)), 0, 1.0),
            (_stereo_pair(norm(gulls, -12), norm(gulls2, -12)), 0, 0.8),
            (pan(norm(gulls3, -12), 0.4), 0, 0.5),
            (decorrelate(norm(people, -14), 15), 0, 0.35), length=n)
    return loop(x, T, XF)


@sfx('room_tone', 'bed', -34.0, 30.0, 'small steel cabin: ventilation, faint engine through the floor')
def room_tone():
    T, XF = 30.0, 3.0
    n = T + XF
    vent = _sb('fsd:362431', n, 51)
    ac = _sb('fsd:431817', n, 52)
    eng = lp(_sb('fsd:91533', n, 53, (4, 8), 1.5), 180, 4)
    x = mix((_stereo_pair(norm(vent, -12), norm(ac, -14)), 0, 1.0), (decorrelate(norm(eng, -12), 9), 0, 0.18), length=n)
    x = reverb(lp(x, 6000), 'cabin', wet=0.25)
    return loop(x, T, XF)


def _mains_hum(n_sec, f0=100.0, seed=0, buzz=0.6):
    """Ballast / transformer hum: harmonic series of 100 Hz with slight jitter (synthetic by nature)."""
    r = rng(seed)
    t = np.arange(secs(n_sec)) / SR
    y = np.zeros_like(t)
    drift = 1 + 0.0008 * np.sin(2 * np.pi * 0.07 * t + r.uniform(0, 6))
    for k in range(1, 40):
        a = (1 / k ** 1.1) * (buzz if k % 2 == 0 else 1.0) * (1.0 + 0.2 * r.standard_normal())
        y += a * np.sin(2 * np.pi * f0 * k * drift * t + r.uniform(0, 6))
    y = y / np.max(np.abs(y))
    return st(y)


@sfx('emergency_hum', 'bed', -27.0, 30.0, 'emergency lighting: ballast hum, dead ventilation, hull creaks')
def emergency_hum():
    T, XF = 30.0, 3.0
    n = T + XF
    hum = _mains_hum(n, 100.0, 1)
    hum = reverb(bp(hum, 90, 3000), 'cabin', wet=0.35)
    fridge = _sb('fsd:413566', n, 61)
    fan = lp(_sb('fsd:398820', n, 62), 400)
    groan = zeros(n)
    g = src('fsd:73257')
    r = rng(63)
    for t in (5.0, 17.5, 26.0):
        t0 = float(r.uniform(1, 16))
        place(groan, pan(fade(vari(loudest(seg(g, t0, t0 + 4), 2.5), 0.7), 0.5, 1.0), float(r.uniform(-0.7, 0.7))), t)
    x = mix((hum, 0, 0.22), (decorrelate(norm(fridge, -10), 8), 0, 1.0), (decorrelate(norm(fan, -12), 13), 0, 0.35),
            (reverb(groan, 'hull', wet=0.5), 0, 0.25), length=n)
    return loop(x, T, XF)


def _beep(f, dur, level=1.0, partials=(1, 2, 3), decay=None):
    t = np.arange(secs(dur)) / SR
    y = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.5 for k in partials)
    e = np.minimum(1, t / 0.004) * np.minimum(1, (dur - t) / 0.01)
    if decay:
        e *= np.exp(-t / decay)
    return st(y * e * level)


@sfx('bridge_electronics', 'bed', -31.0, 30.0, 'ship bridge: equipment fans, console beeps, radar ticks')
def bridge_electronics():
    T = 30.0
    n = T + 4.0
    fans = _stereo_pair(_sb('fsd:406448', n, 71), _sb('fsd:431817', n, 72))
    fans = lp(hp(fans, 60), 7000)
    hum = bp(_mains_hum(n, 100.0, 2, 0.3), 90, 1200) * 0.05
    buf = zeros(n)
    r = rng(73)
    # console: soft two-tone alert every ~7.5 s, radar sweep ticks, echo sounder pings
    for t in np.arange(1.2, T, 7.5):
        b = np.concatenate([_beep(1760, 0.07), zeros(0.05), _beep(1320, 0.09)])
        place(buf, pan(telephone_small(b), -0.35), float(t), 0.12)
    for t in np.arange(0.4, T, 2.5):  # radar rotation tick
        k = one_hit('bank:1206', 0.25)
        place(buf, pan(hp(k, 600), 0.45), float(t + r.uniform(-0.01, 0.01)), 0.10)
    for t in np.arange(3.3, T, 6.0):  # echo sounder ping
        p = _beep(2900, 0.35, partials=(1,), decay=0.08)
        place(buf, pan(p, 0.2), float(t), 0.05)
    buf = reverb(buf, 'cabin', wet=0.3)
    x = mix((fans, 0, 1.0), (hum, 0, 1.0), (buf, 0, 1.0), length=n)
    return fold_loop(x, T)


def telephone_small(x):
    """A small device speaker (console / phone / laptop)."""
    y = bp(x, 450, 7000, 2)
    y = peq(y, 2400, 4, 1.4)
    return y


@sfx('low_horror_drone', 'bed', -25.0, 60.0, 'dark orchestral drone: low cello pedal, organ cluster, bowed metal')
def low_horror_drone():
    T = 60.0
    n = T + 8.0
    r = rng(81)

    def sustain(key, total, seed, a=1.2, b=None):
        x = src(key)
        b = b or (len(x) / SR - 1.5)
        return shuffle_bed(seg(x, a, b), total, (2.5, 4.0), 1.4, seed)

    cello_e = sustain('fsd:372821', n, 82)
    cello_e2 = sustain('fsd:372822', n, 83)
    cello_c = sustain('fsd:372817', n, 84)
    organ_ds = sustain('fsd:373728', n, 85, 0.8, 10.0)
    organ_f = sustain('fsd:373729', n, 86, 0.8, 10.0)
    trem = sustain('fsd:372860', n, 87, 0.8)
    # slow swells so the drone breathes rather than sits
    t = np.arange(secs(n)) / SR
    sw1 = 0.55 + 0.45 * np.sin(2 * np.pi * t / 23.0) ** 2
    sw2 = 0.35 + 0.65 * np.sin(2 * np.pi * t / 31.0 + 1.3) ** 2
    sw3 = 0.2 + 0.8 * np.sin(2 * np.pi * t / 17.0 + 2.1) ** 4
    x = mix((_stereo_pair(cello_e, cello_e2) * sw1[:, None], 0, 1.0),
            (decorrelate(vari(cello_c, semis(4))[: secs(n)], 12) * sw2[: secs(n)][:, None] if False else zeros(0), 0, 0),
            (decorrelate(organ_ds, 15) * sw2[:, None], 0, 0.22),
            (decorrelate(organ_f, 18, seed=2) * sw3[:, None], 0, 0.12),
            (decorrelate(lp(trem, 1500), 10, seed=3) * sw3[:, None], 0, 0.30),
            length=n)
    # bowed metal + gong swells
    for t0, key, ratio, g in [(4.0, 'fsd:375545', 0.5, 0.5), (24.0, 'fsd:375550', 0.45, 0.6),
                              (38.0, 'fsd:375544', 0.5, 0.45), (51.0, 'fsd:375551', 0.4, 0.6)]:
        k = norm(src(key), -6)
        k = hp(vari(k, ratio), 60)
        place(x, width(st(k), 1.4), t0, g)
    x = reverb(x, 'hall', wet=0.45, lo_cut=40)
    x = lp(x, 6000)
    return fold_loop(x, T)


# ============================================================================
# MAIN  (designs are registered above this line)
# ============================================================================
def finalize(name: str, x: np.ndarray, spec: dict) -> np.ndarray:
    x = st(x)
    x = hp(x, 22, 2)  # DC / subsonic clean-up
    if spec['kind'] == 'bed':
        x = L.norm_lufs(x, spec['level'])
        x = limit(x, -2.0)
    else:
        if spec['length']:
            x = fit(x, spec['length'])
        # every one-shot starts and ends exactly on silence (no clicks)
        x = fade(x, 0.004, 0.02)
        x = norm(x, spec['level'])
        x = limit(x, spec['level'] + 0.3)
        x[0] = 0
        x[-1] = 0
    return x


def build(names: list[str], out: Path) -> dict:
    report = {}
    for name in names:
        spec = REGISTRY[name]
        L.set_current(name)
        t0 = time.time()
        x = spec['fn']()
        x = finalize(name, x, spec)
        L.write(out / f'{name}.wav', x)
        report[name] = dict(dur=len(x) / SR, e150=L.energy_above(x, 150), lufs=L.lufs(x), peak=20 * math.log10(L.peak(x) + 1e-12))
        print(f"  {name:22s} {len(x) / SR:6.2f}s  peak {report[name]['peak']:6.1f} dBFS  {report[name]['lufs']:6.1f} LUFS"
              f"  >150Hz {report[name]['e150']:5.1f}%  ({time.time() - t0:.1f}s)", flush=True)
    return report


def write_credits(out: Path) -> None:
    used = L.credits_used()
    lines = ['# Sound effect credits', '',
             'Every file in this folder is built by `scripts/sfx/build_real_sfx.py` from the recordings below',
             '(layered, filtered, pitched and convolved with recorded room impulses). Licences: CC0-1.0 (no attribution',
             'required, listed for provenance) and CC-BY-3.0 (attribution required - keep this file with the project and',
             'credit these authors in the video description/credits).', '',
             'FSD50K: E. Fonseca, X. Favory, J. Pons, F. Font, X. Serra, "FSD50K: an Open Dataset of Human-Labeled Sound Events",',
             'IEEE/ACM TASLP 2022 - clips are Freesound uploads, each under its own licence (only CC0 and CC-BY clips are used).',
             'VSCO-2 CE orchestral samples (Versilian Studios, uploaded to Freesound by Samulis, CC0).',
             'bank-sfx v1 (CC0 collection: Kenney.nl packs and CC0 Freesound uploads).', '']
    by = [(k, v) for k, v in sorted(L.SOURCES.items()) if k in used and v['license'].startswith('CC-BY')]
    if by:
        lines += ['## Attribution required (CC-BY 3.0)', '']
        for k, v in by:
            lines.append(f"- \"{v['title']}\" by {v['author']} - {v['url']} - CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)"
                         f" - used in: {', '.join(used[k])}")
        lines.append('')
    lines += ['## All sources', '', '| source | title | author / origin | licence | used in |', '|---|---|---|---|---|']
    for k, v in sorted(L.SOURCES.items()):
        if k not in used:
            continue
        if k.startswith('fsd:'):
            who = f"{v['author']} ([freesound {v['freesound_id']}]({v['url']}))"
            srcname = f"FSD50K {v['split']}/{v['freesound_id']}.wav"
        else:
            who = v['origin']
            srcname = f"bank-sfx {v['file']}"
        title = v['title'].replace('|', '/')
        lines.append(f"| {srcname} | {title} | {who} | {v['license']} | {', '.join(used[k])} |")
    lines += ['', 'Synthetic elements (no recording exists for them): mains/ballast hum partials, UI/phone tones are played on',
              'recorded marimba/glockenspiel samples, radio squelch and static noise beds, the sine sweep in sub_drop.', '']
    (out / 'CREDITS.md').write_text('\n'.join(lines))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('names', nargs='*')
    ap.add_argument('--out', default=str(OUT_DEFAULT))
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--no-credits', action='store_true')
    a = ap.parse_args()
    if a.list:
        for k, v in REGISTRY.items():
            print(f"{k:22s} {v['kind']:8s} {v['note']}")
        return
    names = a.names or list(REGISTRY)
    bad = [n for n in names if n not in REGISTRY]
    if bad:
        sys.exit(f'unknown: {bad}')
    out = Path(a.out)
    print(f'building {len(names)} sounds -> {out}')
    build(names, out)
    if not a.names and not a.no_credits:
        write_credits(out)
        print(f'wrote {out / "CREDITS.md"}')


if __name__ == '__main__':
    main()
