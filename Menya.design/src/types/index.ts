export type Role = "program" | "tutor" | "student";
export type StudentStatus = "exceeding" | "on-track" | "needs-support" | "at-risk";
export type ProjectStatus = "pending" | "approved" | "revision" | "rejected";
export type SessionStatus = "upcoming" | "in-progress" | "scheduled";
export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type TrendDirection = "up" | "flat" | "down";

export interface Student {
  id: number;
  name: string;
  grade: number;
  subjects: string[];
  progress: number;
  sessions: number;
  streak: number;
  status: StudentStatus;
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

export interface CurriculumItem {
  id: number;
  title: string;
  subject: string;
  grade: string;
  difficulty: Difficulty;
  modules: number;
  students: number;
  completion: number;
}

export interface Tutor {
  id: number;
  firstName: string;
  lastName: string;
  subjects: string[];
  students: number;
  sessions: number;
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

export interface AuthUser {
  role: Role;
  name: string;
  studentId?: number;
}

export interface ZoomIFrameProps {
  meetingId: string;
  password: string;
  userName?: string;
}

export interface ZoomModalProps {
  meetingId: string;
  password: string;
  userName?: string;
  onClose: () => void;
}