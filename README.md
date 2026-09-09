# SmartMastitis AI
### AI-Based Bovine Mastitis Prediction & Early Warning System

Integrated AI + ML + IoT-enabled bovine mastitis predictive forecasting platform for dairy cattle and buffaloes.

---

## Key Capabilities
- **7–14 Day Predictive Risk Horizon**: Subclinical forecasting before clinical signs emerge.
- **Multi-Species Coverage**: Cattle (*Sahiwal, Holstein Friesian, Gir, Jersey, Crossbred*) & Buffaloes (*Murrah, Nili-Ravi, Jaffarabadi*).
- **Corrective & Preventive Action (CAPA) System**: ISO/HACCP-aligned biosecurity action tracking, root-cause investigation, acute containment, and veterinary sign-off.
- **Biosecurity & Safety Guardrails**: Decision-support only; never declares confirmed mastitis without veterinary diagnosis; zero autonomous antibiotic prescriptions.
- **Telemetry Integration**: Smart Collar, inline milk sensors, shed microclimate (THI heat stress), milking schedules, and worker hygiene compliance.
- **Trilingual Localization**: English, हिन्दी (Hindi), ਪੰਜਾਬੀ (Punjabi).
- **Role-Based Access**: Farmer, Veterinarian, Farm Admin, and Field Cooperative Inspector.

---

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic, XGBoost, Scikit-learn, Pytest
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts
- **IoT & Hardware Protocols**: ESP32, REST, BLE / LoRa telemetry pipelines

---

## Quick Start

### 1. Backend Setup
`ash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
`
- Interactive API Docs (Swagger UI): http://127.0.0.1:8000/docs

### 2. Frontend Setup
`ash
cd frontend
npm install
npm run dev -- --port 5173
`
- Web Application: http://127.0.0.1:5173

---

## Automated Test Suite
`ash
cd backend
python -m pytest -v tests/test_api.py
`
