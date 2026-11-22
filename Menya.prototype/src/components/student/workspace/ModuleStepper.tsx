import { Check, Lock } from "lucide-react";

// The module's path as steps (Learn → Practice → Chapter test → Finish),
// standing in for tabs. One compact row: a small numbered stop with its
// label beside it, joined by a line. Finished steps are filled with the
// primary colour, the open one is ringed, and Finish stays locked until the
// module's work is done. On phones only the open step keeps its label.

export type StepId = "learn" | "practice" | "test" | "finish";
export interface Step { id: StepId; label: string; detail?: string; done: boolean; locked?: boolean }

export default function ModuleStepper({ steps, current, onSelect }: {
  steps: Step[];
  current: StepId;
  onSelect: (id: StepId) => void;
}) {
  return (
    <ol className="flex items-center gap-2 min-w-0">
      {steps.map((s, i) => {
        const isCurrent = s.id === current;
        return (
          <li key={s.id} className={`flex items-center gap-2 min-w-0 ${i < steps.length - 1 ? "flex-1" : ""}`}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              disabled={s.locked}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`${s.label}${s.detail ? `, ${s.detail}` : ""}${s.done ? ", done" : s.locked ? ", locked" : ""}`}
              className="flex items-center gap-1.5 flex-shrink-0 rounded-full disabled:cursor-not-allowed"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={
                  s.done
                    ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                    : isCurrent
                    ? { backgroundColor: "var(--card)", color: "var(--primary)", boxShadow: "inset 0 0 0 2.5px var(--primary), 0 0 0 4px color-mix(in srgb, var(--primary) 18%, transparent)" }
                    : { backgroundColor: "var(--card)", color: "var(--muted-foreground)", boxShadow: "inset 0 0 0 2px var(--border)" }
                }
              >
                {s.done ? <Check className="w-4 h-4" strokeWidth={3} /> : s.locked ? <Lock className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-sm font-semibold whitespace-nowrap ${isCurrent ? "text-foreground" : "hidden sm:inline text-muted-foreground"}`}>
                {s.label}
                {s.detail && <span className="ml-1 text-xs font-mono font-normal text-muted-foreground">{s.detail}</span>}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="flex-1 min-w-3 h-0.5 rounded-full"
                style={{ backgroundColor: s.done ? "var(--primary)" : "var(--border)" }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
