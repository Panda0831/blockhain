import re
import time
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from src.blockchain.transaction import Transaction, SecteurActivite
from src.api.instances import (
    foncier_uf, 
    blockchain_instance, 
    pending_land_requests, 
    agriculture_manager,
    pending_diploma_requests,
    microfinance_manager
)
from src.utils.persistence import save_state

router = APIRouter()

# --- SCHEMAS ---

class LandRegistrationRequest(BaseModel):
    requester_id: str
    document_url: str
    description: Optional[str] = "Demande d'immatriculation foncière"

class LandTransfer(BaseModel):
    parcel_id: str
    seller_id: str
    buyer_id: str
    signature: str
    price: float

# --- UTILS ---

def normalize_key(key: str) -> str:
    """Nettoyage agressif des clés pour la comparaison."""
    if not key: return ""
    return re.sub(r'[^a-zA-Z0-9]', '', str(key)).lower()

# --- ROUTES ---

@router.post("/request")
async def submit_land_request(data: LandRegistrationRequest):
    """Soumission d'une demande d'immatriculation par un citoyen."""
    request_id = len(pending_land_requests) + 1
    new_request = {
        "id": request_id,
        "requester_id": data.requester_id,
        "document_url": data.document_url,
        "description": data.description,
        "status": "PENDING"
    }
    pending_land_requests.append(new_request)
    save_state(
        blockchain_instance, 
        foncier_uf, 
        pending_land_requests, 
        agriculture_manager.lots, 
        pending_diploma_requests,
        microfinance_manager.pending_transfers
    )
    return {"status": "SUCCESS", "message": "Demande envoyée", "request_id": request_id}

@router.get("/pending")
async def get_pending_requests():
    """Liste des demandes en attente pour l'administrateur."""
    return [r for r in pending_land_requests if r["status"] == "PENDING"]

from src.api.deps import RoleChecker

@router.post("/approve/{request_id}", dependencies=[Depends(RoleChecker(['FONCIER', 'ADMIN']))])
async def approve_land_request(request_id: int):
    """Approbation d'une demande par l'administrateur."""
    try:
        request = next((r for r in pending_land_requests if r["id"] == request_id), None)
        if not request or request["status"] != "PENDING":
            raise HTTPException(status_code=404, detail="Demande introuvable ou déjà traitée")

        generated_parcel_id = f"HZL-LND-{int(time.time())}-{request_id}"

        # 1. Mise à jour de la propriété (Union-Find)
        foncier_uf.bind(request["requester_id"], generated_parcel_id)

        # 2. Enregistrement et Minage automatique
        tx = Transaction(
            expediteur="ADMIN_GOUVERNEMENT",
            destinataire=request["requester_id"],
            donnees={"parcel_id": generated_parcel_id, "action": "REGISTRATION_APPROVED"},
            secteur=SecteurActivite.FONCIER,
            description=f"Approbation titre {generated_parcel_id}",
            montant=0
        )
        tx.signature = "SIG_OFFICIELLE_ADMIN"
        
        mined_block = blockchain_instance.ajouter_et_miner(tx, adresse_mineur="GOUVERNEMENT_POOL")
        if not mined_block:
            raise HTTPException(status_code=500, detail="Erreur lors de l'ajout ou du minage à la Blockchain")

        request["status"] = "APPROVED"
        request["generated_parcel_id"] = generated_parcel_id
        
        save_state(
        blockchain_instance, 
        foncier_uf, 
        pending_land_requests, 
        agriculture_manager.lots, 
        pending_diploma_requests,
        microfinance_manager.pending_transfers
    )
        
        return {
            "status": "SUCCESS", 
            "message": "Titre validé et miné sur la blockchain", 
            "parcel_id": generated_parcel_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

@router.post("/transfer")
async def transfer_land(data: LandTransfer):
    """Transfert de propriété entre deux citoyens."""
    try:
        if not foncier_uf.exists(data.parcel_id):
            raise HTTPException(status_code=404, detail="Parcelle non trouvée.")

        # Vérification du propriétaire actuel
        current_owner = foncier_uf.find(data.parcel_id)
        if normalize_key(current_owner) != normalize_key(data.seller_id):
            raise HTTPException(
                status_code=403, 
                detail=f"Le vendeur n'est pas le propriétaire légal."
            )

        # 1. Mise à jour Union-Find
        foncier_uf.bind(data.buyer_id, data.parcel_id)

        # 2. Transaction et Minage automatique
        tx = Transaction(
            expediteur=data.seller_id,
            destinataire=data.buyer_id,
            donnees={"parcel_id": data.parcel_id, "action": "TRANSFER"},
            secteur=SecteurActivite.FONCIER,
            description=f"Vente de la parcelle {data.parcel_id}",
            montant=data.price
        )
        tx.signature = data.signature 
        
        mined_block = blockchain_instance.ajouter_et_miner(tx, adresse_mineur="GOUVERNEMENT_POOL")
        if not mined_block:
            raise HTTPException(status_code=400, detail="Transaction invalide ou erreur de minage")
        save_state(
        blockchain_instance, 
        foncier_uf, 
        pending_land_requests, 
        agriculture_manager.lots, 
        pending_diploma_requests,
        microfinance_manager.pending_transfers
    )
        
        return {
            "status": "SUCCESS",
            "message": f"Transfert de {data.parcel_id} réussi",
            "transaction_hash": tx.hash
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/owner/{public_key}")
async def get_user_parcels(public_key: str):
    """Liste les parcelles appartenant à une clé publique."""
    owned_parcels = []
    norm_target = normalize_key(public_key)
    
    for item in list(foncier_uf.parent.keys()):
        if item.startswith("HZL-LND") or item.startswith("P"):
            owner = foncier_uf.find(item)
            if owner and normalize_key(owner) == norm_target:
                owned_parcels.append(item)
    
    return owned_parcels

@router.get("/{parcel_id}")
async def get_land_status(parcel_id: str):
    """Consulte le statut actuel d'une parcelle."""
    if not foncier_uf.exists(parcel_id):
        return {"status": "NOT_FOUND"}
    
    owner = foncier_uf.find(parcel_id)
    return {
        "parcel_id": parcel_id,
        "owner_id": owner,
        "status": "REGISTERED"
    }

@router.get("/history/{parcel_id}")
async def get_land_history(parcel_id: str):
    """Récupère l'historique complet des mutations d'une parcelle."""
    history = []
    for bloc in blockchain_instance.chaine:
        for tx in bloc.transactions:
            if isinstance(tx.donnees, dict) and tx.donnees.get("parcel_id") == parcel_id:
                history.append({
                    "hash": tx.hash,
                    "action": tx.donnees.get("action"),
                    "expediteur": tx.expediteur,
                    "destinataire": tx.destinataire,
                    "horodatage": tx.horodatage,
                    "description": tx.description,
                    "bloc_index": bloc.index
                })
    return history
