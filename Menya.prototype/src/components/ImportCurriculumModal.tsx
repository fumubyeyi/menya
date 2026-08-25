import { useState } from "react";
import { X, Upload, FileText, ShieldCheck, RotateCcw, CheckCircle2 } from "lucide-react";
import type { CurriculumCourse, CurriculumChapter, Difficulty } from "../types";

const SOURCE_OPTIONS = ["School / district file", "Standards-aligned provider"] as const;

interface DraftChapter {
  title: string;
  difficulty: Difficulty;
  modules: string[];
}

// Stands in for the AI parse step (Section 3.3 of the Curriculum Library import
// doc) — in production this structures the actual ingested file, not a template.
function draftParsedOutline(courseName: string): DraftChapter[] {
  const name = courseName.trim() || "This Course";
  return [
    { title: `Unit 1: Foundations of ${name}`, difficulty: "Beginner", modules: ["Key vocabulary & notation", "Foundational skills check"] },
    { title: "Unit 2: Core Concepts", difficulty: "Intermediate", modules: ["Core concept walkthrough", "Guided practice set"] },
    { title: "Unit 3: Applied Practice", difficulty: "Advanced", modules: ["Applied problem set", "Unit review"] },
  ];
}

interface Props {
  onClose: () => void;
  // Provided when import is launched from an existing course card — chapters are
  // appended to that course's library instead of creating a new course.
  course?: CurriculumCourse;
  onAdd: (course: CurriculumCourse) => void;
  onImportChapters?: (courseId: number, chapters: CurriculumChapter[]) => void;
}

export default function ImportCurriculumModal({ onClose, course, onAdd, onImportChapters }: Props) {
  const [step, setStep] = useState<"ingest" | "review">("ingest");
  const [source, setSource] = useState<(typeof SOURCE_OPTIONS)[number]>(SOURCE_OPTIONS[0]);
  const [providerName, setProviderName] = useState("");
  const [fileName, setFileName] = useState("");
  const [courseName, setCourseName] = useState(course?.name ?? "");
  const [grade, setGrade] = useState(course?.grade ?? "");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [outline, setOutline] = useState<DraftChapter[]>([]);

  const handleParse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rightsConfirmed) return;
    setOutline(draftParsedOutline(courseName));
    setStep("review");
  };

  const removeChapter = (index: number) => setOutline((prev) => prev.filter((_, i) => i !== index));

  const handlePublish = () => {
    const baseId = Date.now();
    const chapters: CurriculumChapter[] = outline.map((ch, i) => ({
      id: baseId + i + 1,
      title: ch.title,
      difficulty: ch.difficulty,
      modules: ch.modules.map((title) => ({ title, status: "not-started" as const })),
    }));

    if (course && onImportChapters) {
      onImportChapters(course.id, chapters);
    } else {
      onAdd({ id: baseId, name: courseName.trim(), grade: grade.trim(), students: 0, chapters });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">
              {course ? `Import Curriculum into ${course.name}` : "Import Curriculum"}
            </h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">
              {step === "ingest"
                ? "Bring in an already-curated course — Menya structures it, it doesn't author new content"
                : "Review against the source material before publishing to the library"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "ingest" ? (
          <form onSubmit={handleParse} className="flex flex-col overflow-y-auto">
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
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Curriculum File *</span>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-background border border-dashed border-border rounded-lg text-sm text-muted-foreground">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <input required value={fileName} onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. algebra-1-scope-and-sequence.pdf"
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none" />
                </div>
              </label>
              {!course && (
                <>
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
                </>
              )}
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-border cursor-pointer">
                <input type="checkbox" required checked={rightsConfirmed} onChange={(e) => setRightsConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary flex-shrink-0" />
                <span className="text-xs text-foreground leading-snug">
                  <span className="font-semibold">I confirm our organization has redistribution rights</span> to this material — school/district-owned content is fine as-is; third-party vendor or publisher content requires a confirmed licensing check before ingestion.
                </span>
              </label>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
              <button type="submit" disabled={!rightsConfirmed}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
                <Upload className="w-4 h-4" />Parse Curriculum
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col overflow-y-auto">
            <div className="px-6 py-5 space-y-3">
              <div className="flex gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
                <ShieldCheck className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-800">
                  Parsed from <strong>{fileName}</strong> ({providerName}) — check this structure against the source file before publishing, then remove anything mis-mapped.
                </p>
              </div>
              <ol className="space-y-2">
                {outline.map((ch, i) => (
                  <li key={i} className="p-3 rounded-lg border border-border space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-muted text-muted-foreground text-[11px] font-mono flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <span className="text-sm text-foreground flex-1">{ch.title}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-muted text-muted-foreground">{ch.difficulty}</span>
                      <button type="button" onClick={() => removeChapter(i)} className="text-[11px] text-muted-foreground hover:text-destructive transition-colors">Remove</button>
                    </div>
                    <ul className="pl-9 space-y-0.5">
                      {ch.modules.map((m, mi) => (
                        <li key={mi} className="text-xs text-muted-foreground">· {m}</li>
                      ))}
                    </ul>
                  </li>
                ))}
                {outline.length === 0 && (
                  <li className="text-sm text-muted-foreground py-6 px-4 border border-dashed border-border rounded-xl text-center">
                    No chapters left to import.
                  </li>
                )}
              </ol>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button type="button" onClick={() => setOutline(draftParsedOutline(courseName))}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">
                <RotateCcw className="w-4 h-4" />Re-parse
              </button>
              <button onClick={handlePublish} disabled={outline.length === 0}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
                <CheckCircle2 className="w-4 h-4" />Approve & Publish to Library
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
