from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from src.api.deps import RoleChecker
from src.api.instances import (
    blockchain_instance, 
    diploma_manager, 
    pending_diploma_requests, 
    foncier_uf, 
    agriculture_manager, 
    microfinance_manager,
    pending_land_requests
)
from src.utils.persistence import save_state

router = APIRouter()

class DiplomaRequest(BaseModel):
    student_id: str
    degree_title: str
    university: str
    year: int
    document_hash: Optional[str] = None # Hash du PDF pour l'intégrité

@router.post("/request")
async def request_diploma_certification(data: DiplomaRequest):
    """Soumission d'une demande de certification de diplôme avec hash du document PDF."""
    request_id = len(pending_diploma_requests) + 1
    new_request = {
        "id": request_id,
        "student_id": data.student_id,
        "degree_title": data.degree_title,
        "university": data.university,
        "year": data.year,
        "document_hash": data.document_hash,
        "status": "PENDING"
    }
    pending_diploma_requests.append(new_request)
    
    save_state(
        blockchain_instance, 
        foncier_uf, 
        pending_land_requests, 
        agriculture_manager.lots, 
        pending_diploma_requests,
        microfinance_manager.pending_transfers
    )
    
    return {"status": "SUCCESS", "message": "Demande de certification envoyée", "request_id": request_id}

@router.get("/pending")
async def get_pending_diploma_requests():
    """Liste des demandes de diplômes en attente pour l'administrateur."""
    return [r for r in pending_diploma_requests if r["status"] == "PENDING"]

@router.post("/approve/{request_id}", dependencies=[Depends(RoleChecker(['ADMIN', 'UNIVERSITE']))])
async def approve_diploma_request(request_id: int):
    """Approbation d'un diplôme par l'administrateur du Ministère."""
    request = next((r for r in pending_diploma_requests if r["id"] == request_id), None)
    if not request or request["status"] != "PENDING":
        raise HTTPException(status_code=404, detail="Demande introuvable ou déjà traitée")

    diploma_id = diploma_manager.register_diploma(
        request["student_id"], 
        request["degree_title"], 
        request["university"], 
        request["year"],
        document_hash=request.get("document_hash")
    )
    
    if not diploma_id:
        raise HTTPException(status_code=500, detail="Erreur lors de la certification sur la blockchain")
    
    # Minage automatique
    blockchain_instance.miner_transactions_en_attente(adresse_mineur="EDU_POOL")
    
    request["status"] = "APPROVED"
    request["diploma_id"] = diploma_id
    
    save_state(
        blockchain_instance, 
        foncier_uf, 
        pending_land_requests, 
        agriculture_manager.lots, 
        pending_diploma_requests,
        microfinance_manager.pending_transfers
    )
    
    return {"status": "SUCCESS", "message": "Diplôme certifié et inscrit sur la blockchain", "diploma_id": diploma_id}

@router.get("/proof/{diploma_id}")
async def get_diploma_proof(diploma_id: str):
    """Récupère la preuve de Merkle pour vérifier un diplôme."""
    proof = diploma_manager.get_diploma_proof(diploma_id)
    if not proof:
        raise HTTPException(status_code=404, detail="Preuve non trouvée pour ce diplôme")
    return proof
