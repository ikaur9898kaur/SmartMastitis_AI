import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    mobile = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(30), nullable=False)  # "farmer", "veterinarian", "admin", "field_personnel"
    farm_id = Column(String(50), default="FARM001")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Farm(Base):
    __tablename__ = "farms"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    latitude = Column(Float, default=30.9010)
    longitude = Column(Float, default=75.8573)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Herd(Base):
    __tablename__ = "herds"
    
    id = Column(Integer, primary_key=True, index=True)
    herd_id = Column(String(50), unique=True, index=True)
    farm_id = Column(String(50), default="FARM001")
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)

class Animal(Base):
    __tablename__ = "animals"
    
    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), unique=True, index=True)  # e.g. "COW001", "COW004"
    tag_number = Column(String(50), index=True)
    rfid_id = Column(String(50), nullable=True)
    species = Column(String(30), nullable=False)  # "Cow", "Buffalo"
    breed = Column(String(50), nullable=False)    # "Sahiwal", "Holstein Friesian", "Murrah", etc.
    date_of_birth = Column(Date, nullable=True)
    age_years = Column(Float, default=4.0)
    sex = Column(String(10), default="Female")
    weight_kg = Column(Float, default=450.0)
    body_condition_score = Column(Float, default=3.25)
    lactation_number = Column(Integer, default=2)
    days_in_lactation = Column(Integer, default=90)
    pregnancy_status = Column(String(30), default="Non-Pregnant") # "Pregnant", "Non-Pregnant", "Recently Calved", "Dry"
    calving_date = Column(Date, nullable=True)
    current_milk_yield = Column(Float, default=14.5)
    previous_mastitis = Column(Boolean, default=False)
    previous_mastitis_count = Column(Integer, default=0)
    current_treatment = Column(Boolean, default=False)
    vaccination_status = Column(String(30), default="UP TO DATE") # "UP TO DATE", "DUE SOON", "OVERDUE", "UNKNOWN"
    current_mastitis_risk = Column(String(30), default="NO RISK")  # "NO RISK", "LOW RISK", "MODERATE RISK", "HIGH RISK", "CRITICAL RISK"
    risk_probability = Column(Float, default=0.08)
    prediction_window = Column(String(50), default="Next 7–14 days")
    farm_zone = Column(String(50), default="Zone A")
    shed = Column(String(50), default="Shed 1")
    pen = Column(String(50), default="Pen 1")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), unique=True, index=True)
    device_type = Column(String(50), nullable=False) # "Smart Collar", "Milk Sensing Unit", "Environment Unit"
    connected_animal_id = Column(String(50), nullable=True)
    location = Column(String(100), default="Shed 1")
    status = Column(String(30), default="ONLINE") # "ONLINE", "OFFLINE", "MAINTENANCE"
    battery = Column(Integer, default=85)
    signal_strength = Column(String(20), default="Good") # "Good", "Fair", "Weak"
    power_source = Column(String(30), default="Battery") # "Battery", "AC", "Solar"
    firmware_version = Column(String(30), default="v2.4.1")
    calibration_status = Column(String(50), default="Calibrated")
    cleaning_status = Column(String(50), default="Cleaned")
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)

class CollarReading(Base):
    __tablename__ = "collar_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(String(50), default="FARM001")
    animal_id = Column(String(50), index=True)
    device_id = Column(String(50), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    surface_temperature = Column(Float)
    activity = Column(Float)
    movement_frequency = Column(Float)
    resting_duration = Column(Float)
    inactivity_duration = Column(Float, default=0.0)
    lying_events = Column(Integer, default=8)
    standing_events = Column(Integer, default=10)
    rumination_estimate = Column(Float) # Labeled: "Estimated Rumination / Behaviour Proxy"
    battery = Column(Integer, default=82)

class MilkReading(Base):
    __tablename__ = "milk_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(String(50), default="FARM001")
    animal_id = Column(String(50), index=True)
    device_id = Column(String(50), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    session_type = Column(String(20), default="Morning") # "Morning", "Evening", "Other"
    milk_temperature = Column(Float)
    conductivity = Column(Float) # mS/cm
    ph = Column(Float)
    milk_yield = Column(Float) # kg/session

class EnvironmentReading(Base):
    __tablename__ = "environment_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(String(50), default="FARM001")
    device_id = Column(String(50), index=True)
    location = Column(String(100), default="Cattle Shed 1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    ambient_temperature = Column(Float) # °C
    humidity = Column(Float) # %
    air_quality = Column(Float) # "Air Quality / Gas Indicator" (MQ-135 index)
    heat_humidity_index = Column(Float) # THI

class FeedingRecord(Base):
    __tablename__ = "feeding_records"
    
    record_id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), index=True)
    date = Column(Date, index=True)
    green_fodder = Column(Float, default=18.0) # kg/day
    dry_fodder = Column(Float, default=6.0)    # kg/day
    concentrate = Column(Float, default=5.0)   # kg/day
    silage = Column(Float, default=8.0)        # kg/day
    mineral_mixture = Column(Float, default=100.0) # g/day
    protein_supplement = Column(Float, default=0.0)
    vitamin_supplement = Column(Float, default=0.0)
    feeding_frequency = Column(Integer, default=2)
    feeding_time = Column(String(50), default="06:00 AM, 05:00 PM")
    feed_change = Column(String(100), default="None")
    feed_refusal = Column(Float, default=0.5) # kg
    feed_intake_status = Column(String(30), default="Normal") # "Normal", "Reduced", "Increased"
    water_intake_status = Column(String(30), default="Normal")
    appetite = Column(String(30), default="Normal")
    body_condition_score = Column(Float, default=3.25)
    weight_kg = Column(Float, default=450.0)
    entered_by = Column(String(100), default="Farmer Ram Singh")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RuminationRecord(Base):
    __tablename__ = "rumination_records"
    
    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), index=True)
    date = Column(Date, index=True)
    rumination_minutes = Column(Float) # min/day
    rumination_events = Column(Integer, default=12)
    feeding_duration = Column(Float, default=240.0) # min/day
    feeding_frequency = Column(Integer, default=6)
    feed_intake_behaviour = Column(String(50), default="Normal")
    drinking_frequency = Column(Integer, default=8)
    resting_pattern = Column(String(50), default="Normal")

class MilkingSession(Base):
    __tablename__ = "milking_sessions"
    
    session_id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(String(50), default="FARM001")
    animal_id = Column(String(50), index=True)
    date = Column(Date, index=True)
    session_type = Column(String(20), default="Morning") # "Morning", "Evening"
    scheduled_time = Column(String(20), default="05:30 AM")
    actual_start = Column(String(20), default="05:35 AM")
    end_time = Column(String(20), default="05:43 AM")
    duration = Column(Float, default=8.0) # minutes
    milking_method = Column(String(30), default="Machine") # "Manual", "Machine", "Automatic"
    machine_id = Column(String(50), default="MILK_MAC_01")
    operator_id = Column(String(50), default="W001")
    milk_yield = Column(Float, default=7.5) # kg
    is_missed = Column(Boolean, default=False)
    remarks = Column(String(255), nullable=True)

class MilkingHygieneRecord(Base):
    __tablename__ = "milking_hygiene_records"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, nullable=True)
    animal_id = Column(String(50), index=True)
    date = Column(Date, index=True)
    udder_inspected = Column(Boolean, default=True)
    teats_inspected = Column(Boolean, default=True)
    teats_cleaned = Column(Boolean, default=True)
    pre_dipping_performed = Column(Boolean, default=True)
    teats_properly_dried = Column(Boolean, default=True)
    foremilk_checked = Column(Boolean, default=True)
    separate_towel_used = Column(Boolean, default=True)
    worker_washed_hands = Column(Boolean, default=True)
    gloves_used = Column(Boolean, default=True)
    abnormal_milk_observed = Column(Boolean, default=False)
    abnormal_milk_type = Column(String(30), default="Normal") # "Normal", "Watery", "Clotted", "Bloody", "Other"
    post_dipping_performed = Column(Boolean, default=True)
    teat_disinfection = Column(Boolean, default=True)
    equipment_cleaned = Column(Boolean, default=True)
    equipment_sanitized = Column(Boolean, default=True)
    milk_line_cleaned = Column(Boolean, default=True)
    abnormal_milk_separated = Column(Boolean, default=True)
    operator_id = Column(String(50), default="W001")
    remarks = Column(String(255), nullable=True)

class WorkerHygieneRecord(Base):
    __tablename__ = "worker_hygiene_records"
    
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(String(50), index=True) # e.g. "W003"
    worker_name = Column(String(100), default="Kuldeep Sharma")
    date = Column(Date, index=True)
    training_status = Column(String(50), default="Completed")
    hands_washed = Column(Boolean, default=True)
    hand_sanitization = Column(Boolean, default=True)
    gloves_used = Column(Boolean, default=True)
    dedicated_towels = Column(Boolean, default=True)
    protective_clothing = Column(Boolean, default=True)
    milking_hygiene_training = Column(String(50), default="Completed")
    last_training_date = Column(Date, nullable=True)
    compliance_score = Column(Float, default=92.0) # Percentage
    inspected_by = Column(String(100), default="Farm Admin")

class HousingRecord(Base):
    __tablename__ = "housing_records"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(String(50), default="FARM001")
    shed_name = Column(String(50), default="Shed 1")
    date = Column(Date, index=True)
    housing_type = Column(String(50), default="Loose Housing")
    stall_type = Column(String(50), default="Free Stall")
    floor_type = Column(String(50), default="Concrete")
    bedding_type = Column(String(50), default="Straw")
    bedding_replacement_frequency = Column(String(50), default="Twice Weekly")
    floor_wetness = Column(String(30), default="Low") # "Low", "Moderate", "High"
    drainage = Column(String(30), default="Good")     # "Excellent", "Good", "Moderate", "Poor"
    ventilation = Column(String(30), default="Good")  # "Excellent", "Good", "Moderate", "Poor"
    stocking_density = Column(Float, default=1.1)     # animal / m2
    overcrowding = Column(Boolean, default=False)
    shade_availability = Column(Boolean, default=True)
    water_availability = Column(String(30), default="Continuous")
    heat_stress_condition = Column(String(30), default="Low")
    cow_comfort = Column(String(30), default="Good")
    cleaning_frequency = Column(String(50), default="Daily")

class FarmHygieneRecord(Base):
    __tablename__ = "farm_hygiene_records"
    
    record_id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(String(50), default="FARM001")
    date = Column(Date, index=True)
    shed_cleanliness = Column(String(30), default="Good") # "Excellent", "Good", "Moderate", "Poor"
    udder_cleanliness = Column(String(30), default="Good")
    teat_cleanliness = Column(String(30), default="Good")
    bedding_cleanliness = Column(String(30), default="Good")
    bedding_dryness = Column(String(30), default="Good")
    floor_cleanliness = Column(String(30), default="Good")
    manure_removal_frequency = Column(String(50), default="Twice Daily")
    drainage = Column(String(30), default="Good")
    water_trough_cleanliness = Column(String(30), default="Good")
    milking_area_cleanliness = Column(String(30), default="Good")
    equipment_cleanliness = Column(String(30), default="Good")
    equipment_sanitation_freq = Column(String(50), default="After Every Milking")
    overall_hygiene_score = Column(Float, default=85.0) # 0 - 100
    overall_hygiene_risk = Column(String(30), default="LOW") # "LOW", "MODERATE", "HIGH"
    inspected_by = Column(String(100), default="Dr. Ananya Verma (Vet)")
    remarks = Column(String(255), nullable=True)

class VaccinationRecord(Base):
    __tablename__ = "vaccination_records"
    
    vaccination_id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), index=True)
    vaccine_name = Column(String(100), nullable=False)
    date_administered = Column(Date, nullable=False)
    next_due_date = Column(Date, nullable=False)
    administered_by = Column(String(100), nullable=False)
    user_role = Column(String(50), default="Veterinarian") # "Veterinarian", "Farmer"
    batch_number = Column(String(50), nullable=True)
    status = Column(String(30), default="Completed")
    remarks = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DiseaseHistory(Base):
    __tablename__ = "disease_history"
    
    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), index=True)
    disease_name = Column(String(100), nullable=False) # e.g. "Mastitis", "Subclinical Mastitis", "Lameness"
    diagnosis_date = Column(Date, nullable=False)
    status = Column(String(30), default="Confirmed") # "Suspected", "Confirmed", "Recovered"
    evidence = Column(String(255), default="Clinical examination / Elevated SCC")
    treatment = Column(String(255), nullable=True)
    outcome = Column(String(100), default="Recovered")
    remarks = Column(String(255), nullable=True)
    recorded_by = Column(String(100), default="Dr. Ananya Verma (Vet)")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ComorbidityRecord(Base):
    __tablename__ = "comorbidity_records"
    
    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), index=True)
    condition_name = Column(String(100), nullable=False) # "Lameness", "Metabolic Disorder", "Fever", "Udder Injury", "Teat Injury"
    diagnosis_date = Column(Date, nullable=False)
    status = Column(String(30), default="Active") # "Active", "Managed", "Resolved"
    treatment = Column(String(255), nullable=True)
    veterinarian = Column(String(100), default="Dr. Ananya Verma")
    outcome = Column(String(100), default="Under observation")
    remarks = Column(String(255), nullable=True)

class TreatmentRecord(Base):
    __tablename__ = "treatment_records"
    
    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), index=True)
    condition = Column(String(100), nullable=False)
    diagnosis_date = Column(Date, nullable=False)
    treatment_details = Column(String(255), nullable=False)
    medicine_name = Column(String(100), nullable=False)
    dosage = Column(String(100), default="Standard veterinary protocol")
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    veterinarian = Column(String(100), nullable=False)
    withdrawal_period_days = Column(Integer, default=5)
    treatment_outcome = Column(String(50), default="Ongoing") # "Ongoing", "Recovered", "Requires Follow-up"
    recovery_date = Column(Date, nullable=True)
    remarks = Column(String(255), default="Administered under direct veterinary supervision")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LabResult(Base):
    __tablename__ = "lab_results"
    
    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), index=True)
    sample_date = Column(Date, nullable=False, index=True)
    test_type = Column(String(50), default="SCC / Milk Culture")
    scc = Column(Integer, nullable=False) # cells/mL
    cmt_result = Column(String(30), default="Negative") # "Negative", "Trace", "1+", "2+", "3+"
    culture_result = Column(String(100), default="No bacterial growth")
    laboratory = Column(String(100), default="Punjab Veterinary Diagnostic Lab")
    veterinarian = Column(String(100), default="Dr. Ananya Verma")
    clinical_status = Column(String(30), default="Normal") # "Normal", "Suspected", "Confirmed", "Recovered"
    attachment_url = Column(String(255), nullable=True)
    remarks = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ManualObservation(Base):
    __tablename__ = "manual_observations"
    
    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), index=True)
    date = Column(Date, nullable=False, index=True)
    appetite = Column(String(30), default="Normal")
    feed_intake = Column(String(30), default="Normal")
    water_intake = Column(String(30), default="Normal")
    behaviour = Column(String(50), default="Alert and active")
    udder_appearance = Column(String(50), default="Normal, soft and pliable")
    teat_appearance = Column(String(50), default="Normal, intact teat ends")
    milk_appearance = Column(String(30), default="Normal") # "Normal", "Watery", "Clotted", "Bloody", "Other"
    milk_odor = Column(String(30), default="Normal")
    pain_discomfort = Column(String(50), default="None observed")
    body_condition = Column(Float, default=3.25)
    clinical_status = Column(String(30), default="Normal") # "Normal", "Suspected", "Confirmed", "Recovered"
    observer_role = Column(String(50), default="Farmer")
    entered_by = Column(String(100), default="Farmer Ram Singh")
    remarks = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class IndividualBaseline(Base):
    __tablename__ = "individual_baselines"
    
    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), unique=True, index=True)
    baseline_activity = Column(Float, default=68.0)
    baseline_rumination = Column(Float, default=510.0) # min/day
    baseline_milk_yield = Column(Float, default=4.2)   # kg/session
    baseline_conductivity = Column(Float, default=5.2) # mS/cm
    baseline_ph = Column(Float, default=6.62)
    baseline_surface_temp = Column(Float, default=38.2) # °C
    baseline_scc = Column(Integer, default=120000)
    calculated_days = Column(Integer, default=14)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Prediction(Base):
    __tablename__ = "predictions"
    
    prediction_id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    risk_probability = Column(Float, nullable=False) # e.g. 0.74
    risk_level = Column(String(30), nullable=False)  # "NO RISK", "LOW RISK", "MODERATE RISK", "HIGH RISK", "CRITICAL RISK"
    forecast_start = Column(Date, nullable=False)
    forecast_end = Column(Date, nullable=False)
    model_version = Column(String(50), default="XGBoost-v1.4.2")
    top_risk_factors = Column(JSON, nullable=True) # List of factors with contribution %
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    
    alert_id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(String(50), default="FARM001")
    animal_id = Column(String(50), nullable=True, index=True)
    alert_type = Column(String(50), nullable=False) # "High Mastitis Risk", "Critical Risk", "Sensor Offline", "Vaccination Due"
    severity = Column(String(20), default="HIGH")   # "INFO", "LOW", "MODERATE", "HIGH", "CRITICAL"
    message = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    action_required = Column(String(255), nullable=True)
    channels = Column(String(100), default="In-App, Push, SMS")
    is_resolved = Column(Boolean, default=False)
    is_acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    animal_id = Column(String(50), nullable=True, index=True)
    risk_level = Column(String(30), default="HIGH")
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default="PREVENTIVE") # "PREVENTIVE", "CORRECTIVE", "FARM_MANAGEMENT"
    priority = Column(String(20), default="High")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class GPSLocation(Base):
    __tablename__ = "gps_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(String(50), default="FARM001")
    entity_type = Column(String(50), default="Animal") # "Animal", "Shed", "Milking Station", "Sensor"
    entity_id = Column(String(50), index=True)
    zone = Column(String(50), default="Zone A")
    shed = Column(String(50), default="Shed 1")
    pen = Column(String(50), default="Pen 1")
    latitude = Column(Float, default=30.9010)
    longitude = Column(Float, default=75.8573)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False)
    algorithm = Column(String(50), default="XGBoost")
    accuracy = Column(Float, default=0.912)
    precision = Column(Float, default=0.884)
    recall = Column(Float, default=0.896)
    f1_score = Column(Float, default=0.890)
    roc_auc = Column(Float, default=0.945)
    pr_auc = Column(Float, default=0.923)
    status = Column(String(30), default="active") # "active", "candidate", "archived"
    metrics_json = Column(JSON, nullable=True)
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditTrail(Base):
    __tablename__ = "audit_trail"
    
    id = Column(Integer, primary_key=True, index=True)
    entity_name = Column(String(50), nullable=False)
    entity_id = Column(String(50), nullable=False)
    action = Column(String(30), nullable=False) # "CREATE", "UPDATE", "DELETE"
    performed_by = Column(String(100), nullable=False)
    user_role = Column(String(50), nullable=False)
    changes = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class CAPAAction(Base):
    __tablename__ = "capa_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    action_id = Column(String(50), unique=True, index=True)  # e.g. "CAPA-2026-001"
    title = Column(String(150), nullable=False)
    animal_id = Column(String(50), nullable=True, index=True)
    category = Column(String(50), nullable=False)  # "Milking Hygiene", "Environmental / Bedding", "Machine & Parlor", "Clinical Containment", "Worker Biosecurity", "Feed / Nutrition"
    trigger_source = Column(String(100), nullable=False)
    severity = Column(String(20), default="HIGH")  # "CRITICAL", "HIGH", "MODERATE", "LOW"
    root_cause = Column(Text, nullable=False)
    corrective_action = Column(Text, nullable=False)  # Immediate containment action
    preventive_action = Column(Text, nullable=False)  # Long-term systemic preventive measure
    assigned_to = Column(String(100), nullable=False)
    target_date = Column(Date, nullable=False)
    status = Column(String(30), default="OPEN")  # "OPEN", "IN_PROGRESS", "UNDER_REVIEW", "RESOLVED"
    verification_notes = Column(Text, nullable=True)
    verified_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
