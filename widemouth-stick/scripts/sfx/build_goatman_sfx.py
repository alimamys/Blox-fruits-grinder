#!/usr/bin/env python3
"""Sound design for "11 of Us Went Camping. 12 Came Back." (goatman), built from REAL recordings.

    .venv/bin/python scripts/sfx/build_goatman_sfx.py             # build the GOATMAN set + CREDITS.md
    .venv/bin/python scripts/sfx/build_goatman_sfx.py rifle_shot   # just these

Same method and helpers as scripts/sfx/build_real_sfx.py (FSD50K CC0 / CC-BY clips, layered, EQ'd,
pitched, placed): the pine woods by day and by night (crickets, Alabama frogs, an owl), the campfire,
the creek, the trailer's thin metal door, a hunting rifle with its echo rolling through the trees, and
the thing in the woods (gibbering, hooting, a scream like a woman and an animal at once). The sounds
reused from the earlier films (stingers, heartbeat, drones, doors) stay as they are.

Every new source is registered in scripts/sfx/sources.json from the local FSD50K metadata
(licence, author, URL), so CREDITS.md stays complete.
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
from build_real_sfx import _at, _lv, _sb, _stereo_pair, circ, sfx  # noqa: E402
from sfxlib import (SR, decorrelate, env, fade, fit, hits, hp, lp, mix, peq, place, reverb, reverse, sat, secs, seg, src,  # noqa: E402
                    st, stretch, vari, zeros)

# ----------------------------------------------------------------------------
# sources (FSD50K, CC0 unless noted)
# ----------------------------------------------------------------------------
NEW = {
    # night woods
    134772: 'crickets, fall evening', 129678: 'crickets', 121556: 'Alabama frogs', 20351: 'crickets and frogs',
    157870: 'owl, Arkansas backyard', 159727: 'crickets and owl',
    # day woods
    182500: 'birds chirping 04', 182501: 'birds chirping 03', 182502: 'birds chirping 02',
    # fire / water
    164471: 'fire crackle', 213887: 'fire', 203173: 'fireplace', 146008: 'babbling brook', 119501: 'stream under rocks',
    143257: 'single splash', 148317: 'medium splash', 137749: 'playing in water',
    137229: 'boiling water', 135866: 'boiling', 142329: 'casserole dish',
    # feet / brush
    207125: 'crunching through leaves', 179339: 'crunchy footsteps on leaves', 137743: 'runner on gravel',
    178615: 'rustle of a bush', 106130: 'leaf pile hit', 144890: 'crack of branch', 319230: 'stick snap',
    # guns / doors
    136766: 'gunshot', 128296: 'layered gunshot', 119482: 'screen door spring', 173009: 'car door close',
    209772: 'metal boom', 113131: 'front door knocks', 94033: 'roller blind up (CC-BY)',
    # the thing
    235044: 'baby talk babble', 110139: 'scary scream', 191938: 'cat screams', 244456: 'coyote',
    # the city
    130568: 'roaring crowd',
}


def register_sources() -> None:
    """Add any missing FSD50K clip to sources.json from the cached metadata (licence, author, title)."""
    path = HERE / 'sources.json'
    reg = json.loads(path.read_text())
    meta_dir = L.CACHE / 'meta'
    info = {}
    splits = {}
    for split in ('dev', 'eval'):
        info.update(json.loads((meta_dir / f'{split}_clips_info_FSD50K.json').read_text()))
        with open(meta_dir / f'{split}.csv') as fh:
            for r in csv.DictReader(fh):
                splits[r['fname']] = split
    changed = False
    for fid in NEW:
        key = f'fsd:{fid}'
        if key in reg:
            continue
        i = info[str(fid)]
        lic = i['license']
        lic_name = 'CC0-1.0' if 'zero' in lic else ('CC-BY-' + lic.rstrip('/').split('/')[-1]) if '/by/' in lic else lic
        reg[key] = {
            'author': i.get('uploader', ''),
            'dataset': 'FSD50K (Fonseca et al. 2022), file mirror huggingface.co/datasets/Fhrozen/FSD50k',
            'freesound_id': fid,
            'license': lic_name,
            'split': splits[str(fid)],
            'title': i.get('title', ''),
            'url': f'https://freesound.org/s/{fid}/',
        }
        if lic_name.startswith('CC-BY'):
            reg[key]['license_url'] = lic
        changed = True
    if changed:
        path.write_text(json.dumps(reg, indent=1, sort_keys=True))
        L.SOURCES.clear()
        L.SOURCES.update(reg)


def hit_list(key, thr=-40.0, gap=0.2, rise=9.0, dur=1.0) -> list:
    """Transients of a recording; a clip that starts on its hit (no rise before it) is taken from its start."""
    x = src(key)
    hs = hits(x, thr, gap, rise, dur)
    return hs if hs else [fade(seg(x, 0.0, dur), 0.0, min(0.05, dur / 4))]


def echo_woods(x, taps=((0.19, 0.42), (0.43, 0.3), (0.78, 0.2), (1.24, 0.12), (1.85, 0.07)), cut=1800.0, tail=2.4):
    """A sound rolling away through the trees: darker, later, quieter copies (no room)."""
    x = st(x)
    buf = zeros(len(x) / SR + tail)
    place(buf, x, 0.0, 1.0)
    for i, (t, g) in enumerate(taps):
        y = lp(x, cut * (0.85 ** i))
        place(buf, decorrelate(y, 7 + 4 * i, seed=i + 3), t, g)
    return buf


def far(x, cut=2400.0, g=1.0):
    """Further away in the woods: less top, a little tree slap-back."""
    return echo_woods(lp(hp(x, 120), cut) * g, taps=((0.11, 0.25), (0.29, 0.15), (0.6, 0.08)), cut=cut * 0.7, tail=1.0)


# ----------------------------------------------------------------------------
# beds (seamless loops)
# ----------------------------------------------------------------------------
@sfx('woods_night', 'bed', -36.0, 40.0, 'Alabama pine woods at night: crickets and katydids close, frogs far off, the odd owl')
def woods_night():
    T, XF = 40.0, 3.0
    n = T + XF
    cr1 = _sb('fsd:134772', n, 7101, (6, 10))
    cr2 = _sb('fsd:129678', n, 7102, (6, 10))
    cr3 = _sb('fsd:20351', n, 7103, (6, 10))
    frogs = lp(_sb('fsd:121556', n, 7104, (6, 10)), 2600)
    x = mix((_lv(cr1, -30), 0, 0.9), (decorrelate(_lv(cr2, -30), 13), 0, 0.6), (_lv(cr3, -30), 0, 0.5), (_lv(frogs, -30), 0, 0.35), length=n)
    x = hp(x, 90)
    return L.loop(x, T, XF)


@sfx('woods_day', 'bed', -38.0, 40.0, 'the pine woods on a hot afternoon: birds in the canopy, insects, warm still air')
def woods_day():
    T, XF = 40.0, 3.0
    n = T + XF
    b1 = _sb('fsd:182500', n, 7111, (5, 9))
    b2 = _sb('fsd:182501', n, 7112, (5, 9))
    b3 = _sb('fsd:182502', n, 7113, (5, 9))
    air = lp(hp(_sb('fsd:330265', n, 7114, (5, 9)), 60), 900)  # warm air hush
    x = mix((_lv(b1, -30), 0, 0.7), (decorrelate(_lv(b2, -30), 11), 0, 0.5), (_lv(b3, -30), 0, 0.4), (_lv(air, -30), 0, 0.35), length=n)
    return L.loop(hp(x, 80), T, XF)


@sfx('campfire', 'bed', -34.0, 30.0, 'a campfire of pine logs: soft roar, pops and crackles')
def campfire():
    T, XF = 30.0, 2.5
    n = T + XF
    a = _sb('fsd:164471', n, 7121, (4, 8))
    b = _sb('fsd:213887', n, 7122, (4, 8))
    c = _sb('fsd:203173', n, 7123, (4, 8))
    x = mix((_lv(a, -30), 0, 0.8), (decorrelate(_lv(b, -30), 9), 0, 0.6), (_lv(c, -30), 0, 0.5), length=n)
    return L.loop(hp(x, 70), T, XF)


@sfx('creek_flow', 'bed', -36.0, 30.0, 'a small shallow creek running over pebbles')
def creek_flow():
    T, XF = 30.0, 3.0
    n = T + XF
    a = _sb('fsd:146008', n, 7131, (6, 10))
    b = _sb('fsd:119501', n, 7132, (6, 10))
    x = mix((_lv(a, -30), 0, 0.8), (decorrelate(_lv(b, -30), 12), 0, 0.6), length=n)
    return L.loop(hp(x, 80), T, XF)


@sfx('trailer_tone', 'bed', -44.0, 30.0, 'inside the old trailer at night: dead air, the crickets through thin aluminium walls')
def trailer_tone():
    T, XF = 30.0, 3.0
    n = T + XF
    still = _stereo_pair(_sb('fsd:151845', n, 7141, (1.6, 3.0), 0.8), _sb('fsd:151845', n, 7142, (1.6, 3.0), 0.8))
    outside = lp(hp(_sb('fsd:134772', n, 7143, (6, 10)), 200), 1100)  # crickets through the walls
    x = mix((_lv(still, -30), 0, 1.0), (_lv(outside, -30), 0, 0.45), length=n)
    x = peq(x, 650, 2.0, 1.2)
    return L.loop(x, T, XF)


@sfx('city_night', 'bed', -38.0, 30.0, 'his Chicago apartment at night: the game on TV across the room, traffic far below')
def city_night():
    T, XF = 30.0, 3.0
    n = T + XF
    tv = _sb('fsd:130568', n, 7151, (5, 9))
    tv = peq(lp(hp(tv, 220), 4800), 1800, 3.0, 1.0)              # a TV speaker
    tv = reverb(tv, 'living', wet=0.35)
    traffic = lp(hp(_sb('fsd:166171', n, 7152, (2.0, 3.5), 1.0), 50), 380)
    air = lp(hp(_sb('fsd:330265', n, 7153, (5, 9)), 60), 1200)
    x = mix((_lv(tv, -30), 0, 0.5), (_lv(traffic, -30), 0, 0.5), (_lv(air, -30), 0, 0.35), length=n)
    return L.loop(x, T, XF)


# ----------------------------------------------------------------------------
# one-shots
# ----------------------------------------------------------------------------
@sfx('owl_hoot', 'oneshot', -10.0, 3.0, 'a barred owl hooting somewhere in the dark')
def owl_hoot():
    x = B.loudest(src('fsd:157870'), 2.6)
    return fade(fit(far(x, 5000), 3.0), 0.05, 0.6)


@sfx('sizzle_pot', 'oneshot', -14.0, 6.0, 'hot dogs boiling in a dented pot on a camp stove')
def sizzle_pot():
    a = B.loudest(src('fsd:137229'), 6.0)
    b = B.loudest(src('fsd:135866'), 6.0)
    x = mix((_lv(a, -30), 0, 0.8), (_lv(b, -30), 0, 0.5), length=6.0)
    return fade(peq(hp(x, 120), 2500, -2.0, 1.0), 0.4, 0.8)


@sfx('pot_lid', 'oneshot', -6.0, 1.2, 'a metal pot lid lifted and set down on the stove')
def pot_lid():
    hs = hit_list('fsd:142329', -40, 0.1, 9, 0.6)
    buf = zeros(1.4)
    place(buf, hs[0], 0.02, 0.7)
    if len(hs) > 1:
        place(buf, hs[1], 0.48, 1.0)
    return fade(fit(reverb(hp(buf, 150), 'bedroom', wet=0.15), 1.2), 0.002, 0.3)


@sfx('water_splash', 'oneshot', -6.0, 2.5, 'kids splashing in a shallow creek')
def water_splash():
    a = B.loudest(src('fsd:137749'), 2.5)
    b = hit_list('fsd:143257', -40, 0.2, 9, 1.2)[0]
    c = hit_list('fsd:148317', -40, 0.2, 9, 1.4)[0]
    buf = zeros(2.6)
    place(buf, _lv(a, -26), 0.0, 0.8)
    place(buf, b, 0.25, 0.7)
    place(buf, c, 1.1, 0.6)
    return fade(fit(hp(buf, 90), 2.5), 0.01, 0.5)


@sfx('footsteps_leaves', 'oneshot', -8.0, 4.0, 'a few people walking on dry leaves and pine needles')
def footsteps_leaves():
    a = B.loudest(src('fsd:207125'), 4.0)
    b = B.loudest(src('fsd:179339'), 4.0)
    x = mix((_lv(a, -28), 0, 0.8), (decorrelate(_lv(b, -28), 9), 0.15, 0.5), length=4.0)
    return fade(hp(x, 100), 0.2, 0.8)


@sfx('running_leaves', 'oneshot', -6.0, 3.0, 'three people sprinting out of the woods over leaves and dirt')
def running_leaves():
    a = vari(B.loudest(src('fsd:137743'), 3.6), 1.15)
    b = vari(B.loudest(src('fsd:207125'), 3.6), 1.35)
    x = mix((_lv(a, -26), 0, 0.8), (decorrelate(_lv(b, -26), 11), 0.08, 0.55), length=3.0)
    x = env(x, [(0, 0.3), (0.6, 0.8), (2.2, 1.0), (3.0, 0.7)])
    return fade(hp(x, 90), 0.05, 0.4)


@sfx('brush_rustle', 'oneshot', -8.0, 2.4, 'something pushing through thick bushes')
def brush_rustle():
    x = B.loudest(src('fsd:178615'), 2.4)
    return fade(hp(x, 120), 0.08, 0.5)


@sfx('brush_crash', 'oneshot', -5.0, 2.6, 'something big crashing through the undergrowth, a branch snapping')
def brush_crash():
    r = vari(B.loudest(src('fsd:178615'), 2.8), 0.85)
    pile = hit_list('fsd:106130', -40, 0.2, 9, 1.2)[0]
    crack = hit_list('fsd:144890', -40, 0.2, 9, 0.8)[0]
    buf = zeros(2.8)
    place(buf, _lv(r, -24), 0.0, 1.0)
    place(buf, pile, 0.35, 0.8)
    place(buf, crack, 0.9, 0.9)
    return fade(fit(hp(buf, 80), 2.6), 0.03, 0.5)


@sfx('stick_crack', 'oneshot', -4.0, 1.2, 'a dry stick snapping under a foot in the dark')
def stick_crack():
    x = hit_list('fsd:319230', -40, 0.2, 9, 0.6)[0]
    return fade(fit(far(x, 6000), 1.2), 0.001, 0.4)


@sfx('rifle_shot', 'oneshot', -1.0, 3.6, 'a hunting rifle fired outdoors, the report rolling away through the trees')
def rifle_shot():
    a = hit_list('fsd:136766', -30, 0.3, 9, 1.4)[0]
    b = hit_list('fsd:128296', -30, 0.3, 9, 1.4)[0]
    crack = mix((a, 0, 1.0), (b, 0, 0.6))
    crack = sat(peq(hp(crack, 50), 120, 3.0, 0.8), 1.4)
    return fade(fit(echo_woods(crack, cut=2200, tail=2.6), 3.6), 0.001, 1.2)


@sfx('trailer_door_open', 'oneshot', -6.0, 1.6, "the trailer's thin aluminium door: latch, spring creak")
def trailer_door_open():
    x = B.loudest(src('fsd:119482'), 1.6)
    return fade(peq(hp(x, 140), 2200, 2.0, 1.4), 0.005, 0.3)


@sfx('trailer_door_slam', 'oneshot', -3.0, 1.6, "the trailer's metal door slammed shut, rattling in its frame")
def trailer_door_slam():
    slam = hit_list('fsd:173009', -35, 0.3, 9, 1.2)[0]
    spring = B.loudest(src('fsd:119482'), 0.9)
    buf = zeros(1.8)
    place(buf, spring, 0.0, 0.5)
    place(buf, peq(slam, 420, 3.0, 1.2), 0.25, 1.0)
    return fade(fit(reverb(hp(buf, 70), 'bedroom', wet=0.12), 1.6), 0.002, 0.4)


@sfx('trailer_door_bang', 'oneshot', -2.0, 2.2, 'a fist pounding on the trailer\'s metal door, three hard blows')
def trailer_door_bang():
    k = hit_list('fsd:113131', -40, 0.12, 9, 0.5)
    boom = hit_list('fsd:209772', -40, 0.2, 9, 0.8)[0]
    buf = zeros(2.3)
    for i, (t, g) in enumerate([(0.0, 1.0), (0.36, 0.9), (0.7, 1.0)]):
        place(buf, peq(k[i % len(k)], 350, 4.0, 1.0), t, g)
        place(buf, lp(boom, 1800), t + 0.004, 0.45 * g)
    return fade(fit(reverb(hp(buf, 60), 'bedroom', wet=0.15), 2.2), 0.001, 0.4)


@sfx('metal_claw', 'oneshot', -6.0, 3.2, 'half knocking, half clawing at the outside of a metal door')
def metal_claw():
    nails = B.REGISTRY['nails_scrape']['fn']()
    nails = peq(hp(st(nails), 300), 1900, 4.0, 1.4)
    k = hit_list('fsd:113131', -40, 0.12, 9, 0.5)
    buf = zeros(3.3)
    place(buf, fit(nails, 2.6), 0.3, 0.9)
    for i, (t, g) in enumerate([(0.0, 0.5), (1.1, 0.4), (2.2, 0.35)]):
        place(buf, lp(peq(k[i % len(k)], 350, 4.0, 1.0), 1500), t, g)
    return fade(fit(lp(buf, 3500), 3.2), 0.01, 0.5)


@sfx('gibbering', 'oneshot', -8.0, 5.0, 'a low wet gibbering from the trees, like talking with the wrong mouth')
def gibbering():
    babble = st(src('fsd:235044'))
    babble = vari(B.loudest(babble, 5.0), 0.62)                     # down into a man's range and wrong
    chunks = []
    r = np.random.default_rng(7171)
    t = 0.0
    while t < 5.0:
        ln = float(r.uniform(0.12, 0.42))
        s0 = float(r.uniform(0, max(0.01, len(babble) / SR - ln)))
        c = seg(babble, s0, s0 + ln)
        if r.random() < 0.35:
            c = reverse(c)
        chunks.append(fade(c, 0.01, 0.03))
        t += ln
    x = np.concatenate(chunks)[: secs(5.0)]
    x = sat(peq(lp(hp(x, 140), 2200), 400, 4.0, 1.0), 1.8)
    rasp = B.REGISTRY['creature_rasp']['fn']()
    x = mix((x, 0, 1.0), (lp(st(rasp), 1500), 0.6, 0.25), length=5.2)
    return fade(fit(far(x, 2200), 5.0), 0.4, 0.8)


@sfx('animal_scream', 'oneshot', -4.0, 3.6, 'a scream from the treeline like a woman and an animal screaming at once')
def animal_scream():
    w = hit_list('fsd:110139', -40, 0.3, 9, 2.4)[0]
    c = B.loudest(src('fsd:191938'), 2.4)
    y = B.loudest(src('fsd:244456'), 2.4)
    x = mix((vari(w, 0.88), 0, 0.8), (vari(c, 0.8), 0.05, 0.6), (vari(y, 0.9), 0.1, 0.35), length=2.8)
    x = sat(hp(x, 180), 1.5)
    return fade(fit(far(x, 3200), 3.6), 0.02, 1.0)


@sfx('blind_roll', 'oneshot', -8.0, 1.6, 'a yellowed roll-down blind pulled down over a trailer window')
def blind_roll():
    x = B.loudest(src('fsd:94033'), 1.6)
    return fade(reverse(hp(x, 150)), 0.02, 0.2)


GOATMAN = [
    'woods_night', 'woods_day', 'campfire', 'creek_flow', 'trailer_tone', 'city_night',
    'owl_hoot', 'sizzle_pot', 'pot_lid', 'water_splash', 'footsteps_leaves', 'running_leaves', 'brush_rustle', 'brush_crash',
    'stick_crack', 'rifle_shot', 'trailer_door_open', 'trailer_door_slam', 'trailer_door_bang', 'metal_claw', 'gibbering',
    'animal_scream', 'blind_roll',
]


def main() -> None:
    register_sources()
    names = sys.argv[1:] or GOATMAN
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
