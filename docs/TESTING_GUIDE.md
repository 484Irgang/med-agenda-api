# Guia de Teste da API

## 1. Iniciar o Servidor

```bash
# Opção 1: Modo desenvolvimento (com hot reload)
npm run dev

# Opção 2: Build e produção
npm run build
npm start
```

Você verá:
```
Server is running on port 5000
Environment: development
CORS origin: http://localhost:8081
```

## 2. Testar com cURL (Terminal)

### 2.1 Health Check
```bash
curl http://localhost:5000/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T..."
}
```

### 2.2 Registrar um Paciente

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paciente@teste.com",
    "password": "senha123",
    "type": "PATIENT",
    "name": "João Silva"
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "paciente@teste.com",
      "type": "PATIENT",
      "patientId": null,
      "doctorId": null
    }
  }
}
```

**Salve o token!** Você vai precisar dele.

### 2.3 Fazer Login

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paciente@teste.com",
    "password": "senha123"
  }'
```

### 2.4 Completar Cadastro de Paciente

```bash
# Substitua SEU_TOKEN_AQUI pelo token recebido no registro
curl -X POST http://localhost:5000/patient/complete-registration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "João Silva",
    "email": "joao@teste.com",
    "phone": "11999999999",
    "birthDate": "1990-01-01"
  }'
```

### 2.5 Criar Especialidade

```bash
curl -X POST http://localhost:5000/specialty \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cardiologia"
  }'
```

### 2.6 Listar Especialidades

```bash
curl http://localhost:5000/specialty
```

### 2.7 Registrar um Médico

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "medico@teste.com",
    "password": "senha123",
    "type": "DOCTOR",
    "name": "Dra. Maria Santos"
  }'
```

### 2.8 Completar Cadastro de Médico

```bash
# Use o token do médico
curl -X POST http://localhost:5000/doctor/complete-registration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DO_MEDICO" \
  -d '{
    "name": "Dra. Maria Santos",
    "crm": "CRM12345",
    "email": "maria@teste.com",
    "phone": "11888888888",
    "specialtyId": 1
  }'
```

### 2.9 Criar Consulta

```bash
curl -X POST http://localhost:5000/appointment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "patientId": 1,
    "doctorId": 1,
    "specialtyId": 1,
    "dateTime": "2025-12-01T10:00:00Z",
    "status": "scheduled"
  }'
```

### 2.10 Listar Todas as Consultas

```bash
curl http://localhost:5000/appointment
```

### 2.11 Consultas por Paciente

```bash
curl http://localhost:5000/appointment/by-patient/1
```

### 2.12 Consultas por Médico

```bash
curl http://localhost:5000/appointment/by-doctor/1
```

## 3. Testar com Script Automatizado

Crie um arquivo de teste:

```bash
# Criar arquivo de teste
cat > test-api.sh << 'EOF'
#!/bin/bash

API_URL="http://localhost:5000"

echo "=== 1. Health Check ==="
curl -s $API_URL/health | jq .
echo -e "\n"

echo "=== 2. Registrando Paciente ==="
PATIENT_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-paciente@example.com",
    "password": "senha123",
    "type": "PATIENT",
    "name": "Teste Paciente"
  }')

echo $PATIENT_RESPONSE | jq .
PATIENT_TOKEN=$(echo $PATIENT_RESPONSE | jq -r '.data.token')
echo "Token do Paciente: $PATIENT_TOKEN"
echo -e "\n"

echo "=== 3. Criando Especialidade ==="
SPECIALTY_RESPONSE=$(curl -s -X POST $API_URL/specialty \
  -H "Content-Type: application/json" \
  -d '{"name": "Dermatologia"}')

echo $SPECIALTY_RESPONSE | jq .
SPECIALTY_ID=$(echo $SPECIALTY_RESPONSE | jq -r '.data.id')
echo -e "\n"

echo "=== 4. Completando Cadastro do Paciente ==="
curl -s -X POST $API_URL/patient/complete-registration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "name": "Teste Paciente",
    "email": "paciente@example.com",
    "phone": "11999999999",
    "birthDate": "1995-05-15"
  }' | jq .
echo -e "\n"

echo "=== 5. Registrando Médico ==="
DOCTOR_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste-medico@example.com",
    "password": "senha123",
    "type": "DOCTOR",
    "name": "Dr. Teste"
  }')

echo $DOCTOR_RESPONSE | jq .
DOCTOR_TOKEN=$(echo $DOCTOR_RESPONSE | jq -r '.data.token')
echo -e "\n"

echo "=== 6. Completando Cadastro do Médico ==="
curl -s -X POST $API_URL/doctor/complete-registration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d "{
    \"name\": \"Dr. Teste\",
    \"crm\": \"CRM98765\",
    \"email\": \"medico@example.com\",
    \"phone\": \"11888888888\",
    \"specialtyId\": $SPECIALTY_ID
  }" | jq .
echo -e "\n"

echo "=== 7. Listando Médicos ==="
curl -s $API_URL/doctor | jq .
echo -e "\n"

echo "=== 8. Criando Consulta ==="
curl -s -X POST $API_URL/appointment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "patientId": 1,
    "doctorId": 1,
    "specialtyId": 1,
    "dateTime": "2025-12-15T14:00:00Z",
    "status": "scheduled"
  }' | jq .
echo -e "\n"

echo "=== 9. Listando Consultas ==="
curl -s $API_URL/appointment | jq .
echo -e "\n"

echo "=== TESTES CONCLUÍDOS ==="
EOF

# Dar permissão de execução
chmod +x test-api.sh

# Executar
./test-api.sh
```

**Nota:** Este script requer `jq` instalado. Instale com:
```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq
```

## 4. Testar com Postman/Insomnia

### Importar Collection para Postman

Crie um arquivo `postman_collection.json`:

```json
{
  "info": {
    "name": "MedAgenda API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register Patient",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"patient@example.com\",\n  \"password\": \"password123\",\n  \"type\": \"PATIENT\",\n  \"name\": \"John Doe\"\n}"
            },
            "url": "http://localhost:5000/auth/register"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"patient@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": "http://localhost:5000/auth/login"
          }
        },
        {
          "name": "Get Me",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": "http://localhost:5000/auth/me"
          }
        }
      ]
    },
    {
      "name": "Specialties",
      "item": [
        {
          "name": "Create Specialty",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Cardiology\"\n}"
            },
            "url": "http://localhost:5000/specialty"
          }
        },
        {
          "name": "List Specialties",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/specialty"
          }
        }
      ]
    },
    {
      "name": "Appointments",
      "item": [
        {
          "name": "Create Appointment",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"patientId\": 1,\n  \"doctorId\": 1,\n  \"specialtyId\": 1,\n  \"dateTime\": \"2025-12-01T10:00:00Z\",\n  \"status\": \"scheduled\"\n}"
            },
            "url": "http://localhost:5000/appointment"
          }
        },
        {
          "name": "List Appointments",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/appointment"
          }
        }
      ]
    }
  ]
}
```

Importe no Postman: `File > Import > postman_collection.json`

## 5. Verificar Banco de Dados

```bash
# Instalar sqlite3 (se não tiver)
brew install sqlite3  # macOS
# ou
sudo apt-get install sqlite3  # Linux

# Abrir o banco
sqlite3 medagenda.db

# Comandos úteis:
.tables                    # Listar tabelas
SELECT * FROM users;       # Ver usuários
SELECT * FROM patients;    # Ver pacientes
SELECT * FROM doctors;     # Ver médicos
SELECT * FROM specialties; # Ver especialidades
SELECT * FROM appointments; # Ver consultas

# Sair
.quit
```

## 6. Rodar os Testes Automatizados

```bash
# Todos os testes
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Com cobertura
npm run test:coverage

# Modo watch (reexecuta ao salvar)
npm run test:watch
```

## 7. Verificar Logs

O servidor mostra logs no console. Fique atento a:

```
✅ Sucesso:
Server is running on port 5000

❌ Erros comuns:
- "SQLITE_CONSTRAINT: UNIQUE constraint failed" → Email duplicado
- "Invalid or expired token" → Token inválido ou expirado
- "User not found" → Usuário não existe
```

## 8. Fluxo Completo de Teste

### Cenário: Paciente Agenda Consulta

1. **Criar Especialidade**
   ```bash
   curl -X POST http://localhost:5000/specialty \
     -H "Content-Type: application/json" \
     -d '{"name": "Cardiologia"}'
   ```

2. **Registrar Médico**
   ```bash
   curl -X POST http://localhost:5000/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "dr.silva@hospital.com",
       "password": "medico123",
       "type": "DOCTOR",
       "name": "Dr. Carlos Silva"
     }'
   ```

3. **Completar Cadastro do Médico** (usar token do passo 2)
   ```bash
   curl -X POST http://localhost:5000/doctor/complete-registration \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN_MEDICO" \
     -d '{
       "name": "Dr. Carlos Silva",
       "crm": "CRM123456",
       "email": "carlos@hospital.com",
       "phone": "11987654321",
       "specialtyId": 1
     }'
   ```

4. **Registrar Paciente**
   ```bash
   curl -X POST http://localhost:5000/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "maria@email.com",
       "password": "paciente123",
       "type": "PATIENT",
       "name": "Maria Oliveira"
     }'
   ```

5. **Completar Cadastro do Paciente** (usar token do passo 4)
   ```bash
   curl -X POST http://localhost:5000/patient/complete-registration \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN_PACIENTE" \
     -d '{
       "name": "Maria Oliveira",
       "email": "maria@email.com",
       "phone": "11912345678",
       "birthDate": "1985-03-20"
     }'
   ```

6. **Agendar Consulta** (usar token do paciente)
   ```bash
   curl -X POST http://localhost:5000/appointment \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TOKEN_PACIENTE" \
     -d '{
       "patientId": 1,
       "doctorId": 1,
       "specialtyId": 1,
       "dateTime": "2025-12-10T09:00:00Z",
       "status": "scheduled"
     }'
   ```

7. **Ver Consultas do Paciente**
   ```bash
   curl http://localhost:5000/appointment/by-patient/1
   ```

8. **Ver Consultas do Médico**
   ```bash
   curl http://localhost:5000/appointment/by-doctor/1
   ```

## 9. Checklist de Testes

- [ ] Servidor inicia sem erros
- [ ] Health check retorna status ok
- [ ] Registro de paciente funciona
- [ ] Registro de médico funciona
- [ ] Login funciona
- [ ] Token JWT é gerado
- [ ] Endpoints protegidos requerem token
- [ ] Criar especialidade funciona
- [ ] Listar especialidades funciona
- [ ] Completar cadastro de paciente funciona
- [ ] Completar cadastro de médico funciona
- [ ] Criar consulta funciona
- [ ] Listar consultas funciona
- [ ] Filtrar consultas por paciente funciona
- [ ] Filtrar consultas por médico funciona
- [ ] Atualizar consulta funciona
- [ ] Deletar consulta funciona

## 10. Troubleshooting

### Problema: "Port 5000 already in use"
```bash
# Encontrar processo usando a porta
lsof -i :5000

# Matar o processo
kill -9 PID
```

### Problema: "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Database locked"
```bash
# Parar o servidor e deletar arquivos de lock
rm medagenda.db-wal medagenda.db-shm
```

### Problema: Banco de dados corrompido
```bash
# Deletar e recriar
rm medagenda.db
# Reiniciar servidor (vai recriar automaticamente)
npm run dev
```

## Pronto! 🎉

Agora você tem várias formas de testar sua API. Comece pelo Health Check e vá avançando!
