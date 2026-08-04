import { useState } from "react";
import { X, BookOpen } from "lucide-react";
import type { CurriculumCourse, Difficulty } from "../types";

const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

interface Props {
  onClose: () => void;
  course: CurriculumCourse;
  onAdd: (title: string, difficulty: Difficulty) => void;
}

export default function AddChapterModal({ onClose, course, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Beginner");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(title.trim(), difficulty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Add Chapter</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Add a new chapter to {course.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-5 space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Chapter Title *</span>
              <input autoFocus required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Radical Expressions"
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Difficulty</span>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button key={d} type="button" onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${difficulty === d ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
              <BookOpen className="w-4 h-4" />Add Chapter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
