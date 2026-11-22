import { useCurriculum } from "../context/CurriculumContext";
import { withStudentProgress } from "../lib/studentProgress";
import { useCurrentStudent } from "./useCurrentStudent";

// The curriculum as the student sees it: module statuses moved forward by
// their own saved practice (see lib/studentProgress.ts). Student pages use
// this instead of useCurriculum().courses so the journey path, course
// percentages, "Up next" and progress badges all reflect what they've done.
//
// Recomputed on every render on purpose: practice is saved to localStorage by
// the Module Workspace, and each student page re-renders when it opens, so it
// always picks up the latest. The work is a few small JSON reads.
export function useStudentCurriculum() {
  const { courses } = useCurriculum();
  const student = useCurrentStudent();
  return withStudentProgress(courses, student.id);
}
