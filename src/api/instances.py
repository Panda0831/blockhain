# instances
from src.algorithms.qlearning import QLearningValidator
from src.algorithms.union_find import UnionFind
from src.blockchain.blockchain import Blockchain
from src.models.graph import DistrictsGraph
from src.use_cases.diploma import DiplomaManager
from src.use_cases.produitsAgricoles import AgricultureManager
from src.utils.persistence import load_state

# Instance globale pour le stockage des notifications
notifications = []

# Chargement de l'état persisté
(
    blockchain_instance,
    foncier_uf,
    pending_land_requests,
    agri_lots,
    pending_diploma_requests,
    pending_transfers,
) = load_state()
# ... (rest of file)
# Initialisation par défaut si aucun état n'existe
if blockchain_instance is None:
    blockchain_instance = Blockchain()

if foncier_uf is None:
    foncier_uf = UnionFind()

# Instance globale pour le Graphe des districtsh
#
#
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
if agri_lots:
    agriculture_manager.lots = agri_lots

# Instance pour la gestion de l'Éducation
diploma_manager = DiplomaManager(blockchain_instance)

# Instance pour la Microfinance
from src.use_cases.microfinance import MicrofinanceManager

microfinance_manager = MicrofinanceManager(blockchain_instance)
if pending_transfers:
    microfinance_manager.pending_transfers = pending_transfers
