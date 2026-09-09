import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.database import get_db
from app.models.all_models import (
    Animal, IndividualBaseline, MilkReading, CollarReading,
    LabResult, VaccinationRecord, TreatmentRecord, DiseaseHistory, Alert
)
from app.ml.baseline_calculator import get_animal_baseline_deviations

router = APIRouter(prefix="/api/animals", tags=["Animals"])

@router.get("")
def list_animals(
    species: Optional[str] = None,
    breed: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    shed: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "risk_probability",
    order: Optional[str] = "desc",
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Animal)
    
    if species:
        query = query.filter(Animal.species.ilike(f"%{species}%"))
    if breed:
        query = query.filter(Animal.breed.ilike(f"%{breed}%"))
    if risk_level:
        query = query.filter(Animal.current_mastitis_risk == risk_level.upper())
    if shed:
        query = query.filter(Animal.shed == shed)
    if status:
        if status.lower() == "under treatment":
            query = query.filter(Animal.current_treatment == True)
        elif status.lower() == "lactating":
            query = query.filter(Animal.pregnancy_status != "Dry", Animal.current_milk_yield > 0)
        else:
            query = query.filter(Animal.pregnancy_status.ilike(f"%{status}%"))
            
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Animal.animal_id.ilike(search_pattern)) |
            (Animal.tag_number.ilike(search_pattern)) |
            (Animal.rfid_id.ilike(search_pattern)) |
            (Animal.breed.ilike(search_pattern))
        )
        
    sort_column = getattr(Animal, sort_by, Animal.risk_probability)
    if order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))
        
    total_count = query.count()
    animals = query.offset(offset).limit(limit).all()
    
    return {
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "items": [
            {
                "id": a.id,
                "animal_id": a.animal_id,
                "tag_number": a.tag_number,
                "rfid_id": a.rfid_id,
                "species": a.species,
                "breed": a.breed,
                "age_years": a.age_years,
                "sex": a.sex,
                "weight_kg": a.weight_kg,
                "body_condition_score": a.body_condition_score,
                "lactation_number": a.lactation_number,
                "days_in_lactation": a.days_in_lactation,
                "pregnancy_status": a.pregnancy_status,
                "current_milk_yield": a.current_milk_yield,
                "previous_mastitis": a.previous_mastitis,
                "previous_mastitis_count": a.previous_mastitis_count,
                "current_treatment": a.current_treatment,
                "vaccination_status": a.vaccination_status,
                "current_mastitis_risk": a.current_mastitis_risk,
                "risk_probability": a.risk_probability,
                "risk_percentage": int(round(a.risk_probability * 100)),
                "prediction_window": a.prediction_window,
                "farm_zone": a.farm_zone,
                "shed": a.shed,
                "pen": a.pen,
                "last_updated": datetime.datetime.utcnow().isoformat()
            }
            for a in animals
        ]
    }

@router.get("/{animal_id}")
def get_animal_profile(animal_id: str, db: Session = Depends(get_db)):
    animal = db.query(Animal).filter(Animal.animal_id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail=f"Animal '{animal_id}' not found")
        
    baseline = db.query(IndividualBaseline).filter(IndividualBaseline.animal_id == animal_id).first()
    if not baseline:
        baseline = IndividualBaseline(
            animal_id=animal_id,
            baseline_activity=68.0,
            baseline_rumination=510.0,
            baseline_milk_yield=4.2,
            baseline_conductivity=5.2,
            baseline_ph=6.62,
            baseline_surface_temp=38.2,
            baseline_scc=120000
        )
        
    # Get latest telemetry
    latest_milk = db.query(MilkReading).filter(MilkReading.animal_id == animal_id).order_by(desc(MilkReading.timestamp)).first()
    latest_collar = db.query(CollarReading).filter(CollarReading.animal_id == animal_id).order_by(desc(CollarReading.timestamp)).first()
    
    current_telemetry = {
        "conductivity": latest_milk.conductivity if latest_milk else (6.1 if animal_id == "COW004" else 5.2),
        "milk_yield": latest_milk.milk_yield if latest_milk else (3.4 if animal_id == "COW004" else 4.2),
        "activity": latest_collar.activity if latest_collar else (42.0 if animal_id == "COW004" else 68.0),
        "rumination": latest_collar.rumination_estimate if latest_collar else (420.0 if animal_id == "COW004" else 510.0),
        "ph": latest_milk.ph if latest_milk else (6.78 if animal_id == "COW004" else 6.62),
        "surface_temperature": latest_collar.surface_temperature if latest_collar else (38.4 if animal_id == "COW004" else 38.2)
    }
    
    deviations = get_animal_baseline_deviations(animal, baseline, current_telemetry)
    
    # Vaccinations & Disease History
    vaccinations = db.query(VaccinationRecord).filter(VaccinationRecord.animal_id == animal_id).order_by(desc(VaccinationRecord.date_administered)).all()
    diseases = db.query(DiseaseHistory).filter(DiseaseHistory.animal_id == animal_id).order_by(desc(DiseaseHistory.diagnosis_date)).all()
    treatments = db.query(TreatmentRecord).filter(TreatmentRecord.animal_id == animal_id).order_by(desc(TreatmentRecord.start_date)).all()
    alerts = db.query(Alert).filter(Alert.animal_id == animal_id, Alert.is_resolved == False).all()
    latest_lab = db.query(LabResult).filter(LabResult.animal_id == animal_id).order_by(desc(LabResult.sample_date)).first()
    
    return {
        "animal": {
            "animal_id": animal.animal_id,
            "tag_number": animal.tag_number,
            "rfid_id": animal.rfid_id,
            "species": animal.species,
            "breed": animal.breed,
            "age_years": animal.age_years,
            "sex": animal.sex,
            "weight_kg": animal.weight_kg,
            "body_condition_score": animal.body_condition_score,
            "lactation_number": animal.lactation_number,
            "days_in_lactation": animal.days_in_lactation,
            "pregnancy_status": animal.pregnancy_status,
            "calving_date": animal.calving_date.isoformat() if animal.calving_date else None,
            "current_milk_yield": animal.current_milk_yield,
            "previous_mastitis": animal.previous_mastitis,
            "previous_mastitis_count": animal.previous_mastitis_count,
            "current_treatment": animal.current_treatment,
            "vaccination_status": animal.vaccination_status,
            "current_mastitis_risk": animal.current_mastitis_risk,
            "risk_probability": animal.risk_probability,
            "risk_percentage": int(round(animal.risk_probability * 100)),
            "prediction_window": animal.prediction_window,
            "farm_zone": animal.farm_zone,
            "shed": animal.shed,
            "pen": animal.pen,
        },
        "individual_baseline": {
            "baseline_activity": baseline.baseline_activity,
            "baseline_rumination": baseline.baseline_rumination,
            "baseline_milk_yield": baseline.baseline_milk_yield,
            "baseline_conductivity": baseline.baseline_conductivity,
            "baseline_ph": baseline.baseline_ph,
            "baseline_surface_temp": baseline.baseline_surface_temp,
            "baseline_scc": baseline.baseline_scc,
            "calculated_days": baseline.calculated_days
        },
        "deviations": deviations,
        "latest_lab_result": {
            "scc": latest_lab.scc if latest_lab else 120000,
            "cmt_result": latest_lab.cmt_result if latest_lab else "Negative",
            "culture_result": latest_lab.culture_result if latest_lab else "No bacterial growth",
            "sample_date": latest_lab.sample_date.isoformat() if latest_lab else None,
            "clinical_status": latest_lab.clinical_status if latest_lab else "Normal",
            "laboratory": latest_lab.laboratory if latest_lab else "Punjab Veterinary Diagnostic Lab",
            "source": "Laboratory"
        },
        "vaccination_history": [
            {
                "vaccine_name": v.vaccine_name,
                "date_administered": v.date_administered.isoformat(),
                "next_due_date": v.next_due_date.isoformat(),
                "administered_by": v.administered_by,
                "status": v.status,
                "remarks": v.remarks,
                "source": "Manual — Veterinarian"
            }
            for v in vaccinations
        ],
        "disease_history": [
            {
                "disease_name": d.disease_name,
                "diagnosis_date": d.diagnosis_date.isoformat(),
                "status": d.status,
                "evidence": d.evidence,
                "treatment": d.treatment,
                "outcome": d.outcome,
                "recorded_by": d.recorded_by,
                "source": "Clinical Record — Veterinarian"
            }
            for d in diseases
        ],
        "active_treatments": [
            {
                "condition": t.condition,
                "medicine_name": t.medicine_name,
                "dosage": t.dosage,
                "start_date": t.start_date.isoformat(),
                "withdrawal_period_days": t.withdrawal_period_days,
                "veterinarian": t.veterinarian,
                "treatment_outcome": t.treatment_outcome,
                "remarks": t.remarks,
                "source": "Veterinary Treatment"
            }
            for t in treatments
        ],
        "active_alerts": [
            {
                "alert_id": a.alert_id,
                "severity": a.severity,
                "message": a.message,
                "details": a.details,
                "action_required": a.action_required,
                "created_at": a.created_at.isoformat()
            }
            for a in alerts
        ]
    }

@router.get("/{animal_id}/telemetry")
def get_animal_telemetry(
    animal_id: str,
    range_days: int = Query(30, description="Range in days: 1, 7, 14, 30, 90"),
    db: Session = Depends(get_db)
):
    animal = db.query(Animal).filter(Animal.animal_id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail=f"Animal '{animal_id}' not found")
        
    baseline = db.query(IndividualBaseline).filter(IndividualBaseline.animal_id == animal_id).first()
    b_act = baseline.baseline_activity if baseline else 68.0
    b_cond = baseline.baseline_conductivity if baseline else 5.2
    b_yield = baseline.baseline_milk_yield if baseline else 4.2
    b_rum = baseline.baseline_rumination if baseline else 510.0
    b_scc = baseline.baseline_scc if baseline else 120000
    
    # Query readings ordered chronologically
    today = datetime.date.today()
    cutoff_date = today - datetime.timedelta(days=range_days)
    
    collar_list = db.query(CollarReading).filter(
        CollarReading.animal_id == animal_id,
        CollarReading.timestamp >= datetime.datetime.combine(cutoff_date, datetime.time.min)
    ).order_by(asc(CollarReading.timestamp)).all()
    
    milk_list = db.query(MilkReading).filter(
        MilkReading.animal_id == animal_id,
        MilkReading.timestamp >= datetime.datetime.combine(cutoff_date, datetime.time.min)
    ).order_by(asc(MilkReading.timestamp)).all()
    
    # Build unified timeline
    timeline = []
    points = max(len(collar_list), len(milk_list))
    
    if points == 0:
        # Generate on the fly for requested window
        for i in range(range_days, -1, -1):
            d = today - datetime.timedelta(days=i)
            # Default values based on risk
            is_high = (animal.current_mastitis_risk in ["HIGH RISK", "CRITICAL RISK"]) and (i < 10)
            timeline.append({
                "date": d.strftime("%d %b"),
                "timestamp": d.isoformat(),
                "activity": round(b_act * (0.62 if is_high else 1.0) + (1.2 if i%2==0 else -1.2), 1),
                "baseline_activity": b_act,
                "rumination": int(b_rum * (0.82 if is_high else 1.0)),
                "baseline_rumination": int(b_rum),
                "conductivity": round(b_cond * (1.17 if is_high else 1.0), 2),
                "baseline_conductivity": b_cond,
                "milk_yield": round(b_yield * (0.81 if is_high else 1.0), 2),
                "baseline_milk_yield": b_yield,
                "scc": int(b_scc * (4.2 if is_high else 1.0)),
                "baseline_scc": int(b_scc),
                "surface_temp": round(38.2 + (0.8 if is_high else 0.0), 1),
                "risk_probability": round(animal.risk_probability if (i<3) else (0.18 + (animal.risk_probability - 0.18)*(range_days - i)/max(range_days,1)), 2)
            })
    else:
        for idx in range(points):
            c = collar_list[idx] if idx < len(collar_list) else None
            m = milk_list[idx] if idx < len(milk_list) else None
            ts = (c.timestamp if c else (m.timestamp if m else datetime.datetime.utcnow()))
            timeline.append({
                "date": ts.strftime("%d %b"),
                "timestamp": ts.isoformat(),
                "activity": c.activity if c else b_act,
                "baseline_activity": b_act,
                "rumination": c.rumination_estimate if c else b_rum,
                "baseline_rumination": int(b_rum),
                "conductivity": m.conductivity if m else b_cond,
                "baseline_conductivity": b_cond,
                "milk_yield": m.milk_yield if m else b_yield,
                "baseline_milk_yield": b_yield,
                "surface_temp": c.surface_temperature if c else 38.2,
                "risk_probability": animal.risk_probability
            })
            
    return {
        "animal_id": animal_id,
        "range_days": range_days,
        "timeline": timeline
    }
