from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.all_models import Alert

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Notifications"])

@router.get("")
def list_alerts(
    severity: Optional[str] = None,
    is_resolved: Optional[bool] = None,
    animal_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)
    if animal_id:
        query = query.filter(Alert.animal_id == animal_id)
    alerts = query.order_by(desc(Alert.created_at)).all()
    return [
        {
            "alert_id": a.alert_id,
            "animal_id": a.animal_id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "message": a.message,
            "details": a.details,
            "action_required": a.action_required,
            "channels": a.channels,
            "is_resolved": a.is_resolved,
            "is_acknowledged": a.is_acknowledged,
            "created_at": a.created_at.strftime("%I:%M %p, %d %b %Y"),
            "source": "AI Prediction & IoT Telemetry Monitor"
        }
        for a in alerts
    ]

@router.put("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_acknowledged = True
    db.commit()
    return {"status": "success", "message": "Alert acknowledged"}

@router.put("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_resolved = True
    db.commit()
    return {"status": "success", "message": "Alert marked as resolved"}
