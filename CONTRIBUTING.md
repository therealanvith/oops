# Contributing to I-ITSM

Thank you for contributing to the Intelligent IT Service Management & Incident Resolution System (I-ITSM) course project. All team members must adhere to the following workflow and design rules.

---

## 1. Core Architectural Rule: Domain Isolation

> **CRITICAL**: The backend **domain package must stay framework-free**.

- The `com.iitsm.domain` package and all its subpackages must contain **pure Java only**.
- Never import Spring (`org.springframework.*`), JPA / Jakarta Persistence (`jakarta.persistence.*`), or classes from `infrastructure` or `api`.
- Domain models encapsulate business logic, domain rules, state invariants, value objects, and domain events.
- Persistence details, annotations, Spring components, and HTTP transport logic belong strictly in `infrastructure` or `api`.
- This rule is enforced automatically on every build by ArchUnit tests (`DomainIsolationTest`). Builds violating this will fail CI.

---

## 2. Branching Strategy

- **Direct pushes to `main` are strictly forbidden.**
- All work must be conducted on feature or bugfix branches branched off `main`:
  - `feat/<short-description>`: New features or domain components (e.g., `feat/incident-lifecycle`)
  - `fix/<short-description>`: Bug fixes and patches (e.g., `fix/health-response-clock`)
  - `docs/<short-description>`: Documentation changes (e.g., `docs/architecture-diagram`)
  - `chore/<short-description>`: Build, CI, or dependency adjustments (e.g., `chore/biome-upgrade`)

---

## 3. Pull Request Requirements

1. Every pull request must target `main`.
2. Each PR requires **at least 1 peer review and approval** from a team member before merging.
3. All GitHub Actions CI checks (`backend`, `frontend`, `docker`) must pass.
4. Merge using "Squash and merge" or "Rebase and merge" to keep Git history linear and clean.

---

## 4. Commit Message Guidelines

Write clear, concise commit messages following the Conventional Commits style:
```text
<type>(<scope>): <short imperative description>

[optional body explaining motivation and details]
```
Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
Example:
```text
feat(incident): add state transition validation to incident domain entity
```

---

## 5. Local Pre-Push Checklist

Before pushing commits or opening a PR, run the local verification suite:

### Backend Checks
From the `backend/` directory:
```bash
mvn -B clean verify
```
Must pass all unit tests and ArchUnit domain isolation assertions.

### Frontend Checks
From the `frontend/` directory (use **Bun** exclusively):
```bash
bun run lint
bun run typecheck
bun run build
```
If formatting or import order needs fixing:
```bash
bun run lint:fix
```

### Security & Secrets
- Never commit `.env` or any file containing API keys, database passwords, or JWT secrets.
- Verify `git status` before committing.

