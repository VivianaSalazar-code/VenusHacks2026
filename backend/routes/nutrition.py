"""Nutrition log + barcode lookup endpoints (with cascade)."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException

from models import (
    BarcodeLookupResponse,
    DashPlateBucketState,
    Meal,
    MealLogRequest,
    MealNutrients,
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
    parse_nutrients as off_parse_nutrients,
    product_category_tags,
    product_display_name,
)
from services.usda_fdc import (
    FdcConfigError,
    FdcNotFound,
    classify_from_fdc,
    food_display_name,
    parse_nutrients as fdc_parse_nutrients,
    search_by_barcode as fdc_search_by_barcode,
    search_by_name as fdc_search_by_name,
)
from state import store

router = APIRouter(tags=["nutrition"])

OFF_COMPLETENESS_FLOOR = 0.5


def _build_plate(meals: list[Meal]) -> list[DashPlateBucketState]:
    by_bucket: dict[str, float] = {}
    for m in meals:
        by_bucket[m.dash_bucket] = by_bucket.get(m.dash_bucket, 0.0) + (m.serving_qty or 1.0)

    plate: list[DashPlateBucketState] = []
    for bucket, label, target, color in DASH_TARGETS:
        logged = by_bucket.get(bucket, 0.0)
        fill = (logged / target) if target > 0 else 0.0
        plate.append(
            DashPlateBucketState(
                bucket=bucket,
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
        dash_bucket=bucket,
        serving_qty=req.serving_qty,
        nutrients=req.nutrients,
        source=req.source,
        barcode=req.barcode,
    )
    store.add_meal(meal)
    return get_today()


# ---- Cascade helpers ----

async def _try_off(barcode: str) -> dict[str, Any] | None:
    try:
        product = await fetch_product(barcode)
    except OffNotFound:
        return None
    except Exception:
        return None
    try:
        nutrients, completeness = off_parse_nutrients(product)
    except Exception:
        return None
    name = product_display_name(product)
    tags = product_category_tags(product)
    bucket = classify_dash_bucket(name, tags)
    return {
        "name": name,
        "dash_bucket": bucket,
        "nutrients": nutrients,
        "completeness": completeness,
        "off_name": name,
    }


async def _try_fdc_barcode(barcode: str) -> dict[str, Any] | None:
    try:
        food = await fdc_search_by_barcode(barcode)
    except (FdcNotFound, FdcConfigError):
        return None
    except Exception:
        return None
    try:
        nutrients = fdc_parse_nutrients(food)
    except Exception:
        return None
    name = food_display_name(food)
    bucket = classify_from_fdc(food) or classify_dash_bucket(name)
    return {"name": name, "dash_bucket": bucket, "nutrients": nutrients, "completeness": 1.0}


async def _try_fdc_name(name: str) -> dict[str, Any] | None:
    if not name or not name.strip():
        return None
    try:
        food = await fdc_search_by_name(name)
    except (FdcNotFound, FdcConfigError):
        return None
    except Exception:
        return None
    try:
        nutrients = fdc_parse_nutrients(food)
    except Exception:
        return None
    display = food_display_name(food)
    bucket = classify_from_fdc(food) or classify_dash_bucket(display)
    return {"name": display, "dash_bucket": bucket, "nutrients": nutrients, "completeness": 0.9}


async def _try_llm(name: str) -> dict[str, Any] | None:
    try:
        est = await estimate_barcode_nutrients(name or "Unknown packaged food")
    except Exception:
        return None
    return {
        "name": est["name"],
        "dash_bucket": est["dash_bucket"],
        "nutrients": est["nutrients"],
        "completeness": 0.3,
        "confidence": est["confidence"],
        "notes": est["notes"],
    }


# ---- Endpoints ----

@router.get("/nutrition/lookup_name", response_model=BarcodeLookupResponse)
async def lookup_name(q: str) -> BarcodeLookupResponse:
    q = q.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Query is empty.")

    fdc_n = await _try_fdc_name(q)
    if fdc_n:
        return BarcodeLookupResponse(
            found=True, source="usda_fdc_name",
            name=fdc_n["name"], dash_bucket=fdc_n["dash_bucket"],
            nutrients=fdc_n["nutrients"], barcode="",
            confidence=0.85, data_quality=fdc_n["completeness"],
        )
    llm = await _try_llm(q)
    if llm and llm["confidence"] > 0:
        return BarcodeLookupResponse(
            found=True, source="llm_estimate",
            name=llm["name"], dash_bucket=llm["dash_bucket"],
            nutrients=llm["nutrients"], barcode="",
            confidence=llm["confidence"], data_quality=llm["completeness"],
            notes=llm.get("notes"),
        )
    raise HTTPException(status_code=404, detail=f"No match for {q!r}.")


@router.get("/nutrition/barcode/{barcode}", response_model=BarcodeLookupResponse)
async def lookup_barcode(barcode: str, name_hint: str | None = None) -> BarcodeLookupResponse:
    """Cascade: OFF -> USDA-barcode -> USDA-name -> LLM. Every stage handles its own errors."""
    name_for_fallback = (name_hint or "").strip()

    off = await _try_off(barcode)
    if off and off["completeness"] >= OFF_COMPLETENESS_FLOOR:
        return BarcodeLookupResponse(
            found=True, source="openfoodfacts",
            name=off["name"], dash_bucket=off["dash_bucket"],
            nutrients=off["nutrients"], barcode=barcode,
            confidence=1.0, data_quality=off["completeness"],
        )
    if off:
        name_for_fallback = name_for_fallback or off["off_name"]

    fdc_b = await _try_fdc_barcode(barcode)
    if fdc_b:
        return BarcodeLookupResponse(
            found=True, source="usda_fdc_barcode",
            name=fdc_b["name"], dash_bucket=fdc_b["dash_bucket"],
            nutrients=fdc_b["nutrients"], barcode=barcode,
            confidence=1.0, data_quality=fdc_b["completeness"],
        )

    fdc_n = await _try_fdc_name(name_for_fallback)
    if fdc_n:
        return BarcodeLookupResponse(
            found=True, source="usda_fdc_name",
            name=fdc_n["name"], dash_bucket=fdc_n["dash_bucket"],
            nutrients=fdc_n["nutrients"], barcode=barcode,
            confidence=0.85, data_quality=fdc_n["completeness"],
        )

    llm = await _try_llm(name_for_fallback)
    if llm and llm["confidence"] > 0:
        return BarcodeLookupResponse(
            found=True, source="llm_estimate",
            name=llm["name"], dash_bucket=llm["dash_bucket"],
            nutrients=llm["nutrients"], barcode=barcode,
            confidence=llm["confidence"], data_quality=llm["completeness"],
            notes=llm.get("notes"),
        )

    return BarcodeLookupResponse(
        found=False, source="not_found",
        name=name_for_fallback or "Unknown item",
        dash_bucket=classify_dash_bucket(name_for_fallback or ""),
        nutrients=off["nutrients"] if off else MealNutrients(),
        barcode=barcode,
        confidence=0.0, data_quality=0.0,
        notes="Couldn't identify this barcode. Use Manual Entry with the brand + product name.",
    )
    
