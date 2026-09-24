from __future__ import annotations

import re
import unicodedata
from collections import defaultdict
from difflib import SequenceMatcher
from typing import Any, Dict, List, Optional


LANGUAGE_ALIASES = {
    "sw": "sw",
    "kiswahili": "sw",
    "swahili": "sw",
    "suk": "suk",
    "sukuma": "suk",
    "kisukuma": "suk",
}


def canonical_language(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    normalized = value.strip().lower()
    if normalized == "auto":
        return "auto"
    return LANGUAGE_ALIASES.get(normalized, normalized)


def normalize_local_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text or "").lower()
    normalized = "".join(char for char in normalized if not unicodedata.combining(char))
    normalized = re.sub(r"[^\w'\s/-]", " ", normalized, flags=re.UNICODE)
    return re.sub(r"\s+", " ", normalized).strip()


def _variants(text: Any) -> List[str]:
    return [part.strip() for part in normalize_local_text(str(text or "")).split("/") if part.strip()]


class LocalLangTranslator:
    """Dataset-first translator ported from LOCAL_LANGUAGE's translation engine."""

    def __init__(self, rows: List[Dict[str, Any]]):
        self.rows = rows
        self.local_index: Dict[str, Dict[str, List[Dict[str, Any]]]] = defaultdict(
            lambda: defaultdict(list)
        )
        self.swahili_index: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.sentence_index: Dict[tuple[str, str], Dict[str, str]] = defaultdict(dict)
        self.local_tokens: Dict[str, set[str]] = defaultdict(set)
        self.swahili_tokens: set[str] = set()

        for row in rows:
            language = canonical_language(row.get("language")) or ""
            for value in _variants(row.get("input")):
                self.local_index[language][value].append(row)
                self.local_tokens[language].update(
                    token for token in value.split() if len(token) > 2
                )
            for value in _variants(row.get("output")):
                self.swahili_index[value].append(row)
                self.swahili_tokens.update(
                    token for token in value.split() if len(token) > 2
                )
            example = normalize_local_text(str(row.get("example_sentence") or ""))
            sentence_translation = normalize_local_text(
                str(row.get("sentence_translation") or "")
            )
            if example and sentence_translation:
                self.sentence_index[("suk", "sw")][example] = sentence_translation
                self.sentence_index[("sw", "suk")][sentence_translation] = example

    def detect(self, text: str) -> str:
        tokens = [token for token in normalize_local_text(text).split() if len(token) > 2]
        scores = {"sw": 0, "suk": 0}
        for token in tokens:
            for language in ("suk",):
                if token in self.local_tokens[language]:
                    scores[language] += 1
            if token in self.swahili_tokens:
                scores["sw"] += 1

        phrase = normalize_local_text(text)
        for language in ("suk",):
            if phrase in self.local_index[language]:
                scores[language] += 3
        if phrase in self.swahili_index:
            scores["sw"] += 3

        ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        if not ranked[0][1] or ranked[0][1] == ranked[1][1]:
            return "unknown"
        return ranked[0][0]

    def _lookup(self, term: str, source: str, target: str) -> Optional[Dict[str, Any]]:
        if source == "sw":
            for row in self.swahili_index.get(term, []):
                if target == canonical_language(row.get("language")):
                    return row
            return None
        hits = self.local_index.get(source, {}).get(term, [])
        return hits[0] if hits else None

    def _lookup_sentence(self, term: str, source: str, target: str) -> Optional[str]:
        return self.sentence_index.get((source, target), {}).get(term)

    def _compose_translation(
        self, term: str, source: str, target: str
    ) -> tuple[Optional[Dict[str, Any]], str, int]:
        """Translate a sentence using the longest known phrase at each position."""
        words = term.split()
        if len(words) < 2:
            return None, "", 0

        parts: List[str] = []
        matched_tokens = 0
        sample: Optional[Dict[str, Any]] = None
        index = 0
        while index < len(words):
            found: Optional[Dict[str, Any]] = None
            span = 0
            for size in range(min(5, len(words) - index), 0, -1):
                candidate = " ".join(words[index : index + size])
                found = self._lookup(candidate, source, target)
                if found:
                    span = size
                    break

            if found:
                sample = sample or found
                translated = found.get("output") if target == "sw" else found.get("input")
                parts.append(str(translated or candidate))
                matched_tokens += span
                index += span
            else:
                parts.append(words[index])
                index += 1

        if sample is None or matched_tokens == 0:
            return None, "", 0
        result = self._build(sample, source, target, term, "composed")
        result["translation"] = " ".join(parts)
        return result, result["translation"], matched_tokens

    def _fuzzy(self, term: str, source: str, target: str):
        pool = (
            self.swahili_index.keys()
            if source == "sw"
            else self.local_index.get(source, {}).keys()
        )
        best_key: Optional[str] = None
        best_score = 0.0
        for key in pool:
            if abs(len(key) - len(term)) > 4:
                continue
            score = SequenceMatcher(None, term, key).ratio()
            if score > best_score:
                best_key, best_score = key, score
        if best_key and best_score >= 0.82:
            return self._lookup(best_key, source, target), best_key, best_score
        return None, best_key, best_score

    @staticmethod
    def _confidence(row: Dict[str, Any], match_type: str) -> str:
        if match_type == "exact":
            return "high" if str(row.get("confidence", "")).lower() == "verified" else "medium"
        return "medium" if match_type == "fuzzy" else "low"

    def _build(
        self,
        row: Dict[str, Any],
        source: str,
        target: str,
        text: str,
        match_type: str,
    ) -> Dict[str, Any]:
        return {
            "source_language": source,
            "target_language": target,
            "input": text,
            "translation": row.get("output") if target == "sw" else row.get("input"),
            "dialect": row.get("dialect") or None,
            "category": row.get("category") or None,
            "subcategory": row.get("subcategory") or None,
            "example_sentence": row.get("example_sentence") or None,
            "confidence": self._confidence(row, match_type),
            "found_in_dataset": True,
            "match_type": match_type,
            "suggestion": None,
            "message": None,
        }

    @staticmethod
    def _not_found(source: str, target: str, text: str, suggestion: Optional[str] = None):
        return {
            "source_language": source,
            "target_language": target,
            "input": text,
            "translation": None,
            "dialect": None,
            "category": None,
            "subcategory": None,
            "example_sentence": None,
            "confidence": "low",
            "found_in_dataset": False,
            "match_type": "none",
            "suggestion": suggestion,
            "message": (
                f'I could not find "{text}". Did you mean "{suggestion}"?'
                if suggestion
                else "No reliable translation was found in the current dataset."
            ),
        }

    def translate(self, text: str, source: str = "auto", target: str = "sw") -> Dict[str, Any]:
        original = (text or "").strip()
        source_code = canonical_language(source) or "auto"
        target_code = canonical_language(target) or "sw"

        if not original:
            return self._not_found("unknown", target_code, original)
        if source_code not in {"auto", "sw", "suk"} or target_code not in {"sw", "suk"}:
            result = self._not_found(source_code, target_code, original)
            result["message"] = "Only Kiswahili and Kisukuma are currently supported."
            return result

        detected = self.detect(original) if source_code == "auto" else source_code
        if detected == "unknown":
            result = self._not_found(detected, target_code, original)
            result["message"] = "Language could not be identified. Please select it manually."
            return result
        if detected == target_code:
            result = self._not_found(detected, target_code, original)
            result["message"] = "Source and target language are the same."
            return result

        term = normalize_local_text(original)
        sentence_translation = self._lookup_sentence(term, detected, target_code)
        if sentence_translation:
            result = self._not_found(detected, target_code, original)
            result.update(
                {
                    "translation": sentence_translation,
                    "found_in_dataset": True,
                    "match_type": "sentence",
                    "confidence": "high",
                    "message": None,
                }
            )
            return result

        row = self._lookup(term, detected, target_code)
        if row and len(term.split()) == 1:
            return self._build(row, detected, target_code, original, "exact")

        composed, _, matched_tokens = self._compose_translation(
            term, detected, target_code
        )
        if composed and matched_tokens / len(term.split()) >= 0.5:
            composed["input"] = original
            return composed

        if row:
            return self._build(row, detected, target_code, original, "exact")

        row, key, score = self._fuzzy(term, detected, target_code)
        if row:
            result = self._build(row, detected, target_code, original, "fuzzy")
            result["suggestion"] = key
            result["message"] = f'Closest dataset match was "{key}". Please verify with a native speaker.'
            return result
        return self._not_found(detected, target_code, original, key if score > 0.6 else None)
