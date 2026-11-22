import { useState } from "react";
import { Check } from "lucide-react";
import { useCurriculum } from "../../context/CurriculumContext";
import { getCourseIcon } from "../../lib/constants";
import { subjectColor, subjectTint } from "../../lib/subject";
import InlinePanel, { primaryBtn } from "./InlinePanel";

// Manage Enrollment, opened on My Courses (no modal): tick the courses you
// want, then save.
export default function EnrollmentPicker({ enrolled, onSave, onClose }: {
  enrolled: string[];
  onSave: (courses: string[]) => void;
  onClose: () => void;
}) {
  const { courses: curriculum } = useCurriculum();
  const [selected, setSelected] = useState<string[]>(enrolled);
  const toggle = (name: string) =>
    setSelected((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]));

  return (
    <InlinePanel
      title="Choose your courses"
      subtitle="Ticked courses show up on My Courses."
      onCancel={onClose}
      footerNote={`${selected.length} course${selected.length === 1 ? "" : "s"} selected`}
      action={<button type="button" onClick={() => { onSave(selected); onClose(); }} className={primaryBtn}>Save courses</button>}
    >
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {curriculum.map((course) => {
          const on = selected.includes(course.name);
          const modules = course.chapters.reduce((n, ch) => n + ch.modules.length, 0);
          return (
            <li key={course.id}>
              <button
                type="button"
                onClick={() => toggle(course.name)}
                aria-pressed={on}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors ${on ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"}`}
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: subjectTint(course.name), color: subjectColor(course.name) }}>
                  {getCourseIcon(course.name)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-foreground truncate">{course.name}</span>
                  <span className="block text-xs text-muted-foreground">Grade {course.grade} · {course.chapters.length} chapters · {modules} modules</span>
                </span>
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${on ? "bg-primary border-primary" : "border-border"}`}>
                  {on && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </InlinePanel>
  );
}
