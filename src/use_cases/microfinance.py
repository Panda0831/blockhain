from typing import List, Dict, Optional
import time
from src.blockchain.transaction import Transaction, SecteurActivite

class MicrofinanceManager:
    """
    Gère les transactions financières et les micro-prêts.
    Workflow : Envoi -> Attente -> Acceptation -> Blockchain.
    """
    def __init__(self, blockchain):
        self.blockchain = blockchain
        self.pending_transfers: List[dict] = []

    def create_transfer_request(self, sender_id: str, receiver_id: str, amount: float, description: str):
        """Initialise une demande de transfert d'argent."""
        transfer_id = int(time.time() * 1000) # ID basé sur le timestamp
        
        request = {
            "id": transfer_id,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "amount": amount,
            "description": description,
            "timestamp": time.time(),
            "status": "PENDING"
        }
        
        self.pending_transfers.append(request)
        return request

    def accept_transfer(self, transfer_id: int):
        """Le destinataire accepte l'argent, déclenchant l'inscription blockchain."""
        transfer = next((t for t in self.pending_transfers if t["id"] == transfer_id), None)
        
        if not transfer:
            return None, "Transfert non trouvé"
            
        # Création de la transaction officielle sur la blockchain
        tx = Transaction(
            expediteur=transfer["sender_id"],
            destinataire=transfer["receiver_id"],
            donnees={"transfer_id": transfer_id, "type": "MICRO_TRANSFER"},
            secteur=SecteurActivite.MICROFINANCE,
            description=transfer["description"],
            montant=transfer["amount"]
        )
        
        # On utilise une signature de démo
        tx.signature = "SIG_FINANCE_DEMO"
        
        if self.blockchain.ajouter_transaction(tx):
            # Marquer comme complété et retirer de la liste pending
            transfer["status"] = "COMPLETED"
            transfer["tx_hash"] = tx.hash
            self.pending_transfers.remove(transfer)
            
            # Minage automatique
            self.blockchain.miner_transactions_en_attente(adresse_mineur="FINANCE_POOL")
            
            return transfer, None
            
        return None, "Erreur lors de l'ajout à la blockchain"

    def get_pending_for_user(self, user_id: str):
        """Récupère les transferts qu'un utilisateur doit accepter."""
        # On nettoie un peu les clés pour la comparaison si nécessaire
        return [t for t in self.pending_transfers if t["receiver_id"] == user_id]
