from __future__ import annotations

import csv
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

from ..exceptions import DatasetError

ALLOWED_CONFIDENCE = {"verified", "reviewed", "unverified", "unknown"}
REQUIRED_FIELDS = [
    "id",
    "language",
    "dialect",
    "category",
    "subcategory",
    "input",
    "output",
    "source",
    "confidence",
]
OPTIONAL_FIELDS = ["example_sentence", "sentence_translation"]


def normalize_field(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def normalize_input(value: Any) -> str:
    return normalize_field(value).lower()


def looks_generated_or_template(value: str) -> bool:
    text = (value or "").strip()
    if not text:
        return False
    lower = text.lower()
    template_markers = (
        "template",
        "example sentence",
        "sample sentence",
        "generated",
        "placeholder",
    )
    if any(marker in lower for marker in template_markers):
        return True
    if re.search(r"\b(?:this|that|these|those)\s+\w+\s+is\b", lower):
        return True
    return False


def has_variant_markers(value: Any) -> bool:
    text = normalize_field(value)
    return "/" in text and len(text.strip("/ ")) > 0


def detect_row_issues(row: Dict[str, Any]) -> List[str]:
    issues: List[str] = []
    for field in REQUIRED_FIELDS:
        value = normalize_field(row.get(field, ""))
        if not value:
            issues.append(f"missing required field: {field}")
    if row.get("language", "").strip() not in {"Sukuma", "Kisukuma"}:
        issues.append("invalid language name")
    confidence = normalize_field(row.get("confidence", "")).lower()
    if confidence and confidence not in ALLOWED_CONFIDENCE:
        issues.append("invalid confidence value")
    if row.get("source", "").strip() == "":
        issues.append("missing source")
    if has_variant_markers(row.get("input")) or has_variant_markers(row.get("output")):
        issues.append("slash-containing variant fields")
    example_sentence = normalize_field(row.get("example_sentence"))
    if looks_generated_or_template(example_sentence):
        issues.append("suspicious generated/template sentence")
    if "  " in normalize_field(row.get("input", "")) or "  " in normalize_field(row.get("output", "")):
        issues.append("multiple whitespace issue")
    return issues


def read_dataset_rows(dataset_path: str | Path) -> List[Dict[str, str]]:
    path = Path(dataset_path)
    if not path.exists():
        raise DatasetError(f"Dataset file not found: {path}")

    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise DatasetError(f"CSV file is empty or missing headers: {path}")
        return [dict(row) for row in reader]


def build_report(dataset_path: str | Path) -> Dict[str, Any]:
    rows = read_dataset_rows(dataset_path)
    missing_fields: Counter[str] = Counter()
    language_distribution: Counter[str] = Counter()
    category_distribution: Counter[str] = Counter()
    confidence_distribution: Counter[str] = Counter()
    valid_records = 0
    invalid_records = 0
    needs_review = 0
    duplicate_records = 0
    suspicious_records = 0
    slash_records = 0
    seen_ids: set[str] = set()
    seen_normalized: set[str] = set()
    records_requiring_review: List[str] = []

    for index, row in enumerate(rows, start=1):
        normalized_row = {key: normalize_field(value) for key, value in row.items()}
        for field in REQUIRED_FIELDS + OPTIONAL_FIELDS:
            value = normalized_row.get(field, "")
            if value == "":
                missing_fields[field] += 1

        row_id = normalized_row.get("id", "")
        if row_id in seen_ids:
            duplicate_records += 1
            records_requiring_review.append(row_id)
        else:
            seen_ids.add(row_id)

        normalized_input = normalize_input(normalized_row.get("input", ""))
        if normalized_input and normalized_input in seen_normalized:
            duplicate_records += 1
            records_requiring_review.append(f"duplicate-normalized-input:{normalized_input}")
        else:
            seen_normalized.add(normalized_input)

        issues = detect_row_issues(normalized_row)
        if issues:
            if any(issue.startswith("missing required field") or "invalid language" in issue or "invalid confidence" in issue for issue in issues):
                invalid_records += 1
            else:
                needs_review += 1
            if any("slash-containing variant fields" in issue for issue in issues):
                slash_records += 1
            if any("suspicious generated/template sentence" in issue for issue in issues):
                suspicious_records += 1
            records_requiring_review.append(f"row-{index}:{'; '.join(issues)}")
        else:
            valid_records += 1

        language = normalized_row.get("language", "").strip()
        if language:
            language_distribution[language] += 1
        category = normalized_row.get("category", "").strip()
        if category:
            category_distribution[category] += 1
        confidence = normalized_row.get("confidence", "").strip().lower()
        if confidence:
            confidence_distribution[confidence] += 1

    report = {
        "dataset_name": "Kisukuma Raw Dataset",
        "total_records": len(rows),
        "valid_records": valid_records,
        "invalid_records": invalid_records,
        "duplicate_records": duplicate_records,
        "needs_review": needs_review,
        "missing_fields": dict(sorted(missing_fields.items())),
        "language_distribution": dict(sorted(language_distribution.items())),
        "category_distribution": dict(sorted(category_distribution.items())),
        "confidence_distribution": dict(sorted(confidence_distribution.items())),
        "suspicious_records": suspicious_records,
        "slash_records": slash_records,
        "records_requiring_review": records_requiring_review[:200],
        "source_values": dict(sorted(Counter((row.get("source", "") or "").strip() for row in rows).items())),
        "dialects": dict(sorted(Counter((row.get("dialect", "") or "").strip() for row in rows).items())),
        "subcategories": dict(sorted(Counter((row.get("subcategory", "") or "").strip() for row in rows).items())),
    }
    return report


def validate_dataset_file(dataset_path: str | Path) -> Dict[str, Any]:
    return build_report(dataset_path)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Validate a TLL dataset file and produce a report.")
    parser.add_argument("--dataset", type=str, required=True, help="Path to the CSV file to validate.")
    parser.add_argument("--output", type=str, help="Optional JSON output path for the dataset report.")
    args = parser.parse_args()

    report = build_report(args.dataset)
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(report, indent=2, ensure_ascii=False))
