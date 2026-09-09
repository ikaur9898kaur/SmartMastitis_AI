import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.all_models import CAPAAction
from app.schemas.schemas import CAPACreate, CAPAUpdateStatus, CAPAResponse

router = APIRouter(prefix="/api/capa", tags=["Corrective & Preventive Action (CAPA)"])

@router.get("", response_model=List[CAPAResponse])
def list_capa_actions(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    category: Optional[str] = None,
    animal_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CAPAAction)
    if status:
        query = query.filter(CAPAAction.status == status.upper())
    if severity:
        query = query.filter(CAPAAction.severity == severity.upper())
    if category:
        query = query.filter(CAPAAction.category.ilike(f"%{category}%"))
    if animal_id:
        query = query.filter(CAPAAction.animal_id == animal_id)
        
    return query.order_by(desc(CAPAAction.created_at)).all()

@router.get("/stats")
def get_capa_stats(db: Session = Depends(get_db)):
    total = db.query(CAPAAction).count()
    open_count = db.query(CAPAAction).filter(CAPAAction.status == "OPEN").count()
    in_progress_count = db.query(CAPAAction).filter(CAPAAction.status == "IN_PROGRESS").count()
    under_review_count = db.query(CAPAAction).filter(CAPAAction.status == "UNDER_REVIEW").count()
    resolved_count = db.query(CAPAAction).filter(CAPAAction.status == "RESOLVED").count()
    critical_count = db.query(CAPAAction).filter(CAPAAction.severity == "CRITICAL", CAPAAction.status != "RESOLVED").count()
    
    return {
        "total_actions": total,
        "open_actions": open_count,
        "in_progress": in_progress_count,
        "under_review": under_review_count,
        "resolved": resolved_count,
        "active_critical": critical_count,
        "resolution_rate": f"{round((resolved_count / total * 100), 1) if total > 0 else 100.0}%"
    }

@router.get("/{action_id}", response_model=CAPAResponse)
def get_capa_action(action_id: str, db: Session = Depends(get_db)):
    action = db.query(CAPAAction).filter(CAPAAction.action_id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail=f"CAPA Action '{action_id}' not found")
    return action

@router.post("", response_model=CAPAResponse, status_code=status.HTTP_201_CREATED)
def create_capa_action(payload: CAPACreate, db: Session = Depends(get_db)):
    # Generate sequential action_id
    count = db.query(CAPAAction).count() + 1
    new_action_id = f"CAPA-2026-{str(count).zfill(3)}"
    
    # Ensure uniqueness
    while db.query(CAPAAction).filter(CAPAAction.action_id == new_action_id).first():
        count += 1
        new_action_id = f"CAPA-2026-{str(count).zfill(3)}"
        
    action = CAPAAction(
        action_id=new_action_id,
        title=payload.title,
        animal_id=payload.animal_id,
        category=payload.category,
        trigger_source=payload.trigger_source,
        severity=payload.severity.upper(),
        root_cause=payload.root_cause,
        corrective_action=payload.corrective_action,
        preventive_action=payload.preventive_action,
        assigned_to=payload.assigned_to,
        target_date=payload.target_date,
        status="OPEN",
        created_at=datetime.datetime.utcnow()
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action

@router.put("/{action_id}/status", response_model=CAPAResponse)
def update_capa_status(action_id: str, payload: CAPAUpdateStatus, db: Session = Depends(get_db)):
    action = db.query(CAPAAction).filter(CAPAAction.action_id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail=f"CAPA Action '{action_id}' not found")
        
    action.status = payload.status.upper()
    if payload.verification_notes:
        action.verification_notes = payload.verification_notes
    if payload.verified_by:
        action.verified_by = payload.verified_by
        
    if action.status == "RESOLVED":
        action.resolved_at = datetime.datetime.utcnow()
    else:
        action.resolved_at = None
        
    db.commit()
    db.refresh(action)
    return action
