#!/usr/bin/env python3
"""Sound design for "Mr. Widemouth", built from REAL recordings (plus one original synthesised tune).

    .venv/bin/python scripts/sfx/build_widemouth_sfx.py             # build the WIDEMOUTH set + CREDITS.md
    .venv/bin/python scripts/sfx/build_widemouth_sfx.py scurry      # just these

Same method and helpers as build_goatman_sfx.py (FSD50K CC0 clips, layered, EQ'd, pitched, placed):
the old farmhouse settling and the wind on its hill, the moving truck's diesel at 4 a.m., small things
scurrying under a bed, a sash window, a box of knives, a kitchen drawer, a crow in the cemetery woods.

Mr. Widemouth's theme is an ORIGINAL music-box waltz composed for this film and synthesised here (no
recording, no existing melody): comb tines with a slightly inharmonic overtone, a mechanical tick, a
small room. It drifts very slightly out of tune - sweet, and not quite right. `musicbox_winddown` is
the same tune running down: slowing, sagging flat, stopping.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import build_goatman_sfx as G  # noqa: E402  (register_sources, hit_list, far)
import build_real_sfx as B  # noqa: E402
import sfxlib as L  # noqa: E402
from build_real_sfx import _lv, _sb, _stereo_pair, sfx  # noqa: E402
from sfxlib import SR, decorrelate, env, fade, fit, hp, lp, mix, peq, place, reverb, secs, seg, src, st, vari, zeros  # noqa: E402

G.NEW = {
    # the house / the hill
    164494: 'floorboard creak', 248258: 'floorboards creaking', 103998: 'wood knocks', 113173: 'wind howling 01',
    113175: 'wind howling 03', 104078: 'wind low short',
    # the truck
    125169: 'truck idle', 126036: 'car starting and idling', 17923: 'bicycle on gravel',
    # under the bed / the bedroom
    134791: 'rats', 106135: 'wood stair walking', 273395: 'wood, barefeet run', 207125: 'crunching through leaves',
    154675: 'sliding window', 148948: 'squeaking window',
    # knives / kitchen
    182694: 'knife blades', 134848: 'silverware', 108475: 'drawer open', 108474: 'drawer close',
    # outside
    138344: 'crow', 336606: 'music box wind up',
}


# ----------------------------------------------------------------------------
# Mr. Widemouth's music box (original composition, synthesised)
# ----------------------------------------------------------------------------
BPM = 84.0
BEAT = 60.0 / BPM
# 16 bars of 3/4: (midi note, beats). An original lullaby-waltz; bar 15 turns minor (G#).
MELODY = [
    (76, 1), (79, 1), (84, 1), (83, 2), (81, 1), (79, 1), (76, 1), (77, 1), (74, 3),
    (76, 1), (79, 1), (84, 1), (86, 2), (84, 1), (83, 1), (79, 1), (81, 1), (79, 3),
    (81, 1), (84, 1), (88, 1), (86, 2), (83, 1), (84, 1), (81, 1), (77, 1), (76, 3),
    (77, 1), (81, 1), (86, 1), (84, 1), (83, 1), (81, 1), (80, 1), (83, 1), (76, 1), (81, 3),
]
# one root per bar (low tine on beat 1, two soft chord tines on beats 2 and 3)
CHORDS = [(48, 64, 67), (43, 62, 67), (48, 64, 67), (43, 62, 65), (48, 64, 67), (43, 62, 67), (40, 62, 67), (48, 64, 67),
          (45, 64, 69), (43, 62, 67), (41, 65, 69), (40, 64, 67), (50, 65, 69), (45, 64, 69), (40, 64, 68), (45, 64, 69)]


def tine(midi: float, dur: float, vel: float, seed: int) -> np.ndarray:
    """One music-box tine: a sine with a quick metallic overtone and a tick."""
    r = np.random.default_rng(seed)
    f = 440.0 * 2 ** ((midi - 69) / 12)
    n = secs(dur)
    t = np.arange(n) / SR
    tau = 0.35 + 1.4 * (72.0 / max(48.0, midi)) ** 2 * 0.5   # low tines ring longer
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    x += 0.18 * np.sin(2 * np.pi * f * 2.0 * t + 0.3) * np.exp(-t / (tau * 0.45))
    x += 0.10 * np.sin(2 * np.pi * f * 5.93 * t) * np.exp(-t / 0.05)  # the comb's metallic ping
    att = np.minimum(1.0, t / 0.0015)
    x *= att
    click = r.standard_normal(secs(0.004)) * np.exp(-np.arange(secs(0.004)) / (SR * 0.0008)) * 0.05
    x[: len(click)] += click
    return st(x * vel)


def tune(T: float, rate=lambda t: 1.0, bend=lambda t: 0.0, seed: int = 4401, stop: float | None = None) -> np.ndarray:
    """Render the waltz. `rate(t)`: tempo multiplier, `bend(t)`: pitch in semitones (both by song time)."""
    r = np.random.default_rng(seed)
    events = []
    t = 0.0
    for m, bts in MELODY:
        events.append((t, m, 0.9))
        t += bts
    for bar, (root, a, b) in enumerate(CHORDS):
        events.append((bar * 3.0, root, 0.55))
        events.append((bar * 3.0 + 1.0, a, 0.22))
        events.append((bar * 3.0 + 2.0, b, 0.22))
    events.sort()
    buf = zeros(T + 4.0)
    for beat, m, v in events:
        clock_t = _beat_time(beat, rate)
        if stop is not None and clock_t > stop:
            break
        drift = 0.06 * np.sin(clock_t * 0.37) + 0.04 * np.sin(clock_t * 1.13 + 1.0)   # slightly out of tune
        x = tine(m + drift + bend(clock_t) + float(r.normal(0, 0.03)), 3.2, v * float(r.uniform(0.85, 1.0)), int(r.integers(1, 1 << 30)))
        place(buf, x, clock_t + float(r.normal(0, 0.006)), 1.0)
    return buf


def _beat_time(beat: float, rate) -> float:
    """Seconds at which `beat` falls when the tempo follows rate(seconds)."""
    t, b, step = 0.0, 0.0, 1.0 / 32
    while b + step <= beat:
        t += step * BEAT / max(0.05, rate(t))
        b += step
    return t + (beat - b) * BEAT / max(0.05, rate(t))


@sfx('musicbox_lullaby', 'bed', -30.0, 48 * 60.0 / 84.0, "Mr. Widemouth's theme: an original music-box waltz, sweet and slightly out of tune")
def musicbox_lullaby():
    T = 48 * BEAT  # 16 bars of 3/4
    x = tune(T)
    x = reverb(hp(x, 180), 'bedroom', wet=0.32)
    y = B.fold_loop(x, T)  # the ringing tail folds back onto the start: a seamless loop
    return peq(lp(y, 9000), 2600, -2.0, 1.0)


@sfx('musicbox_winddown', 'oneshot', -9.0, 7.0, 'the music box running down: slowing, sagging flat, stopping')
def musicbox_winddown():
    rate = lambda t: max(0.18, 1.0 - 0.16 * t)
    bend = lambda t: -0.55 * t
    x = tune(12.0, rate, bend, seed=4402, stop=5.6)
    x = reverb(hp(x, 180), 'bedroom', wet=0.35)
    return fade(fit(x, 7.0), 0.0, 1.2)


@sfx('musicbox_windup', 'oneshot', -14.0, 2.4, 'a small music box being wound up')
def musicbox_windup():
    x = B.loudest(src('fsd:336606'), 2.4)
    return fade(reverb(hp(x, 300), 'bedroom', wet=0.2), 0.02, 0.3)


# ----------------------------------------------------------------------------
# beds
# ----------------------------------------------------------------------------
@sfx('house_tone', 'bed', -42.0, 40.0, 'inside the old farmhouse: wind pressing on the walls, the house settling now and then')
def house_tone():
    T, XF = 40.0, 3.0
    n = T + XF
    wind = lp(hp(_sb('fsd:113173', n, 8101, (6, 10)), 60), 520)
    wind2 = lp(hp(_sb('fsd:104078', n, 8102, (3, 6)), 60), 700)
    cont = mix((_lv(wind, -30), 0, 0.8), (decorrelate(_lv(wind2, -30), 13), 0, 0.5), length=n)
    events = zeros(T + 3.0)
    creaks = [B.loudest(src('fsd:164494'), 1.4), B.loudest(src('fsd:248258'), 1.6)]
    r = np.random.default_rng(8103)
    t = 3.0
    while t < T - 2:
        c = creaks[int(r.integers(0, 2))]
        c = lp(reverb(hp(vari(c, float(r.uniform(0.8, 1.0))), 120), 'living', wet=0.5), 3000)
        place(events, _lv(c, -40), t, float(r.uniform(0.25, 0.45)))
        t += float(r.uniform(9, 15))
    return B.bed_mix(cont, events, T, XF)


@sfx('truck_idle', 'bed', -34.0, 30.0, "the moving truck's diesel idling, heard from inside the cab")
def truck_idle():
    T, XF = 30.0, 3.0
    x = _sb('fsd:125169', T + XF, 8111, (5, 9))
    x = peq(lp(hp(x, 35), 900), 90, 3.0, 0.8)
    return L.loop(x, T, XF)


@sfx('hill_wind', 'bed', -36.0, 40.0, 'wind over the bare hilltop and in through an open window')
def hill_wind():
    T, XF = 40.0, 3.0
    n = T + XF
    a = _sb('fsd:113175', n, 8121, (6, 10))
    b = _sb('fsd:113173', n, 8122, (6, 10))
    x = _stereo_pair(a, b, 1.0)
    return L.loop(lp(hp(x, 70), 4200), T, XF)


# ----------------------------------------------------------------------------
# one-shots
# ----------------------------------------------------------------------------
@sfx('gravel_roll', 'oneshot', -10.0, 4.0, 'heavy tyres rolling slowly down a gravel drive')
def gravel_roll():
    a = vari(B.loudest(src('fsd:17923'), 5.0), 0.7)
    rum = lp(B.loudest(src('fsd:125169'), 4.0), 300)
    x = mix((_lv(a, -28), 0, 0.8), (_lv(rum, -28), 0, 0.6), length=4.0)
    return fade(lp(hp(x, 50), 3500), 0.6, 1.2)


@sfx('floor_creak', 'oneshot', -9.0, 1.8, 'a floorboard creaking somewhere down the hall')
def floor_creak():
    x = B.loudest(src('fsd:164494'), 1.4)
    return fade(fit(reverb(lp(hp(x, 120), 4000), 'living', wet=0.4), 1.8), 0.01, 0.4)


@sfx('wall_tap', 'oneshot', -14.0, 2.6, 'small taps from inside the wall')
def wall_tap():
    ks = G.hit_list('fsd:103998', -40, 0.12, 9, 0.35)
    buf = zeros(2.8)
    for i, (t, g) in enumerate([(0.0, 0.8), (0.31, 0.6), (0.52, 0.7), (1.35, 0.5), (1.58, 0.65)]):
        place(buf, vari(ks[i % len(ks)], 1.15), t, g)
    x = lp(peq(buf, 300, 4.0, 1.0), 1500)
    return fade(fit(reverb(x, 'closet', wet=0.35), 2.6), 0.001, 0.4)


@sfx('scurry', 'oneshot', -10.0, 2.2, 'something small scurrying under the bed, claws on floorboards')
def scurry():
    x = vari(B.loudest(src('fsd:134791'), 2.6), 0.85)
    return fade(fit(reverb(hp(x, 180), 'bedroom', wet=0.2), 2.2), 0.03, 0.4)


@sfx('stairs_steps', 'oneshot', -12.0, 3.0, 'footsteps coming up wooden stairs, heard through a door')
def stairs_steps():
    x = B.loudest(src('fsd:106135'), 3.0)
    return fade(reverb(lp(hp(x, 90), 2400), 'landing', wet=0.35), 0.2, 0.5)


@sfx('small_feet', 'oneshot', -12.0, 2.6, 'small bare feet pattering fast over floorboards')
def small_feet():
    x = vari(B.loudest(src('fsd:273395'), 3.0), 1.25)
    return fade(fit(reverb(hp(x, 200), 'bedroom', wet=0.25), 2.6), 0.05, 0.5)


@sfx('small_feet_leaves', 'oneshot', -14.0, 2.6, 'little feet pattering over dead leaves')
def small_feet_leaves():
    x = vari(B.loudest(src('fsd:207125'), 3.6), 1.4)
    return fade(fit(hp(x, 200), 2.6), 0.1, 0.6)


@sfx('sash_window', 'oneshot', -7.0, 2.2, 'an old wooden sash window shoved open')
def sash_window():
    a = B.loudest(src('fsd:154675'), 1.8)
    b = B.loudest(src('fsd:148948'), 1.2)
    x = mix((_lv(a, -26), 0, 0.9), (_lv(b, -26), 0.1, 0.5), length=2.2)
    return fade(reverb(hp(x, 90), 'bedroom', wet=0.2), 0.01, 0.4)


@sfx('box_knives', 'oneshot', -8.0, 1.6, 'a jumble of kitchen knives shifting in a cardboard box')
def box_knives():
    a = B.loudest(src('fsd:182694'), 1.4)
    b = B.loudest(src('fsd:134848'), 1.2)
    x = mix((_lv(a, -24), 0, 0.9), (lp(_lv(b, -26), 5000), 0.05, 0.5), length=1.6)
    return fade(peq(hp(x, 150), 250, 3.0, 1.0), 0.005, 0.3)


@sfx('bed_creak', 'oneshot', -12.0, 1.2, 'an old bed frame creaking under a small weight')
def bed_creak():
    x = vari(B.loudest(src('fsd:164494'), 1.0), 1.3)
    return fade(fit(reverb(lp(hp(x, 200), 3500), 'bedroom', wet=0.2), 1.2), 0.01, 0.3)


@sfx('drawer_search', 'oneshot', -8.0, 3.2, 'a kitchen drawer pulled open, cutlery rattled through, shoved shut')
def drawer_search():
    o = B.loudest(src('fsd:108475'), 1.0)
    s = B.loudest(src('fsd:134848'), 1.4)
    c = B.loudest(src('fsd:108474'), 0.8)
    buf = zeros(3.3)
    place(buf, _lv(o, -26), 0.0, 0.8)
    place(buf, _lv(s, -26), 0.75, 0.7)
    place(buf, _lv(c, -26), 2.3, 0.8)
    return fade(fit(reverb(hp(buf, 90), 'living', wet=0.2), 3.2), 0.01, 0.4)


@sfx('truck_start', 'oneshot', -8.0, 4.0, 'an old truck engine cranking and catching, from inside the cab')
def truck_start():
    x = seg(st(src('fsd:126036')), 0.0, 4.2)
    return fade(fit(peq(lp(hp(x, 40), 2600), 110, 3.0, 0.8), 4.0), 0.01, 1.0)


@sfx('crow_caw', 'oneshot', -14.0, 3.0, 'a crow calling once, far off in the pines')
def crow_caw():
    x = B.loudest(src('fsd:138344'), 2.2)
    return fade(fit(G.far(x, 4500), 3.0), 0.02, 0.8)


WIDEMOUTH = [
    'musicbox_lullaby', 'musicbox_winddown', 'musicbox_windup', 'house_tone', 'truck_idle', 'hill_wind',
    'gravel_roll', 'floor_creak', 'wall_tap', 'scurry', 'stairs_steps', 'small_feet', 'small_feet_leaves', 'sash_window',
    'box_knives', 'bed_creak', 'drawer_search', 'truck_start', 'crow_caw',
]


def main() -> None:
    G.register_sources()
    names = sys.argv[1:] or WIDEMOUTH
    bad = [n for n in names if n not in B.REGISTRY]
    if bad:
        sys.exit(f'unknown: {bad}')
    out = B.OUT_DEFAULT
    print(f'building {len(names)} sounds -> {out}')
    B.build(names, out)
    if not sys.argv[1:]:
        B.write_credits(out, names)
        print(f'wrote {out / "CREDITS.md"}')


if __name__ == '__main__':
    main()
