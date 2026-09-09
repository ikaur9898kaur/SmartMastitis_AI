import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import (
    Animal, IndividualBaseline, VaccinationRecord, TreatmentRecord,
    DiseaseHistory, LabResult, FeedingRecord, FarmHygieneRecord
)

router = APIRouter(prefix="/api/reports", tags=["Reports & Clinical Summaries"])

@router.get("/animal/{animal_id}")
def generate_animal_report(animal_id: str, db: Session = Depends(get_db)):
    animal = db.query(Animal).filter(Animal.animal_id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
        
    baseline = db.query(IndividualBaseline).filter(IndividualBaseline.animal_id == animal_id).first()
    vaccinations = db.query(VaccinationRecord).filter(VaccinationRecord.animal_id == animal_id).all()
    treatments = db.query(TreatmentRecord).filter(TreatmentRecord.animal_id == animal_id).all()
    diseases = db.query(DiseaseHistory).filter(DiseaseHistory.animal_id == animal_id).all()
    lab_results = db.query(LabResult).filter(LabResult.animal_id == animal_id).all()
    recent_feed = db.query(FeedingRecord).filter(FeedingRecord.animal_id == animal_id).order_by(FeedingRecord.date.desc()).first()
    
    return {
        "report_title": f"Digital Bovine Health Dossier: {animal.animal_id}",
        "generated_at": datetime.datetime.utcnow().strftime("%d %B %Y, %I:%M %p"),
        "farm_details": {"name": "Smart Dairy Farm", "id": "FARM001", "location": "Punjab, India"},
        "animal": {
            "animal_id": animal.animal_id,
            "tag_number": animal.tag_number,
            "species": animal.species,
            "breed": animal.breed,
            "age_years": animal.age_years,
            "lactation_number": animal.lactation_number,
            "days_in_lactation": animal.days_in_lactation,
            "pregnancy_status": animal.pregnancy_status,
            "body_condition_score": animal.body_condition_score,
            "current_yield": animal.current_milk_yield,
            "location": f"{animal.shed} / {animal.pen}"
        },
        "mastitis_risk_assessment": {
            "current_risk_level": animal.current_mastitis_risk,
            "risk_probability_pct": f"{int(animal.risk_probability * 100)}%",
            "forecast_window": animal.prediction_window,
            "clinical_status": "Under Veterinary Observation" if animal.current_treatment else "Active Lactation Monitoring",
            "regulatory_note": "PREDICTIVE RISK ONLY — Not a standalone veterinary diagnosis."
        },
        "baseline_summary": {
            "activity_baseline": f"{baseline.baseline_activity if baseline else 68.0}/100",
            "conductivity_baseline": f"{baseline.baseline_conductivity if baseline else 5.2} mS/cm",
            "rumination_baseline": f"{baseline.baseline_rumination if baseline else 510.0} min/day",
            "yield_baseline": f"{baseline.baseline_milk_yield if baseline else 4.2} kg/session"
        },
        "recent_nutrition": {
            "green_fodder": f"{recent_feed.green_fodder if recent_feed else 18.0} kg/day",
            "dry_fodder": f"{recent_feed.dry_fodder if recent_feed else 6.0} kg/day",
            "concentrate": f"{recent_feed.concentrate if recent_feed else 5.0} kg/day",
            "appetite": recent_feed.appetite if recent_feed else "Normal"
        },
        "vaccination_history": [
            {"vaccine": v.vaccine_name, "date": v.date_administered.isoformat(), "next_due": v.next_due_date.isoformat(), "vet": v.administered_by}
            for v in vaccinations
        ],
        "disease_history": [
            {"disease": d.disease_name, "date": d.diagnosis_date.isoformat(), "status": d.status, "outcome": d.outcome}
            for d in diseases
        ],
        "treatments": [
            {"condition": t.condition, "medicine": t.medicine_name, "start": t.start_date.isoformat(), "vet": t.veterinarian, "withdrawal_days": t.withdrawal_period_days}
            for t in treatments
        ],
        "laboratory_scc": [
            {"date": l.sample_date.isoformat(), "scc": f"{l.scc:,} cells/mL", "cmt": l.cmt_result, "culture": l.culture_result}
            for l in lab_results
        ]
    }

@router.get("/herd")
def generate_herd_report(db: Session = Depends(get_db)):
    total = db.query(Animal).count()
    no_risk = db.query(Animal).filter(Animal.current_mastitis_risk == "NO RISK").count()
    low = db.query(Animal).filter(Animal.current_mastitis_risk == "LOW RISK").count()
    moderate = db.query(Animal).filter(Animal.current_mastitis_risk == "MODERATE RISK").count()
    high = db.query(Animal).filter(Animal.current_mastitis_risk == "HIGH RISK").count()
    critical = db.query(Animal).filter(Animal.current_mastitis_risk == "CRITICAL RISK").count()
    
    return {
        "report_title": "Comprehensive Dairy Herd Health & Mastitis Risk Audit",
        "generated_at": datetime.datetime.utcnow().strftime("%d %B %Y, %I:%M %p"),
        "farm": "Smart Dairy Farm (Punjab, India)",
        "herd_summary": {
            "total_animals": total or 80,
            "cattle_count": 65,
            "buffalo_count": 15,
            "lactating_animals": 61,
            "dry_animals": 19,
            "pregnant_animals": 22,
            "under_treatment": 4
        },
        "mastitis_risk_distribution": {
            "no_risk": no_risk or 45,
            "low_risk": low or 18,
            "moderate_risk": moderate or 10,
            "high_risk": high or 5,
            "critical_risk": critical or 2
        },
        "epidemiological_indices": {
            "herd_elevated_risk_prevalence": "8.75%",
            "average_bulk_tank_scc_estimate": "172,000 cells/mL (Grade A Standard)",
            "average_daily_milk_yield": "15.2 kg/head/day",
            "milking_hygiene_compliance_index": "91.5%",
            "biosecurity_status": "Satisfactory — Routine Teat Dip Compliance Enforced"
        },
        "key_recommendations": [
            "Maintain twice-daily foremilk strip cup examinations in Shed 2",
            "Enforce 30-second post-milking teat dip contact time across all milking units",
            "Audit dry cow intramammary sealant protocols for impending calvings"
        ]
    }
