# PRD — Mini Inventory System

**Execution Specification for Gemini Pro in Antigravity**

**Full-Stack Developer Technical Assignment**  
**Status:** Implementation-ready | **Autonomy:** Strict | **Deployment:** Not required

---

## 1. Source Assignment and Scope

The attached assignment defines a Mini Inventory System for multiple warehouses and basic stock operations. Its explicit requirements are:

- Backend implemented in TypeScript.
- PostgreSQL database.
- RESTful API design.
- Database transactions for stock operations.
- Runnable locally with minimal setup.
- Frontend: list products, expand a product to show inventory per warehouse, create products and warehouses, and perform Add Stock, Remove Stock, and Transfer Stock.
- Deliverables: Git repository, README with setup/run instructions, database schema, and migrations.
- Optional enhancements: stock-change logging, authentication, and unit/integration tests.

The assignment explicitly allows the candidate to choose frameworks, ORMs, and frontend approach, and asks that assumptions/design decisions be documented in the README.

This PRD converts those requirements and the candidate's selected technology decisions into a strict implementation specification. Where the assignment leaves behavior unspecified, Gemini must follow the decision rules in this PRD or, where explicitly delegated below, choose a reasonable rule and document it.

---

## 2. Confirmed Technology Decisions

- Backend: Node.js + TypeScript + Express.
- Database: PostgreSQL.
- ORM: Prisma.
- Frontend: React + TypeScript + Vite.
- Styling: Tailwind CSS.
- Authentication: JWT.
- API documentation: Swagger / OpenAPI.
- Testing: unit tests + integration tests.
- Containerization: Docker Compose for PostgreSQL and the application.
- Repository structure: monorepo with `/backend` and `/frontend`.
- Seed/demo data: required.
- Stock-operation history/logging: implement if time permits, without compromising core requirements.
- Deployment: not required.
- Gemini autonomy: strict; do not deviate from this PRD without explicit approval.
- Primary objective: simultaneously satisfy the assignment, demonstrate production-quality engineering, and maximize reviewer impression.

---

## 3. Operating Instructions for Gemini Pro in Antigravity

Treat this document as the authoritative implementation specification. Do not reinterpret the requested architecture or substitute technologies.

- First inspect the workspace/repository and confirm the current state before creating or modifying files.
- Implement the project in small, verifiable phases rather than generating an unverified large code dump.
- Do not introduce another backend framework, ORM, frontend framework, CSS framework, database, or authentication mechanism.
- Do not add deployment infrastructure because deployment is explicitly out of scope.
- Do not ask for approval for ordinary implementation details that are covered by this PRD.
- If an architectural conflict with this PRD is discovered, stop at the affected decision and report the conflict rather than silently changing the specification.
- Keep the implementation understandable to a reviewer who will inspect the repository and potentially discuss design decisions in an interview.
- Prefer simple, maintainable solutions over unnecessary abstraction or feature breadth.
- Every non-obvious assumption must be documented in `README.md`.
- Do not mark the task complete until the verification checklist in Section 20 has been executed.

---

## 4. Repository Structure

```text
/
├── backend/
│   ├── src/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── tests/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

Gemini may refine internal folders within `backend/src` and `frontend/src`, but must preserve the top-level `/backend` and `/frontend` structure.

---

## 5. Functional Scope

### 5.1 Products

- Create a product.
- View a list of products.
- Expand a product to display its inventory quantity for every warehouse.
- Keep the product domain model minimal; do not add unnecessary business fields.

### 5.2 Warehouses

- Create a warehouse.
- Display warehouses where needed for stock operations.
- Keep the warehouse domain model minimal.

### 5.3 Stock Operations

- Add stock to a product in a warehouse.
- Remove stock from a product in a warehouse.
- Transfer stock for a product from one warehouse to another.
- Transfer must update both source and destination inventory records inside a single database transaction.
- The API must enforce all stock-operation business rules consistently.

### 5.4 Authentication

- Implement JWT-based authentication.
- Protect application APIs that mutate or expose inventory data according to a coherent authentication policy.
- Provide a practical login flow sufficient for local evaluation.
- Seed/demo data must include a usable demo account or equivalent documented credentials.
- Do not introduce social login, OAuth providers, or external identity infrastructure.

---

## 6. Data Model

The exact field naming may follow Prisma conventions, but the model must remain minimal and relationally sound.

### 6.1 Product

- Primary key.
- Name.
- A unique SKU is recommended as the minimal operational identifier.
- Created/updated timestamps where useful for maintainability.

### 6.2 Warehouse

- Primary key.
- Name.
- A unique code is recommended as the minimal operational identifier.
- Created/updated timestamps where useful for maintainability.

### 6.3 Inventory

- Primary key or a composite identity appropriate for Prisma.
- Product relation.
- Warehouse relation.
- Quantity.
- Enforce uniqueness for each product + warehouse combination.
- Quantity must be represented using a type appropriate for integer stock counts.

When a product is created, inventory records must automatically be created for every warehouse that already exists, with `quantity = 0`.

Gemini must ensure that later warehouse creation also produces the corresponding zero-quantity inventory record for every existing product. This maintains the same invariant in both directions.

---

## 7. Stock Rules Delegated to Gemini

The assignment does not define detailed stock validation rules. Gemini is authorized to choose reasonable rules, but must make them explicit in the implementation and README.

- Define whether negative inventory is prohibited. The default engineering recommendation is to prohibit it.
- Define behavior when removing more stock than is available. The default recommendation is to reject the operation without modifying the database.
- Define behavior for transfers to the same warehouse. The default recommendation is to reject them.
- Define behavior for zero or negative operation quantities. The default recommendation is to reject them.
- Define how missing product, warehouse, or inventory records are handled.
- Define appropriate HTTP status codes and stable error responses.
- Define concurrency-safe behavior for stock changes.

These choices must be documented as explicit business rules, not left implicit in code.

---

## 8. Transaction and Concurrency Requirements

Stock correctness is a core evaluation point.

- Add Stock must be atomic.
- Remove Stock must be atomic.
- Transfer Stock must be atomic.
- A transfer must either update both source and destination inventory records or update neither.
- Use Prisma transactions for all stock mutations.
- The implementation must avoid race conditions that could cause inventory to become incorrect under concurrent stock operations.
- Where row locking/isolation behavior is required, use the PostgreSQL/Prisma mechanism that provides the necessary correctness and document the reasoning.
- Do not rely on frontend validation as the source of truth; all business rules must be enforced on the backend.

---

## 9. REST API Specification

Use RESTful naming, JSON request/response bodies, consistent status codes, and centralized error handling.

### 9.1 Required resource areas

- Authentication: login and any required auth endpoint.
- Products: create and list.
- Warehouses: create and list.
- Inventory: retrieve product inventory and perform stock operations.

Gemini must define concrete routes, request schemas, response schemas, validation rules, and status codes before implementation. Document them in Swagger/OpenAPI and `README.md`.

The frontend must consume the API rather than bypassing it with direct database access.

---

## 10. Frontend Requirements

- React + TypeScript + Vite.
- Tailwind CSS for styling.
- Functional clarity is more important than visual polish, matching the original assignment.
- Provide a login screen for JWT authentication.
- Provide a product list.
- Allow a product to expand/collapse to show inventory by warehouse.
- Provide product creation.
- Provide warehouse creation.
- Provide Add Stock, Remove Stock, and Transfer Stock actions for inventory entries.
- Provide clear loading, success, validation, and error states.
- Prevent obvious invalid submissions in the UI, while still relying on backend validation for correctness.
- Keep the UI responsive enough for normal desktop/local evaluation.
- Do not spend excessive implementation time on animations or decorative design.

---

## 11. Swagger / OpenAPI

- Expose Swagger/OpenAPI documentation from the backend.
- Document authentication.
- Document every implemented public API endpoint.
- Document request bodies, parameters, successful responses, validation errors, and authentication requirements.
- Keep the documentation synchronized with the actual API.

---

## 12. Docker and Local Development

- Provide Docker Compose for PostgreSQL and the application.
- The setup must minimize manual configuration.
- Provide environment variables through `.env.example`.
- Do not commit secrets.
- Database migrations must be runnable through documented commands.
- Seed/demo data must be runnable through a documented command.
- The README must provide the shortest reliable path from a fresh checkout to a working application.
- The project must remain understandable and runnable without deployment infrastructure.

---

## 13. Seed / Demo Data

Create deterministic seed data sufficient to demonstrate the entire assignment.

- At least one demo authentication account.
- Multiple products.
- Multiple warehouses.
- Inventory quantities that make add, remove, and transfer operations easy to demonstrate.
- No seed data should depend on external services.
- Document demo credentials clearly without using production-like secrets.

---

## 14. Testing Strategy

Unit and integration tests are required.

### 14.1 Unit tests

- Cover core validation/business rules.
- Cover stock operation calculations and failure conditions where business logic is separated into testable units.
- Cover authentication-related logic that is practical to unit test.

### 14.2 Integration tests

- Exercise API endpoints against a test database strategy appropriate for the repository.
- Verify product and warehouse creation.
- Verify inventory initialization.
- Verify add stock.
- Verify remove stock.
- Verify transfer stock.
- Verify failed transfers do not partially modify either warehouse.
- Verify insufficient-stock behavior according to the chosen rule.
- Verify authentication protection.

Tests must be executable through documented npm scripts. Do not create superficial tests solely to increase coverage numbers.

---

## 15. Optional Stock History

Implement stock-change logging if time permits, but never at the expense of the core requirements, tests, transactional correctness, or documentation.

If implemented, record enough information to explain what changed, for which product and warehouse(s), the operation type, quantity, and timestamp. For transfers, the history must make the source/destination relationship clear.

If not implemented, explicitly state that the optional enhancement was intentionally omitted.

---

## 16. README Requirements

`README.md` is a required deliverable and must be written for a technical reviewer.

It must include:

- Project overview.
- Architecture and technology stack.
- Repository structure.
- Prerequisites.
- Environment variables.
- Docker setup.
- Local development setup.
- Database migration instructions.
- Seed instructions.
- How to run backend.
- How to run frontend.
- Swagger URL/path.
- Demo credentials.
- API overview.
- Data model overview.
- Stock business rules.
- Transaction/concurrency design decisions.
- Authentication approach.
- Testing commands.
- Assumptions and design decisions.
- Optional enhancements implemented or omitted.
- Known limitations, if any.

---

## 17. Quality and Engineering Standards

- Use strict TypeScript configuration where practical.
- Validate incoming request data at API boundaries.
- Use centralized error handling.
- Avoid duplicated business logic between controllers/routes.
- Keep controllers thin and domain/service logic testable.
- Use clear naming and consistent formatting.
- Do not hard-code environment-specific values.
- Do not expose passwords, JWT secrets, database credentials, or other secrets.
- Use secure password hashing rather than storing plaintext passwords.
- Do not log sensitive authentication data.
- Use appropriate database constraints in addition to application-level validation.
- Keep dependencies justified and avoid unnecessary packages.
- Ensure frontend API errors are presented clearly.
- Do not leave dead code, debug logs, placeholder TODOs, or unused generated files in the final implementation.

---

## 18. Implementation Phases

1. Inspect workspace and establish the monorepo structure.
2. Initialize backend and frontend with the mandated technologies.
3. Set up PostgreSQL, Prisma schema, migrations, and environment configuration.
4. Implement authentication and JWT flow.
5. Implement products, warehouses, and inventory initialization invariants.
6. Implement transactional stock operations and backend validation.
7. Add Swagger/OpenAPI.
8. Implement frontend login, product list/expansion, creation flows, and stock operations.
9. Add seed/demo data.
10. Add unit and integration tests.
11. Implement optional stock history only if the core implementation is stable and time remains.
12. Write and validate README.
13. Run formatting, type checking, tests, migrations, seed, backend startup, frontend startup, and a manual end-to-end verification.
14. Perform a final requirements audit against this PRD and the original assignment.

---

## 19. Acceptance Criteria

- The project builds successfully.
- Backend is TypeScript + Express.
- Database is PostgreSQL accessed through Prisma.
- Frontend is React + TypeScript + Vite with Tailwind CSS.
- JWT authentication works locally.
- Products can be created and listed.
- Warehouses can be created and listed.
- Creating a product creates zero-quantity inventory for every existing warehouse.
- Creating a warehouse creates zero-quantity inventory for every existing product.
- Product inventory can be viewed per warehouse.
- Add Stock works correctly.
- Remove Stock works correctly.
- Transfer Stock works correctly.
- Transfer is atomic and uses a database transaction.
- Invalid stock operations are rejected according to documented business rules.
- Swagger documents the API.
- Docker Compose provides a reproducible local environment.
- Seed data allows a reviewer to evaluate the system quickly.
- Unit tests exist and pass.
- Integration tests exist and pass.
- README contains complete setup/run instructions and design decisions.
- No deployment is required.
- The repository contains no committed secrets.

---

## 20. Final Verification Protocol for Gemini

Before reporting completion, execute all applicable checks. Do not claim success based only on code inspection.

- Install dependencies from a clean or reproducible state.
- Start PostgreSQL through Docker Compose.
- Run Prisma migrations.
- Run seed data.
- Start backend.
- Start frontend.
- Verify authentication.
- Verify product creation and listing.
- Verify warehouse creation and listing.
- Verify zero-inventory initialization for all existing warehouses when creating a product.
- Verify zero-inventory initialization for all existing products when creating a warehouse.
- Verify add stock.
- Verify remove stock.
- Verify insufficient-stock failure according to the chosen business rule.
- Verify transfer between two warehouses.
- Verify failed transfer leaves both warehouses unchanged.
- Verify Swagger is reachable and reflects the implemented API.
- Run unit tests.
- Run integration tests.
- Run TypeScript type checks.
- Run linting/formatting checks if configured.
- Review `.env.example` and confirm no secrets are committed.
- Review README from the perspective of a new evaluator following it from a fresh checkout.
- Compare the final implementation line-by-line against the acceptance criteria and original assignment.

---

## 21. Definition of Done

The task is done only when the application is runnable locally, the core inventory workflow is fully functional, transactional correctness is demonstrated, authentication is implemented, the required tests pass, Swagger and README are complete, and the repository is clean enough to submit for technical review.

If an optional enhancement is omitted, the omission must not reduce compliance with any core requirement and must be documented.

Do not add unrequested deployment infrastructure or unrelated features merely to increase project size.

---

## 22. Source Traceability

The original assignment requires TypeScript, PostgreSQL, RESTful APIs, database transactions for stock operations, local runnability, the specified product/warehouse/stock UI, a Git repository, README, schema/migrations, and lists logging, authentication, and tests as optional enhancements. The original assignment does not prescribe the framework, ORM, frontend technology, authentication mechanism, detailed stock rules, or UI library; those choices are specified in this PRD based on the candidate's explicit selections. fileciteturn0file0L35-L61

The assignment deadline is three days from receipt of the task; this PRD therefore prioritizes a complete, reviewable implementation over optional feature expansion. fileciteturn0file0L63-L64
