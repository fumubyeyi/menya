import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import type { PracticeItem, PracticeChoice, QuestionType, DiagramSpec } from "../types";

interface Props {
  item: PracticeItem;
  onChange: (patch: Partial<PracticeItem>) => void;
}

const label = "text-[11px] font-mono text-muted-foreground uppercase tracking-wider";
const input = "px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25";
const textarea = `${input} resize-none w-full`;

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "free-response", label: "Free Response" },
  { value: "true-false", label: "True/False" },
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "numeric", label: "Numeric" },
];

// Shared by EditModuleModal (exercises) and EditChapterTestModal (test questions) so
// the four question types aren't authored two different ways. Free response is the
// default (matches every question authored before this existed); the other three
// grade themselves automatically once a student answers, so authoring them means
// telling the system which choice/value is correct instead of writing a model answer.
export default function QuestionEditor({ item, onChange }: Props) {
  const type = item.type ?? "free-response";

  const [diagramDrafts, setDiagramDrafts] = useState<string[]>(() =>
    (item.choices ?? []).map((c) => (c.diagram ? JSON.stringify(c.diagram, null, 2) : "")));
  const [diagramErrors, setDiagramErrors] = useState<(string | null)[]>(() =>
    (item.choices ?? []).map(() => null));

  const handleTypeChange = (newType: QuestionType) => {
    if (newType === "multiple-choice") {
      const choices = item.choices?.length ? item.choices : [{ label: "" }, { label: "" }, { label: "" }, { label: "" }];
      onChange({ type: newType, choices, correctIndex: item.correctIndex ?? 0, numericAnswer: undefined });
      setDiagramDrafts(choices.map((c) => (c.diagram ? JSON.stringify(c.diagram, null, 2) : "")));
      setDiagramErrors(choices.map(() => null));
    } else if (newType === "true-false") {
      onChange({ type: newType, correctIndex: item.correctIndex === 1 ? 1 : 0, choices: undefined, numericAnswer: undefined });
    } else if (newType === "numeric") {
      onChange({ type: newType, numericAnswer: item.numericAnswer ?? "", choices: undefined, correctIndex: undefined });
    } else {
      onChange({ type: newType, choices: undefined, correctIndex: undefined, numericAnswer: undefined });
    }
  };

  const updateChoice = (i: number, patch: Partial<PracticeChoice>) =>
    onChange({ choices: (item.choices ?? []).map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });

  const addChoice = () => {
    onChange({ choices: [...(item.choices ?? []), { label: "" }] });
    setDiagramDrafts((prev) => [...prev, ""]);
    setDiagramErrors((prev) => [...prev, null]);
  };

  const removeChoice = (i: number) => {
    const choices = (item.choices ?? []).filter((_, idx) => idx !== i);
    const correctIndex = item.correctIndex === i ? 0 : item.correctIndex !== undefined && item.correctIndex > i ? item.correctIndex - 1 : item.correctIndex;
    onChange({ choices, correctIndex });
    setDiagramDrafts((prev) => prev.filter((_, idx) => idx !== i));
    setDiagramErrors((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateChoiceDiagramText = (i: number, text: string) => {
    setDiagramDrafts((prev) => prev.map((t, idx) => (idx === i ? text : t)));
    if (!text.trim()) {
      setDiagramErrors((prev) => prev.map((e, idx) => (idx === i ? null : e)));
      updateChoice(i, { diagram: undefined });
      return;
    }
    try {
      const parsed = JSON.parse(text) as DiagramSpec;
      setDiagramErrors((prev) => prev.map((e, idx) => (idx === i ? null : e)));
      updateChoice(i, { diagram: parsed });
    } catch {
      setDiagramErrors((prev) => prev.map((e, idx) => (idx === i ? "Invalid JSON — this choice keeps its last valid graph until fixed." : e)));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {QUESTION_TYPES.map((t) => (
          <button key={t.value} type="button" onClick={() => handleTypeChange(t.value)}
            className={`flex-1 min-w-[110px] py-1.5 rounded-lg text-xs font-medium border transition-colors ${type === t.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <textarea value={item.prompt} onChange={(e) => onChange({ prompt: e.target.value })} rows={2}
        placeholder="Prompt" className={textarea} />

      {type === "free-response" && (
        <textarea value={item.answer} onChange={(e) => onChange({ answer: e.target.value })} rows={2}
          placeholder="Model answer" className={textarea} />
      )}

      {type === "true-false" && (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Correct Answer</span>
            <div className="flex gap-2">
              {["True", "False"].map((choiceLabel, i) => (
                <button key={choiceLabel} type="button" onClick={() => onChange({ correctIndex: i })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${item.correctIndex === i ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                  {choiceLabel}
                </button>
              ))}
            </div>
          </div>
          <textarea value={item.answer} onChange={(e) => onChange({ answer: e.target.value })} rows={2}
            placeholder="Explanation (optional)" className={textarea} />
        </>
      )}

      {type === "numeric" && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Correct Answer</span>
            <input value={item.numericAnswer ?? ""} onChange={(e) => onChange({ numericAnswer: e.target.value })}
              placeholder="e.g. 5 or -2.5" className={input} />
          </label>
          <textarea value={item.answer} onChange={(e) => onChange({ answer: e.target.value })} rows={2}
            placeholder="Explanation (optional)" className={textarea} />
        </>
      )}

      {type === "multiple-choice" && (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Tap the circle to mark the correct choice</span>
          {(item.choices ?? []).map((choice, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onChange({ correctIndex: i })} title="Mark as correct answer"
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.correctIndex === i ? "border-emerald-500 bg-emerald-500" : "border-border hover:border-emerald-400"}`}>
                  {item.correctIndex === i && <Check className="w-3 h-3 text-white" />}
                </button>
                <input value={choice.label} onChange={(e) => updateChoice(i, { label: e.target.value })}
                  placeholder={`Choice ${i + 1}`} className={`${input} flex-1`} />
                {(item.choices?.length ?? 0) > 2 && (
                  <button type="button" onClick={() => removeChoice(i)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="pl-7 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Graph (optional, JSON)</span>
                <textarea value={diagramDrafts[i] ?? ""} onChange={(e) => updateChoiceDiagramText(i, e.target.value)} rows={2}
                  placeholder='{"kind": "graph", "family": "linear", "m": 1, "b": 0}' className={`${textarea} font-mono text-[11px]`} />
                {diagramErrors[i] && <span className="text-[11px] text-red-600">{diagramErrors[i]}</span>}
              </div>
            </div>
          ))}
          <button type="button" onClick={addChoice} className="self-start flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add choice
          </button>
          <textarea value={item.answer} onChange={(e) => onChange({ answer: e.target.value })} rows={2}
            placeholder="Explanation (optional)" className={textarea} />
        </div>
      )}
    </div>
  );
}
