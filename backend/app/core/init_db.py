# backend/app/core/init_db.py

from sqlalchemy.orm import Session
from .database import SessionLocal
from ..models.user import User
from .security import hasher_mot_de_passe

def init_db():
    """
    Initialise la base de données avec un utilisateur administrateur par défaut
    si aucun admin n'existe déjà.
    """
    # Créer une session de base de données
    db = SessionLocal()
    try:
        # Vérifier si un administrateur existe déjà
        admin_existe = db.query(User).filter(User.role == "admin").first()
        
        if admin_existe:
            print("✓ Administrateur par défaut déjà présent dans la base de données")
            return
        
        # Créer l'administrateur par défaut
        mot_de_passe_hashe = hasher_mot_de_passe("Admin2024")
        
        admin = User(
            nom="Admin",
            prenom="SIGA",
            email="admin@siga.cm",
            mot_de_passe=mot_de_passe_hashe,
            role="admin",
            est_actif=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✓ Administrateur par défaut créé avec succès")
        print(f"  Email: admin@siga.cm")
        print(f"  Mot de passe: Admin2024")
        
    finally:
        db.close()