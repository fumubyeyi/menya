import { useEffect, useState } from "react";
import { X, ClipboardCheck, Check } from "lucide-react";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { useAttendance } from "../context/AttendanceContext";
import { useTutors } from "../context/TutorsContext";
import { useStudents } from "../context/StudentsContext";
import { getTutorById, studentsForAttendanceScope, CURRENT_TUTOR_ID } from "../data";
import type { AttendanceMark, AttendanceScope } from "../types";

interface Props {
  onClose: () => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function RollCallModal({ onClose }: Props) {
  const { user } = useAuth();
  const { tutors } = useTutors();
  const { students } = useStudents();
  const { addAttendanceSession } = useAttendance();
  const tutorId = user?.tutorId ?? CURRENT_TUTOR_ID;
  const tutor = getTutorById(tutors, tutorId);

  const [scope, setScope] = useState<AttendanceScope>("course");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(todayIso());
  const [marks, setMarks] = useState<Record<number, AttendanceMark>>({});
  const [submitted, setSubmitted] = useState(false);

  const roster = value ? studentsForAttendanceScope(students, scope, value) : [];

  // Re-seed the roster to "present" by default whenever the scope/value changes,
  // so a tutor only has to touch the students who weren't there.
  useEffect(() => {
    setMarks((prev) => {
      const next: Record<number, AttendanceMark> = {};
      roster.forEach((s) => { next[s.id] = prev[s.id] ?? "present"; });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, value]);

  const setScopeAndReset = (next: AttendanceScope) => {
    setScope(next);
    setValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAttendanceSession({
      tutorId,
      scope,
      ...(scope === "grade" ? { grade: Number(value) } : { course: value }),
      date,
      entries: roster.map((s) => ({ studentId: s.id, status: marks[s.id] ?? "present" })),
    });
    setSubmitted(true);
  };

  const presentCount = roster.filter((s) => (marks[s.id] ?? "present") === "present").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Take Roll Call</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">In-person attendance by grade or course</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardCheck className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Attendance Logged</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {scope === "grade" ? `Grade ${value}` : value} · {presentCount}/{roster.length} present
              </p>
            </div>
            <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Take roll call by</span>
                <div className="flex gap-2">
                  {(["course", "grade"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setScopeAndReset(s)}
                      className={`flex-1 py-2 rounded-lg text-sm font-mono font-medium border transition-colors capitalize ${scope === s ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">{scope === "grade" ? "Grade *" : "Course *"}</span>
                <select required value={value} onChange={(e) => setValue(e.target.value)}
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                  <option value="">{scope === "grade" ? "Select grade" : "Select course"}</option>
                  {scope === "grade"
                    ? (tutor?.grades ?? []).map((g) => <option key={g} value={g}>Grade {g}</option>)
                    : (tutor?.courses ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Date *</span>
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </label>

              {value && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Roster</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{presentCount}/{roster.length} present</span>
                  </div>
                  {roster.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">No students found for this {scope}.</p>
                  ) : (
                    <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                      {roster.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 px-3 py-2.5">
                          <Avatar name={s.name} size={7} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">Grade {s.grade}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMarks((m) => ({ ...m, [s.id]: m[s.id] === "absent" ? "present" : "absent" }))}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors ${
                              (marks[s.id] ?? "present") === "present"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded flex items-center justify-center border ${(marks[s.id] ?? "present") === "present" ? "bg-emerald-600 border-emerald-600" : "border-current"}`}>
                              {(marks[s.id] ?? "present") === "present" && <Check className="w-3 h-3 text-white" />}
                            </span>
                            {(marks[s.id] ?? "present") === "present" ? "Present" : "Not Present"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
              <button type="submit" disabled={!value || roster.length === 0}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
                <ClipboardCheck className="w-4 h-4" />Submit Attendance
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
