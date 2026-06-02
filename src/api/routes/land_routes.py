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
    microfinance_manager,
    parcel_owner_map
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
    print(f" [DEBUG] Nouvelle demande foncière reçue: {data}")
    request_id = len(pending_land_requests) + 1
    new_request = {
        "id": request_id,
        "requester_id": data.requester_id,
        "document_url": data.document_url,
        "description": data.description,
        "status": "PENDING"
    }
    pending_land_requests.append(new_request)
    print(f" [DEBUG] Demande ajoutée. Liste totale: {len(pending_land_requests)}")
    save_state(
        blockchain_instance, 
        foncier_uf, 
        pending_land_requests, 
        agriculture_manager.lots, 
        pending_diploma_requests,
        microfinance_manager.pending_transfers
    )
    print(f" [DEBUG] État sauvegardé.")
    return {"status": "SUCCESS", "message": "Demande envoyée", "request_id": request_id}

@router.get("/pending")
async def get_pending_requests():
    """Liste des demandes en attente pour l'administrateur."""
    print(f" [DEBUG] Demande de liste pending. Liste totale: {len(pending_land_requests)}")
    pending = [r for r in pending_land_requests if r["status"] == "PENDING"]
    print(f" [DEBUG] Demandes PENDING trouvées: {len(pending)}")
    return pending

from src.api.deps import RoleChecker

@router.post("/approve/{request_id}", dependencies=[Depends(RoleChecker(['FONCIER', 'ADMIN']))])
async def approve_land_request(request_id: int):
    """Approbation d'une demande par l'administrateur."""
    try:
        request = next((r for r in pending_land_requests if r["id"] == request_id), None)
        if not request or request["status"] != "PENDING":
            raise HTTPException(status_code=404, detail="Demande introuvable ou déjà traitée")

        generated_parcel_id = f"HZL-LND-{int(time.time())}-{request_id}"

        # 1. Enregistrement (sans minage automatique, plus de bind immédiat)
        tx = Transaction(
            expediteur="ADMIN_GOUVERNEMENT",
            destinataire=request["requester_id"],
            donnees={"parcel_id": generated_parcel_id, "action": "REGISTRATION_APPROVED"},
            secteur=SecteurActivite.FONCIER,
            description=f"Approbation titre {generated_parcel_id}",
            montant=0
        )
        tx.signature = "SIG_OFFICIELLE_ADMIN"

        blockchain_instance.ajouter_transaction(tx)

        # On garde la trace locale mais on ne valide pas encore l'immatriculation
        request["status"] = "WAITING_FOR_MINING"
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
            "message": "Titre validé et en attente de minage sur la blockchain", 
            "parcel_id": generated_parcel_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

from src.api.deps import get_current_user
from src.db.models import User

@router.post("/transfer")
async def transfer_land(data: LandTransfer, current_user: User = Depends(get_current_user)):
    """Transfert de propriété entre deux citoyens."""
    try:
        if not foncier_uf.exists(data.parcel_id):
            raise HTTPException(status_code=404, detail="Parcelle non trouvée.")

        # Vérification de sécurité : Seul le propriétaire peut vendre
        current_owner = foncier_uf.find(data.parcel_id)
        
        # Le propriétaire est stocké dans la map comme une chaîne normalisée
        # On compare la clé normalisée du current_owner avec la clé normalisée du user.
        # Attention: current_owner peut être un tuple ou une chaîne.
        
        owner_raw = str(current_owner)
        user_pk_raw = str(current_user.public_key)
        
        owner_norm = normalize_key(owner_raw)
        user_norm = normalize_key(user_pk_raw)
        
        print(f" [DEBUG] Transfer check: Parcel {data.parcel_id}")
        print(f" [DEBUG] Current Owner raw: {owner_raw}, Norm: {owner_norm}")
        print(f" [DEBUG] User Public Key raw: {user_pk_raw}, Norm: {user_norm}")
        print(f" [DEBUG] Match: {owner_norm == user_norm}")

        if owner_norm != user_norm:
             # AVANT de lever l'erreur, regardons si la parcelle est dans la map
             if data.parcel_id in parcel_owner_map:
                 map_owner = parcel_owner_map[data.parcel_id]
                 map_owner_norm = normalize_key(str(map_owner))
                 print(f" [DEBUG] Map Owner: {map_owner}, Norm: {map_owner_norm}")
                 if map_owner_norm == user_norm:
                     print(" [DEBUG] MATCH FOUND IN MAP! Using MAP OWNER")
                     current_owner_norm = map_owner_norm
        
        if owner_norm != user_norm and ('map_owner_norm' not in locals() or map_owner_norm != user_norm):
            raise HTTPException(
                status_code=403, 
                detail=f"Action interdite : Vous n'êtes pas le propriétaire légal. (OwnerNorm: {owner_norm}, UserNorm: {user_norm})"
            )

        # 1. Transaction (sans minage automatique, plus de bind immédiat)
        tx = Transaction(
            expediteur=current_user.public_key,
            destinataire=data.buyer_id,
            donnees={"parcel_id": data.parcel_id, "action": "TRANSFER"},
            secteur=SecteurActivite.FONCIER,
            description=f"Vente de la parcelle {data.parcel_id}",
            montant=data.price
        )
        tx.signature = data.signature

        blockchain_instance.ajouter_transaction(tx)

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
            "message": f"Transfert de {data.parcel_id} en attente de minage",
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
    
    # 1. Normaliser la clé d'entrée pour la comparaison
    norm_target = normalize_key(public_key)
    
    # Debug
    print(f" [DEBUG] Querying for normalized key: {norm_target}")
    print(f" [DEBUG] Current parcel_owner_map size: {len(parcel_owner_map)}")
    
    # 2. Utiliser la map simple
    for parcel_id, owner in parcel_owner_map.items():
        owner_norm = normalize_key(str(owner))
        if owner_norm == norm_target:
            owned_parcels.append(parcel_id)
            print(f" [DEBUG] MATCH FOUND: {parcel_id}")
    
    print(f" [DEBUG] Returning: {owned_parcels}")
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
