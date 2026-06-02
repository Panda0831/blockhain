import requests
import time
import json

BASE_URL = "http://localhost:8000"

def test_multi_sector_mining():
    print("🚀 Début du test Multi-Secteur (Agriculture + Éducation)")
    
    # 1. Préparation des acteurs
    ALICE_KEY = "ALICE_PUB_KEY_123"
    BOB_KEY = "BOB_PUB_KEY_456"
    
    # 2. AGRICULTURE : Récolte et Vente
    print("\n[Agri] Enregistrement d'une récolte de Vanille...")
    resp = requests.post(f"{BASE_URL}/api/agriculture/harvest", json={
        "owner_id": ALICE_KEY,
        "product_type": "Vanille",
        "district": "Sambava",
        "weight": 25.5,
        "quality": "Export"
    })
    lot = resp.json().get("lot")
    lot_id = lot["id"]
    print(f"✅ Lot créé : {lot_id}")
    
    print(f"\n[Agri] Vente du lot {lot_id} à Bob...")
    requests.post(f"{BASE_URL}/api/agriculture/sell", json={
        "lot_id": lot_id,
        "buyer_id": BOB_KEY,
        "price": 1500000
    })
    print("✅ Vente enregistrée (en attente de minage)")

    # 3. ÉDUCATION : Demande et Approbation
    print("\n[Edu] Demande de certification de diplôme pour Bob...")
    resp = requests.post(f"{BASE_URL}/api/education/request", json={
        "student_id": BOB_KEY,
        "degree_title": "Master en Blockchain",
        "university": "Université d'Antananarivo",
        "year": 2026
    })
    req_id = resp.json().get("request_id")
    print(f"✅ Demande de diplôme #{req_id} créée")
    
    print(f"\n[Edu] Approbation du diplôme #{req_id} par l'université...")
    # On utilise une clé publique avec le rôle ADMIN/MINEUR pour passer RoleChecker si besoin
    # Pour le test, on va simuler l'approbation.
    # On récupère une clé d'admin réelle
    ADMIN_KEY = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    requests.post(f"{BASE_URL}/api/education/approve/{req_id}", headers={"public-key": ADMIN_KEY})
    print("✅ Diplôme approuvé (en attente de minage)")

    # 4. VÉRIFICATION DE LA MEMPOOL
    print("\n[Blockchain] Vérification des transactions en attente...")
    pending = requests.get(f"{BASE_URL}/api/blockchain/pending-transactions").json()
    print(f"📊 Nombre de transactions en attente : {len(pending)}")
    for tx in pending:
        print(f" - [{tx['secteur']}] {tx['description']} ({tx['montant']} MGA)")

    # 5. MINAGE
    print("\n[Blockchain] Lancement du minage du bloc multi-secteur...")
    # Le minage nécessite le rôle MINEUR
    mine_resp = requests.post(f"{BASE_URL}/api/blockchain/mine", headers={"public-key": ADMIN_KEY})

    if mine_resp.status_code == 200:
        block = mine_resp.json()
        print(f"🧱 BLOC #{block['index']} MINÉ AVEC SUCCÈS !")
        print(f"🔗 Hash : {block['hash']}")
        print(f"📝 Transactions incluses : {len(block['transactions'])}")
        for tx in block['transactions']:
            print(f"   🔹 {tx['description']}")
    else:
        print(f"❌ Échec du minage : {mine_resp.text}")

if __name__ == "__main__":
    test_multi_sector_mining()
