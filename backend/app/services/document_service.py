# backend/app/services/document_service.py

from ..core.encryption import chiffrer_fichier, dechiffrer_fichier, calculer_hash_sha256
from ..models.document import Document
from ..models.audit import AuditLog
from ..core.config import settings
import uuid, os
from fastapi import HTTPException
from sqlalchemy.orm import Session

# Fonction pour enregistrer une action dans le journal d'audit
def enregistrer_audit(db: Session, utilisateur_id: int, action: str, adresse_ip: str, 
                     document_id: int = None, details: str = None):
    """
    Enregistre une action dans le journal d'audit.
    
    Crée un nouvel enregistrement AuditLog dans la base de données
    avec les informations fournies et commit automatiquement.
    
    Args:
        db (Session): Session de base de données
        utilisateur_id (int): ID de l'utilisateur qui effectue l'action
        action (str): Type d'action (upload, download, suppression, etc.)
        adresse_ip (str): Adresse IP de l'utilisateur
        document_id (int, optional): ID du document concerné
        details (str, optional): Détails supplémentaires
    """
    audit_log = AuditLog(
        utilisateur_id=utilisateur_id,
        action=action,
        document_id=document_id,
        adresse_ip=adresse_ip,
        details=details
    )
    db.add(audit_log)
    db.commit()

# Fonction pour sauvegarder un document uploadé avec chiffrement
def sauvegarder_document(db: Session, fichier, titre: str, niveau_confidentialite: str,
                        utilisateur_id: int, adresse_ip: str):
    """
    Sauvegarde un document uploadé avec chiffrement AES-256-GCM.
    
    Lit le contenu du fichier, calcule son hash, le chiffre,
    le sauvegarde sur le disque et crée l'entrée en base de données.
    
    Args:
        db (Session): Session de base de données
        fichier: Objet fichier uploadé (FastAPI UploadFile)
        titre (str): Titre du document
        niveau_confidentialite (str): Niveau de confidentialité
        utilisateur_id (int): ID de l'utilisateur qui upload
        adresse_ip (str): Adresse IP de l'utilisateur
        
    Returns:
        Document: Le document créé en base de données
        
    Raises:
        HTTPException: En cas d'erreur de lecture ou sauvegarde
    """
    # Lire le contenu du fichier uploadé
    try:
        contenu = fichier.file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de la lecture du fichier : {str(e)}")
    
    # Calculer le hash SHA-256 du fichier original
    hash_sha256 = calculer_hash_sha256(contenu)
    
    # Chiffrer le fichier
    contenu_chiffre = chiffrer_fichier(contenu)
    
    # Générer un nom unique pour le fichier chiffré
    nom_fichier_chiffre = f"{uuid.uuid4()}.enc"
    chemin_fichier = os.path.join(settings.MEDIA_DIR, nom_fichier_chiffre)
    
    # Sauvegarder le fichier chiffré sur le disque
    try:
        with open(chemin_fichier, "wb") as f:
            f.write(contenu_chiffre)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la sauvegarde du fichier : {str(e)}")
    
    # Créer l'entrée en base de données
    document = Document(
        titre=titre,
        nom_fichier_original=fichier.filename,
        nom_fichier_chiffre=nom_fichier_chiffre,
        type_document="non classifié",  # Sera mis à jour par l'IA
        niveau_confidentialite=niveau_confidentialite,
        hash_sha256=hash_sha256,
        taille_fichier=len(contenu),
        uploade_par=utilisateur_id
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Enregistrer dans l'audit
    enregistrer_audit(
        db=db,
        utilisateur_id=utilisateur_id,
        action="upload",
        adresse_ip=adresse_ip,
        document_id=document.id,
        details=f"Document '{titre}' uploadé"
    )
    
    return document

# Fonction pour télécharger et déchiffrer un document
def telecharger_document(db: Session, document_id: int, utilisateur_id: int, adresse_ip: str):
    """
    Télécharge et déchiffre un document.
    
    Recherche le document en base, lit le fichier chiffré,
    le déchiffre et enregistre l'action dans l'audit.
    
    Args:
        db (Session): Session de base de données
        document_id (int): ID du document à télécharger
        utilisateur_id (int): ID de l'utilisateur qui télécharge
        adresse_ip (str): Adresse IP de l'utilisateur
        
    Returns:
        tuple: (contenu_déchiffré, nom_fichier_original)
        
    Raises:
        HTTPException: Si document non trouvé ou fichier manquant
    """
    # Chercher le document en base
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    # Vérifier que le fichier physique existe
    chemin_fichier = os.path.join(settings.MEDIA_DIR, document.nom_fichier_chiffre)
    if not os.path.exists(chemin_fichier):
        raise HTTPException(status_code=404, detail="Fichier physique manquant")
    
    # Lire le fichier chiffré
    try:
        with open(chemin_fichier, "rb") as f:
            contenu_chiffre = f.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la lecture du fichier : {str(e)}")
    
    # Déchiffrer le fichier
    contenu_original = dechiffrer_fichier(contenu_chiffre)
    
    # Enregistrer dans l'audit
    enregistrer_audit(
        db=db,
        utilisateur_id=utilisateur_id,
        action="telechargement",
        adresse_ip=adresse_ip,
        document_id=document_id,
        details=f"Document '{document.titre}' téléchargé"
    )
    
    return contenu_original, document.nom_fichier_original

# Fonction pour lister les documents selon les permissions utilisateur
def lister_documents(db: Session, utilisateur_id: int, role: str):
    """
    Liste les documents selon les permissions de l'utilisateur.
    
    Les administrateurs voient tous les documents,
    les autres utilisateurs voient seulement leurs propres documents.
    
    Args:
        db (Session): Session de base de données
        utilisateur_id (int): ID de l'utilisateur
        role (str): Rôle de l'utilisateur
        
    Returns:
        dict: {"documents": liste_documents, "total": nombre_total}
    """
    if role == "admin":
        # Administrateur : tous les documents
        documents = db.query(Document).all()
    else:
        # Autres rôles : seulement leurs propres documents
        documents = db.query(Document).filter(Document.uploade_par == utilisateur_id).all()
    
    return {
        "documents": documents,
        "total": len(documents)
    }

# Fonction pour supprimer un document
def supprimer_document(db: Session, document_id: int, utilisateur_id: int, 
                      role: str, adresse_ip: str):
    """
    Supprime un document (fichier physique et entrée base de données).
    
    Seuls le propriétaire ou un administrateur peuvent supprimer.
    
    Args:
        db (Session): Session de base de données
        document_id (int): ID du document à supprimer
        utilisateur_id (int): ID de l'utilisateur qui supprime
        role (str): Rôle de l'utilisateur
        adresse_ip (str): Adresse IP de l'utilisateur
        
    Returns:
        str: Message de confirmation
        
    Raises:
        HTTPException: Si document non trouvé ou permissions insuffisantes
    """
    # Chercher le document
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    # Vérifier les permissions
    if role != "admin" and document.uploade_par != utilisateur_id:
        raise HTTPException(
            status_code=403, 
            detail="Vous n'avez pas la permission de supprimer ce document"
        )
    
    # Supprimer le fichier physique
    chemin_fichier = os.path.join(settings.MEDIA_DIR, document.nom_fichier_chiffre)
    if os.path.exists(chemin_fichier):
        try:
            os.remove(chemin_fichier)
        except Exception as e:
            # Log l'erreur mais continue la suppression en base
            print(f"Erreur lors de la suppression du fichier physique : {str(e)}")
    
    # Supprimer de la base de données
    db.delete(document)
    db.commit()
    
    # Enregistrer dans l'audit
    enregistrer_audit(
        db=db,
        utilisateur_id=utilisateur_id,
        action="suppression",
        adresse_ip=adresse_ip,
        document_id=document_id,
        details=f"Document '{document.titre}' supprimé"
    )
    
    return f"Document '{document.titre}' supprimé avec succès"