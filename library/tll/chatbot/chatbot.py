from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, Optional

from ..data.loader import load_dataset
from ..translation.locallang import LocalLangTranslator
from ..exceptions import LocalModelError


DEFAULT_MODEL_ID = "Qwen/Qwen2.5-0.5B-Instruct-GGUF"
DEFAULT_MODEL_FILE = "qwen2.5-0.5b-instruct-q4_k_m.gguf"
DEFAULT_SYSTEM_PROMPT = (
    "You are TLL, a helpful offline assistant for Tanzanian languages. "
    "Be concise, respectful, and say when you are unsure. Do not invent "
    "translations; preserve the user's language where possible."
)


class LocalLanguageChatbot:
    """Small dataset-grounded chat interface for local-language conversations."""

    def __init__(
        self,
        language: str = "suk",
        stage: str = "cleaned",
        *,
        backend: str = "dataset",
        model_id: str = DEFAULT_MODEL_ID,
        model_file: str = DEFAULT_MODEL_FILE,
        model_path: Optional[str] = None,
        n_ctx: int = 2048,
        temperature: float = 0.0,
        seed: int = 42,
    ):
        dataset = load_dataset(language, stage=stage)
        self.language = language
        self.stage = stage
        self.translator = LocalLangTranslator(dataset.rows)
        if backend not in {"dataset", "llm"}:
            raise ValueError("backend must be 'dataset' or 'llm'")
        self.backend = backend
        self.model_id = model_id
        self.model_file = model_file
        self.model_path = model_path
        self.n_ctx = n_ctx
        self.temperature = temperature
        self.seed = seed
        self._model = None
        self._history: list[dict[str, str]] = []

    def _load_model(self):
        """Load a local GGUF model, downloading it once through the HF cache."""
        if self._model is not None:
            return self._model
        try:
            from llama_cpp import Llama
        except ImportError as exc:
            raise LocalModelError(
                "Offline LLM support is optional. Install it with "
                "'pip install Tan_language[local-llm]'."
            ) from exc
        path = self.model_path
        if path is None:
            try:
                from huggingface_hub import hf_hub_download
            except ImportError as exc:
                raise LocalModelError(
                    "Model downloading requires huggingface-hub. Install "
                    "'pip install Tan_language[local-llm]'."
                ) from exc
            path = hf_hub_download(repo_id=self.model_id, filename=self.model_file)
        if not Path(path).is_file():
            raise LocalModelError(f"Local model file does not exist: {path}")
        try:
            self._model = Llama(
                model_path=os.fspath(path),
                n_ctx=self.n_ctx,
                seed=self.seed,
                verbose=False,
            )
        except Exception as exc:
            raise LocalModelError(f"Could not load local model '{path}': {exc}") from exc
        return self._model

    def _llm_chat(self, message: str, context: Optional[str]) -> Dict[str, Any]:
        model = self._load_model()
        messages = [{"role": "system", "content": DEFAULT_SYSTEM_PROMPT}]
        messages.extend(self._history)
        if context:
            message = f"Context:\n{context}\n\nUser: {message}"
        messages.append({"role": "user", "content": message})
        try:
            result = model.create_chat_completion(
                messages=messages,
                temperature=self.temperature,
                seed=self.seed,
                max_tokens=512,
            )
            response = result["choices"][0]["message"]["content"].strip()
        except Exception as exc:
            raise LocalModelError(f"Local model generation failed: {exc}") from exc
        self._history.extend(
            [{"role": "user", "content": message}, {"role": "assistant", "content": response}]
        )
        return {
            "message": message,
            "response": response,
            "context": context,
            "language": self.language,
            "target_language": None,
            "translation": {
                "translation": response,
                "match_type": "llm",
                "found_in_dataset": False,
                "confidence": "unverified",
                "source_language": self.language,
                "target_language": None,
            },
            "grounded": False,
            "backend": "llm",
        }

    def reset(self) -> None:
        """Forget the in-memory conversation history (the model remains cached)."""
        self._history.clear()

    def chat(
        self,
        message: str,
        source_language: str = "auto",
        target_language: str = "sw",
        context: Optional[str] = None,
    ) -> Dict[str, Any]:
        if getattr(self, "backend", "dataset") == "llm":
            result = self._llm_chat(message, context)
            result["target_language"] = target_language
            result["translation"]["target_language"] = target_language
            return result
        result = self.translator.translate(message, source_language, target_language)
        response = result.get("translation")
        if not response:
            response = result.get("message")
        return {
            "message": message,
            "response": response,
            "context": context,
            "language": result.get("source_language"),
            "target_language": result.get("target_language"),
            "translation": result,
            "grounded": bool(result.get("found_in_dataset")),
            "backend": "dataset",
        }
