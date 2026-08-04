import { createContext, useContext, useState, type ReactNode } from "react";
import { tutors } from "../data";
import type { Tutor } from "../types";

const TUTORS_KEY = "menya:tutors";

// Same Context+localStorage pattern as AlumniContext/CurriculumContext — see
// AlumniContext.tsx for why this needs to be a context rather than a plain hook.
function readTutors(): Tutor[] {
  try {
    const saved = JSON.parse(localStorage.getItem(TUTORS_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length > 0 && typeof saved[0]?.firstName === "string") return saved;
  } catch {
    // fall through to seed data
  }
  return tutors;
}

interface TutorsContextValue {
  tutors: Tutor[];
  addTutor: (tutor: Omit<Tutor, "id" | "students" | "sessions">) => void;
}

const TutorsContext = createContext<TutorsContextValue | null>(null);

export function TutorsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Tutor[]>(readTutors);

  const addTutor = (tutor: Omit<Tutor, "id" | "students" | "sessions">) => {
    const nextId = records.length ? Math.max(...records.map((t) => t.id)) + 1 : 1;
    const next = [...records, { ...tutor, id: nextId, students: 0, sessions: 0 }];
    localStorage.setItem(TUTORS_KEY, JSON.stringify(next));
    setRecords(next);
  };

  return (
    <TutorsContext.Provider value={{ tutors: records, addTutor }}>
      {children}
    </TutorsContext.Provider>
  );
}

export function useTutors() {
  const ctx = useContext(TutorsContext);
  if (!ctx) throw new Error("useTutors must be used inside TutorsProvider");
  return ctx;
}
