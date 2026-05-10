from src.algorithms.union_find import UnionFind
from src.models.graph import DistrictsGraph
from src.algorithms.qlearning import QLearningValidator
from src.blockchain.blockchain import Blockchain

from src.utils.persistence import load_state

# Chargement de l'état persisté
blockchain_instance, foncier_uf, pending_land_requests = load_state()

# Initialisation par défaut si aucun état n'existe
if blockchain_instance is None:
    blockchain_instance = Blockchain()

if foncier_uf is None:
    foncier_uf = UnionFind()

# Instance globale pour le Graphe des districts
graphe = DistrictsGraph()
try:
    graphe.charger_depuis_csv("data/districts_madagascar.csv")
    graphe.generer_reseau_automatique(k=3)
except Exception as e:
    print(f"Erreur chargement graphe: {e}")

# Instance globale pour l'IA de validation
actions = list(graphe.districts.keys()) if graphe.districts else [1, 2, 3]
brain = QLearningValidator(actions_possibles=actions)
