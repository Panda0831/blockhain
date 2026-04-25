# 📝 TODO List - Projet Hazo Lova (L2 ESMIA)

Ce document suit la progression de l'infrastructure décentralisée pour Madagascar 2035.

## 🟢 PHASE 1 : Architecture & Cadrage (Terminé / En cours)
- [x] Définir les 4 secteurs critiques (Vanille, Diplômes, Foncier, Microfinance).
- [x] Concevoir le Diagramme de Classes (PlantUML / StarUML).
- [x] Scénariser les Cas d'Utilisation (Scénarios A, B, C).
- [ ] Finaliser le **Dossier d'Architecture** (Exporter les diagrammes en PNG dans `/docs`).

## 📅 ORDRE DE PRIORITÉ ET DÉPENDANCES DES FICHIERS (À CODER)

1.  **Transaction** (`src/blockchain/transaction.py`)
    - [ ] Définir l'objet de base (ID, Expéditeur, Destinataire, Type, Hash).
    - [ ] Implémenter le hachage avec `hashlib`.
    - [ ] *Dépendance : Aucune.*

2.  **Union-Find** (`src/algorithms/union_find.py`)
    - [x] Implémenter les opérations `find` et `union`.
    - [x] Ajouter la détection de conflits pour les terrains.
    - [ ] *Dépendance : Transaction.*

3.  **Merkle Tree** (`src/blockchain/merkle_tree.py`)
    - [ ] Construire l'arbre à partir d'une liste de transactions.
    - [ ] Obtenir la racine (`root`) pour le bloc.
    - [ ] *Dépendance : Transaction.*

4.  **Block** (`src/blockchain/block.py`)
    - [ ] Définir la structure du bloc (Index, Timestamp, Merkle Root, Previous Hash).
    - [ ] Implémenter le hachage du bloc.
    - [ ] *Dépendance : Transaction, Merkle Tree.*

5.  **Blockchain** (`src/blockchain/blockchain.py`)
    - [ ] Gérer la chaîne de blocs et le consensus simple.
    - [ ] Implémenter le minage des transactions en attente.
    - [ ] *Dépendance : Block, Transaction.*

6.  **Graph & Districts** (`src/models/graph.py`)
    - [ ] Charger les données depuis `data/districts_mada.csv`.
    - [ ] Créer la structure de liste d'adjacence pour les 119 districts.
    - [ ] *Dépendance : Données CSV.*

7.  **Tas Binaire** (`src/models/heap.py`)
    - [ ] Implémenter le tas pour gérer les priorités.
    - [ ] *Dépendance : Aucune.*

8.  **A*** (`src/algorithms/astar.py`)
    - [ ] Implémenter l'algorithme de routage entre les districts.
    - [ ] *Dépendance : Graph, Tas Binaire.*

9.  **Q-Learning** (`src/algorithms/qlearning.py`)
    - [ ] Créer l'agent pour la sélection des validateurs.
    - [ ] *Dépendance : Blockchain, Graph.*

## 🟠 PHASE 3 : Optimisation & Benchmarks (CRITIQUE pour la note)
- [ ] Créer une **Baseline** (ex: propagation sans A*, validation aléatoire).
- [ ] Réaliser les tests de performance (temps de calcul, économie d'énergie).
- [ ] Générer le tableau comparatif "Baseline vs Optimisé" dans `/benchmarks`.

## 🔵 PHASE 3 : Backend API (FastAPI)
- [x] Créer les schémas de données (Pydantic).
- [x] Implémenter les routes pour la Blockchain.
- [x] Développer les services pour les secteurs (Foncier, Diplôme, etc.).

## 🔴 PHASE 4 : Prototype & Présentation
- [ ] **Frontend Web (Next.js)** : Interface pro avec Tailwind CSS.
- [ ] **Intégration API** : Appels API via Axios/Fetch vers FastAPI.
- [ ] **Mobile (React Native)** : (Optionnel/Plus tard) Initialisation du projet mobile.

---
*Note : Pour chaque fonctionnalité, n'oubliez pas d'ajouter les tests unitaires dans `/tests/unit` !*
