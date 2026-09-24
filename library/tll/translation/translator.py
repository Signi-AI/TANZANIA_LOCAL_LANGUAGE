from __future__ import annotations

from typing import Any, Dict

from .locallang import LocalLangTranslator
from ..data.loader import load_dataset
from ..exceptions import DatasetError


class Translator:
    def __init__(self, source: str, target: str):
        self.source_language = source.strip().lower()
        self.target_language = target.strip().lower()
        try:
            self.engine = LocalLangTranslator(load_dataset("suk", stage="cleaned").rows)
        except DatasetError:
            self.engine = LocalLangTranslator([])

    def translate(self, text: str) -> Dict[str, Any]:
        normalized = (text or "").strip()
        result = self.engine.translate(
            normalized,
            source=self.source_language,
            target=self.target_language,
        )
        status = "found" if result["found_in_dataset"] else "not_found"
        if not normalized:
            status = "empty_input"
        if result["target_language"] not in {"sw", "suk"}:
            status = "unsupported_language"
        return {
            **result,
            "text": normalized,
            "output": result.get("translation") or "",
            "method": "dictionary",
            "engine": "locallang",
            "status": status,
        }
