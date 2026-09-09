import datetime
import math
import random
from passlib.context import CryptContext
from app.database import SessionLocal, engine, Base
from app.models.all_models import (
    User, Farm, Herd, Animal, Device, CollarReading, MilkReading,
    EnvironmentReading, FeedingRecord, RuminationRecord, MilkingSession,
    MilkingHygieneRecord, WorkerHygieneRecord, HousingRecord,
    FarmHygieneRecord, VaccinationRecord, DiseaseHistory,
    ComorbidityRecord, TreatmentRecord, LabResult, ManualObservation,
    IndividualBaseline, Prediction, Alert, Recommendation, GPSLocation,
    ModelVersion, CAPAAction
)

import bcrypt

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')[:72]
    return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(User).first() is not None:
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("Seeding SmartMastitis AI database with rich realistic data...")

    # 1. Farm
    farm = Farm(
        farm_id="FARM001",
        name="Smart Dairy Farm",
        location="Punjab, India",
        latitude=30.9010,
        longitude=75.8573
    )
    db.add(farm)
    
    # Herd
    herd = Herd(
        herd_id="HERD001",
        farm_id="FARM001",
        name="Main Commercial Dairy Herd",
        description="Crossbred cattle and high-yielding Murrah & Nili-Ravi dairy buffaloes"
    )
    db.add(herd)

    # 2. Users (4 Roles)
    users = [
        User(
            user_id="USR_FARMER_01",
            email="farmer@dairy.com",
            mobile="+919876543210",
            hashed_password=get_password_hash("farmer123"),
            full_name="Ram Singh (Dairy Farmer)",
            role="farmer",
            farm_id="FARM001"
        ),
        User(
            user_id="USR_VET_01",
            email="vet@dairy.com",
            mobile="+919876543211",
            hashed_password=get_password_hash("vet123"),
            full_name="Dr. Ananya Verma, BVSc & AH",
            role="veterinarian",
            farm_id="FARM001"
        ),
        User(
            user_id="USR_ADMIN_01",
            email="admin@dairy.com",
            mobile="+919876543212",
            hashed_password=get_password_hash("admin123"),
            full_name="Gurpreet Singh (Farm Director)",
            role="admin",
            farm_id="FARM001"
        ),
        User(
            user_id="USR_COOP_01",
            email="coop@dairy.com",
            mobile="+919876543213",
            hashed_password=get_password_hash("coop123"),
            full_name="Vikramjit Sidhu (Milk Cooperative Officer)",
            role="field_personnel",
            farm_id="FARM001"
        ),
    ]
    db.add_all(users)
    db.commit()

    # 3. Animals: 80 total (65 Cattle, 15 Buffaloes)
    # Risk Distribution: No Risk: 45, Low: 18, Moderate: 10, High: 5, Critical: 2
    # Lactating: 61, Dry: 19, Pregnant: 22, Recently Calved: 8, Under Treatment: 4
    
    cattle_breeds = ["Sahiwal", "Gir", "Holstein Friesian", "Jersey", "Red Sindhi", "Crossbred HF-Sahiwal"]
    buffalo_breeds = ["Murrah", "Nili-Ravi", "Mehsana", "Jaffarabadi", "Surti"]
    
    animal_objects = []
    
    # Specific Required Animals:
    # COW001: Healthy No-Risk
    a_cow001 = Animal(
        animal_id="COW001", tag_number="TAG-IN-1001", rfid_id="RFID-982-001",
        species="Cow", breed="Sahiwal", age_years=4.0, sex="Female", weight_kg=440.0,
        body_condition_score=3.5, lactation_number=2, days_in_lactation=85,
        pregnancy_status="Pregnant", current_milk_yield=15.8,
        previous_mastitis=False, previous_mastitis_count=0, current_treatment=False,
        vaccination_status="UP TO DATE", current_mastitis_risk="NO RISK",
        risk_probability=0.08, prediction_window="Next 7–14 days",
        farm_zone="Zone A", shed="Shed 1", pen="Pen 1"
    )
    animal_objects.append(a_cow001)

    # COW002: Low Risk
    a_cow002 = Animal(
        animal_id="COW002", tag_number="TAG-IN-1002", rfid_id="RFID-982-002",
        species="Cow", breed="Holstein Friesian", age_years=6.0, sex="Female", weight_kg=560.0,
        body_condition_score=3.25, lactation_number=4, days_in_lactation=128,
        pregnancy_status="Non-Pregnant", current_milk_yield=22.4,
        previous_mastitis=True, previous_mastitis_count=2, current_treatment=False,
        vaccination_status="UP TO DATE", current_mastitis_risk="LOW RISK",
        risk_probability=0.27, prediction_window="Next 7–14 days",
        farm_zone="Zone A", shed="Shed 1", pen="Pen 4"
    )
    animal_objects.append(a_cow002)

    # COW003: Moderate Risk
    a_cow003 = Animal(
        animal_id="COW003", tag_number="TAG-IN-1003", rfid_id="RFID-982-003",
        species="Buffalo", breed="Murrah", age_years=5.0, sex="Female", weight_kg=590.0,
        body_condition_score=3.5, lactation_number=3, days_in_lactation=140,
        pregnancy_status="Pregnant", current_milk_yield=13.2,
        previous_mastitis=False, previous_mastitis_count=0, current_treatment=False,
        vaccination_status="DUE SOON", current_mastitis_risk="MODERATE RISK",
        risk_probability=0.51, prediction_window="Next 7–14 days",
        farm_zone="Zone B", shed="Shed 2", pen="Pen 2"
    )
    animal_objects.append(a_cow003)

    # COW004: High Risk (Flagship forecasting demo)
    a_cow004 = Animal(
        animal_id="COW004", tag_number="TAG-IN-1004", rfid_id="RFID-982-004",
        species="Cow", breed="Holstein Friesian", age_years=5.0, sex="Female", weight_kg=540.0,
        body_condition_score=2.75, lactation_number=3, days_in_lactation=110,
        pregnancy_status="Non-Pregnant", current_milk_yield=3.4, # per session (~6.8/day)
        previous_mastitis=True, previous_mastitis_count=2, current_treatment=False,
        vaccination_status="UP TO DATE", current_mastitis_risk="HIGH RISK",
        risk_probability=0.74, prediction_window="Next 7–14 days",
        farm_zone="Zone A", shed="Shed 2", pen="Pen 4"
    )
    animal_objects.append(a_cow004)

    # COW005: Critical Risk
    a_cow005 = Animal(
        animal_id="COW005", tag_number="TAG-IN-1005", rfid_id="RFID-982-005",
        species="Cow", breed="Crossbred HF-Sahiwal", age_years=7.0, sex="Female", weight_kg=510.0,
        body_condition_score=2.5, lactation_number=5, days_in_lactation=195,
        pregnancy_status="Non-Pregnant", current_milk_yield=11.0,
        previous_mastitis=True, previous_mastitis_count=3, current_treatment=True,
        vaccination_status="OVERDUE", current_mastitis_risk="CRITICAL RISK",
        risk_probability=0.88, prediction_window="Next 7–14 days",
        farm_zone="Zone C", shed="Shed 2", pen="Pen 6"
    )
    animal_objects.append(a_cow005)

    # Additional 15 Detailed Profile Animals (Total 20 Detailed Animals)
    profiles_meta = [
        # (id, species, breed, age, lact, dim, preg, yield, prev_mast, cnt, treat, vacc, risk, prob, shed)
        ("COW006", "Cow", "Gir", 3.5, 1, 45, "Recently Calved", 14.2, False, 0, False, "DUE SOON", "NO RISK", 0.09, "Shed 1"),
        ("COW007", "Cow", "Jersey", 4.0, 2, 70, "Non-Pregnant", 18.5, False, 0, False, "UP TO DATE", "LOW RISK", 0.24, "Shed 1"),
        ("COW008", "Cow", "Red Sindhi", 4.5, 2, 115, "Pregnant", 13.8, False, 0, False, "UP TO DATE", "NO RISK", 0.07, "Shed 1"),
        ("COW009", "Cow", "Holstein Friesian", 5.5, 3, 160, "Non-Pregnant", 24.0, True, 1, False, "UP TO DATE", "MODERATE RISK", 0.46, "Shed 2"),
        ("COW010", "Cow", "Crossbred HF-Sahiwal", 6.0, 4, 180, "Pregnant", 17.5, False, 0, False, "UP TO DATE", "LOW RISK", 0.22, "Shed 1"),
        ("BUF001", "Buffalo", "Murrah", 5.5, 3, 95, "Non-Pregnant", 14.8, False, 0, False, "UP TO DATE", "NO RISK", 0.11, "Shed 3"),
        ("BUF002", "Buffalo", "Nili-Ravi", 6.0, 4, 130, "Pregnant", 15.2, True, 1, False, "UP TO DATE", "LOW RISK", 0.31, "Shed 3"),
        ("BUF003", "Buffalo", "Mehsana", 4.5, 2, 75, "Recently Calved", 12.5, False, 0, False, "UP TO DATE", "NO RISK", 0.10, "Shed 3"),
        ("BUF004", "Buffalo", "Jaffarabadi", 7.0, 5, 210, "Dry", 0.0, True, 2, True, "UP TO DATE", "HIGH RISK", 0.69, "Shed 2"),
        ("BUF005", "Buffalo", "Surti", 4.0, 2, 88, "Non-Pregnant", 11.0, False, 0, False, "DUE SOON", "LOW RISK", 0.28, "Shed 3"),
        ("COW011", "Cow", "Sahiwal", 5.0, 3, 150, "Pregnant", 15.0, False, 0, False, "UP TO DATE", "NO RISK", 0.06, "Shed 1"),
        ("COW012", "Cow", "Gir", 6.5, 4, 220, "Dry", 0.0, False, 0, False, "UP TO DATE", "NO RISK", 0.12, "Shed 4"),
        ("COW013", "Cow", "Holstein Friesian", 4.5, 2, 60, "Recently Calved", 26.5, True, 1, False, "UP TO DATE", "HIGH RISK", 0.72, "Shed 2"),
        ("COW014", "Cow", "Crossbred HF-Sahiwal", 7.5, 5, 240, "Dry", 0.0, True, 3, True, "OVERDUE", "CRITICAL RISK", 0.84, "Shed 2"),
        ("COW015", "Cow", "Jersey", 3.0, 1, 35, "Recently Calved", 17.0, False, 0, False, "UP TO DATE", "NO RISK", 0.08, "Shed 1"),
    ]

    for p in profiles_meta:
        a = Animal(
            animal_id=p[0], tag_number=f"TAG-IN-{p[0]}", rfid_id=f"RFID-982-{p[0]}",
            species=p[1], breed=p[2], age_years=p[3], sex="Female", weight_kg=480.0 if p[1]=="Cow" else 580.0,
            body_condition_score=3.25, lactation_number=p[4], days_in_lactation=p[5],
            pregnancy_status=p[6], current_milk_yield=p[7],
            previous_mastitis=p[8], previous_mastitis_count=p[9], current_treatment=p[10],
            vaccination_status=p[11], current_mastitis_risk=p[12],
            risk_probability=p[13], prediction_window="Next 7–14 days",
            farm_zone="Zone A" if p[14] in ["Shed 1", "Shed 4"] else "Zone B",
            shed=p[14], pen=f"Pen {random.randint(1, 6)}"
        )
        animal_objects.append(a)

    # Now generate remaining 60 animals to reach exact totals:
    # Total = 80 (65 Cattle, 15 Buffaloes)
    # Current: 15 Cattle, 5 Buffaloes. Remaining: 50 Cattle, 10 Buffaloes.
    # We calibrate remaining so exact sums match Section 4:
    # No Risk: 45, Low: 18, Moderate: 10, High: 5, Critical: 2
    # Current distribution among first 20:
    # No Risk: 8, Low: 5, Moderate: 2, High: 3, Critical: 2
    # Need remaining:
    # No Risk: 37, Low: 13, Moderate: 8, High: 2, Critical: 0
    
    risk_targets = ["NO RISK"] * 37 + ["LOW RISK"] * 13 + ["MODERATE RISK"] * 8 + ["HIGH RISK"] * 2
    random.seed(42)
    random.shuffle(risk_targets)
    
    # 51 Cattle and 9 Buffaloes (14 + 51 = 65 Cows, 6 + 9 = 15 Buffaloes)
    species_pool = ["Cow"] * 51 + ["Buffalo"] * 9
    random.shuffle(species_pool)
    
    for idx, risk in enumerate(risk_targets):
        num = 16 + idx
        sp = species_pool[idx]
        br = random.choice(cattle_breeds) if sp == "Cow" else random.choice(buffalo_breeds)
        
        prob_map = {
            "NO RISK": round(random.uniform(0.04, 0.16), 2),
            "LOW RISK": round(random.uniform(0.21, 0.38), 2),
            "MODERATE RISK": round(random.uniform(0.42, 0.58), 2),
            "HIGH RISK": round(random.uniform(0.62, 0.77), 2),
            "CRITICAL RISK": round(random.uniform(0.82, 0.94), 2)
        }
        prob = prob_map[risk]
        
        is_dry = True if (num % 5 == 0) else False
        is_preg = True if (num % 4 == 0) else False
        prev_m = True if (risk in ["HIGH RISK", "CRITICAL RISK"] or random.random() < 0.15) else False
        
        a = Animal(
            animal_id=f"{'COW' if sp=='Cow' else 'BUF'}{num:03d}",
            tag_number=f"TAG-IN-{num:04d}",
            rfid_id=f"RFID-982-{num:04d}",
            species=sp,
            breed=br,
            age_years=round(random.uniform(3.0, 8.0), 1),
            sex="Female",
            weight_kg=round(random.uniform(430.0, 560.0) if sp=="Cow" else random.uniform(530.0, 650.0), 1),
            body_condition_score=round(random.uniform(2.75, 3.75), 2),
            lactation_number=random.randint(1, 6),
            days_in_lactation=random.randint(15, 290) if not is_dry else 320,
            pregnancy_status="Dry" if is_dry else ("Pregnant" if is_preg else "Non-Pregnant"),
            current_milk_yield=0.0 if is_dry else round(random.uniform(11.0, 22.0), 1),
            previous_mastitis=prev_m,
            previous_mastitis_count=random.randint(1, 3) if prev_m else 0,
            current_treatment=True if (risk=="CRITICAL RISK" or (risk=="HIGH RISK" and random.random()<0.4)) else False,
            vaccination_status=random.choice(["UP TO DATE", "UP TO DATE", "UP TO DATE", "DUE SOON"]),
            current_mastitis_risk=risk,
            risk_probability=prob,
            prediction_window="Next 7–14 days",
            farm_zone="Zone A" if sp=="Cow" else "Zone B",
            shed=random.choice(["Shed 1", "Shed 2"]) if sp=="Cow" else "Shed 3",
            pen=f"Pen {random.randint(1, 8)}"
        )
        animal_objects.append(a)
        
    db.add_all(animal_objects)
    db.commit()

    # 4. Individual Baselines for All Animals
    baselines = []
    for a in animal_objects:
        b = IndividualBaseline(
            animal_id=a.animal_id,
            baseline_activity=round(random.uniform(64.0, 72.0), 1),
            baseline_rumination=round(random.uniform(490.0, 530.0), 1),
            baseline_milk_yield=round(random.uniform(3.8, 4.6), 1), # kg/session
            baseline_conductivity=round(random.uniform(5.0, 5.3), 1), # mS/cm
            baseline_ph=round(random.uniform(6.58, 6.64), 2),
            baseline_surface_temp=round(random.uniform(38.0, 38.4), 1),
            baseline_scc=random.randint(90000, 160000),
            calculated_days=14
        )
        baselines.append(b)
    db.add_all(baselines)
    db.commit()

    # 5. IoT Devices
    devices = [
        Device(device_id="COLLAR001", device_type="Smart Collar", connected_animal_id="COW004", location="Shed 2", status="ONLINE", battery=82, signal_strength="Good", power_source="Battery"),
        Device(device_id="COLLAR002", device_type="Smart Collar", connected_animal_id="COW001", location="Shed 1", status="ONLINE", battery=94, signal_strength="Good", power_source="Battery"),
        Device(device_id="COLLAR003", device_type="Smart Collar", connected_animal_id="COW002", location="Shed 1", status="ONLINE", battery=79, signal_strength="Good", power_source="Battery"),
        Device(device_id="COLLAR004", device_type="Smart Collar", connected_animal_id="COW003", location="Shed 2", status="ONLINE", battery=88, signal_strength="Good", power_source="Battery"),
        Device(device_id="COLLAR005", device_type="Smart Collar", connected_animal_id="COW005", location="Shed 2", status="ONLINE", battery=45, signal_strength="Fair", power_source="Battery"),
        Device(device_id="COLLAR006", device_type="Smart Collar", connected_animal_id="BUF001", location="Shed 3", status="ONLINE", battery=89, signal_strength="Good", power_source="Battery"),
        Device(device_id="COLLAR007", device_type="Smart Collar", connected_animal_id="COW009", location="Shed 2", status="ONLINE", battery=72, signal_strength="Good", power_source="Battery"),
        Device(device_id="COLLAR008", device_type="Smart Collar", connected_animal_id="COW013", location="Shed 2", status="ONLINE", battery=18, signal_strength="Weak", power_source="Battery"), # Low battery alert
        Device(device_id="MILK001", device_type="Milk Sensing Unit", location="Milking Station 1", status="ONLINE", battery=100, signal_strength="Good", power_source="AC", calibration_status="Calibrated (Valid)", cleaning_status="CIP Cleaned"),
        Device(device_id="MILK002", device_type="Milk Sensing Unit", location="Milking Station 2", status="ONLINE", battery=100, signal_strength="Good", power_source="AC", calibration_status="Calibrated (Valid)", cleaning_status="CIP Cleaned"),
        Device(device_id="ENV001", device_type="Environment Unit", location="Cattle Shed 1", status="ONLINE", battery=100, signal_strength="Good", power_source="AC/Solar"),
        Device(device_id="ENV002", device_type="Environment Unit", location="Buffalo Shed 3", status="ONLINE", battery=100, signal_strength="Good", power_source="AC/Solar"),
        Device(device_id="ENV003", device_type="Environment Unit", location="Calf & Dry Shed 4", status="OFFLINE", battery=0, signal_strength="None", power_source="AC/Solar") # Offline device
    ]
    db.add_all(devices)
    db.commit()

    # 6. 30 Days of Time-Series Data for Demo Animals
    today = datetime.date.today()
    
    # Generate Progression for COW004 (Section 64):
    # Day -14: 18%
    # Day -10: 24%
    # Day -7: 39%
    # Day -5: 52%
    # Day -3: 64%
    # Day -1: 76%
    cow004_progression = {
        14: {"risk": 0.18, "cond": 5.2, "yield": 4.2, "act": 67, "rum": 505, "scc": 130000},
        13: {"risk": 0.19, "cond": 5.3, "yield": 4.2, "act": 66, "rum": 500, "scc": 140000},
        12: {"risk": 0.21, "cond": 5.3, "yield": 4.1, "act": 65, "rum": 495, "scc": 145000},
        11: {"risk": 0.22, "cond": 5.4, "yield": 4.1, "act": 64, "rum": 490, "scc": 155000},
        10: {"risk": 0.24, "cond": 5.4, "yield": 4.0, "act": 62, "rum": 485, "scc": 170000},
        9:  {"risk": 0.28, "cond": 5.5, "yield": 4.0, "act": 60, "rum": 480, "scc": 190000},
        8:  {"risk": 0.33, "cond": 5.6, "yield": 3.9, "act": 58, "rum": 470, "scc": 220000},
        7:  {"risk": 0.39, "cond": 5.7, "yield": 3.8, "act": 55, "rum": 460, "scc": 260000},
        6:  {"risk": 0.45, "cond": 5.8, "yield": 3.7, "act": 52, "rum": 450, "scc": 310000},
        5:  {"risk": 0.52, "cond": 5.9, "yield": 3.6, "act": 48, "rum": 440, "scc": 370000},
        4:  {"risk": 0.58, "cond": 6.0, "yield": 3.5, "act": 46, "rum": 435, "scc": 420000},
        3:  {"risk": 0.64, "cond": 6.0, "yield": 3.5, "act": 45, "rum": 430, "scc": 480000},
        2:  {"risk": 0.70, "cond": 6.1, "yield": 3.4, "act": 43, "rum": 425, "scc": 530000},
        1:  {"risk": 0.76, "cond": 6.1, "yield": 3.4, "act": 42, "rum": 420, "scc": 580000},
        0:  {"risk": 0.74, "cond": 6.1, "yield": 3.4, "act": 42, "rum": 420, "scc": 590000},
    }

    # Healthy COW001 Normal Variation:
    # Day -14: 9%
    # Day -10: 11%
    # Day -7: 8%
    # Day -5: 10%
    # Day -3: 7%
    # Day -1: 8%
    cow001_progression = {
        14: 0.09, 13: 0.09, 12: 0.10, 11: 0.10, 10: 0.11,
        9: 0.10,  8: 0.09,  7: 0.08,  6: 0.09,  5: 0.10,
        4: 0.09,  3: 0.07,  2: 0.08,  1: 0.08,  0: 0.08
    }

    collar_readings = []
    milk_readings = []
    env_readings = []
    lab_results = []
    feed_records = []
    milking_sessions = []
    predictions_history = []

    for day_offset in range(30, -1, -1):
        record_date = today - datetime.timedelta(days=day_offset)
        record_dt = datetime.datetime.combine(record_date, datetime.time(6, 30))
        
        # Environmental reading for Shed 1 and Shed 2
        amb_t = round(28.0 + 4.0 * math.sin(day_offset * 0.3) + random.uniform(-0.8, 0.8), 1)
        hum = round(68.0 + 10.0 * math.cos(day_offset * 0.25) + random.uniform(-2.0, 2.0), 1)
        thi = round(0.8 * amb_t + (hum / 100.0) * (amb_t - 14.4) + 46.4, 1) # Standard THI formula
        env_readings.append(EnvironmentReading(
            farm_id="FARM001", device_id="ENV001", location="Cattle Shed 1",
            timestamp=record_dt, ambient_temperature=amb_t, humidity=hum,
            air_quality=round(380.0 + random.uniform(-20, 30), 1),
            heat_humidity_index=thi
        ))

        # Collar, Milk, Predictions for COW004
        if day_offset in cow004_progression:
            p_data = cow004_progression[day_offset]
            c_cond = p_data["cond"]
            c_yield = p_data["yield"]
            c_act = p_data["act"]
            c_rum = p_data["rum"]
            c_scc = p_data["scc"]
            c_risk = p_data["risk"]
        else:
            # Baseline days prior to day 14
            c_cond = 5.2 + random.uniform(-0.05, 0.05)
            c_yield = 4.2 + random.uniform(-0.1, 0.1)
            c_act = 68 + random.randint(-2, 2)
            c_rum = 510 + random.randint(-5, 5)
            c_scc = 120000 + random.randint(-5000, 5000)
            c_risk = 0.15

        collar_readings.append(CollarReading(
            farm_id="FARM001", animal_id="COW004", device_id="COLLAR001",
            timestamp=record_dt, surface_temperature=round(38.4 + (0.6 if day_offset < 7 else 0), 1),
            activity=c_act, movement_frequency=round(c_act * 0.42, 1),
            resting_duration=round(3.4 + (2.0 if day_offset < 7 else 0), 1),
            rumination_estimate=c_rum, battery=max(82 - (30 - day_offset)//3, 50)
        ))

        milk_readings.append(MilkReading(
            farm_id="FARM001", animal_id="COW004", device_id="MILK001",
            timestamp=record_dt, session_type="Morning",
            milk_temperature=round(36.7 + (0.5 if day_offset < 7 else 0), 1),
            conductivity=round(c_cond, 2), ph=round(6.62 + (0.16 if day_offset < 5 else 0), 2),
            milk_yield=round(c_yield, 2)
        ))

        predictions_history.append(Prediction(
            animal_id="COW004", timestamp=record_dt,
            risk_probability=round(c_risk, 2),
            risk_level="HIGH RISK" if c_risk >= 0.60 else ("MODERATE RISK" if c_risk >= 0.40 else "LOW RISK"),
            forecast_start=record_date, forecast_end=record_date + datetime.timedelta(days=14),
            model_version="XGBoost-v1.4.2",
            top_risk_factors=[
                {"feature": "Conductivity", "change": f"+{((c_cond - 5.2)/5.2)*100:.1f}%"},
                {"feature": "Milk Yield", "change": f"{((c_yield - 4.2)/4.2)*100:.1f}%"},
                {"feature": "Activity", "change": f"{((c_act - 68)/68)*100:.1f}%"}
            ]
        ))

        # Healthy COW001
        h_risk = cow001_progression.get(day_offset, 0.08 + random.uniform(-0.01, 0.02))
        h_act = 70 + random.randint(-3, 3)
        h_rum = 515 + random.randint(-10, 10)
        h_yield = 7.9 + random.uniform(-0.3, 0.3)
        h_cond = 5.1 + random.uniform(-0.06, 0.06)
        
        collar_readings.append(CollarReading(
            farm_id="FARM001", animal_id="COW001", device_id="COLLAR002",
            timestamp=record_dt, surface_temperature=38.2, activity=h_act,
            movement_frequency=28.5, resting_duration=3.1, rumination_estimate=h_rum, battery=94
        ))
        milk_readings.append(MilkReading(
            farm_id="FARM001", animal_id="COW001", device_id="MILK001",
            timestamp=record_dt, session_type="Morning", milk_temperature=36.5,
            conductivity=round(h_cond, 2), ph=6.62, milk_yield=round(h_yield, 2)
        ))
        predictions_history.append(Prediction(
            animal_id="COW001", timestamp=record_dt,
            risk_probability=round(h_risk, 2), risk_level="NO RISK",
            forecast_start=record_date, forecast_end=record_date + datetime.timedelta(days=14),
            model_version="XGBoost-v1.4.2",
            top_risk_factors=[]
        ))

        # Periodic SCC Lab Record every 7 days
        if day_offset in [28, 21, 14, 7, 0]:
            lab_results.append(LabResult(
                animal_id="COW004", sample_date=record_date, test_type="Laboratory SCC Test",
                scc=c_scc, cmt_result="1+" if c_scc > 400000 else "Trace",
                culture_result="Staphylococcus aureus suspected" if c_scc > 500000 else "Normal flora",
                laboratory="Punjab Veterinary Diagnostic Lab", veterinarian="Dr. Ananya Verma",
                clinical_status="Suspected" if c_scc > 400000 else "Normal",
                remarks="Elevated somatic cell count in subclinical range" if c_scc > 400000 else "Within normal baseline"
            ))
            lab_results.append(LabResult(
                animal_id="COW001", sample_date=record_date, test_type="Routine SCC Screening",
                scc=95000 + random.randint(-5000, 5000), cmt_result="Negative",
                culture_result="No bacterial growth", laboratory="Punjab Veterinary Diagnostic Lab",
                veterinarian="Dr. Ananya Verma", clinical_status="Normal", remarks="Healthy reference range"
            ))

    db.add_all(collar_readings)
    db.add_all(milk_readings)
    db.add_all(env_readings)
    db.add_all(lab_results)
    db.add_all(predictions_history)
    db.commit()

    # 7. Milking Management Records (Schedule, Procedures, Worker Hygiene)
    milking_sessions = [
        MilkingSession(
            farm_id="FARM001", animal_id="COW004", date=today, session_type="Morning",
            scheduled_time="05:30 AM", actual_start="05:36 AM", end_time="05:44 AM",
            duration=8.0, milking_method="Machine", machine_id="MILK_MAC_01",
            operator_id="W001", milk_yield=3.4, is_missed=False, remarks="Reduced milk yield noted"
        ),
        MilkingSession(
            farm_id="FARM001", animal_id="COW001", date=today, session_type="Morning",
            scheduled_time="05:30 AM", actual_start="05:32 AM", end_time="05:39 AM",
            duration=7.0, milking_method="Machine", machine_id="MILK_MAC_01",
            operator_id="W001", milk_yield=7.9, is_missed=False, remarks="Normal milking flow"
        ),
        MilkingSession(
            farm_id="FARM001", animal_id="COW002", date=today, session_type="Morning",
            scheduled_time="05:30 AM", actual_start="05:42 AM", end_time="05:51 AM",
            duration=9.0, milking_method="Machine", machine_id="MILK_MAC_02",
            operator_id="W002", milk_yield=11.2, is_missed=False, remarks="Steady production"
        )
    ]
    db.add_all(milking_sessions)

    # Milking Hygiene Checklists (Section 21, 23)
    hygiene_records = [
        MilkingHygieneRecord(
            session_id=1, animal_id="COW004", date=today,
            udder_inspected=True, teats_inspected=True, teats_cleaned=True,
            pre_dipping_performed=True, teats_properly_dried=True, foremilk_checked=True,
            separate_towel_used=True, worker_washed_hands=True, gloves_used=True,
            abnormal_milk_observed=False, abnormal_milk_type="Normal",
            post_dipping_performed=True, teat_disinfection=True,
            equipment_cleaned=True, equipment_sanitized=True, milk_line_cleaned=True,
            abnormal_milk_separated=False, operator_id="W001",
            remarks="Foremilk visually normal but conductivity sensor flagged elevation"
        ),
        MilkingHygieneRecord(
            session_id=2, animal_id="COW001", date=today,
            udder_inspected=True, teats_inspected=True, teats_cleaned=True,
            pre_dipping_performed=True, teats_properly_dried=True, foremilk_checked=True,
            separate_towel_used=True, worker_washed_hands=True, gloves_used=True,
            abnormal_milk_observed=False, abnormal_milk_type="Normal",
            post_dipping_performed=True, teat_disinfection=True,
            equipment_cleaned=True, equipment_sanitized=True, milk_line_cleaned=True,
            abnormal_milk_separated=False, operator_id="W001",
            remarks="Excellent teat cleanliness and proper drying compliance"
        )
    ]
    db.add_all(hygiene_records)

    # Worker Hygiene (Section 24)
    worker_hygiene = [
        WorkerHygieneRecord(
            worker_id="W001", worker_name="Kuldeep Sharma", date=today,
            training_status="Completed", hands_washed=True, hand_sanitization=True,
            gloves_used=True, dedicated_towels=True, protective_clothing=True,
            milking_hygiene_training="Certified Mastitis Prevention Protocol",
            last_training_date=datetime.date(2026, 4, 15), compliance_score=94.0,
            inspected_by="Farm Admin Gurpreet Singh"
        ),
        WorkerHygieneRecord(
            worker_id="W002", worker_name="Balwinder Sandhu", date=today,
            training_status="Completed", hands_washed=True, hand_sanitization=True,
            gloves_used=True, dedicated_towels=True, protective_clothing=True,
            milking_hygiene_training="Standard Dairy Milking Practices",
            last_training_date=datetime.date(2026, 3, 10), compliance_score=88.0,
            inspected_by="Farm Admin Gurpreet Singh"
        ),
        WorkerHygieneRecord(
            worker_id="W003", worker_name="Jagtar Gill", date=today,
            training_status="In Progress", hands_washed=True, hand_sanitization=False,
            gloves_used=True, dedicated_towels=True, protective_clothing=True,
            milking_hygiene_training="Milking Hygiene Refresher",
            last_training_date=datetime.date(2026, 7, 20), compliance_score=82.0,
            inspected_by="Dr. Ananya Verma"
        )
    ]
    db.add_all(worker_hygiene)

    # 8. Farm Hygiene & Housing (Section 17, 18)
    farm_hygiene = [
        FarmHygieneRecord(
            farm_id="FARM001", date=today, shed_cleanliness="Good",
            udder_cleanliness="Good", teat_cleanliness="Good",
            bedding_cleanliness="Moderate", bedding_dryness="Moderate", # Flagged in COW004 explanation
            floor_cleanliness="Good", manure_removal_frequency="Twice Daily",
            drainage="Moderate", water_trough_cleanliness="Good",
            milking_area_cleanliness="Excellent", equipment_cleanliness="Excellent",
            equipment_sanitation_freq="After Every Milking",
            overall_hygiene_score=82.0, overall_hygiene_risk="MODERATE",
            inspected_by="Dr. Ananya Verma (Vet)",
            remarks="Bedding in Shed 2 requires additional dry straw replenishment"
        )
    ]
    db.add_all(farm_hygiene)

    housing = [
        HousingRecord(
            farm_id="FARM001", shed_name="Shed 1", date=today,
            housing_type="Loose Housing", stall_type="Free Stall", floor_type="Grooved Concrete",
            bedding_type="Dry Straw & Sand", bedding_replacement_frequency="Twice Weekly",
            floor_wetness="Low", drainage="Good", ventilation="Excellent",
            stocking_density=1.0, overcrowding=False, shade_availability=True,
            water_availability="Continuous Fresh", heat_stress_condition="Low",
            cow_comfort="Excellent", cleaning_frequency="Twice Daily"
        ),
        HousingRecord(
            farm_id="FARM001", shed_name="Shed 2", date=today,
            housing_type="Loose Housing", stall_type="Free Stall", floor_type="Concrete",
            bedding_type="Straw", bedding_replacement_frequency="Weekly",
            floor_wetness="Moderate", drainage="Moderate", ventilation="Good",
            stocking_density=1.2, overcrowding=False, shade_availability=True,
            water_availability="Continuous Fresh", heat_stress_condition="Moderate",
            cow_comfort="Fair", cleaning_frequency="Daily"
        )
    ]
    db.add_all(housing)

    # 9. Feeding & Nutrition (Section 14)
    feeding = [
        FeedingRecord(
            animal_id="COW004", date=today, green_fodder=16.0, dry_fodder=5.5,
            concentrate=4.5, silage=7.0, mineral_mixture=90.0,
            feed_intake_status="Reduced", water_intake_status="Normal", appetite="Reduced",
            body_condition_score=2.75, weight_kg=540.0, entered_by="Farmer Ram Singh"
        ),
        FeedingRecord(
            animal_id="COW001", date=today, green_fodder=18.0, dry_fodder=6.0,
            concentrate=5.0, silage=8.0, mineral_mixture=100.0,
            feed_intake_status="Normal", water_intake_status="Normal", appetite="Normal",
            body_condition_score=3.5, weight_kg=440.0, entered_by="Farmer Ram Singh"
        )
    ]
    db.add_all(feeding)

    # 10. Vaccination Records (Section 25, 26)
    vaccinations = [
        VaccinationRecord(
            animal_id="COW001", vaccine_name="Foot and Mouth Disease (FMD) Quadrivalent",
            date_administered=datetime.date(2026, 3, 12), next_due_date=datetime.date(2026, 9, 12),
            administered_by="Dr. Ananya Verma", user_role="Veterinarian",
            batch_number="FMD-2026-B88", status="Completed", remarks="Immune booster administered"
        ),
        VaccinationRecord(
            animal_id="COW002", vaccine_name="Hemorrhagic Septicemia (HS) Vaccine",
            date_administered=datetime.date(2026, 2, 20), next_due_date=datetime.date(2026, 8, 20),
            administered_by="Dr. Ananya Verma", user_role="Veterinarian",
            batch_number="HS-IND-091", status="Completed", remarks="Annual booster"
        ),
        VaccinationRecord(
            animal_id="COW004", vaccine_name="Brucellosis S19",
            date_administered=datetime.date(2025, 10, 14), next_due_date=datetime.date(2026, 10, 14),
            administered_by="Dr. Ananya Verma", user_role="Veterinarian",
            batch_number="BRU-441-A", status="Completed", remarks="Routine prophylactic vaccination"
        ),
        VaccinationRecord(
            animal_id="COW005", vaccine_name="Black Quarter (BQ) Vaccine",
            date_administered=datetime.date(2025, 8, 5), next_due_date=datetime.date(2026, 8, 5),
            administered_by="Dr. Ananya Verma", user_role="Veterinarian",
            batch_number="BQ-661-K", status="Overdue", remarks="Vaccination overdue by 35 days"
        ),
        VaccinationRecord(
            animal_id="COW006", vaccine_name="Foot and Mouth Disease (FMD)",
            date_administered=datetime.date(2026, 3, 15), next_due_date=datetime.date(2026, 9, 15),
            administered_by="Dr. Ananya Verma", user_role="Veterinarian",
            batch_number="FMD-2026-B88", status="Due Soon", remarks="Scheduled for veterinary round"
        )
    ]
    db.add_all(vaccinations)

    # 11. Disease History & Comorbidities (Section 27, 28)
    disease_history = [
        DiseaseHistory(
            animal_id="COW004", disease_name="Subclinical Mastitis",
            diagnosis_date=datetime.date(2026, 2, 2), status="Recovered",
            evidence="Elevated SCC (520,000 cells/mL) & CMT 2+",
            treatment="Cloxacillin intramammary infusion + anti-inflammatory",
            outcome="Recovered", remarks="Quarters responded well to standard therapy",
            recorded_by="Dr. Ananya Verma (Vet)"
        ),
        DiseaseHistory(
            animal_id="COW004", disease_name="Clinical Mastitis (Left Rear Quarter)",
            diagnosis_date=datetime.date(2025, 7, 15), status="Confirmed",
            evidence="Swollen quarter, clotted milk, temperature 39.5°C",
            treatment="Amoxicillin-clavulanate + flunixin meglumine",
            outcome="Recovered", remarks="Full milk yield recovery achieved after 2 weeks",
            recorded_by="Dr. Ananya Verma (Vet)"
        ),
        DiseaseHistory(
            animal_id="COW002", disease_name="Subclinical Mastitis",
            diagnosis_date=datetime.date(2025, 11, 10), status="Recovered",
            evidence="Routine SCC check 460,000 cells/mL",
            treatment="Herbal teat spray & supportive vitamin E/selenium",
            outcome="Recovered", remarks="Self-resolved with improved hygiene",
            recorded_by="Dr. Ananya Verma (Vet)"
        ),
        DiseaseHistory(
            animal_id="COW005", disease_name="Acute Mastitis",
            diagnosis_date=datetime.date(2026, 8, 28), status="Confirmed",
            evidence="Streptococcus agalactiae culture positive",
            treatment="Intramammary cefquinome & systemic supportive therapy",
            outcome="Under Treatment", remarks="Currently under active antibiotic withdrawal period",
            recorded_by="Dr. Ananya Verma (Vet)"
        )
    ]
    db.add_all(disease_history)

    comorbidities = [
        ComorbidityRecord(
            animal_id="COW004", condition_name="Mild Lameness (Locomotion Score 2)",
            diagnosis_date=datetime.date(2026, 8, 25), status="Active",
            treatment="Hoof trim and copper sulfate footbath",
            veterinarian="Dr. Ananya Verma", outcome="Improving",
            remarks="Reduced walking speed contributed slightly to decreased collar activity"
        ),
        ComorbidityRecord(
            animal_id="COW005", condition_name="Teat Hyperkeratosis",
            diagnosis_date=datetime.date(2026, 8, 10), status="Active",
            treatment="Emollient teat dip application",
            veterinarian="Dr. Ananya Verma", outcome="Under management",
            remarks="Rough teat end score 3. Increases risk of bacterial colonization"
        )
    ]
    db.add_all(comorbidities)

    # 12. Treatment Records (Section 29)
    treatments = [
        TreatmentRecord(
            animal_id="COW005", condition="Confirmed Mastitis - Right Front Quarter",
            diagnosis_date=datetime.date(2026, 8, 28),
            treatment_details="Cefquinome sulfate intramammary infusion once daily for 3 days",
            medicine_name="Cobactan LC (Cefquinome)", dosage="75 mg per infected quarter",
            start_date=datetime.date(2026, 8, 28), end_date=datetime.date(2026, 8, 31),
            veterinarian="Dr. Ananya Verma (License #PB-VET-4491)",
            withdrawal_period_days=5, treatment_outcome="Ongoing",
            remarks="Milk separation strictly enforced. Milk withholding until Sept 5."
        )
    ]
    db.add_all(treatments)

    # 13. Manual Observations (Section 30)
    observations = [
        ManualObservation(
            animal_id="COW004", date=today, appetite="Slightly Reduced",
            feed_intake="Reduced", water_intake="Normal",
            behaviour="Mild lethargy, lies down more often",
            udder_appearance="Right rear quarter slightly warm to touch, no visible swelling yet",
            teat_appearance="Normal, clean", milk_appearance="Normal",
            pain_discomfort="Mild sensitivity upon deep palpation",
            body_condition=2.75, clinical_status="Suspected",
            observer_role="Farmer", entered_by="Farmer Ram Singh",
            remarks="Noticed 30% feed leftover in manger this morning."
        ),
        ManualObservation(
            animal_id="COW001", date=today, appetite="Normal",
            feed_intake="Normal", water_intake="Normal",
            behaviour="Vigorous, alert, chew cud actively",
            udder_appearance="Normal, soft and pliable", teat_appearance="Intact and healthy",
            milk_appearance="Normal", pain_discomfort="None observed",
            body_condition=3.5, clinical_status="Normal",
            observer_role="Farmer", entered_by="Farmer Ram Singh",
            remarks="Animal in prime lactation health."
        )
    ]
    db.add_all(observations)

    # 14. Active Alerts (Section 41)
    alerts = [
        Alert(
            farm_id="FARM001", animal_id="COW004", alert_type="High Mastitis Risk",
            severity="HIGH",
            message="ELEVATED MASTITIS RISK DETECTED (74% Probability)",
            details="Milk conductivity increased 17.3%, milk yield dropped 19%, collar activity dropped 38% relative to baseline. Elevated risk predicted within 7–14 days.",
            action_required="Inspect animal COW004 and verify using appropriate milk/veterinary clinical assessment.",
            channels="In-App, Push, SMS, Veterinarian Notification"
        ),
        Alert(
            farm_id="FARM001", animal_id="COW005", alert_type="Critical Risk",
            severity="CRITICAL",
            message="CRITICAL MASTITIS RISK & ACTIVE TREATMENT (88% Probability)",
            details="Multiple abnormal indicators: severe conductivity elevation, SCC > 680,000, active medical withdrawal in progress.",
            action_required="Ensure strict milk withholding and follow veterinary treatment protocol.",
            channels="In-App, Push, SMS, Veterinarian Notification"
        ),
        Alert(
            farm_id="FARM001", animal_id="COW013", alert_type="High Mastitis Risk",
            severity="HIGH",
            message="ELEVATED MASTITIS RISK DETECTED (72% Probability)",
            details="Recently calved cow exhibiting drop in rumination (-18%) and conductivity rise (+14%).",
            action_required="Perform foremilk strip cup and CMT check at next milking session.",
            channels="In-App, Push"
        ),
        Alert(
            farm_id="FARM001", animal_id="ENV003", alert_type="Sensor Offline",
            severity="MODERATE",
            message="Environment Unit ENV003 (Dry Shed 4) is OFFLINE",
            details="No telemetry received for past 4 hours. Check power supply or Wi-Fi connection.",
            action_required="Inspect shed power line and ESP32 status LED.",
            channels="In-App, Push"
        ),
        Alert(
            farm_id="FARM001", animal_id="COW013", alert_type="Low Battery",
            severity="LOW",
            message="Smart Collar COLLAR008 Battery at 18%",
            details="Collar battery level is low. Recharge scheduled within 48 hours.",
            action_required="Swap battery module at next milking.",
            channels="In-App"
        ),
        Alert(
            farm_id="FARM001", animal_id="COW006", alert_type="Vaccination Due",
            severity="INFO",
            message="Vaccination Due Soon for COW006 (FMD Booster)",
            details="Foot and Mouth Disease quadrivalent booster due on 15-Sept-2026.",
            action_required="Coordinate with visiting veterinarian Dr. Ananya Verma.",
            channels="In-App"
        )
    ]
    db.add_all(alerts)

    # 15. GIS / GPS Locations for Farm Map (Section 43, 44)
    # Farm base lat/lon: 30.9010, 75.8573
    gps_locations = [
        # Sheds & Stations
        GPSLocation(farm_id="FARM001", entity_type="Shed", entity_id="Shed 1", zone="Zone A", shed="Shed 1", pen="All", latitude=30.9014, longitude=75.8568),
        GPSLocation(farm_id="FARM001", entity_type="Shed", entity_id="Shed 2", zone="Zone A", shed="Shed 2", pen="All", latitude=30.9012, longitude=75.8578), # Hotspot cluster
        GPSLocation(farm_id="FARM001", entity_type="Shed", entity_id="Shed 3", zone="Zone B", shed="Shed 3", pen="All", latitude=30.9005, longitude=75.8568),
        GPSLocation(farm_id="FARM001", entity_type="Shed", entity_id="Shed 4", zone="Zone B", shed="Shed 4", pen="All", latitude=30.9004, longitude=75.8578),
        GPSLocation(farm_id="FARM001", entity_type="Milking Station", entity_id="Milking Parlor", zone="Zone Central", shed="Central", pen="Parlor", latitude=30.9009, longitude=75.8573),
        GPSLocation(farm_id="FARM001", entity_type="Isolation Pen", entity_id="Isolation Ward", zone="Zone C", shed="Shed 2", pen="Pen 6", latitude=30.9011, longitude=75.8582),
        
        # Animal pins
        GPSLocation(farm_id="FARM001", entity_type="Animal", entity_id="COW001", zone="Zone A", shed="Shed 1", pen="Pen 1", latitude=30.90145, longitude=75.85675),
        GPSLocation(farm_id="FARM001", entity_type="Animal", entity_id="COW002", zone="Zone A", shed="Shed 1", pen="Pen 4", latitude=30.90138, longitude=75.85690),
        GPSLocation(farm_id="FARM001", entity_type="Animal", entity_id="COW003", zone="Zone A", shed="Shed 2", pen="Pen 2", latitude=30.90122, longitude=75.85775),
        GPSLocation(farm_id="FARM001", entity_type="Animal", entity_id="COW004", zone="Zone A", shed="Shed 2", pen="Pen 4", latitude=30.90118, longitude=75.85790), # High Risk
        GPSLocation(farm_id="FARM001", entity_type="Animal", entity_id="COW005", zone="Zone C", shed="Shed 2", pen="Pen 6", latitude=30.90110, longitude=75.85815), # Critical
        GPSLocation(farm_id="FARM001", entity_type="Animal", entity_id="COW009", zone="Zone A", shed="Shed 2", pen="Pen 3", latitude=30.90125, longitude=75.85782), # Moderate
        GPSLocation(farm_id="FARM001", entity_type="Animal", entity_id="COW013", zone="Zone A", shed="Shed 2", pen="Pen 5", latitude=30.90115, longitude=75.85795), # High Risk (Cluster in Shed 2!)
        GPSLocation(farm_id="FARM001", entity_type="Animal", entity_id="BUF001", zone="Zone B", shed="Shed 3", pen="Pen 1", latitude=30.90055, longitude=75.85675),
        GPSLocation(farm_id="FARM001", entity_type="Animal", entity_id="BUF002", zone="Zone B", shed="Shed 3", pen="Pen 2", latitude=30.90048, longitude=75.85690),
    ]
    db.add_all(gps_locations)

    # 16. Model Versions
    model_v = ModelVersion(
        model_name="SmartMastitis XGBoost Classifier",
        version="v1.4.2",
        algorithm="XGBoost",
        accuracy=0.914,
        precision=0.887,
        recall=0.898,
        f1_score=0.892,
        roc_auc=0.948,
        pr_auc=0.926,
        status="active",
        metrics_json={
            "seven_day_accuracy": 0.921,
            "fourteen_day_accuracy": 0.889,
            "baseline_logistic_regression_accuracy": 0.812,
            "comparison_random_forest_accuracy": 0.885,
            "confusion_matrix": {
                "true_negative": 224, "false_positive": 26,
                "false_negative": 17, "true_positive": 133
            }
        }
    )
    db.add(model_v)

    # 17. Corrective and Preventive Actions (CAPA System)
    capa_actions = [
        CAPAAction(
            action_id="CAPA-2026-001",
            title="Quarter Isolation & Subclinical Conductivity Surge Mitigation for COW004",
            animal_id="COW004",
            category="Clinical Containment",
            trigger_source="AI Early Warning Alert",
            severity="CRITICAL",
            root_cause="Conductivity spike (+17.3%) detected by inline milk sensor during morning session, preceded by 40% reduction in collar activity.",
            corrective_action="Quarantine COW004 to Isolation Pen 6; conduct immediate California Mastitis Test (CMT); segregate milk away from bulk tank.",
            preventive_action="Establish twice-daily foremilk strip cup protocol for all animals in Pen 4; replace claw teat cup liners on Unit 1.",
            assigned_to="Dr. Rajesh Sharma (Lead Veterinarian)",
            target_date=today + datetime.timedelta(days=2),
            status="IN_PROGRESS",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        ),
        CAPAAction(
            action_id="CAPA-2026-002",
            title="Shed 2 Bedding Moisture & Environmental Hotspot Rectification",
            animal_id="HERD-SHED-2",
            category="Environmental / Bedding",
            trigger_source="GIS Cluster Hotspot Alert",
            severity="HIGH",
            root_cause="Persistent relative humidity > 78% in Shed 2 combined with compacted damp paddy straw bedding causing elevated teat bacterial load.",
            corrective_action="Immediate complete rake-out and replacement of wet bedding in Shed 2; apply agricultural lime powder for moisture absorption.",
            preventive_action="Switch bedding renewal cadence from 7-day to 3-day intervals during humid monsoon weeks; service ceiling ventilation fans 3 & 4.",
            assigned_to="Harpreet Singh (Farm Facilities Manager)",
            target_date=today + datetime.timedelta(days=1),
            status="OPEN",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        ),
        CAPAAction(
            action_id="CAPA-2026-003",
            title="Milker Pre-Dipping 30-Second Teat Contact Time Retraining",
            animal_id="PARLOR-OPS",
            category="Milking Hygiene",
            trigger_source="Milker Hygiene Non-Conformance",
            severity="MODERATE",
            root_cause="Milkers observed wiping teat disinfectant immediately (<10s) instead of allowing required 30s bacterial kill contact time.",
            corrective_action="Supervised milking shift audit; issued tactile digital timers mounted on milking stalls 1-6.",
            preventive_action="Mandatory biosecurity refresher course for evening shift milking crew; bi-weekly supervisor random audits.",
            assigned_to="Sukhwinder Singh (Milking Supervisor)",
            target_date=today + datetime.timedelta(days=5),
            status="IN_PROGRESS",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
        ),
        CAPAAction(
            action_id="CAPA-2026-004",
            title="Machine Claw #2 Pulsator Vacuum Fluctuation & Liner Inspection",
            animal_id="MACHINE-02",
            category="Machine & Parlor",
            trigger_source="Parlor Operational Log",
            severity="MODERATE",
            root_cause="Intermittent pulsation vacuum drop to 38 kPa caused teat congestion and liner squawks during peak flow.",
            corrective_action="Replace worn rubber pulsation tube on Stall 2; re-seat vacuum regulator valve.",
            preventive_action="Implement mandatory weekly digital vacuum gauge calibration check across all 6 parlor units.",
            assigned_to="Amit Patel (Equipment Technician)",
            target_date=today - datetime.timedelta(days=2),
            status="RESOLVED",
            verification_notes="Vacuum stabilized at steady 42.5 kPa (60:40 ratio). Zero liner slips observed in subsequent 4 milking sessions.",
            verified_by="Dr. Rajesh Sharma",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=6),
            resolved_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
        ),
        CAPAAction(
            action_id="CAPA-2026-005",
            title="High-Risk Animal Calving Hygiene & Intramammary Sealant Protocol",
            animal_id="COW005",
            category="Clinical Containment",
            trigger_source="Veterinary Routine Inspection",
            severity="CRITICAL",
            root_cause="Recently calved cow COW005 showed udder edema and prior lactation mastitis episode history.",
            corrective_action="Administer non-steroidal anti-inflammatory under vet supervision; apply teat barrier sealant post-milking; daily CMT test.",
            preventive_action="Enforce dry-period internal teat sealant protocol for all cows entering 60-day pre-calving dry-off.",
            assigned_to="Dr. Rajesh Sharma (Lead Veterinarian)",
            target_date=today + datetime.timedelta(days=3),
            status="UNDER_REVIEW",
            verification_notes="Initial CMT shows Trace in left rear quarter. Under twice-daily observation.",
            verified_by="Dr. Rajesh Sharma",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        ),
        CAPAAction(
            action_id="CAPA-2026-006",
            title="Bulk Tank Milk Quality & Iodine Teat Dip Concentration Audit",
            animal_id="HERD-WIDE",
            category="Worker Biosecurity",
            trigger_source="Bulk Tank SCC Spike",
            severity="LOW",
            root_cause="Dilution of post-dip disinfectant batch found to be below 0.5% available iodine concentration.",
            corrective_action="Discard prepared solution; prepare fresh batch at verified 0.5% iodine concentration with test strip confirmation.",
            preventive_action="Standardize pre-measured chemical dispensing pump to prevent manual dilution variance.",
            assigned_to="Sukhwinder Singh (Milking Supervisor)",
            target_date=today - datetime.timedelta(days=1),
            status="RESOLVED",
            verification_notes="Chemical test strip reads accurate 0.55% available iodine. Dispenser lock verified.",
            verified_by="Dr. Ananya Verma",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=4),
            resolved_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
        )
    ]
    db.add_all(capa_actions)

    db.commit()
    db.close()
    print("Seeding completed successfully! 80 animals, 30-day time-series, and full health records created.")

if __name__ == "__main__":
    seed_database()
