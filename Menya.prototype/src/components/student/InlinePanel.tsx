import { useEffect, useRef, type ReactNode } from "react";

// The shared shell for student forms that open on the page instead of in a
// modal: an outlined box with a title, the form, and Cancel / primary action.
// Because it isn't a modal, it works to draw the eye: a primary border and
// tint, a soft shadow, a short slide-in, and on open it scrolls into view
// and focuses its first control.
export default function InlinePanel({ title, subtitle, children, onCancel, action, footerNote }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onCancel: () => void;
  action: ReactNode;
  footerNote?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    el.querySelector<HTMLElement>("button, input, textarea, select")?.focus({ preventScroll: true });
  }, []);

  return (
    <div ref={ref} role="region" aria-label={title}
      className="panel-in scroll-mt-4 border-2 border-primary bg-primary/[0.04] shadow-lg shadow-primary/10 rounded-xl p-5 space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-muted-foreground">{footerNote}</div>
        <div className="flex items-center gap-2 ml-auto">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
          {action}
        </div>
      </div>
    </div>
  );
}

// Pill-style choice button used inside the inline forms.
export function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${selected ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold text-foreground mb-2">{children}</p>;
}

export const primaryBtn = "px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
