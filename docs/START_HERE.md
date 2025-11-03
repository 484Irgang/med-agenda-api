# 🚀 Como Testar a API - COMECE AQUI

## Opção 1: Teste Rápido Automatizado (MAIS FÁCIL) ⚡

### Passo 1: Iniciar o Servidor

Abra um terminal e execute:

```bash
cd /Users/guilherme_irgang/Documents/MY_PROJECTS/med-agenda-api/med-agenda-node-api
npm run dev
```

Aguarde ver a mensagem:
```
Server is running on port 5000
```

**⚠️ Deixe este terminal aberto!** O servidor precisa estar rodando.

### Passo 2: Rodar o Teste Automatizado

Abra um **NOVO terminal** (Cmd+T ou Ctrl+Shift+T) e execute:

```bash
cd /Users/guilherme_irgang/Documents/MY_PROJECTS/med-agenda-api/med-agenda-node-api
./quick-test.sh
```

Este script vai:
- ✅ Verificar se a API está online
- ✅ Criar uma especialidade médica
- ✅ Registrar um paciente
- ✅ Registrar um médico
- ✅ Criar uma consulta
- ✅ Mostrar todos os dados criados

---

## Opção 2: Teste Manual com cURL 🔧

### 1. Verificar se a API está online

```bash
curl http://localhost:5000/health
```

✅ Esperado: `{"status":"ok","timestamp":"..."}`

### 2. Registrar um usuário

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "senha123",
    "type": "PATIENT",
    "name": "Teste Usuario"
  }'
```

✅ Esperado: Retornar um `token` e dados do usuário

**Copie o token retornado!** Você vai precisar dele.

### 3. Fazer login

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "senha123"
  }'
```

### 4. Criar uma especialidade

```bash
curl -X POST http://localhost:5000/specialty \
  -H "Content-Type: application/json" \
  -d '{"name": "Cardiologia"}'
```

### 5. Listar especialidades

```bash
curl http://localhost:5000/specialty
```

---

## Opção 3: Usando Postman/Insomnia 🎯

### 1. Baixar Postman

https://www.postman.com/downloads/

### 2. Criar uma Request

1. Clique em "New" → "HTTP Request"
2. Selecione `GET`
3. Cole a URL: `http://localhost:5000/health`
4. Clique em "Send"

### 3. Exemplos de Requests

#### Health Check
- **Método:** GET
- **URL:** `http://localhost:5000/health`

#### Registrar Paciente
- **Método:** POST
- **URL:** `http://localhost:5000/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "paciente@teste.com",
  "password": "senha123",
  "type": "PATIENT",
  "name": "João Silva"
}
```

#### Login
- **Método:** POST
- **URL:** `http://localhost:5000/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "paciente@teste.com",
  "password": "senha123"
}
```

#### Criar Especialidade
- **Método:** POST
- **URL:** `http://localhost:5000/specialty`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "name": "Dermatologia"
}
```

---

## Opção 4: Rodar os Testes Automatizados 🧪

```bash
# Rodar todos os testes
npm test

# Rodar apenas testes unitários
npm run test:unit

# Rodar apenas testes de integração
npm run test:integration
```

---

## Verificar o Banco de Dados 💾

```bash
# Instalar SQLite (se não tiver)
brew install sqlite3  # macOS

# Abrir o banco
sqlite3 medagenda.db

# Ver dados
.tables
SELECT * FROM users;
SELECT * FROM patients;
SELECT * FROM doctors;
SELECT * FROM specialties;
SELECT * FROM appointments;

# Sair
.quit
```

---

## Endpoints Disponíveis 📋

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login
- `GET /auth/me` - Ver dados do usuário logado (requer token)
- `POST /auth/logout` - Logout

### Pacientes
- `POST /patient/complete-registration` - Completar cadastro (requer token)
- `GET /patient` - Listar todos
- `GET /patient/:id` - Ver um paciente (requer token)
- `POST /patient` - Criar
- `PUT /patient/:id` - Atualizar
- `DELETE /patient/:id` - Deletar

### Médicos
- `POST /doctor/complete-registration` - Completar cadastro (requer token)
- `GET /doctor` - Listar todos
- `GET /doctor/:id` - Ver um médico
- `POST /doctor` - Criar
- `PUT /doctor/:id` - Atualizar
- `DELETE /doctor/:id` - Deletar

### Especialidades
- `GET /specialty` - Listar todas
- `GET /specialty/:id` - Ver uma especialidade
- `POST /specialty` - Criar
- `PUT /specialty/:id` - Atualizar
- `DELETE /specialty/:id` - Deletar

### Consultas
- `POST /appointment` - Criar (requer token)
- `GET /appointment` - Listar todas
- `GET /appointment/:id` - Ver uma consulta
- `GET /appointment/by-patient/:patientId` - Consultas de um paciente
- `GET /appointment/by-doctor/:doctorId` - Consultas de um médico
- `PUT /appointment/:id` - Atualizar
- `DELETE /appointment/:id` - Deletar

---

## Troubleshooting 🔧

### Erro: "Cannot connect"
**Problema:** Servidor não está rodando
**Solução:** Execute `npm run dev` em um terminal

### Erro: "Port 5000 already in use"
**Problema:** Outra aplicação está usando a porta 5000
**Solução:**
```bash
lsof -i :5000
kill -9 <PID>
```

### Erro: "Invalid token"
**Problema:** Token expirado ou inválido
**Solução:** Faça login novamente para obter um novo token

### Erro: "Email already registered"
**Problema:** Email já existe no banco
**Solução:** Use outro email ou delete o banco:
```bash
rm medagenda.db
# Reinicie o servidor
```

---

## Próximos Passos 📚

1. ✅ Testar todos os endpoints
2. ✅ Ler o `README.md` para entender a arquitetura
3. ✅ Ler o `DEVELOPMENT.md` para aprender a desenvolver
4. ✅ Ler o `TESTING_GUIDE.md` para testes mais avançados

---

## Precisa de Ajuda? 🆘

- Consulte `TESTING_GUIDE.md` para testes detalhados
- Consulte `README.md` para documentação completa
- Consulte `DEVELOPMENT.md` para guia de desenvolvimento
