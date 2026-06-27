# app/core/dependencies.py
"""
Dépendances FastAPI - Authentification et Autorisation
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List

from .database import get_db
from ..models.user import User
from .security import decoder_token

# Schéma OAuth2 pour extraire le token JWT depuis le header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def obtenir_utilisateur_actuel(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dépendance FastAPI pour récupérer l'utilisateur actuel depuis le token JWT.
    
    Args:
        token (str): Token JWT extrait du header Authorization
        db (Session): Session de base de données
        
    Returns:
        User: L'utilisateur authentifié
        
    Raises:
        HTTPException: 401 si token invalide, 403 si utilisateur inactif
    """
    # Décoder le token pour obtenir les données utilisateur
    payload = decoder_token(token)
    
    # ✅ VÉRIFICATION IMPORTANTE : Vérifier que le token est valide
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'accès invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extraire l'email depuis le payload du token
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'accès invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Chercher l'utilisateur dans la base de données
    utilisateur = db.query(User).filter(User.email == email).first()
    if utilisateur is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier que le compte est actif
    if not utilisateur.est_actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte utilisateur inactif",
        )
    
    return utilisateur

def verifier_role(roles_autorises: List[str]):
    """
    Crée une dépendance FastAPI qui vérifie que l'utilisateur actuel
    possède l'un des rôles autorisés.
    
    Args:
        roles_autorises (List[str]): Liste des rôles autorisés
        
    Returns:
        function: Fonction dépendance qui peut être utilisée avec Depends()
        
    Raises:
        HTTPException: 403 si le rôle de l'utilisateur n'est pas autorisé
    """
    def dependency(utilisateur_actuel: User = Depends(obtenir_utilisateur_actuel)):
        if utilisateur_actuel.role not in roles_autorises:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Rôle '{utilisateur_actuel.role}' non autorisé. Rôles requis : {', '.join(roles_autorises)}",
            )
        return utilisateur_actuel
    return dependency

# Dépendances prêtes à l'emploi pour les différents niveaux d'autorisation
admin_seulement = verifier_role(["admin"])
agent_ou_admin = verifier_role(["admin", "agent"])
tous_les_roles = verifier_role(["admin", "agent", "lecteur"])