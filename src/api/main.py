from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Hazo Lova API",
    description="Backend unique pour la blockchain Madagascar 2035",
    version="1.0.0"
)

# Configuration CORS pour autoriser le frontend Next.js
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur l'API Hazo Lova",
        "status": "online",
        "blockchain_version": "v1"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
