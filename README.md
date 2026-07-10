# Hazo Lova - Blockchain Madagascar 2035

Infrastructure blockchain décentralisée optimisée pour les enjeux critiques de Madagascar.

## 🛠 Stack Technique
- **Backend :** FastAPI (Python 3.13), SQLAlchemy (SQLite) - Logique métier, Blockchain et Algorithmes.
- **Frontend Web :** React / Vite (TypeScript) - Interface web moderne.
- **Frontend Mobile :** React Native (Expo) - Application mobile native.
- **Cryptographie :** ECDSA (secp256k1) et Bcrypt.
- **Persistence :** Fichiers Pickle et JSON dans `data/persistence/`.
- **Algorithmes :**
  - **A* :** Optimisation des flux logistiques (traçabilité multi-produits).
  - **Q-Learning :** Sélection intelligente des validateurs (économie d'énergie).
  - **Union-Find :** Gestion de l'intégrité foncière.

## 📂 Structure du Projet
- `src/blockchain/` : Cœur du protocole blockchain (PoW, Merkle Trees).
- `src/api/` : API REST FastAPI (Point d'entrée unique).
- `interfaces/web/` : Application Web React + Vite.
- `interfaces/mobile/` : Application Mobile React Native (Expo).

## 🚀 Installation & Lancement

### 1. Backend (FastAPI)
Il est recommandé d'utiliser **Conda** pour gérer l'environnement virtuel avec Python 3.13.

```bash
# 1.1 Créer l'environnement virtuel Conda
conda create -n hazolova python=3.13 -y

# 1.2 Activer l'environnement
conda activate hazolova

# 1.3 Installer les dépendances Python
pip install -r requirements.txt

# 1.4 Lancer le serveur backend
uvicorn src.api.main:app --reload
```

### 2. Frontend Web (Vite)
```bash
# 2.1 Aller dans le répertoire web
cd interfaces/web

# 2.2 Installer les dépendances Node.js
npm install

# 2.3 Lancer le serveur de développement
npm run dev
```

### 3. Frontend Mobile (Expo)
```bash
cd interfaces/mobile
npm install
npm start
```
