import type { ReactNode } from "react";

// "lg" is the kiosk variant — those screens are read from a step or two away, so
// the label carries more weight there than it does inline on a marketing page.
export default function Eyebrow({ children, size = "sm" }: { children: ReactNode; size?: "sm" | "lg" }) {
  return (
    <p className={`font-mono uppercase tracking-[0.18em] text-primary/70 mb-3 ${size === "lg" ? "text-base sm:text-xl" : "text-xs"}`}>
      {children}
    </p>
  );
}
