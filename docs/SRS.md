# Software Requirements Specification (SRS)

**Team name:** Hive (Group 10, Section-1)  
**Version:** ☒ First version (Week 6) ☐ Final (Week 10)  
**Last updated:** 2026-11-07

---

## 1. Introduction

**Purpose of the system:**  
The system is a web-based decision support platform that brings a child's parents and specialists together around one shared weekly schedule, task list and record of observations. An AI component summarizes the week's records for each reader according to their role. The AI provides summaries to support human decision-making but does not make decisions on behalf of users. Each summary is labelled as AI-generated and linked to its source records.

**Users of the system:**

| User type | Description |
|---|---|
| Parent | Owns the child's data, sees all of the child's records and links or unlinks specialists. |
| Specialist | Teacher, psychologist, doctor, special education teacher or coach. Works only with the children they are linked to. |
| Child | Sees only their own tasks and weekly schedule, and marks tasks as done. |

---

## 2. Functional Requirements

### M1 – Login and roles

| ID | Requirement | Priority |
|---|---|---|
| FR-M1-01 | The system shall allow a registered user to log in with email and password. | Must |
| FR-M1-02 | The system shall reject a login with a wrong email or password and show an error message. | Must |
| FR-M1-03 | The system shall take the user's role (parent, specialist or child) from the account; the user shall not choose a role at login. | Must |
| FR-M1-04 | The system shall issue a signed token with an expiry time after a successful login and require it for every protected API request. | Must |
| FR-M1-05 | The system shall redirect each user to their role's home screen after login and show only that role's screens. | Must |
| FR-M1-06 | The system shall reject an API request for another role's function with an authorization error, even if the request is sent without the user interface. | Must |
| FR-M1-07 | The system shall allow the user to log out. | Should |

### M2 – Linking specialists

| ID | Requirement | Priority |
|---|---|---|

### M3 – Weekly schedule

| ID | Requirement | Priority |
|---|---|---|

### M4 – Tasks

| ID | Requirement | Priority |
|---|---|---|

### M5 – Specialist entries

| ID | Requirement | Priority |
|---|---|---|
| FR-M5-01 | The system shall allow a linked specialist to add a dated observation about the child. | Must |
| FR-M5-02 | The system shall reject an observation with a missing date or empty text and show an error message. | Must |
| FR-M5-03 | The system shall show the parent and linked specialists the child's observations, newest first, with date, author name and specialist type. | Must |
| FR-M5-04 | The system shall allow only the specialist who wrote an observation to edit it. | Must |
| FR-M5-05 | The system shall mark an edited observation with an "edited" label. | Must |
| FR-M5-06 | The system shall not show observations to the child, and shall reject the child's API requests for observations. | Must |

### M6 – Documents

| ID | Requirement | Priority |
|---|---|---|

### M7 – Weekly statistics

| ID | Requirement | Priority |
|---|---|---|

### M8 – Role-based AI summary

| ID | Requirement | Priority |
|---|---|---|
| FR-M8-01 | The system shall allow a parent or a linked specialist to request an AI summary of the child's records for a selected week (tasks, task status and observations). | Must |
| FR-M8-02 | The system shall use a separate prompt for parents (plain language) and for specialists (professional language). | Must |
| FR-M8-03 | The system shall send the AI service only the records that the requesting user is allowed to see. | Must |
| FR-M8-04 | The system shall instruct the AI to use only the given records, to state when information is missing, and not to diagnose or suggest treatment. | Must |
| FR-M8-05 | The system shall label every summary as "AI-generated". | Must |
| FR-M8-06 | The system shall show links to the source records that the summary is based on. | Must |
| FR-M8-07 | The system shall allow the user to submit a "helpful" or "incorrect" feedback for an AI summary and save it. | Must |
| FR-M8-08 | The system shall show an error message when the AI service is unavailable, while all other functions keep working. | Must |
| FR-M8-09 | The system shall provide a mock mode that returns a fixed sample summary, used in automated tests and CI. | Must |

---

## 3. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|

---

## 4. Critical Flows and Acceptance Criteria

| Flow | Related requirements | Acceptance criteria |
|---|---|---|

---

## 5. Use Case Diagram

---

## 6. Change Log

| Date | Change | By |
|---|---|---|
