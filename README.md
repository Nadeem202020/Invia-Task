# Mini Inventory System

This is a Mini Inventory System designed for managing products, warehouses, and stock operations. It uses a modern tech stack to ensure performance, reliability, and ease of use.

## Architecture and Technology Stack
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL accessed via Prisma ORM
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Authentication:** JWT (JSON Web Tokens)
- **Containerization:** Docker Compose for PostgreSQL

## Repository Structure
```
/
├── backend/          # Node.js + Express API
│   ├── prisma/       # Schema, migrations, and seed data
│   ├── src/          # Source code (controllers, routes, middleware)
│   └── tests/        # Jest test files
├── frontend/         # React + Vite application
│   ├── src/          # Source code (components, pages, api)
│   └── public/       # Static assets
├── docker-compose.yml# PostgreSQL Docker configuration
└── README.md
```

## Prerequisites
- Node.js (v18+)
- npm (v9+)
- Docker & Docker Compose (or Colima)

## Setup and Run Instructions

### 1. Database Setup
Start the PostgreSQL database using Docker Compose:
```bash
docker compose up -d
```
*Note: The database runs on port `5433` (mapped to `5432` internally) to avoid conflicts with existing PostgreSQL installations.*

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables (optional, `.env` is already configured for local dev):
   ```bash
   cp ../.env.example .env
   ```
4. Run Prisma migrations to initialize the schema:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the database with demo data:
   ```bash
   npm run seed
   ```
6. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:3000`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will run on the URL provided by Vite (usually `http://localhost:5173`).

## Demo Credentials
Use the following credentials to log in:
- **Username:** `demo`
- **Password:** `password123`

## API Overview & Swagger
The REST API provides endpoints for:
- `/api/auth/login`: JWT Authentication
- `/api/products`: Create and list products (with inventory counts)
- `/api/warehouses`: Create and list warehouses
- `/api/inventory/add`: Add stock to a product in a warehouse
- `/api/inventory/remove`: Remove stock
- `/api/inventory/transfer`: Transfer stock between warehouses

**Swagger Documentation:** Once the backend is running, visit `http://localhost:3000/api-docs` to view and interact with the OpenAPI specification.

## Data Model & Stock Business Rules
- **Products:** Uniquely identified by `sku`. Creating a product automatically initializes a `0` inventory record for every existing warehouse.
- **Warehouses:** Uniquely identified by `code`. Creating a warehouse automatically initializes a `0` inventory record for every existing product.
- **Stock Operations:**
  - Negative inventory is strictly prohibited.
  - Removing more stock than available will be rejected (`400 Bad Request`).
  - Transfers to the same warehouse will be rejected.
  - Quantities must be positive integers (> 0).
  - All stock mutations (`add`, `remove`, `transfer`) use Prisma `$transaction` blocks to guarantee atomicity and prevent race conditions.
- **Stock History:** Every stock mutation generates an immutable record in the `StockHistory` table detailing the operation type, quantity, product, and involved warehouses.

## Testing
Unit and integration tests are located in `backend/tests/` and cover all core business validation and edge cases, including atomic transfer rules and error conditions.

Run the test suite from the backend directory:
```bash
npm run test
```

## Assumptions and Design Decisions
1. **Ports:** PostgreSQL is mapped to `5433` on the host to prevent conflicts with default `5432` instances.
2. **Authentication:** A simplified JWT flow is used. Passwords are hashed using bcrypt. A single demo user is created via the seed script.
3. **Frontend Routing:** React Router is used to protect dashboard routes behind a login screen.
4. **Frontend Styling:** Tailwind CSS is used for rapid UI development with utility-first classes. No separate configuration file is needed with the version used.
5. **Concurrency & Atomicity:** All stock mutations are wrapped in Prisma `$transaction` blocks. A database-level `CHECK` constraint (`quantity >= 0`) on the `Inventory` table serves as a safety net against race conditions under concurrent access.

## Optional Enhancements Implemented
- **Stock History:** A `StockHistory` table records an immutable audit log of all inventory mutations, including operation type, quantities, and involved warehouses.
- **Unit/Integration Tests:** A comprehensive Jest/Supertest suite verifies application boundaries, authentication, and concurrency constraints.

## Known Limitations
- Deleting a warehouse or product is not currently implemented; the scope of the assignment focused exclusively on stock management.
- The UI is designed for desktop browser evaluation and lacks advanced mobile responsiveness for dense tables.
