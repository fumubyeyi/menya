import { useState } from "react";
import { Clock, Users } from "lucide-react";
import type { NewStudentGoal } from "../../types";
import StudentDialog, { DialogActions } from "./StudentDialog";
import { Choice, FieldLabel, primaryBtn } from "./InlinePanel";

const MINUTE_OPTIONS = [15, 30, 45, 60];
const TIMES_OPTIONS = [1, 2, 3, 4, 5];
const SESSIONS_OPTIONS = [1, 2, 3];

// Set a Goal, as a small modal.
export default function GoalDialog({ open, onOpenChange, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (goal: NewStudentGoal) => void;
}) {
  const [type, setType] = useState<"study-time" | "session-attendance">("study-time");
  const [minutesPerSession, setMinutesPerSession] = useState(30);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [targetPerWeek, setTargetPerWeek] = useState(1);

  const save = () => {
    onSave(type === "study-time" ? { type, minutesPerSession, timesPerWeek } : { type, targetPerWeek });
    onOpenChange(false);
  };

  return (
    <StudentDialog open={open} onOpenChange={onOpenChange} title="Set a goal" description="Pick something you'll actually stick to." returnFocus="[data-goal-trigger]">
      <div className="space-y-5">
        <div>
          <FieldLabel>What kind of goal?</FieldLabel>
          <div className="flex flex-wrap gap-2">
            <Choice selected={type === "study-time"} onClick={() => setType("study-time")}><Clock className="w-4 h-4" /> Study on my own</Choice>
            <Choice selected={type === "session-attendance"} onClick={() => setType("session-attendance")}><Users className="w-4 h-4" /> Go to tutor sessions</Choice>
          </div>
        </div>
        {type === "study-time" ? (
          <>
            <div>
              <FieldLabel>Minutes each time</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {MINUTE_OPTIONS.map((m) => <Choice key={m} selected={minutesPerSession === m} onClick={() => setMinutesPerSession(m)}>{m}</Choice>)}
              </div>
            </div>
            <div>
              <FieldLabel>Days a week</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {TIMES_OPTIONS.map((t) => <Choice key={t} selected={timesPerWeek === t} onClick={() => setTimesPerWeek(t)}>{t}</Choice>)}
              </div>
            </div>
          </>
        ) : (
          <div>
            <FieldLabel>Sessions a week</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {SESSIONS_OPTIONS.map((t) => <Choice key={t} selected={targetPerWeek === t} onClick={() => setTargetPerWeek(t)}>{t}</Choice>)}
            </div>
          </div>
        )}
      </div>
      <DialogActions>
        <button type="button" onClick={save} className={primaryBtn}>Save goal</button>
      </DialogActions>
    </StudentDialog>
  );
}
