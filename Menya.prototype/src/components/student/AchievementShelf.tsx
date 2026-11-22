import { useState, type CSSProperties } from "react";
import { HelpCircle } from "lucide-react";
import { achievementHint, achievementTarget, achievementValue, type Achievement } from "../../lib/constants";
import type { useStudentAchievements } from "../../hooks/useStudentAchievements";

// The student's badge shelf: a small row on Home (earned + next, under
// the streak) and the full shelf on Goals.
// - Earned badges are in full colour. One earned since the student last
//   looked flips in with a burst of confetti and a "New!" tag, once.
// - Badges are drawn as medals (rosette + ribbon tails).
// - Locked badges are grey mystery medals with progress as an amber arc on
//   the inner ring, and a hint saying how to earn them. The badge the student is closest to
//   is named ("Almost there!"); the rest stay "Mystery badge" until then.

type Achievements = ReturnType<typeof useStudentAchievements>;

const CONFETTI = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + 0.3;
  const dist = 44 + (i % 3) * 10;
  return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, rot: (i * 47) % 360, delay: (i % 4) * 30 };
});

// Medal artwork, drawn in a 64 x 76 box: a scalloped rosette (centre 32,30)
// with two ribbon tails below. Earned medals are solid in the badge colour;
// locked ones are the same shape in grey, with an amber arc on the inner ring
// for progress.
const VB_W = 64;
const VB_H = 76;
const CX = 32;
const CY = 30;
const INNER_R = 19;
const ROSETTE = (() => {
  const points = 24;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? 28 : 25.5;
    const t = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${(CX + r * Math.cos(t)).toFixed(2)},${(CY + r * Math.sin(t)).toFixed(2)}`;
  }
  return d + "Z";
})();
const RIBBON_LEFT = "17,44 29,49 23,75 18.5,70 12,73";
const RIBBON_RIGHT = "47,44 35,49 41,75 45.5,70 52,73";

function Medal({ size, color, earned, pct = 0, children }: {
  size: number; color: string; earned: boolean; pct?: number; children: React.ReactNode;
}) {
  const w = size;
  const h = (size * VB_H) / VB_W;
  const circ = 2 * Math.PI * INNER_R;
  const dark = `color-mix(in srgb, ${color} 72%, black)`;
  return (
    <div className="relative" style={{ width: w, height: h }}>
      <svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 overflow-visible" aria-hidden>
        {/* Ribbon tails */}
        <polygon points={RIBBON_LEFT} fill={earned ? dark : "var(--border)"} />
        <polygon points={RIBBON_RIGHT} fill={earned ? dark : "var(--border)"} />
        {/* Rosette */}
        <path d={ROSETTE} fill={earned ? color : "var(--muted)"} stroke={earned ? dark : "var(--border)"} strokeWidth={1} strokeLinejoin="round"
          style={earned ? { filter: `drop-shadow(0 2px 3px ${color}55)` } : undefined} />
        {/* Inner disc and ring */}
        <circle cx={CX} cy={CY} r={INNER_R} fill={earned ? color : "var(--card)"} stroke={earned ? "white" : "var(--border)"} strokeOpacity={earned ? 0.85 : 1} strokeWidth={2} />
        {/* Locked: progress as an amber arc on the inner ring */}
        {!earned && pct > 0 && (
          <circle cx={CX} cy={CY} r={INNER_R} fill="none" stroke="var(--brand-amber)" strokeWidth={3}
            strokeDasharray={circ} strokeDashoffset={circ - (Math.min(pct, 100) / 100) * circ} strokeLinecap="round"
            transform={`rotate(-90 ${CX} ${CY})`} />
        )}
        {/* Earned: a soft shine across the top */}
        {earned && <ellipse cx={CX - 6} cy={CY - 9} rx={10} ry={5} fill="white" opacity={0.22} transform={`rotate(-25 ${CX - 6} ${CY - 9})`} />}
      </svg>
      {/* Icon, centred on the inner disc */}
      <div className="absolute flex items-center justify-center" style={{ left: 0, width: w, top: (CY / VB_H) * h - w * 0.2, height: w * 0.4 }}>
        {children}
      </div>
    </div>
  );
}

function EarnedBadge({ a, size, isNew }: { a: Achievement; size: number; isNew: boolean }) {
  return (
    <div className="relative">
      {isNew && (
        <span aria-hidden className="absolute inset-0 pointer-events-none">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="badge-confetti absolute left-1/2 top-[40%] w-1.5 h-2.5 rounded-sm"
              style={{
                backgroundColor: i % 3 === 0 ? "var(--brand-amber)" : i % 3 === 1 ? a.color : "var(--primary)",
                "--dx": `${c.dx}px`, "--dy": `${c.dy}px`, "--rot": `${c.rot}deg`,
                animationDelay: `${350 + c.delay}ms`, // starts as the badge lands
              } as CSSProperties}
            />
          ))}
        </span>
      )}
      <div className={isNew ? "badge-unlock" : ""}>
        <Medal size={size} color={a.color} earned>
          <a.Icon style={{ width: size * 0.3, height: size * 0.3, color: "white" }} strokeWidth={2.5} />
        </Medal>
      </div>
    </div>
  );
}

function LockedBadge({ a, size, pct }: { a: Achievement; size: number; pct: number }) {
  return (
    <div className="relative">
      <Medal size={size} color={a.color} earned={false} pct={pct}>
        {/* Silhouette of the badge's icon */}
        <a.Icon
          aria-hidden
          style={{ width: size * 0.3, height: size * 0.3, color: "var(--muted-foreground)", fill: "currentColor", opacity: 0.3 }}
        />
      </Medal>
      {/* "?" chip on the rosette's lower right */}
      <span
        aria-hidden
        className="absolute rounded-full bg-card flex items-center justify-center"
        style={{ width: size * 0.3, height: size * 0.3, left: size * 0.66, top: size * 0.56, boxShadow: "0 0 0 2px var(--card)" }}
      >
        <HelpCircle style={{ width: "100%", height: "100%", color: "var(--muted-foreground)" }} />
      </span>
    </div>
  );
}

export default function AchievementShelf({ data, variant }: { data: Achievements; variant: "icons" | "full" }) {
  const { earned, locked, input, next, fresh } = data;
  const compact = variant === "icons";
  const size = compact ? 40 : 76;
  // Which badge the caption under the icon row describes (tap/click/focus).
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Closest locked badges first, so the one to aim for leads the locked row.
  const lockedSorted = locked
    .map((a) => {
      const current = achievementValue(a, input);
      const target = achievementTarget(a, input);
      return { a, current, target, pct: Math.round((current / target) * 100) };
    })
    .sort((x, y) => y.pct - x.pct);

  const earnedItems = earned.map((a) => {
    const isNew = fresh.has(a.id);
    return (
      <li key={`earned-${a.id}`} className={`flex flex-col items-center text-center gap-1.5 ${compact ? "w-[72px]" : ""}`}>
        <EarnedBadge a={a} size={size} isNew={isNew} />
        <span className={`${compact ? "text-[11px]" : "text-sm"} font-semibold text-foreground leading-tight`}>{a.label}</span>
        {isNew && (
          <span className="badge-new-tag text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-amber text-warning-foreground">New!</span>
        )}
      </li>
    );
  });

  // Home: kept calm on purpose. Just the earned badges and the one to
  // aim for next, with one line about it underneath. Mystery badges and the
  // full set live on the Goals page ("See all"). Tapping or focusing an
  // earned badge swaps that line for its name, so names work on touch too.
  if (compact) {
    const nextLocked = lockedSorted.find(({ a }) => a.id === next?.achievement.id);
    const unit: Record<string, string> = { streak: "days", sessions: "sessions", sessionsAttended: "live sessions", modules: "modules" };
    const nextLine = nextLocked
      ? <><span className="font-bold">Next: {nextLocked.a.label}</span> · <span className="font-mono">{nextLocked.current}/{nextLocked.target}</span> {unit[nextLocked.a.metric]}</>
      : <span className="font-bold">Every badge earned!</span>;
    const picked = earned.find((a) => a.id === selectedId);
    const caption = picked ? <><span className="font-bold">{picked.label}</span> · Earned!</> : nextLine;

    return (
      <div>
        <ul className="flex flex-wrap items-center gap-2">
          {earned.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setSelectedId(a.id)}
                onFocus={() => setSelectedId(a.id)}
                onBlur={() => setSelectedId(null)}
                aria-label={`${a.label}, earned`}
                title={a.label}
                className={`relative block rounded-full ${selectedId === a.id ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-card" : ""}`}
              >
                <EarnedBadge a={a} size={size} isNew={fresh.has(a.id)} />
              </button>
            </li>
          ))}
          {nextLocked && (
            <li title={`Next: ${nextLocked.a.label}`} aria-label={`Next badge: ${nextLocked.a.label}, ${nextLocked.current} of ${nextLocked.target}`}>
              <LockedBadge a={nextLocked.a} size={size} pct={nextLocked.pct} />
            </li>
          )}
        </ul>
        <p className="mt-2.5 text-xs text-foreground" aria-live="polite">{caption}</p>
      </div>
    );
  }

  // Goals: the whole shelf. Only the badge to aim for next shows its name;
  // the other locked ones stay mystery badges, but every locked badge says
  // how to earn it, so its count means something.
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-3 gap-y-6">
      {earnedItems}
      {lockedSorted.map(({ a, current, target, pct }) => {
        const isNext = a.id === next?.achievement.id;
        const hint = achievementHint(a, input);
        return (
          <li
            key={`locked-${a.id}`}
            className="flex flex-col items-center text-center gap-1.5"
            aria-label={`${isNext ? a.label : "Mystery badge"}, locked. ${hint}. ${current} of ${target}.`}
          >
            <LockedBadge a={a} size={size} pct={pct} />
            <span className={`text-sm font-semibold leading-tight ${isNext ? "text-foreground" : "text-muted-foreground"}`}>
              {isNext ? a.label : "Mystery badge"}
            </span>
            <span className="text-xs text-muted-foreground leading-tight">{hint} · <span className="font-mono">{current}/{target}</span></span>
          </li>
        );
      })}
    </ul>
  );
}
