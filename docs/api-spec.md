# REST API Specification

This document outlines the REST API endpoints, DTO contracts, and Role-Based Access Control (RBAC) rules for ServiceDesk.

Base URL prefix: `/api/v1`

---

## 1. Authentication & User Endpoints (`/api/v1/auth`, `/api/v1/users`)

| Method | Endpoint | Allowed Roles | Request DTO | Response DTO | HTTP Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Anonymous | `LoginRequest` | `AuthResponse` | `200 OK`, `401 Unauthorized` | Authenticate with username/password, returns JWT token and user profile. |
| `GET` | `/users/me` | Any Authenticated | *None* | `UserProfileResponse` | `200 OK`, `401 Unauthorized` | Get current logged-in user details, role, and skills. |
| `GET` | `/users/technicians` | `TECHNICIAN`, `ADMINISTRATOR` | *None* | `List<TechnicianResponse>` | `200 OK` | List active technicians with skills and current open ticket load. |
| `PUT` | `/users/{id}/skills` | `ADMINISTRATOR` | `UpdateSkillsRequest` | `TechnicianResponse` | `200 OK`, `404 Not Found` | Update category skills assigned to a technician. |

---

## 2. Incident Endpoints (`/api/v1/incidents`)

| Method | Endpoint | Allowed Roles | Request DTO | Response DTO | HTTP Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/incidents` | `EMPLOYEE`, `TECHNICIAN`, `ADMINISTRATOR` | `CreateIncidentRequest` | `IncidentDetailResponse` | `201 Created`, `400 Bad Request` | Report a new incident. Computes priority, similarity, and runs auto-assignment. |
| `GET` | `/incidents` | Any Authenticated | `IncidentFilterParams` (query params) | `PagedResponse<IncidentSummaryResponse>` | `200 OK` | Filtered incident list. Employees see own; Technicians/Admins see all. |
| `GET` | `/incidents/{id}` | Any Authorized | *None* | `IncidentDetailResponse` | `200 OK`, `404 Not Found`, `403 Forbidden` | Retrieve complete details of a specific incident. |
| `POST` | `/incidents/{id}/assign` | `TECHNICIAN`, `ADMINISTRATOR` | `AssignIncidentRequest` | `IncidentDetailResponse` | `200 OK`, `400 Bad Request`, `409 Conflict` | Assign or reassign incident to a technician (manual or trigger strategy). |
| `POST` | `/incidents/{id}/start` | `TECHNICIAN`, `ADMINISTRATOR` | *None* | `IncidentDetailResponse` | `200 OK`, `409 Conflict` | Transition status from `ASSIGNED` to `IN_PROGRESS`. |
| `POST` | `/incidents/{id}/request-info` | `TECHNICIAN`, `ADMINISTRATOR` | `RequestInfoRequest` | `IncidentDetailResponse` | `200 OK`, `409 Conflict` | Transition to `PENDING_INFO` and pause SLA resolution timer. |
| `POST` | `/incidents/{id}/provide-info` | `EMPLOYEE`, `TECHNICIAN`, `ADMINISTRATOR` | `ProvideInfoRequest` | `IncidentDetailResponse` | `200 OK`, `409 Conflict` | Return to `IN_PROGRESS` and resume SLA resolution timer. |
| `POST` | `/incidents/{id}/resolve` | `TECHNICIAN`, `ADMINISTRATOR` | `ResolveIncidentRequest` | `IncidentDetailResponse` | `200 OK`, `400 Bad Request`, `409 Conflict` | Mark ticket as `RESOLVED` with mandatory resolution summary. |
| `POST` | `/incidents/{id}/close` | `EMPLOYEE` (reporter), `ADMINISTRATOR` | `CloseIncidentRequest` | `IncidentDetailResponse` | `200 OK`, `409 Conflict` | Confirm resolution and move incident to immutable `CLOSED` state. |
| `POST` | `/incidents/{id}/cancel` | `EMPLOYEE` (if reported), `ADMINISTRATOR` | `CancelIncidentRequest` | `IncidentDetailResponse` | `200 OK`, `409 Conflict` | Cancel incident with reason. |
| `PUT` | `/incidents/{id}/priority` | `ADMINISTRATOR` | `OverridePriorityRequest` | `IncidentDetailResponse` | `200 OK`, `400 Bad Request` | Manually override priority level with mandatory audit remark. |

---

## 3. Comments, Audit & Intelligence Endpoints

| Method | Endpoint | Allowed Roles | Request DTO | Response DTO | HTTP Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/incidents/{id}/comments` | Any Authorized | `AddCommentRequest` | `CommentResponse` | `201 Created` | Add diagnostic discussion comment (or internal technician note). |
| `GET` | `/incidents/{id}/comments` | Any Authorized | *None* | `List<CommentResponse>` | `200 OK` | Fetch conversation thread. Employees do not see `isInternal=true` comments. |
| `GET` | `/incidents/{id}/audit-logs` | `TECHNICIAN`, `ADMINISTRATOR` | *None* | `List<AuditLogResponse>` | `200 OK` | Retrieve chronological, immutable audit history for the incident. |
| `GET` | `/incidents/{id}/similar` | `TECHNICIAN`, `ADMINISTRATOR` | *None* | `List<SimilarIncidentResponse>` | `200 OK` | Intelligent feature: returns historically resolved tickets with $\ge 0.6$ similarity. |

---

## 4. System Administration & Configuration Endpoints (`/api/v1/admin`)

| Method | Endpoint | Allowed Roles | Request DTO | Response DTO | HTTP Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/config/assignment` | `ADMINISTRATOR` | *None* | `AssignmentConfigResponse` | `200 OK` | Returns current active strategy (`ROUND_ROBIN`, `LEAST_LOADED`, `SKILL_MATCH`). |
| `PUT` | `/admin/config/assignment` | `ADMINISTRATOR` | `UpdateAssignmentConfigRequest` | `AssignmentConfigResponse` | `200 OK`, `400 Bad Request` | Dynamically updates the active assignment strategy at runtime. |
| `POST` | `/admin/sla/evaluate` | `ADMINISTRATOR` | *None* | `SlaEvaluationSummaryResponse` | `200 OK` | Manually triggers SLA check (also executed periodically by background scheduler). |

---

## 5. DTO Data Contract Shapes

### `CreateIncidentRequest`
```json
{
  "title": "Lab 304 Workstations cannot reach local gateway",
  "description": "All 20 desktops in Computer Lab 304 show IP autoconfiguration 169.254.x.x and cannot reach the default gateway after power maintenance.",
  "category": "NETWORK",
  "impact": "HIGH",
  "urgency": "HIGH"
}
```

### `IncidentDetailResponse`
```json
{
  "id": "e7b0a880-92a0-4b89-a5e4-cb911a3b3701",
  "incidentNumber": "INC-1001",
  "title": "Lab 304 Workstations cannot reach local gateway",
  "description": "All 20 desktops in Computer Lab 304 show IP autoconfiguration 169.254.x.x...",
  "category": "NETWORK",
  "status": "ASSIGNED",
  "priority": "P1_CRITICAL",
  "impact": "HIGH",
  "urgency": "HIGH",
  "reporter": {
    "id": "11111111-1111-1111-1111-111111111111",
    "fullName": "Prof. Alan Turing",
    "email": "aturing@campus.edu"
  },
  "assignee": {
    "id": "22222222-2222-2222-2222-222222222222",
    "fullName": "Alice Smith (Network Specialist)",
    "email": "alice@servicedesk.edu"
  },
  "slaWindow": {
    "responseDeadline": "2026-11-08T01:30:00Z",
    "resolutionDeadline": "2026-11-08T03:15:00Z",
    "slaStatus": "WITHIN_SLA",
    "pausedSeconds": 0
  },
  "resolutionNotes": null,
  "createdAt": "2026-11-08T01:15:00Z",
  "updatedAt": "2026-11-08T01:15:02Z"
}
```

### `SimilarIncidentResponse`
```json
{
  "incidentNumber": "INC-0842",
  "title": "Lab 304 switch port trunking issue after reboot",
  "similarityScore": 0.82,
  "status": "CLOSED",
  "resolutionSummary": "VLAN 40 configuration re-applied on switch SW-C304 port 24 and DHCP relay restarted."
}
```
