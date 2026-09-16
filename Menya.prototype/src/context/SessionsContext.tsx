import { createContext, useContext, useState, type ReactNode } from "react";
import { sessions, CURRENT_TUTOR_ID } from "../data";
import { GRADE_GROUPS, sessionFieldsForSlot, localISODate } from "../lib/constants";
import type { Session } from "../types";

const SESSIONS_KEY = "menya:sessions";
const DEMO_SESSION_TIME = "18:00";
// One demo session per grade band, each with a tutor whose seed `grades` actually
// cover it — so the front desk kiosk always has a few different tutors to check in
// as, not just the one default tutor login. [10,11,12] keeps CURRENT_TUTOR_ID
// (Francoise) so she still matches RecurringSlotsContext's own demoSlotForToday.
const DEMO_TUTOR_BY_BAND: Record<string, number> = {
  "6,7": 1,         // Jennifer Chen
  "8,9": 4,         // Andrew Kim
  "10,11,12": CURRENT_TUTOR_ID, // Francoise Umubyeyi
};
// Reserved negative ids for the demo rows above — Math.max(...) in addSessions
// ignores them, so real sessions keep incrementing from the highest positive seed
// id instead of jumping past them (same convention as AttendanceContext's demo rows).
const DEMO_SESSION_IDS = GRADE_GROUPS.map((_, i) => -(i + 1));

function demoTodaySessions(): Session[] {
  const today = localISODate();
  return GRADE_GROUPS.map((grades, i) => ({
    id: DEMO_SESSION_IDS[i],
    ...sessionFieldsForSlot({ grades, time: DEMO_SESSION_TIME }, DEMO_TUTOR_BY_BAND[grades.join(",")] ?? CURRENT_TUTOR_ID, today),
  }));
}

// Same client-side-state-with-persistence pattern as CurriculumContext/AlumniContext
// — see CurriculumContext.tsx for why this needs to be a context rather than a
// plain hook (multiple independent views all need to see newly-scheduled sessions).
function readSessions(): Session[] {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length > 0 && typeof saved[0]?.student === "string") {
      // Backfill any seed sessions added after this browser's localStorage was first
      // populated (e.g. the in-person history rows) — saved data always wins for ids
      // it already has, so nothing a user has since edited or removed gets clobbered.
      const savedIds = new Set(saved.map((s: Session) => s.id));
      const missingSeed = sessions.filter((s) => !savedIds.has(s.id));
      // Drop any previously-saved copy of the demo rows before re-adding fresh ones —
      // their dates need to track the real calendar, not whatever day it was the last
      // time this browser saved state.
      const withoutStaleDemo = [...saved, ...missingSeed].filter((s: Session) => !DEMO_SESSION_IDS.includes(s.id));
      return [...withoutStaleDemo, ...demoTodaySessions()];
    }
  } catch {
    // fall through to seed data
  }
  return [...sessions, ...demoTodaySessions()];
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
