from __future__ import annotations

from typing import Any, Dict, List

from ..data.loader import load_dataset


class Dictionary:
    def __init__(self, language: str, stage: str = "cleaned"):
        self.language = language
        self.stage = stage
        self._dataset = load_dataset(language, stage=stage)

    def _entries(self) -> List[Dict[str, Any]]:
        return self._dataset.rows

    def lookup(self, word: str) -> Dict[str, Any] | None:
        term = (word or "").strip()
        if not term:
            return None
        lowered = term.lower()
        for row in self._entries():
            input_value = str(row.get("input") or "").strip().lower()
            output_value = str(row.get("output") or "").strip().lower()
            if input_value == lowered or output_value == lowered:
                return {
                    "input": row.get("input", ""),
                    "output": row.get("output", ""),
                    "language": row.get("language", self.language),
                    "dialect": row.get("dialect", ""),
                    "category": row.get("category", ""),
                    "source": row.get("source", ""),
                    "confidence": row.get("confidence", "unknown"),
                    "examples": [
                        row.get("example_sentence", "")
                    ] if row.get("example_sentence") else [],
                }
        return None

    def search(self, query: str) -> List[Dict[str, Any]]:
        term = (query or "").strip().lower()
        if not term:
            return []
        matches = []
        for row in self._entries():
            combined = " ".join(
                str(row.get(field, "") or "") for field in ["input", "output", "category", "subcategory"]
            ).lower()
            if term in combined:
                matches.append(row)
        return matches

    def contains(self, word: str) -> bool:
        return self.lookup(word) is not None

    def synonyms(self, word: str) -> List[str]:
        direct = self.lookup(word)
        if not direct:
            return []
        synonyms = []
        for row in self._entries():
            if str(row.get("input") or "").strip().lower() == str(direct["input"]).strip().lower():
                variants = str(row.get("output") or "").split("/")
                for candidate in variants:
                    cleaned = candidate.strip()
                    if cleaned and cleaned.lower() != str(direct["input"]).strip().lower():
                        synonyms.append(cleaned)
        return sorted(set(synonyms))

    def variants(self, word: str) -> List[str]:
        row = self.lookup(word)
        if not row:
            return []
        input_value = str(row["input"] or "")
        if "/" not in input_value:
            return []
        return [part.strip() for part in input_value.split("/") if part.strip()]

    def examples(self, word: str) -> List[str]:
        term = (word or "").strip().lower()
        examples: List[str] = []
        for row in self._entries():
            input_value = str(row.get("input") or "").strip().lower()
            output_value = str(row.get("output") or "").strip().lower()
            example = str(row.get("example_sentence") or "").strip()
            if example and (input_value == term or output_value == term):
                examples.append(example)
        return examples
