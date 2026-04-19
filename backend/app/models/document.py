# backend/app/models/document.py

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)  # Identifiant unique auto-incrémenté
    titre = Column(String, nullable=False)  # Titre du document
    nom_fichier_original = Column(String)  # Nom du fichier original avant chiffrement
    nom_fichier_chiffre = Column(String, unique=True, nullable=False)  # Nom du fichier chiffré, unique
    type_document = Column(String)  # Type de document déterminé par l'IA
    niveau_confidentialite = Column(String, nullable=False)  # Niveau de confidentialité : "public", "interne", "confidentiel", "secret"
    hash_sha256 = Column(String)  # Hash SHA-256 pour vérifier l'intégrité du fichier
    taille_fichier = Column(Integer)  # Taille du fichier en octets
    date_upload = Column(DateTime(timezone=True), server_default=func.now())  # Date d'upload automatique
    uploade_par = Column(Integer, ForeignKey("users.id"))  # ID de l'utilisateur qui a uploadé le document
    metadonnees_ia = Column(Text)  # Métadonnées extraites par l'IA au format JSON

    # Relation vers l'utilisateur qui a uploadé
    uploader = relationship("User")