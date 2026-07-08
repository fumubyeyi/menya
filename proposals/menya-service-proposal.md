# Service Proposal: Menya — Adaptive STEM Learning Infrastructure

**Prepared for:** [Client / Partner Organization]
**Prepared by:** Menya
**Date:** July 6, 2026
**Contact:** iragaba.umubyeyi@gmail.com

---

## 1. Overview

Menya is adaptive STEM learning infrastructure for nonprofit tutoring organizations. It gives program directors, tutors, and students a single system of record for scheduling, curriculum, progress tracking, and AI-assisted, tutor-reviewed homework — replacing the spreadsheets, shared drives, and ad hoc messaging that most tutoring nonprofits currently stitch together to run their program.

Menya is built as reusable infrastructure, not a service delivered by any one tutor: the same platform is designed to run underneath many independent nonprofit programs at once, each with its own students, tutors, and data, rather than being tied to a single organization or a single instructor's caseload.

Menya is organized around three roles, each with its own view of the same underlying data:

- **Program Director** — oversees the whole program: all students, all tutors, all sessions, org-wide curriculum and analytics.
- **Tutor** — manages their assigned caseload: their students, their schedule, AI-generated assignments awaiting review, and their own performance.
- **Student** — sees their own schedule, subjects, progress, goals, and homework.

A working prototype covering all three roles — student, tutor, and program director dashboards, scheduling, curriculum library, analytics, and the AI curriculum review queue — is live today; this is not a concept pitch.

## 2. The Problem

Community demand for STEM tutoring support far exceeds available capacity: families seek afterschool programming for an estimated 30 million school-aged children, but only about 7 million are currently enrolled, and students from low-income families are the least likely to access technology, engineering, and computer science activities in these settings (Education Week, 2025). Programs that do exist are frequently run by volunteers and small staffs without the tooling to match that demand.

Nonprofit tutoring organizations typically run on a patchwork of tools that weren't built for the job: spreadsheets for tracking student progress, group chats for scheduling, generic worksheets photocopied across grade levels, and no shared view that lets a program director see, at a glance, which students are falling behind or which tutors are overloaded. This creates three compounding problems:

- **No unified visibility.** Program leads can't easily answer "which students are at risk right now" or "how is the program trending this month" without manually compiling data from multiple sources — and can't easily produce the outcome reports funders ask for.
- **High tutor overhead.** Tutors spend time on scheduling logistics and generic worksheet prep instead of instruction, especially at the high student-to-tutor ratios common in nonprofit settings.
- **Disconnected student experience.** Students have no single place to see their upcoming sessions, their progress, their goals, and their homework — reducing engagement and follow-through between sessions.
- **Discontinuity between sessions and tutors.** Where a program relies on rotating volunteer tutors, a student's progress and prior gaps often live only in that volunteer's memory. The Learn To Be Foundation, a nonprofit providing free 1:1 online tutoring, found this gap serious enough that it had to build its own internal tracking tool from scratch — a resource investment most small tutoring nonprofits cannot afford (Learn To Be Foundation, 2025).
- **Connectivity assumptions that don't match the field.** As of March 2024, roughly 24 million Americans lacked access to fixed broadband, concentrated in rural, Tribal, and low-income communities, and only 57% of adults in households earning under $30,000 subscribe to home broadband, compared to 95% of those earning over $100,000 (Center for American Progress, 2025). Tools built around always-on video and rich media exclude exactly the communities nonprofit tutoring programs serve.

## 3. Market Landscape

Several platforms serve pieces of this space, but none combine adaptive diagnostics, tutor-led workflow, funder reporting, and low-bandwidth delivery in one nonprofit-ready system:

| | Target user | Cost model | Built for nonprofit tutor-led programs | Adaptive diagnostics | Tutor / program dashboard | Funder & outcome reporting | Low-bandwidth support |
|---|---|---|---|---|---|---|---|
| **Khan Academy** | Self-directed learner | Free | No — designed for individual/classroom self-study | Limited | Basic teacher view | No | No |
| **IXL** | Classroom / individual subscriber | Per-student license fee | No — priced per learner, not scoped for volunteer-run nonprofits | Yes, within subject | Classroom-oriented | No | No |
| **Schoolhouse.world** | Peer tutoring (largely test prep) | Free | Partially — volunteer tutors, but minimal per-student progress infrastructure | No | Minimal | No | No |
| **Learn To Be** | 1:1 nonprofit tutoring (own program) | Free to students; internal tool, not distributed | Built for their own program only; not offered as infrastructure to other nonprofits | Self-built, not adaptive/diagnostic | Internal only | Limited | Not a design focus |
| **UPchieve** | On-demand tutoring for low-income students | Free | Partially — volunteer-tutor model, but on-demand chat/video rather than caseload management | No | Minimal | No | No |
| **Menya** | Nonprofit tutoring programs (director, tutor, student) | Free core tier for small nonprofits; premium reporting tier for larger orgs | Purpose-built | Yes — per-subject, per-student | Full program director + tutor dashboards | Built-in, funder-ready | Designed for low/intermittent connectivity |

*Feature comparisons above reflect publicly described product capabilities as of this writing and should be reconfirmed directly with each platform during partner due diligence; they are not intended as definitive competitive claims.*

The gap this leaves: no existing nonprofit-accessible platform combines adaptive diagnostics, a curated curriculum library, tutor-facing learning analytics, and funder-facing outcome reporting into one tool designed around how a volunteer or under-resourced tutor actually works.

## 4. What Menya Provides

### 4.1 Program Director tools
- **Dashboard** — org-wide snapshot: total students, sessions, average progress.
- **Students** — full roster with per-student subject, progress, streak, and status (on-track / needs-support / at-risk / exceeding), with drill-down into individual student detail.
- **Curriculum** — the shared library of curriculum items by subject, grade band, and difficulty, with completion rates across the student body.
- **Sessions** — the org-wide session calendar across all tutors and students.
- **Analytics** — trend data on average scores and session volume over time, and subject-level enrollment breakdowns, to support funder reporting and program evaluation.

### 4.2 Tutor tools
- **My Home** — a tutor's personal dashboard: their students, their day.
- **My Students** — the tutor's assigned caseload with per-student subject performance and session history.
- **My Schedule** — the tutor's own upcoming sessions, with meeting details.
- **Review (AI Curriculum Review)** — a queue of AI-generated, personalized practice assignments for the tutor's students. Each assignment is targeted at a specific student's measured gap, localized with word problems grounded in the student's own neighborhood (e.g., a garden-bed problem for a student near Chicago's Peterson Garden Project, an MBTA fare problem for a student in Boston), and explained with a short AI rationale. The tutor approves and sets a due date, sends it back with revision notes for regeneration, or rejects it — no AI-generated content reaches a student without tutor sign-off.
- **Performance** — the tutor's own session volume and average student score trend over time.

### 4.3 Student tools
- **My Home** — upcoming session, current streak, recent achievements, study hours.
- **My Subjects** — per-subject score, trend, and module progress.
- **My Schedule** — upcoming and past sessions.
- **Goals** — personal targets (e.g., reach a target score, complete N sessions, hit a streak) with progress toward each.
- **Homework** — assignments approved by their tutor, with due dates and completion tracking.

## 5. AI Safety and Data Controls

Because Menya serves K-12 minors, AI-generated content and student data are handled under explicit constraints, not left to model discretion:

- **Scoped generation.** Every AI-generated project or practice set is constrained by that student's own diagnostic results, current curriculum level, and local community context — it is never an open-ended prompt to a general-purpose model.
- **Mandatory human review.** No AI-generated assignment reaches a student without a tutor first approving it, sending it back for revision, or rejecting it outright. The tutor is the quality gate, not the AI.
- **Student data privacy.** Student data is stored with FERPA-aligned privacy protections and is not shared with third parties.

## 6. Sustainability & Business Model

Menya is designed to remain accessible to the small nonprofits that need it most while remaining sustainable to build and operate:

- **Core platform: free** for small nonprofit tutoring organizations — no per-student licensing fee, consistent with serving under-resourced programs rather than gatekeeping access.
- **Premium funder-reporting tier** for larger organizations or multi-site programs that need expanded analytics, custom report formats, or multi-program administration.
- **Grant funding** (e.g., NSF, Gates Foundation, and comparable education/digital-equity funders) to underwrite hosting, maintenance, and continued development for the free tier.
- **University research partnerships**, using longitudinal, anonymized outcome data to study tutoring impact — a mutually beneficial arrangement that can also bring in research funding.
- **STEM industry sponsorships**, particularly to support and expand the career-development / mentor-matching pathway.
- **Development model:** built and maintained by a sole developer today, with a roadmap to bring on additional engineering capacity as partner organizations and usage scale.

## 7. Product Roadmap

- **Phase 1 — MVP (current):** Diagnostics, curriculum library, scheduling, and role-based dashboards (director, tutor, student) for a single-organization deployment.
- **Phase 2 — AI project generation:** AI-generated, tutor-reviewed practice assignments and STEM project briefs (the AI Curriculum Review workflow described above), including localized, community-grounded content.
- **Phase 3 — Funder reporting & multi-org deployment:** Expanded, exportable funder/outcome reporting, multi-organization administration, and onboarding tooling that lets additional nonprofit partners adopt Menya without custom development or dedicated technical staff.

## 8. Expected Impact

| Area | Expected effect |
|---|---|
| **Program-level visibility** | Program directors get a live, single-source view of enrollment, session volume, and score trends — replacing manual spreadsheet compilation and giving earlier warning on at-risk students. |
| **Tutor capacity** | Consolidating scheduling, caseload tracking, and homework prep into one workflow frees tutor time for instruction; the AI review queue turns worksheet *authoring* into a faster accept/revise decision. |
| **Personalization at scale** | Per-student subject tracking plus AI-generated, gap-targeted, locally-grounded assignments make 1:1-level differentiation feasible across a full caseload, not just a hand-picked few students. |
| **Student engagement** | A single place for schedule, goals, streaks, and achievements — plus homework that reflects a student's own neighborhood — is expected to increase session follow-through and homework completion versus generic materials. |
| **Instructional quality control** | The tutor approve/revise/reject loop keeps a human expert as the final gate on AI-generated content, and the aggregated pending/approved/revision/rejected counts double as a live quality signal on the AI itself. |
| **Reporting & funder accountability** | Analytics (score trends, session volume, subject breakdowns) give programs ready-made data for grant reporting and outcome evaluation without extra manual work. |

## 9. Proposed Pilot

For a first partner organization, the pilot is scoped to be low-lift to join and low-risk to try:

1. **Discovery** — a short conversation to map your current scheduling, curriculum, and progress-tracking process, and identify where Menya fits your workflow.
2. **Configuration** — set up your organization, tutors, and initial student roster in Menya; no technical staff required on your side.
3. **Tutor onboarding** — a walkthrough of the tutor and program-director tools with your team.
4. **Pilot period** — run one program cycle (e.g., a semester) using Menya for scheduling, curriculum, and progress tracking, with the AI Curriculum Review queue available once diagnostics are populated.
5. **Feedback & iteration** — structured check-ins to capture what's working, what's missing, and what should change before wider rollout.
6. **Decision point** — jointly assess results and agree on next steps, whether that's continued use, expanded rollout to more tutors/students, or a formal letter of support for continued partnership.

There is no cost to the organization for the pilot; the ask is your team's time for onboarding and feedback.

## 10. Scope of This Engagement

- [ ] Define initial rollout population (number of students, tutors, subjects, grade bands)
- [ ] Define data migration needs from existing systems (spreadsheets, other tools)
- [ ] Define integration needs (video conferencing for sessions, SSO, existing SIS if any)
- [ ] Define success metrics (adoption by role, tutor time saved, homework completion rate, score trend, AI approval/revision rate)
- [ ] Define admin/permissions model for multi-site or multi-program organizations
- [ ] Define timeline, pilot cohort, and rollout phases (e.g., program dashboard first, AI review second)

## 11. Next Steps

1. Schedule a discovery call to walk through your current tools and identify pilot fit.
2. Agree on pilot scope (Section 9) and target start date.
3. Configure your organization in Menya and onboard your first cohort of tutors.

---

**Sources cited above:**
Center for American Progress. (2025). *How States and Districts Can Close the Digital Divide to Increase College and Career Readiness.*
Education Week. (2025). *Parents Want After-School Programs, But Demand Far Outpaces Supply.*
Learn To Be Foundation. (2025). *Adaptive and Persistent Problem Module (APPM): Improving the Learn To Be Model of Free One-on-One Online Tutoring for Underserved Communities.* LA2050.
