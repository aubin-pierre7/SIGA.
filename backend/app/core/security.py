# backend/app/core/security.py

from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, status
from .config import settings

# Contexte pour le hashage des mots de passe avec bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Fonction pour hasher un mot de passe
def hasher_mot_de_passe(mot_de_passe: str) -> str:
    """
    Hash un mot de passe en utilisant l'algorithme bcrypt.
    
    Args:
        mot_de_passe (str): Le mot de passe en clair à hasher
        
    Returns:
        str: Le mot de passe hashé
    """
    return pwd_context.hash(mot_de_passe)

# Fonction pour vérifier un mot de passe contre son hash
def verifier_mot_de_passe(mot_de_passe: str, hash: str) -> bool:
    """
    Vérifie si un mot de passe en clair correspond à son hash.
    
    Args:
        mot_de_passe (str): Le mot de passe en clair à vérifier
        hash (str): Le hash du mot de passe stocké
        
    Returns:
        bool: True si le mot de passe correspond, False sinon
    """
    return pwd_context.verify(mot_de_passe, hash)

# Fonction pour créer un token d'accès JWT
def creer_token_acces(donnees: dict) -> str:
    """
    Crée un token d'accès JWT avec une durée d'expiration.
    
    Args:
        donnees (dict): Les données à encoder dans le token
                        (généralement l'ID utilisateur et le rôle)
        
    Returns:
        str: Le token JWT encodé
    """
    # Créer une copie des données pour ne pas modifier l'original
    a_encoder = donnees.copy()
    
    # Ajouter la date d'expiration
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    a_encoder.update({"exp": expire})
    
    # Encoder le token avec la clé secrète et l'algorithme
    token_encode = jwt.encode(a_encoder, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token_encode

# Fonction pour décoder et valider un token JWT
def decoder_token(token: str) -> dict:
    """
    Décode et valide un token JWT.
    
    Args:
        token (str): Le token JWT à décoder
        
    Returns:
        dict: Les données décodées du token
        
    Raises:
        HTTPException: Si le token est invalide ou expiré
    """
    try:
        # Décoder le token avec la clé secrète et l'algorithme
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        # Lever une exception HTTP 401 si le token est invalide
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'accès invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )