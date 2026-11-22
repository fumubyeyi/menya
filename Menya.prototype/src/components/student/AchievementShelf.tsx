import { useState, type CSSProperties } from "react";
import { HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { achievementHint, achievementTarget, achievementValue, type Achievement } from "../../lib/constants";
import type { useStudentAchievements } from "../../hooks/useStudentAchievements";

// The student's badge shelf: a row of icons on My Journey (5 at a time,
// under the streak) and the full shelf on Goals.
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

const PAGE = 5;

export default function AchievementShelf({ data, variant }: { data: Achievements; variant: "icons" | "full" }) {
  const { earned, locked, input, next, fresh } = data;
  const compact = variant === "icons";
  const size = compact ? 40 : 64;
  const [page, setPage] = useState(0);

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

  // My Journey: icons only, 5 at a time, earned first then the closest
  // locked ones. Names and hints are in each icon's tooltip and label.
  if (compact) {
    const all = [
      ...earned.map((a) => {
        const target = achievementTarget(a, input);
        return { a, earned: true as const, pct: 100, count: `${target}/${target}`, label: a.label };
      }),
      ...lockedSorted.map(({ a, current, target, pct }) => {
        const isNext = a.id === next?.achievement.id;
        return { a, earned: false as const, pct, count: `${current}/${target}`, label: `${isNext ? `Next: ${a.label}` : "Mystery badge"}. ${achievementHint(a, input)}` };
      }),
    ];
    const pages = Math.max(1, Math.ceil(all.length / PAGE));
    const current = Math.min(page, pages - 1);
    const shown = all.slice(current * PAGE, current * PAGE + PAGE);
    const arrow = "w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none flex-shrink-0";
    return (
      <div className="flex items-center gap-1">
        {pages > 1 && (
          <button type="button" onClick={() => setPage(current - 1)} disabled={current === 0} className={arrow} aria-label="Previous badges">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <ul className="flex-1 grid grid-cols-5 gap-1 justify-items-center">
          {shown.map((b) => (
            <li key={b.a.id} title={`${b.label} (${b.count})`} aria-label={`${b.label}, ${b.count}${b.earned ? ", earned" : ", locked"}`} className="flex flex-col items-center gap-1">
              {b.earned ? <EarnedBadge a={b.a} size={size} isNew={fresh.has(b.a.id)} /> : <LockedBadge a={b.a} size={size} pct={b.pct} />}
              {b.earned && fresh.has(b.a.id) ? (
                <span className="badge-new-tag text-[10px] font-bold px-1.5 rounded-full bg-brand-amber text-warning-foreground">New!</span>
              ) : (
                <span className={`text-[11px] font-mono leading-none ${b.earned ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{b.count}</span>
              )}
            </li>
          ))}
        </ul>
        {pages > 1 && (
          <button type="button" onClick={() => setPage(current + 1)} disabled={current === pages - 1} className={arrow} aria-label="More badges">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
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
