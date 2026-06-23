import type { Student, Session, CurriculumItem, Tutor, SubjectDetail, SessionRecord, AIProject, HomeworkItem } from "../types";

export const CURRENT_STUDENT_ID = 3;
export const CURRENT_TUTOR_ID = 5;

export const students: Student[] = [
  { id: 1, name: "Aaliyah Johnson",  grade: 7, subjects: ["Algebra", "Biology"],        progress: 78, sessions: 12, streak: 5, status: "on-track"       },
  { id: 2, name: "Marcus Rivera",    grade: 8, subjects: ["Chemistry", "Geometry"],     progress: 64, sessions: 8,  streak: 2, status: "needs-support"  },
  { id: 3, name: "Sofia Patel",      grade: 6, subjects: ["Earth Science", "Pre-Alg"],  progress: 91, sessions: 15, streak: 8, status: "exceeding"      },
  { id: 4, name: "DeShawn Williams", grade: 9, subjects: ["Physics", "Algebra II"],     progress: 55, sessions: 6,  streak: 1, status: "at-risk"        },
  { id: 5, name: "Isabella Chen",    grade: 7, subjects: ["Biology", "Statistics"],     progress: 83, sessions: 11, streak: 4, status: "on-track"       },
  { id: 6, name: "Jaylen Brooks",    grade: 8, subjects: ["Chemistry", "Algebra"],      progress: 70, sessions: 9,  streak: 3, status: "on-track"       },
  { id: 7, name: "Amara Osei",       grade: 6, subjects: ["Pre-Alg", "Earth Science"],  progress: 88, sessions: 14, streak: 6, status: "exceeding"      },
  { id: 8, name: "Noah Fitzgerald",  grade: 9, subjects: ["Physics", "Calculus"],       progress: 61, sessions: 7,  streak: 1, status: "needs-support"  },
];

export const sessions: Session[] = [
  { id: 1,  student: "Aaliyah Johnson",  tutorId: 1, subject: "Algebra",       time: "Today",    clock: "3:30 PM", duration: 60, status: "upcoming"    },
  { id: 2,  student: "Marcus Rivera",    tutorId: 2, subject: "Chemistry",     time: "Today",    clock: "4:00 PM", duration: 45, status: "upcoming"    },
  { id: 3,  student: "Sofia Patel",      tutorId: 3, subject: "Pre-Alg",       time: "Today",    clock: "4:30 PM", duration: 60, status: "in-progress" },
  { id: 4,  student: "Isabella Chen",    tutorId: 4, subject: "Biology",       time: "Tomorrow", clock: "2:00 PM", duration: 60, status: "scheduled"   },
  { id: 5,  student: "DeShawn Williams", tutorId: 2, subject: "Physics",       time: "Tomorrow", clock: "3:00 PM", duration: 45, status: "scheduled"   },
  { id: 6,  student: "Jaylen Brooks",    tutorId: 1, subject: "Algebra",       time: "Jun 22",   clock: "2:30 PM", duration: 60, status: "scheduled"   },
  { id: 7,  student: "Amara Osei",       tutorId: 3, subject: "Earth Science", time: "Jun 22",   clock: "3:00 PM", duration: 45, status: "scheduled"   },
  { id: 8,  student: "Noah Fitzgerald",  tutorId: 5, subject: "Calculus",      time: "Today",    clock: "5:00 PM", duration: 60, status: "upcoming"    },
  { id: 9,  student: "DeShawn Williams", tutorId: 5, subject: "Pre-Calculus",  time: "Jun 22",   clock: "4:30 PM", duration: 60, status: "scheduled"   },
  { id: 10, student: "Sofia Patel",      tutorId: 5, subject: "Pre-Alg",       time: "Jun 23",   clock: "3:00 PM", duration: 60, status: "scheduled"   },
];

export const curriculum: CurriculumItem[] = [
  { id: 1, title: "Quadratic Equations",       subject: "Algebra",       grade: "7–8", difficulty: "Intermediate", modules: 6,  students: 42, completion: 68 },
  { id: 2, title: "Cell Biology Fundamentals", subject: "Biology",       grade: "6–7", difficulty: "Beginner",     modules: 8,  students: 38, completion: 81 },
  { id: 3, title: "Stoichiometry & Reactions", subject: "Chemistry",     grade: "8–9", difficulty: "Advanced",     modules: 10, students: 24, completion: 45 },
  { id: 4, title: "Newtonian Mechanics",        subject: "Physics",       grade: "9",   difficulty: "Advanced",     modules: 9,  students: 19, completion: 38 },
  { id: 5, title: "Earth Systems Overview",     subject: "Earth Science", grade: "6",   difficulty: "Beginner",     modules: 7,  students: 51, completion: 72 },
  { id: 6, title: "Intro to Statistics",        subject: "Statistics",    grade: "7–8", difficulty: "Intermediate", modules: 5,  students: 33, completion: 59 },
  { id: 7, title: "Pre-Algebra Foundations",    subject: "Pre-Alg",       grade: "6",   difficulty: "Beginner",     modules: 6,  students: 44, completion: 80 },
  { id: 8, title: "Geometry Essentials",        subject: "Geometry",      grade: "7–8", difficulty: "Intermediate", modules: 8,  students: 29, completion: 55 },
];

export const tutors: Tutor[] = [
  { id: 1, firstName: "Jennifer", lastName: "Chen",      subjects: ["Algebra", "Geometry"],        students: 14, sessions: 38 },
  { id: 2, firstName: "David",    lastName: "Thompson",  subjects: ["Chemistry", "Biology"],       students: 11, sessions: 29 },
  { id: 3, firstName: "Maria",    lastName: "Rodriguez", subjects: ["Pre-Algebra", "Statistics"],  students: 16, sessions: 44 },
  { id: 4, firstName: "Andrew",   lastName: "Kim",       subjects: ["Physics", "Earth Science"],   students: 13, sessions: 35 },
  { id: 5, firstName: "Francoise",lastName: "Umubyeyi",  subjects: ["Pre-Calculus", "Calculus"],   students: 20, sessions: 25 },
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
  3: [{ subject: "Earth Science", tutorId: 4, date: "Jun 19", score: 96, duration: 60 }, { subject: "Pre-Alg",       tutorId: 3, date: "Jun 16", score: 91, duration: 60 }, { subject: "Earth Science", tutorId: 4, date: "Jun 12", score: 93, duration: 45 }, { subject: "Pre-Alg",  tutorId: 5, date: "Jun 9",  score: 88, duration: 60 }],
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
  { subject: "Pre-Alg",       title: "Pre-Algebra Foundations", completion: 80, totalModules: 6, currentModule: 5, active: false },
  { subject: "Pre-Alg",       title: "Linear Equations (next)", completion: 0,  totalModules: 5, currentModule: 0, active: false },
];

export const aiProjects: AIProject[] = [
  { id: 1, title: "Polynomial Expressions Practice", subject: "Pre-Alg",       module: "Pre-Algebra Foundations",  student: "Sofia Patel",      difficulty: "Intermediate", estimatedMins: 25, status: "pending",  generatedAt: "Jun 20", aiNote: "Sofia is scoring 88% in Pre-Alg with a gap in polynomial manipulation. These 6 problems target that weakness.", tasks: ["Simplify: 3x² + 2x − 5x² + 4x", "Expand: (x + 3)(x − 2)", "Factor: x² + 5x + 6", "Solve for x: 2x² − 8 = 0", "Write in standard form: 4 + 3x − x²", "Word problem: A garden's area is x² + 7x + 12. Find its dimensions."] },
  { id: 2, title: "Limits & Continuity — Intro Set",  subject: "Calculus",     module: "Differential Equations",   student: "Noah Fitzgerald",  difficulty: "Advanced",     estimatedMins: 40, status: "pending",  generatedAt: "Jun 20", aiNote: "Noah's Calculus improved from 63% to 68%. These problems introduce limit notation to bridge to derivatives.", tasks: ["Evaluate: lim(x→2) of (x²−4)/(x−2)", "Determine continuity of f(x) = 1/(x−3) at x = 3", "Use the squeeze theorem for lim(x→0) x·sin(1/x)", "Sketch a piecewise function and identify discontinuities", "Find the limit at infinity: lim(x→∞) (3x²+1)/(x²−5)"] },
  { id: 3, title: "Pre-Calculus Function Review",      subject: "Pre-Calculus", module: "Trigonometry",             student: "DeShawn Williams", difficulty: "Intermediate", estimatedMins: 30, status: "approved", generatedAt: "Jun 17", assignedAt: "Jun 18", dueDate: "Jun 24", aiNote: "Covers function notation, composition, and inverse functions — areas where DeShawn needs reinforcement.", tasks: ["Evaluate f(g(x)) where f(x) = x+2 and g(x) = 3x", "Find the inverse of f(x) = 2x − 5", "Determine if a relation is a function via vertical line test", "Graph y = |x−2|+1 and describe transformations", "Solve: if f(x)=x² and g(x)=√x, find f(g(16))"] },
  { id: 4, title: "Simplifying Radicals — Basic Set",  subject: "Pre-Alg",     module: "Pre-Algebra Foundations",  student: "Sofia Patel",      difficulty: "Beginner",     estimatedMins: 15, status: "revision", generatedAt: "Jun 18", tutorNote: "Sofia is already at 88%+ — these are too easy. Please regenerate at Intermediate difficulty.", aiNote: "Generated to reinforce radical basics following session on exponents.", tasks: ["Simplify: √36", "Simplify: √72", "Simplify: 3√8 + 2√2", "Evaluate: (√5)²", "Simplify: √(16/25)"] },
  { id: 5, title: "Rate of Change Word Problems",      subject: "Calculus",     module: "Differential Equations",   student: "Noah Fitzgerald",  difficulty: "Advanced",     estimatedMins: 45, status: "pending",  generatedAt: "Jun 20", aiNote: "Builds on limit work. Real-world rate-of-change scenarios to prepare for derivatives.", tasks: ["A ball drops from 100m — find velocity at t=3s using limits", "Tank drains at V(t)=50−2t² gallons. Find rate at t=4", "Sketch the tangent to y=x² at x=3 and find its slope", "Compare average vs instantaneous rate for f(x)=x³ on [1,2]"] },
  { id: 6, title: "Pre-Algebra Word Problems",         subject: "Pre-Alg",     module: "Pre-Algebra Foundations",  student: "Sofia Patel",      difficulty: "Intermediate", estimatedMins: 20, status: "approved", generatedAt: "Jun 15", assignedAt: "Jun 16", dueDate: "Jun 22", aiNote: "Applied problems targeting equation setup and variable isolation, aligned with Sofia's current module progress.", tasks: ["Maria has 3× more stickers than Jake. Together they have 48. How many each?", "Rectangle length is 5 more than width. Perimeter = 42. Find dimensions.", "Solve: 4(x−2) = 3x + 5", "A train at 60mph covers 210 miles. Find travel time."] },
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
