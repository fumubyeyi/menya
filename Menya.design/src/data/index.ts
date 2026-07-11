import type { Student, Session, CurriculumCourse, CurriculumChapter, Tutor, SubjectDetail, SessionRecord, AIProject, HomeworkItem, AlumniRecord } from "../types";

export const CURRENT_STUDENT_ID = 3;
export const CURRENT_TUTOR_ID = 5;

export const students: Student[] = [
  { id: 1, name: "Aaliyah Johnson",  grade: 7, subjects: ["Algebra", "Algebra II"],     progress: 78, sessions: 12, streak: 5, status: "on-track",      location: "Atlanta, GA"    },
  { id: 2, name: "Marcus Rivera",    grade: 8, subjects: ["Calculus", "Geometry"],      progress: 64, sessions: 8,  streak: 2, status: "needs-support", location: "San Antonio, TX" },
  { id: 3, name: "Sofia Patel",      grade: 6, subjects: ["Geometry", "Pre-Alg"],       progress: 91, sessions: 15, streak: 8, status: "exceeding",     location: "Chicago, IL"    },
  { id: 4, name: "DeShawn Williams", grade: 9, subjects: ["Pre-Calculus", "Algebra II"],progress: 55, sessions: 6,  streak: 1, status: "at-risk",       location: "Detroit, MI"    },
  { id: 5, name: "Isabella Chen",    grade: 7, subjects: ["Algebra II", "Statistics"],  progress: 83, sessions: 11, streak: 4, status: "on-track",      location: "Oakland, CA"    },
  { id: 6, name: "Jaylen Brooks",    grade: 8, subjects: ["Calculus", "Algebra"],       progress: 70, sessions: 9,  streak: 3, status: "on-track",      location: "Baltimore, MD"  },
  { id: 7, name: "Amara Osei",       grade: 6, subjects: ["Pre-Alg", "Geometry"],       progress: 88, sessions: 14, streak: 6, status: "exceeding",     location: "Columbus, OH"   },
  { id: 8, name: "Noah Fitzgerald",  grade: 9, subjects: ["Pre-Calculus", "Calculus"],  progress: 61, sessions: 7,  streak: 1, status: "needs-support", location: "Boston, MA"     },
];

export const sessions: Session[] = [
  { id: 1,  student: "Aaliyah Johnson",  tutorId: 1, subject: "Algebra",       time: "Today",    clock: "3:30 PM", duration: 60, status: "upcoming", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 2,  student: "Marcus Rivera",    tutorId: 2, subject: "Calculus",      time: "Today",    clock: "4:00 PM", duration: 45, status: "upcoming", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 3,  student: "Sofia Patel",      tutorId: 3, subject: "Pre-Alg",       time: "Today",    clock: "4:30 PM", duration: 60, status: "in-progress", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 4,  student: "Isabella Chen",    tutorId: 2, subject: "Algebra II",    time: "Tomorrow", clock: "2:00 PM", duration: 60, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 5,  student: "DeShawn Williams", tutorId: 4, subject: "Pre-Calculus",  time: "Tomorrow", clock: "3:00 PM", duration: 45, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 6,  student: "Jaylen Brooks",    tutorId: 1, subject: "Algebra",       time: "Jun 22",   clock: "2:30 PM", duration: 60, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
  { id: 7,  student: "Amara Osei",       tutorId: 4, subject: "Geometry",      time: "Jun 22",   clock: "3:00 PM", duration: 45, status: "scheduled", meetingId: "add_real_meeting_id", password: "add_real_passcode" },
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
        { title: "Solving One-Step Equations", status: "completed" }, { title: "Solving Multi-Step Equations", status: "completed" },
        { title: "Graphing Linear Inequalities", status: "in-progress",
          description: "Learn how to graph the solution set of a linear inequality on the coordinate plane.",
          content: [
            "A linear inequality like y > 2x − 1 has infinitely many solutions, and graphing lets you see all of them at once. Start by graphing the boundary line as if it were an equation — use a dashed line for > or < and a solid line for ≥ or ≤.",
            "Then shade the half-plane that satisfies the inequality. Pick a test point not on the line (the origin is usually easiest) and plug it in: if it makes the inequality true, shade that side; if not, shade the other side.",
          ],
          exercises: [
            "Graph y < 3x + 2, choosing the correct line style and shaded region.",
            "Graph y ≥ −x + 4 and pick two points inside the shaded region to verify.",
            "Convert 2x + y ≤ 6 to slope-intercept form, then graph it.",
          ],
          test: [
            "Graph the inequality y > −2x + 1.",
            "Explain how you decide whether to shade above or below the boundary line.",
            "Given the point (3, 1), determine whether it's a solution to y ≤ x + 2 and justify your answer.",
          ] },
        { title: "Compound Inequalities", status: "not-started" },
      ] },
      { id: 102, title: "Quadratic Equations", difficulty: "Intermediate", modules: [
        { title: "Factoring Quadratics", status: "completed" }, { title: "Completing the Square", status: "completed" },
        { title: "The Quadratic Formula", status: "completed" },
        { title: "Graphing Parabolas", status: "in-progress",
          description: "Learn to graph quadratic functions by identifying the vertex, axis of symmetry, and direction of opening.",
          content: [
            "Every parabola from y = ax² + bx + c has a vertex — its highest or lowest point — found at x = −b/(2a). The sign of a tells you whether the parabola opens upward (a > 0) or downward (a < 0).",
            "Once you have the vertex, plot a couple of points on either side using symmetry, then sketch the smooth U-shaped curve through them.",
          ],
          exercises: [
            "Find the vertex of y = x² − 4x + 3, then sketch the graph.",
            "Graph y = −2x² + 8x − 5 and label the axis of symmetry.",
            "Compare the graphs of y = x² and y = 2x² — how does the coefficient change the shape?",
          ],
          test: [
            "Find the vertex and axis of symmetry of y = 2x² − 12x + 7.",
            "Sketch y = −x² + 4 and label its vertex and x-intercepts.",
            "Explain how the sign of the leading coefficient affects a parabola's graph.",
          ] },
      ] },
      { id: 103, title: "Systems of Equations", difficulty: "Advanced", modules: [
        { title: "Solving by Substitution", status: "not-started" }, { title: "Solving by Elimination", status: "not-started" },
        { title: "Graphing Systems", status: "not-started" }, { title: "Systems of Inequalities", status: "not-started" },
      ] },
    ],
  },
  {
    id: 2, subject: "Algebra II", grade: "9", students: 40,
    chapters: [
      { id: 201, title: "Polynomial Functions", difficulty: "Intermediate", modules: [
        { title: "Polynomial Operations", status: "completed" }, { title: "Factoring Higher-Degree Polynomials", status: "completed" },
        { title: "Graphing Polynomial Functions", status: "in-progress",
          description: "Learn to sketch polynomial functions using end behavior, zeros, and turning points.",
          content: [
            "A polynomial's degree and leading coefficient determine its end behavior — where the graph heads as x moves toward positive or negative infinity. Its real zeros are where the graph crosses or touches the x-axis.",
            "Between zeros, the graph turns at most (degree − 1) times, so use that as a check that your sketch has a reasonable shape.",
          ],
          exercises: [
            "Determine the end behavior of f(x) = −x⁴ + 3x² − 1.",
            "Find the zeros of f(x) = x³ − x, then sketch the graph.",
            "Sketch f(x) = (x − 1)(x + 2)(x − 3) using its zeros and end behavior.",
          ],
          test: [
            "Describe the end behavior of f(x) = 2x⁵ − x³ + 4.",
            "Find all real zeros of f(x) = x³ − 4x and sketch the graph.",
            "Explain how the multiplicity of a zero affects whether the graph crosses or bounces off the x-axis.",
          ] },
        { title: "The Remainder & Factor Theorems", status: "not-started" },
      ] },
      { id: 202, title: "Exponential & Logarithmic Functions", difficulty: "Advanced", modules: [
        { title: "Exponential Growth & Decay", status: "in-progress",
          description: "Model real-world growth and decay situations using exponential functions.",
          content: [
            "Exponential growth and decay follow the form A = A₀(1 + r)ᵗ, where A₀ is the starting amount, r is the growth (positive) or decay (negative) rate, and t is time. Growth curves rise increasingly fast; decay curves fall and flatten toward zero.",
            "Watch for the difference between rate per period (r) and the growth factor (1 + r) — mixing them up is the most common mistake.",
          ],
          exercises: [
            "A population of 500 grows 4% per year. Write a function for its size after t years.",
            "A car worth $20,000 depreciates 15% per year. Find its value after 5 years.",
            "Graph A = 100(1.1)ᵗ and A = 100(0.9)ᵗ on the same axes and compare.",
          ],
          test: [
            "Write an exponential model for a $1,000 investment growing at 6% annually.",
            "A radioactive sample decays 3% per hour. Find the amount remaining after 10 hours from a 200g sample.",
            "Explain, using the formula, why exponential decay never reaches exactly zero.",
          ] },
        { title: "Properties of Logarithms", status: "not-started" },
        { title: "Solving Exponential Equations", status: "not-started" }, { title: "Solving Logarithmic Equations", status: "not-started" },
      ] },
    ],
  },
  {
    id: 3, subject: "Pre-Alg", grade: "6", students: 131,
    chapters: [
      { id: 301, title: "Pre-Algebra Foundations", difficulty: "Beginner", modules: [
        { title: "Number Properties", status: "completed" }, { title: "Order of Operations Basics", status: "completed" },
        { title: "Variables & Expressions", status: "completed" }, { title: "Simple Equations", status: "completed" },
        { title: "Factors & Multiples", status: "completed" },
        { title: "Prime Factorization", status: "in-progress",
          description: "Break numbers down into their prime building blocks.",
          content: [
            "Every whole number greater than 1 can be written as a unique product of prime numbers — this is called its prime factorization. A factor tree is the easiest way to find it: keep splitting a number into factors until every branch ends in a prime.",
            "Prime factorization is the foundation for finding GCF and LCM, so getting comfortable with it now pays off later.",
          ],
          exercises: [
            "Find the prime factorization of 60 using a factor tree.",
            "Find the prime factorization of 84 and 90, then list their common prime factors.",
            "Use prime factorization to find the GCF of 36 and 48.",
          ],
          test: [
            "Find the prime factorization of 120.",
            "Is 91 prime or composite? Show your work.",
            "Use prime factorization to find the LCM of 12 and 18.",
          ] },
        { title: "Exponents & Powers of Ten", status: "not-started" },
      ] },
      { id: 302, title: "Ratios, Rates & Proportions", difficulty: "Beginner", modules: [
        { title: "Understanding Ratios", status: "completed" }, { title: "Unit Rates", status: "completed" },
        { title: "Solving Proportions", status: "in-progress",
          description: "Use cross-multiplication to solve for an unknown value in a proportion.",
          content: [
            "A proportion is two equal ratios, like a/b = c/d. To solve for a missing value, cross-multiply — multiply the numerator of one side by the denominator of the other — then solve the resulting equation.",
            "Proportions show up constantly in real life: scaling recipes, map distances, unit conversions, and more.",
          ],
          exercises: [
            "Solve for x: 3/4 = x/20.",
            "A recipe uses 2 cups of flour for 12 cookies. How much flour is needed for 30 cookies?",
            "Solve for y: 5/y = 15/9.",
          ],
          test: [
            "Solve for x: 7/x = 21/9.",
            "A map has a scale of 1 inch = 25 miles. If two cities are 4.5 inches apart on the map, how far apart are they really?",
            "Explain why cross-multiplication works for solving proportions.",
          ] },
        { title: "Percent Problems", status: "not-started" },
      ] },
      { id: 303, title: "Integers & Order of Operations", difficulty: "Intermediate", modules: [
        { title: "Adding & Subtracting Integers", status: "completed" },
        { title: "Multiplying & Dividing Integers", status: "in-progress",
          description: "Learn the sign rules for multiplying and dividing positive and negative numbers.",
          content: [
            "When multiplying or dividing two integers, the result is positive if the signs match and negative if they differ — regardless of the size of the numbers. A quick way to remember it: same signs give a positive result, different signs give a negative one.",
            "This rule holds no matter how many numbers you're multiplying — just count how many negative signs are involved: an even count gives a positive result, an odd count gives a negative one.",
          ],
          exercises: [
            "Evaluate: (−6) × 4, (−9) × (−3), and 12 ÷ (−4).",
            "Evaluate: (−2) × (−3) × (−5).",
            "Find the missing number: (−7) × ___ = 42.",
          ],
          test: [
            "Evaluate: (−8) × (−7).",
            "Evaluate: (−36) ÷ 6.",
            "Evaluate: (−2) × (−2) × (−2) × (−2) and explain how you determined the sign.",
          ] },
        { title: "The Order of Operations", status: "not-started" }, { title: "Absolute Value", status: "not-started" },
      ] },
      { id: 304, title: "Linear Equations", difficulty: "Intermediate", modules: [
        { title: "Understanding Variables & Constants", status: "not-started" }, { title: "Solving One-Step Linear Equations", status: "not-started" },
        { title: "Solving Two-Step Linear Equations", status: "not-started" }, { title: "Graphing Linear Equations", status: "not-started" },
        { title: "Writing Linear Equations from Word Problems", status: "not-started" },
      ] },
    ],
  },
  {
    id: 4, subject: "Geometry", grade: "7–8", students: 80,
    chapters: [
      { id: 401, title: "Geometry Essentials", difficulty: "Intermediate", modules: [
        { title: "Points, Lines & Planes", status: "completed" }, { title: "Angle Relationships", status: "completed" },
        { title: "Classifying Polygons", status: "completed" },
        { title: "Congruence & Similarity", status: "in-progress",
          description: "Understand the difference between congruent and similar figures, and how to prove each.",
          content: [
            "Congruent figures are identical in size and shape — every corresponding side and angle matches exactly. Similar figures have the same shape but can be different sizes; their corresponding angles are equal and their corresponding sides are in proportion.",
            "Common congruence shortcuts for triangles include SSS, SAS, and ASA; for similarity, AA (two matching angles) is often enough.",
          ],
          exercises: [
            "Given two triangles with all three pairs of sides equal, what congruence rule proves them congruent?",
            "Two triangles have two pairs of congruent angles. Are they similar? Explain.",
            "Find the missing side length in a pair of similar triangles given a scale factor of 2.",
          ],
          test: [
            "State the difference between congruent and similar figures.",
            "Given triangle side lengths 3, 4, 5 and 6, 8, 10, determine if the triangles are similar and explain why.",
            "Explain which congruence shortcut (SSS, SAS, or ASA) applies when you know two sides and the included angle.",
          ] },
        { title: "Parallel Lines & Transversals", status: "not-started" }, { title: "Coordinate Geometry Basics", status: "not-started" },
        { title: "Symmetry & Transformations", status: "not-started" }, { title: "Constructions with Compass & Straightedge", status: "not-started" },
      ] },
      { id: 402, title: "Triangles & the Pythagorean Theorem", difficulty: "Intermediate", modules: [
        { title: "Triangle Angle Sum", status: "not-started" }, { title: "Special Right Triangles", status: "not-started" },
        { title: "The Pythagorean Theorem", status: "not-started" }, { title: "Applications of the Pythagorean Theorem", status: "not-started" },
      ] },
      { id: 403, title: "Circles, Area & Volume", difficulty: "Advanced", modules: [
        { title: "Circumference & Area of Circles", status: "not-started" }, { title: "Surface Area of Solids", status: "not-started" },
        { title: "Volume of Prisms & Cylinders", status: "not-started" }, { title: "Volume of Pyramids & Cones", status: "not-started" },
      ] },
    ],
  },
  {
    id: 5, subject: "Statistics", grade: "7–8", students: 94,
    chapters: [
      { id: 501, title: "Intro to Statistics", difficulty: "Intermediate", modules: [
        { title: "Collecting & Organizing Data", status: "completed" }, { title: "Measures of Center", status: "completed" },
        { title: "Measures of Spread", status: "in-progress",
          description: "Learn to describe how spread out a data set is using range, IQR, and standard deviation.",
          content: [
            "While measures of center describe a 'typical' value, measures of spread describe how much the data varies. Range is the simplest (max − min), while interquartile range (IQR) focuses on the middle 50% of the data and resists outliers better.",
            "Standard deviation goes further, measuring the average distance each data point sits from the mean — the larger it is, the more spread out the data.",
          ],
          exercises: [
            "Find the range and IQR of the data set: 4, 8, 15, 16, 23, 42.",
            "Explain why IQR is often preferred over range when outliers are present.",
            "Given a mean of 50 and standard deviation of 5, describe what values would be considered typical.",
          ],
          test: [
            "Find the range of the data set: 12, 18, 9, 25, 14.",
            "Explain what a small standard deviation tells you about a data set.",
            "Find the IQR of: 2, 4, 4, 6, 8, 10, 12, 14.",
          ] },
        { title: "Interpreting Graphs", status: "not-started" },
        { title: "Sampling Methods", status: "not-started" }, { title: "Correlation vs. Causation", status: "not-started" },
      ] },
      { id: 502, title: "Data Displays & Measures of Center", difficulty: "Beginner", modules: [
        { title: "Histograms & Box Plots", status: "completed" },
        { title: "Mean, Median & Mode", status: "in-progress",
          description: "Learn to calculate and compare the three most common measures of center.",
          content: [
            "The mean is the average — add all values and divide by how many there are. The median is the middle value when data is ordered (or the average of the two middle values). The mode is the value that appears most often.",
            "Each measure can tell a different story: the mean is sensitive to outliers, while the median usually gives a more typical picture when the data is skewed.",
          ],
          exercises: [
            "Find the mean, median, and mode of: 3, 7, 7, 9, 12.",
            "Add an outlier of 100 to the data set above and recompute the mean and median. Which changed more?",
            "A data set has no repeated values. What is its mode?",
          ],
          test: [
            "Find the mean of: 5, 10, 15, 20, 25.",
            "Find the median of: 8, 3, 12, 5, 9.",
            "Explain why the median is often used instead of the mean when describing home prices.",
          ] },
        { title: "Outliers & Their Effects", status: "not-started" }, { title: "Comparing Data Sets", status: "not-started" },
      ] },
      { id: 503, title: "Probability Fundamentals", difficulty: "Intermediate", modules: [
        { title: "Basic Probability Rules", status: "not-started" }, { title: "Independent & Dependent Events", status: "not-started" },
        { title: "Compound Probability", status: "not-started" }, { title: "Expected Value", status: "not-started" },
      ] },
    ],
  },
  {
    id: 6, subject: "Pre-Calculus", grade: "10", students: 31,
    chapters: [
      { id: 601, title: "Functions & Their Graphs", difficulty: "Intermediate", modules: [
        { title: "Function Notation & Transformations", status: "completed" },
        { title: "Piecewise Functions", status: "in-progress",
          description: "Learn to define, evaluate, and graph functions made of multiple pieces.",
          content: [
            "A piecewise function uses different rules for different parts of its domain, like f(x) = x² for x < 0 and f(x) = 2x for x ≥ 0. To evaluate it at a point, first figure out which piece's condition the input satisfies, then apply that rule.",
            "When graphing, sketch each piece only over its own domain, and pay attention to whether the endpoints are open or closed circles.",
          ],
          exercises: [
            "Evaluate the piecewise function above at x = −3 and x = 5.",
            "Graph f(x) = −x + 1 for x < 2 and f(x) = 3 for x ≥ 2.",
            "Write a piecewise function describing a flat shipping fee of $5 for orders under $50, and free shipping otherwise.",
          ],
          test: [
            "Evaluate a given piecewise function at three specified input values.",
            "Graph a two-piece function and correctly mark open/closed endpoints.",
            "Explain why checking the domain condition first is essential before evaluating a piecewise function.",
          ] },
        { title: "Inverse Functions", status: "not-started" }, { title: "Rational Functions", status: "not-started" },
      ] },
      { id: 602, title: "Trigonometry Foundations", difficulty: "Advanced", modules: [
        { title: "The Unit Circle", status: "not-started" }, { title: "Graphing Sine & Cosine", status: "not-started" },
        { title: "Trig Identities", status: "not-started" }, { title: "Solving Trig Equations", status: "not-started" },
      ] },
    ],
  },
  {
    id: 7, subject: "Calculus", grade: "11–12", students: 28,
    chapters: [
      { id: 701, title: "Limits & Continuity", difficulty: "Intermediate", modules: [
        { title: "Evaluating Limits Graphically", status: "completed" }, { title: "Evaluating Limits Algebraically", status: "completed" },
        { title: "Continuity & Discontinuities", status: "in-progress",
          description: "Learn to identify where a function is continuous and classify the types of discontinuities.",
          content: [
            "A function is continuous at a point if the limit exists there, the function is defined there, and the two match. If any of those fail, the function has a discontinuity — common types include removable (a hole), jump, and infinite (asymptote).",
            "Recognizing which type you're dealing with helps you decide how to handle it, whether that's simplifying an expression, checking one-sided limits, or noting an asymptote.",
          ],
          exercises: [
            "Determine whether f(x) = (x² − 4)/(x − 2) is continuous at x = 2.",
            "Classify the discontinuity of f(x) = 1/(x − 3) at x = 3.",
            "Sketch a function with a jump discontinuity at x = 1.",
          ],
          test: [
            "Determine whether a given rational function is continuous at a specified point.",
            "Classify a discontinuity as removable, jump, or infinite given a graph.",
            "Explain the three conditions required for a function to be continuous at a point.",
          ] },
        { title: "Limits at Infinity", status: "not-started" },
      ] },
      { id: 702, title: "Derivatives & Applications", difficulty: "Advanced", modules: [
        { title: "The Derivative as a Rate of Change", status: "not-started" }, { title: "Derivative Rules", status: "not-started" },
        { title: "The Chain Rule", status: "not-started" }, { title: "Applications: Related Rates & Optimization", status: "not-started" },
      ] },
    ],
  },
];

export const tutors: Tutor[] = [
  { id: 1, firstName: "Jennifer", lastName: "Chen",      subjects: ["Algebra", "Geometry"],        students: 14, sessions: 38, description: "Breaks down algebra and geometry into visual, step-by-step problems so abstract rules finally click. Patient with students who need concepts repeated a few different ways." },
  { id: 2, firstName: "David",    lastName: "Thompson",  subjects: ["Algebra II", "Calculus"],     students: 11, sessions: 29, description: "Makes algebra II and calculus click by tying abstract rules to real-world modeling and hands-on problem-solving instead of rote memorization." },
  { id: 3, firstName: "Maria",    lastName: "Rodriguez", subjects: ["Pre-Alg", "Statistics"],      students: 16, sessions: 44, description: "Builds strong number-sense foundations in pre-algebra and statistics, with a calm, encouraging style that's great for students still building math confidence." },
  { id: 4, firstName: "Andrew",   lastName: "Kim",       subjects: ["Geometry", "Pre-Calculus"],   students: 13, sessions: 35, description: "Turns geometry and pre-calculus into everyday phenomena students can see and test themselves, focusing on visual intuition before formulas." },
  { id: 5, firstName: "Francoise",lastName: "Umubyeyi",  subjects: ["Pre-Calculus", "Calculus"],   students: 20, sessions: 25, description: "Guides students through pre-calculus and calculus with a focus on problem-solving strategy, helping them recognize patterns across problem types rather than memorizing steps." },
];

export function getTutorById(id: number): Tutor | undefined {
  return tutors.find((t) => t.id === id);
}

export function findChapterById(chapterId: number): { course: CurriculumCourse; chapter: CurriculumChapter } | undefined {
  for (const course of curriculum) {
    const chapter = course.chapters.find((ch) => ch.id === chapterId);
    if (chapter) return { course, chapter };
  }
  return undefined;
}

export function tutorNameById(id: number): string {
  const t = getTutorById(id);
  return t ? `${t.firstName} ${t.lastName}` : "";
}

export const studentSubjectDetail: Record<number, SubjectDetail[]> = {
  1: [{ subject: "Algebra",      score: 82, sessions: 7, lastSession: "Jun 18", trend: "up"   }, { subject: "Algebra II",   score: 74, sessions: 5, lastSession: "Jun 15", trend: "up"   }],
  2: [{ subject: "Calculus",     score: 61, sessions: 4, lastSession: "Jun 17", trend: "flat" }, { subject: "Geometry",     score: 68, sessions: 4, lastSession: "Jun 14", trend: "up"   }],
  3: [{ subject: "Geometry",     score: 94, sessions: 8, lastSession: "Jun 19", trend: "up"   }, { subject: "Pre-Alg",      score: 88, sessions: 7, lastSession: "Jun 16", trend: "up"   }],
  4: [{ subject: "Pre-Calculus", score: 52, sessions: 3, lastSession: "Jun 12", trend: "down" }, { subject: "Algebra II",   score: 58, sessions: 3, lastSession: "Jun 10", trend: "flat" }],
  5: [{ subject: "Algebra II",   score: 86, sessions: 6, lastSession: "Jun 18", trend: "up"   }, { subject: "Statistics",   score: 80, sessions: 5, lastSession: "Jun 16", trend: "up"   }],
  6: [{ subject: "Calculus",     score: 67, sessions: 5, lastSession: "Jun 17", trend: "up"   }, { subject: "Algebra",      score: 73, sessions: 4, lastSession: "Jun 15", trend: "flat" }],
  7: [{ subject: "Pre-Alg",      score: 91, sessions: 7, lastSession: "Jun 19", trend: "up"   }, { subject: "Geometry",     score: 85, sessions: 7, lastSession: "Jun 17", trend: "up"   }],
  8: [{ subject: "Calculus",     score: 68, sessions: 4, lastSession: "Jun 18", trend: "up"   }, { subject: "Pre-Calculus", score: 60, sessions: 3, lastSession: "Jun 14", trend: "flat" }],
};

export const studentSessionHistory: Record<number, SessionRecord[]> = {
  1: [{ subject: "Algebra",       tutorId: 1, date: "Jun 18", score: 84, duration: 60 }, { subject: "Algebra II",    tutorId: 2, date: "Jun 15", score: 76, duration: 45 }, { subject: "Algebra",       tutorId: 1, date: "Jun 11", score: 79, duration: 60 }, { subject: "Algebra II", tutorId: 2, date: "Jun 8",  score: 71, duration: 45 }],
  2: [{ subject: "Calculus",      tutorId: 2, date: "Jun 17", score: 63, duration: 45 }, { subject: "Geometry",      tutorId: 1, date: "Jun 14", score: 70, duration: 60 }, { subject: "Calculus",      tutorId: 2, date: "Jun 10", score: 58, duration: 45 }],
  3: [{ subject: "Geometry",      tutorId: 4, date: "Jun 19", score: 96, duration: 60, artifacts: [{ id: 1, type: "notes", label: "Session notes", url: "https://notes.menya.app/sessions/3-jun19" }, { id: 2, type: "whiteboard", label: "Whiteboard", url: "https://whiteboard.menya.app/sessions/3-jun19" }] }, { subject: "Pre-Alg",       tutorId: 3, date: "Jun 16", score: 91, duration: 60, artifacts: [{ id: 3, type: "notes", label: "Session notes", url: "https://notes.menya.app/sessions/3-jun16" }] }, { subject: "Geometry",      tutorId: 4, date: "Jun 12", score: 93, duration: 45 }, { subject: "Pre-Alg",  tutorId: 5, date: "Jun 9",  score: 88, duration: 60 }],
  4: [{ subject: "Pre-Calculus",  tutorId: 4, date: "Jun 12", score: 54, duration: 45 }, { subject: "Pre-Calculus",  tutorId: 5, date: "Jun 10", score: 57, duration: 60 }, { subject: "Pre-Calculus",  tutorId: 4, date: "Jun 5",  score: 49, duration: 45 }, { subject: "Pre-Calculus", tutorId: 5, date: "Jun 1", score: 52, duration: 60 }],
  5: [{ subject: "Algebra II",    tutorId: 2, date: "Jun 18", score: 88, duration: 60 }, { subject: "Statistics",    tutorId: 3, date: "Jun 16", score: 82, duration: 45 }, { subject: "Algebra II",    tutorId: 2, date: "Jun 13", score: 85, duration: 60 }, { subject: "Statistics", tutorId: 3, date: "Jun 10", score: 78, duration: 45 }],
  6: [{ subject: "Calculus",      tutorId: 2, date: "Jun 17", score: 69, duration: 45 }, { subject: "Algebra",       tutorId: 1, date: "Jun 15", score: 74, duration: 60 }, { subject: "Calculus",      tutorId: 2, date: "Jun 11", score: 64, duration: 45 }],
  7: [{ subject: "Pre-Alg",       tutorId: 3, date: "Jun 19", score: 93, duration: 60 }, { subject: "Geometry",      tutorId: 4, date: "Jun 17", score: 87, duration: 45 }, { subject: "Pre-Alg",       tutorId: 3, date: "Jun 14", score: 90, duration: 60 }, { subject: "Geometry",      tutorId: 4, date: "Jun 11", score: 84, duration: 45 }],
  8: [{ subject: "Pre-Calculus",  tutorId: 5, date: "Jun 18", score: 68, duration: 60 }, { subject: "Pre-Calculus",  tutorId: 4, date: "Jun 14", score: 60, duration: 45 }, { subject: "Calculus",      tutorId: 5, date: "Jun 11", score: 63, duration: 60 }, { subject: "Pre-Calculus", tutorId: 4, date: "Jun 7",  score: 56, duration: 45 }],
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

export const studentGoals = [
  { label: "Reach 95% in Geometry",         current: 94, target: 95,  unit: "%",        color: "#3B82F6" },
  { label: "Complete 20 sessions",          current: 15, target: 20,  unit: "sessions", color: "#8B5CF6" },
  { label: "10-Day Streak",                 current: 8,  target: 10,  unit: "days",     color: "#F59E0B" },
  { label: "Finish Geometry Essentials module", current: 55, target: 100, unit: "%",    color: "#3B82F6" },
];

export const studentModules = [
  { subject: "Pre-Alg",       title: "Pre-Algebra Foundations", completion: 80, totalModules: 6, currentModule: 5, active: false },
  { subject: "Pre-Alg",       title: "Linear Equations (next)", completion: 0,  totalModules: 5, currentModule: 0, active: false },

  // Math — additional module progress (more subjects to follow later)
  { subject: "Algebra",       title: "Quadratic Equations",                completion: 68, totalModules: 6, currentModule: 4, active: true  },
  { subject: "Algebra",       title: "Systems of Equations (next)",        completion: 0,  totalModules: 7, currentModule: 0, active: false },
  { subject: "Algebra II",    title: "Polynomial Functions",               completion: 45, totalModules: 8, currentModule: 4, active: true  },
  { subject: "Geometry",      title: "Geometry Essentials",                completion: 55, totalModules: 8, currentModule: 4, active: true  },
  { subject: "Geometry",      title: "Triangles & the Pythagorean Theorem (next)", completion: 0, totalModules: 6, currentModule: 0, active: false },
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

// Alumni tracking — students who completed the program or left it, followed up on
// whether they went on to a STEM major or STEM career after high-school graduation.
// `checkIns` preserves each dated follow-up snapshot (rather than overwriting it) so
// outcome changes can be tracked cohort-over-cohort and cross-checked against how the
// student performed in the program (see `students` via `studentId`).
export const alumni: AlumniRecord[] = [
  { id: 1001, studentId: 4, name: "DeShawn Williams", lastGrade: 12, location: "Detroit, MI",   exitReason: "graduated",    exitYear: 2025, hsGraduated: true,  outcome: "stem-college",     verification: "verified",      institution: "Wayne State University", fieldOfStudy: "Mechanical Engineering", lastContact: "Jun 10, 2026", followUpStatus: "up-to-date", assignedStaff: "Maria Rodriguez", notes: "Doing well in first year. Wants to shadow an engineer over winter break — connect with alumni network.",
    checkIns: [
      { timeframe: "6 months", date: "Dec 3, 2025",  outcome: "stem-college", verification: "self-reported", note: "Enrolled at Wayne State, declared Mechanical Engineering." },
      { timeframe: "1 year",   date: "Jun 10, 2026",  outcome: "stem-college", verification: "verified",      note: "Enrollment confirmed via unofficial transcript, GPA 3.4." },
    ] },
  { id: 1002, studentId: 8, name: "Noah Fitzgerald",  lastGrade: 12, location: "Boston, MA",     exitReason: "graduated",    exitYear: 2025, hsGraduated: true,  outcome: "stem-career",      verification: "verified",      institution: "MassDOT",                  fieldOfStudy: "Civil/Transit Technician", lastContact: "May 28, 2026", followUpStatus: "up-to-date", assignedStaff: "Francoise Umubyeyi", notes: "Started an apprenticeship instead of college. Interested in an associate degree later.",
    checkIns: [
      { timeframe: "6 months", date: "Dec 15, 2025", outcome: "gap-year",    verification: "self-reported", note: "Still deciding, working part-time." },
      { timeframe: "1 year",   date: "May 28, 2026", outcome: "stem-career", verification: "verified",      note: "Employer confirmed apprenticeship start date." },
    ] },
  { id: 1003, name: "Camille Torres",   lastGrade: 12, location: "Atlanta, GA",    exitReason: "graduated",    exitYear: 2024, hsGraduated: true,  outcome: "non-stem-college", verification: "self-reported", institution: "Spelman College",          fieldOfStudy: "Political Science",       lastContact: "Apr 2, 2026",  followUpStatus: "due-soon",   assignedStaff: "Jennifer Chen", notes: "",
    checkIns: [
      { timeframe: "6 months", date: "Jan 20, 2025", outcome: "non-stem-college", verification: "self-reported", note: "Enrolled at Spelman, undecided major." },
      { timeframe: "1 year",   date: "Apr 2, 2026",  outcome: "non-stem-college", verification: "self-reported", note: "Declared Political Science." },
    ] },
  { id: 1004, name: "Tyrell Banks",     lastGrade: 11, location: "Baltimore, MD",  exitReason: "left-program", exitYear: 2025, hsGraduated: false, outcome: "unknown",          verification: "self-reported", lastContact: "Jan 14, 2026",  followUpStatus: "overdue",    assignedStaff: "David Thompson", notes: "Family relocated mid-year. Two follow-up calls unanswered — try email next.",
    checkIns: [] },
  { id: 1005, name: "Priya Nair",       lastGrade: 12, location: "Oakland, CA",    exitReason: "graduated",    exitYear: 2025, hsGraduated: true,  outcome: "stem-college",     verification: "verified",      institution: "UC Davis",                 fieldOfStudy: "Computer Science",        lastContact: "Jun 3, 2026",  followUpStatus: "up-to-date", assignedStaff: "Andrew Kim", notes: "Reports our Algebra II/Stats track prepared her well for intro CS math.",
    checkIns: [
      { timeframe: "6 months", date: "Dec 1, 2025", outcome: "stem-college", verification: "verified", note: "Enrollment verified directly with UC Davis registrar." },
      { timeframe: "1 year",   date: "Jun 3, 2026",  outcome: "stem-college", verification: "verified", note: "Still enrolled, made Dean's List." },
    ] },
  { id: 1006, name: "Malik Jefferson",  lastGrade: 10, location: "Columbus, OH",   exitReason: "left-program", exitYear: 2024, hsGraduated: true,  outcome: "military",         verification: "self-reported", institution: "U.S. Army",                lastContact: "Mar 20, 2026",  followUpStatus: "due-soon",   assignedStaff: "Maria Rodriguez", notes: "Enlisted after leaving the program early; plans to use GI Bill for engineering later.",
    checkIns: [
      { timeframe: "6 months", date: "Mar 20, 2026", outcome: "military", verification: "self-reported", note: "Enlisted, currently in basic training." },
    ] },
  { id: 1007, name: "Grace Kim",        lastGrade: 12, location: "San Antonio, TX",exitReason: "graduated",    exitYear: 2024, hsGraduated: true,  outcome: "stem-career",      verification: "verified",      institution: "HEB Digital",              fieldOfStudy: "Data Analyst",            lastContact: "May 15, 2026", followUpStatus: "up-to-date", assignedStaff: "David Thompson", notes: "Skipped a 4-year degree, went straight into a data analytics role via bootcamp.",
    checkIns: [
      { timeframe: "6 months", date: "Dec 10, 2024", outcome: "gap-year",    verification: "self-reported", note: "Working retail while researching bootcamps." },
      { timeframe: "1 year",   date: "May 20, 2025", outcome: "stem-career", verification: "verified",      note: "Completed data analytics bootcamp, hired by HEB Digital." },
      { timeframe: "2 years",  date: "May 15, 2026", outcome: "stem-career", verification: "verified",      note: "Promoted to Analyst II." },
    ] },
  { id: 1008, name: "Omar Haddad",      lastGrade: 12, location: "Chicago, IL",    exitReason: "graduated",    exitYear: 2025, hsGraduated: true,  outcome: "gap-year",         verification: "self-reported", lastContact: "Feb 8, 2026",  followUpStatus: "overdue",    assignedStaff: "Jennifer Chen", notes: "Taking a gap year to work and save. Said he's still deciding between nursing and engineering.",
    checkIns: [
      { timeframe: "6 months", date: "Feb 8, 2026", outcome: "gap-year", verification: "self-reported", note: "Working full-time, saving for tuition." },
    ] },
  { id: 1009, name: "Leilani Akana",    lastGrade: 9,  location: "Detroit, MI",    exitReason: "left-program", exitYear: 2026, hsGraduated: false, outcome: "unknown",          verification: "self-reported", lastContact: "Jun 25, 2026", followUpStatus: "due-soon",   assignedStaff: "Andrew Kim", notes: "Left recently due to scheduling conflicts with a new job. Still in high school.",
    checkIns: [] },
  { id: 1010, name: "Ben Okafor",       lastGrade: 12, location: "Baltimore, MD",  exitReason: "graduated",    exitYear: 2023, hsGraduated: true,  outcome: "non-stem-career",  verification: "self-reported", institution: "Self-employed",            fieldOfStudy: "Graphic Design",          lastContact: "Nov 30, 2025", followUpStatus: "overdue",    assignedStaff: "Francoise Umubyeyi", notes: "",
    checkIns: [
      { timeframe: "6 months", date: "May 1, 2024",  outcome: "gap-year",        verification: "self-reported", note: "Freelancing design work, no school plans yet." },
      { timeframe: "1 year",   date: "Nov 15, 2024",  outcome: "non-stem-career", verification: "self-reported", note: "Freelance graphic design became steady income." },
      { timeframe: "2 years",  date: "Nov 30, 2025",  outcome: "non-stem-career", verification: "self-reported", note: "Still self-employed, building a client base." },
    ] },
];
