import type { Student, Session, CurriculumCourse, Tutor, SubjectDetail, SessionRecord, AIProject, HomeworkItem } from "../types";

export const CURRENT_STUDENT_ID = 3;
export const CURRENT_TUTOR_ID = 5;

export const students: Student[] = [
  { id: 1, name: "Aaliyah Johnson",  grade: 7, subjects: ["Algebra", "Biology"],        progress: 78, sessions: 12, streak: 5, status: "on-track",      location: "Atlanta, GA"    },
  { id: 2, name: "Marcus Rivera",    grade: 8, subjects: ["Chemistry", "Geometry"],     progress: 64, sessions: 8,  streak: 2, status: "needs-support", location: "San Antonio, TX" },
  { id: 3, name: "Sofia Patel",      grade: 6, subjects: ["Earth Science", "Pre-Alg"],  progress: 91, sessions: 15, streak: 8, status: "exceeding",     location: "Chicago, IL"    },
  { id: 4, name: "DeShawn Williams", grade: 9, subjects: ["Physics", "Algebra II"],     progress: 55, sessions: 6,  streak: 1, status: "at-risk",       location: "Detroit, MI"    },
  { id: 5, name: "Isabella Chen",    grade: 7, subjects: ["Biology", "Statistics"],     progress: 83, sessions: 11, streak: 4, status: "on-track",      location: "Oakland, CA"    },
  { id: 6, name: "Jaylen Brooks",    grade: 8, subjects: ["Chemistry", "Algebra"],      progress: 70, sessions: 9,  streak: 3, status: "on-track",      location: "Baltimore, MD"  },
  { id: 7, name: "Amara Osei",       grade: 6, subjects: ["Pre-Alg", "Earth Science"],  progress: 88, sessions: 14, streak: 6, status: "exceeding",     location: "Columbus, OH"   },
  { id: 8, name: "Noah Fitzgerald",  grade: 9, subjects: ["Physics", "Calculus"],       progress: 61, sessions: 7,  streak: 1, status: "needs-support", location: "Boston, MA"     },
];

export const sessions: Session[] = [
  { id: 1,  student: "Aaliyah Johnson",  tutorId: 1, subject: "Algebra",       time: "Today",    clock: "3:30 PM", duration: 60, status: "upcoming", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 2,  student: "Marcus Rivera",    tutorId: 2, subject: "Chemistry",     time: "Today",    clock: "4:00 PM", duration: 45, status: "upcoming", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 3,  student: "Sofia Patel",      tutorId: 3, subject: "Pre-Alg",       time: "Today",    clock: "4:30 PM", duration: 60, status: "in-progress", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 4,  student: "Isabella Chen",    tutorId: 4, subject: "Biology",       time: "Tomorrow", clock: "2:00 PM", duration: 60, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 5,  student: "DeShawn Williams", tutorId: 2, subject: "Physics",       time: "Tomorrow", clock: "3:00 PM", duration: 45, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 6,  student: "Jaylen Brooks",    tutorId: 1, subject: "Algebra",       time: "Jun 22",   clock: "2:30 PM", duration: 60, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 7,  student: "Amara Osei",       tutorId: 3, subject: "Earth Science", time: "Jun 22",   clock: "3:00 PM", duration: 45, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 8,  student: "Noah Fitzgerald",  tutorId: 5, subject: "Calculus",      time: "Today",    clock: "5:00 PM", duration: 60, status: "upcoming", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 9,  student: "DeShawn Williams", tutorId: 5, subject: "Pre-Calculus",  time: "Jun 22",   clock: "4:30 PM", duration: 60, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 10, student: "Sofia Patel",      tutorId: 5, subject: "Pre-Alg",       time: "Jun 23",   clock: "3:00 PM", duration: 60, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 11, student: "DeShawn Williams", tutorId: 5, subject: "Pre-Calculus",  time: "Today",    clock: "1:00 PM", duration: 60, status: "upcoming", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
];

// Curriculum library — math subjects only for now (other subjects to follow later).
// Each course (subject) is broken into chapters, and each chapter into named modules.
export const curriculum: CurriculumCourse[] = [
  {
    id: 1, subject: "Algebra", grade: "7–8", students: 108,
    chapters: [
      { id: 101, title: "Linear Equations & Inequalities", difficulty: "Beginner", modules: [
        { title: "Solving One-Step Equations" }, { title: "Solving Multi-Step Equations" },
        { title: "Graphing Linear Inequalities" }, { title: "Compound Inequalities" },
      ] },
      { id: 102, title: "Quadratic Equations", difficulty: "Intermediate", modules: [
        { title: "Factoring Quadratics" }, { title: "Completing the Square" },
        { title: "The Quadratic Formula" }, { title: "Graphing Parabolas" },
      ] },
      { id: 103, title: "Systems of Equations", difficulty: "Advanced", modules: [
        { title: "Solving by Substitution" }, { title: "Solving by Elimination" },
        { title: "Graphing Systems" }, { title: "Systems of Inequalities" },
      ] },
    ],
  },
  {
    id: 2, subject: "Algebra II", grade: "9", students: 40,
    chapters: [
      { id: 201, title: "Polynomial Functions", difficulty: "Intermediate", modules: [
        { title: "Polynomial Operations" }, { title: "Factoring Higher-Degree Polynomials" },
        { title: "Graphing Polynomial Functions" }, { title: "The Remainder & Factor Theorems" },
      ] },
      { id: 202, title: "Exponential & Logarithmic Functions", difficulty: "Advanced", modules: [
        { title: "Exponential Growth & Decay" }, { title: "Properties of Logarithms" },
        { title: "Solving Exponential Equations" }, { title: "Solving Logarithmic Equations" },
      ] },
    ],
  },
  {
    id: 3, subject: "Pre-Alg", grade: "6", students: 131,
    chapters: [
      { id: 301, title: "Pre-Algebra Foundations", difficulty: "Beginner", modules: [
        { title: "Number Properties" }, { title: "Order of Operations Basics" },
        { title: "Variables & Expressions" }, { title: "Simple Equations" },
        { title: "Factors & Multiples" }, { title: "Prime Factorization" },
        { title: "Exponents & Powers of Ten" },
      ] },
      { id: 302, title: "Ratios, Rates & Proportions", difficulty: "Beginner", modules: [
        { title: "Understanding Ratios" }, { title: "Unit Rates" },
        { title: "Solving Proportions" }, { title: "Percent Problems" },
      ] },
      { id: 303, title: "Integers & Order of Operations", difficulty: "Intermediate", modules: [
        { title: "Adding & Subtracting Integers" }, { title: "Multiplying & Dividing Integers" },
        { title: "The Order of Operations" }, { title: "Absolute Value" },
      ] },
    ],
  },
  {
    id: 4, subject: "Geometry", grade: "7–8", students: 80,
    chapters: [
      { id: 401, title: "Geometry Essentials", difficulty: "Intermediate", modules: [
        { title: "Points, Lines & Planes" }, { title: "Angle Relationships" },
        { title: "Classifying Polygons" }, { title: "Congruence & Similarity" },
        { title: "Parallel Lines & Transversals" }, { title: "Coordinate Geometry Basics" },
        { title: "Symmetry & Transformations" }, { title: "Constructions with Compass & Straightedge" },
      ] },
      { id: 402, title: "Triangles & the Pythagorean Theorem", difficulty: "Intermediate", modules: [
        { title: "Triangle Angle Sum" }, { title: "Special Right Triangles" },
        { title: "The Pythagorean Theorem" }, { title: "Applications of the Pythagorean Theorem" },
      ] },
      { id: 403, title: "Circles, Area & Volume", difficulty: "Advanced", modules: [
        { title: "Circumference & Area of Circles" }, { title: "Surface Area of Solids" },
        { title: "Volume of Prisms & Cylinders" }, { title: "Volume of Pyramids & Cones" },
      ] },
    ],
  },
  {
    id: 5, subject: "Statistics", grade: "7–8", students: 94,
    chapters: [
      { id: 501, title: "Intro to Statistics", difficulty: "Intermediate", modules: [
        { title: "Collecting & Organizing Data" }, { title: "Measures of Center" },
        { title: "Measures of Spread" }, { title: "Interpreting Graphs" },
        { title: "Sampling Methods" }, { title: "Correlation vs. Causation" },
      ] },
      { id: 502, title: "Data Displays & Measures of Center", difficulty: "Beginner", modules: [
        { title: "Histograms & Box Plots" }, { title: "Mean, Median & Mode" },
        { title: "Outliers & Their Effects" }, { title: "Comparing Data Sets" },
      ] },
      { id: 503, title: "Probability Fundamentals", difficulty: "Intermediate", modules: [
        { title: "Basic Probability Rules" }, { title: "Independent & Dependent Events" },
        { title: "Compound Probability" }, { title: "Expected Value" },
      ] },
    ],
  },
  {
    id: 6, subject: "Pre-Calculus", grade: "10", students: 31,
    chapters: [
      { id: 601, title: "Functions & Their Graphs", difficulty: "Intermediate", modules: [
        { title: "Function Notation & Transformations" }, { title: "Piecewise Functions" },
        { title: "Inverse Functions" }, { title: "Rational Functions" },
      ] },
      { id: 602, title: "Trigonometry Foundations", difficulty: "Advanced", modules: [
        { title: "The Unit Circle" }, { title: "Graphing Sine & Cosine" },
        { title: "Trig Identities" }, { title: "Solving Trig Equations" },
      ] },
    ],
  },
  {
    id: 7, subject: "Calculus", grade: "11–12", students: 28,
    chapters: [
      { id: 701, title: "Limits & Continuity", difficulty: "Intermediate", modules: [
        { title: "Evaluating Limits Graphically" }, { title: "Evaluating Limits Algebraically" },
        { title: "Continuity & Discontinuities" }, { title: "Limits at Infinity" },
      ] },
      { id: 702, title: "Derivatives & Applications", difficulty: "Advanced", modules: [
        { title: "The Derivative as a Rate of Change" }, { title: "Derivative Rules" },
        { title: "The Chain Rule" }, { title: "Applications: Related Rates & Optimization" },
      ] },
    ],
  },
];

export const tutors: Tutor[] = [
  { id: 1, firstName: "Jennifer", lastName: "Chen",      subjects: ["Algebra", "Geometry"],        students: 14, sessions: 38, description: "Breaks down algebra and geometry into visual, step-by-step problems so abstract rules finally click. Patient with students who need concepts repeated a few different ways." },
  { id: 2, firstName: "David",    lastName: "Thompson",  subjects: ["Chemistry", "Biology"],       students: 11, sessions: 29, description: "Makes chemistry and biology stick by tying lessons to real-world examples and hands-on thought experiments instead of rote memorization." },
  { id: 3, firstName: "Maria",    lastName: "Rodriguez", subjects: ["Pre-Algebra", "Statistics"],  students: 16, sessions: 44, description: "Builds strong number-sense foundations in pre-algebra and statistics, with a calm, encouraging style that's great for students still building math confidence." },
  { id: 4, firstName: "Andrew",   lastName: "Kim",       subjects: ["Physics", "Earth Science"],   students: 13, sessions: 35, description: "Turns physics and earth science into everyday phenomena students can see and test themselves, focusing on intuition before formulas." },
  { id: 5, firstName: "Francoise",lastName: "Umubyeyi",  subjects: ["Pre-Calculus", "Calculus"],   students: 20, sessions: 25, description: "Guides students through pre-calculus and calculus with a focus on problem-solving strategy, helping them recognize patterns across problem types rather than memorizing steps." },
];

export function getTutorById(id: number): Tutor | undefined {
  return tutors.find((t) => t.id === id);
}

export function tutorNameById(id: number): string {
  const t = getTutorById(id);
  return t ? `${t.firstName} ${t.lastName}` : "";
}

export const studentSubjectDetail: Record<number, SubjectDetail[]> = {
  1: [{ subject: "Algebra",       score: 82, sessions: 7, lastSession: "Jun 18", trend: "up"   }, { subject: "Biology",       score: 74, sessions: 5, lastSession: "Jun 15", trend: "up"   }],
  2: [{ subject: "Chemistry",     score: 61, sessions: 4, lastSession: "Jun 17", trend: "flat" }, { subject: "Geometry",      score: 68, sessions: 4, lastSession: "Jun 14", trend: "up"   }],
  3: [{ subject: "Earth Science", score: 94, sessions: 8, lastSession: "Jun 19", trend: "up"   }, { subject: "Pre-Alg",       score: 88, sessions: 7, lastSession: "Jun 16", trend: "up"   }],
  4: [{ subject: "Physics",       score: 52, sessions: 3, lastSession: "Jun 12", trend: "down" }, { subject: "Algebra II",    score: 58, sessions: 3, lastSession: "Jun 10", trend: "flat" }],
  5: [{ subject: "Biology",       score: 86, sessions: 6, lastSession: "Jun 18", trend: "up"   }, { subject: "Statistics",    score: 80, sessions: 5, lastSession: "Jun 16", trend: "up"   }],
  6: [{ subject: "Chemistry",     score: 67, sessions: 5, lastSession: "Jun 17", trend: "up"   }, { subject: "Algebra",       score: 73, sessions: 4, lastSession: "Jun 15", trend: "flat" }],
  7: [{ subject: "Pre-Alg",       score: 91, sessions: 7, lastSession: "Jun 19", trend: "up"   }, { subject: "Earth Science", score: 85, sessions: 7, lastSession: "Jun 17", trend: "up"   }],
  8: [{ subject: "Calculus",      score: 68, sessions: 4, lastSession: "Jun 18", trend: "up"   }, { subject: "Physics",       score: 60, sessions: 3, lastSession: "Jun 14", trend: "flat" }],
};

export const studentSessionHistory: Record<number, SessionRecord[]> = {
  1: [{ subject: "Algebra",       tutorId: 1, date: "Jun 18", score: 84, duration: 60 }, { subject: "Biology",       tutorId: 4, date: "Jun 15", score: 76, duration: 45 }, { subject: "Algebra",       tutorId: 1, date: "Jun 11", score: 79, duration: 60 }, { subject: "Biology",  tutorId: 4, date: "Jun 8",  score: 71, duration: 45 }],
  2: [{ subject: "Chemistry",     tutorId: 2, date: "Jun 17", score: 63, duration: 45 }, { subject: "Geometry",      tutorId: 1, date: "Jun 14", score: 70, duration: 60 }, { subject: "Chemistry",     tutorId: 2, date: "Jun 10", score: 58, duration: 45 }],
  3: [{ subject: "Earth Science", tutorId: 4, date: "Jun 19", score: 96, duration: 60, artifacts: [{ id: 1, type: "notes", label: "Session notes", url: "https://notes.menya.app/sessions/3-jun19" }, { id: 2, type: "whiteboard", label: "Whiteboard", url: "https://whiteboard.menya.app/sessions/3-jun19" }] }, { subject: "Pre-Alg",       tutorId: 3, date: "Jun 16", score: 91, duration: 60, artifacts: [{ id: 3, type: "notes", label: "Session notes", url: "https://notes.menya.app/sessions/3-jun16" }] }, { subject: "Earth Science", tutorId: 4, date: "Jun 12", score: 93, duration: 45 }, { subject: "Pre-Alg",  tutorId: 5, date: "Jun 9",  score: 88, duration: 60 }],
  4: [{ subject: "Physics",       tutorId: 4, date: "Jun 12", score: 54, duration: 45 }, { subject: "Pre-Calculus",  tutorId: 5, date: "Jun 10", score: 57, duration: 60 }, { subject: "Physics",       tutorId: 2, date: "Jun 5",  score: 49, duration: 45 }, { subject: "Pre-Calculus", tutorId: 5, date: "Jun 1", score: 52, duration: 60 }],
  5: [{ subject: "Biology",       tutorId: 2, date: "Jun 18", score: 88, duration: 60 }, { subject: "Statistics",    tutorId: 3, date: "Jun 16", score: 82, duration: 45 }, { subject: "Biology",       tutorId: 4, date: "Jun 13", score: 85, duration: 60 }, { subject: "Statistics", tutorId: 3, date: "Jun 10", score: 78, duration: 45 }],
  6: [{ subject: "Chemistry",     tutorId: 2, date: "Jun 17", score: 69, duration: 45 }, { subject: "Algebra",       tutorId: 1, date: "Jun 15", score: 74, duration: 60 }, { subject: "Chemistry",     tutorId: 2, date: "Jun 11", score: 64, duration: 45 }],
  7: [{ subject: "Pre-Alg",       tutorId: 3, date: "Jun 19", score: 93, duration: 60 }, { subject: "Earth Science", tutorId: 4, date: "Jun 17", score: 87, duration: 45 }, { subject: "Pre-Alg",       tutorId: 3, date: "Jun 14", score: 90, duration: 60 }, { subject: "Earth Science", tutorId: 4, date: "Jun 11", score: 84, duration: 45 }],
  8: [{ subject: "Pre-Calculus",      tutorId: 5, date: "Jun 18", score: 68, duration: 60 }, { subject: "Physics",       tutorId: 2, date: "Jun 14", score: 60, duration: 45 }, { subject: "Calculus",      tutorId: 5, date: "Jun 11", score: 63, duration: 60 }, { subject: "Physics",  tutorId: 2, date: "Jun 7",  score: 56, duration: 45 }],
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

export const subjectBreakdown = [
  { name: "Algebra",     students: 85, color: "#1B5E4F" },
  { name: "Biology",     students: 73, color: "#059669" },
  { name: "Chemistry",   students: 54, color: "#3B82F6" },
  { name: "Physics",     students: 38, color: "#8B5CF6" },
  { name: "Earth Sci.",  students: 61, color: "#0EA5E9" },
  { name: "Statistics",  students: 33, color: "#F59E0B" },
];

export const tutorWeeklyData = [
  { week: "Wk 1", sessions: 4, avgScore: 62 },
  { week: "Wk 2", sessions: 5, avgScore: 65 },
  { week: "Wk 3", sessions: 4, avgScore: 67 },
  { week: "Wk 4", sessions: 5, avgScore: 68 },
  { week: "Wk 5", sessions: 4, avgScore: 70 },
  { week: "Wk 6", sessions: 5, avgScore: 72 },
];

export const studentGoals = [
  { label: "Reach 95% in Earth Science", current: 94, target: 95,  unit: "%",        color: "#0EA5E9" },
  { label: "Complete 20 sessions",        current: 15, target: 20,  unit: "sessions", color: "#3B82F6" },
  { label: "10-Day Streak",              current: 8,  target: 10,  unit: "days",     color: "#F59E0B" },
  { label: "Finish Earth Systems module", current: 72, target: 100, unit: "%",        color: "#1B5E4F" },
];

export const studentModules = [
  { subject: "Earth Science", title: "Earth Systems Overview",  completion: 72, totalModules: 7, currentModule: 5, active: true  },
  { subject: "Pre-Alg",       title: "Pre-Algebra Foundations", totalModules: 6, currentModule: 5, active: false },
  { subject: "Pre-Alg",       title: "Linear Equations (next)",  totalModules: 5, currentModule: 0, active: false },

  // Math — additional module progress (more subjects to follow later)
  { subject: "Algebra",       title: "Quadratic Equations",                completion: 68, totalModules: 6, currentModule: 4, active: true  },
  { subject: "Algebra",       title: "Systems of Equations (next)",        completion: 0,  totalModules: 7, currentModule: 0, active: false },
  { subject: "Algebra II",    title: "Polynomial Functions",               completion: 45, totalModules: 8, currentModule: 4, active: true  },
  { subject: "Geometry",      title: "Geometry Essentials",                completion: 55, totalModules: 8, currentModule: 4, active: true  },
  { subject: "Geometry",      title: "Triangles & the Pythagorean Theorem (next)", totalModules: 6, currentModule: 0, active: false },
  { subject: "Statistics",    title: "Intro to Statistics",                completion: 59, totalModules: 5, currentModule: 3, active: true  },
  { subject: "Pre-Calculus",  title: "Functions & Their Graphs",           completion: 30, totalModules: 7, currentModule: 2, active: true  },
  { subject: "Calculus",      title: "Limits & Continuity",                completion: 68, totalModules: 6, currentModule: 4, active: true  },
];

export const aiProjects: AIProject[] = [
  { id: 1, title: "Polynomial Expressions Practice", subject: "Pre-Alg",       module: "Pre-Algebra Foundations",  student: "Sofia Patel",      difficulty: "Intermediate", estimatedMins: 25, status: "pending",  generatedAt: "Jun 20", aiNote: "Sofia (Chicago, IL) is scoring 88% in Pre-Alg with a gap in polynomial manipulation. These 6 problems target that weakness using a garden plot near her neighborhood.", tasks: ["Simplify: 3x² + 2x − 5x² + 4x", "Expand: (x + 3)(x − 2)", "Factor: x² + 5x + 6", "Solve for x: 2x² − 8 = 0", "Write in standard form: 4 + 3x − x²", "Word problem: A raised garden bed at the Peterson Garden Project in Chicago has area x² + 7x + 12 (in square feet). Find its dimensions in terms of x."] },
  { id: 2, title: "Limits & Continuity — Intro Set",  subject: "Calculus",     module: "Differential Equations",   student: "Noah Fitzgerald",  difficulty: "Advanced",     estimatedMins: 40, status: "pending",  generatedAt: "Jun 20", aiNote: "Noah (Boston, MA) improved from 63% to 68% in Calculus. These problems introduce limit notation to bridge to derivatives, framed around the MBTA he rides to sessions.", tasks: ["Evaluate: lim(x→2) of (x²−4)/(x−2)", "Determine continuity of f(x) = 1/(x−3) at x = 3", "Use the squeeze theorem for lim(x→0) x·sin(1/x)", "The MBTA Green Line's fare structure changes after Kenmore Station — model total fare as a piecewise function of stops traveled and identify any discontinuities", "Find the limit at infinity: lim(x→∞) (3x²+1)/(x²−5)"] },
  { id: 3, title: "Pre-Calculus Function Review",      subject: "Pre-Calculus", module: "Trigonometry",             student: "DeShawn Williams", difficulty: "Intermediate", estimatedMins: 30, status: "approved", generatedAt: "Jun 17", assignedAt: "Jun 18", dueDate: "Jun 24", aiNote: "Covers function notation, composition, and inverse functions — areas where DeShawn (Detroit, MI) needs reinforcement, grounded in a market stall he knows from Eastern Market.", tasks: ["Evaluate f(g(x)) where f(x) = x+2 and g(x) = 3x", "Find the inverse of f(x) = 2x − 5", "A produce vendor at Eastern Market in Detroit prices apples by weight — use the vertical line test on a graph of price vs. weight to confirm this relationship is a function", "Graph y = |x−2|+1 and describe transformations", "Solve: if f(x)=x² and g(x)=√x, find f(g(16))"] },
  { id: 4, title: "Simplifying Radicals — Basic Set",  subject: "Pre-Alg",     module: "Pre-Algebra Foundations",  student: "Sofia Patel",      difficulty: "Beginner",     estimatedMins: 15, status: "revision", generatedAt: "Jun 18", tutorNote: "Sofia is already at 88%+ — these are too easy. Please regenerate at Intermediate difficulty.", aiNote: "Generated to reinforce radical basics following session on exponents.", tasks: ["Simplify: √36", "Simplify: √72", "Simplify: 3√8 + 2√2", "Evaluate: (√5)²", "Simplify: √(16/25)"] },
  { id: 5, title: "Rate of Change Word Problems",      subject: "Calculus",     module: "Differential Equations",   student: "Noah Fitzgerald",  difficulty: "Advanced",     estimatedMins: 45, status: "pending",  generatedAt: "Jun 20", aiNote: "Builds on limit work. Real-world rate-of-change scenarios drawn from spots around Noah's home in Boston, MA to prepare for derivatives.", tasks: ["A ball drops from the top of the Bunker Hill Monument (100m) — find velocity at t=3s using limits", "The Frog Pond on Boston Common drains for cleaning at V(t)=50−2t² gallons remaining after t minutes. Find the drainage rate at t=4", "Sketch the tangent to y=x² at x=3 and find its slope", "Compare average vs instantaneous rate for f(x)=x³ on [1,2]"] },
  { id: 6, title: "Pre-Algebra Word Problems",         subject: "Pre-Alg",     module: "Pre-Algebra Foundations",  student: "Sofia Patel",      difficulty: "Intermediate", estimatedMins: 20, status: "approved", generatedAt: "Jun 15", assignedAt: "Jun 16", dueDate: "Jun 22", aiNote: "Applied problems targeting equation setup and variable isolation, aligned with Sofia's current module progress and set around her Chicago, IL neighborhood.", tasks: ["Maria and Jake are trading Chicago Cubs pins at a swap meet in Wrigleyville — Maria has 3× more pins than Jake, and together they have 48. How many does each have?", "A community mural painted along Chicago's 606 Trail is a rectangle with length 5 ft more than its width and a perimeter of 42 ft. Find its dimensions.", "Solve: 4(x−2) = 3x + 5", "A Metra train leaves Union Station in Chicago at 60 mph and needs to cover 210 miles to reach its final stop. Find the travel time."] },
];

export const studentAssignments: Record<number, HomeworkItem[]> = {
  3: [
    { id: 6, studentId: 3, title: "Pre-Algebra Word Problems",        subject: "Pre-Alg",    assignedByTutorId: 5, assignedAt: "Jun 16", dueDate: "Jun 22", status: "in-progress", completion: 65 },
  ],
  8: [
    { id: 7, studentId: 8, title: "Limits & Continuity — Intro Set",  subject: "Calculus",   assignedByTutorId: 5, assignedAt: "Jun 18", dueDate: "Jun 25", status: "not-started", completion: 0  },
    { id: 8, studentId: 8, title: "Rate of Change Word Problems",      subject: "Calculus",   assignedByTutorId: 5, assignedAt: "Jun 20", dueDate: "Jun 27", status: "not-started", completion: 0  },
  ],
};

// Computed helpers
export const tutorStudents = students.filter((s) =>
  studentSessionHistory[s.id]?.some((h) => h.tutorId === CURRENT_TUTOR_ID)
);

export const tutorSessions = sessions.filter((s) => s.tutorId === CURRENT_TUTOR_ID);

export const tutorSubjects = tutors.filter((t) => t.id === CURRENT_TUTOR_ID).map((t) => ({
  id: t.id,
  fullname: `${t.firstName} ${t.lastName}`,
  subjects: t.subjects,
}));

export const sofia = students.find((s) => s.id === CURRENT_STUDENT_ID)!;
