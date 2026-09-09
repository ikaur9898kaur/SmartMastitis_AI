# ==============================================================================
# SmartMastitis AI - Root ASGI Entrypoint (for Render Root Deployments)
# ==============================================================================
import os
import sys

# Add backend directory to Python sys.path so all internal imports resolve seamlessly
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import FastAPI application instance
from app.main import app
