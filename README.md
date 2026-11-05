# ServiceDesk

Intelligent IT Service Management & Incident Resolution System. A production-grade base template for a 5-person student team building an Object-Oriented Programming (OOP) course project.

The system features a **stateless Spring Boot 3 REST API** coupled to a **Next.js (App Router)** client. To satisfy strict OOP grading criteria, the backend domain layer is completely decoupled and framework-free.

---

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.3.5 | Stateless REST API (`/api/v1`), Spring Data JPA, Security, Actuator |
| **Domain Layer** | Pure Java 21 | Framework-free OOP domain model guarded by ArchUnit |
| **Database** | PostgreSQL 16 / Supabase | Local via Docker Compose; cloud via Supabase Postgres |
| **Migrations** | Flyway | Versioned database schema evolution (`V1__baseline.sql`) |
| **Frontend** | Next.js 15, React 18, TypeScript | Strict typing (`strict`, `noUncheckedIndexedAccess`), App Router |
| **Frontend Tooling** | Bun 1.x & Biome 1.9.4 | Single fast runtime/package manager & unified linter/formatter |
| **Git Hooks** | Lefthook | Parallel pre-commit lint/typecheck/secret scanning & pre-push verification |
| **DevOps** | Docker, Docker Compose, GitHub Actions | Multi-stage production container builds, CI pipelines |
| **Testing** | JUnit 5, Mockito, ArchUnit | Fast in-memory H2 tests, architectural boundary verification |

---

## Prerequisites

Ensure the following tools are installed on your workstation:
1. **Java Development Kit (JDK) 21**: Recommended distribution: [Eclipse Temurin 21](https://adoptium.net/).
2. **Bun** (>= 1.1): [bun.sh](https://bun.sh/) (used exclusively for frontend package management, script execution, and Git hooks).
3. **Docker & Docker Compose**: [Docker Desktop](https://www.docker.com/).
4. **Apache Maven** (Optional if running via Docker/CI).

---

## Quickstart (Full Stack via Docker)

1. **Clone and navigate to repository root**:
   ```bash
   git clone <repo-url>
   cd servicedesk
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Install frontend dependencies & activate Git hooks**:
   ```bash
   cd frontend && bun install && cd ..
   ```

4. **Build and launch all services**:
   ```bash
   docker compose up --build
   ```

5. **Access services**:
   - Frontend UI: [http://localhost:3000](http://localhost:3000)
   - Backend Health API: [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)
   - Spring Boot Actuator: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
   - PostgreSQL Database: `localhost:5432` (`servicedesk` / `servicedesk_user` / `servicedesk_dev_password`)

---

## Git Hooks & Quality Checks (Lefthook)

Lefthook automatically validates your work before it enters git history:
- **`pre-commit`**: Automatically formats staged files with Biome, checks TypeScript types, and prevents staging secret files (`.env`) or private keys.
- **`pre-push`**: Runs backend tests (`mvn -B -q test`) and frontend checks before code is sent to the remote.

To run hooks manually:
```bash
bunx lefthook run pre-commit
bunx lefthook run pre-push
```

---

## Local Development & Quality Checks

### Backend Checks
From the `backend/` directory:
```bash
# Run unit, integration, and ArchUnit architecture tests
mvn -B verify
```
*Note*: Tests execute against an embedded H2 database and do not require Docker.

### Frontend Checks
From the `frontend/` directory (use **Bun** exclusively):
```bash
# Install dependencies
bun install

# Check formatting, lint rules, and import ordering
bun run lint

# Auto-fix formatting and safe lint problems
bun run lint:fix

# Run strict TypeScript compiler verification
bun run typecheck

# Build Next.js standalone bundle
bun run build

# Start Next.js local development server
bun run dev
```

---

## Repository Structure

```text
servicedesk/
├── backend/                       # Spring Boot 3 REST API
│   ├── Dockerfile                 # Multi-stage JRE 21 runtime container
│   ├── pom.xml                    # Maven build configuration
│   └── src/
│       ├── main/java/com/servicedesk/
│       │   ├── ServiceDeskApplication.java
│       │   ├── domain/            # PURE JAVA ONLY: No Spring/JPA imports allowed
│       │   ├── application/       # Use-case orchestrators and application services
│       │   ├── infrastructure/    # DB persistence, Security, and external adapters
│       │   └── api/               # REST endpoints, DTOs, and global exception advice
│       ├── main/resources/        # application.yml, local, cloud, and Flyway migrations
│       └── test/                  # JUnit 5, MockMvc, and ArchUnit tests
├── frontend/                      # Next.js App Router client
│   ├── Dockerfile                 # Multi-stage Bun build + Node 22 Alpine runtime
│   ├── biome.json                 # Biome formatting and linting rules
│   ├── bun.lock                   # Committed Bun lockfile
│   ├── package.json               # Frontend dependencies and scripts
│   ├── tsconfig.json              # Strict TypeScript configuration
│   └── src/                       # UI components, layout, and typed API client
├── docs/                          # Architecture, requirements, and design documentation
├── mobile/                        # Optional mobile client stretch goal
├── scripts/                       # Developer & Git hook scripts
├── lefthook.yml                   # Git hook configuration
├── .github/workflows/ci.yml       # GitHub Actions CI pipeline
├── docker-compose.yml             # Postgres, backend, and frontend service composition
├── CONTRIBUTING.md                # Team workflow, PR rules, and domain isolation invariants
└── README.md
```

---

## Deployment Notes (Configuration Targets)

- **Backend (Render)**:
  - Root Directory: `backend`
  - Environment: Docker
  - Health check path: `/api/v1/health`
  - Provide environment variables matching `.env.example`.
- **Frontend (Vercel)**:
  - Root Directory: `frontend`
  - Framework Preset: Next.js
  - Package Manager: Bun
  - Environment variable: `NEXT_PUBLIC_API_BASE_URL` (pointing to deployed backend API).
- **Database (Supabase)**:
  - Connect using Direct Connection on port 5432 (Session mode, not the port 6543 transaction pooler).
  - Use `SPRING_PROFILES_ACTIVE=cloud` which enforces SSL encryption (`sslmode=require`).

---

## Troubleshooting

- **Frontend lint or type errors**: Run `bun run lint:fix` to auto-format files. Inspect any remaining TypeScript errors with `bun run typecheck`.
- **Domain layer ArchUnit failure**: If `DomainIsolationTest` fails, ensure no classes inside `com.servicedesk.domain` import Spring (`org.springframework.*`), JPA (`jakarta.persistence.*`), or classes from `infrastructure` or `api`.
- **Docker Compose port conflicts**: If port `5432` or `8080` is in use, modify `POSTGRES_PORT` or backend ports in your local `.env`.
