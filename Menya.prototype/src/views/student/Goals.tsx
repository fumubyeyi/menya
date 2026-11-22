import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { achievements, goalLabel, goalProgress } from "../../lib/constants";
import AchievementShelf from "../../components/student/AchievementShelf";
import { useStudentAchievements } from "../../hooks/useStudentAchievements";
import { useStudentGoals } from "../../hooks/useStudentGoals";
import { useStudentActivity } from "../../context/StudentActivityContext";
import GoalDialog from "../../components/student/GoalDialog";
import { PageHeaderSubtitle } from "../../context/PageHeaderContext";
import type { NewStudentGoal } from "../../types";

// One-tap starter goals for the empty state (same shapes the Set a Goal
// dialog saves).
const STARTER_GOALS: NewStudentGoal[] = [
  { type: "study-time", minutesPerSession: 30, timesPerWeek: 3 },
  { type: "session-attendance", targetPerWeek: 1 },
];

export default function Goals() {
  const [addOpen, setAddOpen] = useState(false);
  const { goals, addGoal, removeGoal } = useStudentGoals();
  const { studyDaysThisWeek, sessionsThisWeek } = useStudentActivity();
  // Shared with Home, so both pages agree on what's earned.
  const badges = useStudentAchievements();

  return (
    // Same width and padding as My Courses.
    <div className="p-6 max-w-screen-xl mx-auto space-y-10">
      <PageHeaderSubtitle>Set a goal, follow through, and it feeds your streak below</PageHeaderSubtitle>

      {/* This week's goals: a heading with Set a Goal on the right (like
          Request Session on My Schedule), goals as outlined rows. */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-display font-bold text-foreground">This week's goals</h2>
          <button onClick={() => setAddOpen(true)} data-goal-trigger aria-haspopup="dialog"
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Set a Goal
          </button>
        </div>
        {goals.length === 0 ? (
          // Empty: one-tap starter goals, so a student is a click away from one.
          <div className="border border-border rounded-xl px-5 py-4">
            <p className="text-sm text-foreground">No goals yet. A weekly goal keeps your streak going. Pick one to start:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STARTER_GOALS.map((g, i) => (
                <button key={i} onClick={() => addGoal(g)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-primary/40 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
                  <Plus className="w-4 h-4" /> {g.type === "study-time"
                    ? `Study ${g.minutesPerSession} min, ${g.timesPerWeek} days a week`
                    : `Attend ${g.targetPerWeek} session a week`}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="border border-border rounded-xl divide-y divide-border">
            {goals.map((g) => {
              const { current, target, pct } = goalProgress(g, { studyDaysThisWeek, sessionsThisWeek });
              return (
                <li key={g.id} className="flex items-center gap-4 px-5 py-3.5">
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
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Set a Goal: a small modal */}
      <GoalDialog open={addOpen} onOpenChange={setAddOpen} onSave={addGoal} />

      {/* Achievements: earned badges, then locked ones with how to earn them. */}
      <section>
        <h2 className="text-lg font-display font-bold text-foreground mb-5">
          Achievements
          <span className="ml-2 text-sm font-normal text-muted-foreground">{badges.earned.length} of {achievements.length} earned</span>
        </h2>
        <AchievementShelf data={badges} variant="full" />
      </section>

    </div>
  );
}
