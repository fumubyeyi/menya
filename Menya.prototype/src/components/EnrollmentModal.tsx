import { useState } from "react";
import { X, Check, GraduationCap, Users } from "lucide-react";
import { useCurriculum } from "../context/CurriculumContext";
import { getCourseIcon, courseColor, diffCls } from "../lib/constants";

interface Props {
  enrolled: string[];
  onSave: (courses: string[]) => void;
  onClose: () => void;
}

export default function EnrollmentModal({ enrolled, onSave, onClose }: Props) {
  const { courses: curriculum } = useCurriculum();
  const [selected, setSelected] = useState<string[]>(enrolled);

  const toggle = (course: string) => {
    setSelected((prev) => prev.includes(course) ? prev.filter((s) => s !== course) : [...prev, course]);
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Manage Enrollment</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Select the courses you want to show up under My Courses</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {curriculum.map((course) => {
              const color = courseColor[course.name] ?? "#1B5E4F";
              const isSelected = selected.includes(course.name);
              const chapterCount = course.chapters.length;
              const moduleCount = course.chapters.reduce((sum, ch) => sum + ch.modules.length, 0);
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => toggle(course.name)}
                  className={`text-left flex flex-col gap-3 p-4 rounded-xl border transition-all ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                      <span style={{ color }}>{getCourseIcon(course.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{course.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />Grade {course.grade}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students} enrolled</span>
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "bg-primary border-primary" : "border-border"}`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                  </div>

                  {course.description && (
                    <p className="text-xs text-muted-foreground leading-snug">{course.description}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${diffCls[course.chapters[0]?.difficulty ?? "Beginner"]}`}>
                      {course.chapters[0]?.difficulty ?? "Beginner"}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{chapterCount} chapters · {moduleCount} modules</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <p className="text-[11px] font-mono text-muted-foreground">{selected.length} course{selected.length === 1 ? "" : "s"} selected</p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
            <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">Save Enrollment</button>
          </div>
        </div>
      </div>
    </div>
  );
}
