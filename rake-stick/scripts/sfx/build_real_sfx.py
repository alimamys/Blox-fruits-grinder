#!/usr/bin/env python3
"""Sound design built from REAL recordings: "Frame 240" (default build, see FRAME240 below);
the builders written for the previous film ("The 63rd Passenger", ferry/sea) are kept and can
still be built by name or with --all.

Every file in public/audio/sfx is rebuilt from CC0 / CC-BY field recordings and
orchestral samples (FSD50K CC0+CC-BY subset, VSCO-2 CE orchestra samples via FSD50K,
bank-sfx CC0 one-shots), layered, EQ'd, pitched and placed in real recorded spaces
(convolution with clap impulse responses). A few device sounds (UI beeps, radio
squelch, mains hum) are partly synthetic by nature; see CREDITS.md.

Usage:
  .venv/bin/python scripts/sfx/build_real_sfx.py                 # build FRAME240 + write CREDITS.md
  .venv/bin/python scripts/sfx/build_real_sfx.py pencil_scratch wall_thud  # just these
  options: --out DIR (default public/audio/sfx), --list, --all (every registered builder)

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
from sfxlib import (SR, balance, bp, chain, comp, db, telephone, decay_env, decorrelate, env, fade, fit, hits, hp, hshelf,  # noqa: E402
                    limit, loop, lp, lshelf, mix, mono, norm, onsets, pan, peq, place, reverb, reverse, sat,
                    secs, semis, seg, src, st, stretch, vari, vari_curve, width, zeros)

ROOT = HERE.parent.parent
BED_TAIL = 0.5  # seconds; must match BED_TAIL in src/audio/AudioLayer.tsx
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


def _la(key, T, seed, xfade=0.6, min_seg=2.0, t0=0.0, t1=None):
    """Phase-aligned seamless loop (T s) of a tonal source (see sfxlib.loop_aligned)."""
    return L.loop_aligned(seg(src(key), t0, t1), T, xfade, min_seg, seed)


def circ(y, fn, pre=5.0):
    return L.circ(y, fn, pre)


def bed_mix(cont, events, T: float, XF: float) -> np.ndarray:
    """Seamless bed = continuous layers (crossfade-looped, need T+XF s) + event layers (folded, T+tail s)."""
    y = loop(cont, T, XF) if cont is not None else zeros(T)
    if events is not None:
        y = y + fold_loop(events, T)
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
        (st(boom), 0.0, 0.85),
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
    x = peq(x, 2600, 2.0, 1.0)
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


@sfx('knocking_hull', 'oneshot', -1.0, 10.6, 'knocks on the hull from below, irregular, getting denser')
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
        body = lp(k, 200, 2) * 0.6
        k = thru_hull(k + body, bright=float(r.uniform(4000, 6500)))
        k = peq(hp(k, 70), 1400, 4, 0.9)
        g = db(-9 + 9 * prog + float(r.uniform(-2.5, 2.0)))
        if i < 3:
            g = db(-5 + i * 0.5)
        p = float(np.clip(r.normal(0, 0.55), -0.95, 0.95))
        place(buf, pan(k, p), t, g)
    # a few heavier bangs as it builds
    for t, p, gg in [(6.7, -0.5, -6), (8.35, 0.55, -4), (9.75, -0.15, -2.5)]:
        hs = hits(src('fsd:369924'), -40, 0.5, 10, 1.9)
        b = vari(hs[int(r.integers(0, len(hs)))], float(r.uniform(0.6, 0.7)))
        place(buf, pan(peq(hp(thru_hull(b), 70), 1200, 3, 0.9), p), t, db(gg))
    x = reverb(buf, 'hull', wet=0.32, pre_ms=8, lo_cut=70)
    x = reverb(x, 'steel', wet=0.12)
    x = sat(x * 1.3, 1.2)
    return fade(fit(x, n), 0.003, 0.35)


@sfx('scratch_hull', 'oneshot', -1.0, 3.45, 'clawing / scraping along the steel hull')
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


@sfx('ocean_ambience', 'bed', -28.0, 60.0, 'night sea, waves, water slapping the hull')
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


@sfx('ferry_engine', 'bed', -27.0, 60.0, 'diesel ferry engine through the steel structure')
def ferry_engine():
    T = 60.0
    # every layer is a phase-aligned loop of a real (tonal) engine recording: no splice dips
    low = _stereo_pair(_la('fsd:91533', T, 11), _la('fsd:91533', T, 17))
    low = circ(low, lambda z: lp(z, 320, 4), 1.0)
    mid = _stereo_pair(_la('fsd:109578', T, 12), _la('fsd:109578', T, 16))
    mid = circ(mid, lambda z: bp(z, 70, 3500), 1.0)
    pulse = _stereo_pair(_la('fsd:55053', T, 13, 0.3, 0.8), _la('fsd:55053', T, 18, 0.3, 0.8))
    pulse = circ(pulse, lambda z: lp(z, 2200), 1.0)
    rattle = _stereo_pair(_la('fsd:398675', T, 14), _la('fsd:398675', T, 19))
    rattle = circ(rattle, lambda z: hp(z, 280), 1.0)
    ferry = _stereo_pair(_la('fsd:55025', T, 15, 0.4, 1.0), _la('fsd:55025', T, 20, 0.4, 1.0))
    x = mix((norm(low, -6), 0, 0.42), (norm(mid, -6), 0, 1.0), (norm(pulse, -6), 0, 0.42), (norm(rattle, -6), 0, 0.30),
            (norm(ferry, -6), 0, 0.38), length=T)
    return circ(x, lambda z: peq(peq(lp(reverb(z, 'steel', wet=0.22, lo_cut=60), 5200, 2), 110, 2.0, 0.8), 850, 1.5, 0.9), 3.0)


@sfx('wind', 'bed', -20.5, 30.0, 'gusty sea wind with howl (also used as a one-shot)')
def wind():
    T, XF = 30.0, 3.0
    n = T + XF
    base = loop(hp(_sb('fsd:78430', n, 21, (6, 10)), 90), T, XF)
    gust = loop(hp(_sb('fsd:182912', n, 24, (5, 9)), 110), T, XF)
    rumble = loop(lp(hp(_sb('fsd:256862', n, 25, (6, 10)), 45), 400), T, XF)
    howl = _stereo_pair(_la('bank:1716', T, 22, 0.8, 1.5), _la('bank:1715', T, 23, 0.8, 1.5))
    t = np.arange(secs(T)) / SR
    g = 0.72 + 0.28 * np.sin(2 * np.pi * t / 7.5) * np.sin(2 * np.pi * t / 10 + 1)   # periodic in 30 s
    gh = 0.35 + 0.65 * np.sin(2 * np.pi * t / 30 + 0.5) ** 2
    x = mix((_stereo_pair(base, gust) * g[:, None], 0, 1.0), (howl * (g * gh)[:, None], 0, 0.3),
            (circ(rumble, lambda z: decorrelate(z, 11), 0.5), 0, 0.4), length=T)
    return x


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


@sfx('daylight_ambience', 'bed', -31.0, 40.0, 'busy daytime harbour / deck: gulls, water, distant people')
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


@sfx('room_tone', 'bed', -35.0, 30.0, 'small steel cabin: ventilation, faint engine through the floor')
def room_tone():
    T = 30.0
    vent = _la('fsd:362431', T, 51)
    ac = _la('fsd:431817', T, 52)
    eng = circ(_la('fsd:91533', T, 53), lambda z: lp(z, 180, 4), 1.0)
    x = mix((_stereo_pair(norm(vent, -12), norm(ac, -14)), 0, 1.0), (circ(norm(eng, -12), lambda z: decorrelate(z, 9), 0.5), 0, 0.18), length=T)
    return circ(x, lambda z: reverb(lp(z, 6000), 'cabin', wet=0.25), 2.0)


def _mains_hum(n_sec, f0=100.0, seed=0, buzz=0.6):
    """Ballast / transformer hum: harmonic series of 100 Hz with a slow drift (synthetic by nature).
    Periodic over n_sec when f0 * n_sec is an integer (used for looping beds)."""
    r = rng(seed)
    t = np.arange(secs(n_sec)) / SR
    y = np.zeros_like(t)
    fm = 2.0 / n_sec  # drift completes whole cycles in the file
    drift_int = t + 0.0008 * (1 - np.cos(2 * np.pi * fm * t)) / (2 * np.pi * fm)
    for k in range(1, 40):
        a = (1 / k ** 1.1) * (buzz if k % 2 == 0 else 1.0) * (1.0 + 0.2 * r.standard_normal())
        y += a * np.sin(2 * np.pi * f0 * k * drift_int + r.uniform(0, 6))
    y = y / np.max(np.abs(y))
    return st(y)


@sfx('emergency_hum', 'bed', -24.0, 30.0, 'emergency lighting: ballast hum, dead ventilation, hull creaks')
def emergency_hum():
    T = 30.0
    hum = circ(_mains_hum(T, 100.0, 1), lambda z: reverb(bp(z, 90, 3000), 'cabin', wet=0.35), 2.0)
    fridge = _stereo_pair(_la('fsd:413566', T, 61), _la('fsd:413566', T, 64))
    fan = circ(_la('fsd:398820', T, 62), lambda z: decorrelate(lp(z, 400), 13), 1.0)
    groan = zeros(T + 8)
    g = src('fsd:73257')
    r = rng(63)
    for t in (5.0, 17.5, 26.0):
        t0 = float(r.uniform(1, 16))
        place(groan, pan(fade(vari(loudest(seg(g, t0, t0 + 4), 2.5), 0.7), 0.5, 1.0), float(r.uniform(-0.7, 0.7))), t)
    cont = mix((hum, 0, 0.22), (norm(fridge, -10), 0, 1.0), (norm(fan, -12), 0, 0.35), length=T)
    return cont + fold_loop(reverb(groan, 'hull', wet=0.5) * 0.25, T)


def _beep(f, dur, level=1.0, partials=(1, 2, 3), decay=None):
    t = np.arange(secs(dur)) / SR
    y = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.5 for k in partials)
    e = np.minimum(1, t / 0.004) * np.minimum(1, (dur - t) / 0.01)
    if decay:
        e *= np.exp(-t / decay)
    return st(y * e * level)


@sfx('bridge_electronics', 'bed', -32.0, 30.0, 'ship bridge: equipment fans, console beeps, radar ticks')
def bridge_electronics():
    T = 30.0
    fans = _stereo_pair(_la('fsd:406448', T, 71), _la('fsd:431817', T, 72))
    fans = circ(fans, lambda z: lp(hp(z, 60), 7000), 1.0)
    hum = circ(_mains_hum(T, 100.0, 2, 0.3), lambda z: bp(z, 90, 1200), 1.0) * 0.05
    buf = zeros(T + 4)
    r = rng(73)
    # console: soft two-tone alert every 7.5 s, radar sweep ticks, echo sounder pings
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
    return fans + hum + fold_loop(buf, T)


def telephone_small(x):
    """A small device speaker (console / phone / laptop)."""
    y = bp(x, 450, 7000, 2)
    y = peq(y, 2400, 4, 1.4)
    return y


@sfx('low_horror_drone', 'bed', -25.0, 60.0, 'dark orchestral drone: low cello pedal, organ cluster, bowed metal')
def low_horror_drone():
    T = 60.0
    cello = _stereo_pair(_la('fsd:372821', T, 82, 0.6, 1.5, 1.2, 7.8), _la('fsd:372822', T, 83, 0.6, 1.5, 1.2, 7.8))
    organ_ds = circ(_la('fsd:373728', T, 85, 0.6, 1.5, 0.8, 10.0), lambda z: decorrelate(z, 15), 0.5)
    organ_f = circ(_la('fsd:373729', T, 86, 0.6, 1.5, 0.8, 10.0), lambda z: decorrelate(z, 18, seed=2), 0.5)
    trem = circ(_la('fsd:372860', T, 87, 0.6, 1.5, 0.8, 7.5), lambda z: decorrelate(lp(z, 1500), 10, seed=3), 1.0)
    # slow swells (periodic in 60 s) so the drone breathes rather than sits
    t = np.arange(secs(T)) / SR
    sw1 = 0.55 + 0.45 * np.sin(2 * np.pi * t / 60.0) ** 2
    sw2 = 0.35 + 0.65 * np.sin(2 * np.pi * t / 40.0 + 1.3) ** 2
    sw3 = 0.2 + 0.8 * np.sin(2 * np.pi * t / 24.0 + 2.1) ** 4
    x = mix((cello * sw1[:, None], 0, 1.0), (organ_ds * sw2[:, None], 0, 0.22), (organ_f * sw3[:, None], 0, 0.12),
            (trem * sw3[:, None], 0, 0.30), length=T)
    x = circ(x, lambda z: lp(reverb(z, 'hall', wet=0.45, lo_cut=40), 6000), 5.0)
    # bowed metal + gong swells (events, folded into the loop)
    ev = zeros(T + 14)
    for t0, key, ratio, g in [(4.0, 'fsd:375545', 0.5, 0.5), (24.0, 'fsd:375550', 0.45, 0.6),
                              (38.0, 'fsd:375544', 0.5, 0.45), (51.0, 'fsd:375551', 0.4, 0.6)]:
        k = norm(src(key), -6)
        k = hp(vari(k, ratio), 90)
        k = fade(k, 5.0, 6.0)  # a slow swell, never an attack
        place(ev, width(st(k), 1.4), t0, g * 0.45)
    ev = lp(reverb(ev, 'hall', wet=0.45, lo_cut=60), 6000)
    return x + fold_loop(ev, T)


# ============================================================================
# FOLEY
# ============================================================================
def _step_pool(keys, thr=-42, gap=0.12):
    pool = []
    for key in keys:
        for h in hits(src(key), thr, gap, 9, 0.7):
            if len(h) > secs(0.06) and peak(h) > 0.01:
                pool.append(norm(h, -3))
    return pool


def peak(x):
    return L.peak(x)


def _footsteps(seed, n, start, period, jitter, pool_keys, ring_keys, ring_gain, heavy, rev_wet):
    r = rng(seed)
    pool = _step_pool(pool_keys)
    rings = _step_pool(ring_keys) if ring_keys else []
    buf = zeros(n + 1)
    t = start
    i = 0
    while t < n - 0.08:
        s = pool[int(r.integers(0, len(pool)))]
        s = vari(s, float(r.uniform(0.9, 1.06)))
        g = db(float(r.uniform(-2.5, 0.5)) + (0 if i % 2 else -1.0))
        p = (-0.12 if i % 2 else 0.12) + float(r.uniform(-0.05, 0.05))
        place(buf, pan(s, p), t, g)
        if rings:
            k = rings[int(r.integers(0, len(rings)))]
            k = vari(k, float(r.uniform(0.8, 1.0)))
            place(buf, pan(k, p), t + 0.004, g * ring_gain)
        if heavy:
            place(buf, pan(lp(s, 300) * heavy, p), t, g)
        t += period + float(r.uniform(-jitter, jitter))
        i += 1
    x = reverb(buf, 'steel', wet=rev_wet)
    return fade(fit(x, n), 0.002, 0.15)


@sfx('footsteps_walk', 'oneshot', -3.0, 3.35, 'walking on a steel deck')
def footsteps_walk():
    return _footsteps(91, 3.35, 0.05, 0.56, 0.04, ['bank:859', 'fsd:50724'], ['bank:858', 'bank:860'], 0.35, 0.0, 0.22)


@sfx('footsteps_running', 'oneshot', -2.0, 3.35, 'running on a steel deck')
def footsteps_running():
    return _footsteps(92, 3.35, 0.03, 0.29, 0.025, ['bank:850', 'bank:865', 'bank:866', 'fsd:51163'],
                      ['bank:859', 'bank:858', 'fsd:50724'], 0.55, 0.6, 0.2)


@sfx('metal_door', 'oneshot', -1.0, 2.05, 'heavy steel door: handle, swing, slam with latch')
def metal_door():
    handle = one_hit('bank:883', 0.75)
    slam = from_onset(src('fsd:406197'), -35, 0.003, 1.7)
    slam = vari(slam, 0.92)
    latch = one_hit('bank:897', 0.4)
    creak = loudest(src('bank:872'), 0.5)
    x = mix((handle, 0.0, 0.7), (fade(vari(creak, 0.7), 0.1, 0.2), 0.22, 0.18), (slam, 0.62, 1.0), (hp(latch, 400), 0.66, 0.4),
            length=2.6)
    x = reverb(x, 'steel', wet=0.25)
    return fade(fit(x, 2.05), 0.002, 0.4)


@sfx('metal_creak', 'oneshot', -6.0, 3.2, 'the steel structure groans and creaks')
def metal_creak():
    g = vari(norm(loudest(src('fsd:399453'), 3.0), -3), 0.55)
    s = src('fsd:73257')
    sh = vari(norm(loudest(seg(s, 4, 16), 2.6), -3), 0.8)
    sq = vari(norm(loudest(src('fsd:104367'), 1.2), -3), 0.5)
    x = mix((fade(g, 0.6, 1.2), 0.0, 0.7), (fade(sh, 0.3, 0.8), 0.35, 0.8), (fade(lp(sq, 2500), 0.2, 0.5), 1.4, 0.45), length=4)
    x = thru_hull(x, 5000)
    x = reverb(x, 'hull', wet=0.4)
    return fade(fit(x, 3.2), 0.15, 0.8)


@sfx('slap', 'oneshot', -1.0, 0.85, 'a hard slap across the face')
def slap():
    a = one_hit('fsd:387705')
    b = one_hit('fsd:387749', 0.4)
    c = one_hit('fsd:387756', 0.4)
    x = mix((a, 0, 1.0), (b, 0.003, 0.6), (lp(c, 1500), 0.0, 0.5), length=1.2)
    x = peq(x, 900, 3, 1.0)
    x = comp(norm(x, -1), -22, 4, 1, 60, 8)
    x = reverb(x, 'cabin', wet=0.18)
    return fade(fit(x, 0.85), 0.001, 0.3)


@sfx('water_splash', 'oneshot', -1.0, 1.4, 'something breaks the water surface')
def water_splash():
    a = from_onset(src('bank:734'), -40, 0.003)
    b = from_onset(src('bank:705'), -40, 0.003)
    c = from_onset(src('fsd:50782'), -40, 0.003)
    x = mix((a, 0, 1.0), (b, 0.02, 0.5), (lp(c, 900), 0.0, 0.5), length=1.8)
    return fade(fit(x, 1.4), 0.002, 0.45)


@sfx('water_lap', 'oneshot', -6.0, 8.0, 'water lapping against the hull')
def water_lap():
    a = loudest(src('fsd:388970'), 8.0)
    b = loudest(src('fsd:364694'), 8.0)
    x = _stereo_pair(a, b, 0.8)
    x = peq(bp(x, 100, 8000), 420, 3, 0.9)
    x = reverb(x, 'cabin', wet=0.1)
    return fade(x, 0.6, 1.8)


@sfx('heartbeat', 'oneshot', -4.0, 4.5, 'a real heartbeat, close and anxious')
def heartbeat():
    x = from_onset(src('bank:1343'), -40, 0.02)
    x = chain([x, seg(src('bank:1343'), 0.4)], 0.3)
    x = vari(x, 1.08)  # a little faster: anxious
    # make the thumps audible on small speakers: harmonics from gentle saturation + low-mid lift
    y = sat(norm(x, -6) * 2.0, 1.6)
    y = peq(y, 170, 7, 0.9)
    y = peq(y, 550, 3, 1.0)
    y = lp(hp(y, 90, 2), 1600, 2)
    y = mix((norm(y, -6), 0, 1.0), (norm(lp(x, 90), -6), 0, 0.6))
    return fade(fit(y, 4.5), 0.01, 0.4)


@sfx('ferry_horn', 'oneshot', -1.0, 5.7, 'ferry horn blast across the harbour')
def ferry_horn():
    a = from_onset(src('fsd:420716'), -40, 0.02)
    b = from_onset(src('bank:830'), -40, 0.02)
    x = mix((a, 0, 1.0), (b, 0.03, 0.35), length=7)
    x = reverb(x, 'hall', wet=0.35, pre_ms=40)
    return fade(fit(x, 5.7), 0.02, 0.8)


@sfx('page_flip', 'oneshot', -6.0, 0.6, 'turning a photo album page')
def page_flip():
    x = one_hit('bank:956', 0.6)
    x = mix((x, 0, 1.0), (one_hit('bank:954', 0.3), 0.05, 0.4), length=0.7)
    return fade(fit(reverb(x, 'cabin', wet=0.1), 0.6), 0.002, 0.15)


@sfx('ring_clink', 'oneshot', -1.0, 0.9, 'a wedding ring set down on a table')
def ring_clink():
    a = one_hit('fsd:400112', 0.6)
    a = vari(a, 1.18)
    b = one_hit('fsd:400115', 0.8)
    b = vari(b, 1.3)
    x = mix((a, 0, 1.0), (b, 0.09, 0.3), length=1.0)
    return fade(fit(reverb(x, 'cabin', wet=0.12), 0.9), 0.001, 0.25)


@sfx('cable_pull', 'oneshot', -3.0, 0.8, 'the PA cable is yanked out: whip, plug, speaker pop')
def cable_pull():
    whip = fade(vari(loudest(src('fsd:402203'), 0.35), 1.3), 0.01, 0.1)
    plug = one_hit('bank:964', 0.3)
    pop = one_hit('fsd:149034', 0.25)  # mic tap through the PA = speaker thump
    crackle = hp(one_hit('fsd:156335', 0.12), 1500)
    x = mix((whip, 0.0, 0.6), (plug, 0.16, 1.0), (lp(pop, 900), 0.17, 0.9), (crackle, 0.17, 0.35), length=1.0)
    x = reverb(x, 'steel', wet=0.2)
    return fade(fit(x, 0.8), 0.002, 0.2)


# ============================================================================
# ENGINE ONE-SHOTS
# ============================================================================
def _engine_source(total, seed):
    mid = _sb('fsd:109578', total, seed, (5, 8))
    low = lp(_sb('fsd:91533', total, seed + 1, (4, 7), 1.5), 320, 4)
    pulse = lp(_sb('fsd:55053', total, seed + 2, (1.2, 2.2), 0.4), 2200)
    return mix((norm(mid, -6), 0, 1.0), (norm(low, -6), 0, 0.5), (norm(pulse, -6), 0, 0.45), length=total)


@sfx('engine_slowdown', 'oneshot', -1.0, 7.0, 'the engines wind down and die')
def engine_slowdown():
    n = 7.0
    e = _engine_source(12, 301)
    rates = [(0, 1.0), (0.8, 0.98), (3.0, 0.62), (5.0, 0.38), (6.2, 0.3)]
    slow = vari_curve(e, rates, out_len=n)
    slow = env(slow, [(0, 1), (2.5, 0.9), (4.5, 0.45), (6.0, 0.08), (7, 0.0)])
    stop = from_onset(src('fsd:340716'), -40, 0.01)
    shut = from_onset(src('fsd:379389'), -40, 0.01)
    vent = loudest(src('fsd:395881'), 6.0)
    x = mix((decorrelate(slow, 11), 0, 1.0), (pan(lp(stop, 3000), 0.1), 3.6, 0.55), (pan(shut, -0.1), 4.4, 0.5),
            (fade(decorrelate(vent, 7), 0.5, 2.0), 0.6, 0.35), length=n + 1)
    x = reverb(x, 'steel', wet=0.25, lo_cut=60)
    return fade(fit(x, n), 0.05, 1.0)


@sfx('engine_roar', 'oneshot', -1.0, 5.0, 'the engines roar back to life')
def engine_roar():
    n = 5.0
    start = from_onset(src('fsd:340703'), -40, 0.01)
    e = _engine_source(9, 401)
    rates = [(0, 0.35), (0.5, 0.55), (1.5, 1.05), (2.5, 1.15), (5, 1.05)]
    up = vari_curve(e, rates, out_len=n)
    up = env(up, [(0, 0.0), (0.3, 0.4), (1.2, 1.0), (5, 1.0)])
    diesel = from_onset(src('fsd:156358'), -40, 0.01)
    diesel = loudest(diesel, 3.5)
    x = mix((decorrelate(up, 11), 0, 1.0), (pan(start, 0.0), 0.0, 0.45), (decorrelate(fade(lp(diesel, 3000), 0.6, 0.5), 9), 0.8, 0.35),
            length=n + 1)
    x = reverb(x, 'steel', wet=0.2, lo_cut=60)
    x = peq(x, 120, 3, 0.8)
    return fade(fit(x, n), 0.01, 0.6)


# ============================================================================
# SCREAMS
# ============================================================================
@sfx('screams_crowd', 'oneshot', -1.0, 4.3, 'passengers screaming in the dark lounge')
def screams_crowd():
    r = rng(501)
    n = 4.3
    buf = zeros(n + 2)
    group = from_onset(src('fsd:381895'), -40, 0.01)
    place(buf, decorrelate(group, 12), 0.05, 0.9)
    gasp = from_onset(src('fsd:333397'), -40, 0.01)
    place(buf, decorrelate(gasp, 9), 0.0, 0.5)
    singles = [('fsd:219660', -0.6), ('fsd:222537', 0.5), ('fsd:110141', -0.25), ('fsd:169628', 0.7),
               ('fsd:395736', 0.2), ('fsd:241591', -0.8), ('fsd:222589', 0.35)]
    for i, (key, p) in enumerate(singles):
        s = norm(from_onset(src(key), -40, 0.01, 3.0), -3)
        t = 0.15 + i * 0.22 + float(r.uniform(-0.08, 0.1))
        g = db(float(r.uniform(-9, -4)))
        place(buf, pan(fade(s, 0.01, 0.4), p), t, g)
    run = loudest(src('fsd:361172'), 4.0)
    place(buf, decorrelate(hp(run, 150), 10), 0.4, 0.35)
    x = reverb(buf, 'steel', wet=0.35)
    return fade(fit(x, n), 0.004, 1.0)


@sfx('scream_distant', 'oneshot', -4.0, 4.1, 'a woman screams somewhere far below / outside')
def scream_distant():
    a = norm(from_onset(src('fsd:395736'), -40, 0.01), -3)
    b = norm(from_onset(src('fsd:241591'), -40, 0.01), -3)
    x = mix((a, 0.0, 1.0), (b, 0.9, 0.5), length=5.5)
    x = bp(x, 250, 3000)
    x = reverb(x, 'hull', wet=1.0, dry=0.35, pre_ms=35)
    x = balance(x, 0.25)
    return fade(fit(x, 4.1), 0.03, 1.2)


# ============================================================================
# ELECTRICAL
# ============================================================================
def _tube_buzz(dur, seed):
    hum = _mains_hum(dur, 100.0, seed, 0.9)
    return bp(hum, 100, 6000)


def _arc(seed, dur=0.12):
    r = rng(seed)
    a = src('fsd:396240')
    t0 = float(r.uniform(0.3, 4.0))
    return fade(hp(seg(a, t0, t0 + dur), 800), 0.002, 0.03)


@sfx('light_flicker', 'oneshot', -4.0, 0.9, 'fluorescent tubes flicker: buzz bursts, arcing, ticks')
def light_flicker():
    r = rng(601)
    n = 0.9
    buzz = _tube_buzz(n + 0.2, 7)
    gate = np.zeros(secs(n + 0.2))
    t = 0.0
    while t < n - 0.05:
        on = float(r.uniform(0.03, 0.12))
        a, b = secs(t), secs(t + on)
        g = np.ones(b - a)
        k = min(len(g), secs(0.004))
        g[:k] = np.linspace(0, 1, k)
        g[-k:] = np.linspace(1, 0, k)
        gate[a:b] = g * float(r.uniform(0.5, 1.0))
        t += on + float(r.uniform(0.02, 0.1))
    buf = buzz * gate[:, None] * 0.5
    for t in np.arange(0.0, n, 0.13):
        place(buf, _arc(int(t * 1000) + 3), float(t + r.uniform(0, 0.05)), 0.6)
        place(buf, hp(one_hit('bank:1206', 0.1), 1500), float(t + 0.02), 0.25)
    x = reverb(buf, 'cabin', wet=0.3)
    return fade(fit(x, n), 0.002, 0.08)


@sfx('lights_off', 'oneshot', -2.0, 2.1, 'breaker trips: clunk, the lights die, buzz falls away')
def lights_off():
    n = 2.1
    clunk = one_hit('bank:1208', 0.5)
    thump = lp(hits(src('fsd:400866'), -40, 0.3, 10, 1.0)[2], 500)
    buzz = _tube_buzz(1.2, 9)
    buzz = vari_curve(buzz, [(0, 1.0), (0.6, 0.7), (1.0, 0.4)], out_len=1.0)
    buzz = env(buzz, [(0, 0.5), (0.4, 0.2), (1.0, 0.0)])
    vent = loudest(src('fsd:395881'), 2.0)
    x = mix((buzz, 0.0, 0.35), (clunk, 0.02, 1.0), (thump, 0.03, 0.7), (_arc(17, 0.08), 0.02, 0.5),
            (fade(decorrelate(vent, 9), 0.05, 1.2), 0.05, 0.3), length=n + 1)
    x = reverb(x, 'steel', wet=0.35)
    return fade(fit(x, n), 0.002, 0.6)


@sfx('lights_on', 'oneshot', -3.0, 1.3, 'breaker in: clunk, tubes strike and buzz into life')
def lights_on():
    n = 1.3
    clunk = one_hit('bank:1208', 0.5)
    buzz = _tube_buzz(n, 11)
    buzz = env(buzz, [(0, 0), (0.12, 0.0), (0.15, 0.8), (0.22, 0.1), (0.3, 0.9), (0.36, 0.3), (0.45, 1.0), (1.3, 0.55)])
    tink = hp(one_hit('bank:283', 0.3), 1500)
    x = mix((clunk, 0.0, 1.0), (buzz, 0, 0.3), (vari(tink, 1.5), 0.15, 0.2), (vari(tink, 1.7), 0.3, 0.15),
            (_arc(21, 0.06), 0.15, 0.4), (_arc(23, 0.05), 0.31, 0.35), length=n + 1)
    x = reverb(x, 'steel', wet=0.3)
    return fade(fit(x, n), 0.002, 0.3)


@sfx('power_down', 'oneshot', -1.5, 3.5, 'total power failure: relays, everything spins down')
def power_down():
    n = 3.5
    clunk = one_hit('bank:1208', 0.5)
    vent = from_onset(src('fsd:395881'), -40, 0.0)
    vent = loudest(vent, 4.0)
    vent = vari_curve(vent, [(0, 1.0), (1.0, 0.75), (2.5, 0.45), (3.5, 0.3)], out_len=n)
    vent = env(vent, [(0, 1), (1.5, 0.6), (3.0, 0.1), (3.5, 0)])
    elev = one_hit('bank:1465')
    buzz = _tube_buzz(n, 13)
    buzz = vari_curve(buzz, [(0, 1.0), (1.5, 0.6), (3.0, 0.35)], out_len=n)
    buzz = env(buzz, [(0, 0.6), (1.0, 0.3), (2.5, 0.0)])
    thump = lp(hits(src('fsd:400866'), -40, 0.3, 10, 1.4)[0], 400)
    x = mix((clunk, 0.0, 1.0), (thump, 0.02, 0.9), (decorrelate(vent, 11), 0.0, 0.55), (elev, 0.05, 0.5), (buzz, 0.0, 0.25),
            (_arc(31, 0.1), 0.01, 0.6), length=n + 1)
    x = reverb(x, 'hull', wet=0.3)
    return fade(fit(x, n), 0.002, 0.5)


@sfx('emergency_alarm', 'oneshot', -3.0, 7.9, 'ship general alarm bell ringing down the corridors')
def emergency_alarm():
    bell = from_onset(src('fsd:418705'), -40, 0.0)
    bell = shuffle_bed(bell, 8.5, (1.8, 3.0), 0.25, 701)
    honk = lp(src('fsd:400894'), 2500)
    x = mix((decorrelate(bell, 13), 0, 1.0), (decorrelate(fit(honk, 8.5), 9), 0.4, 0.15), length=8.5)
    x = reverb(x, 'hall', wet=0.45, pre_ms=20)
    return fade(fit(x, 7.9), 0.01, 0.6)


# ============================================================================
# DEVICES: UI, PHONE, PA, RADIO
# ============================================================================
def phone_speaker(x):
    y = bp(x, 520, 9000, 2)
    y = peq(y, 2600, 5, 1.2)
    y = peq(y, 1000, 2, 1.0)
    return sat(y * 1.3, 1.4)


def _note(key, semi=0.0, dur=None, gain=1.0):
    x = norm(from_onset(src(key), -45, 0.001, dur), -3)
    x = vari(x, semis(semi)) if semi else x
    return fade(x, 0.001, min(0.25, len(x) / SR / 3)) * gain


def _haptic(dur=None, which=0):
    """One buzz of a real phone vibration motor on a table."""
    hs = hits(src('bank:1891'), -40, 0.06, 6, 0.6)
    h = hs[which % len(hs)] if hs else one_hit('bank:1891', 0.3)
    return h if dur is None else fit(h, dur)


@sfx('ui_click', 'oneshot', -8.0, 0.12, 'mouse / trackpad click')
def ui_click():
    x = one_hit('bank:1229', 0.12)
    x = mix((x, 0, 1.0), (lp(x, 2000), 0, 0.4))
    return fade(fit(reverb(x, 'cabin', wet=0.06), 0.12), 0.001, 0.04)


@sfx('ui_refresh', 'oneshot', -10.0, 0.6, 'screen refresh: swipe, click, soft tick')
def ui_refresh():
    swipe = hp(fade(loudest(src('fsd:402204'), 0.28), 0.05, 0.12), 1500)
    click = one_hit('bank:1229', 0.1)
    tick = phone_speaker(_note('fsd:373366', 0, 0.25, 0.5))
    x = mix((swipe, 0.0, 0.35), (click, 0.24, 1.0), (tick, 0.3, 0.35), length=0.8)
    return fade(fit(reverb(x, 'cabin', wet=0.08), 0.6), 0.003, 0.15)


@sfx('data_transfer', 'oneshot', -12.0, 2.5, 'image downloading: soft digital chatter and a completion tick')
def data_transfer():
    r = rng(801)
    n = 2.5
    buf = zeros(n + 0.5)
    sw = one_hit('bank:1206', 0.1)
    t = 0.05
    while t < n - 0.45:
        k = vari(hp(sw, 2000), float(r.uniform(1.4, 2.2)))
        place(buf, pan(k, float(r.uniform(-0.3, 0.3))), t, float(r.uniform(0.1, 0.35)))
        t += float(r.uniform(0.03, 0.11))
    # GSM-like data bursts, very soft, band limited
    g = seg(src('fsd:161347'), 0.0, 2.2)
    g = bp(g, 900, 4500) * 0.12
    place(buf, decorrelate(g, 5), 0.1)
    done = phone_speaker(_note('fsd:373366', 2, 0.3, 0.6))
    place(buf, done, n - 0.4)
    x = reverb(buf, 'cabin', wet=0.1)
    return fade(fit(x, n), 0.01, 0.1)


@sfx('glitch', 'oneshot', -6.0, 0.55, 'digital glitch: GSM interference stutter')
def glitch():
    r = rng(811)
    g = src('fsd:161347')
    parts = []
    for _ in range(9):
        t0 = float(r.uniform(0, 5.3))
        d = float(r.uniform(0.025, 0.08))
        parts.append(fade(seg(g, t0, t0 + d), 0.002, 0.004))
    x = np.concatenate(parts)
    m = seg(src('fsd:75131'), 0.3, 0.75)
    x = mix((x, 0, 1.0), (bp(m, 600, 6000), 0.12, 0.45), length=0.6)
    x = bp(x, 250, 7500)
    return fade(fit(decorrelate(x, 4, 0.6), 0.55), 0.002, 0.06)


def _radio_hiss(total, seed):
    """Real radio static (the hiss between the receiver's on/off clicks), extended."""
    h = src('bank:963')
    on = onsets(h, -45, 0.3, 8)
    a = on[0] / SR + 0.12 if on else 0.2
    b = (on[-1] / SR - 0.05) if len(on) > 1 else len(h) / SR - 0.3
    return shuffle_bed(seg(h, a, b), total, (0.5, 1.1), 0.15, seed)


@sfx('cctv_static', 'oneshot', -10.0, 2.0, 'CCTV monitor static / snow')
def cctv_static():
    n = 2.0
    r = rng(821)
    hiss = norm(_radio_hiss(n, 822), -6)
    white = st(r.standard_normal(secs(n)) * 0.12)
    crack = hp(_sb('fsd:102698', n, 823, (0.6, 1.2), 0.1), 400)
    t = np.arange(secs(n)) / SR
    hum = st(0.03 * np.sign(np.sin(2 * np.pi * 60 * t)) * 0.5)
    x = mix((decorrelate(hiss, 6), 0, 1.0), (lp(white, 9000), 0, 0.6), (norm(crack, -10), 0, 0.5), (lp(hum, 1200), 0, 1.0), length=n)
    x = peq(x, 3000, 3, 0.8)
    return fade(x, 0.01, 0.08)


@sfx('phone_alert', 'oneshot', -6.0, 1.0, 'message notification on a phone lying on a table')
def phone_alert():
    a = _note('fsd:373365', 0, 0.5)
    b = _note('fsd:373365', 5, 0.6)
    tones = phone_speaker(mix((a, 0, 1.0), (b, 0.11, 0.9), length=1.0))
    hap = _haptic(0.25, 0)
    x = mix((tones, 0.0, 1.0), (hap, 0.0, 0.5), length=1.1)
    return fade(fit(reverb(x, 'cabin', wet=0.08), 1.0), 0.002, 0.2)


@sfx('phone_vibrate', 'oneshot', -6.0, 1.1, 'phone vibrating on a table')
def phone_vibrate():
    x = from_onset(src('bank:1891'), -40, 0.003)
    x = reverb(x, 'cabin', wet=0.08)
    return fade(fit(x, 1.1), 0.003, 0.12)


@sfx('phone_ring', 'oneshot', -5.0, 4.6, 'generic phone ringtone (marimba trill) + vibration on a table')
def phone_ring():
    n = 4.6
    buf = zeros(n + 1)
    lo = _note('fsd:373580', 7, 0.35)
    hi = _note('fsd:373580', 12, 0.35)
    for start in (0.0, 1.55, 3.1):
        for i in range(8):
            place(buf, hi if i % 2 == 0 else lo, start + i * 0.085, 0.9 if i % 2 == 0 else 0.75)
        for i in range(8):
            place(buf, hi if i % 2 == 0 else lo, start + 0.75 + i * 0.085, 0.9 if i % 2 == 0 else 0.75)
    x = phone_speaker(buf)
    vib = zeros(n + 1)
    v = seg(src('fsd:369720'), 0.0, 8.5)
    vb = hits(v, -60, 0.4, 8, 1.2)
    for k, start in enumerate((0.0, 1.55, 3.1)):
        if vb:
            place(vib, fit(vb[k % len(vb)], 1.2), start, 1.0)
    vib = norm(vib, -6)
    x = mix((x, 0, 1.0), (vib, 0, 0.35), length=n + 1)
    return fade(fit(reverb(x, 'cabin', wet=0.1), n), 0.002, 0.3)


@sfx('phone_off', 'oneshot', -8.0, 0.8, 'phone switched off: haptic thunk, descending chime')
def phone_off():
    hap = _haptic(0.2, 1)
    a = _note('fsd:373365', 4, 0.4)
    b = _note('fsd:373365', -1, 0.5)
    tones = phone_speaker(mix((a, 0, 0.8), (b, 0.12, 0.8), length=0.8))
    tap = one_hit('bank:962', 0.15)
    x = mix((tap, 0, 0.4), (hap, 0.02, 0.6), (tones, 0.06, 0.8), length=0.9)
    return fade(fit(reverb(x, 'cabin', wet=0.08), 0.8), 0.002, 0.2)


@sfx('phone_on', 'oneshot', -8.0, 0.9, 'phone switched on: haptic pulse, rising chime')
def phone_on():
    hap = _haptic(0.25, 2)
    notes = [_note('fsd:373365', s, 0.45) for s in (-1, 4, 7)]
    tones = phone_speaker(mix((notes[0], 0, 0.7), (notes[1], 0.1, 0.75), (notes[2], 0.2, 0.85), length=0.9))
    x = mix((hap, 0.0, 0.6), (tones, 0.08, 0.8), length=1.0)
    return fade(fit(reverb(x, 'cabin', wet=0.08), 0.9), 0.002, 0.2)


def pa_speaker(x):
    """Ferry PA horn speakers: band-limited, honky, in a big steel space."""
    y = bp(x, 380, 4200, 2)
    y = peq(y, 1500, 5, 1.1)
    y = sat(y * 1.5, 1.6)
    return reverb(y, 'hall', wet=0.5, pre_ms=15)


@sfx('pa_static', 'oneshot', -4.0, 1.5, 'the PA system switches on: click, hum, hiss, mic bump')
def pa_static():
    n = 1.5
    click = one_hit('bank:963', 0.15)
    hiss = norm(_radio_hiss(n, 831), -6)
    hum = _mains_hum(n, 50.0, 4, 0.8) * 0.08
    bump = lp(one_hit('fsd:149034', 0.4), 1200)
    x = mix((click, 0.0, 1.0), (hiss, 0.03, 0.55), (bp(hum, 50, 3000), 0.03, 1.0), (bump, 0.45, 0.7), length=n + 1)
    x = env(x, [(0, 1), (0.03, 1), (0.25, 0.9), (1.2, 0.7), (1.5, 0.5)])
    return fade(fit(pa_speaker(x), n), 0.002, 0.25)


@sfx('pa_click', 'oneshot', -4.0, 0.3, 'PA switched off: click and speaker pop')
def pa_click():
    h = src('bank:963')
    on = onsets(h, -45, 0.3, 8)
    t = on[-1] / SR if on else 2.3
    click = fade(seg(h, t - 0.003, t + 0.12), 0.002, 0.03)
    pop = lp(one_hit('fsd:149034', 0.2), 600)
    x = mix((click, 0, 1.0), (pop, 0.004, 0.6), length=0.5)
    x = mix((x, 0, 1.0), (pa_speaker(x), 0, 0.6), length=0.5)
    return fade(fit(x, 0.3), 0.001, 0.08)


def _squelch(dur, seed, level=1.0):
    r = rng(seed)
    noise = st(r.standard_normal(secs(dur)))
    noise = bp(noise, 300, 3200, 4)
    e = np.exp(-np.arange(secs(dur)) / (SR * dur * 0.35))
    e[: secs(0.003)] *= np.linspace(0, 1, secs(0.003))
    return noise * e[:, None] * level


@sfx('marine_radio', 'oneshot', -6.0, 0.5, 'VHF handset: PTT click and squelch tail')
def marine_radio():
    ptt = one_hit('bank:1206', 0.15)
    sq = _squelch(0.32, 841, 0.25)
    hiss = bp(norm(_radio_hiss(0.4, 842), -6), 300, 3200)
    x = mix((ptt, 0.0, 0.8), (sq, 0.03, 1.0), (hiss * 0.2, 0.03, 1.0), length=0.6)
    x = telephone(x, 300, 3200, 1.6)
    return fade(fit(reverb(x, 'cabin', wet=0.1), 0.5), 0.001, 0.08)


@sfx('radio_static', 'oneshot', -6.0, 6.0, 'VHF radio: open channel static, fading, crackle, squelch')
def radio_static():
    n = 6.0
    r = rng(851)
    hiss = norm(_radio_hiss(n, 852), -6)
    crack = hp(_sb('fsd:102698', n, 853, (0.8, 1.6), 0.1), 300)
    gsm = bp(seg(src('fsd:161347'), 0.0, 2.6), 400, 3500)
    t = np.arange(secs(n)) / SR
    fadeing = 0.65 + 0.35 * np.sin(2 * np.pi * 0.37 * t) * np.sin(2 * np.pi * 0.13 * t + 1)
    x = mix((hiss * fadeing[:, None], 0, 1.0), (norm(crack, -12), 0, 0.6), (gsm, 2.1, 0.12), (_squelch(0.35, 854, 0.3), n - 0.4, 1.0),
            length=n)
    x = telephone(x, 300, 3400, 1.4)
    x = decorrelate(x, 5, 0.4)
    return fade(x, 0.02, 0.1)


# ============================================================================
# CINEMATIC: hits, whooshes, risers, stingers, sub drop
# ============================================================================
def _whoosh(seed, n, core_key, peak_at, body=0.5, sweep=(-0.6, 0.6)):
    c = src(core_key)
    core = norm(loudest(c, min(n * 0.9, len(c) / SR)), -3)
    core = fade(core, len(core) / SR * 0.35, len(core) / SR * 0.3)
    # put the loudest point of the core at `peak_at`
    m = np.abs(mono(core))
    pk = int(np.argmax(np.convolve(m, np.ones(secs(0.02)), 'same')))
    buf = zeros(n + 1.5)
    place(buf, core, peak_at - pk / SR, 1.0)
    low = lp(vari(core, 0.5), 500)
    place(buf, low, peak_at - 2 * pk / SR, body)
    air = hp(vari(core, 1.25), 3500)
    place(buf, air, peak_at - 0.8 * pk / SR, 0.35)
    # stereo sweep across the peak
    t = np.arange(len(buf)) / SR
    p = np.interp(t, [0, peak_at - 0.15, peak_at + 0.15, n], [sweep[0], sweep[0] * 0.7, sweep[1] * 0.7, sweep[1]])
    mm = mono(buf)
    a = (p + 1) * math.pi / 4
    buf = np.stack([mm * np.cos(a), mm * np.sin(a)], axis=1) * math.sqrt(2)
    x = reverb(buf, 'hall', wet=0.25, pre_ms=10)
    return fade(fit(x, n), 0.01, min(0.25, n * 0.3))


@sfx('whoosh_1', 'oneshot', -1.0, 0.7, 'fast transition whoosh (short)')
def whoosh_1():
    return _whoosh(901, 0.7, 'fsd:402203', 0.38, 0.5, (-0.7, 0.7))


@sfx('whoosh_2', 'oneshot', -1.0, 0.95, 'transition whoosh (medium), right to left')
def whoosh_2():
    return _whoosh(902, 0.95, 'fsd:402199', 0.52, 0.6, (0.7, -0.7))


@sfx('whoosh_3', 'oneshot', -1.0, 1.2, 'heavy cinematic whoosh (long)')
def whoosh_3():
    return _whoosh(903, 1.2, 'bank:1252', 0.66, 0.8, (-0.5, 0.6))


def _timp(key, semi=0.0, dur=None):
    x = norm(from_onset(src(key), -45, 0.002, dur), -3)
    return vari(x, semis(semi)) if semi else x


@sfx('title_hit', 'oneshot', -1.0, 5.75, 'title slam: timpani + gong + steel slam + boom, long metallic tail')
def title_hit():
    n = 5.75
    timp = _timp('fsd:373914', -3)
    gong = hp(vari(norm(from_onset(src('fsd:375531'), -45, 0.0), -3), 0.7), 50)
    slam = vari(from_onset(src('fsd:406197'), -35, 0.002, 2.5), 0.6)
    big = from_onset(src('fsd:430977'), -40, 0.0)
    boom = lp(vari(from_onset(src('fsd:147583'), -40, 0.0), 0.8), 200, 4)
    clang = vari(from_onset(src('fsd:209772'), -35, 0.002, 1.5), 0.7)
    x = mix((timp, 0, 1.0), (gong, 0.005, 0.5), (slam, 0.0, 0.8), (big, 0.0, 0.6), (boom, 0, 0.9), (mono(clang), 0.004, 0.35),
            length=n + 2)
    x = sat(x * 1.4, 1.3)
    x = reverb(x, 'hull', wet=0.4, lo_cut=50)
    x = peq(x, 900, 2, 0.8)
    return fade(fit(x, n), 0.002, 1.5)


@sfx('bass_hit', 'oneshot', -1.0, 2.0, 'short deep hit with a metallic edge')
def bass_hit():
    n = 2.0
    timp = _timp('fsd:373929', -4)
    thump = hits(src('fsd:400866'), -40, 0.3, 10, 1.2)[1]
    big = from_onset(src('bank:1837'), -40, 0.0)
    clang = hits(src('fsd:369924'), -40, 0.5, 10, 1.5)[0]
    x = mix((timp, 0, 1.0), (vari(thump, 0.8), 0.0, 0.8), (big, 0.0, 0.45), (vari(clang, 0.75), 0.003, 0.45), length=n + 1)
    x = sat(x * 1.3, 1.3)
    x = reverb(x, 'steel', wet=0.25, lo_cut=50)
    x = peq(x, 700, 2, 0.8)
    return fade(fit(x, n), 0.002, 0.7)


@sfx('boom_hit', 'oneshot', -1.0, 3.0, 'reveal hit: gong + timpani + steel + boom')
def boom_hit():
    n = 3.0
    gong = hp(vari(norm(from_onset(src('fsd:375530'), -45, 0.0), -3), 0.6), 45)
    timp = _timp('fsd:373919', -5)
    big = from_onset(src('fsd:430977'), -40, 0.0)
    boom = lp(vari(from_onset(src('fsd:147583'), -40, 0.0), 0.75), 220, 4)
    clang = vari(from_onset(src('fsd:209772'), -35, 0.002, 1.5), 0.62)
    x = mix((timp, 0, 1.0), (gong, 0.0, 0.55), (big, 0.0, 0.7), (boom, 0.0, 1.0), (mono(clang), 0.003, 0.45), length=n + 2)
    x = sat(x * 1.4, 1.3)
    x = reverb(x, 'hall', wet=0.35, lo_cut=45)
    x = peq(x, 1100, 2, 0.8)
    return fade(fit(x, n), 0.002, 1.0)


@sfx('stinger', 'oneshot', -1.0, 2.5, 'horror string stinger: tremolo cluster sfz + timpani + gong')
def stinger():
    n = 2.5

    def trem(key, semi):
        x = norm(seg(src(key), 0.0, 3.0), -3)
        return vari(x, semis(semi)) if semi else x

    hi1 = trem('fsd:374606', 0)       # violins E
    hi2 = trem('fsd:374609', -1)      # violins F (minor second above E)
    hi3 = trem('fsd:374600', 1)       # violins A# (tritone)
    lo1 = trem('fsd:372860', 0)       # cellos E
    lo2 = trem('fsd:372849', 0)       # cellos F
    strings = mix((hi1, 0, 0.8), (hi2, 0, 0.75), (hi3, 0, 0.5), (lo1, 0, 0.9), (lo2, 0, 0.7), length=3.0)
    strings = env(strings, [(0, 0.0), (0.012, 1.0), (0.25, 0.75), (1.2, 0.5), (2.4, 0.15), (3.0, 0.0)])
    timp = _timp('fsd:373910', -2)
    gong = hp(vari(norm(seg(src('fsd:375550'), 0, 4), -3), 0.7), 80)
    hit = vari(from_onset(src('fsd:406197'), -35, 0.002, 1.5), 0.7)
    x = mix((decorrelate(strings, 9, 0.7), 0, 1.0), (timp, 0, 0.8), (gong, 0.0, 0.35), (hit, 0, 0.35), length=n + 2)
    x = reverb(x, 'hall', wet=0.45)
    return fade(fit(x, n), 0.002, 0.8)


def _rev_cymbal(dur):
    c = norm(from_onset(src('fsd:375514'), -45, 0.0), -3)
    c2 = norm(from_onset(src('fsd:375511'), -45, 0.0), -3)
    r = reverse(mix((c, 0, 1.0), (c2, 0, 0.6)))
    r = reverb(r, 'hall', wet=0.4)
    return r[-secs(dur):]


@sfx('riser_short', 'oneshot', -1.0, 2.0, 'short riser that slams shut on the hit point (end of file)')
def riser_short():
    n = 2.0
    cym = _rev_cymbal(n)
    gong = reverse(norm(from_onset(src('fsd:375537'), -45, 0.0, 6), -3))
    gong = hp(vari(gong, 0.8), 60)[-secs(n):]
    tr = norm(seg(src('fsd:374606'), 0.2, 5.0), -3)
    tr = vari_curve(tr, [(0, 0.82), (n, 1.18)], out_len=n)
    tr = env(tr, [(0, 0.0), (n * 0.5, 0.35), (n, 1.0)])
    x = mix((decorrelate(cym, 7), 0, 1.0), (width(gong, 1.2), 0, 0.5), (decorrelate(tr, 11), 0, 0.5), length=n)
    x = env(x, [(0, 0.2), (n * 0.6, 0.55), (n, 1.0)])
    x[-secs(0.004):] *= np.linspace(1, 0, secs(0.004))[:, None]
    return fade(x, 0.05, 0.0)


@sfx('riser_long', 'oneshot', -1.0, 5.0, 'long tension riser (strings + timpani roll + reversed cymbal), hard stop at the end')
def riser_long():
    n = 5.0
    roll = norm(seg(src('fsd:373939'), 0.5, 10.0), -3)
    roll = vari_curve(roll, [(0, 0.9), (n, 1.08)], out_len=n)
    roll = env(roll, [(0, 0.1), (3, 0.45), (n, 1.0)])
    vln = norm(seg(src('fsd:374600'), 0.3, 9.0), -3)
    vln = vari_curve(vln, [(0, 0.8), (n, 1.3)], out_len=n)
    vln = env(vln, [(0, 0.0), (1.5, 0.25), (n, 1.0)])
    cel = norm(seg(src('fsd:372860'), 0.3, 8.0), -3)
    cel = vari_curve(cel, [(0, 0.95), (n, 1.12)], out_len=n)
    cel = env(cel, [(0, 0.2), (n, 0.9)])
    cym = _rev_cymbal(2.6)
    wnd = hp(_sb('fsd:78430', n, 911), 800)
    wnd = env(wnd, [(0, 0.0), (2, 0.1), (n, 0.6)])
    x = mix((decorrelate(roll, 9), 0, 0.9), (decorrelate(vln, 7, seed=2), 0, 0.6), (decorrelate(cel, 11, seed=3), 0, 0.6),
            (decorrelate(cym, 5), n - 2.6, 0.9), (wnd, 0, 0.35), length=n)
    x = reverb(x, 'hall', wet=0.3)
    x[-secs(0.004):] *= np.linspace(1, 0, secs(0.004))[:, None]
    return fade(x, 0.1, 0.0)


@sfx('sub_drop', 'oneshot', -1.0, 2.0, 'sub drop: falling sine sweep + real boom + low gong')
def sub_drop():
    n = 2.0
    t = np.arange(secs(n)) / SR
    f = 30 + 55 * np.exp(-t / 0.45)
    ph = 2 * np.pi * np.cumsum(f) / SR
    sweep = np.sin(ph) * np.exp(-t / 0.9) * np.minimum(1, t / 0.005)
    sweep = sat(st(sweep), 1.5)  # a little harmonic content so small speakers hear the drop
    boom = vari(from_onset(src('bank:1837'), -40, 0.0), 0.85)
    gong = hp(vari(norm(from_onset(src('fsd:375537'), -45, 0.0, 4), -3), 0.5), 60)
    rumble = hp(lp(vari(from_onset(src('bank:1744'), -40, 0.0), 0.9), 900), 120)
    x = mix((sweep, 0, 0.8), (boom, 0, 0.8), (width(gong, 1.2), 0, 0.55), (rumble, 0.0, 0.5), length=n + 1)
    x = reverb(x, 'hall', wet=0.2, lo_cut=40)
    return fade(fit(x, n), 0.002, 0.5)


# ============================================================================
# SCORE: tension_pulse (real VSCO-2 orchestra samples, 72 bpm, 18 bars = 60 s)
# ============================================================================
@sfx('tension_pulse', 'bed', -26.0, 60.0, 'dark pulsing string ostinato bed (E phrygian), loops every 60 s')
def tension_pulse():
    T = 60.0
    beat = 60.0 / 72
    bar = beat * 4
    r = rng(1201)
    # harmony per bar (semitones relative to E2)
    roots = [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, -4, -4, -2, -2, 0, 0]
    buf_sp = zeros(T + 8)   # spiccato pulse
    buf_hi = zeros(T + 8)   # upper octave pulse
    buf_dr = zeros(T + 8)   # sustained drone
    buf_pc = zeros(T + 8)   # percussion
    buf_tr = zeros(T + 8)   # high tremolo
    sp_lo = [norm(from_onset(src(k), -45, 0.002), -3) for k in ('fsd:372769', 'fsd:372782', 'fsd:372808')]
    sp_hi = [norm(from_onset(src(k), -45, 0.002), -3) for k in ('fsd:372770', 'fsd:372796', 'fsd:372783')]
    accents = [1.0, 0.42, 0.5, 0.9, 0.42, 0.5, 0.85, 0.55]  # 3+3+2 grouping
    for b, root in enumerate(roots):
        for i in range(8):
            t = b * bar + i * beat / 2 + float(r.normal(0, 0.006))
            v = accents[i] * db(float(r.uniform(-1.5, 1.0)))
            s = sp_lo[(b * 8 + i) % 3]
            s = vari(s, semis(root)) if root else s
            s = fit(s, 0.9) if i % 8 != 7 else s
            place(buf_sp, pan(fade(s, 0.0, 0.08), float(r.uniform(-0.15, 0.15))), t, v)
            if b >= 8 and i in (0, 3, 6):
                h = sp_hi[(b + i) % 3]
                h = vari(h, semis(root)) if root else h
                place(buf_hi, pan(fade(fit(h, 0.6), 0, 0.08), float(r.uniform(0.2, 0.5))), t + 0.004, v * 0.5)
    # sustained low strings following the harmony (with a sub octave for weight)
    sections = [(0, 4, 0), (4, 8, 1), (8, 12, 0), (12, 14, -4), (14, 16, -2), (16, 18, 0)]
    sus = [seg(src(k), 1.2, 7.8) for k in ('fsd:372821', 'fsd:372822')]
    for j, (a, b, root) in enumerate(sections):
        d = (b - a) * bar + 1.2
        s = L.extend_aligned(sus[j % 2], d / semis(root) + 0.5, 0.6, 1.5, 1300 + j)
        s = vari(s, semis(root))[: secs(d)]
        s = fade(s, 0.6, 0.9)
        sub = lp(vari(s, 0.5)[: secs(d)], 220, 4)
        place(buf_dr, decorrelate(s, 12, seed=j), a * bar - 0.3, 0.55)
        place(buf_dr, decorrelate(sub, 9, seed=j + 7), a * bar - 0.3, 0.35)
    # timpani: soft hit every two bars, tuned to the root; a roll into the loop point
    timp = norm(from_onset(src('fsd:373914'), -45, 0.002), -3)
    for b in range(0, 18, 2):
        root = roots[b]
        place(buf_pc, pan(vari(timp, semis(root - 1)), -0.2), b * bar, 0.5 if b % 8 else 0.75)
    roll = norm(seg(src('fsd:373945'), 0.5, 2 * bar + 1), -3)
    roll = vari(roll, semis(-11 + 12 - 2))  # C#3 roll down to ~D
    roll = env(roll[: secs(2 * bar)], [(0, 0.05), (2 * bar - 0.3, 0.6), (2 * bar, 0.0)])
    place(buf_pc, decorrelate(roll, 8), 16 * bar, 0.6)
    gong = hp(vari(norm(src('fsd:375545'), -3), 0.7), 60)
    place(buf_pc, width(st(gong), 1.3), 0.0, 0.35)
    place(buf_pc, width(st(gong), 1.3), 8 * bar, 0.3)
    # high violin tremolo: E5 then F5, slow swells (tension, not melody)
    trE = shuffle_bed(seg(src('fsd:374606'), 0.4, 7.5), 4 * bar + 1.5, (2.0, 3.0), 1.0, 1401)
    trF = vari(shuffle_bed(seg(src('fsd:374609'), 0.4, 8.5), 6 * bar / semis(-1) + 2.0, (2.0, 3.0), 1.0, 1402), semis(-1))
    trE = env(trE, [(0, 0), (2 * bar, 0.6), (4 * bar, 0.8), (4 * bar + 1.5, 0)])
    trF = env(trF, [(0, 0), (1.0, 0.7), (4 * bar, 0.9), (6 * bar, 0.5), (6 * bar + 1.5, 0.0)])
    place(buf_tr, decorrelate(trE, 10, seed=4), 8 * bar, 0.16)
    place(buf_tr, decorrelate(trF, 10, seed=5), 12 * bar, 0.14)
    x = mix((reverb(buf_sp, 'hall', wet=0.3, lo_cut=40), 0, 1.0),
            (reverb(buf_hi, 'hall', wet=0.4), 0, 0.6),
            (reverb(buf_dr, 'hall', wet=0.45, lo_cut=30), 0, 0.8),
            (reverb(buf_pc, 'hall', wet=0.4, lo_cut=30), 0, 0.8),
            (reverb(buf_tr, 'hall', wet=0.55), 0, 1.0), length=T + 8)
    x = lp(x, 9000)
    return fold_loop(x, T)


# ============================================================================
# BREATHS (layered before some voice lines by the timeline)
# ============================================================================
def _breath(key, dur, semi=0.0, mode='onset', t0=0.0, gain_lp=None):
    x = src(key)
    if mode == 'loudest':
        x = loudest(seg(x, t0), dur / semis(semi) if semi else dur)
    else:
        x = from_onset(seg(x, t0), -50, 0.02)
    if semi:
        x = vari(x, semis(semi))
    x = hp(x, 110)
    x = reverb(mono(x), 'cabin', wet=0.08)
    return fade(fit(x, dur), 0.02, min(0.2, dur / 3))


@sfx('breath_sharp_inhale_m', 'oneshot', -9.0, 0.32)
def breath_sharp_inhale_m():
    return _breath('fsd:344415', 0.32)


@sfx('breath_sharp_inhale_f', 'oneshot', -9.0, 0.32)
def breath_sharp_inhale_f():
    return _breath('fsd:318078', 0.32)


@sfx('breath_shaky_inhale_m', 'oneshot', -9.0, 0.9)
def breath_shaky_inhale_m():
    return _breath('fsd:318077', 0.9)


@sfx('breath_shaky_inhale_f', 'oneshot', -9.0, 0.9)
def breath_shaky_inhale_f():
    return _breath('fsd:318078', 0.9)


@sfx('breath_exhale_m', 'oneshot', -9.0, 0.85)
def breath_exhale_m():
    return _breath('fsd:398944', 0.85, 0, 'loudest')


@sfx('breath_exhale_f', 'oneshot', -9.0, 0.85)
def breath_exhale_f():
    return _breath('fsd:427722', 0.85, 0, 'loudest')


@sfx('breath_fast_m', 'oneshot', -9.0, 1.6)
def breath_fast_m():
    return _breath('fsd:434548', 1.6, 0, 'loudest', 0.8)


@sfx('breath_fast_f', 'oneshot', -9.0, 1.6)
def breath_fast_f():
    return _breath('fsd:434548', 1.6, 3.5, 'loudest', 3.0)


@sfx('breath_ragged_m', 'oneshot', -9.0, 2.2)
def breath_ragged_m():
    return _breath('fsd:386573', 2.2, 0, 'loudest')


@sfx('breath_ragged_f', 'oneshot', -9.0, 2.2)
def breath_ragged_f():
    return _breath('fsd:319019', 2.2, 0, 'loudest')


@sfx('breath_crying_m', 'oneshot', -9.0, 1.8)
def breath_crying_m():
    return _breath('fsd:157163', 1.8, 0, 'loudest')


@sfx('breath_crying_f', 'oneshot', -9.0, 1.8)
def breath_crying_f():
    return _breath('fsd:319019', 1.8, 0, 'loudest', 1.6)


# ============================================================================
# FRAME 240: Mara's apartment at night (rain, a computer fan, pencil scratches)
# Everything below is placed in a real bedroom-sized room (hand claps recorded in a bedroom /
# landing / shrunk for the closet, CC0 toiletrolltube); see sfxlib.room().
# ============================================================================
APT = 'bedroom'


def _lv(x, lufs_target: float) -> np.ndarray:
    """Level-match a layer by loudness (not peak) so transient-heavy and steady sources mix predictably."""
    return L.norm_lufs(x, lufs_target)


def _grab(key, dur, ratio, r, t0=0.0, t1=None, look=2.5):
    """A `dur`-second piece of a continuous texture recording (writing, scraping, tape), taken from
    the loudest part of a random `look`-second window and slowed by `ratio` (<1 = lower, slower)."""
    x = seg(src(key), t0, t1)
    total = len(x) / SR
    need = dur * ratio
    w = min(total, max(look, need * 1.5))
    a = float(r.uniform(0, max(0.0, total - w)))
    k = loudest(seg(x, a, a + w), need)
    if abs(ratio - 1) > 1e-3:
        k = vari(k, ratio)
    return fit(k, dur)


def _pressure(x, r, rate=8.0, depth=0.55):
    """Irregular hand pressure (stick-slip) on a stroke: a smooth random gain curve."""
    x = st(x)
    n = len(x)
    k = max(3, int(n / SR * rate) + 2)
    pts = 1.0 - depth * r.random(k) ** 1.5
    g = np.interp(np.arange(n), np.linspace(0, n - 1, k), pts)
    w = np.hanning(secs(0.02))
    g = np.convolve(g, w / w.sum(), mode='same')
    return x * g[:, None]


def _stroke(keys_gains, dur, ratio, r, fin=0.15, fout=0.25, hp_f=250.0):
    """One continuous drag: several recordings of the same gesture layered (each from its own random
    region), with irregular pressure and a swell in / tail off."""
    k = zeros(dur)
    for key, g in keys_gains:
        k = k + _lv(hp(_grab(key, dur, ratio, r), hp_f, 2), -24) * g
    k = _pressure(k, r)
    return env(k, [(0, 0.0), (dur * fin, 1.0), (dur * 0.6, 0.85), (dur * (1 - fout), 0.7), (dur, 0.0)])


def _hit_of(key, i, thr=-50.0, gap=0.1, max_len=1.5):
    hs = hits(src(key), thr, gap, 9, max_len)
    return hs[min(i, len(hs) - 1)]


# ---------------------------------------------------------------- beds
@sfx('computer_fan', 'bed', -36.0, 30.0, "Mara's desktop PC: fan whir + faint drive hum, close, in a small room")
def computer_fan():
    T = 30.0
    # the same tower fan in two different loop orders = a natural, uncorrelated stereo pair
    front = _stereo_pair(_la('fsd:329546', T, 2401, 0.5, 1.5), _la('fsd:329546', T, 2402, 0.5, 1.5))   # CC0
    case = circ(_la('fsd:378070', T, 2403, 0.5, 1.5, 1.0, 11.0), lambda z: decorrelate(z, 9), 0.5)  # CPU fan + HDD (CC-BY), its steady part
    x = mix((_lv(front, -30), 0, 1.0), (_lv(case, -30), 0, 0.6), length=T)
    # tame the sub rumble so the whir (not the floor) carries on small speakers
    x = circ(x, lambda z: lshelf(hp(z, 45, 2), 140, -4.0), 1.0)
    return circ(x, lambda z: reverb(lp(z, 9000), APT, wet=0.15), 2.0)


@sfx('rain_window', 'bed', -32.0, 30.0, 'steady rain on the window, heard from inside the apartment')
def rain_window():
    T, XF = 30.0, 3.0
    n = T + XF
    a = _sb('fsd:402549', n, 2411, (5, 9))   # light rain against closed windows, indoors (CC0)
    b = _sb('fsd:202636', n, 2412, (5, 9))   # rain against a window pane, interior (CC0)
    c = _sb('fsd:236292', n, 2413, (5, 9))   # rain on a window: drops on the glass (CC0)
    x = mix((_stereo_pair(_lv(a, -30), _lv(b, -30)), 0, 1.0), (decorrelate(_lv(c, -30), 9), 0, 0.45), length=n)
    x = lp(hp(x, 70), 8500)
    x = reverb(x, APT, wet=0.12)
    return loop(x, T, XF)


@sfx('apartment_tone', 'bed', -40.0, 30.0, 'quiet apartment at night: fridge from the kitchen, building air, far traffic')
def apartment_tone():
    T, XF = 30.0, 3.0
    n = T + XF
    fridge = _stereo_pair(_la('fsd:200979', T, 2421), _la('fsd:200979', T, 2422))   # fridge hum (CC0)
    fridge = circ(fridge, lambda z: reverb(lp(z, 900), 'landing', wet=0.7, dry=0.4), 2.0)  # from the kitchen
    fridge2 = circ(_la('fsd:413566', T, 2423), lambda z: decorrelate(lp(z, 500), 13), 1.0)  # second appliance (CC0)
    city = lp(hp(_sb('fsd:166171', n, 2424, (2.0, 3.5), 1.0), 50), 380)    # night traffic far away, through glass (CC0)
    air = _stereo_pair(_sb('fsd:330265', n, 2425, (5, 9)), _sb('fsd:330265', n, 2426, (5, 9)))  # building air hush (CC0)
    air = lp(hp(air, 60), 1200)
    noisy = loop(mix((decorrelate(_lv(city, -30), 15), 0, 0.5), (_lv(air, -30), 0, 0.35), length=n), T, XF)
    x = mix((_lv(fridge, -30), 0, 1.0), (_lv(fridge2, -30), 0, 0.35), (noisy, 0, 1.0), length=T)
    return circ(x, lambda z: reverb(z, APT, wet=0.2), 2.0)


@sfx('closet_tone', 'bed', -45.0, 30.0, 'tiny storage closet: almost silent, close, dead air; the flat faintly through the door')
def closet_tone():
    T, XF = 30.0, 3.0
    n = T + XF
    still = _stereo_pair(_sb('fsd:151845', n, 2431, (1.6, 3.0), 0.8), _sb('fsd:151845', n, 2434, (1.6, 3.0), 0.8))  # near-silent air (CC0)
    hush = lp(_sb('fsd:330265', n, 2432, (5, 9)), 420)                    # the flat's air through the door (CC0)
    x = mix((_lv(still, -30), 0, 1.0), (decorrelate(_lv(hush, -30), 11), 0, 0.3), length=n)
    x = loop(x, T, XF)
    fridge = circ(_la('fsd:200979', T, 2433), lambda z: decorrelate(lp(z, 220, 4), 12), 1.0)  # through two walls
    x = x + _lv(fridge, -30) * 0.25
    return circ(x, lambda z: reverb(hp(z, 30), 'closet', wet=0.5), 2.0)


@sfx('light_buzz_bed', 'bed', -38.0, 30.0, 'faint electrical buzz of a ceiling light (real 50 Hz mains buzz recordings)')
def light_buzz_bed():
    T = 30.0
    e1 = _la('fsd:341609', T, 2441, 0.4, 1.2)   # "Electricity 1" (CC0): mains buzz, 50 Hz odd harmonics + sizzle
    e4 = _la('fsd:341612', T, 2442, 0.3, 0.8)   # "Electricity 4" (CC0)
    x = _stereo_pair(_lv(e1, -30), _lv(e4, -30), 0.8)
    x = circ(x, lambda z: hshelf(lp(hp(z, 45), 9000), 5000, -6.0), 1.0)
    return circ(x, lambda z: reverb(z, APT, wet=0.3, pre_ms=4), 2.0)  # a fitting overhead, in the room


# ---------------------------------------------------------------- computer
def _mouse_click_dry():
    # field recording of a real mouse (CC0, Soundscape_Leuphana): press at 1.73 s, release ~150 ms later
    x = seg(src('bank:1225'), 1.725, 2.04)
    x = mix((x, 0, 1.0), (lp(x, 1800), 0, 0.35))  # a little desk body under the plastic
    return fade(x, 0.002, 0.04)


@sfx('mouse_click', 'oneshot', -6.0, 0.32, 'single crisp computer mouse click (press + release)')
def mouse_click():
    return fade(fit(reverb(_mouse_click_dry(), APT, wet=0.05), 0.32), 0.001, 0.03)


@sfx('mouse_click_far', 'oneshot', -20.0, 0.8, 'the same mouse click heard from another room: muffled, roomy, quiet')
def mouse_click_far():
    x = lp(lp(_mouse_click_dry(), 1700, 2), 2600, 2)
    x = peq(x, 450, 3, 1.0)
    x = reverb(x, 'landing', wet=1.0, dry=0.35, pre_ms=6, tail=0.6)
    return fade(fit(balance(width(x, 0.6), 0.25), 0.8), 0.002, 0.25)


@sfx('key_tap', 'oneshot', -8.0, 0.25, 'single keyboard key press + release')
def key_tap():
    x = from_onset(src('bank:1224'), -45, 0.002)
    return fade(fit(reverb(x, APT, wet=0.05, tail=0.1), 0.25), 0.001, 0.04)


@sfx('spacebar', 'oneshot', -6.0, 0.45, 'space bar press: heavier thunk + stabiliser rattle')
def spacebar():
    x = seg(src('bank:1223'), 0.36, 0.8)                      # spacebar hit (CC0)
    body = lp(from_onset(src('bank:1221'), -45, 0.002), 400)   # second spacebar: the low thunk only
    x = hp(mix((x, 0, 1.0), (body, 0.003, 0.25)), 70, 2)
    return fade(fit(reverb(x, APT, wet=0.05, tail=0.1), 0.45), 0.001, 0.06)


@sfx('stylus_tap', 'oneshot', -10.0, 0.25, 'plastic stylus tip tapping a pen tablet')
def stylus_tap():
    x = from_onset(src('fsd:217389'), -45, 0.002)   # tapping plastic (CC0)
    x = peq(hp(x, 250), 3500, 3, 1.2)               # small hard tip
    return fade(fit(reverb(x, APT, wet=0.04, tail=0.1), 0.25), 0.001, 0.05)


@sfx('pen_draw', 'oneshot', -1.0, 2.5, 'stylus dragged on a pen tablet: soft scratchy drawing strokes')
def pen_draw():
    r = rng(2501)
    n = 2.5
    buf = zeros(n + 0.5)
    for t, d, p in [(0.0, 0.62, -0.1), (0.7, 0.48, 0.05), (1.25, 0.85, -0.05), (2.15, 0.33, 0.1)]:
        k = _stroke([('fsd:321135', 1.0), ('fsd:321138', 0.6), ('fsd:387927', 0.35)], d, 1.0, r, 0.12, 0.2, 300)
        place(buf, pan(k, p), t, db(float(r.uniform(-2, 0))))
    x = lp(buf, 7000, 2)           # smooth plastic surface, softer than paper
    x = peq(x, 1600, 2, 0.9)
    x = reverb(x, APT, wet=0.06)
    return fade(fit(x, n), 0.005, 0.15)


@sfx('ui_error', 'oneshot', -10.0, 0.5, 'small soft UI error blip from the laptop speakers')
def ui_error():
    x = from_onset(src('bank:1181'), -45, 0.002)   # soft "deny" blip (CC0, GameAudio)
    x = telephone_small(x)
    return fade(fit(reverb(x, APT, wet=0.08, tail=0.15), 0.5), 0.002, 0.1)


# ---------------------------------------------------------------- pencil in the walls
def _pencil_wall(seed: int, n: float = 3.0) -> np.ndarray:
    """A slow pencil dragged across a hard wall: three strokes, each continuous graphite shading +
    close pencil detail + chalk-on-board grit, slowed (heavier, slower hand) with irregular pressure."""
    r = rng(seed)
    buf = zeros(n + 1)
    for t, d, p in [(0.0, 1.05, -0.12), (1.02, 0.8, 0.08), (1.78, 1.15, -0.04)]:
        ratio = float(r.uniform(0.72, 0.84))
        k = _stroke([('fsd:387926', 1.0), ('fsd:387927', 0.7), ('fsd:376706', 0.45), ('fsd:398490', 0.3)], d, ratio, r, 0.18, 0.3)
        place(buf, pan(k, p), t, db(float(r.uniform(-1.5, 0))))
    x = hp(buf, 220, 2)
    x = peq(x, 1100, 3.0, 1.0)    # the hollow body of the wall
    x = peq(x, 4200, 2.0, 0.8)    # graphite bite
    return x


@sfx('pencil_scratch', 'oneshot', -1.0, 3.0, 'slow pencil dragged across a hard wall: dry, close, creepy')
def pencil_scratch():
    x = reverb(_pencil_wall(2601), 'closet', wet=0.12)   # dry: only the nearest surfaces
    return fade(fit(x, 3.0), 0.01, 0.3)


@sfx('pencil_scratch_far', 'oneshot', -1.0, 3.0, 'the pencil scratch heard through a closet door: muffled, low-passed, quieter')
def pencil_scratch_far():
    x = _pencil_wall(2601)
    x = lp(lp(x, 1300, 2), 2400, 2)   # the door eats the graphite
    x = peq(x, 260, 3.0, 1.0)         # door panel resonance
    x = reverb(x, APT, wet=0.6, dry=0.6, pre_ms=5)
    return fade(fit(width(x, 0.5), 3.0), 0.02, 0.4)


@sfx('scratch_dry', 'oneshot', -1.0, 0.6, 'one single short dry pencil scratch (cut to black)')
def scratch_dry():
    r = rng(2611)
    k = _stroke([('fsd:278159', 1.0), ('fsd:387927', 0.6), ('fsd:43674', 0.5)], 0.5, 0.85, r, 0.04, 0.45)
    x = peq(peq(hp(k, 220, 2), 1100, 2.5, 1.0), 4200, 2.0, 0.8)
    x = reverb(x, 'closet', wet=0.1, tail=0.1)
    return fade(fit(x, 0.6), 0.003, 0.08)


@sfx('scrape_long', 'oneshot', -1.0, 2.5, 'a long scrape across a wall')
def scrape_long():
    r = rng(2621)
    n = 2.5
    rock = vari(src('fsd:390858'), 0.7)                     # rock scraping (CC0), slowed: heavier
    wood = _grab('fsd:104008', 1.3, 0.8, r)                 # wood scraping, close (CC0)
    fric = vari(from_onset(src('bank:1431'), -45, 0.0), 0.75)  # rock movement friction (CC0)
    grit = _stroke([('fsd:387926', 1.0), ('fsd:376706', 0.5)], 2.2, 0.8, r, 0.2, 0.3)
    x = mix((_lv(rock, -24), 0.0, 1.0), (_lv(wood, -24), 0.35, 0.7), (_lv(fric, -24), 1.1, 0.6), (grit, 0.1, 0.35), length=n + 1)
    x = _pressure(x, r, 5.0, 0.35)
    x = peq(hp(x, 110, 2), 650, 2.0, 0.9)
    x = reverb(x, APT, wet=0.15)
    return fade(fit(x, n), 0.12, 0.45)


# ---------------------------------------------------------------- desk / room foley
@sfx('chair_creak', 'oneshot', -1.0, 1.3, 'office chair creak / swivel')
def chair_creak():
    a = lp(from_onset(src('bank:887'), -45, 0.003), 6000)            # hydraulic office chair moving (CC0)
    b = vari(from_onset(src('fsd:117289'), -45, 0.003), 0.92)       # chair squeak (CC0)
    c = loudest(src('fsd:371023'), 0.7)                             # squeaking chair (CC0): the creak
    x = mix((_lv(a, -24), 0, 1.0), (_lv(b, -24), 0.22, 0.5), (fade(_lv(c, -24), 0.08, 0.25), 0.05, 0.7), length=1.6)
    x = reverb(hp(x, 70), APT, wet=0.12)
    return fade(fit(x, 1.3), 0.004, 0.3)


@sfx('mug_set', 'oneshot', -1.0, 0.9, 'ceramic mug set down on a desk')
def mug_set():
    x = from_onset(src('fsd:272022'), -45, 0.003)   # cup set down (CC0)
    x = mix((x, 0, 1.0), (lp(x, 300), 0, 0.4))       # the desk under it
    return fade(fit(reverb(x, APT, wet=0.1, tail=0.3), 0.9), 0.002, 0.2)


@sfx('keys_grab', 'oneshot', -1.0, 1.1, 'a ring of keys snatched off a desk')
def keys_grab():
    a = from_onset(src('bank:941'), -45, 0.003)                  # keys pickup (CC0)
    b = from_onset(src('fsd:411179'), -45, 0.003)                # pick up key (CC0)
    c = from_onset(src('fsd:156186'), -45, 0.003)                # keys, single jingle (CC0)
    x = mix((a, 0.0, 1.0), (b, 0.0, 0.5), (c, 0.28, 0.35), length=1.4)
    x = peq(lp(x, 14000), 3000, 3.0, 0.9)   # less fizz, more metal
    return fade(fit(reverb(x, APT, wet=0.1), 1.1), 0.002, 0.25)


@sfx('footsteps_carpet', 'oneshot', -1.0, 3.0, 'slow, soft footsteps on carpet indoors')
def footsteps_carpet():
    r = rng(2701)
    n = 3.0
    body = hits(src('fsd:371017'), -50, 0.25, 9, 1.1)            # footsteps on carpet (CC0)
    scuff = [h for h in hits(src('fsd:271925'), -40, 0.25, 9, 0.6)]  # carpet, sneakers (CC0)
    buf = zeros(n + 1.5)
    for i, t in enumerate([0.02, 0.84, 1.62, 2.42]):
        b = body[i % len(body)]
        s = bp(scuff[int(r.integers(0, len(scuff)))], 250, 3500)
        p = (-0.1 if i % 2 else 0.1)
        g = db(float(r.uniform(-1.5, 0)))
        place(buf, pan(_lv(b, -24), p), t, g)
        place(buf, pan(_lv(s, -24), p), t + 0.01, g * 0.4)
    x = peq(hp(buf, 45), 380, 3.0, 1.0)   # heel weight that small speakers can still hear
    x = reverb(x, APT, wet=0.12)
    return fade(fit(x, n), 0.004, 0.35)


@sfx('running_carpet', 'oneshot', -1.0, 2.0, 'running on carpet indoors')
def running_carpet():
    r = rng(2711)
    n = 2.0
    heavy = [h for h in hits(src('fsd:140219'), -40, 0.15, 9, 0.5) if L.energy_above(h, 150) > 30]   # running on carpet (CC-BY)
    soft = hits(src('fsd:272539'), -40, 0.15, 9, 0.35)                                                 # socks running (CC0)
    buf = zeros(n + 1)
    t, i = 0.02, 0
    while t < n - 0.1:
        p = (-0.12 if i % 2 else 0.12) + float(r.uniform(-0.05, 0.05))
        g = db(float(r.uniform(-2.0, 0)) + (0 if i % 2 else -1.0))
        place(buf, pan(_lv(heavy[int(r.integers(0, len(heavy)))], -24), p), t, g)
        place(buf, pan(lp(_lv(soft[int(r.integers(0, len(soft)))], -24), 2500), p), t + 0.006, g * 0.6)
        t += 0.29 + float(r.uniform(-0.025, 0.025))
        i += 1
    x = peq(hp(buf, 45), 420, 2.5, 1.0)
    x = reverb(x, APT, wet=0.12)
    return fade(fit(x, n), 0.004, 0.25)


@sfx('flashlight_on', 'oneshot', -8.0, 0.35, 'phone flashlight switched on: small tap/click')
def flashlight_on():
    tap = lp(from_onset(src('fsd:217389'), -45, 0.002), 2800)                  # finger on the phone (CC0)
    click = _hit_of('bank:1205', 0)                                             # small flashlight button (CC0)
    x = mix((tap, 0, 0.6), (lp(click, 12000), 0.012, 0.9), length=0.45)
    return fade(fit(reverb(x, APT, wet=0.06), 0.35), 0.001, 0.08)


@sfx('cloth_rustle', 'oneshot', -1.0, 1.15, 'clothing rustle as someone turns')
def cloth_rustle():
    a = from_onset(src('bank:1681'), -50, 0.01)     # clothes rustling movement (CC0)
    b = from_onset(src('bank:1230'), -50, 0.01)     # jacket rustle (CC0)
    x = mix((a, 0, 1.0), (b, 0.12, 0.6), length=1.4)
    x = lp(hp(x, 90), 9500)
    return fade(fit(reverb(x, APT, wet=0.1), 1.15), 0.01, 0.25)


@sfx('door_tap', 'oneshot', -1.0, 0.7, 'one gentle knuckle tap on a wooden interior door')
def door_tap():
    k = _hit_of('fsd:349287', 2)                  # knocking on a wooden door (CC0, Adam_N)
    w = _hit_of('fsd:103998', 1)                  # wood knock: brighter grain (CC0)
    x = mix((k, 0, 1.0), (hp(w, 600), 0.002, 0.25), length=0.9)
    return fade(fit(reverb(x, APT, wet=0.15, tail=0.3), 0.7), 0.001, 0.2)


@sfx('door_touch', 'oneshot', -1.0, 0.8, 'a very soft touch / press on a door, barely there')
def door_touch():
    hand = hp(_hit_of('fsd:430599', 3), 200, 2)          # a hand placed on a wall (CC0): skin on the surface
    panel = bp(_hit_of('fsd:144943', 0), 70, 380)          # the door panel giving a little (CC0 knock, low only)
    x = mix((_lv(hand, -24), 0.0, 1.0), (_lv(panel, -24), 0.01, 0.3), length=1.0)
    x = lp(x, 6000)
    return fade(fit(reverb(x, APT, wet=0.12), 0.8), 0.004, 0.25)


@sfx('paper_drag', 'oneshot', -1.0, 2.0, 'a finger dragged slowly over paper')
def paper_drag():
    r = rng(2801)
    n = 2.0
    a = stretch(from_onset(src('fsd:82383'), -45, 0.0), 3.4, grain=0.09, seed=2802)   # paper scrape (CC0), slowed
    b = vari(from_onset(src('bank:1871'), -45, 0.0), 0.6)                              # scratching paper (CC0), slower/lower
    x = mix((_lv(a, -24), 0.0, 1.0), (_lv(b, -24), 0.15, 0.45), length=n + 0.5)
    x = _pressure(x, r, 6.0, 0.4)
    x = env(x, [(0, 0.0), (0.35, 0.9), (1.2, 1.0), (1.75, 0.6), (n, 0.0)])
    x = lp(hp(x, 300), 9000)
    return fade(fit(reverb(x, APT, wet=0.08), n), 0.02, 0.2)


@sfx('paper_stretch', 'oneshot', -1.0, 2.0, 'paper stretched and strained slowly, as if something pushes through it')
def paper_stretch():
    r = rng(2811)
    n = 2.0
    crum = _grab('fsd:272015', 2.2, 0.75, r)                          # crumpling paper (CC0), slowed
    strain = vari(from_onset(src('bank:1684'), -45, 0.0), 0.6)        # stretch (CC0)
    pull = lp(from_onset(src('bank:1688'), -45, 0.0), 900)            # paper towel pulled: dull body (CC0)
    x = mix((_lv(crum, -24), 0.0, 1.0), (_lv(strain, -24), 0.35, 0.7), (_lv(pull, -24), 0.9, 0.5), length=n + 0.5)
    x = _pressure(x, r, 7.0, 0.5)
    x = env(x, [(0, 0.0), (0.25, 0.35), (1.3, 1.0), (1.6, 0.8), (n, 0.0)])   # the strain builds
    x = peq(hp(x, 120), 2500, 2.0, 0.9)
    return fade(fit(reverb(x, APT, wet=0.1), n), 0.02, 0.2)


@sfx('wet_peel', 'oneshot', -1.0, 1.8, 'slow wet peeling: tape pulled off + something wet letting go')
def wet_peel():
    r = rng(2821)
    n = 1.8
    tape = _grab('fsd:332225', n, 0.7, r)                             # tape pulled off a package (CC0), slowed
    slime = vari(from_onset(src('bank:1539'), -45, 0.0), 0.8)         # slime (CC0)
    squish = vari(from_onset(src('bank:799'), -45, 0.0), 0.85)        # squish (CC0)
    squelch = from_onset(src('fsd:148972'), -45, 0.0)                 # squelch (CC0)
    x = mix((_lv(tape, -24), 0.0, 1.0), (_lv(slime, -24), 0.25, 0.65), (_lv(squish, -24), 0.8, 0.45),
            (_lv(squelch, -24), 1.25, 0.4), length=n + 0.5)
    x = env(x, [(0, 0.0), (0.2, 0.7), (1.2, 1.0), (1.5, 0.7), (n, 0.0)])
    x = peq(hp(x, 150, 2), 700, 2.0, 0.9)
    return fade(fit(reverb(x, APT, wet=0.1), n), 0.02, 0.2)


# ---------------------------------------------------------------- impacts
@sfx('wall_thud', 'oneshot', -1.0, 2.0, 'a low heavy impact from inside the wall')
def wall_thud():
    fist = vari(_hit_of('fsd:369079', 0, max_len=2.0), 0.75)     # fist slam on a concrete wall, dry (CC0): pitched down
    thud = vari(_hit_of('bank:1295', 0), 0.8)                     # thud (CC0): the 150-600 Hz knock you hear on laptops
    thump = _hit_of('fsd:133282', 0)                              # thump (CC0): mid punch
    knock = vari(_hit_of('fsd:349287', 0), 0.6)                    # door knock (CC0), lower: the stud answering
    rattle = hp(fit(seg(src('fsd:51105'), 1.0, 3.0), 2.0), 900)   # things on a shelf answering (CC0)
    x = mix((_lv(fist, -20), 0.0, 1.0), (_lv(thud, -20), 0.004, 1.0), (_lv(thump, -20), 0.002, 0.6),
            (_lv(knock, -20), 0.003, 0.45), (fade(_lv(rattle, -20), 0.01, 0.8), 0.03, 0.06), length=2.6)
    x = lp(x, 2200, 2)              # through plaster and studs
    x = sat(x * 1.4, 1.3)           # a little harmonic weight so the low end reads on small speakers
    x = peq(peq(x, 120, 2.0, 0.9), 420, 3.0, 0.8)
    x = reverb(x, APT, wet=0.22)
    return fade(fit(x, 2.0), 0.002, 0.6)


@sfx('monitor_smash', 'oneshot', -1.0, 2.6, 'a computer monitor smashed on the floor: plastic crack + glass')
def monitor_smash():
    crack = _hit_of('fsd:369106', 0)                                  # plastic crack slam (CC0)
    crack2 = _hit_of('fsd:369103', 0)                                 # plastic crack slam (CC0)
    glass = from_onset(src('bank:910'), -45, 0.0)                     # glass shatter (CC0)
    glass2 = from_onset(seg(src('fsd:115916'), 3.5), -40, 0.0)       # glass hits floor, breaks (CC0)
    floor = _hit_of('fsd:133282', 0)                                  # thump on carpet (CC0)
    body = lp(_hit_of('fsd:369079', 0, max_len=2.0), 300)             # weight
    x = mix((_lv(crack, -20), 0.0, 1.0), (_lv(crack2, -20), 0.035, 0.6), (_lv(glass, -20), 0.008, 0.85),
            (_lv(glass2, -20), 0.02, 0.6), (_lv(floor, -20), 0.0, 0.7), (_lv(body, -20), 0.0, 0.5), length=3.2)
    x = reverb(hp(x, 60, 2), APT, wet=0.18)
    return fade(fit(x, 2.6), 0.002, 0.6)


@sfx('hand_slap', 'oneshot', -1.0, 0.9, 'a palm slapping flat against a smooth wall / door')
def hand_slap():
    palm = hp(_hit_of('fsd:430599', 1), 180, 2)          # hands on a wall (CC0): the skin crack
    body = decay_env(lp(hp(_hit_of('fsd:369117', 0), 140, 2), 700), 0.02, 0.25)  # hand slap on concrete (CC0): weight
    x = mix((norm(palm, -3), 0.0, 1.0), (norm(body, -3), 0.0, 0.2), length=1.1)   # peak-matched: the crack leads
    x = peq(peq(x, 1800, 3.0, 1.0), 260, 2.0, 1.0)
    return fade(fit(reverb(x, APT, wet=0.15), 0.9), 0.001, 0.25)


# ---------------------------------------------------------------- phone
@sfx('phone_ringback', 'oneshot', -1.0, 5.0, 'outgoing call ringback heard from the caller\'s phone: two rings')
def phone_ringback():
    # a real recording of a mobile phone ringing out (CC0, lauriemc); the ringback tone itself is
    # an electronic network tone, i.e. partly synthetic by nature
    x = seg(src('fsd:254186'), 0.45, 5.6)
    x = lp(hp(x, 250, 2), 4500, 2)
    x = reverb(x, APT, wet=0.05)
    return fade(fit(x, 5.0), 0.02, 0.4)


@sfx('phone_pickup', 'oneshot', -8.0, 0.6, 'the call connects: a soft click')
def phone_pickup():
    x = from_onset(src('fsd:422651'), -55, 0.002)   # phone pick up (CC0)
    x = hp(x, 150)
    return fade(fit(reverb(x, APT, wet=0.05, tail=0.1), 0.6), 0.001, 0.12)


# Frame 240 (the default build): the files the timeline uses, in build order.
FRAME240 = [
    # beds
    'computer_fan', 'rain_window', 'apartment_tone', 'light_buzz_bed', 'closet_tone', 'low_horror_drone', 'tension_pulse',
    # computer / desk
    'mouse_click', 'mouse_click_far', 'key_tap', 'spacebar', 'stylus_tap', 'pen_draw', 'ui_click', 'ui_refresh', 'ui_error',
    'glitch', 'chair_creak', 'mug_set', 'keys_grab',
    # the thing in the walls
    'pencil_scratch', 'pencil_scratch_far', 'scratch_dry', 'scrape_long', 'paper_drag', 'paper_stretch', 'wet_peel',
    'wall_thud', 'monitor_smash', 'hand_slap', 'door_tap', 'door_touch',
    # people
    'footsteps_carpet', 'running_carpet', 'cloth_rustle', 'breath_exhale_f',
    # phone / light
    'flashlight_on', 'phone_alert', 'phone_ringback', 'phone_pickup', 'light_flicker',
    # cinematic (sparingly)
    'bass_hit', 'boom_hit', 'sub_drop', 'stinger', 'riser_short', 'riser_long', 'whoosh_1', 'whoosh_2', 'whoosh_3',
]

# Sounds that contain an element no recording can supply (listed in CREDITS.md).
SYNTHETIC = {
    'light_flicker': 'mains/ballast hum partials under the real arcing recording',
    'sub_drop': 'the falling sine sweep (under a real boom and gong)',
    'phone_ringback': 'the ringback itself is an electronic network tone (a real recording of a phone ringing out)',
    'phone_alert': 'notification melody played on recorded glockenspiel samples through a phone-speaker filter',
    'ui_refresh': 'UI tick played on a recorded glockenspiel sample through a phone-speaker filter',
}


# ============================================================================
# MAIN  (designs are registered above this line)
# ============================================================================
# Integrated-loudness targets for one-shots (LUFS). Chosen against the previous files so the
# timeline's cue volumes stay sensible: roughly the old loudness, louder where the old sound
# was inaudible on small speakers (hull impacts, knocks, engines). Peak ceiling = the
# registered `level`; the limiter may take up to 4 dB off the peaks to reach the target.
ONESHOT_LUFS = {
    'impact_hull': -15.5, 'impact_hull_l': -17.5, 'impact_hull_r': -17.0, 'knocking_hull': -15.0, 'scratch_hull': -18.0,
    'metal_door': -19.0, 'footsteps_walk': -24.5, 'footsteps_running': -21.0, 'metal_creak': -18.0, 'slap': -24.5,
    'water_splash': -21.0, 'water_lap': -27.0, 'heartbeat': -20.0, 'ferry_horn': -13.5, 'page_flip': -21.0,
    'ring_clink': -25.0, 'cable_pull': -26.0, 'engine_slowdown': -20.0, 'engine_roar': -18.0, 'screams_crowd': -14.0,
    'scream_distant': -18.5, 'light_flicker': -21.0, 'lights_off': -24.0, 'lights_on': -27.0, 'power_down': -21.0,
    'emergency_alarm': -17.0, 'ui_refresh': -24.0, 'data_transfer': -23.0, 'glitch': -21.0, 'cctv_static': -20.5,
    'phone_alert': -17.5, 'phone_vibrate': -16.0, 'phone_ring': -15.5, 'phone_off': -21.0, 'phone_on': -21.0,
    'pa_static': -22.0, 'marine_radio': -26.0, 'radio_static': -25.0, 'whoosh_1': -17.0, 'whoosh_2': -17.0,
    'whoosh_3': -16.0, 'boom_hit': -15.0, 'stinger': -17.0, 'riser_short': -18.0, 'riser_long': -18.0, 'sub_drop': -15.0,
    'title_hit': -16.5, 'bass_hit': -16.5,
    'breath_shaky_inhale_m': -22.0, 'breath_shaky_inhale_f': -20.5, 'breath_exhale_m': -22.0, 'breath_exhale_f': -21.0,
    'breath_fast_m': -23.0, 'breath_fast_f': -22.5, 'breath_ragged_m': -24.5, 'breath_ragged_f': -23.5,
    'breath_crying_m': -26.0, 'breath_crying_f': -24.5,
    # Frame 240 (short clicks/taps are peak-normalised to their registered level instead)
    'pen_draw': -27.0, 'pencil_scratch': -19.0, 'pencil_scratch_far': -29.0, 'scratch_dry': -18.0, 'scrape_long': -20.0,
    'chair_creak': -25.0, 'mug_set': -24.0, 'keys_grab': -22.0, 'footsteps_carpet': -27.0, 'running_carpet': -22.0,
    'cloth_rustle': -27.0, 'door_tap': -23.0, 'door_touch': -34.0, 'paper_drag': -27.0, 'paper_stretch': -23.0,
    'wet_peel': -23.0, 'wall_thud': -17.0, 'monitor_smash': -17.5, 'phone_ringback': -22.0,
}


def finalize(name: str, x: np.ndarray, spec: dict) -> np.ndarray:
    x = st(x)
    if spec['kind'] == 'bed':
        # filter circularly (warm the filter up with the end of the loop) so the seam stays continuous
        k = min(len(x), secs(2.0))
        x = hp(np.concatenate([x[-k:], x]), 22, 2)[k:]
    else:
        x = hp(x, 22, 2)  # DC / subsonic clean-up
    if spec['kind'] == 'bed':
        x = L.norm_lufs(x, spec['level'])
        x = limit(x, -2.0)
        # wrap tail: the file ends with a copy of its first BED_TAIL seconds, so the mixer
        # (src/audio/AudioLayer.tsx) can overlap consecutive tiles by BED_TAIL and crossfade
        # identical, in-phase material - seamless even with ms-rounded placement.
        x = np.concatenate([x, x[: secs(BED_TAIL)]])
    else:
        if spec['length']:
            x = fit(x, spec['length'])
        # every one-shot starts and ends exactly on silence (no clicks)
        x = fade(x, 0.004, 0.02)
        ceiling = spec['level']
        if name in ONESHOT_LUFS:
            x = L.norm_lufs(x, ONESHOT_LUFS[name])
            over = 20 * math.log10(L.peak(x) + 1e-12) - ceiling
            if over > 4.0:  # never squash more than 4 dB
                x = x * db(4.0 - over)
            x = limit(x, ceiling, look_ms=2.0, rel_ms=80)
        else:
            x = norm(x, ceiling)
            x = limit(x, ceiling + 0.3)
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


def write_credits(out: Path, names: list[str]) -> None:
    used = L.credits_used()
    lines = ['# Sound effect credits', '',
             'Every file in this folder is built by `scripts/sfx/build_real_sfx.py` from the recordings below',
             '(layered, filtered, pitched and convolved with recorded room impulses). Licences: CC0-1.0 (no attribution',
             'required, listed for provenance) and CC-BY (attribution required - keep this file with the project and',
             'credit these authors in the video description/credits).', '',
             'FSD50K: E. Fonseca, X. Favory, J. Pons, F. Font, X. Serra, "FSD50K: an Open Dataset of Human-Labeled Sound Events",',
             'IEEE/ACM TASLP 2022 - clips are Freesound uploads, each under its own licence (only CC0 and CC-BY clips are used).',
             'VSCO-2 CE orchestral samples (Versilian Studios, uploaded to Freesound by Samulis, CC0).',
             'bank-sfx v1 (CC0 collection: Kenney.nl packs and CC0 Freesound uploads).', '']
    by = [(k, v) for k, v in sorted(L.SOURCES.items()) if k in used and v['license'].startswith('CC-BY')]
    if by:
        lines += [f'## Attribution required (CC-BY): {len(by)} recordings', '']
        for k, v in by:
            ver = v['license'].split('-')[-1]
            lines.append(f"- \"{v['title']}\" by {v['author']} - {v['url']} - CC BY {ver} (https://creativecommons.org/licenses/by/{ver}/)"
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
    syn = [(n, SYNTHETIC[n]) for n in names if n in SYNTHETIC]
    if syn:
        lines += ['', 'Partly synthetic by nature (everything else is recorded sound):', '']
        lines += [f'- {n}: {why}' for n, why in syn]
    lines.append('')
    (out / 'CREDITS.md').write_text('\n'.join(lines))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('names', nargs='*')
    ap.add_argument('--out', default=str(OUT_DEFAULT))
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--no-credits', action='store_true')
    ap.add_argument('--all', action='store_true', help='build every registered builder (both films)')
    a = ap.parse_args()
    if a.list:
        for k, v in REGISTRY.items():
            print(f"{k:22s} {v['kind']:8s} {v['note']}")
        return
    names = a.names or (list(REGISTRY) if a.all else FRAME240)
    bad = [n for n in names if n not in REGISTRY]
    if bad:
        sys.exit(f'unknown: {bad}')
    out = Path(a.out)
    print(f'building {len(names)} sounds -> {out}')
    build(names, out)
    if not a.names and not a.no_credits:
        write_credits(out, names)
        print(f'wrote {out / "CREDITS.md"}')


if __name__ == '__main__':
    main()
