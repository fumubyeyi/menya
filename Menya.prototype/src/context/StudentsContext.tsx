import { createContext, useContext, useState, type ReactNode } from "react";
import { students } from "../data";
import type { Student } from "../types";

const STUDENTS_KEY = "menya:students";

// Same Context+localStorage pattern as TutorsContext — see TutorsContext.tsx
// for why this needs to be a context rather than a plain hook.
function readStudents(): Student[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STUDENTS_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length > 0 && typeof saved[0]?.name === "string") return saved;
  } catch {
    // fall through to seed data
  }
  return students;
}

interface StudentsContextValue {
  students: Student[];
  addStudent: (student: Omit<Student, "id" | "progress" | "sessions" | "streak">) => void;
}

const StudentsContext = createContext<StudentsContextValue | null>(null);

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Student[]>(readStudents);

  const addStudent = (student: Omit<Student, "id" | "progress" | "sessions" | "streak">) => {
    const nextId = records.length ? Math.max(...records.map((s) => s.id)) + 1 : 1;
    const next = [...records, { ...student, id: nextId, progress: 0, sessions: 0, streak: 0 }];
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(next));
    setRecords(next);
  };

  return (
    <StudentsContext.Provider value={{ students: records, addStudent }}>
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const ctx = useContext(StudentsContext);
  if (!ctx) throw new Error("useStudents must be used inside StudentsProvider");
  return ctx;
}
