from __future__ import annotations

import csv
from pathlib import Path
from typing import Any, Dict, Iterable, Iterator, List

from ..exceptions import DatasetError


class Dataset:
    def __init__(self, rows: List[Dict[str, Any]], language: str, stage: str):
        self.rows = rows
        self.language = language
        self.stage = stage

    def filter(self, **criteria: Any) -> "Dataset":
        filtered = []
        for row in self.rows:
            matches = True
            for key, expected in criteria.items():
                value = str(row.get(key, "")).strip().lower()
                if value != str(expected).strip().lower():
                    matches = False
                    break
            if matches:
                filtered.append(row)
        return Dataset(filtered, self.language, self.stage)

    def search(self, query: str) -> "Dataset":
        term = (query or "").strip().lower()
        if not term:
            return Dataset([], self.language, self.stage)
        matches = []
        for row in self.rows:
            haystack = " ".join(str(value or "") for value in row.values()).lower()
            if term in haystack:
                matches.append(row)
        return Dataset(matches, self.language, self.stage)

    def __iter__(self) -> Iterator[Dict[str, Any]]:
        return iter(self.rows)

    def __len__(self) -> int:
        return len(self.rows)


def _dataset_path(language: str, stage: str) -> Path:
    root = Path(__file__).resolve().parents[3]
    stage_dir = root / "data" / stage / language
    if stage == "raw":
        stage_dir = root / "data" / "raw" / language
    if stage == "reviewed":
        stage_dir = root / "data" / "reviewed" / language
    if stage == "verified":
        stage_dir = root / "data" / "verified" / language
    if not stage_dir.exists():
        package_stage_dir = Path(__file__).resolve().parent / "datasets" / stage / language
        if package_stage_dir.exists():
            stage_dir = package_stage_dir
        else:
            raise DatasetError(
                f"Dataset stage '{stage}' for language '{language}' does not exist: {stage_dir}"
            )

    preferred_patterns = [
        f"{stage}_{language}_dataset.csv",
        f"{stage}_{language}.csv",
        f"{stage}_*.csv",
    ]
    candidates = sorted(stage_dir.glob("*.csv"))
    for pattern in preferred_patterns:
        matches = sorted(stage_dir.glob(pattern))
        if matches:
            return matches[0]
    if not candidates:
        raise DatasetError(f"No CSV dataset found for language '{language}' in stage '{stage}'.")
    return candidates[0]


def load_dataset(language: str, stage: str = "raw") -> Dataset:
    path = _dataset_path(language, stage)
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
    return Dataset(rows, language, stage)
