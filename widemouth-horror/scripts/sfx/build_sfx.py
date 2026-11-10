#!/usr/bin/env python3
"""Entry point used by `npm run build-sfx` (scripts/build-sfx.mjs).

Builds every sound effect / ambience bed from real CC0 / CC-BY recordings - see
build_real_sfx.py (designs), sfxlib.py (DSP + downloads), sources.json (source registry)
and public/audio/sfx/CREDITS.md (generated attribution list). The previous fully
synthetic generator is kept as build_sfx_procedural.py for reference.

  npm run build-sfx                 # all sounds (downloads sources on first run, ~450 MB)
  npm run build-sfx -- wind slap    # just these
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_real_sfx import main  # noqa: E402

if __name__ == '__main__':
    main()
