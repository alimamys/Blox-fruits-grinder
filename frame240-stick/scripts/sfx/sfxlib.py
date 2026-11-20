"""Small DSP + source toolkit for scripts/sfx/build_real_sfx.py.

Everything works on float64 numpy arrays shaped (n, 2) (stereo) at 48 kHz.
Only numpy, scipy, soundfile and pyloudnorm are needed (all in .venv).

Source recordings are downloaded on demand from the Hugging Face hub into a cache
directory (env P63_SFX_CACHE, default ~/.cache/p63-sfx) and are never executed:
they are only decoded as audio.
"""
from __future__ import annotations

import io
import json
import math
import os
import subprocess
import zipfile
from fractions import Fraction
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
HERE = Path(__file__).resolve().parent
CACHE = Path(os.environ.get('P63_SFX_CACHE', Path.home() / '.cache' / 'p63-sfx'))
SOURCES: dict = json.loads((HERE / 'sources.json').read_text())

FSD_URL = 'https://huggingface.co/datasets/Fhrozen/FSD50k/resolve/main/clips/{split}/{id}.wav'
BANK_URL = 'https://huggingface.co/datasets/Jacob121294/bank-sfx/resolve/main/bank-sfx-v1.zip'

USED: dict[str, set] = {}  # source key -> set of output files that used it
_CURRENT = ['?']
_cache: dict = {}
_bank_zip = None


def set_current(name: str) -> None:
    _CURRENT[0] = name


# ----------------------------------------------------------------------------
# Sources
# ----------------------------------------------------------------------------
def _download(url: str, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_suffix(out.suffix + '.part')
    r = subprocess.run(['curl', '-sSL', '--fail', '-m', '900', '--retry', '3', '-o', str(tmp), url])
    if r.returncode != 0:
        raise RuntimeError(f'download failed: {url}')
    tmp.rename(out)


def _raw(key: str) -> tuple[np.ndarray, int]:
    global _bank_zip
    meta = SOURCES[key]
    if key.startswith('fsd:'):
        fid = key[4:]
        p = CACHE / 'fsd50k' / f'{fid}.wav'
        if not p.exists():
            _download(FSD_URL.format(split=meta['split'], id=fid), p)
        x, sr = sf.read(str(p), always_2d=True)
    elif key.startswith('bank:'):
        p = CACHE / 'bank-sfx' / 'bank-sfx-v1.zip'
        if not p.exists():
            _download(BANK_URL, p)
        if _bank_zip is None:
            _bank_zip = zipfile.ZipFile(str(p))
        x, sr = sf.read(io.BytesIO(_bank_zip.read(meta['file'])), always_2d=True)
    else:
        raise KeyError(key)
    return x, sr


def src(key: str, t0: float = 0.0, t1: float | None = None) -> np.ndarray:
    """Load a registered source as stereo float64 at 48 kHz (DC removed)."""
    if key not in SOURCES:
        raise KeyError(f'unregistered source {key}')
    USED.setdefault(key, set()).add(_CURRENT[0])
    if key not in _cache:
        x, sr = _raw(key)
        x = x - x.mean(axis=0, keepdims=True)
        if sr != SR:
            g = math.gcd(sr, SR)
            x = signal.resample_poly(x, SR // g, sr // g, axis=0)
        if x.shape[1] == 1:
            x = np.repeat(x, 2, axis=1)
        _cache[key] = x[:, :2].astype(np.float64)
    x = _cache[key]
    a = int(t0 * SR)
    b = len(x) if t1 is None else int(t1 * SR)
    return x[a:b].copy()


def credits_used() -> dict:
    return {k: sorted(v) for k, v in USED.items()}


# ----------------------------------------------------------------------------
# Basics
# ----------------------------------------------------------------------------
def db(v: float) -> float:
    return 10 ** (v / 20)


def secs(n: float) -> int:
    return int(round(n * SR))


def zeros(sec: float) -> np.ndarray:
    return np.zeros((secs(sec), 2))


def st(x: np.ndarray) -> np.ndarray:
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        return np.stack([x, x], axis=1)
    return x


def mono(x: np.ndarray) -> np.ndarray:
    return st(x).mean(axis=1)


def peak(x: np.ndarray) -> float:
    return float(np.max(np.abs(x))) if len(x) else 0.0


def rms(x: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(x)))) if len(x) else 0.0


def norm(x: np.ndarray, peak_db: float = -1.0) -> np.ndarray:
    p = peak(x)
    return x if p == 0 else x * (db(peak_db) / p)


def pan(x: np.ndarray, p: float) -> np.ndarray:
    """Equal-power pan of the mono sum. p: -1 left .. +1 right."""
    m = mono(x)
    a = (p + 1) * math.pi / 4
    return np.stack([m * math.cos(a) * math.sqrt(2), m * math.sin(a) * math.sqrt(2)], axis=1)


def balance(x: np.ndarray, p: float) -> np.ndarray:
    """Stereo balance that keeps the image: p -1..1."""
    x = st(x).copy()
    if p > 0:
        x[:, 0] *= 1 - p
    else:
        x[:, 1] *= 1 + p
    return x


def width(x: np.ndarray, w: float) -> np.ndarray:
    x = st(x)
    m = (x[:, 0] + x[:, 1]) / 2
    s = (x[:, 0] - x[:, 1]) / 2 * w
    return np.stack([m + s, m - s], axis=1)


def decorrelate(x: np.ndarray, ms: float = 11.0, amount: float = 1.0, seed: int = 1) -> np.ndarray:
    """Pseudo-stereo from mono: the right channel goes through a short delay + allpass chain."""
    m = mono(x)
    rng = np.random.default_rng(seed)
    r = m.copy()
    for _ in range(4):
        d = int(rng.uniform(0.3, 1.0) * ms * SR / 1000)
        g = rng.uniform(0.4, 0.65)
        # Schroeder allpass
        b = np.zeros(d + 1)
        b[0] = -g
        b[d] = 1
        a = np.zeros(d + 1)
        a[0] = 1
        a[d] = -g
        r = signal.lfilter(b, a, r)
    left = m
    right = m * (1 - amount) + r * amount
    return np.stack([left, right], axis=1)


def seg(x: np.ndarray, t0: float, t1: float | None = None) -> np.ndarray:
    a = int(t0 * SR)
    b = len(x) if t1 is None else int(t1 * SR)
    return x[a:b].copy()


def fit(x: np.ndarray, sec: float) -> np.ndarray:
    n = secs(sec)
    x = st(x)
    if len(x) >= n:
        return x[:n].copy()
    return np.concatenate([x, np.zeros((n - len(x), 2))])


def place(buf: np.ndarray, x: np.ndarray, t: float, gain: float = 1.0) -> None:
    x = st(x)
    i = int(round(t * SR))
    if i < 0:
        x = x[-i:]
        i = 0
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i] * gain


def mix(*parts, length: float | None = None) -> np.ndarray:
    """mix((x, t, gain), ...) into a new buffer."""
    end = 0
    for x, t, *_ in parts:
        end = max(end, int(round(t * SR)) + len(x))
    n = secs(length) if length is not None else end
    buf = np.zeros((n, 2))
    for p in parts:
        x, t = p[0], p[1]
        g = p[2] if len(p) > 2 else 1.0
        place(buf, x, t, g)
    return buf


# ----------------------------------------------------------------------------
# Envelopes
# ----------------------------------------------------------------------------
def fade(x: np.ndarray, fin: float = 0.0, fout: float = 0.0, shape: str = 'cos') -> np.ndarray:
    x = st(x).copy()
    n = len(x)

    def curve(k):
        t = np.linspace(0, 1, k)
        if shape == 'lin':
            return t
        if shape == 'exp':
            return t ** 2
        return np.sin(t * math.pi / 2) ** 2

    a = min(n, secs(fin))
    b = min(n, secs(fout))
    if a > 0:
        x[:a] *= curve(a)[:, None]
    if b > 0:
        x[n - b:] *= curve(b)[::-1][:, None]
    return x


def env(x: np.ndarray, points: list[tuple[float, float]], db_scale: bool = False) -> np.ndarray:
    """Multiply by a breakpoint envelope [(t, gain), ...] (linear interpolation)."""
    x = st(x)
    t = np.arange(len(x)) / SR
    ts = [p[0] for p in points]
    gs = [p[1] for p in points]
    g = np.interp(t, ts, gs)
    if db_scale:
        g = 10 ** (g / 20)
    return x * g[:, None]


def decay_env(x: np.ndarray, start: float, rt: float) -> np.ndarray:
    """Exponential decay after `start` reaching -60 dB after `rt` seconds."""
    x = st(x)
    t = np.arange(len(x)) / SR
    g = np.where(t < start, 1.0, 10 ** (-3 * (t - start) / rt))
    return x * g[:, None]


# ----------------------------------------------------------------------------
# Filters (RBJ biquads + Butterworth)
# ----------------------------------------------------------------------------
def _sos_filt(sos, x):
    return signal.sosfilt(sos, st(x), axis=0)


def hp(x, f, order=2):
    return _sos_filt(signal.butter(order, f, 'highpass', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return _sos_filt(signal.butter(order, min(f, SR / 2 * 0.98), 'lowpass', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return _sos_filt(signal.butter(order, [lo, min(hi, SR / 2 * 0.98)], 'bandpass', fs=SR, output='sos'), x)


def _biquad(kind, f, gain_db, q):
    a_ = 10 ** (gain_db / 40)
    w0 = 2 * math.pi * f / SR
    cw, sw = math.cos(w0), math.sin(w0)
    alpha = sw / (2 * q)
    if kind == 'peak':
        b = [1 + alpha * a_, -2 * cw, 1 - alpha * a_]
        a = [1 + alpha / a_, -2 * cw, 1 - alpha / a_]
    elif kind == 'low':
        sq = 2 * math.sqrt(a_) * alpha
        b = [a_ * ((a_ + 1) - (a_ - 1) * cw + sq), 2 * a_ * ((a_ - 1) - (a_ + 1) * cw), a_ * ((a_ + 1) - (a_ - 1) * cw - sq)]
        a = [(a_ + 1) + (a_ - 1) * cw + sq, -2 * ((a_ - 1) + (a_ + 1) * cw), (a_ + 1) + (a_ - 1) * cw - sq]
    else:  # high shelf
        sq = 2 * math.sqrt(a_) * alpha
        b = [a_ * ((a_ + 1) + (a_ - 1) * cw + sq), -2 * a_ * ((a_ - 1) + (a_ + 1) * cw), a_ * ((a_ + 1) + (a_ - 1) * cw - sq)]
        a = [(a_ + 1) - (a_ - 1) * cw + sq, 2 * ((a_ - 1) - (a_ + 1) * cw), (a_ + 1) - (a_ - 1) * cw - sq]
    b = np.array(b) / a[0]
    a = np.array(a) / a[0]
    return np.concatenate([b, a])[None, :]


def peq(x, f, gain_db, q=1.0):
    return _sos_filt(_biquad('peak', f, gain_db, q), x)


def lshelf(x, f, gain_db, q=0.707):
    return _sos_filt(_biquad('low', f, gain_db, q), x)


def hshelf(x, f, gain_db, q=0.707):
    return _sos_filt(_biquad('high', f, gain_db, q), x)


def telephone(x, lo=300, hi=3400, drive=1.5):
    """Small-speaker / radio band limit with a little non-linearity."""
    y = bp(x, lo, hi, 4)
    y = peq(y, 1800, 4, 1.2)
    return sat(y, drive)


# ----------------------------------------------------------------------------
# Pitch / time
# ----------------------------------------------------------------------------
def vari(x: np.ndarray, ratio: float) -> np.ndarray:
    """Tape-style speed change: ratio 0.5 = an octave lower and twice as long."""
    if abs(ratio - 1) < 1e-6:
        return st(x).copy()
    fr = Fraction(1 / ratio).limit_denominator(400)
    return signal.resample_poly(st(x), fr.numerator, fr.denominator, axis=0)


def semis(n: float) -> float:
    return 2 ** (n / 12)


def vari_curve(x: np.ndarray, rates: np.ndarray | list, times: list | None = None, out_len: float | None = None) -> np.ndarray:
    """Time-varying speed (varispeed ramp). `rates` is a breakpoint list over the OUTPUT time
    [(t, rate), ...] or a per-sample array. Uses 2x oversampled linear interpolation."""
    x = st(x)
    up = signal.resample_poly(x, 2, 1, axis=0)
    if out_len is None:
        out_len = len(x) / SR
    n = secs(out_len)
    t = np.arange(n) / SR
    if isinstance(rates, np.ndarray) and rates.ndim == 1 and len(rates) == n:
        r = rates
    else:
        r = np.interp(t, [p[0] for p in rates], [p[1] for p in rates])
    pos = np.concatenate([[0], np.cumsum(r)[:-1]]) * 2  # in upsampled samples
    pos = pos[pos < len(up) - 2]
    idx = np.arange(len(up))
    out = np.stack([np.interp(pos, idx, up[:, c]) for c in range(2)], axis=1)
    # anti-alias for the fastest rate then back to SR
    out = lp(out, SR / 2 * 0.9 / max(1.0, float(np.max(r))), 6) if np.max(r) > 1 else out
    return out


def stretch(x: np.ndarray, factor: float, grain: float = 0.18, seed: int = 3, jitter: float = 0.5) -> np.ndarray:
    """Granular time stretch without pitch change (for sustained textures/drones)."""
    x = st(x)
    rng = np.random.default_rng(seed)
    g = secs(grain)
    hop_out = g // 4
    n_out = int(len(x) * factor)
    out = np.zeros((n_out + g, 2))
    w = np.hanning(g)[:, None]
    norm_ = np.zeros(n_out + g)
    for o in range(0, n_out, hop_out):
        i = int(o / factor + rng.uniform(-jitter, jitter) * g)
        i = min(max(0, i), len(x) - g - 1)
        out[o:o + g] += x[i:i + g] * w
        norm_[o:o + g] += w[:, 0]
    norm_[norm_ < 1e-3] = 1
    return (out / norm_[:, None])[:n_out]


def reverse(x):
    return st(x)[::-1].copy()


# ----------------------------------------------------------------------------
# Dynamics / colour
# ----------------------------------------------------------------------------
def sat(x, drive=2.0):
    x = st(x)
    return np.tanh(x * drive) / np.tanh(drive)


def comp(x, thr_db=-18, ratio=3.0, att_ms=5, rel_ms=120, makeup_db=0.0):
    x = st(x)
    # envelope on a decimated signal for speed
    dec = 16
    e = np.max(np.abs(x), axis=1)
    e = np.maximum.reduceat(e, np.arange(0, len(e), dec))
    ga = math.exp(-dec / (SR * att_ms / 1000))
    gr = math.exp(-dec / (SR * rel_ms / 1000))
    env_ = signal.lfilter([1 - gr], [1, -gr], e)  # release smoothing
    env_ = np.maximum(env_, signal.lfilter([1 - ga], [1, -ga], e))
    lvl = 20 * np.log10(env_ + 1e-9)
    over = np.maximum(0, lvl - thr_db)
    gain_db = -over * (1 - 1 / ratio) + makeup_db
    g = 10 ** (gain_db / 20)
    g = np.repeat(g, dec)[: len(x)]
    return x * g[:, None]


def limit(x, ceiling_db=-1.0, look_ms=1.5, rel_ms=60):
    """Look-ahead peak limiter (sample-peak, with 4x oversampled peak estimate)."""
    x = st(x)
    c = db(ceiling_db)
    a = np.max(np.abs(x), axis=1)
    over = signal.resample_poly(np.abs(x), 4, 1, axis=0)
    a = np.maximum(a, np.max(np.abs(over), axis=1).reshape(-1, 4).max(axis=1)[: len(a)] if len(over) >= 4 * len(a) else a)
    need = np.minimum(1.0, c / np.maximum(a, 1e-9))
    la = max(1, int(look_ms * SR / 1000))
    # min over look-ahead window
    from scipy.ndimage import minimum_filter1d
    need = minimum_filter1d(need, size=2 * la + 1, origin=0)
    gr = math.exp(-1 / (SR * rel_ms / 1000))
    # release smoothing (gain can drop instantly, recovers slowly)
    g = np.empty_like(need)
    v = 1.0
    # process in python but on decimated data for speed
    dec = 8
    nd = need.reshape(-1)[: len(need) // dec * dec].reshape(-1, dec).min(axis=1) if len(need) >= dec else need
    gd = np.empty_like(nd)
    grd = gr ** dec
    for i, s in enumerate(nd):
        v = s if s < v else grd * v + (1 - grd) * s
        gd[i] = v
    g = np.repeat(gd, dec)
    if len(g) < len(need):
        g = np.concatenate([g, np.full(len(need) - len(g), g[-1] if len(g) else 1.0)])
    g = np.minimum(g, need)
    return x * g[:, None]


# ----------------------------------------------------------------------------
# Reverb
# ----------------------------------------------------------------------------
_ir_cache: dict = {}


def clap_ir(key: str, length: float | None = None, stretch_f: float = 1.0) -> np.ndarray:
    """Turn a recorded clap in a real space into a mono impulse response."""
    x = mono(src(key))
    p = int(np.argmax(np.abs(x)))
    y = x[max(0, p - 24):]
    if stretch_f != 1.0:
        y = mono(vari(y, 1 / stretch_f))
    if length is not None:
        y = y[: secs(length)]
    fo = min(len(y), secs(0.3))
    y[-fo:] *= np.linspace(1, 0, fo) ** 2
    y = signal.sosfilt(signal.butter(2, 60, 'highpass', fs=SR, output='sos'), y)
    return y / np.sqrt(np.sum(y ** 2))


_IR_KEYS = {'hull': ('fsd:160135', 'fsd:160134'), 'hall': ('fsd:160138',), 'steel': ('fsd:160143',), 'cabin': ('fsd:160143',),
            # Frame 240 (apartment): hand claps recorded in a real bedroom / landing (CC0, toiletrolltube)
            'bedroom': ('fsd:180784', 'fsd:180760'), 'landing': ('fsd:180782', 'fsd:180759'), 'closet': ('fsd:180784',)}


def room(kind: str) -> np.ndarray:
    """Stereo impulse responses built from real clap recordings (CC-BY, jorickhoofd)."""
    for key in _IR_KEYS.get(kind, ()):
        USED.setdefault(key, set()).add(_CURRENT[0])  # credit every sound that uses this space
    if kind in _ir_cache:
        return _ir_cache[kind]
    if kind == 'hull':  # huge steel volume: two different tunnel takes, slowed a little
        l = clap_ir('fsd:160135', 4.5, 1.15)
        r = clap_ir('fsd:160134', 4.5, 1.15)
    elif kind == 'hall':  # long reflective space (stairwell)
        l = clap_ir('fsd:160138', 3.5)
        r = clap_ir('fsd:160138', 3.5, 1.04)
    elif kind == 'steel':  # ferry lounge / steel corridor
        l = clap_ir('fsd:160143', 1.8)
        r = clap_ir('fsd:160143', 1.8, 1.06)
    elif kind == 'cabin':  # small steel room
        l = clap_ir('fsd:160143', 0.9, 0.55)
        r = clap_ir('fsd:160143', 0.9, 0.6)
    elif kind == 'bedroom':  # Mara's small apartment room (two different clap takes = natural stereo)
        l = clap_ir('fsd:180784', 0.9)
        r = clap_ir('fsd:180760', 0.9)
    elif kind == 'landing':  # the rest of the apartment / hallway, heard from another room
        l = clap_ir('fsd:180782', 1.2, 1.15)
        r = clap_ir('fsd:180759', 1.2, 1.2)
    elif kind == 'closet':  # tiny storage closet: the bedroom response shrunk (smaller room = faster, denser)
        l = clap_ir('fsd:180784', 0.18, 0.4)
        r = clap_ir('fsd:180784', 0.18, 0.43)
    else:
        raise KeyError(kind)
    n = max(len(l), len(r))
    ir = np.zeros((n, 2))
    ir[: len(l), 0] = l
    ir[: len(r), 1] = r
    _ir_cache[kind] = ir
    return ir


def reverb(x, kind='steel', wet=0.3, dry=1.0, pre_ms=0.0, tail: float = 0.0, lo_cut=120, hi_cut=9000):
    """Convolution reverb. Returns dry*x + wet*reverb (padded by `tail` seconds)."""
    x = st(x)
    if tail:
        x = np.concatenate([x, np.zeros((secs(tail), 2))])
    ir = room(kind)
    w = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    w = hp(w, lo_cut)
    w = lp(w, hi_cut)
    if pre_ms:
        d = secs(pre_ms / 1000)
        w = np.concatenate([np.zeros((d, 2)), w[:-d]])
    # level-match the wet path roughly to the dry signal
    w *= rms(x) / (rms(w) + 1e-12)
    return dry * x + wet * w


# ----------------------------------------------------------------------------
# Hit extraction
# ----------------------------------------------------------------------------
def onsets(x, thr_db=-30.0, min_gap=0.08, rise_db=9.0) -> list[int]:
    """Sample indexes of transients (energy jumps) above an absolute threshold."""
    m = mono(x)
    hop = 128
    n = len(m) // hop
    e = np.sqrt(np.mean(m[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    edb = 20 * np.log10(e)
    out = []
    last = -10 ** 9
    for i in range(3, n):
        prev = np.max(edb[max(0, i - 12):i - 1]) if i > 1 else -120
        if edb[i] > thr_db and edb[i] - prev > rise_db and (i - last) * hop / SR > min_gap:
            # refine to the first sample above 1/4 of the local peak
            a = max(0, (i - 2) * hop)
            b = min(len(m), (i + 2) * hop)
            loc = np.abs(m[a:b])
            k = np.argmax(loc > 0.25 * loc.max())
            out.append(a + int(k))
            last = i
    return out


def hits(x, thr_db=-30.0, min_gap=0.08, rise_db=9.0, max_len=2.5, pre=0.004, floor_db=-55.0) -> list[np.ndarray]:
    """Cut a multi-hit recording into individual hits (each faded in/out)."""
    x = st(x)
    on = onsets(x, thr_db, min_gap, rise_db)
    out = []
    for k, o in enumerate(on):
        a = max(0, o - secs(pre))
        b = on[k + 1] - secs(0.002) if k + 1 < len(on) else len(x)
        b = min(b, a + secs(max_len))
        h = x[a:b].copy()
        # trim tail below floor
        m = np.abs(mono(h))
        pk = m.max() + 1e-12
        above = np.where(m > pk * db(floor_db))[0]
        if len(above):
            h = h[: above[-1] + 1]
        if len(h) < secs(0.02):
            continue
        out.append(fade(h, pre * 0.8, min(0.04, len(h) / SR / 4)))
    return out


# ----------------------------------------------------------------------------
# Loops, loudness, output
# ----------------------------------------------------------------------------
def loop(x, length: float, xfade: float = 3.0) -> np.ndarray:
    """Equal-power loop: needs len(x) >= length + xfade. y[-1] -> y[0] is continuous."""
    x = st(x)
    n = secs(length)
    k = secs(xfade)
    if len(x) < n + k:
        raise ValueError(f'loop source too short: {len(x) / SR:.2f}s < {length + xfade:.2f}s')
    y = x[:n].copy()
    t = np.linspace(0, 1, k)[:, None]
    y[:k] = x[:k] * np.sin(t * math.pi / 2) + x[n:n + k] * np.cos(t * math.pi / 2)
    return y


def chain(parts: list[np.ndarray], xfade: float = 1.5) -> np.ndarray:
    """Concatenate clips with equal-power crossfades."""
    out = st(parts[0]).copy()
    k = secs(xfade)
    for p in parts[1:]:
        p = st(p)
        kk = min(k, len(out), len(p))
        t = np.linspace(0, 1, kk)[:, None]
        mid = out[-kk:] * np.cos(t * math.pi / 2) + p[:kk] * np.sin(t * math.pi / 2)
        out = np.concatenate([out[:-kk], mid, p[kk:]])
    return out


def lufs(x) -> float:
    import pyloudnorm as pyln
    x = st(x)
    if len(x) < secs(0.45):
        x = np.concatenate([x, np.zeros((secs(0.45) - len(x), 2))])
    return pyln.Meter(SR).integrated_loudness(x)


def norm_lufs(x, target: float) -> np.ndarray:
    return st(x) * db(target - lufs(x))


def energy_above(x, f=150.0) -> float:
    m = mono(x)
    fr, p = signal.welch(m, SR, nperseg=min(8192, len(m)))
    return float(p[fr > f].sum() / (p.sum() + 1e-30) * 100)


def write(path: Path, x: np.ndarray) -> None:
    x = st(x)
    rng = np.random.default_rng(7)
    tpdf = (rng.random(x.shape) - rng.random(x.shape)) / 32768.0
    y = np.clip(x + tpdf, -1, 32767 / 32768)
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), y, SR, subtype='PCM_16')


# ----------------------------------------------------------------------------
# Phase-aligned extension / looping for TONAL material (engines, hum, sustained notes).
# An equal-power crossfade between two unrelated parts of a tonal recording partially
# cancels (audible dips every splice). Instead, each splice point is chosen where the
# waveforms match (normalised cross-correlation of the low band), and matching material
# is crossfaded at equal gain.
# ----------------------------------------------------------------------------
_DEC = 8


def _analysis(x):
    m = mono(x)
    m = signal.sosfilt(signal.butter(4, 700, 'lowpass', fs=SR, output='sos'), m)
    return m[::_DEC]


def _ncc(a, tmpl):
    k = len(tmpl)
    if len(a) < k:
        return np.zeros(1)
    num = signal.correlate(a, tmpl, mode='valid', method='fft')
    c = np.concatenate([[0], np.cumsum(a ** 2)])
    den = np.sqrt(np.maximum(c[k:] - c[:-k], 1e-20) * (np.sum(tmpl ** 2) + 1e-20))
    return num / den


def _xfade(a, b, r):
    """Crossfade a -> b. Correlated material (r high) gets an equal-gain fade."""
    t = np.linspace(0, 1, len(a))[:, None]
    if r > 0.55:
        return a * (1 - t) + b * t
    return a * np.cos(t * math.pi / 2) + b * np.sin(t * math.pi / 2)


def _plan(x, total_n, k, min_seg, seed, wrap):
    """Plan (src_start, out_start, length) segments; consecutive ones overlap by k samples."""
    a = _analysis(x)
    kd = max(8, k // _DEC)
    n_src = len(x)
    r = np.random.default_rng(seed)
    s = int(r.uniform(0, max(1, n_src * 0.3)))
    first = s
    segs = []
    o = 0
    while True:
        rem = total_n - o
        can_finish = s + rem + k <= n_src
        if can_finish:
            segs.append((s, o, rem))
            break
        L = n_src - k - s  # play this source run as long as possible
        segs.append((s, o, L))
        o += L
        rem = total_n - o
        tail = a[(s + L) // _DEC:(s + L) // _DEC + kd]
        sc = _ncc(a, tail)
        # candidates must leave room for at least min_seg (or the whole remainder) after them
        need = min(rem, min_seg) + k
        valid = np.arange(len(sc)) * _DEC
        ok = (valid + need <= n_src) & (np.abs(valid - (s + L)) > SR)
        if wrap and s + 0 + rem + k <= n_src:
            pass
        score = np.where(ok, sc, -9)
        if wrap and rem + k <= n_src:
            # this will be the final run: also align its end (output position total_n) with the loop start
            head = a[first // _DEC:first // _DEC + kd]
            sh = _ncc(a, head)  # similarity of src[p:p+k] to the loop head
            p_idx = (valid + rem) // _DEC
            p_ok = p_idx < len(sh)
            score = np.where(ok & p_ok, sc + np.where(p_ok, sh[np.minimum(p_idx, len(sh) - 1)], -9), -9)
        s = int(valid[int(np.argmax(score))])
    return segs, first


def _render(x, segs, k, total_n):
    a = _analysis(x)
    kd = max(8, k // _DEC)
    out = np.zeros((total_n + k, 2))
    for i, (s, o, L) in enumerate(segs):
        piece = x[s:s + L + k]
        if i == 0:
            out[o:o + len(piece)] = piece
            continue
        ps, po, pl = segs[i - 1]
        ta = a[(ps + pl) // _DEC:(ps + pl) // _DEC + kd]
        tb = a[s // _DEC:s // _DEC + kd]
        r = float(np.dot(ta, tb) / (np.linalg.norm(ta) * np.linalg.norm(tb) + 1e-12)) if len(ta) == len(tb) else 0.0
        out[o:o + k] = _xfade(out[o:o + k], piece[:k], r)
        out[o + k:o + len(piece)] = piece[k:]
    return out


def extend_aligned(x, total: float, xfade: float = 0.6, min_seg: float = 2.0, seed: int = 1) -> np.ndarray:
    x = st(x)
    n = secs(total)
    k = secs(xfade)
    segs, _ = _plan(x, n, k, secs(min_seg), seed, wrap=False)
    return _render(x, segs, k, n)[:n]


def loop_aligned(x, T: float, xfade: float = 0.6, min_seg: float = 2.0, seed: int = 1) -> np.ndarray:
    """A seamless loop of exactly T seconds from a tonal recording (y[-1] -> y[0] continuous)."""
    x = st(x)
    n = secs(T)
    k = secs(xfade)
    segs, first = _plan(x, n, k, secs(min_seg), seed, wrap=True)
    out = _render(x, segs, k, n)
    a = _analysis(x)
    kd = max(8, k // _DEC)
    ta = _analysis(out[n:n + k])[:kd]
    tb = _analysis(out[:k])[:kd]
    r = float(np.dot(ta, tb) / (np.linalg.norm(ta) * np.linalg.norm(tb) + 1e-12)) if len(ta) == len(tb) else 0.0
    y = out[:n].copy()
    y[:k] = _xfade(out[n:n + k], out[:k], r)
    return y


def circ(y, fn, pre: float = 5.0):
    """Apply a processing function to a periodic signal without breaking its loop seam."""
    y = st(y)
    k = min(len(y), secs(pre))
    z = fn(np.concatenate([y[-k:], y]))
    return z[k:k + len(y)]
