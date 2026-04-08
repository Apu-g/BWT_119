from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
import requests
import os
from datetime import datetime
from middleware.auth_middleware import get_current_user_id

router = APIRouter(prefix="/api/onboarding", tags=["Onboarding"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

class OnboardingRequest(BaseModel):
    primary_focus: str
    motivation_type: str
    preferred_slot: str
    recovery_style: str = "same_day"

FOCUS_BOOSTS = {
    "exams": 0.2,
    "projects": 0.15,
    "work": 0.15,
    "personal": 0.1,
}

MOTIVATION_WEIGHTS = {
    "study": 0.15,
    "build": 0.15,
    "exercise": 0.1,
    "chill": 0.05,
}

SLOT_WEIGHTS = {
    "morning": 0.75,
    "afternoon": 0.75,
    "evening": 0.75,
    "night": 0.75,
}

RECOVERY_MAP = {
    "postpone": "postpone_tomorrow",
    "same_day": "move_today",
    "break_smaller": "split_tasks",
}

def supabase_get(table: str, query: str = ""):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{query}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }
    response = requests.get(url, headers=headers)
    if not response.ok:
        raise HTTPException(status_code=500, detail=response.text)
    return response.json()

def supabase_post(table: str, data: dict):
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    response = requests.post(url, headers=headers, json=data)
    if not response.ok:
        raise HTTPException(status_code=500, detail=response.text)

def supabase_patch(table: str, query: str, data: dict):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{query}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    response = requests.patch(url, headers=headers, json=data)
    if not response.ok:
        raise HTTPException(status_code=500, detail=response.text)


@router.get("/status")
async def get_onboarding_status(user_id: str = Depends(get_current_user_id)):
    try:
        profiles = supabase_get("onboarding_responses", f"user_id=eq.{user_id}&select=*")
        
        if not profiles or len(profiles) == 0:
            return {
                "success": True,
                "completed": False,
                "profile": None
            }
            
        p = profiles[0]
        return {
            "success": True,
            "completed": bool(p.get("onboarding_completed")),
            "profile": {
                "primary_focus": p.get("primary_focus"),
                "motivation_type": p.get("motivation_type"),
                "preferred_slot": p.get("preferred_slot"),
                "recovery_style": p.get("recovery_style"),
                "priority_boost": p.get("priority_boost", 0),
                "motivation_weight": p.get("motivation_weight", 0),
                "slot_weight": p.get("slot_weight", 0.5),
                "repair_strategy_bias": p.get("repair_strategy_bias", "move_today"),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save")
async def save_onboarding(req: OnboardingRequest, user_id: str = Depends(get_current_user_id)):
    try:
        priority_boost = FOCUS_BOOSTS.get(req.primary_focus, 0.1)
        motivation_weight = MOTIVATION_WEIGHTS.get(req.motivation_type, 0.1)
        slot_weight = SLOT_WEIGHTS.get(req.preferred_slot, 0.5)
        repair_strategy_bias = RECOVERY_MAP.get(req.recovery_style, "move_today")
        
        onboarding_data = {
            "user_id": user_id,
            "primary_focus": req.primary_focus,
            "motivation_type": req.motivation_type,
            "preferred_slot": req.preferred_slot,
            "recovery_style": req.recovery_style or "same_day",
            "priority_boost": priority_boost,
            "motivation_weight": motivation_weight,
            "slot_weight": slot_weight,
            "repair_strategy_bias": repair_strategy_bias,
            "onboarding_completed": True,
            "updated_at": datetime.now().isoformat()
        }
        
        # Check if profile exists
        existing = supabase_get("onboarding_responses", f"user_id=eq.{user_id}&select=user_id")
        if existing and len(existing) > 0:
            supabase_patch("onboarding_responses", f"user_id=eq.{user_id}", onboarding_data)
        else:
            supabase_post("onboarding_responses", onboarding_data)
            
        # Update behavior profiles
        try:
            profiles = supabase_get("behavior_profiles", f"user_id=eq.{user_id}&select=*")
            default_weights = {"morning": 0.5, "afternoon": 0.5, "evening": 0.5, "night": 0.5}
            weights = profiles[0].get("slot_weights", default_weights) if profiles else default_weights
            
            # Boost preferred slot
            curr = weights.get(req.preferred_slot, 0.5)
            weights[req.preferred_slot] = min(0.95, curr + 0.2)
            
            if profiles and len(profiles) > 0:
                supabase_patch("behavior_profiles", f"user_id=eq.{user_id}", {
                    "slot_weights": weights,
                    "last_updated": datetime.now().isoformat()
                })
            else:
                supabase_post("behavior_profiles", {
                    "user_id": user_id,
                    "archetype": "student_balanced",
                    "slot_weights": weights,
                    "sample_count": 0
                })
        except Exception as e:
            print("Failed to update behavior profile:", e)
            
        return {
            "success": True,
            "message": "Onboarding saved successfully",
            "profile": {
                "primary_focus": req.primary_focus,
                "motivation_type": req.motivation_type,
                "preferred_slot": req.preferred_slot,
                "recovery_style": req.recovery_style,
                "priority_boost": priority_boost,
                "motivation_weight": motivation_weight,
                "slot_weight": slot_weight,
                "repair_strategy_bias": repair_strategy_bias,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
