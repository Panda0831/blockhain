from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.instances import foncier_uf
from src.api.routes import (
    agriculture_routes,
    algorithm_routes,
    auth_routes,
    blockchain_routes,
    land_routes,
    education_routes,
)

app = FastAPI(
    title="Hazo Lova API",
    description="Backend unique pour la blockchain Madagascar 2035",
    version="1.0.0",
)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Port par défaut de Vite
    "http://192.168.88.250:5173",
    "http://localhost:5173",  # Port par défaut de Vite
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:19000",
]  # Configuration CORS plus permissive pour le développement
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
    agriculture_routes.router, prefix="/api/agriculture", tags=["Agriculture"]
)
app.include_router(
    education_routes.router, prefix="/api/education", tags=["Éducation"]
)
app.include_router(
    algorithm_routes.router, prefix="/api/algo", tags=["Intelligence & Réseau"]
)


@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur l'API Hazo Lova",
        "status": "online",
        "blockchain_version": "v1",
        "endpoints": [
            "/api/blockchain",
            "/api/auth",
            "/api/land",
            "/api/agriculture",
            "/api/algo",
        ],
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
