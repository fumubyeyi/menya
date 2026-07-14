import {
  Sigma, Variable, Divide, Compass, BarChart3, FunctionSquare, Infinity, BookOpen,
  CheckCircle2, AlertTriangle, XCircle, Flame, Trophy, Target, Star, BookMarked,
  GraduationCap, Briefcase, Shield, Clock, HelpCircle, BadgeCheck, MessageCircleMore,
} from "lucide-react";
import type { StudentStatus, Difficulty, ProjectStatus, CurriculumChapter, CurriculumModule, AlumniOutcome, FollowUpStatus, ExitReason, VerificationSource, PracticeItem, DiagramSpec } from "../types";
import { curriculum } from "../data";

// Math courses only, matching the Program > Curriculum library. Each gets a distinct color/icon.
export const courseColor: Record<string, string> = {
  Algebra: "#1B5E4F", "Algebra II": "#059669", "Pre-Alg": "#F59E0B",
  Geometry: "#3B82F6", Statistics: "#EC4899", "Pre-Calculus": "#8B5CF6", Calculus: "#6366F1",
};

export const courseIcon: Record<string, React.ReactNode> = {
  Algebra: <Sigma className="w-4 h-4" />, "Algebra II": <Variable className="w-4 h-4" />, "Pre-Alg": <Divide className="w-4 h-4" />,
  Geometry: <Compass className="w-4 h-4" />, Statistics: <BarChart3 className="w-4 h-4" />,
  "Pre-Calculus": <FunctionSquare className="w-4 h-4" />, Calculus: <Infinity className="w-4 h-4" />,
};

export function getCourseIcon(course: string) {
  return courseIcon[course] ?? <BookOpen className="w-4 h-4" />;
}

// A chapter's single next action: resume the in-progress module, start the next
// not-started one, or nothing left to do. moduleIndex points into chapter.modules
// so callers can link straight into that module's workspace.
export function chapterAction(chapter: CurriculumChapter): { label: "Resume" | "Start" | "Completed"; moduleTitle?: string; moduleIndex?: number } {
  const inProgressIndex = chapter.modules.findIndex((m) => m.status === "in-progress");
  if (inProgressIndex !== -1) return { label: "Resume", moduleTitle: chapter.modules[inProgressIndex].title, moduleIndex: inProgressIndex };
  const notStartedIndex = chapter.modules.findIndex((m) => m.status === "not-started");
  if (notStartedIndex !== -1) return { label: "Start", moduleTitle: chapter.modules[notStartedIndex].title, moduleIndex: notStartedIndex };
  return { label: "Completed" };
}

// Percentage of a course's modules (across every chapter) marked completed.
export function courseCompletion(course: string): number {
  const modules = curriculum.find((c) => c.name === course)?.chapters.flatMap((ch) => ch.modules) ?? [];
  if (modules.length === 0) return 0;
  return Math.round((modules.filter((m) => m.status === "completed").length / modules.length) * 100);
}

export interface ModuleWorkspaceContent {
  description: string;
  content: string[];
  exercises: PracticeItem[];
  diagram?: DiagramSpec;
}

// Returns a module's authored workspace content, or generates a reasonable
// fallback from its title/chapter/course when none has been written yet.
export function getModuleContent(module: CurriculumModule, chapterTitle: string, course: string): ModuleWorkspaceContent {
  const topic = module.title;
  return {
    diagram: module.diagram,
    description: module.description ?? `Build a solid understanding of ${topic.toLowerCase()}, part of ${chapterTitle} in ${course}.`,
    content: module.content ?? [
      `${topic} is one of the key ideas in ${chapterTitle}. Review the explanation your tutor covered in session, and use the notes area below to jot down anything that isn't clicking yet.`,
      `Once the idea feels clear, move on to the exercises to practice it, then check your understanding with the chapter test once every module is done.`,
    ],
    exercises: module.exercises ?? [
      { prompt: `Restate ${topic.toLowerCase()} in your own words.`, answer: `A clear explanation of ${topic.toLowerCase()} that captures the key idea from the Content section above — compare yours against it.` },
      { prompt: `Work through a few practice problems on ${topic.toLowerCase()}.`, answer: `Check your steps against the approach described in the Content section for ${topic.toLowerCase()}.` },
      { prompt: `Bring one question about ${topic.toLowerCase()} to your next session.`, answer: `Any genuine question works — the goal is naming what's still unclear about ${topic.toLowerCase()}.` },
    ],
  };
}

// Returns a chapter's single end-of-chapter test, or generates a reasonable
// fallback (one question per module) when none has been authored yet.
export function getChapterTest(chapter: CurriculumChapter): PracticeItem[] {
  return chapter.test ?? chapter.modules.map((m) => ({
    prompt: `Solve a problem that applies ${m.title.toLowerCase()}.`,
    answer: `Check your solution against the approach described in ${m.title}'s Content section.`,
  }));
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

export const alumniOutcomeMeta: Record<AlumniOutcome, { label: string; cls: string; Icon: React.ElementType; isStem: boolean }> = {
  "stem-college":     { label: "STEM Major",     cls: "text-emerald-700 bg-emerald-50", Icon: GraduationCap, isStem: true  },
  "non-stem-college": { label: "Non-STEM Major", cls: "text-blue-700 bg-blue-50",       Icon: GraduationCap, isStem: false },
  "stem-career":      { label: "STEM Career",    cls: "text-emerald-700 bg-emerald-50", Icon: Briefcase,     isStem: true  },
  "non-stem-career":  { label: "Non-STEM Career",cls: "text-blue-700 bg-blue-50",       Icon: Briefcase,     isStem: false },
  military:           { label: "Military",       cls: "text-purple-700 bg-purple-50",   Icon: Shield,        isStem: false },
  "gap-year":         { label: "Gap Year",       cls: "text-amber-700 bg-amber-50",     Icon: Clock,         isStem: false },
  unknown:            { label: "Unknown",        cls: "text-gray-600 bg-gray-100",      Icon: HelpCircle,    isStem: false },
};

export const followUpStatusMeta: Record<FollowUpStatus, { label: string; cls: string; Icon: React.ElementType }> = {
  "up-to-date": { label: "Up to Date", cls: "text-emerald-700 bg-emerald-50", Icon: CheckCircle2  },
  "due-soon":   { label: "Due Soon",   cls: "text-amber-700 bg-amber-50",     Icon: Clock         },
  overdue:      { label: "Overdue",    cls: "text-red-700 bg-red-50",         Icon: AlertTriangle },
};

export const exitReasonMeta: Record<ExitReason, { label: string; cls: string }> = {
  graduated:      { label: "Completed Program", cls: "text-emerald-700 bg-emerald-50" },
  "left-program": { label: "Left Program",      cls: "text-amber-700 bg-amber-50"     },
};

export const verificationMeta: Record<VerificationSource, { label: string; cls: string; Icon: React.ElementType }> = {
  verified:        { label: "Verified",       cls: "text-emerald-700 bg-emerald-50", Icon: BadgeCheck        },
  "self-reported": { label: "Self-Reported",  cls: "text-gray-600 bg-gray-100",      Icon: MessageCircleMore },
};

export const achievements = [
  { id: "streak-5",    label: "5-Day Streak",     Icon: Flame,        color: "#F59E0B", condition: (s: { streak: number; progress: number; sessions: number }) => s.streak >= 5   },
  { id: "streak-7",    label: "Week Warrior",      Icon: Trophy,       color: "#F0981E", condition: (s: { streak: number; progress: number; sessions: number }) => s.streak >= 7   },
  { id: "score-80",    label: "80+ Score",         Icon: Target,       color: "#1B5E4F", condition: (s: { streak: number; progress: number; sessions: number }) => s.progress >= 80},
  { id: "score-90",    label: "Top Performer",     Icon: Star,         color: "#059669", condition: (s: { streak: number; progress: number; sessions: number }) => s.progress >= 90},
  { id: "sessions-10", label: "10 Sessions",       Icon: CheckCircle2, color: "#3B82F6", condition: (s: { streak: number; progress: number; sessions: number }) => s.sessions >= 10},
  { id: "sessions-15", label: "Dedicated Learner", Icon: BookMarked,   color: "#8B5CF6", condition: (s: { streak: number; progress: number; sessions: number }) => s.sessions >= 15},
];
