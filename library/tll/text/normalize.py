from __future__ import annotations

import re
import unicodedata
from typing import Any


def normalize_text(text: Any) -> str:
    """Apply conservative Unicode and whitespace normalization without altering meaning.

    This function keeps the original textual content, strips accidental whitespace,
    and normalizes Unicode to NFC so equivalent strings are handled consistently.
    """
    if text is None:
        return ""

    value = unicodedata.normalize("NFC", str(text))
    value = value.replace("\u00A0", " ")
    value = re.sub(r"\s+", " ", value).strip()
    return value
