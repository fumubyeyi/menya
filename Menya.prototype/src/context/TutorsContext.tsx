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

type NewTutor = Omit<Tutor, "id" | "students" | "sessions">;

interface TutorsContextValue {
  tutors: Tutor[];
  addTutor: (tutor: NewTutor) => void;
  addTutors: (tutors: NewTutor[]) => void;
}

const TutorsContext = createContext<TutorsContextValue | null>(null);

export function TutorsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Tutor[]>(readTutors);

  const addTutor = (tutor: NewTutor) => addTutors([tutor]);

  // Bulk insert — see StudentsContext.addStudents for why a loop of single-item
  // adds would silently drop all but the last one. Matters for the Excel-import
  // flow, which can add many tutors at once.
  const addTutors = (newTutors: NewTutor[]) => {
    let nextId = records.length ? Math.max(...records.map((t) => t.id)) + 1 : 1;
    const additions = newTutors.map((tutor) => ({ ...tutor, id: nextId++, students: 0, sessions: 0 }));
    const next = [...records, ...additions];
    localStorage.setItem(TUTORS_KEY, JSON.stringify(next));
    setRecords(next);
  };

  return (
    <TutorsContext.Provider value={{ tutors: records, addTutor, addTutors }}>
      {children}
    </TutorsContext.Provider>
  );
}

export function useTutors() {
  const ctx = useContext(TutorsContext);
  if (!ctx) throw new Error("useTutors must be used inside TutorsProvider");
  return ctx;
}
