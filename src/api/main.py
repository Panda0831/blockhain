from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import blockchain_routes
from src.algorithms.union_find import UnionFind

app = FastAPI(
    title="Hazo Lova API",
    description="Backend unique pour la blockchain Madagascar 2035",
    version="1.0.0"
)

# Configuration CORS pour autoriser le frontend React/Vite
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173", # Port par défaut de Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(blockchain_routes.router, prefix="/api/blockchain", tags=["Blockchain"])

# Simulation globale pour le Foncier (Union-Find)
foncier_uf = UnionFind()

@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur l'API Hazo Lova",
        "status": "online",
        "blockchain_version": "v1",
        "endpoints": ["/api/blockchain", "/api/land"]
    }

@app.get("/api/land/{parcel_id}")
async def check_land_owner(parcel_id: str):
    """
    Vérifie le propriétaire actuel d'une parcelle via Union-Find.
    """
    if not foncier_uf.exists(parcel_id):
        return {"parcel_id": parcel_id, "status": "NON_ENREGISTREE", "owner": None}
    
    owner_root = foncier_uf.find(parcel_id)
    return {
        "parcel_id": parcel_id, 
        "status": "ENREGISTREE", 
        "owner_root_id": owner_root
    }

@app.post("/api/land/register")
async def register_land(parcel_id: str, owner_id: str):
    """
    Enregistre une parcelle et l'attribue à un propriétaire.
    """
    foncier_uf.add(parcel_id)
    foncier_uf.add(owner_id)
    success = foncier_uf.union(parcel_id, owner_id)
    
    return {
        "success": success,
        "message": f"Parcelle {parcel_id} rattachée à {owner_id}" if success else "Déjà rattachée"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
