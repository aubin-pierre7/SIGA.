# backend/app/api/routes/audit.py

from fastapi import APIRouter

# Création du router pour les routes d'audit
router = APIRouter(prefix="/audit", tags=["Audit"])

# Route de test pour vérifier le fonctionnement du router
@router.get("/test")
def test_audit():
    return {"message": "route audit fonctionnelle"}