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

type NewStudent = Omit<Student, "id" | "progress" | "sessions" | "streak">;

interface StudentsContextValue {
  students: Student[];
  addStudent: (student: NewStudent) => void;
  addStudents: (students: NewStudent[]) => void;
}

const StudentsContext = createContext<StudentsContextValue | null>(null);

export function StudentsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Student[]>(readStudents);

  const addStudent = (student: NewStudent) => addStudents([student]);

  // Bulk insert — assigns every id off one snapshot of `records` and commits with a
  // single setRecords call, so a loop of individual addStudent calls (each reading
  // the same stale `records` closure before a re-render lands) can't silently drop
  // all but the last one. Matters for the Excel-import flow, which can add dozens
  // of students at once — see SessionsContext.addSessions for the same fix.
  const addStudents = (newStudents: NewStudent[]) => {
    let nextId = records.length ? Math.max(...records.map((s) => s.id)) + 1 : 1;
    const additions = newStudents.map((student) => ({ ...student, id: nextId++, progress: 0, sessions: 0, streak: 0 }));
    const next = [...records, ...additions];
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(next));
    setRecords(next);
  };

  return (
    <StudentsContext.Provider value={{ students: records, addStudent, addStudents }}>
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const ctx = useContext(StudentsContext);
  if (!ctx) throw new Error("useStudents must be used inside StudentsProvider");
  return ctx;
}
