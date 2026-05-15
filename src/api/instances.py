# instances
from src.algorithms.qlearning import QLearningValidator
from src.algorithms.union_find import UnionFind
from src.blockchain.blockchain import Blockchain
from src.models.graph import DistrictsGraph
from src.use_cases.produitsAgricoles import AgricultureManager
from src.use_cases.diploma import DiplomaManager
from src.utils.persistence import load_state

# Chargement de l'état persisté
blockchain_instance, foncier_uf, pending_land_requests, agri_lots = load_state()

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

# Instance pour la gestion de l'Agriculture
agriculture_manager = AgricultureManager(blockchain_instance, graphe)
# Désactivé pour le développement : 
# if agri_lots:
#    agriculture_manager.lots = agri_lots

# Instance pour la gestion de l'Éducation
diploma_manager = DiplomaManager(blockchain_instance)
