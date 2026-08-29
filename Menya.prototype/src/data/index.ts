import type { Student, Session, CurriculumCourse, CurriculumChapter, Tutor, CourseDetail, SessionRecord, AlumniRecord, AttendanceSession, AttendanceScope, AttendanceEntry, LibrarySearchQuery } from "../types";

export const CURRENT_STUDENT_ID = 3;
// Fallback used only if a logged-in tutor's AuthUser.tutorId is somehow missing —
// the real tutor identity comes from useAuth().user.tutorId, set at sign-in.
export const CURRENT_TUTOR_ID = 5;

export const students: Student[] = [
  { id: 1, name: "Aaliyah Johnson",  grade: 7, courses: ["Algebra", "Algebra II"],     progress: 78, sessions: 12, streak: 5, status: "on-track",      location: "Atlanta, GA"    },
  { id: 2, name: "Marcus Rivera",    grade: 8, courses: ["Calculus", "Geometry"],      progress: 64, sessions: 8,  streak: 2, status: "needs-support", location: "San Antonio, TX" },
  { id: 3, name: "Sofia Patel",      grade: 6, courses: ["Geometry", "Pre-Alg"],       progress: 91, sessions: 15, streak: 8, status: "exceeding",     location: "Chicago, IL"    },
  { id: 4, name: "DeShawn Williams", grade: 9, courses: ["Pre-Calculus", "Algebra II"],progress: 55, sessions: 6,  streak: 1, status: "at-risk",       location: "Detroit, MI"    },
  { id: 5, name: "Isabella Chen",    grade: 7, courses: ["Algebra II", "Statistics"],  progress: 83, sessions: 11, streak: 4, status: "on-track",      location: "Oakland, CA"    },
  { id: 6, name: "Jaylen Brooks",    grade: 8, courses: ["Calculus", "Algebra"],       progress: 70, sessions: 9,  streak: 3, status: "on-track",      location: "Baltimore, MD"  },
  { id: 7, name: "Amara Osei",       grade: 6, courses: ["Pre-Alg", "Geometry"],       progress: 88, sessions: 14, streak: 6, status: "exceeding",     location: "Columbus, OH"   },
  { id: 8, name: "Noah Fitzgerald",  grade: 9, courses: ["Pre-Calculus", "Calculus"],  progress: 61, sessions: 7,  streak: 1, status: "needs-support", location: "Boston, MA"     },
  // Grades 10-12 previously had no seed students at all, which left Francoise's
  // (tutorId 5 — the default tutor login) in-person Grades 10,11,12 sessions with
  // an empty roster and no attendance data despite being the default account.
  { id: 9,  name: "Ethan Brooks",   grade: 10, courses: ["Pre-Calculus", "Calculus"], progress: 74, sessions: 10, streak: 3, status: "on-track",      location: "Denver, CO"     },
  { id: 10, name: "Priya Nair",     grade: 11, courses: ["Calculus"],                 progress: 89, sessions: 13, streak: 7, status: "exceeding",     location: "Seattle, WA"    },
];

export const sessions: Session[] = [
  { id: 1,  student: "Aaliyah Johnson",  tutorId: 1, course: "Algebra",       time: "Today",    clock: "3:30 PM", duration: 60, status: "upcoming", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 2,  student: "Marcus Rivera",    tutorId: 2, course: "Calculus",      time: "Today",    clock: "4:00 PM", duration: 45, status: "upcoming", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 3,  student: "Sofia Patel",      tutorId: 3, course: "Pre-Alg",       time: "Today",    clock: "4:30 PM", duration: 60, status: "in-progress", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 4,  student: "Isabella Chen",    tutorId: 2, course: "Algebra II",    time: "Tomorrow", clock: "2:00 PM", duration: 60, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 5,  student: "DeShawn Williams", tutorId: 4, course: "Pre-Calculus",  time: "Tomorrow", clock: "3:00 PM", duration: 45, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 6,  student: "Jaylen Brooks",    tutorId: 1, course: "Algebra",       time: "Jun 22",   clock: "2:30 PM", duration: 60, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 7,  student: "Amara Osei",       tutorId: 4, course: "Geometry",      time: "Jun 22",   clock: "3:00 PM", duration: 45, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 8,  student: "Noah Fitzgerald",  tutorId: 5, course: "Calculus",      time: "Today",    clock: "5:00 PM", duration: 60, status: "upcoming", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 9,  student: "DeShawn Williams", tutorId: 5, course: "Pre-Calculus",  time: "Jun 22",   clock: "4:30 PM", duration: 60, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 10, student: "Sofia Patel",      tutorId: 5, course: "Pre-Alg",       time: "Jun 23",   clock: "3:00 PM", duration: 60, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 11, student: "DeShawn Williams", tutorId: 5, course: "Pre-Calculus",  time: "Today",    clock: "1:00 PM", duration: 60, status: "upcoming", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  // In-person group sessions — same shape "Add Session"/Notify Tutors publish, but
  // pre-seeded with past dates so a tutor's Schedule > In-Person > Session History
  // isn't empty on first load.
  { id: 12, student: "Grades 6, 7 Group",       tutorId: 1, course: "All Courses", date: "2026-08-10", time: "Aug 10", clock: "6:00 PM", duration: 120, status: "scheduled", type: "tutoring", location: "in-person" },
  // Co-tutored: same group/date/time as id 12, second tutor assigned — demonstrates
  // that the roll call one of them logs is visible to both (see attendanceForSession).
  { id: 18, student: "Grades 6, 7 Group",       tutorId: 3, course: "All Courses", date: "2026-08-10", time: "Aug 10", clock: "6:00 PM", duration: 120, status: "scheduled", type: "tutoring", location: "in-person" },
  { id: 13, student: "Grades 8, 9 Group",       tutorId: 4, course: "All Courses", date: "2026-08-12", time: "Aug 12", clock: "6:00 PM", duration: 120, status: "scheduled", type: "tutoring", location: "in-person" },
  { id: 14, student: "Grades 10, 11, 12 Group", tutorId: 5, course: "All Courses", date: "2026-08-10", time: "Aug 10", clock: "6:00 PM", duration: 120, status: "scheduled", type: "tutoring", location: "in-person" },
  { id: 15, student: "Grades 10, 11, 12 Group", tutorId: 5, course: "All Courses", date: "2026-08-17", time: "Aug 17", clock: "6:00 PM", duration: 120, status: "scheduled", type: "tutoring", location: "in-person" },
  { id: 16, student: "Grades 8, 9 Group",       tutorId: 2, course: "All Courses", date: "2026-08-19", time: "Aug 19", clock: "6:00 PM", duration: 120, status: "scheduled", type: "tutoring", location: "in-person" },
  { id: 17, student: "Pre-Alg Group",           tutorId: 3, course: "Pre-Alg",     date: "2026-08-12", time: "Aug 12", clock: "6:00 PM", duration: 120, status: "scheduled", type: "tutoring", location: "in-person" },
  { id: 19, student: "Grades 6, 7 Group",       tutorId: 1, course: "All Courses", date: "2026-08-03", time: "Aug 3",  clock: "6:00 PM", duration: 120, status: "scheduled", type: "tutoring", location: "in-person" },
];

// Curriculum library — math courses only for now (other courses to follow later).
// Each course (course) is broken into chapters, and each chapter into named modules.
export const curriculum: CurriculumCourse[] = [
  {
    id: 1, name: "Algebra", grade: "7–8", students: 108,
    description: "Master linear equations, inequalities, and graphing — the foundation for every math course that follows.",
    chapters: [
      { id: 101, title: "Linear Equations & Inequalities", difficulty: "Beginner", modules: [
        { title: "Solving One-Step Equations", status: "completed",
          description: "Solve equations that take a single inverse operation to isolate the variable.",
          diagram: { kind: "balance-scale", leftLabel: "x + 5", rightLabel: "12", caption: "A balanced equation — whatever you do to one side, do to the other." },
          content: [
            "A one-step equation only needs one inverse operation to isolate the variable. If the equation adds or subtracts a number, undo it with the opposite operation; if it multiplies or divides, undo it with the opposite operation.",
            "Whatever you do to one side, you must do to the other to keep the equation balanced. For example, in x + 5 = 12, subtract 5 from both sides to get x = 7.",
          ],
          exercises: [
            { prompt: "Solve for x: x + 9 = 16.", answer: "Subtract 9 from both sides: x = 16 − 9 = 7.", type: "multiple-choice", choices: [{ label: "x = 7" }, { label: "x = 25" }, { label: "x = −7" }, { label: "x = 9" }], correctIndex: 0, hint: "Undo the +9 by subtracting 9 from both sides." },
            { prompt: "Solve for x: x − 4 = 10.", answer: "Add 4 to both sides: x = 10 + 4 = 14.", type: "multiple-choice", choices: [{ label: "x = 14" }, { label: "x = 6" }, { label: "x = −14" }, { label: "x = 40" }], correctIndex: 0, hint: "Undo the −4 by adding 4 to both sides." },
            { prompt: "Solve for x: 5x = 35.", answer: "Divide both sides by 5: x = 35 ÷ 5 = 7.", type: "multiple-choice", choices: [{ label: "x = 7" }, { label: "x = 30" }, { label: "x = 175" }, { label: "x = 40" }], correctIndex: 0, hint: "Undo the ×5 by dividing both sides by 5." },
          ] },
        { title: "Solving Multi-Step Equations", status: "completed",
          description: "Solve equations that require combining like terms and more than one inverse operation.",
          diagram: { kind: "step-sequence", steps: ["Distribute: 2(x+3) = 2x + 6", "Set equal: 2x + 6 = 16", "Subtract 6: 2x = 10", "Divide by 2: x = 5"], caption: "Solving 2(x + 3) = 16 step by step." },
          content: [
            "Multi-step equations often need you to simplify first — distribute parentheses, combine like terms — before isolating the variable. A common order: distribute, combine like terms on each side, then undo addition/subtraction before multiplication/division.",
            "For example, 2(x + 3) = 16 becomes 2x + 6 = 16, then 2x = 10, then x = 5.",
          ],
          exercises: [
            { prompt: "Solve for x: 2x + 3 = 11.", answer: "Subtract 3: 2x = 8. Divide by 2: x = 4.", type: "multiple-choice", choices: [{ label: "x = 4" }, { label: "x = 7" }, { label: "x = 5.5" }, { label: "x = −4" }], correctIndex: 0, hint: "Subtract 3 from both sides first, then divide by 2." },
            { prompt: "Solve for x: 3(x − 2) = 15.", answer: "Distribute: 3x − 6 = 15. Add 6: 3x = 21. Divide by 3: x = 7.", type: "multiple-choice", choices: [{ label: "x = 7" }, { label: "x = 5" }, { label: "x = 21" }, { label: "x = −7" }], correctIndex: 0, hint: "Distribute the 3 across (x − 2) before isolating x." },
            { prompt: "Solve for x: 4x − 5 = 2x + 9.", answer: "Subtract 2x from both sides: 2x − 5 = 9. Add 5: 2x = 14. Divide by 2: x = 7.", type: "multiple-choice", choices: [{ label: "x = 7" }, { label: "x = 2" }, { label: "x = 14" }, { label: "x = −7" }], correctIndex: 0, hint: "Get all the x terms on one side first by subtracting 2x from both sides." },
          ] },
        { title: "Graphing Linear Inequalities", status: "in-progress",
          description: "Learn how to graph the solution set of a linear inequality on the coordinate plane.",
          diagram: { kind: "graph", family: "linear-inequality", m: 3, b: 2, op: "<", caption: "y < 3x + 2 — dashed boundary line, shaded below." },
          content: [
            "A linear inequality like y > 2x − 1 has infinitely many solutions, and graphing lets you see all of them at once. Start by graphing the boundary line as if it were an equation — use a dashed line for > or < and a solid line for ≥ or ≤.",
            "Then shade the half-plane that satisfies the inequality. Pick a test point not on the line (the origin is usually easiest) and plug it in: if it makes the inequality true, shade that side; if not, shade the other side.",
          ],
          exercises: [
            { prompt: "Graph y < 3x + 2, choosing the correct line style and shaded region.", answer: "< is strict, so the boundary is dashed. Testing (0,0): 0 < 3(0)+2 = 2 is true, so shade the side containing the origin — below the line.", type: "multiple-choice", choices: [{ label: "Dashed line, shade below the line" }, { label: "Solid line, shade below the line" }, { label: "Dashed line, shade above the line" }, { label: "Solid line, shade above the line" }], correctIndex: 0, hint: "Strict inequalities (< or >) get a dashed line — test the origin to decide which side to shade." },
            { prompt: "Graph y ≥ −x + 4 and pick two points inside the shaded region to verify.", answer: "≥ is inclusive, so the boundary is solid. Testing (0,5): 5 ≥ −0+4 = 4 is true, so shade above the line.", type: "multiple-choice", choices: [{ label: "Solid line, shade above the line — e.g. (0, 5) and (5, 5)" }, { label: "Dashed line, shade above the line — e.g. (0, 5) and (5, 5)" }, { label: "Solid line, shade below the line — e.g. (0, 0) and (1, 1)" }, { label: "Dashed line, shade below the line — e.g. (0, 0) and (1, 1)" }], correctIndex: 0, hint: "Inclusive inequalities (≥ or ≤) get a solid line — check whether (0,0) makes the inequality true." },
            { prompt: "Convert 2x + y ≤ 6 to slope-intercept form, then graph it.", answer: "Subtract 2x from both sides: y ≤ −2x + 6. ≤ is inclusive, so solid line, shaded below.", type: "multiple-choice", choices: [{ label: "y ≤ −2x + 6 — solid line, shade below" }, { label: "y ≥ −2x + 6 — solid line, shade above" }, { label: "y ≤ 2x + 6 — dashed line, shade below" }, { label: "y ≤ −2x + 6 — dashed line, shade below" }], correctIndex: 0, hint: "Solve for y first to put it in slope-intercept form, then check which side to shade." },
          ] },
        { title: "Compound Inequalities", status: "not-started",
          description: "Solve and graph inequalities that combine two conditions with 'and' or 'or'.",
          diagram: { kind: "number-line", min: -5, max: 5, step: 1, intervals: [{ from: -2, to: 3, fromOpen: false, toOpen: true }], caption: "x ≥ −2 and x < 3 — solid dot at −2, open circle at 3." },
          content: [
            "A compound inequality joins two inequalities with 'and' (both must be true — the overlap) or 'or' (at least one must be true — the union). An 'and' inequality like −2 < x ≤ 5 can be written as one chain and graphed as a single segment between the boundary points.",
            "Solve each part the same way you'd solve a regular inequality — and remember to flip both inequality signs if you multiply or divide by a negative number.",
          ],
          exercises: [
            { prompt: "Solve and graph: −3 < x + 1 ≤ 4.", answer: "Subtract 1 from all three parts: −3 − 1 < x ≤ 4 − 1, so −4 < x ≤ 3.", type: "multiple-choice", choices: [{ label: "−4 < x ≤ 3" }, { label: "−2 < x ≤ 5" }, { label: "−4 ≤ x < 3" }, { label: "−4 < x < 3" }], correctIndex: 0, hint: "Do the same operation to all three parts of the inequality at once." },
            { prompt: "Solve: 2x − 1 < 5 or x > 8.", answer: "Solve the first part: 2x − 1 < 5 → 2x < 6 → x < 3. Since it's 'or', the solution is everything satisfying either part: x < 3 or x > 8.", type: "multiple-choice", choices: [{ label: "x < 3 or x > 8" }, { label: "x < 3 and x > 8" }, { label: "x > 3 or x > 8" }, { label: "x < 6 or x > 8" }], correctIndex: 0, hint: "Solve each inequality separately, then combine with 'or' — either condition being true is enough." },
            { prompt: "Graph the compound inequality x ≥ −2 and x < 3 on a number line.", answer: "≥ includes −2, so it gets a solid dot; < excludes 3, so it gets an open circle. Shade the segment connecting them since it's 'and'.", type: "multiple-choice", choices: [{ label: "Solid dot at −2, open circle at 3, shaded between" }, { label: "Open circle at −2, solid dot at 3, shaded between" }, { label: "Solid dots at both −2 and 3, shaded between" }, { label: "Open circles at both −2 and 3, shaded between" }], correctIndex: 0, hint: "≥ or ≤ means a filled/solid dot; strict < or > means an open circle." },
          ] },
      ], test: [
        { prompt: "Solve for x: x + 12 = 20.", answer: "x = 8" },
        { prompt: "Solve for x: x/3 = 9.", answer: "x = 27" },
        { prompt: "Solve for x: 5x − 4 = 21.", answer: "x = 5" },
        { prompt: "Solve for x: 3x + 2 = x + 14.", answer: "x = 6" },
        { prompt: "Graph the inequality y > −2x + 1.", answer: "Dashed line (slope −2, y-intercept 1); shade above the line since (0,0) fails the inequality (0 > 1 is false)." },
        { prompt: "Given the point (3, 1), determine whether it's a solution to y ≤ x + 2 and justify your answer.", answer: "Yes — substituting (3, 1): 1 ≤ 3 + 2 = 5 is true, so (3, 1) satisfies the inequality." },
        { prompt: "Solve and graph: −1 ≤ x − 2 < 4.", answer: "1 ≤ x < 6" },
        { prompt: "Solve: 3x + 2 > 11 or x < −5.", answer: "x > 3 or x < −5" },
      ] },
      { id: 102, title: "Quadratic Equations", difficulty: "Intermediate", modules: [
        { title: "Factoring Quadratics", status: "completed",
          description: "Factor quadratic expressions into two binomials to solve equations and find roots.",
          diagram: { kind: "graph", family: "quadratic", a: 1, bq: -1, c: -12, markPoints: [{ x: -3, y: 0, label: "−3" }, { x: 4, y: 0, label: "4" }], domain: [-5, 6], caption: "x² − x − 12 = (x − 4)(x + 3) — zeros at x = −3 and x = 4." },
          content: [
            "Factoring a quadratic like x² + bx + c means finding two numbers that multiply to c and add to b, then writing it as (x + p)(x + q). Once factored, the zero product property says the expression equals zero exactly when one of the factors does.",
            "For example, x² + 5x + 6 factors as (x + 2)(x + 3), since 2 × 3 = 6 and 2 + 3 = 5. Setting each factor to zero gives x = −2 or x = −3.",
          ],
          exercises: [
            { prompt: "Factor: x² + 7x + 10.", answer: "Find two numbers that multiply to 10 and add to 7: 2 and 5. So x² + 7x + 10 = (x + 2)(x + 5).", type: "multiple-choice", choices: [{ label: "(x + 2)(x + 5)" }, { label: "(x + 1)(x + 10)" }, { label: "(x − 2)(x − 5)" }, { label: "(x + 10)(x − 1)" }], correctIndex: 0, hint: "Look for two numbers that multiply to 10 and add to 7." },
            { prompt: "Factor: x² − x − 12.", answer: "Find two numbers that multiply to −12 and add to −1: −4 and 3. So x² − x − 12 = (x − 4)(x + 3).", type: "multiple-choice", choices: [{ label: "(x − 4)(x + 3)" }, { label: "(x + 4)(x − 3)" }, { label: "(x − 12)(x + 1)" }, { label: "(x − 6)(x + 2)" }], correctIndex: 0, hint: "Look for two numbers that multiply to −12 and add to −1." },
            { prompt: "Solve by factoring: x² − 9 = 0.", answer: "x² − 9 = (x − 3)(x + 3) = 0, so x = 3 or x = −3 (difference of squares).", type: "multiple-choice", choices: [{ label: "x = 3 or x = −3" }, { label: "x = 9 or x = −9" }, { label: "x = 3 only" }, { label: "x = 0 or x = 9" }], correctIndex: 0, hint: "This is a difference of squares: a² − b² = (a − b)(a + b)." },
          ] },
        { title: "Completing the Square", status: "completed",
          description: "Rewrite a quadratic in vertex form by completing the square, revealing its vertex directly.",
          diagram: { kind: "graph", family: "quadratic", a: 1, bq: 6, c: 5, markPoints: [{ x: -3, y: -4, label: "(−3, −4)" }], domain: [-7, 2], caption: "y = x² + 6x + 5 = (x + 3)² − 4 — vertex at (−3, −4)." },
          content: [
            "To complete the square for x² + bx, add and subtract (b/2)² to form a perfect square trinomial: x² + bx = (x + b/2)² − (b/2)². This rewrites the quadratic in vertex form y = a(x − h)² + k, where (h, k) is the vertex.",
            "For example, x² + 6x + 5 becomes (x + 3)² − 9 + 5 = (x + 3)² − 4, so the vertex is at (−3, −4).",
          ],
          exercises: [
            { prompt: "Complete the square: x² + 4x + 1.", answer: "Half of 4 is 2, and 2² = 4. x² + 4x + 4 − 4 + 1 = (x + 2)² − 3.", type: "multiple-choice", choices: [{ label: "(x + 2)² − 3" }, { label: "(x + 2)² + 1" }, { label: "(x + 4)² − 15" }, { label: "(x + 2)² + 3" }], correctIndex: 0, hint: "Take half of the x-coefficient, square it, then add and subtract that value." },
            { prompt: "Complete the square: x² − 8x + 10.", answer: "Half of −8 is −4, and (−4)² = 16. x² − 8x + 16 − 16 + 10 = (x − 4)² − 6.", type: "multiple-choice", choices: [{ label: "(x − 4)² − 6" }, { label: "(x − 4)² + 10" }, { label: "(x − 8)² − 54" }, { label: "(x − 4)² + 6" }], correctIndex: 0, hint: "Half of −8 is −4 — square it to find what to add and subtract." },
            { prompt: "Find the vertex of y = x² + 6x + 5 by completing the square.", answer: "x² + 6x + 5 = (x + 3)² − 9 + 5 = (x + 3)² − 4, so the vertex is (−3, −4).", type: "multiple-choice", choices: [{ label: "(−3, −4)" }, { label: "(3, −4)" }, { label: "(−3, 4)" }, { label: "(6, 5)" }], correctIndex: 0, hint: "Complete the square first — vertex form (x − h)² + k gives the vertex directly as (h, k)." },
          ] },
        { title: "The Quadratic Formula", status: "completed",
          description: "Use the quadratic formula to solve any quadratic equation, including ones that don't factor nicely.",
          diagram: { kind: "graph", family: "quadratic", a: 1, bq: 5, c: 6, markPoints: [{ x: -2, y: 0, label: "−2" }, { x: -3, y: 0, label: "−3" }], domain: [-6, 2], caption: "x² + 5x + 6 = 0 — the quadratic formula gives x = −2 and x = −3." },
          content: [
            "The quadratic formula, x = (−b ± √(b² − 4ac)) / (2a), solves any equation of the form ax² + bx + c = 0. The expression under the square root, b² − 4ac, is the discriminant — it tells you how many real solutions exist: positive means two, zero means one, negative means none (real).",
            "Always identify a, b, and c carefully first, including their signs, before substituting into the formula.",
          ],
          exercises: [
            { prompt: "Use the quadratic formula to solve x² + 5x + 6 = 0.", answer: "a=1, b=5, c=6: x = (−5 ± √(25−24))/2 = (−5 ± 1)/2, giving x = −2 or x = −3.", type: "multiple-choice", choices: [{ label: "x = −2 or x = −3" }, { label: "x = 2 or x = 3" }, { label: "x = −1 or x = −6" }, { label: "x = 5 or x = 6" }], correctIndex: 0, hint: "Identify a, b, c carefully, then substitute into x = (−b ± √(b² − 4ac)) / (2a)." },
            { prompt: "Find the discriminant of 2x² − 4x + 1 = 0 and state how many real solutions it has.", answer: "Discriminant = b² − 4ac = (−4)² − 4(2)(1) = 16 − 8 = 8. Positive means two real solutions.", type: "multiple-choice", choices: [{ label: "8 — two real solutions" }, { label: "−8 — no real solutions" }, { label: "24 — two real solutions" }, { label: "0 — one real solution" }], correctIndex: 0, hint: "The discriminant is b² − 4ac — its sign, not its exact value, tells you how many real solutions there are." },
            { prompt: "Solve x² − 4x + 4 = 0 using the quadratic formula.", answer: "Discriminant = 16 − 16 = 0, so there's one repeated solution: x = 4/2 = 2.", type: "multiple-choice", choices: [{ label: "x = 2 (one repeated solution)" }, { label: "x = −2 (one repeated solution)" }, { label: "x = 4 (one repeated solution)" }, { label: "x = 2 or x = −2 (two solutions)" }], correctIndex: 0, hint: "Check the discriminant first — if it's 0, there's only one repeated solution." },
          ] },
        { title: "Graphing Parabolas", status: "in-progress",
          description: "Learn to graph quadratic functions by identifying the vertex, axis of symmetry, and direction of opening.",
          diagram: { kind: "graph", family: "quadratic", a: 1, bq: -4, c: 3, markPoints: [{ x: 2, y: -1, label: "(2, −1)" }], caption: "y = x² − 4x + 3 — vertex at (2, −1)." },
          content: [
            "Every parabola from y = ax² + bx + c has a vertex — its highest or lowest point — found at x = −b/(2a). The sign of a tells you whether the parabola opens upward (a > 0) or downward (a < 0).",
            "Once you have the vertex, plot a couple of points on either side using symmetry, then sketch the smooth U-shaped curve through them.",
          ],
          exercises: [
            { prompt: "Find the vertex of y = x² − 4x + 3, then sketch the graph.", answer: "Vertex x = −b/(2a) = 4/2 = 2; y = (2)² − 4(2) + 3 = −1. Since a = 1 > 0, it opens upward.", type: "multiple-choice", choices: [{ label: "Vertex (2, −1); opens upward" }, { label: "Vertex (2, 1); opens upward" }, { label: "Vertex (−2, −1); opens downward" }, { label: "Vertex (4, 3); opens upward" }], correctIndex: 0, hint: "The vertex's x-coordinate is −b/(2a) — plug that back into the equation to find y." },
            { prompt: "Graph y = −2x² + 8x − 5 and label the axis of symmetry.", answer: "Axis of symmetry: x = −b/(2a) = −8/(2·−2) = 2. Since a = −2 < 0, the parabola opens downward.", type: "multiple-choice", choices: [{ label: "x = 2; opens downward" }, { label: "x = −2; opens downward" }, { label: "x = 4; opens downward" }, { label: "x = 2; opens upward" }], correctIndex: 0, hint: "The axis of symmetry is the vertical line x = −b/(2a)." },
            { prompt: "Compare the graphs of y = x² and y = 2x² — how does the coefficient change the shape?", answer: "Multiplying by a factor greater than 1 stretches the parabola vertically, making it narrower and steeper for the same x-values.", type: "multiple-choice", choices: [{ label: "y = 2x² is narrower — it rises more steeply" }, { label: "y = 2x² is wider — it rises less steeply" }, { label: "y = 2x² is the same shape, shifted right" }, { label: "y = 2x² is the same shape, shifted up" }], correctIndex: 0, hint: "Think about how multiplying by a number greater than 1 affects how quickly the outputs grow." },
          ] },
      ], test: [
        { prompt: "Factor: x² + 8x + 15.", answer: "(x + 3)(x + 5)" },
        { prompt: "Solve by factoring: x² + 6x + 8 = 0.", answer: "x = −2 or x = −4" },
        { prompt: "Complete the square: x² + 10x + 21.", answer: "(x + 5)² − 4" },
        { prompt: "Find the vertex of y = x² − 2x − 3 by completing the square.", answer: "(x − 1)² − 4, vertex (1, −4)" },
        { prompt: "Use the quadratic formula to solve x² + 2x − 8 = 0.", answer: "x = 2 or x = −4" },
        { prompt: "Find the discriminant of x² + x + 3 = 0 and state how many real solutions it has.", answer: "Discriminant = 1 − 12 = −11 (negative) — no real solutions" },
        { prompt: "Find the vertex and axis of symmetry of y = 2x² − 12x + 7.", answer: "Vertex (3, −11); axis of symmetry x = 3." },
        { prompt: "Sketch y = −x² + 4 and label its vertex and x-intercepts.", answer: "Vertex (0, 4), opens downward; x-intercepts at (−2, 0) and (2, 0)." },
      ] },
      { id: 103, title: "Systems of Equations", difficulty: "Advanced", modules: [
        { title: "Solving by Substitution", status: "not-started",
          description: "Solve a system of equations by solving one equation for a variable and substituting into the other.",
          diagram: { kind: "graph", family: "linear-system", m: 1, b: 2, m2: -2, b2: 11, markPoints: [{ x: 3, y: 5, label: "(3, 5)" }], domain: [-1, 7], caption: "y = x + 2 and y = −2x + 11 intersect at (3, 5)." },
          content: [
            "Substitution works well when one equation is already solved for a variable (or can easily be). Solve one equation for x or y, then substitute that expression into the other equation to get a single-variable equation you can solve directly.",
            "Once you find one variable, substitute it back into either original equation to find the other.",
          ],
          exercises: [
            { prompt: "Solve by substitution: y = x + 2 and 2x + y = 11.", answer: "Substitute y = x + 2 into 2x + y = 11: 2x + x + 2 = 11 → 3x = 9 → x = 3, so y = 3 + 2 = 5.", type: "multiple-choice", choices: [{ label: "x = 3, y = 5" }, { label: "x = 5, y = 3" }, { label: "x = 3, y = 3" }, { label: "x = −3, y = −1" }], correctIndex: 0, hint: "Substitute the expression for y directly into the second equation." },
            { prompt: "Solve by substitution: x = 2y and x + y = 12.", answer: "Substitute x = 2y into x + y = 12: 2y + y = 12 → 3y = 12 → y = 4, so x = 2(4) = 8.", type: "multiple-choice", choices: [{ label: "y = 4, x = 8" }, { label: "y = 8, x = 4" }, { label: "y = 6, x = 12" }, { label: "y = 4, x = 4" }], correctIndex: 0, hint: "Replace x with 2y in the second equation before solving." },
            { prompt: "Solve by substitution: y = 3x − 1 and y = x + 5.", answer: "Set the expressions equal: 3x − 1 = x + 5 → 2x = 6 → x = 3, so y = 3 + 5 = 8.", type: "multiple-choice", choices: [{ label: "x = 3, y = 8" }, { label: "x = −3, y = 2" }, { label: "x = 3, y = 2" }, { label: "x = 2, y = 7" }], correctIndex: 0, hint: "Since both equations equal y, set the right-hand sides equal to each other." },
          ] },
        { title: "Solving by Elimination", status: "not-started",
          description: "Solve a system of equations by adding or subtracting equations to eliminate one variable.",
          diagram: { kind: "graph", family: "linear-system", m: -1, b: 10, m2: 1, b2: -2, markPoints: [{ x: 6, y: 4, label: "(6, 4)" }], domain: [-1, 11], caption: "x + y = 10 and x − y = 2 intersect at (6, 4)." },
          content: [
            "Elimination works by adding or subtracting the two equations so that one variable cancels out. If the coefficients aren't already opposites, multiply one or both equations by a constant first so they line up.",
            "Once one variable is eliminated, solve for the remaining variable, then substitute back to find the other.",
          ],
          exercises: [
            { prompt: "Solve by elimination: x + y = 10 and x − y = 2.", answer: "Add the equations: 2x = 12 → x = 6. Substitute back: 6 + y = 10 → y = 4.", type: "multiple-choice", choices: [{ label: "x = 6, y = 4" }, { label: "x = 4, y = 6" }, { label: "x = 8, y = 2" }, { label: "x = 6, y = −4" }], correctIndex: 0, hint: "Adding the two equations cancels out y." },
            { prompt: "Solve by elimination: 2x + y = 7 and x − y = 2.", answer: "Add the equations: 3x = 9 → x = 3. Substitute back: 3 − y = 2 → y = 1.", type: "multiple-choice", choices: [{ label: "x = 3, y = 1" }, { label: "x = 1, y = 3" }, { label: "x = 3, y = −1" }, { label: "x = 2, y = 3" }], correctIndex: 0, hint: "Adding the two equations cancels out y directly." },
            { prompt: "Solve by elimination: 3x + 2y = 16 and x − 2y = 0.", answer: "Add the equations: 4x = 16 → x = 4. Substitute back: 4 − 2y = 0 → y = 2.", type: "multiple-choice", choices: [{ label: "x = 4, y = 2" }, { label: "x = 2, y = 4" }, { label: "x = 4, y = −2" }, { label: "x = 8, y = 4" }], correctIndex: 0, hint: "Adding the two equations cancels out y." },
          ] },
        { title: "Graphing Systems", status: "not-started",
          description: "Solve a system of equations by graphing both lines and finding their intersection point.",
          diagram: { kind: "graph", family: "linear-system", m: 1, b: 1, m2: -1, b2: 5, markPoints: [{ x: 2, y: 3, label: "(2, 3)" }], domain: [-2, 7], caption: "y = x + 1 and y = −x + 5 intersect at (2, 3)." },
          content: [
            "Every linear equation graphs as a line, and the solution to a system is the point where the lines cross — since that point satisfies both equations at once. Graph each line using its slope and y-intercept, then read off the coordinates where they meet.",
            "If the lines are parallel (same slope, different intercepts), there's no solution. If they're the same line, there are infinitely many solutions.",
          ],
          exercises: [
            { prompt: "Graph y = x + 1 and y = −x + 5, then find their intersection.", answer: "Set x + 1 = −x + 5 → 2x = 4 → x = 2, y = 2 + 1 = 3.", type: "multiple-choice", choices: [{ label: "(2, 3)" }, { label: "(3, 2)" }, { label: "(1, 2)" }, { label: "(2, 2)" }], correctIndex: 0, hint: "Set the two right-hand sides equal to each other to find where the lines cross." },
            { prompt: "Graph y = 2x and y = x + 3, then find their intersection.", answer: "Set 2x = x + 3 → x = 3, y = 2(3) = 6.", type: "multiple-choice", choices: [{ label: "(3, 6)" }, { label: "(6, 3)" }, { label: "(3, 3)" }, { label: "(−3, −6)" }], correctIndex: 0, hint: "Set 2x equal to x + 3 to find the intersection's x-coordinate." },
            { prompt: "What does it mean graphically when a system has no solution?", answer: "Parallel lines never cross, so a system where both equations have the same slope but different y-intercepts has no solution.", type: "multiple-choice", choices: [{ label: "The lines are parallel — same slope, different y-intercepts" }, { label: "The lines are identical — same slope and y-intercept" }, { label: "The lines are perpendicular" }, { label: "The lines intersect at exactly one point" }], correctIndex: 0, hint: "Think about what it means for two lines to never meet." },
          ] },
        { title: "Systems of Inequalities", status: "not-started",
          description: "Graph a system of linear inequalities and identify the overlapping solution region.",
          diagram: { kind: "graph", family: "linear-inequality", m: 1, b: -1, op: ">", domain: [-4, 6], caption: "y > x − 1 — one boundary of a system; overlap with a second inequality's shaded region to find the solution set." },
          content: [
            "Graphing a system of inequalities means graphing each inequality separately — boundary line plus shading — then finding where the shaded regions overlap. That overlapping region contains every point that satisfies both inequalities at once.",
            "Use a dashed line for strict inequalities (< or >) and a solid line for inclusive ones (≤ or ≥), just like with a single inequality.",
          ],
          exercises: [
            { prompt: "Graph y > x − 1 and y ≤ −x + 4, and describe the overlapping region.", answer: "y > x − 1 shades above a dashed line; y ≤ −x + 4 shades on/below a solid line. The overlap is the wedge where both conditions hold.", type: "multiple-choice", choices: [{ label: "Above dashed line y = x − 1 and on/below solid line y = −x + 4" }, { label: "Below dashed line y = x − 1 and on/above solid line y = −x + 4" }, { label: "Above both lines, both dashed" }, { label: "Below both lines, both solid" }], correctIndex: 0, hint: "Graph each boundary line and shading separately, then look for where both shaded regions overlap." },
            { prompt: "True or False: The point (1, 2) satisfies both y < 2x + 3 and y ≥ x.", answer: "2 < 2(1) + 3 = 5 is true, and 2 ≥ 1 is true, so (1, 2) satisfies both inequalities.", type: "true-false", correctIndex: 0, hint: "Plug the point into each inequality separately and check that both hold." },
            { prompt: "Graph y ≥ 2x − 3 and y ≤ −x + 5 — which point lies in the overlapping region?", answer: "(1, 2): 2 ≥ 2(1) − 3 = −1 ✓ and 2 ≤ −1 + 5 = 4 ✓, so it lies in the overlapping region.", type: "multiple-choice", choices: [{ label: "(1, 2)" }, { label: "(3, 0)" }, { label: "(0, 6)" }, { label: "(4, 4)" }], correctIndex: 0, hint: "Test each candidate point in both inequalities — it must satisfy both to be in the overlap." },
          ] },
      ], test: [
        { prompt: "Solve by substitution: y = 2x and x + y = 15.", answer: "x = 5, y = 10" },
        { prompt: "Solve by substitution: x = y + 4 and 2x + y = 17.", answer: "y = 3, x = 7" },
        { prompt: "Solve by elimination: x + y = 9 and x − y = 1.", answer: "x = 5, y = 4" },
        { prompt: "Solve by elimination: 2x − y = 5 and x + y = 7.", answer: "x = 4, y = 3" },
        { prompt: "Graph y = x − 2 and y = −x + 4, then find their intersection.", answer: "Intersection at (3, 1)" },
        { prompt: "Graph y = 3x − 1 and y = x + 3, then find their intersection.", answer: "Intersection at (2, 5)" },
        { prompt: "Graph y < x + 2 and y ≥ −2x − 1, and describe the overlapping region.", answer: "The region below the dashed line y = x + 2 and on/above the solid line y = −2x − 1." },
        { prompt: "Is the point (0, 0) a solution to y > x − 4 and y < x + 4? Justify your answer.", answer: "Yes — 0 > −4 is true and 0 < 4 is true, so (0, 0) satisfies both inequalities." },
      ] },
    ],
  },
  {
    id: 2, name: "Algebra II", grade: "9", students: 40,
    description: "Build on Algebra I with polynomials, rational expressions, and more advanced functions and systems.",
    chapters: [
      { id: 201, title: "Polynomial Functions", difficulty: "Intermediate", modules: [
        { title: "Polynomial Operations", status: "completed",
          description: "Add, subtract, and multiply polynomials by combining like terms and distributing carefully.",
          diagram: { kind: "step-sequence", steps: ["First: x · x = x²", "Outer: x · (−2) = −2x", "Inner: 3 · x = 3x", "Last: 3 · (−2) = −6", "Combine: x² + x − 6"], caption: "Multiplying (x + 3)(x − 2) using FOIL." },
          content: [
            "Adding and subtracting polynomials means combining like terms — terms with the same variable raised to the same power. Multiplying polynomials means distributing every term in one polynomial across every term in the other (FOIL, for two binomials), then combining like terms.",
            "Keep track of signs carefully, especially when subtracting a polynomial — distribute the negative sign across every term being subtracted.",
          ],
          exercises: [
            { prompt: "Add: (3x² + 2x − 1) + (x² − 5x + 4).", answer: "Combine like terms: (3x²+x²) + (2x−5x) + (−1+4) = 4x² − 3x + 3.", type: "multiple-choice", choices: [{ label: "4x² − 3x + 3" }, { label: "4x² + 7x + 3" }, { label: "2x² − 3x + 3" }, { label: "4x² − 3x − 3" }], correctIndex: 0, hint: "Combine terms with the same power of x separately — x² with x², x with x, constants with constants." },
            { prompt: "Subtract: (5x² − 3x) − (2x² + x − 6).", answer: "Distribute the negative sign: 5x²−3x−2x²−x+6 = 3x² − 4x + 6.", type: "multiple-choice", choices: [{ label: "3x² − 4x + 6" }, { label: "3x² − 4x − 6" }, { label: "3x² − 2x + 6" }, { label: "7x² − 4x + 6" }], correctIndex: 0, hint: "Distribute the negative sign across every term in the second polynomial before combining like terms." },
            { prompt: "Multiply: (x + 3)(x − 2).", answer: "FOIL: x·x + x·(−2) + 3·x + 3·(−2) = x² − 2x + 3x − 6 = x² + x − 6.", type: "multiple-choice", choices: [{ label: "x² + x − 6" }, { label: "x² − x − 6" }, { label: "x² + 5x − 6" }, { label: "x² + x + 6" }], correctIndex: 0, hint: "Use FOIL: First, Outer, Inner, Last, then combine like terms." },
          ] },
        { title: "Factoring Higher-Degree Polynomials", status: "completed",
          description: "Factor polynomials of degree 3 or higher using grouping and known patterns.",
          diagram: { kind: "graph", family: "cubic", roots: [0, -2, 2], domain: [-3, 3], caption: "x³ − 4x = x(x − 2)(x + 2) — zeros at −2, 0, 2." },
          content: [
            "Higher-degree polynomials often factor by grouping: split the polynomial into pairs of terms, factor out the GCF from each pair, then factor out the common binomial. Watch for patterns like difference of squares (a² − b² = (a − b)(a + b)) and sum/difference of cubes.",
            "Always check for a greatest common factor across all terms first — factoring that out first makes the rest of the problem simpler.",
          ],
          exercises: [
            { prompt: "Factor by grouping: x³ + 3x² + 2x + 6.", answer: "Group (x³+3x²)+(2x+6) = x²(x+3)+2(x+3) = (x² + 2)(x + 3).", type: "multiple-choice", choices: [{ label: "(x² + 2)(x + 3)" }, { label: "(x² + 3)(x + 2)" }, { label: "(x² − 2)(x + 3)" }, { label: "(x² + 2)(x − 3)" }], correctIndex: 0, hint: "Group the first two terms and the last two terms, then factor out the GCF from each pair." },
            { prompt: "Factor: x³ − 4x.", answer: "Factor out x: x(x² − 4) = x(x − 2)(x + 2), using the difference of squares.", type: "multiple-choice", choices: [{ label: "x(x − 2)(x + 2)" }, { label: "x(x − 4)(x + 4)" }, { label: "(x − 2)(x + 2)" }, { label: "x²(x − 4)" }], correctIndex: 0, hint: "Factor out the GCF first, then look for a difference of squares in what's left." },
            { prompt: "Factor: x³ − 8 (difference of cubes).", answer: "Difference of cubes: a³−b³ = (a−b)(a²+ab+b²) with a=x, b=2: (x − 2)(x² + 2x + 4).", type: "multiple-choice", choices: [{ label: "(x − 2)(x² + 2x + 4)" }, { label: "(x + 2)(x² − 2x + 4)" }, { label: "(x − 2)(x² − 2x + 4)" }, { label: "(x − 2)³" }], correctIndex: 0, hint: "Use the difference of cubes pattern: a³ − b³ = (a − b)(a² + ab + b²)." },
          ] },
        { title: "Graphing Polynomial Functions", status: "in-progress",
          description: "Learn to sketch polynomial functions using end behavior, zeros, and turning points.",
          diagram: { kind: "graph", family: "cubic", roots: [1, -2, 3], domain: [-3.5, 4.5], caption: "f(x) = (x − 1)(x + 2)(x − 3) — zeros at −2, 1, 3." },
          content: [
            "A polynomial's degree and leading coefficient determine its end behavior — where the graph heads as x moves toward positive or negative infinity. Its real zeros are where the graph crosses or touches the x-axis.",
            "Between zeros, the graph turns at most (degree − 1) times, so use that as a check that your sketch has a reasonable shape.",
          ],
          exercises: [
            { prompt: "Determine the end behavior of f(x) = −x⁴ + 3x² − 1.", answer: "Degree 4 (even) with a negative leading coefficient, so both ends fall: as x → ±∞, f(x) → −∞.", type: "multiple-choice", choices: [{ label: "Both ends fall (f(x) → −∞)" }, { label: "Both ends rise (f(x) → ∞)" }, { label: "Falls left, rises right" }, { label: "Rises left, falls right" }], correctIndex: 0, hint: "Even degree means both ends point the same direction — the sign of the leading coefficient tells you which." },
            { prompt: "Find the zeros of f(x) = x³ − x, then sketch the graph.", answer: "Factor: x(x−1)(x+1) = 0, giving zeros at x = −1, 0, 1.", type: "multiple-choice", choices: [{ label: "x = −1, 0, 1" }, { label: "x = 0, 1" }, { label: "x = −1, 1" }, { label: "x = 1" }], correctIndex: 0, hint: "Factor out x first, then factor the remaining difference of squares." },
            { prompt: "Sketch f(x) = (x − 1)(x + 2)(x − 3) using its zeros and end behavior.", answer: "Zeros at x = −2, 1, 3 (where each factor is zero); odd degree with a positive leading coefficient, so it falls on the left and rises on the right.", type: "multiple-choice", choices: [{ label: "Zeros at −2, 1, 3; falls left, rises right" }, { label: "Zeros at 2, −1, 3; falls left, rises right" }, { label: "Zeros at −2, 1, 3; rises left, falls right" }, { label: "Zeros at −3, 1, 2; falls left, rises right" }], correctIndex: 0, hint: "The zeros are where each factor equals zero — then check the degree and leading coefficient for end behavior." },
          ] },
        { title: "The Remainder & Factor Theorems", status: "not-started",
          description: "Use the Remainder and Factor Theorems to test roots and divide polynomials efficiently.",
          diagram: { kind: "step-sequence", steps: ["Evaluate f(a)", "If f(a) = 0 → (x − a) is a factor", "If f(a) ≠ 0 → f(a) is the remainder"], caption: "The Remainder & Factor Theorems in one flow." },
          content: [
            "The Remainder Theorem says that dividing a polynomial f(x) by (x − a) leaves a remainder equal to f(a). The Factor Theorem follows from this: (x − a) is a factor of f(x) exactly when f(a) = 0.",
            "This means you can test whether a number is a root just by evaluating the polynomial there — no long division needed — and synthetic division makes dividing by (x − a) fast once you've confirmed it's a factor.",
          ],
          exercises: [
            { prompt: "Use the Remainder Theorem to find the remainder when f(x) = x³ − 2x² + x − 5 is divided by (x − 2).", answer: "By the Remainder Theorem, the remainder equals f(2) = 8 − 8 + 2 − 5 = −3.", type: "numeric", numericAnswer: "-3", hint: "The Remainder Theorem says the remainder equals f(a) — just evaluate f(2)." },
            { prompt: "True or False: (x − 1) is a factor of f(x) = x³ − 6x² + 11x − 6.", answer: "By the Factor Theorem, (x − a) is a factor exactly when f(a) = 0. Here f(1) = 1 − 6 + 11 − 6 = 0, so yes.", type: "true-false", correctIndex: 0, hint: "By the Factor Theorem, (x − a) is a factor exactly when f(a) = 0 — evaluate f(1)." },
            { prompt: "Use synthetic division to divide x³ − 6x² + 11x − 6 by (x − 1).", answer: "Using synthetic division with root 1: bring down 1, multiply-add to get coefficients 1, −5, 6 → x² − 5x + 6.", type: "multiple-choice", choices: [{ label: "x² − 5x + 6" }, { label: "x² + 5x + 6" }, { label: "x² − 5x − 6" }, { label: "x² − 6x + 5" }], correctIndex: 0, hint: "Set up synthetic division with root 1: bring down the leading coefficient, then repeatedly multiply and add." },
          ] },
      ], test: [
        { prompt: "Add: (2x² − x + 5) + (3x² + 4x − 2).", answer: "5x² + 3x + 3" },
        { prompt: "Multiply: (2x + 1)(x − 3).", answer: "2x² − 5x − 3" },
        { prompt: "Factor by grouping: x³ − 2x² + 5x − 10.", answer: "(x² + 5)(x − 2)" },
        { prompt: "Factor: x³ − 9x.", answer: "x(x − 3)(x + 3)" },
        { prompt: "Describe the end behavior of f(x) = 2x⁵ − x³ + 4.", answer: "Degree 5 (odd) with a positive leading coefficient: as x → −∞, f(x) → −∞; as x → ∞, f(x) → ∞." },
        { prompt: "Find all real zeros of f(x) = x³ − 4x and sketch the graph.", answer: "Zeros at x = −2, 0, 2 (from x(x−2)(x+2) = 0)." },
        { prompt: "Use the Remainder Theorem to find the remainder when f(x) = x³ + 2x − 3 is divided by (x + 1).", answer: "f(−1) = −1 − 2 − 3 = −6, remainder −6" },
        { prompt: "Is (x − 3) a factor of f(x) = x³ − 4x² + x + 6? Justify using the Factor Theorem.", answer: "Yes — f(3) = 27 − 36 + 3 + 6 = 0, so (x − 3) is a factor." },
      ] },
      { id: 202, title: "Exponential & Logarithmic Functions", difficulty: "Advanced", modules: [
        { title: "Exponential Growth & Decay", status: "in-progress",
          description: "Model real-world growth and decay situations using exponential functions.",
          diagram: { kind: "graph", family: "exponential", base: 1.3, domain: [0, 8], caption: "A = A₀(1 + r)ᵗ — an exponential growth curve rises increasingly fast." },
          content: [
            "Exponential growth and decay follow the form A = A₀(1 + r)ᵗ, where A₀ is the starting amount, r is the growth (positive) or decay (negative) rate, and t is time. Growth curves rise increasingly fast; decay curves fall and flatten toward zero.",
            "Watch for the difference between rate per period (r) and the growth factor (1 + r) — mixing them up is the most common mistake.",
          ],
          exercises: [
            { prompt: "A population of 500 grows 4% per year. Write a function for its size after t years.", answer: "Growth follows A(t) = A₀(1 + r)ᵗ with A₀ = 500 and r = 0.04: A(t) = 500(1.04)ᵗ.", type: "multiple-choice", choices: [{ label: "A(t) = 500(1.04)ᵗ" }, { label: "A(t) = 500(0.04)ᵗ" }, { label: "A(t) = 500(1.4)ᵗ" }, { label: "A(t) = 500 + 1.04t" }], correctIndex: 0, hint: "Growth follows A(t) = A₀(1 + r)ᵗ — here A₀ = 500 and r = 0.04." },
            { prompt: "A car worth $20,000 depreciates 15% per year. Find its value after 5 years.", answer: "Decay factor is (1 − 0.15) = 0.85: A(5) = 20000(0.85)⁵ ≈ $8,874.", type: "multiple-choice", choices: [{ label: "$8,874" }, { label: "$5,000" }, { label: "$9,150" }, { label: "$17,000" }], correctIndex: 0, hint: "Decay uses the same formula with a factor less than 1: (1 − 0.15) = 0.85." },
            { prompt: "Graph A = 100(1.1)ᵗ and A = 100(0.9)ᵗ on the same axes and compare.", answer: "A growth factor greater than 1 (1.1) makes the curve rise without bound; a factor between 0 and 1 (0.9) makes it decay toward zero. Both start at (0, 100).", type: "multiple-choice", choices: [{ label: "100(1.1)ᵗ grows without bound; 100(0.9)ᵗ decays toward zero" }, { label: "100(1.1)ᵗ decays toward zero; 100(0.9)ᵗ grows without bound" }, { label: "Both grow, just at different rates" }, { label: "Both decay toward zero" }], correctIndex: 0, hint: "A growth factor greater than 1 makes the curve rise; a factor between 0 and 1 makes it decay." },
          ] },
        { title: "Properties of Logarithms", status: "not-started",
          description: "Use the product, quotient, and power rules to simplify and expand logarithmic expressions.",
          diagram: { kind: "graph", family: "log", base: 2, domain: [0.2, 10], caption: "y = log₂(x) — logarithms are only defined for x > 0." },
          content: [
            "Logarithms have three key properties that mirror exponent rules: log(ab) = log a + log b (product), log(a/b) = log a − log b (quotient), and log(aⁿ) = n · log a (power). These let you expand a single complex log into simpler pieces, or combine several logs into one.",
            "Remember that logarithms are only defined for positive arguments, and log_b(b) = 1 while log_b(1) = 0 for any valid base b.",
          ],
          exercises: [
            { prompt: "Expand: log(3x).", answer: "Product rule: log(ab) = log a + log b, so log(3x) = log 3 + log x.", type: "multiple-choice", choices: [{ label: "log 3 + log x" }, { label: "log 3 · log x" }, { label: "3 log x" }, { label: "log 3 − log x" }], correctIndex: 0, hint: "The product rule turns log(ab) into log a + log b." },
            { prompt: "Expand: log(x/y²).", answer: "Quotient rule first: log x − log y². Then power rule on log y²: log x − 2 log y.", type: "multiple-choice", choices: [{ label: "log x − 2 log y" }, { label: "log x + 2 log y" }, { label: "2 log x − log y" }, { label: "(log x)/(2 log y)" }], correctIndex: 0, hint: "Apply the quotient rule first, then the power rule to the y² term." },
            { prompt: "Combine into a single log: log 5 + log x − log 2.", answer: "Addition becomes multiplication, subtraction becomes division: log 5 + log x − log 2 = log(5x/2).", type: "multiple-choice", choices: [{ label: "log(5x/2)" }, { label: "log(5x − 2)" }, { label: "log(5/(2x))" }, { label: "log(10x)" }], correctIndex: 0, hint: "Addition of logs becomes multiplication inside one log; subtraction becomes division." },
          ] },
        { title: "Solving Exponential Equations", status: "not-started",
          description: "Solve equations where the variable appears in an exponent, using logs or matching bases.",
          diagram: { kind: "graph", family: "exponential", base: 2, domain: [-1, 5], markPoints: [{ x: 4, y: 32, label: "x = 4" }], caption: "2^(x+1) = 32 → x = 4." },
          content: [
            "If both sides of an exponential equation can be written with the same base, set the exponents equal and solve — e.g., 2^(x+1) = 8 becomes 2^(x+1) = 2³, so x + 1 = 3. When bases don't match easily, take the logarithm of both sides and use the power rule to bring the exponent down.",
            "Always check your answer works in the original equation, especially when logs are involved.",
          ],
          exercises: [
            { prompt: "Solve: 3^x = 81.", answer: "81 = 3⁴, so x = 4.", type: "numeric", numericAnswer: "4", hint: "Rewrite 81 as a power of 3." },
            { prompt: "Solve: 2^(x+1) = 32.", answer: "32 = 2⁵, so x + 1 = 5, giving x = 4.", type: "numeric", numericAnswer: "4", hint: "Rewrite 32 as a power of 2, then set the exponents equal." },
            { prompt: "Solve using logarithms: 5^x = 40 (round to two decimal places).", answer: "Take the log of both sides: x = log(40)/log(5) ≈ 2.29.", type: "numeric", numericAnswer: "2.29", hint: "The bases don't match easily — take the log of both sides and use the power rule to bring x down." },
          ] },
        { title: "Solving Logarithmic Equations", status: "not-started",
          description: "Solve equations involving logarithms by rewriting them in exponential form.",
          diagram: { kind: "graph", family: "log", base: 2, domain: [0.2, 40], markPoints: [{ x: 32, y: 5, label: "(32, 5)" }], caption: "log₂(x) = 5 → x = 32." },
          content: [
            "A logarithmic equation like log_b(x) = c can be rewritten in exponential form as x = b^c — this 'undoes' the logarithm and lets you solve directly. When there are multiple logs, combine them using log properties first so you have a single log on one side.",
            "Always check solutions in the original equation — logarithms are undefined for zero or negative arguments, so an algebraically valid answer can still be an extraneous solution.",
          ],
          exercises: [
            { prompt: "Solve: log₂(x) = 5.", answer: "Rewrite in exponential form: x = 2⁵ = 32.", type: "numeric", numericAnswer: "32", hint: "Rewrite the equation in exponential form: x = 2⁵." },
            { prompt: "Solve: log₃(x + 1) = 2.", answer: "Rewrite in exponential form: x + 1 = 3² = 9, so x = 8.", type: "numeric", numericAnswer: "8", hint: "Rewrite in exponential form first: x + 1 = 3²." },
            { prompt: "Solve: log(x) + log(2) = log(20).", answer: "Combine the left side: log(2x) = log(20), so 2x = 20, giving x = 10.", type: "numeric", numericAnswer: "10", hint: "Combine the left side into a single log first using the product rule." },
          ] },
      ], test: [
        { prompt: "Write an exponential model for a $1,000 investment growing at 6% annually.", answer: "A(t) = 1000(1.06)ᵗ" },
        { prompt: "A radioactive sample decays 3% per hour. Find the amount remaining after 10 hours from a 200g sample.", answer: "A(10) = 200(0.97)¹⁰ ≈ 147.5 g" },
        { prompt: "Expand: log(x³y).", answer: "3 log x + log y" },
        { prompt: "Evaluate log₂(8) using the definition of a logarithm.", answer: "3, since 2³ = 8" },
        { prompt: "Solve: 4^x = 64.", answer: "x = 3" },
        { prompt: "Solve: 2^(2x) = 16.", answer: "x = 2" },
        { prompt: "Solve: log₅(x) = 3.", answer: "x = 125" },
        { prompt: "Solve: log₂(x − 1) = 4.", answer: "x = 17" },
      ] },
    ],
  },
  {
    id: 3, name: "Pre-Alg", grade: "6", students: 131,
    description: "Strengthen number sense, ratios, and early equation-solving skills to get ready for Algebra.",
    chapters: [
      { id: 301, title: "Pre-Algebra Foundations", difficulty: "Beginner", modules: [
        { title: "Number Properties", status: "completed",
          description: "Learn the commutative, associative, and distributive properties that let you rearrange and simplify expressions.",
          diagram: { kind: "step-sequence", steps: ["Commutative: a + b = b + a", "Associative: (a + b) + c = a + (b + c)", "Distributive: a(b + c) = ab + ac"], caption: "The three core number properties." },
          content: [
            "The commutative property says order doesn't matter for addition or multiplication (a + b = b + a). The associative property says grouping doesn't matter (a + (b+c) = (a+b) + c). The distributive property lets you multiply a sum by distributing: a(b + c) = ab + ac.",
            "These properties are why you can rearrange and regroup numbers to make mental math easier — like adding 25 + 38 + 75 by pairing 25 + 75 = 100 first.",
          ],
          exercises: [
            { prompt: "Which property justifies 4 + 7 = 7 + 4?", answer: "The order of the numbers switched, but the sum is the same — that's the commutative property.", type: "multiple-choice", choices: [{ label: "Commutative property of addition" }, { label: "Associative property of addition" }, { label: "Distributive property" }, { label: "Identity property of addition" }], correctIndex: 0, hint: "Notice that the same two numbers just switched order." },
            { prompt: "Use the distributive property to expand 5(x + 3).", answer: "Multiply 5 by each term inside: 5·x + 5·3 = 5x + 15.", type: "multiple-choice", choices: [{ label: "5x + 15" }, { label: "5x + 3" }, { label: "8x" }, { label: "5x + 8" }], correctIndex: 0, hint: "Multiply the 5 by each term inside the parentheses separately." },
            { prompt: "Use properties to compute 2 × 17 × 5 mentally.", answer: "Reorder and group: 2 × 5 = 10, then 10 × 17 = 170.", type: "numeric", numericAnswer: "170", hint: "Look for two numbers that multiply to a round number, like 2 × 5 = 10." },
          ] },
        { title: "Order of Operations Basics", status: "completed",
          description: "Evaluate expressions correctly using the order of operations (PEMDAS).",
          diagram: { kind: "step-sequence", steps: ["Parentheses", "Exponents", "Multiply & Divide (left → right)", "Add & Subtract (left → right)"], caption: "PEMDAS order of operations." },
          content: [
            "PEMDAS gives the order to evaluate an expression: Parentheses, Exponents, Multiplication and Division (left to right), Addition and Subtraction (left to right). Skipping this order is one of the most common sources of wrong answers in math.",
            "Multiplication and division have equal priority, and so do addition and subtraction — for those pairs, just work left to right.",
          ],
          exercises: [
            { prompt: "Evaluate: 3 + 4 × 2.", answer: "Multiply first: 4 × 2 = 8, then add: 3 + 8 = 11.", type: "numeric", numericAnswer: "11", hint: "Multiply before you add." },
            { prompt: "Evaluate: (3 + 4) × 2.", answer: "Parentheses first: 3 + 4 = 7, then multiply: 7 × 2 = 14.", type: "numeric", numericAnswer: "14", hint: "Do what's inside the parentheses first." },
            { prompt: "Evaluate: 20 − 6 ÷ 2 + 1.", answer: "Divide first: 6 ÷ 2 = 3. Then left to right: 20 − 3 + 1 = 18.", type: "numeric", numericAnswer: "18", hint: "Divide before you subtract or add, then work left to right." },
          ] },
        { title: "Variables & Expressions", status: "completed",
          description: "Translate words into algebraic expressions and evaluate them for given values.",
          diagram: { kind: "balance-scale", leftLabel: "2x + 5", rightLabel: "17", caption: "Evaluating 2x + 5 when x = 6." },
          content: [
            "A variable is a letter standing in for an unknown number. An algebraic expression combines variables, numbers, and operations — like 3x + 5. To evaluate an expression, substitute the given value for the variable and simplify using the order of operations.",
            "Translating word phrases is key: 'a number increased by 7' means x + 7, while '5 less than a number' means x − 5 (not 5 − x).",
          ],
          exercises: [
            { prompt: "Write an expression for 'a number tripled, then increased by 4'.", answer: "'Tripled' means 3x; 'increased by 4' means add 4: 3x + 4.", type: "multiple-choice", choices: [{ label: "3x + 4" }, { label: "x + 12" }, { label: "4x + 3" }, { label: "3(x + 4)" }], correctIndex: 0, hint: "'Tripled' means multiplied by 3; 'increased by' means add." },
            { prompt: "Evaluate 2x + 5 when x = 6.", answer: "Substitute: 2(6) + 5 = 12 + 5 = 17.", type: "numeric", numericAnswer: "17", hint: "Substitute 6 in for x, then follow the order of operations." },
            { prompt: "Write an expression for '8 less than a number'.", answer: "'Less than' reverses the order — the number comes first, then subtract 8: x − 8.", type: "multiple-choice", choices: [{ label: "x − 8" }, { label: "8 − x" }, { label: "x + 8" }, { label: "8x" }], correctIndex: 0, hint: "'Less than' reverses the order — the number comes first, then subtract 8." },
          ] },
        { title: "Simple Equations", status: "completed",
          description: "Solve basic one-variable equations using inverse operations.",
          diagram: { kind: "balance-scale", leftLabel: "x + 6", rightLabel: "13", caption: "x + 6 = 13 — a balanced equation." },
          content: [
            "A simple equation states that two expressions are equal, and solving it means finding the value of the variable that makes it true. Use inverse operations — addition undoes subtraction, multiplication undoes division — applied equally to both sides.",
            "Always check your solution by substituting it back into the original equation to confirm both sides match.",
          ],
          exercises: [
            { prompt: "Solve: x + 6 = 13.", answer: "Subtract 6 from both sides: x = 13 − 6 = 7.", type: "numeric", numericAnswer: "7", hint: "Subtract 6 from both sides." },
            { prompt: "Solve: 4x = 28.", answer: "Divide both sides by 4: x = 28 ÷ 4 = 7.", type: "numeric", numericAnswer: "7", hint: "Divide both sides by 4." },
            { prompt: "Solve: x − 9 = 2.", answer: "Add 9 to both sides: x = 2 + 9 = 11.", type: "numeric", numericAnswer: "11", hint: "Add 9 to both sides." },
          ] },
        { title: "Factors & Multiples", status: "completed",
          description: "Identify factors and multiples of a number, and use them to find common factors and multiples.",
          diagram: { kind: "number-line", min: 0, max: 30, step: 6, points: [{ value: 6 }, { value: 12 }, { value: 18 }, { value: 24 }, { value: 30 }], caption: "The first five multiples of 6." },
          content: [
            "A factor of a number divides into it evenly with no remainder; a multiple is what you get by multiplying that number by a whole number. Every number is both a factor and a multiple of itself.",
            "Common factors and common multiples between two numbers are the foundation for finding GCF and LCM, which come up constantly when simplifying fractions or finding common denominators.",
          ],
          exercises: [
            { prompt: "List all factors of 24.", answer: "Check every whole number from 1 to 24 that divides evenly: 1, 2, 3, 4, 6, 8, 12, 24.", type: "multiple-choice", choices: [{ label: "1, 2, 3, 4, 6, 8, 12, 24" }, { label: "1, 2, 3, 4, 6, 12, 24" }, { label: "1, 2, 4, 6, 8, 12, 24" }, { label: "2, 3, 4, 6, 8, 12" }], correctIndex: 0, hint: "Check every whole number from 1 up to 24 to see which divide evenly." },
            { prompt: "List the first five multiples of 6.", answer: "Multiply 6 by 1, 2, 3, 4, and 5: 6, 12, 18, 24, 30.", type: "multiple-choice", choices: [{ label: "6, 12, 18, 24, 30" }, { label: "6, 12, 18, 20, 24" }, { label: "12, 18, 24, 30, 36" }, { label: "6, 16, 26, 36, 46" }], correctIndex: 0, hint: "Multiply 6 by 1, 2, 3, 4, and 5." },
            { prompt: "Find the common factors of 18 and 24.", answer: "Factors of 18: 1, 2, 3, 6, 9, 18. Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. Shared: 1, 2, 3, 6.", type: "multiple-choice", choices: [{ label: "1, 2, 3, 6" }, { label: "1, 2, 3, 4, 6" }, { label: "2, 3, 6" }, { label: "1, 6" }], correctIndex: 0, hint: "List the factors of each number, then find which ones appear in both lists." },
          ] },
        { title: "Prime Factorization", status: "in-progress",
          description: "Break numbers down into their prime building blocks.",
          diagram: { kind: "factor-tree", n: 60, caption: "60 = 2 × 2 × 3 × 5 = 2² × 3 × 5" },
          content: [
            "Every whole number greater than 1 can be written as a unique product of prime numbers — this is called its prime factorization. A factor tree is the easiest way to find it: keep splitting a number into factors until every branch ends in a prime.",
            "Prime factorization is the foundation for finding GCF and LCM, so getting comfortable with it now pays off later.",
          ],
          exercises: [
            { prompt: "Find the prime factorization of 60 using a factor tree.", answer: "Splitting 60 down to primes: 60 = 2 × 2 × 3 × 5 = 2² × 3 × 5.", type: "multiple-choice", choices: [{ label: "2² × 3 × 5" }, { label: "2 × 3² × 5" }, { label: "2³ × 3 × 5" }, { label: "2² × 3²" }], correctIndex: 0, hint: "Keep splitting into factors until every branch is a prime number." },
            { prompt: "Find the prime factorization of 84 and 90, then list their common prime factors.", answer: "84 = 2² × 3 × 7; 90 = 2 × 3² × 5. Common prime factors: 2 and 3.", type: "multiple-choice", choices: [{ label: "2 and 3" }, { label: "2 and 5" }, { label: "3 and 5" }, { label: "2, 3, and 5" }], correctIndex: 0, hint: "Break each number down completely into primes, then compare the two lists." },
            { prompt: "Use prime factorization to find the GCF of 36 and 48.", answer: "36 = 2² × 3², 48 = 2⁴ × 3 → GCF = 2² × 3 = 12.", type: "numeric", numericAnswer: "12", hint: "Write both numbers as products of primes, then take the lowest power of each shared prime." },
          ] },
        { title: "Exponents & Powers of Ten", status: "not-started",
          description: "Simplify expressions with exponents and understand powers of ten.",
          diagram: { kind: "bar-chart", data: [1, 10, 100, 1000], labels: ["10⁰", "10¹", "10²", "10³"], caption: "Powers of ten grow by a factor of 10 each time." },
          content: [
            "An exponent tells you how many times to multiply a base by itself: 2⁴ = 2×2×2×2 = 16. Powers of ten follow a clean pattern — 10ⁿ is a 1 followed by n zeros, and this pattern is the foundation of scientific notation.",
            "A negative exponent means 'take the reciprocal': 10⁻² = 1/10² = 0.01. Any nonzero number to the power of 0 equals 1.",
          ],
          exercises: [
            { prompt: "Evaluate: 3⁴.", answer: "3 × 3 × 3 × 3 = 81.", type: "numeric", numericAnswer: "81", hint: "Multiply 3 by itself 4 times." },
            { prompt: "Evaluate: 10⁵.", answer: "10⁵ is a 1 followed by five zeros: 100,000.", type: "numeric", numericAnswer: "100000", hint: "A power of ten is a 1 followed by that many zeros." },
            { prompt: "Evaluate: 5⁰.", answer: "Any nonzero number raised to the power of 0 equals 1.", type: "numeric", numericAnswer: "1", hint: "Any nonzero number raised to the power of 0 equals 1." },
          ] },
      ], test: [
        { prompt: "Which property justifies (2 + 3) + 4 = 2 + (3 + 4)?", answer: "Associative property of addition" },
        { prompt: "Evaluate: 5 + 3 × (2 + 1).", answer: "14" },
        { prompt: "Evaluate 4x − 3 when x = 5.", answer: "17" },
        { prompt: "Solve: x + 15 = 22.", answer: "x = 7" },
        { prompt: "List all factors of 30.", answer: "1, 2, 3, 5, 6, 10, 15, 30" },
        { prompt: "Find the prime factorization of 120.", answer: "120 = 2 × 2 × 2 × 3 × 5 = 2³ × 3 × 5" },
        { prompt: "Evaluate: 2⁶.", answer: "64" },
      ] },
      { id: 302, title: "Ratios, Rates & Proportions", difficulty: "Beginner", modules: [
        { title: "Understanding Ratios", status: "completed",
          description: "Write and simplify ratios to compare two quantities.",
          diagram: { kind: "ratio-bar", parts: [{ value: 2, color: "#1B5E4F", label: "Boys" }, { value: 3, color: "#F0981E", label: "Girls" }], caption: "A class ratio of 2:3, boys to girls." },
          content: [
            "A ratio compares two quantities, written as a:b, a/b, or 'a to b'. Like fractions, ratios can be simplified by dividing both parts by their greatest common factor.",
            "Order matters in a ratio — the ratio of cats to dogs is different from the ratio of dogs to cats, even with the same numbers.",
          ],
          exercises: [
            { prompt: "Write the ratio of 8 apples to 12 oranges in simplest form.", answer: "Divide both by their GCF, 4: 8÷4 : 12÷4 = 2:3.", type: "multiple-choice", choices: [{ label: "2:3" }, { label: "4:6" }, { label: "1:2" }, { label: "3:2" }], correctIndex: 0, hint: "Divide both numbers by their greatest common factor." },
            { prompt: "A class has 12 boys and 18 girls. Write the ratio of boys to girls in simplest form.", answer: "Divide both by their GCF, 6: 12÷6 : 18÷6 = 2:3.", type: "multiple-choice", choices: [{ label: "2:3" }, { label: "3:2" }, { label: "4:6" }, { label: "1:1" }], correctIndex: 0, hint: "Find the GCF of 12 and 18 and divide both by it." },
            { prompt: "Simplify the ratio 25:40.", answer: "Divide both by their GCF, 5: 25÷5 : 40÷5 = 5:8.", type: "multiple-choice", choices: [{ label: "5:8" }, { label: "8:5" }, { label: "1:2" }, { label: "5:10" }], correctIndex: 0, hint: "What number divides evenly into both 25 and 40?" },
          ] },
        { title: "Unit Rates", status: "completed",
          description: "Find and use unit rates to compare prices and quantities.",
          diagram: { kind: "bar-chart", data: [2, 1.8], labels: ["3 lb / $6", "5 lb / $9"], highlightIndices: [1], caption: "Price per pound — the lower bar is the better deal." },
          content: [
            "A unit rate compares a quantity to one unit of another — like miles per hour or price per item. Find it by dividing: total quantity ÷ number of units.",
            "Unit rates make it easy to compare deals: whichever option has the lower price per unit (or higher rate per unit, depending on context) is the better value.",
          ],
          exercises: [
            { prompt: "A car travels 240 miles in 4 hours. Find the unit rate in miles per hour.", answer: "Divide total miles by total hours: 240 ÷ 4 = 60 mph.", type: "numeric", numericAnswer: "60", hint: "Divide the total miles by the total hours." },
            { prompt: "A 12-pack of juice costs $6. Find the unit price per juice.", answer: "Divide total cost by number of items: $6 ÷ 12 = $0.50 per juice.", type: "numeric", numericAnswer: "0.5", hint: "Divide the total cost by the number of items." },
            { prompt: "Which is the better deal: 3 lbs of apples for $6, or 5 lbs for $9?", answer: "3 lbs for $6 is $2.00/lb; 5 lbs for $9 is $1.80/lb — the 5 lb option is cheaper per pound.", type: "multiple-choice", choices: [{ label: "5 lbs for $9 is better ($1.80/lb)" }, { label: "3 lbs for $6 is better ($2.00/lb)" }, { label: "They're the same value" }, { label: "Cannot be determined" }], correctIndex: 0, hint: "Find the price per pound for each option, then compare." },
          ] },
        { title: "Solving Proportions", status: "in-progress",
          description: "Use cross-multiplication to solve for an unknown value in a proportion.",
          diagram: { kind: "step-sequence", steps: ["Start: 3/4 = x/20", "Cross-multiply: 3 × 20 = 4 × x", "Simplify: 60 = 4x", "Divide both sides by 4: x = 15"], caption: "Solving 3/4 = x/20 by cross-multiplying." },
          content: [
            "A proportion is two equal ratios, like a/b = c/d. To solve for a missing value, cross-multiply — multiply the numerator of one side by the denominator of the other — then solve the resulting equation.",
            "Proportions show up constantly in real life: scaling recipes, map distances, unit conversions, and more.",
          ],
          exercises: [
            { prompt: "Solve for x: 3/4 = x/20.", answer: "Cross-multiply: 3 × 20 = 4 × x → 60 = 4x → x = 15.", type: "numeric", numericAnswer: "15", hint: "Cross-multiply: 3 × 20 = 4 × x." },
            { prompt: "A recipe uses 2 cups of flour for 12 cookies. How much flour is needed for 30 cookies?", answer: "Set up 2/12 = x/30 and cross-multiply: 12x = 60 → x = 5 cups.", type: "numeric", numericAnswer: "5", hint: "Set up a proportion with cups over cookies on both sides, then cross-multiply." },
            { prompt: "Solve for y: 5/y = 15/9.", answer: "Cross-multiply: 5 × 9 = 15 × y → 45 = 15y → y = 3.", type: "numeric", numericAnswer: "3", hint: "Cross-multiply to get an equation without fractions." },
          ] },
        { title: "Percent Problems", status: "not-started",
          description: "Solve percent problems involving finding a part, a whole, or a percentage.",
          diagram: { kind: "ratio-bar", parts: [{ value: 30, color: "#1B5E4F", label: "30%" }, { value: 70, color: "#cbd5e1", label: "70%" }], caption: "30% of a whole, shown as a proportion of 100%." },
          content: [
            "Percent means 'per hundred,' so 25% = 25/100 = 0.25. The percent equation part = percent × whole covers most percent problems — you're usually solving for whichever of the three quantities is missing.",
            "To find percent change, use (new − old)/old × 100%.",
          ],
          exercises: [
            { prompt: "Find 30% of 80.", answer: "Convert to a decimal and multiply: 0.30 × 80 = 24.", type: "numeric", numericAnswer: "24", hint: "Convert 30% to a decimal (0.30) and multiply by 80." },
            { prompt: "45 is what percent of 180?", answer: "Divide part by whole: 45 ÷ 180 = 0.25 = 25%.", type: "numeric", numericAnswer: "25", hint: "Divide the part by the whole, then convert the result to a percent." },
            { prompt: "A shirt's price increases from $20 to $25. Find the percent increase.", answer: "(new − old) ÷ old = (25 − 20) ÷ 20 = 0.25 = 25%.", type: "numeric", numericAnswer: "25", hint: "Use (new − old) ÷ old, then convert to a percent." },
          ] },
      ], test: [
        { prompt: "Write the ratio of 15 red marbles to 20 blue marbles in simplest form.", answer: "3:4" },
        { prompt: "Simplify the ratio 18:24.", answer: "3:4" },
        { prompt: "A runner covers 15 miles in 3 hours. Find the unit rate in miles per hour.", answer: "5 mph" },
        { prompt: "An 8-pack of granola bars costs $4. Find the unit price per bar.", answer: "$0.50 per bar" },
        { prompt: "Solve for x: 7/x = 21/9.", answer: "x = 3" },
        { prompt: "A map has a scale of 1 inch = 25 miles. If two cities are 4.5 inches apart on the map, how far apart are they really?", answer: "112.5 miles" },
        { prompt: "Find 15% of 60.", answer: "9" },
        { prompt: "18 is what percent of 90?", answer: "20%" },
      ] },
      { id: 303, title: "Integers & Order of Operations", difficulty: "Intermediate", modules: [
        { title: "Adding & Subtracting Integers", status: "completed",
          description: "Add and subtract positive and negative integers using number-line reasoning.",
          diagram: { kind: "number-line", min: -10, max: 10, step: 2, points: [{ value: -5, label: "start" }, { value: 3, label: "−5+8" }], caption: "−5 + 8 moves 8 steps right, landing at 3." },
          content: [
            "Adding a positive number moves right on the number line; adding a negative (or subtracting a positive) moves left. Subtracting a negative is the same as adding a positive — the two negatives cancel: a − (−b) = a + b.",
            "When adding two numbers with different signs, subtract the smaller absolute value from the larger and keep the sign of the number with the larger absolute value.",
          ],
          exercises: [
            { prompt: "Evaluate: −5 + 8.", answer: "Adding a positive moves right on the number line from −5: −5 + 8 = 3.", type: "numeric", numericAnswer: "3", hint: "Adding a positive number moves right on the number line from −5." },
            { prompt: "Evaluate: 4 − 9.", answer: "Start at 4 and move 9 steps left: 4 − 9 = −5.", type: "numeric", numericAnswer: "-5", hint: "Think of it as starting at 4 and moving 9 steps left." },
            { prompt: "Evaluate: −3 − (−7).", answer: "Subtracting a negative adds its positive: −3 − (−7) = −3 + 7 = 4.", type: "numeric", numericAnswer: "4", hint: "Subtracting a negative is the same as adding a positive." },
          ] },
        { title: "Multiplying & Dividing Integers", status: "in-progress",
          description: "Learn the sign rules for multiplying and dividing positive and negative numbers.",
          diagram: { kind: "step-sequence", steps: ["Same signs → positive: (−9) × (−3) = 27", "Different signs → negative: (−6) × 4 = −24", "Count negative factors: even → positive, odd → negative"], caption: "Sign rules for multiplying and dividing integers." },
          content: [
            "When multiplying or dividing two integers, the result is positive if the signs match and negative if they differ — regardless of the size of the numbers. A quick way to remember it: same signs give a positive result, different signs give a negative one.",
            "This rule holds no matter how many numbers you're multiplying — just count how many negative signs are involved: an even count gives a positive result, an odd count gives a negative one.",
          ],
          exercises: [
            { prompt: "Evaluate: (−6) × 4, (−9) × (−3), and 12 ÷ (−4).", answer: "Different signs give negative, same signs give positive: −24, 27, and −3.", type: "multiple-choice", choices: [{ label: "−24, 27, and −3" }, { label: "24, 27, and −3" }, { label: "−24, −27, and −3" }, { label: "−24, 27, and 3" }], correctIndex: 0, hint: "Same signs give a positive result; different signs give a negative result." },
            { prompt: "Evaluate: (−2) × (−3) × (−5).", answer: "Three negative factors is an odd count, so the result is negative: −30.", type: "numeric", numericAnswer: "-30", hint: "Count how many negative factors there are — an odd count gives a negative result." },
            { prompt: "Find the missing number: (−7) × ___ = 42.", answer: "Divide 42 by −7 to find the missing factor: −6.", type: "numeric", numericAnswer: "-6", hint: "Divide 42 by −7 to find the missing factor." },
          ] },
        { title: "The Order of Operations", status: "not-started",
          description: "Apply the order of operations to expressions involving negative numbers.",
          diagram: { kind: "step-sequence", steps: ["−2² means −(2²) = −4", "(−2)² means (−2)×(−2) = 4", "Parentheses change what gets squared"], caption: "Order of operations with negative numbers and exponents." },
          content: [
            "The same PEMDAS order applies even when negative numbers are involved — just be extra careful with signs at each step, especially when a negative is being squared or multiplied.",
            "Note the difference between −3² and (−3)²: without parentheses, the exponent applies only to the 3, so −3² = −9, but (−3)² = 9.",
          ],
          exercises: [
            { prompt: "Evaluate: −2² + 5.", answer: "The exponent applies only to the 2: −2² = −4, then −4 + 5 = 1.", type: "numeric", numericAnswer: "1", hint: "Without parentheses, the exponent applies only to the 2, not the negative sign." },
            { prompt: "Evaluate: (−2)² + 5.", answer: "The parentheses mean you square the whole −2: (−2)² = 4, then 4 + 5 = 9.", type: "numeric", numericAnswer: "9", hint: "The parentheses mean you square the whole −2, including its sign." },
            { prompt: "Evaluate: −3 × (4 − 6).", answer: "Parentheses first: 4 − 6 = −2, then −3 × (−2) = 6.", type: "numeric", numericAnswer: "6", hint: "Do what's inside the parentheses first, then multiply." },
          ] },
        { title: "Absolute Value", status: "not-started",
          description: "Understand absolute value as distance from zero, and use it to compare and evaluate expressions.",
          diagram: { kind: "number-line", min: -6, max: 6, step: 1, points: [{ value: -4, label: "|−4|=4" }, { value: 4, label: "4" }], caption: "−4 and 4 are both a distance of 4 from zero." },
          content: [
            "The absolute value of a number is its distance from zero on the number line, so it's always non-negative: |5| = 5 and |−5| = 5. Absolute value strips away the sign but keeps the size.",
            "When absolute value appears inside a larger expression, evaluate what's inside the bars first, then take the absolute value, then continue with the rest of the expression.",
          ],
          exercises: [
            { prompt: "Evaluate: |−12|.", answer: "Absolute value is distance from zero, always non-negative: |−12| = 12.", type: "numeric", numericAnswer: "12", hint: "Absolute value is distance from zero — always non-negative." },
            { prompt: "Evaluate: |7 − 15|.", answer: "Evaluate inside the bars first: 7 − 15 = −8, then |−8| = 8.", type: "numeric", numericAnswer: "8", hint: "Evaluate what's inside the bars first, then take the absolute value." },
            { prompt: "Evaluate: |−3| + |−9|.", answer: "Take each absolute value first: |−3| = 3 and |−9| = 9, then 3 + 9 = 12.", type: "numeric", numericAnswer: "12", hint: "Take the absolute value of each number first, then add." },
          ] },
      ], test: [
        { prompt: "Evaluate: −6 + 2.", answer: "−4" },
        { prompt: "Evaluate: 7 − 12.", answer: "−5" },
        { prompt: "Evaluate: (−8) × (−7).", answer: "56" },
        { prompt: "Evaluate: (−36) ÷ 6.", answer: "−6" },
        { prompt: "Evaluate: −4² − 1.", answer: "−17" },
        { prompt: "Evaluate: (−4)² − 1.", answer: "15" },
        { prompt: "Evaluate: |−20|.", answer: "20" },
        { prompt: "Evaluate: |5 − 13|.", answer: "8" },
      ] },
      { id: 304, title: "Linear Equations", difficulty: "Intermediate", modules: [
        { title: "Understanding Variables & Constants", status: "not-started",
          description: "Distinguish between variables and constants in an algebraic expression.",
          diagram: { kind: "step-sequence", steps: ["5x − 2", "5 = coefficient", "x = variable", "−2 = constant"], caption: "Breaking down the parts of 5x − 2." },
          content: [
            "A variable is a symbol (usually a letter) that can represent different values, while a constant is a fixed number that doesn't change. In the expression 3x + 7, x is the variable, 3 is its coefficient, and 7 is the constant.",
            "Recognizing which parts of an expression are variable vs. constant is the first step before combining like terms or solving equations.",
          ],
          exercises: [
            { prompt: "In the expression 5x − 2, identify the coefficient, variable, and constant.", answer: "5 multiplies the variable x, so it's the coefficient; −2 stands alone, so it's the constant.", type: "multiple-choice", choices: [{ label: "Coefficient: 5, variable: x, constant: −2" }, { label: "Coefficient: −2, variable: x, constant: 5" }, { label: "Coefficient: 5, variable: x, constant: 2" }, { label: "Coefficient: x, variable: 5, constant: −2" }], correctIndex: 0, hint: "The coefficient multiplies the variable; the constant stands alone." },
            { prompt: "In 4x + 3y − 9, list all the constants and coefficients.", answer: "4 and 3 each multiply a variable, so they're coefficients; −9 stands alone, so it's the constant.", type: "multiple-choice", choices: [{ label: "Coefficients: 4 and 3; constant: −9" }, { label: "Coefficients: 4, 3, and −9; constant: none" }, { label: "Coefficient: 4; constants: 3 and −9" }, { label: "Coefficients: 4 and 3; constant: 9" }], correctIndex: 0, hint: "Each variable term has its own coefficient; the constant is the term with no variable." },
            { prompt: "True or False: The 7 in 7x is a coefficient, not a constant.", answer: "It multiplies the variable x rather than standing alone as a fixed value, so it's a coefficient.", type: "true-false", correctIndex: 0, hint: "Think about whether the 7 multiplies a variable or stands alone." },
          ] },
        { title: "Solving One-Step Linear Equations", status: "not-started",
          description: "Solve one-step linear equations using addition, subtraction, multiplication, or division.",
          diagram: { kind: "balance-scale", leftLabel: "x − 3", rightLabel: "10", caption: "x − 3 = 10 — add 3 to both sides." },
          content: [
            "A one-step linear equation needs a single inverse operation to isolate the variable. Identify what's being done to the variable, then undo it on both sides.",
            "For example, in x − 3 = 10, add 3 to both sides to get x = 13.",
          ],
          exercises: [
            { prompt: "Solve: x − 5 = 8.", answer: "Add 5 to both sides: x = 8 + 5 = 13.", type: "numeric", numericAnswer: "13", hint: "Add 5 to both sides." },
            { prompt: "Solve: 7x = 56.", answer: "Divide both sides by 7: x = 56 ÷ 7 = 8.", type: "numeric", numericAnswer: "8", hint: "Divide both sides by 7." },
            { prompt: "Solve: x + 10 = 4.", answer: "Subtract 10 from both sides: x = 4 − 10 = −6.", type: "numeric", numericAnswer: "-6", hint: "Subtract 10 from both sides — the result will be negative." },
          ] },
        { title: "Solving Two-Step Linear Equations", status: "not-started",
          description: "Solve linear equations that require two inverse operations to isolate the variable.",
          diagram: { kind: "step-sequence", steps: ["Start: 2x + 3 = 11", "Subtract 3: 2x = 8", "Divide by 2: x = 4"], caption: "Solving a two-step equation." },
          content: [
            "A two-step equation needs two inverse operations, typically undoing addition/subtraction first, then multiplication/division. For example, in 2x + 3 = 11, subtract 3 first to get 2x = 8, then divide by 2 to get x = 4.",
            "Always perform the same operation to both sides of the equation to keep it balanced.",
          ],
          exercises: [
            { prompt: "Solve: 3x + 4 = 19.", answer: "Subtract 4: 3x = 15. Divide by 3: x = 5.", type: "numeric", numericAnswer: "5", hint: "Subtract 4 from both sides first, then divide by 3." },
            { prompt: "Solve: 2x − 7 = 9.", answer: "Add 7: 2x = 16. Divide by 2: x = 8.", type: "numeric", numericAnswer: "8", hint: "Add 7 to both sides first, then divide by 2." },
            { prompt: "Solve: x/4 + 2 = 6.", answer: "Subtract 2: x/4 = 4. Multiply by 4: x = 16.", type: "numeric", numericAnswer: "16", hint: "Subtract 2 from both sides first, then multiply both sides by 4." },
          ] },
        { title: "Graphing Linear Equations", status: "not-started",
          description: "Graph linear equations on the coordinate plane using slope and y-intercept.",
          diagram: { kind: "graph", family: "linear", m: 2, b: 1, domain: [-3, 3], caption: "y = 2x + 1 — y-intercept at 1, slope 2 (up 2, right 1)." },
          content: [
            "A linear equation in slope-intercept form, y = mx + b, is easy to graph: b is the y-intercept (where the line crosses the y-axis), and m is the slope (rise over run) telling you how steep the line is and which direction it goes.",
            "Plot the y-intercept first, then use the slope to find a second point by moving 'rise' units up/down and 'run' units right, then draw the line through both points.",
          ],
          exercises: [
            { prompt: "Graph y = 2x + 1 by identifying the slope and y-intercept.", answer: "Comparing to y = mx + b: slope 2, y-intercept 1 — from (0,1), move up 2 and right 1 to (1,3).", type: "multiple-choice", choices: [{ label: "Slope 2, y-intercept 1" }, { label: "Slope 1, y-intercept 2" }, { label: "Slope 2, y-intercept −1" }, { label: "Slope −2, y-intercept 1" }], correctIndex: 0, hint: "The y-intercept is where x = 0; the slope tells you how to move to a second point." },
            { prompt: "Graph y = −x + 4.", answer: "Comparing to y = mx + b: slope −1, y-intercept 4 — from (0,4), move down 1 and right 1 to (1,3).", type: "multiple-choice", choices: [{ label: "Slope −1, y-intercept 4" }, { label: "Slope 1, y-intercept 4" }, { label: "Slope −1, y-intercept −4" }, { label: "Slope 4, y-intercept −1" }], correctIndex: 0, hint: "A negative slope means the line goes down as you move right." },
            { prompt: "Find the slope and y-intercept of y = 3x − 2.", answer: "Comparing to y = mx + b: m = 3, b = −2.", type: "multiple-choice", choices: [{ label: "Slope 3, y-intercept −2" }, { label: "Slope −2, y-intercept 3" }, { label: "Slope 3, y-intercept 2" }, { label: "Slope −3, y-intercept −2" }], correctIndex: 0, hint: "Compare the equation to y = mx + b — m is the slope, b is the y-intercept." },
          ] },
        { title: "Writing Linear Equations from Word Problems", status: "not-started",
          description: "Translate real-world situations into linear equations.",
          diagram: { kind: "graph", family: "linear", m: 15, b: 20, domain: [0, 6], caption: "y = 15x + 20 — a gym membership's total cost over time." },
          content: [
            "To write a linear equation from a word problem, identify the starting value (the constant/y-intercept) and the rate of change (the slope), then write y = mx + b using those values.",
            "Look for phrases like 'starts at' or 'initial' for the constant, and 'per,' 'each,' or 'every' for the rate.",
          ],
          exercises: [
            { prompt: "A gym membership costs $20 to join plus $15 per month. Write an equation for total cost y after x months.", answer: "The one-time fee ($20) is the y-intercept; the monthly rate ($15) is the slope: y = 15x + 20.", type: "multiple-choice", choices: [{ label: "y = 15x + 20" }, { label: "y = 20x + 15" }, { label: "y = 15x − 20" }, { label: "y = 35x" }], correctIndex: 0, hint: "The one-time fee is the y-intercept (b); the monthly rate is the slope (m)." },
            { prompt: "A taxi charges a $3 base fee plus $2 per mile. Write an equation for the total fare y after x miles.", answer: "The base fee ($3) is the constant; the per-mile charge ($2) is the slope: y = 2x + 3.", type: "multiple-choice", choices: [{ label: "y = 2x + 3" }, { label: "y = 3x + 2" }, { label: "y = 2x − 3" }, { label: "y = 5x" }], correctIndex: 0, hint: "The base fee doesn't depend on x — it's the constant; the per-mile charge is the slope." },
            { prompt: "A plant is 5 cm tall and grows 3 cm per week. Write an equation for its height y after x weeks.", answer: "The starting height (5 cm) is the y-intercept; the growth rate (3 cm/week) is the slope: y = 3x + 5.", type: "multiple-choice", choices: [{ label: "y = 3x + 5" }, { label: "y = 5x + 3" }, { label: "y = 3x − 5" }, { label: "y = 8x" }], correctIndex: 0, hint: "The starting height is the y-intercept; the growth rate is the slope." },
          ] },
      ], test: [
        { prompt: "In the expression 8x + 1, identify the coefficient and the constant.", answer: "Coefficient: 8, constant: 1" },
        { prompt: "Solve: x − 8 = 3.", answer: "x = 11" },
        { prompt: "Solve: 5x − 3 = 22.", answer: "x = 5" },
        { prompt: "Graph y = x − 3.", answer: "Slope 1, y-intercept −3." },
        { prompt: "A phone plan costs $10 plus $0.05 per text. Write an equation for total cost y after x texts.", answer: "y = 0.05x + 10" },
      ] },
    ],
  },
  {
    id: 4, name: "Geometry", grade: "7–8", students: 80,
    description: "Explore shapes, angles, triangles, and proofs with a visual, hands-on approach to spatial reasoning.",
    chapters: [
      { id: 401, title: "Geometry Essentials", difficulty: "Intermediate", modules: [
        { title: "Points, Lines & Planes", status: "completed",
          description: "Learn the undefined terms of geometry — points, lines, and planes — and how they combine to form figures.",
          diagram: { kind: "step-sequence", steps: ["Point: a location, no size", "Line: infinite, no width", "Plane: flat, infinite surface"], caption: "The three undefined terms of geometry." },
          content: [
            "A point is a location with no size, a line extends infinitely in two directions with no width, and a plane is a flat surface extending infinitely in all directions. These three undefined terms are the building blocks every other geometric figure is defined from.",
            "A line segment is part of a line with two endpoints; a ray has one endpoint and extends infinitely in one direction. Points are collinear if they lie on the same line, and coplanar if they lie on the same plane.",
          ],
          exercises: [
            { prompt: "Name the difference between a line and a line segment.", answer: "A line extends infinitely in both directions with no endpoints; a segment has two fixed endpoints.", type: "multiple-choice", choices: [{ label: "A line extends infinitely both ways; a segment has two fixed endpoints" }, { label: "A line has endpoints; a segment extends infinitely" }, { label: "They're the same thing" }, { label: "A segment is always longer than a line" }], correctIndex: 0, hint: "Think about whether it has endpoints or goes on forever." },
            { prompt: "Are three points that lie on the same line collinear or coplanar?", answer: "'Collinear' is the more specific term for points on the same line (they're also coplanar, but that's not the best answer).", type: "multiple-choice", choices: [{ label: "Collinear" }, { label: "Coplanar only" }, { label: "Neither term applies" }, { label: "Parallel" }], correctIndex: 0, hint: "Points on the same line have a more specific term than just being on the same plane." },
            { prompt: "How many endpoints does a ray have?", answer: "A ray starts at one point and extends forever in only one direction — one endpoint.", type: "numeric", numericAnswer: "1", hint: "A ray starts at one point and extends forever in only one direction." },
          ] },
        { title: "Angle Relationships", status: "completed",
          description: "Identify complementary, supplementary, vertical, and adjacent angle pairs.",
          diagram: { kind: "shape", shape: "angle-pair", angleDeg: 40, caption: "Two intersecting lines form vertical angle pairs." },
          content: [
            "Complementary angles add to 90°; supplementary angles add to 180°. Vertical angles are formed by two intersecting lines and are always congruent (equal), while adjacent angles share a vertex and a side without overlapping.",
            "Recognizing these relationships lets you find unknown angle measures without a protractor — just set up an equation based on the relationship.",
          ],
          exercises: [
            { prompt: "Two angles are complementary. One measures 35°. Find the other.", answer: "Complementary angles add to 90°: 90 − 35 = 55°.", type: "numeric", numericAnswer: "55", hint: "Complementary angles add to 90°." },
            { prompt: "Two angles are supplementary. One measures 110°. Find the other.", answer: "Supplementary angles add to 180°: 180 − 110 = 70°.", type: "numeric", numericAnswer: "70", hint: "Supplementary angles add to 180°." },
            { prompt: "Two lines intersect, forming a 40° angle. Find the measure of its vertical angle.", answer: "Vertical angles are always congruent, so the vertical angle is also 40°.", type: "numeric", numericAnswer: "40", hint: "Vertical angles are always congruent to each other." },
          ] },
        { title: "Classifying Polygons", status: "completed",
          description: "Classify polygons by their number of sides and by whether they're regular or irregular.",
          diagram: { kind: "shape", shape: "polygon", sidesCount: 6, caption: "A regular hexagon — 6 sides, interior angles summing to 720°." },
          content: [
            "Polygons are named by their number of sides: triangle (3), quadrilateral (4), pentagon (5), hexagon (6), heptagon (7), octagon (8), and so on. A regular polygon has all sides and angles equal; an irregular polygon doesn't.",
            "The sum of interior angles of any polygon can be found with the formula (n − 2) × 180°, where n is the number of sides.",
          ],
          exercises: [
            { prompt: "Name the polygon with 6 sides.", answer: "A 6-sided polygon is a hexagon.", type: "multiple-choice", choices: [{ label: "Hexagon" }, { label: "Pentagon" }, { label: "Heptagon" }, { label: "Octagon" }], correctIndex: 0, hint: "Recall the prefix for six." },
            { prompt: "Find the sum of interior angles of a pentagon.", answer: "(n − 2) × 180° with n = 5: (5 − 2) × 180° = 540°.", type: "numeric", numericAnswer: "540", hint: "Use the formula (n − 2) × 180° with n = 5." },
            { prompt: "True or False: A square is a regular polygon.", answer: "Regular — all four sides and all four angles of a square are equal.", type: "true-false", correctIndex: 0, hint: "Check whether all sides and all angles are equal." },
          ] },
        { title: "Congruence & Similarity", status: "in-progress",
          description: "Understand the difference between congruent and similar figures, and how to prove each.",
          diagram: { kind: "shape", shape: "similar-triangles", sides: [3, 4, 5], sides2: [6, 8, 10], caption: "Similar triangles — every side of the larger triangle is 2× the corresponding side of the smaller one." },
          content: [
            "Congruent figures are identical in size and shape — every corresponding side and angle matches exactly. Similar figures have the same shape but can be different sizes; their corresponding angles are equal and their corresponding sides are in proportion.",
            "Common congruence shortcuts for triangles include SSS, SAS, and ASA; for similarity, AA (two matching angles) is often enough.",
          ],
          exercises: [
            { prompt: "Given two triangles with all three pairs of sides equal, what congruence rule proves them congruent?", answer: "This is exactly the SSS (Side-Side-Side) congruence rule.", type: "multiple-choice", choices: [{ label: "SSS (Side-Side-Side)" }, { label: "SAS (Side-Angle-Side)" }, { label: "ASA (Angle-Side-Angle)" }, { label: "AA (Angle-Angle)" }], correctIndex: 0, hint: "Think about which congruence shortcut only needs side lengths, not angles." },
            { prompt: "True or False: Two triangles with two pairs of congruent angles must be similar.", answer: "Yes — by AA similarity, two matching angle pairs guarantee similarity (the third pair must match too, since a triangle's angles sum to 180°).", type: "true-false", correctIndex: 0, hint: "If two angle pairs match, what must be true about the third pair?" },
            { prompt: "Find the missing side length in a pair of similar triangles given a scale factor of 2.", answer: "Multiply the corresponding known side by the scale factor of 2 to get the missing side length.", type: "multiple-choice", choices: [{ label: "Multiply the known side by the scale factor" }, { label: "Divide the known side by the scale factor" }, { label: "Add the scale factor to the known side" }, { label: "The scale factor doesn't affect side lengths" }], correctIndex: 0, hint: "Multiply the known corresponding side by the scale factor." },
          ] },
        { title: "Parallel Lines & Transversals", status: "not-started",
          description: "Identify angle relationships formed when a transversal crosses two parallel lines.",
          diagram: { kind: "shape", shape: "angle-pair", angleDeg: 65, caption: "A transversal crossing two lines creates corresponding, alternate, and co-interior angle pairs." },
          content: [
            "When a transversal crosses two parallel lines, it creates eight angles with special relationships: corresponding angles are congruent, alternate interior angles are congruent, alternate exterior angles are congruent, and co-interior (same-side interior) angles are supplementary.",
            "These relationships only hold when the two lines cut by the transversal are actually parallel — that's the key condition to check first.",
          ],
          exercises: [
            { prompt: "A transversal crosses two parallel lines, forming a 65° angle. Find its corresponding angle.", answer: "Corresponding angles are always congruent, so it's also 65°.", type: "numeric", numericAnswer: "65", hint: "Corresponding angles are always congruent." },
            { prompt: "Find the alternate interior angle to a 110° angle formed by a transversal crossing parallel lines.", answer: "Alternate interior angles are congruent, so it's also 110°.", type: "numeric", numericAnswer: "110", hint: "Alternate interior angles are congruent to each other." },
            { prompt: "Two co-interior angles are formed by a transversal. One is 70°. Find the other.", answer: "Co-interior angles are supplementary (add to 180°): 180 − 70 = 110°.", type: "numeric", numericAnswer: "110", hint: "Co-interior (same-side interior) angles are supplementary, not congruent." },
          ] },
        { title: "Coordinate Geometry Basics", status: "not-started",
          description: "Find distance, midpoint, and slope between two points on the coordinate plane.",
          diagram: { kind: "shape", shape: "right-triangle", sides: [3, 4], labels: ["3", "4", "5"], caption: "Distance between two points uses the Pythagorean theorem: legs 3 and 4 give a distance of 5." },
          content: [
            "The distance formula, d = √((x₂−x₁)² + (y₂−y₁)²), comes directly from the Pythagorean theorem. The midpoint formula, ((x₁+x₂)/2, (y₁+y₂)/2), simply averages the x- and y-coordinates.",
            "Slope, m = (y₂−y₁)/(x₂−x₁), measures steepness — it's the same slope concept used to graph linear equations.",
          ],
          exercises: [
            { prompt: "Find the distance between (0, 0) and (3, 4).", answer: "d = √(3² + 4²) = √25 = 5.", type: "numeric", numericAnswer: "5", hint: "Use the distance formula — it's really the Pythagorean theorem in disguise." },
            { prompt: "Find the midpoint of (2, 6) and (8, 2).", answer: "Average each coordinate: ((2+8)/2, (6+2)/2) = (5, 4).", type: "multiple-choice", choices: [{ label: "(5, 4)" }, { label: "(4, 5)" }, { label: "(10, 8)" }, { label: "(3, 2)" }], correctIndex: 0, hint: "Average the x-coordinates and average the y-coordinates separately." },
            { prompt: "Find the slope of the line through (1, 2) and (4, 8).", answer: "m = (8−2)/(4−1) = 6/3 = 2.", type: "numeric", numericAnswer: "2", hint: "Slope is the change in y divided by the change in x." },
          ] },
        { title: "Symmetry & Transformations", status: "not-started",
          description: "Identify lines of symmetry and describe translations, reflections, and rotations.",
          diagram: { kind: "shape", shape: "polygon", sidesCount: 4, caption: "A square has 4 lines of symmetry." },
          content: [
            "A figure has a line of symmetry if folding along that line makes both halves match exactly. Transformations move a figure: translations slide it, reflections flip it over a line, and rotations turn it around a point.",
            "Rigid transformations (translations, reflections, rotations) preserve size and shape — the image is always congruent to the original figure.",
          ],
          exercises: [
            { prompt: "How many lines of symmetry does a square have?", answer: "A square can be folded along 4 different lines (2 diagonals, 1 horizontal, 1 vertical) and match exactly.", type: "numeric", numericAnswer: "4", hint: "Think about how many ways you can fold a square so both halves match exactly." },
            { prompt: "Describe what happens to a figure during a reflection.", answer: "It's flipped over a line, creating a mirror image on the opposite side.", type: "multiple-choice", choices: [{ label: "Flipped over a line, creating a mirror image" }, { label: "Slid in a direction without turning" }, { label: "Turned around a fixed point" }, { label: "Enlarged proportionally" }], correctIndex: 0, hint: "Think about what happens when you flip something over a line, like a mirror." },
            { prompt: "A point (3, 2) is translated 4 units left and 1 unit up. Find its new coordinates.", answer: "Left decreases x: 3 − 4 = −1. Up increases y: 2 + 1 = 3. New point: (−1, 3).", type: "multiple-choice", choices: [{ label: "(−1, 3)" }, { label: "(7, 1)" }, { label: "(−1, 1)" }, { label: "(7, 3)" }], correctIndex: 0, hint: "Moving left decreases x; moving up increases y." },
          ] },
        { title: "Constructions with Compass & Straightedge", status: "not-started",
          description: "Perform classic geometric constructions using only a compass and straightedge.",
          diagram: { kind: "shape", shape: "circle", sides: [4], caption: "Compass arcs of equal radius are the basis for classical constructions." },
          content: [
            "Classic constructions include copying a segment, bisecting a segment or angle, and constructing a perpendicular line — all using only a compass (for arcs of equal radius) and an unmarked straightedge (for drawing lines).",
            "To bisect a segment, draw arcs of equal radius from each endpoint that intersect above and below the segment; the line through those intersection points is the perpendicular bisector.",
          ],
          exercises: [
            { prompt: "Describe the steps to bisect a line segment using a compass and straightedge.", answer: "From each endpoint, draw arcs of equal radius that intersect above and below the segment; connect the two intersection points — that line bisects the segment perpendicularly.", type: "multiple-choice", choices: [{ label: "Draw equal-radius arcs from each endpoint and connect where they cross" }, { label: "Draw a single arc from one endpoint only" }, { label: "Measure the segment with a ruler and mark the halfway point" }, { label: "Draw arcs from the midpoint outward" }], correctIndex: 0, hint: "Draw equal-radius arcs from each endpoint and connect where they cross." },
            { prompt: "Describe the steps to bisect an angle using a compass and straightedge.", answer: "From the vertex, draw an arc crossing both rays; from each crossing point, draw equal-radius arcs that intersect inside the angle; the ray from the vertex through that intersection bisects the angle.", type: "multiple-choice", choices: [{ label: "Draw an arc from the vertex crossing both rays, then arcs from those crossing points" }, { label: "Draw a straight line connecting the two rays" }, { label: "Measure the angle with a protractor and divide by 2" }, { label: "Draw an arc from only one ray" }], correctIndex: 0, hint: "Draw an arc from the vertex crossing both rays, then arcs from those crossing points." },
            { prompt: "Why must a straightedge used in constructions be unmarked (no ruler markings)?", answer: "Classical constructions rely only on the tools' basic geometric functions (straight lines and equal-radius arcs) — using length measurements would go beyond compass-and-straightedge rules.", type: "multiple-choice", choices: [{ label: "Measuring lengths would go beyond compass-and-straightedge rules" }, { label: "Because measuring is not allowed in geometry at all" }, { label: "Because marked straightedges are more expensive" }, { label: "Because compasses can't be used with marked straightedges" }], correctIndex: 0, hint: "Think about whether measuring lengths would go beyond what a compass and straightedge alone can do." },
          ] },
      ], test: [
        { prompt: "Define a plane in your own words.", answer: "A flat surface that extends infinitely in all directions, with no thickness." },
        { prompt: "Two angles are complementary. One measures 62°. Find the other.", answer: "28°" },
        { prompt: "Name the polygon with 8 sides.", answer: "Octagon" },
        { prompt: "Given triangle side lengths 3, 4, 5 and 6, 8, 10, determine if the triangles are similar and explain why.", answer: "Yes, similar — each side of the second triangle is exactly 2× the corresponding side of the first (6/3 = 8/4 = 10/5 = 2), satisfying SSS similarity." },
        { prompt: "A transversal crosses two parallel lines, forming a 50° angle. Find its alternate exterior angle.", answer: "50°" },
        { prompt: "Find the distance between (1, 1) and (4, 5).", answer: "5" },
        { prompt: "How many lines of symmetry does an equilateral triangle have?", answer: "3" },
        { prompt: "Describe how to construct a perpendicular bisector of a segment.", answer: "Draw equal-radius arcs from both endpoints that intersect on both sides of the segment, then draw a line through those two intersection points." },
      ] },
      { id: 402, title: "Triangles & the Pythagorean Theorem", difficulty: "Intermediate", modules: [
        { title: "Triangle Angle Sum", status: "not-started",
          description: "Use the fact that a triangle's interior angles always sum to 180° to find missing angles.",
          diagram: { kind: "shape", shape: "triangle", sides: [4, 5, 6], caption: "A triangle's three interior angles always sum to 180°." },
          content: [
            "Every triangle's three interior angles add up to exactly 180°, no matter its shape or size. This lets you find any missing angle if you know the other two.",
            "An exterior angle of a triangle equals the sum of the two non-adjacent interior angles — a useful shortcut that follows directly from the angle sum property.",
          ],
          exercises: [
            { prompt: "A triangle has angles of 50° and 60°. Find the third angle.", answer: "180 − 50 − 60 = 70°.", type: "numeric", numericAnswer: "70", hint: "All three angles of a triangle add up to 180°." },
            { prompt: "A triangle has angles of 90° and 35°. Find the third angle.", answer: "180 − 90 − 35 = 55°.", type: "numeric", numericAnswer: "55", hint: "Subtract the two known angles from 180°." },
            { prompt: "Two angles of a triangle are equal, and the third is 40°. Find the two equal angles.", answer: "180 − 40 = 140°, split evenly: 140 ÷ 2 = 70° each.", type: "numeric", numericAnswer: "70", hint: "Subtract 40° from 180°, then split the remainder evenly between the two equal angles." },
          ] },
        { title: "Special Right Triangles", status: "not-started",
          description: "Use the side ratios of 45-45-90 and 30-60-90 triangles to find missing sides quickly.",
          diagram: { kind: "shape", shape: "right-triangle", sides: [1, 1], labels: ["1", "1", "√2"], caption: "A 45-45-90 triangle — legs equal, hypotenuse = leg × √2." },
          content: [
            "In a 45-45-90 triangle, the legs are equal and the hypotenuse is leg × √2. In a 30-60-90 triangle, if the shortest side (opposite the 30°) is x, the side opposite 60° is x√3, and the hypotenuse is 2x.",
            "These ratios come from the Pythagorean theorem but are worth memorizing since they show up constantly in geometry and trigonometry.",
          ],
          exercises: [
            { prompt: "A 45-45-90 triangle has legs of length 5. Find the hypotenuse.", answer: "Hypotenuse = leg × √2 = 5√2.", type: "multiple-choice", choices: [{ label: "5√2" }, { label: "5" }, { label: "10" }, { label: "5√3" }], correctIndex: 0, hint: "In a 45-45-90 triangle, the hypotenuse is a leg times √2." },
            { prompt: "A 30-60-90 triangle has a short leg of 4. Find the other leg and hypotenuse.", answer: "Other leg = short leg × √3 = 4√3; hypotenuse = short leg × 2 = 8.", type: "multiple-choice", choices: [{ label: "Other leg: 4√3, hypotenuse: 8" }, { label: "Other leg: 4√2, hypotenuse: 8" }, { label: "Other leg: 8, hypotenuse: 4√3" }, { label: "Other leg: 4√3, hypotenuse: 4" }], correctIndex: 0, hint: "The side opposite 60° is short-leg × √3; the hypotenuse is short-leg × 2." },
            { prompt: "A 45-45-90 triangle has a hypotenuse of 10. Find each leg.", answer: "Divide the hypotenuse by √2: 10/√2 = 5√2 each.", type: "multiple-choice", choices: [{ label: "5√2 each" }, { label: "10√2 each" }, { label: "5 each" }, { label: "7.5 each" }], correctIndex: 0, hint: "Divide the hypotenuse by √2 to find each leg." },
          ] },
        { title: "The Pythagorean Theorem", status: "not-started",
          description: "Use a² + b² = c² to find a missing side length in a right triangle.",
          diagram: { kind: "shape", shape: "right-triangle", sides: [6, 8], labels: ["6", "8", "10"], caption: "a² + b² = c² — legs 6 and 8 give a hypotenuse of 10." },
          content: [
            "The Pythagorean theorem, a² + b² = c², relates the two legs (a, b) and hypotenuse (c) of a right triangle — but only works for right triangles. The hypotenuse is always the longest side, opposite the right angle.",
            "To find a leg instead of the hypotenuse, rearrange the formula: a = √(c² − b²).",
          ],
          exercises: [
            { prompt: "Find the hypotenuse of a right triangle with legs 6 and 8.", answer: "c = √(6² + 8²) = √100 = 10.", type: "numeric", numericAnswer: "10", hint: "Use a² + b² = c² with a = 6 and b = 8." },
            { prompt: "Find the missing leg of a right triangle with hypotenuse 13 and one leg 5.", answer: "a = √(13² − 5²) = √144 = 12.", type: "numeric", numericAnswer: "12", hint: "Rearrange the formula to solve for a leg: a = √(c² − b²)." },
            { prompt: "True or False: A triangle with sides 9, 12, 15 is a right triangle.", answer: "9² + 12² = 81 + 144 = 225 = 15², so yes, it satisfies the Pythagorean theorem.", type: "true-false", correctIndex: 0, hint: "Check whether the two shorter sides squared add up to the longest side squared." },
          ] },
        { title: "Applications of the Pythagorean Theorem", status: "not-started",
          description: "Apply the Pythagorean theorem to real-world distance and measurement problems.",
          diagram: { kind: "shape", shape: "right-triangle", sides: [5, 12], labels: ["5 ft", "12 ft", "13 ft"], caption: "A 5-12-13 right triangle — a ladder problem." },
          content: [
            "Many real-world problems form a right triangle without looking like one at first — a ladder against a wall, the diagonal of a rectangle, or the straight-line distance between two points on a grid. Identify the two legs and the hypotenuse before applying a² + b² = c².",
            "Drawing a quick sketch of the situation as a right triangle makes it much easier to see which values are legs and which is the hypotenuse.",
          ],
          exercises: [
            { prompt: "A ladder 13 ft long leans against a wall, its base 5 ft from the wall. How high up the wall does it reach?", answer: "√(13² − 5²) = √144 = 12 ft.", type: "numeric", numericAnswer: "12", hint: "The ladder is the hypotenuse; the distance from the wall is one leg." },
            { prompt: "A rectangular TV is 40 in wide and 30 in tall. Find the diagonal screen size.", answer: "√(40² + 30²) = √2500 = 50 in.", type: "numeric", numericAnswer: "50", hint: "The diagonal is the hypotenuse of a right triangle formed by the width and height." },
            { prompt: "A rectangular field is 30 m by 40 m. Find the diagonal distance across it.", answer: "√(30² + 40²) = √2500 = 50 m.", type: "numeric", numericAnswer: "50", hint: "Treat the two side lengths as the legs of a right triangle." },
          ] },
      ], test: [
        { prompt: "A triangle has angles of 45° and 75°. Find the third angle.", answer: "60°" },
        { prompt: "A right triangle has one other angle of 27°. Find the third angle.", answer: "63°" },
        { prompt: "A 45-45-90 triangle has legs of length 7. Find the hypotenuse.", answer: "7√2" },
        { prompt: "A 30-60-90 triangle has a hypotenuse of 12. Find the short leg.", answer: "6" },
        { prompt: "Find the hypotenuse of a right triangle with legs 5 and 12.", answer: "13" },
        { prompt: "Find the missing leg of a right triangle with hypotenuse 10 and one leg 6.", answer: "8" },
        { prompt: "A ladder 10 ft long leans against a wall, its base 6 ft from the wall. How high up the wall does it reach?", answer: "8 ft" },
        { prompt: "A rectangular garden is 9 m by 12 m. Find the diagonal distance across it.", answer: "15 m" },
      ] },
      { id: 403, title: "Circles, Area & Volume", difficulty: "Advanced", modules: [
        { title: "Circumference & Area of Circles", status: "not-started",
          description: "Find the circumference and area of a circle using its radius or diameter.",
          diagram: { kind: "shape", shape: "circle", sides: [5], caption: "C = 2πr and A = πr² — both depend on the radius." },
          content: [
            "Circumference (distance around) is C = 2πr or C = πd. Area (space inside) is A = πr². Both formulas depend only on the radius (or diameter), so finding r is usually the first step.",
            "π ≈ 3.14159 is the ratio of a circle's circumference to its diameter — the same for every circle, no matter the size.",
          ],
          exercises: [
            { prompt: "Find the circumference of a circle with radius 5 (leave in terms of π).", answer: "C = 2πr = 2π(5) = 10π.", type: "multiple-choice", choices: [{ label: "10π" }, { label: "5π" }, { label: "25π" }, { label: "20π" }], correctIndex: 0, hint: "Use C = 2πr." },
            { prompt: "Find the area of a circle with radius 4 (leave in terms of π).", answer: "A = πr² = π(4²) = 16π.", type: "multiple-choice", choices: [{ label: "16π" }, { label: "8π" }, { label: "4π" }, { label: "32π" }], correctIndex: 0, hint: "Use A = πr²." },
            { prompt: "A circle has a diameter of 12. Find its circumference (leave in terms of π).", answer: "C = πd = π(12) = 12π.", type: "multiple-choice", choices: [{ label: "12π" }, { label: "6π" }, { label: "24π" }, { label: "144π" }], correctIndex: 0, hint: "Use C = πd directly since you're given the diameter." },
          ] },
        { title: "Surface Area of Solids", status: "not-started",
          description: "Find the surface area of rectangular prisms and cylinders by summing the areas of their faces.",
          diagram: { kind: "shape", shape: "rectangle", sides: [4, 3], caption: "One face of a rectangular prism — surface area sums all six faces." },
          content: [
            "The surface area of a rectangular prism is the sum of the areas of all six faces: SA = 2(lw + lh + wh). A cylinder's surface area is the two circular bases plus the rectangular label that wraps around it: SA = 2πr² + 2πrh.",
            "It often helps to imagine 'unfolding' the solid into its flat faces (a net) before adding up the areas.",
          ],
          exercises: [
            { prompt: "Find the surface area of a rectangular prism with length 4, width 3, height 2.", answer: "SA = 2(lw+lh+wh) = 2(12 + 8 + 6) = 52 square units.", type: "numeric", numericAnswer: "52", hint: "Sum the areas of all three pairs of faces: SA = 2(lw + lh + wh)." },
            { prompt: "Find the surface area of a cylinder with radius 3 and height 5 (leave in terms of π).", answer: "SA = 2πr² + 2πrh = 2π(9) + 2π(3)(5) = 18π + 30π = 48π.", type: "multiple-choice", choices: [{ label: "48π" }, { label: "24π" }, { label: "30π" }, { label: "18π" }], correctIndex: 0, hint: "Add the areas of the two circular bases to the curved side: SA = 2πr² + 2πrh." },
            { prompt: "A cube has side length 5. Find its surface area.", answer: "A cube has 6 identical square faces: 6 × 5² = 150 square units.", type: "numeric", numericAnswer: "150", hint: "A cube has 6 identical square faces." },
          ] },
        { title: "Volume of Prisms & Cylinders", status: "not-started",
          description: "Find the volume of rectangular prisms and cylinders by multiplying base area by height.",
          diagram: { kind: "shape", shape: "rectangle", sides: [5, 3], caption: "Base area × height gives the volume of a prism or cylinder." },
          content: [
            "Volume measures the space inside a solid. For any prism or cylinder, Volume = base area × height. A rectangular prism's base area is length × width, so V = lwh; a cylinder's base area is πr², so V = πr²h.",
            "The key idea — base area times height — extends to any prism, no matter the shape of its base.",
          ],
          exercises: [
            { prompt: "Find the volume of a rectangular prism with length 5, width 3, height 4.", answer: "V = lwh = 5 × 3 × 4 = 60 cubic units.", type: "numeric", numericAnswer: "60", hint: "Volume is base area times height: V = lwh." },
            { prompt: "Find the volume of a cylinder with radius 2 and height 7 (leave in terms of π).", answer: "V = πr²h = π(4)(7) = 28π.", type: "multiple-choice", choices: [{ label: "28π" }, { label: "14π" }, { label: "56π" }, { label: "8π" }], correctIndex: 0, hint: "Volume is the circular base area times height: V = πr²h." },
            { prompt: "A cube has side length 4. Find its volume.", answer: "V = 4³ = 64 cubic units.", type: "numeric", numericAnswer: "64", hint: "Cube volume is side length cubed." },
          ] },
        { title: "Volume of Pyramids & Cones", status: "not-started",
          description: "Find the volume of pyramids and cones using one-third of the base area times height.",
          diagram: { kind: "shape", shape: "triangle", sides: [5, 5, 6], caption: "A pyramid or cone's volume is one-third of a prism/cylinder with the same base and height." },
          content: [
            "A pyramid or cone's volume is exactly one-third of a prism or cylinder with the same base and height: V = (1/3) × base area × height. For a cone, that's V = (1/3)πr²h; for a pyramid with a rectangular base, V = (1/3)lwh.",
            "This 1/3 relationship can be shown experimentally — filling a cone three times fills a cylinder with the same base and height exactly.",
          ],
          exercises: [
            { prompt: "Find the volume of a cone with radius 3 and height 6 (leave in terms of π).", answer: "V = (1/3)πr²h = (1/3)π(9)(6) = 18π.", type: "multiple-choice", choices: [{ label: "18π" }, { label: "54π" }, { label: "6π" }, { label: "9π" }], correctIndex: 0, hint: "A cone's volume is one-third of a cylinder with the same base and height." },
            { prompt: "Find the volume of a pyramid with a rectangular base 4 by 5 and height 6.", answer: "V = (1/3)lwh = (1/3)(4)(5)(6) = 40 cubic units.", type: "numeric", numericAnswer: "40", hint: "Volume is one-third of base area times height: V = (1/3)lwh." },
            { prompt: "A cone and a cylinder share the same radius and height. The cylinder's volume is 60. Find the cone's volume.", answer: "A cone's volume is one-third of the matching cylinder's: 60 ÷ 3 = 20.", type: "numeric", numericAnswer: "20", hint: "A cone's volume is always exactly one-third of the matching cylinder's." },
          ] },
      ], test: [
        { prompt: "Find the circumference of a circle with radius 7 (leave in terms of π).", answer: "14π" },
        { prompt: "Find the area of a circle with radius 6 (leave in terms of π).", answer: "36π" },
        { prompt: "Find the surface area of a rectangular prism with length 6, width 4, height 3.", answer: "SA = 2(24 + 18 + 12) = 108 square units" },
        { prompt: "Find the surface area of a cylinder with radius 2 and height 10 (leave in terms of π).", answer: "SA = 2π(4) + 2π(2)(10) = 8π + 40π = 48π" },
        { prompt: "Find the volume of a rectangular prism with length 6, width 2, height 5.", answer: "60 cubic units" },
        { prompt: "Find the volume of a cylinder with radius 3 and height 4 (leave in terms of π).", answer: "V = π(9)(4) = 36π" },
        { prompt: "Find the volume of a cone with radius 4 and height 9 (leave in terms of π).", answer: "V = (1/3)π(16)(9) = 48π" },
        { prompt: "Find the volume of a pyramid with a rectangular base 3 by 4 and height 9.", answer: "V = (1/3)(3)(4)(9) = 36 cubic units" },
      ] },
    ],
  },
  {
    id: 5, name: "Statistics", grade: "7–8", students: 94,
    description: "Learn to collect, summarize, and interpret data, plus the basics of probability and chance.",
    chapters: [
      { id: 501, title: "Intro to Statistics", difficulty: "Intermediate", modules: [
        { title: "Collecting & Organizing Data", status: "completed",
          description: "Learn methods for collecting data and organizing it into frequency tables.",
          diagram: { kind: "bar-chart", data: [4, 3, 3], labels: ["Math", "Science", "Art"], caption: "A frequency table shown as a bar chart." },
          content: [
            "Data can be collected through surveys, observations, or experiments. Once collected, organizing it into a frequency table — listing each value or category alongside how often it occurs — makes patterns much easier to see.",
            "Categorical data (like favorite color) and numerical data (like height) are often organized differently: categorical data works well in a simple tally/frequency table, while numerical data is often grouped into intervals first.",
          ],
          exercises: [
            { prompt: "A survey of 10 students' favorite courses gives: Math, Math, Science, Art, Math, Science, Art, Math, Science, Art. Make a frequency table.", answer: "Tally each course: Math appears 4 times, Science 3, Art 3.", type: "multiple-choice", choices: [{ label: "Math: 4, Science: 3, Art: 3" }, { label: "Math: 3, Science: 4, Art: 3" }, { label: "Math: 4, Science: 3, Art: 4" }, { label: "Math: 5, Science: 3, Art: 2" }], correctIndex: 0, hint: "Tally how many times each course appears in the list." },
            { prompt: "Explain the difference between categorical and numerical data.", answer: "Categorical data describes qualities or categories (like colors or courses); numerical data consists of measurable quantities (like height or age).", type: "multiple-choice", choices: [{ label: "Categorical describes categories; numerical is measurable quantities" }, { label: "Categorical is always numbers; numerical is always words" }, { label: "There's no difference between them" }, { label: "Categorical data can only come from experiments" }], correctIndex: 0, hint: "Think about whether the data describes a category or a measurable quantity." },
            { prompt: "Why is a frequency table useful when analyzing data?", answer: "It summarizes how often each value or category occurs, making patterns and the most/least common values easy to spot at a glance.", type: "multiple-choice", choices: [{ label: "It makes patterns and common values easy to spot" }, { label: "It hides how often values occur" }, { label: "It only works for numerical data" }, { label: "It requires a computer to make" }], correctIndex: 0, hint: "Think about what a table of counts makes easy to see at a glance." },
          ] },
        { title: "Measures of Center", status: "completed",
          description: "Calculate the mean, median, and mode and know when each is most useful.",
          diagram: { kind: "bar-chart", data: [4, 8, 6, 10, 2], labels: ["4", "8", "6", "10", "2"], caption: "Mean = 6 for this data set." },
          content: [
            "The mean (average) is the sum of all values divided by how many there are. The median is the middle value when data is ordered. The mode is the most frequent value. Together they're called measures of center because each summarizes a data set with one 'typical' value.",
            "The median is often more useful than the mean for skewed data with outliers, since extreme values can pull the mean far from what's 'typical.'",
          ],
          exercises: [
            { prompt: "Find the mean of: 4, 8, 6, 10, 2.", answer: "Sum = 30, divided by 5 values = 6.", type: "numeric", numericAnswer: "6", hint: "Add all the values, then divide by how many there are." },
            { prompt: "Find the median of: 9, 3, 7, 1, 5.", answer: "Ordered: 1, 3, 5, 7, 9 — the middle value is 5.", type: "numeric", numericAnswer: "5", hint: "Order the values first, then find the middle one." },
            { prompt: "Find the mode of: 2, 4, 4, 6, 8, 4.", answer: "4 appears three times, more than any other value.", type: "numeric", numericAnswer: "4", hint: "Find which value appears most often." },
          ] },
        { title: "Measures of Spread", status: "in-progress",
          description: "Learn to describe how spread out a data set is using range, IQR, and standard deviation.",
          diagram: { kind: "bar-chart", data: [4, 8, 15, 16, 23, 42], labels: ["4", "8", "15", "16", "23", "42"], highlightIndices: [1, 4], caption: "4, 8, 15, 16, 23, 42 — Q1 = 8 and Q3 = 23 highlighted, so IQR = 15." },
          content: [
            "While measures of center describe a 'typical' value, measures of spread describe how much the data varies. Range is the simplest (max − min), while interquartile range (IQR) focuses on the middle 50% of the data and resists outliers better.",
            "Standard deviation goes further, measuring the average distance each data point sits from the mean — the larger it is, the more spread out the data.",
          ],
          exercises: [
            { prompt: "Find the range and IQR of the data set: 4, 8, 15, 16, 23, 42.", answer: "Range = 42 − 4 = 38; IQR = Q3 − Q1 = 23 − 8 = 15.", type: "multiple-choice", choices: [{ label: "Range = 38; IQR = 15" }, { label: "Range = 38; IQR = 8" }, { label: "Range = 15; IQR = 38" }, { label: "Range = 46; IQR = 15" }], correctIndex: 0, hint: "Range is max − min; IQR is Q3 − Q1." },
            { prompt: "Explain why IQR is often preferred over range when outliers are present.", answer: "IQR only looks at the middle 50% of the data, so extreme outliers don't distort it the way they distort the range, which depends entirely on the two most extreme values.", type: "multiple-choice", choices: [{ label: "IQR only looks at the middle 50%, resisting outliers" }, { label: "IQR is always a smaller number than range" }, { label: "IQR is easier to calculate than range" }, { label: "IQR includes the outliers, unlike range" }], correctIndex: 0, hint: "Think about which measure only looks at the middle 50% of the data." },
            { prompt: "Given a mean of 50 and standard deviation of 5, describe what values would be considered typical.", answer: "Typical values fall roughly within one standard deviation of the mean, about 45 to 55.", type: "multiple-choice", choices: [{ label: "45 to 55" }, { label: "40 to 60" }, { label: "48 to 52" }, { label: "0 to 50" }], correctIndex: 0, hint: "Typical values are usually within one standard deviation of the mean." },
          ] },
        { title: "Interpreting Graphs", status: "not-started",
          description: "Read and interpret bar graphs, line graphs, and histograms to draw conclusions from data.",
          diagram: { kind: "bar-chart", data: [2, 5, 9, 7, 3], labels: ["50-60", "60-70", "70-80", "80-90", "90-100"], caption: "A histogram showing the distribution of test scores." },
          content: [
            "Bar graphs compare categories, line graphs show change over time, and histograms show the distribution (frequency) of numerical data grouped into intervals. Always check the axis labels and scale first — a graph can look misleading if the scale doesn't start at zero.",
            "When interpreting a graph, look for the overall trend, the highest/lowest points, and anything unusual, like a sudden jump or a gap.",
          ],
          exercises: [
            { prompt: "A histogram shows most test scores between 70-90 with a few below 50. What does this suggest about the class?", answer: "Most students performed well (70–90 range), with a small number struggling significantly (below 50) — worth extra support.", type: "multiple-choice", choices: [{ label: "Most did well, a few struggled significantly" }, { label: "The whole class struggled equally" }, { label: "Most students scored below 50" }, { label: "Scores were evenly spread across all ranges" }], correctIndex: 0, hint: "Think about what the concentration of scores in one range and the few outliers tell you." },
            { prompt: "A line graph shows sales rising steadily each month. What trend does this describe?", answer: "A steady upward (increasing) trend over time.", type: "multiple-choice", choices: [{ label: "A steady upward (increasing) trend" }, { label: "A steady downward (decreasing) trend" }, { label: "No trend — sales are constant" }, { label: "A cyclical trend that repeats" }], correctIndex: 0, hint: "Think about what a steadily rising line represents over time." },
            { prompt: "Why should you check whether a bar graph's y-axis starts at zero?", answer: "If it doesn't start at zero, differences between bars can look much bigger than they really are, exaggerating the comparison.", type: "multiple-choice", choices: [{ label: "A truncated axis exaggerates differences between bars" }, { label: "Graphs are invalid unless they start at zero" }, { label: "It makes the bars easier to color" }, { label: "It has no effect on how the graph reads" }], correctIndex: 0, hint: "Think about how a truncated axis can make small differences look bigger." },
          ] },
        { title: "Sampling Methods", status: "not-started",
          description: "Compare sampling methods and understand how sample selection affects the reliability of conclusions.",
          diagram: { kind: "ratio-bar", parts: [{ value: 1, color: "#1B5E4F", label: "Sample" }, { value: 9, color: "#cbd5e1", label: "Population" }], caption: "A sample represents a portion of the full population." },
          content: [
            "A sample is a subset of a population used to represent the whole. Random sampling (every member has an equal chance of being chosen) tends to produce the most reliable, unbiased results. Convenience sampling (using whoever's easiest to reach) is quick but often biased.",
            "Sample size matters too — larger random samples generally give more reliable estimates of the whole population than smaller ones.",
          ],
          exercises: [
            { prompt: "A researcher surveys the first 20 people who walk by. What type of sampling is this, and what's a risk?", answer: "Convenience sampling — risk of bias, since it may not represent the full population (e.g., only people in that location/time).", type: "multiple-choice", choices: [{ label: "Convenience sampling — risk of bias" }, { label: "Random sampling — no risk of bias" }, { label: "Systematic sampling — risk of bias" }, { label: "Stratified sampling — no risk of bias" }], correctIndex: 0, hint: "This is choosing whoever is easiest to reach." },
            { prompt: "Explain why random sampling tends to produce more reliable results than convenience sampling.", answer: "Random sampling gives every member of the population an equal chance of selection, reducing the risk that the sample systematically differs from the population in some way.", type: "multiple-choice", choices: [{ label: "Every member has an equal chance of selection" }, { label: "It always uses a larger sample size" }, { label: "It only surveys people who volunteer" }, { label: "It's faster than convenience sampling" }], correctIndex: 0, hint: "Think about what an equal chance of selection does for representativeness." },
            { prompt: "A school wants student opinions and surveys every 10th name on an alphabetical roster. What sampling method is this?", answer: "Selecting at a fixed interval down a list is systematic sampling.", type: "multiple-choice", choices: [{ label: "Systematic sampling" }, { label: "Random sampling" }, { label: "Convenience sampling" }, { label: "Stratified sampling" }], correctIndex: 0, hint: "Selecting at a fixed interval down a list has a specific name." },
          ] },
        { title: "Correlation vs. Causation", status: "not-started",
          description: "Distinguish between two variables being correlated and one variable causing changes in another.",
          diagram: { kind: "step-sequence", steps: ["Two variables move together → correlation", "One variable directly causes the other → causation", "Correlation does NOT prove causation"], caption: "Correlation vs. causation." },
          content: [
            "Correlation means two variables tend to change together — as one goes up, the other tends to go up (positive) or down (negative). Causation means one variable's change directly causes the other's change. Correlation alone never proves causation.",
            "A classic trap is a 'lurking variable' — a third factor that causes both observed variables to move together, making them appear related when neither directly causes the other (e.g., ice cream sales and drowning both rise in summer because of heat, not because one causes the other).",
          ],
          exercises: [
            { prompt: "True or False: Ice cream sales causing shark attacks is the best explanation for why both rise in summer.", answer: "No — both are caused by a lurking variable: warmer weather, which increases both ice cream sales and beach attendance (and thus shark encounters).", type: "true-false", correctIndex: 1, hint: "Look for a third factor that could explain both trends at once." },
            { prompt: "Explain the difference between correlation and causation.", answer: "Correlation means two variables tend to change together; causation means one variable's change directly produces the other's change. Correlation doesn't prove causation.", type: "multiple-choice", choices: [{ label: "Correlation is moving together; causation is directly producing change" }, { label: "Correlation and causation mean the same thing" }, { label: "Causation is weaker evidence than correlation" }, { label: "Correlation always implies causation" }], correctIndex: 0, hint: "One describes variables moving together; the other requires one to directly produce the other." },
            { prompt: "Give an example of two variables that are correlated but where one doesn't cause the other.", answer: "Any reasonable example works, e.g. the number of firefighters at a fire and the amount of damage — both are caused by the fire's size, not by each other.", type: "multiple-choice", choices: [{ label: "Firefighters at a fire and amount of damage (both caused by fire size)" }, { label: "Studying more hours and higher test scores" }, { label: "Turning a key and a car starting" }, { label: "Heating water and it boiling" }], correctIndex: 0, hint: "Think of two things that share a common underlying cause." },
          ] },
      ], test: [
        { prompt: "A survey of pets owned gives: Dog, Cat, Dog, Fish, Cat, Dog, Dog. Make a frequency table.", answer: "Dog: 4, Cat: 2, Fish: 1" },
        { prompt: "Find the mean of: 10, 20, 30, 40.", answer: "25" },
        { prompt: "Find the range of the data set: 12, 18, 9, 25, 14.", answer: "16" },
        { prompt: "A histogram is tallest in the middle and shorter on both ends. What shape of distribution does this describe?", answer: "A roughly symmetric (bell-shaped) distribution." },
        { prompt: "A pollster only surveys people leaving a gym. What type of sampling is this, and why might it be biased?", answer: "Convenience sampling — biased because gym-goers may have different opinions/habits than the general population, especially regarding health-related questions." },
        { prompt: "A study finds taller people tend to have larger vocabularies. Does height cause vocabulary size? Explain.", answer: "No — both likely increase with age in children (a lurking variable), not because height itself affects vocabulary." },
      ] },
      { id: 502, title: "Data Displays & Measures of Center", difficulty: "Beginner", modules: [
        { title: "Histograms & Box Plots", status: "completed",
          description: "Build and interpret histograms and box plots to visualize the distribution of a data set.",
          diagram: { kind: "bar-chart", data: [2, 4, 5, 7, 9, 10, 12], labels: ["2", "4", "5", "7", "9", "10", "12"], highlightIndices: [1, 3, 5], caption: "A data set's five-number summary: min, Q1, median, Q3, max." },
          content: [
            "A histogram groups numerical data into intervals (bins) and shows frequency as bar height, revealing the overall shape of a distribution. A box plot shows five key values: minimum, Q1, median, Q3, and maximum, making it easy to compare spread and skew at a glance.",
            "In a box plot, the box spans the interquartile range (IQR, the middle 50% of data), and the 'whiskers' extend to the minimum and maximum (excluding outliers, if marked separately).",
          ],
          exercises: [
            { prompt: "For the data set 2, 4, 5, 7, 9, 10, 12, find the five-number summary for a box plot.", answer: "Min 2, Q1 4, Median 7, Q3 10, Max 12", type: "multiple-choice", choices: [{ label: "Min 2, Q1 4, Median 7, Q3 10, Max 12" }, { label: "Min 2, Q1 5, Median 7, Q3 9, Max 12" }, { label: "Min 2, Q1 4, Median 9, Q3 10, Max 12" }, { label: "Min 4, Q1 5, Median 7, Q3 9, Max 10" }], correctIndex: 0, hint: "Identify the minimum, maximum, median, and the medians of each half (Q1, Q3)." },
            { prompt: "A histogram is tall on the left and has a long tail to the right. What is this shape called?", answer: "The tail stretches to the right, so this is right-skewed (positively skewed).", type: "multiple-choice", choices: [{ label: "Right-skewed" }, { label: "Left-skewed" }, { label: "Symmetric" }, { label: "Bimodal" }], correctIndex: 0, hint: "The 'tail' side — where it stretches out — names the skew direction." },
            { prompt: "What does the box in a box plot represent?", answer: "The interquartile range (IQR) — the middle 50% of the data, from Q1 to Q3.", type: "multiple-choice", choices: [{ label: "The interquartile range (middle 50% of the data)" }, { label: "The full range of the data" }, { label: "Just the median value" }, { label: "The outliers only" }], correctIndex: 0, hint: "The box spans the middle 50% of the data." },
          ] },
        { title: "Mean, Median & Mode", status: "in-progress",
          description: "Learn to calculate and compare the three most common measures of center.",
          diagram: { kind: "bar-chart", data: [3, 7, 7, 9, 12], labels: ["3", "7", "7", "9", "12"], highlightIndices: [1, 2], caption: "3, 7, 7, 9, 12 — the mode (7) is highlighted since it appears twice." },
          content: [
            "The mean is the average — add all values and divide by how many there are. The median is the middle value when data is ordered (or the average of the two middle values). The mode is the value that appears most often.",
            "Each measure can tell a different story: the mean is sensitive to outliers, while the median usually gives a more typical picture when the data is skewed.",
          ],
          exercises: [
            { prompt: "Find the mean, median, and mode of: 3, 7, 7, 9, 12.", answer: "Mean = (3+7+7+9+12)/5 = 7.6, median = 7 (middle value), mode = 7 (repeats).", type: "multiple-choice", choices: [{ label: "Mean 7.6, median 7, mode 7" }, { label: "Mean 8, median 7, mode 7" }, { label: "Mean 7.6, median 9, mode 7" }, { label: "Mean 7.6, median 7, mode 12" }], correctIndex: 0, hint: "Add and divide for the mean, order and find the middle for the median, find the most frequent value for the mode." },
            { prompt: "Add an outlier of 100 to the data set above and recompute the mean and median. Which changed more?", answer: "New mean = 23, new median = 8. The mean changed dramatically (7.6 → 23), while the median barely moved (7 → 8) — the mean is far more sensitive to outliers.", type: "multiple-choice", choices: [{ label: "New mean 23, new median 8 — mean changed far more" }, { label: "New mean 8, new median 23 — median changed far more" }, { label: "Both changed by the same amount" }, { label: "Neither value changed" }], correctIndex: 0, hint: "Recompute both — think about which one an extreme value pulls further." },
            { prompt: "True or False: A data set with no repeated values has no mode.", answer: "Correct — mode requires a value to repeat, so an all-unique data set has none.", type: "true-false", correctIndex: 0, hint: "Mode requires a value to repeat at least once." },
          ] },
        { title: "Outliers & Their Effects", status: "not-started",
          description: "Identify outliers in a data set and understand how they affect the mean, median, and spread.",
          diagram: { kind: "bar-chart", data: [2, 3, 4, 5, 50], labels: ["2", "3", "4", "5", "50"], highlightIndices: [4], caption: "50 is a clear outlier — it pulls the mean far from the rest of the data." },
          content: [
            "An outlier is a value far removed from the rest of the data. A common rule: a value is an outlier if it falls more than 1.5×IQR below Q1 or above Q3. Outliers can dramatically affect the mean but have little effect on the median.",
            "Before removing an outlier, consider whether it's a data-entry error or a genuine (if unusual) data point — genuine outliers can be important information, not just noise to discard.",
          ],
          exercises: [
            { prompt: "A data set has Q1 = 10, Q3 = 20. Using the 1.5×IQR rule, find the upper outlier boundary.", answer: "Upper boundary = Q3 + 1.5×IQR = 20 + 1.5(10) = 35.", type: "numeric", numericAnswer: "35", hint: "The upper boundary is Q3 + 1.5 × IQR." },
            { prompt: "The data set 2, 3, 4, 5, 50 has an obvious outlier. Find the mean with and without it.", answer: "With all five: 12.8. Without the outlier (2, 3, 4, 5): 3.5 — the outlier pulls the mean up dramatically.", type: "multiple-choice", choices: [{ label: "With: 12.8, Without: 3.5" }, { label: "With: 3.5, Without: 12.8" }, { label: "With: 12.8, Without: 12.8" }, { label: "With: 10.8, Without: 3.5" }], correctIndex: 0, hint: "Compute the mean of all five values, then just the first four." },
            { prompt: "Explain why the median is more resistant to outliers than the mean.", answer: "The median only depends on the middle value's position, not the actual size of extreme values, so a very large or small outlier doesn't shift it much (if at all).", type: "multiple-choice", choices: [{ label: "It depends on position, not the size of extreme values" }, { label: "It depends on the exact size of every value, just like the mean" }, { label: "It's always equal to the mean" }, { label: "It ignores half of the data set" }], correctIndex: 0, hint: "Think about whether the median depends on the size of extreme values or just their position." },
          ] },
        { title: "Comparing Data Sets", status: "not-started",
          description: "Compare two data sets using their measures of center and spread.",
          diagram: { kind: "bar-chart", data: [80, 82, 78, 80, 80], labels: ["80", "82", "78", "80", "80"], caption: "Team A's scores — tightly clustered around a mean of 80." },
          content: [
            "To compare two data sets fairly, look at both center (mean or median) and spread (range, IQR, or standard deviation) — center alone can hide big differences in consistency. Two data sets can have the same mean but very different spreads.",
            "Box plots placed side by side are a great way to visually compare distributions at once.",
          ],
          exercises: [
            { prompt: "Team A's scores: 80, 82, 78, 80, 80 (mean 80). Team B's scores: 60, 100, 70, 90, 80 (mean 80). Compare their consistency.", answer: "Team A is much more consistent (small spread); Team B has the same mean but a much larger spread.", type: "multiple-choice", choices: [{ label: "Team A is more consistent; Team B has a larger spread" }, { label: "Team B is more consistent; Team A has a larger spread" }, { label: "Both teams are equally consistent" }, { label: "Consistency can't be compared since the means are equal" }], correctIndex: 0, hint: "Compare how spread out each team's scores are, not just their averages." },
            { prompt: "Explain why comparing only the means of two data sets can be misleading.", answer: "Two data sets can share the same mean while having very different spreads, so relying on the mean alone hides how consistent or variable each set actually is.", type: "multiple-choice", choices: [{ label: "Two sets can share a mean but have very different spreads" }, { label: "The mean is always wrong for comparing data sets" }, { label: "Means can only be compared if the data sets are the same size" }, { label: "It isn't misleading — the mean tells you everything" }], correctIndex: 0, hint: "Think about two sets with the same mean but very different spreads." },
            { prompt: "Class A has a median score of 75 and Class B has a median of 82. What does this tell you, and what's missing?", answer: "Class B's typical score is higher, but you'd also want to compare spread (IQR or range) to know how consistent each class's scores were.", type: "multiple-choice", choices: [{ label: "B's typical score is higher; spread (IQR/range) is still missing" }, { label: "B's scores are more consistent; nothing else is needed" }, { label: "A and B have the same distribution of scores" }, { label: "The medians alone prove B's class is better overall" }], correctIndex: 0, hint: "Center alone doesn't tell you about consistency — what other measure would help?" },
          ] },
      ], test: [
        { prompt: "For the data set 1, 3, 3, 5, 7, 8, 9, find the five-number summary.", answer: "Min 1, Q1 3, Median 5, Q3 8, Max 9" },
        { prompt: "A histogram is tall on the right and has a long tail to the left. What is this shape called?", answer: "Left-skewed (negatively skewed)" },
        { prompt: "Find the mean of: 5, 10, 15, 20, 25.", answer: "15" },
        { prompt: "Find the median of: 8, 3, 12, 5, 9.", answer: "8" },
        { prompt: "A data set has Q1 = 15, Q3 = 25. Using the 1.5×IQR rule, find the lower outlier boundary.", answer: "15 − 1.5(10) = 0" },
        { prompt: "The data set 5, 6, 7, 8, 40 has an outlier. Find the mean with and without it.", answer: "With: 13.2. Without (5, 6, 7, 8): 6.5" },
        { prompt: "Data set X: 50, 52, 48, 50 (mean 50). Data set Y: 20, 80, 40, 60 (mean 50). Compare their spread.", answer: "X has a very small spread (tightly clustered); Y has a much larger spread despite the same mean." },
        { prompt: "Why might a teacher look at both the median and IQR when comparing two classes' test scores?", answer: "The median shows the typical score, while the IQR shows how consistent the class was — two classes could have the same median but very different consistency." },
      ] },
      { id: 503, title: "Probability Fundamentals", difficulty: "Intermediate", modules: [
        { title: "Basic Probability Rules", status: "not-started",
          description: "Calculate the probability of simple events using the basic probability formula.",
          diagram: { kind: "ratio-bar", parts: [{ value: 4, color: "#1B5E4F", label: "Red" }, { value: 6, color: "#F0981E", label: "Blue" }], caption: "P(red) = 4/10 = 2/5." },
          content: [
            "Probability measures how likely an event is, from 0 (impossible) to 1 (certain). The basic formula is P(event) = (favorable outcomes) / (total outcomes). Probabilities can be written as fractions, decimals, or percents.",
            "The probability of an event NOT happening is 1 minus the probability of it happening: P(not A) = 1 − P(A).",
          ],
          exercises: [
            { prompt: "A bag has 4 red and 6 blue marbles. Find the probability of drawing a red marble.", answer: "4 red out of 10 total: 4/10 = 0.4.", type: "numeric", numericAnswer: "0.4", hint: "Divide the number of red marbles by the total number of marbles." },
            { prompt: "A die is rolled once. Find the probability of rolling a number greater than 4.", answer: "Only 5 and 6 are greater than 4: 2 out of 6 = 1/3.", type: "multiple-choice", choices: [{ label: "2/6 = 1/3" }, { label: "1/6" }, { label: "3/6 = 1/2" }, { label: "4/6 = 2/3" }], correctIndex: 0, hint: "Count how many faces are greater than 4 out of 6." },
            { prompt: "The probability of rain tomorrow is 0.3. Find the probability it does NOT rain.", answer: "1 − 0.3 = 0.7.", type: "numeric", numericAnswer: "0.7", hint: "The probability of an event not happening is 1 minus its probability." },
          ] },
        { title: "Independent & Dependent Events", status: "not-started",
          description: "Determine whether two events are independent or dependent and calculate their combined probability.",
          diagram: { kind: "step-sequence", steps: ["Independent: P(A and B) = P(A) × P(B)", "Dependent: adjust P(B) based on A's outcome"], caption: "Independent vs. dependent events." },
          content: [
            "Two events are independent if one's outcome doesn't affect the other's probability (like flipping a coin twice). They're dependent if the first event changes the probability of the second (like drawing cards without replacement).",
            "For independent events, P(A and B) = P(A) × P(B). For dependent events, you must adjust the second probability based on what happened first.",
          ],
          exercises: [
            { prompt: "A coin is flipped twice. Find the probability of getting heads both times.", answer: "Independent events multiply: 1/2 × 1/2 = 1/4 = 0.25.", type: "numeric", numericAnswer: "0.25", hint: "For independent events, multiply the individual probabilities." },
            { prompt: "A bag has 5 red and 5 blue marbles. Two are drawn without replacement. Find the probability both are red.", answer: "5/10 × 4/9 = 20/90 = 2/9.", type: "multiple-choice", choices: [{ label: "5/10 × 4/9 = 2/9" }, { label: "5/10 × 5/9 = 25/90" }, { label: "5/10 × 4/10 = 2/10" }, { label: "4/10 × 4/9 = 16/90" }], correctIndex: 0, hint: "After the first red marble is removed, both the red count and total change for the second draw." },
            { prompt: "True or False: Rolling a die and flipping a coin are independent events.", answer: "True — the outcome of the die roll has no effect on the coin flip's probability.", type: "true-false", correctIndex: 0, hint: "Think about whether one outcome changes the probability of the other." },
          ] },
        { title: "Compound Probability", status: "not-started",
          description: "Find the probability of two events happening using 'and' (intersection) and 'or' (union) rules.",
          diagram: { kind: "ratio-bar", parts: [{ value: 13, color: "#1B5E4F", label: "Hearts" }, { value: 9, color: "#F0981E", label: "Other face cards" }, { value: 30, color: "#cbd5e1", label: "Rest" }], caption: "P(heart or face card) accounts for the overlap between the two groups." },
          content: [
            "For 'and' (both events happening), multiply probabilities (adjusting for dependence if needed). For 'or' (at least one event happening), add the probabilities and subtract the overlap: P(A or B) = P(A) + P(B) − P(A and B), to avoid double-counting outcomes that satisfy both.",
            "If two events can't happen at the same time (mutually exclusive), there's no overlap to subtract: P(A or B) = P(A) + P(B).",
          ],
          exercises: [
            { prompt: "A die is rolled. Find the probability of rolling a 2 or a 5.", answer: "Mutually exclusive outcomes: 1/6 + 1/6 = 2/6 = 1/3.", type: "multiple-choice", choices: [{ label: "1/6 + 1/6 = 1/3" }, { label: "1/6 × 1/6 = 1/36" }, { label: "1/6" }, { label: "2/6 − 1/6 = 1/6" }], correctIndex: 0, hint: "These outcomes can't happen at the same time, so just add their probabilities." },
            { prompt: "A card is drawn from a standard deck. Find the probability it's a heart or a face card.", answer: "P(heart)=13/52, P(face)=12/52, P(heart and face)=3/52 → 13/52+12/52−3/52 = 22/52 = 11/26.", type: "multiple-choice", choices: [{ label: "22/52 = 11/26" }, { label: "25/52" }, { label: "13/52 + 12/52 = 25/52" }, { label: "9/52" }], correctIndex: 0, hint: "Add the two probabilities, then subtract the overlap so you don't double-count." },
            { prompt: "True or False: 'Rolling an even number' and 'rolling a 3' are mutually exclusive on a single die roll.", answer: "True — no outcome is both even and equal to 3, so they can't happen at the same time.", type: "true-false", correctIndex: 0, hint: "Check whether any single outcome satisfies both conditions at once." },
          ] },
        { title: "Expected Value", status: "not-started",
          description: "Calculate the expected value of a probability distribution to predict long-run average outcomes.",
          diagram: { kind: "bar-chart", data: [2, 1.7, -2], labels: ["Game 1", "Spinner", "Raffle"], caption: "Expected value compares outcomes across different games/decisions." },
          content: [
            "Expected value is the long-run average outcome of a random event, found by multiplying each outcome by its probability and adding the results: E = Σ(value × probability). It tells you what to expect on average over many repetitions, not what happens in any single trial.",
            "Expected value is widely used to evaluate whether a game or decision is favorable — a positive expected value (for gains) suggests a good bet over the long run.",
          ],
          exercises: [
            { prompt: "A game pays $10 with probability 0.2 and $0 otherwise. Find the expected value.", answer: "0.2 × $10 + 0.8 × $0 = $2.", type: "numeric", numericAnswer: "2", hint: "Multiply each outcome by its probability and add the results." },
            { prompt: "A spinner lands on 1 (prob 0.5), 2 (prob 0.3), or 3 (prob 0.2). Find the expected value.", answer: "1(0.5) + 2(0.3) + 3(0.2) = 0.5 + 0.6 + 0.6 = 1.7.", type: "numeric", numericAnswer: "1.7", hint: "Multiply each value by its probability, then sum all three." },
            { prompt: "A raffle ticket costs $5 and has a 1/100 chance of winning $300. Find the expected value of playing (net gain/loss).", answer: "Expected winnings: 300 × (1/100) = $3; net expected value: $3 − $5 = −$2.", type: "numeric", numericAnswer: "-2", hint: "Find the expected winnings first, then subtract the cost of the ticket." },
          ] },
      ], test: [
        { prompt: "A bag has 3 green and 7 yellow marbles. Find the probability of drawing a green marble.", answer: "3/10" },
        { prompt: "A die is rolled once. Find the probability of rolling an even number.", answer: "3/6 = 1/2" },
        { prompt: "A coin is flipped three times. Find the probability of getting heads all three times.", answer: "1/2 × 1/2 × 1/2 = 1/8" },
        { prompt: "A bag has 4 red and 6 blue marbles. Two are drawn without replacement. Find the probability both are blue.", answer: "6/10 × 5/9 = 30/90 = 1/3" },
        { prompt: "A die is rolled. Find the probability of rolling a 1 or an even number.", answer: "P(1)=1/6, P(even)=3/6, no overlap → 4/6 = 2/3" },
        { prompt: "A card is drawn from a standard deck. Find the probability it's a king or a spade.", answer: "P(king)=4/52, P(spade)=13/52, P(king and spade)=1/52 → 4/52+13/52−1/52 = 16/52 = 4/13" },
        { prompt: "A game pays $20 with probability 0.1 and $0 otherwise. Find the expected value.", answer: "$2" },
        { prompt: "A spinner lands on 1 (prob 0.6), 5 (prob 0.4). Find the expected value.", answer: "1(0.6) + 5(0.4) = 0.6 + 2 = 2.6" },
      ] },
    ],
  },
  {
    id: 6, name: "Pre-Calculus", grade: "10", students: 31,
    description: "Deepen function fluency with trigonometry, exponentials, and logarithms to prepare for Calculus.",
    chapters: [
      { id: 601, title: "Functions & Their Graphs", difficulty: "Intermediate", modules: [
        { title: "Function Notation & Transformations", status: "completed",
          description: "Use function notation to evaluate functions and describe how transformations shift, stretch, or reflect graphs.",
          diagram: { kind: "graph", family: "quadratic", a: 1, bq: 0, c: -3, domain: [-4, 4], caption: "g(x) = f(x) − 3 shifts y = x² down 3 units." },
          content: [
            "Function notation f(x) means 'the output of function f when the input is x.' To evaluate f(3), substitute 3 everywhere x appears in the function's rule.",
            "Transformations shift graphs predictably: f(x) + k shifts up/down, f(x + h) shifts left/right, −f(x) reflects vertically, and a·f(x) stretches or compresses vertically. Recognizing these patterns lets you sketch transformed graphs without re-plotting from scratch.",
          ],
          exercises: [
            { prompt: "If f(x) = 2x + 1, find f(4).", answer: "Substitute: 2(4) + 1 = 9.", type: "numeric", numericAnswer: "9", hint: "Substitute 4 in for x." },
            { prompt: "If f(x) = x², describe the transformation for g(x) = f(x) − 3.", answer: "Subtracting outside the function shifts the graph down: shifts f down 3 units.", type: "multiple-choice", choices: [{ label: "Shifts down 3 units" }, { label: "Shifts up 3 units" }, { label: "Shifts left 3 units" }, { label: "Shifts right 3 units" }], correctIndex: 0, hint: "Subtracting outside the function shifts the graph vertically." },
            { prompt: "If f(x) = x², describe the transformation for g(x) = f(x + 2).", answer: "Adding inside the function shifts the graph left: shifts f left 2 units.", type: "multiple-choice", choices: [{ label: "Shifts left 2 units" }, { label: "Shifts right 2 units" }, { label: "Shifts up 2 units" }, { label: "Shifts down 2 units" }], correctIndex: 0, hint: "Adding inside the function shifts the graph horizontally — but the direction may surprise you." },
          ] },
        { title: "Piecewise Functions", status: "in-progress",
          description: "Learn to define, evaluate, and graph functions made of multiple pieces.",
          diagram: { kind: "graph", family: "piecewise", pieces: [{ m: -1, b: 1, from: -6, to: 2, toOpen: true }, { m: 0, b: 3, from: 2, to: 6, toOpen: false }], caption: "f(x) = −x + 1 for x < 2 (open circle at x=2), f(x) = 3 for x ≥ 2 (closed circle)." },
          content: [
            "A piecewise function uses different rules for different parts of its domain, like f(x) = x² for x < 0 and f(x) = 2x for x ≥ 0. To evaluate it at a point, first figure out which piece's condition the input satisfies, then apply that rule.",
            "When graphing, sketch each piece only over its own domain, and pay attention to whether the endpoints are open or closed circles.",
          ],
          exercises: [
            { prompt: "Evaluate the piecewise function above at x = −3 and x = 5.", answer: "−3 < 0 so use x²: (−3)² = 9. 5 ≥ 0 so use 2x: 2(5) = 10.", type: "multiple-choice", choices: [{ label: "f(−3) = 9, f(5) = 10" }, { label: "f(−3) = −9, f(5) = 10" }, { label: "f(−3) = 9, f(5) = −10" }, { label: "f(−3) = 6, f(5) = 10" }], correctIndex: 0, hint: "Check which condition each x-value satisfies before choosing which rule to apply." },
            { prompt: "Graph f(x) = −x + 1 for x < 2 and f(x) = 3 for x ≥ 2.", answer: "For x < 2, plot y = −x + 1 with an open circle at (2, −1); for x ≥ 2, plot the horizontal line y = 3 with a closed circle at (2, 3).", type: "multiple-choice", choices: [{ label: "y = −x+1 for x < 2 (open at 2), y = 3 for x ≥ 2 (closed at 2)" }, { label: "y = −x+1 for x ≥ 2, y = 3 for x < 2" }, { label: "Plot y = −x+1 everywhere" }, { label: "Plot y = 3 everywhere" }], correctIndex: 0, hint: "Sketch each rule only over its own domain, and check whether each endpoint is open or closed." },
            { prompt: "Write a piecewise function describing a flat shipping fee of $5 for orders under $50, and free shipping otherwise.", answer: "f(x) = 5 for x < 50, and f(x) = 0 for x ≥ 50.", type: "multiple-choice", choices: [{ label: "f(x) = 5 for x < 50, f(x) = 0 for x ≥ 50" }, { label: "f(x) = 0 for x < 50, f(x) = 5 for x ≥ 50" }, { label: "f(x) = 5 for all x" }, { label: "f(x) = 50 for x < 5, f(x) = 0 for x ≥ 5" }], correctIndex: 0, hint: "Write one rule for orders under $50 and a different rule for $50 and above." },
          ] },
        { title: "Inverse Functions", status: "not-started",
          description: "Find the inverse of a function and understand the relationship between a function and its inverse.",
          diagram: { kind: "graph", family: "linear-system", m: 1, b: 5, m2: 1, b2: -5, domain: [-8, 3], caption: "f(x) = x + 5 and its inverse f⁻¹(x) = x − 5." },
          content: [
            "The inverse of a function 'undoes' it — if f(a) = b, then f⁻¹(b) = a. To find an inverse algebraically, swap x and y in the equation and solve for the new y.",
            "Graphically, a function and its inverse are mirror images across the line y = x. A function only has an inverse that's also a function if it's one-to-one (passes the horizontal line test).",
          ],
          exercises: [
            { prompt: "Find the inverse of f(x) = x + 5.", answer: "Swap x and y: x = y + 5, solve for y: y = x − 5.", type: "multiple-choice", choices: [{ label: "f⁻¹(x) = x − 5" }, { label: "f⁻¹(x) = x + 5" }, { label: "f⁻¹(x) = −x − 5" }, { label: "f⁻¹(x) = 5 − x" }], correctIndex: 0, hint: "Swap x and y, then solve for y." },
            { prompt: "Find the inverse of f(x) = 3x.", answer: "Swap x and y: x = 3y, solve for y: y = x/3.", type: "multiple-choice", choices: [{ label: "f⁻¹(x) = x/3" }, { label: "f⁻¹(x) = 3x" }, { label: "f⁻¹(x) = x − 3" }, { label: "f⁻¹(x) = 3/x" }], correctIndex: 0, hint: "Swap x and y, then solve for y." },
            { prompt: "Find the inverse of f(x) = 2x − 4.", answer: "Swap x and y: x = 2y − 4, solve for y: y = (x + 4)/2.", type: "multiple-choice", choices: [{ label: "f⁻¹(x) = (x + 4)/2" }, { label: "f⁻¹(x) = (x − 4)/2" }, { label: "f⁻¹(x) = 2x + 4" }, { label: "f⁻¹(x) = (x + 2)/4" }], correctIndex: 0, hint: "Swap x and y, then solve for the new y." },
          ] },
        { title: "Rational Functions", status: "not-started",
          description: "Graph rational functions by identifying vertical and horizontal asymptotes.",
          diagram: { kind: "graph", family: "rational", asymptoteX: 4, domain: [-1, 9], caption: "f(x) = 1/(x − 4) — a vertical asymptote at x = 4." },
          content: [
            "A rational function is a ratio of polynomials, like f(x) = 1/(x − 2). A vertical asymptote occurs where the denominator equals zero (and the numerator doesn't), since the function is undefined and grows without bound there.",
            "A horizontal asymptote describes the function's end behavior as x → ±∞ — for a simple function like 1/(x − a), the horizontal asymptote is y = 0.",
          ],
          exercises: [
            { prompt: "Find the vertical asymptote of f(x) = 1/(x − 4).", answer: "The denominator is zero when x = 4.", type: "numeric", numericAnswer: "4", hint: "Set the denominator equal to zero." },
            { prompt: "Find the vertical asymptote of f(x) = 3/(x + 2).", answer: "The denominator is zero when x = −2.", type: "numeric", numericAnswer: "-2", hint: "Find the value of x that makes the denominator zero." },
            { prompt: "What is the horizontal asymptote of f(x) = 1/(x − 4)?", answer: "As x → ±∞, the fraction approaches 0.", type: "numeric", numericAnswer: "0", hint: "Think about what happens to the fraction as x gets very large." },
          ] },
      ], test: [
        { prompt: "If f(x) = 3x − 2, find f(5).", answer: "13" },
        { prompt: "If f(x) = x², describe the transformation for g(x) = −f(x).", answer: "Reflects the graph of f over the x-axis." },
        { prompt: "Evaluate a given piecewise function at three specified input values.", answer: "Identify which piece's domain condition each input satisfies, then substitute into that piece's rule — show the substitution for each value." },
        { prompt: "Graph a two-piece function and correctly mark open/closed endpoints.", answer: "Sketch each piece only over its stated domain; use an open circle where an endpoint is excluded and a closed circle where it's included." },
        { prompt: "Find the inverse of f(x) = x − 7.", answer: "f⁻¹(x) = x + 7" },
        { prompt: "Find the inverse of f(x) = (x − 1)/2.", answer: "f⁻¹(x) = 2x + 1" },
        { prompt: "Find the vertical asymptote of f(x) = 2/(x − 5).", answer: "x = 5" },
        { prompt: "Find the vertical asymptote of f(x) = 1/(x + 6).", answer: "x = −6" },
      ] },
      { id: 602, title: "Trigonometry Foundations", difficulty: "Advanced", modules: [
        { title: "The Unit Circle", status: "not-started",
          description: "Use the unit circle to find sine and cosine values for common angles.",
          diagram: { kind: "unit-circle", angleDeg: 60, caption: "The point at 60° on the unit circle is (cos 60°, sin 60°) = (0.5, √3/2)." },
          content: [
            "The unit circle is a circle of radius 1 centered at the origin. For any angle θ measured from the positive x-axis, the point where the angle's ray meets the circle has coordinates (cos θ, sin θ) — this is the definition of sine and cosine for any angle, not just those in a right triangle.",
            "Key angles like 30°, 45°, 60°, and 90° (and their radian equivalents) have exact, memorizable sine and cosine values that come up constantly in trigonometry.",
          ],
          exercises: [
            { prompt: "Find cos(0°) and sin(0°).", answer: "At 0°, the point on the unit circle is (1, 0).", type: "multiple-choice", choices: [{ label: "cos = 1, sin = 0" }, { label: "cos = 0, sin = 1" }, { label: "cos = −1, sin = 0" }, { label: "cos = 0, sin = −1" }], correctIndex: 0, hint: "At 0°, the point on the unit circle is (1, 0)." },
            { prompt: "Find cos(90°) and sin(90°).", answer: "At 90°, the point on the unit circle is (0, 1).", type: "multiple-choice", choices: [{ label: "cos = 0, sin = 1" }, { label: "cos = 1, sin = 0" }, { label: "cos = 0, sin = −1" }, { label: "cos = −1, sin = 0" }], correctIndex: 0, hint: "At 90°, the point on the unit circle is (0, 1)." },
            { prompt: "Find cos(180°) and sin(180°).", answer: "At 180°, the point on the unit circle is (−1, 0).", type: "multiple-choice", choices: [{ label: "cos = −1, sin = 0" }, { label: "cos = 0, sin = −1" }, { label: "cos = 1, sin = 0" }, { label: "cos = 0, sin = 1" }], correctIndex: 0, hint: "At 180°, the point on the unit circle is (−1, 0)." },
          ] },
        { title: "Graphing Sine & Cosine", status: "not-started",
          description: "Graph sine and cosine functions using amplitude and period.",
          diagram: { kind: "graph", family: "trig", amplitude: 1, period: 6.283185307179586, domain: [-6.5, 6.5], caption: "y = sin(x) — one full wave every 2π." },
          content: [
            "The graphs of y = sin(x) and y = cos(x) are smooth waves that repeat every 2π (360°) — this repeat length is called the period. Amplitude is half the distance between the wave's highest and lowest points; for y = a·sin(x), the amplitude is |a|.",
            "y = sin(x) starts at 0, rises to 1, back to 0, down to −1, and back to 0 over one period. y = cos(x) follows the same shape but starts at its maximum (1).",
          ],
          exercises: [
            { prompt: "Find the amplitude and period of y = 3 sin(x).", answer: "The coefficient 3 is the amplitude; sin(x) alone always has period 2π.", type: "multiple-choice", choices: [{ label: "Amplitude 3, period 2π" }, { label: "Amplitude 2π, period 3" }, { label: "Amplitude 3, period π" }, { label: "Amplitude 1, period 2π" }], correctIndex: 0, hint: "The amplitude is the coefficient in front; the period of sin(x) alone is always 2π." },
            { prompt: "Find the amplitude and period of y = sin(2x).", answer: "No coefficient in front means amplitude 1; the 2 inside compresses the period to 2π/2 = π.", type: "multiple-choice", choices: [{ label: "Amplitude 1, period π" }, { label: "Amplitude 2, period 2π" }, { label: "Amplitude 1, period 4π" }, { label: "Amplitude 2, period π" }], correctIndex: 0, hint: "A coefficient multiplying x inside the function compresses the period." },
            { prompt: "At what x-value does y = cos(x) first reach its maximum for x > 0?", answer: "x = 0 is the maximum already; the next one, one full period later, is at x = 2π.", type: "multiple-choice", choices: [{ label: "x = 2π" }, { label: "x = π" }, { label: "x = π/2" }, { label: "x = 4π" }], correctIndex: 0, hint: "cos(x) starts at its maximum — think about when it returns to that same point." },
          ] },
        { title: "Trig Identities", status: "not-started",
          description: "Use the Pythagorean and reciprocal identities to simplify trigonometric expressions.",
          diagram: { kind: "unit-circle", angleDeg: 37, caption: "sin²θ + cos²θ = 1 for every point on the unit circle." },
          content: [
            "The Pythagorean identity sin²θ + cos²θ = 1 comes directly from the unit circle and is the most-used trig identity. From it, you can derive tan²θ + 1 = sec²θ and 1 + cot²θ = csc²θ.",
            "Reciprocal identities relate the six trig functions: tan θ = sin θ/cos θ, csc θ = 1/sin θ, sec θ = 1/cos θ, cot θ = 1/tan θ. Use these to rewrite expressions in terms of sine and cosine, which often simplifies things.",
          ],
          exercises: [
            { prompt: "Simplify: sin²θ + cos²θ.", answer: "This is exactly the Pythagorean identity, which equals 1.", type: "numeric", numericAnswer: "1", hint: "This is exactly the Pythagorean identity." },
            { prompt: "Rewrite tan θ in terms of sin θ and cos θ.", answer: "tan θ is defined as the ratio sin θ / cos θ.", type: "multiple-choice", choices: [{ label: "tan θ = sin θ / cos θ" }, { label: "tan θ = cos θ / sin θ" }, { label: "tan θ = sin θ · cos θ" }, { label: "tan θ = 1/(sin θ + cos θ)" }], correctIndex: 0, hint: "tan θ is defined as a ratio of sine and cosine." },
            { prompt: "If sin θ = 3/5, find cos θ using the Pythagorean identity (assume θ is in Quadrant I).", answer: "cos²θ = 1 − 9/25 = 16/25, so cos θ = 4/5 = 0.8.", type: "numeric", numericAnswer: "0.8", hint: "Use sin²θ + cos²θ = 1 and solve for cos²θ." },
          ] },
        { title: "Solving Trig Equations", status: "not-started",
          description: "Solve basic trigonometric equations by finding all angles that satisfy them within a given interval.",
          diagram: { kind: "unit-circle", angleDeg: 30, caption: "sin θ = 0.5 at θ = 30° (and also at 150°, its mirror in Quadrant II)." },
          content: [
            "To solve a trig equation like sin θ = 0.5, find the reference angle using inverse sine, then use the unit circle to find every angle in the given interval with that sine value (since sine is positive in two quadrants).",
            "Always check how many solutions the interval allows — an equation like sin θ = 0.5 on [0°, 360°) typically has two solutions, since sine repeats and is positive in both Quadrant I and II.",
          ],
          exercises: [
            { prompt: "Solve sin θ = 0.5 for 0° ≤ θ < 360°.", answer: "Reference angle 30°; sine is positive in Quadrants I and II: θ = 30° or θ = 150°.", type: "multiple-choice", choices: [{ label: "θ = 30° or θ = 150°" }, { label: "θ = 60° or θ = 120°" }, { label: "θ = 30° or θ = 330°" }, { label: "θ = 150° or θ = 210°" }], correctIndex: 0, hint: "Sine is positive in Quadrants I and II — find the reference angle first." },
            { prompt: "Solve cos θ = 0 for 0° ≤ θ < 360°.", answer: "The x-coordinate is 0 at θ = 90° and θ = 270° on the unit circle.", type: "multiple-choice", choices: [{ label: "θ = 90° or θ = 270°" }, { label: "θ = 0° or θ = 180°" }, { label: "θ = 45° or θ = 225°" }, { label: "θ = 90° or θ = 180°" }], correctIndex: 0, hint: "Think about where on the unit circle the x-coordinate is exactly 0." },
            { prompt: "Solve sin θ = 0 for 0° ≤ θ < 360°.", answer: "The y-coordinate is 0 at θ = 0° and θ = 180° on the unit circle.", type: "multiple-choice", choices: [{ label: "θ = 0° or θ = 180°" }, { label: "θ = 90° or θ = 270°" }, { label: "θ = 0° or θ = 360°" }, { label: "θ = 180° only" }], correctIndex: 0, hint: "Think about where on the unit circle the y-coordinate is exactly 0." },
          ] },
      ], test: [
        { prompt: "Find cos(270°) and sin(270°).", answer: "cos(270°) = 0, sin(270°) = −1" },
        { prompt: "Find cos(45°) and sin(45°).", answer: "cos(45°) = sin(45°) = √2/2 ≈ 0.707" },
        { prompt: "Find the amplitude and period of y = 4 cos(x).", answer: "Amplitude 4, period 2π" },
        { prompt: "Find the amplitude and period of y = sin(3x).", answer: "Amplitude 1, period 2π/3" },
        { prompt: "Simplify: 1 − sin²θ.", answer: "cos²θ" },
        { prompt: "Rewrite sec θ in terms of cos θ.", answer: "sec θ = 1 / cos θ" },
        { prompt: "Solve cos θ = 0.5 for 0° ≤ θ < 360°.", answer: "θ = 60° or θ = 300°" },
        { prompt: "Solve sin θ = −1 for 0° ≤ θ < 360°.", answer: "θ = 270°" },
      ] },
    ],
  },
  {
    id: 7, name: "Calculus", grade: "11–12", students: 28,
    description: "Tackle limits, derivatives, and integrals — the mathematics of change and accumulation.",
    chapters: [
      { id: 701, title: "Limits & Continuity", difficulty: "Intermediate", modules: [
        { title: "Evaluating Limits Graphically", status: "completed",
          description: "Find the limit of a function at a point by reading its graph.",
          diagram: { kind: "graph", family: "piecewise", pieces: [{ m: 1, b: 1, from: -4, to: 2, toOpen: true }, { m: 1, b: 3, from: 2, to: 6, fromOpen: true }], caption: "A removable discontinuity — the limit exists at x = 2 even though there's a hole." },
          content: [
            "The limit of f(x) as x approaches a describes the value f(x) gets close to as x gets close to a — from both sides. Graphically, trace the curve from the left and from the right toward x = a and see what y-value both sides approach.",
            "The limit can exist even if f(a) is undefined or different from the limit — what matters is where the curve is heading, not necessarily where a hole or defined point sits.",
          ],
          exercises: [
            { prompt: "A graph shows f(x) approaching y = 3 from both sides as x approaches 2, with a hole at (2, 3). Find lim(x→2) f(x).", answer: "The limit exists even though there's a hole, since both sides approach 3.", type: "numeric", numericAnswer: "3", hint: "Focus on what y-value the curve approaches from both sides, not whether there's a hole." },
            { prompt: "True or False: A graph showing f(x) approaching 4 from the left and 6 from the right as x approaches 1 means the limit exists at x = 1.", answer: "False — since the left- and right-hand limits differ (4 ≠ 6), the two-sided limit doesn't exist.", type: "true-false", correctIndex: 1, hint: "For a two-sided limit to exist, the left and right values must match." },
            { prompt: "A graph shows f(x) shooting up toward infinity as x approaches 0 from both sides. Describe lim(x→0) f(x).", answer: "The limit does not exist (it increases without bound) — this indicates a vertical asymptote at x = 0.", type: "multiple-choice", choices: [{ label: "Limit doesn't exist — increases without bound (vertical asymptote)" }, { label: "Limit equals 0" }, { label: "Limit equals infinity, treated as a number" }, { label: "Limit equals the y-intercept" }], correctIndex: 0, hint: "Think about whether the function is approaching a specific finite value or growing without bound." },
          ] },
        { title: "Evaluating Limits Algebraically", status: "completed",
          description: "Evaluate limits algebraically using direct substitution, factoring, and simplification.",
          diagram: { kind: "graph", family: "quadratic", a: 1, bq: 0, c: -9, domain: [-5, 5], markPoints: [{ x: 3, y: 0, label: "x = 3" }], caption: "(x² − 9)/(x − 3) simplifies to x + 3 everywhere except x = 3." },
          content: [
            "For most functions, evaluating a limit is as simple as direct substitution: plug in the value and simplify. When substitution gives 0/0 (an indeterminate form), factor and cancel common terms first, then substitute again.",
            "This 0/0 trick works because the canceled factor represents a removable discontinuity — the simplified function agrees with the original everywhere except at that single point, which is exactly what a limit ignores.",
          ],
          exercises: [
            { prompt: "Evaluate: lim(x→3) (x² − 9)/(x − 3).", answer: "Factor: (x−3)(x+3)/(x−3) = x+3, so the limit is 6.", type: "numeric", numericAnswer: "6", hint: "Direct substitution gives 0/0 — factor the numerator and cancel first." },
            { prompt: "Evaluate: lim(x→2) (x + 5).", answer: "Direct substitution: 2 + 5 = 7.", type: "numeric", numericAnswer: "7", hint: "No indeterminate form here — just substitute directly." },
            { prompt: "Evaluate: lim(x→0) (x² + 3x)/x.", answer: "Factor: x(x+3)/x = x+3, so the limit is 3.", type: "numeric", numericAnswer: "3", hint: "Factor out x from the numerator, then cancel with the denominator." },
          ] },
        { title: "Continuity & Discontinuities", status: "in-progress",
          description: "Learn to identify where a function is continuous and classify the types of discontinuities.",
          diagram: { kind: "graph", family: "rational", asymptoteX: 3, domain: [-1, 7], caption: "f(x) = 1/(x − 3) — an infinite discontinuity (vertical asymptote) at x = 3." },
          content: [
            "A function is continuous at a point if the limit exists there, the function is defined there, and the two match. If any of those fail, the function has a discontinuity — common types include removable (a hole), jump, and infinite (asymptote).",
            "Recognizing which type you're dealing with helps you decide how to handle it, whether that's simplifying an expression, checking one-sided limits, or noting an asymptote.",
          ],
          exercises: [
            { prompt: "True or False: f(x) = (x² − 4)/(x − 2) is continuous at x = 2.", answer: "False — the function is undefined there (0/0), even though the limit exists and equals 4. This is a removable discontinuity.", type: "true-false", correctIndex: 1, hint: "Check whether the function is actually defined at x = 2, not just whether the limit exists." },
            { prompt: "Classify the discontinuity of f(x) = 1/(x − 3) at x = 3.", answer: "1/(x−3) grows without bound as x approaches 3 — an infinite discontinuity (vertical asymptote).", type: "multiple-choice", choices: [{ label: "Infinite discontinuity (vertical asymptote)" }, { label: "Removable discontinuity (a hole)" }, { label: "Jump discontinuity" }, { label: "No discontinuity — continuous" }], correctIndex: 0, hint: "Think about what happens to the function's value as x gets close to 3." },
            { prompt: "Which best describes a jump discontinuity at x = 1?", answer: "Two pieces that approach different y-values at x = 1 — e.g. one piece ending at (1, 2) with an open circle, another starting at (1, 4) with a closed circle.", type: "multiple-choice", choices: [{ label: "Two pieces approaching different y-values at x = 1" }, { label: "Two pieces meeting at the same y-value" }, { label: "A single continuous curve" }, { label: "A hole with no other feature" }], correctIndex: 0, hint: "The two pieces should approach different y-values as they meet at x = 1." },
          ] },
        { title: "Limits at Infinity", status: "not-started",
          description: "Evaluate limits as x approaches infinity to determine a function's end behavior and horizontal asymptotes.",
          diagram: { kind: "graph", family: "rational", asymptoteX: 0, domain: [-10, 10], caption: "As x → ±∞, 1/x approaches 0 — a horizontal asymptote." },
          content: [
            "A limit at infinity describes what happens to f(x) as x grows without bound in either direction. For rational functions, compare the degree of the numerator and denominator: if the denominator's degree is higher, the limit is 0; if they're equal, the limit is the ratio of leading coefficients; if the numerator's degree is higher, the limit is infinite.",
            "These limits directly tell you a rational function's horizontal asymptote (or lack of one).",
          ],
          exercises: [
            { prompt: "Evaluate: lim(x→∞) 1/x.", answer: "As x grows without bound, a fraction with a fixed numerator shrinks toward 0.", type: "numeric", numericAnswer: "0", hint: "As x grows without bound, what happens to a fraction with a fixed numerator?" },
            { prompt: "Evaluate: lim(x→∞) (3x² + 1)/(x² − 5).", answer: "Degrees are equal, so the limit is the ratio of leading coefficients: 3/1 = 3.", type: "numeric", numericAnswer: "3", hint: "Compare the degrees of the numerator and denominator — when they're equal, compare leading coefficients." },
            { prompt: "Evaluate: lim(x→∞) (2x)/(x² + 1).", answer: "The denominator's degree is higher, so the limit is 0.", type: "numeric", numericAnswer: "0", hint: "Compare the degrees of the numerator and denominator — a higher-degree denominator wins." },
          ] },
      ], test: [
        { prompt: "A graph shows f(x) approaching 5 from both sides as x approaches 3. Find lim(x→3) f(x).", answer: "5" },
        { prompt: "A graph shows f(x) approaching 2 from the left and −2 from the right as x approaches 0. Does the limit exist?", answer: "No — the one-sided limits disagree, so the two-sided limit doesn't exist." },
        { prompt: "Evaluate: lim(x→4) (x² − 16)/(x − 4).", answer: "Factor: (x−4)(x+4)/(x−4) = x+4, so the limit is 8" },
        { prompt: "Evaluate: lim(x→1) (3x − 2).", answer: "1 (direct substitution)" },
        { prompt: "Determine whether a given rational function is continuous at a specified point.", answer: "Check three things at that point: the function is defined there, the limit exists there, and the limit equals the function's value. All three must hold." },
        { prompt: "Classify a discontinuity as removable, jump, or infinite given a graph.", answer: "Removable: a single missing point (a hole) where the limit exists but doesn't match the function's value. Jump: left- and right-hand limits exist but disagree. Infinite: the function grows without bound (a vertical asymptote)." },
        { prompt: "Evaluate: lim(x→∞) 5/x².", answer: "0" },
        { prompt: "Evaluate: lim(x→∞) (4x³)/(2x³ + x).", answer: "2 (ratio of leading coefficients)" },
      ] },
      { id: 702, title: "Derivatives & Applications", difficulty: "Advanced", modules: [
        { title: "The Derivative as a Rate of Change", status: "not-started",
          description: "Understand the derivative as the instantaneous rate of change, defined as the limit of the difference quotient.",
          diagram: { kind: "graph", family: "quadratic", a: 1, bq: 0, c: 0, domain: [-3, 3], markPoints: [{ x: 1, y: 1, label: "tangent at x=1" }], caption: "The derivative is the slope of the tangent line at a point." },
          content: [
            "The derivative f'(x) measures the instantaneous rate of change of f at a point — the slope of the tangent line there. It's defined as f'(x) = lim(h→0) [f(x+h) − f(x)] / h, the limit of the slope between two increasingly close points.",
            "While average rate of change (slope of a secant line) uses two distinct points, the derivative captures the rate of change at a single instant by letting those two points merge.",
          ],
          exercises: [
            { prompt: "Explain the difference between average rate of change and instantaneous rate of change.", answer: "Average rate of change is the slope between two distinct points (a secant line); instantaneous rate of change is the slope at a single point (a tangent line), found via a derivative.", type: "multiple-choice", choices: [{ label: "Average is a secant slope; instantaneous is a tangent slope" }, { label: "Average is a tangent slope; instantaneous is a secant slope" }, { label: "They're always equal" }, { label: "Average only applies to straight lines" }], correctIndex: 0, hint: "Think about the difference between a slope through two points and a slope at just one point." },
            { prompt: "For f(x) = x², use the difference quotient to find f'(x).", answer: "f'(x) = lim(h→0) [(x+h)² − x²]/h = lim(h→0) [2xh + h²]/h = 2x.", type: "multiple-choice", choices: [{ label: "f'(x) = 2x" }, { label: "f'(x) = x²" }, { label: "f'(x) = 2" }, { label: "f'(x) = x" }], correctIndex: 0, hint: "Expand (x+h)², subtract x², then divide by h before taking the limit." },
            { prompt: "If a car's position is s(t) = t², what does s'(t) represent physically?", answer: "The derivative of position with respect to time is the car's instantaneous velocity at time t.", type: "multiple-choice", choices: [{ label: "Instantaneous velocity" }, { label: "Total distance traveled" }, { label: "Average speed" }, { label: "Acceleration" }], correctIndex: 0, hint: "The derivative of position with respect to time represents a rate of motion." },
          ] },
        { title: "Derivative Rules", status: "not-started",
          description: "Apply the power, product, and quotient rules to find derivatives quickly.",
          diagram: { kind: "graph", family: "cubic", roots: [-1, 0, 1], domain: [-2, 2], caption: "Derivative rules let you find the slope function for any polynomial." },
          content: [
            "The power rule says d/dx[xⁿ] = n·xⁿ⁻¹ — the most-used derivative shortcut. The product rule handles derivatives of two multiplied functions: d/dx[fg] = f'g + fg'. The quotient rule handles division: d/dx[f/g] = (f'g − fg')/g².",
            "Constants pull straight through (d/dx[c·f(x)] = c·f'(x)), and the derivative of a sum is the sum of the derivatives.",
          ],
          exercises: [
            { prompt: "Find the derivative of f(x) = x⁴.", answer: "Power rule: bring down the 4, subtract 1 from the exponent: f'(x) = 4x³.", type: "multiple-choice", choices: [{ label: "f'(x) = 4x³" }, { label: "f'(x) = 4x⁴" }, { label: "f'(x) = x³" }, { label: "f'(x) = 3x⁴" }], correctIndex: 0, hint: "Use the power rule: bring the exponent down and subtract 1 from it." },
            { prompt: "Find the derivative of f(x) = 3x² + 5x − 7.", answer: "Differentiate each term: d/dx[3x²]=6x, d/dx[5x]=5, d/dx[−7]=0: f'(x) = 6x + 5.", type: "multiple-choice", choices: [{ label: "f'(x) = 6x + 5" }, { label: "f'(x) = 3x + 5" }, { label: "f'(x) = 6x − 7" }, { label: "f'(x) = 6x + 5x" }], correctIndex: 0, hint: "Differentiate each term separately using the power rule." },
            { prompt: "Use the product rule to find the derivative of f(x) = x²(x + 1).", answer: "f'g + fg' with f=x², g=(x+1): f'(x) = 2x(x+1) + x²(1) = 3x² + 2x.", type: "multiple-choice", choices: [{ label: "f'(x) = 3x² + 2x" }, { label: "f'(x) = 2x² + 2x" }, { label: "f'(x) = x² + 2x" }, { label: "f'(x) = 3x² + x" }], correctIndex: 0, hint: "Use f'g + fg' with f = x² and g = (x + 1)." },
          ] },
        { title: "The Chain Rule", status: "not-started",
          description: "Use the chain rule to differentiate composite functions.",
          diagram: { kind: "graph", family: "quadratic", a: 1, bq: 0, c: 0, domain: [-3, 3], caption: "The chain rule handles derivatives of composite (nested) functions." },
          content: [
            "The chain rule differentiates a composite function f(g(x)): d/dx[f(g(x))] = f'(g(x)) · g'(x) — take the derivative of the 'outside' function, leave the inside alone, then multiply by the derivative of the 'inside' function.",
            "Recognizing a composite function is the key first step: if a function is 'a function of a function,' like (3x + 1)⁵, the chain rule applies.",
          ],
          exercises: [
            { prompt: "Find the derivative of f(x) = (2x + 1)³.", answer: "Chain rule: 3(2x+1)²·2 = 6(2x+1)².", type: "multiple-choice", choices: [{ label: "f'(x) = 6(2x+1)²" }, { label: "f'(x) = 3(2x+1)²" }, { label: "f'(x) = 6(2x+1)³" }, { label: "f'(x) = 2(2x+1)²" }], correctIndex: 0, hint: "Differentiate the outside power first, then multiply by the derivative of what's inside." },
            { prompt: "Find the derivative of f(x) = (x² + 4)⁵.", answer: "Chain rule: 5(x²+4)⁴·2x = 10x(x²+4)⁴.", type: "multiple-choice", choices: [{ label: "f'(x) = 10x(x²+4)⁴" }, { label: "f'(x) = 5x(x²+4)⁴" }, { label: "f'(x) = 10(x²+4)⁴" }, { label: "f'(x) = 10x(x²+4)⁵" }], correctIndex: 0, hint: "Bring down the exponent, reduce it by 1, then multiply by the derivative of the inside." },
            { prompt: "Find the derivative of f(x) = √(3x + 2).", answer: "Rewrite as (3x+2)^(1/2), chain rule: (1/(2√(3x+2)))·3 = 3/(2√(3x+2)).", type: "multiple-choice", choices: [{ label: "f'(x) = 3/(2√(3x+2))" }, { label: "f'(x) = 1/(2√(3x+2))" }, { label: "f'(x) = 3/√(3x+2)" }, { label: "f'(x) = 3√(3x+2)/2" }], correctIndex: 0, hint: "Rewrite the square root as a power of 1/2, then apply the chain rule." },
          ] },
        { title: "Applications: Related Rates & Optimization", status: "not-started",
          description: "Use derivatives to solve related rates problems and find maximum or minimum values.",
          diagram: { kind: "graph", family: "quadratic", a: 1, bq: -4, c: 3, markPoints: [{ x: 2, y: -1, label: "min" }], domain: [-1, 5], caption: "Setting f'(x) = 0 finds the critical point — here, a minimum at x = 2." },
          content: [
            "Related rates problems connect the rates of change of two or more related quantities — differentiate the relating equation with respect to time, then substitute known values to solve for the unknown rate.",
            "Optimization problems find a maximum or minimum value by setting the derivative equal to zero (finding critical points) and checking which one gives the best result for the situation.",
          ],
          exercises: [
            { prompt: "A circle's radius grows at 2 cm/s. Using A = πr², find how fast the area grows when r = 5.", answer: "dA/dt = 2πr·(dr/dt) = 2π(5)(2) = 20π cm²/s.", type: "multiple-choice", choices: [{ label: "20π cm²/s" }, { label: "10π cm²/s" }, { label: "50π cm²/s" }, { label: "4π cm²/s" }], correctIndex: 0, hint: "Differentiate A = πr² with respect to time, then substitute the known values." },
            { prompt: "Find the critical point of f(x) = x² − 4x + 3 by setting f'(x) = 0.", answer: "f'(x) = 2x − 4 = 0 → x = 2 (a minimum, since a > 0).", type: "numeric", numericAnswer: "2", hint: "Set the derivative equal to zero and solve for x." },
            { prompt: "A rectangle's perimeter is fixed at 20. Express its area A as a function of one side x, then find the value of x that maximizes it.", answer: "A(x) = x(10−x) = 10x − x²; A'(x) = 10 − 2x = 0 → x = 5 (a 5×5 square maximizes area).", type: "numeric", numericAnswer: "5", hint: "Write the second side in terms of x using the fixed perimeter, then set the derivative of the area to zero." },
          ] },
      ], test: [
        { prompt: "For f(x) = 3x, use the difference quotient to find f'(x).", answer: "f'(x) = lim(h→0) [3(x+h) − 3x]/h = lim(h→0) 3h/h = 3" },
        { prompt: "Explain what the derivative represents geometrically.", answer: "The slope of the tangent line to the function's graph at a given point." },
        { prompt: "Find the derivative of f(x) = x⁵.", answer: "f'(x) = 5x⁴" },
        { prompt: "Find the derivative of f(x) = 4x³ − 2x + 1.", answer: "f'(x) = 12x² − 2" },
        { prompt: "Find the derivative of f(x) = (5x − 3)⁴.", answer: "f'(x) = 4(5x−3)³·5 = 20(5x−3)³" },
        { prompt: "Find the derivative of f(x) = (x³ + 1)².", answer: "f'(x) = 2(x³+1)·3x² = 6x²(x³+1)" },
        { prompt: "A balloon's radius grows at 3 cm/s. Using V = (4/3)πr³, find how fast the volume grows when r = 2.", answer: "dV/dt = 4πr²·(dr/dt) = 4π(4)(3) = 48π cm³/s" },
        { prompt: "Find the critical point of f(x) = x² + 6x + 5 by setting f'(x) = 0.", answer: "f'(x) = 2x + 6 = 0 → x = −3 (a minimum, since a > 0)" },
      ] },
    ],
  },
];

export const tutors: Tutor[] = [
  { id: 1, firstName: "Jennifer", lastName: "Chen",      courses: ["Algebra", "Geometry"],        grades: [6, 7, 8, 9],       students: 14, sessions: 38, description: "Breaks down algebra and geometry into visual, step-by-step problems so abstract rules finally click. Patient with students who need concepts repeated a few different ways.", profession: "Middle School Math Teacher" },
  { id: 2, firstName: "David",    lastName: "Thompson",  courses: ["Algebra II", "Calculus"],     grades: [9, 10, 11, 12],    students: 11, sessions: 29, description: "Makes algebra II and calculus click by tying abstract rules to real-world modeling and hands-on problem-solving instead of rote memorization.", profession: "Data Analyst" },
  { id: 3, firstName: "Maria",    lastName: "Rodriguez", courses: ["Pre-Alg", "Statistics"],      grades: [6, 7, 8, 9, 10],   students: 16, sessions: 44, description: "Builds strong number-sense foundations in pre-algebra and statistics, with a calm, encouraging style that's great for students still building math confidence.", profession: "Actuary" },
  { id: 4, firstName: "Andrew",   lastName: "Kim",       courses: ["Geometry", "Pre-Calculus"],   grades: [8, 9, 10, 11],     students: 13, sessions: 35, description: "Turns geometry and pre-calculus into everyday phenomena students can see and test themselves, focusing on visual intuition before formulas.", profession: "Civil Engineer" },
  { id: 5, firstName: "Francoise",lastName: "Umubyeyi",  courses: ["Pre-Calculus", "Calculus"],   grades: [9, 10, 11, 12],    students: 20, sessions: 25, description: "Guides students through pre-calculus and calculus with a focus on problem-solving strategy, helping them recognize patterns across problem types rather than memorizing steps.", profession: "Software Engineer" },
];

// Takes the tutor list as a parameter (rather than closing over the static seed
// `tutors` array) so callers can pass the live, staff-editable list from
// useTutors() and correctly resolve tutors added after the app loaded.
export function getTutorById(tutorList: Tutor[], id: number): Tutor | undefined {
  return tutorList.find((t) => t.id === id);
}

// Tutors who cover both the grade and the course of a currently at-risk student —
// broader than `tutorStudents` below, which only reflects tutors who've already
// had a session with that specific student.
export interface AtRiskAlert {
  student: Student;
  course: string;
}

export function getAtRiskAlertsForTutor(tutorList: Tutor[], tutorId: number): AtRiskAlert[] {
  const tutor = getTutorById(tutorList, tutorId);
  if (!tutor) return [];
  return students
    .filter((s) => s.status === "at-risk" && tutor.grades.includes(s.grade))
    .flatMap((s) => s.courses.filter((c) => tutor.courses.includes(c)).map((course) => ({ student: s, course })));
}

export function findChapterById(courses: CurriculumCourse[], chapterId: number): { course: CurriculumCourse; chapter: CurriculumChapter } | undefined {
  for (const course of courses) {
    const chapter = course.chapters.find((ch) => ch.id === chapterId);
    if (chapter) return { course, chapter };
  }
  return undefined;
}

// Resolves against the static seed roster — used only for historical/display
// lookups (past session records), which can never reference a tutor added
// after load, so this doesn't need the live tutor list.
export function tutorNameById(id: number): string {
  const t = getTutorById(tutors, id);
  return t ? `${t.firstName} ${t.lastName}` : "";
}

export const studentCourseDetail: Record<number, CourseDetail[]> = {
  1: [{ course: "Algebra",      score: 82, sessions: 7, lastSession: "Jun 18", trend: "up"   }, { course: "Algebra II",   score: 74, sessions: 5, lastSession: "Jun 15", trend: "up"   }],
  2: [{ course: "Calculus",     score: 61, sessions: 4, lastSession: "Jun 17", trend: "flat" }, { course: "Geometry",     score: 68, sessions: 4, lastSession: "Jun 14", trend: "up"   }],
  3: [{ course: "Geometry",     score: 94, sessions: 8, lastSession: "Jun 19", trend: "up"   }, { course: "Pre-Alg",      score: 88, sessions: 7, lastSession: "Jun 16", trend: "up"   }],
  4: [{ course: "Pre-Calculus", score: 52, sessions: 3, lastSession: "Jun 12", trend: "down" }, { course: "Algebra II",   score: 58, sessions: 3, lastSession: "Jun 10", trend: "flat" }],
  5: [{ course: "Algebra II",   score: 86, sessions: 6, lastSession: "Jun 18", trend: "up"   }, { course: "Statistics",   score: 80, sessions: 5, lastSession: "Jun 16", trend: "up"   }],
  6: [{ course: "Calculus",     score: 67, sessions: 5, lastSession: "Jun 17", trend: "up"   }, { course: "Algebra",      score: 73, sessions: 4, lastSession: "Jun 15", trend: "flat" }],
  7: [{ course: "Pre-Alg",      score: 91, sessions: 7, lastSession: "Jun 19", trend: "up"   }, { course: "Geometry",     score: 85, sessions: 7, lastSession: "Jun 17", trend: "up"   }],
  8: [{ course: "Calculus",     score: 68, sessions: 4, lastSession: "Jun 18", trend: "up"   }, { course: "Pre-Calculus", score: 60, sessions: 3, lastSession: "Jun 14", trend: "flat" }],
};

export const studentSessionHistory: Record<number, SessionRecord[]> = {
  1: [{ course: "Algebra",       tutorId: 1, date: "Jun 18", score: 84, duration: 60 }, { course: "Algebra II",    tutorId: 2, date: "Jun 15", score: 76, duration: 45 }, { course: "Algebra",       tutorId: 1, date: "Jun 11", score: 79, duration: 60 }, { course: "Algebra II", tutorId: 2, date: "Jun 8",  score: 71, duration: 45 }],
  2: [{ course: "Calculus",      tutorId: 2, date: "Jun 17", score: 63, duration: 45 }, { course: "Geometry",      tutorId: 1, date: "Jun 14", score: 70, duration: 60 }, { course: "Calculus",      tutorId: 2, date: "Jun 10", score: 58, duration: 45 }],
  3: [{ course: "Geometry",      tutorId: 4, date: "Jun 19", score: 96, duration: 60, artifacts: [{ id: 1, type: "notes", label: "Session notes", url: "https://notes.menya.app/sessions/3-jun19" }, { id: 2, type: "whiteboard", label: "Whiteboard", url: "https://whiteboard.menya.app/sessions/3-jun19" }] }, { course: "Pre-Alg",       tutorId: 3, date: "Jun 16", score: 91, duration: 60, artifacts: [{ id: 3, type: "notes", label: "Session notes", url: "https://notes.menya.app/sessions/3-jun16" }] }, { course: "Geometry",      tutorId: 4, date: "Jun 12", score: 93, duration: 45 }, { course: "Pre-Alg",  tutorId: 5, date: "Jun 9",  score: 88, duration: 60 }],
  4: [{ course: "Pre-Calculus",  tutorId: 4, date: "Jun 12", score: 54, duration: 45 }, { course: "Pre-Calculus",  tutorId: 5, date: "Jun 10", score: 57, duration: 60 }, { course: "Pre-Calculus",  tutorId: 4, date: "Jun 5",  score: 49, duration: 45 }, { course: "Pre-Calculus", tutorId: 5, date: "Jun 1", score: 52, duration: 60 }],
  5: [{ course: "Algebra II",    tutorId: 2, date: "Jun 18", score: 88, duration: 60 }, { course: "Statistics",    tutorId: 3, date: "Jun 16", score: 82, duration: 45 }, { course: "Algebra II",    tutorId: 2, date: "Jun 13", score: 85, duration: 60 }, { course: "Statistics", tutorId: 3, date: "Jun 10", score: 78, duration: 45 }],
  6: [{ course: "Calculus",      tutorId: 2, date: "Jun 17", score: 69, duration: 45 }, { course: "Algebra",       tutorId: 1, date: "Jun 15", score: 74, duration: 60 }, { course: "Calculus",      tutorId: 2, date: "Jun 11", score: 64, duration: 45 }],
  7: [{ course: "Pre-Alg",       tutorId: 3, date: "Jun 19", score: 93, duration: 60 }, { course: "Geometry",      tutorId: 4, date: "Jun 17", score: 87, duration: 45 }, { course: "Pre-Alg",       tutorId: 3, date: "Jun 14", score: 90, duration: 60 }, { course: "Geometry",      tutorId: 4, date: "Jun 11", score: 84, duration: 45 }],
  8: [{ course: "Pre-Calculus",  tutorId: 5, date: "Jun 18", score: 68, duration: 60 }, { course: "Pre-Calculus",  tutorId: 4, date: "Jun 14", score: 60, duration: 45 }, { course: "Calculus",      tutorId: 5, date: "Jun 11", score: 63, duration: 60 }, { course: "Pre-Calculus", tutorId: 4, date: "Jun 7",  score: 56, duration: 45 }],
};

export const tutorAssignedIds = [3, 4, 8];

export const weeklyData = [
  { week: "Wk 1", avgScore: 58, sessions: 52 },
  { week: "Wk 2", avgScore: 62, sessions: 61 },
  { week: "Wk 3", avgScore: 65, sessions: 68 },
  { week: "Wk 4", avgScore: 67, sessions: 71 },
  { week: "Wk 5", avgScore: 70, sessions: 78 },
  { week: "Wk 6", avgScore: 73, sessions: 84 },
];

export const courseBreakdown = [
  { name: "Algebra",       students: 85, color: "#1B5E4F" },
  { name: "Algebra II",    students: 73, color: "#059669" },
  { name: "Pre-Alg",       students: 47, color: "#F59E0B" },
  { name: "Geometry",      students: 61, color: "#3B82F6" },
  { name: "Statistics",    students: 33, color: "#EC4899" },
  { name: "Pre-Calculus",  students: 38, color: "#8B5CF6" },
  { name: "Calculus",      students: 54, color: "#6366F1" },
];

export const tutorWeeklyData = [
  { week: "Wk 1", sessions: 4, avgScore: 62 },
  { week: "Wk 2", sessions: 5, avgScore: 65 },
  { week: "Wk 3", sessions: 4, avgScore: 67 },
  { week: "Wk 4", sessions: 5, avgScore: 68 },
  { week: "Wk 5", sessions: 4, avgScore: 70 },
  { week: "Wk 6", sessions: 5, avgScore: 72 },
];

export const studentModules = [
  { course: "Pre-Alg",       title: "Pre-Algebra Foundations", completion: 80, totalModules: 6, currentModule: 5, active: false },
  { course: "Pre-Alg",       title: "Linear Equations (next)", completion: 0,  totalModules: 5, currentModule: 0, active: false },

  // Math — additional module progress (more courses to follow later)
  { course: "Algebra",       title: "Quadratic Equations",                completion: 68, totalModules: 6, currentModule: 4, active: true  },
  { course: "Algebra",       title: "Systems of Equations (next)",        completion: 0,  totalModules: 7, currentModule: 0, active: false },
  { course: "Algebra II",    title: "Polynomial Functions",               completion: 45, totalModules: 8, currentModule: 4, active: true  },
  { course: "Geometry",      title: "Geometry Essentials",                completion: 55, totalModules: 8, currentModule: 4, active: true  },
  { course: "Geometry",      title: "Triangles & the Pythagorean Theorem (next)", completion: 0, totalModules: 6, currentModule: 0, active: false },
  { course: "Statistics",    title: "Intro to Statistics",                completion: 59, totalModules: 5, currentModule: 3, active: true  },
  { course: "Pre-Calculus",  title: "Functions & Their Graphs",           completion: 30, totalModules: 7, currentModule: 2, active: true  },
  { course: "Calculus",      title: "Limits & Continuity",                completion: 68, totalModules: 6, currentModule: 4, active: true  },
];

// Tutor-initiated Curriculum Library search history (see Curriculum Library Tutor
// Search Feature.md) — seeded with a couple of past searches so the history panel
// isn't empty on first load. Nothing here is system-generated; every entry
// originates from a tutor typing a prompt.
export const libraryQueries: LibrarySearchQuery[] = [
  {
    id: 1,
    tutorId: CURRENT_TUTOR_ID,
    promptText: "8th grader is solid on the basics but keeps mixing up signs — needs a warm-up on factoring quadratics before we tackle harder problems",
    createdAt: "Aug 19",
    decision: "approved",
    result: {
      matchStrength: "strong",
      course: "Algebra",
      chapterTitle: "Quadratic Equations",
      moduleTitle: "Factoring Quadratics",
      difficulty: "Intermediate",
      aiNote: "Found a close match in the library: Algebra › Quadratic Equations › Factoring Quadratics. Surfacing the existing notes, worked example, and practice questions.",
      description: "Factor quadratic expressions into two binomials to solve equations and find roots.",
      content: [
        "Factoring reverses multiplication of binomials — look for two numbers that multiply to the constant term and add to the middle coefficient.",
        "Sign mistakes are the most common error: double-check whether both factors should be positive, both negative, or one of each before moving on.",
      ],
      workedExample: { prompt: "Factor x² − x − 12.", answer: "Find two numbers that multiply to −12 and add to −1: −4 and 3. So x² − x − 12 = (x − 4)(x + 3)." },
      exercises: [
        { prompt: "Factor: x² + 5x + 6.", answer: "(x + 2)(x + 3)" },
        { prompt: "Factor: x² − 2x − 15.", answer: "(x − 5)(x + 3)" },
      ],
    },
  },
  {
    id: 2,
    tutorId: CURRENT_TUTOR_ID,
    promptText: "Need a quick warm-up activity before Friday's regional math competition, nothing tied to a specific unit",
    createdAt: "Aug 20",
    decision: "approved",
    result: {
      matchStrength: "none",
      aiNote: "No close match found in the library for this prompt. Drafted general practice questions from what you typed — consider flagging this as a content gap for program staff.",
      description: "Drafted content — no matching library topic found.",
      content: [],
      exercises: [
        { prompt: "Warm-up: explain the key idea behind competition-style problem solving in your own words.", answer: "Model answer: no vetted content exists in the library yet — tutor to work through this live with the student." },
        { prompt: "Apply a mixed-topic review problem of your choosing.", answer: "Model answer: no vetted content exists in the library yet — tutor to work through this live with the student." },
      ],
    },
  },
];

// A tutor's roster — students they've had at least one session with. Takes
// tutorId as a parameter (rather than a fixed export) so it reflects whichever
// tutor is actually logged in, not just the CURRENT_TUTOR_ID demo default.
export function getTutorStudents(tutorId: number) {
  return students.filter((s) =>
    studentSessionHistory[s.id]?.some((h) => h.tutorId === tutorId)
  );
}

// Seed roll calls — a tutor takes one of these per in-person session for an
// entire grade or course at once, rather than per individual student.
export const attendanceSessions: AttendanceSession[] = [
  { id: 1, tutorId: 1, scope: "course", course: "Algebra", date: "2026-06-16", createdAt: "2026-06-16T15:35:00Z",
    entries: [{ studentId: 1, status: "present" }, { studentId: 6, status: "present" }] },
  // Linked via sessionId to the seeded in-person Session records above (ids 12/13/16/19)
  // so a tutor's Session History and Attendance page tell the same story, with real
  // per-student notes rather than a single placeholder line.
  { id: 2, tutorId: 1, scope: "grade", grades: [6, 7], date: "2026-08-10", sessionId: 12, createdAt: "2026-08-10T20:05:00Z",
    entries: [
      { studentId: 1, status: "present", notes: "Picked up simplifying radicals quickly today — ready for the next problem set." },
      { studentId: 5, status: "present", notes: "Needed a refresher on combining like terms before joining the group activity." },
    ] },
  { id: 3, tutorId: 3, scope: "course", course: "Pre-Alg", date: "2026-06-16", createdAt: "2026-06-16T16:32:00Z",
    entries: [{ studentId: 3, status: "present" }, { studentId: 7, status: "absent" }] },
  { id: 4, tutorId: 4, scope: "grade", grades: [8, 9], date: "2026-08-12", sessionId: 13, createdAt: "2026-08-12T20:02:00Z",
    entries: [
      { studentId: 2, status: "present", notes: "Still mixing up signs when distributing negatives — flagged for extra practice." },
      { studentId: 6, status: "present", notes: "Confidently walked his table group through the word problems today." },
    ] },
  { id: 5, tutorId: 5, scope: "course", course: "Calculus", date: "2026-06-19", createdAt: "2026-06-19T17:03:00Z",
    entries: [{ studentId: 2, status: "present" }, { studentId: 6, status: "absent" }, { studentId: 8, status: "present" }] },
  { id: 6, tutorId: 2, scope: "grade", grades: [8, 9], date: "2026-08-19", sessionId: 16, createdAt: "2026-08-19T20:04:00Z",
    entries: [
      { studentId: 4, status: "absent", notes: "Absent — family conflict per parent text. Needs a catch-up before next week's group." },
      { studentId: 8, status: "present", notes: "Engaged well but ran out of time on the last two problems; assign as homework." },
    ] },
  { id: 7, tutorId: 1, scope: "grade", grades: [6, 7], date: "2026-08-03", sessionId: 19, createdAt: "2026-08-03T20:06:00Z",
    entries: [
      { studentId: 1, status: "present", notes: "First session with the group — comfortable with one-step equations already." },
      { studentId: 3, status: "present", notes: "Strong number sense; finished early and helped a table-mate check their work." },
      { studentId: 5, status: "present" },
      { studentId: 7, status: "absent", notes: "Absent — tutor left a voicemail, no response yet." },
    ] },
  // Francoise (tutorId 5) — the default tutor login — linked to her Grades 10,11,12
  // sessions (ids 14/15), now that grades 10-12 have real seed students (9/10).
  { id: 8, tutorId: 5, scope: "grade", grades: [10, 11, 12], date: "2026-08-10", sessionId: 14, createdAt: "2026-08-10T20:07:00Z",
    entries: [
      { studentId: 9,  status: "present", notes: "Confident with limits, but still mixing up removable vs. non-removable discontinuities." },
      { studentId: 10, status: "present", notes: "Nailed today's related-rates problems — ready to move ahead of the group." },
    ] },
  { id: 9, tutorId: 5, scope: "grade", grades: [10, 11, 12], date: "2026-08-17", sessionId: 15, createdAt: "2026-08-17T20:08:00Z",
    entries: [
      { studentId: 9,  status: "present", notes: "Seemed distracted today — worth checking in before next session." },
      { studentId: 10, status: "absent",  notes: "Absent — college info session conflict, per email." },
    ] },
];

// Students matching a roll call's scope — every student across the grade band, or
// every student enrolled in the course — so a tutor's roster auto-populates before
// they mark individual exceptions. `value` for grade scope is a comma-joined grade
// band, e.g. "6,7" (matching RecurringSlot.grades / GRADE_GROUPS).
export function studentsForAttendanceScope(studentList: Student[], scope: AttendanceScope, value: string): Student[] {
  if (scope === "course") return studentList.filter((s) => s.courses.includes(value));
  const grades = value.split(",").map(Number);
  return studentList.filter((s) => grades.includes(s.grade));
}

export function attendanceRate(entries: AttendanceEntry[]): number {
  if (entries.length === 0) return 0;
  const present = entries.filter((e) => e.status === "present").length;
  return Math.round((present / entries.length) * 100);
}

export function attendanceSessionLabel(session: AttendanceSession): string {
  return session.scope === "grade" ? `Grades ${(session.grades ?? []).join(", ")}` : (session.course ?? "");
}

export const sofia = students.find((s) => s.id === CURRENT_STUDENT_ID)!;

// Alumni tracking — students who completed the program or left it, followed up on
// whether they went on to a STEM major or STEM career after high-school graduation.
// `checkIns` preserves each dated follow-up snapshot (rather than overwriting it) so
// outcome changes can be tracked cohort-over-cohort and cross-checked against how the
// student performed in the program (see `students` via `studentId`).
export const alumni: AlumniRecord[] = [
  { id: 1001, studentId: 4, name: "DeShawn Williams", lastGrade: 12, location: "Detroit, MI",   exitReason: "graduated",    exitYear: 2025, hsGraduated: true,  outcome: "stem-college",     verification: "verified",      institution: "Wayne State University", fieldOfStudy: "Mechanical Engineering", lastContact: "Jun 10, 2026", followUpStatus: "up-to-date", assignedStaff: "Maria Rodriguez",
    email: "deshawn.williams@wayne.edu", phone: "(313) 555-0142", linkedIn: "linkedin.com/in/deshawnwilliams",
    isSuccessStory: true, testimonial: "This program is the reason I believed engineering was even an option for me. I went from being unsure I'd graduate to declaring a Mechanical Engineering major.", openToMentoring: true,
    notes: "Doing well in first year. Wants to shadow an engineer over winter break — connect with alumni network.",
    checkIns: [
      { timeframe: "6 months", date: "Dec 3, 2025",  outcome: "stem-college", verification: "self-reported", note: "Enrolled at Wayne State, declared Mechanical Engineering." },
      { timeframe: "1 year",   date: "Jun 10, 2026",  outcome: "stem-college", verification: "verified",      note: "Enrollment confirmed via unofficial transcript, GPA 3.4." },
    ] },
  { id: 1002, studentId: 8, name: "Noah Fitzgerald",  lastGrade: 12, location: "Boston, MA",     exitReason: "graduated",    exitYear: 2025, hsGraduated: true,  outcome: "stem-career",      verification: "verified",      institution: "MassDOT",                  fieldOfStudy: "Civil/Transit Technician", lastContact: "May 28, 2026", followUpStatus: "up-to-date", assignedStaff: "Francoise Umubyeyi",
    email: "noah.fitzgerald@massdot.gov", phone: "(617) 555-0198", openToMentoring: true,
    notes: "Started an apprenticeship instead of college. Interested in an associate degree later.",
    checkIns: [
      { timeframe: "6 months", date: "Dec 15, 2025", outcome: "gap-year",    verification: "self-reported", note: "Still deciding, working part-time." },
      { timeframe: "1 year",   date: "May 28, 2026", outcome: "stem-career", verification: "verified",      note: "Employer confirmed apprenticeship start date." },
    ] },
  { id: 1003, name: "Camille Torres",   lastGrade: 12, location: "Atlanta, GA",    exitReason: "graduated",    exitYear: 2024, hsGraduated: true,  outcome: "non-stem-college", verification: "self-reported", institution: "Spelman College",          fieldOfStudy: "Political Science",       lastContact: "Apr 2, 2026",  followUpStatus: "due-soon",   assignedStaff: "Jennifer Chen",
    email: "camille.torres@spelman.edu",
    notes: "",
    checkIns: [
      { timeframe: "6 months", date: "Jan 20, 2025", outcome: "non-stem-college", verification: "self-reported", note: "Enrolled at Spelman, undecided major." },
      { timeframe: "1 year",   date: "Apr 2, 2026",  outcome: "non-stem-college", verification: "self-reported", note: "Declared Political Science." },
    ] },
  { id: 1004, name: "Tyrell Banks",     lastGrade: 11, location: "Baltimore, MD",  exitReason: "left-program", exitYear: 2025, hsGraduated: false, outcome: "unknown",          verification: "self-reported", lastContact: "Jan 14, 2026",  followUpStatus: "overdue",    assignedStaff: "David Thompson", notes: "Family relocated mid-year. Two follow-up calls unanswered — try email next.",
    checkIns: [] },
  { id: 1005, name: "Priya Nair",       lastGrade: 12, location: "Oakland, CA",    exitReason: "graduated",    exitYear: 2025, hsGraduated: true,  outcome: "stem-college",     verification: "verified",      institution: "UC Davis",                 fieldOfStudy: "Computer Science",        lastContact: "Jun 3, 2026",  followUpStatus: "up-to-date", assignedStaff: "Andrew Kim",
    email: "priya.nair@ucdavis.edu", linkedIn: "linkedin.com/in/priyanair",
    isSuccessStory: true, testimonial: "Made Dean's List studying Computer Science — something I never thought I'd say two years ago. Happy to talk to any student thinking about CS.", openToMentoring: true,
    notes: "Reports our Algebra II/Stats track prepared her well for intro CS math.",
    checkIns: [
      { timeframe: "6 months", date: "Dec 1, 2025", outcome: "stem-college", verification: "verified", note: "Enrollment verified directly with UC Davis registrar." },
      { timeframe: "1 year",   date: "Jun 3, 2026",  outcome: "stem-college", verification: "verified", note: "Still enrolled, made Dean's List." },
    ] },
  { id: 1006, name: "Malik Jefferson",  lastGrade: 10, location: "Columbus, OH",   exitReason: "left-program", exitYear: 2024, hsGraduated: true,  outcome: "military",         verification: "self-reported", institution: "U.S. Army",                lastContact: "Mar 20, 2026",  followUpStatus: "due-soon",   assignedStaff: "Maria Rodriguez",
    phone: "(614) 555-0176",
    notes: "Enlisted after leaving the program early; plans to use GI Bill for engineering later.",
    checkIns: [
      { timeframe: "6 months", date: "Mar 20, 2026", outcome: "military", verification: "self-reported", note: "Enlisted, currently in basic training." },
    ] },
  { id: 1007, name: "Grace Kim",        lastGrade: 12, location: "San Antonio, TX",exitReason: "graduated",    exitYear: 2024, hsGraduated: true,  outcome: "stem-career",      verification: "verified",      institution: "HEB Digital",              fieldOfStudy: "Data Analyst",            lastContact: "May 15, 2026", followUpStatus: "up-to-date", assignedStaff: "David Thompson",
    email: "grace.kim@hebdigital.com", phone: "(210) 555-0163", linkedIn: "linkedin.com/in/gracekim",
    isSuccessStory: true, testimonial: "I didn't think a 4-year degree was for me, and this program helped me find a bootcamp path into data analytics instead. Now I'm mentoring the next round of students the same way I was mentored.", openToMentoring: true,
    notes: "Skipped a 4-year degree, went straight into a data analytics role via bootcamp.",
    checkIns: [
      { timeframe: "6 months", date: "Dec 10, 2024", outcome: "gap-year",    verification: "self-reported", note: "Working retail while researching bootcamps." },
      { timeframe: "1 year",   date: "May 20, 2025", outcome: "stem-career", verification: "verified",      note: "Completed data analytics bootcamp, hired by HEB Digital." },
      { timeframe: "2 years",  date: "May 15, 2026", outcome: "stem-career", verification: "verified",      note: "Promoted to Analyst II." },
    ] },
  { id: 1008, name: "Omar Haddad",      lastGrade: 12, location: "Chicago, IL",    exitReason: "graduated",    exitYear: 2025, hsGraduated: true,  outcome: "gap-year",         verification: "self-reported", lastContact: "Feb 8, 2026",  followUpStatus: "overdue",    assignedStaff: "Jennifer Chen",
    email: "omar.haddad91@gmail.com",
    notes: "Taking a gap year to work and save. Said he's still deciding between nursing and engineering.",
    checkIns: [
      { timeframe: "6 months", date: "Feb 8, 2026", outcome: "gap-year", verification: "self-reported", note: "Working full-time, saving for tuition." },
    ] },
  { id: 1009, name: "Leilani Akana",    lastGrade: 9,  location: "Detroit, MI",    exitReason: "left-program", exitYear: 2026, hsGraduated: false, outcome: "unknown",          verification: "self-reported", lastContact: "Jun 25, 2026", followUpStatus: "due-soon",   assignedStaff: "Andrew Kim", notes: "Left recently due to scheduling conflicts with a new job. Still in high school.",
    checkIns: [] },
  { id: 1010, name: "Ben Okafor",       lastGrade: 12, location: "Baltimore, MD",  exitReason: "graduated",    exitYear: 2023, hsGraduated: true,  outcome: "non-stem-career",  verification: "self-reported", institution: "Self-employed",            fieldOfStudy: "Graphic Design",          lastContact: "Nov 30, 2025", followUpStatus: "overdue",    assignedStaff: "Francoise Umubyeyi",
    email: "ben.okafor.design@gmail.com", linkedIn: "linkedin.com/in/benokafor",
    notes: "",
    checkIns: [
      { timeframe: "6 months", date: "May 1, 2024",  outcome: "gap-year",        verification: "self-reported", note: "Freelancing design work, no school plans yet." },
      { timeframe: "1 year",   date: "Nov 15, 2024",  outcome: "non-stem-career", verification: "self-reported", note: "Freelance graphic design became steady income." },
      { timeframe: "2 years",  date: "Nov 30, 2025",  outcome: "non-stem-career", verification: "self-reported", note: "Still self-employed, building a client base." },
    ] },
];
