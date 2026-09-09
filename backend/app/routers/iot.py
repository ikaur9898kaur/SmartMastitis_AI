import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.all_models import Device, CollarReading, MilkReading, EnvironmentReading, Animal
from app.schemas.schemas import CollarPayload, MilkPayload, EnvironmentPayload

router = APIRouter(prefix="/api/iot", tags=["IoT Telemetry & Ingestion"])

@router.post("/collar", status_code=status.HTTP_201_CREATED)
def ingest_collar_telemetry(payload: CollarPayload, db: Session = Depends(get_db)):
    reading = CollarReading(
        farm_id=payload.farm_id,
        animal_id=payload.animal_id,
        device_id=payload.device_id,
        timestamp=payload.timestamp or datetime.datetime.utcnow(),
        surface_temperature=payload.surface_temperature,
        activity=payload.activity,
        movement_frequency=payload.movement_frequency,
        resting_duration=payload.resting_duration,
        rumination_estimate=payload.rumination_estimate,
        battery=payload.battery
    )
    db.add(reading)
    
    # Update device heartbeat
    dev = db.query(Device).filter(Device.device_id == payload.device_id).first()
    if dev:
        dev.battery = payload.battery
        dev.last_seen = datetime.datetime.utcnow()
        dev.status = "ONLINE"
        
    db.commit()
    return {"status": "success", "message": "Collar telemetry recorded successfully"}

@router.post("/milk", status_code=status.HTTP_201_CREATED)
def ingest_milk_telemetry(payload: MilkPayload, db: Session = Depends(get_db)):
    reading = MilkReading(
        farm_id=payload.farm_id,
        animal_id=payload.animal_id,
        device_id=payload.device_id,
        timestamp=payload.timestamp or datetime.datetime.utcnow(),
        milk_temperature=payload.milk_temperature,
        conductivity=payload.conductivity,
        ph=payload.ph,
        milk_yield=payload.milk_yield
    )
    db.add(reading)
    
    # Update animal current yield
    animal = db.query(Animal).filter(Animal.animal_id == payload.animal_id).first()
    if animal:
        animal.current_milk_yield = payload.milk_yield * 2 # est daily
        
    # Update device heartbeat
    dev = db.query(Device).filter(Device.device_id == payload.device_id).first()
    if dev:
        dev.last_seen = datetime.datetime.utcnow()
        dev.status = "ONLINE"
        
    db.commit()
    return {"status": "success", "message": "Milk sensing telemetry recorded successfully"}

@router.post("/environment", status_code=status.HTTP_201_CREATED)
def ingest_environment_telemetry(payload: EnvironmentPayload, db: Session = Depends(get_db)):
    # Calculate THI (Temperature-Humidity Index)
    t = payload.ambient_temperature
    rh = payload.humidity
    thi = round(0.8 * t + (rh / 100.0) * (t - 14.4) + 46.4, 1)
    
    reading = EnvironmentReading(
        farm_id=payload.farm_id,
        device_id=payload.device_id,
        location=payload.location or "Cattle Shed 1",
        timestamp=payload.timestamp or datetime.datetime.utcnow(),
        ambient_temperature=payload.ambient_temperature,
        humidity=payload.humidity,
        air_quality=payload.air_quality,
        heat_humidity_index=thi
    )
    db.add(reading)
    
    dev = db.query(Device).filter(Device.device_id == payload.device_id).first()
    if dev:
        dev.last_seen = datetime.datetime.utcnow()
        dev.status = "ONLINE"
        
    db.commit()
    return {"status": "success", "message": "Environment telemetry recorded successfully"}

@router.get("/devices")
def list_devices(db: Session = Depends(get_db)):
    devices = db.query(Device).all()
    return [
        {
            "device_id": d.device_id,
            "device_type": d.device_type,
            "connected_animal": d.connected_animal_id,
            "location": d.location,
            "status": d.status,
            "battery": d.battery,
            "signal_strength": d.signal_strength,
            "power_source": d.power_source,
            "firmware_version": d.firmware_version,
            "calibration_status": d.calibration_status,
            "cleaning_status": d.cleaning_status,
            "last_seen": d.last_seen.strftime("%I:%M %p, %d %b %Y") if d.last_seen else "Never"
        }
        for d in devices
    ]

@router.get("/milk-sensing-station")
def get_milk_sensing_station():
    """
    Returns hardware data flow architecture and sensor operational status (Section 13).
    """
    return {
        "device_id": "MILK001",
        "station": "Milking Station 1",
        "status": "ONLINE",
        "last_measurement": datetime.datetime.utcnow().strftime("%I:%M %p"),
        "sensors": {
            "ph_sensor": {"status": "Operational", "health": 98, "type": "Analog Glass Electrode with BNC Interface"},
            "conductivity_sensor": {"status": "Operational", "health": 95, "type": "4-Electrode AC Toroidal Cell"},
            "temperature_sensor": {"status": "Operational", "health": 99, "type": "DS18B20 Waterproof Probe"},
            "load_cell": {"status": "Operational", "health": 97, "type": "HX711 20kg Precision Milk Weigh Beam"}
        },
        "cleaning_and_calibration": {
            "calibration_status": "Calibrated (Standard Buffer pH 4.0 / 7.0 & KCl 12.88 mS/cm)",
            "cleaning_status": "CIP (Clean-in-Place) Completed with Alkaline Detergent Sanitizer",
            "next_cleaning_due": "Immediately Post Evening Milking"
        },
        "data_flow": [
            {"step": 1, "node": "Cow Udder / Claw", "desc": "Milk extracted via vacuum pulsation"},
            {"step": 2, "node": "Sensing Chamber", "desc": "Continuous inline bypass sensing chamber fills"},
            {"step": 3, "node": "Sensor Cluster", "desc": "Simultaneous measurement of Conductivity, pH, Temp & Weight"},
            {"step": 4, "node": "ESP32 Controller", "desc": "ADC sampling, 10-point moving average & JSON packaging"},
            {"step": 5, "node": "Wi-Fi / MQTT / REST", "desc": "Encrypted TLS transmission to cloud server"},
            {"step": 6, "node": "Cloud Database", "desc": "Multi-rate ingestion, individual baseline matching"},
            {"step": 7, "node": "AI Risk Engine", "desc": "XGBoost 7–14 day predictive risk inference"}
        ]
    }
