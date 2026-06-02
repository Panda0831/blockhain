import time
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from src.api.deps import get_current_user
from src.api.instances import (
    agriculture_manager,
    blockchain_instance,
    foncier_uf,
    microfinance_manager,
    notifications,
    pending_diploma_requests,
    pending_land_requests,
    pending_transfers,
)
from src.db.models import User
from src.use_cases.produitsAgricoles import AgriculturalLot
from src.utils.persistence import save_state

router = APIRouter()


class HarvestRequest(BaseModel):
    owner_id: str
    product_type: str
    district: str
    weight: float
    quality: str


class TransportRequest(BaseModel):
    lot_id: str
    destination: str


class SellRequest(BaseModel):
    lot_id: str
    buyer_id: str
    price: float
    seller_id: str  # Clé publique du vendeur


@router.post("/harvest")
async def record_harvest(data: HarvestRequest):
    """Enregistre une nouvelle récolte sur la blockchain."""
    lot = agriculture_manager.register_harvest(
        data.owner_id, data.product_type, data.district, data.weight, data.quality
    )
    if not lot:
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement")

    save_state(
        blockchain_instance,
        foncier_uf,
        pending_land_requests,
        agriculture_manager.lots,
        pending_diploma_requests,
        microfinance_manager.pending_transfers,
    )
    return {"status": "SUCCESS", "lot": lot}


@router.post("/transport")
async def optimize_transport(request: Request, data: TransportRequest):
    """Optimise le trajet de transport pour un lot."""
    result = agriculture_manager.optimize_transport(data.lot_id, data.destination)
    if not result:
        raise HTTPException(
            status_code=404, detail="Lot non trouvé ou erreur de routage"
        )

    lot, path = result

    save_state(
        blockchain_instance,
        foncier_uf,
        pending_land_requests,
        agriculture_manager.lots,
        pending_diploma_requests,
        microfinance_manager.pending_transfers,
    )
    return {"status": "SUCCESS", "lot": lot, "path": path}


@router.post("/sell")
async def sell_lot(data: SellRequest, current_user: User = Depends(get_current_user)):
    """Enregistre une offre de vente d'un lot."""
    # 1. Vérification de propriété
    lot_actuel = agriculture_manager.lots.get(data.lot_id)
    if not lot_actuel or lot_actuel.owner_id != current_user.public_key:
        raise HTTPException(
            status_code=403, detail="Action interdite : Vous ne possédez pas ce lot."
        )

    # 2. Créer une offre de vente (notification)
    sale_offer_id = f"SALE-{int(time.time())}"
    notifications.append(
        {
            "public_key": data.buyer_id,
            "message": f"🛍️ Offre d'achat de {lot_actuel.product_type} pour {data.price} MGA.",
            "sale_offer_id": sale_offer_id,
            "lot_id": data.lot_id,
            "seller_id": current_user.public_key,
            "price": data.price,
            "timestamp": time.time(),
        }
    )

    return {"status": "SUCCESS", "message": "Offre envoyée à l'acheteur"}


@router.post("/accept-sale/{sale_offer_id}")
async def accept_sale(
    sale_offer_id: str, current_user: User = Depends(get_current_user)
):
    """L'acheteur accepte l'offre, créant le transfert financier."""
    print(f" [DEBUG] Accept Sale: User {current_user.public_key}, Offer {sale_offer_id}")
    
    # Debug: Check offers
    for n in notifications:
        print(f" [DEBUG] Checking notification: OfferID {n.get('sale_offer_id')}, UserKey {n.get('public_key')}")

    offer = next(
        (
            n
            for n in notifications
            if n.get("sale_offer_id") == sale_offer_id
            and str(n["public_key"]) == str(current_user.public_key)
        ),
        None,
    )

    if not offer:
        # Check if the offer exists at all
        exists = any(n.get("sale_offer_id") == sale_offer_id for n in notifications)
        if exists:
             raise HTTPException(status_code=403, detail="Vous n'êtes pas le destinataire de cette offre.")
        raise HTTPException(status_code=404, detail="Offre non trouvée")

    # 1. Initier le paiement via Microfinance
    print(f" [DEBUG] Initiating transfer: Buyer {current_user.public_key}, Seller {offer['seller_id']}, Amount {offer['price']}")
    transfer = microfinance_manager.create_transfer_request(
        sender_id=current_user.public_key,
        receiver_id=offer["seller_id"],
        amount=offer["price"],
        description=f"Paiement Lot {offer['lot_id']}",
    )

    if not transfer:
        # Debug: Check balance
        bal = blockchain_instance.obtenir_solde(current_user.public_key)
        print(f" [DEBUG] Transfer failed! Buyer balance: {bal}, Amount: {offer['price']}")
        raise HTTPException(
            status_code=400, detail=f"Solde insuffisant. Vous avez {bal} MGA, besoin de {offer['price']} MGA."
        )

    # Automatiquement accepter le transfert pour finaliser la vente
    _, error = microfinance_manager.accept_transfer(transfer["id"])
    if error:
        raise HTTPException(
            status_code=400, detail=f"Échec du transfert financier : {error}"
        )

    # 2. Transférer le lot (sera miné dans la blockchain)
    lot = agriculture_manager.sell_lot(
        offer["lot_id"], current_user.public_key, offer["price"], offer["seller_id"]
    )

    # 3. Supprimer la notification
    notifications.remove(offer)

    save_state(
        blockchain_instance,
        foncier_uf,
        pending_land_requests,
        agriculture_manager.lots,
        pending_diploma_requests,
        microfinance_manager.pending_transfers,
    )
    return {"status": "SUCCESS", "message": "Vente acceptée, transfert initié"}


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
