# System Architecture & Package Layout

**Project**: BITS ServiceDesk: Intelligent IT Service Management & Incident Resolution System

---

## 1. Architectural Philosophy: Hexagonal / Ports & Adapters

ServiceDesk strictly adheres to **Clean Architecture** and the **Hexagonal (Ports and Adapters)** pattern to satisfy the foundational constraint of the course:

> **The domain package (`com.servicedesk.domain`) must remain 100% framework-free (pure Java 21).**

```
+--------------------------------------------------------------------------------+
|                             API & PRESENTATION LAYER                           |
|      (Spring Web Controllers, REST DTOs, Security Filter, Next.js Frontend)    |
+--------------------------------------------------------------------------------+
                                       │
                                       ▼
+--------------------------------------------------------------------------------+
|                            APPLICATION / SERVICE LAYER                         |
|   (IncidentApplicationService, UserApplicationService, SlaScheduledTask, DTOs) |
+--------------------------------------------------------------------------------+
                                       │
                                       ▼
+--------------------------------------------------------------------------------+
|                               PURE DOMAIN CORE                                 |
|            (Incident, User, Priority, SlaWindow, State Machine,                |
|             Assignment Strategies, Priority Matrix, Domain Events)             |
+--------------------------------------------------------------------------------+
                                       ▲
                                       │
+--------------------------------------------------------------------------------+
|                             INFRASTRUCTURE ADAPTERS                            |
|       (PostgreSQL Spring Data Repositories, Flyway Migrations, JPA Entities,   |
|            Email Gateway Adapter, System Clock Configuration)                  |
+--------------------------------------------------------------------------------+
```

---

## 2. Package Layout & Ownership Matrix

To ensure clear accountability across the 5-person engineering team, every major package and subsystem is assigned to **exactly ONE named owner**:

| Area & Ownership Slot | Primary Responsibility | Target Package / Directory | Key Classes & Interfaces |
| :--- | :--- | :--- | :--- |
| **Owner 1**<br>*(Domain Core & OOP Patterns)* | Pure domain models, state machine, strategies, domain events, and factory. | `backend/src/main/java/com/servicedesk/domain/**` | `Incident`, `IncidentId`, `IncidentState` (and all 7 states), `AssignmentStrategy` (RoundRobin, LeastLoaded, SkillMatch), `PriorityCalculationStrategy`, `IncidentFactory`, `DomainEvent`. |
| **Owner 2**<br>*(API, Security & Scheduler)* | REST controllers, Spring Security JWT filters, background SLA breach evaluator, application service orchestration. | `backend/src/main/java/com/servicedesk/api/**`<br>`backend/src/main/java/com/servicedesk/application/**` | `IncidentController`, `AuthController`, `AdminController`, `IncidentApplicationService`, `SlaScheduledEvaluator`, `SecurityConfig`, `JwtAuthenticationFilter`. |
| **Owner 3**<br>*(Frontend Next.js UI & Client State)* | Next.js 15 App Router interface, Biome linting, TypeScript contracts, role dashboards, and responsive forms. | `frontend/src/**` | `app/incidents/page.tsx`, `app/incidents/[id]/page.tsx`, `components/IncidentCard.tsx`, `components/StateTimeline.tsx`, `components/SearchFilters.tsx`, `lib/api-client.ts`. |
| **Owner 4**<br>*(Persistence, DB & Test Suite)* | PostgreSQL schema, Flyway migrations, JPA entities, repository adapters, ArchUnit and integration test suites. | `backend/src/main/java/com/servicedesk/infrastructure/**`<br>`backend/src/test/**`<br>`backend/src/main/resources/db/migration/**` | `JpaIncidentRepositoryAdapter`, `IncidentJpaEntity`, `V1..V5 Flyway migrations`, `IncidentStateTest`, `DomainIsolationTest`, `AssignmentStrategyTest`, `IncidentLifecycleIntegrationTest`. |
| **Owner 5**<br>*(Docs, Intelligence & Demo Workflows)* | Intelligent similarity detection, keyword-based classifier, documentation, demo scripts, and presentation. | `backend/src/main/java/com/servicedesk/domain/intelligence/**`<br>`docs/**` | `JaccardSimilarityStrategy`, `KeywordCategoryClassifier`, `docs/*.md`, `docs/diagrams/*.mmd`, `demo-script.md`. |

---

## 3. Detailed Class & Package Structure

```text
backend/src/main/java/com/servicedesk/
├── ServiceDeskApplication.java
│
├── domain/                                          <-- OWNER 1: PURE JAVA 21 (NO FRAMEWORKS)
│   ├── incident/
│   │   ├── Incident.java                            (Aggregate Root)
│   │   ├── IncidentId.java                          (Value Object)
│   │   ├── IncidentNumber.java                      (Value Object: e.g. INC-1001)
│   │   ├── IncidentStatus.java                      (Enum)
│   │   ├── Category.java                            (Enum: NETWORK, HARDWARE, etc.)
│   │   ├── Impact.java                              (Enum: HIGH, MEDIUM, LOW)
│   │   ├── Urgency.java                             (Enum: HIGH, MEDIUM, LOW)
│   │   ├── Priority.java                            (Enum: P1_CRITICAL to P4_LOW)
│   │   ├── IncidentFactory.java                     (Factory Pattern)
│   │   ├── IncidentRepository.java                  (Domain Port Interface)
│   │   └── state/                                   (State Pattern)
│   │       ├── IncidentState.java                   (Interface)
│   │       ├── ReportedState.java
│   │       ├── AssignedState.java
│   │       ├── InProgressState.java
│   │       ├── PendingInfoState.java
│   │       ├── ResolvedState.java
│   │       ├── ClosedState.java
│   │       └── CancelledState.java
│   │
│   ├── assignment/                                  (Strategy Pattern)
│   │   ├── AssignmentStrategy.java                  (Strategy Interface)
│   │   ├── RoundRobinAssignmentStrategy.java
│   │   ├── LeastLoadedAssignmentStrategy.java
│   │   └── SkillMatchAssignmentStrategy.java
│   │
│   ├── priority/                                    (Strategy Pattern)
│   │   ├── PriorityCalculationStrategy.java         (Strategy Interface)
│   │   └── MatrixPriorityStrategy.java
│   │
│   ├── intelligence/                                <-- OWNER 5: INTELLIGENCE STRATEGY
│   │   ├── SimilarityStrategy.java                  (Strategy Interface)
│   │   └── JaccardSimilarityStrategy.java
│   │
│   ├── user/
│   │   ├── User.java                                (Entity)
│   │   ├── UserId.java                              (Value Object)
│   │   ├── Role.java                                (Enum: EMPLOYEE, TECHNICIAN, ADMIN)
│   │   └── UserRepository.java                      (Domain Port Interface)
│   │
│   ├── sla/
│   │   ├── SlaWindow.java                           (Value Object / Calculator)
│   │   ├── SlaPolicy.java                           (Value Object)
│   │   └── SlaStatus.java                           (Enum)
│   │
│   ├── audit/
│   │   ├── AuditLog.java                            (Domain Entity)
│   │   └── AuditLogRepository.java                  (Domain Port Interface)
│   │
│   ├── notification/                                (Observer / Channel Pattern)
│   │   ├── NotificationMessage.java
│   │   └── NotificationChannel.java                 (Port Interface)
│   │
│   └── event/                                       (Domain Events - Observer Pattern)
│       ├── DomainEvent.java
│       ├── DomainEventPublisher.java
│       ├── IncidentCreatedEvent.java
│       ├── IncidentStatusChangedEvent.java
│       ├── IncidentAssignedEvent.java
│       └── SlaBreachedEvent.java
│
├── application/                                     <-- OWNER 2: APPLICATION SERVICES
│   ├── IncidentApplicationService.java              (Command & Query Orchestrator)
│   ├── UserApplicationService.java
│   ├── SlaScheduledEvaluator.java                   (Background Cron: checks deadlines)
│   └── dto/
│       ├── CreateIncidentCommand.java
│       ├── AssignTechnicianCommand.java
│       └── ResolveIncidentCommand.java
│
├── api/                                             <-- OWNER 2: REST CONTROLLERS & DTOS
│   ├── IncidentController.java
│   ├── AuthController.java
│   ├── AdminController.java
│   ├── dto/
│   │   ├── CreateIncidentRequest.java
│   │   ├── IncidentDetailResponse.java
│   │   ├── IncidentSummaryResponse.java
│   │   └── ErrorResponse.java
│   └── exception/
│       └── GlobalExceptionHandler.java
│
└── infrastructure/                                  <-- OWNER 4: ADAPTERS & PERSISTENCE
    ├── persistence/
    │   ├── entity/
    │   │   ├── IncidentJpaEntity.java
    │   │   ├── UserJpaEntity.java
    │   │   └── AuditLogJpaEntity.java
    │   ├── repository/
    │   │   ├── SpringDataIncidentJpaRepository.java
    │   │   └── SpringDataUserJpaRepository.java
    │   └── adapter/
    │       ├── JpaIncidentRepositoryAdapter.java     (Implements IncidentRepository)
    │       ├── JpaUserRepositoryAdapter.java         (Implements UserRepository)
    │       └── JpaAuditLogRepositoryAdapter.java     (Implements AuditLogRepository)
    │
    ├── notification/
    │   ├── InAppNotificationChannelAdapter.java     (Implements NotificationChannel)
    │   └── EmailGatewayAdapter.java                 (Implements NotificationChannel)
    │
    ├── security/
    │   ├── SecurityConfig.java
    │   ├── JwtTokenProvider.java
    │   └── CustomUserDetailsService.java
    │
    └── config/
        └── ClockConfig.java                         (Injected java.time.Clock)
```
