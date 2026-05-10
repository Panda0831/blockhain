from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.instances import foncier_uf
from src.api.routes import algorithm_routes, auth_routes, blockchain_routes, land_routes

app = FastAPI(
    title="Hazo Lova API",
    description="Backend unique pour la blockchain Madagascar 2035",
    version="1.0.0",
)

# Configuration CORS pour autoriser le frontend React/Vite
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Port par défaut de Vite
    "http://192.168.88.250:8000",
    "http://192.168.88.250:8081",
    "http://192.168.88.250:19000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes
app.include_router(
    blockchain_routes.router, prefix="/api/blockchain", tags=["Blockchain"]
)
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentification"])
app.include_router(land_routes.router, prefix="/api/land", tags=["Foncier"])
app.include_router(
    algorithm_routes.router, prefix="/api/algo", tags=["Intelligence & Réseau"]
)


@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur l'API Hazo Lova",
        "status": "online",
        "blockchain_version": "v1",
        "endpoints": ["/api/blockchain", "/api/auth", "/api/land", "/api/algo"],
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
