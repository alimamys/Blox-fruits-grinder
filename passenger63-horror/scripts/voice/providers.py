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
ELEVEN_API = 'https://api.elevenlabs.io/v1'

# eleven_v3 audio tags. Emotion -> delivery tag; breath cue -> performed breath.
ELEVEN_EMOTION_TAGS = {
    'whispering': '[whispers]',
    'afraid': '[nervously]',
    'panicked': '[panicking]',
    'grieving': '[sad]',
    'screaming': '[screaming]',
    'comforting': '[softly]',
    'unnaturally_calm': '[calmly]',
    'matter_of_fact': '[calmly]',
    'sleepy': '[sleepily]',
    'tired': '[tired]',
    'amused': '[chuckles]',
    'hypnotized': '[dreamily]',
    'distressed': '[distressed]',
    'angry': '[frustrated]',
    'affectionate': '[warmly]',
    'warm': '[warmly]',
    'confused': '[confused]',
    'protective': '[urgently]',
    'breathless': '[breathless]',
}
ELEVEN_BREATH_TAGS = {
    'shakyInhale': '[shaky breath]',
    'sharpInhale': '[gasps]',
    'exhale': '[exhales]',
    'fastBreathing': '[breathing heavily]',
    'raggedBreathing': '',
    'cryingBreath': '[crying]',
}


def eleven_text(job: dict, v3: bool) -> str:
    """Line text with v3 audio tags. The narrator stays untagged except for quiet,
    restrained lines - over-acting narration is what makes TTS sound fake."""
    line = job['line']
    text = _speak_text(line)
    if not v3:
        return text
    tags = []
    if line.get('elevenTags'):
        tags.append(line['elevenTags'])
    else:
        breath = ELEVEN_BREATH_TAGS.get(line.get('breath', 'none'), '')
        if breath:
            tags.append(breath)
        if line['audioEffect'] in ('whisper', 'whisperClose'):
            tags.append('[whispers]')
        elif line['character'] == 'narrator':
            if line['volume'] < 0.9 or line['emotion'] == 'whispering':
                tags.append('[quietly]')
        else:
            tag = ELEVEN_EMOTION_TAGS.get(line['emotion'])
            if tag and tag not in tags:
                tags.append(tag)
            if line['audioEffect'] == 'shout' and line['emotion'] != 'screaming':
                tags.append('[shouting]')
    return (' '.join(tags) + ' ' + text).strip()


class ElevenLabsProvider:
    """ElevenLabs text-to-speech. Voices are resolved by NAME from your account
    (premade voices exist on every account) unless a voiceId is given."""

    name = 'elevenlabs'

    def __init__(self):
        self.key = os.environ.get('ELEVENLABS_API_KEY')
        if not self.key:
            raise ProviderUnavailable('ELEVENLABS_API_KEY is not set (environment variable or .env file).')
        self._voices = None
        self._v3_ok = True

    def _get(self, path: str):
        req = urllib.request.Request(ELEVEN_API + path, headers={'xi-api-key': self.key})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            raise ProviderUnavailable(f'ElevenLabs {path} -> HTTP {e.code}: {e.read()[:300]!r}') from e
        except urllib.error.URLError as e:
            raise ProviderUnavailable(f'Cannot reach api.elevenlabs.io ({e.reason}). Is the host allowed by your network?') from e

    def quota(self) -> tuple[int, int] | None:
        try:
            sub = self._get('/user/subscription')
            return int(sub.get('character_count', 0)), int(sub.get('character_limit', 0))
        except ProviderUnavailable:
            return None

    def voice_id(self, cfg: dict) -> str:
        if cfg.get('voiceId'):
            return cfg['voiceId']
        if self._voices is None:
            self._voices = {v['name'].strip().lower(): v['voice_id'] for v in self._get('/voices').get('voices', [])}
        want = cfg['voiceName'].strip().lower()
        for name, vid in self._voices.items():
            if name == want or name.split(' ')[0].split('-')[0].strip() == want:
                return vid
        raise ProviderUnavailable(
            f"ElevenLabs voice '{cfg['voiceName']}' is not in your account. Available: {', '.join(sorted(self._voices))}.\n"
            '  Set voiceName (or a voiceId from the Voice Library) in src/data/voiceConfig.ts.'
        )

    def _tts(self, vid: str, body: dict) -> bytes:
        return _post(
            f'{ELEVEN_API}/text-to-speech/{vid}?output_format=pcm_24000',
            json.dumps(body).encode(),
            {'xi-api-key': self.key, 'Content-Type': 'application/json', 'Accept': 'audio/pcm'},
        )

    def synthesize(self, job: dict):
        line = job['line']
        cfg = job['providers']['elevenlabs']
        vid = self.voice_id(cfg)
        i = float(line['intensity'])
        model = cfg['model']
        v3 = model.startswith('eleven_v3') and self._v3_ok
        if v3:
            body = {
                'text': eleven_text(job, True),
                'model_id': model,
                # v3 stability: 0.0 creative, 0.5 natural, 1.0 robust
                'voice_settings': {'stability': 0.0 if i >= 0.6 else 0.5, 'similarity_boost': 0.8},
            }
            try:
                return _pcm16_to_array(self._tts(vid, body)), 24000
            except RuntimeError as e:
                msg = str(e)
                if 'HTTP 4' not in msg:
                    raise
                if 'voice_settings' in msg or 'stability' in msg:
                    body.pop('voice_settings')
                    return _pcm16_to_array(self._tts(vid, body)), 24000
                print(f'  [elevenlabs] eleven_v3 unavailable for this key ({msg[:120]}), falling back to eleven_multilingual_v2')
                self._v3_ok = False
        body = {
            'text': eleven_text(job, False),
            'model_id': 'eleven_multilingual_v2' if model.startswith('eleven_v3') else model,
            'voice_settings': {
                'stability': round(max(0.25, 0.6 - 0.35 * i), 2),
                'similarity_boost': 0.8,
                'style': round(min(0.7, 0.15 + 0.5 * i), 2),
                'use_speaker_boost': True,
                'speed': round(float(np.clip(job['perceivedSpeed'], 0.75, 1.15)), 2),
            },
        }
        # neighbouring lines give the model the flow of the story
        if job.get('prevText'):
            body['previous_text'] = job['prevText']
        if job.get('nextText'):
            body['next_text'] = job['nextText']
        return _pcm16_to_array(self._tts(vid, body)), 24000


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
