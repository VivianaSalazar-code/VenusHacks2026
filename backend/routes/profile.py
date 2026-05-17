"""Profile / state endpoints."""
from __future__ import annotations

from fastapi import APIRouter

from models import FullState, ProfilePatch
from state import store

router = APIRouter(tags=["profile"])


@router.get("/profile", response_model=FullState)
def get_profile() -> FullState:
    return store.get_state()


@router.put("/profile", response_model=FullState)
def update_profile(patch: ProfilePatch) -> FullState:
    return store.patch_state(
        user_profile=patch.user_profile,
        life_stage_state=patch.life_stage_state,
        biometrics=patch.biometrics,
        daily_nutrition=patch.daily_nutrition,
        language=patch.language,
    )
