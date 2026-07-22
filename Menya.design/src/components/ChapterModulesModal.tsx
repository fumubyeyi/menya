import { useState } from "react";
import { X, Plus, BookOpen, Pencil, AlertTriangle } from "lucide-react";
import CourseTag from "./CourseTag";
import { diffCls, isModuleAuthored, isChapterTestAuthored } from "../lib/constants";
import type { CurriculumChapter } from "../types";

interface Props {
  onClose: () => void;
  course: string;
  chapter: CurriculumChapter;
  onAddModule: (title: string) => void;
  onEditModule: (moduleIndex: number) => void;
  onEditTest: () => void;
}

export default function ChapterModulesModal({ onClose, course, chapter, onAddModule, onEditModule, onEditTest }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddModule(title.trim());
    setTitle("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">{chapter.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <CourseTag course={course} />
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${diffCls[chapter.difficulty]}`}>{chapter.difficulty}</span>
              <span className="text-[11px] font-mono text-muted-foreground">{chapter.modules.length} modules</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onEditTest} className="flex items-center gap-1.5 border border-border text-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
              {!isChapterTestAuthored(chapter) && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
              Edit Test
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
          {chapter.modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <BookOpen className="w-7 h-7 opacity-40" />
              <p className="text-sm">No modules yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {chapter.modules.map((m, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <span className="w-6 h-6 rounded-md bg-muted text-muted-foreground text-[11px] font-mono flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-sm text-foreground flex-1">{m.title}</span>
                  {!isModuleAuthored(m) && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
                  <button onClick={() => onEditModule(i)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-6 py-4 border-t border-border flex-shrink-0">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a module…"
            className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
          <button type="submit" disabled={!title.trim()} className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 flex-shrink-0">
            <Plus className="w-4 h-4" />Add
          </button>
        </form>
      </div>
    </div>
  );
}
