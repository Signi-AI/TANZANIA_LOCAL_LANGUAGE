"""Load the CSV dataset into the Supabase `translations` table.

Usage:
    pip install -r requirements.txt
    cp .env.example .env   # set SUPABASE_URL + SUPABASE_SERVICE_KEY
    python load_to_supabase.py
"""

from __future__ import annotations

import csv
import glob
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).resolve().parent / ".env")

BASE_DIR = Path(__file__).resolve().parent
_data_dir = Path(os.getenv("DATA_DIR", "../data"))
DATA_DIR = _data_dir if _data_dir.is_absolute() else (BASE_DIR / _data_dir).resolve()
URL = os.environ["SUPABASE_URL"]
KEY = os.environ["SUPABASE_SERVICE_KEY"]
BATCH = 500

COLUMNS = [
    "id",
    "language",
    "dialect",
    "category",
    "subcategory",
    "input",
    "output",
    "example_sentence",
    "sentence_translation",
    "source",
    "confidence",
]


def rows():
    seen = set()
    for path in sorted(glob.glob(str(DATA_DIR / "*.csv"))):
        with open(path, encoding="utf-8-sig", newline="") as fh:
            for i, row in enumerate(csv.DictReader(fh)):
                rid = (row.get("id") or "").strip() or f"{Path(path).stem}_{i}"
                if rid in seen:
                    rid = f"{rid}_{i}"
                seen.add(rid)
                out = {c: (row.get(c) or "").strip() or None for c in COLUMNS}
                out["id"] = rid
                if not out["input"] or not out["output"]:
                    continue
                yield out


def main() -> None:
    client = create_client(URL, KEY)
    batch, total = [], 0
    for row in rows():
        batch.append(row)
        if len(batch) >= BATCH:
            client.table("translations").upsert(batch).execute()
            total += len(batch)
            print(f"uploaded {total}")
            batch = []
    if batch:
        client.table("translations").upsert(batch).execute()
        total += len(batch)
    print(f"done: {total} rows")


if __name__ == "__main__":
    main()
