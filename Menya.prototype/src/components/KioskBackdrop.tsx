import type { CSSProperties, ReactNode } from "react";

// Two of the four brand colours from guidelines/menya-logo-colors.md — slate and
// amber only, a handful of large shapes rather than scattered small ones. Note
// this deliberately runs past the doc's "one small amber spark" rule: a kiosk
// read from across a room needs warmth the marketing pages don't.
const SLATE = "#2F4F4F";
const AMBER = "#F0981E";
const WEDGE_RIGHT = "polygon(100% 0, 100% 100%, 0 100%)";
const WEDGE_LEFT = "polygon(0 0, 0 100%, 100% 100%)";

// Flat, hard-edged brand shapes scattered down both gutters — gives the kiosk's
// centered card something to sit against, in the same graphic register as the
// app's type rather than a soft blur or a repeating texture. Kept as a
// list so the composition is easy to re-tune in one place.
//
// Opacities stay in the 0.08–0.14 band on purpose: from a step or two away these
// should register as a tint on the wall behind the cards, never as something a
// tutor's eye stops on before it finds their own name.
const SHAPES: { className: string; style: CSSProperties }[] = [
  // Left: a big slate anchor bleeding off the edge, then rings and accents down the gutter.
  { className: "top-16 -left-28 w-80 h-80 rounded-full", style: { backgroundColor: SLATE, opacity: 0.1 } },
  { className: "top-[34%] left-24 w-40 h-40 rounded-full border-[14px]", style: { borderColor: AMBER, opacity: 0.14 } },
  { className: "bottom-36 left-24 w-28 h-28 rounded-full", style: { backgroundColor: AMBER, opacity: 0.11 } },
  { className: "-bottom-6 -left-10 w-64 h-64", style: { backgroundColor: SLATE, opacity: 0.1, clipPath: WEDGE_LEFT } },
  // Right: mirrored rhythm, with the big ring and wedge running off the edge.
  { className: "top-28 right-16 w-32 h-32 rounded-full border-[10px]", style: { borderColor: SLATE, opacity: 0.12 } },
  { className: "top-[38%] -right-24 w-96 h-96 rounded-full border-[22px]", style: { borderColor: SLATE, opacity: 0.09 } },
  { className: "bottom-10 -right-16 w-80 h-80", style: { backgroundColor: AMBER, opacity: 0.09, clipPath: WEDGE_RIGHT } },
];

// Shared by both check-in kiosks so their backgrounds can't drift apart.
export default function KioskBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F1F4F5] flex flex-col items-center px-6 py-10 sm:py-14">
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
