from __future__ import annotations

import re
from typing import List


def tokenize(text: str) -> List[str]:
    """Tokenize text while maintaining Unicode-aware word boundaries.

    This is intentionally simple and conservative. It splits on whitespace and
    punctuation while preserving apostrophes and hyphenated compounds.
    """
    if not text:
        return []

    pattern = re.compile(r"\w+(?:[\'’\-]\w+)*", re.UNICODE)
    return pattern.findall(text)
