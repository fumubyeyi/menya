import { useState } from "react";
import { X, BookOpen } from "lucide-react";
import type { CurriculumCourse } from "../types";

interface Props {
  onClose: () => void;
  onAdd: (course: CurriculumCourse) => void;
}

export default function AddCourseModal({ onClose, onAdd }: Props) {
  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: Date.now(), name: course.trim(), grade: grade.trim(), students: 0, chapters: [] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Add Course</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Add a new math course to the curriculum library</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-5 space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Course Name *</span>
              <input required value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Trigonometry"
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Grade *</span>
              <input required value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. 9–10"
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>
          </div>
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
              <BookOpen className="w-4 h-4" />Add Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
