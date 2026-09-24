from __future__ import annotations

import csv
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List


@dataclass(frozen=True)
class ReviewDecision:
    row_id: str
    status: str
    decision: str
    review_status: str
    notes: str

    def as_dict(self) -> Dict[str, str]:
        return {
            "row_id": self.row_id,
            "status": self.status,
            "decision": self.decision,
            "review_status": self.review_status,
            "notes": self.notes,
        }


def _normalize(value: Any) -> str:
    return str(value or "").strip()


def _review_summary(row: Dict[str, Any]) -> tuple[str, str, str]:
    original_status = (_normalize(row.get("status")) or "unknown").lower()
    confidence = (_normalize(row.get("confidence")) or "unknown").lower()
    input_text = _normalize(row.get("input"))
    output_text = _normalize(row.get("output"))
    review_notes = _normalize(row.get("review_notes"))

    if original_status in {"duplicate", "invalid"}:
        return "unverified", "exclude_from_review", "Duplicate or invalid rows are not promoted to reviewed data."
    if not input_text or not output_text:
        return "unverified", "exclude_from_review", "Missing input or output values."
    if original_status == "valid" and confidence == "verified":
        return "verified", "accept", "Row is structurally valid and sourced as verified."
    if original_status in {"valid", "needs_review", "suspicious"}:
        return "reviewed", "needs_human_review", review_notes or "Row has been flagged for human review."
    return "unverified", "exclude_from_review", "Row does not meet the reviewed or verified criteria."


def review_dataset(input_path: str | Path, output_dir: str | Path, language: str = "suk") -> Dict[str, Any]:
    input_path = Path(input_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    with input_path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)

    reviewed_rows: List[Dict[str, Any]] = []
    counts = {"verified": 0, "reviewed": 0, "unverified": 0, "accepted": 0, "needs_human_review": 0, "excluded": 0}

    for row in rows:
        review_status, decision, note = _review_summary(row)
        row_copy = dict(row)
        row_copy["review_status"] = review_status
        row_copy["review_decision"] = decision
        row_copy["review_notes"] = note
        row_copy["reviewed_by"] = "conservative_pipeline"
        row_copy["reviewed_at"] = datetime.now(timezone.utc).isoformat()

        if review_status == "verified":
            counts["verified"] += 1
        elif review_status == "reviewed":
            counts["reviewed"] += 1
        else:
            counts["unverified"] += 1

        if decision == "accept":
            counts["accepted"] += 1
        elif decision == "needs_human_review":
            counts["needs_human_review"] += 1
        else:
            counts["excluded"] += 1

        if review_status in {"verified", "reviewed"}:
            reviewed_rows.append(row_copy)

    output_file = output_dir / f"reviewed_{language}_dataset.csv"
    fieldnames = list(rows[0].keys()) if rows else []
    fieldnames.extend(["review_status", "review_decision", "reviewed_by", "reviewed_at"])

    with output_file.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in reviewed_rows:
            writer.writerow(row)

    summary = {
        "dataset_name": input_path.name,
        "language": language,
        "input_records": len(rows),
        "reviewed_records": len(reviewed_rows),
        "verified_records": counts["verified"],
        "needs_human_review": counts["needs_human_review"],
        "excluded_records": counts["excluded"],
        "output_file": str(output_file),
    }
    return summary


def build_verified_dataset(input_path: str | Path, output_dir: str | Path, language: str = "suk") -> Dict[str, Any]:
    input_path = Path(input_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    with input_path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)

    verified_rows: List[Dict[str, Any]] = []
    for row in rows:
        review_status = (row.get("review_status") or "").lower()
        if review_status == "verified":
            verified_rows.append(dict(row))
        elif ((row.get("status") or "").lower() == "valid" and (row.get("confidence") or "").lower() == "verified"):
            row_copy = dict(row)
            row_copy["review_status"] = "verified"
            row_copy["review_decision"] = "accept"
            verified_rows.append(row_copy)

    output_file = output_dir / f"verified_{language}_dataset.csv"
    fieldnames = list(rows[0].keys()) if rows else []
    with output_file.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in verified_rows:
            writer.writerow(row)

    summary = {
        "dataset_name": input_path.name,
        "language": language,
        "verified_records": len(verified_rows),
        "output_file": str(output_file),
    }
    return summary


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Create reviewed and verified dataset stages from a cleaned Sukuma dataset.")
    parser.add_argument("--input", required=True, help="Path to the cleaned dataset CSV.")
    parser.add_argument("--output-dir", required=True, help="Folder used to store the reviewed and verified dataset CSVs.")
    parser.add_argument("--language", default="suk", help="Language code used for file naming.")
    args = parser.parse_args()

    review_summary = review_dataset(args.input, args.output_dir, language=args.language)
    print(f"Reviewed stage: {review_summary['reviewed_records']} rows")

    verified_summary = build_verified_dataset(Path(args.output_dir) / f"reviewed_{args.language}_dataset.csv", args.output_dir, language=args.language)
    print(f"Verified stage: {verified_summary['verified_records']} rows")
