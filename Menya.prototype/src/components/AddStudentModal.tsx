import { useState } from "react";
import { X, Save } from "lucide-react";
import Avatar from "./Avatar";
import { ALL_COURSES, TUTOR_GRADES } from "../lib/constants";
import { useStudents } from "../context/StudentsContext";
import type { StudentStatus } from "../types";

const STATUS_OPTIONS: { value: StudentStatus; label: string }[] = [
  { value: "exceeding",     label: "Exceeding"     },
  { value: "on-track",      label: "On Track"      },
  { value: "needs-support", label: "Needs Support" },
  { value: "at-risk",       label: "At Risk"       },
];

interface Props {
  onClose: () => void;
}

export default function AddStudentModal({ onClose }: Props) {
  const { addStudent } = useStudents();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<StudentStatus>("on-track");
  const [courses, setCourses] = useState<string[]>([]);

  const toggleCourse = (c: string) => setCourses((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const canSubmit = name.trim() && grade !== "" && location.trim() && courses.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    addStudent({ name: name.trim(), grade: grade as number, location: location.trim(), status, courses });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={name || "New Student"} size={9} />
            <div>
              <h2 className="font-display font-semibold text-foreground text-lg leading-none">Add Student</h2>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">Add a student to the roster</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Full Name *</span>
              <input required value={name} onChange={(e) => setName(e.target.value)}
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Grade *</span>
                <select required value={grade} onChange={(e) => setGrade(e.target.value ? Number(e.target.value) : "")}
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25">
                  <option value="">Select grade…</option>
                  {TUTOR_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Status</span>
                <select value={status} onChange={(e) => setStatus(e.target.value as StudentStatus)}
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25">
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Location *</span>
              <input required value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Enrolled Courses *</span>
              <div className="flex flex-wrap gap-2">
                {ALL_COURSES.map((c) => (
                  <button key={c} type="button" onClick={() => toggleCourse(c)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${courses.includes(c) ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={!canSubmit}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
              <Save className="w-4 h-4" />Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
