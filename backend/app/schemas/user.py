# backend/app/schemas/user.py

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

# Schéma pour créer un nouvel utilisateur
class UserCreer(BaseModel):
    # Nom de famille de l'utilisateur
    nom: str
    # Prénom de l'utilisateur
    prenom: str
    # Adresse email de l'utilisateur (doit être valide)
    email: EmailStr
    # Mot de passe de l'utilisateur (minimum 8 caractères)
    mot_de_passe: str = Field(min_length=8)
    # Rôle de l'utilisateur (valeurs autorisées : "admin", "agent", "lecteur")
    role: str = Field(default="lecteur", pattern="^(admin|agent|lecteur)$")

# Schéma pour la connexion d'un utilisateur
class UserConnexion(BaseModel):
    # Adresse email de l'utilisateur pour la connexion
    email: EmailStr
    # Mot de passe de l'utilisateur pour la connexion
    mot_de_passe: str

# Schéma de réponse pour les informations utilisateur (sans mot de passe)
class UserReponse(BaseModel):
    # Identifiant unique de l'utilisateur
    id: int
    # Nom de famille de l'utilisateur
    nom: str
    # Prénom de l'utilisateur
    prenom: str
    # Adresse email de l'utilisateur
    email: str
    # Rôle de l'utilisateur
    role: str
    # Statut d'activité du compte
    est_actif: bool
    # Date de création du compte
    date_creation: datetime
    
    # Configuration pour permettre la conversion depuis les modèles SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

# Schéma de réponse après connexion réussie
class TokenReponse(BaseModel):
    # Token d'accès JWT
    access_token: str
    # Type de token (toujours "bearer")
    token_type: str = "bearer"
    # Rôle de l'utilisateur connecté
    role: str
    # Nom de l'utilisateur connecté
    nom: str
    # Prénom de l'utilisateur connecté
    prenom: str