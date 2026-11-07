"""Whisper speech recognition for voice QA, casting and word timing.

Uses the transformers pipeline when PyTorch is installed, otherwise faster-whisper
(CTranslate2, CPU, no PyTorch - used in the cloud container, where the PyTorch wheel
index is blocked). Both return the transformers pipeline shape:
    asr({'raw': float32 16 kHz, 'sampling_rate': 16000}, return_timestamps='word')
      -> {'text': str, 'chunks': [{'text': str, 'timestamp': (start, end)}, ...]}
"""
from __future__ import annotations

import numpy as np

FW_NAMES = {'openai/whisper-base.en': 'base.en', 'openai/whisper-small.en': 'small.en', 'openai/whisper-tiny.en': 'tiny.en'}


def load(model: str = 'openai/whisper-base.en'):
    try:
        from transformers import pipeline  # type: ignore
        import torch  # noqa: F401  # type: ignore

        return pipeline('automatic-speech-recognition', model=model, device='cpu')
    except ImportError:
        pass
    from faster_whisper import WhisperModel  # type: ignore

    fw = WhisperModel(FW_NAMES.get(model, model), device='cpu', compute_type='int8')

    def run(inp: dict, return_timestamps=None, **_):
        audio = np.asarray(inp['raw'], dtype=np.float32)
        segs, _info = fw.transcribe(audio, language='en', beam_size=5, word_timestamps=return_timestamps == 'word', vad_filter=False, condition_on_previous_text=False)
        segs = list(segs)
        text = ' '.join(s.text.strip() for s in segs).strip()
        out = {'text': text}
        if return_timestamps == 'word':
            out['chunks'] = [{'text': w.word, 'timestamp': (float(w.start), float(w.end))} for s in segs for w in (s.words or [])]
        return out

    return run
