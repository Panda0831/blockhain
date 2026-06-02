import json

def analyze_q_table(chemin="data/q_table.json"):
    try:
        with open(chemin, "r") as f:
            data = json.load(f)
            
        print("--- ANALYSE DU CERVEAU (Q-TABLE) ---")
        
        # Mapping des états
        etat_map = {0: "Optimal", 1: "Dégradé", 2: "Critique"}
        
        for etat, actions in data.items():
            etat_int = int(etat)
            etat_nom = etat_map.get(etat_int, f"Inconnu({etat})")
            
            # Trouver la meilleure action (celle avec le score Q le plus élevé)
            meilleure_action = max(actions, key=actions.get)
            meilleur_score = actions[meilleure_action]
            
            print(f"\nÉtat: {etat_nom}")
            print(f"  -> Meilleur Leader élu: NODE_{meilleure_action} (Score: {meilleur_score:.2f})")
            
            # Afficher les autres options potentielles
            autres = sorted([(a, s) for a, s in actions.items() if a != meilleure_action], key=lambda x: x[1], reverse=True)[:3]
            if autres:
                print(f"  -> Alternatives: {', '.join([f'NODE_{a} ({s:.2f})' for a, s in autres])}")
                
    except FileNotFoundError:
        print(" [!] Le fichier q_table.json n'a pas été trouvé.")

if __name__ == "__main__":
    analyze_q_table()
