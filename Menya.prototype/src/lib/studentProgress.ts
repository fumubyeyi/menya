import { CURRENT_STUDENT_ID } from "../data";
import type { CurriculumCourse, ModuleStatus } from "../types";

// A module's status for the student combines two sources:
// - the curriculum data's own `status` (the seeded demo progress), and
// - the student's saved practice in the Module Workspace: any question
//   answered → in progress, every question answered → completed.
// Whichever is further along wins, so finishing practice moves the module
// forward everywhere (Home, My Courses, Up next, badges), and saved
// practice never pulls a module backwards.
//
// Practice lives in localStorage under the same key the workspace writes
// (progressKeys.practice below), one per student.

const RANK: Record<ModuleStatus, number> = { "not-started": 0, "in-progress": 1, completed: 2 };

type Id = number | string;

// Everything a student saves inside a module, keyed per student in the same
// `menya:<kind>:<studentId>:…` shape as goals, enrollment and activity, so
// two students on one device each keep their own work.
export const progressKeys = {
  practice: (studentId: Id, chapterId: Id, moduleIndex: Id) => `menya:practice:${studentId}:${chapterId}:${moduleIndex}`,
  chapterTest: (studentId: Id, chapterId: Id) => `menya:chapterTest:${studentId}:${chapterId}`,
  notes: (studentId: Id, chapterId: Id, moduleIndex: Id) => `menya:notes:${studentId}:${chapterId}:${moduleIndex}`,
  time: (studentId: Id, chapterId: Id, moduleIndex: Id) => `menya:time:${studentId}:${chapterId}:${moduleIndex}`,
};

// How many id parts each kind had before it was per-student, e.g. the old
// `menya:practice:<chapterId>:<moduleIndex>` has 2. Used to spot old keys.
const LEGACY_PARTS: Record<keyof typeof progressKeys, number> = { practice: 2, chapterTest: 1, notes: 2, time: 2 };

// One-time move of module data saved before it was per-student. It was
// shared by everyone on the device; it goes to the default demo student,
// whose session it almost certainly came from. Old keys are removed after,
// so this is a no-op on every later run. A per-student copy that already
// exists is never overwritten.
export function migrateLegacyProgress(ownerId: Id = CURRENT_STUDENT_ID) {
  try {
    const legacy: { key: string; kind: keyof typeof progressKeys; rest: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const m = key?.match(/^menya:(practice|chapterTest|notes|time):(.+)$/);
      if (!key || !m) continue;
      const kind = m[1] as keyof typeof progressKeys;
      if (m[2].split(":").length === LEGACY_PARTS[kind]) legacy.push({ key, kind, rest: m[2] });
    }
    for (const { key, kind, rest } of legacy) {
      const next = `menya:${kind}:${ownerId}:${rest}`;
      const value = localStorage.getItem(key);
      if (value !== null && localStorage.getItem(next) === null) localStorage.setItem(next, value);
      localStorage.removeItem(key);
    }
  } catch {
    /* storage unavailable: nothing to move */
  }
}

// Status implied by an exercise list's marks, or null if nothing's answered.
export function statusFromMarks(marks: (string | null | undefined)[]): ModuleStatus | null {
  const answered = marks.filter(Boolean).length;
  if (marks.length === 0 || answered === 0) return null;
  return answered === marks.length ? "completed" : "in-progress";
}

export function savedPracticeStatus(studentId: Id, chapterId: Id, moduleIndex: number): ModuleStatus | null {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKeys.practice(studentId, chapterId, moduleIndex)) ?? "null");
    if (!saved || !Array.isArray(saved.exercises)) return null;
    return statusFromMarks(saved.exercises.map((it: { mark?: string | null }) => it?.mark));
  } catch {
    return null;
  }
}

export function furthestStatus(a: ModuleStatus, b: ModuleStatus | null): ModuleStatus {
  return b && RANK[b] > RANK[a] ? b : a;
}

export function withStudentProgress(courses: CurriculumCourse[], studentId: Id): CurriculumCourse[] {
  return courses.map((course) => ({
    ...course,
    chapters: course.chapters.map((chapter) => ({
      ...chapter,
      modules: chapter.modules.map((m, i) => {
        const status = furthestStatus(m.status, savedPracticeStatus(studentId, chapter.id, i));
        return status === m.status ? m : { ...m, status };
      }),
    })),
  }));
}
