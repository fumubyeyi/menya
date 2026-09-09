import { useState } from "react";
import { X, Save } from "lucide-react";
import { useTutors } from "../context/TutorsContext";
import { PREFERENCE_DAYS } from "../lib/constants";
import type { Tutor } from "../types";

interface Props {
  tutor: Tutor;
  onClose: () => void;
}

// Focused, tutor-facing counterpart to the "Days They Would Tutor" field inside
// the full Edit Tutor form (Program > Tutors > tutor detail) — same underlying
// field (Tutor.preferredDays), but scoped to just this one field so a tutor can
// update their own availability from Home without touching anything else on
// their profile that's really Program's to manage (name, courses, grades).
export default function EditDayPreferenceModal({ tutor, onClose }: Props) {
  const { updateTutor } = useTutors();
  const [preferredDays, setPreferredDays] = useState<string[]>(tutor.preferredDays ?? []);

  const toggleDay = (d: string) => setPreferredDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]));

  const handleSave = () => {
    updateTutor({ ...tutor, preferredDays });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Edit Availability</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Which days you're available to tutor</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_DAYS.map((d) => (
              <button key={d} type="button" onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${preferredDays.includes(d) ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                {d}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            This tells Program which days you're willing to be assigned a recurring slot — it doesn't assign you to one directly.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
          <button type="button" onClick={handleSave} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
            <Save className="w-4 h-4" />Save
          </button>
        </div>
      </div>
    </div>
  );
}
