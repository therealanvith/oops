# Course Demonstration Script (3 Evaluation Workflows)

**Project**: BITS ServiceDesk: Intelligent IT Service Management & Incident Resolution System

This script provides step-by-step instructions for demonstrating the 3 core evaluative workflows during the final project review.

---

## Workflow 1: Standard Incident Lifecycle with Automated Assignment & Notifications

### Storyline
An employee reports an enterprise Wi-Fi connectivity issue. The system dynamically computes priority, automatically assigns an available specialist using the configured assignment strategy, and moves through triage to verified closure.

### Step-by-Step Actions
1. **Login as Employee (`emp_alan`)**:
   - Navigate to `http://localhost:3000`.
   - Log in using credentials `emp_alan` / `password123`.
2. **Report New Incident**:
   - Title: `Classroom C201 Access Point blinking red - No Wi-Fi`
   - Category: `NETWORK`
   - Impact: `MEDIUM` (affects one lecture hall)
   - Urgency: `HIGH` (class starting in 15 minutes)
   - *Observation*: Priority is dynamically computed as **P2 - HIGH**.
   - Click **Submit Incident**.
3. **Verify Automated Assignment**:
   - Incident is assigned automatically to `tech_alice` (Network specialist) via `SkillMatchAssignmentStrategy`.
   - In-app notification received by `tech_alice`.
4. **Login as Technician (`tech_alice`)**:
   - Open Technician Queue. See new ticket `INC-1001`.
   - Click **Start Work** -> Status transitions to `IN_PROGRESS`.
   - Fix issue and click **Resolve Incident** with resolution note: *"Rebooted POE switch port and verified DHCP lease acquisition."*
   - Status transitions to `RESOLVED`.
5. **Verify & Close as Employee (`emp_alan`)**:
   - Employee receives resolution notification.
   - Confirms fix and clicks **Verify & Close**. Status becomes `CLOSED`.
   - Show audit history: 4 entries chronologically logged (`REPORTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).

---

## Workflow 2: The "Needs-Info" Loop, SLA Clock Pause, and Similar Incident Knowledge Reuse

### Storyline
A faculty member reports a specialized software crash. The technician requires crash dump logs. The system pauses SLA timing while awaiting user input. The intelligent similarity feature assists the technician in quickly finding a previous solution.

### Step-by-Step Actions
1. **Report Incident**:
   - Employee reports `MATLAB crash on startup with error 0x80004005`.
   - Assigned to technician `tech_bob`.
2. **Technician Investigates & Detects Similar Incident**:
   - `tech_bob` opens ticket.
   - *Observation*: System highlights **Similar Past Incident** with score $0.85$: `MATLAB 2024b licensing crash error 0x80004005 on Windows 11`.
   - Past resolution summary displays: *"Clear %APPDATA%/MathWorks license cache and re-activate."*
3. **Request More Information (Needs-Info Loop)**:
   - `tech_bob` requests: *"Please upload the file C:\Users\<user>\AppData\Roaming\MathWorks\matlab.log"*.
   - Status changes to `PENDING_INFO`.
   - *Observation*: The SLA resolution countdown timer is explicitly **PAUSED**.
4. **Employee Submits Clarification**:
   - Employee logs in, sees alert, and submits: *"Found the log file, license error code confirmed."*
   - Status automatically returns to `IN_PROGRESS`.
   - *Observation*: The SLA resolution timer **RESUMES** with zero penalty for elapsed customer wait time.
5. **Resolve Using Reused Knowledge**:
   - `tech_bob` applies the recommended solution from the similar incident.
   - Marks ticket as `RESOLVED`.

---

## Workflow 3: SLA Deadline Breach, Automated Escalation & Administrator Intervention

### Storyline
A high-impact server lab outage is reported. Support technicians are overloaded. The SLA countdown approaches and breaches the deadline. The system automatically triggers an escalation event, bumps priority, and notifies the administrator.

### Step-by-Step Actions
1. **Report Critical Outage**:
   - Employee reports `Computer Lab 101 All 40 Workstations Unreachable`.
   - Impact: `HIGH` | Urgency: `HIGH` -> Computed Priority: **P1 - CRITICAL**.
   - SLA Target: Response within 15 min, Resolution within 2 hours.
2. **Simulate SLA Breach**:
   - Use admin endpoint `/api/v1/admin/sla/evaluate` or advance test clock past the deadline.
   - *Observation*: Incident SLA status transitions from `WITHIN_SLA` to `BREACHED`.
3. **Automated Escalation**:
   - `SlaBreachedEvent` is published.
   - Administrator dashboard displays critical banner alert.
   - Automated priority boost and notification dispatched to IT Director.
4. **Administrator Intervention**:
   - Admin logs in (`admin_carol`).
   - Reassigns ticket to Lead Senior Engineer with urgent remark: *"Customer escalated; highest priority."*
   - Audit trail records `SLA_BREACHED` followed by `REASSIGNED` and `PRIORITY_OVERRIDDEN` with actor IDs and exact timestamps.
