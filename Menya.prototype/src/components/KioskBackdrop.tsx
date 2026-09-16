import type { CSSProperties, ReactNode } from "react";

// Sampled straight out of the Menya mark: the hexagon's amber-to-gold gradient,
// the figure's dark slate-teal, and its mint and pale-blue highlights.
const AMBER = "#F0A030";
const GOLD = "#F0C040";
const DARK = "#304040";
const MINT = "#50B090";
const ICE = "#D0E0F0";
const WEDGE_RIGHT = "polygon(100% 0, 100% 100%, 0 100%)";
const WEDGE_LEFT = "polygon(0 0, 0 100%, 100% 100%)";

// Flat, hard-edged brand shapes scattered down both gutters — gives the kiosk's
// centered card something to sit against, in the same graphic register as the
// app's serif/mono type rather than a soft blur or a repeating texture. Kept as a
// list so the composition is easy to re-tune in one place.
const SHAPES: { className: string; style: CSSProperties }[] = [
  // Left: a big amber anchor bleeding off the edge, then rings and accents down the gutter.
  { className: "top-16 -left-28 w-80 h-80 rounded-full", style: { backgroundColor: AMBER, opacity: 0.1 } },
  { className: "top-[34%] left-24 w-40 h-40 rounded-full border-[14px]", style: { borderColor: MINT, opacity: 0.16 } },
  { className: "top-[28%] left-60 w-12 h-12 rounded-full", style: { backgroundColor: GOLD, opacity: 0.22 } },
  { className: "top-[54%] left-14 w-32 h-32 rotate-45 border-[10px]", style: { borderColor: DARK, opacity: 0.12 } },
  { className: "bottom-36 left-24 w-28 h-28 rounded-full", style: { backgroundColor: ICE, opacity: 0.55 } },
  { className: "bottom-20 left-60 w-12 h-12 rounded-full", style: { backgroundColor: AMBER, opacity: 0.18 } },
  { className: "-bottom-6 -left-10 w-64 h-64", style: { backgroundColor: MINT, opacity: 0.14, clipPath: WEDGE_LEFT } },
  // Right: mirrored rhythm, with the mint ring and amber wedge running off the edge.
  { className: "top-14 right-56 w-12 h-12 rounded-full", style: { backgroundColor: DARK, opacity: 0.15 } },
  { className: "top-28 right-16 w-32 h-32 rounded-full border-[10px]", style: { borderColor: GOLD, opacity: 0.2 } },
  { className: "top-[38%] -right-24 w-96 h-96 rounded-full border-[22px]", style: { borderColor: MINT, opacity: 0.13 } },
  { className: "top-[62%] right-64 w-16 h-16 rotate-45", style: { backgroundColor: DARK, opacity: 0.12 } },
  { className: "bottom-44 right-72 w-14 h-14 rounded-full", style: { backgroundColor: ICE, opacity: 0.6 } },
  { className: "bottom-10 -right-16 w-80 h-80", style: { backgroundColor: AMBER, opacity: 0.13, clipPath: WEDGE_RIGHT } },
];

// Shared by both check-in kiosks so their backgrounds can't drift apart.
export default function KioskBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F1F4F5] flex flex-col items-center px-6 py-10 sm:py-14" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {SHAPES.map((shape, i) => (
          <div key={i} className={`absolute ${shape.className}`} style={shape.style} />
        ))}
      </div>
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
