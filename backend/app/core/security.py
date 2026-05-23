# backend/app/core/security.py

from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from .config import settings
from python_jose import JWTError, jwt

# Configuration du contexte de hachage avec Argon2 (plus robuste que bcrypt)
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

# Fonction pour hasher un mot de passe
def hasher_mot_de_passe(mot_de_passe: str) -> str:
    """
    Hache un mot de passe avec Argon2.
    
    Args:
        mot_de_passe (str): Le mot de passe en clair
        
    Returns:
        str: Le mot de passe hashé
    """
    return pwd_context.hash(mot_de_passe)

# Fonction pour vérifier un mot de passe
def verifier_mot_de_passe(mot_de_passe: str, hash: str) -> bool:
    """
    Vérifie si un mot de passe correspond à un hash Argon2.
    
    Args:
        mot_de_passe (str): Le mot de passe en clair
        hash (str): Le hash stocké en base de données
        
    Returns:
        bool: True si le mot de passe est correct, False sinon
    """
    return pwd_context.verify(mot_de_passe, hash)

# Fonction pour créer un token JWT
def creer_token_acces(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crée un token JWT d'accès avec les données fournies.
    
    Args:
        data (dict): Données à encoder dans le token
        expires_delta (Optional[timedelta]): Durée de validité du token
        
    Returns:
        str: Le token JWT
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm="HS256"
    )
    
    return encoded_jwt

# Fonction pour décoder un token JWT
def decoder_token(token: str) -> Optional[dict]:
    """
    Décode un token JWT et retourne les données.
    
    Args:
        token (str): Le token JWT
        
    Returns:
        Optional[dict]: Les données du token ou None si invalide
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        return payload
    except JWTError:
        return None