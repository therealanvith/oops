# Project Timeline, Day-by-Day Plan & MoSCoW Scope

## 1. Project Overview & Deadlines

- **Start Date**: 8 November 2026
- **Final Evaluation / Submission Deadline**: 22 November 2026
- **Total Working Days**: 14 calendar days (~12 focused working days)
- **Team Size**: 5 engineers (Owners 1 through 5)

---

## 2. MoSCoW Scope Breakdown

To ensure delivery of a robust, high-scoring project without burning out, scope is explicitly partitioned into **MUST**, **SHOULD**, and **COULD**:

### MUST HAVE (Strict MVP for Full Course Evaluation)
- [x] **Framework-Free Domain Core**: Pure Java 21 domain package (`com.servicedesk.domain`) passing ArchUnit isolation tests.
- [x] **State Pattern Incident Lifecycle**: `REPORTED` -> `ASSIGNED` -> `IN_PROGRESS` -> `PENDING_INFO` -> `RESOLVED` -> `CLOSED` + `CANCELLED` with forbidden transition guards.
- [x] **Dynamic Priority Calculation Strategy**: $3 \times 3$ Matrix strategy combining Impact and Urgency.
- [x] **2+ Assignment Strategies**: `RoundRobinAssignmentStrategy` and `LeastLoadedAssignmentStrategy`.
- [x] **SLA Window & Deadlines**: Priority-based response/resolution countdown with pause during `PENDING_INFO`.
- [x] **2+ Notification Channels**: `InAppNotificationChannel` and simulated `EmailGatewayAdapter`.
- [x] **Immutable Audit Trail**: Append-only log recording all lifecycle actions, actors, and state transitions.
- [x] **5+ Search Filters**: Status, priority, category, assignee, and SLA status.
- [x] **2+ Intelligent Features**:
  1. Jaccard similarity detector linking past similar resolved incidents.
  2. Keyword-based category and priority auto-suggestion.
- [x] **PostgreSQL Persistence & Flyway Migrations**: Complete schema and reproducible Docker Compose environment.
- [x] **15+ Automated Test Cases**: Covering domain states, strategies, ArchUnit rules, and integration workflows.
- [x] **3 Working End-to-End Demo Workflows**: Documented in `demo-script.md`.

### SHOULD HAVE (High Priority Polish)
- [ ] **SkillMatchAssignmentStrategy**: Tiers technicians by skill set (`NETWORK`, `HARDWARE`, etc.) before falling back to least-loaded.
- [ ] **Live Interactive SLA Countdown Clock** on frontend ticket detail views.
- [ ] **In-App Toast & Notification Bell** badge for real-time user feedback.
- [ ] **Automated SLA Escalation Cron**: Background evaluator automatically triggering priority boost upon breach.

### COULD HAVE (Bonus / Innovation Stretch Goals - If Ahead of Schedule)
- [ ] Multi-file attachment upload simulation for diagnostics.
- [ ] Chart.js / Recharts analytics dashboard showing technician resolution velocity.
- [ ] Export audit history to downloadable CSV / PDF.

---

## 3. Day-by-Day Execution Schedule (8 Nov – 22 Nov 2026)

| Date | Phase & Focus | Deliverables & Milestone Goals | Primary Owners |
| :--- | :--- | :--- | :--- |
| **Sun, 8 Nov** | **Phase 0: Design & Specification** | Finalize all UML diagrams, requirements, API spec, and database design. Align team responsibilities. | All Owners |
| **Mon, 9 Nov** | **Phase 1: Domain Models & Patterns** | Implement pure domain core: `Incident`, `IncidentState` (7 states), `IncidentFactory`, `PriorityStrategy`. | Owner 1, Owner 5 |
| **Tue, 10 Nov** | **Phase 1: Domain Strategies & Events** | Implement `AssignmentStrategy` (RoundRobin & LeastLoaded), `SimilarityStrategy` (Jaccard), and domain events. | Owner 1, Owner 5 |
| **Wed, 11 Nov** | **Phase 1: Unit & ArchUnit Tests** | Complete comprehensive domain test suite (10+ pure unit tests for states, invariants, strategies, and ArchUnit isolation). | Owner 1, Owner 4 |
| **Thu, 12 Nov** | **Phase 2: Database & Persistence Adapters** | Implement Flyway migrations V2 & V3; build JPA entities and repository adapters (`JpaIncidentRepositoryAdapter`). | Owner 4 |
| **Fri, 13 Nov** | **Phase 2: Application Services & REST API** | Implement `IncidentApplicationService`, REST controllers (`IncidentController`, `AuthController`), and DTO validation. | Owner 2 |
| **Sat, 14 Nov** | **Phase 2: Security & SLA Background Worker** | Configure JWT authentication, role guards (`EMPLOYEE`, `TECHNICIAN`, `ADMIN`), and scheduled SLA breach evaluator. | Owner 2, Owner 4 |
| **Sun, 15 Nov** | **Milestone 1: Backend Freeze & Verification** | All backend integration tests passing (15+ total). Verify zero domain leaks. Seed demo database with realistic tickets. | Owner 2, Owner 4 |
| **Mon, 16 Nov** | **Phase 3: Frontend Foundation & Auth** | Next.js 15 App Router setup, API client, JWT token storage, login view, and navigation layout. | Owner 3 |
| **Tue, 17 Nov** | **Phase 3: Incident Reporting & Worklists** | Incident creation form (with dynamic priority preview), Employee ticket list, and Technician queue view. | Owner 3 |
| **Wed, 18 Nov** | **Phase 3: Ticket Details, States & Comments** | Ticket detail page with interactive state transitions, diagnostic comment thread, and similarity suggestions. | Owner 3 |
| **Thu, 19 Nov** | **Phase 3: 5+ Search Filters & Audit UI** | Implement 5+ search filters and timeline view of immutable audit logs. | Owner 3, Owner 2 |
| **Fri, 20 Nov** | **Phase 4: Full Stack Integration & Dry Run** | Connect frontend with backend in Docker. Verify complete flow of 3 demo scenarios. Bug fixing and edge-case testing. | All Owners |
| **Sat, 21 Nov** | **Phase 4: Documentation & Demo Rehearsal** | Finalize `README.md`, `demo-script.md`, slides, and record demo video walkthrough fallback. | Owner 5, All Owners |
| **Sun, 22 Nov** | **Final Milestone: Project Submission** | Tag `v1.0.0-final`, submit GitHub repository, documentation, and conduct live evaluator demonstration. | All Owners |
