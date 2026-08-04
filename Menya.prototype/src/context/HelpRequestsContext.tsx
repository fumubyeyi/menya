import { createContext, useContext, useState, type ReactNode } from "react";
import type { HelpRequest } from "../types";

const HELP_REQUESTS_KEY = "menya:helpRequests";

// Same Context+localStorage pattern as SessionsContext/CurriculumContext/AlumniContext,
// except seeded empty — help requests are purely student-generated, unlike sessions or
// curriculum content, so an empty list on first load is itself a valid, expected state.
function readHelpRequests(): HelpRequest[] {
  try {
    const saved = JSON.parse(localStorage.getItem(HELP_REQUESTS_KEY) ?? "null");
    if (Array.isArray(saved) && (saved.length === 0 || typeof saved[0]?.studentName === "string")) return saved;
  } catch {
    // fall through to empty
  }
  return [];
}

interface HelpRequestsContextValue {
  requests: HelpRequest[];
  addRequest: (request: Omit<HelpRequest, "id" | "createdAt" | "status">) => void;
  resolveRequest: (id: number) => void;
}

const HelpRequestsContext = createContext<HelpRequestsContextValue | null>(null);

export function HelpRequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<HelpRequest[]>(readHelpRequests);

  const addRequest = (request: Omit<HelpRequest, "id" | "createdAt" | "status">) => {
    const nextId = requests.length ? Math.max(...requests.map((r) => r.id)) + 1 : 1;
    const next = [...requests, { ...request, id: nextId, createdAt: new Date().toISOString(), status: "open" as const }];
    localStorage.setItem(HELP_REQUESTS_KEY, JSON.stringify(next));
    setRequests(next);
  };

  const resolveRequest = (id: number) => {
    const next = requests.map((r) => (r.id === id ? { ...r, status: "resolved" as const, resolvedAt: new Date().toISOString() } : r));
    localStorage.setItem(HELP_REQUESTS_KEY, JSON.stringify(next));
    setRequests(next);
  };

  return (
    <HelpRequestsContext.Provider value={{ requests, addRequest, resolveRequest }}>
      {children}
    </HelpRequestsContext.Provider>
  );
}

export function useHelpRequests() {
  const ctx = useContext(HelpRequestsContext);
  if (!ctx) throw new Error("useHelpRequests must be used inside HelpRequestsProvider");
  return ctx;
}
