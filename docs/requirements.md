# Requirements & Business Rules Specification

**Project**: BITS ServiceDesk: Intelligent IT Service Management & Incident Resolution System

---

## 1. Functional Requirements (FR)

### 1.1 User Management & Authentication (FR-USER)
- **FR-USER-01**: The system must support three distinct user roles: `EMPLOYEE`, `TECHNICIAN`, and `ADMINISTRATOR`.
- **FR-USER-02**: The system must securely authenticate users via standard credentials and JWT (JSON Web Tokens).
- **FR-USER-03**: Administrators must be able to list, activate, deactivate, and view technician skill profiles (e.g., `NETWORK`, `HARDWARE`, `SOFTWARE`, `ACCESS`).

### 1.2 Incident Reporting & Management (FR-INC)
- **FR-INC-01**: Employees must be able to report an incident with a title, description, category (`NETWORK`, `HARDWARE`, `SOFTWARE`, `ACCESS`), impact, and urgency.
- **FR-INC-02**: Incidents must possess a unique identifier (UUID and human-readable ticket number, e.g., `INC-1001`).
- **FR-INC-03**: Incidents must support diagnostic comments added by the reporter, assigned technician, or administrator.
- **FR-INC-04**: Incidents must enforce strict lifecycle state transitions via the State Pattern.

### 1.3 Dynamic Priority Calculation (FR-PRIO)
- **FR-PRIO-01**: The system must calculate incident priority dynamically using a pluggable `PriorityCalculationStrategy`.
- **FR-PRIO-02**: Priority is derived from the combination of **Impact** (organizational scope of disruption) and **Urgency** (time criticality of resolution).
- **FR-PRIO-03**: Default calculation maps inputs to 4 priority levels: `P1_CRITICAL`, `P2_HIGH`, `P3_MEDIUM`, and `P4_LOW`.
- **FR-PRIO-04**: Administrators and lead technicians can override computed priority with a documented justification.

### 1.4 Automated Technician Assignment (FR-ASGN)
- **FR-ASGN-01**: The system must support at least two pluggable assignment strategies implementing `AssignmentStrategy`:
  - **RoundRobinAssignmentStrategy**: Distributes incidents sequentially among available technicians.
  - **LeastLoadedAssignmentStrategy**: Assigns incidents to the technician currently holding the fewest active (non-resolved) tickets.
  - **SkillMatchAssignmentStrategy**: Matches incident category with technician skills, falling back to least-loaded technician if ties occur.
- **FR-ASGN-02**: The active assignment strategy must be configurable at runtime by administrators without restarting the application.
- **FR-ASGN-03**: Technicians and administrators may manually reassign an incident.

### 1.5 Service Level Agreement (SLA) & Automated Escalation (FR-SLA)
- **FR-SLA-01**: Every incident must be bound to an SLA target based on its priority level, defining **Response Deadline** and **Resolution Deadline**.
- **FR-SLA-02**: The system must evaluate SLA timers against an injected `Clock` bean to determine SLA status (`WITHIN_SLA`, `WARNING_BREACH_IMMINENT`, `BREACHED`).
- **FR-SLA-03**: When an SLA resolution deadline is breached:
  - An `SlaBreachedEvent` is published.
  - The incident priority is automatically escalated by one tier (e.g., P3 -> P2), unless already P1.
  - An urgent notification is dispatched to the administrator and assigned technician.

### 1.6 Multi-Channel Notification System (FR-NOTIF)
- **FR-NOTIF-01**: The system must support at least two notification delivery channels implementing `NotificationChannel`:
  - **InAppNotificationChannel**: Persists notifications to the database for display in the user's web UI.
  - **EmailNotificationChannel**: Generates formatted email notifications (simulated via console/logger in dev/test, SMTP-ready in production).
- **FR-NOTIF-02**: Notifications must be triggered automatically via domain event observers on:
  - Incident creation (to reporter and assigned technician).
  - Status change (e.g., when technician requests more info or marks resolved).
  - SLA breach or escalation.

### 1.7 Audit Trail & Compliance (FR-AUDIT)
- **FR-AUDIT-01**: Every mutating action on an incident (creation, status update, priority change, reassignment, comment) must generate an immutable audit log entry.
- **FR-AUDIT-02**: Audit records must store: `timestamp`, `incidentId`, `actorId`, `actionType`, `oldValue`, `newValue`, and `remarks`.
- **FR-AUDIT-03**: Audit trails must be read-only and ordered chronologically.

### 1.8 Search & Filter Subsystem (FR-SEARCH)
- **FR-SEARCH-01**: Technicians and administrators must be able to filter incidents using at least **5 distinct criteria**:
  1. Status (single or multi-status, e.g., `IN_PROGRESS`, `PENDING_INFO`)
  2. Priority (`P1_CRITICAL`, `P2_HIGH`, `P3_MEDIUM`, `P4_LOW`)
  3. Category (`NETWORK`, `HARDWARE`, `SOFTWARE`, `ACCESS`)
  4. Assigned Technician ID
  5. SLA Status (`WITHIN_SLA`, `BREACHED`)
  6. Free-text search across Title and Description.

### 1.9 Intelligent Features (FR-INTEL)
- **FR-INTEL-01 (Duplicate / Similar Incident Detection)**: When an incident is logged, the system computes similarity scores against historical incidents using a token-based Jaccard similarity strategy (`SimilarityStrategy`). If similarity exceeds threshold ($\ge 0.6$), the system flags the incident and links relevant past resolutions.
- **FR-INTEL-02 (Automated Category & Priority Suggestion)**: Analyzes incident text for high-impact keywords (e.g., "outage", "fire", "lab offline", "entire campus") to automatically elevate suggested impact and category.

---

## 2. Non-Functional Requirements (NFR)

- **NFR-01 (Domain Isolation)**: All core business models and algorithms in `com.servicedesk.domain` must be pure Java 21 with zero dependencies on Spring Boot, JPA, or web annotations.
- **NFR-02 (Performance)**: Common API queries (fetching incident list with filters) must respond within $< 200\text{ ms}$ for datasets up to 10,000 records.
- **NFR-03 (Determinism & Testability)**: All date and time calculations must inject `java.time.Clock` to guarantee 100% reproducible unit and integration tests.
- **NFR-04 (Extensibility)**: New notification channels, priority algorithms, and assignment strategies must be addable by implementing the corresponding interface without modifying existing core classes (Open/Closed Principle).
- **NFR-05 (Security)**: Endpoints must enforce role-based access control (RBAC). Employees can only read their own submitted incidents, while Technicians and Admins have wider access.

---

## 3. Roles & Permissions Matrix

| Capability / Action | Employee | Technician | Administrator |
| :--- | :---: | :---: | :---: |
| Report New Incident | **Yes** | **Yes** | **Yes** |
| View Own Incidents | **Yes** | **Yes** | **Yes** |
| View All Active Incidents | No | **Yes** | **Yes** |
| Assign / Reassign Incident | No | **Yes** (within tier) | **Yes** (unrestricted) |
| Start Work (`IN_PROGRESS`) | No | **Yes** (if assigned) | **Yes** |
| Request More Info (`PENDING_INFO`) | No | **Yes** | **Yes** |
| Provide Info / Resume | **Yes** (own ticket) | **Yes** | **Yes** |
| Mark Resolved | No | **Yes** | **Yes** |
| Close Incident (Verification) | **Yes** (own ticket) | No | **Yes** |
| Cancel Incident | **Yes** (if `REPORTED`) | No | **Yes** |
| Configure Assignment Strategy | No | No | **Yes** |
| View Full Audit Trail | No | **Yes** | **Yes** |

---

## 4. Business Rules & Policies

### 4.1 Priority Determination Matrix
Priority is derived from a $3 \times 3$ matrix of **Impact** (High, Medium, Low) and **Urgency** (High, Medium, Low):

$$\text{Priority} = f(\text{Impact}, \text{Urgency})$$

| Impact \ Urgency | `HIGH` (Immediate) | `MEDIUM` (High) | `LOW` (Normal) |
| :--- | :---: | :---: | :---: |
| **`HIGH` (Enterprise / Multi-user / Lab Outage)** | **P1 - CRITICAL** | **P1 - CRITICAL** | **P2 - HIGH** |
| **`MEDIUM` (Departmental / Workstation Group)** | **P2 - HIGH** | **P3 - MEDIUM** | **P3 - MEDIUM** |
| **`LOW` (Single User / Minor Inconvenience)** | **P3 - MEDIUM** | **P4 - LOW** | **P4 - LOW** |

### 4.2 Service Level Agreement (SLA) Matrix

| Priority Level | Target First Response Time | Target Resolution Time | Warning Threshold (% of Target) | Escalation Action |
| :--- | :---: | :---: | :---: | :--- |
| **P1 - CRITICAL** | $\le 15\text{ minutes}$ | $\le 2\text{ hours}$ | $75\%\ (90\text{ min})$ | Notify Admin immediately; assign Senior Specialist. |
| **P2 - HIGH** | $\le 30\text{ minutes}$ | $\le 4\text{ hours}$ | $75\%\ (180\text{ min})$ | Escalate to P1 if unassigned at $50\%$ deadline. |
| **P3 - MEDIUM** | $\le 2\text{ hours}$ | $\le 8\text{ hours}$ | $80\%\ (384\text{ min})$ | Alert assigned technician; bump priority to P2. |
| **P4 - LOW** | $\le 4\text{ hours}$ | $\le 24\text{ hours}$ | $85\%\ (1224\text{ min})$ | Re-queue for next available shift. |

### 4.3 Incident Lifecycle State Transitions

```
[REPORTED] ────assign────> [ASSIGNED] ────start_work────> [IN_PROGRESS]
    │                          │                               │    ▲
    │                          │                               │    │
    │ cancel                   │ cancel           request_info │    │ provide_info
    ▼                          ▼                               ▼    │
[CANCELLED]                [CANCELLED]                 [PENDING_INFO]
                                                               │
                                                               │ resolve
                                                               ▼
[CLOSED] <──────verify_and_close─────── [RESOLVED]
```

- **Needs-Info Loop**:
  - A technician transitions an incident from `IN_PROGRESS` to `PENDING_INFO` when clarification or user action is needed.
  - While in `PENDING_INFO`, the SLA resolution timer is **paused** to prevent penalizing support teams for customer response latency.
  - When the employee submits the requested info, the state returns to `IN_PROGRESS` and SLA timing resumes.
- **Resolution & Closure**:
  - Technicians mark tickets as `RESOLVED` with mandatory resolution notes and root-cause classification.
  - The employee confirms resolution to move it to `CLOSED`. If unconfirmed after 48 hours, the system auto-closes it.
- **Strict Invariants & Forbidden Transitions**:
  - `CLOSED` and `CANCELLED` are terminal states; no further transitions are allowed.
  - An incident cannot transition directly from `REPORTED` to `RESOLVED` or `CLOSED` without passing through `IN_PROGRESS`.
  - Reassignment is prohibited once an incident is `RESOLVED` or `CLOSED`.
