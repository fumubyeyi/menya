import { AlertTriangle, GraduationCap } from "lucide-react";
import Diagram from "./diagrams";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../app/components/ui/sheet";
import type { ModuleWorkspaceContent } from "../lib/constants";

// The module's reading material — reused as-is inside the Content tab and inside
// this drawer, so there's exactly one definition of "what module content looks like".
export function ModuleContentBody({ workspace }: { workspace: ModuleWorkspaceContent }) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {!workspace.isAuthored && (
          <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-amber-50 border border-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">Content not yet available for this module.</p>
          </div>
        )}
        {workspace.content.map((p, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">{p}</p>
        ))}
        {workspace.diagram && <Diagram spec={workspace.diagram} />}
      </div>

      {workspace.workedExample && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Worked Example</h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{workspace.workedExample.prompt}</p>
          <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Full Solution</p>
            <p className="text-sm text-foreground leading-relaxed">{workspace.workedExample.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: ModuleWorkspaceContent;
  moduleTitle: string;
}

// Lets a student peek at the module content while mid-exercise without leaving
// Exercises mode — a Radix Dialog overlay, so the exercise underneath stays
// mounted and its in-progress attempt is never touched.
export default function ContentDrawer({ open, onOpenChange, workspace, moduleTitle }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{moduleTitle}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          <ModuleContentBody workspace={workspace} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
