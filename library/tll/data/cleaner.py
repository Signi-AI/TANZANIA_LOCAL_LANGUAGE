from __future__ import annotations

import csv
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

VALID_STATUSES = {"valid", "needs_review", "duplicate", "invalid", "suspicious"}
ALLOWED_CONFIDENCE = {"verified", "reviewed", "unverified", "unknown"}


def normalize_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def detect_suspicious_patterns(row: Dict[str, Any]) -> List[str]:
    issues: List[str] = []
    input_value = normalize_text(row.get("input", ""))
    output_value = normalize_text(row.get("output", ""))

    if not input_value:
        issues.append("missing input")
    if not output_value:
        issues.append("missing output")
    if not normalize_text(row.get("id", "")):
        issues.append("missing id")
    if not normalize_text(row.get("source", "")):
        issues.append("missing source")
    if not normalize_text(row.get("language", "")):
        issues.append("missing language")
    if normalize_text(row.get("language", "")) not in {"Sukuma", "Kisukuma"}:
        issues.append("invalid language name")

    confidence = normalize_text(row.get("confidence", "")).lower()
    if confidence and confidence not in ALLOWED_CONFIDENCE:
        issues.append("invalid confidence value")

    if "/" in input_value or "/" in output_value:
        issues.append("slash-containing variant fields")

    if re.search(r"\b(template|generated|placeholder|example\s+sentence)\b", (row.get("example_sentence") or "").lower()):
        issues.append("suspicious generated/template sentence")

    if "  " in input_value or "  " in output_value:
        issues.append("multiple whitespace issue")

    if re.search(r"[!@#$%^&*()_+=\[\]{}`~\\|<>]", input_value) or re.search(r"[!@#$%^&*()_+=\[\]{}`~\\|<>]", output_value):
        issues.append("suspicious punctuation")

    return issues


def classify_record(row: Dict[str, Any], seen_ids: set[str], seen_inputs: set[str]) -> Tuple[str, List[str]]:
    issues = detect_suspicious_patterns(row)

    record_id = normalize_text(row.get("id", ""))
    normalized_input = normalize_text(row.get("input", "")).lower()

    if not record_id:
        return "invalid", issues
    if record_id in seen_ids:
        return "duplicate", issues
    if normalized_input and normalized_input in seen_inputs:
        return "duplicate", issues
    if any(issue in {"missing input", "missing output", "missing id", "missing source", "missing language", "invalid language name", "invalid confidence value"} for issue in issues):
        return "invalid", issues
    if any(issue in {"slash-containing variant fields", "multiple whitespace issue", "suspicious punctuation"} for issue in issues):
        return "needs_review", issues
    if any(issue == "suspicious generated/template sentence" for issue in issues):
        return "suspicious", issues
    return "valid", issues


def clean_dataset(input_path: str | Path, output_dir: str | Path) -> Dict[str, Any]:
    input_path = Path(input_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    with input_path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)

    seen_ids: set[str] = set()
    seen_inputs: set[str] = set()
    cleaned_rows: List[Dict[str, str]] = []
    report: Counter[str] = Counter()
    suspicious_total = 0
    slash_total = 0

    for row in rows:
        status, issues = classify_record(row, seen_ids, seen_inputs)
        row_id = normalize_text(row.get("id", ""))
        normalized_input = normalize_text(row.get("input", "")).lower()
        if row_id:
            seen_ids.add(row_id)
        if normalized_input:
            seen_inputs.add(normalized_input)

        if status == "duplicate":
            report["duplicate"] += 1
        elif status == "invalid":
            report["invalid"] += 1
        elif status == "needs_review":
            report["needs_review"] += 1
        elif status == "suspicious":
            report["suspicious"] += 1
            suspicious_total += 1
        else:
            report["valid"] += 1

        if "/" in normalize_text(row.get("input", "")) or "/" in normalize_text(row.get("output", "")):
            slash_total += 1

        cleaned_row = row.copy()
        cleaned_row["status"] = status
        cleaned_row["review_notes"] = "; ".join(issues)
        cleaned_rows.append(cleaned_row)

    output_file = output_dir / "cleaned_sukuma_dataset.csv"
    fieldnames = list(rows[0].keys()) if rows else []
    fieldnames.extend(["status", "review_notes"])
    with output_file.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in cleaned_rows:
            writer.writerow(row)

    report_summary = {
        "dataset_name": input_path.name,
        "total_records": len(rows),
        "valid_records": report.get("valid", 0),
        "invalid_records": report.get("invalid", 0),
        "duplicate_records": report.get("duplicate", 0),
        "needs_review": report.get("needs_review", 0),
        "suspicious_records": report.get("suspicious", 0),
        "slash_records": slash_total,
        "output_file": str(output_file),
        "status_distribution": dict(sorted(report.items())),
    }
    return report_summary


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Create a cleaned dataset from a raw Sukuma CSV file.")
    parser.add_argument("--input", required=True, help="Path to the raw CSV source dataset.")
    parser.add_argument("--output-dir", required=True, help="Directory where the cleaned dataset should be written.")
    args = parser.parse_args()

    report = clean_dataset(args.input, args.output_dir)
    print(json.dumps(report, indent=2, ensure_ascii=False))
