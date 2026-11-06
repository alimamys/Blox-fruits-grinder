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
import time
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
# Chatterbox (local, open-source, free - Resemble AI, MIT licence)
# ----------------------------------------------------------------------------
CHATTERBOX_FILES = ['ve.safetensors', 't3_cfg.safetensors', 's3gen.safetensors', 'tokenizer.json', 'conds.pt']

# emotion -> exaggeration (Chatterbox's expressiveness knob, ~0.25 flat .. 1.2 extreme)
CHATTERBOX_EXAGGERATION = {
    'screaming': 1.15,
    'panicked': 0.95,
    'distressed': 0.85,
    'grieving': 0.8,
    'angry': 0.85,
    'afraid': 0.7,
    'protective': 0.7,
    'breathless': 0.75,
    'amused': 0.6,
    'confused': 0.55,
    'uneasy': 0.5,
    'whispering': 0.35,
    'hypnotized': 0.35,
    'unnaturally_calm': 0.35,
    'matter_of_fact': 0.35,
    'comforting': 0.45,
    'warm': 0.45,
    'affectionate': 0.45,
    'sleepy': 0.3,
    'tired': 0.35,
}


class ChatterboxProvider:
    """Zero-shot voice cloning TTS with emotion control. Each character's timbre comes
    from its reference clip (voice-references/*.wav); the delivery comes from the model.

    model 'standard' (default): expressive, with the `exaggeration` emotion control.
    model 'turbo': ~4x faster on CPU, no emotion control - used for the restrained narrator."""

    name = 'chatterbox'

    def __init__(self, models_dir: Path):
        try:
            import torch  # type: ignore
            import chatterbox  # type: ignore  # noqa: F401
        except ImportError as e:
            raise ProviderUnavailable(
                'chatterbox-tts is not installed. Create its own venv:\n'
                '  python3 -m venv .venv-chatterbox && .venv-chatterbox/bin/pip install -r scripts/voice/requirements-chatterbox.txt'
            ) from e
        self.torch = torch
        torch.set_num_threads(max(1, os.cpu_count() or 1))
        self.device = 'cuda' if torch.cuda.is_available() else 'mps' if getattr(torch.backends, 'mps', None) and torch.backends.mps.is_available() else 'cpu'
        self.models_dir = models_dir
        self.models: dict = {}
        self.last_ref: dict = {}
        self._load('standard')  # fail early if the model can't be loaded

    def _load(self, kind: str):
        if kind in self.models:
            return self.models[kind]
        try:
            if kind == 'turbo':
                from chatterbox.tts_turbo import ChatterboxTurboTTS  # type: ignore

                local = self.models_dir / 'chatterbox-turbo'
                m = ChatterboxTurboTTS.from_local(str(local), self.device) if (local / 't3_turbo_v1.safetensors').exists() else ChatterboxTurboTTS.from_pretrained(self.device)
            else:
                from chatterbox.tts import ChatterboxTTS  # type: ignore

                local = self.models_dir / 'chatterbox'
                m = ChatterboxTTS.from_local(str(local), self.device) if all((local / f).exists() for f in CHATTERBOX_FILES) else ChatterboxTTS.from_pretrained(self.device)
        except Exception as e:  # network / download problems
            raise ProviderUnavailable(
                f'Could not load the Chatterbox {kind} model ({type(e).__name__}: {str(e)[:200]}).\n'
                '  It downloads once from Hugging Face (allow huggingface.co and *.hf.co), or place the\n'
                '  model files in .voice-models/chatterbox/ (and .voice-models/chatterbox-turbo/).'
            ) from e
        print(f'[voice] Chatterbox {kind} loaded on {self.device}')
        self.models[kind] = m
        return m

    def synthesize(self, job: dict):
        line = job['line']
        cfg = job['providers']['chatterbox']
        root = Path(__file__).resolve().parent.parent.parent
        ref = root / cfg['reference']
        if not ref.exists():
            raise ProviderUnavailable(f'Reference clip {cfg["reference"]} is missing - run scripts/voice/make_references.py')
        kind = cfg.get('model') or 'standard'
        model = self._load(kind)
        # re-condition only when the speaker changes (saves seconds per line)
        prompt = str(ref) if self.last_ref.get(kind) != str(ref) else None
        self.last_ref[kind] = str(ref)
        self.torch.manual_seed(job['seed'] % (2**31))
        text = _speak_text(line)
        if kind == 'turbo':
            wav = model.generate(text, audio_prompt_path=prompt, norm_loudness=False)
        else:
            base = float(cfg.get('exaggeration', 0.5))
            emo = CHATTERBOX_EXAGGERATION.get(line['emotion'])
            if line['character'] == 'narrator':
                exaggeration = base + (0.08 if line['emotion'] == 'uneasy' else 0.0)
            elif emo is not None:
                exaggeration = (emo + base) / 2 + 0.25 * (float(line['intensity']) - 0.4)
            else:
                exaggeration = base + 0.3 * (float(line['intensity']) - 0.4)
            exaggeration = float(np.clip(exaggeration, 0.25, 1.3))
            # lower cfg weight = slower, more deliberate delivery (and steadier at high exaggeration)
            pace = float(line['pace'])
            cfg_weight = 0.3 if pace <= 0.92 else 0.6 if pace >= 1.05 else 0.5
            if exaggeration > 0.8:
                cfg_weight = min(cfg_weight, 0.35)
            wav = model.generate(text, audio_prompt_path=prompt, exaggeration=exaggeration, cfg_weight=cfg_weight, temperature=0.8)
        x = wav.squeeze(0).detach().cpu().numpy().astype(np.float64)
        return x, model.sr


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
# Fish Audio
# ----------------------------------------------------------------------------
FISH_API = 'https://api.fish.audio'

# Fish S2 understands free-form inline direction in square brackets. Kept short and
# only on character lines - an over-directed narrator is what makes TTS sound fake.
FISH_EMOTION_TAGS = {
    'whispering': '[whispering]',
    'afraid': '[scared]',
    'panicked': '[panicked, breathless]',
    'grieving': '[sad, voice breaking]',
    'screaming': '[screaming]',
    'comforting': '[softly]',
    'unnaturally_calm': '[calm, eerie]',
    'matter_of_fact': '[calm]',
    'sleepy': '[sleepy]',
    'tired': '[tired]',
    'amused': '[amused]',
    'hypnotized': '[dreamy, distant]',
    'distressed': '[distressed]',
    'angry': '[angry]',
    'affectionate': '[warmly]',
    'warm': '[warmly]',
    'confused': '[confused]',
    'protective': '[urgent]',
    'breathless': '[breathless]',
    'uneasy': '[uneasy]',
    'serious': '[serious]',
    'authoritative': '[firm]',
}


def fish_text(job: dict) -> str:
    line = job['line']
    text = _speak_text(line)
    tags = []
    if line.get('fishTags'):
        tags.append(line['fishTags'])
    elif line['audioEffect'] in ('whisper', 'whisperClose'):
        tags.append('[whispering]')
    elif line['character'] == 'narrator':
        if line['volume'] < 0.9 or line['emotion'] == 'whispering':
            tags.append('[quietly]')
    else:
        tag = FISH_EMOTION_TAGS.get(line['emotion'])
        if tag:
            tags.append(tag)
        if line['audioEffect'] == 'shout' and line['emotion'] != 'screaming':
            tags.append('[shouting]')
    return (' '.join(tags) + ' ' + text).strip()


class FishProvider:
    """Fish Audio text-to-speech (https://fish.audio). Voices are public library models
    referenced by id (`referenceId` in voiceConfig.ts). The model defaults to the free
    `s2.1-pro-free`; set FISH_MODEL (e.g. s2.1-pro) to use a paid model with API credit."""

    name = 'fish'

    def __init__(self):
        self.key = os.environ.get('FISH_API_KEY')
        if not self.key:
            raise ProviderUnavailable('FISH_API_KEY is not set (environment variable or .env file).')
        self.model = os.environ.get('FISH_MODEL', 's2.1-pro-free')

    def quota(self):
        return None

    def synthesize(self, job: dict):
        cfg = job['providers']['fish']
        body = {
            'text': fish_text(job),
            'reference_id': cfg['referenceId'],
            'format': 'wav',
            'normalize': True,
            'latency': 'normal',
            'prosody': {'speed': round(float(np.clip(job['perceivedSpeed'] * cfg.get('speed', 1.0), 0.8, 1.25)), 2)},
        }
        headers = {'Authorization': f'Bearer {self.key}', 'Content-Type': 'application/json', 'model': cfg.get('model') or self.model}
        delay = 2.0
        for attempt in range(6):
            try:
                data = _post(f'{FISH_API}/v1/tts', json.dumps(body).encode(), headers, timeout=180)
                return _wav_bytes_to_array(data)
            except (urllib.error.URLError, ConnectionError, TimeoutError, OSError) as e:
                # dropped / reset connections through the proxy: back off and retry
                if attempt < 5:
                    time.sleep(delay)
                    delay *= 2
                    continue
                raise RuntimeError(f'Fish Audio: connection failed ({e})') from e
            except RuntimeError as e:
                msg = str(e)
                if ('HTTP 429' in msg or 'HTTP 5' in msg) and attempt < 5:
                    time.sleep(delay)
                    delay *= 2
                    continue
                if 'HTTP 402' in msg:
                    raise ProviderUnavailable(f'Fish Audio: no API credit for model {headers["model"]} ({msg[:200]})') from e
                raise
        raise RuntimeError('Fish Audio: too many retries')


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
                'User-Agent': 'frame240-voice-generator',
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
    if name == 'chatterbox':
        return ChatterboxProvider(models_dir)
    if name == 'elevenlabs':
        return ElevenLabsProvider()
    if name == 'fish':
        return FishProvider()
    if name == 'openai':
        return OpenAIProvider(emotion_directions)
    if name == 'azure':
        return AzureProvider()
    if name == 'polly':
        return PollyProvider()
    raise ProviderUnavailable(f'Unknown provider {name}')
