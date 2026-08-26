import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { sofia } from "../data";

type ActivitySource = "study" | "session";
interface ActivityEntry { date: string; source: ActivitySource }

const activityKey = (studentId: number) => `menya:activity:${studentId}`;

// A "day" for streak/goal purposes is the student's local calendar day, not
// UTC — toISOString() would flip the date bucket hours early/late depending
// on the student's timezone (e.g. mid-evening for anyone west of UTC).
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const todayStr = () => localDateStr(new Date());

function readActivity(studentId: number): ActivityEntry[] {
  try {
    const saved = JSON.parse(localStorage.getItem(activityKey(studentId)) ?? "null");
    if (Array.isArray(saved) && saved.every((e) => typeof e?.date === "string" && typeof e?.source === "string")) return saved;
  } catch { /* fall through to default */ }
  return [];
}

// Every day in the last 7 (including today), Monday-agnostic — used for a
// goal's "this week" progress rather than a calendar week, so progress never
// resets mid-week and always reflects a rolling 7-day commitment.
function last7Days(): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(localDateStr(d));
  }
  return days;
}

// Walk backward from today counting consecutive days with any activity —
// the single live replacement for the old static sofia.streak.
function computeStreak(entries: ActivityEntry[]): number {
  const daysWithActivity = new Set(entries.map((e) => e.date));
  let streak = 0;
  const cursor = new Date();
  while (daysWithActivity.has(localDateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

interface StudentActivityContextValue {
  logStudy: () => void;
  logSessionAttended: () => void;
  streak: number;
  studyDaysThisWeek: number;
  sessionsThisWeek: number;
  sessionsAttendedTotal: number;
}

const StudentActivityContext = createContext<StudentActivityContextValue | null>(null);

// Client-side activity log (no backend) recording the days a student actually
// studied (ModuleWorkspace practice/test interaction) or attended a scheduled
// session (Zoom "Leave") — the real signal goals/streak/achievements are
// computed from, replacing the old static sofia.streak/sessions fields.
// A context (not a plain hook, unlike useEnrollment) because it has several
// simultaneously-mounted consumers — AppShell's persistent sidebar plus
// whichever page is active — that all need to see the same live log, the
// same reasoning as CurriculumContext/SessionsContext.
export function StudentActivityProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ActivityEntry[]>(() => readActivity(sofia.id));

  const log = useCallback((source: ActivitySource) => {
    setEntries((prev) => {
      const today = todayStr();
      if (prev.some((e) => e.date === today && e.source === source)) return prev;
      const next = [...prev, { date: today, source }];
      localStorage.setItem(activityKey(sofia.id), JSON.stringify(next));
      return next;
    });
  }, []);

  const logStudy = useCallback(() => log("study"), [log]);
  const logSessionAttended = useCallback(() => log("session"), [log]);

  const streak = useMemo(() => computeStreak(entries), [entries]);
  const studyDaysThisWeek = useMemo(() => {
    const week = new Set(last7Days());
    return new Set(entries.filter((e) => e.source === "study" && week.has(e.date)).map((e) => e.date)).size;
  }, [entries]);
  const sessionsThisWeek = useMemo(() => {
    const week = new Set(last7Days());
    return entries.filter((e) => e.source === "session" && week.has(e.date)).length;
  }, [entries]);
  const sessionsAttendedTotal = useMemo(() => entries.filter((e) => e.source === "session").length, [entries]);

  return (
    <StudentActivityContext.Provider value={{ logStudy, logSessionAttended, streak, studyDaysThisWeek, sessionsThisWeek, sessionsAttendedTotal }}>
      {children}
    </StudentActivityContext.Provider>
  );
}

export function useStudentActivity() {
  const ctx = useContext(StudentActivityContext);
  if (!ctx) throw new Error("useStudentActivity must be used inside StudentActivityProvider");
  return ctx;
}
