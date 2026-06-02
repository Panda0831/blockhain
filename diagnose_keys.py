import sys
import os
sys.path.append(os.getcwd())

from src.api.instances import blockchain_instance
from src.db.session import SessionLocal
from src.db.models import User
from src.utils.crypto import Crypto

def diagnose_keys():
    print("--- Diagnostic des Clés ---")
    
    db = SessionLocal()
    user = db.query(User).first()
    db.close()
    
    if not user:
        print("Aucun utilisateur trouvé.")
        return
        
    db_key = user.public_key
    print(f"Clé DB pour {user.username}: {db_key}")
    print(f"Clé DB normalisée: {Crypto.normalize_key(db_key)}")
    
    print("\nTransactions dans la blockchain:")
    found = False
    for i, bloc in enumerate(blockchain_instance.chaine):
        for tx in bloc.transactions:
            if i < 5: # Juste les 5 premiers blocs
                exp_norm = Crypto.normalize_key(tx.expediteur)
                dest_norm = Crypto.normalize_key(tx.destinataire)
                db_norm = Crypto.normalize_key(db_key)
                
                if exp_norm == db_norm or dest_norm == db_norm:
                    print(f"MATCH trouvé dans bloc {i}: Exp={tx.expediteur}, Dest={tx.destinataire}")
                    found = True
    
    if not found:
        print("Aucune transaction trouvée pour cette clé dans les premiers blocs.")

if __name__ == "__main__":
    diagnose_keys()
