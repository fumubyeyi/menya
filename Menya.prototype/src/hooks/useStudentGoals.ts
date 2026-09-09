import { useCallback, useEffect, useState } from "react";
import { useCurrentStudent } from "./useCurrentStudent";
import type { StudentGoal, NewStudentGoal } from "../types";

const goalsKey = (studentId: number) => `menya:goals:${studentId}`;

function readGoals(studentId: number): StudentGoal[] {
  try {
    const saved = JSON.parse(localStorage.getItem(goalsKey(studentId)) ?? "null");
    if (Array.isArray(saved) && saved.every((g) => typeof g?.id === "number" && typeof g?.type === "string")) return saved;
  } catch { /* fall through to default */ }
  return [];
}

// Client-side goal state (no backend), same localStorage-per-student pattern
// as useEnrollment — a student's self-study/session goals live only in their
// browser until there's a real backend to persist them to.
export function useStudentGoals() {
  const student = useCurrentStudent();
  const [goals, setGoals] = useState<StudentGoal[]>(() => readGoals(student.id));

  // Re-sync if the logged-in student changes (e.g. logout/login as someone
  // else in the same browser session, no full page reload in between).
  useEffect(() => {
    setGoals(readGoals(student.id));
  }, [student.id]);

  const addGoal = useCallback((goal: NewStudentGoal) => {
    setGoals((prev) => {
      const next: StudentGoal[] = [
        ...prev,
        { ...goal, id: Date.now(), createdAt: new Date().toISOString() } as StudentGoal,
      ];
      localStorage.setItem(goalsKey(student.id), JSON.stringify(next));
      return next;
    });
  }, [student.id]);

  const removeGoal = useCallback((id: number) => {
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      localStorage.setItem(goalsKey(student.id), JSON.stringify(next));
      return next;
    });
  }, [student.id]);

  return { goals, addGoal, removeGoal };
}
