# backend/app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Créer le moteur de base de données à partir de l'URL définie dans config.py
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # Nécessaire pour SQLite avec FastAPI
)

# Configurer SessionLocal pour créer des sessions de base de données
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base dont tous les modèles SQLAlchemy hériteront
Base = declarative_base()

# Fonction get_db() utilisée comme dépendance FastAPI pour injecter une session DB dans chaque route
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()