#!/bin/bash

# Script de test pour l'API Hazo Lova
# Assurez-vous que le serveur est lancé : uvicorn src.api.main:app --reload

BASE_URL="http://localhost:8000"

echo "=== 1. TEST AUTHENTIFICATION ==="
echo "Inscription d'un utilisateur..."
curl -s -X POST "$BASE_URL/api/auth/signup" \
     -H "Content-Type: application/json" \
     -d '{"username": "jean_validator", "email": "jean@mail.mg", "password": "password123", "role": "RECOLTEUR", "district": "Sambava"}' | jq .

echo -e "\nConnexion..."
USER_DATA=$(curl -s -X POST "$BASE_URL/api/auth/signin" \
     -H "Content-Type: application/json" \
     -d '{"email": "jean@mail.mg", "password": "password123"}')
echo $USER_DATA | jq .
PUBLIC_KEY=$(echo $USER_DATA | jq -r .public_key)

echo -e "\n=== 2. TEST INTELLIGENCE & RÉSEAU (A* & Q-LEARNING) ==="
echo "Recherche du chemin optimal entre District 1 (Ambohidratrimo) et District 32 (Antalaha)..."
curl -s -X POST "$BASE_URL/api/algo/path" \
     -H "Content-Type: application/json" \
     -d '{"start_id": 1, "end_id": 32}' | jq .

echo -e "\nSélection intelligente d'un validateur via Q-Learning pour une transaction à Sambava (ID 33)..."
curl -s -X POST "$BASE_URL/api/algo/select-validator" \
     -H "Content-Type: application/json" \
     -d '{"current_district_id": 33}' | jq .

echo -e "\n=== 3. TEST FONCIER (UNION-FIND + BLOCKCHAIN) ==="
echo "Enregistrement d'une parcelle P_MADA_2035..."
REG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/land/register" \
     -H "Content-Type: application/json" \
     -d "{\"parcel_id\": \"P_MADA_2035\", \"owner_id\": \"$PUBLIC_KEY\", \"description\": \"Terrain agricole à Sambava\"}")
echo $REG_RESPONSE | jq .
TX_HASH=$(echo $REG_RESPONSE | jq -r .transaction_hash)

echo -e "\nVérification du propriétaire actuel..."
curl -s -X GET "$BASE_URL/api/land/P_MADA_2035" | jq .

echo -e "\n=== 4. TEST MINAGE & VÉRIFICATION ==="
echo "Minage du bloc pour valider les transactions en attente..."
curl -s -X POST "$BASE_URL/api/blockchain/mine" | jq .

echo -e "\nVérification de l'authenticité de la transaction via son Hash..."
curl -s -X GET "$BASE_URL/api/blockchain/verify/$TX_HASH" | jq .

echo -e "\n=== 5. ÉTAT DE LA BLOCKCHAIN ==="
curl -s -X GET "$BASE_URL/api/blockchain/" | jq .

echo -e "\nTests terminés !"
