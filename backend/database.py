# backend/database.py
from typing import List, Optional
from math import radians, sin, cos, sqrt, atan2
from .models import Clinic, SupportGroup, BPScreeningLocation, ResourceLink, LifeStage, RiskLevel

# Mock database of resources
CLINICS_DB: List[dict] = [
    {
        "id": "clinic_001",
        "name": "Community Health Center of Orange County",
        "address": "1835 Newport Blvd, Costa Mesa, CA 92627",
        "phone": "(714) 972-3000",
        "services": ["Prenatal Care", "Postpartum Care", "Blood Pressure Screening", "Cardiovascular Health", "Pediatrics", "Mental Health"],
        "languages": ["English", "Spanish", "Vietnamese"],
        "life_stages_served": ["expecting", "postpartum", "adult", "teen"],
        "coordinates": {"lat": 33.6434, "lng": -117.8911},
        "website": "https://www.chcoc.org",
        "accepts_medi_cal": True,
        "sliding_scale": True
    },
    {
        "id": "clinic_002",
        "name": "St. Joseph Hospital Women's Health Center",
        "address": "1100 W Stewart Dr, Orange, CA 92868",
        "phone": "(714) 734-6220",
        "services": ["Maternity Services", "Heart Health Screening", "Postpartum Support", "Cardiology", "High-Risk Pregnancy"],
        "languages": ["English", "Spanish"],
        "life_stages_served": ["expecting", "postpartum", "menopause", "adult"],
        "coordinates": {"lat": 33.7875, "lng": -117.8635},
        "website": "https://www.providence.org",
        "accepts_medi_cal": True,
        "sliding_scale": True
    },
    {
        "id": "clinic_003",
        "name": "Planned Parenthood - Orange",
        "address": "1310 N Main St, Santa Ana, CA 92701",
        "phone": "(800) 576-5544",
        "services": ["Women's Health", "Blood Pressure Screening", "Health Education", "Family Planning", "STI Testing"],
        "languages": ["English", "Spanish", "Tagalog"],
        "life_stages_served": ["teen", "adult", "expecting"],
        "coordinates": {"lat": 33.7573, "lng": -117.8674},
        "website": "https://www.plannedparenthood.org",
        "accepts_medi_cal": True,
        "sliding_scale": True
    },
    {
        "id": "clinic_004",
        "name": "UCI Health Women's Heart Health Center",
        "address": "101 The City Dr S, Orange, CA 92868",
        "phone": "(714) 456-7000",
        "services": ["Cardiovascular Health", "Heart Disease Prevention", "Cardiac Rehabilitation", "Women's Heart Health"],
        "languages": ["English", "Spanish", "Korean"],
        "life_stages_served": ["adult", "menopause", "postpartum"],
        "coordinates": {"lat": 33.7885, "lng": -117.8729},
        "website": "https://www.ucihealth.org",
        "accepts_medi_cal": True,
        "sliding_scale": False
    }
]

SUPPORT_GROUPS_DB: List[dict] = [
    {
        "id": "group_001",
        "name": "Postpartum Support International - OC Chapter",
        "type": "Postpartum Depression & Anxiety",
        "description": "Weekly support group for new mothers experiencing postpartum mood disorders",
        "schedule": "Every Tuesday, 6:00 PM - 7:30 PM",
        "location": "Virtual & In-Person (Irvine, CA)",
        "contact": "(800) 944-4773",
        "website": "https://www.postpartumhelp.com",
        "virtual_available": True,
        "language": ["English", "Spanish"],
        "life_stages": ["postpartum"]
    },
    {
        "id": "group_002",
        "name": "Mamas Latinas - Grupo de Apoyo",
        "type": "Spanish-Speaking Maternal Support",
        "description": "Apoyo para madres latinas durante el embarazo y posparto",
        "schedule": "Every Thursday, 5:00 PM - 6:30 PM",
        "location": "Santa Ana Community Center, Santa Ana, CA",
        "contact": "(714) 647-5400",
        "website": "https://www.mamaslatinas.org",
        "virtual_available": False,
        "language": ["Spanish"],
        "life_stages": ["expecting", "postpartum"]
    },
    {
        "id": "group_003",
        "name": "Heart Health for New Mothers",
        "type": "Cardiovascular Health Education",
        "description": "Educational support for mothers with pregnancy-related heart conditions",
        "schedule": "2nd and 4th Wednesday, 10:00 AM - 11:30 AM",
        "location": "Hoag Hospital, Newport Beach, CA",
        "contact": "(949) 764-4624",
        "website": "https://www.hoag.org",
        "virtual_available": True,
        "language": ["English"],
        "life_stages": ["postpartum", "expecting"]
    },
    {
        "id": "group_004",
        "name": "Women's Heart Support Network",
        "type": "Heart Disease Support",
        "description": "Support for women living with or at risk for heart disease",
        "schedule": "1st Monday, 2:00 PM - 3:30 PM",
        "location": "Virtual",
        "contact": "(877) 242-4277",
        "website": "https://www.heart.org",
        "virtual_available": True,
        "language": ["English", "Spanish"],
        "life_stages": ["adult", "menopause", "postpartum"]
    }
]

BP_SCREENING_DB: List[dict] = [
    {
        "id": "bp_001",
        "name": "CVS MinuteClinic",
        "address": "Multiple locations in Orange County",
        "hours": "Mon-Fri 9am-7pm, Sat-Sun 10am-5pm",
        "cost": "Free with insurance, $59 without",
        "website": "https://www.cvs.com/minuteclinic",
        "phone": "(800) 746-7287",
        "walk_in_available": True
    },
    {
        "id": "bp_002",
        "name": "American Heart Association - Community Screenings",
        "address": "Various locations - check website",
        "hours": "Monthly community events",
        "cost": "Free",
        "website": "https://www.heart.org",
        "phone": "(800) 242-8721",
        "walk_in_available": False
    },
    {
        "id": "bp_003",
        "name": "Orange County Health Care Agency",
        "address": "405 W 5th St, Santa Ana, CA 92701",
        "hours": "Mon-Fri 8am-5pm",
        "cost": "Free or sliding scale",
        "website": "https://www.ochealthinfo.com",
        "phone": "(714) 834-2000",
        "walk_in_available": True
    }
]

RESOURCE_LINKS_DB: List[dict] = [
    {
        "id": "res_001",
        "title": "Understanding Heart Disease in Women",
        "description": "Learn about unique symptoms and risk factors for women's heart health",
        "url": "https://www.goredforwomen.org/en/about-heart-disease-in-women",
        "category": "article",
        "language": "English",
        "life_stages": ["teen", "adult", "expecting", "postpartum", "menopause"],
        "risk_levels": ["low", "moderate", "high"]
    },
    {
        "id": "res_002",
        "title": "Postpartum Preeclampsia: Signs & Treatment",
        "description": "Video guide for recognizing postpartum complications (English/Spanish)",
        "url": "https://www.preeclampsia.org/postpartum",
        "category": "video",
        "language": "English/Spanish",
        "life_stages": ["postpartum"],
        "risk_levels": ["moderate", "high"]
    },
    {
        "id": "res_003",
        "title": "DASH Diet Meal Plan for Heart Health",
        "description": "7-day meal plan and grocery list for managing blood pressure",
        "url": "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/dash-diet",
        "category": "guide",
        "language": "English",
        "life_stages": ["adult", "postpartum", "menopause"],
        "risk_levels": ["moderate", "high"]
    },
    {
        "id": "res_004",
        "title": "Hispanic Women & Heart Health",
        "description": "Bilingual guide for the Hispanic/Latina community",
        "url": "https://www.nhlbi.nih.gov/health/heart-truth/hispanic-women",
        "category": "article",
        "language": "English/Spanish",
        "life_stages": ["adult", "postpartum", "menopause"],
        "risk_levels": ["low", "moderate", "high"]
    },
    {
        "id": "res_005",
        "title": "Self-Advocacy Toolkit for Women",
        "description": "How to speak up for your heart health at doctor's appointments",
        "url": "https://www.womenshealth.gov/heart-health",
        "category": "guide",
        "language": "English",
        "life_stages": ["teen", "adult", "expecting", "postpartum", "menopause"],
        "risk_levels": ["low", "moderate", "high"]
    }
]

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in miles using Haversine formula."""
    R = 3959
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

def get_coordinates_from_zip(zip_code: str) -> dict:
    """Convert ZIP code to coordinates (mock implementation)."""
    # In production, use a geocoding API
    zip_coords = {
        "92627": {"lat": 33.6434, "lng": -117.8911},  # Costa Mesa
        "92626": {"lat": 33.6800, "lng": -117.9000},  # Costa Mesa
        "92868": {"lat": 33.7875, "lng": -117.8635},  # Orange
        "92701": {"lat": 33.7455, "lng": -117.8677},  # Santa Ana
        "92660": {"lat": 33.6400, "lng": -117.8700},  # Newport Beach
    }
    return zip_coords.get(zip_code, {"lat": 33.7455, "lng": -117.8677})

def query_clinics(
    life_stage: LifeStage,
    user_coords: dict,
    zip_code: str,
    max_distance: float = 20.0
) -> List[Clinic]:
    """Query clinics based on user's life stage and location."""
    results = []
    
    for clinic in CLINICS_DB:
        # Filter by life stage
        if life_stage not in clinic["life_stages_served"]:
            continue
        
        # Calculate distance
        clinic_coords = clinic["coordinates"]
        distance = calculate_distance(
            user_coords["lat"], user_coords["lng"],
            clinic_coords["lat"], clinic_coords["lng"]
        )
        
        if distance <= max_distance:
            results.append(Clinic(
                id=clinic["id"],
                name=clinic["name"],
                address=clinic["address"],
                phone=clinic["phone"],
                distance=f"{distance:.1f} miles",
                distance_miles=distance,
                services=clinic["services"],
                languages=clinic["languages"],
                life_stages_served=clinic["life_stages_served"],
                coordinates=clinic["coordinates"],
                website=clinic["website"],
                google_maps_url=f"https://maps.google.com/?q={clinic['address'].replace(' ', '+')}",
                accepts_medi_cal=clinic.get("accepts_medi_cal", True),
                sliding_scale=clinic.get("sliding_scale", True)
            ))
    
    # Sort by distance
    results.sort(key=lambda x: x.distance_miles)
    return results

def query_support_groups(
    life_stage: LifeStage,
    language: str = "English"
) -> List[SupportGroup]:
    """Query support groups based on user's life stage."""
    results = []
    
    for group in SUPPORT_GROUPS_DB:
        if life_stage not in group["life_stages"]:
            continue
        
        # Check language preference
        if language not in group["language"] and "English" not in group["language"]:
            # If language not available, still include if English is available
            if "English" not in group["language"]:
                continue
        
        results.append(SupportGroup(
            id=group["id"],
            name=group["name"],
            type=group["type"],
            description=group["description"],
            schedule=group["schedule"],
            location=group["location"],
            contact=group["contact"],
            website=group.get("website"),
            virtual_available=group.get("virtual_available", True),
            language=group["language"],
            life_stages=group["life_stages"]
        ))
    
    return results

def query_resource_links(
    life_stage: LifeStage,
    risk_level: RiskLevel,
    language: str = "English"
) -> List[ResourceLink]:
    """Query educational resources based on user's profile."""
    results = []
    
    for resource in RESOURCE_LINKS_DB:
        # Check life stage relevance
        if life_stage not in resource["life_stages"]:
            continue
        
        # Check risk level relevance
        if risk_level not in resource["risk_levels"]:
            continue
        
        results.append(ResourceLink(
            id=resource["id"],
            title=resource["title"],
            description=resource["description"],
            url=resource["url"],
            category=resource["category"],
            language=resource["language"],
            life_stages=resource["life_stages"],
            risk_levels=resource["risk_levels"]
        ))
    
    return results

def get_bp_screening_locations() -> List[BPScreeningLocation]:
    """Get all BP screening locations."""
    return [
        BPScreeningLocation(
            id=loc["id"],
            name=loc["name"],
            address=loc["address"],
            hours=loc["hours"],
            cost=loc["cost"],
            website=loc["website"],
            phone=loc.get("phone"),
            walk_in_available=loc.get("walk_in_available", True)
        )
        for loc in BP_SCREENING_DB
    ]