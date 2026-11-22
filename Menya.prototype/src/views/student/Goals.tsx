import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { achievements, goalLabel, goalProgress } from "../../lib/constants";
import AchievementShelf from "../../components/student/AchievementShelf";
import { useStudentAchievements } from "../../hooks/useStudentAchievements";
import { useStudentGoals } from "../../hooks/useStudentGoals";
import { useStudentActivity } from "../../context/StudentActivityContext";
import AddGoalModal from "../../components/AddGoalModal";
import { PageHeaderSubtitle, PageHeaderActions } from "../../context/PageHeaderContext";

export default function Goals() {
  const [addOpen, setAddOpen] = useState(false);
  const { goals, addGoal, removeGoal } = useStudentGoals();
  const { studyDaysThisWeek, sessionsThisWeek } = useStudentActivity();
  // Shared with My Journey, so both pages agree on what's earned.
  const badges = useStudentAchievements();

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>Set a goal, follow through, and it feeds your streak below</PageHeaderSubtitle>
      <PageHeaderActions>
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Set a Goal
        </button>
      </PageHeaderActions>

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
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {goals.map((g) => {
            const { current, target, pct } = goalProgress(g, { studyDaysThisWeek, sessionsThisWeek });
            return (
              <div key={g.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-medium text-foreground truncate">{goalLabel(g)}</p>
                    <span className="text-[11px] font-mono text-muted-foreground flex-shrink-0">{current}/{target} this week</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all bg-brand-amber" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <p className="text-lg font-display font-bold text-primary w-12 text-right flex-shrink-0">{pct}%</p>
                <button onClick={() => removeGoal(g.id)} aria-label="Remove goal"
                  className="text-muted-foreground hover:text-red-600 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Achievements — earned badges, then mystery badges with how to earn them */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-5">
          Achievements
          <span className="ml-2 text-xs font-mono text-muted-foreground">({badges.earned.length}/{achievements.length} earned)</span>
        </h2>
        <AchievementShelf data={badges} variant="full" />
      </div>

      {addOpen && <AddGoalModal onSave={addGoal} onClose={() => setAddOpen(false)} />}
    </div>
  );
}
