import type { ReactNode } from "react";

export const HERO_GRADIENT = "#FFFFFF";
const HERO_GLOW = "none";

// Shared light hero block used across the public pages and login experience.
export default function GradientBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mx-4 sm:mx-10 rounded-2xl overflow-hidden relative border border-border" style={{ background: HERO_GRADIENT }}>
      <div className="absolute inset-0" style={{ backgroundImage: HERO_GLOW }} />
      <div className="relative z-10 px-6 sm:px-8 py-10 sm:py-12 text-center max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
}
