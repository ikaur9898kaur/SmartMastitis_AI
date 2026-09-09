import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.all_models import (
    VaccinationRecord, DiseaseHistory, ComorbidityRecord,
    TreatmentRecord, LabResult, ManualObservation, Animal, AuditTrail
)
from app.schemas.schemas import (
    VaccinationCreate, TreatmentCreate, DiseaseHistoryCreate,
    LabResultCreate, ManualObservationCreate
)

router = APIRouter(prefix="/api/health", tags=["Animal Health & Veterinary Records"])

# 1. Vaccinations (Section 25, 26)
@router.get("/vaccinations")
def list_vaccinations(animal_id: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(VaccinationRecord)
    if animal_id:
        query = query.filter(VaccinationRecord.animal_id == animal_id)
    if status:
        query = query.filter(VaccinationRecord.status.ilike(f"%{status}%"))
    records = query.order_by(desc(VaccinationRecord.date_administered)).all()
    return [
        {
            "vaccination_id": r.vaccination_id,
            "animal_id": r.animal_id,
            "vaccine_name": r.vaccine_name,
            "date_administered": r.date_administered.isoformat(),
            "next_due_date": r.next_due_date.isoformat(),
            "administered_by": r.administered_by,
            "user_role": r.user_role,
            "batch_number": r.batch_number,
            "status": r.status,
            "remarks": r.remarks,
            "source": "Manual — Veterinarian / Authorized Farmer"
        }
        for r in records
    ]

@router.post("/vaccinations", status_code=status.HTTP_201_CREATED)
def add_vaccination_record(record: VaccinationCreate, db: Session = Depends(get_db)):
    animal = db.query(Animal).filter(Animal.animal_id == record.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail=f"Animal '{record.animal_id}' not found")
        
    v = VaccinationRecord(
        animal_id=record.animal_id,
        vaccine_name=record.vaccine_name,
        date_administered=record.date_administered,
        next_due_date=record.next_due_date,
        administered_by=record.administered_by,
        user_role=record.user_role,
        batch_number=record.batch_number,
        status="Completed",
        remarks=record.remarks
    )
    db.add(v)
    
    # Update animal status
    animal.vaccination_status = "UP TO DATE"
    
    # Audit trail
    audit = AuditTrail(
        entity_name="VaccinationRecord",
        entity_id=record.animal_id,
        action="CREATE",
        performed_by=record.administered_by,
        user_role=record.user_role,
        changes={"vaccine": record.vaccine_name, "date": record.date_administered.isoformat()}
    )
    db.add(audit)
    
    db.commit()
    return {"status": "success", "message": "Vaccination record added successfully"}

# 2. Disease History (Section 27)
@router.get("/disease-history")
def list_disease_history(animal_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(DiseaseHistory)
    if animal_id:
        query = query.filter(DiseaseHistory.animal_id == animal_id)
    records = query.order_by(desc(DiseaseHistory.diagnosis_date)).all()
    return [
        {
            "id": r.id,
            "animal_id": r.animal_id,
            "disease_name": r.disease_name,
            "diagnosis_date": r.diagnosis_date.isoformat(),
            "status": r.status,
            "evidence": r.evidence,
            "treatment": r.treatment,
            "outcome": r.outcome,
            "recorded_by": r.recorded_by,
            "remarks": r.remarks,
            "source": "Clinical Record — Veterinarian"
        }
        for r in records
    ]

@router.post("/disease-history", status_code=status.HTTP_201_CREATED)
def add_disease_history_record(record: DiseaseHistoryCreate, db: Session = Depends(get_db)):
    animal = db.query(Animal).filter(Animal.animal_id == record.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail=f"Animal '{record.animal_id}' not found")
        
    d = DiseaseHistory(
        animal_id=record.animal_id,
        disease_name=record.disease_name,
        diagnosis_date=record.diagnosis_date,
        status=record.status,
        evidence=record.evidence,
        treatment=record.treatment,
        outcome=record.outcome,
        remarks=record.remarks,
        recorded_by="Dr. Ananya Verma (Vet)"
    )
    db.add(d)
    
    # Recalculate previous mastitis count
    if "mastitis" in record.disease_name.lower():
        animal.previous_mastitis = True
        animal.previous_mastitis_count += 1
        
    db.commit()
    return {"status": "success", "message": "Disease diagnosis recorded successfully"}

# 3. Treatments (Section 29)
@router.get("/treatments")
def list_treatments(animal_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(TreatmentRecord)
    if animal_id:
        query = query.filter(TreatmentRecord.animal_id == animal_id)
    records = query.order_by(desc(TreatmentRecord.start_date)).all()
    return [
        {
            "id": r.id,
            "animal_id": r.animal_id,
            "condition": r.condition,
            "diagnosis_date": r.diagnosis_date.isoformat(),
            "treatment_details": r.treatment_details,
            "medicine_name": r.medicine_name,
            "dosage": r.dosage,
            "start_date": r.start_date.isoformat(),
            "end_date": r.end_date.isoformat() if r.end_date else None,
            "withdrawal_period_days": r.withdrawal_period_days,
            "veterinarian": r.veterinarian,
            "treatment_outcome": r.treatment_outcome,
            "remarks": r.remarks,
            "source": "Veterinary Clinical Record"
        }
        for r in records
    ]

@router.post("/treatments", status_code=status.HTTP_201_CREATED)
def add_treatment_record(record: TreatmentCreate, db: Session = Depends(get_db)):
    animal = db.query(Animal).filter(Animal.animal_id == record.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail=f"Animal '{record.animal_id}' not found")
        
    t = TreatmentRecord(
        animal_id=record.animal_id,
        condition=record.condition,
        diagnosis_date=record.diagnosis_date,
        treatment_details=record.treatment_details,
        medicine_name=record.medicine_name,
        dosage=record.dosage,
        start_date=record.start_date,
        end_date=record.end_date,
        veterinarian=record.veterinarian,
        withdrawal_period_days=record.withdrawal_period_days,
        treatment_outcome=record.treatment_outcome,
        remarks=record.remarks
    )
    db.add(t)
    animal.current_treatment = True
    db.commit()
    return {"status": "success", "message": "Treatment record created under veterinary authorization"}

# 4. Lab Results / SCC (Section 12, 49)
@router.get("/lab-results")
def list_lab_results(animal_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(LabResult)
    if animal_id:
        query = query.filter(LabResult.animal_id == animal_id)
    records = query.order_by(desc(LabResult.sample_date)).all()
    return [
        {
            "id": r.id,
            "animal_id": r.animal_id,
            "sample_date": r.sample_date.isoformat(),
            "test_type": r.test_type,
            "scc": r.scc,
            "cmt_result": r.cmt_result,
            "culture_result": r.culture_result,
            "laboratory": r.laboratory,
            "veterinarian": r.veterinarian,
            "clinical_status": r.clinical_status,
            "remarks": r.remarks,
            "source": "Laboratory / Reference Data"
        }
        for r in records
    ]

@router.post("/lab-results", status_code=status.HTTP_201_CREATED)
def add_lab_result(record: LabResultCreate, db: Session = Depends(get_db)):
    l = LabResult(
        animal_id=record.animal_id,
        sample_date=record.sample_date,
        test_type=record.test_type,
        scc=record.scc,
        cmt_result=record.cmt_result,
        culture_result=record.culture_result,
        laboratory=record.laboratory,
        veterinarian=record.veterinarian,
        clinical_status=record.clinical_status,
        remarks=record.remarks
    )
    db.add(l)
    db.commit()
    return {"status": "success", "message": "Laboratory result recorded successfully"}

# 5. Manual Observations (Section 30)
@router.get("/observations")
def list_observations(animal_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ManualObservation)
    if animal_id:
        query = query.filter(ManualObservation.animal_id == animal_id)
    records = query.order_by(desc(ManualObservation.date)).all()
    return [
        {
            "id": r.id,
            "animal_id": r.animal_id,
            "date": r.date.isoformat(),
            "appetite": r.appetite,
            "feed_intake": r.feed_intake,
            "water_intake": r.water_intake,
            "behaviour": r.behaviour,
            "udder_appearance": r.udder_appearance,
            "teat_appearance": r.teat_appearance,
            "milk_appearance": r.milk_appearance,
            "pain_discomfort": r.pain_discomfort,
            "body_condition": r.body_condition,
            "clinical_status": r.clinical_status,
            "entered_by": r.entered_by,
            "remarks": r.remarks,
            "source": "Manual Observation — Farmer / Vet"
        }
        for r in records
    ]

@router.post("/observations", status_code=status.HTTP_201_CREATED)
def add_manual_observation(record: ManualObservationCreate, db: Session = Depends(get_db)):
    obs = ManualObservation(
        animal_id=record.animal_id,
        date=record.date,
        appetite=record.appetite,
        feed_intake=record.feed_intake,
        water_intake=record.water_intake,
        behaviour=record.behaviour,
        udder_appearance=record.udder_appearance,
        teat_appearance=record.teat_appearance,
        milk_appearance=record.milk_appearance,
        pain_discomfort=record.pain_discomfort,
        body_condition=record.body_condition,
        clinical_status=record.clinical_status,
        entered_by="Farmer / Vet",
        remarks=record.remarks
    )
    db.add(obs)
    db.commit()
    return {"status": "success", "message": "Manual observation recorded successfully"}
