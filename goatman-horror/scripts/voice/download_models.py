#!/usr/bin/env python3
"""Download the Kokoro v1.0 model + voice pack (~350 MB) into .voice-models/.

Only needed for (re)generating voices with the local `kokoro` provider. The
rendered project never needs the internet.
"""
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
DEST = ROOT / '.voice-models'
BASE = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
FILES = ['kokoro-v1.0.onnx', 'voices-v1.0.bin']


def main() -> int:
    DEST.mkdir(exist_ok=True)
    for name in FILES:
        out = DEST / name
        if out.exists() and out.stat().st_size > 1_000_000:
            print(f'ok   {out.relative_to(ROOT)}')
            continue
        print(f'get  {BASE + name}')
        urllib.request.urlretrieve(BASE + name, out)
        print(f'     -> {out.relative_to(ROOT)} ({out.stat().st_size / 1e6:.0f} MB)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
