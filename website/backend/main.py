"""Tan_lang_chatbot — FastAPI backend.

Run locally (VS Code):
    cd LOCAL_LANGUAGE
    python -m venv .venv && source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
    pip install -r requirements.txt
    cp .env.example .env      # then fill in the Supabase values (optional)
    uvicorn backend.main:app --reload --port 8000

Then open http://localhost:8000  (frontend/index.html is served automatically).
"""

from __future__ import annotations

import json
import os
import re
import time
from pathlib import Path
from typing import Literal, Optional
from urllib import error, request

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from model.translator import ALL_LANGUAGES, LOCAL_LANGUAGES, Translator, canon_language

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
_data_dir = Path(os.getenv("DATA_DIR", "../data"))
DATA_DIR = _data_dir if _data_dir.is_absolute() else (BASE_DIR / _data_dir).resolve()
# Prefer the correctly spelled 'frontend' folder, but accept legacy typo 'fontend' if present
_pref = BASE_DIR.parent
_preferred_frontend = _pref / "frontend"
_alternate_frontend = _pref / "fontend"
if _preferred_frontend.exists():
    FRONTEND_DIR = _preferred_frontend
elif _alternate_frontend.exists():
    FRONTEND_DIR = _alternate_frontend
else:
    FRONTEND_DIR = _preferred_frontend  # default path if neither exists (may be created later)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
USE_SUPABASE = os.getenv("USE_SUPABASE", "false").lower() == "true"

AI_TRANSLATION_ENABLED = os.getenv("AI_TRANSLATION_ENABLED", "false").lower() == "true"
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai").lower()
AI_API_KEY = os.getenv("AI_API_KEY", "")
AI_API_URL = os.getenv("AI_API_URL", "").rstrip("/")
AI_MODEL = os.getenv("AI_MODEL", "gemini-3.6-flash")
AI_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.1"))
AI_DIRECT_LANGUAGES = {"English", "French"}

app = FastAPI(title="Tan_lang_chatbot", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

room_connections: dict[str, dict[str, WebSocket]] = {}


def run() -> None:
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000)


def load_rows() -> list[dict]:
    """Load the corpus from Supabase when configured, otherwise from the CSV files."""
    if USE_SUPABASE and SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client

        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        rows, page, size = [], 0, 1000
        while True:
            res = (
                client.table("translations")
                .select("*")
                .range(page * size, page * size + size - 1)
                .execute()
            )
            batch = res.data or []
            rows.extend(batch)
            if len(batch) < size:
                break
            page += 1
        if rows:
            return rows
    return Translator.from_csv_dir(str(DATA_DIR)).rows


translator = Translator(load_rows())


def _strip_ai_response(raw: str) -> str:
    text = (raw or "").strip()
    text = re.sub(r"```(?:text|plaintext|sw)?", "", text, flags=re.IGNORECASE).strip()
    if text.startswith("Translation:"):
        text = text.split("Translation:", 1)[1].strip()
    if text.startswith("Tafsiri:"):
        text = text.split("Tafsiri:", 1)[1].strip()
    text = re.sub(r"^\s*(?:[-*+]|\d+[.)])\s+", "", text, flags=re.MULTILINE)
    text = text.replace("/", " ").replace("*", "")
    text = text.replace("`", "").replace("_", "")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,.;!?])", r"\1", text)
    text = re.sub(r"([,.;!?])(?=\S)", r"\1 ", text)
    text = text.strip("\n\r\"'")
    return " ".join(text.split())


def call_ai_translation(text: str, source_language: str, target_language: str) -> Optional[dict]:
    """Fallback translator using an online AI provider when the local dataset misses a phrase."""
    if not AI_TRANSLATION_ENABLED:
        return None

    api_key = AI_API_KEY.strip()
    api_url = AI_API_URL.strip()
    if not api_key or not api_url:
        return None

    source_name = "auto" if source_language in (None, "auto") else str(source_language)
    target_name = str(target_language)
    prompt = (
        "You are a careful translation assistant for Tanzanian local languages, Kiswahili, English, and French. "
        "Translate the user's text accurately between the specified languages using natural, modern Tanzanian usage. "
        "If one language is a Tanzanian local language and the other is English or French, translate via Kiswahili as the natural bridge when helpful. "
        "For local-language to English/French, first understand the meaning in Kiswahili, then render a natural English or French sentence. "
        "For English/French to local-language, use a natural local-language phrase that matches the Tanzanian context and conversation. "
        "Prefer natural Kiswahili and natural local-language equivalents used in Tanzania. "
        "Do not add explanations, notes, or quotation marks. Return only the final translated sentence or phrase. "
        f"Source language: {source_name}. Target language: {target_name}. "
        f"Text to translate: {text}"
    )

    for attempt in range(2):
        try:
            if AI_PROVIDER in {"gemini", "google", "google-gemini"}:
                model_name = (AI_MODEL or "gemini-1.5-flash").strip()
                url = api_url.rstrip("/")
                if ":generateContent" not in url:
                    if "/models" not in url:
                        url = f"https://generativelanguage.googleapis.com/v1beta/models"
                    url = f"{url}/{model_name}:generateContent"
                if "generativelanguage.googleapis.com" in url and "key=" not in url:
                    url = f"{url}?key={api_key}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": AI_TEMPERATURE, "maxOutputTokens": 256},
                }
                headers = {"Content-Type": "application/json"}
                data = json.dumps(payload).encode("utf-8")
                req = request.Request(url, data=data, headers=headers, method="POST")
                with request.urlopen(req, timeout=30) as response:
                    body = json.loads(response.read().decode("utf-8"))
                candidates = body.get("candidates") or []
                if not candidates:
                    return None
                text_parts = []
                for part in candidates[0].get("content", {}).get("parts", []):
                    if isinstance(part, dict) and "text" in part:
                        text_parts.append(part["text"])
                translated = _strip_ai_response("".join(text_parts))
            else:
                if not api_url.endswith("/chat/completions"):
                    api_url = f"{api_url}/chat/completions"
                payload = {
                    "model": AI_MODEL,
                    "temperature": AI_TEMPERATURE,
                    "messages": [
                        {"role": "system", "content": "Translate accurately and keep the answer concise."},
                        {"role": "user", "content": prompt},
                    ],
                }
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                }
                data = json.dumps(payload).encode("utf-8")
                req = request.Request(api_url, data=data, headers=headers, method="POST")
                with request.urlopen(req, timeout=30) as response:
                    body = json.loads(response.read().decode("utf-8"))
                choices = body.get("choices") or []
                if not choices:
                    return None
                content = choices[0].get("message", {}).get("content") or choices[0].get("text") or ""
                translated = _strip_ai_response(content)

            if not translated:
                return None

            return {
                "source_language": source_name,
                "target_language": target_name,
                "dialect": "AI fallback",
                "input": text,
                "translation": translated,
                "category": "AI fallback",
                "subcategory": "Online AI translation",
                "example_sentence": None,
                "sentence_translation": None,
                "confidence": "medium",
                "found_in_dataset": True,
                "match_type": "ai_fallback",
                "suggestion": None,
                "message": "Translation was retrieved via online AI fallback because it was not present in the local dataset.",
            }
        except error.HTTPError as exc:
            if exc.code == 429 and attempt < 1:
                time.sleep(1.5)
                continue
            if exc.code == 429:
                return {
                    "source_language": source_name,
                    "target_language": target_name,
                    "dialect": "AI fallback",
                    "input": text,
                    "translation": None,
                    "category": "AI fallback",
                    "subcategory": "Online AI translation",
                    "example_sentence": None,
                    "sentence_translation": None,
                    "confidence": "low",
                    "found_in_dataset": False,
                    "match_type": "ai_fallback_unavailable",
                    "suggestion": None,
                    "message": "AI translation is temporarily unavailable because the Gemini API quota has been exhausted. Please retry later.",
                }
            return None
        except (error.URLError, ValueError, TimeoutError):
            return None

    return None


# --------------------------------------------------------------------- models
class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source_language: str = "auto"
    target_language: str = "Kiswahili"


class CompareRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source_language: str = "auto"


def translate_payload(text: str, source_language: str, target_language: str) -> dict:
    target = canon_language(target_language)
    source = canon_language(source_language)
    if target not in ALL_LANGUAGES:
        raise HTTPException(400, f"Unsupported target language: {target_language}")

    if source in AI_DIRECT_LANGUAGES or target in AI_DIRECT_LANGUAGES:
        ai_result = call_ai_translation(text, source or source_language, target)
        if ai_result:
            return ai_result

    result = translator.translate(text, source_language, target)
    if result.get("found_in_dataset") and result.get("match_type") in {"exact", "composed", "fuzzy"}:
        return result

    ai_result = call_ai_translation(text, source_language, target)
    return ai_result or result


# --------------------------------------------------------------------- routes
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "rows": len(translator.rows),
        "languages": ALL_LANGUAGES,
        "source": "supabase" if USE_SUPABASE else "csv",
    }


@app.get("/api/languages")
def languages():
    return {"local": LOCAL_LANGUAGES, "all": ALL_LANGUAGES}


@app.post("/api/translate")
def translate(req: TranslateRequest):
    return translate_payload(req.text, req.source_language, req.target_language)


@app.get("/api/rooms/{room_id}/roles")
def room_roles(room_id: str):
    normalized_room = re.sub(r"[^A-Za-z0-9-]", "", room_id).upper()[:32]
    connections = room_connections.get(normalized_room, {})
    return {
        "room_id": normalized_room,
        "roles": {
            "patient": "patient" in connections,
            "doctor": "doctor" in connections,
        },
    }


@app.websocket("/ws/{room_id}/{role}")
async def room_socket(websocket: WebSocket, room_id: str, role: Literal["patient", "doctor"]):
    room_id = re.sub(r"[^A-Za-z0-9-]", "", room_id).upper()[:32]
    if not room_id:
        await websocket.close(code=1008, reason="Room code is required")
        return

    await websocket.accept()
    connections = room_connections.setdefault(room_id, {})
    if role in connections:
        await websocket.send_json({
            "type": "error",
            "code": "role_taken",
            "role": role,
        })
        await websocket.close(code=4003, reason="Role is already in use")
        return

    connections[role] = websocket
    try:
        presence = {
            "type": "presence",
            "role": role,
            "status": "connected",
            "roles": {name: name in connections for name in ("patient", "doctor")},
        }
        for connection in list(connections.values()):
            await connection.send_json(presence)
        while True:
            payload = await websocket.receive_json()
            payload_type = payload.get("type")
            if payload_type == "activity":
                status = str(payload.get("status", "idle"))
                if status not in {"typing", "recording", "idle"}:
                    continue
                activity = {
                    "type": "activity",
                    "role": role,
                    "status": status,
                }
                for connection_role, connection in list(connections.items()):
                    if connection_role == role:
                        continue
                    try:
                        await connection.send_json(activity)
                    except (WebSocketDisconnect, RuntimeError):
                        pass
                continue
            if payload_type != "message":
                continue
            text = str(payload.get("text", "")).strip()
            source_language = str(payload.get("source_language", "auto"))
            target_language = str(payload.get("target_language", "Kiswahili"))
            if not text:
                continue
            result = translate_payload(text, source_language, target_language)
            event = {
                "type": "message",
                "role": role,
                "text": text,
                "translation": result.get("translation"),
                "confidence": result.get("confidence", "low"),
            }
            stale: set[WebSocket] = set()
            for connection in list(connections.values()):
                try:
                    await connection.send_json(event)
                except Exception:
                    stale.add(connection)
            for stale_connection in stale:
                stale_roles = [
                    name for name, connection in connections.items()
                    if connection is stale_connection
                ]
                for stale_role in stale_roles:
                    connections.pop(stale_role, None)
    except WebSocketDisconnect:
        pass
    finally:
        if connections.get(role) is websocket:
            connections.pop(role, None)
            presence = {
                "type": "presence",
                "role": role,
                "status": "disconnected",
                "roles": {name: name in connections for name in ("patient", "doctor")},
            }
            for connection in list(connections.values()):
                await connection.send_json(presence)
        if not connections:
            room_connections.pop(room_id, None)


@app.post("/api/detect")
def detect(req: CompareRequest):
    return {"input": req.text, "detected_language": translator.detect(req.text)}


@app.post("/api/compare")
def compare(req: CompareRequest):
    return translator.compare(req.text, req.source_language)


@app.get("/api/search")
def search(q: str = Query(..., min_length=1), limit: int = 20):
    return {"query": q, "results": translator.search(q, limit)}


@app.post("/api/reload")
def reload_dataset():
    global translator
    translator = Translator(load_rows())
    return {"status": "reloaded", "rows": len(translator.rows)}


# --------------------------------------------------------------- static files
if FRONTEND_DIR.exists():
    # The chatbot has one public UI entry point: frontend/index.html.
    @app.get("/")
    def index():
        return FileResponse(FRONTEND_DIR / "home.html")

    # First mount /static explicitly so these requests are handled by the static
    # directory. This avoids any edge cases where a root-mounted StaticFiles
    # might intercept more specific paths.
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR / "static")), name="static")

    # Then mount the full frontend directory at the root as a fallback for
    # top-level files (index.html, image/*, etc.). html=True enables serving
    # the index for unknown paths (SPA-friendly).
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
   