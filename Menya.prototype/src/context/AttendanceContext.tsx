import { createContext, useContext, useState, type ReactNode } from "react";
import { attendanceSessions, students, studentsForAttendanceScope, CURRENT_TUTOR_ID } from "../data";
import { GRADE_GROUPS } from "../lib/constants";
import type { AttendanceSession, AttendanceEntry } from "../types";

const ATTENDANCE_KEY = "menya:attendance";
const DEMO_GRADE_BAND = GRADE_GROUPS[GRADE_GROUPS.length - 1];
// Reserved negative ids for the two synthetic records below — Math.max(...) in
// addAttendanceSession ignores them, so real roll calls keep incrementing from
// the highest positive seed id instead of jumping past these.
const DEMO_TUESDAY_ID = -1;
const DEMO_THURSDAY_ID = -2;

// Most recent past-or-today occurrence of `target` (0=Sun..6=Sat) as a local
// YYYY-MM-DD — recomputed on every load so the demo Tue/Thu records below never
// go stale the way a fixed date would (same idea as RecurringSlotsContext's
// demoSlotForToday).
function mostRecentWeekdayISO(target: number): string {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() - target + 7) % 7));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// The seed data's real attendance records only ever land on Mon/Wed and predate
// "this week" — so anything filtering for Tue/Thu attendance (e.g. the Program
// Dashboard) would always read zero. These two synthetic roll calls give it real
// numbers to show, dated to whatever the most recent actual Tuesday/Thursday is.
function demoWeekdayAttendance(): AttendanceSession[] {
  const roster = studentsForAttendanceScope(students, "grade", DEMO_GRADE_BAND.join(","));
  const entriesFor = (oneAbsent: boolean): AttendanceEntry[] =>
    roster.map((s, i) => ({ studentId: s.id, status: oneAbsent && i === roster.length - 1 ? "absent" : "present" }));
  const base = { tutorId: CURRENT_TUTOR_ID, scope: "grade" as const, grades: DEMO_GRADE_BAND, createdAt: new Date().toISOString() };
  return [
    { ...base, id: DEMO_TUESDAY_ID, date: mostRecentWeekdayISO(2), entries: entriesFor(false) },
    { ...base, id: DEMO_THURSDAY_ID, date: mostRecentWeekdayISO(4), entries: entriesFor(true) },
  ];
}

// Same Context+localStorage pattern as SessionsContext/TutorsContext — see
// SessionsContext.tsx for why this needs to be a context rather than a plain hook,
// and why every mutator below uses the functional setRecords(prev => ...) form.
function readAttendance(): AttendanceSession[] {
  try {
    const saved = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length > 0 && Array.isArray(saved[0]?.entries)) {
      const seedById = new Map(attendanceSessions.map((s) => [s.id, s]));
      // Backfill any seed roll calls added after this browser's localStorage was
      // first populated (same pattern as SessionsContext), AND upgrade any existing
      // id whose seed version has since gained a sessionId link (ids 2/4/6, linked to
      // the new in-person Session history) — a saved record predating that link is
      // stale in a way "missing id" alone can't fix, since the id already exists.
      const upgraded = saved.map((s: AttendanceSession) => {
        const seed = seedById.get(s.id);
        return seed && seed.sessionId !== undefined && s.sessionId === undefined ? seed : s;
      });
      const savedIds = new Set(saved.map((s: AttendanceSession) => s.id));
      const missingSeed = attendanceSessions.filter((s) => !savedIds.has(s.id));
      // Drop any previously-saved copy of the demo Tue/Thu records before
      // re-adding fresh ones — their dates need to track the real calendar,
      // not whatever they were the last time this browser saved state.
      const withoutStaleDemo = [...upgraded, ...missingSeed].filter((s) => s.id !== DEMO_TUESDAY_ID && s.id !== DEMO_THURSDAY_ID);
      return [...withoutStaleDemo, ...demoWeekdayAttendance()];
    }
  } catch {
    // fall through to seed data
  }
  return [...attendanceSessions, ...demoWeekdayAttendance()];
}

interface AttendanceContextValue {
  attendanceSessions: AttendanceSession[];
  addAttendanceSession: (session: Omit<AttendanceSession, "id" | "createdAt">) => void;
  updateAttendanceSession: (session: AttendanceSession) => void;
}

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<AttendanceSession[]>(readAttendance);

  const addAttendanceSession = (session: Omit<AttendanceSession, "id" | "createdAt">) => {
    setRecords((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((s) => s.id)) + 1 : 1;
      const next = [...prev, { ...session, id: nextId, createdAt: new Date().toISOString() }];
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateAttendanceSession = (updated: AttendanceSession) => {
    setRecords((prev) => {
      const next = prev.map((s) => (s.id === updated.id ? updated : s));
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AttendanceContext.Provider value={{ attendanceSessions: records, addAttendanceSession, updateAttendanceSession }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendance must be used inside AttendanceProvider");
  return ctx;
}
