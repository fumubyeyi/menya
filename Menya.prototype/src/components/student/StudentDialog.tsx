import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

// The one modal shell for student tasks that are short and self-contained
// (Set a Goal, Request Session, I'm stuck): centred on wider screens, a sheet
// from the bottom on phones. Radix handles focus trapping, Escape and labels.
// `returnFocus` is a selector for the button that opened it, when that
// button isn't a Radix Trigger.
export default function StudentDialog({ open, onOpenChange, title, description, children, returnFocus }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  returnFocus?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onCloseAutoFocus={(e) => {
            if (!returnFocus) return;
            e.preventDefault();
            document.querySelector<HTMLElement>(returnFocus)?.focus();
          }}
          {...(description ? {} : { "aria-describedby": undefined })}
          className="fixed z-50 bg-card shadow-2xl outline-none flex flex-col max-h-[90vh]
            inset-x-0 bottom-0 rounded-t-2xl
            sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg sm:rounded-2xl
            data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 sm:data-[state=open]:zoom-in-95 sm:data-[state=open]:slide-in-from-bottom-0"
        >
          {/* Grab handle on phones */}
          <div aria-hidden className="sm:hidden mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-muted flex-shrink-0" />
          <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-bold text-foreground">{title}</Dialog.Title>
              {description && <Dialog.Description className="text-sm text-muted-foreground truncate">{description}</Dialog.Description>}
            </div>
            <Dialog.Close aria-label="Close" className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted flex-shrink-0">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Footer row: a close button (Cancel by default) plus the main action.
export function DialogActions({ children, cancelLabel = "Cancel" }: { children: ReactNode; cancelLabel?: string }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-2">
      <Dialog.Close className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
        {cancelLabel}
      </Dialog.Close>
      {children}
    </div>
  );
}

export { Dialog };
