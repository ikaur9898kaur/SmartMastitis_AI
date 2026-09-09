import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field

# Auth
class LoginRequest(BaseModel):
    username_or_email: str
    password: str
    role: Optional[str] = None
    farm_id: Optional[str] = "FARM001"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str
    farm_id: str

class UserProfile(BaseModel):
    user_id: str
    email: str
    full_name: str
    role: str
    farm_id: str

# Animal
class AnimalBase(BaseModel):
    animal_id: str
    tag_number: str
    rfid_id: Optional[str] = None
    species: str
    breed: str
    age_years: float
    sex: str = "Female"
    weight_kg: float
    body_condition_score: float
    lactation_number: int
    days_in_lactation: int
    pregnancy_status: str
    current_milk_yield: float
    previous_mastitis: bool
    previous_mastitis_count: int
    current_treatment: bool
    vaccination_status: str
    current_mastitis_risk: str
    risk_probability: float
    prediction_window: str = "Next 7–14 days"
    farm_zone: str = "Zone A"
    shed: str = "Shed 1"
    pen: str = "Pen 1"

class AnimalListItem(AnimalBase):
    id: int
    last_updated: Optional[datetime.datetime] = None

class BaselineMetrics(BaseModel):
    animal_id: str
    baseline_activity: float
    baseline_rumination: float
    baseline_milk_yield: float
    baseline_conductivity: float
    baseline_ph: float
    baseline_surface_temp: float
    baseline_scc: int
    calculated_days: int = 14

class DeviationMetrics(BaseModel):
    metric: str
    current: float
    baseline: float
    absolute_change: float
    percentage_change: float
    status: str # "Normal", "Elevated", "Decreased", "Critical"
    source: str # "Smart Collar", "Milk Sensor", "Laboratory", etc.

# Predictions & Explainable AI
class ExplanationFactor(BaseModel):
    feature: str
    current_value: Any
    baseline_value: Any
    change_pct: float
    impact_level: str # "High", "Moderate", "Low"
    description: str

class PredictionDetail(BaseModel):
    animal_id: str
    risk_probability: float
    risk_level: str # "NO RISK", "LOW RISK", "MODERATE RISK", "HIGH RISK", "CRITICAL RISK"
    forecast_horizon: str = "Next 7–14 days"
    model_version: str
    confidence_note: str = "Prototype UI thresholds — subject to calibration using validated field data."
    contributing_factors: List[ExplanationFactor]
    recommendations: List[str]
    forecast_progression: Optional[List[Dict[str, Any]]] = None

# IoT Payloads (Section 48)
class CollarPayload(BaseModel):
    farm_id: str = "FARM001"
    animal_id: str
    device_id: str
    timestamp: Optional[datetime.datetime] = None
    surface_temperature: float
    activity: float
    movement_frequency: float
    resting_duration: float
    rumination_estimate: float
    battery: int = 82

class MilkPayload(BaseModel):
    farm_id: str = "FARM001"
    animal_id: str
    device_id: str
    timestamp: Optional[datetime.datetime] = None
    milk_temperature: float
    conductivity: float
    ph: float
    milk_yield: float

class EnvironmentPayload(BaseModel):
    farm_id: str = "FARM001"
    device_id: str
    location: Optional[str] = "Cattle Shed 1"
    timestamp: Optional[datetime.datetime] = None
    ambient_temperature: float
    humidity: float
    air_quality: float

# Records & Management
class VaccinationCreate(BaseModel):
    animal_id: str
    vaccine_name: str
    date_administered: datetime.date
    next_due_date: datetime.date
    administered_by: str
    user_role: str = "Veterinarian"
    batch_number: Optional[str] = None
    remarks: Optional[str] = None

class TreatmentCreate(BaseModel):
    animal_id: str
    condition: str
    diagnosis_date: datetime.date
    treatment_details: str
    medicine_name: str
    dosage: str = "Standard veterinary protocol"
    start_date: datetime.date
    end_date: Optional[datetime.date] = None
    veterinarian: str
    withdrawal_period_days: int = 5
    treatment_outcome: str = "Ongoing"
    remarks: Optional[str] = None

class DiseaseHistoryCreate(BaseModel):
    animal_id: str
    disease_name: str
    diagnosis_date: datetime.date
    status: str = "Confirmed"
    evidence: str
    treatment: Optional[str] = None
    outcome: str = "Recovered"
    remarks: Optional[str] = None

class FeedingRecordCreate(BaseModel):
    animal_id: str
    date: datetime.date
    green_fodder: float
    dry_fodder: float
    concentrate: float
    silage: float
    mineral_mixture: float
    feed_intake_status: str = "Normal"
    water_intake_status: str = "Normal"
    appetite: str = "Normal"
    body_condition_score: float = 3.25
    weight_kg: float = 450.0

class MilkingSessionCreate(BaseModel):
    animal_id: str
    date: datetime.date
    session_type: str = "Morning"
    scheduled_time: str = "05:30 AM"
    actual_start: str = "05:35 AM"
    end_time: str = "05:43 AM"
    duration: float = 8.0
    milking_method: str = "Machine"
    machine_id: str = "MILK_MAC_01"
    operator_id: str = "W001"
    milk_yield: float = 7.5
    remarks: Optional[str] = None

class FarmHygieneCreate(BaseModel):
    farm_id: str = "FARM001"
    date: datetime.date
    shed_cleanliness: str
    udder_cleanliness: str
    teat_cleanliness: str
    bedding_cleanliness: str
    bedding_dryness: str
    floor_cleanliness: str
    manure_removal_frequency: str
    drainage: str
    water_trough_cleanliness: str
    milking_area_cleanliness: str
    equipment_cleanliness: str
    remarks: Optional[str] = None

class LabResultCreate(BaseModel):
    animal_id: str
    sample_date: datetime.date
    test_type: str = "SCC / Culture"
    scc: int
    cmt_result: str = "Negative"
    culture_result: str = "No bacterial growth"
    laboratory: str = "Punjab Veterinary Diagnostic Lab"
    veterinarian: str = "Dr. Ananya Verma"
    clinical_status: str = "Normal"
    remarks: Optional[str] = None

class ManualObservationCreate(BaseModel):
    animal_id: str
    date: datetime.date
    appetite: str = "Normal"
    feed_intake: str = "Normal"
    water_intake: str = "Normal"
    behaviour: str = "Alert and active"
    udder_appearance: str = "Normal"
    teat_appearance: str = "Normal"
    milk_appearance: str = "Normal"
    pain_discomfort: str = "None observed"
    body_condition: float = 3.25
    clinical_status: str = "Normal"
    remarks: Optional[str] = None

# CAPA (Corrective and Preventive Actions)
class CAPACreate(BaseModel):
    title: str
    animal_id: Optional[str] = None
    category: str = "Milking Hygiene"  # "Milking Hygiene", "Environmental / Bedding", "Machine & Parlor", "Clinical Containment", "Worker Biosecurity", "Feed / Nutrition"
    trigger_source: str = "AI Early Warning Alert"
    severity: str = "HIGH"  # "CRITICAL", "HIGH", "MODERATE", "LOW"
    root_cause: str
    corrective_action: str
    preventive_action: str
    assigned_to: str
    target_date: datetime.date

class CAPAUpdateStatus(BaseModel):
    status: str  # "OPEN", "IN_PROGRESS", "UNDER_REVIEW", "RESOLVED"
    verification_notes: Optional[str] = None
    verified_by: Optional[str] = None

class CAPAResponse(BaseModel):
    id: int
    action_id: str
    title: str
    animal_id: Optional[str] = None
    category: str
    trigger_source: str
    severity: str
    root_cause: str
    corrective_action: str
    preventive_action: str
    assigned_to: str
    target_date: datetime.date
    status: str
    verification_notes: Optional[str] = None
    verified_by: Optional[str] = None
    created_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

