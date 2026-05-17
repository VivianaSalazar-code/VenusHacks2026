"""Pydantic schemas shared across the API."""
from __future__ import annotations

from typing import Literal, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

# Enums
LifeStage = Literal["teen", "adult", "expecting", "postpartum", "menopause"]
SymptomType = Literal["fatigue", "jaw_pain", "nausea", "shortness_breath", "headache", "chest_pain", "palpitations", "dizziness"]
RiskLevel = Literal["low", "moderate", "high"]
DietType = Literal["DASH", "Low-Cholesterol", "Standard"]
DashBucket = Literal[
    "vegetables",
    "fruits",
    "whole_grains",
    "lean_protein",
    "low_fat_dairy",
    "nuts_seeds_legumes",
    "fats_sweets",
]

class UserProfile(BaseModel):
    user_name: str = "John Pork"
    age: int = 32
    ethnicity: str = "unspecified"
    user_location: str = "Irvine, CA"
    email: Optional[str] = None
    phone: Optional[str] = None


class LifeStageState(BaseModel):
    life_stage: LifeStage = "postpartum"
    weeks_postpartum: int = 6
    trimester: Optional[int] = None  # 1, 2, or 3 for expecting
    due_date: Optional[str] = None
    maternity_desert_zone: bool = False
    previous_preeclampsia: bool = False
    gestational_hypertension: bool = False


class Biometrics(BaseModel):
    sys_bp: int = 138
    dia_bp: int = 89
    current_hr: int = 78
    current_hrv: int = 42
    active_symptoms: List[SymptomType] = Field(default_factory=list)
    risk_score: Optional[int] = None
    risk_level: RiskLevel = "moderate"


class DailyNutrition(BaseModel):
    daily_sodium_mg: int = 0
    daily_cholesterol_mg: int = 0
    daily_potassium_mg: int = 0
    daily_calories: int = 0
    daily_protein_g: int = 0
    daily_carbs_g: int = 0
    daily_fat_g: int = 0
    daily_fiber_g: int = 0
    target_diet_type: str = "DASH"


class FullState(BaseModel):
    user_profile: UserProfile
    life_stage_state: LifeStageState
    biometrics: Biometrics
    daily_nutrition: DailyNutrition
    updated_at: datetime = Field(default_factory=datetime.now)


class ProfilePatch(BaseModel):
    """Partial update; any subtree may be supplied."""
    user_profile: Optional[UserProfile] = None
    life_stage_state: Optional[LifeStageState] = None
    biometrics: Optional[Biometrics] = None
    daily_nutrition: Optional[DailyNutrition] = None
    language: Optional[Literal["en", "es"]] = None

# Nourish Models
class MealNutrients(BaseModel):
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    fiber_g: float = 0
    sodium_mg: float = 0
    potassium_mg: float = 0
    cholesterol_mg: float = 0


class Meal(BaseModel):
    id: str
    name: str
    time: str  # ISO 8601
    dash_bucket: DashBucket
    serving_qty: float = 1.0
    nutrients: MealNutrients
    source: Literal["barcode", "manual", "llm_estimate"] = "manual"
    barcode: Optional[str] = None


class MealLogRequest(BaseModel):
    name: str
    dash_bucket: Optional[DashBucket] = None
    serving_qty: float = 1.0
    nutrients: MealNutrients
    source: Literal["barcode", "manual", "llm_estimate"] = "manual"
    barcode: Optional[str] = None


class DashPlateBucketState(BaseModel):
    bucket: DashBucket
    label: str
    servings_logged: float
    servings_target: float
    fill_ratio: float  # 0..1+ (overflow allowed for visualization)
    color: str


class NutritionTodayResponse(BaseModel):
    meals: list[Meal]
    daily_nutrition: DailyNutrition
    dash_plate: list[DashPlateBucketState]
    targets: dict[str, float]


class BarcodeLookupResponse(BaseModel):
    found: bool
    source: Literal[
        "openfoodfacts",
        "usda_fdc_barcode",
        "usda_fdc_name",
        "llm_estimate",
        "not_found",
    ]
    name: str
    dash_bucket: DashBucket
    nutrients: MealNutrients
    barcode: str
    confidence: float = 1.0
    data_quality: float = 1.0
    notes: Optional[str] = None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    text: str


class ChatRequest(BaseModel):
    message: str
    language: Literal["en", "es"] = "en"
    # The frontend may also send a one-off state override (e.g., from a dev panel).
    state_override: Optional[FullState] = None


class ChatResponse(BaseModel):
    reply: str
    red_flag: bool = False
    history: list[ChatMessage]


#  Resource Models
class Clinic(BaseModel):
    id: str
    name: str
    address: str
    phone: str
    distance: str
    distance_miles: float
    services: List[str]
    languages: List[str]
    life_stages_served: List[LifeStage]
    coordinates: dict
    website: str
    google_maps_url: str
    accepts_medi_cal: bool = True
    sliding_scale: bool = True

class SupportGroup(BaseModel):
    id: str
    name: str
    type: str
    description: str
    schedule: str
    location: str
    contact: str
    website: Optional[str] = None
    distance_miles: Optional[float] = None
    virtual_available: bool = True
    language: List[str] = ["English", "Spanish"]
    life_stages: List[LifeStage]

class BPScreeningLocation(BaseModel):
    id: str
    name: str
    address: str
    hours: str
    cost: str
    website: str
    phone: Optional[str] = None
    walk_in_available: bool = True

class ResourceLink(BaseModel):
    id: str
    title: str
    description: str
    url: str
    category: Literal["article", "video", "guide", "external", "research"]
    language: str = "English"
    life_stages: List[LifeStage]
    risk_levels: List[RiskLevel]

class HealthAlert(BaseModel):
    title: str
    message: str
    severity: Literal["critical", "high", "warning", "info"]
    action_required: bool
    actions: List[dict] = Field(default_factory=list)

class PersonalizedResourcesResponse(BaseModel):
    user: UserProfile
    clinics: List[Clinic]
    support_groups: List[SupportGroup]
    bp_screening: List[BPScreeningLocation]
    resource_links: List[ResourceLink]
    health_alert: Optional[HealthAlert] = None
    personalized_recommendations: List[str]
    risk_summary: dict