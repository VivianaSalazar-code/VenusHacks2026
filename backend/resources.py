# backend/resources.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from .models import FullState, PersonalizedResourcesResponse, HealthAlert, RiskLevel
from .database import (
    query_clinics,
    query_support_groups,
    query_resource_links,
    get_bp_screening_locations,
    get_coordinates_from_zip
)

router = APIRouter(prefix="/api/resources", tags=["resources"])

def calculate_risk_level(state: FullState) -> RiskLevel:
    """Calculate user's risk level based on biometrics and life stage."""
    risk_score = 0
    
    # Blood pressure risk
    if state.biometrics.sys_bp >= 140 or state.biometrics.dia_bp >= 90:
        risk_score += 30
    elif state.biometrics.sys_bp >= 130 or state.biometrics.dia_bp >= 85:
        risk_score += 15
    
    # Life stage risk
    if state.life_stage_state.life_stage == "postpartum":
        if state.life_stage_state.weeks_postpartum <= 6:
            risk_score += 25
    elif state.life_stage_state.life_stage == "expecting":
        risk_score += 20
    elif state.life_stage_state.life_stage == "menopause":
        risk_score += 15
    
    # Symptom risk
    if "chest_pain" in state.biometrics.active_symptoms:
        risk_score += 30
    if "shortness_breath" in state.biometrics.active_symptoms:
        risk_score += 20
    
    # Medical history risk
    if state.life_stage_state.previous_preeclampsia:
        risk_score += 20
    if state.life_stage_state.gestational_hypertension:
        risk_score += 15
    
    if risk_score >= 40:
        return "high"
    elif risk_score >= 20:
        return "moderate"
    return "low"

def generate_recommendations(state: FullState) -> List[str]:
    """Generate personalized recommendations based on user state."""
    recommendations = []
    risk_level = calculate_risk_level(state)
    
    # Blood pressure recommendations
    if state.biometrics.sys_bp >= 140 or state.biometrics.dia_bp >= 90:
        recommendations.append("⚠️ Your blood pressure is elevated. Schedule a check-up within the week.")
    elif state.biometrics.sys_bp >= 130 or state.biometrics.dia_bp >= 85:
        recommendations.append("📈 Your blood pressure is slightly elevated. Focus on reducing sodium intake.")
    else:
        recommendations.append("✅ Your blood pressure looks good! Keep up with regular monitoring.")
    
    # Life stage specific
    if state.life_stage_state.life_stage == "postpartum":
        if state.life_stage_state.weeks_postpartum <= 6:
            recommendations.append("🤰 You're in the critical 6-week postpartum window. Monitor for headaches, vision changes, and chest pain.")
        recommendations.append("💪 Join a postpartum support group to connect with other new mothers.")
        recommendations.append("🩸 Track your blood pressure weekly for the first 6 months postpartum.")
    
    elif state.life_stage_state.life_stage == "expecting":
        recommendations.append("👶 Regular prenatal checkups are essential for monitoring blood pressure.")
        if state.life_stage_state.gestational_hypertension:
            recommendations.append("⚠️ You have a history of gestational hypertension - extra monitoring is recommended.")
    
    elif state.life_stage_state.life_stage == "menopause":
        recommendations.append("❤️ Heart disease risk increases after menopause. Stay active and monitor your blood pressure.")
    
    # Diet recommendations
    if state.daily_nutrition.daily_sodium_mg > state.daily_nutrition.target_sodium_mg:
        recommendations.append("🧂 High sodium detected. Try herbs and spices instead of salt.")
    if state.daily_nutrition.daily_potassium_mg < 2500:
        recommendations.append("🍌 Increase potassium-rich foods like bananas, spinach, and avocados.")
    
    # High risk recommendations
    if risk_level == "high":
        recommendations.append("🏥 Schedule a cardiovascular screening with a specialist.")
        recommendations.append("📋 Keep a daily log of your blood pressure and symptoms.")
    
    return recommendations[:5]  # Limit to 5 recommendations

def check_for_health_alert(state: FullState) -> Optional[HealthAlert]:
    """Check if user needs an immediate health alert."""
    
    # Critical: Chest pain
    if "chest_pain" in state.biometrics.active_symptoms:
        return HealthAlert(
            title="⚠️ CRITICAL ALERT",
            message="Chest pain detected. This could be a heart attack symptom, especially in women. Call 911 immediately.",
            severity="critical",
            action_required=True,
            actions=[
                {"label": "Call 911", "action": "tel:911"},
                {"label": "Find Emergency Room", "action": "map"}
            ]
        )
    
    # Critical: Hypertensive crisis
    if state.biometrics.sys_bp >= 180 or state.biometrics.dia_bp >= 120:
        return HealthAlert(
            title="🚨 HYPERTENSIVE CRISIS",
            message=f"Your blood pressure ({state.biometrics.sys_bp}/{state.biometrics.dia_bp}) is dangerously high. Seek emergency care immediately.",
            severity="critical",
            action_required=True,
            actions=[
                {"label": "Call 911", "action": "tel:911"},
                {"label": "Find ER", "action": "map"}
            ]
        )
    
    # High: Postpartum preeclampsia risk
    if (state.life_stage_state.life_stage == "postpartum" and 
        state.life_stage_state.weeks_postpartum <= 6 and
        state.biometrics.sys_bp >= 140):
        return HealthAlert(
            title="⚠️ Postpartum Preeclampsia Risk",
            message="High blood pressure after delivery can be a sign of postpartum preeclampsia. Contact your provider today.",
            severity="high",
            action_required=True,
            actions=[
                {"label": "Contact Provider", "action": "call"},
                {"label": "Find Clinic", "action": "clinic"}
            ]
        )
    
    # Warning: High blood pressure
    if state.biometrics.sys_bp >= 140 or state.biometrics.dia_bp >= 90:
        return HealthAlert(
            title="⚠️ High Blood Pressure Detected",
            message=f"Your blood pressure ({state.biometrics.sys_bp}/{state.biometrics.dia_bp}) is elevated. Monitor closely.",
            severity="warning",
            action_required=False,
            actions=[
                {"label": "Track Symptoms", "action": "track"},
                {"label": "Find Screening", "action": "screening"}
            ]
        )
    
    return None

@router.post("/personalized", response_model=PersonalizedResourcesResponse)
async def get_personalized_resources(state: FullState):
    """
    Get personalized resources based on user's full profile.
    Queries clinics, support groups, and educational resources.
    """
    try:
        # Get user's coordinates from location
        zip_code = state.user_profile.user_location[:5] if len(state.user_profile.user_location) >= 5 else "92627"
        user_coords = get_coordinates_from_zip(zip_code)
        
        # Calculate risk level
        risk_level = calculate_risk_level(state)
        
        # Query resources based on user profile
        clinics = query_clinics(
            life_stage=state.life_stage_state.life_stage,
            user_coords=user_coords,
            zip_code=zip_code
        )
        
        # Determine user's preferred language (default to English)
        user_language = "Spanish" if state.user_profile.ethnicity == "hispanic" else "English"
        
        support_groups = query_support_groups(
            life_stage=state.life_stage_state.life_stage,
            language=user_language
        )
        
        resource_links = query_resource_links(
            life_stage=state.life_stage_state.life_stage,
            risk_level=risk_level,
            language=user_language
        )
        
        bp_screening = get_bp_screening_locations()
        
        # Generate recommendations and check for alerts
        recommendations = generate_recommendations(state)
        health_alert = check_for_health_alert(state)
        
        # Create risk summary
        risk_summary = {
            "risk_level": risk_level,
            "risk_score": state.biometrics.risk_score or 0,
            "factors": {
                "blood_pressure": state.biometrics.sys_bp >= 140 or state.biometrics.dia_bp >= 90,
                "life_stage_high_risk": state.life_stage_state.life_stage in ["postpartum", "expecting"],
                "active_symptoms": len(state.biometrics.active_symptoms) > 0,
                "postpartum_window": state.life_stage_state.life_stage == "postpartum" and state.life_stage_state.weeks_postpartum <= 6
            }
        }
        
        return PersonalizedResourcesResponse(
            user=state.user_profile,
            clinics=clinics,
            support_groups=support_groups,
            bp_screening=bp_screening,
            resource_links=resource_links,
            health_alert=health_alert,
            personalized_recommendations=recommendations,
            risk_summary=risk_summary
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting resources: {str(e)}")

@router.get("/health-check")
async def health_check():
    """Check if resources API is working."""
    return {"status": "healthy", "service": "resources"}