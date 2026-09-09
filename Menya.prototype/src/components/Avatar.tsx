// One neutral slate for every name persona — kept identical across all views
// rather than a per-name hue, in line with the app's restrained palette.
const AVATAR_BG = "#5E6B72";

export default function Avatar({ name, size = 9 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  // Pixel size via inline style, not a `w-${size} h-${size}` template class —
  // Tailwind can't statically see a runtime-built class name, so it only ever
  // generated whichever w-N/h-N pairs happened to appear literally elsewhere
  // in the app. Sizes without both (e.g. 16) got no fixed height at all,
  // leaving the circle stretched into a pill by the initials' text width.
  const px = size * 4; // Tailwind's spacing scale: 1 unit = 0.25rem = 4px
  return (
    <div
      className="rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
      style={{ width: px, height: px, backgroundColor: AVATAR_BG }}
    >
      {initials}
    </div>
  );
}
