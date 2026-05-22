from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..core.database import Base

class AuditLog(Base):
    """
    Modèle pour enregistrer toutes les actions effectuées sur SIGA.
    Chaque action est tracée avec l'utilisateur, le timestamp et les détails.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    utilisateur_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    adresse_ip = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    date_action = Column(DateTime(timezone=True), server_default=func.now())