import type { ReactNode } from "react";
import { Flame } from "lucide-react";

// The streak as the headline number on Home. The flame grows with the
// streak (capped at 10 days so it never outgrows the card) and flickers
// gently, except for students who've asked for reduced motion. Amber is the
// brand's "win" colour, so it's used for the flame only; the number stays in
// the foreground colour because amber text fails contrast on a light card.
// `action` is an optional line under the streak text (e.g. "Set a weekly
// goal" when the student has none); `children` render below the streak,
// e.g. the badge icons on Home.
export default function StreakCard({ streak, action, children }: { streak: number; action?: ReactNode; children?: ReactNode }) {
  const lit = streak > 0;
  const flameSize = 40 + Math.min(streak, 10) * 4;

  return (
    <div
      className="bg-card border border-border rounded-xl p-5 lg:bg-transparent lg:border-0 lg:rounded-none lg:px-0 lg:py-6 flex flex-col gap-4"
      style={lit ? { backgroundImage: "linear-gradient(135deg, color-mix(in srgb, var(--brand-amber) 16%, transparent), transparent 70%)" } : undefined}
    >
      <div className="flex items-center gap-4">
      <div className="w-[84px] h-[84px] flex items-center justify-center flex-shrink-0">
        <Flame
          className={lit ? "flame-flicker" : ""}
          style={{
            width: flameSize,
            height: flameSize,
            color: lit ? "var(--brand-amber)" : "var(--muted-foreground)",
            fill: lit ? "color-mix(in srgb, var(--brand-amber) 35%, transparent)" : "none",
            opacity: lit ? 1 : 0.5,
          }}
          aria-hidden
        />
      </div>
      <div className="min-w-0">
        {lit ? (
          <>
            <p className="font-display font-bold text-foreground leading-none">
              <span className="text-5xl">{streak}</span>
              <span className="text-lg ml-1.5">day{streak === 1 ? "" : "s"}</span>
            </p>
            <p className="text-sm font-semibold text-foreground mt-1.5">practicing in a row. You're on fire!</p>
            <p className="text-xs text-muted-foreground mt-0.5">Practice today to keep it going.</p>
            {action}
          </>
        ) : (
          <>
            <p className="font-display font-bold text-foreground text-xl leading-tight">Start a streak</p>
            <p className="text-xs text-muted-foreground mt-1">Answer one practice question today. Practice every day and your flame grows.</p>
            {action}
          </>
        )}
      </div>
      </div>
      {children && <div className="pt-4 border-t border-border">{children}</div>}
    </div>
  );
}
