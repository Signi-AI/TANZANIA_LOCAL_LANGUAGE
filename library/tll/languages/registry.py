from __future__ import annotations

from typing import Dict

from .models import Language
from ..exceptions import LanguageNotFoundError

_LANGUAGES: Dict[str, Language] = {}


def register_language(
    code: str,
    name: str,
    native_name: str = "",
    family: str = "",
    region: str = "",
    country: str = "",
    status: str = "active",
    dialect_info: str = "",
    script: str = "",
    notes: str = "",
) -> Language:
    normalized_code = code.strip().lower()
    language = Language(
        code=normalized_code,
        name=name,
        native_name=native_name,
        family=family,
        region=region,
        country=country,
        status=status,
        dialect_info=dialect_info,
        script=script,
        notes=notes,
    )
    _LANGUAGES[normalized_code] = language
    return language


def get_language(code: str) -> Language:
    normalized_code = (code or "").strip().lower()
    if normalized_code not in _LANGUAGES:
        raise LanguageNotFoundError(f"Language '{code}' is not registered.")
    return _LANGUAGES[normalized_code]


def list_languages() -> list[Language]:
    return list(_LANGUAGES.values())


register_language(
    code="sw",
    name="Kiswahili",
    native_name="Kiswahili",
    family="Niger-Congo",
    region="East Africa",
    country="Tanzania; Kenya; Uganda; Rwanda; Burundi; Democratic Republic of the Congo",
    status="active",
    dialect_info="Standard Swahili with regional varieties",
    script="Latin",
    notes="Primary national and regional lingua franca."
)

register_language(
    code="suk",
    name="Kisukuma",
    native_name="Kisukuma",
    family="Bantu",
    region="Lake Zone",
    country="Tanzania",
    status="active",
    dialect_info="Gwe / Mwanza / Tabora / northern Sukuma variants",
    script="Latin",
    notes="Initial language support focuses on a conservative dictionary and dataset pipeline."
)
