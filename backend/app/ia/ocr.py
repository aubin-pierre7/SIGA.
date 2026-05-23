# backend/app/ia/ocr.py

import os
os.environ['TESSDATA_PREFIX'] = r'C:\Program Files\Tesseract-OCR\tessdata'
os.environ['PATH'] = r'C:\Program Files\Tesseract-OCR' + ';' + os.environ.get('PATH', '')

import pytesseract
pytesseract.pytesseract.pytesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

from PIL import Image
from io import BytesIO

def extraire_texte_ocr(contenu_fichier: bytes, nom_fichier: str) -> dict:
    """
    Extrait le texte d'une image avec Tesseract OCR.
    """
    try:
        image = Image.open(BytesIO(contenu_fichier))
        
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        texte = pytesseract.image_to_string(image, lang='eng')
        
        if not texte.strip():
            return {
                "succes": False,
                "texte": "",
                "titre_suggere": "",
                "confidentialite_suggeree": "interne",
                "erreur": "Aucun texte détecté dans l'image"
            }
        
        titre = suggerer_titre(texte)
        confidentialite = suggerer_confidentialite(texte)
        
        return {
            "succes": True,
            "texte": texte,
            "titre_suggere": titre,
            "confidentialite_suggeree": confidentialite,
            "erreur": ""
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
    lignes = texte.strip().split('\n')
    
    for ligne in lignes:
        ligne_nettoyee = ligne.strip()
        if ligne_nettoyee and len(ligne_nettoyee) > 3:
            return ligne_nettoyee[:100]
    
    return "Document scanné"

def suggerer_confidentialite(texte: str) -> str:
    texte_lower = texte.lower()
    
    mots_secret = [
        "secret", "top secret", "classified", "confidential high", 
        "strictly limited", "do not share", "strategic"
    ]
    
    mots_confidentiel = [
        "salary", "personal data", "gdpr", "medical", "health",
        "social security", "id card", "disciplinary",
        "medical file", "health data", "sensitive information",
        "pay slip", "employment contract", "evaluation", "note"
    ]
    
    mots_interne = [
        "internal", "personnel", "administrative", "procedure", "process",
        "policy", "circular", "internal note", "memo", "internal report"
    ]
    
    for mot in mots_secret:
        if mot in texte_lower:
            return "secret"
    
    for mot in mots_confidentiel:
        if mot in texte_lower:
            return "confidentiel"
    
    for mot in mots_interne:
        if mot in texte_lower:
            return "interne"
    
    return "public"