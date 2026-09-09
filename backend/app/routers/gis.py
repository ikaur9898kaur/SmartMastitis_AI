from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import GPSLocation, Animal

router = APIRouter(prefix="/api/gis", tags=["GIS & Farm Risk Map"])

@router.get("/farm-map")
def get_farm_map(db: Session = Depends(get_db)):
    locations = db.query(GPSLocation).all()
    animals = db.query(Animal).all()
    animal_risk_map = {a.animal_id: (a.current_mastitis_risk, a.risk_probability, a.species, a.breed) for a in animals}
    
    sheds = []
    milking_stations = []
    animal_markers = []
    
    # Track shed risk counts to detect hotspots
    shed_risk_counts = {"Shed 1": {"high": 0, "total": 0}, "Shed 2": {"high": 0, "total": 0}, "Shed 3": {"high": 0, "total": 0}, "Shed 4": {"high": 0, "total": 0}}
    
    for loc in locations:
        if loc.entity_type == "Shed":
            sheds.append({
                "id": loc.entity_id,
                "name": loc.entity_id,
                "zone": loc.zone,
                "latitude": loc.latitude,
                "longitude": loc.longitude
            })
        elif loc.entity_type in ["Milking Station", "Isolation Pen"]:
            milking_stations.append({
                "id": loc.entity_id,
                "type": loc.entity_type,
                "name": loc.entity_id,
                "latitude": loc.latitude,
                "longitude": loc.longitude
            })
        elif loc.entity_type == "Animal":
            risk_info = animal_risk_map.get(loc.entity_id, ("NO RISK", 0.08, "Cow", "Sahiwal"))
            risk_level, prob, sp, br = risk_info
            
            # Map color
            color_map = {
                "NO RISK": "#10B981",       # Green
                "LOW RISK": "#3B82F6",      # Blue
                "MODERATE RISK": "#F59E0B", # Yellow
                "HIGH RISK": "#F97316",     # Orange
                "CRITICAL RISK": "#EF4444"  # Red
            }
            
            if loc.shed in shed_risk_counts:
                shed_risk_counts[loc.shed]["total"] += 1
                if risk_level in ["HIGH RISK", "CRITICAL RISK"]:
                    shed_risk_counts[loc.shed]["high"] += 1
            
            animal_markers.append({
                "animal_id": loc.entity_id,
                "species": sp,
                "breed": br,
                "shed": loc.shed,
                "pen": loc.pen,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "risk_level": risk_level,
                "risk_probability": prob,
                "color": color_map.get(risk_level, "#10B981")
            })
            
    # Detect hotspot
    hotspot_alert = None
    for s_name, counts in shed_risk_counts.items():
        if counts["high"] >= 2:
            hotspot_alert = {
                "hotspot_detected": True,
                "shed": s_name,
                "high_risk_count": counts["high"],
                "message": f"Elevated risk cluster detected in {s_name}",
                "recommendation": f"Inspect bedding moisture, ventilation fans, and floor drainage in {s_name}."
            }
            break
            
    if not hotspot_alert:
        hotspot_alert = {
            "hotspot_detected": False,
            "message": "No localized disease clusters detected across farm zones."
        }
            
    return {
        "farm_center": {"latitude": 30.9010, "longitude": 75.8573, "name": "Smart Dairy Farm, Punjab"},
        "sheds": sheds,
        "facilities": milking_stations,
        "animal_markers": animal_markers,
        "hotspot_analysis": hotspot_alert
    }
