
import pickle
import os

from src.algorithms.union_find import UnionFind

def inspect_foncier():
    path = "data/persistence/foncier_uf.pkl"
    if not os.path.exists(path):
        print("File not found")
        return
    
    with open(path, "rb") as f:
        foncier_uf = pickle.load(f)
    
    current_user_key = "('0xe849c6df1edcc1482c54236d4fcc2d08bbb2d2f633742e396209f8789c723889', '0xda38bd87532d4e1c9532e8881d0414599e435c636bff1a9635b2dbd83801b52')"
    
    owned_by_current = []
    
    print(f"Number of items in foncier_uf: {len(foncier_uf.parent)}")
    for item, parent in foncier_uf.parent.items():
        owner = foncier_uf.find(item)
        if str(owner) == current_user_key:
            owned_by_current.append(item)
        print(f"Item: {item}, Owner: {owner}")
    
    print(f"\nParcels owned by current user: {owned_by_current}")

if __name__ == "__main__":
    inspect_foncier()
