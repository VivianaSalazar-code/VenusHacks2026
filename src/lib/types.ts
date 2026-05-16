// Type contracts shared with the FastAPI backend (backend/models.py).
// Keep these in sync if you change a Pydantic schema.

export type LifeStage = "teen" | "adult" | "expecting" | "postpartum" | "menopause";

export type DashBucket =
  | "vegetables"
  | "fruits"
  | "whole_grains"
  | "lean_protein"
  | "low_fat_dairy"
  | "nuts_seeds_legumes"
  | "fats_sweets";

export interface UserProfile {
  user_name: string;
  age: number;
  ethnicity: string;
  user_location: string;
}

export interface LifeStageState {
  life_stage: LifeStage;
  weeks_postpartum: number;
  maternity_desert_zone: boolean;
}

export interface Biometrics {
  sys_bp: number;
  dia_bp: number;
  current_hr: number;
  current_hrv: number;
  active_symptoms: string[];
}

export interface DailyNutrition {
  daily_sodium_mg: number;
  daily_cholesterol_mg: number;
  daily_potassium_mg: number;
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fat_g: number;
  daily_fiber_g: number;
  target_diet_type: string;
}

export interface FullState {
  user_profile: UserProfile;
  life_stage_state: LifeStageState;
  biometrics: Biometrics;
  daily_nutrition: DailyNutrition;
}

export interface MealNutrients {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  potassium_mg: number;
  cholesterol_mg: number;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  dash_bucket: DashBucket;
  serving_qty: number;
  nutrients: MealNutrients;
  source: "barcode" | "manual" | "llm_estimate";
  barcode?: string | null;
}

export interface DashPlateBucketState {
  bucket: DashBucket;
  label: string;
  servings_logged: number;
  servings_target: number;
  fill_ratio: number;
  color: string;
}

export interface NutritionToday {
  meals: Meal[];
  daily_nutrition: DailyNutrition;
  dash_plate: DashPlateBucketState[];
  targets: Record<string, number>;
}

export interface BarcodeLookupResult {
  found: boolean;
  source: "openfoodfacts" | "llm_estimate" | "not_found";
  name: string;
  dash_bucket: DashBucket;
  nutrients: MealNutrients;
  barcode: string;
  confidence: number;
  notes?: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface ChatResponse {
  reply: string;
  red_flag: boolean;
  history: ChatMessage[];
}

export type ProfilePatch = Partial<{
  user_profile: UserProfile;
  life_stage_state: LifeStageState;
  biometrics: Biometrics;
  daily_nutrition: DailyNutrition;
  language: "en" | "es";
}>;

export interface MealLogRequest {
  name: string;
  dash_bucket?: DashBucket;
  serving_qty: number;
  nutrients: MealNutrients;
  source: "barcode" | "manual" | "llm_estimate";
  barcode?: string | null;
}
