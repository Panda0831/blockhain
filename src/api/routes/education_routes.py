from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.api.instances import blockchain_instance, diploma_manager

router = APIRouter()

class DiplomaRequest(BaseModel):
    student_id: str
    degree_title: str
    university: str
    year: int

@router.post("/certify")
async def certify_diploma(data: DiplomaRequest):
    """Certifie un nouveau diplôme sur la blockchain."""
    diploma_id = diploma_manager.register_diploma(
        data.student_id, data.degree_title, data.university, data.year
    )
    if not diploma_id:
        raise HTTPException(status_code=500, detail="Erreur lors de la certification")
    
    blockchain_instance.miner_transactions_en_attente(adresse_mineur="EDU_POOL")
    return {"status": "SUCCESS", "diploma_id": diploma_id}

@router.get("/proof/{diploma_id}")
async def get_diploma_proof(diploma_id: str):
    """Récupère la preuve de Merkle pour vérifier un diplôme."""
    proof = diploma_manager.get_diploma_proof(diploma_id)
    if not proof:
        raise HTTPException(status_code=404, detail="Preuve non trouvée pour ce diplôme")
    return proof
