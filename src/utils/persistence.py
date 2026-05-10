import json
import os
import pickle
from src.blockchain.blockchain import Blockchain
from src.algorithms.union_find import UnionFind

DATA_DIR = "data/persistence"

def save_state(blockchain, foncier_uf, pending_requests):
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    
    with open(os.path.join(DATA_DIR, "blockchain.pkl"), "wb") as f:
        pickle.dump(blockchain, f)
    
    with open(os.path.join(DATA_DIR, "foncier_uf.pkl"), "wb") as f:
        pickle.dump(foncier_uf, f)
        
    with open(os.path.join(DATA_DIR, "pending_requests.json"), "w") as f:
        json.dump(pending_requests, f)

def load_state():
    blockchain = None
    foncier_uf = None
    pending_requests = []
    
    bc_path = os.path.join(DATA_DIR, "blockchain.pkl")
    uf_path = os.path.join(DATA_DIR, "foncier_uf.pkl")
    pr_path = os.path.join(DATA_DIR, "pending_requests.json")
    
    if os.path.exists(bc_path):
        with open(bc_path, "rb") as f:
            blockchain = pickle.load(f)
            
    if os.path.exists(uf_path):
        with open(uf_path, "rb") as f:
            foncier_uf = pickle.load(f)
            
    if os.path.exists(pr_path):
        with open(pr_path, "r") as f:
            pending_requests = json.load(f)
            
    return blockchain, foncier_uf, pending_requests
