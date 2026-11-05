"""TTS provider abstraction.

Every provider implements:  synthesize(job) -> (mono float numpy array, sample_rate)

`job` is built by generate_voices.py and contains the line metadata plus the
resolved casting for that character (see src/data/voiceConfig.ts).

Providers
  kokoro      Local, offline neural TTS (default). Needs the model files from
              `python3 scripts/voice/download_models.py` (~350 MB, once).
  elevenlabs  ELEVENLABS_API_KEY            (voice ids in voiceConfig.ts)
  openai      OPENAI_API_KEY                (gpt-4o-mini-tts with acting instructions)
  azure       AZURE_SPEECH_KEY + AZURE_SPEECH_REGION   (SSML express-as styles)
  polly       AWS credentials (boto3)       (SSML prosody)
"""
from __future__ import annotations

import io
import json
import os
import urllib.error
import urllib.request
import wave
from pathlib import Path

import numpy as np

import ssml


class ProviderUnavailable(RuntimeError):
    pass


def _speak_text(line: dict) -> str:
    t = line.get('spokenText') or line['text']
    t = t.replace('—', ', ').replace('–', ', ')
    if t and t[-1] not in '.!?…':
        t += '.'
    return t


# ----------------------------------------------------------------------------
# Kokoro (local)
# ----------------------------------------------------------------------------
class KokoroProvider:
    name = 'kokoro'

    def __init__(self, models_dir: Path):
        onnx = models_dir / 'kokoro-v1.0.onnx'
        voices = models_dir / 'voices-v1.0.bin'
        if not onnx.exists() or not voices.exists():
            raise ProviderUnavailable(
                f'Kokoro model files not found in {models_dir}.\n'
                '  Run:  python3 scripts/voice/download_models.py'
            )
        try:
            from kokoro_onnx import Kokoro  # type: ignore
        except ImportError as e:  # pragma: no cover
            raise ProviderUnavailable('kokoro-onnx is not installed. Run: pip install -r scripts/voice/requirements.txt') from e
        self.k = Kokoro(str(onnx), str(voices))
        self._cache: dict[str, np.ndarray] = {}

    def style(self, blend: list) -> np.ndarray:
        key = json.dumps(blend)
        if key not in self._cache:
            total = sum(w for _, w in blend)
            s = None
            for name, w in blend:
                v = self.k.get_voice_style(name) * (w / total)
                s = v if s is None else s + v
            self._cache[key] = s
        return self._cache[key]

    def synthesize(self, job: dict):
        line = job['line']
        kv = job['kokoro']
        style = self.style(kv['blend'])
        text = _speak_text(line)
        # Natural, non-uniform pauses: vary the sentence gap per line.
        jitter = (job['seed'] % 1000) / 1000.0
        uneasy = line['emotion'] in ('uneasy', 'afraid', 'whispering', 'unnaturally_calm', 'hypnotized', 'grieving')
        sentence_pause = 0.12 + 0.13 * jitter + (0.07 if uneasy else 0.0)
        sentence_pause /= max(0.8, line['pace'])
        clause_pause = 0.05 + 0.06 * jitter
        speed = float(np.clip(job['speed'], 0.5, 1.8))
        audio, sr = self.k.create(
            text,
            voice=style,
            speed=speed,
            lang=kv['lang'],
            sentence_pause=sentence_pause,
            clause_pause=clause_pause,
        )
        return np.asarray(audio, dtype=np.float64), sr


# ----------------------------------------------------------------------------
# HTTP helpers
# ----------------------------------------------------------------------------
def _post(url: str, body: bytes, headers: dict, timeout=120) -> bytes:
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'{url} -> HTTP {e.code}: {e.read()[:400]!r}') from e


def _wav_bytes_to_array(data: bytes):
    with wave.open(io.BytesIO(data), 'rb') as w:
        sr = w.getframerate()
        ch = w.getnchannels()
        raw = w.readframes(w.getnframes())
    x = np.frombuffer(raw, dtype='<i2').astype(np.float64) / 32768.0
    if ch > 1:
        x = x.reshape(-1, ch).mean(axis=1)
    return x, sr


def _pcm16_to_array(data: bytes):
    return np.frombuffer(data, dtype='<i2').astype(np.float64) / 32768.0


# ----------------------------------------------------------------------------
# ElevenLabs
# ----------------------------------------------------------------------------
ELEVEN_V3_TAGS = {
    'whispering': '[whispers]',
    'afraid': '[nervously]',
    'panicked': '[panicked]',
    'grieving': '[crying]',
    'screaming': '[screaming]',
    'comforting': '[softly]',
    'unnaturally_calm': '[calmly]',
    'sleepy': '[sleepily]',
    'amused': '[chuckles]',
    'hypnotized': '[dreamily]',
    'distressed': '[distressed]',
    'angry': '[angrily]',
}


class ElevenLabsProvider:
    name = 'elevenlabs'

    def __init__(self):
        self.key = os.environ.get('ELEVENLABS_API_KEY')
        if not self.key:
            raise ProviderUnavailable('ELEVENLABS_API_KEY is not set (put it in .env or your shell).')

    def synthesize(self, job: dict):
        line = job['line']
        cfg = job['providers']['elevenlabs']
        if cfg['voiceId'].startswith('REPLACE_'):
            raise ProviderUnavailable(f"Set providers.elevenlabs.voiceId for {line['character']} in src/data/voiceConfig.ts")
        text = _speak_text(line)
        if cfg['model'].startswith('eleven_v3'):
            tag = ELEVEN_V3_TAGS.get(line['emotion'])
            if tag:
                text = f'{tag} {text}'
        i = float(line['intensity'])
        body = {
            'text': text,
            'model_id': cfg['model'],
            'voice_settings': {
                'stability': round(max(0.2, 0.62 - 0.4 * i), 2),
                'similarity_boost': 0.8,
                'style': round(min(0.8, 0.1 + 0.55 * i), 2),
                'use_speaker_boost': True,
                'speed': round(float(np.clip(job['speed'], 0.7, 1.2)), 2),
            },
        }
        data = _post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{cfg['voiceId']}?output_format=pcm_44100",
            json.dumps(body).encode(),
            {'xi-api-key': self.key, 'Content-Type': 'application/json', 'Accept': 'audio/pcm'},
        )
        return _pcm16_to_array(data), 44100


# ----------------------------------------------------------------------------
# OpenAI
# ----------------------------------------------------------------------------
class OpenAIProvider:
    name = 'openai'

    def __init__(self, emotion_directions: dict):
        self.key = os.environ.get('OPENAI_API_KEY')
        if not self.key:
            raise ProviderUnavailable('OPENAI_API_KEY is not set.')
        self.dirs = emotion_directions

    def synthesize(self, job: dict):
        line = job['line']
        cfg = job['providers']['openai']
        instructions = ssml.acting_instructions(job, self.dirs)
        body = {
            'model': cfg['model'],
            'voice': cfg['voice'],
            'input': _speak_text(line),
            'instructions': instructions,
            'response_format': 'wav',
        }
        data = _post(
            'https://api.openai.com/v1/audio/speech',
            json.dumps(body).encode(),
            {'Authorization': f'Bearer {self.key}', 'Content-Type': 'application/json'},
        )
        return _wav_bytes_to_array(data)


# ----------------------------------------------------------------------------
# Azure
# ----------------------------------------------------------------------------
class AzureProvider:
    name = 'azure'

    def __init__(self):
        self.key = os.environ.get('AZURE_SPEECH_KEY')
        self.region = os.environ.get('AZURE_SPEECH_REGION')
        if not self.key or not self.region:
            raise ProviderUnavailable('AZURE_SPEECH_KEY and AZURE_SPEECH_REGION must be set.')

    def synthesize(self, job: dict):
        body = ssml.azure_ssml(job).encode('utf-8')
        data = _post(
            f'https://{self.region}.tts.speech.microsoft.com/cognitiveservices/v1',
            body,
            {
                'Ocp-Apim-Subscription-Key': self.key,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
                'User-Agent': 'passenger63-voice-generator',
            },
        )
        return _wav_bytes_to_array(data)


# ----------------------------------------------------------------------------
# Amazon Polly
# ----------------------------------------------------------------------------
class PollyProvider:
    name = 'polly'

    def __init__(self):
        try:
            import boto3  # type: ignore
        except ImportError as e:
            raise ProviderUnavailable('boto3 is required for Polly: pip install boto3') from e
        self.client = boto3.client('polly', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

    def synthesize(self, job: dict):
        cfg = job['providers']['polly']
        resp = self.client.synthesize_speech(
            Engine=cfg['engine'],
            VoiceId=cfg['voice'],
            OutputFormat='pcm',
            SampleRate='24000' if cfg['engine'] != 'standard' else '16000',
            TextType='ssml',
            Text=ssml.polly_ssml(job),
        )
        data = resp['AudioStream'].read()
        return _pcm16_to_array(data), 24000 if cfg['engine'] != 'standard' else 16000


def make_provider(name: str, models_dir: Path, emotion_directions: dict):
    if name == 'kokoro':
        return KokoroProvider(models_dir)
    if name == 'elevenlabs':
        return ElevenLabsProvider()
    if name == 'openai':
        return OpenAIProvider(emotion_directions)
    if name == 'azure':
        return AzureProvider()
    if name == 'polly':
        return PollyProvider()
    raise ProviderUnavailable(f'Unknown provider {name}')
