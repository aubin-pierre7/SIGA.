# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from .core.config import settings
from .core.database import engine, Base
from .core.init_db import init_db
from .api.routes import auth, documents, audit, ocr
from .models.user import User
from .models.document import Document
from .models.audit import AuditLog

# Création de l'application FastAPI avec titre, version et description
app = FastAPI(
    title="SIGA API",
    version="1.0.0",
    description="API pour le Système Intégré de Gestion d'Archives (SIGA)"
)

# Configuration CORS pour autoriser les requêtes du frontend (React ancien + Next.js nouveau)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Ancien frontend React Vite
        "http://localhost:3000",      # Nouveau frontend Next.js
        "http://127.0.0.1:3000",      # Nouveau frontend Next.js (local)
        "http://127.0.0.1:5173",      # Ancien frontend React (local)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Événement de démarrage pour initialiser la base de données et créer le dossier média
@app.on_event("startup")
def startup_event():
    # Créer les tables de la base de données si elles n'existent pas
    Base.metadata.create_all(bind=engine)
    
    # Créer le dossier media/encrypted s'il n'existe pas
    os.makedirs(settings.MEDIA_DIR, exist_ok=True)
    
    # Initialiser l'administrateur par défaut
    init_db()

# Route racine pour un message de bienvenue
@app.get("/")
def read_root():
    return {"message": f"Bienvenue sur {settings.APP_NAME} version {settings.APP_VERSION}"}

# Route de santé pour vérifier le fonctionnement de l'API
@app.get("/health")
def health_check():
    return {"status": "OK"}

# Inclusion des routers avec le préfixe /api
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(audit.router, prefix="/api", tags=["audit"])
app.include_router(ocr.router, prefix="/api", tags=["ocr"])