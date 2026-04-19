# backend/app/ia/extractor.py

import re
import spacy
from typing import List, Dict, Any


# Chargement du modèle spaCy français
try:
    nlp = spacy.load("fr_core_news_sm")
except OSError:
    print("Erreur : Le modèle spaCy 'fr_core_news_sm' n'est pas installé.")
    print("Installez-le avec : python -m spacy download fr_core_news_sm")
    nlp = None


def extraire_dates(texte: str) -> List[str]:
    """
    Extrait les dates présentes dans le texte en utilisant spaCy et regex.
    
    Utilise les entités DATE de spaCy ainsi que des patterns regex
    pour les formats courants français (dd/mm/yyyy, dd-mm-yyyy, etc.).
    
    Args:
        texte (str): Le texte du document
        
    Returns:
        List[str]: Liste des dates trouvées (maximum 5), sans doublons
    """
    dates_trouvees = set()
    
    if nlp is None:
        return []
    
    # Analyse spaCy pour les entités DATE
    doc = nlp(texte)
    for ent in doc.ents:
        if ent.label_ == "DATE":
            dates_trouvees.add(ent.text.strip())
    
    # Recherche avec regex pour les formats courants
    patterns_date = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b',  # dd/mm/yyyy ou dd-mm-yyyy
        r'\ble \d{1,2} \w+ \d{4}\b',         # le X mois YYYY
        r'\b\d{1,2} \w+ \d{4}\b',            # X mois YYYY
    ]
    
    for pattern in patterns_date:
        matches = re.findall(pattern, texte, re.IGNORECASE)
        for match in matches:
            dates_trouvees.add(match.strip())
    
    # Retourner maximum 5 dates sans doublons
    return list(dates_trouvees)[:5]


def extraire_personnes(texte: str) -> List[str]:
    """
    Extrait les noms de personnes présents dans le texte.
    
    Utilise les entités PER (Person) de spaCy pour identifier
    les noms propres de personnes.
    
    Args:
        texte (str): Le texte du document
        
    Returns:
        List[str]: Liste des noms de personnes trouvés (maximum 5), sans doublons
    """
    personnes_trouvees = set()
    
    if nlp is None:
        return []
    
    # Analyse spaCy pour les entités PER
    doc = nlp(texte)
    for ent in doc.ents:
        if ent.label_ == "PER":
            personnes_trouvees.add(ent.text.strip())
    
    # Retourner maximum 5 personnes sans doublons
    return list(personnes_trouvees)[:5]


def extraire_organisations(texte: str) -> List[str]:
    """
    Extrait les noms d'organisations présents dans le texte.
    
    Utilise les entités ORG (Organisation) de spaCy pour identifier
    les noms d'entreprises, institutions, etc.
    
    Args:
        texte (str): Le texte du document
        
    Returns:
        List[str]: Liste des organisations trouvées (maximum 5), sans doublons
    """
    organisations_trouvees = set()
    
    # Analyse spaCy pour les entités ORG
    doc = nlp(texte)
    for ent in doc.ents:
        if ent.label_ == "ORG":
            organisations_trouvees.add(ent.text.strip())
    
    # Retourner maximum 5 organisations sans doublons
    return list(organisations_trouvees)[:5]


def extraire_objet(texte: str) -> str:
    """
    Extrait l'objet/sujet du document depuis la ligne contenant 'objet :'.
    
    Recherche une ligne contenant 'objet :' ou 'objet:' (insensible à la casse)
    et retourne le texte qui suit sur la même ligne.
    
    Args:
        texte (str): Le texte du document
        
    Returns:
        str: Le texte de l'objet trouvé, ou "Non détecté" si aucun objet
    """
    # Recherche de la ligne contenant 'objet :'
    lignes = texte.split('\n')
    for ligne in lignes:
        ligne = ligne.strip()
        # Recherche insensible à la casse
        match = re.search(r'objet\s*:', ligne, re.IGNORECASE)
        if match:
            # Extraire le texte après 'objet :'
            objet_texte = ligne[match.end():].strip()
            if objet_texte:
                return objet_texte
    
    return "Non détecté"


def extraire_metadonnees(texte: str) -> Dict[str, Any]:
    """
    Extrait toutes les métadonnées importantes du document.
    
    Fonction principale qui combine toutes les extractions
    pour retourner un dictionnaire complet des métadonnées.
    Ce dictionnaire est conçu pour être stocké en JSON dans la BDD.
    
    Args:
        texte (str): Le texte du document
        
    Returns:
        Dict[str, Any]: Dictionnaire contenant toutes les métadonnées :
            - dates: liste des dates trouvées
            - personnes: liste des noms de personnes
            - organisations: liste des organisations
            - objet: texte de l'objet du document
            - nombre_mots: nombre total de mots
            - langue_detectee: langue détectée (toujours 'fr')
    """
    # Compter le nombre de mots
    nombre_mots = len(texte.split())
    
    # Extraire toutes les métadonnees
    metadonnees = {
        "dates": extraire_dates(texte),
        "personnes": extraire_personnes(texte),
        "organisations": extraire_organisations(texte),
        "objet": extraire_objet(texte),
        "nombre_mots": nombre_mots,
        "langue_detectee": "fr"
    }
    
    return metadonnees