# Account Management API

A REST API for banking account management built with NestJS, TypeORM, and PostgreSQL.

## Architecture

```
src/
├── account/                # Account module (create, deposit, withdraw, block, balance)
│   ├── dto/                # Request and response DTOs
│   ├── account.entity.ts   # TypeORM entity
│   ├── account.repository.ts # Data access layer
│   ├── account.service.ts  # Business logic
│   └── account.controller.ts # REST endpoints
├── transaction/            # Transaction module (statements with period filtering)
│   ├── dto/
│   ├── transaction.entity.ts
│   ├── transaction.repository.ts
│   ├── transaction.service.ts
│   └── transaction.controller.ts
├── person/                 # Person module (read-only, seed data)
│   ├── person.entity.ts
│   └── person.repository.ts
└── shared/
    └── filters/            # Global exception filter
```

**Layered pattern**: Controller (HTTP) → Service (business logic) → Repository (data access) → Entity (database)

## Prerequisites

- Docker and Docker Compose

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/Jorjs/account-management.git
cd account-management
```

2. Start the application:
```bash
docker compose up --build
```

The database is automatically seeded with test persons on first startup.

3. The API is available at `http://localhost:3000`
4. Swagger documentation at `http://localhost:3000/api/docs`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /accounts | Create a new account |
| GET | /accounts/:id/balance | Get account balance |
| POST | /accounts/:id/deposit | Deposit into account |
| POST | /accounts/:id/withdraw | Withdraw from account |
| PATCH | /accounts/:id/block | Block an account |
| GET | /accounts/:id/statements | Get transaction statement |

### Statement by period

Filter transactions by date range using query parameters:
```
GET /accounts/:id/statements?startDate=2026-01-01&endDate=2026-12-31
```

## Running Tests

### Unit tests
```bash
npm run test
```

### E2E tests (requires PostgreSQL running)
```bash
npm run test:e2e
```

## Local Development (without Docker)

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Make sure PostgreSQL is running and update `.env` with your credentials.

4. Start in development mode:
```bash
npm run start:dev
```

## Resilience and Failure Handling

- **Pessimistic locking** on deposit/withdraw to prevent race conditions
- **Database transactions** ensure atomicity (balance + transaction record)
- **Daily withdrawal limit** enforcement
- **Global exception filter** for consistent error responses
- **Input validation** with class-validator (whitelist, forbidNonWhitelisted)
- **Docker healthcheck** ensures API starts only after PostgreSQL is ready
- **Blocked account checks** on all operations

## Tech Stack

- **NestJS** - Application framework
- **TypeORM** - ORM with PostgreSQL
- **Swagger** - API documentation
- **Jest** - Unit and E2E testing
- **Docker** - Containerization
