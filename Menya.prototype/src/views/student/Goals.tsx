import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { sofia } from "../../data";
import { achievements, goalLabel, goalProgress } from "../../lib/constants";
import { useStudentGoals } from "../../hooks/useStudentGoals";
import { useStudentActivity } from "../../context/StudentActivityContext";
import AddGoalModal from "../../components/AddGoalModal";

export default function Goals() {
  const [addOpen, setAddOpen] = useState(false);
  const { goals, addGoal, removeGoal } = useStudentGoals();
  const { streak, sessionsAttendedTotal, studyDaysThisWeek, sessionsThisWeek } = useStudentActivity();

  const achievementInput = { streak, progress: sofia.progress, sessions: sofia.sessions, sessionsAttended: sessionsAttendedTotal };
  const earnedAchievements = achievements.filter((a) => a.condition(achievementInput));
  const lockedAchievements = achievements.filter((a) => !a.condition(achievementInput));

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Goals &amp; Achievements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Set a goal, follow through, and it feeds your streak below</p>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Set a Goal
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-10 flex flex-col items-center text-center gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">No goals set yet</h3>
            <p className="text-xs text-muted-foreground mt-1">Commit to a study routine or attending your sessions — it's what earns your streak and achievements.</p>
          </div>
          <button onClick={() => setAddOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            Set a Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((g) => {
            const { current, target, pct } = goalProgress(g, { studyDaysThisWeek, sessionsThisWeek });
            return (
              <div key={g.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-mono text-muted-foreground leading-snug">{goalLabel(g)}</p>
                  <button onClick={() => removeGoal(g.id)} aria-label="Remove goal"
                    className="text-muted-foreground hover:text-red-600 transition-colors flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-4xl font-display font-bold leading-none text-primary">{pct}%</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{current} this week</span>
                  <span>Target: {target}/week</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

      {addOpen && <AddGoalModal onSave={addGoal} onClose={() => setAddOpen(false)} />}
    </div>
  );
}
