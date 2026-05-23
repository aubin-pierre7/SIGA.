# SIGA — Système Intégré de Gestion d'Archives Numérique Sécurisé

**Projet de fin de DUT Informatique** — Développement d'un système complet d'archivage numérique avec chiffrement, authentification par rôles et intelligence artificielle.

---

## 📋 Table des matières

1. [Description](#description)
2. [Fonctionnalités](#fonctionnalités)
3. [Architecture](#architecture)
4. [Stack technique](#stack-technique)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Utilisation](#utilisation)
8. [API REST](#api-rest)
9. [Sécurité](#sécurité)
10. [Intelligence Artificielle](#intelligence-artificielle)
11. [Permissions et rôles](#permissions-et-rôles)
12. [Journal d'audit](#journal-daudit)
13. [Tests](#tests)
14. [Déploiement](#déploiement)
15. [Limitations connues](#limitations-connues)
16. [Auteur](#auteur)

---

## 📖 Description

SIGA (Système Intégré de Gestion d'Archives) est une plateforme web sécurisée conçue pour les administrations publiques et organisations. Elle permet de :

- **Scanner et archiver** des documents papier via caméra ou upload
- **Chiffrer automatiquement** tous les documents (AES-256-GCM)
- **Extraire le texte** avec OCR (Tesseract)
- **Classifier automatiquement** les niveaux de confidentialité
- **Gérer les accès** selon les rôles des utilisateurs
- **Tracer toutes les actions** dans un journal d'audit

Le système est conçu pour être sécurisé, performant et respectueux de la vie privée (RGPD).

---

## ✨ Fonctionnalités

### Core
- ✅ Authentification par JWT (30 min d'expiration)
- ✅ Gestion des utilisateurs (Admin, Agent, Lecteur)
- ✅ Upload de documents avec chiffrement AES-256-GCM
- ✅ Archivage sécurisé avec hash SHA-256 pour intégrité
- ✅ Récupération et déchiffrement des documents
- ✅ Suppression sécurisée avec traçabilité

### OCR & IA
- ✅ Scanner caméra en temps réel (PC + téléphone)
- ✅ OCR Tesseract (extraction de texte français/anglais)
- ✅ Suggestion automatique de titre (première ligne)
- ✅ Analyse de confidentialité par mots-clés
- ✅ Fallback manuel si OCR échoue

### Gestion des permissions
- ✅ Admin : accès à tous les documents, gestion utilisateurs, audit
- ✅ Agent : upload documents, accès à ses propres docs, suggestions IA
- ✅ Lecteur : consultation documents publics seulement

### Audit & Conformité
- ✅ Journal d'audit complet (création, lecture, suppression, authentification)
- ✅ Traçabilité des actions utilisateur
- ✅ Niveaux de confidentialité (PUBLIC, INTERNE, CONFIDENTIEL, SECRET)
- ✅ Historique des modifications

### Interface utilisateur
- ✅ Dashboard avec statistiques
- ✅ Interface responsive (mobile + desktop)
- ✅ Notifications en temps réel
- ✅ Recherche et filtrage des documents
- ✅ Gestion des utilisateurs (Admin)

---

## 🏗️ Architecture
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py           # Authentification JWT
│   │   │       ├── documents.py      # CRUD documents
│   │   │       ├── audit.py          # Journal d'audit
│   │   │       └── ocr.py            # Routes OCR
│   │   ├── core/
│   │   │   ├── config.py             # Configuration
│   │   │   ├── database.py           # SQLite/PostgreSQL
│   │   │   ├── security.py           # Hachage & JWT
│   │   │   ├── encryption.py         # AES-256-GCM
│   │   │   ├── init_db.py            # Initialisation BD
│   │   │   └── dependencies.py       # Dépendances FastAPI
│   │   ├── models/
│   │   │   ├── user.py               # Modèle Utilisateur
│   │   │   ├── document.py           # Modèle Document
│   │   │   └── audit.py              # Modèle AuditLog
│   │   ├── schemas/
│   │   │   ├── user.py               # Validation Pydantic
│   │   │   └── document.py           # Validation Pydantic
│   │   ├── services/
│   │   │   └── document_service.py   # Logique métier
│   │   ├── ia/
│   │   │   └── ocr.py                # Service OCR Tesseract
│   │   └── main.py                   # Application FastAPI
│   ├── requirements.txt               # Dépendances Python
│   └── env/                           # Environnement virtuel
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Barre de navigation
│   │   │   ├── ProtectedRoute.jsx    # Routes protégées
│   │   │   ├── Notification.jsx      # Notifications
│   │   │   └── ConfirmDialog.jsx     # Dialogs de confirmation
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Page connexion
│   │   │   ├── Dashboard.jsx         # Page d'accueil
│   │   │   ├── Documents.jsx         # Liste documents
│   │   │   ├── Upload.jsx            # Upload classique
│   │   │   ├── OCRUpload.jsx         # Scanner OCR
│   │   │   ├── Audit.jsx             # Journal d'audit
│   │   │   └── Utilisateurs.jsx      # Gestion utilisateurs
│   │   ├── services/
│   │   │   ├── api.js                # Client HTTP
│   │   │   ├── AuthContext.jsx       # Contexte auth
│   │   │   ├── useAuth.js            # Hook auth
│   │   │   └── useNotification.js    # Hook notifications
│   │   ├── App.jsx                   # Routeur principal
│   │   └── index.css                 # Styles globaux
│   ├── package.json                  # Dépendances Node
│   └── vite.config.js                # Config Vite
│
└── siga.db                           # Base SQLite (dev)

---

## 🛠️ Stack technique

### Backend
| Outil | Version | Rôle |
|-------|---------|------|
| **FastAPI** | 0.136.0 | Framework web async |
| **Python** | 3.13 | Langage |
| **SQLAlchemy** | 2.0.49 | ORM |
| **Pydantic** | 2.13.2 | Validation données |
| **python-jose** | 3.5.0 | JWT |
| **Argon2** | via passlib | Hachage mot de passe |
| **cryptography** | 46.0.7 | AES-256-GCM |
| **pytesseract** | + Tesseract 5.5.0 | OCR |
| **pytest** | 9.0.3 | Tests unitaires |

### Frontend
| Outil | Version | Rôle |
|-------|---------|------|
| **React** | 18.x | Framework UI |
| **React Router** | 6.x | Routage |
| **Tailwind CSS** | 3.x | Styles |
| **Axios** / Fetch | native | Requêtes HTTP |
| **Node.js** | 18+ | Runtime |

### Base de données
- **SQLite** : développement local
- **PostgreSQL** : production (optionnel)

---

## 📦 Installation

### Prérequis
- Python 3.13+
- Node.js 18+
- Git
- Tesseract 5.5.0 (pour OCR)

### 1️⃣ Clone le repository
```bash
git clone https://github.com/ton-username/siga.git
cd SIGA
```

### 2️⃣ Backend - Installation

```bash
cd backend

# Créer environnement virtuel
python -m venv env

# Activer l'environnement
# Windows
env\Scripts\activate
# Linux/Mac
source env/bin/activate

# Installer dépendances
pip install --break-system-packages -r requirements.txt --no-cache-dir
```

### 3️⃣ Tesseract - Installation (OCR)

**Windows :**
- Télécharge : https://github.com/UB-Mannheim/tesseract/wiki
- Installe à : `C:\Program Files\Tesseract-OCR`
- Ajoute au PATH : `setx PATH "%PATH%;C:\Program Files\Tesseract-OCR"`

**Linux (Ubuntu) :**
```bash
sudo apt-get install tesseract-ocr tesseract-ocr-fra
```

**macOS :**
```bash
brew install tesseract
```

### 4️⃣ Frontend - Installation

```bash
cd frontend

# Installer dépendances
npm install

# Vérifier l'installation
npm run dev
```

---

## ⚙️ Configuration

### Variables d'environnement Backend
Crée `backend/.env` :

```env
DATABASE_URL=sqlite:///siga.db
SECRET_KEY=ta_cle_secrete_tres_longue_et_aleatoire
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Variables d'environnement Frontend
Crée `frontend/.env.local` :

```env
VITE_API_URL=http://127.0.0.1:8000
```

### Tesseract - Configuration
Tesseract est configuré automatiquement dans `backend/app/ia/ocr.py`.

Si tu rencontres des problèmes, vérifie :
```bash
tesseract --version
```

---

## 🚀 Utilisation

### Lancer le projet

**Terminal 1 - Backend :**
```bash
cd backend
env\Scripts\activate
uvicorn app.main:app --reload
```

Le backend est accessible sur : **http://127.0.0.1:8000**
- API : http://127.0.0.1:8000/api
- Docs : http://127.0.0.1:8000/docs
- ReDoc : http://127.0.0.1:8000/redoc

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

Le frontend est accessible sur : **http://localhost:5173**

### Identifiants par défaut

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@siga.cm` | `Admin2024` |
| Agent | `agent@siga.cm` | `Agent2024` |
| Lecteur | `lecteur@siga.cm` | `Lecteur2024` |

---

## 🔌 API REST

### Authentification

#### Login
POST /api/auth/token
Content-Type: application/x-www-form-urlencoded
username=admin@siga.cm&password=Admin2024
Response:
{
"access_token": "eyJhbGc...",
"token_type": "bearer",
"user": {
"id": 1,
"email": "admin@siga.cm",
"role": "admin"
}
}

#### Register
POST /api/auth/register
Content-Type: application/json
{
"email": "new@siga.cm",
"password": "SecurePassword123",
"full_name": "John Doe",
"role": "agent"
}

### Documents

#### Upload document
POST /api/documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

titre: "Facture 2024"
fichier: [binary]
niveau_confidentialite: "confidentiel"

Response:
{
"id": "uuid-123",
"titre": "Facture 2024",
"hash_sha256": "abc123...",
"niveau_confidentialite": "confidentiel",
"created_at": "2026-05-23T10:30:00Z"
}

#### Liste des documents
GET /api/documents
Authorization: Bearer {token}
Response:
[
{
"id": "uuid-123",
"titre": "Facture 2024",
"utilisateur_nom": "John Doe",
"niveau_confidentialite": "confidentiel",
"created_at": "2026-05-23T10:30:00Z"
}
]

#### Télécharger un document
GET /api/documents/{id}/download
Authorization: Bearer {token}
Response: [binary file content]

#### Supprimer un document
DELETE /api/documents/{id}
Authorization: Bearer {token}

### OCR

#### Preview OCR
POST /api/ocr/preview
Authorization: Bearer {token}
Content-Type: multipart/form-data

fichier: [image]

Response:
{
"succes": true,
"texte": "Quels sont les trois moyens...",
"titre_suggere": "Quels sont les trois moyens d'accéder aux services AWS ?",
"confidentialite_suggeree": "public",
"erreur": ""
}

### Audit

#### Journal complet
GET /api/audit
Authorization: Bearer {token}
Response:
[
{
"id": 1,
"action": "creation_document",
"utilisateur_nom": "John Doe",
"document_titre": "Facture 2024",
"details": {...},
"created_at": "2026-05-23T10:30:00Z"
}
]

#### Filtrer par action
GET /api/audit?action=creation_document

### Utilisateurs (Admin seulement)

#### Liste des utilisateurs
GET /api/utilisateurs
Authorization: Bearer {token}

#### Créer utilisateur
POST /api/utilisateurs
Authorization: Bearer {token}
Content-Type: application/json
{
"email": "new@siga.cm",
"password": "SecurePass123",
"full_name": "Jane Doe",
"role": "agent"
}

#### Supprimer utilisateur
DELETE /api/utilisateurs/{id}
Authorization: Bearer {token}

---

## 🔒 Sécurité

### Chiffrement des documents
- **Algorithme** : AES-256-GCM (Advanced Encryption Standard)
- **Mode** : Galois/Counter Mode (authentification + chiffrement)
- **Nonce** : 12 octets aléatoires par document
- **Intégrité** : Hash SHA-256 vérifié avant déchiffrement

### Hachage des mots de passe
- **Algorithme** : Argon2id (résistant aux attaques GPU/TPU)
- **Paramètres** : time_cost=2, memory_cost=65536, parallelism=4

### Authentification
- **Token JWT** : expiration 30 minutes
- **Signature** : HMAC-SHA256
- **Payload** : `{sub: user_id, email, role, exp}`
- **Stockage** : localStorage (client)

### Contrôle d'accès
- **Basé sur les rôles** (RBAC)
- **Permissions granulaires** par endpoint
- **Vérification** sur chaque requête

### CORS & HTTPS
- CORS configuré pour localhost:5173 (dev)
- À adapter en production avec domaine réel
- HTTPS **obligatoire** en production

---

## 🤖 Intelligence Artificielle

### OCR - Extraction de texte
**Outil** : Tesseract 5.5.0

- Extrait le texte de documents scannés (images)
- Supporte français, anglais, et 100+ langues
- Vitesse : 1-3 secondes par image
- Précision : 95%+ sur documents clairs

**Utilisation** :
```python
from app.ia.ocr import extraire_texte_ocr

resultat = extraire_texte_ocr(contenu_fichier, nom_fichier)
# Retourne : {succes, texte, titre_suggere, confidentialite_suggeree, erreur}
```

### Suggestion de titre
**Méthode** : Première ligne du texte extrait

- Prend la première ligne non vide du texte OCR
- Limite à 100 caractères
- Fallback : "Document scanné" si vide

### Analyse de confidentialité
**Méthode** : Scoring par mots-clés

**Niveaux** (par ordre de sensibilité) :
1. **SECRET** — mots-clés : "secret", "top secret", "stratégique", etc.
2. **CONFIDENTIEL** — mots-clés : "salaire", "données personnelles", "médical", etc.
3. **INTERNE** — mots-clés : "interne", "administratif", "procédure", etc.
4. **PUBLIC** — par défaut si aucun mot sensible

**Exemple** :
Texte : "Fiche de paie 2024 - Montant salaire"
→ Détecte "salaire" → CONFIDENTIEL

---

## 👥 Permissions et rôles

### Admin
- ✅ Créer/modifier/supprimer utilisateurs
- ✅ Accès à tous les documents
- ✅ Consulter journal d'audit complet
- ✅ Modifier niveaux de confidentialité
- ✅ Supprimer documents

### Agent
- ✅ Upload documents
- ✅ Accès à ses propres documents
- ✅ Utiliser OCR & suggestions IA
- ✅ Supprimer ses propres documents
- ❌ Accès aux documents d'autres agents
- ❌ Gestion utilisateurs

### Lecteur
- ✅ Consulter documents PUBLIC uniquement
- ✅ Télécharger documents publics
- ❌ Upload
- ❌ Supprimer
- ❌ Voir documents confidentiels

### Matrice d'accès

| Action | Admin | Agent | Lecteur |
|--------|-------|-------|---------|
| Voir tous les docs | ✅ | Ses docs | PUBLIC |
| Upload | ✅ | ✅ | ❌ |
| Supprimer | ✅ | Ses docs | ❌ |
| Audit | ✅ | ❌ | ❌ |
| Gestion utilisateurs | ✅ | ❌ | ❌ |
| OCR | ✅ | ✅ | ❌ |

---

## 📋 Journal d'audit

### Événements tracés

| Action | Déclencheur | Données |
|--------|-------------|---------|
| `creation_utilisateur` | Inscription admin | user_id, email, role |
| `connexion_reussie` | Login successful | user_id, email |
| `echec_connexion` | Login failed | email, raison |
| `creation_document` | Upload document | doc_id, titre, confidentialité |
| `consultation_document` | Download document | doc_id, user_id |
| `suppression_document` | Delete document | doc_id, titre |
| `suppression_utilisateur` | Delete user | user_id, email |
| `consultation_audit` | View audit log | user_id |

### Exemple d'entrée audit
```json
{
  "id": 42,
  "action": "creation_document",
  "utilisateur_nom": "John Doe",
  "document_titre": "Facture 2024",
  "details": {
    "document_id": "uuid-123",
    "nivel_confidentialite": "confidentiel",
    "hash_sha256": "abc123..."
  },
  "created_at": "2026-05-23T14:30:00Z"
}
```

---

## 🧪 Tests

### Tests unitaires

```bash
cd backend
pytest -v                    # Tous les tests
pytest -v tests/test_auth.py # Tests auth
pytest -v tests/test_documents.py # Tests documents
pytest --cov                 # Avec coverage
```

### Tests manuels - Endpoints clés

```bash
# Login
curl -X POST http://127.0.0.1:8000/api/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@siga.cm&password=Admin2024"

# Upload document
curl -X POST http://127.0.0.1:8000/api/documents/upload \
  -H "Authorization: Bearer {token}" \
  -F "titre=Test" \
  -F "fichier=@document.pdf" \
  -F "niveau_confidentialite=public"

# OCR Preview
curl -X POST http://127.0.0.1:8000/api/ocr/preview \
  -H "Authorization: Bearer {token}" \
  -F "fichier=@image.png"
```

---

## 🌍 Déploiement

### Production - Checklist
- [ ] Changer `SECRET_KEY` (générer avec `secrets.token_urlsafe(32)`)
- [ ] Configurer PostgreSQL au lieu de SQLite
- [ ] Ajouter HTTPS/SSL
- [ ] Configurer CORS correctement
- [ ] Ajouter rate limiting
- [ ] Configurer logs
- [ ] Sauvegardes automatiques BD
- [ ] Monitoring & alertes
- [ ] Vérifier RGPD (droit à l'oubli, etc.)

### Déploiement sur Heroku (exemple)

```bash
# Backend
heroku create siga-backend
git push heroku main
heroku config:set SECRET_KEY=...
heroku run python -c "from app.core.init_db import init_db; init_db()"

# Frontend
npm run build
# Déployer sur Vercel, Netlify, etc.
```

### Docker (optionnel)

```dockerfile
# backend/Dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

```bash
docker build -t siga-backend .
docker run -p 8000:8000 siga-backend
```

---

## ⚠️ Limitations connues

- **SQLite uniquement en dev** — PostgreSQL recommandé pour prod
- **OCR anglais/français** — ajouter langues via Tesseract si besoin
- **Pas de récupération de mot de passe** — réimplémenter avec email
- **PDF multiliterally** — OCR ne traite qu'une image à la fois
- **Upload max 50MB** — à configurer selon serveur
- **Pas de versioning documents** — les modifications écrasent
- **Pas de partage documents** — accès par rôle uniquement
- **Pas de recherche fulltext** — filtrage basique uniquement

---

## 📸 Captures d'écran

### Login
[Écran de connexion avec logo SIGA]
Email : _______________
Mot de passe : _______________
[Connexion]

### Dashboard
[Barre nav] SIGA | Documents | Scanner | Audit | Utilisateurs | [Déconnexion]
📊 Statistiques
├─ 24 documents archivés
├─ 3 utilisateurs actifs
└─ 156 actions auditées
🚀 Accès rapide
├─ 📤 Uploader un document
├─ 📸 Scanner avec caméra
└─ 📋 Voir audit

### Scanner OCR
[Mode Choix]
[📱 Utiliser la caméra] [📁 Uploader une image]
[Mode Caméra]
[Flux vidéo en direct]
[📸 Capturer] [✕ Fermer]
[Mode Upload - Résultats OCR]
Titre : Quels sont les trois moyens...
Confidentialité : PUBLIC
Texte extrait : "Quels sont les trois moyens..."
[✅ Archiver ce document]

---

## 🐛 Troubleshooting

### "Tesseract n'est pas installé"
```bash
# Vérifier installation
tesseract --version

# Si pas installé, télécharger depuis :
# https://github.com/UB-Mannheim/tesseract/wiki
```

### "Database locked" (SQLite)
```bash
# Supprimer et recréer
rm backend/siga.db
python backend/app/core/init_db.py
```

### "CORS error" en frontend
```javascript
// Vérifier backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Token JWT expiré
```javascript
// Frontend : supprimer token et reconnecter
localStorage.removeItem('siga_token')
window.location.href = '/login'
```

---

## 📚 Documentation complète

- **API** : http://127.0.0.1:8000/docs (Swagger)
- **ReDoc** : http://127.0.0.1:8000/redoc
- **Code** : Commentaires en français dans tous les fichiers
- **Git** : `git log --oneline` pour historique

---

## 📄 Licence

Ce projet est à usage académique (DUT Informatique). Libre de réutilisation pour d'autres projets.

---

## ✍️ Auteur

**aubin-pierre7**
- 🎓 DUT Informatique (2026)
- 📧 aubinp58@gmail.com
- 🔗 [GitHub](https://github.com/aubin-pierre7)

---

## 🙏 Remerciements

- FastAPI & communauté Python
- React & Tailwind CSS
- Tesseract OCR
- Équipe pédagogique DUT Informatique

---

**Dernière mise à jour** : 23 mai 2026
**Version** : 1.0.0
**Statut** : ✅ Prêt pour la soutenance