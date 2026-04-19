# backend/app/ia/text_extractor.py

import os
from typing import Optional
import PyPDF2
from io import BytesIO


def extraire_texte_pdf(contenu: bytes) -> str:
    """
    Extrait le texte brut depuis un fichier PDF.
    
    Args:
        contenu (bytes): Le contenu binaire du fichier PDF
        
    Returns:
        str: Le texte extrait de toutes les pages, ou chaîne vide en cas d'échec
    """
    try:
        # Créer un objet BytesIO depuis les bytes
        pdf_file = BytesIO(contenu)
        
        # Créer un lecteur PDF
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        # Extraire le texte de toutes les pages
        texte_extrait = ""
        for page in pdf_reader.pages:
            texte_page = page.extract_text()
            if texte_page:
                texte_extrait += texte_page + "\n"
        
        return texte_extrait.strip()
        
    except Exception as e:
        # En cas d'erreur (PDF corrompu, chiffré, etc.), retourner chaîne vide
        print(f"Erreur lors de l'extraction du PDF : {e}")
        return ""


def extraire_texte_txt(contenu: bytes) -> str:
    """
    Extrait le texte brut depuis un fichier texte.
    
    Args:
        contenu (bytes): Le contenu binaire du fichier texte
        
    Returns:
        str: Le texte décodé
    """
    try:
        # Essayer d'abord UTF-8
        return contenu.decode('utf-8')
    except UnicodeDecodeError:
        try:
            # Essayer latin-1 si UTF-8 échoue
            return contenu.decode('latin-1')
        except UnicodeDecodeError:
            # En dernier recours, ignorer les erreurs
            return contenu.decode('utf-8', errors='ignore')


def extraire_texte(contenu: bytes, nom_fichier: str) -> str:
    """
    Fonction principale pour extraire du texte selon le type de fichier.
    
    Args:
        contenu (bytes): Le contenu binaire du fichier
        nom_fichier (str): Le nom du fichier avec son extension
        
    Returns:
        str: Le texte extrait, limité à 5000 caractères maximum
    """
    # Obtenir l'extension en minuscules
    _, extension = os.path.splitext(nom_fichier.lower())
    
    # Détecter le type de fichier selon l'extension
    if extension == '.pdf':
        texte = extraire_texte_pdf(contenu)
    elif extension == '.txt':
        texte = extraire_texte_txt(contenu)
    elif extension in ['.doc', '.docx']:
        # Format Word non supporté pour l'analyse IA
        texte = "Format Word non supporté pour l'analyse IA"
    else:
        # Format non reconnu
        texte = ""
    
    # Limiter la longueur du texte pour ne pas surcharger les modèles IA
    if len(texte) > 5000:
        texte = texte[:5000] + "... [texte tronqué]"
    
    return texte