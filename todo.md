# 📝 TODO List - Projet Hazo Lova (Madagascar 2035)

Ce document suit la progression de l'infrastructure décentralisée Hazo Lova.

## ✅ PHASE 1 : Fondations & Core (Terminé)
- [x] **Blockchain Core** : Blocs, Transactions, Arbre de Merkle, Minage.
- [x] **Sécurité** : Cryptographie ECDSA (secp256k1), Hachage Bcrypt, Signatures.
- [x] **Algorithmes IA & Réseau** : Union-Find (Foncier), A* (Routage), Q-Learning (Validation).
- [x] **Backend API** : Architecture FastAPI, Authentification, Rôles (Citoyen/Admin).
- [x] **Persistance** : Sauvegarde automatique de l'état (Blockchain & Cadastre).
- [x] **Use Case : Foncier** : Workflow complet (Demande -> Approbation -> Transfert -> Timeline).

## 🟡 PHASE 2 : Développement des Cas d'Usage Métier (En Cours)

### 🌿 1. Produits Agricoles (Traçabilité Vanille)
- [ ] **Backend** : Créer les routes pour l'enregistrement des récoltes et le suivi des lots.
- [ ] **IA Integration** : Utiliser A* pour optimiser le transport des collecteurs vers les centres de pesage.
- [ ] **Mobile** : Écran de scan/enregistrement pour les collecteurs et exportateurs.
- [ ] **Blockchain** : Inscrire l'origine et la qualité sur la chaîne.

### 🎓 2. Éducation (Certification des Diplômes)
- [ ] **Backend** : Route pour les Universités (Emetteurs de diplômes certifiés).
- [ ] **Vérification** : Outil de vérification instantanée via Root de Merkle.
- [ ] **Mobile** : Portefeuille numérique de diplômes pour le citoyen.

### 💰 3. Microfinance (Inclusion Financière)
- [ ] **Backend** : Système de demande de prêt basé sur la réputation blockchain.
- [ ] **Logic** : Validation des garanties (ex: utiliser un titre foncier comme garantie via Union-Find).
- [ ] **Mobile** : Interface de suivi des remboursements et solde.

## 🔵 PHASE 3 : Interfaces Utilisateurs (UI/UX)

### 💻 Web Dashboard (React)
- [x] Initialisation du projet et Authentification.
- [ ] **Vue Explorateur** : Visualisation de la blockchain (blocs et transactions).
- [ ] **Vue Carte** : Visualisation géographique des districts (Graphe).
- [ ] **Dashboard Admin** : Gestion globale des demandes.

### 📱 Mobile App (React Native)
- [x] Authentification et Navigation.
- [x] Module Foncier complet (Certificat, Timeline, Transfert).
- [ ] Intégration des modules Agriculture, Diplômes et Finance.
- [ ] Finalisation du design (Palette de couleurs, animations).

## 🟠 PHASE 4 : Optimisation & Benchmarks (CRITIQUE)
- [ ] **Benchmark IA** : Comparer Q-Learning vs Validation Aléatoire (Énergie économisée).
- [ ] **Benchmark Réseau** : Comparer A* vs Routage standard (Temps de propagation).
- [ ] **Rapport Technique** : Générer les graphiques de performance dans `/benchmarks`.

## 🔴 PHASE 5 : Finalisation & Présentation
- [ ] **Documentation** : Exporter les diagrammes UML finaux dans `/docs`.
- [ ] **Rapport d'Avancement** : Mettre à jour `ETAT_AVANCEMENT_PROJET.txt`.
- [ ] **Vidéo Démo** : Enregistrer un scénario complet (de la récolte de vanille au transfert de terrain).
- [ ] **Mémoire Technique** : Rédaction finale pour le jury ESMIA.

---
_Dernière mise à jour : Dimanche 10 Mai 2026_
