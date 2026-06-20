export default function Avatar({ name, size = 9 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const hue = (name.charCodeAt(0) * 7) % 360;
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
      style={{ backgroundColor: `hsl(${hue} 45% 38%)` }}
    >
      {initials}
    </div>
  );
}
