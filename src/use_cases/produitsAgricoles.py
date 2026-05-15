import re
from typing import List, Optional, Dict
from pydantic import BaseModel
import time

from src.blockchain.transaction import Transaction, SecteurActivite
from src.algorithms.astar import AStar
from src.models.graph import DistrictsGraph

class AgriculturalLot(BaseModel):
    id: str
    owner_id: str
    product_type: str  # ex: Vanille, Girofle, Litchi, Riz
    district_origin: str
    weight: float  # en kg
    quality: str  # ex: Premium, Standard, Grade A
    status: str  # RECOLTE, COLLECTE, EN_TRANSIT, EXPORTE
    traceability: List[dict] = []

class AgricultureManager:
    """
    Gère le cycle de vie des produits agricoles malgaches.
    Récolte -> Transport Optimisé (A*) -> Blockchain.
    """
    def __init__(self, blockchain, districts_graph: DistrictsGraph):
        self.blockchain = blockchain
        self.graph = districts_graph
        self.astar = AStar(districts_graph)
        self.lots: Dict[str, AgriculturalLot] = {}

    def register_harvest(self, owner_id: str, product_type: str, district: str, weight: float, quality: str):
        """Enregistre une nouvelle récolte sur la blockchain."""
        # ID simplifié : HZL-TIMESTAMP
        lot_id = f"HZL-{int(time.time())}"
        
        lot = AgriculturalLot(
            id=lot_id,
            owner_id=str(owner_id),
            product_type=product_type,
            district_origin=district,
            weight=weight,
            quality=quality,
            status="RECOLTE",
            traceability=[{"action": "RECOLTE", "lieu": district, "timestamp": time.time()}]
        )
        
        # Inscription Blockchain
        tx = Transaction(
            expediteur=owner_id,
            destinataire="COOPERATIVE_REGIONALE",
            donnees=lot.dict(),
            secteur=SecteurActivite.PRODUITS_AGRICOLES,
            description=f"Récolte de {weight}kg de {product_type} ({quality}) à {district}",
            montant=0
        )
        tx.signature = "SIG_PROD_DEMO"
        
        if self.blockchain.ajouter_transaction(tx):
            self.lots[lot_id] = lot
            print(f"DEBUG: Lot stored with ID: {lot_id}. Current lots: {list(self.lots.keys())}")
            return lot
        return None

    def optimize_transport(self, lot_id: str, destination_district: str):
        """Calcule le chemin optimal entre deux districts pour n'importe quel produit."""
        
        # Recherche sécurisée du lot
        lot = next((v for k, v in self.lots.items() if k == lot_id), None)
        
        if lot is None:
            return None
        start_node = next((d for d in self.graph.districts.values() if d.nom == lot.district_origin), None)
        end_node = next((d for d in self.graph.districts.values() if d.nom == destination_district), None)
        
        if not start_node or not end_node:
            return None
            
        path_ids = self.astar.find_path(start_node.id, end_node.id)
        if not path_ids:
            return None

        path_names = [self.graph.nodes[node_id].name for node_id in path_ids]
        
        # Mise à jour du lot
        lot.status = "EN_TRANSIT"
        lot.traceability.append({
            "action": "TRANSPORT_OPTIMISE", 
            "destination": destination_district, 
            "chemin": path_names,
            "timestamp": time.time()
        })
        
        # Transaction Blockchain
        tx = Transaction(
            expediteur=lot.owner_id,
            destinataire=f"CENTRE_COLLECTE_{destination_district.upper()}",
            donnees={"lot_id": lot_id, "chemin": path_names, "action": "TRANSPORT"},
            secteur=SecteurActivite.PRODUITS_AGRICOLES,
            description=f"Lot {lot_id} ({lot.product_type}) en transit vers {destination_district}",
            montant=0
        )
        tx.signature = "SIG_COLLECTEUR_DEMO"
        self.blockchain.ajouter_transaction(tx)
        
        return lot
