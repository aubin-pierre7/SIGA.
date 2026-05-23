# backend/app/ia/ocr.py

from paddleocr import PaddleOCR
import cv2
import numpy as np
from io import BytesIO
from PIL import Image

# Initialiser PaddleOCR une seule fois (lourd, donc on le fait en cache)
ocr = None

def initialiser_ocr():
    """
    Initialise le modèle PaddleOCR avec support du français.
    Appelé une seule fois au démarrage du serveur.
    """
    global ocr
    if ocr is None:
        ocr = PaddleOCR(use_angle_cls=True, lang='fr')
    return ocr

def extraire_texte_ocr(contenu_fichier: bytes, nom_fichier: str) -> dict:
    """
    Extrait le texte d'une image ou d'un PDF avec PaddleOCR.
    
    Fonctionne avec :
    - Images : JPG, PNG, BMP, TIFF
    - PDFs : convertit en image d'abord
    
    Args:
        contenu_fichier (bytes): Contenu du fichier uploadé
        nom_fichier (str): Nom du fichier (pour déterminer le type)
        
    Returns:
        dict: {
            "succes": bool,
            "texte": str (texte extrait),
            "titre_suggere": str (première ligne du texte),
            "confidentialite_suggeree": str (public/interne/confidentiel/secret),
            "erreur": str (si succes=False)
        }
    """
    try:
        initialiser_ocr()
        
        # Convertir bytes en image
        image_array = charger_image_depuis_bytes(contenu_fichier, nom_fichier)
        if image_array is None:
            return {
                "succes": False,
                "texte": "",
                "titre_suggere": "",
                "confidentialite_suggeree": "interne",
                "erreur": "Format d'image non supporté"
            }
        
        # Lancer l'OCR
        resultats = ocr.ocr(image_array, cls=True)
        
        # Extraire le texte de tous les résultats
        texte_complet = extraire_texte_resultats_ocr(resultats)
        
        if not texte_complet.strip():
            return {
                "succes": False,
                "texte": "",
                "titre_suggere": "",
                "confidentialite_suggeree": "interne",
                "erreur": "Aucun texte détecté dans l'image"
            }
        
        # Suggérer un titre (première ligne non vide)
        titre_suggere = suggerer_titre(texte_complet)
        
        # Suggérer le niveau de confidentialité
        confidentialite = suggerer_confidentialite(texte_complet)
        
        return {
            "succes": True,
            "texte": texte_complet,
            "titre_suggere": titre_suggere,
            "confidentialite_suggeree": confidentialite,
            "erreur": None
        }
        
    except Exception as e:
        return {
            "succes": False,
            "texte": "",
            "titre_suggere": "",
            "confidentialite_suggeree": "interne",
            "erreur": f"Erreur OCR : {str(e)}"
        }

def charger_image_depuis_bytes(contenu: bytes, nom_fichier: str) -> np.ndarray:
    """
    Charge une image depuis des bytes (JPG, PNG, etc).
    Convertit les PDFs en image d'abord si nécessaire.
    
    Args:
        contenu (bytes): Contenu du fichier
        nom_fichier (str): Nom du fichier
        
    Returns:
        np.ndarray: Image en format OpenCV ou None si erreur
    """
    try:
        # Essayer de charger directement comme image
        image = Image.open(BytesIO(contenu))
        
        # Convertir en RGB si nécessaire (RGBA, etc)
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Convertir en array numpy pour OpenCV
        image_array = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        return image_array
        
    except Exception as e:
        print(f"Erreur chargement image : {str(e)}")
        return None

def extraire_texte_resultats_ocr(resultats: list) -> str:
    """
    Extrait le texte brut des résultats PaddleOCR.
    
    PaddleOCR retourne une liste de listes contenant les boîtes de texte.
    Chaque boîte contient : [coordonnées, (texte, confiance)]
    
    Args:
        resultats (list): Résultats bruts de PaddleOCR
        
    Returns:
        str: Texte extrait, ligne par ligne
    """
    texte_lines = []
    
    for ligne in resultats:
        if ligne:  # Vérifier que la ligne n'est pas vide
            for boite in ligne:
                if boite and len(boite) >= 2:
                    texte = boite[1][0]  # Le texte est dans boite[1][0]
                    confiance = boite[1][1]  # La confiance est dans boite[1][1]
                    
                    # Ne garder que le texte avec confiance > 0.5
                    if confiance > 0.5:
                        texte_lines.append(texte)
    
    # Joindre les lignes avec des retours à la ligne
    return "\n".join(texte_lines)

def suggerer_titre(texte: str) -> str:
    """
    Suggère un titre à partir du texte extrait.
    Prend la première ligne non vide et la limite à 100 caractères.
    
    Args:
        texte (str): Texte extrait par OCR
        
    Returns:
        str: Titre suggéré
    """
    lignes = texte.strip().split('\n')
    
    for ligne in lignes:
        ligne_nettoyee = ligne.strip()
        if ligne_nettoyee and len(ligne_nettoyee) > 3:
            # Limiter à 100 caractères
            return ligne_nettoyee[:100]
    
    return "Document scanné"

def suggerer_confidentialite(texte: str) -> str:
    """
    Suggère le niveau de confidentialité en analysant le contenu du texte.
    
    Scoring par mot-clé :
    - SECRET : mots très sensibles
    - CONFIDENTIEL : données personnelles/sensibles
    - INTERNE : mentions internes
    - PUBLIC : par défaut si rien ne correspond
    
    Args:
        texte (str): Texte extrait par OCR
        
    Returns:
        str: Niveau de confidentialité suggéré
    """
    texte_lower = texte.lower()
    
    # Mots-clés pour SECRET (très sensible)
    mots_secret = [
        "secret", "top secret", "classified", "confidentiel haute", 
        "usage strictement limité", "ne pas diffuser", "stratégique",
        "décision gouvernementale", "procédure judiciaire"
    ]
    
    # Mots-clés pour CONFIDENTIEL (données personnelles/sensibles)
    mots_confidentiel = [
        "salaire", "données personnelles", "rgpd", "médical", "santé",
        "numéro de sécurité sociale", "carte d'identité", "disciplinaire",
        "dossier médical", "données de santé", "information sensible",
        "fiche de paie", "contrat de travail", "évaluation", "note"
    ]
    
    # Mots-clés pour INTERNE (usage administratif interne)
    mots_interne = [
        "interne", "personnel", "administratif", "procédure", "process",
        "politique", "circulaire", "note interne", "mémo", "rapport interne"
    ]
    
    # Vérifier SECRET
    for mot in mots_secret:
        if mot in texte_lower:
            return "secret"
    
    # Vérifier CONFIDENTIEL
    for mot in mots_confidentiel:
        if mot in texte_lower:
            return "confidentiel"
    
    # Vérifier INTERNE
    for mot in mots_interne:
        if mot in texte_lower:
            return "interne"
    
    # Par défaut : PUBLIC (si aucun mot sensible)
    return "public"