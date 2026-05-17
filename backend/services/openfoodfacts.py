"""Open Food Facts lookups."""
from __future__ import annotations

from typing import Any

import httpx

from models import MealNutrients

OFF_BASE = "https://world.openfoodfacts.org/api/v2/product"
TIMEOUT = 5.0


class OffNotFound(Exception):
    pass


async def fetch_product(barcode: str) -> dict[str, Any]:
    if not barcode.strip().isdigit():
        raise OffNotFound(f"Invalid barcode: {barcode!r}")

    url = f"{OFF_BASE}/{barcode.strip()}.json"
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.get(url, headers={"User-Agent": "HeartHealth/0.1 (hackathon)"})
            r.raise_for_status()
        payload = r.json()
    except (httpx.HTTPError, ValueError) as e:
        raise OffNotFound(f"OFF request failed: {e}") from e

    if payload.get("status") != 1 or "product" not in payload:
        raise OffNotFound(f"Barcode {barcode} not in Open Food Facts")
    return payload["product"]


def parse_nutrients(product: dict[str, Any]) -> tuple[MealNutrients, float]:
    """Returns (nutrients, completeness 0..1)."""
    nutr: dict[str, Any] = product.get("nutriments", {}) or {}
    per = (product.get("nutrition_data_per") or "").lower()
    prefer_serving = per == "serving"

    def pick(*keys: str) -> float | None:
        for k in keys:
            v = nutr.get(k)
            if v is None or v == "":
                continue
            try:
                f = float(v)
            except (TypeError, ValueError):
                continue
            if f <= 0:
                continue
            return f
        return None

    def pwp(serving_key: str, value_key: str, hundredg_key: str) -> float | None:
        if prefer_serving:
            return pick(serving_key, value_key, hundredg_key)
        return pick(serving_key, hundredg_key, value_key)

    calories_raw = pwp("energy-kcal_serving", "energy-kcal_value", "energy-kcal_100g")
    if calories_raw is None:
        energy_kj = pwp("energy_serving", "energy_value", "energy_100g")
        calories_raw = (energy_kj / 4.184) if energy_kj else None
    calories = calories_raw or 0.0

    protein = pwp("proteins_serving", "proteins_value", "proteins_100g") or 0.0
    carbs = pwp("carbohydrates_serving", "carbohydrates_value", "carbohydrates_100g") or 0.0
    fat = pwp("fat_serving", "fat_value", "fat_100g") or 0.0
    fiber = pwp("fiber_serving", "fiber_value", "fiber_100g") or 0.0

    sodium_g = pwp("sodium_serving", "sodium_value", "sodium_100g")
    if sodium_g is None:
        salt_g = pwp("salt_serving", "salt_value", "salt_100g")
        sodium_g = (salt_g * 0.393) if salt_g else 0.0
    sodium_mg = (sodium_g or 0.0) * 1000

    potassium_mg = pwp("potassium_serving", "potassium_value", "potassium_100g") or 0.0
    if 0 < potassium_mg < 10:
        potassium_mg *= 1000

    cholesterol_mg = pwp("cholesterol_serving", "cholesterol_value", "cholesterol_100g") or 0.0
    if 0 < cholesterol_mg < 1:
        cholesterol_mg *= 1000

    nutrients = MealNutrients(
        calories=round(calories, 1),
        protein_g=round(protein, 1),
        carbs_g=round(carbs, 1),
        fat_g=round(fat, 1),
        fiber_g=round(fiber, 1),
        sodium_mg=round(sodium_mg, 1),
        potassium_mg=round(potassium_mg, 1),
        cholesterol_mg=round(cholesterol_mg, 1),
    )
    filled = sum(1 for v in (calories, protein, carbs, fat, fiber, sodium_mg, potassium_mg, cholesterol_mg) if v > 0)
    return nutrients, filled / 8.0


def product_display_name(product: dict[str, Any]) -> str:
    return (
        product.get("product_name_en")
        or product.get("product_name")
        or product.get("generic_name")
        or product.get("brands")
        or "Scanned item"
    ).strip()


def product_category_tags(product: dict[str, Any]) -> list[str]:
    raw = product.get("categories_tags") or []
    return [str(t) for t in raw if t]