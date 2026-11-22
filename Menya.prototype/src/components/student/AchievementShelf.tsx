import { useState, type CSSProperties } from "react";
import { HelpCircle } from "lucide-react";
import { achievementHint, achievementTarget, achievementValue, type Achievement } from "../../lib/constants";
import type { useStudentAchievements } from "../../hooks/useStudentAchievements";

// The student's badge shelf: a small row on Home (earned + next, under
// the streak) and the full shelf on Goals.
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

export default function AchievementShelf({ data, variant }: { data: Achievements; variant: "icons" | "full" }) {
  const { earned, locked, input, next, fresh } = data;
  const compact = variant === "icons";
  const size = compact ? 40 : 64;
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

  // Goals: the whole shelf. Only the badge to aim for next shows its name
  // and hint; the other locked ones are quiet mystery badges with a count.
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
            {isNext ? (
              <span className="text-xs text-muted-foreground leading-tight">{hint} · <span className="font-mono">{current}/{target}</span></span>
            ) : (
              <span className="text-xs font-mono text-muted-foreground">{current}/{target}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
