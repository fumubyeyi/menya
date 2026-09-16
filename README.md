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
- **Attendance** — one page, split into Online and In-Person tabs. Online covers every scheduled/live/completed virtual (Zoom) session with tutor reassignment; In-Person adds in-person group sessions plus a roll-call attendance report (totals, attendance rate, per-student breakdown, CSV export filterable by grade/course/date range) rolling up what tutors log, and flags recurring slots that are scheduled but haven't had a roll call taken yet.
- **Schedule** — the recurring weekly slot grid (grade band, day, time, assigned tutors) that both program staff and tutors read from, plus a "Plan Week" builder for staff to batch-schedule a week's sessions across students/tutors and publish them all at once, notifying every affected tutor.
- **Tutors** — tutor roster with course/grade coverage and caseload, each tutor's own upcoming sessions.
- **Analytics** — program performance trends over time (scores, session volume, course breakdown).
- **Alumni Tracking** — post-program outcomes (college/career/military/etc.) with dated follow-up check-ins and a public success-stories page for verified alumni.

### Tutor
- **My Home** — this tutor's day at a glance: pending roll calls, a "needs attendance" banner for logged-but-unrecorded sessions, this tutor's recurring slots, and at-risk alerts for students in their grades/courses.
- **Schedule** — this tutor's recurring weekly slots, upcoming sessions (Online/In-Person tabs), and session history — in-person history shows grade group, session, and shared notes; online history shows student/course/score.
- **Attendance** — take roll call per scheduled session (present/absent + per-student notes) or log an ad-hoc roll call outside the regular schedule. Notes and attendance on an in-person group session are shared across every tutor assigned to it, not siloed to whoever logged it first.
- **Curriculum Search** — search the shared course/chapter/module library for material to pull into a session.

### Student
- **My Home** — progress snapshot, streak, and achievements.
- **My Courses** — enrolled courses and chapter/module progress.
- **Module Workspace** — self-directed lessons with worked examples, auto-graded and free-response practice, inline diagrams (graphs, number lines, shapes, etc.), hints, and an in-module "I'm stuck" flag that raises a help request to their tutor.
- **My Schedule** — upcoming sessions, this student's recurring in-person slots, and session history.
- **Goals & Achievements** — progress toward personal goals and earned badges.

### Public site
- **About** — the public landing page: mission, how Menya works, a featured alumni story, program stats, and a "Sign In" call to action into the app.
- **Alumni Stories** — full wall of verified alumni success stories and outcomes.
- All share one header (logo, About, Contact, a Check-In menu into the kiosks below, Sign In) so navigation stays consistent across every unauthenticated page, including the mobile view of the sign-in screen itself.

### Check-in kiosks

Unauthenticated, tablet-facing screens for in-person sessions, reached from the public header's Check-In menu.
- **Front desk** (`/kiosk/tutors`) — one shared kiosk at the site entrance listing today's in-person sessions; a tutor taps "Check In" on arrival, which stamps their arrival on that session's roll call.
- **Group kiosk** (`/kiosk/students/grade/:groupId`, `/kiosk/students/course/:course`) — one per group, keyed to the grade band or course rather than a room, so the tablet can travel with the group and its bookmarked link survives the session being re-published each day. Students tap their own name to check in.
- A group kiosk stays locked until that group's tutor has checked in at the front desk, so a room can't collect student check-ins with no tutor confirmed on site.
- Both write into the same roll-call records the tutor sees on their Attendance page, and a kiosk check-in stays distinguishable from a present/absent mark the tutor entered after the fact.

### Cross-cutting
- A notification bell (tutor role) surfaces newly-published weekly schedules ("N new sessions scheduled") alongside at-risk student alerts.
- Role-based auth with a program-staff/admin distinction (view-only staff vs. staff who can add/edit records).
- Virtual sessions via embedded Zoom, or in-person sessions tracked the same way.
- Client-side persistence (localStorage) over the same data shapes a real backend would use — see [`docs/schema/database-schema.md`](docs/schema/database-schema.md) for the relational model.

## Architecture

The prototype is client-only today; the diagram below is the target
architecture for a production Menya deployment, from user traffic down to
data storage and the surrounding external services.

![Menya system architecture](docs/architecture/system%20architecture.png)

## Getting started

See [`Menya.prototype/README.md`](Menya.prototype/README.md) to install dependencies and run the app locally.
