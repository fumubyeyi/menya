import {
  Sigma, Variable, Divide, Compass, BarChart3, FunctionSquare, Infinity, BookOpen,
  CheckCircle2, AlertTriangle, XCircle, Flame, Trophy, Target, Star, BookMarked,
  GraduationCap, Briefcase, Shield, Clock, HelpCircle, BadgeCheck, MessageCircleMore,
} from "lucide-react";
import type { StudentStatus, Difficulty, ProjectStatus, CurriculumCourse, CurriculumChapter, CurriculumModule, AlumniOutcome, FollowUpStatus, ExitReason, VerificationSource, PracticeItem, DiagramSpec } from "../types";

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
export function courseCompletion(courses: CurriculumCourse[], course: string): number {
  const modules = courses.find((c) => c.name === course)?.chapters.flatMap((ch) => ch.modules) ?? [];
  if (modules.length === 0) return 0;
  return Math.round((modules.filter((m) => m.status === "completed").length / modules.length) * 100);
}

export interface ModuleWorkspaceContent {
  description: string;
  content: string[];
  workedExample?: PracticeItem;
  exercises: PracticeItem[];
  diagram?: DiagramSpec;
  // False when the module hasn't been authored yet — the workspace should
  // flag this to the student rather than presenting fallback text as if it
  // were real content.
  isAuthored: boolean;
}

// A module counts as authored once it has real content and at least one
// exercise — anything less falls back to the "not yet available" state.
// Shared by the student-facing workspace and the staff-facing completeness
// badges so both agree on what "done" means.
export function isModuleAuthored(module: CurriculumModule): boolean {
  return !!module.content?.length && !!module.exercises?.length;
}

export function isChapterTestAuthored(chapter: CurriculumChapter): boolean {
  return !!chapter.test?.length;
}

// Returns a module's authored workspace content. Curriculum is meant to
// support fully self-directed learning, so when a module hasn't been
// authored yet this does NOT fabricate placeholder content — it reports
// `isAuthored: false` and lets the workspace show an honest "not available"
// state instead of text that assumes a tutor will fill the gap live.
export function getModuleContent(module: CurriculumModule, chapterTitle: string, course: string): ModuleWorkspaceContent {
  return {
    diagram: module.diagram,
    description: module.description ?? `Build a solid understanding of ${module.title.toLowerCase()}, part of ${chapterTitle} in ${course}.`,
    content: module.content ?? ["Content not yet available for this module."],
    workedExample: module.workedExample,
    exercises: module.exercises ?? [],
    isAuthored: isModuleAuthored(module),
  };
}

// Returns a chapter's single end-of-chapter test. When none has been
// authored yet, returns an empty question list rather than fabricating one.
export function getChapterTest(chapter: CurriculumChapter): { questions: PracticeItem[]; isAuthored: boolean } {
  return { questions: chapter.test ?? [], isAuthored: isChapterTestAuthored(chapter) };
}

// Total count of unauthored modules + unauthored chapter test (0 or 1) in a chapter.
export function chapterContentGaps(chapter: CurriculumChapter): number {
  return chapter.modules.filter((m) => !isModuleAuthored(m)).length + (isChapterTestAuthored(chapter) ? 0 : 1);
}

export function courseContentGaps(course: CurriculumCourse): number {
  return course.chapters.reduce((sum, ch) => sum + chapterContentGaps(ch), 0);
}

// Grades a numeric-entry answer: compares as numbers when both sides parse
// (so "5" matches "5.0"), otherwise falls back to a case-insensitive string
// match (so answers like "1/2" or "x = 5" still work).
export function isNumericAnswerCorrect(input: string, expected: string): boolean {
  const a = input.trim(), b = expected.trim();
  const na = parseFloat(a), nb = parseFloat(b);
  if (!isNaN(na) && !isNaN(nb)) return Math.abs(na - nb) < 1e-9;
  return a.toLowerCase() === b.toLowerCase();
}

// Converts a <input type="date">/<input type="time"> pair into the display
// strings the rest of the app already uses for sessions ("Today"/"Tomorrow"/
// "Jun 22" and "3:30 PM"), so a newly-scheduled session renders identically
// to the seeded mock ones.
export function formatSessionTime(dateStr: string, timeStr: string): { time: string; clock: string } {
  const target = new Date(`${dateStr}T${timeStr}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const targetDay = new Date(target);
  targetDay.setHours(0, 0, 0, 0);

  const time =
    targetDay.getTime() === today.getTime() ? "Today" :
    targetDay.getTime() === tomorrow.getTime() ? "Tomorrow" :
    target.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const clock = target.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return { time, clock };
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
