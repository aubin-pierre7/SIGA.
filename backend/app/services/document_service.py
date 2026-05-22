# backend/app/services/document_service.py

from ..core.encryption import chiffrer_fichier, dechiffrer_fichier, calculer_hash_sha256
from ..models.document import Document
from ..models.audit import AuditLog
from ..models.user import User
from ..core.config import settings
import uuid, os
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..ia.text_extractor import extraire_texte
from ..ia.classifier import obtenir_categorie
from ..ia.extractor import extraire_metadonnees
from ..ia.confidentiality import analyser_confidentialite
import json

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
    Intègre les analyses IA : extraction de texte, classification,
    métadonnées et analyse de confidentialité.
    
    Args:
        db (Session): Session de base de données
        fichier: Objet fichier uploadé (FastAPI UploadFile)
        titre (str): Titre du document
        niveau_confidentialite (str): Niveau de confidentialité (optionnel)
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
    
    # Extraire le texte du document pour les analyses IA
    texte = extraire_texte(contenu, fichier.filename)
    
    # Classifier le document avec IA
    categorie = obtenir_categorie(texte)
    
    # Extraire les métadonnées avec IA (spaCy + regex)
    metadonnees = extraire_metadonnees(texte)
    
    # Analyser la confidentialité avec IA seulement si non fournie par l'utilisateur
    if not niveau_confidentialite or niveau_confidentialite.strip() == "":
        analyse = analyser_confidentialite(texte)
        niveau_final = analyse["niveau_suggere"]
        source_confidentialite = "IA"
    else:
        niveau_final = niveau_confidentialite
        source_confidentialite = "utilisateur"
    
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
    
    # Créer l'entrée en base de données avec les analyses IA
    document = Document(
        titre=titre,
        nom_fichier_original=fichier.filename,
        nom_fichier_chiffre=nom_fichier_chiffre,
        type_document=categorie,  # Classification IA
        niveau_confidentialite=niveau_final,  # Niveau final (IA ou utilisateur)
        hash_sha256=hash_sha256,
        taille_fichier=len(contenu),
        uploade_par=utilisateur_id,
        metadonnees_ia=json.dumps(metadonnees, ensure_ascii=False)  # Métadonnées IA en JSON
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Enregistrer dans l'audit avec détails enrichis
    details_audit = f"Document '{titre}' uploadé ({len(contenu)} octets) | Catégorie IA: {categorie} | Confidentialité: {niveau_final} ({source_confidentialite}) | Hash: {hash_sha256[:16]}..."
    enregistrer_audit(
        db=db,
        utilisateur_id=utilisateur_id,
        action="upload",
        adresse_ip=adresse_ip,
        document_id=document.id,
        details=details_audit
    )
    
    return document

# Fonction pour télécharger et déchiffrer un document
def telecharger_document(db: Session, document_id: int, utilisateur_id: int, role: str, adresse_ip: str):
    """
    Télécharge et déchiffre un document.
    
    Recherche le document en base, lit le fichier chiffré,
    le déchiffre et enregistre l'action dans l'audit.
    
    Respecte les permissions :
    - Admin : peut télécharger tous les documents
    - Agent : peut télécharger uniquement ses propres documents
    - Lecteur : peut télécharger uniquement les documents publics
    
    Args:
        db (Session): Session de base de données
        document_id (int): ID du document à télécharger
        utilisateur_id (int): ID de l'utilisateur qui télécharge
        role (str): Rôle de l'utilisateur (admin, agent, lecteur)
        adresse_ip (str): Adresse IP de l'utilisateur
        
    Returns:
        tuple: (contenu_déchiffré, nom_fichier_original)
        
    Raises:
        HTTPException: Si document non trouvé, fichier manquant ou permissions insuffisantes
    """
    # Chercher le document en base
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document non trouvé")
    
    # Vérifier les permissions selon le rôle
    if role == "admin":
        # Admin : accès à tous les documents
        pass
    elif role == "agent":
        # Agent : ne peut télécharger que ses propres documents
        if document.uploade_par != utilisateur_id:
            raise HTTPException(
                status_code=403, 
                detail="Vous n'avez pas la permission de télécharger ce document"
            )
    elif role == "lecteur":
        # Lecteur : ne peut télécharger que les documents publics
        if document.niveau_confidentialite != "public":
            raise HTTPException(
                status_code=403, 
                detail="Vous n'avez accès qu'aux documents publics"
            )
    
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
    
    # Enregistrer dans l'audit avec détails enrichis
    details_audit = f"Document '{document.titre}' téléchargé ({document.taille_fichier} octets) | Confid: {document.niveau_confidentialite}"
    enregistrer_audit(
        db=db,
        utilisateur_id=utilisateur_id,
        action="telechargement",
        adresse_ip=adresse_ip,
        document_id=document_id,
        details=details_audit
    )
    
    return contenu_original, document.nom_fichier_original

# Fonction pour lister les documents selon les permissions utilisateur
def lister_documents(db: Session, utilisateur_id: int, role: str):
    """
    Liste les documents selon les permissions de l'utilisateur.
    
    Les permissions sont :
    - Admin : voit TOUS les documents de TOUS les utilisateurs
    - Agent : voit UNIQUEMENT ses propres documents
    - Lecteur : voit UNIQUEMENT les documents marqués "public"
    
    Args:
        db (Session): Session de base de données
        utilisateur_id (int): ID de l'utilisateur
        role (str): Rôle de l'utilisateur (admin, agent, lecteur)
        
    Returns:
        dict: {"documents": liste_documents, "total": nombre_total}
    """
    if role == "admin":
        # Administrateur : tous les documents
        documents = db.query(Document).all()
    elif role == "agent":
        # Agent : seulement ses propres documents
        documents = db.query(Document).filter(Document.uploade_par == utilisateur_id).all()
    elif role == "lecteur":
        # Lecteur : seulement les documents publics
        documents = db.query(Document).filter(Document.niveau_confidentialite == "public").all()
    else:
        documents = []
    
    return {
        "documents": documents,
        "total": len(documents)
    }

# Fonction pour supprimer un document
def supprimer_document(db: Session, document_id: int, utilisateur_id: int, 
                      role: str, adresse_ip: str):
    """
    Supprime un document (fichier physique et entrée base de données).
    
    Les permissions sont :
    - Admin : peut supprimer n'importe quel document
    - Agent : ne peut supprimer que ses propres documents
    - Lecteur : ne peut pas supprimer
    
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
    
    # Vérifier les permissions selon le rôle
    if role == "lecteur":
        # Lecteur : ne peut pas supprimer
        raise HTTPException(
            status_code=403, 
            detail="Vous n'avez pas la permission de supprimer des documents"
        )
    elif role == "agent":
        # Agent : ne peut supprimer que ses propres documents
        if document.uploade_par != utilisateur_id:
            raise HTTPException(
                status_code=403, 
                detail="Vous pouvez uniquement supprimer vos propres documents"
            )
    # Admin : peut tout supprimer, pas besoin de vérification
    
    # Récupérer le nom de l'utilisateur qui supprime
    utilisateur = db.query(User).filter(User.id == utilisateur_id).first()
    utilisateur_nom = f"{utilisateur.prenom} {utilisateur.nom}" if utilisateur else "Utilisateur inconnu"
    
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
    
    # Enregistrer dans l'audit avec détails enrichis
    details_audit = f"Document '{document.titre}' supprimé par {utilisateur_nom} | Taille: {document.taille_fichier} octets | Confid: {document.niveau_confidentialite}"
    enregistrer_audit(
        db=db,
        utilisateur_id=utilisateur_id,
        action="suppression",
        adresse_ip=adresse_ip,
        document_id=document_id,
        details=details_audit
    )
    
    return f"Document '{document.titre}' supprimé avec succès"