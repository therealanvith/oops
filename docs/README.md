# ServiceDesk Project Documentation (Phase 0: Design Specification)

**Project**: BITS ServiceDesk: Intelligent IT Service Management & Incident Resolution System  
**Course**: Object-Oriented Programming (Evaluation Deadline: 22 Nov 2026)

This directory contains technical and design specifications for **BITS ServiceDesk**, structured around clean object-oriented architecture and Gang of Four (GoF) design patterns.

---

## 1. System Documentation Index

| Document | Description |
| :--- | :--- |
| **[Problem Analysis](problem-analysis.md)** | Problem definition, stakeholder analysis, technical challenges, proposed solution, and foundational assumptions. |
| **[Requirements & Business Rules](requirements.md)** | Functional (FR) & Non-Functional (NFR) requirements, roles matrix, priority formula, SLA matrix, allowed transitions, and escalation rules. |
| **[Architecture & Package Layout](architecture.md)** | Hexagonal / Clean Architecture overview, 5 named owner areas, and full class/package layout. |
| **[Design Patterns Catalog](design-patterns.md)** | Comprehensive catalog of GoF patterns: State, Strategy, Observer, Factory, Repository, Adapter. |
| **[REST API Specification](api-spec.md)** | REST endpoints per role, HTTP verbs, request/response DTOs, and RBAC rules. |
| **[Database Schema Design](database.md)** | Relational schema, PostgreSQL tables, indexing strategies, and Flyway migration plan. |
| **[Project Plan & MoSCoW Scope](project-plan.md)** | Day-by-day plan (8 Nov – 22 Nov), milestone targets, and explicit MUST / SHOULD / COULD scope. |
| **[Risks & Assumptions](risks-and-assumptions.md)** | Technical risk mitigation strategies and key assumptions for confirmation. |
| **[Test Cases Specification](test-cases.md)** | Specification of 15+ automated test cases (Domain state tests, strategy tests, ArchUnit, and integration tests). |
| **[Course Demo Script](demo-script.md)** | Step-by-step walkthrough script for the 3 course evaluation workflows. |

---

## 2. Mermaid Visual Models (`docs/diagrams/`)

- **[Class Diagram](diagrams/class-diagram.mmd)**: Domain classes, attributes, methods, interfaces, inheritance, composition, and GoF design pattern locations.
- **[State Diagram](diagrams/state-diagram.mmd)**: Incident lifecycle state machine, needs-info loop, SLA pause/resume, and forbidden transition guards.
- **[Use Case Diagram](diagrams/use-case-diagram.mmd)**: Use cases for Employee, Technician, Administrator, and System Scheduler.
- **[Entity-Relationship (ER) Diagram](diagrams/er-diagram.mmd)**: Database entities, primary/foreign keys, relationships, and constraints.
- **[Sequence Diagram](diagrams/sequence-diagram.mmd)**: End-to-end execution sequence (Report incident -> Classify -> Prioritize -> Assign -> Notify -> Audit).
