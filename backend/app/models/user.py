# backend/app/models/user.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)  # Identifiant unique auto-incrémenté
    nom = Column(String, nullable=False)  # Nom de famille de l'utilisateur
    prenom = Column(String, nullable=False)  # Prénom de l'utilisateur
    email = Column(String, unique=True, nullable=False, index=True)  # Adresse email unique et indexée
    mot_de_passe = Column(String, nullable=False)  # Mot de passe hashé
    role = Column(String, nullable=False)  # Rôle de l'utilisateur : "admin", "agent", ou "lecteur"
    est_actif = Column(Boolean, default=True)  # Statut d'activité du compte, True par défaut
    date_creation = Column(DateTime(timezone=True), server_default=func.now())  # Date de création automatique