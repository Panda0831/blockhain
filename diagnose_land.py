import sys
import os
sys.path.append(os.getcwd())

from src.api.instances import foncier_uf
from src.utils.crypto import Crypto

print("--- Diagnostic Foncier ---")
print(f"Nombre de parcelles dans UnionFind: {len(foncier_uf.parent)}")

for parcel_id, owner in foncier_uf.parent.items():
    print(f"Parcelle: {parcel_id}, Propriétaire (raw): {owner}")
    print(f"Propriétaire (norm): {Crypto.normalize_key(owner)}")
