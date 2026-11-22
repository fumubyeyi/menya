import { Flame } from "lucide-react";

// The streak as the headline number on My Journey. The flame grows with the
// streak (capped at 10 days so it never outgrows the card) and flickers
// gently, except for students who've asked for reduced motion. Amber is the
// brand's "win" colour, so it's used for the flame only; the number stays in
// the foreground colour because amber text fails contrast on a light card.
export default function StreakCard({ streak }: { streak: number }) {
  const lit = streak > 0;
  const flameSize = 40 + Math.min(streak, 10) * 4;

  return (
    <div
      className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 h-full"
      style={lit ? { backgroundImage: "linear-gradient(135deg, color-mix(in srgb, var(--brand-amber) 16%, transparent), transparent 70%)" } : undefined}
    >
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
            <p className="text-sm font-semibold text-foreground mt-1.5">in a row. You're on fire!</p>
            <p className="text-xs text-muted-foreground mt-0.5">Practise today to keep it going.</p>
          </>
        ) : (
          <>
            <p className="font-display font-bold text-foreground text-xl leading-tight">Light your flame</p>
            <p className="text-xs text-muted-foreground mt-1">Answer one practice question today to start a streak.</p>
          </>
        )}
      </div>
    </div>
  );
}
