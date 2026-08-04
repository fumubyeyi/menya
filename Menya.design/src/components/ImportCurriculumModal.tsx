import { useState } from "react";
import { X, Upload } from "lucide-react";
import type { CurriculumCourse, CurriculumChapter } from "../types";

const SOURCE_OPTIONS = ["School / district file", "Standards-aligned provider"] as const;

interface Props {
  onClose: () => void;
  onAdd: (course: CurriculumCourse) => void;
}

export default function ImportCurriculumModal({ onClose, onAdd }: Props) {
  const [source, setSource] = useState<(typeof SOURCE_OPTIONS)[number]>(SOURCE_OPTIONS[0]);
  const [providerName, setProviderName] = useState("");
  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseId = Date.now();
    const chapters: CurriculumChapter[] = [
      { id: courseId + 1, title: "Unit 1 (imported)", difficulty: "Beginner", modules: [] },
      { id: courseId + 2, title: "Unit 2 (imported)", difficulty: "Intermediate", modules: [] },
    ];
    onAdd({ id: courseId, name: course.trim(), grade: grade.trim(), students: 0, chapters });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Import Curriculum</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Bring in an already-curated course — Menya structures it, it doesn't author new content</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-5 space-y-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Source *</span>
              <div className="flex gap-2">
                {SOURCE_OPTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setSource(s)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${source === s ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-muted"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                {source === "School / district file" ? "School / District Name *" : "Provider Name *"}
              </span>
              <input required value={providerName} onChange={(e) => setProviderName(e.target.value)}
                placeholder={source === "School / district file" ? "e.g. Lincoln Middle School" : "e.g. Illustrative Mathematics"}
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>
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
            <p className="text-[11px] text-muted-foreground leading-snug">
              Import assumes your organization already has rights to this material — a licensing check happens before real ingestion, not shown in this prototype.
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
