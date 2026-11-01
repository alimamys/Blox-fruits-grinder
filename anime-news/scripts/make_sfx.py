#!/usr/bin/env python3
"""Procedural PLACEHOLDER sound design (original, generated in code).

Writes 48 kHz stereo WAVs to public/audio/sfx_temp/. A licensed or
sound-designed replacement with the same filename in public/audio/sfx/
always takes priority. Deterministic (fixed seeds).

Usage: python3 scripts/make_sfx.py
"""
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "sfx_temp"
SR = 48000


def write(name, left, right=None):
    if right is None:
        right = left
    st = np.stack([left, right], axis=1)
    peak = np.max(np.abs(st)) or 1.0
    st = st / peak * 0.89  # leave headroom; levels are set in the mix
    pcm = (st * 32767).astype(np.int16)
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{name}: {len(left) / SR:.2f}s")


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def seamless(x, loop_sec, xfade_sec=1.5):
    """Crossfade the overshoot back into the head so the file loops without a seam."""
    n, xf = int(loop_sec * SR), int(xfade_sec * SR)
    y = x[:n].copy()
    ramp = np.linspace(0, 1, xf)
    y[:xf] = x[:xf] * ramp + x[n:n + xf] * (1 - ramp)
    return y


def fft_band(x, lo, hi):
    """Zero-phase band-limit via FFT (fast for long buffers)."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    mask = ((f >= lo) & (f <= hi)).astype(float)
    # soft edges
    mask = np.convolve(mask, np.hanning(64) / np.hanning(64).sum(), mode="same")
    return np.fft.irfft(spec * mask, n=len(x))


def reverb(x, seconds=2.4, decay=0.5, wet=0.35, seed=0, lo=90, hi=6500):
    """Stereo convolution reverb with a synthetic hall impulse. Returns (L, R)."""
    rng = np.random.default_rng(100 + seed)
    t = t_axis(seconds)
    out = []
    for ch in range(2):
        ir = rng.standard_normal(len(t)) * np.exp(-t / decay)
        ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))  # pre-delay softening
        ir = fft_band(ir, lo, hi)
        ir /= np.sqrt((ir ** 2).sum())
        n = len(x) + len(ir)
        y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[: len(x)]
        out.append(x * (1 - wet) + y * wet * 3.0)
    return out[0], out[1]


def saw(freq, t, cents=0.0, fmax=3500.0):
    """Band-limited sawtooth."""
    f = freq * 2 ** (cents / 1200)
    y = np.zeros_like(t)
    for k in range(1, int(fmax / f) + 1):
        y += ((-1) ** (k + 1)) * np.sin(2 * np.pi * k * f * t) / k
    return y


def sweep_band(x, centers, width_oct=0.8, block=2048):
    """Time-varying band-pass: centre frequency follows `centers` (Hz, one per block)."""
    hop = block // 2
    win = np.hanning(block)
    y = np.zeros(len(x) + block)
    f = np.fft.rfftfreq(block, 1 / SR)
    nb = (len(x) - block) // hop + 1
    for b in range(nb):
        c = centers[min(b, len(centers) - 1)]
        mask = np.exp(-0.5 * (np.log2(np.maximum(f, 1) / c) / (width_oct / 2)) ** 2)
        seg = x[b * hop: b * hop + block] * win
        y[b * hop: b * hop + block] += np.fft.irfft(np.fft.rfft(seg) * mask, block)
    return y[: len(x)]


def radio_click():
    rng = np.random.default_rng(1)
    t = t_axis(0.42)
    click = np.zeros_like(t)
    click[:60] = np.hanning(120)[60:] * np.sign(np.sin(np.arange(60) * 0.9))
    burst = fft_band(rng.standard_normal(len(t)), 900, 3800) * np.exp(-t / 0.05) * (t > 0.012)
    tail = fft_band(rng.standard_normal(len(t)), 1500, 2600) * np.exp(-(t - 0.2) ** 2 / 0.0015) * 0.15
    x = click * 1.0 + burst * 3.0 + tail
    write("radio_click.wav", x)


def synth_pulse(sec=20.0, bpm=72):
    """Cinematic tension bed: D-minor(add9) string-synth pad in a hall, a low
    72 bpm pulse and a soft heartbeat drum. Whole number of beats so it loops."""
    beat = 60 / bpm
    sec = round(sec / beat) * beat
    loop = sec
    sec += 1.5
    t = t_axis(sec)
    chord = [73.42, 110.0, 146.83, 174.61, 220.0, 329.63]  # D2 A2 D3 F3 A3 E4
    pad = np.zeros_like(t)
    for i, fr in enumerate(chord):
        for c in (-7, 0, 6):
            pad += saw(fr, t, c, fmax=2600) * (0.9 if fr < 150 else 0.55)
    pad = fft_band(pad, 40, 1400)
    pad *= 0.7 + 0.3 * np.sin(2 * np.pi * t / (beat * 8) - 1.2)  # slow swell
    pad /= np.max(np.abs(pad))
    phase = (t % beat) / beat
    pulse = np.sin(2 * np.pi * 55 * t) + 0.4 * np.sin(2 * np.pi * 110.2 * t)
    pulse *= np.exp(-phase * 4.0) * (1 - np.exp(-phase * 90))
    hb = np.zeros_like(t)
    for b in range(int(sec / beat) + 1):
        if b % 2 == 0:
            s0 = int(b * beat * SR)
            n = min(int(0.35 * SR), len(t) - s0)
            if n <= 0:
                continue
            tt = np.arange(n) / SR
            hb[s0:s0 + n] += np.sin(2 * np.pi * (62 + 30 * np.exp(-tt / 0.03)) * tt) * np.exp(-tt / 0.11) * (1.0 if b % 4 == 0 else 0.6)
    dry = pad * 0.55 + pulse * 0.35 + hb * 0.45
    left, right = reverb(dry, 3.0, 0.7, wet=0.45, seed=1)
    write("synth_pulse_bed.wav", seamless(left, loop), seamless(right, loop))


def bass_accent():
    """Brief taiko-like accent with a hall tail (used on cuts)."""
    rng = np.random.default_rng(5)
    t = t_axis(1.8)
    f = 48 + 36 * np.exp(-t / 0.06)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.3) * (1 - np.exp(-t * 600))
    skin = fft_band(rng.standard_normal(len(t)), 180, 1400) * np.exp(-t / 0.025) * 0.5
    left, right = reverb(body + skin, 1.8, 0.45, wet=0.35, seed=2)
    write("bass_accent.wav", left, right)


def whoosh():
    """Air whoosh for panel / title moves; pans left to right."""
    rng = np.random.default_rng(11)
    t = t_axis(1.3)
    n = rng.standard_normal(len(t))
    nb = len(t) // 1024 + 2
    centers = np.concatenate([np.geomspace(350, 3200, nb // 2), np.geomspace(3200, 700, nb - nb // 2)])
    x = sweep_band(n, centers, 1.0)
    env = np.exp(-((t - 0.62) / 0.26) ** 2)
    x *= env
    pan = np.clip(t / 1.3, 0, 1)
    l, r = reverb(x, 1.2, 0.3, wet=0.25, seed=3)
    write("whoosh.wav", l * (1.2 - pan), r * (0.2 + pan))


def riser():
    """Short tension riser into the title."""
    rng = np.random.default_rng(13)
    t = t_axis(2.6)
    nb = len(t) // 1024 + 2
    noise = sweep_band(rng.standard_normal(len(t)), np.geomspace(300, 6000, nb), 0.9)
    f = 180 * (2 ** (t / 2.6 * 2.5))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(2 + t * 9) / SR)
    env = (t / 2.6) ** 2.2 * np.clip((2.6 - t) / 0.04, 0, 1)
    l, r = reverb((noise + tone) * trem * env, 1.5, 0.35, wet=0.3, seed=4)
    write("riser.wav", l, r)


def title_hit():
    """Restrained cinematic impact for the title: deep boom + drum + shimmer."""
    rng = np.random.default_rng(17)
    t = t_axis(3.4)
    f = 34 + 30 * np.exp(-t / 0.09)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9) * (1 - np.exp(-t * 500))
    drum = np.sin(2 * np.pi * np.cumsum(70 + 40 * np.exp(-t / 0.04)) / SR) * np.exp(-t / 0.18)
    shimmer = fft_band(rng.standard_normal(len(t)), 3500, 11000) * np.exp(-t / 0.6) * (1 - np.exp(-t * 30)) * 0.12
    l, r = reverb(boom + drum * 0.6 + shimmer, 3.0, 0.8, wet=0.4, seed=5)
    write("title_hit.wav", l, r)


def glint():
    """Bright metallic glint as the light runs across the title letters."""
    t = t_axis(1.6)
    partials = [(2794, 1.0), (4186, 0.6), (5588, 0.4), (7040, 0.25), (3729, 0.35)]
    x = sum(a * np.sin(2 * np.pi * fr * t + i) for i, (fr, a) in enumerate(partials))
    x *= np.exp(-t / 0.35) * (1 - np.exp(-t * 300))
    l, r = reverb(x, 2.0, 0.6, wet=0.5, seed=6, hi=12000)
    write("glint.wav", l, r)


def bus_rumble(loop=12.0):
    """Interior bus rumble: engine harmonics with RPM wobble, road noise, bumps."""
    rng = np.random.default_rng(19)
    t = t_axis(loop + 1.5)
    rpm = 41 + 2.5 * np.sin(2 * np.pi * t / 6.0) + 0.8 * np.sin(2 * np.pi * t / 1.7)
    ph = 2 * np.pi * np.cumsum(rpm) / SR
    engine = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)
    road = fft_band(rng.standard_normal(len(t)), 40, 380)
    road /= np.max(np.abs(road))
    bumps = np.zeros_like(t)
    for s0 in rng.integers(0, len(t) - SR, 9):
        n = int(0.25 * SR)
        tt = np.arange(n) / SR
        bumps[s0:s0 + n] += np.sin(2 * np.pi * 55 * tt) * np.exp(-tt / 0.06)
    x = engine * 0.35 + road * 0.8 + bumps * 0.5
    write("bus_rumble.wav", seamless(x, loop), seamless(np.roll(x, 400), loop))


def room_tone(loop=12.0):
    """Large empty chamber: soft air and a faint electrical hum."""
    rng = np.random.default_rng(23)
    t = t_axis(loop + 1.5)
    air = fft_band(rng.standard_normal(len(t)), 70, 1600)
    air /= np.max(np.abs(air))
    hum = 0.05 * np.sin(2 * np.pi * 50 * t) + 0.02 * np.sin(2 * np.pi * 100 * t)
    l, r = reverb(air * 0.6 + hum, 2.5, 0.8, wet=0.5, seed=7)
    write("room_tone.wav", seamless(l, loop), seamless(r, loop))


def monitor_hum(loop=12.0):
    """Office at night: monitor hum, faint coil whine, occasional soft key taps."""
    rng = np.random.default_rng(29)
    t = t_axis(loop + 1.5)
    hum = 0.5 * np.sin(2 * np.pi * 60 * t) + 0.25 * np.sin(2 * np.pi * 120 * t) + 0.12 * np.sin(2 * np.pi * 180 * t)
    whine = 0.03 * np.sin(2 * np.pi * 9400 * t)
    keys = np.zeros_like(t)
    for s0 in np.sort(rng.integers(0, len(t) - SR, 14)):
        n = int(0.03 * SR)
        keys[s0:s0 + n] += fft_band(rng.standard_normal(n * 4), 1500, 6000)[:n] * np.exp(-np.arange(n) / SR / 0.006) * 0.8
    air = fft_band(rng.standard_normal(len(t)), 100, 900) * 0.15
    l, r = reverb(hum * 0.4 + whine + keys + air, 0.8, 0.2, wet=0.2, seed=8)
    write("monitor_hum.wav", seamless(l, loop), seamless(r, loop))


def water_distant(sec=25.5):
    rng = np.random.default_rng(7)
    t = t_axis(sec)
    def bed(seed_shift):
        n = rng.standard_normal(len(t))
        brown = np.cumsum(n)
        brown -= np.convolve(brown, np.ones(4801) / 4801, mode="same")  # remove drift
        brown = fft_band(brown, 40, 650)
        swell = 0.55 + 0.45 * np.sin(2 * np.pi * t / 7.3 + seed_shift) * np.sin(2 * np.pi * t / 3.1 + 1.3 * seed_shift)
        lap = fft_band(rng.standard_normal(len(t)), 300, 1400) * np.clip(np.sin(2 * np.pi * t / 5.2 + seed_shift), 0, 1) ** 6 * 0.4
        return brown / np.max(np.abs(brown)) * swell + lap
    write("water_distant.wav", seamless(bed(0.0), 24.0), seamless(bed(1.7), 24.0))


def tick_motif(sec=20.0, bpm=96):
    rng = np.random.default_rng(3)
    t = t_axis(sec)
    x = np.zeros_like(t)
    beat = 60 / bpm
    tick_len = int(0.03 * SR)
    tick_t = np.arange(tick_len) / SR
    base_tick = fft_band(rng.standard_normal(tick_len * 4), 2200, 5200)[:tick_len] * np.exp(-tick_t / 0.006)
    tom_len = int(0.4 * SR)
    tom_t = np.arange(tom_len) / SR
    tom = np.sin(2 * np.pi * (90 + 40 * np.exp(-tom_t / 0.05)) * tom_t) * np.exp(-tom_t / 0.12)
    i = 0
    while i * beat < sec - 1e-6:
        s = int(i * beat * SR)
        acc = 1.0 if i % 4 == 0 else 0.55
        x[s:s + tick_len] += base_tick * acc
        if i % 8 == 4:
            x[s:s + tom_len] += tom * 0.5
        i += 1
    write("tick_motif.wav", x, np.roll(x, 240))


def paper_rustle():
    rng = np.random.default_rng(31)
    t = t_axis(1.2)
    n = fft_band(rng.standard_normal(len(t)), 1500, 9000)
    env = np.zeros_like(t)
    for c in rng.uniform(0.05, 1.0, 14):
        env += np.exp(-((t - c) / 0.03) ** 2) * rng.uniform(0.3, 1.0)
    env *= np.exp(-t / 0.8)
    l, r = reverb(n * env, 0.8, 0.2, wet=0.2, seed=9)
    write("paper_rustle.wav", l, r)


def number_click():
    t = t_axis(0.5)
    x = np.sin(2 * np.pi * 1600 * t) * np.exp(-t / 0.012) + 0.6 * np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.05)
    l, r = reverb(x, 0.8, 0.25, wet=0.3, seed=10)
    write("number_click.wav", l, r)


def _voices(rng, t, n_voices, lo=250, hi=2400):
    out = np.zeros_like(t)
    base = fft_band(rng.standard_normal(len(t)), lo, hi)
    for v in range(n_voices):
        rate = rng.uniform(3.5, 6.5)
        ph = rng.uniform(0, 2 * np.pi)
        syll = np.clip(np.sin(2 * np.pi * rate * t + ph + 1.5 * np.sin(2 * np.pi * 0.3 * t + v)), 0, 1) ** 2
        talk = (np.sin(2 * np.pi * rng.uniform(0.05, 0.15) * t + ph) > -0.2).astype(float)
        out += np.roll(base, rng.integers(0, len(t))) * syll * talk
    return out / n_voices


def crowd_murmur(loop=14.0):
    rng = np.random.default_rng(37)
    t = t_axis(loop + 1.5)
    x = _voices(rng, t, 40)
    steps = np.zeros_like(t)
    for s0 in rng.integers(0, len(t) - SR // 4, 120):
        n = int(0.06 * SR)
        steps[s0:s0 + n] += fft_band(rng.standard_normal(n * 4), 80, 600)[:n] * np.exp(-np.arange(n) / SR / 0.02)
    l, r = reverb(x + steps * 0.4, 1.6, 0.5, wet=0.35, seed=11)
    write("crowd_murmur.wav", seamless(l, loop), seamless(r, loop))


def distant_unrest():
    rng = np.random.default_rng(41)
    t = t_axis(4.5)
    roar = fft_band(_voices(rng, t, 60, 200, 1500), 120, 800)
    roar *= np.sin(np.pi * np.clip(t / 4.5, 0, 1)) ** 1.5
    thuds = np.zeros_like(t)
    for c in (1.3, 2.6):
        s0 = int(c * SR)
        n = int(0.5 * SR)
        tt = np.arange(n) / SR
        thuds[s0:s0 + n] += np.sin(2 * np.pi * 50 * tt) * np.exp(-tt / 0.15) * 0.5
    l, r = reverb(roar + thuds, 2.5, 0.8, wet=0.55, seed=12, hi=2500)
    write("distant_unrest.wav", l, r)


def arrival_ambience(loop=14.0):
    rng = np.random.default_rng(43)
    t = t_axis(loop + 1.5)
    wind = fft_band(rng.standard_normal(len(t)), 60, 500) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 6.5))
    wind /= np.max(np.abs(wind))
    murmur = fft_band(_voices(rng, t, 10), 200, 1800)
    idle = 0.15 * np.sin(2 * np.pi * 38 * t) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.7 * t))
    birds = np.zeros_like(t)
    for c in rng.uniform(0.5, loop, 6):
        s0 = int(c * SR)
        n = int(0.18 * SR)
        tt = np.arange(n) / SR
        birds[s0:s0 + n] += np.sin(2 * np.pi * (3200 + 1400 * np.sin(2 * np.pi * 9 * tt)) * tt) * np.sin(np.pi * tt / tt[-1]) * 0.08
    l, r = reverb(wind * 0.5 + murmur * 0.8 + idle + birds, 2.0, 0.6, wet=0.35, seed=13)
    write("arrival_ambience.wav", seamless(l, loop), seamless(r, loop))


def electronic_pulse(sec=16.0, bpm=120):
    beat = 60 / bpm
    sec = round(sec / beat) * beat
    loop = sec
    t = t_axis(sec + 1.5)
    x = np.zeros_like(t)
    n = int(0.12 * SR)
    tt = np.arange(n) / SR
    blip = np.sin(2 * np.pi * 880 * tt) * np.exp(-tt / 0.03)
    sub = np.sin(2 * np.pi * 55 * tt) * np.exp(-tt / 0.08)
    i = 0
    while i * beat / 2 < sec + 1.4:
        s0 = int(i * beat / 2 * SR)
        m = min(n, len(t) - s0)
        if m > 0:
            x[s0:s0 + m] += blip[:m] * (0.5 if i % 2 else 0.25) * (1.0 if i % 8 == 0 else 0.7)
            if i % 2 == 0:
                x[s0:s0 + m] += sub[:m] * 0.8
        i += 1
    pad = fft_band(saw(110, t, 0, 1500) + saw(110, t, 7, 1500), 60, 900) * 0.05
    l, r = reverb(x + pad, 1.6, 0.4, wet=0.35, seed=14)
    write("electronic_pulse.wav", seamless(l, loop), seamless(r, loop))


def calendar_flip():
    rng = np.random.default_rng(47)
    t = t_axis(0.9)
    nb = len(t) // 1024 + 2
    swish = sweep_band(rng.standard_normal(len(t)), np.geomspace(2000, 6500, nb), 1.2) * np.exp(-((t - 0.25) / 0.1) ** 2)
    slap = fft_band(rng.standard_normal(len(t)), 300, 3000) * np.exp(-np.maximum(t - 0.42, 0) / 0.02) * (t > 0.42) * 0.6
    l, r = reverb(swish + slap, 0.8, 0.2, wet=0.2, seed=15)
    write("calendar_flip.wav", l, r)


def final_tone():
    t = t_axis(6.0)
    chord = [146.83, 220.0, 293.66, 440.0, 659.25]
    x = sum(np.sin(2 * np.pi * fr * t + i) * (0.9 if fr < 300 else 0.45) for i, fr in enumerate(chord))
    x *= (1 - np.exp(-t / 0.6)) * np.exp(-t / 1.8)
    l, r = reverb(x, 3.5, 1.2, wet=0.5, seed=16)
    write("final_tone.wav", l, r)


if __name__ == "__main__":
    radio_click()
    synth_pulse()
    bass_accent()
    water_distant()
    tick_motif()
    whoosh()
    riser()
    title_hit()
    glint()
    bus_rumble()
    room_tone()
    monitor_hum()
    paper_rustle()
    number_click()
    crowd_murmur()
    distant_unrest()
    arrival_ambience()
    electronic_pulse()
    calendar_flip()
    final_tone()
    print("Procedural PLACEHOLDER SFX written to public/audio/sfx_temp/")
