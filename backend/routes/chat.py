"""Chat endpoint — multi-turn nutrition advisor with red-flag triage."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from models import ChatRequest, ChatResponse
from services.llm import (
    chat_completion,
    detect_red_flag,
    red_flag_message,
)
from state import store

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    user_text = req.message.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Message is empty.")

    state = req.state_override or store.get_state()
    history = store.get_chat()
    red_flag = detect_red_flag(user_text)

    if red_flag:
        # Emit triage response immediately; do NOT consume an LLM call.
        store.append_chat("user", user_text)
        reply = red_flag_message(req.language)
        store.append_chat("assistant", reply)
        return ChatResponse(reply=reply, red_flag=True, history=store.get_chat())

    try:
        reply = await chat_completion(
            user_text,
            history=history,
            state=state,
            language=req.language,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    store.append_chat("user", user_text)
    store.append_chat("assistant", reply)
    return ChatResponse(reply=reply, red_flag=False, history=store.get_chat())


@router.delete("/chat/history", response_model=ChatResponse)
def reset_chat() -> ChatResponse:
    store.reset_chat()
    return ChatResponse(reply="Chat reset.", red_flag=False, history=[])
