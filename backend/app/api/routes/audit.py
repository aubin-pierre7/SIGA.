# backend/app/api/routes/audit.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from ...core.database import get_db
from ...core.dependencies import admin_seulement, tous_les_roles
from ...models.audit import AuditLog
from ...models.document import Document
from ...models.user import User
from ...schemas.document import AuditLogReponse

# Création du router pour les routes d'audit
router = APIRouter(prefix="/audit", tags=["Audit"])

# Route pour lister tous les logs d'audit (admin seulement)
@router.get("/logs", response_model=List[AuditLogReponse])
def lister_logs_audit(
    skip: int = Query(0, ge=0, description="Nombre d'éléments à sauter pour la pagination"),
    limit: int = Query(100, ge=1, le=1000, description="Nombre maximum d'éléments à retourner"),
    action: Optional[str] = Query(None, description="Filtrer par type d'action"),
    utilisateur_id: Optional[int] = Query(None, description="Filtrer par ID utilisateur"),
    utilisateur_actuel = Depends(admin_seulement),
    db: Session = Depends(get_db)
):
    """
    Liste tous les logs d'audit avec possibilité de filtrage et pagination.
    
    Réservé aux administrateurs uniquement. Permet de consulter
    l'historique complet des actions dans le système.
    """
    # Construire la requête de base
    query = db.query(AuditLog)
    
    # Appliquer les filtres optionnels
    if action:
        query = query.filter(AuditLog.action == action)
    if utilisateur_id:
        query = query.filter(AuditLog.utilisateur_id == utilisateur_id)
    
    # Ordonner par date décroissante et appliquer la pagination
    logs = query.order_by(AuditLog.date_action.desc()).offset(skip).limit(limit).all()
    
    return logs

# Route pour obtenir un log spécifique (admin seulement)
@router.get("/logs/{log_id}", response_model=AuditLogReponse)
def obtenir_log_specifique(
    log_id: int,
    utilisateur_actuel = Depends(admin_seulement),
    db: Session = Depends(get_db)
):
    """
    Obtient les détails d'un log d'audit spécifique.
    
    Réservé aux administrateurs uniquement.
    """
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    
    if not log:
        raise HTTPException(status_code=404, detail="Log d'audit non trouvé")
    
    return log

# Route pour voir ses propres activités (tous les rôles)
@router.get("/mes-activites", response_model=List[AuditLogReponse])
def obtenir_mes_activites(
    utilisateur_actuel = Depends(tous_les_roles),
    db: Session = Depends(get_db)
):
    """
    Obtient les 50 dernières activités de l'utilisateur connecté.
    
    Accessible à tous les utilisateurs pour consulter leur propre historique.
    """
    logs = db.query(AuditLog).filter(
        AuditLog.utilisateur_id == utilisateur_actuel.id
    ).order_by(AuditLog.date_action.desc()).limit(50).all()
    
    return logs

# Route pour obtenir les statistiques globales (admin seulement)
@router.get("/statistiques")
def obtenir_statistiques(
    utilisateur_actuel = Depends(admin_seulement),
    db: Session = Depends(get_db)
):
    """
    Obtient des statistiques globales sur le système.
    
    Réservé aux administrateurs uniquement. Fournit un aperçu
    des métriques importantes du système SIGA.
    """
    # Date d'aujourd'hui
    aujourd_hui = date.today()
    
    # Statistiques de base
    total_documents = db.query(Document).count()
    total_utilisateurs = db.query(User).count()
    total_logs = db.query(AuditLog).count()
    
    # Statistiques d'aujourd'hui
    uploads_aujourd_hui = db.query(AuditLog).filter(
        AuditLog.action == "upload",
        AuditLog.date_action >= aujourd_hui
    ).count()
    
    telechargements_aujourd_hui = db.query(AuditLog).filter(
        AuditLog.action == "telechargement",
        AuditLog.date_action >= aujourd_hui
    ).count()
    
    connexions_aujourd_hui = db.query(AuditLog).filter(
        AuditLog.action == "connexion",
        AuditLog.date_action >= aujourd_hui
    ).count()
    
    # Retourner les statistiques
    return {
        "total_documents": total_documents,
        "total_utilisateurs": total_utilisateurs,
        "total_logs_audit": total_logs,
        "activite_aujourd_hui": {
            "uploads": uploads_aujourd_hui,
            "telechargements": telechargements_aujourd_hui,
            "connexions": connexions_aujourd_hui
        },
        "date_statistiques": aujourd_hui.isoformat()
    }