"""Open Food Facts lookups.

We hit the public v2 endpoint, which returns a verbose JSON document with a
``nutriments`` map keyed by nutrient with multiple unit suffixes
(``salt_100g``, ``sodium_100g``, ``proteins_serving``, etc.). The parser below
normalizes whatever's available into our ``MealNutrients`` shape on a
*per-serving* basis when possible, falling back to per-100g.
"""
from __future__ import annotations

from typing import Any

import httpx

from models import MealNutrients

OFF_BASE = "https://world.openfoodfacts.org/api/v2/product"
TIMEOUT = 8.0


class OffNotFound(Exception):
    pass


async def fetch_product(barcode: str) -> dict[str, Any]:
    """Fetch raw OFF product JSON; raise OffNotFound if status != 1."""
    if not barcode.strip().isdigit():
        raise OffNotFound(f"Invalid barcode: {barcode!r}")

    url = f"{OFF_BASE}/{barcode.strip()}.json"
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            r = await client.get(url, headers={"User-Agent": "HeartHealth/0.1 (hackathon)"})
            r.raise_for_status()
        except httpx.HTTPError as e:
            raise OffNotFound(f"OFF request failed: {e}") from e
    payload = r.json()
    if payload.get("status") != 1 or "product" not in payload:
        raise OffNotFound(f"Barcode {barcode} not in Open Food Facts")
    return payload["product"]


def parse_nutrients(product: dict[str, Any]) -> MealNutrients:
    """Pull a best-effort per-serving nutrient breakdown from an OFF product."""
    nutr: dict[str, Any] = product.get("nutriments", {}) or {}

    def pick(*keys: str, default: float = 0.0) -> float:
        for k in keys:
            v = nutr.get(k)
            if v is None or v == "":
                continue
            try:
                return float(v)
            except (TypeError, ValueError):
                continue
        return default

    # Prefer per-serving values when present, else fall back to per-100g.
    calories = pick(
        "energy-kcal_serving", "energy-kcal_value", "energy-kcal_100g",
        "energy_serving", "energy_100g",
    )
    # OFF "energy" with no kcal suffix is in kJ; convert if it looks too large.
    if calories > 900 and "energy-kcal_serving" not in nutr and "energy-kcal_100g" not in nutr:
        calories = calories / 4.184

    protein = pick("proteins_serving", "proteins_100g")
    carbs = pick("carbohydrates_serving", "carbohydrates_100g")
    fat = pick("fat_serving", "fat_100g")
    fiber = pick("fiber_serving", "fiber_100g")
    sodium_g = pick("sodium_serving", "sodium_100g")
    # OFF often reports salt instead of sodium; salt(g) -> sodium(mg) factor ~393.
    if sodium_g == 0:
        salt = pick("salt_serving", "salt_100g")
        if salt:
            sodium_g = salt * 0.393
    sodium_mg = sodium_g * 1000  # OFF "sodium" field is in grams

    potassium_mg = pick("potassium_serving", "potassium_100g")
    # Some entries report potassium in grams instead of mg.
    if 0 < potassium_mg < 10:
        potassium_mg = potassium_mg * 1000

    cholesterol_mg = pick("cholesterol_serving", "cholesterol_100g")
    if 0 < cholesterol_mg < 1:
        cholesterol_mg = cholesterol_mg * 1000  # likely grams -> mg

    return MealNutrients(
        calories=round(calories, 1),
        protein_g=round(protein, 1),
        carbs_g=round(carbs, 1),
        fat_g=round(fat, 1),
        fiber_g=round(fiber, 1),
        sodium_mg=round(sodium_mg, 1),
        potassium_mg=round(potassium_mg, 1),
        cholesterol_mg=round(cholesterol_mg, 1),
    )


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
