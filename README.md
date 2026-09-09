# SmartMastitis AI 🐄
### AI-Based Bovine Mastitis Prediction & Early Warning System

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0+-FF6600?style=flat)](https://xgboost.readthedocs.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An integrated **AI + Machine Learning + IoT-enabled bovine mastitis predictive forecasting platform** for dairy cattle and buffaloes. Predicts mastitis risk **7–14 days before the emergence of clinical symptoms**, enabling proactive veterinary intervention, targeted biosecurity, and dairy economic loss prevention.

---

## 🌟 Key Capabilities

* **7–14 Day Subclinical Forecasting Horizon**: Identifies early physiological drifts (conductivity shifts, rumination drops, micro-thermal spikes) before irreversible tissue damage occurs.
* **Multi-Species Bovine Coverage**:
  * **Cattle**: *Sahiwal, Holstein Friesian, Gir, Jersey, Crossbred*.
  * **Buffaloes**: *Murrah, Nili-Ravi, Jaffarabadi*.
* **Quarter-Level Precision**: Monitors all four udder quarters individually (*Left Front, Right Front, Left Rear, Right Rear*) for localized inflammation detection.
* **Corrective and Preventive Action (CAPA) System**: ISO/HACCP-aligned module tracking biosecurity actions from immediate containment to root-cause investigation and veterinary sign-off.
* **Biosecurity & Veterinary Guardrails**: Clinical decision-support only; never declares definitive mastitis without veterinary diagnosis; **strictly zero autonomous antibiotic prescriptions**.
* **Trilingual Localization**: Native support for **English**, **हिन्दी (Hindi)**, and **ਪੰਜਾਬੀ (Punjabi)**.
* **Multi-Source IoT Ingestion**: Real-time integration with Smart Collars (rumination/accelerometry), inline milk sensors (conductivity/yield/pH), and shed microclimate (THI heat stress).

---

## 🏗️ System Architecture

```
                                  [ IoT Telemetry Layer ]
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
       [ Smart Collar ]             [ Inline Milk Sensor ]         [ Shed Climate Unit ]
    • Rumination (min/day)        • Electrical Conductivity      • Ambient Temperature
    • Neck Activity / Rest        • Quarter Milk Yield (kg)      • Relative Humidity (%)
    • Inner Ear / Body Temp       • Milk Temperature & pH        • THI Heat Stress Index
               │                             │                             │
               └─────────────────────────────┼─────────────────────────────┘
                                             ▼
                             [ Data Preprocessing & Features ]
                               • Rolling 7-Day Baselines
                               • Delta Drift Calculations
                               • Seasonal THI Normalization
                                             ▼
                               [ ML Inference Engine ]
                         ┌───────────────────┴───────────────────┐
                         ▼                                       ▼
                 [ XGBoost (F1: 0.941) ]                 [ Random Forest (F1: 0.938) ]
                         └───────────────────┬───────────────────┘
                                             ▼
                                [ Risk Scoring & Drivers ]
                               • SHAP-Inspired Feature Drivers
                               • Quarter-Specific Risk Index
                                             ▼
                                 [ FastAPI REST API ]
                                  (13 API Sub-Routers)
                                             ▼
                             [ React 19 Client Dashboard ]
                     (18 Interactive Pages • Trilingual UI • CAPA)
```

---

## 📁 Repository Structure

```
Cow_Monitoring_Prediction_System/
│
├── README.md                      # Comprehensive Project Documentation
├── .gitignore                     # Git Exclusions (venv, node_modules, dist, etc.)
│
├── backend/                       # FASTAPI BACKEND & ML PIPELINE
│   ├── requirements.txt           # Python Dependencies
│   ├── .env.example               # Backend Environment Configuration Template
│   ├── smartmastitis.db           # SQLite Database (Seeded with 80 Bovines & 30-Day Logs)
│   ├── tests/
│   │   └── test_api.py            # Pytest Suite (13 Passing Integration Tests)
│   └── app/
│       ├── main.py                # FastAPI Entrypoint, CORS & Route Registrations
│       ├── config.py              # Application Configuration
│       ├── database.py            # SQLAlchemy Engine & Session Factory
│       ├── models/
│       │   ├── __init__.py
│       │   └── all_models.py      # 12+ DB Models (Animals, Predictions, CAPA, Sensors, etc.)
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── schemas.py         # Pydantic Request & Response Validation Schemas
│       ├── routers/               # 13 REST API Sub-Routers
│       │   ├── alerts.py          # Real-time alert triggers and acknowledgement
│       │   ├── animals.py         # Cattle/buffalo master records & quarter profiles
│       │   ├── auth.py            # Role-based JWT authentication (Farmer, Vet, Admin)
│       │   ├── capa.py            # Corrective & Preventive Action endpoints & stats
│       │   ├── dashboard.py       # Herd KPIs, distribution charts & risk summaries
│       │   ├── dataset.py         # Dataset inspection and training feature export
│       │   ├── gis.py             # Farm paddock and shed geospatial coordinates
│       │   ├── health.py          # Clinical observations & SCC laboratory logs
│       │   ├── iot.py             # IoT device fleet telemetry & connectivity health
│       │   ├── ml_admin.py        # ML model metrics, retraining triggers & confusion matrix
│       │   ├── prediction.py      # 7–14 day predictive inference & SHAP feature drivers
│       │   ├── records.py         # Milking sessions & worker biosecurity hygiene logs
│       │   └── reports.py         # Automated compliance & herd summary export
│       ├── ml/
│       │   ├── baseline_calculator.py # Moving average baseline anomaly detection
│       │   ├── inference.py       # Inference pipeline & SHAP-style explanation generator
│       │   └── train_models.py    # Multi-model training pipeline (XGBoost, RF, Logistic)
│       └── ml_models/
│           ├── xgboost_mastitis.joblib # Trained XGBoost Model (Production)
│           ├── rf_mastitis.joblib      # Trained Random Forest Model
│           ├── lr_mastitis.joblib      # Logistic Regression Baseline
│           └── metrics.json            # Model Evaluation Metrics & ROC Curves
│
└── frontend/                      # REACT 19 + TYPESCRIPT + VITE FRONTEND
    ├── package.json               # NPM Dependencies & Scripts
    ├── vite.config.ts             # Vite Configuration with /api Backend Proxy
    ├── index.html                 # Single Page Application HTML Template
    ├── src/
    │   ├── main.tsx               # React DOM Entrypoint
    │   ├── App.tsx                # Main App Router & Sidebar State
    │   ├── index.css              # Global Design Tokens & Tailwind Directives
    │   ├── services/
    │   │   └── api.ts             # Axios API Client Connecting to FastAPI
    │   ├── types/
    │   │   └── index.ts           # Unified TypeScript Data Contracts
    │   ├── i18n/
    │   │   └── translations.ts    # Trilingual Dictionary (English, Hindi, Punjabi)
    │   ├── components/
    │   │   ├── Navbar.tsx         # Language Switcher, Alerts & Role Selector
    │   │   ├── Sidebar.tsx        # Responsive Sidebar with CAPA Integration
    │   │   └── DataSourceBadge.tsx# Telemetry Source Status Indicator
    │   └── pages/                 # 18 Production-Ready Dashboard Views:
    │       ├── DashboardPage.tsx          # Herd Risk Index, Active Alerts & Species Ratio
    │       ├── AnimalProfilePage.tsx      # Individual Bovine Profile & Quarter Heatmaps
    │       ├── RiskProgressionPage.tsx    # 7–14 Day Predictive Trajectory Charts
    │       ├── CapaPage.tsx               # ISO/HACCP Corrective & Preventive Action Hub
    │       ├── MilkingManagementPage.tsx  # Shift Intervals & Worker Hygiene Biosecurity
    │       ├── IotDevicesPage.tsx         # Fleet Health, Battery & Calibration Drift
    │       ├── SmartCollarPage.tsx        # Collar Accelerometry, Rumination & Rest
    │       ├── MilkSensorPage.tsx         # Inline Conductivity, Yield & Temperature
    │       ├── EnvironmentPage.tsx        # Microclimate THI Heat Stress Index
    │       ├── GisFarmMapPage.tsx         # Farm Paddock & Shed Geospatial Map
    │       ├── HerdManagementPage.tsx     # Cattle & Buffalo Inventory Management
    │       ├── DiseaseTreatmentPage.tsx   # Disease History & Veterinary Regimens
    │       ├── VaccinationPage.tsx        # Immunization Schedule & Booster Alerts
    │       ├── LabRecordsPage.tsx         # Laboratory SCC & Bacterial Culture Logs
    │       ├── FeedingPage.tsx            # Ration Nutrition & Dry Matter Intake (DMI)
    │       ├── HygieneHousingPage.tsx     # Bedding Moisture & Sanitation Audits
    │       ├── ReportsPage.tsx            # Compliance Export & Performance Audits
    │       ├── ModelPerformancePage.tsx   # ROC Curves, Confusion Matrix & Metrics
    │       └── ArchitecturePage.tsx       # Interactive System Architecture Diagram
```

---

## 🤖 Machine Learning Pipeline & Metrics

Models are trained on synthetic dairy datasets calibrated to empirical bovine physiology:
* **Features**: Electrical conductivity (mS/cm), somatic cell count (SCC), rumination time (min/day), neck activity, milk temperature (°C), quarter milk yield (kg), lactation stage, parity, shed THI.
* **Target**: Binary mastitis risk flag at a **7–14 day predictive horizon**.

### Model Evaluation Benchmark

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **XGBoost Classifier** *(Production)* | **93.75%** | **94.12%** | **94.12%** | **0.9412** | **0.9850** |
| **Random Forest Classifier** | 93.75% | 94.12% | 93.75% | 0.9375 | 0.9800 |
| **Logistic Regression** *(Baseline)* | 75.00% | 77.14% | 75.00% | 0.7714 | 0.8120 |

---

## 🛡️ Corrective and Preventive Action (CAPA) System

Compliant with dairy quality management standards (**ISO 22000 / HACCP**):
* **Dual Action Paradigm**:
  * **Corrective Action**: Immediate containment (e.g., quarter milking diversion, paddock quarantine, bedding remediation).
  * **Preventive Action**: Systemic mitigation (e.g., teat dip contact retraining, claw vacuum calibration, pasture rotation).
* **Lifecycle Workflow**: `OPEN` → `IN_PROGRESS` → `UNDER_REVIEW` → `RESOLVED`.
* **Veterinary Sign-Off**: Verification notes, sign-off timestamps, and veterinary registration tracking.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & **npm 9+**
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/ikaur9898kaur/SmartMastitis_AI.git
cd SmartMastitis_AI
```

### 2. Backend Setup
```bash
cd backend

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Seed the database with 80 animals and telemetry
python -m app.seed.seed_data

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **Swagger UI API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
* **Web Application**: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🧪 Automated Testing

Run the integration and API test suite:
```bash
cd backend
python -m pytest -v tests/test_api.py
```
*All 13 integration test suites validate animal retrieval, 7–14 day predictive inference, CAPA workflows, IoT telemetry, and milking hygiene compliance.*

---

## 📜 Biosecurity & Safety Guardrails

> **IMPORTANT**:
> 1. **Decision Support Only**: SmartMastitis AI provides early predictive risk indices; it does **not** replace professional clinical diagnosis by a licensed veterinarian.
> 2. **Zero Autonomous Antibiotic Prescriptions**: All pharmaceutical interventions require an authorized veterinary prescription in accordance with national dairy biosecurity regulations.
> 3. **Milk Safety**: Milk from cows with elevated conductivity or suspected inflammation must be diverted and tested in accordance with food safety standards.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
