import { Link } from "react-router";
import { X } from "lucide-react";
import SubjectTag from "./SubjectTag";
import ModuleStatusRow from "./ModuleStatusRow";
import { diffCls, chapterAction } from "../lib/constants";
import type { CurriculumChapter } from "../types";

interface Props {
  onClose: () => void;
  subject: string;
  chapter: CurriculumChapter;
}

export default function ChapterModulesViewModal({ onClose, subject, chapter }: Props) {
  const action = chapterAction(chapter);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        <div className="px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">{chapter.title}</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-2">
              <SubjectTag subject={subject} />
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${diffCls[chapter.difficulty]}`}>{chapter.difficulty}</span>
              <span className="text-[11px] font-mono text-muted-foreground">{chapter.modules.length} modules</span>
            </div>
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              {action.moduleIndex !== undefined ? (
                <Link to={`/student/module/${chapter.id}/${action.moduleIndex}`} onClick={onClose}
                  className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                  {action.label}
                </Link>
              ) : (
                <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">Completed</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-border scrollbar-hide">
          {chapter.modules.map((m, i) => (
            <ModuleStatusRow key={i} module={m} chapterId={chapter.id} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
