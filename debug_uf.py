import sys
import os
sys.path.append(os.getcwd())

from src.api.instances import foncier_uf
from src.utils.crypto import Crypto

print("--- Diagnostic UnionFind ---")
print(f"Nombre de parcelles: {len(foncier_uf.parent)}")

# Afficher les 5 premières parcelles
for i, (parcel_id, owner) in enumerate(foncier_uf.parent.items()):
    if i < 5:
        norm_owner = Crypto.normalize_key(owner)
        print(f"Parcelle: {parcel_id}")
        print(f"  Owner (raw): {owner}")
        print(f"  Owner (norm): {norm_owner}")
    else:
        break
