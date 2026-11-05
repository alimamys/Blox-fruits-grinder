#!/usr/bin/env python3
"""Procedural sound design for "The 63rd Passenger".

Every effect is synthesised from noise, oscillators and resonators - no samples,
no downloads. Run with `npm run build-sfx`. Output: public/audio/sfx/*.wav

Replace any file with a real recording of the same name to upgrade it; the
timeline only refers to the file stem.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'voice'))

import numpy as np  # noqa: E402

import dsp  # noqa: E402

SR = 32000
ROOT = HERE.parent.parent
OUT = ROOT / 'public' / 'audio' / 'sfx'
RNG = np.random.default_rng(6363)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def noise(sec, kind='white', seed=None):
    n = int(sec * SR)
    if kind == 'white':
        return (np.random.default_rng(seed) if seed is not None else RNG).standard_normal(n)
    return dsp.colored_noise(n, kind, seed if seed is not None else int(RNG.integers(1e9)))


def env_exp(sec, decay, attack=0.002):
    t = t_axis(sec)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def hp(x, f, o=2):
    return dsp.hp(x, f, SR, o)


def lp(x, f, o=2):
    return dsp.lp(x, f, SR, o)


def bp(x, a, b, o=2):
    return dsp.bp(x, a, b, SR, o)


def norm(x, peak_db=-3.0):
    return x / (dsp.peak(x) + 1e-12) * dsp.db(peak_db)


def place(buf, x, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i]


def stereo(x, p=0.0):
    return dsp.pan(x, p) if x.ndim == 1 else x


def loopify(x, xfade=2.0):
    """Crossfade the tail into the head so the file loops seamlessly."""
    n = int(xfade * SR)
    head, body, tail = x[:n], x[n:-n] if n else x, x[-n:]
    r = np.linspace(0, 1, n)
    r = r if x.ndim == 1 else r[:, None]
    mixed = tail * (1 - r) + head * r
    return np.concatenate([body, mixed]) if n else x


def modal(sec, freqs, decays, amps, exc=None):
    t = t_axis(sec)
    out = np.zeros_like(t)
    for f, d, a in zip(freqs, decays, amps):
        out += a * np.sin(2 * np.pi * f * t + RNG.uniform(0, 6.28)) * np.exp(-t / d)
    if exc is not None:
        out = np.convolve(exc, out)[: len(t)]
    return out


def reverb(x, sec=1.2, wet=0.3, bright=4000, seed=1):
    ir = dsp.make_ir(sec, SR, seed=seed, bright=bright)
    return dsp.reverb(x, ir, wet=wet)


# Long ambience loops carry nothing above ~10 kHz - store them at 24 kHz.
BEDS_24K = {'ocean_ambience', 'ferry_engine', 'wind', 'low_horror_drone', 'bridge_electronics', 'emergency_hum', 'room_tone', 'daylight_ambience', 'crowd_murmur'}


def save(name, x, peak_db=None):
    if peak_db is not None:
        x = norm(x, peak_db)
    x = dsp.limit(x, -0.5)
    OUT.mkdir(parents=True, exist_ok=True)
    sr = SR
    if name in BEDS_24K:
        x, sr = dsp.resample(x, SR, 24000), 24000
    dsp.write_wav(str(OUT / f'{name}.wav'), x, sr)
    print(f'  sfx/{name}.wav  {len(x) / SR:5.2f}s  {"stereo" if x.ndim == 2 else "mono"}')


# ----------------------------------------------------------------------------
# Beds (loops)
# ----------------------------------------------------------------------------
def ocean_ambience(sec=30):
    total = sec + 2
    t = t_axis(total)
    chans = []
    for c in range(2):
        swell = 0.55 + 0.25 * np.sin(2 * np.pi * t / 7.3 + c) + 0.15 * np.sin(2 * np.pi * t / 11.1 + 2 * c) + 0.1 * np.sin(2 * np.pi * t / 4.7)
        low = lp(noise(total, 'brown', 10 + c), 420) * swell
        wash = bp(noise(total, 'white', 20 + c), 350, 1800) * np.clip(swell - 0.55, 0, 1) ** 2 * 1.4
        lap = np.zeros_like(t)
        for _ in range(int(total * 0.8)):
            at = RNG.uniform(0, total - 1)
            d = RNG.uniform(0.15, 0.5)
            burst = bp(noise(d, 'white'), RNG.uniform(250, 500), RNG.uniform(900, 1600)) * np.hanning(int(d * SR))
            place(lap, burst * RNG.uniform(0.05, 0.18), at)
        chans.append(low * 1.0 + wash * 0.35 + lap)
    x = np.stack(chans, axis=1)
    save('ocean_ambience', loopify(x), -6)


def ferry_engine(sec=20):
    total = sec + 2
    t = t_axis(total)
    f0 = 31.0 * (1 + 0.004 * np.sin(2 * np.pi * t / 3.1))
    ph = 2 * np.pi * np.cumsum(f0) / SR
    firing = 0.75 + 0.25 * np.sin(2 * np.pi * 7.8 * t) ** 2
    tone = (np.sin(ph) + 0.6 * np.sin(2 * ph) + 0.45 * np.sin(3 * ph + 1) + 0.3 * np.sin(4 * ph) + 0.12 * np.sin(6 * ph)) * firing
    rumble = lp(noise(total, 'brown', 31), 180) * 0.8
    whine = bp(noise(total, 'white', 32), 820, 1000) * 0.03
    mech = bp(noise(total, 'white', 33), 1800, 3500) * (0.5 + 0.5 * np.sin(2 * np.pi * 15.6 * t) ** 8) * 0.015
    x = tone * 0.35 + rumble + whine + mech
    x = lp(x, 1600)
    save('ferry_engine', loopify(x), -6)


def engine_sweep(name, sec, f_start, f_end, a_start, a_end, surge=False):
    t = t_axis(sec)
    k = t / sec
    f = 31 * (f_start + (f_end - f_start) * (1 - (1 - k) ** 2 if f_end > f_start else k ** 0.7))
    ph = 2 * np.pi * np.cumsum(f) / SR
    amp = a_start + (a_end - a_start) * k
    if surge:
        amp = amp * (1 + 0.5 * np.exp(-((k - 0.55) ** 2) / 0.02))
    tone = np.sin(ph) + 0.6 * np.sin(2 * ph) + 0.45 * np.sin(3 * ph) + 0.25 * np.sin(4 * ph)
    rumble = lp(noise(sec, 'brown', 41), 200)
    x = (tone * 0.35 + rumble * 0.8) * amp
    x = lp(x, 1400)
    x = dsp.fade(x, 0.05, 0.4, SR)
    save(name, stereo(x, 0), -4)


def wind(sec=24):
    total = sec + 2
    t = t_axis(total)
    chans = []
    for c in range(2):
        g1 = 0.5 + 0.5 * np.sin(2 * np.pi * t / 6.3 + c * 1.3) ** 2
        g2 = 0.4 + 0.6 * np.clip(np.sin(2 * np.pi * t / 9.7 + c), 0, 1) ** 3
        a = bp(noise(total, 'pink', 50 + c), 250, 700) * g1
        b = bp(noise(total, 'pink', 60 + c), 700, 1600) * g2 * 0.6
        whistle = bp(noise(total, 'white', 70 + c), 1150, 1260, 2) * g2 ** 2 * 0.25
        chans.append(a + b + whistle + lp(noise(total, 'brown', 80 + c), 120) * 0.3)
    save('wind', loopify(np.stack(chans, axis=1)), -6)


def low_horror_drone(sec=30):
    total = sec + 3
    t = t_axis(total)
    x = np.zeros_like(t)
    for f, a in [(41.2, 1.0), (41.85, 0.8), (55.0, 0.45), (61.7, 0.3), (82.4, 0.15)]:
        x += a * np.sin(2 * np.pi * f * t + RNG.uniform(0, 6))
    swell = 0.6 + 0.4 * np.sin(2 * np.pi * t / 13.0) ** 2
    air = lp(noise(total, 'brown', 90), 380) * 0.6 * swell
    eerie = np.sin(2 * np.pi * 659.3 * t) * 0.012 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 5.3))
    y = (x * 0.4 + air) * swell + eerie
    st = np.stack([y, np.roll(y, 640)], axis=1)
    save('low_horror_drone', loopify(st, 3.0), -6)


def bridge_electronics(sec=20):
    total = sec + 2
    t = t_axis(total)
    fan = lp(noise(total, 'brown', 100), 300) * 0.5 + bp(noise(total, 'white', 101), 300, 900) * 0.05
    hum = (np.sin(2 * np.pi * 120 * t) + 0.3 * np.sin(2 * np.pi * 240 * t)) * 0.03
    x = fan + hum
    for at in np.arange(1.0, total - 1, 4.3):
        beep = np.sin(2 * np.pi * 2093 * t_axis(0.07)) * np.hanning(int(0.07 * SR)) * 0.06
        place(x, beep, at)
    for at in np.arange(0.5, total - 1, 2.5):
        tick = hp(noise(0.004, 'white'), 3000) * 0.05
        place(x, tick, at)
    save('bridge_electronics', loopify(x), -10)


def emergency_hum(sec=10):
    total = sec + 1
    t = t_axis(total)
    saw = 2 * ((100 * t) % 1) - 1
    x = bp(saw, 90, 1200) * 0.4 + np.sin(2 * np.pi * 100 * t) * 0.3
    x *= 1 + 0.05 * np.sin(2 * np.pi * 0.7 * t)
    save('emergency_hum', loopify(x, 1.0), -10)


def room_tone(sec=20):
    total = sec + 2
    t = t_axis(total)
    x = lp(noise(total, 'brown', 120), 500) * 0.6 + bp(noise(total, 'pink', 121), 200, 2000) * 0.05
    x += np.sin(2 * np.pi * 50 * t) * 0.02
    save('room_tone', loopify(x), -14)


def daylight_ambience(sec=24):
    total = sec + 2
    t = t_axis(total)
    chans = []
    for c in range(2):
        traffic = lp(noise(total, 'brown', 130 + c), 260) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 8.0 + c))
        air = bp(noise(total, 'pink', 140 + c), 300, 2500) * 0.08
        chans.append(traffic * 0.5 + air)
    x = np.stack(chans, axis=1)
    for _ in range(int(total / 2.2)):
        at = RNG.uniform(0.2, total - 1)
        n = int(RNG.integers(2, 5))
        f0 = RNG.uniform(2800, 4200)
        p = RNG.uniform(-0.8, 0.8)
        for k in range(n):
            d = RNG.uniform(0.05, 0.11)
            tt = t_axis(d)
            f = f0 * (1 + 0.25 * np.sin(np.pi * tt / d)) * RNG.uniform(0.95, 1.05)
            chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(len(tt)) * 0.05
            place(x, stereo(chirp, p), at + k * RNG.uniform(0.09, 0.16))
    save('daylight_ambience', loopify(x), -12)


def crowd_murmur_fallback(sec=30):
    """Only used when the TTS crowd bed has not been generated."""
    if (OUT / 'crowd_murmur.wav').exists():
        return
    total = sec + 2
    t = t_axis(total)
    chans = []
    for c in range(2):
        syl = np.clip(np.sin(2 * np.pi * 3.7 * t + noise(total, 'brown', 150 + c) * 0.8), 0, 1)
        x = bp(noise(total, 'pink', 160 + c), 250, 1800) * (0.4 + 0.6 * syl)
        chans.append(lp(x, 1500))
    save('crowd_murmur', loopify(np.stack(chans, axis=1)), -14)


# ----------------------------------------------------------------------------
# Hull impacts
# ----------------------------------------------------------------------------
def impact(sec=3.5, f_hi=78, f_lo=31, strength=1.0, ring=1.0, seed=0):
    t = t_axis(sec)
    f = f_lo + (f_hi - f_lo) * np.exp(-t / 0.12)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.75)
    body = lp(noise(sec, 'white', 200 + seed), 400, 4) * np.exp(-t / 0.05) * 1.4
    hull = modal(sec, [118, 187, 263, 342, 517], [1.6, 1.2, 0.9, 0.7, 0.45], [0.18, 0.14, 0.1, 0.07, 0.04]) * ring
    boom = lp(noise(sec, 'brown', 210 + seed), 160) * np.exp(-t / 1.1) * 0.5
    x = (sub * 1.2 + body + hull + boom) * strength
    return lp(x, 2200)


def impact_hull():
    for name, p in (('impact_hull', 0.0), ('impact_hull_l', -0.6), ('impact_hull_r', 0.6)):
        x = impact(seed=int((p + 1) * 10))
        x = reverb(x, 1.6, 0.25, 900)
        save(name, stereo(x, p), -1.0)


def knocking_hull(sec=10):
    buf = np.zeros((int(sec * SR), 2))
    t = 0.15
    i = 0
    while t < sec - 0.6:
        group = int(RNG.choice([1, 1, 2, 3]))
        p = RNG.uniform(-0.9, 0.9)
        for g in range(group):
            k = impact(0.7, RNG.uniform(70, 120), RNG.uniform(40, 60), RNG.uniform(0.25, 0.65), 0.6, seed=i)
            k = dsp.fade(k, 0.001, 0.2, SR)
            place(buf, stereo(k, p), t + g * RNG.uniform(0.16, 0.24))
            i += 1
        density = 0.65 - 0.45 * (t / sec)
        t += RNG.uniform(0.12, 0.25) + density * RNG.uniform(0.2, 0.7)
    buf = dsp.reverb(buf, dsp.make_ir(1.2, SR, seed=5, bright=900), wet=0.25)
    save('knocking_hull', buf, -2)


def scratch_hull(sec=3.0):
    buf = np.zeros((int(sec * SR), 2))
    for k, (at, p) in enumerate([(0.05, -0.5), (0.95, 0.4), (1.85, -0.1)]):
        d = 0.75
        tt = t_axis(d)
        grit = np.abs(lp(noise(d, 'white', 300 + k), 160)) ** 1.5
        center = 900 + 1400 * tt / d  # rising - climbing
        x = np.zeros_like(tt)
        raw = noise(d, 'white', 310 + k)
        for j in range(6):
            sl = slice(int(j * len(tt) / 6), int((j + 1) * len(tt) / 6))
            c = float(np.mean(center[sl]))
            x[sl] = bp(raw, c * 0.7, c * 1.5)[sl]
        x = x * grit * np.hanning(len(tt)) ** 0.5
        ring = modal(d, [612, 941, 1387], [0.25, 0.2, 0.15], [0.05, 0.04, 0.03])
        x = x + np.convolve(x, ring[: int(0.05 * SR)])[: len(x)] * 0.02
        place(buf, stereo(x, p), at)
    buf = dsp.reverb(buf, dsp.make_ir(0.9, SR, seed=7, bright=2500), wet=0.25)
    save('scratch_hull', buf, -3)


# ----------------------------------------------------------------------------
# Electrical / PA / radio / phone
# ----------------------------------------------------------------------------
def click(sec=0.01, f=3000):
    return hp(noise(sec, 'white'), f) * np.hanning(int(sec * SR))


def pa_static():
    sec = 1.5
    t = t_axis(sec)
    x = np.zeros_like(t)
    place(x, click(0.012, 800) * 1.5, 0.0)
    place(x, lp(noise(0.06, 'white'), 300) * np.hanning(int(0.06 * SR)) * 1.2, 0.0)
    hiss = hp(noise(sec, 'white', 400), 2000) * 0.18
    crackle = np.zeros_like(t)
    for _ in range(90):
        place(crackle, click(0.002, 1500) * RNG.uniform(0.2, 1.0), RNG.uniform(0.02, sec - 0.05))
    hum = np.sin(2 * np.pi * 50 * t) * 0.12 + np.sin(2 * np.pi * 150 * t) * 0.05
    e = np.clip(t / 0.02, 0, 1) * np.clip((sec - t) / 0.3, 0, 1)
    x += (hiss + crackle * 0.6 + hum) * e
    x = bp(x, 200, 6000)
    save('pa_static', x, -4)


def pa_click():
    x = np.zeros(int(0.3 * SR))
    place(x, click(0.01, 600) * 1.0, 0.0)
    place(x, lp(noise(0.08, 'white'), 250) * np.hanning(int(0.08 * SR)) * 0.8, 0.005)
    save('pa_click', x, -4)


def marine_radio():
    sec = 0.5
    t = t_axis(sec)
    burst = bp(noise(sec, 'white', 500), 700, 4500) * np.exp(-t / 0.12)
    x = burst
    place(x, click(0.006, 1000) * 1.2, 0.0)
    save('marine_radio', x, -5)


def radio_static(sec=6):
    t = t_axis(sec)
    x = bp(noise(sec, 'white', 510), 500, 3500) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 0.7 * t)))
    for _ in range(140):
        place(x, click(0.002, 1200) * RNG.uniform(0.5, 2.0), RNG.uniform(0, sec - 0.01))
    x = dsp.fade(x, 0.05, 0.3, SR)
    save('radio_static', x, -8)


def tone(f, sec, decay=0.25, harm=((1, 1.0),)):
    t = t_axis(sec)
    x = sum(a * np.sin(2 * np.pi * f * h * t) for h, a in harm)
    return x * np.clip(t / 0.005, 0, 1) * np.exp(-t / decay)


def phone_filter(x):
    return bp(x, 400, 7000)


def phone_alert():
    x = np.zeros(int(1.0 * SR))
    place(x, tone(1318.5, 0.5, 0.18, ((1, 1), (2, 0.2))), 0.0)
    place(x, tone(1975.5, 0.6, 0.25, ((1, 1), (2, 0.15))), 0.13)
    save('phone_alert', phone_filter(x), -6)


def phone_vibrate():
    sec = 1.1
    t = t_axis(sec)
    buzz = np.sign(np.sin(2 * np.pi * 165 * t)) * 0.5 + np.sin(2 * np.pi * 330 * t) * 0.3
    gate = ((t % 0.55) < 0.38).astype(float)
    gate = dsp.one_pole_smooth(gate, 0.01, SR)
    x = lp(buzz * gate, 900) + bp(noise(sec, 'white', 530), 120, 400) * gate * 0.2
    save('phone_vibrate', x, -8)


def phone_ring():
    sec = 4.6
    x = np.zeros(int(sec * SR))
    notes = [1046.5, 1318.5, 1568.0, 1318.5, 1760.0, 1568.0]
    for rep in range(2):
        for k, f in enumerate(notes):
            place(x, tone(f, 0.4, 0.14, ((1, 1), (3.98, 0.12), (2, 0.1))), rep * 2.3 + k * 0.17)
    save('phone_ring', phone_filter(x), -6)


def phone_off():
    x = np.zeros(int(0.8 * SR))
    place(x, tone(880, 0.3, 0.12), 0)
    place(x, tone(587, 0.4, 0.15), 0.12)
    save('phone_off', phone_filter(x) * 0.8, -9)


def phone_on():
    x = np.zeros(int(0.9 * SR))
    place(x, tone(587, 0.3, 0.12), 0)
    place(x, tone(880, 0.5, 0.2), 0.14)
    save('phone_on', phone_filter(x), -10)


def emergency_alarm(sec=7):
    t = t_axis(sec)
    f = np.where((t % 1.0) < 0.5, 660.0, 880.0)
    sq = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    x = lp(bp(sq, 400, 3000), 2500) * 0.5
    x = reverb(lp(x, 1800), 1.8, 0.5, 2000)
    save('emergency_alarm', dsp.fade(x, 0.02, 0.5, SR), -8)


def light_flicker():
    sec = 0.9
    t = t_axis(sec)
    saw = 2 * ((120 * t) % 1) - 1
    buzz = bp(saw, 100, 4000)
    gate = np.zeros_like(t)
    for a, b in [(0.0, 0.07), (0.11, 0.15), (0.2, 0.34), (0.42, 0.45)]:
        gate[int(a * SR): int(b * SR)] = 1
    gate = dsp.one_pole_smooth(gate, 0.003, SR)
    x = buzz * gate * 0.6
    for at in (0.0, 0.11, 0.2, 0.42):
        place(x, click(0.004, 1500) * 0.8, at)
    save('light_flicker', x, -5)


def lights_off():
    sec = 1.6
    t = t_axis(sec)
    x = np.zeros_like(t)
    place(x, lp(noise(0.12, 'white'), 300) * np.exp(-t_axis(0.12) / 0.03) * 2.0, 0.0)
    place(x, click(0.01, 800) * 1.5, 0.0)
    f = 100 * np.exp(-t / 0.5)
    hum = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.4) * 0.5
    x += hum
    save('lights_off', reverb(x, 1.0, 0.3, 1500), -3)


def lights_on():
    sec = 1.3
    x = np.zeros(int(sec * SR))
    place(x, lp(noise(0.08, 'white'), 400) * np.exp(-t_axis(0.08) / 0.02) * 1.5, 0.0)
    place(x, click(0.008, 900), 0.0)
    place(x, tone(3520, 1.0, 0.35) * 0.08, 0.05)
    t = t_axis(sec)
    x += (np.sin(2 * np.pi * 100 * t) * 0.1) * np.clip((t - 0.05) / 0.2, 0, 1) * np.exp(-t / 1.5)
    save('lights_on', x, -5)


def power_down():
    sec = 2.8
    t = t_axis(sec)
    f = 20 + 110 * np.exp(-t / 0.6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    whine = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * np.exp(-t / 0.9)
    x = whine * 0.5
    place(x, lp(noise(0.15, 'white'), 250) * np.exp(-t_axis(0.15) / 0.04) * 2.0, 0.0)
    place(x, click(0.012, 700) * 1.2, 0.0)
    save('power_down', reverb(x, 1.4, 0.3, 1200), -2)


def cable_pull():
    sec = 0.8
    x = np.zeros(int(sec * SR))
    place(x, click(0.01, 900) * 1.5, 0.0)
    for _ in range(25):
        place(x, click(0.0015, 2500) * RNG.uniform(0.2, 0.8), RNG.uniform(0.01, 0.3))
    place(x, lp(noise(0.1, 'white'), 300) * np.hanning(int(0.1 * SR)) * 0.6, 0.0)
    save('cable_pull', x, -4)


def glitch():
    sec = 0.55
    x = np.zeros(int(sec * SR))
    at = 0.0
    while at < sec - 0.05:
        d = RNG.uniform(0.01, 0.05)
        seg = np.round(noise(d, 'white') * 3) / 3 if RNG.random() < 0.5 else np.sign(np.sin(2 * np.pi * RNG.uniform(200, 2000) * t_axis(d)))
        place(x, seg * RNG.uniform(0.2, 0.7), at)
        at += d + RNG.uniform(0, 0.03)
    save('glitch', bp(x, 300, 9000), -8)


def cctv_static():
    sec = 2.0
    t = t_axis(sec)
    x = hp(noise(sec, 'white', 600), 1500) * 0.3 + np.sign(np.sin(2 * np.pi * 60 * t)) * 0.03
    save('cctv_static', dsp.fade(x, 0.01, 0.3, SR), -10)


def ui_click():
    x = np.zeros(int(0.12 * SR))
    place(x, click(0.004, 2000), 0.0)
    place(x, tone(1800, 0.05, 0.01) * 0.3, 0.0)
    save('ui_click', x, -8)


def ui_refresh():
    x = np.zeros(int(0.6 * SR))
    place(x, tone(1200, 0.15, 0.05) * 0.5, 0.0)
    place(x, tone(1600, 0.2, 0.07) * 0.5, 0.09)
    save('ui_refresh', x, -10)


def data_transfer():
    sec = 2.5
    x = np.zeros(int(sec * SR))
    at = 0.0
    while at < sec - 0.05:
        d = RNG.uniform(0.02, 0.07)
        place(x, tone(RNG.uniform(900, 2600), d, d) * 0.3, at)
        at += d + RNG.uniform(0.005, 0.03)
    save('data_transfer', bp(x, 500, 4000), -12)


# ----------------------------------------------------------------------------
# Bodies, rooms, objects
# ----------------------------------------------------------------------------
def breath(kind, gender):
    lo, hi = (450, 2600) if gender == 'm' else (650, 3400)

    def puff(d, inhale=True, amp=1.0, shake=0.0, seed=0):
        tt = t_axis(d)
        e = np.sin(np.pi * tt / d) ** (1.6 if inhale else 1.2)
        if shake:
            m = lp(noise(d, 'white', seed + 99), 18)
            m = np.abs(m) / (np.std(m) + 1e-9)
            e *= 1 - shake * (0.5 + 0.5 * np.sin(2 * np.pi * RNG.uniform(6, 9) * tt + RNG.uniform(0, 6))) * np.clip(m - 0.4, 0, 1)
        n = bp(noise(d, 'white', seed), lo if inhale else lo * 0.7, hi if inhale else hi * 0.75)
        n = dsp.biquad(n, 'peak', 1200 if gender == 'm' else 1600, 5, 1.5, SR)
        return n * e * amp

    if kind == 'shaky_inhale':
        x = puff(0.9, True, 1.0, 0.6, 1)
    elif kind == 'sharp_inhale':
        x = puff(0.32, True, 1.0, 0.0, 2)
    elif kind == 'exhale':
        x = puff(0.85, False, 0.8, 0.1, 3)
    elif kind == 'fast':
        x = np.zeros(int(1.6 * SR))
        for i in range(4):
            place(x, puff(0.22, True, 0.7, 0.2, 10 + i), i * 0.4)
            place(x, puff(0.17, False, 0.8, 0.1, 20 + i), i * 0.4 + 0.21)
    elif kind == 'ragged':
        x = np.zeros(int(2.2 * SR))
        at = 0.0
        for i in range(5):
            d = RNG.uniform(0.18, 0.3)
            place(x, puff(d, True, RNG.uniform(0.6, 1.0), 0.7, 30 + i), at)
            at += d + 0.02
            d2 = RNG.uniform(0.15, 0.25)
            place(x, puff(d2, False, RNG.uniform(0.6, 0.9), 0.4, 40 + i), at)
            at += d2 + RNG.uniform(0.02, 0.1)
    elif kind == 'crying':
        x = np.zeros(int(1.8 * SR))
        place(x, puff(0.12, True, 0.8, 0.0, 50), 0.0)
        place(x, puff(0.1, True, 0.7, 0.0, 51), 0.16)
        place(x, puff(0.14, True, 0.9, 0.0, 52), 0.3)
        place(x, puff(0.9, False, 0.7, 0.8, 53), 0.48)
    else:
        raise ValueError(kind)
    return x


def all_breaths():
    for kind in ('shaky_inhale', 'sharp_inhale', 'exhale', 'fast', 'ragged', 'crying'):
        for g in ('m', 'f'):
            save(f'breath_{kind}_{g}', breath(kind, g), -9)


def scream(sec=1.8, f0=520.0, female=True, seed=0):
    rng = np.random.default_rng(seed)
    t = t_axis(sec)
    contour = f0 * (0.82 + 0.3 * np.sin(np.pi * np.clip(t / sec, 0, 1)) ** 0.7)
    contour *= 1 + 0.02 * np.sin(2 * np.pi * 6.2 * t) + 0.012 * lp(rng.standard_normal(len(t)), 30)
    ph = np.cumsum(contour) / SR
    src = 2 * (ph % 1) - 1  # sawtooth glottal-ish source
    src += 0.25 * rng.standard_normal(len(t))
    formants = [(850, 120), (1250, 150), (2900, 220), (3600, 300)] if female else [(720, 110), (1100, 140), (2500, 200), (3300, 260)]
    y = np.zeros_like(t)
    for (f, bw), g in zip(formants, (1.0, 0.7, 0.35, 0.2)):
        y += bp(src, f - bw, f + bw) * g
    e = np.clip(t / 0.08, 0, 1) * np.clip((sec - t) / 0.5, 0, 1)
    return y * e


def scream_distant():
    x = scream(2.0, 560, True, 1)
    place(x, scream(1.6, 610, True, 2) * 0.4, 0.25)
    x = np.concatenate([x, np.zeros(int(1.0 * SR))])
    x = lp(x, 2400)
    x = reverb(x, 2.2, 0.6, 2000)
    save('scream_distant', stereo(x, 0.35), -6)


def screams_crowd():
    sec = 3.6
    buf = np.zeros((int(sec * SR), 2))
    voices = [(560, True), (480, True), (620, True), (330, False), (300, False), (700, True)]
    for i, (f, fem) in enumerate(voices):
        d = RNG.uniform(1.0, 1.8)
        s = scream(d, f * RNG.uniform(0.9, 1.1), fem, 10 + i) * RNG.uniform(0.4, 1.0)
        place(buf, stereo(lp(s, 2600), RNG.uniform(-0.8, 0.8)), RNG.uniform(0.0, 0.9))
    buf = dsp.reverb(buf, dsp.make_ir(1.4, SR, seed=9, bright=2600), wet=0.45)
    save('screams_crowd', buf, -4)


def step(strength=1.0, seed=0):
    d = 0.35
    tt = t_axis(d)
    thump = lp(noise(d, 'white', 700 + seed), 260) * np.exp(-tt / 0.025) * 1.5
    ring = modal(d, [410, 660, 1020], [0.12, 0.08, 0.06], [0.05, 0.035, 0.02])
    heel = hp(noise(d, 'white', 720 + seed), 1500) * np.exp(-tt / 0.006) * 0.25
    return (thump + ring + heel) * strength


def footsteps(name, sec, rate, people=1, strength=1.0):
    buf = np.zeros((int(sec * SR), 2))
    for p in range(people):
        pan_p = RNG.uniform(-0.7, 0.7) if people > 1 else 0.0
        at = RNG.uniform(0, 0.2)
        k = 0
        while at < sec - 0.3:
            place(buf, stereo(step(strength * RNG.uniform(0.7, 1.0), seed=k + 31 * p), pan_p), at)
            at += 1 / rate * RNG.uniform(0.9, 1.1)
            k += 1
    buf = dsp.reverb(buf, dsp.make_ir(0.7, SR, seed=11, bright=3000), wet=0.25)
    save(name, buf, -5)


def slap():
    x = np.zeros(int(0.6 * SR))
    place(x, hp(noise(0.03, 'white'), 1200) * np.exp(-t_axis(0.03) / 0.006) * 1.5, 0.0)
    place(x, lp(noise(0.05, 'white'), 500) * np.exp(-t_axis(0.05) / 0.01), 0.0)
    save('slap', reverb(x, 0.5, 0.2, 5000), -1)


def metal_door():
    sec = 1.6
    x = np.zeros(int(sec * SR))
    place(x, click(0.008, 1500) * 1.2, 0.0)
    creak_t = t_axis(0.5)
    imp = np.zeros_like(creak_t)
    for i in range(0, len(imp), int(SR / RNG.uniform(30, 55))):
        imp[i] = RNG.uniform(0.5, 1.0)
    creak = np.convolve(imp, modal(0.08, [530, 870, 1240], [0.03, 0.025, 0.02], [1, 0.7, 0.4]))[: len(imp)]
    place(x, creak * 0.4, 0.05)
    thunk = impact(0.9, 120, 60, 0.6, 0.8, seed=5)
    place(x, thunk, 0.62)
    save('metal_door', reverb(x, 0.9, 0.25, 2500), -3)


def metal_creak():
    sec = 2.4
    t = t_axis(sec)
    imp = np.zeros_like(t)
    pos = 0.0
    while pos < sec - 0.05:
        rate = 18 + 40 * np.sin(np.pi * pos / sec)
        imp[int(pos * SR)] = RNG.uniform(0.3, 1.0)
        pos += 1 / rate * RNG.uniform(0.7, 1.3)
    res = modal(0.25, [311, 523, 847, 1213, 1729], [0.2, 0.15, 0.1, 0.08, 0.06], [1, 0.6, 0.4, 0.25, 0.15])
    x = np.convolve(imp, res)[: len(t)] * np.sin(np.pi * t / sec) ** 0.5
    x = lp(x, 3000)
    save('metal_creak', reverb(x, 1.6, 0.35, 2000), -6)


def water_splash():
    sec = 1.4
    x = np.zeros(int(sec * SR))
    place(x, bp(noise(0.5, 'white'), 400, 3000) * np.exp(-t_axis(0.5) / 0.12), 0.0)
    for _ in range(12):
        d = RNG.uniform(0.02, 0.05)
        tt = t_axis(d)
        f = RNG.uniform(600, 1500) * (1 + 2 * tt / d)
        place(x, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(len(tt)) * 0.3, RNG.uniform(0.05, 0.9))
    save('water_splash', x, -4)


def water_lap(sec=8):
    t = t_axis(sec)
    x = bp(noise(sec, 'pink', 800), 180, 900) * (0.2 + 0.8 * np.clip(np.sin(2 * np.pi * t / 3.3), 0, 1) ** 3)
    for _ in range(10):
        d = RNG.uniform(0.02, 0.04)
        tt = t_axis(d)
        f = RNG.uniform(500, 1100) * (1 + 1.5 * tt / d)
        place(x, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.hanning(len(tt)) * 0.15, RNG.uniform(0.2, sec - 0.2))
    save('water_lap', stereo(dsp.fade(x, 0.3, 1.0, SR), 0), -10)


def heartbeat(sec=4.5):
    x = np.zeros(int(sec * SR))
    at = 0.1
    while at < sec - 0.5:
        for off, g in ((0.0, 1.0), (0.24, 0.7)):
            tt = t_axis(0.18)
            b = np.sin(2 * np.pi * 52 * tt) * np.exp(-tt / 0.05) * g
            place(x, b, at + off)
        at += 60 / 76
    save('heartbeat', lp(x, 200), -4)


def title_hit():
    sec = 4.5
    t = t_axis(sec)
    f = 34 + 40 * np.exp(-t / 0.25)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.4)
    body = lp(noise(sec, 'brown', 900), 120) * np.exp(-t / 1.0) * 0.6
    x = boom + body
    place(x, lp(noise(0.2, 'white'), 600) * np.exp(-t_axis(0.2) / 0.03), 0.0)
    save('title_hit', stereo(reverb(x, 2.5, 0.35, 700), 0), -1)


def bass_hit():
    sec = 2.0
    t = t_axis(sec)
    f = 38 + 30 * np.exp(-t / 0.15)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.6)
    save('bass_hit', stereo(lp(x, 300), 0), -2)


def ferry_horn():
    sec = 4.2
    t = t_axis(sec)
    e = np.clip(t / 0.35, 0, 1) * np.clip((3.0 - t) / 0.6, 0, 1)
    saw = lambda f: 2 * ((f * t) % 1) - 1  # noqa: E731
    x = (saw(98) + 0.7 * saw(147) + 0.3 * saw(196.5)) * e
    x = lp(x, 900, 2)
    x = dsp.biquad(x, 'peak', 420, 6, 1.2, SR)
    x = reverb(lp(x, 1500), 3.0, 0.55, 1500)
    save('ferry_horn', stereo(x, -0.2), -4)


def ring_clink():
    x = modal(0.9, [3211, 5127, 7433, 9001], [0.25, 0.18, 0.12, 0.08], [1, 0.6, 0.35, 0.2])
    x[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    save('ring_clink', x, -10)


def page_flip():
    sec = 0.6
    t = t_axis(sec)
    x = bp(noise(sec, 'white'), 900, 6000) * np.sin(np.pi * t / sec) ** 2 * (0.6 + 0.4 * np.abs(lp(noise(sec, 'white'), 40)))
    save('page_flip', x, -10)


def main():
    print('Building procedural SFX ->', OUT.relative_to(ROOT))
    ocean_ambience()
    ferry_engine()
    engine_sweep('engine_slowdown', 7.0, 1.0, 0.45, 1.0, 0.25)
    engine_sweep('engine_roar', 5.0, 0.45, 1.05, 0.3, 1.0, surge=True)
    wind()
    low_horror_drone()
    bridge_electronics()
    emergency_hum()
    room_tone()
    daylight_ambience()
    crowd_murmur_fallback()
    impact_hull()
    knocking_hull()
    scratch_hull()
    pa_static()
    pa_click()
    marine_radio()
    radio_static()
    phone_alert()
    phone_vibrate()
    phone_ring()
    phone_off()
    phone_on()
    emergency_alarm()
    light_flicker()
    lights_off()
    lights_on()
    power_down()
    cable_pull()
    glitch()
    cctv_static()
    ui_click()
    ui_refresh()
    data_transfer()
    all_breaths()
    scream_distant()
    screams_crowd()
    footsteps('footsteps_walk', 3.0, 1.9, 1, 0.7)
    footsteps('footsteps_running', 3.0, 4.2, 3, 1.0)
    slap()
    metal_door()
    metal_creak()
    water_splash()
    water_lap()
    heartbeat()
    title_hit()
    bass_hit()
    ferry_horn()
    ring_clink()
    page_flip()


if __name__ == '__main__':
    main()
