# backend/app/core/encryption.py

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os, hashlib, base64
from fastapi import HTTPException
from .config import settings

# Fonction pour charger et valider la clé de chiffrement AES-256
def charger_cle() -> bytes:
    """
    Charge et valide la clé de chiffrement depuis la configuration.
    
    Lit la variable ENCRYPTION_KEY depuis settings, la décode depuis base64,
    et vérifie qu'elle fait exactement 32 bytes (256 bits).
    
    Returns:
        bytes: La clé de chiffrement AES-256 en bytes
        
    Raises:
        ValueError: Si la clé est invalide ou ne fait pas 32 bytes
    """
    try:
        # Décoder la clé depuis base64
        cle_decodee = base64.b64decode(settings.ENCRYPTION_KEY)
        
        # Vérifier que la clé fait exactement 32 bytes (256 bits)
        if len(cle_decodee) != 32:
            raise ValueError("La clé de chiffrement doit faire exactement 32 bytes (256 bits)")
        
        return cle_decodee
    except Exception as e:
        raise ValueError(f"Erreur lors du chargement de la clé de chiffrement : {str(e)}")

# Fonction pour chiffrer un fichier avec AES-256-GCM
def chiffrer_fichier(contenu: bytes) -> bytes:
    """
    Chiffre le contenu d'un fichier avec AES-256-GCM.
    
    Génère un nonce aléatoire de 12 bytes et l'utilise pour chiffrer
    le contenu. Le nonce est stocké en tête du fichier chiffré
    (nonce + données chiffrées) pour permettre le déchiffrement.
    
    Args:
        contenu (bytes): Le contenu du fichier à chiffrer
        
    Returns:
        bytes: Le contenu chiffré avec le nonce concaténé au début
        
    Note:
        Le nonce est concaténé au début pour pouvoir le récupérer
        lors du déchiffrement. Cela permet de stocker le fichier
        chiffré comme un seul blob.
    """
    # Charger la clé de chiffrement
    cle = charger_cle()
    
    # Générer un nonce aléatoire de 12 bytes
    nonce = os.urandom(12)
    
    # Créer l'objet AESGCM
    aesgcm = AESGCM(cle)
    
    # Chiffrer le contenu
    contenu_chiffre = aesgcm.encrypt(nonce, contenu, None)
    
    # Retourner nonce + contenu chiffré
    return nonce + contenu_chiffre

# Fonction pour déchiffrer un fichier AES-256-GCM
def dechiffrer_fichier(contenu_chiffre: bytes) -> bytes:
    """
    Déchiffre le contenu d'un fichier chiffré avec AES-256-GCM.
    
    Extrait le nonce des 12 premiers bytes et déchiffre le reste.
    
    Args:
        contenu_chiffre (bytes): Le contenu chiffré (nonce + données chiffrées)
        
    Returns:
        bytes: Le contenu original déchiffré
        
    Raises:
        HTTPException: Si le fichier est corrompu ou la clé incorrecte
    """
    try:
        # Charger la clé de chiffrement
        cle = charger_cle()
        
        # Vérifier que le contenu chiffré fait au moins 12 bytes (nonce)
        if len(contenu_chiffre) < 12:
            raise ValueError("Contenu chiffré trop court")
        
        # Extraire le nonce (12 premiers bytes)
        nonce = contenu_chiffre[:12]
        
        # Extraire les données chiffrées (le reste)
        donnees_chiffrees = contenu_chiffre[12:]
        
        # Créer l'objet AESGCM
        aesgcm = AESGCM(cle)
        
        # Déchiffrer le contenu
        contenu_original = aesgcm.decrypt(nonce, donnees_chiffrees, None)
        
        return contenu_original
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Erreur lors du déchiffrement du fichier : {str(e)}"
        )

# Fonction pour calculer le hash SHA-256 d'un fichier
def calculer_hash_sha256(contenu: bytes) -> str:
    """
    Calcule le hash SHA-256 du contenu d'un fichier.
    
    Ce hash est utilisé pour vérifier l'intégrité du fichier
    après déchiffrement ou pour détecter les modifications.
    
    Args:
        contenu (bytes): Le contenu du fichier
        
    Returns:
        str: Le hash SHA-256 en format hexadécimal
    """
    # Calculer le hash SHA-256
    hash_obj = hashlib.sha256(contenu)
    
    # Retourner le hash en hexadécimal
    return hash_obj.hexdigest()