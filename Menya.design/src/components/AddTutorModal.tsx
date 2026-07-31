import { useState } from "react";
import { X, Save } from "lucide-react";
import Avatar from "./Avatar";
import { ALL_COURSES, TUTOR_GRADES } from "../lib/constants";
import { useTutors } from "../context/TutorsContext";

interface Props {
  onClose: () => void;
}

export default function AddTutorModal({ onClose }: Props) {
  const { addTutor } = useTutors();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [description, setDescription] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [grades, setGrades] = useState<number[]>([]);

  const toggleCourse = (c: string) => setCourses((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const toggleGrade = (g: number) => setGrades((gs) => (gs.includes(g) ? gs.filter((x) => x !== g) : [...gs, g]));

  const canSubmit = firstName.trim() && lastName.trim() && courses.length > 0 && grades.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    addTutor({ firstName: firstName.trim(), lastName: lastName.trim(), description: description.trim(), courses, grades: [...grades].sort((a, b) => a - b) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={firstName || lastName ? `${firstName} ${lastName}` : "New Tutor"} size={9} />
            <div>
              <h2 className="font-display font-semibold text-foreground text-lg leading-none">Add Tutor</h2>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">Add a tutor to the roster</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">First Name *</span>
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Last Name *</span>
                <input required value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Teaching style, strengths, what makes them a good fit…" rows={3}
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none" />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Preferred Courses *</span>
              <div className="flex flex-wrap gap-2">
                {ALL_COURSES.map((c) => (
                  <button key={c} type="button" onClick={() => toggleCourse(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${courses.includes(c) ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Preferred Grades *</span>
              <div className="flex flex-wrap gap-2">
                {TUTOR_GRADES.map((g) => (
                  <button key={g} type="button" onClick={() => toggleGrade(g)}
                    className={`w-10 py-1.5 rounded-lg text-sm font-mono font-medium border transition-colors ${grades.includes(g) ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={!canSubmit}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
              <Save className="w-4 h-4" />Add Tutor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
