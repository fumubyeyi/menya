import { useState } from "react";
import { X, Plus, Trash2, Save, AlertCircle } from "lucide-react";
import CourseTag from "./CourseTag";
import QuestionEditor from "./QuestionEditor";
import { diffCls } from "../lib/constants";
import type { CurriculumChapter, CurriculumModule, PracticeItem, DiagramSpec } from "../types";

interface Props {
  onClose: () => void;
  course: string;
  chapter: CurriculumChapter;
  module: CurriculumModule;
  onSave: (patch: Partial<CurriculumModule>) => void;
}

const label = "text-[11px] font-mono text-muted-foreground uppercase tracking-wider";
const input = "px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25";
const textarea = `${input} resize-none w-full`;

export default function EditModuleModal({ onClose, course, chapter, module, onSave }: Props) {
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description ?? "");
  const [content, setContent] = useState<string[]>(module.content?.length ? module.content : [""]);
  const [workedPrompt, setWorkedPrompt] = useState(module.workedExample?.prompt ?? "");
  const [workedAnswer, setWorkedAnswer] = useState(module.workedExample?.answer ?? "");
  const [exercises, setExercises] = useState<PracticeItem[]>(module.exercises?.length ? module.exercises : []);
  const [diagramText, setDiagramText] = useState(module.diagram ? JSON.stringify(module.diagram, null, 2) : "");
  const [diagramError, setDiagramError] = useState<string | null>(null);

  const updateContent = (i: number, value: string) => setContent((prev) => prev.map((p, idx) => (idx === i ? value : p)));
  const addContent = () => setContent((prev) => [...prev, ""]);
  const removeContent = (i: number) => setContent((prev) => prev.filter((_, idx) => idx !== i));

  const updateExercise = (i: number, patch: Partial<PracticeItem>) =>
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, ...patch } : ex)));
  const addExercise = () => setExercises((prev) => [...prev, { prompt: "", answer: "" }]);
  const removeExercise = (i: number) => setExercises((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let diagram: DiagramSpec | undefined = module.diagram;
    if (diagramText.trim()) {
      try {
        diagram = JSON.parse(diagramText) as DiagramSpec;
        setDiagramError(null);
      } catch {
        setDiagramError("Diagram JSON is invalid — fix it or clear the field before saving.");
        return;
      }
    } else {
      diagram = undefined;
    }

    const trimmedContent = content.map((p) => p.trim()).filter(Boolean);
    const trimmedExercises = exercises
      .map((ex) => ({
        ...ex,
        prompt: ex.prompt.trim(),
        answer: ex.answer.trim(),
        choices: ex.choices?.map((c) => ({ ...c, label: c.label.trim() })),
        numericAnswer: ex.numericAnswer?.trim(),
      }))
      .filter((ex) => {
        if (!ex.prompt) return false;
        const t = ex.type ?? "free-response";
        if (t === "multiple-choice") return (ex.choices?.filter((c) => c.label || c.diagram).length ?? 0) >= 2 && ex.correctIndex !== undefined;
        if (t === "numeric") return !!ex.numericAnswer;
        if (t === "true-false") return ex.correctIndex !== undefined;
        return !!ex.answer;
      });
    const workedExample = workedPrompt.trim() && workedAnswer.trim()
      ? { prompt: workedPrompt.trim(), answer: workedAnswer.trim() }
      : undefined;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      content: trimmedContent.length ? trimmedContent : undefined,
      workedExample,
      exercises: trimmedExercises.length ? trimmedExercises : undefined,
      diagram,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Edit Module</h2>
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
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-hide">
            <label className="flex flex-col gap-1.5">
              <span className={label}>Module Title *</span>
              <input autoFocus required value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={label}>Description</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One-line summary shown at the top of the module"
                className={input} />
            </label>

            <div className="flex flex-col gap-2">
              <span className={label}>Content</span>
              {content.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <textarea value={p} onChange={(e) => updateContent(i, e.target.value)} rows={3}
                    placeholder="Explain the concept — a definition and a worked mini-example work well." className={textarea} />
                  {content.length > 1 && (
                    <button type="button" onClick={() => removeContent(i)} className="mt-1 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addContent} className="self-start flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add paragraph
              </button>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <span className={label}>Worked Example (shown to student, not graded)</span>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Problem</span>
                <textarea value={workedPrompt} onChange={(e) => setWorkedPrompt(e.target.value)} rows={2} className={textarea} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Full worked solution</span>
                <textarea value={workedAnswer} onChange={(e) => setWorkedAnswer(e.target.value)} rows={3} className={textarea} />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={label}>Exercises</span>
                <span className="text-xs text-muted-foreground">Aim for 5+ exercises for solid practice coverage</span>
              </div>
              {exercises.map((ex, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <QuestionEditor item={ex} onChange={(patch) => updateExercise(i, patch)} />
                  </div>
                  <button type="button" onClick={() => removeExercise(i)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addExercise} className="self-start flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add exercise
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={label}>Diagram (optional, advanced — JSON)</span>
              <textarea value={diagramText} onChange={(e) => { setDiagramText(e.target.value); setDiagramError(null); }} rows={5}
                placeholder='{"kind": "graph", "family": "linear", "m": 1, "b": 0}' className={`${textarea} font-mono text-xs`} />
              {diagramError && (
                <span className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle className="w-3.5 h-3.5" />{diagramError}</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={!title.trim()} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-all flex items-center gap-2">
              <Save className="w-4 h-4" />Save Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
