import { sofia, studentGoals } from "../../data";
import { achievements } from "../../lib/constants";

const earnedAchievements = achievements.filter((a) => a.condition(sofia));
const lockedAchievements = achievements.filter((a) => !a.condition(sofia));

export default function Goals() {
  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Goals &amp; Achievements</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your progress toward each goal</p>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {studentGoals.map((g, i) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
              <p className="text-xs font-mono text-muted-foreground leading-snug">{g.label}</p>
              <p className="text-4xl font-display font-bold leading-none" style={{ color: g.color }}>{pct}%</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: g.color }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>{g.current} {g.unit}</span>
                <span>Target: {g.target} {g.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Earned Achievements */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Achievements Earned
          <span className="ml-2 text-xs font-mono text-muted-foreground">({earnedAchievements.length}/{achievements.length})</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {earnedAchievements.map((a) => (
            <div key={a.id} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border border-border text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${a.color}18` }}
              >
                <a.Icon className="w-5 h-5" style={{ color: a.color }} />
              </div>
              <p className="text-[11px] font-medium text-foreground leading-tight">{a.label}</p>
              <p className="text-[10px] font-mono text-emerald-600">Earned ✓</p>
            </div>
          ))}
        </div>
      </div>

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Locked</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 opacity-50">
            {lockedAchievements.map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/20 border border-border text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted">
                  <a.Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-[11px] font-medium text-muted-foreground leading-tight">{a.label}</p>
                <p className="text-[10px] font-mono text-muted-foreground">Locked</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
