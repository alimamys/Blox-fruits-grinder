"""Small DSP toolkit shared by the voice post-processor and the procedural SFX builder.

Only numpy + scipy are required. Everything works on float32/float64 numpy arrays,
mono arrays are shape (n,), stereo arrays are shape (n, 2).
"""
from __future__ import annotations

import math
import wave
from typing import Optional

import numpy as np
from scipy import signal

SR = 48000


# ----------------------------------------------------------------------------
# I/O
# ----------------------------------------------------------------------------
def write_wav(path: str, x: np.ndarray, sr: int = SR) -> None:
    """Write 16-bit PCM WAV (mono or stereo) with no external dependency."""
    x = np.asarray(x, dtype=np.float64)
    x = np.clip(x, -1.0, 1.0)
    pcm = (x * 32767.0).astype('<i2')
    channels = 1 if pcm.ndim == 1 else pcm.shape[1]
    with wave.open(path, 'wb') as w:
        w.setnchannels(channels)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def read_wav(path: str) -> tuple[np.ndarray, int]:
    with wave.open(path, 'rb') as w:
        sr = w.getframerate()
        ch = w.getnchannels()
        width = w.getsampwidth()
        raw = w.readframes(w.getnframes())
    if width == 2:
        x = np.frombuffer(raw, dtype='<i2').astype(np.float64) / 32768.0
    elif width == 4:
        x = np.frombuffer(raw, dtype='<i4').astype(np.float64) / 2147483648.0
    else:
        raise ValueError(f'unsupported sample width {width}')
    if ch > 1:
        x = x.reshape(-1, ch)
    return x, sr


def resample(x: np.ndarray, sr_in: int, sr_out: int) -> np.ndarray:
    if sr_in == sr_out:
        return x
    g = math.gcd(sr_in, sr_out)
    return signal.resample_poly(x, sr_out // g, sr_in // g, axis=0)


# ----------------------------------------------------------------------------
# Filters
# ----------------------------------------------------------------------------
def _sos(kind: str, f, sr: int, order: int):
    nyq = sr / 2
    if isinstance(f, (list, tuple)):
        wn = [min(max(v / nyq, 1e-5), 0.999) for v in f]
    else:
        wn = min(max(f / nyq, 1e-5), 0.999)
    return signal.butter(order, wn, btype=kind, output='sos')


def hp(x, f, sr=SR, order=2):
    return signal.sosfilt(_sos('highpass', f, sr, order), x, axis=0)


def lp(x, f, sr=SR, order=2):
    return signal.sosfilt(_sos('lowpass', f, sr, order), x, axis=0)


def bp(x, lo, hi, sr=SR, order=2):
    return signal.sosfilt(_sos('bandpass', [lo, hi], sr, order), x, axis=0)


def biquad(x, kind: str, f: float, gain_db: float = 0.0, q: float = 0.707, sr=SR):
    """RBJ cookbook peaking / lowshelf / highshelf."""
    a = 10 ** (gain_db / 40)
    w0 = 2 * math.pi * f / sr
    alpha = math.sin(w0) / (2 * q)
    cw = math.cos(w0)
    if kind == 'peak':
        b0, b1, b2 = 1 + alpha * a, -2 * cw, 1 - alpha * a
        a0, a1, a2 = 1 + alpha / a, -2 * cw, 1 - alpha / a
    elif kind == 'lowshelf':
        sa = 2 * math.sqrt(a) * alpha
        b0 = a * ((a + 1) - (a - 1) * cw + sa)
        b1 = 2 * a * ((a - 1) - (a + 1) * cw)
        b2 = a * ((a + 1) - (a - 1) * cw - sa)
        a0 = (a + 1) + (a - 1) * cw + sa
        a1 = -2 * ((a - 1) + (a + 1) * cw)
        a2 = (a + 1) + (a - 1) * cw - sa
    elif kind == 'highshelf':
        sa = 2 * math.sqrt(a) * alpha
        b0 = a * ((a + 1) + (a - 1) * cw + sa)
        b1 = -2 * a * ((a - 1) + (a + 1) * cw)
        b2 = a * ((a + 1) + (a - 1) * cw - sa)
        a0 = (a + 1) - (a - 1) * cw + sa
        a1 = 2 * ((a - 1) - (a + 1) * cw)
        a2 = (a + 1) - (a - 1) * cw - sa
    else:
        raise ValueError(kind)
    b = np.array([b0, b1, b2]) / a0
    aa = np.array([1, a1 / a0, a2 / a0])
    return signal.lfilter(b, aa, x, axis=0)


def one_pole_smooth(x: np.ndarray, seconds: float, sr=SR) -> np.ndarray:
    if seconds <= 0:
        return x
    a = math.exp(-1.0 / (seconds * sr))
    return signal.lfilter([1 - a], [1, -a], x, axis=0)


# ----------------------------------------------------------------------------
# Dynamics / colour
# ----------------------------------------------------------------------------
def db(x: float) -> float:
    return 10 ** (x / 20)


def tanh_sat(x, drive=1.5):
    return np.tanh(x * drive) / np.tanh(drive)


def compress(x: np.ndarray, threshold_db=-20.0, ratio=3.0, window=0.012, makeup_db=0.0, sr=SR) -> np.ndarray:
    mono = x if x.ndim == 1 else x.mean(axis=1)
    env = np.sqrt(one_pole_smooth(mono ** 2, window, sr) + 1e-12)
    env_db = 20 * np.log10(env + 1e-9)
    over = np.maximum(0.0, env_db - threshold_db)
    gain_db = -over * (1 - 1 / ratio) + makeup_db
    g = 10 ** (gain_db / 20)
    return x * (g if x.ndim == 1 else g[:, None])


def deess(x: np.ndarray, amount=0.5, sr=SR) -> np.ndarray:
    """Tame harsh TTS sibilance: duck the >5 kHz band when it dominates."""
    mono = x if x.ndim == 1 else x.mean(axis=1)
    hf = hp(mono, 5200, sr, 4)
    env_hf = np.sqrt(one_pole_smooth(hf ** 2, 0.004, sr) + 1e-12)
    env_all = np.sqrt(one_pole_smooth(mono ** 2, 0.004, sr) + 1e-12)
    ratio = env_hf / (env_all + 1e-9)
    reduce = np.clip((ratio - 0.35) * 2.2, 0, 1) * amount
    if x.ndim == 1:
        return x - hf * reduce
    hf2 = hp(x, 5200, sr, 4)
    return x - hf2 * reduce[:, None]


def peak(x) -> float:
    return float(np.max(np.abs(x))) if x.size else 0.0


def limit(x: np.ndarray, ceiling_db=-1.0) -> np.ndarray:
    c = db(ceiling_db)
    p = peak(x)
    if p > c:
        x = x * (c / p)
    return x


def loudness_lufs(x: np.ndarray, sr=SR) -> float:
    try:
        import pyloudnorm as pyln  # type: ignore

        meter = pyln.Meter(sr, block_size=min(0.4, max(0.1, len(x) / sr * 0.9)))
        val = meter.integrated_loudness(x if x.ndim == 1 else x)
        if math.isfinite(val):
            return float(val)
    except Exception:
        pass
    # fallback: K-weight-ish RMS
    y = biquad(hp(x, 60, sr, 2), 'highshelf', 1500, 4, 0.7, sr)
    rms = math.sqrt(float(np.mean(y ** 2)) + 1e-12)
    return 20 * math.log10(rms + 1e-12) - 0.7


def normalize_lufs(x: np.ndarray, target=-19.0, sr=SR) -> np.ndarray:
    cur = loudness_lufs(x, sr)
    if not math.isfinite(cur) or cur < -70:
        return x
    return x * db(target - cur)


# ----------------------------------------------------------------------------
# Space
# ----------------------------------------------------------------------------
def make_ir(seconds=0.6, sr=SR, seed=1, bright=6000.0, early: Optional[list[tuple[float, float]]] = None, predelay=0.0):
    rng = np.random.default_rng(seed)
    n = int(seconds * sr)
    t = np.arange(n) / sr
    tail = rng.standard_normal(n) * np.exp(-6.9 * t / seconds)
    tail = lp(tail, bright, sr, 1)
    ir = np.zeros(n + int(predelay * sr))
    ir[int(predelay * sr):] += tail * 0.5
    for delay, gain in early or []:
        i = int(delay * sr)
        if i < len(ir):
            ir[i] += gain
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    return ir


def reverb(x: np.ndarray, ir: np.ndarray, wet=0.2, dry=1.0) -> np.ndarray:
    if x.ndim == 1:
        w = signal.fftconvolve(x, ir)[: len(x) + len(ir) // 2]
        out = np.zeros(len(w))
        out[: len(x)] += x * dry
        out += w * wet
        return out
    chans = [reverb(x[:, c], ir if c == 0 else np.roll(ir, 37), wet, dry) for c in range(x.shape[1])]
    n = min(len(c) for c in chans)
    return np.stack([c[:n] for c in chans], axis=1)


def pan(x: np.ndarray, p: float) -> np.ndarray:
    """Constant-power pan of a mono signal to stereo. p in -1..1."""
    if x.ndim == 2:
        return x
    p = max(-1.0, min(1.0, p))
    ang = (p + 1) * math.pi / 4
    return np.stack([x * math.cos(ang), x * math.sin(ang)], axis=1) * math.sqrt(2)


def to_stereo(x: np.ndarray) -> np.ndarray:
    return x if x.ndim == 2 else np.stack([x, x], axis=1)


def fade(x: np.ndarray, fin=0.005, fout=0.02, sr=SR) -> np.ndarray:
    x = x.copy()
    a, b = int(fin * sr), int(fout * sr)
    if a > 0 and len(x) > a:
        r = np.linspace(0, 1, a)
        x[:a] *= r if x.ndim == 1 else r[:, None]
    if b > 0 and len(x) > b:
        r = np.linspace(1, 0, b)
        x[-b:] *= r if x.ndim == 1 else r[:, None]
    return x


def trim_silence(x: np.ndarray, sr=SR, thresh_db=-46.0, lead=0.03, tail=0.1) -> np.ndarray:
    mono = x if x.ndim == 1 else x.mean(axis=1)
    env = np.sqrt(one_pole_smooth(mono ** 2, 0.01, sr) + 1e-12)
    ref = np.max(env) + 1e-9
    idx = np.where(env > ref * db(thresh_db))[0]
    if idx.size == 0:
        return x
    s = max(0, idx[0] - int(lead * sr))
    e = min(len(x), idx[-1] + int(tail * sr))
    return fade(x[s:e], 0.004, min(0.06, tail * 0.8), sr)


def time_stretch(x: np.ndarray, factor: float, sr=SR) -> np.ndarray:
    """Pitch-preserving time stretch (factor > 1 = longer/slower) with ffmpeg's
    Rubber Band filter, settings suited to speech. Falls back to atempo."""
    import os
    import subprocess
    import tempfile

    if abs(factor - 1.0) < 0.01:
        return x
    stereo = x.ndim == 2
    with tempfile.TemporaryDirectory() as td:
        src, dst = os.path.join(td, 'in.wav'), os.path.join(td, 'out.wav')
        write_wav(src, x, sr)
        for filt in (f'rubberband=tempo={1 / factor:.5f}:transients=mixed:detector=soft:window=standard:pitchq=quality:channels=together',
                     f'atempo={1 / factor:.5f}'):
            r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', filt, '-ar', str(sr), dst], capture_output=True)
            if r.returncode == 0:
                break
        else:
            return x
        y, _ = read_wav(dst)
    if stereo and y.ndim == 1:
        y = np.stack([y, y], axis=1)
    return y


def pitch_shift_resample(x: np.ndarray, semitones: float, sr=SR) -> np.ndarray:
    """Tape-style shift: pitch AND formants move, duration changes by 2^(-st/12)."""
    if abs(semitones) < 1e-3:
        return x
    factor = 2 ** (semitones / 12)
    # play back `factor` times faster: resample to sr/factor then treat as sr
    up, down = 1000, int(round(1000 * factor))
    return signal.resample_poly(x, up, down, axis=0)


def vibrato(x: np.ndarray, rate=5.0, cents=8.0, amp_depth=0.03, sr=SR, seed=3) -> np.ndarray:
    """Subtle age tremor: modulated delay (pitch) plus a little amplitude flutter.
    Rate drifts slightly so it never sounds like an effect."""
    n = len(x)
    t = np.arange(n) / sr
    rng = np.random.default_rng(seed)
    drift = one_pole_smooth(rng.standard_normal(n), 0.35, sr)
    drift = drift / (np.max(np.abs(drift)) + 1e-9)
    phase = 2 * np.pi * np.cumsum(rate * (1 + 0.18 * drift)) / sr
    dev = (2 ** (cents / 1200) - 1)  # relative frequency deviation
    depth = dev / (2 * np.pi * rate)  # seconds of delay swing
    d = depth * np.sin(phase) * sr + depth * sr + 2
    idx = np.arange(n) - d
    idx = np.clip(idx, 0, n - 1)
    i0 = np.floor(idx).astype(int)
    i1 = np.minimum(i0 + 1, n - 1)
    frac = idx - i0
    y = x[i0] * (1 - frac) + x[i1] * frac
    am = 1 - amp_depth * (0.5 + 0.5 * np.sin(phase * 1.02 + 0.7))
    return y * am


def noise_vocoder(x: np.ndarray, sr=SR, bands=26, seed=7, lo=90.0, hi=9000.0) -> np.ndarray:
    """Channel vocoder with a noise carrier -> intelligible breathy whisper."""
    rng = np.random.default_rng(seed)
    edges = np.geomspace(lo, hi, bands + 1)
    noise = rng.standard_normal(len(x))
    out = np.zeros(len(x))
    for i in range(bands):
        a, b = edges[i], edges[i + 1]
        band = bp(x, a, b, sr, 2)
        env = one_pole_smooth(np.abs(band), 0.008, sr)
        carrier = bp(noise, a, b, sr, 2)
        out += carrier * env
    # whispers have no low end and a lift around 2-5 kHz
    out = hp(out, 220, sr, 2)
    out = biquad(out, 'peak', 3200, 4.0, 0.8, sr)
    return out / (peak(out) + 1e-9) * peak(x)


def colored_noise(n: int, kind='brown', seed=0) -> np.ndarray:
    rng = np.random.default_rng(seed)
    w = rng.standard_normal(n)
    if kind == 'white':
        return w
    if kind == 'pink':
        b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
        a = [1, -2.494956002, 2.017265875, -0.522189400]
        y = signal.lfilter(b, a, w)
        return y / (np.std(y) + 1e-9)
    y = np.cumsum(w)
    y = hp(y, 12, SR, 1)
    return y / (np.std(y) + 1e-9)
