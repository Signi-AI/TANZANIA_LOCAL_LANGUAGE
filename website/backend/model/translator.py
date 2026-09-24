"""LocalLang AI translation engine.

Dataset-first matching:
  1. exact match
  2. word-by-word composition for sentences
  3. fuzzy (spelling variation) match
  4. no hallucination -> returns found_in_dataset = False
"""

from __future__ import annotations

import csv
import glob
import os
import re
import unicodedata
from collections import defaultdict
from difflib import SequenceMatcher
from typing import Dict, List, Optional

LOCAL_LANGUAGES = [
    "Sukuma",
    "Ruhaya",
    "Kinyakyusa",
    "Kichaga",
    "Kihehe",
    "Kiha",
    "Kijita",
    "Kizaramo",
    "Kimasai",
    "Kifipa",
]
ALL_LANGUAGES = LOCAL_LANGUAGES + ["Kiswahili", "English", "French"]

# Kihaya / Kihaya (Bukoba) / Ruhaya all mean the same language in the dataset
LANGUAGE_ALIASES = {
    "kihaya": "Ruhaya",
    "kihaya/ruhaya": "Ruhaya",
    "ruhaya": "Ruhaya",
    "haya": "Ruhaya",
    "sukuma": "Sukuma",
    "kisukuma": "Sukuma",
    "kinyakyusa": "Kinyakyusa",
    "nyakyusa": "Kinyakyusa",
    "kichaga": "Kichaga",
    "kiichaga": "Kichaga",
    "kihehe": "Kihehe",
    "kiha": "Kiha",
    "kiha/kihehe": "Kiha",
    "kijita": "Kijita",
    "kijita/kijita": "Kijita",
    "kizaramo": "Kizaramo",
    "kisaramo": "Kizaramo",
    "kimasai": "Kimasai",
    "kimasaai": "Kimasai",
    "kifipa": "Kifipa",
    "kifipa/kiyafipa": "Kifipa",
    "kiswahili": "Kiswahili",
    "swahili": "Kiswahili",
    "sw": "Kiswahili",
    "english": "English",
    "en": "English",
    "eng": "English",
    "french": "French",
    "fr": "French",
    "fra": "French",
    "francais": "French",
    "french language": "French",
}


def canon_language(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    if value == "auto":
        return "auto"
    return LANGUAGE_ALIASES.get(value.strip().lower(), value.strip())


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKD", text or "").lower()
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.replace("/", " ")
    text = re.sub(r"[^\w'\s-]", " ", text, flags=re.UNICODE)
    return re.sub(r"\s+", " ", text).strip()


def variants(text: str) -> List[str]:
    return [normalize(part) for part in re.split(r"\s*/\s*", text or "") if normalize(part)]


def tokenize(text: str) -> List[str]:
    """Return normalized word tokens, ignoring punctuation and slash separators."""
    return re.findall(r"[\w]+(?:['-][\w]+)*", normalize(text), flags=re.UNICODE)


def first_variant(text: str) -> str:
    """Use one dataset alternative as a clean value, never returning slash syntax."""
    values = variants(text)
    return re.sub(r"[*`_]", "", values[0]).strip() if values else ""


class Translator:
    """In-memory index built from the CSV dataset (or rows fetched from Supabase)."""

    def __init__(self, rows: List[dict]):
        self.rows = rows
        self.local_index: Dict[str, Dict[str, List[dict]]] = defaultdict(lambda: defaultdict(list))
        self.swahili_index: Dict[str, List[dict]] = defaultdict(list)
        self.local_tokens: Dict[str, set] = defaultdict(set)
        self.swahili_tokens: set = set()

        for row in rows:
            lang = canon_language(row.get("language")) or ""
            for v in variants(row.get("input", "")):
                self.local_index[lang][v].append(row)
                self.local_tokens[lang].update(t for t in tokenize(v) if len(t) > 2)
            for v in variants(row.get("output", "")):
                self.swahili_index[v].append(row)
                self.swahili_tokens.update(t for t in tokenize(v) if len(t) > 2)

    # ---------------------------------------------------------------- loading
    @classmethod
    def from_csv_dir(cls, directory: str) -> "Translator":
        rows: List[dict] = []
        seen = set()
        for path in sorted(glob.glob(os.path.join(directory, "*.csv"))):
            with open(path, encoding="utf-8-sig", newline="") as fh:
                for row in csv.DictReader(fh):
                    key = (
                        (row.get("language") or "").lower(),
                        (row.get("input") or "").strip().lower(),
                        (row.get("output") or "").strip().lower(),
                    )
                    if not row.get("input") or not row.get("output") or key in seen:
                        continue
                    seen.add(key)
                    rows.append({k: (v or "").strip() for k, v in row.items()})
        return cls(rows)

    # ------------------------------------------------------------- detection
    def detect(self, text: str) -> str:
        tokens = [t for t in tokenize(text) if len(t) > 2]
        scores = {lang: 0 for lang in ALL_LANGUAGES}
        for token in tokens:
            for lang in LOCAL_LANGUAGES:
                if token in self.local_tokens[lang]:
                    scores[lang] += 1
            if token in self.swahili_tokens:
                scores["Kiswahili"] += 1
        phrase = normalize(text)
        for lang in LOCAL_LANGUAGES:
            if phrase in self.local_index[lang]:
                scores[lang] += 3
        if phrase in self.swahili_index:
            scores["Kiswahili"] += 3

        ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
        if not ranked[0][1] or ranked[0][1] == ranked[1][1]:
            return "Unknown"
        return ranked[0][0]

    # ---------------------------------------------------------------- lookup
    def _lookup(self, term: str, source: str, target: str) -> Optional[dict]:
        if source == "Kiswahili":
            hits = self.swahili_index.get(term, [])
            for hit in hits:
                if canon_language(hit.get("language")) == target:
                    return hit
            return None
        hits = self.local_index.get(source, {}).get(term, [])
        return hits[0] if hits else None

    def _fuzzy(self, term: str, source: str, target: str):
        pool = (
            self.swahili_index.keys()
            if source == "Kiswahili"
            else self.local_index.get(source, {}).keys()
        )
        best_key, best_score = None, 0.0
        for key in pool:
            if abs(len(key) - len(term)) > 4:
                continue
            score = SequenceMatcher(None, term, key).ratio()
            if score > best_score:
                best_key, best_score = key, score
        if best_key and best_score >= 0.82:
            return self._lookup(best_key, source, target), best_key, best_score
        return None, best_key, best_score

    # ------------------------------------------------------------- translate
    def translate(self, text: str, source: str = "auto", target: str = "Kiswahili") -> dict:
        text = (text or "").strip()
        source = canon_language(source) or "auto"
        target = canon_language(target) or "Kiswahili"

        if not text:
            return self._not_found("Unknown", target, text, None)

        detected = self.detect(text) if source == "auto" else source
        if detected == "Unknown":
            for lang in ALL_LANGUAGES:
                if lang != target and self._lookup(normalize(text), lang, target):
                    detected = lang
                    break
        if detected == "Unknown":
            result = self._not_found("Unknown", target, text, None)
            result["message"] = "Language could not be identified. Please select the language manually."
            return result
        if detected == target:
            result = self._not_found(detected, target, text, None)
            result["message"] = "Source and target language are the same."
            return result

        term = normalize(text)
        entry = self._lookup(term, detected, target)
        if entry:
            return self._build(entry, detected, target, text, "exact")

        words = tokenize(text)
        if len(words) > 1:
            parts, hits, sample = [], 0, None
            for word in words:
                found = self._lookup(word, detected, target)
                if found:
                    hits += 1
                    sample = sample or found
                    value = found["output"] if target == "Kiswahili" else found["input"]
                    parts.append(first_variant(value) or word)
                else:
                    parts.append(word)
            if sample and hits / len(words) >= 0.5:
                result = self._build(sample, detected, target, text, "composed")
                result["translation"] = " ".join(parts)
                return result

        entry, key, score = self._fuzzy(term, detected, target)
        if entry:
            result = self._build(entry, detected, target, text, "fuzzy")
            result["suggestion"] = key
            result["message"] = f'Closest dataset match was "{key}". Please verify with a native speaker.'
            return result

        return self._not_found(detected, target, text, key if score > 0.6 else None)

    def compare(self, text: str, source: str = "auto") -> dict:
        detected = self.detect(text) if canon_language(source) in (None, "auto") else canon_language(source)
        swahili = text if detected == "Kiswahili" else self.translate(text, source, "Kiswahili").get("translation")
        rows = []
        for lang in LOCAL_LANGUAGES:
            if lang == detected:
                rows.append({"language": lang, "translation": text, "found_in_dataset": True})
                continue
            result = self.translate(swahili, "Kiswahili", lang) if swahili else None
            rows.append(
                {
                    "language": lang,
                    "translation": result["translation"] if result else None,
                    "found_in_dataset": bool(result and result["found_in_dataset"]),
                }
            )
        return {"detected_language": detected, "kiswahili": swahili, "languages": rows}

    def search(self, query: str, limit: int = 20) -> List[dict]:
        q = normalize(query)
        out = []
        for row in self.rows:
            if q in normalize(row.get("input", "")) or q in normalize(row.get("output", "")):
                out.append(row)
                if len(out) >= limit:
                    break
        return out

    # ---------------------------------------------------------------- output
    @staticmethod
    def _confidence(entry: dict, match_type: str) -> str:
        if match_type == "exact":
            return "high" if entry.get("confidence") == "verified" else "medium"
        return "medium" if match_type == "fuzzy" else "low"

    def _build(self, entry: dict, source: str, target: str, text: str, match_type: str) -> dict:
        to_swahili = target == "Kiswahili"
        return {
            "source_language": source,
            "target_language": target,
            "dialect": entry.get("dialect") or None,
            "input": text,
            "translation": first_variant(entry.get("output") if to_swahili else entry.get("input")),
            "category": entry.get("category") or None,
            "subcategory": entry.get("subcategory") or None,
            "example_sentence": entry.get("example_sentence") or None,
            "sentence_translation": entry.get("sentence_translation") or None,
            "confidence": self._confidence(entry, match_type),
            "found_in_dataset": True,
            "match_type": match_type,
            "suggestion": None,
            "message": None,
        }

    @staticmethod
    def _not_found(source: str, target: str, text: str, suggestion: Optional[str]) -> dict:
        return {
            "source_language": source,
            "target_language": target,
            "dialect": None,
            "input": text,
            "translation": None,
            "category": None,
            "subcategory": None,
            "example_sentence": None,
            "sentence_translation": None,
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
