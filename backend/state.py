"""In-memory single-user state store for the hackathon build.

Swap this module for a real persistence layer (SQLite/Postgres) without
touching the rest of the codebase — the API surface is just `store`.
"""
from __future__ import annotations

from datetime import date
from threading import RLock

from models import (
    Biometrics,
    ChatMessage,
    DailyNutrition,
    FullState,
    LifeStageState,
    Meal,
    UserProfile,
)


class _Store:
    def __init__(self) -> None:
        self._lock = RLock()
        # Demo-ready defaults: postpartum user with mildly elevated BP -> the
        # LLM should aggressively recommend DASH (low-sodium, high-potassium).
        self.profile = UserProfile()
        self.life_stage = LifeStageState()
        self.biometrics = Biometrics()
        self.daily_nutrition = DailyNutrition()
        self.meals: list[Meal] = []
        self.chat_history: list[ChatMessage] = []
        self.language: str = "en"
        self._log_date: date = date.today()

    # ----- state snapshots -----
    def get_state(self) -> FullState:
        with self._lock:
            return FullState(
                user_profile=self.profile,
                life_stage_state=self.life_stage,
                biometrics=self.biometrics,
                daily_nutrition=self.daily_nutrition,
            )

    def patch_state(
        self,
        *,
        user_profile: UserProfile | None = None,
        life_stage_state: LifeStageState | None = None,
        biometrics: Biometrics | None = None,
        daily_nutrition: DailyNutrition | None = None,
        language: str | None = None,
    ) -> FullState:
        with self._lock:
            if user_profile is not None:
                self.profile = user_profile
            if life_stage_state is not None:
                self.life_stage = life_stage_state
            if biometrics is not None:
                self.biometrics = biometrics
            if daily_nutrition is not None:
                self.daily_nutrition = daily_nutrition
            if language is not None:
                self.language = language
            return self.get_state()

    # ----- meal log -----
    def _roll_day_if_needed(self) -> None:
        today = date.today()
        if today != self._log_date:
            self._log_date = today
            self.meals.clear()
            self.daily_nutrition = DailyNutrition()

    def add_meal(self, meal: Meal) -> None:
        with self._lock:
            self._roll_day_if_needed()
            self.meals.append(meal)
            n = meal.nutrients
            self.daily_nutrition.daily_calories += int(round(n.calories))
            self.daily_nutrition.daily_protein_g += int(round(n.protein_g))
            self.daily_nutrition.daily_carbs_g += int(round(n.carbs_g))
            self.daily_nutrition.daily_fat_g += int(round(n.fat_g))
            self.daily_nutrition.daily_fiber_g += int(round(n.fiber_g))
            self.daily_nutrition.daily_sodium_mg += int(round(n.sodium_mg))
            self.daily_nutrition.daily_potassium_mg += int(round(n.potassium_mg))
            self.daily_nutrition.daily_cholesterol_mg += int(round(n.cholesterol_mg))

    def todays_meals(self) -> list[Meal]:
        with self._lock:
            self._roll_day_if_needed()
            return list(self.meals)

    # ----- chat -----
    def append_chat(self, role: str, text: str) -> None:
        with self._lock:
            self.chat_history.append(ChatMessage(role=role, text=text))  # type: ignore[arg-type]

    def get_chat(self) -> list[ChatMessage]:
        with self._lock:
            return list(self.chat_history)

    def reset_chat(self) -> None:
        with self._lock:
            self.chat_history.clear()


store = _Store()
