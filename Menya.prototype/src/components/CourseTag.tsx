import { courseColor } from "../lib/constants";

export default function CourseTag({ course }: { course: string }) {
  const color = courseColor[course] || "#5E6B72";
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-md font-mono"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {course}
    </span>
  );
}
