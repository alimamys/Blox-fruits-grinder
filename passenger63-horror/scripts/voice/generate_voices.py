#!/usr/bin/env python3
"""Generate every voice line of "The 63rd Passenger".

Normally run through npm (which exports the TS data first and retimes afterwards):

    npm run generate-voices                          # all lines, default provider
    npm run generate-voices -- --character oldWoman  # one character only
    npm run generate-voices -- --only narrator_009_someone,oldwoman_final_64
    npm run generate-voices -- --provider elevenlabs --force
    npm run generate-voices -- --scripts-only        # just write scripts/SSML

Only lines whose text/casting/settings changed are regenerated (see
public/audio/.voice-cache.json) unless --force is given.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import numpy as np  # noqa: E402

import dsp  # noqa: E402
import postprocess  # noqa: E402
import ssml  # noqa: E402
from providers import ProviderUnavailable, make_provider  # noqa: E402

ROOT = HERE.parent.parent
DATA = ROOT / 'build' / 'voice-data.json'
AUDIO = ROOT / 'public' / 'audio'
SCRIPTS_OUT = ROOT / 'voice-scripts'
CACHE = AUDIO / '.voice-cache.json'
POST_VERSION = 'post-v5'
# Voices are stored at 24 kHz (Kokoro's native rate) to keep the repo small;
# Remotion resamples everything to 48 kHz when it mixes.
VOICE_SR = 24000


def lerp(a, b, t):
    return a + (b - a) * t


def load_env():
    env = ROOT / '.env'
    if env.exists():
        import os

        for raw in env.read_text().splitlines():
            raw = raw.strip()
            if not raw or raw.startswith('#') or '=' not in raw:
                continue
            k, v = raw.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def build_job(line: dict, data: dict, crowd_index: int, provider_name: str = 'kokoro') -> dict:
    voices = data['VOICES']
    vc = voices[line['character']]
    post = vc['post']
    providers = json.loads(json.dumps(vc['providers']))
    kokoro = providers['kokoro']
    speed = vc['baseSpeed'] * line['pace']
    pitch = post['pitchSemitones']
    tremor = post['tremor']
    lufs = post['lufs']
    desc = vc['description']

    blend = line.get('blendTo')
    if blend:
        other = voices[blend['character']]
        a = float(blend['amount'])
        kokoro = {
            'blend': [[n, w * (1 - a)] for n, w in vc['providers']['kokoro']['blend']]
            + [[n, w * a] for n, w in other['providers']['kokoro']['blend']],
            'lang': other['providers']['kokoro']['lang'] if a >= 0.5 else vc['providers']['kokoro']['lang'],
        }
        speed = lerp(vc['baseSpeed'], other['baseSpeed'], a) * line['pace']
        pitch = lerp(pitch, other['post']['pitchSemitones'], a)
        tremor = lerp(tremor, other['post']['tremor'], a)
        if a >= 0.5:
            for p in ('chatterbox', 'elevenlabs', 'openai', 'azure', 'polly'):
                providers[p] = other['providers'][p]
            desc = f"{desc} (now {int(a * 100)}% {other['displayName']}: {other['description']})"

    if line.get('voiceTweak') == 'younger':
        pitch, tremor = 0.0, 0.06

    if line['character'] == 'crowd':
        pool = data['CROWD_VOICE_POOL']
        pick = pool[crowd_index % len(pool)]
        kokoro = {'blend': [[pick['voice'], 1]], 'lang': pick['lang']}
        providers['chatterbox'] = {**providers['chatterbox'], 'reference': f"voice-references/crowd_{pick['voice']}.wav"}
        epool = data.get('ELEVEN_CROWD_POOL') or []
        if epool:
            providers['elevenlabs'] = {**providers['elevenlabs'], 'voiceName': epool[crowd_index % len(epool)], 'voiceId': None}

    # Pitch / tremor / shout pitching are workarounds for the flat local Kokoro voices.
    # Expressive providers (ElevenLabs, OpenAI...) perform age, breath and shouting
    # themselves, so their takes are left at natural pitch.
    natural = provider_name != 'kokoro'
    if natural:
        pitch, tremor = 0.0, 0.0

    shout_semis = 0.0
    if line['audioEffect'] == 'shout' and not natural:
        shout_semis = 2.0 if line['emotion'] == 'screaming' else 1.0
    # tape-style pitch changes duration; compensate so `pace` keeps its meaning
    # (pitching down by resampling lengthens the take, so synthesise slightly faster)
    tts_speed = speed * 2 ** (-(pitch + shout_semis) / 12)

    seed = int(hashlib.md5(line['id'].encode()).hexdigest()[:8], 16)
    providers['kokoro'] = kokoro
    return {
        'line': line,
        'providers': providers,
        'kokoro': kokoro,
        'speed': tts_speed,
        'perceivedSpeed': speed,
        'pitchSemitones': pitch,
        'tremor': tremor,
        'pan': line['pan'],
        'lufs': lufs,
        'seed': seed,
        'voiceDescription': desc,
        'natural': natural,
        # only these providers can genuinely whisper; others get the whisper vocoder
        'whisperNative': provider_name in ('elevenlabs', 'openai', 'azure'),
        'shoutSemis': shout_semis,
    }


def job_hash(job: dict, provider: str) -> str:
    line = job['line']
    key = {
        'provider': provider,
        'text': line.get('spokenText') or line['text'],
        'emotion': line['emotion'],
        'intensity': line['intensity'],
        'effect': line['audioEffect'],
        'pan': line['pan'],
        'speed': round(job['speed'], 4),
        'pitch': round(job['pitchSemitones'], 3),
        'tremor': round(job['tremor'], 3),
        'lufs': job['lufs'],
        'voice': job['providers'][provider] if provider != 'kokoro' else job['kokoro'],
        'post': POST_VERSION,
    }
    return hashlib.md5(json.dumps(key, sort_keys=True).encode()).hexdigest()


def write_scripts(data: dict, jobs: list[dict]) -> None:
    SCRIPTS_OUT.mkdir(parents=True, exist_ok=True)
    dirs = data['EMOTION_DIRECTIONS']
    voices = data['VOICES']
    md = ['# The 63rd Passenger - performance script', '',
          'Generated from `src/data/voiceLines.ts` by `npm run generate-voices -- --scripts-only`.',
          'Use it for human voice actors or as a reference when re-voicing with another provider.', '',
          '## Cast', '']
    for c, v in voices.items():
        md.append(f"- **{v['displayName']}** (`{c}`): {v['description']}")
    scene = None
    for job in jobs:
        line = job['line']
        if line['scene'] != scene:
            scene = line['scene']
            md += ['', f'## Scene: {scene}', '']
        who = voices[line['character']]['displayName'].upper()
        meta = f"{line['emotion']} · intensity {line['intensity']:.2f} · pace {line['pace']:.2f} · fear {line['fearLevel']} · fx {line['audioEffect']}"
        if line['breath'] != 'none':
            meta += f" · breath {line['breath']}"
        md.append(f"**{who}** — \"{line['text']}\"  ")
        md.append(f"<sub>`{line['filename']}` · {meta}</sub>  ")
        if line['direction']:
            md.append(f"_{line['direction']}_")
        md.append('')
    (SCRIPTS_OUT / 'performance_script.md').write_text('\n'.join(md))
    (SCRIPTS_OUT / 'ssml_azure.json').write_text(json.dumps({j['line']['id']: ssml.azure_ssml(j) for j in jobs}, indent=1))
    (SCRIPTS_OUT / 'ssml_polly.json').write_text(json.dumps({j['line']['id']: ssml.polly_ssml(j) for j in jobs}, indent=1))
    (SCRIPTS_OUT / 'acting_instructions.json').write_text(
        json.dumps({j['line']['id']: ssml.acting_instructions(j, dirs) for j in jobs}, indent=1)
    )


BABBLE = [
    "I told her we'd be back by one.",
    'Do you want anything from the cafe before it closes?',
    'Is the bar still open?',
    "My phone's nearly dead.",
    'No, the later bus, the one after midnight.',
    "It's freezing out on deck.",
    'How long is this crossing again?',
    'Mum said she would pick us up.',
    "He's asleep, don't wake him.",
    "I can't believe we nearly missed it.",
    'Did you bring the charger?',
    'We should come back in the summer.',
    'Yeah, yeah, I know. I know.',
    "That's what I said to him!",
    'Do you think it will be cold tomorrow?',
    'Pass me the water?',
    'What time do we get in?',
    "I'll text you when we land.",
]


def build_crowd_bed(provider, data: dict, seconds=46.0) -> None:
    """Quiet, loopable passenger murmur built from many overlapping TTS voices."""
    pool = data['CROWD_VOICE_POOL']
    rng = np.random.default_rng(63)
    n = int(seconds * dsp.SR)
    bed = np.zeros((n, 2))
    t = 0.0
    i = 0
    while t < seconds:
        pick = pool[i % len(pool)]
        text = BABBLE[i % len(BABBLE)]
        audio, sr = provider.k.create(text, voice=pick['voice'], speed=float(rng.uniform(0.95, 1.12)), lang=pick['lang'])
        x = dsp.resample(np.asarray(audio, dtype=np.float64), sr, dsp.SR)
        x = postprocess.fx_crowd(x)
        x = dsp.lp(x, 2600, dsp.SR, 2) * dsp.db(float(rng.uniform(-9, -2)))
        x = dsp.pan(x, float(rng.uniform(-0.85, 0.85)))
        start = int(t * dsp.SR)
        end = min(n, start + len(x))
        bed[start:end] += x[: end - start]
        # wrap the overflow to the start so the bed loops seamlessly
        over = len(x) - (end - start)
        if over > 0:
            bed[:over] += x[end - start: end - start + over]
        t += float(rng.uniform(0.45, 1.3))
        i += 1
    bed = dsp.normalize_lufs(bed, -30)
    bed = dsp.limit(bed, -6)
    out = AUDIO / 'sfx' / 'crowd_murmur.wav'
    out.parent.mkdir(parents=True, exist_ok=True)
    dsp.write_wav(str(out), dsp.resample(bed, dsp.SR, VOICE_SR), VOICE_SR)
    print(f'  crowd bed -> {out.relative_to(ROOT)}')


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--provider', help='kokoro | chatterbox | elevenlabs | openai | azure | polly (default from voiceConfig.ts)')
    ap.add_argument('--character', action='append', help='only this character id (repeatable), e.g. oldWoman')
    ap.add_argument('--only', help='comma separated line ids')
    ap.add_argument('--force', action='store_true', help='regenerate even if unchanged')
    ap.add_argument('--scripts-only', action='store_true', help='write performance script + SSML, no audio')
    ap.add_argument('--skip-crowd-bed', action='store_true')
    ap.add_argument('--models-dir', default=str(ROOT / '.voice-models'))
    ap.add_argument('--estimate', action='store_true', help='print how many characters would be sent to the provider, then exit')
    ap.add_argument('--max-chars', type=int, default=0, help='stop before sending more than this many characters (quota guard)')
    args = ap.parse_args()

    load_env()
    if not DATA.exists():
        print('build/voice-data.json missing - run `node scripts/export-voice-data.mjs` first (npm run generate-voices does this).')
        return 1
    data = json.loads(DATA.read_text())
    provider_name = args.provider or data['DEFAULT_PROVIDER']

    lines = data['VOICE_LINES']
    crowd_ix = {l['id']: i for i, l in enumerate([l for l in lines if l['character'] == 'crowd'])}
    jobs = [build_job(l, data, crowd_ix.get(l['id'], 0), provider_name) for l in lines]
    # story context for providers that use it (ElevenLabs previous_text / next_text)
    story = [j for j in jobs if j['line']['character'] != 'crowd']
    for i, j in enumerate(story):
        j['prevText'] = (story[i - 1]['line'].get('spokenText') or story[i - 1]['line']['text']) if i > 0 else ''
        j['nextText'] = (story[i + 1]['line'].get('spokenText') or story[i + 1]['line']['text']) if i + 1 < len(story) else ''
    write_scripts(data, jobs)
    print(f'Wrote performance script + SSML for {len(jobs)} lines -> voice-scripts/')
    if args.scripts_only:
        return 0

    if args.character:
        jobs = [j for j in jobs if j['line']['character'] in args.character]
    if args.only:
        wanted = {s.strip() for s in args.only.split(',') if s.strip()}
        jobs = [j for j in jobs if j['line']['id'] in wanted]

    def chars(job):
        if provider_name == 'elevenlabs':
            from providers import eleven_text

            return len(eleven_text(job, job['providers']['elevenlabs']['model'].startswith('eleven_v3')))
        return len(job['line'].get('spokenText') or job['line']['text'])

    if args.estimate:
        per = {}
        for j in jobs:
            per[j['line']['character']] = per.get(j['line']['character'], 0) + chars(j)
        for c, n in sorted(per.items(), key=lambda kv: -kv[1]):
            print(f'  {c:10s} {n:6d} characters')
        print(f'  TOTAL      {sum(per.values()):6d} characters for {len(jobs)} line(s) with provider "{provider_name}"')
        return 0

    try:
        provider = make_provider(provider_name, Path(args.models_dir), data['EMOTION_DIRECTIONS'])
    except ProviderUnavailable as e:
        print(f'\n[voice] Provider "{provider_name}" is not available:\n  {e}\n')
        print('The project still compiles and renders: missing lines are timed from estimates and simply stay silent.')
        print('Performance scripts/SSML were written to voice-scripts/ so the lines can be recorded or generated later.')
        return 2

    if hasattr(provider, 'quota'):
        q = provider.quota()
        if q:
            print(f'[voice] {provider_name} quota: {q[0]:,} of {q[1]:,} characters used this period ({q[1] - q[0]:,} left)')

    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    done = skipped = 0
    sent = 0
    t0 = time.time()
    for job in jobs:
        line = job['line']
        out = AUDIO / line['filename']
        h = job_hash(job, provider_name)
        if not args.force and out.exists() and cache.get(line['filename'], {}).get('hash') == h:
            skipped += 1
            continue
        if args.max_chars and sent + chars(job) > args.max_chars:
            print(f'\n[voice] --max-chars {args.max_chars} reached; stopping. Re-run later to continue (finished lines are kept).')
            break
        try:
            audio, sr = provider.synthesize(job)
        except ProviderUnavailable as e:
            print(f'\n[voice] {e}')
            break
        sent += chars(job)
        y = postprocess.process_line(audio, sr, job)
        out.parent.mkdir(parents=True, exist_ok=True)
        dsp.write_wav(str(out), dsp.resample(y, dsp.SR, VOICE_SR), VOICE_SR)
        cache[line['filename']] = {'hash': h, 'provider': provider_name, 'seconds': round(len(y) / dsp.SR, 3)}
        done += 1
        print(f'  [{done:3d}] {line["filename"]:<52} {len(y) / dsp.SR:5.2f}s')
        if done % 20 == 0:
            CACHE.write_text(json.dumps(cache, indent=1, sort_keys=True))
    CACHE.write_text(json.dumps(cache, indent=1, sort_keys=True))

    wants_crowd = not args.character or 'crowd' in args.character
    bed = AUDIO / 'sfx' / 'crowd_murmur.wav'
    if provider_name == 'kokoro' and wants_crowd and not args.skip_crowd_bed and not args.only and (args.force or not bed.exists() or done):
        build_crowd_bed(provider, data)

    print(f'\nGenerated {done} line(s), {skipped} unchanged, in {time.time() - t0:.0f}s with provider "{provider_name}" ({sent:,} characters sent).')
    return 0


if __name__ == '__main__':
    sys.exit(main())
