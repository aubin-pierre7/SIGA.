# backend/app/api/routes/documents.py

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import StreamingResponse
from ...services.document_service import (
    sauvegarder_document, telecharger_document, lister_documents, supprimer_document
)
from ...core.dependencies import agent_ou_admin, tous_les_roles
from ...core.database import get_db
from ...schemas.document import DocumentReponse, DocumentListe
from sqlalchemy.orm import Session
from ...models.document import Document

import io

# Création du router pour les routes de gestion des documents
router = APIRouter(prefix="/documents", tags=["Documents"])

# Route pour uploader un document
@router.post("/upload", response_model=DocumentReponse)
def upload_document(
    fichier: UploadFile = File(...),
    titre: str = Form(..., min_length=2),
    niveau_confidentialite: str = Form(...),
    utilisateur_actuel = Depends(agent_ou_admin),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Upload un document avec chiffrement AES-256-GCM.
    
    Seuls les agents et administrateurs peuvent uploader des documents.
    Le fichier est chiffré avant sauvegarde et un hash SHA-256 est calculé
    pour vérifier l'intégrité du document à tout moment.
    """
    # Récupérer l'adresse IP
    adresse_ip = request.client.host if request else "127.0.0.1"
    
    # Sauvegarder le document via le service
    document = sauvegarder_document(
        db=db,
        fichier=fichier,
        titre=titre,
        niveau_confidentialite=niveau_confidentialite,
        utilisateur_id=utilisateur_actuel.id,
        adresse_ip=adresse_ip
    )
    
    return document

# Route pour lister les documents
@router.get("/", response_model=DocumentListe)
def lister_tous_documents(
    utilisateur_actuel = Depends(tous_les_roles),
    db: Session = Depends(get_db)
):
    """
    Liste les documents selon les permissions de l'utilisateur.
    
    Les administrateurs voient tous les documents,
    les agents voient seulement leurs propres documents,
    les lecteurs ne voient que les documents publics.
    """
    resultat = lister_documents(
        db=db,
        utilisateur_id=utilisateur_actuel.id,
        role=utilisateur_actuel.role
    )
    
    return resultat

# Route pour obtenir les détails d'un document spécifique
@router.get("/{document_id}", response_model=DocumentReponse)
def obtenir_document(
    document_id: int,
    utilisateur_actuel = Depends(tous_les_roles),
    db: Session = Depends(get_db)
):
    """
    Obtient les détails d'un document spécifique.
    
    Tous les utilisateurs peuvent voir les détails des documents,
    mais seules les permissions de téléchargement s'appliquent.
    """
    # Chercher le document
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    return document

# Route pour télécharger un document
@router.get("/{document_id}/telecharger")
def telecharger_document_route(
    document_id: int,
    utilisateur_actuel = Depends(tous_les_roles),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Télécharge et déchiffre un document.
    
    Tous les utilisateurs peuvent télécharger les documents selon leurs permissions.
    Le fichier est déchiffré à la volée et servi avec les headers appropriés.
    """
    # Récupérer l'adresse IP
    adresse_ip = request.client.host if request else "127.0.0.1"
    
    # Télécharger le document via le service
    contenu, nom_fichier = telecharger_document(
        db=db,
        document_id=document_id,
        utilisateur_id=utilisateur_actuel.id,
        role=utilisateur_actuel.role,
        adresse_ip=adresse_ip
    )
    
    # Créer la réponse de streaming
    return StreamingResponse(
        io.BytesIO(contenu),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename={nom_fichier}",
            "Content-Length": str(len(contenu))
        }
    )

# Route pour supprimer un document
@router.delete("/{document_id}")
def supprimer_document_route(
    document_id: int,
    utilisateur_actuel = Depends(agent_ou_admin),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Supprime un document définitivement.
    
    Seuls les agents et administrateurs peuvent supprimer des documents,
    et seulement leurs propres documents (sauf administrateur qui peut tous).
    """
    # Récupérer l'adresse IP
    adresse_ip = request.client.host if request else "127.0.0.1"
    
    # Supprimer le document via le service
    message = supprimer_document(
        db=db,
        document_id=document_id,
        utilisateur_id=utilisateur_actuel.id,
        role=utilisateur_actuel.role,
        adresse_ip=adresse_ip
    )
    
    return {"message": message}