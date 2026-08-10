import { createContext, useContext, useState, type ReactNode } from "react";
import { attendanceSessions } from "../data";
import type { AttendanceSession } from "../types";

const ATTENDANCE_KEY = "menya:attendance";

// Same Context+localStorage pattern as SessionsContext/TutorsContext — see
// SessionsContext.tsx for why this needs to be a context rather than a plain hook.
function readAttendance(): AttendanceSession[] {
  try {
    const saved = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length > 0 && Array.isArray(saved[0]?.entries)) return saved;
  } catch {
    // fall through to seed data
  }
  return attendanceSessions;
}

interface AttendanceContextValue {
  attendanceSessions: AttendanceSession[];
  addAttendanceSession: (session: Omit<AttendanceSession, "id" | "createdAt">) => void;
}

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<AttendanceSession[]>(readAttendance);

  const addAttendanceSession = (session: Omit<AttendanceSession, "id" | "createdAt">) => {
    const nextId = records.length ? Math.max(...records.map((s) => s.id)) + 1 : 1;
    const next = [...records, { ...session, id: nextId, createdAt: new Date().toISOString() }];
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(next));
    setRecords(next);
  };

  return (
    <AttendanceContext.Provider value={{ attendanceSessions: records, addAttendanceSession }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendance must be used inside AttendanceProvider");
  return ctx;
}
