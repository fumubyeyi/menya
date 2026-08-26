import { useState } from "react";
import { X, Clock, Users } from "lucide-react";
import type { NewStudentGoal } from "../types";

interface Props {
  onSave: (goal: NewStudentGoal) => void;
  onClose: () => void;
}

const MINUTE_OPTIONS = [15, 30, 45, 60];
const TIMES_OPTIONS = [1, 2, 3, 4, 5];
const SESSIONS_OPTIONS = [1, 2, 3];

export default function AddGoalModal({ onSave, onClose }: Props) {
  const [type, setType] = useState<"study-time" | "session-attendance">("study-time");
  const [minutesPerSession, setMinutesPerSession] = useState(30);
  const [timesPerWeek, setTimesPerWeek] = useState(2);
  const [targetPerWeek, setTargetPerWeek] = useState(1);

  const handleSave = () => {
    onSave(type === "study-time" ? { type, minutesPerSession, timesPerWeek } : { type, targetPerWeek });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Set a Goal</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Pick something you'll actually stick to</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setType("study-time")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${type === "study-time" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-background hover:border-primary/30"}`}>
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Self-Study Time</span>
            </button>
            <button type="button" onClick={() => setType("session-attendance")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${type === "session-attendance" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-background hover:border-primary/30"}`}>
              <Users className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Tutor Sessions</span>
            </button>
          </div>

          {type === "study-time" ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-2">Minutes per session</p>
                <div className="flex gap-2">
                  {MINUTE_OPTIONS.map((m) => (
                    <button key={m} type="button" onClick={() => setMinutesPerSession(m)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${minutesPerSession === m ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-muted"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-2">Times per week</p>
                <div className="flex gap-2">
                  {TIMES_OPTIONS.map((t) => (
                    <button key={t} type="button" onClick={() => setTimesPerWeek(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${timesPerWeek === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-muted"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide mb-2">Sessions per week</p>
              <div className="flex gap-2">
                {SESSIONS_OPTIONS.map((t) => (
                  <button key={t} type="button" onClick={() => setTargetPerWeek(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${targetPerWeek === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:bg-muted"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
          <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">Save Goal</button>
        </div>
      </div>
    </div>
  );
}
