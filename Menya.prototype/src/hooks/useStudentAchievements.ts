import { useEffect, useMemo, useState } from "react";
import { achievements, nextAchievement } from "../lib/constants";
import { useCurrentStudent } from "./useCurrentStudent";
import { useStudentActivity } from "../context/StudentActivityContext";
import { useStudentCurriculum } from "./useStudentCurriculum";
import { useEnrollment } from "./useEnrollment";

// One source of truth for a student's badges, shared by My Journey, Goals and
// the end-of-module screen, so they can never disagree about what's earned.
//
// The progress badges count modules finished across the student's enrolled
// courses (the same courses and statuses as the My Journey bars), so a target
// reads as "Finish 29 of your 36 modules".
export function useStudentAchievements() {
  const student = useCurrentStudent();
  const curriculumCourses = useStudentCurriculum();
  const { courses: enrolled } = useEnrollment();
  const { streak, sessionsAttendedTotal } = useStudentActivity();

  const modules = curriculumCourses
    .filter((c) => enrolled.includes(c.name))
    .flatMap((c) => c.chapters.flatMap((ch) => ch.modules));
  const modulesDone = modules.filter((m) => m.status === "completed").length;

  const input = { streak, sessions: student.sessions, sessionsAttended: sessionsAttendedTotal, modulesDone, modulesTotal: modules.length };
  const earned = achievements.filter((a) => a.condition(input));
  const locked = achievements.filter((a) => !a.condition(input));
  const next = nextAchievement(input);
  const fresh = useFreshUnlocks(student.id, earned.map((a) => a.id));

  return { input, earned, locked, next, fresh };
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
