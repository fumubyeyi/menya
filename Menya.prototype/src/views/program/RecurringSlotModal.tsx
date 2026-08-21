import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "../../app/components/ui/dropdown-menu";
import { gradesSummary } from "./SessionModal";
import { TUTOR_GRADES } from "../../lib/constants";
import type { RecurringSlot } from "./Schedule";

export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Props {
  editing?: RecurringSlot;
  onSave: (fields: { day: string; time: string; grades: number[] }) => void;
  onClose: () => void;
}

export default function RecurringSlotModal({ editing, onSave, onClose }: Props) {
  const [day, setDay] = useState(editing?.day ?? WEEKDAYS[0]);
  const [time, setTime] = useState(editing?.time ?? "18:00");
  const [grades, setGrades] = useState<number[]>(editing?.grades ?? []);

  const toggleGrade = (g: number) => {
    setGrades((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const canSave = grades.length > 0 && !!day && !!time;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ day, time, grades });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-display font-semibold text-foreground text-lg leading-none">{editing ? "Edit Recurring Slot" : "Add Recurring Slot"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Day</span>
              <select value={day} onChange={(e) => setDay(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                {WEEKDAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Time</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Grades — select one or more, grouped together</span>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button type="button"
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                  <span className={grades.length ? "text-foreground" : "text-muted-foreground"}>
                    {grades.length ? gradesSummary(grades) : "Select grades"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                {TUTOR_GRADES.map((g) => (
                  <DropdownMenuCheckboxItem key={g} checked={grades.includes(g)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => toggleGrade(g)}>
                    Grade {g}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border">
          <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
          <button type="button" onClick={handleSave} disabled={!canSave}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none">
            {editing ? "Save Changes" : "Add Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}
