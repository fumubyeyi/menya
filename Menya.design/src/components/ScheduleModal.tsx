import { useState } from "react";
import { X, Calendar, CheckCircle2 } from "lucide-react";
import { students, tutors } from "../data";
import { subjectColor } from "../lib/constants";
import Avatar from "./Avatar";

const ALL_SUBJECTS = ["Algebra","Algebra II","Pre-Alg","Geometry","Calculus","Biology","Chemistry","Physics","Earth Science","Statistics","Pre-Calculus"];

interface Props {
  onClose: () => void;
  defaultStudent?: string;
}

export default function ScheduleModal({ onClose, defaultStudent }: Props) {
  const [form, setForm] = useState({ student: defaultStudent ?? "", tutor: "", subject: "", date: "", time: "", duration: "60", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const studentRecord = students.find((s) => s.name === form.student);
  const studentSubjects = studentRecord?.subjects ?? [];
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const matchScore = (t: typeof tutors[0]) => {
    if (!form.subject) return t.subjects.some((s) => studentSubjects.includes(s)) ? 1 : 0;
    return t.subjects.includes(form.subject) ? 2 : t.subjects.some((s) => studentSubjects.includes(s)) ? 1 : 0;
  };
  const sortedTutors = [...tutors].sort((a, b) => matchScore(b) - matchScore(a));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Schedule Session</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">{defaultStudent ? `Booking for ${defaultStudent}` : "Book a new tutoring session"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Session Scheduled</h3>
              <p className="text-sm text-muted-foreground mt-1">{form.student} · {form.subject} · {form.date} at {form.time}</p>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{form.tutor} · {form.duration}m</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setSubmitted(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">Add Another</button>
              <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide">
              {defaultStudent ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Student</span>
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/40 border border-border rounded-lg">
                    <Avatar name={defaultStudent} size={7} />
                    <span className="text-sm font-medium text-foreground">{defaultStudent}</span>
                    {studentRecord && <span className="ml-auto text-[10px] font-mono text-muted-foreground">Grade {studentRecord.grade}</span>}
                  </div>
                </div>
              ) : (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Student *</span>
                  <select required value={form.student} onChange={(e) => set("student", e.target.value)}
                    className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                    <option value="">Select student</option>
                    {students.map((s) => <option key={s.id}>{s.name}</option>)}
                  </select>
                </label>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Subject *</span>
                {studentSubjects.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {studentSubjects.map((s) => (
                        <button key={s} type="button" onClick={() => set("subject", s)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${form.subject === s ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    <select value={form.subject} onChange={(e) => set("subject", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                      <option value="">Or pick another subject…</option>
                      {ALL_SUBJECTS.filter((s) => !studentSubjects.includes(s)).map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                ) : (
                  <select required value={form.subject} onChange={(e) => set("subject", e.target.value)}
                    className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                    <option value="">Select subject</option>
                    {ALL_SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Select Tutor *</span>
                  {form.subject && <span className="text-[10px] font-mono text-primary">Sorted by subject match</span>}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {sortedTutors.map((t) => {
                    const score = matchScore(t);
                    const sel = form.tutor === t.name;
                    return (
                      <button key={t.name} type="button" onClick={() => set("tutor", t.name)}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all ${sel ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"}`}>
                        <Avatar name={t.name} size={9} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{t.name}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {t.subjects.map((s) => (
                              <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${s === form.subject ? "bg-primary/15 text-primary font-semibold" : studentSubjects.includes(s) ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{s}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {score === 2 && <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">Best match</span>}
                          {score === 1 && !form.subject && <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Good fit</span>}
                          <span className="text-[10px] font-mono text-muted-foreground">{t.students} students</span>
                        </div>
                        {sel && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {!form.tutor && <input type="text" required value={form.tutor} className="sr-only" readOnly tabIndex={-1} />}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Date *</span>
                  <input required type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
                    className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Time *</span>
                  <input required type="time" value={form.time} onChange={(e) => set("time", e.target.value)}
                    className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Duration</span>
                <div className="flex gap-2">
                  {["30","45","60","90"].map((d) => (
                    <button key={d} type="button" onClick={() => set("duration", d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-mono font-medium border transition-colors ${form.duration === d ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Notes</span>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
                  placeholder="Focus areas, materials needed, special instructions…" rows={2}
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none" />
              </label>
            </div>
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
              <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
                <Calendar className="w-4 h-4" />Confirm Session
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
