class TLLException(Exception):
    """Base exception for the TLL package."""


class LanguageNotFoundError(TLLException):
    """Raised when a language code is not registered."""


class DatasetError(TLLException):
    """Raised for dataset loading or validation problems."""


class InvalidTranslationError(TLLException):
    """Raised when translation input violates schema or policy."""


class UnsupportedLanguageError(TLLException):
    """Raised when a requested language is known but unsupported for a feature."""


class LocalModelError(TLLException):
    """Raised when the optional offline LLM runtime is unavailable or fails."""
