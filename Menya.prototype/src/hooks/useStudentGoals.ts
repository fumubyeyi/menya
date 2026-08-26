import { useCallback, useState } from "react";
import { sofia } from "../data";
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
  const [goals, setGoals] = useState<StudentGoal[]>(() => readGoals(sofia.id));

  const addGoal = useCallback((goal: NewStudentGoal) => {
    setGoals((prev) => {
      const next: StudentGoal[] = [
        ...prev,
        { ...goal, id: Date.now(), createdAt: new Date().toISOString() } as StudentGoal,
      ];
      localStorage.setItem(goalsKey(sofia.id), JSON.stringify(next));
      return next;
    });
  }, []);

  const removeGoal = useCallback((id: number) => {
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      localStorage.setItem(goalsKey(sofia.id), JSON.stringify(next));
      return next;
    });
  }, []);

  return { goals, addGoal, removeGoal };
}
