from __future__ import annotations

from typing import Dict, List

from .normalize import normalize_text


_SWAHILI_HINTS = {
    "hivi", "hivyo", "kwa", "kama", "mimi", "wewe", "yako", "habari", "siku", "mchana", "watoto",
    "maji", "nyumba", "nchi", "watu", "mazuri", "jina", "sana", "hapa", "nani", "kazi",
}

_SUKUMA_HINTS = {
    "mwalimu", "mwanafunzi", "shule", "darasa", "kitabu", "mtihani", "kazi", "ng'ombe", "mti",
    "moyo", "sukuma", "gwe", "nkw", "mbuga", "mala", "lila", "na", "nsi", "mbi",
}


def detect_language(text: str) -> Dict[str, object]:
    """Return a lightweight language classification using conservative heuristics.

    This is a placeholder for future ML-based language identification. It is not a
    claim of perfect linguistic detection; it simply uses a small set of known
    vocabulary hints for Kiswahili and Kisukuma.
    """
    if text is None:
        return {"language": "unknown", "confidence": 0.0, "method": "heuristic"}

    normalized = normalize_text(text).lower()
    tokens = set(normalized.split())

    sw_score = sum(1 for token in tokens if token in _SWAHILI_HINTS)
    suk_score = sum(1 for token in tokens if token in _SUKUMA_HINTS)

    if sw_score > suk_score and sw_score > 0:
        return {"language": "sw", "confidence": min(1.0, 0.5 + (sw_score * 0.1)), "method": "heuristic"}
    if suk_score > sw_score and suk_score > 0:
        return {"language": "suk", "confidence": min(1.0, 0.5 + (suk_score * 0.1)), "method": "heuristic"}
    return {"language": "unknown", "confidence": 0.0, "method": "heuristic"}
