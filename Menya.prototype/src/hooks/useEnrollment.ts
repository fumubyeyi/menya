import { useCallback, useEffect, useState } from "react";
import { useCurrentStudent } from "./useCurrentStudent";

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

// Client-side enrollment state (no backend), seeded from the logged-in
// student's original courses list and overridden once they enroll/unenroll
// via the Learning page.
export function useEnrollment() {
  const student = useCurrentStudent();
  const [courses, setCourses] = useState<string[]>(() => readEnrollment(student.id, student.courses));

  // Re-sync if the logged-in student changes (e.g. logout/login as someone
  // else in the same browser session, no full page reload in between).
  useEffect(() => {
    setCourses(readEnrollment(student.id, student.courses));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.id]);

  const updateEnrollment = useCallback((next: string[]) => {
    setCourses(next);
    localStorage.setItem(enrollmentKey(student.id), JSON.stringify(next));
  }, [student.id]);

  return { courses, updateEnrollment };
}
