import { useCallback, useState } from "react";
import { sofia } from "../data";

const enrollmentKey = (studentId: number) => `menya:enrollment:${studentId}`;

function readEnrollment(studentId: number, fallback: string[]): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(enrollmentKey(studentId)) ?? "null");
    if (Array.isArray(saved) && saved.every((s) => typeof s === "string")) return saved;
  } catch { /* fall through to default */ }
  return fallback;
}

// Plain (non-hook) reader for pages that just need to render a student's current
// enrollment once per render — e.g. a staff-facing student profile — without
// subscribing to live updates the way the student's own Learning page does.
export function getEnrolledCourses(studentId: number, fallback: string[]): string[] {
  return readEnrollment(studentId, fallback);
}

// Client-side enrollment state (no backend), seeded from the student's original
// courses list and overridden once they enroll/unenroll via the Learning page.
export function useEnrollment() {
  const [courses, setCourses] = useState<string[]>(() => readEnrollment(sofia.id, sofia.courses));

  const updateEnrollment = useCallback((next: string[]) => {
    setCourses(next);
    localStorage.setItem(enrollmentKey(sofia.id), JSON.stringify(next));
  }, []);

  return { courses, updateEnrollment };
}
