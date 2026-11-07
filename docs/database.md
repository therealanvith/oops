# Database Schema & Relational Design

## 1. Schema Overview & Relational Model

The database is built on **PostgreSQL 16** with schema evolution strictly managed through versioned **Flyway migrations** (`backend/src/main/resources/db/migration/`). All primary keys use RFC 4122 UUIDs (`gen_random_uuid()` in PostgreSQL and compatible with embedded H2 for testing).

The visual entity-relationship diagram is defined in [er-diagram.mmd](diagrams/er-diagram.mmd).

---

## 2. Table Specifications

### 2.1 `users`
Stores user authentication credentials, profiles, and role assignments.
- `id` (`UUID`, PK, default `gen_random_uuid()`): Unique user ID.
- `username` (`VARCHAR(50)`, UNIQUE, NOT NULL): System login username.
- `password_hash` (`VARCHAR(255)`, NOT NULL): BCrypt hashed password.
- `full_name` (`VARCHAR(100)`, NOT NULL): Display name.
- `email` (`VARCHAR(100)`, UNIQUE, NOT NULL): Corporate or campus email address.
- `role` (`VARCHAR(30)`, NOT NULL): Role check constraint (`'EMPLOYEE', 'TECHNICIAN', 'ADMINISTRATOR'`).
- `is_active` (`BOOLEAN`, NOT NULL, default `true`): Soft activation flag.
- `created_at` (`TIMESTAMPTZ`, NOT NULL, default `now()`).
- `updated_at` (`TIMESTAMPTZ`, NOT NULL, default `now()`).

### 2.2 `user_skills`
Maps technicians to supported problem categories.
- `id` (`UUID`, PK).
- `user_id` (`UUID`, FK -> `users(id)` ON DELETE CASCADE, NOT NULL).
- `category` (`VARCHAR(50)`, NOT NULL): Category check constraint (`'NETWORK', 'HARDWARE', 'SOFTWARE', 'ACCESS'`).
- *Constraint*: `UNIQUE(user_id, category)`.

### 2.3 `incidents`
Central table representing reported issues, status, SLA tracking, and assignment.
- `id` (`UUID`, PK).
- `incident_number` (`VARCHAR(20)`, UNIQUE, NOT NULL): Human-readable ticket number (e.g. `INC-1001`).
- `title` (`VARCHAR(200)`, NOT NULL): Incident summary.
- `description` (`TEXT`, NOT NULL): Diagnostic details.
- `category` (`VARCHAR(50)`, NOT NULL): `'NETWORK', 'HARDWARE', 'SOFTWARE', 'ACCESS'`.
- `status` (`VARCHAR(30)`, NOT NULL): State pattern status (`'REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_INFO', 'RESOLVED', 'CLOSED', 'CANCELLED'`).
- `priority` (`VARCHAR(30)`, NOT NULL): Calculated priority (`'P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW'`).
- `impact` (`VARCHAR(30)`, NOT NULL): `'HIGH', 'MEDIUM', 'LOW'`.
- `urgency` (`VARCHAR(30)`, NOT NULL): `'HIGH', 'MEDIUM', 'LOW'`.
- `reporter_id` (`UUID`, FK -> `users(id)`, NOT NULL): Creator of incident.
- `assignee_id` (`UUID`, FK -> `users(id)`, NULLABLE): Assigned technician.
- `response_deadline` (`TIMESTAMPTZ`, NOT NULL): Target first response time.
- `resolution_deadline` (`TIMESTAMPTZ`, NOT NULL): Target resolution time.
- `paused_at` (`TIMESTAMPTZ`, NULLABLE): Timestamp when ticket entered `PENDING_INFO`.
- `paused_duration_seconds` (`BIGINT`, NOT NULL, default `0`): Cumulative seconds paused during `PENDING_INFO`.
- `sla_status` (`VARCHAR(30)`, NOT NULL, default `'WITHIN_SLA'`): `'WITHIN_SLA', 'WARNING_BREACH_IMMINENT', 'BREACHED'`.
- `resolution_notes` (`TEXT`, NULLABLE): Summary entered by technician upon resolution.
- `resolved_at` (`TIMESTAMPTZ`, NULLABLE).
- `closed_at` (`TIMESTAMPTZ`, NULLABLE).
- `created_at` (`TIMESTAMPTZ`, NOT NULL, default `now()`).
- `updated_at` (`TIMESTAMPTZ`, NOT NULL, default `now()`).

### 2.4 `incident_comments`
Discussion and diagnostic thread entries.
- `id` (`UUID`, PK).
- `incident_id` (`UUID`, FK -> `incidents(id)` ON DELETE CASCADE, NOT NULL).
- `author_id` (`UUID`, FK -> `users(id)`, NOT NULL).
- `comment_text` (`TEXT`, NOT NULL).
- `is_internal` (`BOOLEAN`, NOT NULL, default `false`): Internal technician-only notes.
- `created_at` (`TIMESTAMPTZ`, NOT NULL, default `now()`).

### 2.5 `incident_audit_logs`
Append-only historical ledger capturing all mutations.
- `id` (`UUID`, PK).
- `incident_id` (`UUID`, FK -> `incidents(id)` ON DELETE CASCADE, NOT NULL).
- `actor_id` (`UUID`, FK -> `users(id)`, NULLABLE): User ID or NULL for system daemon.
- `action` (`VARCHAR(50)`, NOT NULL): Action identifier (`'CREATED', 'STATUS_CHANGED', 'ASSIGNED', 'PRIORITY_OVERRIDDEN', 'SLA_BREACHED'`).
- `old_value` (`VARCHAR(100)`, NULLABLE).
- `new_value` (`VARCHAR(100)`, NULLABLE).
- `remarks` (`TEXT`, NULLABLE).
- `created_at` (`TIMESTAMPTZ`, NOT NULL, default `now()`).

### 2.6 `notifications`
In-app notification records for users.
- `id` (`UUID`, PK).
- `recipient_id` (`UUID`, FK -> `users(id)` ON DELETE CASCADE, NOT NULL).
- `incident_id` (`UUID`, FK -> `incidents(id)` ON DELETE SET NULL, NULLABLE).
- `type` (`VARCHAR(50)`, NOT NULL): Event type descriptor.
- `title` (`VARCHAR(255)`, NOT NULL).
- `message` (`TEXT`, NOT NULL).
- `is_read` (`BOOLEAN`, NOT NULL, default `false`).
- `created_at` (`TIMESTAMPTZ`, NOT NULL, default `now()`).

---

## 3. Indexing & Query Optimization Strategy

To satisfy **NFR-02** ($< 200\text{ ms}$ query response), the following indexes are specified:

1. **`idx_incidents_status_priority`**: `CREATE INDEX idx_incidents_status_prio ON incidents(status, priority);`
   - Accelerates triage queues and technician dashboards.
2. **`idx_incidents_assignee`**: `CREATE INDEX idx_incidents_assignee ON incidents(assignee_id) WHERE status NOT IN ('CLOSED', 'CANCELLED');`
   - Partial index optimizing `LeastLoadedAssignmentStrategy` lookups for active workloads.
3. **`idx_incidents_reporter`**: `CREATE INDEX idx_incidents_reporter ON incidents(reporter_id);`
   - Speeds up employee self-service "My Incidents" queries.
4. **`idx_incidents_sla_monitoring`**: `CREATE INDEX idx_incidents_sla ON incidents(sla_status, resolution_deadline) WHERE status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED');`
   - Used by the scheduled background task evaluating imminent SLA breaches.
5. **`idx_audit_incident_time`**: `CREATE INDEX idx_audit_incident_time ON incident_audit_logs(incident_id, created_at ASC);`
   - Ensures instantaneous retrieval of chronological ticket audit histories.

---

## 4. Flyway Migration Plan

- **`V1__baseline.sql`**: Initial empty schema verification table.
- **`V2__create_users_and_skills.sql`**: Core user tables, password hashes, and skill mappings.
- **`V3__create_incidents_and_audit.sql`**: Incidents, SLA columns, comments, and audit logging tables.
- **`V4__create_notifications.sql`**: In-app notifications table.
- **`V5__seed_demo_data.sql`**: Seed data with sample employees, specialized technicians, and active demo incidents.
