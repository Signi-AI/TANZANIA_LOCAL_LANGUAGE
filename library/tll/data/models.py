from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

VALID_DATA_TYPES = {"word", "phrase", "sentence", "dialogue", "other"}
VERIFICATION_STATUS = {"unverified", "reviewed", "verified"}
SOURCE_TYPES = {"human", "dictionary", "community", "corpus", "synthetic", "unknown"}


@dataclass
class CanonicalTranslationRecord:
    id: str
    source_text: str
    target_text: str
    source_language: str
    target_language: str
    data_type: str = "word"
    verification_status: str = "unverified"
    source_type: str = "unknown"
    source_reference: str = ""
    license: str = "unknown"
    dialect: str = ""
    domain: str = ""
    notes: str = ""
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    def as_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "source_text": self.source_text,
            "target_text": self.target_text,
            "source_language": self.source_language,
            "target_language": self.target_language,
            "data_type": self.data_type,
            "verification_status": self.verification_status,
            "source_type": self.source_type,
            "source_reference": self.source_reference,
            "license": self.license,
            "dialect": self.dialect,
            "domain": self.domain,
            "notes": self.notes,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


@dataclass
class DatasetReport:
    dataset_name: str
    total_records: int
    valid_records: int
    invalid_records: int
    duplicate_records: int
    needs_review: int
    missing_fields: Dict[str, int] = field(default_factory=dict)
    language_distribution: Dict[str, int] = field(default_factory=dict)
    category_distribution: Dict[str, int] = field(default_factory=dict)
    confidence_distribution: Dict[str, int] = field(default_factory=dict)
    suspicious_records: int = 0
    slash_records: int = 0
    records_requiring_review: List[str] = field(default_factory=list)

    def as_dict(self) -> Dict[str, Any]:
        return {
            "dataset_name": self.dataset_name,
            "total_records": self.total_records,
            "valid_records": self.valid_records,
            "invalid_records": self.invalid_records,
            "duplicate_records": self.duplicate_records,
            "needs_review": self.needs_review,
            "missing_fields": self.missing_fields,
            "language_distribution": self.language_distribution,
            "category_distribution": self.category_distribution,
            "confidence_distribution": self.confidence_distribution,
            "suspicious_records": self.suspicious_records,
            "slash_records": self.slash_records,
            "records_requiring_review": self.records_requiring_review,
        }
