# Medical Agenda API - Node.js/TypeScript

A functional TypeScript implementation of a medical appointment management system.

## Overview

This API provides a complete solution for managing medical appointments, including:

- User authentication (JWT-based)
- Patient registration and management
- Doctor registration and management
- Medical specialties
- Appointment scheduling and tracking

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Paradigm**: Functional Programming

## Features

- Strong TypeScript typing
- Functional programming patterns
- Secure password hashing (bcrypt)
- JWT authentication
- Input validation with Zod
- Comprehensive test coverage (unit + integration)
- Clean architecture with separation of concerns
- Environment-based configuration

## Project Structure

```
src/
├── config/           # Configuration files
│   └── environment.ts
├── types/            # TypeScript type definitions
│   ├── entities.ts
│   ├── auth.ts
│   └── http.ts
├── database/         # Database layer
│   ├── connection.ts
│   ├── schema.ts
│   └── repositories/
│       ├── user.repository.ts
│       ├── patient.repository.ts
│       ├── doctor.repository.ts
│       ├── specialty.repository.ts
│       └── appointment.repository.ts
├── domain/           # Business domain
│   └── validators.ts
├── services/         # Business logic
│   ├── auth.service.ts
│   ├── patient.service.ts
│   ├── doctor.service.ts
│   ├── specialty.service.ts
│   └── appointment.service.ts
├── routes/           # HTTP routes
│   ├── auth.routes.ts
│   ├── patient.routes.ts
│   ├── doctor.routes.ts
│   ├── specialty.routes.ts
│   └── appointment.routes.ts
├── middleware/       # Express middleware
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── utils/            # Utility functions
│   ├── hash.ts
│   └── jwt.ts
└── index.ts          # Application entry point

tests/
├── unit/             # Unit tests
│   ├── hash.test.ts
│   ├── jwt.test.ts
│   └── validators.test.ts
└── integration/      # Integration tests
    ├── auth.test.ts
    ├── specialty.test.ts
    └── appointment.test.ts
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x

### Installation

1. Clone the repository:
```bash
cd med-agenda-node-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
PORT=5000
NODE_ENV=development
DATABASE_PATH=./medagenda.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=2h
CORS_ORIGIN=http://localhost:8081
BCRYPT_ROUNDS=10
```

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## API Endpoints

### Authentication (`/auth`)

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "type": "PATIENT",  // or "DOCTOR"
  "name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "type": "PATIENT",
      "patientId": null,
      "doctorId": null
    }
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /auth/logout
```

### Patients (`/patient`)

#### Complete Patient Registration
```http
POST /patient/complete-registration
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123456789",
  "birthDate": "1990-01-01"
}
```

#### Get All Patients
```http
GET /patient
```

#### Get Patient by ID
```http
GET /patient/:id
Authorization: Bearer <token>
```

#### Create Patient
```http
POST /patient
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123456789",
  "birthDate": "1990-01-01"
}
```

#### Update Patient
```http
PUT /patient/:id
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "987654321"
}
```

#### Delete Patient
```http
DELETE /patient/:id
```

### Doctors (`/doctor`)

#### Complete Doctor Registration
```http
POST /doctor/complete-registration
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Dr. Smith",
  "crm": "CRM12345",
  "email": "doctor@example.com",
  "phone": "987654321",
  "specialtyId": 1
}
```

#### Get All Doctors
```http
GET /doctor
```

#### Get Doctor by ID
```http
GET /doctor/:id
```

#### Create Doctor
```http
POST /doctor
Content-Type: application/json

{
  "name": "Dr. Smith",
  "crm": "CRM12345",
  "email": "doctor@example.com",
  "phone": "987654321",
  "specialtyId": 1
}
```

#### Update Doctor
```http
PUT /doctor/:id
Content-Type: application/json

{
  "phone": "999888777",
  "specialtyId": 2
}
```

#### Delete Doctor
```http
DELETE /doctor/:id
```

### Specialties (`/specialty`)

#### Get All Specialties
```http
GET /specialty
```

#### Get Specialty by ID
```http
GET /specialty/:id
```

#### Create Specialty
```http
POST /specialty
Content-Type: application/json

{
  "name": "Cardiology"
}
```

#### Update Specialty
```http
PUT /specialty/:id
Content-Type: application/json

{
  "name": "Cardiology Updated"
}
```

#### Delete Specialty
```http
DELETE /specialty/:id
```

### Appointments (`/appointment`)

#### Create Appointment
```http
POST /appointment
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": 1,
  "doctorId": 1,
  "specialtyId": 1,
  "dateTime": "2025-12-01T10:00:00Z",
  "status": "scheduled"
}
```

#### Get All Appointments
```http
GET /appointment
```

#### Get Appointment by ID
```http
GET /appointment/:id
```

#### Get Appointments by Patient
```http
GET /appointment/by-patient/:patientId
```

#### Get Appointments by Doctor
```http
GET /appointment/by-doctor/:doctorId
```

#### Update Appointment
```http
PUT /appointment/:id
Content-Type: application/json

{
  "status": "completed",
  "dateTime": "2025-12-01T11:00:00Z"
}
```

#### Delete Appointment
```http
DELETE /appointment/:id
```

### Health Check
```http
GET /health
```

## Development Guide

### Code Style

This project follows functional programming principles:

- **Pure Functions**: Functions should not have side effects when possible
- **Immutability**: Prefer `const` and avoid mutating data
- **Function Composition**: Build complex operations from simple functions
- **Higher-Order Functions**: Use functions that accept or return functions
- **Type Safety**: Leverage TypeScript's type system

### Adding New Features

1. **Define Types**: Add type definitions in `src/types/`
2. **Create Repository**: Implement database operations in `src/database/repositories/`
3. **Implement Service**: Add business logic in `src/services/`
4. **Create Routes**: Define HTTP endpoints in `src/routes/`
5. **Add Validation**: Create Zod schemas in `src/domain/validators.ts`
6. **Write Tests**: Add unit and integration tests

### Database Schema

The database uses SQLite with the following tables:

- `users`: User authentication and profile
- `patients`: Patient information
- `doctors`: Doctor information
- `specialties`: Medical specialties
- `appointments`: Appointment records

Relationships:
- User 1:1 Patient (optional)
- User 1:1 Doctor (optional)
- Doctor N:1 Specialty
- Appointment N:1 Patient
- Appointment N:1 Doctor
- Appointment N:1 Specialty

### Testing Strategy

- **Unit Tests**: Test individual functions and utilities
- **Integration Tests**: Test complete API endpoints
- **Test Database**: Uses in-memory SQLite for isolation

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Environment variable configuration
- CORS protection
- Input validation with Zod

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Validation errors include details:

```json
{
  "success": false,
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

## Performance Considerations

- Database indexes on frequently queried fields
- Eager loading for related entities
- Functional approach reduces state management overhead
- SQLite for lightweight deployment

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` in environment
- [ ] Configure proper `DATABASE_PATH`
- [ ] Set `NODE_ENV=production`
- [ ] Configure appropriate `CORS_ORIGIN`
- [ ] Set up proper logging
- [ ] Configure HTTPS
- [ ] Set up database backups

### Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

## Comparison with Original C# API

### Improvements

- ✅ Password hashing (bcrypt) - Original stored plain text
- ✅ Functional programming paradigm
- ✅ Strong TypeScript typing
- ✅ Runtime validation with Zod
- ✅ Comprehensive test coverage
- ✅ Better error handling

### Maintained Features

- ✅ Same database schema
- ✅ Same API endpoints
- ✅ JWT authentication
- ✅ Two-step registration (User → Patient/Doctor)

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
