"""Keyword-based DASH-diet bucket classifier.

Maps an Open Food Facts product (name + categories_tags) to one of the seven
DASH plate buckets. Heuristic — no LLM calls. Order matters: each rule is tried
in the order listed, first match wins. Tags from OFF look like:
``en:dairies``, ``en:plant-based-beverages``, ``fr:fromages``, etc.

Public DASH targets baked in here so the frontend doesn't have to know them.
"""
from __future__ import annotations

from typing import Iterable

from models import DashBucket

# (bucket, label, daily servings target on a 2000 kcal DASH plan, plate color)
DASH_TARGETS: list[tuple[DashBucket, str, float, str]] = [
    ("vegetables", "Vegetables", 5.0, "#7BB661"),
    ("fruits", "Fruits", 5.0, "#F4A6A0"),
    ("whole_grains", "Whole Grains", 7.0, "#D4A373"),
    ("lean_protein", "Lean Protein", 2.0, "#E76F51"),
    ("low_fat_dairy", "Low-Fat Dairy", 2.5, "#9DD3F6"),
    ("nuts_seeds_legumes", "Nuts / Seeds / Legumes", 0.7, "#B79268"),
    ("fats_sweets", "Fats & Sweets (limit)", 2.5, "#C9B6E4"),
]

# Each rule: list of substrings; if ANY appears in product name or any OFF tag,
# the bucket wins. Ordered so that more specific buckets are checked first
# (e.g., "yogurt" beats the generic "dairy-dessert" sweets rule).
_RULES: list[tuple[DashBucket, tuple[str, ...]]] = [
    (
        "low_fat_dairy",
        (
            "yogurt", "yoghurt", "kefir", "milk", "skim milk", "fat-free milk",
            "low-fat dairy", "dairies", "fromage-frais", "cottage-cheese",
            "cheese", "queso",
        ),
    ),
    (
        "nuts_seeds_legumes",
        (
            "nut", "nuts", "almond", "peanut", "cashew", "walnut", "pecan",
            "pistachio", "hazelnut", "seed", "seeds", "flaxseed", "chia",
            "sunflower seed", "pumpkin seed", "legume", "legumes", "bean",
            "beans", "lentil", "lentils", "chickpea", "garbanzo", "soy",
            "tofu", "tempeh", "hummus",
        ),
    ),
    (
        "lean_protein",
        (
            "chicken", "turkey", "fish", "salmon", "tuna", "cod", "tilapia",
            "shrimp", "egg", "eggs", "lean-beef", "lean beef", "poultry",
            "seafood", "meat-substitutes",
        ),
    ),
    (
        "fruits",
        (
            "fruit", "fruits", "apple", "banana", "berry", "berries",
            "strawberry", "blueberry", "raspberry", "orange", "citrus",
            "grape", "melon", "watermelon", "peach", "pear", "plum",
            "mango", "pineapple", "kiwi", "pomegranate", "raisin",
            "dried-fruit",
        ),
    ),
    (
        "vegetables",
        (
            "vegetable", "vegetables", "salad", "broccoli", "spinach",
            "kale", "lettuce", "carrot", "tomato", "pepper", "onion",
            "garlic", "zucchini", "cucumber", "cauliflower", "asparagus",
            "green-bean", "potato", "sweet-potato", "squash", "mushroom",
        ),
    ),
    (
        "whole_grains",
        (
            "whole-grain", "whole grain", "whole-wheat", "whole wheat",
            "oat", "oats", "oatmeal", "brown-rice", "brown rice", "quinoa",
            "barley", "buckwheat", "millet", "bulgur", "farro", "rye",
            "whole-grain-bread", "whole-grain-cereal", "whole-wheat-pasta",
        ),
    ),
    (
        "fats_sweets",
        (
            "chocolate", "candy", "candies", "cookie", "cookies", "cake",
            "cakes", "ice-cream", "soda", "sodas", "sugary-drinks",
            "sweet", "sweets", "dessert", "desserts", "syrup", "butter",
            "margarine", "oil", "oils", "chips", "crisps", "snack-bar",
            "donut", "doughnut", "pastry", "pastries",
        ),
    ),
]


def _normalize(s: str) -> str:
    return s.lower().replace("_", "-")


def classify_dash_bucket(
    product_name: str,
    categories_tags: Iterable[str] | None = None,
    fallback: DashBucket = "fats_sweets",
) -> DashBucket:
    """Pick the DASH bucket for a food item using OFF tags and the product name.

    ``fallback`` defaults to ``fats_sweets`` so that unrecognized packaged foods
    are conservatively counted against the user's discretionary-calories budget.
    """
    name = _normalize(product_name or "")
    tags = {_normalize(t) for t in (categories_tags or []) if t}
    haystack = {name, *tags}
    # Also a flattened blob so multi-word keywords match across tags.
    blob = " ".join(haystack)

    for bucket, keywords in _RULES:
        for kw in keywords:
            k = _normalize(kw)
            if k in name or k in blob or any(k in t for t in tags):
                return bucket
    return fallback


# ---------------------------------------------------------------------------
# DASH plate target math
# ---------------------------------------------------------------------------

# Daily ceilings / floors that the LLM and the UI will both quote.
DASH_DAILY_TARGETS: dict[str, float] = {
    "sodium_mg_max": 2300,
    "sodium_mg_ideal_max": 1500,
    "potassium_mg_min": 4700,
    "calories": 2000,
    "fiber_g_min": 30,
    "cholesterol_mg_max": 150,
}


def servings_for_bucket(bucket: DashBucket) -> float:
    for b, _, target, _ in DASH_TARGETS:
        if b == bucket:
            return target
    return 1.0


def label_for_bucket(bucket: DashBucket) -> str:
    for b, label, _, _ in DASH_TARGETS:
        if b == bucket:
            return label
    return bucket


def color_for_bucket(bucket: DashBucket) -> str:
    for b, _, _, color in DASH_TARGETS:
        if b == bucket:
            return color
    return "#cccccc"
