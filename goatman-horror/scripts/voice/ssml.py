"""Performance metadata -> provider instructions.

* acting_instructions(): natural-language direction for instruction-following TTS
  (OpenAI gpt-4o-mini-tts) and for human voice actors.
* azure_ssml(): SSML with mstts:express-as styles, prosody and breaks.
* polly_ssml(): SSML with prosody, breaks and (standard engine) whisper effect.
"""
from __future__ import annotations

import re
from xml.sax.saxutils import escape

FEAR_WORDS = {
    0: 'calm, normal',
    1: 'mild confusion',
    2: 'unease',
    3: 'controlled fear',
    4: 'panic',
    5: 'terror',
}

AZURE_STYLES = {
    'whispering': 'whispering',
    'afraid': 'terrified',
    'panicked': 'terrified',
    'screaming': 'shouting',
    'angry': 'angry',
    'grieving': 'sad',
    'distressed': 'sad',
    'comforting': 'gentle',
    'unnaturally_calm': 'calm',
    'matter_of_fact': 'calm',
    'warm': 'gentle',
    'affectionate': 'gentle',
    'sleepy': 'gentle',
    'professional': 'serious',
    'authoritative': 'serious',
    'serious': 'narration-professional',
    'neutral': 'narration-professional',
    'uneasy': 'serious',
    'confused': 'empathetic',
    'protective': 'serious',
    'hypnotized': 'whispering',
    'amused': 'friendly',
    'casual': 'friendly',
    'tired': 'calm',
}


def _breaks(text: str) -> str:
    """'...' -> short break, sentence ends -> natural break."""
    t = escape(text)
    t = re.sub(r'\.\.\.|…', '<break time="420ms"/>', t)
    return t


def rate_percent(job: dict) -> str:
    pct = (job['speed'] - 1.0) * 100
    return f'{pct:+.0f}%'


def volume_word(line: dict) -> str:
    v = line['volume']
    if line['audioEffect'] in ('whisper', 'whisperClose'):
        return 'soft'
    if v < 0.8:
        return 'soft'
    if v > 1.05:
        return 'loud'
    return 'medium'


def acting_instructions(job: dict, directions: dict) -> str:
    line = job['line']
    voice = job['voiceDescription']
    emo = directions.get(line['emotion'], line['emotion'])
    pace = 'slower than normal' if job['speed'] < 0.92 else 'faster than normal' if job['speed'] > 1.06 else 'natural pace'
    parts = [
        f'Character: {voice}',
        f'Delivery: {emo} Intensity {line["intensity"]:.1f} of 1. {pace}.',
        f'Fear level: {FEAR_WORDS.get(line.get("fearLevel", 0), "")}.',
    ]
    if line.get('direction'):
        parts.append(f'Direction: {line["direction"]}')
    if line.get('breath') and line['breath'] != 'none':
        parts.append(f'Breath: {line["breath"]} before/after the line.')
    parts.append('Sound like a real person in the moment, not an announcer. The character does not know they are in a horror story. No exaggerated drama.')
    return ' '.join(parts)


def azure_ssml(job: dict) -> str:
    line = job['line']
    voice = job['providers']['azure']['voice']
    style = AZURE_STYLES.get(line['emotion'], 'calm')
    degree = 0.6 + 1.2 * float(line['intensity'])
    text = _breaks(line.get('spokenText') or line['text'])
    return (
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" '
        'xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">'
        f'<voice name="{voice}"><mstts:express-as style="{style}" styledegree="{degree:.2f}">'
        f'<prosody rate="{rate_percent(job)}" volume="{volume_word(line)}">{text}</prosody>'
        '</mstts:express-as></voice></speak>'
    )


def polly_ssml(job: dict) -> str:
    line = job['line']
    engine = job['providers']['polly']['engine']
    text = _breaks(line.get('spokenText') or line['text'])
    rate = f'{int(round(job["speed"] * 100))}%'
    inner = f'<prosody rate="{rate}">{text}</prosody>'
    if engine == 'standard' and line['audioEffect'] in ('whisper', 'whisperClose'):
        inner = f'<amazon:effect name="whispered">{inner}</amazon:effect>'
    if engine == 'generative':
        inner = text  # generative voices support only a small SSML subset
    return f'<speak>{inner}</speak>'
