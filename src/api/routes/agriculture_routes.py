from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional

from src.api.instances import blockchain_instance, agriculture_manager, foncier_uf, pending_land_requests
from src.use_cases.produitsAgricoles import AgriculturalLot
from src.utils.persistence import save_state

router = APIRouter()

class HarvestRequest(BaseModel):
    owner_id: str
    product_type: str  # ex: "Vanille", "Girofle", "Café"
    district: str
    weight: float
    quality: str

class TransportRequest(BaseModel):
    lot_id: str
    destination: str

@router.post("/harvest")
async def record_harvest(data: HarvestRequest):
    """Enregistre une nouvelle récolte agricole."""
    lot = agriculture_manager.register_harvest(
        data.owner_id, data.product_type, data.district, data.weight, data.quality
    )
    if not lot:
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement")
    
    blockchain_instance.miner_transactions_en_attente(adresse_mineur="AGRI_POOL")
    save_state(blockchain_instance, foncier_uf, pending_land_requests, agriculture_manager.lots)
    return {"status": "SUCCESS", "lot": lot}

@router.post("/transport")
async def optimize_transport(request: Request, data: TransportRequest):
    """Optimise le trajet de transport pour un lot."""
    print(f"DEBUG: Received request to /api/agriculture/transport")
    print(f"DEBUG: Request Path: {request.url.path}")
    print(f"DEBUG: Request Data: {data}")
    lot = agriculture_manager.optimize_transport(data.lot_id, data.destination)
    if not lot:
        print(f"DEBUG: Error - Lot not found: {data.lot_id}")
        raise HTTPException(status_code=404, detail="Lot non trouvé ou erreur de routage")
    
    blockchain_instance.miner_transactions_en_attente(adresse_mineur="TRANS_POOL")
    save_state(blockchain_instance, foncier_uf, pending_land_requests, agriculture_manager.lots)
    return {"status": "SUCCESS", "lot": lot}

@router.get("/lot/{lot_id}")
async def get_lot_details(lot_id: str):
    """Consulte la traçabilité complète d'un produit."""
    if lot_id not in agriculture_manager.lots:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    return agriculture_manager.lots[lot_id]

@router.get("/all")
async def get_all_lots():
    """Liste tous les produits enregistrés."""
    return list(agriculture_manager.lots.values())
