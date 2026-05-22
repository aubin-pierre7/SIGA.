# backend/app/api/routes/ocr.py

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Request
from ...core.dependencies import agent_ou_admin
from ...ia.ocr import extraire_texte_ocr
from pydantic import BaseModel

# Création du router pour les routes OCR
router = APIRouter(prefix="/ocr", tags=["OCR"])

# Schéma de réponse OCR
class OCRReponse(BaseModel):
    succes: bool
    texte: str
    titre_suggere: str
    confidentialite_suggeree: str
    erreur: str = None

# Route pour prévisualiser l'OCR d'une image
@router.post("/preview", response_model=OCRReponse)
def apercu_ocr(
    fichier: UploadFile = File(...),
    utilisateur_actuel = Depends(agent_ou_admin),
    request: Request = None
):
    """
    Extrait le texte d'une image via OCR PaddleOCR.
    
    Retourne :
    - Le texte extrait
    - Un titre suggéré
    - Un niveau de confidentialité suggéré
    
    L'utilisateur peut ensuite accepter ou modifier ces suggestions
    avant d'archiver le document.
    """
    try:
        # Lire le contenu du fichier
        contenu = fichier.file.read()
        
        # Extraire le texte avec OCR
        resultat = extraire_texte_ocr(contenu, fichier.filename)
        
        return OCRReponse(**resultat)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'OCR : {str(e)}"
        )