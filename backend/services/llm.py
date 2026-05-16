"""Anthropic Claude client + chat / barcode-fallback helpers."""
from __future__ import annotations

import json
import os
import re
from typing import Any

from anthropic import AsyncAnthropic

from models import ChatMessage, FullState, MealNutrients
from prompts import (
    BARCODE_FALLBACK_PROMPT,
    RED_FLAG_KEYWORDS,
    build_system_prompt,
    red_flag_message,
)
from services.dash_classifier import classify_dash_bucket

_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5")
_MAX_TOKENS_CHAT = 700
_MAX_TOKENS_BARCODE = 400

_client: AsyncAnthropic | None = None


def _get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        key = os.getenv("ANTHROPIC_API_KEY", "").strip()
        if not key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY not set. Copy backend/.env.example to "
                "backend/.env and paste your key."
            )
        _client = AsyncAnthropic(api_key=key)
    return _client


# ---------------------------------------------------------------------------
# Red-flag interceptor
# ---------------------------------------------------------------------------

def detect_red_flag(message: str) -> bool:
    msg = message.lower()
    return any(kw in msg for kw in RED_FLAG_KEYWORDS)


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------

async def chat_completion(
    user_message: str,
    history: list[ChatMessage],
    state: FullState,
    language: str = "en",
) -> str:
    """Send `user_message` to Claude with full state + multi-turn history."""
    system = build_system_prompt(state, language=language)
    messages: list[dict[str, Any]] = []
    for m in history:
        messages.append({"role": m.role, "content": m.text})
    messages.append({"role": "user", "content": user_message})

    client = _get_client()
    response = await client.messages.create(
        model=_MODEL,
        max_tokens=_MAX_TOKENS_CHAT,
        system=system,
        messages=messages,
    )
    parts: list[str] = []
    for block in response.content:
        if getattr(block, "type", None) == "text":
            parts.append(block.text)
    return "".join(parts).strip()


# ---------------------------------------------------------------------------
# Barcode fallback
# ---------------------------------------------------------------------------

_JSON_RE = re.compile(r"\{.*\}", re.DOTALL)


async def estimate_barcode_nutrients(product_name: str) -> dict[str, Any]:
    """Ask Claude to guess nutrients when OFF doesn't have the barcode.

    Returns a dict with keys: name, dash_bucket, nutrients, confidence, notes.
    Raises on transport failure; on parse failure returns a low-confidence stub.
    """
    client = _get_client()
    response = await client.messages.create(
        model=_MODEL,
        max_tokens=_MAX_TOKENS_BARCODE,
        system=BARCODE_FALLBACK_PROMPT,
        messages=[{"role": "user", "content": product_name or "Unknown packaged food"}],
    )

    raw = ""
    for block in response.content:
        if getattr(block, "type", None) == "text":
            raw += block.text
    raw = raw.strip()

    parsed: dict[str, Any]
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        m = _JSON_RE.search(raw)
        if not m:
            return _stub_estimate(product_name)
        try:
            parsed = json.loads(m.group(0))
        except json.JSONDecodeError:
            return _stub_estimate(product_name)

    # Validate / coerce required fields.
    name = str(parsed.get("name") or product_name or "Unknown item").strip()
    bucket = parsed.get("dash_bucket") or classify_dash_bucket(name)
    nutrients_raw = parsed.get("nutrients") or {}
    nutrients = MealNutrients(
        calories=float(nutrients_raw.get("calories", 0) or 0),
        protein_g=float(nutrients_raw.get("protein_g", 0) or 0),
        carbs_g=float(nutrients_raw.get("carbs_g", 0) or 0),
        fat_g=float(nutrients_raw.get("fat_g", 0) or 0),
        fiber_g=float(nutrients_raw.get("fiber_g", 0) or 0),
        sodium_mg=float(nutrients_raw.get("sodium_mg", 0) or 0),
        potassium_mg=float(nutrients_raw.get("potassium_mg", 0) or 0),
        cholesterol_mg=float(nutrients_raw.get("cholesterol_mg", 0) or 0),
    )
    return {
        "name": name,
        "dash_bucket": bucket,
        "nutrients": nutrients,
        "confidence": float(parsed.get("confidence", 0.5) or 0.5),
        "notes": parsed.get("notes") or "LLM-estimated; double-check the label.",
    }


def _stub_estimate(product_name: str) -> dict[str, Any]:
    """Worst-case zero-confidence stub used if the LLM returns unparseable text."""
    return {
        "name": product_name or "Unknown item",
        "dash_bucket": classify_dash_bucket(product_name or ""),
        "nutrients": MealNutrients(),
        "confidence": 0.0,
        "notes": "Could not estimate nutrients automatically. Please enter manually.",
    }


__all__ = [
    "chat_completion",
    "detect_red_flag",
    "estimate_barcode_nutrients",
    "red_flag_message",
]
