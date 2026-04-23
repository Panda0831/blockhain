# Hazo Lova - Blockchain Madagascar 2035

Infrastructure blockchain décentralisée optimisée pour les enjeux critiques de Madagascar.

## 🛠 Stack Technique
- **Backend :** FastAPI (Python) - Logique métier, Blockchain et Algorithmes.
- **Frontend Web :** Next.js (TypeScript/React) - Interface web moderne.
- **Frontend Mobile :** React Native (Prévu) - Application mobile native.
- **Base de données :** SQLAlchemy / PostgreSQL.
- **Algorithmes :**
  - **A* :** Optimisation des flux logistiques.
  - **Q-Learning :** Sélection intelligente des validateurs (économie d'énergie).
  - **Union-Find :** Gestion de l'intégrité foncière.

## 📂 Structure du Projet
- `src/blockchain/` : Cœur du protocole blockchain.
- `src/api/` : API REST FastAPI (Point d'entrée unique).
- `interfaces/web/` : Application Web Next.js.
- `interfaces/mobile/` : Application Mobile React Native.

## 🚀 Installation

### 1. Backend (FastAPI)
```bash
pip install -r requirements.txt
uvicorn src.api.main:app --reload
```

### 2. Frontend Web (Next.js)
```bash
cd interfaces/web
npm install
npm run dev
```
