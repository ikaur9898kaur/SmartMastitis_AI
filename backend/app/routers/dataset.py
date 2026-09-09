import io
import csv
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import Animal, IndividualBaseline

router = APIRouter(prefix="/api/dataset", tags=["Dataset Export & Research"])

@router.get("/export/json")
def export_dataset_json(db: Session = Depends(get_db)):
    animals = db.query(Animal).all()
    records = []
    
    for a in animals:
        is_high = a.current_mastitis_risk in ["HIGH RISK", "CRITICAL RISK"]
        rec = {
            "animal_id": a.animal_id,
            "date": "2026-09-09",
            "species": a.species,
            "breed": a.breed,
            "age": a.age_years,
            "lactation_number": a.lactation_number,
            "days_in_lactation": a.days_in_lactation,
            "previous_mastitis": 1 if a.previous_mastitis else 0,
            "vaccination_status": a.vaccination_status,
            "activity": 42.0 if is_high else 68.0,
            "activity_change": -38.0 if is_high else 0.0,
            "rumination": 420.0 if is_high else 510.0,
            "rumination_change": -15.0 if is_high else 0.0,
            "surface_temperature": 38.6 if is_high else 38.2,
            "milk_yield": 3.4 if is_high else 4.2,
            "milk_yield_change": -19.0 if is_high else 0.0,
            "conductivity": 6.1 if is_high else 5.2,
            "conductivity_change": 17.3 if is_high else 0.0,
            "ph": 6.78 if is_high else 6.62,
            "ph_change": 2.4 if is_high else 0.0,
            "milk_temperature": 37.4 if is_high else 36.7,
            "scc": 590000 if is_high else 120000,
            "scc_change": 390.0 if is_high else 0.0,
            "ambient_temperature": 31.2,
            "humidity": 78.0,
            "air_quality": 420.0,
            "feed_intake": "Reduced" if is_high else "Normal",
            "body_condition_score": a.body_condition_score,
            "hygiene_score": 68.0 if is_high else 85.0,
            "housing_score": 70.0 if is_high else 85.0,
            "milking_hygiene_score": 88.0,
            "worker_hygiene_score": 92.0,
            "mastitis_confirmed": 1 if a.current_treatment else 0,
            "mastitis_onset_date": "2026-09-05" if a.current_treatment else None
        }
        records.append(rec)
        
    return {"total_records": len(records), "dataset": records}

@router.get("/export/csv")
def export_dataset_csv(db: Session = Depends(get_db)):
    animals = db.query(Animal).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    headers = [
        "animal_id", "date", "species", "breed", "age", "lactation_number", "days_in_lactation",
        "previous_mastitis", "vaccination_status", "activity", "activity_change", "rumination",
        "rumination_change", "surface_temperature", "milk_yield", "milk_yield_change",
        "conductivity", "conductivity_change", "ph", "ph_change", "milk_temperature", "scc",
        "scc_change", "ambient_temperature", "humidity", "air_quality", "feed_intake",
        "body_condition_score", "hygiene_score", "housing_score", "milking_hygiene_score",
        "worker_hygiene_score", "mastitis_confirmed", "mastitis_onset_date"
    ]
    writer.writerow(headers)
    
    for a in animals:
        is_high = a.current_mastitis_risk in ["HIGH RISK", "CRITICAL RISK"]
        writer.writerow([
            a.animal_id, "2026-09-09", a.species, a.breed, a.age_years, a.lactation_number,
            a.days_in_lactation, 1 if a.previous_mastitis else 0, a.vaccination_status,
            42.0 if is_high else 68.0, -38.0 if is_high else 0.0, 420.0 if is_high else 510.0,
            -15.0 if is_high else 0.0, 38.6 if is_high else 38.2, 3.4 if is_high else 4.2,
            -19.0 if is_high else 0.0, 6.1 if is_high else 5.2, 17.3 if is_high else 0.0,
            6.78 if is_high else 6.62, 2.4 if is_high else 0.0, 37.4 if is_high else 36.7,
            590000 if is_high else 120000, 390.0 if is_high else 0.0, 31.2, 78.0, 420.0,
            "Reduced" if is_high else "Normal", a.body_condition_score,
            68.0 if is_high else 85.0, 70.0 if is_high else 85.0, 88.0, 92.0,
            1 if a.current_treatment else 0, "2026-09-05" if a.current_treatment else ""
        ])
        
    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=smartmastitis_training_dataset.csv"}
    )
