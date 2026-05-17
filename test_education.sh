#!/bin/bash

# Script de test pour le module ÉDUCATION (Workflow Approbation)
BASE_URL="http://localhost:8000"

echo "=== 1. SOUMISSION D'UNE DEMANDE DE DIPLÔME ==="
REQUEST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/education/request" \
     -H "Content-Type: application/json" \
     -d '{
           "student_id": "STUDENT_ID_PANDA_123",
           "degree_title": "Master en Blockchain",
           "university": "Université d’Antananarivo",
           "year": 2026
         }')
echo $REQUEST_RESPONSE | jq .
REQ_ID=$(echo $REQUEST_RESPONSE | jq -r .request_id)

echo -e "\n=== 2. LISTE DES DEMANDES EN ATTENTE (Admin) ==="
curl -s -X GET "$BASE_URL/api/education/pending" | jq .

echo -e "\n=== 3. APPROBATION DE LA DEMANDE PAR L'ADMIN ==="
if [ "$REQ_ID" != "null" ]; then
    APPROVE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/education/approve/$REQ_ID" | jq .)
    echo "$APPROVE_RESPONSE"
    DIP_ID=$(echo "$APPROVE_RESPONSE" | jq -r .diploma_id)
else
    echo "Erreur: REQ_ID est nul."
fi

echo -e "\n=== 4. VÉRIFICATION DE LA PREUVE DE MERKLE ==="
if [ "$DIP_ID" != "null" ]; then
    curl -s -X GET "$BASE_URL/api/education/proof/$DIP_ID" | jq .
else
    echo "Erreur: DIP_ID est nul."
fi

echo -e "\n=== 5. VÉRIFICATION BLOCKCHAIN (Dernier Bloc) ==="
curl -s -X GET "$BASE_URL/api/blockchain/blocks" | jq '.[-1]'

echo -e "\nTests Éducation terminés !"
