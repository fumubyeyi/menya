import { useState } from "react";
import { X, HelpCircle, CheckCircle2 } from "lucide-react";
import { useHelpRequests } from "../context/HelpRequestsContext";

interface Props {
  onClose: () => void;
  studentId: number;
  studentName: string;
  course: string;
  chapterId: number;
  chapterTitle: string;
  moduleIndex: number;
  moduleTitle: string;
}

// Modeled on ScheduleModal's shell (centered card, backdrop, submit → confirmation),
// but far simpler — no pickers, everything is auto-filled from where the student was.
export default function RequestHelpModal({
  onClose, studentId, studentName, course, chapterId, chapterTitle, moduleIndex, moduleTitle,
}: Props) {
  const { addRequest } = useHelpRequests();
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRequest({
      studentId,
      studentName,
      course,
      chapterId,
      chapterTitle,
      moduleIndex,
      moduleTitle,
      note: note.trim() || undefined,
    });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Stuck? Ask your tutor</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">{course} · {chapterTitle} · {moduleTitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Sent to your tutor</h3>
              <p className="text-sm text-muted-foreground mt-1">Asking for help is a smart move. Your tutor will reach out soon.</p>
            </div>
            <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">What are you stuck on? (optional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. I don't get step 2, or which formula to use"
                rows={3}
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
              />
            </label>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
              <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Ask for help
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
