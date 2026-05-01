# backend/tests/test_siga.py

import pytest
import base64
import os
import sys

# Ajouter le répertoire parent au path pour importer les modules de l'application
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.encryption import chiffrer_fichier, dechiffrer_fichier, calculer_hash_sha256
from app.core.security import hasher_mot_de_passe, verifier_mot_de_passe
from app.ia.classifier import obtenir_categorie
from app.ia.confidentiality import obtenir_niveau


# ==================== TESTS DU MODULE DE CHIFFREMENT ====================

def test_chiffrement_dechiffrement():
    """
    Test du chiffrement et déchiffrement AES-256-GCM.
    
    - Crée une clé AES-256 valide (32 bytes en base64)
    - Chiffre un texte "Document test SIGA"
    - Déchiffre le résultat
    - Vérifie que le résultat déchiffré = texte original
    """
    # Texte à chiffrer
    texte_original = "Document test SIGA"
    contenu = texte_original.encode('utf-8')
    
    # Chiffrer le contenu
    contenu_chiffre = chiffrer_fichier(contenu)
    
    # Vérifier que le contenu chiffré est différent de l'original
    assert contenu_chiffre != contenu
    assert len(contenu_chiffre) > len(contenu)  # Le nonce est ajouté
    
    # Déchiffrer le contenu
    contenu_dechiffre = dechiffrer_fichier(contenu_chiffre)
    
    # Vérifier que le contenu déchiffré correspond à l'original
    assert contenu_dechiffre == contenu
    assert contenu_dechiffre.decode('utf-8') == texte_original


def test_hash_sha256():
    """
    Test du calcul du hash SHA-256.
    
    - Calcule le hash d'un contenu connu
    - Vérifie que le hash fait 64 caractères hexadécimaux
    - Vérifie que le même contenu donne toujours le même hash
    """
    # Contenu à hasher
    contenu = b"Contenu de test pour SIGA"
    
    # Calculer le hash
    hash1 = calculer_hash_sha256(contenu)
    hash2 = calculer_hash_sha256(contenu)
    
    # Vérifier que le hash fait 64 caractères hexadécimaux
    assert len(hash1) == 64
    assert all(c in '0123456789abcdef' for c in hash1)
    
    # Vérifier que le même contenu donne toujours le même hash
    assert hash1 == hash2
    
    # Vérifier que des contenus différents donnent des hashes différents
    contenu_different = "Contenu différent".encode('utf-8')
    hash3 = calculer_hash_sha256(contenu_different)
    assert hash1 != hash3


# ==================== TESTS DU MODULE DE CLASSIFICATION IA ====================

def test_classification_contrat():
    """
    Test de la classification de document type Contrat.
    
    - Texte avec mots "contrat, clause, signataire, parties"
    - Vérifie que la catégorie retournée est "Contrat"
    """
    texte = """
    Ce document est un contrat entre les parties concernées.
    Le signataire s'engage à respecter toutes les clauses mentionnées.
    La durée du contrat est de deux ans.
    """
    
    categorie = obtenir_categorie(texte)
    
    assert categorie == "Contrat"


def test_classification_rapport():
    """
    Test de la classification de document type Rapport.
    
    - Texte avec mots "rapport, bilan, analyse, résultats"
    - Vérifie que la catégorie retournée est "Rapport"
    """
    texte = """
    Ce rapport présente le bilan annuel de l'entreprise.
    L'analyse des résultats montre une progression significative.
    Les recommandations sont détaillées dans la suite du document.
    """
    
    categorie = obtenir_categorie(texte)
    
    assert categorie == "Rapport"


# ==================== TESTS DU MODULE DE CONFIDENTIALITÉ ====================

def test_confidentialite_confidentiel():
    """
    Test de la détection de niveau confidentiel.
    
    - Texte avec "données personnelles, salaire, confidentiel"
    - Vérifie que le niveau suggéré est "confidentiel"
    """
    texte = """
    Ce document contient des données personnelles des employés.
    Les informations sur le salaire sont confidentielles.
    L'accès est restreint au personnel autorisé.
    """
    
    niveau = obtenir_niveau(texte)
    
    assert niveau == "confidentiel"


def test_confidentialite_defaut():
    """
    Test du niveau par défaut quand aucun mot-clé n'est détecté.
    
    - Texte sans mots-clés sensibles
    - Vérifie que le niveau par défaut est "interne"
    """
    texte = """
    Ce document contient des informations générales.
    Il n'y a pas d'informations sensibles dans ce texte.
    C'est un document standard de l'organisation.
    """
    
    niveau = obtenir_niveau(texte)
    
    assert niveau == "interne"


# ==================== TESTS DU HASHAGE DES MOTS DE PASSE ====================

def test_hashage_mot_de_passe():
    """
    Test du hashage des mots de passe avec bcrypt.
    
    - Hash le mot de passe "TestSIGA2024"
    - Vérifie que le hash est différent du mot de passe original
    - Vérifie que verifier_mot_de_passe() retourne True
    """
    mot_de_passe = "TestSIGA2024"
    
    # Hasher le mot de passe
    hash = hasher_mot_de_passe(mot_de_passe)
    
    # Vérifier que le hash est différent du mot de passe original
    assert hash != mot_de_passe
    assert len(hash) > len(mot_de_passe)
    
    # Vérifier que le mot de passe correspond au hash
    assert verifier_mot_de_passe(mot_de_passe, hash) is True


def test_mauvais_mot_de_passe():
    """
    Test de la vérification avec un mauvais mot de passe.
    
    - Vérifie que verifier_mot_de_passe() retourne False
      pour un mauvais mot de passe
    """
    bon_mot_de_passe = "TestSIGA2024"
    mauvais_mot_de_passe = "MauvaisMotDePasse"
    
    # Hasher le bon mot de passe
    hash = hasher_mot_de_passe(bon_mot_de_passe)
    
    # Vérifier que le mauvais mot de passe ne correspond pas
    assert verifier_mot_de_passe(mauvais_mot_de_passe, hash) is False
    
    # Vérifier que le bon mot de passe correspond toujours
    assert verifier_mot_de_passe(bon_mot_de_passe, hash) is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])