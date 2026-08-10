import { createContext, useContext, useState, type ReactNode } from "react";
import type { ScheduleNotice } from "../types";

const NOTICES_KEY = "menya:schedule-notices";

// Same Context+localStorage pattern as AttendanceContext/SessionsContext — see
// SessionsContext.tsx for why this needs to be a context rather than a plain hook.
function readNotices(): ScheduleNotice[] {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTICES_KEY) ?? "null");
    if (Array.isArray(saved)) return saved;
  } catch {
    // fall through to empty
  }
  return [];
}

interface ScheduleNoticesContextValue {
  scheduleNotices: ScheduleNotice[];
  addScheduleNotices: (notices: Omit<ScheduleNotice, "id" | "createdAt" | "seen">[]) => void;
  markScheduleNoticeSeen: (id: number) => void;
}

const ScheduleNoticesContext = createContext<ScheduleNoticesContextValue | null>(null);

export function ScheduleNoticesProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<ScheduleNotice[]>(readNotices);

  // Bulk insert — see SessionsContext.addSessions for why this can't just be a loop
  // of single-notice inserts (one notice per affected tutor, published at once).
  const addScheduleNotices = (newNotices: Omit<ScheduleNotice, "id" | "createdAt" | "seen">[]) => {
    let nextId = notices.length ? Math.max(...notices.map((n) => n.id)) + 1 : 1;
    const createdAt = new Date().toISOString();
    const additions = newNotices.map((notice) => ({ ...notice, id: nextId++, createdAt, seen: false }));
    const next = [...notices, ...additions];
    localStorage.setItem(NOTICES_KEY, JSON.stringify(next));
    setNotices(next);
  };

  const markScheduleNoticeSeen = (id: number) => {
    const next = notices.map((n) => (n.id === id ? { ...n, seen: true } : n));
    localStorage.setItem(NOTICES_KEY, JSON.stringify(next));
    setNotices(next);
  };

  return (
    <ScheduleNoticesContext.Provider value={{ scheduleNotices: notices, addScheduleNotices, markScheduleNoticeSeen }}>
      {children}
    </ScheduleNoticesContext.Provider>
  );
}

export function useScheduleNotices() {
  const ctx = useContext(ScheduleNoticesContext);
  if (!ctx) throw new Error("useScheduleNotices must be used inside ScheduleNoticesProvider");
  return ctx;
}
