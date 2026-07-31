export type Role = "program" | "tutor" | "student";
export type StudentStatus = "exceeding" | "on-track" | "needs-support" | "at-risk";
export type ProjectStatus = "pending" | "approved" | "revision" | "rejected";
export type SessionStatus = "upcoming" | "in-progress" | "scheduled";
export type SessionType = "tutoring" | "check-in";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type TrendDirection = "up" | "flat" | "down";
export type ExitReason = "graduated" | "left-program";
export type AlumniOutcome =
  | "stem-college" | "non-stem-college"
  | "stem-career"  | "non-stem-career"
  | "military" | "gap-year" | "unknown";
export type FollowUpStatus = "up-to-date" | "due-soon" | "overdue";
export type VerificationSource = "self-reported" | "verified";

export interface Student {
  id: number;
  name: string;
  grade: number;
  courses: string[];
  progress: number;
  sessions: number;
  streak: number;
  status: StudentStatus;
  location: string;
}

export interface Session {
  id: number;
  student: string;
  tutorId: number;
  course: string;
  time: string;
  clock: string;
  duration: number;
  status: SessionStatus;
  // Absent means "tutoring" — the ordinary self- or tutor-scheduled session.
  // "check-in" marks a tutor-initiated session prompted by a student's at-risk status.
  type?: SessionType;
  meetingId?: string;
  password?: string;
  // Absent means "virtual" — in-person sessions carry no Zoom meetingId/password.
  location?: "in-person" | "virtual";
}

export type ModuleStatus = "not-started" | "in-progress" | "completed";

// Absent `type` means "free-response" — today's behavior (type attempt, reveal
// model answer, self-mark). The other types are graded automatically as soon as
// the student answers, no self-report needed.
export type QuestionType = "free-response" | "true-false" | "multiple-choice" | "numeric";

export interface PracticeChoice {
  label: string;
  diagram?: DiagramSpec; // optional graph/shape shown as the choice itself
}

// A single practice question paired with its model answer, so the workspace can let
// a student attempt it and self-check against something concrete rather than just
// reading a prompt.
export interface PracticeItem {
  prompt: string;
  answer: string;             // model answer (free-response) or explanation shown after grading
  type?: QuestionType;
  choices?: PracticeChoice[]; // multiple-choice only
  correctIndex?: number;      // multiple-choice & true-false (0 = True, 1 = False)
  numericAnswer?: string;     // numeric only — the expected value
  // Optional nudge auto-revealed after a couple of wrong tries. Absent means no hint UI.
  hint?: string;
}

// Lightweight, parameterized specs for the inline SVG diagrams rendered in the
// module workspace — no external images, so every visual is generated from a
// small set of numbers/labels a content author supplies per module.
export type GraphFamily = "linear" | "linear-inequality" | "linear-system" | "quadratic" | "cubic" | "exponential" | "log" | "rational" | "piecewise" | "trig";

export interface GraphPiece { m: number; b: number; from: number; to: number; fromOpen?: boolean; toOpen?: boolean }
export interface GraphMark { x: number; y: number; label?: string }

export interface GraphDiagram {
  kind: "graph";
  family: GraphFamily;
  m?: number; b?: number;                 // linear / linear-inequality
  op?: "<" | "<=" | ">" | ">=";           // linear-inequality shading direction
  m2?: number; b2?: number;                // linear-system second line
  a?: number; bq?: number; c?: number;     // quadratic y = a x^2 + bq x + c
  roots?: number[];                        // cubic zeros
  base?: number; base2?: number;           // exponential/log base(s)
  asymptoteX?: number;                     // rational vertical asymptote
  pieces?: GraphPiece[];                   // piecewise segments
  amplitude?: number; period?: number;     // trig
  domain?: [number, number];
  markPoints?: GraphMark[];
  caption?: string;
}

export interface NumberLineInterval { from: number; to: number; fromOpen?: boolean; toOpen?: boolean }
export interface NumberLineDiagram {
  kind: "number-line";
  min: number; max: number; step?: number;
  points?: { value: number; label?: string }[];
  intervals?: NumberLineInterval[];
  caption?: string;
}

export interface FactorTreeDiagram { kind: "factor-tree"; n: number; caption?: string }

export interface BarChartDiagram {
  kind: "bar-chart";
  data: number[];
  labels?: string[];
  highlightIndices?: number[];
  caption?: string;
}

export type ShapeKind = "triangle" | "right-triangle" | "similar-triangles" | "circle" | "rectangle" | "angle-pair" | "polygon";
export interface ShapeDiagram {
  kind: "shape";
  shape: ShapeKind;
  sides?: number[];
  sides2?: number[];
  labels?: string[];
  angleDeg?: number;
  sidesCount?: number;
  caption?: string;
}

export interface RatioBarDiagram {
  kind: "ratio-bar";
  parts: { value: number; color: string; label: string }[];
  caption?: string;
}

export interface BalanceScaleDiagram {
  kind: "balance-scale";
  leftLabel: string;
  rightLabel: string;
  caption?: string;
}

export interface StepSequenceDiagram {
  kind: "step-sequence";
  steps: string[];
  caption?: string;
}

export interface UnitCircleDiagram {
  kind: "unit-circle";
  angleDeg: number;
  caption?: string;
}

export type DiagramSpec =
  | GraphDiagram
  | NumberLineDiagram
  | FactorTreeDiagram
  | BarChartDiagram
  | ShapeDiagram
  | RatioBarDiagram
  | BalanceScaleDiagram
  | StepSequenceDiagram
  | UnitCircleDiagram;

export interface CurriculumModule {
  title: string;
  status: ModuleStatus;
  description?: string;
  content?: string[];
  // Shown to the student as a worked walkthrough, not graded — distinct from `exercises`.
  workedExample?: PracticeItem;
  exercises?: PracticeItem[];
  diagram?: DiagramSpec;
}

export interface CurriculumChapter {
  id: number;
  title: string;
  difficulty: Difficulty;
  modules: CurriculumModule[];
  // One test covering the whole chapter, taken after every module's exercises
  // are complete — rather than a separate test per module.
  test?: PracticeItem[];
}

export interface CurriculumCourse {
  id: number;
  name: string;
  grade: string;
  students: number;
  description?: string;
  chapters: CurriculumChapter[];
}

export interface Tutor {
  id: number;
  firstName: string;
  lastName: string;
  courses: string[];
  grades: number[];
  students: number;
  sessions: number;
  description: string;
}

export interface CourseDetail {
  course: string;
  score: number;
  sessions: number;
  lastSession: string;
  trend: TrendDirection;
}

export interface SessionArtifact {
  id: number;
  type: "notes" | "whiteboard";
  label: string;
  url: string;
}

export interface SessionRecord {
  course: string;
  tutorId: number;
  date: string;
  score: number;
  duration: number;
  artifacts?: SessionArtifact[];
}

export interface AIProject {
  id: number;
  title: string;
  course: string;
  module: string;
  student: string;
  difficulty: Difficulty;
  estimatedMins: number;
  status: ProjectStatus;
  generatedAt: string;
  aiNote: string;
  tasks: string[];
  assignedAt?: string;
  dueDate?: string;
  tutorNote?: string;
}

export interface HomeworkItem {
  id: number;
  studentId: number;
  title: string;
  course: string;
  assignedByTutorId: number;
  assignedAt: string;
  dueDate: string;
  status: "not-started" | "in-progress" | "submitted";
  completion: number;
}

// A single dated follow-up snapshot (e.g. the 6-month or 1-year check-in),
// kept so outcome changes can be tracked over time rather than overwritten.
export interface AlumniCheckIn {
  timeframe: string;
  date: string;
  outcome: AlumniOutcome;
  verification: VerificationSource;
  note?: string;
}

export interface AlumniRecord {
  id: number;
  studentId?: number;
  name: string;
  lastGrade: number;
  location: string;
  exitReason: ExitReason;
  exitYear: number;
  hsGraduated: boolean;
  outcome: AlumniOutcome;
  verification: VerificationSource;
  institution?: string;
  fieldOfStudy?: string;
  lastContact: string;
  followUpStatus: FollowUpStatus;
  assignedStaff: string;
  notes?: string;
  checkIns: AlumniCheckIn[];
  email?: string;
  phone?: string;
  linkedIn?: string;
  isSuccessStory?: boolean;
  testimonial?: string;
  openToMentoring?: boolean;
}

export type HelpRequestStatus = "open" | "resolved";

// A student-initiated "I'm stuck" flag from inside a module, auto-tagged with
// where they were — not a chat thread, a one-shot request a tutor can resolve.
export interface HelpRequest {
  id: number;
  studentId: number;
  studentName: string;
  course: string;
  chapterId: number;
  chapterTitle: string;
  moduleIndex: number;
  moduleTitle: string;
  note?: string;
  createdAt: string;
  status: HelpRequestStatus;
  resolvedAt?: string;
}

export interface AuthUser {
  role: Role;
  name: string;
  studentId?: number;
  tutorId?: number;
}

export interface ZoomModalProps {
  sessionId: number;
  meetingId: string;
  password: string;
  userName?: string;
  course?: string;
  onClose: () => void;
}