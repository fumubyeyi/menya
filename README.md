# Menya Tutoring

Adaptive STEM learning infrastructure for nonprofit tutoring organizations.

This repository holds the product prototype ([`Menya.prototype/`](Menya.prototype)) — a
role-based React app covering the program-director, tutor, and student
experience — plus the [database schema](docs/schema/database-schema.md) that
documents what a production backend for it would look like.

The prototype is published at **[floral-minus-74527153.figma.site](https://floral-minus-74527153.figma.site)**.

Repository: **[github.com/fumubyeyi/menya](https://github.com/fumubyeyi/menya)**.

## Mission & Vision

**Mission** — Accelerate learning and access by building adaptive infrastructure for nonprofit STEM tutoring organizations.

**Vision** — Menya helps organizations give every student the continuity, personalization, and follow-through it takes to build a STEM identity.

## Features

The prototype models three roles (Program Director, Tutor, Student), each with
its own navigation and home dashboard, sharing one curriculum, roster, and
session data underneath.

### Program Director
- **Dashboard** — program-wide snapshot: this term's sessions, students, and average performance.
- **Students** — full student roster with status (exceeding / on-track / needs-support / at-risk), progress, and drill-down student detail pages.
- **Curriculum** — the course/chapter/module library, with content-completeness tracking, plus AI-assisted curriculum import (structuring an already-curated course) and AI bootstrap (generating a first draft of a course to be reviewed) modes.
- **Attendance** — one page, split into Online and In-Person tabs. Online covers every scheduled/live/completed virtual (Zoom) session with tutor reassignment; In-Person adds in-person 1:1 sessions plus a roll-call attendance report (totals, attendance rate, per-student breakdown, CSV export filterable by grade/course/date range) rolling up what tutors log.
- **Tutors** — tutor roster with course/grade coverage and caseload, each tutor's own upcoming sessions, and a "Plan Week" builder for staff to batch-schedule a week's sessions across students/tutors and publish them all at once, notifying every affected tutor.
- **Analytics** — program performance trends over time (scores, session volume, course breakdown).
- **Alumni Tracking** — post-program outcomes (college/career/military/etc.) with dated follow-up check-ins and a public success-stories page for verified alumni.

### Tutor
- **My Home** — this tutor's day at a glance, plus at-risk alerts for students in their grades/courses.
- **My Students** — roster of students they've actually worked with, with per-course score trends.
- **Attendance** — one page, split into Online and In-Person tabs, with a "Take Roll Call" action always available next to "Schedule Session" to mark an entire grade or course present/not-present at once. Online shows upcoming virtual sessions; In-Person shows upcoming in-person sessions plus roll-call history and rates. Full session history and materials sit below both tabs.
- **Review** — approve, request revisions on, or reject AI-generated practice before it reaches a student.
- **Performance** — this tutor's own outcomes over the term.

### Student
- **My Home** — progress snapshot, streak, and achievements.
- **My Courses** — enrolled courses and chapter/module progress.
- **Module Workspace** — self-directed lessons with worked examples, auto-graded and free-response practice, inline diagrams (graphs, number lines, shapes, etc.), hints, and an in-module "I'm stuck" flag that raises a help request to their tutor.
- **My Schedule** — upcoming sessions and assigned homework.
- **Goals & Achievements** — progress toward personal goals and earned badges.

### Cross-cutting
- A notification bell (tutor role) surfaces newly-published weekly schedules ("N new sessions scheduled") alongside at-risk student alerts.
- Role-based auth with a program-staff/admin distinction (view-only staff vs. staff who can add/edit records).
- Virtual sessions via embedded Zoom, or in-person sessions tracked the same way.
- Client-side persistence (localStorage) over the same data shapes a real backend would use — see [`docs/schema/database-schema.md`](docs/schema/database-schema.md) for the relational model.

## Getting started

See [`Menya.prototype/README.md`](Menya.prototype/README.md) to install dependencies and run the app locally.
