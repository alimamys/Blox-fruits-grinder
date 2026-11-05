"""Post-processing chain for every generated voice line.

The effect is baked into the WAV so the Remotion project only needs to place files.
Order: resample -> (pitch/tremor) -> trim -> de-ess -> gentle compression -> EQ ->
effect -> loudness normalise -> pan -> limit.

Design rules from the brief:
  * old woman: NO heavy pitching, no reversing, no growl layers. Only a tiny pitch
    drop and a subtle, drifting age tremor. The final "Sixty-four" gets a whisper
    treatment with a barely audible secondary whisper underneath.
  * marine radio: HP ~300 Hz, LP ~3.4 kHz, compression, slight static, TX clicks.
  * PA: low-pass, metallic room echo, mild distortion, quiet hiss - and the PA
    lines fade from full PA processing to almost dry as the voice becomes personal.
"""
from __future__ import annotations

import hashlib

import numpy as np

import dsp
from dsp import SR


def _seed(text: str) -> int:
    return int(hashlib.md5(text.encode()).hexdigest()[:8], 16)


def _align(*xs: np.ndarray) -> list[np.ndarray]:
    n = max(len(x) for x in xs)
    out = []
    for x in xs:
        pad = n - len(x)
        if pad > 0:
            x = np.concatenate([x, np.zeros((pad,) + x.shape[1:])])
        out.append(x)
    return out


def _delay(x: np.ndarray, seconds: float) -> np.ndarray:
    n = int(seconds * SR)
    return np.concatenate([np.zeros((n,) + x.shape[1:]), x])


# ----------------------------------------------------------------------------
# Effect chains (mono in, mono or stereo out)
# ----------------------------------------------------------------------------
ROOM_IR = None
PA_IR = None
DIST_IR = None
CROWD_IR = None


def _irs():
    global ROOM_IR, PA_IR, DIST_IR, CROWD_IR
    if ROOM_IR is None:
        ROOM_IR = dsp.make_ir(0.38, SR, seed=11, bright=5200, early=[(0.006, 0.55), (0.013, 0.35), (0.022, 0.22)])
        PA_IR = dsp.make_ir(1.15, SR, seed=12, bright=3600, early=[(0.043, 0.6), (0.081, 0.45), (0.12, 0.33), (0.172, 0.22)], predelay=0.012)
        DIST_IR = dsp.make_ir(1.7, SR, seed=13, bright=2400, early=[(0.03, 0.3)], predelay=0.03)
        CROWD_IR = dsp.make_ir(0.7, SR, seed=14, bright=3800, early=[(0.011, 0.4), (0.024, 0.3)])


def fx_room(x, wet=0.11):
    _irs()
    return dsp.reverb(x, ROOM_IR, wet=wet)


def fx_pa(x, seed=1):
    _irs()
    y = dsp.hp(x, 330, SR, 4)
    y = dsp.lp(y, 4300, SR, 4)
    y = dsp.biquad(y, 'peak', 1500, 5.0, 1.1)
    y = dsp.biquad(y, 'peak', 2900, 2.5, 1.4)
    y = dsp.tanh_sat(y / (dsp.peak(y) + 1e-9) * 0.9, 2.2) * dsp.peak(y)
    y = dsp.compress(y, -26, 3.0)
    y = dsp.reverb(y, PA_IR, wet=0.34)
    rng = np.random.default_rng(seed)
    hiss = dsp.hp(rng.standard_normal(len(y)), 2500, SR, 2) * dsp.peak(y) * dsp.db(-44)
    hum = np.sin(2 * np.pi * 50 * np.arange(len(y)) / SR) * dsp.peak(y) * dsp.db(-50)
    return y + hiss + hum


def fx_phone(x):
    y = dsp.hp(x, 480, SR, 4)
    y = dsp.lp(y, 3200, SR, 4)
    y = dsp.tanh_sat(y / (dsp.peak(y) + 1e-9) * 0.8, 1.6) * dsp.peak(y)
    return dsp.compress(y, -24, 3.5)


def fx_radio(x, seed=2):
    """Marine VHF transmission with squelch tail and TX clicks."""
    y = dsp.hp(x, 300, SR, 4)
    y = dsp.lp(y, 3400, SR, 4)
    y = dsp.biquad(y, 'peak', 1800, 3.0, 1.0)
    y = dsp.tanh_sat(y / (dsp.peak(y) + 1e-9) * 0.85, 2.0) * 0.8
    y = dsp.compress(y, -24, 4.0)
    rng = np.random.default_rng(seed)
    lead, tail = int(0.12 * SR), int(0.16 * SR)
    body = np.concatenate([np.zeros(lead), y, np.zeros(tail)])
    n = len(body)
    static = dsp.bp(rng.standard_normal(n), 700, 3200, SR, 2)
    static *= 0.5 + 0.5 * dsp.one_pole_smooth(np.abs(rng.standard_normal(n)), 0.05)
    lvl = dsp.peak(y)
    out = body + static / (dsp.peak(static) + 1e-9) * lvl * dsp.db(-30)
    # squelch bursts at key-up / key-down
    burst = dsp.bp(rng.standard_normal(int(0.1 * SR)), 900, 4000, SR, 2)
    burst = dsp.fade(burst / (dsp.peak(burst) + 1e-9) * lvl * dsp.db(-14), 0.002, 0.04)
    out[: len(burst)] += burst
    out[-len(burst):] += burst[::-1] * 1.2
    # transmission clicks
    for i in (0, n - int(0.02 * SR)):
        out[i: i + 40] += np.hanning(40) * lvl * 0.6
    return out


def fx_distant(x):
    _irs()
    y = dsp.hp(x, 160, SR, 2)
    y = dsp.lp(y, 2300, SR, 2)
    y = dsp.reverb(y * dsp.db(-4), DIST_IR, wet=0.55, dry=0.75)
    return y


def fx_whisper(x, voiced=0.36, seed=5):
    v = dsp.noise_vocoder(x, SR, seed=seed)
    y = v * (1 - voiced) + x * voiced * 0.85
    return dsp.hp(y, 110, SR, 2)


def fx_whisper_close(x, seed=9):
    """Final "Sixty-four": close, dry, slightly behind/right, with a barely
    audible second whisper underneath (about -27 dB)."""
    main = fx_whisper(x, voiced=0.2, seed=seed)
    main = dsp.biquad(main, 'lowshelf', 230, 3.0, 0.7)  # proximity
    under = dsp.noise_vocoder(dsp.pitch_shift_resample(x, -2.2), SR, seed=seed + 1)
    under = _delay(under, 0.032) * dsp.db(-27)
    main, under = _align(main, under)
    left = main * 0.92 + under * 1.0
    right = main * 1.0 + under * 0.6
    # right ear hears it a hair earlier -> "behind and to the right"
    left = _delay(left, 0.00028)
    left, right = _align(left, right)
    st = np.stack([left, right], axis=1)
    return st


def fx_shout(x):
    _irs()
    y = dsp.biquad(x, 'peak', 2500, 3.0, 0.9)
    y = dsp.tanh_sat(y / (dsp.peak(y) + 1e-9) * 0.95, 1.7)
    return dsp.reverb(y, ROOM_IR, wet=0.17)


def fx_crowd(x):
    _irs()
    y = dsp.lp(x, 3600, SR, 2)
    y = dsp.hp(y, 140, SR, 2)
    return dsp.reverb(y, CROWD_IR, wet=0.33, dry=0.8)


def fx_multi(x):
    """The same voice from every PA speaker, radio and phone at once."""
    pa = fx_pa(x, seed=3)
    ph1 = _delay(fx_phone(x), 0.021)
    ph2 = _delay(fx_phone(x), 0.046)
    rad = _delay(fx_radio(x, seed=4), 0.068) * dsp.db(-7)
    dry = x * 0.38
    layers = _align(dsp.pan(pa, 0), dsp.pan(ph1 * 0.8, -0.75), dsp.pan(ph2 * 0.8, 0.8), dsp.pan(rad, -0.3), dsp.pan(dry, 0.05))
    return sum(layers)


def apply_effect(x: np.ndarray, effect: str, seed: int) -> np.ndarray:
    if effect in ('none', None):
        return x
    if effect == 'room':
        return fx_room(x)
    if effect == 'pa':
        return fx_pa(x, seed)
    if effect == 'paSoft':
        a, b = _align(fx_pa(x, seed), fx_room(x, 0.08))
        return a * 0.5 + b * 0.55
    if effect == 'paIntimate':
        a, b = _align(fx_pa(x, seed), fx_room(x, 0.05))
        return a * 0.16 + b * 0.9
    if effect == 'phone':
        return fx_phone(x)
    if effect == 'marineRadio':
        return fx_radio(x, seed)
    if effect == 'distant':
        return fx_distant(x)
    if effect == 'whisper':
        return fx_room(fx_whisper(x, seed=seed), 0.06)
    if effect == 'whisperClose':
        return fx_whisper_close(x, seed)
    if effect == 'shout':
        return fx_shout(x)
    if effect == 'crowdRoom':
        return fx_crowd(x)
    if effect == 'multiSpeaker':
        return fx_multi(x)
    raise ValueError(f'unknown effect {effect}')


EFFECT_LUFS_OFFSET = {
    'whisper': -1.5,
    'whisperClose': -3.0,
    'distant': -2.0,
    'marineRadio': -0.5,
    'pa': 0.0,
    'crowdRoom': 0.0,
}


def process_line(audio: np.ndarray, sr: int, job: dict) -> np.ndarray:
    """audio: mono float array from the TTS provider."""
    line = job['line']
    effect = line['audioEffect']
    seed = _seed(line['id'])
    x = np.asarray(audio, dtype=np.float64)
    if x.ndim == 2:
        x = x.mean(axis=1)
    x = dsp.resample(x, sr, SR)

    semis = job['pitchSemitones']
    if effect == 'shout':
        semis += 2.0 if line['emotion'] == 'screaming' else 1.0
    x = dsp.pitch_shift_resample(x, semis)
    if job['tremor'] > 0:
        t = job['tremor']
        x = dsp.vibrato(x, rate=5.3, cents=16 * t, amp_depth=0.07 * t, seed=seed)

    x = dsp.trim_silence(x, SR, -46, 0.025, 0.12)
    x = dsp.hp(x, 70, SR, 2)
    x = dsp.deess(x, 0.55)
    x = dsp.compress(x, -26, 2.0, 0.015)
    if line['character'] == 'narrator':
        # close-mic warmth, slightly softened top
        x = dsp.biquad(x, 'lowshelf', 170, 1.8, 0.7)
        x = dsp.biquad(x, 'highshelf', 8500, -1.5, 0.7)
    if line['character'] == 'oldWoman' and effect not in ('whisperClose',):
        # a little breath and softness
        x = dsp.biquad(x, 'highshelf', 6000, -2.0, 0.7)
        x = dsp.biquad(x, 'peak', 2600, 1.2, 1.0)

    y = apply_effect(x, effect, seed)
    target = job['lufs'] + EFFECT_LUFS_OFFSET.get(effect, 0.0)
    y = dsp.normalize_lufs(y, target)
    if y.ndim == 1 and abs(job['pan']) > 0.01:
        y = dsp.pan(y, job['pan'])
    elif y.ndim == 2 and abs(job['pan']) > 0.01 and effect not in ('whisperClose', 'multiSpeaker'):
        y = dsp.pan(y.mean(axis=1), job['pan'])
    y = dsp.limit(y, -1.0)
    y = dsp.fade(y, 0.004, 0.03)
    lead = np.zeros((int(0.015 * SR),) + y.shape[1:])
    return np.concatenate([lead, y])
