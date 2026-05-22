# backend/app/api/routes/auth.py

from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from ...core.database import get_db
from ...core.security import hasher_mot_de_passe, verifier_mot_de_passe, creer_token_acces
from ...core.dependencies import obtenir_utilisateur_actuel, admin_seulement
from ...models.user import User
from ...models.audit import AuditLog
from ...schemas.user import UserCreer, UserConnexion, UserReponse, TokenReponse

# Création du router pour les routes d'authentification
router = APIRouter(prefix="/auth", tags=["Authentification"])

# Route pour l'inscription d'un nouvel utilisateur
@router.post("/inscription", response_model=UserReponse)
def inscription_utilisateur(
    utilisateur: UserCreer,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Route pour inscrire un nouvel utilisateur.
    
    - Vérifie que l'email n'existe pas déjà
    - Hash le mot de passe
    - Crée l'utilisateur en base de données
    - Enregistre l'action dans l'audit log
    """
    # Vérifier que l'email n'existe pas déjà
    utilisateur_existant = db.query(User).filter(User.email == utilisateur.email).first()
    if utilisateur_existant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà"
        )
    
    # Hasher le mot de passe
    mot_de_passe_hashe = hasher_mot_de_passe(utilisateur.mot_de_passe)
    
    # Créer le nouvel utilisateur
    nouvel_utilisateur = User(
        nom=utilisateur.nom,
        prenom=utilisateur.prenom,
        email=utilisateur.email,
        mot_de_passe=mot_de_passe_hashe,
        role=utilisateur.role
    )
    
    # Ajouter à la base de données
    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur)
    
    # Enregistrer dans l'audit log avec détails enrichis
    details_audit = f"Nouvel utilisateur créé : {utilisateur.prenom} {utilisateur.nom} ({utilisateur.email}) | Rôle: {utilisateur.role}"
    audit_log = AuditLog(
        utilisateur_id=nouvel_utilisateur.id,
        action="inscription",
        adresse_ip=request.client.host,
        details=details_audit
    )
    db.add(audit_log)
    db.commit()
    
    return nouvel_utilisateur

# Route pour la connexion d'un utilisateur (JSON)
@router.post("/connexion", response_model=TokenReponse)
def connexion_utilisateur(
    utilisateur: UserConnexion,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Route pour connecter un utilisateur avec données JSON.
    
    - Vérifie les identifiants
    - Crée un token JWT si connexion réussie
    - Enregistre l'action dans l'audit log
    """
    # Chercher l'utilisateur par email
    utilisateur_db = db.query(User).filter(User.email == utilisateur.email).first()
    
    # Vérifier le mot de passe
    if not utilisateur_db or not verifier_mot_de_passe(utilisateur.mot_de_passe, utilisateur_db.mot_de_passe):
        # Enregistrer l'échec de connexion dans l'audit log avec détails enrichis
        if utilisateur_db:
            details_audit = f"Tentative échouée avec mauvais mot de passe | Email: {utilisateur.email}"
            audit_log = AuditLog(
                utilisateur_id=utilisateur_db.id,
                action="echec_connexion",
                adresse_ip=request.client.host,
                details=details_audit
            )
            db.add(audit_log)
            db.commit()
        else:
            # Email non trouvé
            details_audit = f"Tentative échouée avec email inexistant | Email: {utilisateur.email}"
            # On ne peut pas enregistrer sans utilisateur_id, on continue juste
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier que le compte est actif
    if not utilisateur_db.est_actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte utilisateur inactif"
        )
    
    # Créer le token d'accès
    donnees_token = {"sub": utilisateur_db.email, "role": utilisateur_db.role}
    access_token = creer_token_acces(donnees_token)
    
    # Enregistrer la connexion réussie dans l'audit log avec détails enrichis
    details_audit = f"Connexion réussie | Email: {utilisateur_db.email} | Rôle: {utilisateur_db.role}"
    audit_log = AuditLog(
        utilisateur_id=utilisateur_db.id,
        action="connexion",
        adresse_ip=request.client.host,
        details=details_audit
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": utilisateur_db.role,
        "nom": utilisateur_db.nom,
        "prenom": utilisateur_db.prenom
    }

# Route OAuth2 pour Swagger UI (formulaire username/password)
@router.post("/token")
def obtenir_token_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Route OAuth2 compatible avec Swagger UI.
    
    Le 'username' du formulaire correspond à l'email de l'utilisateur.
    Utilisée par le bouton Authorize de Swagger pour obtenir un token.
    """
    # Le username du formulaire est l'email
    email = form_data.username
    mot_de_passe = form_data.password
    
    # Chercher l'utilisateur par email
    utilisateur_db = db.query(User).filter(User.email == email).first()
    
    # Vérifier le mot de passe
    if not utilisateur_db or not verifier_mot_de_passe(mot_de_passe, utilisateur_db.mot_de_passe):
        # Enregistrer l'échec de connexion dans l'audit log avec détails enrichis
        if utilisateur_db:
            details_audit = f"Tentative OAuth2 échouée avec mauvais mot de passe | Email: {email}"
            audit_log = AuditLog(
                utilisateur_id=utilisateur_db.id,
                action="echec_connexion",
                adresse_ip=request.client.host if request else "127.0.0.1",
                details=details_audit
            )
            db.add(audit_log)
            db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Vérifier que le compte est actif
    if not utilisateur_db.est_actif:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte utilisateur inactif"
        )
    
    # Créer le token d'accès
    donnees_token = {"sub": utilisateur_db.email, "role": utilisateur_db.role}
    access_token = creer_token_acces(donnees_token)
    
    # Enregistrer la connexion réussie dans l'audit log avec détails enrichis
    details_audit = f"Connexion OAuth2 réussie | Email: {utilisateur_db.email} | Rôle: {utilisateur_db.role}"
    audit_log = AuditLog(
        utilisateur_id=utilisateur_db.id,
        action="connexion",
        adresse_ip=request.client.host if request else "127.0.0.1",
        details=details_audit
    )
    db.add(audit_log)
    db.commit()
    
    # Retourner le format OAuth2 standard avec informations utilisateur
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": utilisateur_db.role,
        "nom": utilisateur_db.nom,
        "prenom": utilisateur_db.prenom
    }

# Route pour obtenir les informations de l'utilisateur connecté
@router.get("/moi", response_model=UserReponse)
def obtenir_utilisateur_connecte(
    utilisateur_actuel: User = Depends(obtenir_utilisateur_actuel)
):
    """
    Route protégée pour obtenir les informations de l'utilisateur connecté.
    
    Nécessite un token JWT valide dans le header Authorization.
    """
    return utilisateur_actuel

# Route pour obtenir la liste de tous les utilisateurs (admin seulement)
@router.get("/utilisateurs", response_model=List[UserReponse])
def obtenir_tous_utilisateurs(
    utilisateur_actuel: User = Depends(admin_seulement),
    db: Session = Depends(get_db)
):
    """
    Route protégée pour obtenir la liste de tous les utilisateurs.
    
    Réservée aux administrateurs uniquement.
    """
    utilisateurs = db.query(User).all()
    return utilisateurs

# Route pour supprimer un utilisateur (admin seulement)
@router.delete("/utilisateurs/{utilisateur_id}")
async def supprimer_utilisateur(
    utilisateur_id: int,
    request: Request,
    db: Session = Depends(get_db),
    utilisateur_actuel = Depends(admin_seulement)
):
    """
    Route pour supprimer un utilisateur du système.
    
    - Réservée aux administrateurs uniquement
    - Empêche un admin de se supprimer lui-même
    - Enregistre l'action dans l'audit log
    """
    # Vérifier que l'utilisateur existe
    utilisateur_a_supprimer = db.query(User).filter(User.id == utilisateur_id).first()
    if not utilisateur_a_supprimer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Empêcher l'admin de se supprimer lui-même
    if utilisateur_actuel.id == utilisateur_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )
    
    # Récupérer les informations de l'utilisateur à supprimer avant suppression
    nom_utilisateur_supprime = f"{utilisateur_a_supprimer.prenom} {utilisateur_a_supprimer.nom}"
    email_utilisateur_supprime = utilisateur_a_supprimer.email
    role_utilisateur_supprime = utilisateur_a_supprimer.role
    
    # Enregistrer l'action dans l'audit log avant suppression avec détails enrichis
    details_audit = f"Utilisateur supprimé : {nom_utilisateur_supprime} ({email_utilisateur_supprime}) | Rôle: {role_utilisateur_supprime} | Supprimé par: {utilisateur_actuel.prenom} {utilisateur_actuel.nom}"
    audit_log = AuditLog(
        utilisateur_id=utilisateur_actuel.id,
        action="suppression_utilisateur",
        adresse_ip=request.client.host,
        details=details_audit
    )
    db.add(audit_log)
    
    # Supprimer l'utilisateur
    db.delete(utilisateur_a_supprimer)
    db.commit()
    
    return {"message": "Utilisateur supprimé avec succès"}