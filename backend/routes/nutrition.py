"""Nutrition log + barcode lookup endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException

from models import (
    BarcodeLookupResponse,
    DashPlateBucketState,
    Meal,
    MealLogRequest,
    NutritionTodayResponse,
)
from services.dash_classifier import (
    DASH_DAILY_TARGETS,
    DASH_TARGETS,
    classify_dash_bucket,
)
from services.llm import estimate_barcode_nutrients
from services.openfoodfacts import (
    OffNotFound,
    fetch_product,
    parse_nutrients,
    product_category_tags,
    product_display_name,
)
from state import store

router = APIRouter(tags=["nutrition"])


def _build_plate(meals: list[Meal]) -> list[DashPlateBucketState]:
    """Aggregate logged servings per bucket and compute fill ratios."""
    by_bucket: dict[str, float] = {}
    for m in meals:
        by_bucket[m.dash_bucket] = by_bucket.get(m.dash_bucket, 0.0) + (m.serving_qty or 1.0)

    plate: list[DashPlateBucketState] = []
    for bucket, label, target, color in DASH_TARGETS:
        logged = by_bucket.get(bucket, 0.0)
        fill = (logged / target) if target > 0 else 0.0
        plate.append(
            DashPlateBucketState(
                bucket=bucket,  # type: ignore[arg-type]
                label=label,
                servings_logged=round(logged, 2),
                servings_target=target,
                fill_ratio=round(min(max(fill, 0.0), 1.5), 3),
                color=color,
            )
        )
    return plate


@router.get("/nutrition/today", response_model=NutritionTodayResponse)
def get_today() -> NutritionTodayResponse:
    meals = store.todays_meals()
    state = store.get_state()
    return NutritionTodayResponse(
        meals=meals,
        daily_nutrition=state.daily_nutrition,
        dash_plate=_build_plate(meals),
        targets=DASH_DAILY_TARGETS,
    )


@router.post("/nutrition/log", response_model=NutritionTodayResponse)
def log_meal(req: MealLogRequest) -> NutritionTodayResponse:
    bucket = req.dash_bucket or classify_dash_bucket(req.name)
    meal = Meal(
        id=str(uuid.uuid4()),
        name=req.name,
        time=datetime.utcnow().isoformat() + "Z",
        dash_bucket=bucket,  # type: ignore[arg-type]
        serving_qty=req.serving_qty,
        nutrients=req.nutrients,
        source=req.source,
        barcode=req.barcode,
    )
    store.add_meal(meal)
    return get_today()


@router.get("/nutrition/barcode/{barcode}", response_model=BarcodeLookupResponse)
async def lookup_barcode(barcode: str, name_hint: str | None = None) -> BarcodeLookupResponse:
    """Try Open Food Facts first; fall back to LLM estimation on miss."""
    try:
        product = await fetch_product(barcode)
    except OffNotFound:
        # Fall through to LLM estimate using a name hint if available.
        hint = (name_hint or barcode).strip()
        try:
            est = await estimate_barcode_nutrients(hint)
        except Exception as e:  # noqa: BLE001
            raise HTTPException(
                status_code=502,
                detail=f"OFF miss and LLM fallback failed: {e}",
            )
        return BarcodeLookupResponse(
            found=est["confidence"] > 0,
            source="llm_estimate" if est["confidence"] > 0 else "not_found",
            name=est["name"],
            dash_bucket=est["dash_bucket"],
            nutrients=est["nutrients"],
            barcode=barcode,
            confidence=est["confidence"],
            notes=est["notes"],
        )

    name = product_display_name(product)
    tags = product_category_tags(product)
    bucket = classify_dash_bucket(name, tags)
    nutrients = parse_nutrients(product)
    return BarcodeLookupResponse(
        found=True,
        source="openfoodfacts",
        name=name,
        dash_bucket=bucket,
        nutrients=nutrients,
        barcode=barcode,
        confidence=1.0,
    )
