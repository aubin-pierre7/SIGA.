# backend/app/models/audit.py

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)  # Identifiant unique auto-incrémenté
    utilisateur_id = Column(Integer, ForeignKey("users.id"))  # ID de l'utilisateur ayant effectué l'action
    action = Column(String, nullable=False)  # Action réalisée : "connexion", "upload", "download", "suppression", "echec_connexion"
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)  # ID du document concerné, optionnel
    adresse_ip = Column(String)  # Adresse IP de l'utilisateur lors de l'action
    details = Column(Text)  # Détails supplémentaires sur l'action
    date_action = Column(DateTime(timezone=True), server_default=func.now())  # Date de l'action automatique

    # Relations vers les modèles User et Document
    utilisateur = relationship("User")
    document = relationship("Document")