import type { ReactNode } from "react";

export const HERO_GRADIENT = "linear-gradient(180deg, #2F4F4F 0%, #253838 60%, #1A2525 100%)";
const HERO_GLOW = "radial-gradient(circle at 30% 20%, #708090 0%, transparent 60%), radial-gradient(circle at 80% 80%, #4E5E65 0%, transparent 55%)";

// Shared dark-slate hero block used at the top of every public page (About,
// Contact, Success Stories, Login) — keeps the gradient/glow treatment in
// one place instead of duplicated inline styles per page.
export default function GradientBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mx-4 sm:mx-10 rounded-2xl overflow-hidden relative" style={{ background: HERO_GRADIENT }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: HERO_GLOW }} />
      <div className="relative z-10 px-6 sm:px-8 py-8 sm:py-8 text-center max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
}
