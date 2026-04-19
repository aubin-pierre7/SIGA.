# backend/app/ia/confidentiality.py

from typing import Dict, Any
from collections import defaultdict


# Dictionnaire des niveaux de confidentialité avec leurs mots-clés et scores
MOTS_CONFIDENTIALITE = {
    "secret": {
        "score": 4,
        "mots_cles": [
            "secret", "top secret", "confidentiel défense",
            "données sensibles", "usage strictement limité",
            "ne pas divulguer", "classifié"
        ]
    },
    "confidentiel": {
        "score": 3,
        "mots_cles": [
            "confidentiel", "usage interne", "données personnelles",
            "données médicales", "salaire", "rémunération", "sanction",
            "disciplinaire", "licenciement", "données bancaires",
            "mot de passe", "accès restreint"
        ]
    },
    "interne": {
        "score": 2,
        "mots_cles": [
            "interne", "usage interne", "personnel", "réservé",
            "non public", "diffusion restreinte", "service",
            "administration", "procédure interne"
        ]
    },
    "public": {
        "score": 1,
        "mots_cles": [
            "public", "communiqué", "publication", "presse",
            "diffusion libre", "open data", "accessible"
        ]
    }
}


def analyser_confidentialite(texte: str) -> Dict[str, Any]:
    """
    Analyse le contenu d'un document pour suggérer un niveau de confidentialité.
    
    Méthode : comptage des mots-clés de chaque niveau présents dans le texte.
    Le niveau avec le score le plus élevé est suggéré, avec un score de confiance
    basé sur le nombre de mots-clés détectés.
    
    Args:
        texte (str): Le texte du document à analyser
        
    Returns:
        Dict[str, Any]: Dictionnaire contenant :
            - niveau_suggere: niveau de confidentialité suggéré
            - score_confiance: score de confiance (0-100)
            - raison: explication avec mots-clés détectés
            - details: nombre de mots-clés par niveau
    """
    # Convertir le texte en minuscules pour l'analyse
    texte_minuscule = texte.lower()
    
    # Dictionnaire pour compter les mots-clés trouvés par niveau
    mots_trouves_par_niveau = defaultdict(int)
    mots_detectes_par_niveau = defaultdict(list)
    
    # Analyser chaque niveau de confidentialité
    for niveau, config in MOTS_CONFIDENTIALITE.items():
        for mot_cle in config["mots_cles"]:
            if mot_cle.lower() in texte_minuscule:
                mots_trouves_par_niveau[niveau] += 1
                mots_detectes_par_niveau[niveau].append(mot_cle)
    
    # Calculer le score pondéré pour chaque niveau
    scores_pondres = {}
    for niveau, config in MOTS_CONFIDENTIALITE.items():
        nombre_mots = mots_trouves_par_niveau[niveau]
        score_base = config["score"]
        # Score pondéré : score de base * nombre de mots-clés trouvés
        scores_pondres[niveau] = score_base * nombre_mots
    
    # Déterminer le niveau suggéré
    if any(scores_pondres.values()):
        niveau_suggere = max(scores_pondres, key=scores_pondres.get)
        score_max = scores_pondres[niveau_suggere]
        
        # Calculer le score de confiance (0-100)
        # Basé sur le nombre de mots-clés trouvés vs total possible
        mots_trouves = mots_trouves_par_niveau[niveau_suggere]
        total_mots_niveau = len(MOTS_CONFIDENTIALITE[niveau_suggere]["mots_cles"])
        score_confiance = min(100, (mots_trouves / total_mots_niveau) * 100) if total_mots_niveau > 0 else 50
        
        # Construire la raison
        mots_detectes = mots_detectes_par_niveau[niveau_suggere]
        raison = f"Mots-clés détectés : {', '.join(mots_detectes[:3])}"  # Maximum 3 mots dans la raison
        if len(mots_detectes) > 3:
            raison += f" (+{len(mots_detectes) - 3} autres)"
        
    else:
        # Aucun mot-clé trouvé : suggérer "interne" par défaut
        niveau_suggere = "interne"
        score_confiance = 50.0
        raison = "Aucun mot-clé spécifique détecté, niveau par défaut"
    
    # Retourner le résultat complet
    return {
        "niveau_suggere": niveau_suggere,
        "score_confiance": round(score_confiance, 1),
        "raison": raison,
        "details": dict(mots_trouves_par_niveau)
    }


def obtenir_niveau(texte: str) -> str:
    """
    Obtient le niveau de confidentialité suggéré pour un document.
    
    Fonction simplifiée qui retourne uniquement le niveau suggéré
    sous forme de chaîne de caractères.
    
    Args:
        texte (str): Le texte du document
        
    Returns:
        str: Le niveau de confidentialité suggéré
    """
    resultat = analyser_confidentialite(texte)
    return resultat["niveau_suggere"]