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
  updateSessions: (sessions: Session[]) => void;
  removeSession: (id: number) => void;
  removeSessions: (ids: number[]) => void;
}

const SessionsContext = createContext<SessionsContextValue | null>(null);

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Session[]>(readSessions);

  const addSession = (session: Omit<Session, "id">) => addSessions([session]);

  // Bulk insert, and every mutator below, uses the *functional* setRecords(prev => ...)
  // form rather than closing over `records` directly. That matters not just for a loop
  // of same-function calls (e.g. publishing a week's worth of sessions) but for a
  // handler that calls two *different* mutators back to back (e.g. an edit that both
  // updates kept sessions and adds new ones) — with a closed-over `records`, the second
  // call would compute its result from the pre-handler snapshot and silently discard
  // the first call's change when React applies the batch. The functional form always
  // composes against the true latest state, in order, regardless of caller.
  const addSessions = (newSessions: Omit<Session, "id">[]) => {
    setRecords((prev) => {
      let nextId = prev.length ? Math.max(...prev.map((s) => s.id)) + 1 : 1;
      const additions = newSessions.map((session) => ({ ...session, id: nextId++ }));
      const next = [...prev, ...additions];
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateSession = (updated: Session) => updateSessions([updated]);

  const updateSessions = (updated: Session[]) => {
    setRecords((prev) => {
      const byId = new Map(updated.map((s) => [s.id, s]));
      const next = prev.map((s) => byId.get(s.id) ?? s);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeSession = (id: number) => removeSessions([id]);

  const removeSessions = (ids: number[]) => {
    setRecords((prev) => {
      const idSet = new Set(ids);
      const next = prev.filter((s) => !idSet.has(s.id));
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <SessionsContext.Provider value={{ sessions: records, addSession, addSessions, updateSession, updateSessions, removeSession, removeSessions }}>
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error("useSessions must be used inside SessionsProvider");
  return ctx;
}
