# Problem Analysis

**Project**: BITS ServiceDesk: Intelligent IT Service Management & Incident Resolution System

---

## 1. Executive Summary & Problem Context
In modern academic and enterprise IT environments, organizations struggle with unmanaged, unstructured incident reporting. When IT infrastructure failures occur—ranging from classroom audio-visual malfunctions, laboratory workstation hardware faults, to enterprise network outages and LMS (Learning Management System) credential issues—incidents are typically reported over ad-hoc email threads, walk-ins, or instant messaging.

This unstructured workflow results in:
- **Severe Routing Latency**: Tickets sit in unmonitored inboxes before being dispatched to relevant technicians.
- **Subjective & Inconsistent Prioritization**: End-users arbitrarily mark non-critical requests as "Emergency", while severe infrastructure bottlenecks remain unprioritized.
- **Unclear Accountability & SLA Violations**: Without defined Service Level Agreements (SLAs) and automated tracking, deadlines are breached without alerts or managerial visibility.
- **Lost Audit Trails**: Changes in ticket status, assignment reallocations, and diagnostic steps are not immutably logged, complicating post-incident analysis and compliance.
- **Repetitive Work & Information Silos**: Technicians repeatedly troubleshoot duplicate issues from scratch without automated similarity detection or historical resolution reuse.

---

## 2. Stakeholder Analysis

| Stakeholder Role | Primary Responsibilities | Core Pain Points | System Benefits |
| :--- | :--- | :--- | :--- |
| **Employee / End-User**<br>*(Student, Faculty, Staff)* | Reports IT problems, provides diagnostic info, verifies resolution. | No visibility into progress; slow resolutions; cumbersome communication loops. | Intuitive portal, self-service tracking, instant notifications, transparent SLA expectations. |
| **IT Support Technician**<br>*(L1 Support, L2 Specialist)* | Investigates incidents, diagnoses root causes, updates progress, resolves tickets. | Overloaded queues; manual ticket sorting; unclear prioritization; lack of context. | Automated workload-balanced assignment; clear priority ranking; similar incident recommendations. |
| **IT Administrator / Lead**<br>*(IT Manager, System Admin)* | Monitors operational metrics, configures SLAs/routing, manages staff and escalations. | Blind spots during outages; manual escalation overhead; difficulty evaluating technician performance. | Centralized dashboard, automated SLA breach escalations, complete immutable audit trails. |
| **Course Evaluator**<br>*(Faculty / Teaching Staff)* | Evaluates architecture, OOP design pattern fidelity, test coverage, and working demo. | Difficulty assessing whether OOP principles are actually driving the runtime versus being superficial. | Clean hexagonal architecture, framework-free pure domain models, explicit GOF patterns, 15+ test cases. |

---

## 3. Operational Challenges & Technical Obstacles

1. **Balancing Technical Rigor with Framework Isolation**:
   - Spring Boot and ORM frameworks (Hibernate/JPA) encourage mixing entity annotations, lifecycle hooks, and database concerns into domain classes.
   - *Challenge*: The domain layer (`com.servicedesk.domain`) must strictly remain pure Java without framework imports while seamlessly integrating with Spring Data repositories and web controllers.
2. **Dynamic Priority Calculation**:
   - Incident urgency and impact must be systematically combined rather than manually guessed.
   - *Challenge*: Changes in business impact or business hours should support pluggable calculation formulas (Strategy Pattern).
3. **Multi-Strategy Technician Assignment**:
   - Support teams have different operational modes: round-robin for equal distribution, skill-based for specialized incidents (Network vs. Hardware vs. Software), and least-loaded for balancing active ticket burdens.
   - *Challenge*: Assignment mechanisms must be dynamically swappable at runtime without altering core incident logic.
4. **Finite State Lifecycle & Edge Cases**:
   - Incident lifecycles are strict state machines (`REPORTED`, `ASSIGNED`, `IN_PROGRESS`, `PENDING_INFO`, `RESOLVED`, `CLOSED`, `CANCELLED`).
   - *Challenge*: Illegal transitions (e.g. resolving without being in progress, or modifying closed tickets) must be structurally impossible through the State Pattern.
5. **Timeline Constraints**:
   - The team has ~12 working days until the 22 November 2026 deadline.
   - *Challenge*: Preventing scope creep by focusing on a robust, well-tested MVP and strictly separating MUST vs. COULD features.

---

## 4. Proposed Solution: ServiceDesk

**ServiceDesk** is an intelligent, domain-driven IT Service Management (ITSM) application structured around clean object-oriented architecture and Gang of Four (GoF) design patterns:

- **Framework-Free Domain Core**: All business entities (`Incident`, `User`, `Priority`, `SlaWindow`) and logic reside in pure Java, insulated from Spring and database concerns.
- **Pluggable Strategies**:
  - *Priority Calculation*: Pluggable strategies evaluate Impact and Urgency matrices.
  - *Automated Assignment*: Configurable strategies (Round-Robin, Least-Loaded, Skill-Match).
  - *Intelligent Similarity*: Jaccard token similarity for automated deduplication and resolution suggestion.
- **State Pattern Lifecycle**: Dedicated state classes govern incident transitions, encapsulating valid behavior and rejecting unauthorized state jumps.
- **Observer-Driven Events & Audit Trail**: Domain events (`IncidentCreatedEvent`, `IncidentStatusChangedEvent`, `SlaBreachedEvent`) publish asynchronously to notify subscribers and append an immutable audit log.
- **Responsive Next.js Frontend**: A fast, accessible web interface communicating with the REST API using TypeScript strict typing.
- **Dockerized Infrastructure**: One-command reproducibility via Docker Compose running PostgreSQL and containerized services.

---

## 5. Architectural & Domain Assumptions

1. **Single-Tenant Deployment**: The system operates within a single enterprise/campus perimeter; multi-tenant schema partitioning is out of scope.
2. **Clock Source**: All time calculations (SLA elapsed time, breach deadlines, audit timestamps) rely on an injected `java.time.Clock` abstraction to allow deterministic testing.
3. **Simulated Notification Gateways**: In local and test profiles, external communications (Email/SMS) are handled by logger adapters or in-memory notification inboxes; no live SMTP server credentials required.
4. **In-Memory & Embedded Text Analysis**: For the intelligent similarity feature, lightweight NLP/token-based Jaccard similarity executes locally within the JVM without external commercial API dependencies.
5. **Role Orthogonality**: A user possesses one primary operational role at any given time (`EMPLOYEE`, `TECHNICIAN`, `ADMINISTRATOR`).
