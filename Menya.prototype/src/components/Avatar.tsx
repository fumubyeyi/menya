// One neutral slate for every name persona — kept identical across all views
// rather than a per-name hue, in line with the app's restrained palette.
const AVATAR_BG = "#5E6B72";

export default function Avatar({ name, size = 9 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
      style={{ backgroundColor: AVATAR_BG }}
    >
      {initials}
    </div>
  );
}
