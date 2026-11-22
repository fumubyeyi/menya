import type { CSSProperties } from "react";
import { HelpCircle } from "lucide-react";
import { achievementHint, type Achievement } from "../../lib/constants";
import type { useStudentAchievements } from "../../hooks/useStudentAchievements";

// The student's badge shelf, on My Journey (compact) and Goals (full).
// - Earned badges are in full colour. One earned since the student last
//   looked flips in with a burst of confetti and a "New!" tag, once.
// - Locked badges are mystery silhouettes with a progress ring around them
//   and a hint saying how to earn them. The badge the student is closest to
//   is named ("Almost there!"); the rest stay "Mystery badge" until then.

type Achievements = ReturnType<typeof useStudentAchievements>;

const CONFETTI = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + 0.3;
  const dist = 44 + (i % 3) * 10;
  return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, rot: (i * 47) % 360, delay: (i % 4) * 30 };
});

function ProgressRing({ pct, size, children }: { pct: number; size: number; children: React.ReactNode }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={4} />
        {pct > 0 && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--brand-amber)" strokeWidth={4}
            strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ} strokeLinecap="round" />
        )}
      </svg>
      {children}
    </div>
  );
}

function EarnedBadge({ a, size, isNew }: { a: Achievement; size: number; isNew: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {isNew && (
        <span aria-hidden className="absolute inset-0 pointer-events-none">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="badge-confetti absolute left-1/2 top-1/2 w-1.5 h-2.5 rounded-sm"
              style={{
                backgroundColor: i % 3 === 0 ? "var(--brand-amber)" : i % 3 === 1 ? a.color : "var(--primary)",
                "--dx": `${c.dx}px`, "--dy": `${c.dy}px`, "--rot": `${c.rot}deg`,
                animationDelay: `${350 + c.delay}ms`, // starts as the badge lands
              } as CSSProperties}
            />
          ))}
        </span>
      )}
      <div
        className={`rounded-full flex items-center justify-center ${isNew ? "badge-unlock" : ""}`}
        style={{ width: size, height: size, backgroundColor: `${a.color}22`, boxShadow: `inset 0 0 0 3px ${a.color}55` }}
      >
        <a.Icon style={{ width: size * 0.45, height: size * 0.45, color: a.color }} />
      </div>
    </div>
  );
}

function LockedBadge({ a, size, pct }: { a: Achievement; size: number; pct: number }) {
  return (
    <ProgressRing pct={pct} size={size}>
      {/* Silhouette: the badge's shape as a solid grey fill, with a "?" chip */}
      <a.Icon
        aria-hidden
        style={{ width: size * 0.46, height: size * 0.46, color: "var(--muted-foreground)", fill: "currentColor", opacity: 0.28 }}
      />
      <span
        aria-hidden
        className="absolute rounded-full bg-card flex items-center justify-center"
        style={{ width: size * 0.34, height: size * 0.34, right: size * 0.06, bottom: size * 0.06, boxShadow: "0 0 0 2px var(--card)" }}
      >
        <HelpCircle style={{ width: "100%", height: "100%", color: "var(--muted-foreground)" }} />
      </span>
    </ProgressRing>
  );
}

export default function AchievementShelf({ data, variant }: { data: Achievements; variant: "compact" | "full" }) {
  const { earned, locked, input, next, fresh } = data;
  const size = variant === "compact" ? 48 : 64;

  // Closest locked badges first, so "Almost there" leads the locked row.
  const lockedSorted = locked
    .map((a) => {
      const current = Math.min(input[a.metric] ?? 0, a.target);
      return { a, current, pct: Math.round((current / a.target) * 100) };
    })
    .sort((x, y) => y.pct - x.pct);

  const grid = variant === "compact"
    ? "grid grid-cols-3 gap-x-2 gap-y-4"
    : "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-3 gap-y-6";
  const nameCls = variant === "compact" ? "text-[11px]" : "text-sm";
  const hintCls = variant === "compact" ? "text-[10px]" : "text-xs";

  return (
    <ul className={grid}>
      {earned.map((a) => {
        const isNew = fresh.has(a.id);
        return (
          <li key={`earned-${a.id}`} className="flex flex-col items-center text-center gap-1.5">
            <EarnedBadge a={a} size={size} isNew={isNew} />
            <span className={`${nameCls} font-semibold text-foreground leading-tight`}>{a.label}</span>
            {isNew ? (
              <span className="badge-new-tag text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-amber text-warning-foreground">
                New!
              </span>
            ) : (
              variant === "full" && <span className={`${hintCls} text-muted-foreground leading-tight`}>{achievementHint(a)}</span>
            )}
          </li>
        );
      })}
      {lockedSorted.map(({ a, current, pct }) => {
        const isNext = next?.achievement.id === a.id;
        const almost = isNext && pct >= 50;
        const hint = achievementHint(a);
        return (
          <li
            key={`locked-${a.id}`}
            className="flex flex-col items-center text-center gap-1.5"
            aria-label={`${isNext ? a.label : "Mystery badge"}, locked. ${hint}. ${current} of ${a.target}.`}
          >
            <LockedBadge a={a} size={size} pct={pct} />
            <span className={`${nameCls} font-semibold leading-tight ${isNext ? "text-foreground" : "text-muted-foreground"}`}>
              {isNext ? a.label : "Mystery badge"}
            </span>
            {almost && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-amber/20 text-foreground">Almost there!</span>
            )}
            <span className={`${hintCls} text-muted-foreground leading-tight`}>
              {hint} · <span className="font-mono">{current}/{a.target}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
