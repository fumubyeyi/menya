import { useState } from "react";
import { X, Wand2, RotateCcw, CheckCircle2, Sparkles } from "lucide-react";
import type { CurriculumCourse, CurriculumChapter, Difficulty } from "../types";

interface DraftChapter {
  title: string;
  difficulty: Difficulty;
}

function draftOutline(courseName: string): DraftChapter[] {
  const name = courseName.trim() || "This Course";
  return [
    { title: `Foundations of ${name}`, difficulty: "Beginner" },
    { title: "Core Skills & Practice", difficulty: "Beginner" },
    { title: "Applied Problem Solving", difficulty: "Intermediate" },
    { title: "Extension & Review", difficulty: "Advanced" },
  ];
}

interface Props {
  onClose: () => void;
  onAdd: (course: CurriculumCourse) => void;
}

export default function BootstrapCurriculumModal({ onClose, onAdd }: Props) {
  const [step, setStep] = useState<"draft" | "review">("draft");
  const [courseName, setCourseName] = useState("");
  const [grade, setGrade] = useState("");
  const [outline, setOutline] = useState<DraftChapter[]>([]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setOutline(draftOutline(courseName));
    setStep("review");
  };

  const handleApprove = () => {
    const courseId = Date.now();
    const chapters: CurriculumChapter[] = outline.map((ch, i) => ({
      id: courseId + i + 1,
      title: ch.title,
      difficulty: ch.difficulty,
      modules: [],
    }));
    onAdd({ id: courseId, name: courseName.trim(), grade: grade.trim(), students: 0, chapters });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Bootstrap Curriculum with AI</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">
              {step === "draft"
                ? "For a course with no existing material — AI drafts a structure first"
                : "Structural review — approve before any exercise content is generated"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "draft" ? (
          <form onSubmit={handleGenerate} className="flex flex-col overflow-y-auto">
            <div className="px-6 py-5 space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Course Name *</span>
                <input required value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Trigonometry"
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Grade *</span>
                <input required value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. 9–10"
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </label>
              <p className="text-[11px] text-muted-foreground leading-snug">
                No exercise content is generated at this step — just a proposed chapter sequence for a subject-matter expert to approve.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
              <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
                <Wand2 className="w-4 h-4" />Generate Outline
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col overflow-y-auto">
            <div className="px-6 py-5 space-y-3">
              <div className="flex gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
                <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-800">
                  Proposed structure for <strong>{courseName}</strong> (Grade {grade}) — review the sequence before any content is drafted.
                </p>
              </div>
              <ol className="space-y-2">
                {outline.map((ch, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <span className="w-6 h-6 rounded-md bg-muted text-muted-foreground text-[11px] font-mono flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-sm text-foreground flex-1">{ch.title}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-muted text-muted-foreground">{ch.difficulty}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button type="button" onClick={() => setOutline(draftOutline(courseName))}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">
                <RotateCcw className="w-4 h-4" />Regenerate
              </button>
              <button onClick={handleApprove}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />Approve Structure & Create Course
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
