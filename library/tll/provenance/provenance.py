from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List


@dataclass
class DatasetProvenance:
    dataset: str
    version: str = "0.1.0"
    language: str = "unknown"
    source: str = "unknown"
    license: str = "unknown"
    status: str = "unverified"
    collection_date: str = "unknown"
    dialect: str = "unknown"
    transformation_history: List[str] = field(default_factory=list)

    def record_step(self, step: str) -> None:
        self.transformation_history.append(f"{datetime.now(timezone.utc).isoformat()}::{step}")

    def as_dict(self) -> Dict[str, Any]:
        return {
            "dataset": self.dataset,
            "version": self.version,
            "language": self.language,
            "source": self.source,
            "license": self.license,
            "status": self.status,
            "collection_date": self.collection_date,
            "dialect": self.dialect,
            "transformation_history": self.transformation_history,
        }
