import os
import json
import joblib
import numpy as np
from typing import Dict, Any, List, Tuple
from app.ml.train_models import FEATURE_NAMES

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "ml_models")
MODEL_PATH = os.path.join(MODELS_DIR, "xgboost_mastitis.joblib")
METRICS_PATH = os.path.join(MODELS_DIR, "metrics.json")

_loaded_model = None

def get_model():
    global _loaded_model
    if _loaded_model is None:
        if os.path.exists(MODEL_PATH):
            _loaded_model = joblib.load(MODEL_PATH)
    return _loaded_model

def classify_risk_level(prob: float) -> str:
    """
    Categorizes risk probability into standard UI bands.
    Prototype UI thresholds — subject to calibration using validated field data.
    """
    if prob < 0.20:
        return "NO RISK"
    elif prob < 0.40:
        return "LOW RISK"
    elif prob < 0.60:
        return "MODERATE RISK"
    elif prob < 0.80:
        return "HIGH RISK"
    else:
        return "CRITICAL RISK"

def predict_animal_risk(features_dict: Dict[str, Any]) -> Dict[str, Any]:
    model = get_model()
    
    # Extract feature values in exact ordering
    feature_vector = []
    for f in FEATURE_NAMES:
        feature_vector.append(float(features_dict.get(f, 0.0)))
    
    if model is not None:
        X = np.array([feature_vector])
        prob = float(model.predict_proba(X)[0][1])
    else:
        # Heuristic fallback if model not loaded
        cond_change = features_dict.get("conductivity_change_pct", 0.0)
        yield_change = features_dict.get("milk_yield_change_pct", 0.0)
        act_change = features_dict.get("activity_change_pct", 0.0)
        prev_mast = features_dict.get("previous_mastitis", 0)
        
        base_score = 0.08
        if cond_change > 10:
            base_score += 0.25
        if yield_change < -10:
            base_score += 0.20
        if act_change < -20:
            base_score += 0.20
        if prev_mast:
            base_score += 0.15
        prob = min(max(base_score, 0.05), 0.95)
        
    risk_level = classify_risk_level(prob)
    
    # Compute Explainable AI Contributing Factors
    contributing_factors = []
    
    # 1. Milk Conductivity
    cond_change = features_dict.get("conductivity_change_pct", 0.0)
    cond_val = features_dict.get("conductivity", 5.2)
    if cond_change >= 8.0:
        contributing_factors.append({
            "feature": "Milk Conductivity",
            "current_value": f"{cond_val:.1f} mS/cm",
            "baseline_value": f"{features_dict.get('baseline_conductivity', 5.2):.1f} mS/cm",
            "change_pct": round(cond_change, 1),
            "impact_level": "High" if cond_change >= 15 else "Moderate",
            "description": f"Milk conductivity increased {cond_change:+.1f}% above individual baseline"
        })
        
    # 2. Milk Yield
    yield_change = features_dict.get("milk_yield_change_pct", 0.0)
    yield_val = features_dict.get("milk_yield", 4.2)
    if yield_change <= -10.0:
        contributing_factors.append({
            "feature": "Milk Yield",
            "current_value": f"{yield_val:.1f} kg/session",
            "baseline_value": f"{features_dict.get('baseline_milk_yield', 4.2):.1f} kg/session",
            "change_pct": round(yield_change, 1),
            "impact_level": "High" if yield_change <= -18 else "Moderate",
            "description": f"Milk yield decreased {abs(yield_change):.1f}% below individual baseline"
        })
        
    # 3. Activity Level
    act_change = features_dict.get("activity_change_pct", 0.0)
    act_val = features_dict.get("activity", 68.0)
    if act_change <= -15.0:
        contributing_factors.append({
            "feature": "Collar Activity",
            "current_value": f"{int(act_val)}/100",
            "baseline_value": f"{int(features_dict.get('baseline_activity', 68))}/100",
            "change_pct": round(act_change, 1),
            "impact_level": "High" if act_change <= -30 else "Moderate",
            "description": f"Collar activity decreased {abs(act_change):.1f}% below individual baseline"
        })
        
    # 4. Rumination Duration
    rum_change = features_dict.get("rumination_change_pct", 0.0)
    rum_val = features_dict.get("rumination_minutes", 510.0)
    if rum_change <= -10.0:
        contributing_factors.append({
            "feature": "Rumination Duration",
            "current_value": f"{int(rum_val)} min/day",
            "baseline_value": f"{int(features_dict.get('baseline_rumination', 510))} min/day",
            "change_pct": round(rum_change, 1),
            "impact_level": "Moderate",
            "description": f"Estimated rumination decreased {abs(rum_change):.1f}% below baseline"
        })
        
    # 5. Previous Mastitis
    if features_dict.get("previous_mastitis", 0) == 1:
        cnt = int(features_dict.get("previous_mastitis_count", 1))
        contributing_factors.append({
            "feature": "Disease History",
            "current_value": f"{cnt} prior episodes",
            "baseline_value": "0 episodes",
            "change_pct": 100.0,
            "impact_level": "Moderate",
            "description": f"Previous history of mastitis ({cnt} confirmed prior episode{'s' if cnt > 1 else ''})"
        })
        
    # 6. Farm / Bedding Hygiene
    hygiene_score = features_dict.get("hygiene_score", 85.0)
    if hygiene_score < 70.0:
        contributing_factors.append({
            "feature": "Shed & Bedding Hygiene",
            "current_value": f"{hygiene_score:.0f}/100",
            "baseline_value": "85/100 standard",
            "change_pct": round(hygiene_score - 85.0, 1),
            "impact_level": "Moderate",
            "description": "Suboptimal bedding dryness and floor cleanliness score"
        })
        
    # Generate Contextual Decision-Support Recommendations
    recommendations = []
    if risk_level in ["HIGH RISK", "CRITICAL RISK"]:
        recommendations.append("Prioritize this animal for physical inspection and veterinary assessment.")
        if cond_change >= 8.0:
            recommendations.append("Monitor milk measurements and verify the animal using an appropriate field mastitis test (e.g. CMT or electrical conductivity check).")
        if act_change <= -15.0 or rum_change <= -10.0:
            recommendations.append("Observe animal behaviour, feeding and resting patterns in the shed.")
        if hygiene_score < 75.0:
            recommendations.append("Improve bedding dryness, udder cleaning, and milking-area sanitation.")
    elif risk_level == "MODERATE RISK":
        recommendations.append("Increase monitoring frequency during the next 7–14 days.")
        recommendations.append("Ensure proper pre-milking teat cleaning, pre-dipping, and complete drying with dedicated towels.")
        recommendations.append("Verify water availability and inspect cow comfort in the stall.")
    elif risk_level == "LOW RISK":
        recommendations.append("Maintain routine sensor telemetry monitoring and standard milking hygiene.")
    else: # NO RISK
        recommendations.append("No significant abnormal deviation detected from the animal's individual baseline.")
        recommendations.append("Continue routine monitoring and good farm management practices.")
        
    return {
        "risk_probability": round(prob, 2),
        "risk_level": risk_level,
        "forecast_horizon": "Next 7–14 days",
        "model_version": "XGBoost-v1.4.2",
        "contributing_factors": contributing_factors,
        "recommendations": recommendations,
        "confidence_note": "Prototype UI thresholds — subject to calibration using validated field data."
    }
