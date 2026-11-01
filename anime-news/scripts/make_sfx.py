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
    """Low synth pulse bed. Length is a whole number of beats so it loops."""
    beat = 60 / bpm
    sec = round(sec / beat) * beat
    loop = sec
    sec += 1.5  # overshoot for the loop crossfade
    t = t_axis(sec)
    f0 = 55.0
    tone = (
        np.sin(2 * np.pi * f0 * t)
        + 0.45 * np.sin(2 * np.pi * f0 * 2.003 * t + 0.4)
        + 0.18 * np.sin(2 * np.pi * f0 * 3.01 * t + 1.1)
    )
    phase = (t % beat) / beat
    env = np.exp(-phase * 3.2) * (1 - np.exp(-phase * 120))  # soft attack, decay per beat
    env = 0.35 + 0.65 * env
    pad = 0.12 * np.sin(2 * np.pi * 220.0 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * t / (beat * 8)))
    left = tone * env + pad
    right = np.roll(tone, 90) * env + pad * 0.9
    write("synth_pulse_bed.wav", seamless(left, loop), seamless(right, loop))


def bass_accent():
    t = t_axis(1.1)
    f = 38 + 34 * np.exp(-t / 0.08)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.32) * (1 - np.exp(-t * 400))
    x += 0.15 * np.sin(2 * ph) * np.exp(-t / 0.12)
    write("bass_accent.wav", x)


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


if __name__ == "__main__":
    radio_click()
    synth_pulse()
    bass_accent()
    water_distant()
    tick_motif()
    print("Procedural PLACEHOLDER SFX written to public/audio/sfx_temp/")
