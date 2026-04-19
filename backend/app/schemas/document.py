# backend/app/schemas/document.py

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional

# Schéma pour créer un nouveau document lors de l'upload
class DocumentCreer(BaseModel):
    # Titre du document (obligatoire, minimum 2 caractères)
    titre: str = Field(min_length=2)
    # Description optionnelle du document
    description: Optional[str] = None
    # Type de document (rempli automatiquement par l'IA)
    type_document: Optional[str] = None
    # Niveau de confidentialité (valeurs autorisées : "public", "interne", "confidentiel", "secret")
    niveau_confidentialite: str = Field(
        default="interne", 
        pattern="^(public|interne|confidentiel|secret)$"
    )

# Schéma de réponse pour un document (données retournées au client)
class DocumentReponse(BaseModel):
    # Identifiant unique du document
    id: int
    # Titre du document
    titre: str
    # Nom du fichier original avant chiffrement
    nom_fichier_original: str
    # Type de document déterminé par l'IA
    type_document: str
    # Niveau de confidentialité du document
    niveau_confidentialite: str
    # Hash SHA-256 pour vérifier l'intégrité
    hash_sha256: str
    # Taille du fichier en octets
    taille_fichier: int
    # Date d'upload du document
    date_upload: datetime
    # ID de l'utilisateur qui a uploadé le document
    uploade_par: int
    # Métadonnées extraites par l'IA au format JSON
    metadonnees_ia: Optional[str] = None
    
    # Configuration pour permettre la conversion depuis les modèles SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

# Schéma de réponse pour la liste des documents
class DocumentListe(BaseModel):
    # Liste des documents
    documents: List[DocumentReponse]
    # Nombre total de documents
    total: int

# Schéma de réponse pour les logs d'audit
class AuditLogReponse(BaseModel):
    # Identifiant unique du log d'audit
    id: int
    # ID de l'utilisateur ayant effectué l'action (optionnel)
    utilisateur_id: Optional[int] = None
    # Action réalisée (connexion, upload, download, etc.)
    action: str
    # ID du document concerné (optionnel)
    document_id: Optional[int] = None
    # Adresse IP de l'utilisateur lors de l'action
    adresse_ip: Optional[str] = None
    # Détails supplémentaires sur l'action
    details: Optional[str] = None
    # Date et heure de l'action
    date_action: datetime
    
    # Configuration pour permettre la conversion depuis les modèles SQLAlchemy
    model_config = ConfigDict(from_attributes=True)