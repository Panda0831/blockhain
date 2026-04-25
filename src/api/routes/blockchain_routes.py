from fastapi import APIRouter, HTTPException, Depends
from typing import List
from src.blockchain.blockchain import Blockchain
from src.blockchain.transaction import Transaction, SecteurActivite as BTSecteur
from src.api.schemas.blockchain import TransactionCreate, TransactionResponse, BlockResponse, BlockchainSummary, SecteurActivite

router = APIRouter()

# Instance globale de la blockchain pour la démonstration
# Dans un projet réel, on utiliserait une base de données ou un singleton
blockchain_instance = Blockchain()

@router.get("/", response_model=BlockchainSummary)
async def get_blockchain_status():
    """Retourne un résumé de l'état de la blockchain."""
    return {
        "longueur": len(blockchain_instance.chaine),
        "dernier_hash": blockchain_instance.obtenir_dernier_bloc().hash,
        "est_valide": blockchain_instance.est_chaine_valide()
    }

@router.get("/blocks", response_model=List[BlockResponse])
async def get_blocks():
    """Retourne la liste complète des blocs."""
    # Note: On transforme les objets Block en dictionnaires compatibles avec le schéma
    blocks_data = []
    for b in blockchain_instance.chaine:
        blocks_data.append({
            "index": b.index,
            "timestamp": b.timestamp,
            "transactions": [vars(t) for t in b.transactions],
            "previous_hash": b.previous_hash,
            "merkle_root": b.merkle_root,
            "nonce": b.nonce,
            "hash": b.hash
        })
    return blocks_data

@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(tx_data: TransactionCreate):
    """Crée une nouvelle transaction et l'ajoute à la file d'attente."""
    # Conversion du secteur enum API vers enum Blockchain
    try:
        secteur_bc = BTSecteur[tx_data.secteur.name]
    except KeyError:
        raise HTTPException(status_code=400, detail="Secteur invalide")

    # Création de l'objet Transaction
    tx = Transaction(
        expediteur=tx_data.expediteur,
        destinataire=tx_data.destinataire,
        donnees=tx_data.donnees,
        secteur=secteur_bc,
        description=tx_data.description,
        montant=tx_data.montant
    )
    
    # On attache la signature fournie
    tx.signature = tx_data.signature
    
    # Validation et ajout
    if not blockchain_instance.ajouter_transaction(tx):
        raise HTTPException(status_code=400, detail="Transaction invalide (Signature ou intégrité)")
    
    return {
        "expediteur": tx.expediteur,
        "destinataire": tx.destinataire,
        "donnees": tx.donnees,
        "secteur": tx.secteur.value,
        "description": tx.description,
        "montant": tx.montant,
        "horodatage": tx.horodatage,
        "hash": tx.hash,
        "signature": tx.signature
    }

@router.post("/mine", response_model=BlockResponse)
async def mine_block():
    """Lance le processus de minage des transactions en attente."""
    if not blockchain_instance.transactions_en_attente:
        raise HTTPException(status_code=400, detail="Aucune transaction en attente à miner")
    
    nouveau_bloc = blockchain_instance.miner_transactions_en_attente(adresse_mineur="0xMineurSystème")
    
    return {
        "index": nouveau_bloc.index,
        "timestamp": nouveau_bloc.timestamp,
        "transactions": [vars(t) for t in nouveau_bloc.transactions],
        "previous_hash": nouveau_bloc.previous_hash,
        "merkle_root": nouveau_bloc.merkle_root,
        "nonce": nouveau_bloc.nonce,
        "hash": nouveau_bloc.hash
    }
