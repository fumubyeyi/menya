import { createContext, useContext, useState, type ReactNode } from "react";
import { tutors } from "../data";
import type { Tutor } from "../types";

const TUTORS_KEY = "menya:tutors";

// Same Context+localStorage pattern as AlumniContext/CurriculumContext — see
// AlumniContext.tsx for why this needs to be a context rather than a plain hook.
function readTutors(): Tutor[] {
  try {
    const saved = JSON.parse(localStorage.getItem(TUTORS_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length > 0 && typeof saved[0]?.firstName === "string") {
      // Backfill fields added to the seed data after this browser already saved
      // its own copy (e.g. `profession`) — otherwise they'd silently never show
      // up for anyone with existing localStorage state. Saved values still win.
      const seedById = new Map(tutors.map((t) => [t.id, t]));
      const merged = saved.map((t: Tutor) => {
        const seed = seedById.get(t.id);
        return seed ? { ...seed, ...t } : t;
      });
      const savedIds = new Set(saved.map((t: Tutor) => t.id));
      const missingSeed = tutors.filter((t) => !savedIds.has(t.id));
      return [...merged, ...missingSeed];
    }
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
  updateTutor: (tutor: Tutor) => void;
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

  const updateTutor = (tutor: Tutor) => {
    const next = records.map((t) => (t.id === tutor.id ? tutor : t));
    localStorage.setItem(TUTORS_KEY, JSON.stringify(next));
    setRecords(next);
  };

  return (
    <TutorsContext.Provider value={{ tutors: records, addTutor, addTutors, updateTutor }}>
      {children}
    </TutorsContext.Provider>
  );
}

export function useTutors() {
  const ctx = useContext(TutorsContext);
  if (!ctx) throw new Error("useTutors must be used inside TutorsProvider");
  return ctx;
}
