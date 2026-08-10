import { createContext, useContext, useState, type ReactNode } from "react";
import { sessions } from "../data";
import type { Session } from "../types";

const SESSIONS_KEY = "menya:sessions";

// Same client-side-state-with-persistence pattern as CurriculumContext/AlumniContext
// — see CurriculumContext.tsx for why this needs to be a context rather than a
// plain hook (multiple independent views all need to see newly-scheduled sessions).
function readSessions(): Session[] {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length > 0 && typeof saved[0]?.student === "string") return saved;
  } catch {
    // fall through to seed data
  }
  return sessions;
}

interface SessionsContextValue {
  sessions: Session[];
  addSession: (session: Omit<Session, "id">) => void;
  addSessions: (sessions: Omit<Session, "id">[]) => void;
  updateSession: (session: Session) => void;
}

const SessionsContext = createContext<SessionsContextValue | null>(null);

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Session[]>(readSessions);

  const addSession = (session: Omit<Session, "id">) => addSessions([session]);

  // Bulk insert — assigns every id off one snapshot of `records` and commits with a
  // single setRecords call, so a loop of individual addSession calls (each reading
  // the same stale `records` closure before a re-render lands) can't silently drop
  // all but the last one, which matters for a "publish a week's worth" flow.
  const addSessions = (newSessions: Omit<Session, "id">[]) => {
    let nextId = records.length ? Math.max(...records.map((s) => s.id)) + 1 : 1;
    const additions = newSessions.map((session) => ({ ...session, id: nextId++ }));
    const next = [...records, ...additions];
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
    setRecords(next);
  };

  const updateSession = (updated: Session) => {
    const next = records.map((s) => (s.id === updated.id ? updated : s));
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
    setRecords(next);
  };

  return (
    <SessionsContext.Provider value={{ sessions: records, addSession, addSessions, updateSession }}>
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error("useSessions must be used inside SessionsProvider");
  return ctx;
}
