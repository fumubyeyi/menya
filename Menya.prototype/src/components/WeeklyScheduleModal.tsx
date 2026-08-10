import { useMemo, useState } from "react";
import { X, CalendarRange, CheckCircle2, Trash2, Video, MapPin } from "lucide-react";
import Avatar from "./Avatar";
import CourseTag from "./CourseTag";
import { useSessions } from "../context/SessionsContext";
import { useScheduleNotices } from "../context/ScheduleNoticesContext";
import { useStudents } from "../context/StudentsContext";
import { useTutors } from "../context/TutorsContext";
import { formatSessionTime, scoreTutorMatch } from "../lib/constants";

interface Props {
  onClose: () => void;
}

interface DraftRow {
  key: string;
  student: string;
  tutorId: string;
  course: string;
  date: string;
  time: string;
  duration: string;
  location: "virtual" | "in-person";
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// The Monday of the next full week — "upcoming week" always means ahead of today,
// even when today itself is a Monday.
function upcomingMonday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return d;
}

const EMPTY_ROW = { student: "", tutorId: "", course: "", time: "", duration: "60", location: "virtual" as const };

export default function WeeklyScheduleModal({ onClose }: Props) {
  const { addSessions } = useSessions();
  const { addScheduleNotices } = useScheduleNotices();
  const { students } = useStudents();
  const { tutors } = useTutors();

  const weekStart = useMemo(() => upcomingMonday(), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return { date: toISODate(d), label: d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }) };
  }), [weekStart]);
  const weekLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 4);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(weekStart)} – ${fmt(end)}`;
  }, [weekStart]);

  const [form, setForm] = useState({ ...EMPTY_ROW, date: weekDays[0].date });
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [published, setPublished] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const studentRecord = students.find((s) => s.name === form.student);
  const studentCourses = studentRecord?.courses ?? [];
  const matchScore = (t: (typeof tutors)[0]) => scoreTutorMatch(t, form.course, studentRecord?.grade);
  const sortedTutors = [...tutors].sort((a, b) => matchScore(b) - matchScore(a));

  const canAddRow = form.student && form.tutorId && form.course && form.date && form.time;

  const addRow = () => {
    if (!canAddRow) return;
    setRows((r) => [...r, { ...form, key: `${Date.now()}-${r.length}` }]);
    setForm((f) => ({ ...f, student: "", tutorId: "", course: "", time: "" }));
  };

  const removeRow = (key: string) => setRows((r) => r.filter((row) => row.key !== key));

  const affectedTutorCount = new Set(rows.map((r) => r.tutorId)).size;

  const handlePublish = () => {
    const sessions = rows.map((r) => ({
      student: r.student,
      tutorId: Number(r.tutorId),
      course: r.course,
      ...formatSessionTime(r.date, r.time),
      duration: Number(r.duration),
      status: "scheduled" as const,
      type: "tutoring" as const,
      location: r.location,
      ...(r.location === "virtual" ? { meetingId: "add_real_meeting_id", password: "add_real_passcode" } : {}),
    }));
    addSessions(sessions);

    const tutorCounts = new Map<number, number>();
    rows.forEach((r) => tutorCounts.set(Number(r.tutorId), (tutorCounts.get(Number(r.tutorId)) ?? 0) + 1));
    addScheduleNotices(Array.from(tutorCounts.entries()).map(([tutorId, sessionCount]) => ({ tutorId, weekLabel, sessionCount })));

    setPublished(true);
  };

  const dayLabel = (date: string) => weekDays.find((d) => d.date === date)?.label ?? date;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Plan Week</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Week of {weekLabel} — build the schedule, then notify tutors</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {published ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Schedule Published</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {rows.length} session{rows.length === 1 ? "" : "s"} scheduled for the week of {weekLabel}, {affectedTutorCount} tutor{affectedTutorCount === 1 ? "" : "s"} notified.
              </p>
            </div>
            <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">Done</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide">
              {/* Add-row form */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Add a session</span>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Student</span>
                    <select value={form.student} onChange={(e) => set("student", e.target.value)}
                      className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                      <option value="">Select student</option>
                      {students.map((s) => <option key={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Course</span>
                    <select value={form.course} onChange={(e) => set("course", e.target.value)}
                      className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                      <option value="">Select course</option>
                      {(studentCourses.length ? studentCourses : Array.from(new Set(tutors.flatMap((t) => t.courses)))).map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Tutor</span>
                  <select value={form.tutorId} onChange={(e) => set("tutorId", e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                    <option value="">Select tutor</option>
                    {sortedTutors.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}{matchScore(t) === 3 ? " — best match" : matchScore(t) === 2 ? " — course match" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Day</span>
                  <div className="flex flex-wrap gap-1.5">
                    {weekDays.map((d) => (
                      <button key={d.date} type="button" onClick={() => set("date", d.date)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${form.date === d.date ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Time</span>
                    <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)}
                      className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
                  </label>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Duration</span>
                    <div className="flex gap-1.5">
                      {["30", "45", "60", "90"].map((d) => (
                        <button key={d} type="button" onClick={() => set("duration", d)}
                          className={`flex-1 py-2 rounded-lg text-xs font-mono font-medium border transition-colors ${form.duration === d ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                          {d}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Location</span>
                  <div className="flex gap-2">
                    {([["virtual", "Virtual", Video], ["in-person", "In-Person", MapPin]] as const).map(([v, label, Icon]) => (
                      <button key={v} type="button" onClick={() => set("location", v)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-mono font-medium border transition-colors ${form.location === v ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                        <Icon className="w-3.5 h-3.5" />{label}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={addRow} disabled={!canAddRow}
                  className="w-full py-2 rounded-lg text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/15 transition-colors disabled:opacity-40 disabled:pointer-events-none">
                  + Add to Week
                </button>
              </div>

              {/* Draft rows */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  This Week's Schedule ({rows.length})
                </span>
                {rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">No sessions added yet.</p>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                    {rows.map((r) => {
                      const t = tutors.find((tu) => tu.id === Number(r.tutorId));
                      return (
                        <div key={r.key} className="flex items-center gap-3 px-3 py-2.5">
                          <Avatar name={r.student} size={7} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{r.student}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <CourseTag course={r.course} />
                              <span className="text-[10px] font-mono text-muted-foreground">{t ? `${t.firstName} ${t.lastName}` : "—"}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{dayLabel(r.date)} · {r.time}</span>
                            </div>
                          </div>
                          <button type="button" onClick={() => removeRow(r.key)} title="Remove"
                            className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
              <button type="button" onClick={handlePublish} disabled={rows.length === 0}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
                <CalendarRange className="w-4 h-4" />Publish &amp; Notify Tutors
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
