from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from src.api.deps import RoleChecker
from src.api.instances import (
    agriculture_manager,
    blockchain_instance,
    diploma_manager,
    foncier_uf,
    microfinance_manager,
    pending_diploma_requests,
    pending_land_requests,
)
from src.blockchain.transaction import SecteurActivite as BTSecteur
from src.utils.persistence import save_state

router = APIRouter()


class DiplomaRequest(BaseModel):
    student_id: str
    degree_title: str
    university: str
    year: int
    document_hash: Optional[str] = None  # Hash du PDF pour l'intégrité


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
        "status": "PENDING",
    }
    pending_diploma_requests.append(new_request)

    save_state(
        blockchain_instance,
        foncier_uf,
        pending_land_requests,
        agriculture_manager.lots,
        pending_diploma_requests,
        microfinance_manager.pending_transfers,
    )

    return {
        "status": "SUCCESS",
        "message": "Demande de certification envoyée",
        "request_id": request_id,
    }


@router.get("/pending")
async def get_pending_diploma_requests():
    """Liste des demandes de diplômes en attente pour l'administrateur."""
    return [r for r in pending_diploma_requests if r["status"] == "PENDING"]


@router.post(
    "/approve/{request_id}",
    dependencies=[Depends(RoleChecker(["ADMIN", "UNIVERSITE"]))],
)
async def approve_diploma_request(request_id: int):
    """Approbation d'un diplôme par l'administrateur du Ministère."""
    request = next((r for r in pending_diploma_requests if r["id"] == request_id), None)
    if not request or request["status"] != "PENDING":
        raise HTTPException(
            status_code=404, detail="Demande introuvable ou déjà traitée"
        )

    diploma_id = diploma_manager.register_diploma(
        request["student_id"],
        request["degree_title"],
        request["university"],
        request["year"],
        document_hash=request.get("document_hash"),
    )

    if not diploma_id:
        raise HTTPException(
            status_code=500, detail="Erreur lors de la certification sur la blockchain"
        )

    # Plus de mise à jour immédiate du statut, on attend le minage
    request["diploma_id"] = diploma_id

    save_state(
        blockchain_instance,
        foncier_uf,
        pending_land_requests,
        agriculture_manager.lots,
        pending_diploma_requests,
        microfinance_manager.pending_transfers,
    )

    return {
        "status": "SUCCESS",
        "message": "Diplôme certifié et en attente de minage",
        "diploma_id": diploma_id,
    }


from src.utils.crypto import Crypto

# ...


def normalize_and_extract_key(key: str) -> str:
    # If the key is a string representation of a tuple, e.g. "('0x...', '0x...')"
    # extract the first element.
    if key.startswith("("):  #
        try:
            import ast

            parsed = ast.literal_eval(key)
            if isinstance(parsed, (tuple, list)):
                key = str(parsed[0])
        except:
            pass
    return Crypto.normalize_key(key)


from src.db.models import User
from src.db.session import SessionLocal

# ...


@router.get("/proof/{diploma_id}")
# verification diplome
async def get_diploma_proof(diploma_id: str):
    """Récupère la preuve de Merkle pour vérifier un diplôme."""
    proof = diploma_manager.get_diploma_proof(diploma_id)
    if not proof:
        raise HTTPException(
            status_code=404, detail="Preuve non trouvée pour ce diplôme"
        )
    return proof


@router.get("/owner/{student_id}")
async def get_student_diplomas(student_id: str):
    """Liste tous les diplômes certifiés dans la blockchain."""
    print(f" [DEBUG] Fetching all diplomas (ignoring owner filter for demo)")
    diplomas = []

    # Parcourir la blockchain pour trouver les transactions de diplôme
    for block in blockchain_instance.chaine:
        for tx in block.transactions:
            if tx.secteur == BTSecteur.DIPLOME:
                data = tx.donnees
                # Safely handle data if it's a string instead of dict
                if isinstance(data, str):
                    import json

                    try:
                        data = json.loads(data)
                    except:
                        data = {}

                diplomas.append(
                    {
                        "diploma_id": data.get(
                            "diploma_id", f"DIP-{tx.destinataire}-{data.get('year')}"
                        ),
                        "title": data.get("title"),
                        "university": data.get("university"),
                        "year": data.get("year"),
                        "tx_hash": tx.hash,
                        "timestamp": tx.horodatage,
                    }
                )
    print(
        f" [DEBUG] Returning {len(diplomas)} total diplomas: {[d['diploma_id'] for d in diplomas]}"
    )
    return diplomas
