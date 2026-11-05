# Contributing to ServiceDesk

Thank you for contributing to the ServiceDesk Incident Resolution System. All team members must adhere to the following workflow, architecture, and quality rules.

---

## 1. Core Architectural Rule: Domain Isolation

> **CRITICAL**: The backend **domain package must stay framework-free**.

- The `com.servicedesk.domain` package and all its subpackages must contain **pure Java only**.
- Never import Spring (`org.springframework.*`), JPA / Jakarta Persistence (`jakarta.persistence.*`), or classes from `infrastructure` or `api`.
- Domain models encapsulate business logic, domain rules, state invariants, value objects, and domain events.
- Persistence details, annotations, Spring components, and HTTP transport logic belong strictly in `infrastructure` or `api`.
- This rule is enforced automatically on every build by ArchUnit tests (`DomainIsolationTest`). Builds violating this will fail CI.

---

## 2. Git Hooks & Automated Checks (Lefthook)

We use **Lefthook** to maintain code quality locally and prevent broken code or leaked secrets from reaching GitHub.

### Installed Hooks
- **`pre-commit`** (runs in parallel):
  - **`frontend-lint`**: Runs Biome on staged frontend files (`frontend/**/*.{ts,tsx,js,jsx,json,css}`). Formatting and import order issues are automatically repaired and re-staged (`stage_fixed: true`).
  - **`frontend-typecheck`**: Runs `bun run typecheck` across the frontend TypeScript project.
  - **`block-secrets`**: Executes `scripts/check-staged-secrets.ts`. Blocks any staged `.env` file (except `.env.example`) or staged commits introducing private keys or hardcoded secrets.
- **`pre-push`**:
  - **`backend-tests`**: Runs `mvn -B -q test` in `backend/` when commits touch backend files (warns gracefully if `mvn` is missing locally).
  - **`frontend-checks`**: Runs `bun run lint` and `bun run typecheck` in `frontend/` when commits touch frontend files.

### Hook Installation
Hooks install automatically after installing dependencies in `frontend/`:
```bash
cd frontend
bun install
```
*Manual fallback from repository root*:
```bash
bunx lefthook install
```

### Running Hooks Manually
To verify your staged changes before committing:
```bash
bunx lefthook run pre-commit
```
To run the push checks manually:
```bash
bunx lefthook run pre-push
```

### Bypass Disclaimer
While `git commit --no-verify` or `git push --no-verify` can bypass local hooks in emergencies, **GitHub Actions CI is the definitive gate**. Any PR failing lint, typecheck, or tests will be blocked from merging.

### Troubleshooting
- **Hooks not running**: Ensure you ran `bun install` inside `frontend/` or `bunx lefthook install` at root. Verify `.git/hooks/pre-commit` exists.
- **Windows line endings**: Git on Windows must not convert shell scripts to CRLF. Verify `.gitattributes` has `eol=lf` for shell and hook scripts.
- **Git GUI / IDE PATH issues**: Some graphical Git clients do not inherit terminal PATH containing Bun. Ensure `bun` is available in your system PATH or commit via terminal.

---

## 3. Branching Strategy

- **Direct pushes to `main` are strictly forbidden.**
- All work must be conducted on feature or bugfix branches branched off `main`:
  - `feat/<short-description>`: New features or domain components (e.g., `feat/incident-lifecycle`)
  - `fix/<short-description>`: Bug fixes and patches (e.g., `fix/health-response-clock`)
  - `docs/<short-description>`: Documentation changes (e.g., `docs/architecture-diagram`)
  - `chore/<short-description>`: Build, CI, or dependency adjustments (e.g., `chore/git-hooks`)

---

## 4. Pull Request Requirements

1. Every pull request must target `main`.
2. Each PR requires **at least 1 peer review and approval** from a team member before merging.
3. All GitHub Actions CI checks (`backend`, `frontend`, `docker`) must pass.
4. Merge using "Squash and merge" or "Rebase and merge" to keep Git history clean.

---

## 5. Automated Code Review (CodeRabbit)

We use **CodeRabbit** for AI-assisted pull request reviews:
- **Scope & Frequency**: CodeRabbit analyzes and comments on every open pull request targeting `main`.
- **Advisory Role**: All CodeRabbit suggestions and findings are strictly **advisory**. A human teammate must still review and approve the pull request.
- **CI is the Real Gate**: CodeRabbit comments do not block merging directly; GitHub Actions CI (`backend`, `frontend`, `docker`) remains the true enforcement gate.
- **Security & Privacy**: **Never paste real secrets, credentials, or private keys into PR comments or chat conversations with the bot.**
- **Useful Commands**:
  - `@coderabbitai review`: Requests a fresh incremental or full review of the PR.
  - `@coderabbitai summary`: Generates or updates the high-level summary of PR changes.
  - `@coderabbitai configuration`: Displays the currently active CodeRabbit configuration.

---

## 6. Commit Message Style (Recommendation)

We recommend using clear, conventional commit messages:
```text
<type>: <short imperative description>
```
*Examples*:
- `feat: add incident state machine`
- `fix: handle null technician assignment`
- `docs: update class diagram`
- `chore: add lefthook git hooks`

*Note*: This style is recommended for readability; it is not strictly rejected by a commit-msg hook.

---

## 7. Local Pre-Push Checklist

### Backend Checks
From the `backend/` directory:
```bash
mvn -B clean verify
```

### Frontend Checks
From the `frontend/` directory:
```bash
bun run lint
bun run typecheck
bun run build
```
Auto-fix formatting:
```bash
bun run lint:fix
```

### Security & Secrets
- Never commit `.env` or files containing real secrets.
- Verify `git status` before committing.
