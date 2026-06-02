
import time
from src.api.instances import blockchain_instance, foncier_uf, pending_land_requests, agriculture_manager, pending_diploma_requests, microfinance_manager, diploma_manager
from src.blockchain.transaction import Transaction, SecteurActivite
from src.utils.persistence import save_state
from src.utils.crypto import Crypto
from src.utils.sync import sync_all

def simulate_land_creation(user_pub_key):
    print("--- Simulation de création et minage d'une parcelle ---")
    
    # 1. Créer une demande fictive
    request_id = len(pending_land_requests) + 1
    new_request = {
        "id": request_id,
        "requester_id": user_pub_key,
        "document_url": "ipfs://fictif-demo",
        "description": "Parcelle de test automatique",
        "status": "PENDING"
    }
    pending_land_requests.append(new_request)
    print(f"Demande créée avec ID: {request_id}")
    
    # 2. Approbation automatique (Admin)
    generated_parcel_id = f"HZL-LND-{int(time.time())}-{request_id}"
    
    tx = Transaction(
        expediteur="ADMIN_GOUVERNEMENT",
        destinataire=user_pub_key,
        donnees={"parcel_id": generated_parcel_id, "action": "REGISTRATION_APPROVED"},
        secteur=SecteurActivite.FONCIER,
        description=f"Approbation titre {generated_parcel_id}",
        montant=0
    )
    tx.signature = "SIG_OFFICIELLE_ADMIN"
    
    blockchain_instance.ajouter_transaction(tx)
    print(f"Transaction d'approbation ajoutée: {tx.hash}")
    
    # 3. Minage pour valider la transaction
    blockchain_instance.miner_transactions_en_attente(adresse_mineur="ADMIN_GOUVERNEMENT")
    print("Blockchain minée.")
    
    # 4. Synchronisation
    all_instances = {
        "agriculture_manager": agriculture_manager,
        "foncier_uf": foncier_uf,
        "pending_land_requests": pending_land_requests,
        "diploma_manager": diploma_manager,
        "pending_diploma_requests": pending_diploma_requests,
        "microfinance_manager": microfinance_manager
    }
    sync_all(blockchain_instance, all_instances)
    print("État synchronisé.")
    
    # 5. Sauvegarde
    save_state(
        blockchain_instance, 
        foncier_uf, 
        pending_land_requests, 
        agriculture_manager.lots, 
        pending_diploma_requests,
        microfinance_manager.pending_transfers
    )
    print("État persisté.")
    print(f"Parcelle {generated_parcel_id} créée et associée à {user_pub_key}")

if __name__ == "__main__":
    user_key = "('0xe849c6df1edcc1482c54236d4fcc2d08bbb2d2f633742e396209f8789c723889', '0xda38bd87532d4e1c9532e8881d0414599e435c636bff1a9635b2dbd83801b52')"
    simulate_land_creation(user_key)
