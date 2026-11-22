import { useEffect } from "react";
import { Link } from "react-router";
import confetti from "canvas-confetti";
import { RotateCcw, Trophy } from "lucide-react";
import { achievementGapLabel } from "../../../lib/constants";
import { formatMinutes } from "../../../hooks/useModuleTime";
import type { useStudentAchievements } from "../../../hooks/useStudentAchievements";

// The end-of-module screen: score, XP, time spent, the next badge, and a big
// "Next module" button so the student always knows where to go next.

interface Props {
  course: string;
  moduleTitle: string;
  correct: number;
  total: number;
  xp: number;
  seconds: number;
  nextBadge: ReturnType<typeof useStudentAchievements>["next"];
  next: { href: string; label: string; title: string } | null;
  onReview: () => void;
}

export default function ModuleComplete({ course, moduleTitle, correct, total, xp, seconds, nextBadge, next, onReview }: Props) {
  const color = "var(--primary)";

  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 }, disableForReducedMotion: true });
  }, []);

  const headline = correct === total ? "Perfect score!" : correct / Math.max(total, 1) >= 0.6 ? "Module complete!" : "You finished it!";
  const sub = correct === total
    ? "Every answer right. Brilliant."
    : correct / Math.max(total, 1) >= 0.6
    ? "Great work. Keep that momentum going."
    : "Finishing is a win. Practice the tricky ones again whenever you like.";

  const stats = [
    { label: "Correct", value: `${correct}/${total}` },
    { label: "XP earned", value: `+${xp}` },
    { label: "Time", value: formatMinutes(seconds) },
  ];

  return (
    <div
      className="bg-card border border-border rounded-xl p-6 sm:p-10 text-center space-y-6"
      style={{ backgroundImage: "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 60%)" }}
    >
      <div className="answer-bounce mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--primary) 14%, transparent)" }}>
        <Trophy className="w-10 h-10" style={{ color }} />
      </div>
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">{headline}</h2>
        <p className="text-muted-foreground mt-1">{moduleTitle}</p>
        <p className="text-sm text-foreground mt-2">{sub}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-background px-2 py-3">
            <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
            <p className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {nextBadge && (
        <div className="max-w-md mx-auto flex items-center gap-3 text-left rounded-xl border border-border px-4 py-3">
          <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${nextBadge.achievement.color}1F` }}>
            <nextBadge.achievement.Icon className="w-5 h-5" style={{ color: nextBadge.achievement.color }} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-bold">{achievementGapLabel(nextBadge.achievement.metric, nextBadge.remaining)}</span> to unlock{" "}
              <span className="font-bold">{nextBadge.achievement.label}</span>
            </p>
            <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-brand-amber" style={{ width: `${nextBadge.pct}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {next ? (
          <Link
            to={next.href}
            className="flex items-center gap-2 px-7 py-3 rounded-full text-base font-bold hover:brightness-110 motion-safe:transition"
            style={{ backgroundColor: color, color: "var(--primary-foreground)" }}
          >
            {next.label}
          </Link>
        ) : (
          <Link to="/student/home" className="flex items-center gap-2 px-7 py-3 rounded-full text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90">
            Back to Home
          </Link>
        )}
        <button type="button" onClick={onReview} className="flex items-center gap-1.5 px-4 py-3 rounded-full text-sm font-semibold text-foreground hover:bg-muted">
          <RotateCcw className="w-4 h-4" /> Review answers
        </button>
      </div>
      {next && <p className="text-xs text-muted-foreground -mt-3">Up next: {next.title}</p>}
    </div>
  );
}
