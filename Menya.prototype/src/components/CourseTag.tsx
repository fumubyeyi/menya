import { subjectColor, subjectTint } from "../lib/subject";

// Subject-coloured in the student view; the neutral slate everywhere else
// (see lib/subject.ts).
export default function CourseTag({ course }: { course: string }) {
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-md font-mono"
      style={{ backgroundColor: subjectTint(course, 8), color: subjectColor(course) }}
    >
      {course}
    </span>
  );
}
