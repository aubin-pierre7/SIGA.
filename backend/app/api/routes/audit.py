from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ...core.database import get_db
from ...core.dependencies import admin_seulement, tous_les_roles
from ...models.audit import AuditLog
from ...models.document import Document
from ...models.user import User
from ...schemas.document import AuditLogReponse

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("/logs")
def lister_logs_audit(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    action: Optional[str] = Query(None),
    utilisateur_id: Optional[int] = Query(None),
    utilisateur_actuel = Depends(admin_seulement),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    
    if action:
        query = query.filter(AuditLog.action == action)
    if utilisateur_id:
        query = query.filter(AuditLog.utilisateur_id == utilisateur_id)
    
    total = query.count()
    logs = query.order_by(AuditLog.date_action.desc()).offset(skip).limit(limit).all()
    
    # Transforme les logs pour afficher les noms au lieu des IDs
    logs_formattes = []
    for log in logs:
        # Récupère l'utilisateur depuis la base
        user = db.query(User).filter(User.id == log.utilisateur_id).first()
        utilisateur_nom = f"{user.prenom} {user.nom}" if user else "—"
        
        # Récupère le document depuis la base
        doc = db.query(Document).filter(Document.id == log.document_id).first() if log.document_id else None
        document_titre = doc.titre if doc else "—"
        
        log_dict = {
            "id": log.id,
            "action": log.action,
            "utilisateur_id": log.utilisateur_id,
            "utilisateur_nom": utilisateur_nom,
            "document_id": log.document_id,
            "document_titre": document_titre,
            "adresse_ip": log.adresse_ip or "—",
            "details": log.details or "—",
            "date_action": log.date_action
        }
        logs_formattes.append(log_dict)
    
    return {"logs": logs_formattes, "total": total}

@router.get("/logs/{log_id}", response_model=AuditLogReponse)
def obtenir_log_specifique(
    log_id: int,
    utilisateur_actuel = Depends(admin_seulement),
    db: Session = Depends(get_db)
):
    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log d'audit non trouvé")
    return log

@router.get("/mes-activites")
def obtenir_mes_activites(
    utilisateur_actuel = Depends(tous_les_roles),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).filter(
        AuditLog.utilisateur_id == utilisateur_actuel.id
    ).order_by(AuditLog.date_action.desc()).limit(50).all()
    
    logs_formattes = []
    for log in logs:
        user = db.query(User).filter(User.id == log.utilisateur_id).first()
        utilisateur_nom = f"{user.prenom} {user.nom}" if user else "—"
        
        doc = db.query(Document).filter(Document.id == log.document_id).first() if log.document_id else None
        document_titre = doc.titre if doc else "—"
        
        log_dict = {
            "id": log.id,
            "action": log.action,
            "utilisateur_id": log.utilisateur_id,
            "utilisateur_nom": utilisateur_nom,
            "document_id": log.document_id,
            "document_titre": document_titre,
            "adresse_ip": log.adresse_ip or "—",
            "details": log.details or "—",
            "date_action": log.date_action
        }
        logs_formattes.append(log_dict)
    
    return {"logs": logs_formattes}

@router.get("/statistiques")
def obtenir_statistiques(
    utilisateur_actuel = Depends(admin_seulement),
    db: Session = Depends(get_db)
):
    aujourd_hui = date.today()
    
    total_documents = db.query(Document).count()
    total_utilisateurs = db.query(User).count()
    
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
    
    actions_aujourd_hui = uploads_aujourd_hui + telechargements_aujourd_hui + connexions_aujourd_hui
    
    return {
        "total_documents": total_documents,
        "total_utilisateurs": total_utilisateurs,
        "actions_aujourd_hui": actions_aujourd_hui,
        "uploads_aujourd_hui": uploads_aujourd_hui,
        "date_statistiques": aujourd_hui.isoformat()
    }