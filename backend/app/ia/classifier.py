# backend/app/ia/classifier.py

from typing import Dict, Any
from collections import Counter


# Dictionnaire des catégories avec leurs mots-clés associés
CATEGORIES_MOTS_CLES = {
    "Contrat": [
        "contrat", "accord", "convention", "engagement",
        "signataire", "parties", "clause", "durée", "renouvellement",
        "résiliation", "prestation", "obligation"
    ],
    "Rapport": [
        "rapport", "bilan", "analyse", "évaluation", "résultats",
        "synthèse", "conclusions", "recommandations", "audit",
        "performance", "indicateurs", "période"
    ],
    "Décision": [
        "décision", "arrêté", "délibération", "résolution",
        "ordonnance", "instruction", "directive", "note de service",
        "circulaire", "autorisation", "approbation"
    ],
    "Facture": [
        "facture", "montant", "paiement", "règlement", "somme",
        "honoraires", "TVA", "HT", "TTC", "devis", "bon de commande",
        "référence", "échéance"
    ],
    "Courrier": [
        "monsieur", "madame", "objet", "suite à", "je vous prie",
        "veuillez", "cordialement", "sincères salutations",
        "à l'attention", "référence", "concerne"
    ],
    "Procès-verbal": [
        "procès-verbal", "PV", "séance", "réunion", "présents",
        "absents", "ordre du jour", "délibéré", "vote", "quorum",
        "clôture", "séance levée"
    ]
}


def classifier_document(texte: str) -> Dict[str, Any]:
    """
    Classifie automatiquement un document en analysant les mots-clés présents.
    
    La méthode de scoring compte le nombre de mots-clés de chaque catégorie
    présents dans le texte. Le score est normalisé sur 100 en fonction du
    nombre maximum de mots-clés trouvés pour une catégorie.
    
    Args:
        texte (str): Le texte du document à classifier
        
    Returns:
        Dict[str, Any]: Dictionnaire contenant :
            - "categorie": la catégorie principale détectée
            - "score": score de confiance (0-100)
            - "toutes_categories": scores détaillés pour chaque catégorie
    """
    # Convertir le texte en minuscules pour l'analyse
    texte_minuscule = texte.lower()
    
    # Dictionnaire pour stocker les scores de chaque catégorie
    scores_categories = {}
    
    # Pour chaque catégorie, compter les mots-clés présents
    for categorie, mots_cles in CATEGORIES_MOTS_CLES.items():
        # Compter combien de mots-clés de cette catégorie sont présents
        mots_trouves = 0
        for mot_cle in mots_cles:
            if mot_cle.lower() in texte_minuscule:
                mots_trouves += 1
        
        # Stocker le nombre de mots-clés trouvés
        scores_categories[categorie] = mots_trouves
    
    # Trouver la catégorie avec le score le plus élevé
    if scores_categories:
        categorie_max = max(scores_categories, key=scores_categories.get)
        score_max = scores_categories[categorie_max]
        
        # Calculer le score de confiance (0-100)
        # Score basé sur le nombre de mots-clés trouvés
        # Maximum théorique = nombre de mots-clés dans la catégorie
        max_mots_cles = len(CATEGORIES_MOTS_CLES[categorie_max])
        score_confiance = min(100, (score_max / max_mots_cles) * 100) if max_mots_cles > 0 else 0
        
        return {
            "categorie": categorie_max,
            "score": round(score_confiance, 1),
            "toutes_categories": scores_categories
        }
    else:
        # Aucun mot-clé trouvé
        return {
            "categorie": "Non classifié",
            "score": 0.0,
            "toutes_categories": scores_categories
        }


def obtenir_categorie(texte: str) -> str:
    """
    Obtient uniquement le nom de la catégorie principale du document.
    
    Fonction simplifiée pour usage rapide, retourne juste le nom
    de la catégorie sans les détails de scoring.
    
    Args:
        texte (str): Le texte du document
        
    Returns:
        str: Le nom de la catégorie détectée
    """
    resultat = classifier_document(texte)
    return resultat["categorie"]