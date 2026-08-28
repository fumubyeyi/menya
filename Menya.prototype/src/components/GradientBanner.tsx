import type { ReactNode } from "react";

export const HERO_GRADIENT = "linear-gradient(180deg, #1B5E4F 0%, #0d3b30 60%, #0a2d24 100%)";
const HERO_GLOW = "radial-gradient(circle at 30% 20%, #4ADE80 0%, transparent 60%), radial-gradient(circle at 80% 80%, #F0981E 0%, transparent 50%)";

// Shared dark-green hero block used at the top of every public page (About,
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
