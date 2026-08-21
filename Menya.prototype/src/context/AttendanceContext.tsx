import { createContext, useContext, useState, type ReactNode } from "react";
import { attendanceSessions } from "../data";
import type { AttendanceSession } from "../types";

const ATTENDANCE_KEY = "menya:attendance";

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
      return [...upgraded, ...missingSeed];
    }
  } catch {
    // fall through to seed data
  }
  return attendanceSessions;
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
