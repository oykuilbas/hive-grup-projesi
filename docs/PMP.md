# Project Management Plan (PMP)

> The purpose of this PMP is to practice planning and tracking work in Jira. Keep it short: most of the content is a summary of what you set up in Jira.
> Keep this file at `docs/PMP.md`. Each section is one Jira epic (PMP-1 … PMP-6); mark the epic Done when the section is complete.
> Save screenshots in `docs/img/`.

| Section | Content | Required by |
|---|---|---|
| PMP-1 | Project, Jira setup, team and roles | Week 6 |
| PMP-2 | Work packages (epics) and sprint plan | Week 6 |
| PMP-3 | Progress review: mid-term (v0.1) | Mid-term evaluation (Week 8 / 9) |
| PMP-4 | Progress review: v0.2 | Week 10 |
| PMP-5 | Progress review: final (v1.0) | Final evaluation |
| PMP-6 | Retrospective | Final evaluation |

---

## PMP-1. Project and Team

### Project and Jira Setup

**Project in one sentence:** Hive is a web-based decision support platform where parents and linked specialists share a child's weekly schedule, tasks and observations, with a role-based AI summary that supports decisions but never makes them.  
**Jira project key:** HIVE  
**Jira board link:** https://oykuilbas.atlassian.net/jira/software/projects/HIVE/boards/2  

### Team and Roles

| Name | Jira / GitHub username | Role |
|---|---|---|
| Öykü İlbaş | öykü ilbaş / oykuilbas | Project Manager, Developer, Tester |
| Muhammed Fatih Karagöz | Muhammed Fatih Karagöz / muhammedfatihkaragoz | Developer, Tester |
| Elif Beliz Özçimen | Elif Beliz Özçimen / belizozc | Developer, Tester |

---

## PMP-2. Plan

### Work Packages (Epics)

| Epic | Owner | Number of tasks | Planned sprint(s) |
|---|---|---|---|
| M1 – Login and roles | Muhammed Fatih Karagöz | 7 | Sprint 2, Sprint 4 |
| M2 – Linking specialists | Elif Beliz Özçimen | 8 | Sprint 2, Sprint 3 |
| M3 – Weekly schedule | Öykü İlbaş | 7 | Sprint 2, Sprint 4 |
| M4 – Tasks | Öykü İlbaş | 14 | Sprint 1, Sprint 2 |
| M5 – Specialist entries | Muhammed Fatih Karagöz | 5 | Sprint 3, Sprint 4 |
| M6 – Documents | Elif Beliz Özçimen | 5 | Sprint 3, Sprint 4 |
| M7 – Weekly statistics | Elif Beliz Özçimen | 4 | Sprint 3, Sprint 4 |
| M8 – Role-based AI summary | Muhammed Fatih Karagöz | 8 | Sprint 3 |

M4 includes the 5 walking skeleton tasks. Unit and API test tasks are planned in the same sprint as the module they test. Each end-to-end test task is planned for the sprint in which the assignment requires it: Flow 1 (M4) in Sprint 2, Flow 2 (M2) and Flow 3 (M8) in Sprint 3, and the end-to-end tests of M1, M3, M5, M6 and M7 in Sprint 4.

Documentation work is tracked in two additional epics: SRS (12 tasks) and DESIGN (13 tasks). Their first versions are planned in Sprint 1. Tasks for their final versions (Week 10) will be added to Sprint 3 at the start of that sprint.

### Sprint Plan

| Sprint | Weeks | Sprint goal | Ends with |
|---|---|---|---|
| Sprint 1 | 4–6 | Set up Jira and the repository, complete PMP-1 and PMP-2, prepare the first SRS and SDD, and connect the database, API and frontend through a walking skeleton | Walking skeleton (v0.0), Week 6 |
| Sprint 2 | 7–8 | Implement M1–M4 (login, specialist links, weekly schedule, tasks) with their unit and API tests, and run the first end-to-end test (Flow 1) in CI | Release v0.1, mid-term |
| Sprint 3 | 9–10 | Implement M5–M8 (observations, documents, statistics, AI summary), add the Flow 2 and Flow 3 end-to-end tests so that all 3 critical flow tests pass in CI, reach at least 40% branch coverage, and finalize the SRS and SDD | Release v0.2, Week 10 |
| Sprint 4 | 11–12 | Add the end-to-end tests of M1, M3, M5, M6 and M7 so that each of M1–M8 has at least one passing end-to-end test in CI, reach at least 60% branch coverage, fix defects, and prepare the final report and demo | Release v1.0, final |

---

## PMP-3. Progress Review: Mid-term (v0.1)

**Jira board screenshot:**  

| Epic | Planned for this point | Status (Done / In progress / Not started) |
|---|---|---|
| | | |
| | | |

**Changes to the plan (if any):**

---

## PMP-4. Progress Review: v0.2

**Jira board screenshot:**  

| Epic | Planned for this point | Status (Done / In progress / Not started) |
|---|---|---|
| | | |
| | | |

**Changes to the plan (if any):**

---

## PMP-5. Progress Review: Final (v1.0)

**Jira board screenshot:**  

| Epic | Planned for this point | Status (Done / In progress / Not started) |
|---|---|---|
| | | |
| | | |

**Changes to the plan (if any):**

---

## PMP-6. Retrospective

- What worked well in using Jira:
- What we would do differently:
