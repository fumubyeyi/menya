import {
  Sigma, Atom, FlaskConical, Calculator, Globe, BarChart3, BookOpen,
  CheckCircle2, AlertTriangle, XCircle, Flame, Trophy, Target, Star, BookMarked,
} from "lucide-react";
import type { StudentStatus, Difficulty, ProjectStatus } from "../types";

export const subjectColor: Record<string, string> = {
  Algebra: "#1B5E4F", "Algebra II": "#1B5E4F", "Pre-Alg": "#1B5E4F",
  Biology: "#059669", Chemistry: "#3B82F6", Physics: "#8B5CF6",
  "Earth Science": "#0EA5E9", Statistics: "#F59E0B",
  Geometry: "#1B5E4F", Calculus: "#6366F1", "Pre-Calculus": "#8B5CF6",
};

export const subjectIcon: Record<string, React.ReactNode> = {
  Algebra: <Sigma className="w-4 h-4" />, "Algebra II": <Sigma className="w-4 h-4" />, "Pre-Alg": <Sigma className="w-4 h-4" />,
  Biology: <Atom className="w-4 h-4" />, Chemistry: <FlaskConical className="w-4 h-4" />, Physics: <Atom className="w-4 h-4" />,
  "Earth Science": <Globe className="w-4 h-4" />, Statistics: <BarChart3 className="w-4 h-4" />,
  Geometry: <Calculator className="w-4 h-4" />, Calculus: <Sigma className="w-4 h-4" />, "Pre-Calculus": <Sigma className="w-4 h-4" />,
};

export function getSubjectIcon(subject: string) {
  return subjectIcon[subject] ?? <BookOpen className="w-4 h-4" />;
}

export const statusMeta: Record<StudentStatus, { label: string; cls: string; Icon: React.ElementType }> = {
  exceeding:      { label: "Exceeding",     cls: "text-emerald-700 bg-emerald-50", Icon: CheckCircle2  },
  "on-track":     { label: "On Track",      cls: "text-blue-700 bg-blue-50",       Icon: CheckCircle2  },
  "needs-support":{ label: "Needs Support", cls: "text-amber-700 bg-amber-50",     Icon: AlertTriangle },
  "at-risk":      { label: "At Risk",       cls: "text-red-700 bg-red-50",         Icon: XCircle       },
};

export const diffCls: Record<Difficulty, string> = {
  Beginner:     "text-emerald-700 bg-emerald-50",
  Intermediate: "text-amber-700 bg-amber-50",
  Advanced:     "text-red-700 bg-red-50",
};

export const projectStatusCls: Record<ProjectStatus, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  revision: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  pending:  "Pending Review",
  approved: "Approved",
  revision: "Needs Revision",
  rejected: "Rejected",
};

export const achievements = [
  { id: "streak-5",    label: "5-Day Streak",     Icon: Flame,        color: "#F59E0B", condition: (s: { streak: number; progress: number; sessions: number }) => s.streak >= 5   },
  { id: "streak-7",    label: "Week Warrior",      Icon: Trophy,       color: "#F0981E", condition: (s: { streak: number; progress: number; sessions: number }) => s.streak >= 7   },
  { id: "score-80",    label: "80+ Score",         Icon: Target,       color: "#1B5E4F", condition: (s: { streak: number; progress: number; sessions: number }) => s.progress >= 80},
  { id: "score-90",    label: "Top Performer",     Icon: Star,         color: "#059669", condition: (s: { streak: number; progress: number; sessions: number }) => s.progress >= 90},
  { id: "sessions-10", label: "10 Sessions",       Icon: CheckCircle2, color: "#3B82F6", condition: (s: { streak: number; progress: number; sessions: number }) => s.sessions >= 10},
  { id: "sessions-15", label: "Dedicated Learner", Icon: BookMarked,   color: "#8B5CF6", condition: (s: { streak: number; progress: number; sessions: number }) => s.sessions >= 15},
];
