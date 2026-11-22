import type { Session } from "../../types";
import { tutorNameById } from "../../data";
import StudentDialog, { DialogActions } from "./StudentDialog";

// "Cancel this session?": confirming is a good use of a modal, since it
// can't be undone.
export default function CancelSessionDialog({ session, onOpenChange, onConfirm }: {
  session: Session | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (session: Session) => void;
}) {
  return (
    <StudentDialog
      open={!!session}
      onOpenChange={onOpenChange}
      title="Cancel this session?"
      description={session ? `${session.course} with ${tutorNameById(session.tutorId)} · ${session.time}, ${session.clock}` : undefined}
      returnFocus={session ? `[data-session-menu="${session.id}"]` : undefined}
    >
      <p className="text-sm text-foreground">Your tutor will see that it's cancelled. You can request a new session any time.</p>
      <DialogActions cancelLabel="Keep it">
        <button
          type="button"
          onClick={() => { if (session) onConfirm(session); onOpenChange(false); }}
          className="px-5 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Cancel session
        </button>
      </DialogActions>
    </StudentDialog>
  );
}
