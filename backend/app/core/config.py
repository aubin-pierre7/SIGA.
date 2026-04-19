# backend/app/core/config.py

from pydantic_settings import BaseSettings
from decouple import config

class Settings(BaseSettings):
    # Nom de l'application SIGA
    APP_NAME: str = "SIGA - Système Intégré de Gestion d'Archives"
    
    # Version actuelle de l'application
    APP_VERSION: str = "1.0.0"
    
    # Mode debug activé pour le développement
    DEBUG: bool = True
    
    # URL de la base de données SQLite
    DATABASE_URL: str = "sqlite:///./siga.db"
    
    # Clé secrète pour les tokens JWT, lue depuis le fichier .env
    SECRET_KEY: str = config('SECRET_KEY')
    
    # Algorithme utilisé pour signer les tokens JWT
    ALGORITHM: str = "HS256"
    
    # Durée d'expiration des tokens d'accès en minutes
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Clé de chiffrement AES-256, lue depuis le fichier .env
    ENCRYPTION_KEY: str = config('ENCRYPTION_KEY')
    
    # Répertoire pour stocker les médias chiffrés
    MEDIA_DIR: str = "media/encrypted"

# Instance des paramètres utilisable partout dans l'application
settings = Settings()