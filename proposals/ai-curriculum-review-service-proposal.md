# Service Proposal: AI-Generated, Tutor-Reviewed Curriculum

**Prepared for:** [Client / Partner Organization]
**Prepared by:** Menya
**Date:** July 3, 2026
**Contact:** iragaba.umubyeyi@gmail.com

---

## 1. Overview

Menya proposes an AI-Generated Curriculum service: an engine that produces personalized practice assignments for each student, contextualized to their academic gaps and their lived environment, with every assignment reviewed and approved by a human tutor before it reaches a student.

This service sits inside Menya's existing tutor and student workflow — surfaced today as the "AI Curriculum Review" queue — and turns tutor judgment into the final quality gate on AI-generated instructional content, rather than a replacement for it.

## 2. The Problem

Nonprofit tutoring organizations serve high student-to-tutor ratios with limited prep time. Two consequences follow:

- **Generic practice sets.** Tutors reuse the same worksheets across students because there isn't time to hand-tailor problems to each student's specific gap (e.g., "88% in Pre-Alg but weak on polynomial manipulation").
- **Low relevance, low engagement.** Word problems reference contexts students don't recognize, which adds a comprehension tax on top of the math itself — a known drag on engagement and retention for students from under-resourced communities.

## 3. How It Works

1. **Diagnose.** The system continuously tracks per-subject performance, trend (up/down/flat), and session history for each student (`studentSubjectDetail`, `studentSessionHistory`).
2. **Generate.** When a gap or an opportunity to extend mastery is detected, the AI drafts a problem set — title, difficulty, estimated duration, and task list — targeted at that specific gap, and writes a short rationale (`aiNote`) explaining why this set was generated for this student.
3. **Localize.** Word problems are grounded in the student's real neighborhood and city (e.g., a garden bed problem for a student in Chicago's Peterson Garden Project; an MBTA fare problem for a student in Boston; a market-stall problem for a student near Detroit's Eastern Market), making abstract math tangible and personally relevant.
4. **Review.** Every generated set lands in the tutor's AI Curriculum Review queue in a `pending` state. The tutor can:
   - **Approve & Assign** — sets a due date and pushes it to the student's homework list.
   - **Request Revision** — sends structured feedback (e.g., "Sofia is already at 88%+ — these are too easy, regenerate at Intermediate difficulty") back to the AI for a new draft.
   - **Reject** — discards the set entirely.
5. **Assign & track.** Approved sets become tracked `HomeworkItem`s with due dates and completion percentages, visible to both student and tutor.

No AI-generated content reaches a student without explicit tutor sign-off.

## 4. Expected Impact

| Area | Expected effect |
|---|---|
| **Tutor time** | Reduces per-student prep time by shifting tutors from *authoring* problem sets to *reviewing/approving* them — turning a from-scratch writing task into a faster accept/revise decision. |
| **Personalization at scale** | Enables 1:1-level differentiation (right gap, right difficulty, right student) across a full caseload, which is not feasible to hand-author for every student every week. |
| **Engagement & relevance** | Localized, culturally grounded word problems are expected to increase completion rates and reduce the "this doesn't apply to me" drop-off common in generic worksheets. |
| **Instructional quality control** | The revision loop (tutor note → AI regenerates) keeps a human expert as the final quality gate, catching miscalibrated difficulty before it reaches a student — as already demonstrated in the workflow (e.g., the Sofia radicals set flagged and sent back for being too easy). |
| **Program-level visibility** | Aggregated pending/approved/revision/rejected counts give program leads a live view of how much AI-generated content is actually being trusted and used by tutors, which doubles as a quality signal on the AI itself. |

## 5. Scope of This Engagement

- [ ] Define target student population / grade bands / subjects for initial rollout
- [ ] Define data sources for "student context" (location, subject scores, session history) and privacy handling
- [ ] Define success metrics (e.g., tutor approval rate, revision rate, homework completion rate, score trend post-assignment)
- [ ] Define tutor workload assumptions (queue volume per tutor per week)
- [ ] Define timeline and pilot cohort size

## 6. Investment & Timeline

*[To be filled in based on pilot scope, number of students/tutors, and engagement length.]*

## 7. Next Steps

*[To be filled in.]*
