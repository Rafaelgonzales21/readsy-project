# Punto de entrada del backend FastAPI

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_analysis import router as analysis_router

app = FastAPI(title="Academic Analyzer API")

# Configuración CORS - Sirve para que React se conecte con el backend

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar las rutas

app.include_router(analysis_router, prefix="/api")