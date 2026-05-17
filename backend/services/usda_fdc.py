"""USDA FoodData Central client."""
from __future__ import annotations

import os
from typing import Any

import httpx

from models import DashBucket, MealNutrients

FDC_BASE = "https://api.nal.usda.gov/fdc/v1"
TIMEOUT = 10.0

_NUTRIENT_IDS = {
    "calories": 1008,
    "protein_g": 1003,
    "fat_g": 1004,
    "carbs_g": 1005,
    "fiber_g": 1079,
    "sodium_mg": 1093,
    "potassium_mg": 1092,
    "cholesterol_mg": 1253,
}

_LABEL_KEYS = {
    "calories": "calories",
    "protein_g": "protein",
    "fat_g": "fat",
    "carbs_g": "carbohydrates",
    "fiber_g": "fiber",
    "sodium_mg": "sodium",
    "potassium_mg": "potassium",
    "cholesterol_mg": "cholesterol",
}


class FdcNotFound(Exception):
    pass


class FdcConfigError(Exception):
    pass


def _api_key() -> str:
    k = os.getenv("USDA_FDC_API_KEY", "").strip()
    if not k:
        raise FdcConfigError("USDA_FDC_API_KEY not set.")
    return k


async def _search(query: str, *, data_type: str | None = None, page_size: int = 5) -> list[dict[str, Any]]:
    """Search FDC. Treats 404 / network errors as 'no results', not as exceptions."""
    params: dict[str, Any] = {"query": query, "api_key": _api_key(), "pageSize": page_size}
    if data_type:
        params["dataType"] = data_type

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.get(f"{FDC_BASE}/foods/search", params=params)
            # FDC returns 404 when nothing matches the query -- not an error.
            if r.status_code == 404:
                return []
            r.raise_for_status()
        payload = r.json()
        return payload.get("foods", []) or []
    except (httpx.HTTPError, ValueError):
        # Network failure, JSON decode failure, etc -- let the cascade continue.
        return []


async def search_by_barcode(barcode: str) -> dict[str, Any]:
    code = barcode.strip()
    if not code.isdigit():
        raise FdcNotFound(f"Invalid barcode: {barcode!r}")
    foods = await _search(code, data_type="Branded", page_size=3)
    if not foods:
        raise FdcNotFound(f"FDC has no branded entry for {barcode}")
    return foods[0]


async def search_by_name(name: str) -> dict[str, Any]:
    query = (name or "").strip()
    if not query:
        raise FdcNotFound("Empty query")
    foods = await _search(query, page_size=8)
    if not foods:
        raise FdcNotFound(f"FDC has no match for {query!r}")
    preferred = [f for f in foods if f.get("dataType") in ("Foundation", "SR Legacy", "Survey (FNDDS)")]
    return (preferred or foods)[0]


def parse_nutrients(food: dict[str, Any]) -> MealNutrients:
    label = food.get("labelNutrients") or {}
    by_id = {n.get("nutrientId"): n for n in food.get("foodNutrients", []) or []}

    serving_size_g = food.get("servingSize") or 0
    serving_unit = (food.get("servingSizeUnit") or "").lower()
    scale_to_serving = serving_size_g and serving_unit in ("g", "gram", "grams") and serving_size_g > 0

    def fdc_value(field: str) -> float:
        lk = _LABEL_KEYS.get(field)
        if lk and isinstance(label.get(lk), dict) and label[lk].get("value") is not None:
            try:
                return float(label[lk]["value"])
            except (TypeError, ValueError):
                pass

        nid = _NUTRIENT_IDS.get(field)
        if nid and nid in by_id:
            try:
                v = float(by_id[nid].get("value") or 0)
            except (TypeError, ValueError):
                v = 0.0
            if scale_to_serving:
                return v * (serving_size_g / 100.0)
            return v
        return 0.0

    return MealNutrients(
        calories=round(fdc_value("calories"), 1),
        protein_g=round(fdc_value("protein_g"), 1),
        carbs_g=round(fdc_value("carbs_g"), 1),
        fat_g=round(fdc_value("fat_g"), 1),
        fiber_g=round(fdc_value("fiber_g"), 1),
        sodium_mg=round(fdc_value("sodium_mg"), 1),
        potassium_mg=round(fdc_value("potassium_mg"), 1),
        cholesterol_mg=round(fdc_value("cholesterol_mg"), 1),
    )


def food_display_name(food: dict[str, Any]) -> str:
    desc = food.get("description") or food.get("lowercaseDescription") or "Unknown food"
    brand = food.get("brandOwner") or food.get("brandName")
    if brand and brand.lower() not in desc.lower():
        return f"{brand} — {desc}"
    return desc.strip()


_CATEGORY_TO_DASH: dict[str, DashBucket] = {
    "Fruits and Fruit Juices": "fruits",
    "Vegetables and Vegetable Products": "vegetables",
    "Dairy and Egg Products": "low_fat_dairy",
    "Cereal Grains and Pasta": "whole_grains",
    "Breakfast Cereals": "whole_grains",
    "Baked Products": "whole_grains",
    "Poultry Products": "lean_protein",
    "Beef Products": "lean_protein",
    "Pork Products": "lean_protein",
    "Lamb, Veal, and Game Products": "lean_protein",
    "Finfish and Shellfish Products": "lean_protein",
    "Sausages and Luncheon Meats": "lean_protein",
    "Legumes and Legume Products": "nuts_seeds_legumes",
    "Nut and Seed Products": "nuts_seeds_legumes",
    "Sweets": "fats_sweets",
    "Fats and Oils": "fats_sweets",
    "Snacks": "fats_sweets",
    "Beverages": "fats_sweets",
    "Soups, Sauces, and Gravies": "fats_sweets",
    "Restaurant Foods": "fats_sweets",
    "Spices and Herbs": "vegetables",
    "Fast Foods": "fats_sweets",
    "Meals, Entrees, and Side Dishes": "lean_protein",
    "Baby Foods": "fruits",
}

_BRANDED_CATEGORY_HINTS: list[tuple[str, DashBucket]] = [
    ("milk", "low_fat_dairy"), ("yogurt", "low_fat_dairy"), ("cheese", "low_fat_dairy"),
    ("fruit", "fruits"), ("vegetable", "vegetables"), ("salad", "vegetables"),
    ("cereal", "whole_grains"), ("bread", "whole_grains"), ("rice", "whole_grains"),
    ("pasta", "whole_grains"), ("nut", "nuts_seeds_legumes"), ("bean", "nuts_seeds_legumes"),
    ("seafood", "lean_protein"), ("chicken", "lean_protein"), ("beef", "lean_protein"),
    ("pork", "lean_protein"), ("egg", "lean_protein"),
    ("candy", "fats_sweets"), ("chip", "fats_sweets"), ("cookie", "fats_sweets"),
    ("soda", "fats_sweets"), ("juice", "fruits"), ("oil", "fats_sweets"),
    ("dessert", "fats_sweets"), ("ice cream", "fats_sweets"),
]


def classify_from_fdc(food: dict[str, Any]) -> DashBucket | None:
    cat = (food.get("foodCategory") or "").strip()
    if cat in _CATEGORY_TO_DASH:
        return _CATEGORY_TO_DASH[cat]
    branded = (food.get("brandedFoodCategory") or "").lower()
    if branded:
        for needle, bucket in _BRANDED_CATEGORY_HINTS:
            if needle in branded:
                return bucket
    desc = (food.get("description") or "").lower()
    if cat == "Dairy and Egg Products" and "egg" in desc:
        return "lean_protein"
    return None