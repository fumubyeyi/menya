import { useState } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import CourseTag from "./CourseTag";
import QuestionEditor from "./QuestionEditor";
import { diffCls } from "../lib/constants";
import type { CurriculumChapter, PracticeItem } from "../types";

interface Props {
  onClose: () => void;
  course: string;
  chapter: CurriculumChapter;
  onSave: (test: PracticeItem[]) => void;
}

const label = "text-[11px] font-mono text-muted-foreground uppercase tracking-wider";

export default function EditChapterTestModal({ onClose, course, chapter, onSave }: Props) {
  const [questions, setQuestions] = useState<PracticeItem[]>(chapter.test?.length ? chapter.test : []);

  const updateQuestion = (i: number, patch: Partial<PracticeItem>) =>
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  const addQuestion = () => setQuestions((prev) => [...prev, { prompt: "", answer: "" }]);
  const removeQuestion = (i: number) => setQuestions((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = questions
      .map((q) => ({
        ...q,
        prompt: q.prompt.trim(),
        answer: q.answer.trim(),
        choices: q.choices?.map((c) => ({ ...c, label: c.label.trim() })),
        numericAnswer: q.numericAnswer?.trim(),
      }))
      .filter((q) => {
        if (!q.prompt) return false;
        const t = q.type ?? "free-response";
        if (t === "multiple-choice") return (q.choices?.filter((c) => c.label || c.diagram).length ?? 0) >= 2 && q.correctIndex !== undefined;
        if (t === "numeric") return !!q.numericAnswer;
        if (t === "true-false") return q.correctIndex !== undefined;
        return !!q.answer;
      });
    onSave(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Edit Chapter Test</h2>
            <div className="flex items-center gap-2 mt-2">
              <CourseTag course={course} />
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${diffCls[chapter.difficulty]}`}>{chapter.difficulty}</span>
              <span className="text-[11px] font-mono text-muted-foreground">{chapter.title}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-hide">
            <div className="flex items-center justify-between">
              <span className={label}>Questions</span>
              <span className="text-xs text-muted-foreground">Existing chapter tests have 6-8 questions</span>
            </div>
            {questions.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">No questions yet — add the first one.</p>
            )}
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border p-3">
                <span className="w-6 h-6 rounded-md bg-muted text-muted-foreground text-[11px] font-mono flex items-center justify-center flex-shrink-0 mt-1">{i + 1}</span>
                <div className="flex-1">
                  <QuestionEditor item={q} onChange={(patch) => updateQuestion(i, patch)} />
                </div>
                <button type="button" onClick={() => removeQuestion(i)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add question
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
              <Save className="w-4 h-4" />Save Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
