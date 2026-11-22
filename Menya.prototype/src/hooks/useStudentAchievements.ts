import { useEffect, useMemo, useState } from "react";
import { studentCourseDetail } from "../data";
import { achievements, nextAchievement, courseCompletion } from "../lib/constants";
import { useCurrentStudent } from "./useCurrentStudent";
import { useStudentActivity } from "../context/StudentActivityContext";
import { useStudentCurriculum } from "./useStudentCurriculum";

// One source of truth for a student's badges, shared by My Journey and Goals
// so the two pages can never disagree about what's earned.
//
// "Progress" averages courseCompletion (curriculum modules marked completed)
// across the student's courses rather than reading the student's separately
// hand-set `progress` field, so it always matches the per-course percentages
// on the journey map and on My Courses.
export function useStudentAchievements() {
  const student = useCurrentStudent();
  const curriculumCourses = useStudentCurriculum();
  const { streak, sessionsAttendedTotal } = useStudentActivity();

  const courseDetails = studentCourseDetail[student.id] ?? [];
  const progress = courseDetails.length > 0
    ? Math.round(courseDetails.reduce((sum, cd) => sum + courseCompletion(curriculumCourses, cd.course), 0) / courseDetails.length)
    : student.progress;

  const input = { streak, progress, sessions: student.sessions, sessionsAttended: sessionsAttendedTotal };
  const earned = achievements.filter((a) => a.condition(input));
  const locked = achievements.filter((a) => !a.condition(input));
  const next = nextAchievement(input);
  const fresh = useFreshUnlocks(student.id, earned.map((a) => a.id));

  return { input, progress, earned, locked, next, fresh };
}

const seenKey = (studentId: number) => `menya:badges-seen:${studentId}`;

function readSeen(studentId: number): string[] | null {
  try {
    const v = JSON.parse(localStorage.getItem(seenKey(studentId)) ?? "null");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : null;
  } catch {
    return null;
  }
}

function writeSeen(studentId: number, ids: string[]) {
  try {
    localStorage.setItem(seenKey(studentId), JSON.stringify(ids));
  } catch {
    /* storage unavailable: the badge just won't celebrate */
  }
}

// Badges earned since the student last saw their badges, so each one gets its
// unlock celebration exactly once. The very first visit only records a
// baseline: badges a student already had before this feature existed don't
// all go off at once.
function useFreshUnlocks(studentId: number, earnedIds: string[]): Set<string> {
  const [fresh, setFresh] = useState<string[]>([]);
  const earnedKey = earnedIds.join(",");

  useEffect(() => {
    const seen = readSeen(studentId);
    if (seen === null) {
      writeSeen(studentId, earnedIds);
      return;
    }
    const newOnes = earnedIds.filter((id) => !seen.includes(id));
    if (newOnes.length === 0) return;
    writeSeen(studentId, [...seen, ...newOnes]);
    setFresh((prev) => [...prev, ...newOnes.filter((id) => !prev.includes(id))]);
  }, [studentId, earnedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // The "New!" tag stays up for a few seconds after the celebration.
  useEffect(() => {
    if (fresh.length === 0) return;
    const t = setTimeout(() => setFresh([]), 6000);
    return () => clearTimeout(t);
  }, [fresh]);

  return useMemo(() => new Set(fresh), [fresh]);
}
