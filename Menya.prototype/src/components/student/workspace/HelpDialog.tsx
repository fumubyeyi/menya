import { useState } from "react";
import { HelpCircle, CheckCircle2 } from "lucide-react";
import { useHelpRequests } from "../../../context/HelpRequestsContext";
import StudentDialog, { DialogActions, Dialog } from "../StudentDialog";
import { primaryBtn } from "../InlinePanel";

// "I'm stuck", as a small modal: asking for help is a short task that should
// take the student's full attention. Everything is filled in from where the
// student is; they can add a note.
export default function HelpDialog({
  open, onOpenChange, studentId, studentName, course, chapterId, chapterTitle, moduleIndex, moduleTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
  studentName: string;
  course: string;
  chapterId: number;
  chapterTitle: string;
  moduleIndex: number;
  moduleTitle: string;
}) {
  const { addRequest } = useHelpRequests();
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const change = (next: boolean) => {
    onOpenChange(next);
    if (!next) { setSent(false); setNote(""); }
  };

  const send = () => {
    addRequest({ studentId, studentName, course, chapterId, chapterTitle, moduleIndex, moduleTitle, note: note.trim() || undefined });
    setSent(true);
  };

  return (
    <StudentDialog
      open={open}
      onOpenChange={change}
      title={sent ? "Sent to your tutor" : "Stuck? Ask your tutor"}
      description={`${course} · ${moduleTitle}`}
      returnFocus="[data-help-trigger]"
    >
      {sent ? (
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-foreground">Asking for help is a smart move. Your tutor will reach out soon.</p>
          <Dialog.Close className={`mt-1 ${primaryBtn}`}>Back to the module</Dialog.Close>
        </div>
      ) : (
        <>
          <label htmlFor="help-note" className="block text-sm font-semibold text-foreground mb-2">
            What are you stuck on? <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="help-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. I don't get step 2, or which formula to use"
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
          />
          <DialogActions>
            <button type="button" onClick={send} className={`flex items-center gap-2 ${primaryBtn}`}>
              <HelpCircle className="w-4 h-4" /> Ask for help
            </button>
          </DialogActions>
        </>
      )}
    </StudentDialog>
  );
}
