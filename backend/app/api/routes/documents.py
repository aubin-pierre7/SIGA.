# backend/app/api/routes/documents.py

from fastapi import APIRouter

# Création du router pour les routes de gestion des documents
router = APIRouter(prefix="/documents", tags=["Documents"])

# Route de test pour vérifier le fonctionnement du router
@router.get("/test")
def test_documents():
    return {"message": "route documents fonctionnelle"}