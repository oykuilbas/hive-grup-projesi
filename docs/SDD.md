# Software Design Document (SDD)

**Team name:** Hive (Group 10, Section-1)  
**Version:** ☒ First version (Week 6) ☐ Final (Week 10)  
**Last updated:** 2026-11-07

---

## 1. Architecture Overview

The system is a client–server web application with three layers: a React frontend running in the browser, a Node.js + Express REST API, and a SQLite database. The frontend never talks to the database or the AI service directly; every request goes through the backend, which checks the user's identity and permissions before reading or changing any record. Uploaded documents are stored in a folder on the backend, and the AI service is called only by a single backend module that also provides a mock mode for tests and CI.

```mermaid
flowchart LR
    User["User - browser"] --> FE["Frontend - React"]
    FE -->|HTTP + JSON, JWT| API["Backend - Express REST API"]
    subgraph Backend
        API --> MW["Auth and access middleware"]
        MW --> SVC["Module services M1–M8"]
        SVC --> AIM["AI module - real or mock"]
    end
    SVC --> DB[("SQLite database")]
    SVC --> FS[("Uploaded files folder")]
    AIM --> EXT["External AI provider - Gemini API"]
```

**Key design decisions:**

- Every protected request verifies the user's JWT and role. For child-related resources, the backend also verifies the user's relationship to the child: ownership for parents, an active link for specialists, or the child's own account where access is permitted (FR-M1-06, FR-M2-07). A failed check returns HTTP 401 (no or invalid token) or HTTP 403 (no permission).
- Weekly statistics are calculated by application code, not by the AI (FR-M7-01).
- The AI module receives only records that the requesting user may see (FR-M8-03). In mock mode (`AI_MODE=mock`) no request is sent to the external provider; the module returns a fixed summary that matches the seed data, so tests do not depend on the external service (FR-M8-09).
- The AI provider's API key is read from a backend `.env` file that is not committed to Git (NFR-03).

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router |
| Backend | Node.js, Express, jsonwebtoken (JWT), bcrypt, multer (file upload) |
| Database | SQLite |
| AI | Gemini API, accessed only from the backend |
| Testing | Jest + Supertest (backend unit and API tests), Vitest (frontend unit tests), Playwright (end-to-end tests) |
| CI | GitHub Actions |

---

## 2. Module Design

| Module | Main components | Implements requirements |
|---|---|---|
| M1 | Frontend: `LoginPage`, `AuthContext`, `ProtectedRoute`. Backend: `authRoutes`, `authService`, `authMiddleware` (`requireAuth`, `requireRole`), `users` table. | FR-M1-01 … FR-M1-07 |
| M2 | Frontend: `LinkedSpecialistsPage` (parent), `MyChildrenPage` (specialist). Backend: `linkRoutes`, `linkService`, `accessMiddleware` (`canAccessChild`), `specialist_child_links` table. | FR-M2-01 … FR-M2-07 |
| M3 | Frontend: `WeeklySchedule`, `AddEventForm`. Backend: `eventRoutes`, `eventService`, `events` table. | FR-M3-01 … FR-M3-05 |
| M4 | Frontend: `TaskForm`, `ChildTasksPage`, `AssignedTasksPage`. Backend: `taskRoutes`, `taskService`, `tasks` table. | FR-M4-01 … FR-M4-07 |
| M5 | Frontend: `ObservationList`, `ObservationForm`. Backend: `observationRoutes`, `observationService`, `observations` table. | FR-M5-01 … FR-M5-06 |
| M6 | Frontend: `DocumentsPage`, `UploadForm`. Backend: `documentRoutes` (multer), `documentService`, `documents` table, uploads folder. | FR-M6-01 … FR-M6-05 |
| M7 | Frontend: `WeeklyStats`. Backend: `statsRoutes`, `statsService.calculateWeeklyStats` (pure function, unit tested). | FR-M7-01 … FR-M7-04 |
| M8 | Frontend: `AiSummaryPanel`, `FeedbackButtons`. Backend: `aiSummaryRoutes`, `aiService` with `geminiClient` and `mockClient` (selected by the `AI_MODE` setting), parent and specialist prompts, `ai_summaries` and `ai_feedback` tables. | FR-M8-01 … FR-M8-09 |

---

## 3. Data Model

The database is SQLite with foreign key checks enabled (`PRAGMA foreign_keys = ON`) when the connection is opened. Unique constraints are defined in the SQL schema as listed in the notes below.

```mermaid
erDiagram
    USERS ||--o{ CHILDREN : "is parent of"
    USERS ||--o| CHILDREN : "child account"
    CHILDREN ||--o{ SPECIALIST_CHILD_LINKS : "has"
    USERS ||--o{ SPECIALIST_CHILD_LINKS : "linked as specialist"
    CHILDREN ||--o{ EVENTS : "has"
    USERS ||--o{ EVENTS : "creates"
    CHILDREN ||--o{ TASKS : "has"
    USERS ||--o{ TASKS : "assigns"
    CHILDREN ||--o{ OBSERVATIONS : "has"
    USERS ||--o{ OBSERVATIONS : "writes"
    CHILDREN ||--o{ DOCUMENTS : "has"
    USERS ||--o{ DOCUMENTS : "uploads"
    CHILDREN ||--o{ AI_SUMMARIES : "has"
    USERS ||--o{ AI_SUMMARIES : "requests"
    AI_SUMMARIES ||--o{ AI_FEEDBACK : "receives"
    USERS ||--o{ AI_FEEDBACK : "submits"

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string role "parent, specialist or child"
    }
    CHILDREN {
        int id PK
        string name
        date birth_date
        int parent_id FK "parent's USERS.id"
        int user_id FK, UK "child's own USERS.id"
    }
    SPECIALIST_CHILD_LINKS {
        int id PK
        int child_id FK
        int specialist_id FK
        string specialist_type
        datetime created_at
    }
    EVENTS {
        int id PK
        int child_id FK
        int created_by FK
        string title
        date event_date
        string start_time
        string end_time
    }
    TASKS {
        int id PK
        int child_id FK
        int assigned_by FK
        string title
        string description
        string development_area
        date due_date
        string status "Pending or Completed"
        datetime completed_at
    }
    OBSERVATIONS {
        int id PK
        int child_id FK
        int specialist_id FK
        date entry_date
        string text
        boolean is_edited
        datetime created_at
        datetime updated_at
    }
    DOCUMENTS {
        int id PK
        int child_id FK
        int uploaded_by FK
        string original_name
        string file_type
        int size_bytes
        string stored_path
        datetime uploaded_at
    }
    AI_SUMMARIES {
        int id PK
        int child_id FK
        int requested_by FK
        date week_start
        string audience "parent or specialist"
        string summary_text
        string source_records "JSON list of type and id"
        datetime created_at
    }
    AI_FEEDBACK {
        int id PK
        int summary_id FK
        int user_id FK
        string rating "helpful or incorrect"
        datetime created_at
    }
```

| Table | Module | Notes |
|---|---|---|
| USERS | M1 | One table for all roles; the role comes from the account (FR-M1-03). Email is unique. |
| CHILDREN | M1, M2 | parent_id points to the parent's user record and user_id to the child's own account; both reference USERS. user_id is unique. |
| SPECIALIST_CHILD_LINKS | M2 | Unique on (child_id, specialist_id). Unlinking deletes the row; the specialist's earlier tasks and observations are kept, but access ends immediately (FR-M2-07). |
| EVENTS | M3 | |
| TASKS | M4, M7 | development_area is limited to the fixed list in FR-M4-02. M7 statistics are calculated from this table. |
| OBSERVATIONS | M5 | is_edited is set to true on the first edit (FR-M5-05). |
| DOCUMENTS | M6 | The file is stored in the uploads folder; the table keeps only its metadata. |
| AI_SUMMARIES | M8 | source_records stores the type and id of each source record, e.g. `[{"type": "task", "id": 15}, {"type": "observation", "id": 7}]` (FR-M8-06). |
| AI_FEEDBACK | M8 | Saves "helpful" or "incorrect" feedback (FR-M8-07). Unique on (summary_id, user_id); a new feedback from the same user replaces the earlier one. |

---

## 4. API / Interfaces

All endpoints except login require a valid JWT. For every endpoint that contains `:childId`, the access middleware checks that the user is the child's parent, a specialist currently linked to the child, or the child themself (only where the Access column allows it). For endpoints that identify a record by its own ID (task, observation, document or AI summary), the backend first finds the child the record belongs to and then applies the same check, so knowing a record's ID never gives access to it. Links to source records in a saved AI summary open the child's task or observation list and highlight the referenced record; the list is loaded through the normal endpoints, so the same access checks apply each time. Error responses: 400 invalid data, 401 missing or invalid token, 403 no permission, 404 record not found.

### M1 – Login and roles

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /api/auth/login | Log in and receive a JWT | Public |
| GET | /api/auth/me | Return the logged-in user's name and role | All roles |

### M2 – Linking specialists

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /api/children | List the children the user may access | All roles |
| GET | /api/children/:childId/links | List linked specialists | Parent |
| POST | /api/children/:childId/links | Link a specialist by email and type | Parent |
| DELETE | /api/children/:childId/links/:specialistId | Unlink a specialist | Parent |
### M3 – Weekly schedule

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /api/children/:childId/events?week=YYYY-MM-DD | List events of the selected week | Parent, linked specialist, child |
| POST | /api/children/:childId/events | Add an event | Parent, linked specialist |

### M4 – Tasks

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /api/children/:childId/events?week=YYYY-MM-DD | List events of the selected week | Parent, linked specialist, child |
| POST | /api/children/:childId/events | Add an event | Parent, linked specialist |

### M5 – Specialist entries

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /api/children/:childId/observations | List observations | Parent, linked specialist |
| POST | /api/children/:childId/observations | Add an observation | Linked specialist |
| PATCH | /api/observations/:observationId | Edit an observation | Author specialist, still linked |

### M6 – Documents

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /api/children/:childId/documents | List documents | Parent, linked specialist |
| POST | /api/children/:childId/documents | Upload a document (multipart) | Parent, linked specialist |
| GET | /api/documents/:documentId/view | View a document in the browser | Parent, linked specialist |
| GET | /api/documents/:documentId/download | Download a document | Parent, linked specialist |
### M7 – Weekly statistics

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /api/children/:childId/stats?week=YYYY-MM-DD | Weekly completion rate, total and by area | Parent, linked specialist |

### M8 – Role-based AI summary

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /api/children/:childId/ai-summaries | Create an AI summary for a week | Parent, linked specialist |
| POST | /api/ai-summaries/:summaryId/feedback | Save helpful or incorrect feedback | Parent, linked specialist of the summary's child |

---

## 5. Critical Flows

### Flow 1: A specialist assigns a task and the child completes it

```mermaid
sequenceDiagram
    actor Specialist
    actor Child
    participant FE as React
    participant API as Express API
    participant DB as SQLite

    Specialist->>FE: Fill in task form and save
    FE->>API: POST /api/children/12/tasks with JWT
    Note over API: Verify JWT and role, check link (FR-M2-07), validate data
    API->>DB: Insert task with status Pending
    DB-->>API: Saved task
    API-->>FE: 201 Created with task
    FE-->>Specialist: Task shown as Pending

    Child->>FE: Log in and open My tasks
    FE->>API: GET /api/children/12/tasks with JWT
    Note over API: Verify JWT, check that the user is child 12
    API->>DB: Select tasks of child 12
    DB-->>API: Tasks
    API-->>FE: 200 OK with tasks
    FE-->>Child: Task shown as Pending
    Child->>FE: Mark task as done
    FE->>API: PATCH /api/tasks/45/complete with JWT
    Note over API: Verify JWT, check that task 45 belongs to this child
    API->>DB: Update status to Completed
    API-->>FE: 200 OK with updated task

    Specialist->>FE: Open assigned tasks
    FE->>API: GET /api/tasks/assigned with JWT
    API->>DB: Select tasks assigned by this specialist
    API-->>FE: 200 OK with tasks
    FE-->>Specialist: Task shown as Completed
```

### Flow 2: An unlinked specialist loses access

```mermaid
sequenceDiagram
    actor Parent
    actor Specialist
    participant FE as React
    participant API as Express API
    participant DB as SQLite

    Note over Specialist: Already logged in with a JWT that has not expired
    Parent->>FE: Unlink specialist and confirm
    FE->>API: DELETE /api/children/12/links/7 with JWT
    Note over API: Verify JWT, check that the user is the parent of child 12
    API->>DB: Delete link row
    API-->>FE: 204 No Content
    FE-->>Parent: Specialist removed from the list

    Specialist->>FE: Open the child's tasks
    FE->>API: GET /api/children/12/tasks with the old JWT
    Note over API: JWT is valid, now check the current link
    API->>DB: Select link for specialist 7 and child 12
    DB-->>API: No row
    API-->>FE: 403 Forbidden
    FE-->>Specialist: Access denied message, no child data shown
```

### Flow 3: The parent views weekly statistics and the AI summary

```mermaid
sequenceDiagram
    actor Parent
    participant FE as React
    participant API as Express API
    participant DB as SQLite
    participant AI as AI module - mock mode

    Parent->>FE: Open weekly dashboard
    FE->>API: GET /api/children/12/stats?week=2026-11-02 with JWT
    Note over API: Verify JWT, check that the user is the parent of child 12
    API->>DB: Select tasks due in the selected week
    DB-->>API: 5 tasks
    Note over API: Calculate total and per-area rates in application code
    API-->>FE: 200 OK with total 60, Language 100, Motor 33
    FE-->>Parent: Statistics shown

    Parent->>FE: Request AI summary
    FE->>API: POST /api/children/12/ai-summaries with JWT
    API->>DB: Select tasks and observations the parent may see
    API->>AI: Parent prompt with allowed records
    AI-->>API: Fixed sample summary
    API->>DB: Save summary with source records
    API-->>FE: 201 Created with summary and source links
    FE-->>Parent: Summary labelled AI-generated with links to source records
```

---

## 6. User Interface

The main screens follow the example screens in Appendix A of the assignment, limited to the required scope. Wireframes are stored in `docs/img/`.

| Screen | Image | Module |
|---|---|---|
| Login | ![Login](img/ui-login.png) | M1 |
| Parent – weekly dashboard (schedule, tasks, entries, statistics, AI summary) | ![Parent dashboard](img/ui-parent-dashboard.png) | M3, M4, M5, M7, M8 |
| Parent – linked specialists | ![Linked specialists](img/ui-linked-specialists.png) | M2 |
| Parent – documents | ![Documents](img/ui-documents.png) | M6 |
| Specialist – child profile and observations | ![Specialist child profile](img/ui-specialist-child.png) | M2, M5, M8 |
| Specialist – assign and track tasks | ![Specialist tasks](img/ui-specialist-tasks.png) | M4 |
| Child – my tasks and schedule | ![Child tasks](img/ui-child-tasks.png) | M1, M3, M4 |

---

## 7. Change Log

| Date | Change | By |
|---|---|---|
