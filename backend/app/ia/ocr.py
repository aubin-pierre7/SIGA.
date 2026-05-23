# backend/app/ia/ocr.py

import pytesseract
import os

# Configurer le chemin vers Tesseract
pytesseract.pytesseract.pytesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

from PIL import Image
from io import BytesIO

def extraire_texte_ocr(contenu_fichier: bytes, nom_fichier: str) -> dict:
    """
    Extrait le texte d'une image avec Tesseract OCR.
    
    Args:
        contenu_fichier (bytes): Contenu du fichier uploadé
        nom_fichier (str): Nom du fichier
        
    Returns:
        dict: {succes, texte, titre_suggere, confidentialite_suggeree, erreur}
    """
    try:
        # Charger l'image
        image = Image.open(BytesIO(contenu_fichier))
        
        # Convertir en RGB si nécessaire
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Lancer Tesseract OCR
        texte = pytesseract.image_to_string(image, lang='fra')
        
        if not texte.strip():
            return {
                "succes": False,
                "texte": "",
                "titre_suggere": "",
                "confidentialite_suggeree": "interne",
                "erreur": "Aucun texte détecté dans l'image"
            }
        
        # Suggérer un titre et confidentialité
        titre = suggerer_titre(texte)
        confidentialite = suggerer_confidentialite(texte)
        
        return {
            "succes": True,
            "texte": texte,
            "titre_suggere": titre,
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
            return ligne_nettoyee[:100]
    
    return "Document scanné"

def suggerer_confidentialite(texte: str) -> str:
    """
    Suggère le niveau de confidentialité en analysant le contenu du texte.
    
    Args:
        texte (str): Texte extrait par OCR
        
    Returns:
        str: Niveau de confidentialité suggéré
    """
    texte_lower = texte.lower()
    
    # Mots-clés pour SECRET
    mots_secret = [
        "secret", "top secret", "classified", "confidentiel haute", 
        "usage strictement limité", "ne pas diffuser", "stratégique"
    ]
    
    # Mots-clés pour CONFIDENTIEL
    mots_confidentiel = [
        "salaire", "données personnelles", "rgpd", "médical", "santé",
        "numéro de sécurité sociale", "carte d'identité", "disciplinaire",
        "dossier médical", "données de santé", "information sensible",
        "fiche de paie", "contrat de travail", "évaluation", "note"
    ]
    
    # Mots-clés pour INTERNE
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
    
    # Par défaut : PUBLIC
    return "public"