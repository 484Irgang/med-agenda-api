# Med Agenda - API Backend

API REST para gerenciamento de consultas médicas, desenvolvida com Node.js, Express e TypeScript.

## 📋 Sobre o Projeto

Backend do sistema Med Agenda que fornece endpoints para autenticação, gerenciamento de consultas, feedbacks, estatísticas e notificações para pacientes e médicos.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **SQLite** - Banco de dados
- **Zod** - Validação de schemas
- **bcrypt** - Hash de senhas
- **jsonwebtoken** - Autenticação JWT
- **dayjs** - Manipulação de datas
- **CORS** - Controle de acesso

## ✨ Funcionalidades

### Autenticação
- Registro de usuários (pacientes e médicos)
- Login com JWT
- Proteção de rotas com middleware de autenticação

### Gestão de Consultas
- CRUD completo de consultas
- Listagem por paciente
- Listagem por médico
- Filtros por data e status

### Sistema de Feedbacks
- Avaliação de consultas (1-5 estrelas)
- Comentários opcionais
- Listagem de feedbacks por consulta/paciente

### Estatísticas
**Para Pacientes:**
- Total de consultas realizadas e agendadas
- Número de médicos consultados
- Avaliações feitas
- Especialidades mais consultadas
- Última consulta com detalhes

**Para Médicos:**
- Consultas do mês atual
- Total de pacientes atendidos
- Média de avaliações recebidas
- Próximas consultas agendadas
- Avaliações recentes com comentários
- Distribuição de horários (manhã/tarde/noite)

### Notificações
- Criação de notificações personalizadas
- Listagem por usuário
- Marcação como lida (individual e em massa)
- Tipos: consulta, lembrete, feedback, sistema
- Data relativa formatada ("há 2 horas", "há 3 dias")

### Especialidades e Profissionais
- Cadastro de especialidades médicas
- Registro de médicos com CRM
- Cadastro de pacientes

## 📂 Estrutura do Projeto

```
med-agenda-api/
├── src/
│   ├── config/
│   │   └── environment.ts        # Configurações de ambiente
│   ├── database/
│   │   ├── connection.ts         # Conexão SQLite
│   │   ├── schema.ts             # Definição de tabelas
│   │   └── repositories/         # Camada de dados
│   │       ├── user.repository.ts
│   │       ├── patient.repository.ts
│   │       ├── doctor.repository.ts
│   │       ├── appointment.repository.ts
│   │       ├── specialty.repository.ts
│   │       └── feedback.repository.ts
│   ├── domain/
│   │   └── validators.ts         # Schemas Zod
│   ├── middleware/
│   │   ├── auth.middleware.ts    # Autenticação JWT
│   │   └── error.middleware.ts   # Tratamento de erros
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── appointment.routes.ts
│   │   ├── feedback.routes.ts
│   │   ├── statistics.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── doctor.routes.ts
│   │   └── specialty.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── appointment.service.ts
│   │   ├── feedback.service.ts
│   │   ├── statistics.service.ts
│   │   ├── notification.service.ts
│   │   ├── patient.service.ts
│   │   ├── doctor.service.ts
│   │   └── specialty.service.ts
│   ├── types/
│   │   ├── entities.ts           # Tipos de entidades
│   │   └── http.ts               # Tipos HTTP (Result)
│   └── index.ts                  # Entry point
├── dist/                         # Build transpilado
├── medagenda.db                  # Banco de dados SQLite
├── .env                          # Variáveis de ambiente
└── package.json
```

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd med-agenda-api
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=seu_secret_super_seguro
CORS_ORIGIN=http://localhost:8081
```

4. Compile o projeto
```bash
npm run build
```

5. Inicie o servidor
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📡 Endpoints da API

### Autenticação
```
POST   /auth/register          # Registrar novo usuário
POST   /auth/login             # Login
```

### Consultas
```
GET    /appointment            # Listar todas
GET    /appointment/:id        # Buscar por ID
GET    /appointment/by-patient/:patientId
GET    /appointment/by-doctor/:doctorId
POST   /appointment            # Criar nova (autenticado)
PUT    /appointment/:id        # Atualizar
DELETE /appointment/:id        # Deletar
```

### Feedbacks
```
GET    /feedback/:id           # Buscar por ID
GET    /feedback/appointment/:appointmentId
GET    /feedback/patient/:patientId
POST   /feedback               # Criar avaliação
PUT    /feedback/:id           # Atualizar
DELETE /feedback/:id           # Deletar
```

### Estatísticas
```
GET    /statistics/patient/:patientId
GET    /statistics/doctor/:doctorId
```

### Notificações
```
GET    /notifications/user/:userId
PUT    /notifications/:id/read
PUT    /notifications/user/:userId/read-all
```

### Pacientes
```
GET    /patient                # Listar todos
GET    /patient/:id            # Buscar por ID
POST   /patient                # Criar
PUT    /patient/:id            # Atualizar
DELETE /patient/:id            # Deletar
```

### Médicos
```
GET    /doctor                 # Listar todos
GET    /doctor/:id             # Buscar por ID
POST   /doctor                 # Criar
PUT    /doctor/:id             # Atualizar
DELETE /doctor/:id             # Deletar
```

### Especialidades
```
GET    /specialty              # Listar todas
GET    /specialty/:id          # Buscar por ID
POST   /specialty              # Criar
PUT    /specialty/:id          # Atualizar
DELETE /specialty/:id          # Deletar
```

### Health Check
```
GET    /health                 # Status da API
```

## 🗄️ Banco de Dados

### Tabelas

**users**
- Armazena dados de autenticação
- Relaciona com patients ou doctors via FKs

**patients**
- Dados pessoais dos pacientes
- Relacionado com users

**doctors**
- Dados profissionais dos médicos
- CRM, especialidade
- Relacionado com users

**specialties**
- Especialidades médicas disponíveis

**appointments**
- Consultas agendadas
- Status: SCHEDULED, COMPLETED, CANCELLED

**feedbacks**
- Avaliações de consultas
- Rating de 1 a 5 estrelas
- Comentário opcional

**notifications**
- Notificações do sistema
- Tipos: consulta, lembrete, feedback, sistema
- Flag de lida/não lida

## 🔒 Segurança

- Senhas hasheadas com bcrypt (salt rounds: 10)
- Autenticação JWT em rotas protegidas
- Validação de entrada com Zod
- CORS configurável
- Sanitização de erros

## 📊 Padrão de Resposta

Todas as respostas seguem o padrão envelope:

**Sucesso:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Erro:**
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

## 🧪 Scripts Disponíveis

```bash
npm run build       # Compila TypeScript para JavaScript
npm start           # Inicia o servidor (production)
npm run dev         # Modo desenvolvimento com watch
npm test            # Executa testes
```

## 🌐 Deploy

Para deploy em produção:

1. Configure as variáveis de ambiente
2. Compile o projeto: `npm run build`
3. Inicie com PM2 ou similar: `pm2 start dist/index.js`

Para expor localmente via ngrok:
```bash
ngrok http 3000
```

## 📄 Licença

Este projeto é de uso educacional.

## 👥 Autor

Desenvolvido por Guilherme de Lima Irgang
