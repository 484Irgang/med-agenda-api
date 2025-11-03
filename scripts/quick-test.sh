#!/bin/bash

# Quick Test Script for MedAgenda API
# Este script testa a API de forma rápida e simples

API_URL="http://localhost:5000"

echo "================================================"
echo "  TESTE RÁPIDO DA API MEDAGENDA"
echo "================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    local token=$5

    echo -n "Testing $name... "

    if [ "$method" = "POST" ]; then
        if [ -z "$token" ]; then
            response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data")
        fi
    else
        response=$(curl -s -w "\n%{http_code}" "$url")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
        echo "$body"
        return 0
    else
        echo -e "${RED}✗ FALHOU${NC} (HTTP $http_code)"
        echo "$body"
        return 1
    fi
}

echo "1️⃣  Health Check"
echo "----------------------------------------"
test_endpoint "Health Check" "$API_URL/health"
echo ""

echo "2️⃣  Criar Especialidade"
echo "----------------------------------------"
SPECIALTY_RESPONSE=$(curl -s -X POST "$API_URL/specialty" \
    -H "Content-Type: application/json" \
    -d '{"name": "Cardiologia"}')
echo "$SPECIALTY_RESPONSE"
SPECIALTY_ID=$(echo "$SPECIALTY_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo -e "${YELLOW}Specialty ID: $SPECIALTY_ID${NC}"
echo ""

echo "3️⃣  Registrar Paciente"
echo "----------------------------------------"
PATIENT_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "paciente-teste@example.com",
        "password": "senha123",
        "type": "PATIENT",
        "name": "João da Silva"
    }')
echo "$PATIENT_RESPONSE"
PATIENT_TOKEN=$(echo "$PATIENT_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo -e "${YELLOW}Patient Token: ${PATIENT_TOKEN:0:50}...${NC}"
echo ""

echo "4️⃣  Login do Paciente"
echo "----------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "paciente-teste@example.com",
        "password": "senha123"
    }')
echo "$LOGIN_RESPONSE"
echo ""

echo "5️⃣  Completar Cadastro do Paciente"
echo "----------------------------------------"
COMPLETE_PATIENT=$(curl -s -X POST "$API_URL/patient/complete-registration" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $PATIENT_TOKEN" \
    -d '{
        "name": "João da Silva",
        "email": "joao@example.com",
        "phone": "11999999999",
        "birthDate": "1990-05-15"
    }')
echo "$COMPLETE_PATIENT"
PATIENT_ID=$(echo "$COMPLETE_PATIENT" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo ""

echo "6️⃣  Registrar Médico"
echo "----------------------------------------"
DOCTOR_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "medico-teste@example.com",
        "password": "senha123",
        "type": "DOCTOR",
        "name": "Dra. Maria Santos"
    }')
echo "$DOCTOR_RESPONSE"
DOCTOR_TOKEN=$(echo "$DOCTOR_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo ""

echo "7️⃣  Completar Cadastro do Médico"
echo "----------------------------------------"
COMPLETE_DOCTOR=$(curl -s -X POST "$API_URL/doctor/complete-registration" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $DOCTOR_TOKEN" \
    -d "{
        \"name\": \"Dra. Maria Santos\",
        \"crm\": \"CRM123456\",
        \"email\": \"maria@hospital.com\",
        \"phone\": \"11988888888\",
        \"specialtyId\": $SPECIALTY_ID
    }")
echo "$COMPLETE_DOCTOR"
DOCTOR_ID=$(echo "$COMPLETE_DOCTOR" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
echo ""

echo "8️⃣  Listar Médicos"
echo "----------------------------------------"
curl -s "$API_URL/doctor"
echo -e "\n"

echo "9️⃣  Criar Consulta"
echo "----------------------------------------"
if [ ! -z "$PATIENT_ID" ] && [ ! -z "$DOCTOR_ID" ] && [ ! -z "$SPECIALTY_ID" ]; then
    APPOINTMENT=$(curl -s -X POST "$API_URL/appointment" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $PATIENT_TOKEN" \
        -d "{
            \"patientId\": $PATIENT_ID,
            \"doctorId\": $DOCTOR_ID,
            \"specialtyId\": $SPECIALTY_ID,
            \"dateTime\": \"2025-12-15T14:00:00Z\",
            \"status\": \"scheduled\"
        }")
    echo "$APPOINTMENT"
else
    echo -e "${RED}Não foi possível criar consulta - IDs faltando${NC}"
fi
echo ""

echo "🔟  Listar Todas as Consultas"
echo "----------------------------------------"
curl -s "$API_URL/appointment"
echo -e "\n"

echo "================================================"
echo "  TESTE CONCLUÍDO!"
echo "================================================"
echo ""
echo "📊 Resumo:"
echo "  - Especialidade criada: ID $SPECIALTY_ID"
echo "  - Paciente criado: ID $PATIENT_ID"
echo "  - Médico criado: ID $DOCTOR_ID"
echo ""
echo "🔑 Tokens salvos (use para testes manuais):"
echo "  - Patient Token: ${PATIENT_TOKEN:0:50}..."
echo "  - Doctor Token: ${DOCTOR_TOKEN:0:50}..."
echo ""
echo "💡 Próximos passos:"
echo "  1. Use o Postman/Insomnia para testes interativos"
echo "  2. Veja o arquivo TESTING_GUIDE.md para mais exemplos"
echo "  3. Execute 'npm test' para rodar os testes automatizados"
echo ""
