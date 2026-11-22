import { Check, Lock } from "lucide-react";
import { subjectColor, subjectTint } from "../../../lib/subject";

// The module's path as steps (Learn → Practice → Chapter test → Finish),
// standing in for tabs. Finished steps are filled with the subject colour,
// the open one is ringed, and Finish stays locked until the module's work is
// done. Text on a subject fill uses var(--card) for contrast in both themes.

export type StepId = "learn" | "practice" | "test" | "finish";
export interface Step { id: StepId; label: string; detail?: string; done: boolean; locked?: boolean }

export default function ModuleStepper({ steps, current, course, onSelect }: {
  steps: Step[];
  current: StepId;
  course: string;
  onSelect: (id: StepId) => void;
}) {
  const color = subjectColor(course);
  return (
    <ol className="flex items-start">
      {steps.map((s, i) => {
        const isCurrent = s.id === current;
        return (
          <li key={s.id} className="flex-1 flex flex-col items-center relative min-w-0">
            {/* Connector to the next step */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute top-[18px] left-1/2 w-full h-1 rounded-full"
                style={{ backgroundColor: s.done ? color : "var(--muted)" }}
              />
            )}
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              disabled={s.locked}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`${s.label}${s.detail ? `, ${s.detail}` : ""}${s.done ? ", done" : s.locked ? ", locked" : ""}`}
              className="relative z-10 flex flex-col items-center gap-1.5 group disabled:cursor-not-allowed"
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold motion-safe:transition-transform group-enabled:group-hover:scale-110"
                style={
                  s.done
                    ? { backgroundColor: color, color: "var(--card)" }
                    : isCurrent
                    ? { backgroundColor: "var(--card)", color, boxShadow: `inset 0 0 0 3px ${color}, 0 0 0 5px ${subjectTint(course, 20)}` }
                    : { backgroundColor: "var(--card)", color: "var(--muted-foreground)", boxShadow: "inset 0 0 0 2px var(--border)" }
                }
              >
                {s.done ? <Check className="w-5 h-5" strokeWidth={3} /> : s.locked ? <Lock className="w-4 h-4" /> : i + 1}
              </span>
              <span className={`text-xs sm:text-sm font-semibold leading-tight text-center ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {s.detail && <span className="text-[11px] font-mono text-muted-foreground -mt-1">{s.detail}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
