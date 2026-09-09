import { ALL_COURSES, TUTOR_GRADES, PREFERENCE_DAYS } from "../lib/constants";

interface Props {
  firstName: string;
  onFirstNameChange: (v: string) => void;
  lastName: string;
  onLastNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  courses: string[];
  onToggleCourse: (c: string) => void;
  grades: number[];
  onToggleGrade: (g: number) => void;
  preferredDays: string[];
  onToggleDay: (d: string) => void;
}

// Shared field set for AddTutorModal (create) and EditTutorForm (edit) — same
// fields, same styling, kept in one place so a field change doesn't need to
// be hand-copied between the two.
export default function TutorFormFields({
  firstName, onFirstNameChange, lastName, onLastNameChange, description, onDescriptionChange,
  courses, onToggleCourse, grades, onToggleGrade, preferredDays, onToggleDay,
}: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">First Name *</span>
          <input required value={firstName} onChange={(e) => onFirstNameChange(e.target.value)}
            className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Last Name *</span>
          <input required value={lastName} onChange={(e) => onLastNameChange(e.target.value)}
            className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Description</span>
        <textarea value={description} onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Teaching style, strengths, what makes them a good fit…" rows={3}
          className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none" />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Preferred Courses *</span>
        <div className="flex flex-wrap gap-2">
          {ALL_COURSES.map((c) => (
            <button key={c} type="button" onClick={() => onToggleCourse(c)}
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
            <button key={g} type="button" onClick={() => onToggleGrade(g)}
              className={`w-10 py-1.5 rounded-lg text-sm font-mono font-medium border transition-colors ${grades.includes(g) ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Days They Would Tutor</span>
        <div className="flex flex-wrap gap-2">
          {PREFERENCE_DAYS.map((d) => (
            <button key={d} type="button" onClick={() => onToggleDay(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${preferredDays.includes(d) ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
