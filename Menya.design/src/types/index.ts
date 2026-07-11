export type Role = "program" | "tutor" | "student";
export type StudentStatus = "exceeding" | "on-track" | "needs-support" | "at-risk";
export type ProjectStatus = "pending" | "approved" | "revision" | "rejected";
export type SessionStatus = "upcoming" | "in-progress" | "scheduled";
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
  subjects: string[];
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
  subject: string;
  time: string;
  clock: string;
  duration: number;
  status: SessionStatus;
  meetingId?: string;
  password?: string;
}

export type ModuleStatus = "not-started" | "in-progress" | "completed";

export interface CurriculumModule {
  title: string;
  status: ModuleStatus;
  description?: string;
  content?: string[];
  exercises?: string[];
  test?: string[];
}

export interface CurriculumChapter {
  id: number;
  title: string;
  difficulty: Difficulty;
  modules: CurriculumModule[];
}

export interface CurriculumCourse {
  id: number;
  subject: string;
  grade: string;
  students: number;
  chapters: CurriculumChapter[];
}

export interface Tutor {
  id: number;
  firstName: string;
  lastName: string;
  subjects: string[];
  students: number;
  sessions: number;
  description: string;
}

export interface SubjectDetail {
  subject: string;
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
  subject: string;
  tutorId: number;
  date: string;
  score: number;
  duration: number;
  artifacts?: SessionArtifact[];
}

export interface AIProject {
  id: number;
  title: string;
  subject: string;
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
  subject: string;
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
}

export interface AuthUser {
  role: Role;
  name: string;
  studentId?: number;
}

export interface ZoomModalProps {
  sessionId: number;
  meetingId: string;
  password: string;
  userName?: string;
  subject?: string;
  onClose: () => void;
}