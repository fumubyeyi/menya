import { createContext, useContext, useState, type ReactNode } from "react";
import { alumni } from "../data";
import type { AlumniRecord } from "../types";

const ALUMNI_KEY = "menya:alumni";

// Same client-side-state-with-persistence pattern as CurriculumContext — see
// that file for why this needs to be a context rather than a plain hook.
function readAlumni(): AlumniRecord[] {
  try {
    const saved = JSON.parse(localStorage.getItem(ALUMNI_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length > 0 && typeof saved[0]?.name === "string") return saved;
  } catch {
    // fall through to seed data
  }
  return alumni;
}

interface AlumniContextValue {
  alumni: AlumniRecord[];
  updateAlumnus: (updated: AlumniRecord) => void;
}

const AlumniContext = createContext<AlumniContextValue | null>(null);

export function AlumniProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<AlumniRecord[]>(readAlumni);

  const updateAlumnus = (updated: AlumniRecord) => {
    const next = records.map((a) => (a.id === updated.id ? updated : a));
    localStorage.setItem(ALUMNI_KEY, JSON.stringify(next));
    setRecords(next);
  };

  return (
    <AlumniContext.Provider value={{ alumni: records, updateAlumnus }}>
      {children}
    </AlumniContext.Provider>
  );
}

export function useAlumni() {
  const ctx = useContext(AlumniContext);
  if (!ctx) throw new Error("useAlumni must be used inside AlumniProvider");
  return ctx;
}
