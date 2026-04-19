# backend/app/api/routes/auth.py

from fastapi import APIRouter

# Création du router pour les routes d'authentification
router = APIRouter(prefix="/auth", tags=["Authentification"])

# Route de test pour vérifier le fonctionnement du router
@router.get("/test")
def test_auth():
    return {"message": "route auth fonctionnelle"}