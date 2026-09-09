import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.all_models import (
    MilkingSession, MilkingHygieneRecord, WorkerHygieneRecord,
    FeedingRecord, FarmHygieneRecord, HousingRecord, Animal
)
from app.schemas.schemas import (
    FeedingRecordCreate, MilkingSessionCreate, FarmHygieneCreate
)

router = APIRouter(prefix="/api/records", tags=["Farm Management & Operations"])

# 1. Milking Management (Section 19, 20, 21, 22, 23, 24)
@router.get("/milking/sessions")
def get_milking_sessions(date: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MilkingSession)
    if date:
        query = query.filter(MilkingSession.date == datetime.datetime.strptime(date, "%Y-%m-%d").date())
    sessions = query.order_by(desc(MilkingSession.date), desc(MilkingSession.actual_start)).all()
    return [
        {
            "session_id": s.session_id,
            "animal_id": s.animal_id,
            "date": s.date.isoformat(),
            "session_type": s.session_type,
            "scheduled_time": s.scheduled_time,
            "actual_start": s.actual_start,
            "end_time": s.end_time,
            "duration": s.duration,
            "milking_method": s.milking_method,
            "machine_id": s.machine_id,
            "operator_id": s.operator_id,
            "milk_yield": s.milk_yield,
            "is_missed": s.is_missed,
            "remarks": s.remarks,
            "source": "Milking Parlor Automation & Manual Log"
        }
        for s in sessions
    ]

@router.post("/milking/sessions", status_code=status.HTTP_201_CREATED)
def record_milking_session(session_data: MilkingSessionCreate, db: Session = Depends(get_db)):
    s = MilkingSession(
        animal_id=session_data.animal_id,
        date=session_data.date,
        session_type=session_data.session_type,
        scheduled_time=session_data.scheduled_time,
        actual_start=session_data.actual_start,
        end_time=session_data.end_time,
        duration=session_data.duration,
        milking_method=session_data.milking_method,
        machine_id=session_data.machine_id,
        operator_id=session_data.operator_id,
        milk_yield=session_data.milk_yield,
        remarks=session_data.remarks
    )
    db.add(s)
    db.commit()
    return {"status": "success", "message": "Milking session recorded successfully"}

@router.get("/milking/hygiene-audits")
def get_milking_hygiene_audits(db: Session = Depends(get_db)):
    records = db.query(MilkingHygieneRecord).order_by(desc(MilkingHygieneRecord.date)).all()
    return [
        {
            "id": r.id,
            "animal_id": r.animal_id,
            "date": r.date.isoformat(),
            "udder_inspected": r.udder_inspected,
            "teats_inspected": r.teats_inspected,
            "teats_cleaned": r.teats_cleaned,
            "pre_dipping_performed": r.pre_dipping_performed,
            "teats_properly_dried": r.teats_properly_dried,
            "foremilk_checked": r.foremilk_checked,
            "separate_towel_used": r.separate_towel_used,
            "worker_washed_hands": r.worker_washed_hands,
            "gloves_used": r.gloves_used,
            "abnormal_milk_observed": r.abnormal_milk_observed,
            "abnormal_milk_type": r.abnormal_milk_type,
            "post_dipping_performed": r.post_dipping_performed,
            "teat_disinfection": r.teat_disinfection,
            "equipment_cleaned": r.equipment_cleaned,
            "equipment_sanitized": r.equipment_sanitized,
            "milk_line_cleaned": r.milk_line_cleaned,
            "abnormal_milk_separated": r.abnormal_milk_separated,
            "operator_id": r.operator_id,
            "remarks": r.remarks,
            "source": "Manual Audit — Milking Supervisor"
        }
        for r in records
    ]

@router.get("/milking/worker-hygiene")
def get_worker_hygiene(db: Session = Depends(get_db)):
    records = db.query(WorkerHygieneRecord).all()
    return [
        {
            "worker_id": r.worker_id,
            "worker_name": r.worker_name,
            "training_status": r.training_status,
            "hands_washed": r.hands_washed,
            "hand_sanitization": r.hand_sanitization,
            "gloves_used": r.gloves_used,
            "dedicated_towels": r.dedicated_towels,
            "protective_clothing": r.protective_clothing,
            "milking_hygiene_training": r.milking_hygiene_training,
            "last_training_date": r.last_training_date.isoformat() if r.last_training_date else None,
            "compliance_score": r.compliance_score,
            "inspected_by": r.inspected_by,
            "source": "Biosecurity Compliance Inspection"
        }
        for r in records
    ]

# 2. Feeding & Nutrition (Section 14)
@router.get("/feeding")
def get_feeding_records(animal_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(FeedingRecord)
    if animal_id:
        query = query.filter(FeedingRecord.animal_id == animal_id)
    records = query.order_by(desc(FeedingRecord.date)).all()
    return [
        {
            "record_id": r.record_id,
            "animal_id": r.animal_id,
            "date": r.date.isoformat(),
            "green_fodder": r.green_fodder,
            "dry_fodder": r.dry_fodder,
            "concentrate": r.concentrate,
            "silage": r.silage,
            "mineral_mixture": r.mineral_mixture,
            "feed_intake_status": r.feed_intake_status,
            "water_intake_status": r.water_intake_status,
            "appetite": r.appetite,
            "body_condition_score": r.body_condition_score,
            "weight_kg": r.weight_kg,
            "entered_by": r.entered_by,
            "source": "Manual Entry — Farmer / Nutritionist"
        }
        for r in records
    ]

@router.post("/feeding", status_code=status.HTTP_201_CREATED)
def add_feeding_record(feed_data: FeedingRecordCreate, db: Session = Depends(get_db)):
    r = FeedingRecord(
        animal_id=feed_data.animal_id,
        date=feed_data.date,
        green_fodder=feed_data.green_fodder,
        dry_fodder=feed_data.dry_fodder,
        concentrate=feed_data.concentrate,
        silage=feed_data.silage,
        mineral_mixture=feed_data.mineral_mixture,
        feed_intake_status=feed_data.feed_intake_status,
        water_intake_status=feed_data.water_intake_status,
        appetite=feed_data.appetite,
        body_condition_score=feed_data.body_condition_score,
        weight_kg=feed_data.weight_kg,
        entered_by="Farmer Ram Singh"
    )
    db.add(r)
    
    # Update animal BCS
    animal = db.query(Animal).filter(Animal.animal_id == feed_data.animal_id).first()
    if animal:
        animal.body_condition_score = feed_data.body_condition_score
        animal.weight_kg = feed_data.weight_kg
        
    db.commit()
    return {"status": "success", "message": "Feeding record logged successfully"}

# 3. Farm Hygiene (Section 17)
@router.get("/hygiene")
def get_farm_hygiene(db: Session = Depends(get_db)):
    records = db.query(FarmHygieneRecord).order_by(desc(FarmHygieneRecord.date)).all()
    return [
        {
            "record_id": r.record_id,
            "farm_id": r.farm_id,
            "date": r.date.isoformat(),
            "shed_cleanliness": r.shed_cleanliness,
            "udder_cleanliness": r.udder_cleanliness,
            "teat_cleanliness": r.teat_cleanliness,
            "bedding_cleanliness": r.bedding_cleanliness,
            "bedding_dryness": r.bedding_dryness,
            "floor_cleanliness": r.floor_cleanliness,
            "manure_removal_frequency": r.manure_removal_frequency,
            "drainage": r.drainage,
            "water_trough_cleanliness": r.water_trough_cleanliness,
            "milking_area_cleanliness": r.milking_area_cleanliness,
            "equipment_cleanliness": r.equipment_cleanliness,
            "overall_hygiene_score": r.overall_hygiene_score,
            "overall_hygiene_risk": r.overall_hygiene_risk,
            "inspected_by": r.inspected_by,
            "remarks": r.remarks,
            "source": "Farm Hygiene Audit"
        }
        for r in records
    ]

@router.post("/hygiene", status_code=status.HTTP_201_CREATED)
def add_farm_hygiene(hygiene: FarmHygieneCreate, db: Session = Depends(get_db)):
    # Calculate score based on inputs
    score_weights = {"Excellent": 100, "Good": 85, "Moderate": 65, "Poor": 40}
    vals = [
        score_weights.get(hygiene.shed_cleanliness, 75),
        score_weights.get(hygiene.udder_cleanliness, 75),
        score_weights.get(hygiene.teat_cleanliness, 75),
        score_weights.get(hygiene.bedding_cleanliness, 75),
        score_weights.get(hygiene.bedding_dryness, 75),
        score_weights.get(hygiene.floor_cleanliness, 75),
        score_weights.get(hygiene.equipment_cleanliness, 75)
    ]
    avg_score = round(sum(vals) / len(vals), 1)
    risk = "LOW" if avg_score >= 80 else ("MODERATE" if avg_score >= 65 else "HIGH")
    
    r = FarmHygieneRecord(
        farm_id=hygiene.farm_id,
        date=hygiene.date,
        shed_cleanliness=hygiene.shed_cleanliness,
        udder_cleanliness=hygiene.udder_cleanliness,
        teat_cleanliness=hygiene.teat_cleanliness,
        bedding_cleanliness=hygiene.bedding_cleanliness,
        bedding_dryness=hygiene.bedding_dryness,
        floor_cleanliness=hygiene.floor_cleanliness,
        manure_removal_frequency=hygiene.manure_removal_frequency,
        drainage=hygiene.drainage,
        water_trough_cleanliness=hygiene.water_trough_cleanliness,
        milking_area_cleanliness=hygiene.milking_area_cleanliness,
        equipment_cleanliness=hygiene.equipment_cleanliness,
        overall_hygiene_score=avg_score,
        overall_hygiene_risk=risk,
        inspected_by="Auditor / Farmer",
        remarks=hygiene.remarks
    )
    db.add(r)
    db.commit()
    return {"status": "success", "hygiene_score": avg_score, "hygiene_risk": risk}

# 4. Housing Conditions (Section 18)
@router.get("/housing")
def get_housing_records(db: Session = Depends(get_db)):
    records = db.query(HousingRecord).order_by(desc(HousingRecord.date)).all()
    return [
        {
            "id": r.id,
            "shed_name": r.shed_name,
            "housing_type": r.housing_type,
            "stall_type": r.stall_type,
            "floor_type": r.floor_type,
            "bedding_type": r.bedding_type,
            "bedding_replacement_frequency": r.bedding_replacement_frequency,
            "floor_wetness": r.floor_wetness,
            "drainage": r.drainage,
            "ventilation": r.ventilation,
            "stocking_density": r.stocking_density,
            "overcrowding": r.overcrowding,
            "shade_availability": r.shade_availability,
            "water_availability": r.water_availability,
            "heat_stress_condition": r.heat_stress_condition,
            "cow_comfort": r.cow_comfort,
            "cleaning_frequency": r.cleaning_frequency,
            "source": "Housing & Barn Management Audit"
        }
        for r in records
    ]
