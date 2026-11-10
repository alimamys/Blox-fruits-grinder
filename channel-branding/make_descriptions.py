#!/usr/bin/env python3
"""Rebuild the four films' YouTube descriptions: short, each in its own words, at most a couple of links.

The first descriptions carried every CC-BY recording in the shared sound library (30+ freesound links,
80 % identical text across three videos posted on consecutive days) - a pattern that looks like spam.
Here each film credits ONLY the CC-BY recordings inside the sounds it actually plays (its timeline's
cues, hits and ambience beds), as plain text; one link to the licences (CC BY 4.0 s.3(a)(1)-(2) allows
attribution in any reasonable manner for the medium, including via a link).

    ../widemouth-horror/.venv/bin/python make_descriptions.py   -> descriptions/*.txt
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / 'descriptions'
FILMS = ['frame240-horror', 'door306-horror', 'goatman-horror', 'widemouth-horror']


def used_sounds(film: str) -> set[str]:
    src = (ROOT / film / 'src' / 'data' / 'timeline.ts').read_text()
    names = set(re.findall(r"sound:\s*'([\w-]+)'", src)) | set(re.findall(r"hit\('([\w-]+)'", src))
    audio = (ROOT / film / 'src' / 'audio' / 'AudioLayer.tsx').read_text()
    names |= set(re.findall(r"sfx/([\w-]+)\.wav", audio))
    return names


def ccby_used(film: str) -> list[str]:
    used = used_sounds(film)
    out = []
    for line in (ROOT / film / 'public' / 'audio' / 'sfx' / 'CREDITS.md').read_text().splitlines():
        m = re.match(r'- "(.+?)" by (.+?) - https?://\S+ - (CC BY [\d.]+) .*used in: (.+)$', line)
        if m and used & {s.strip() for s in m.group(4).split(',')}:
            out.append(f'"{m.group(1)}" by {m.group(2)} ({m.group(3)})')
    return out




def chapters(film: str) -> list[str]:
    t = (ROOT / film / 'youtube' / 'DESCRIPTION.txt').read_text().splitlines()
    i = t.index('CHAPTERS') + 1
    out = []
    while i < len(t) and t[i].strip():
        out.append(t[i])
        i += 1
    return out


def sounds(film: str, lead: str) -> str:
    c = ccby_used(film)
    lic = sorted({re.search(r'CC BY ([\d.]+)', x).group(1) for x in c})
    return f'{lead} ' + '; '.join(c) + f'. Licences: creativecommons.org/licenses/by/{lic[-1]}' + (' (and earlier versions as noted)' if len(lic) > 1 else '')


def build() -> dict[str, str]:
    d = {}
    d['frame240'] = '\n'.join([
        'There were 239 frames in my animation when I went to bed. When I opened it again, there were 240.',
        'In the extra frame, a man was standing in my hallway. I hadn\'t drawn him. And every time I pressed play, he was closer.',
        '',
        'Mara animates alone, late at night. Then her timeline starts adding frames she never made.',
        '',
        *chapters('frame240-horror'),
        '',
        'An original story, written and animated for Daddy Tales. Headphones help.',
        '',
        sounds('frame240-horror', 'Sound design from field recordings (Freesound). Used under Creative Commons Attribution:'),
        '',
        '#horrorstory #animation',
    ])
    d['door306'] = '\n'.join([
        'I thought my neighbors were sleepwalking.',
        'At exactly 3:06 in the morning, every apartment door in my building opened - and all of them stepped into the hallway, '
        'completely still, facing the stairs. Then something started coming up.',
        '',
        'Chapters',
        *chapters('door306-horror'),
        '',
        'Would you have looked through the peephole?',
        '',
        'Credits - story and animation: Daddy Tales (original). '
        + sounds('door306-horror', 'Recordings used under CC BY, via Freesound:'),
        '',
        '#scarystories #3am',
    ])
    d['goatman'] = '\n'.join([
        'Eleven of us. Twelve hot dogs gone.',
        'Something sat with us in that trailer for a whole day - ate with us, laughed with us - and none of us could say whose face it was wearing.',
        '',
        *chapters('goatman-horror'),
        '',
        'Retold in our own words from "Anansi\'s Goatman Story" by Anansi (2012), as archived on the Creepypasta Wiki under CC BY-SA 3.0: '
        'creepypasta.fandom.com/wiki/Anansi%27s_Goatman_Story - characters renamed, new ending.',
        '',
        sounds('goatman-horror', 'Sound effects include CC BY recordings:'),
        '',
        '#creepypasta #goatman',
    ])
    d['widemouth'] = '\n'.join([
        'I was five. I was sick. And my only friend lived under my bed.',
        'He was the size of a cat, with shiny black eyes and a mouth that stretched from ear to ear - and he wanted to play a game.',
        '',
        *chapters('widemouth-horror'),
        '',
        'Based on "Mr. Widemouth" by PerfectCircle35 (2010) - retold in our own words with a new beginning and ending. '
        'The original: creepypasta.fandom.com/wiki/Mr._Widemouth',
        'The music box theme was composed for this film.',
        '',
        sounds('widemouth-horror', 'Some sounds use CC BY recordings:'),
        '',
        '#mrwidemouth #creepypasta',
    ])
    return d


def main() -> None:
    import difflib
    OUT.mkdir(exist_ok=True)
    d = build()
    for k, v in d.items():
        (OUT / f'{k}_DESCRIPTION.txt').write_text(v + '\n')
        links = len(re.findall(r'[a-z0-9-]+\.(?:org|com|net)/', v))
        print(f'{k:10s} {len(v):5d} chars, {links} links')
    ks = list(d)
    worst = max(difflib.SequenceMatcher(None, d[a], d[b]).ratio() for i, a in enumerate(ks) for b in ks[i + 1:])
    print(f'most similar pair: {worst * 100:.0f}% identical text (was 80-83%)')


if __name__ == '__main__':
    main()
