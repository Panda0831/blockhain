from typing import List, Dict
from src.blockchain.transaction import Transaction, SecteurActivite
from src.blockchain.merkle_tree import MerkleTree

class DiplomaManager:
    """
    Gère la certification des diplômes sur la blockchain Hazo Lova.
    Utilise des preuves de Merkle pour valider l'authenticité.
    """
    def __init__(self, blockchain):
        self.blockchain = blockchain
        self.diplomas: Dict[str, dict] = {} # diploma_id -> info

    def register_diploma(self, student_id: str, degree_title: str, university: str, year: int):
        """Enregistre un diplôme sur la blockchain."""
        diploma_id = f"DIP-{student_id}-{year}"
        
        diploma_data = {
            "student_id": student_id,
            "title": degree_title,
            "university": university,
            "year": year
        }
        
        tx = Transaction(
            expediteur="UNIVERSITE_SYSTEM",
            destinataire=student_id,
            donnees=diploma_data,
            secteur=SecteurActivite.DIPLOME,
            description=f"Diplôme {degree_title} émis par {university}",
            montant=0
        )
        tx.signature = "SIG_ADMIN_DIPLOME"
        
        if self.blockchain.ajouter_transaction(tx):
            self.diplomas[diploma_id] = diploma_data
            return diploma_id
        return None

    def get_diploma_proof(self, diploma_id: str):
        """
        Génère la preuve de Merkle pour un diplôme donné.
        """
        # 1. Trouver la transaction correspondant au diplôme
        target_tx = None
        target_block = None
        for block in self.blockchain.chaine:
            for tx in block.transactions:
                if isinstance(tx.donnees, dict) and tx.donnees.get("student_id") in diploma_id:
                    target_tx = tx
                    target_block = block
                    break
        
        if not target_tx or not target_block:
            return None
            
        # 2. Générer la preuve
        tree = MerkleTree(target_block.transactions)
        tx_index = target_block.transactions.index(target_tx)
        proof = tree.get_proof(tx_index)
        
        return {
            "root": tree.root,
            "proof": proof,
            "tx_hash": target_tx.hash
        }
