import { useState } from "react";
import { X, Save, TrendingUp, BookOpen, Flame } from "lucide-react";
import Avatar from "./Avatar";
import { students } from "../data";
import { alumniOutcomeMeta, followUpStatusMeta, verificationMeta } from "../lib/constants";
import type { AlumniRecord, AlumniOutcome, ExitReason, FollowUpStatus, VerificationSource, AlumniCheckIn } from "../types";

const OUTCOME_OPTIONS = Object.keys(alumniOutcomeMeta) as AlumniOutcome[];
const FOLLOWUP_OPTIONS = Object.keys(followUpStatusMeta) as FollowUpStatus[];
const VERIFICATION_OPTIONS = Object.keys(verificationMeta) as VerificationSource[];

interface Props {
  alumnus: AlumniRecord;
  onClose: () => void;
  onSave: (updated: AlumniRecord) => void;
}

export default function EditAlumniModal({ alumnus, onClose, onSave }: Props) {
  const [form, setForm] = useState<AlumniRecord>(alumnus);
  const [checkInTimeframe, setCheckInTimeframe] = useState("");
  const [checkInNote, setCheckInNote] = useState("");
  const set = <K extends keyof AlumniRecord>(k: K, v: AlumniRecord[K]) => setForm((f) => ({ ...f, [k]: v }));

  const isCollegeOrCareer = form.outcome !== "gap-year" && form.outcome !== "unknown" && form.outcome !== "military";
  const linkedStudent = form.studentId ? students.find((s) => s.id === form.studentId) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInTimeframe.trim()) {
      onSave(form);
      return;
    }
    const newCheckIn: AlumniCheckIn = {
      timeframe: checkInTimeframe.trim(),
      date: form.lastContact,
      outcome: form.outcome,
      verification: form.verification,
      note: checkInNote.trim() || undefined,
    };
    onSave({ ...form, checkIns: [...form.checkIns, newCheckIn] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={form.name} size={9} />
            <div>
              <h2 className="font-display font-semibold text-foreground text-lg leading-none">{form.name}</h2>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">Update alumni outcome & follow-up</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide">
            {linkedStudent && (
              <div className="bg-muted/40 border border-border rounded-lg px-4 py-3">
                <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Program Snapshot (from student roster)</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />{linkedStudent.progress}% final progress
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />{linkedStudent.sessions} sessions
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Flame className="w-3.5 h-3.5 text-muted-foreground" />{linkedStudent.streak}d streak
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{linkedStudent.courses.join(", ")}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Program Exit</span>
                <select value={form.exitReason} onChange={(e) => set("exitReason", e.target.value as ExitReason)}
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                  <option value="graduated">Completed Program</option>
                  <option value="left-program">Left Program</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Exit Year</span>
                <input type="number" value={form.exitYear} onChange={(e) => set("exitYear", Number(e.target.value))}
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </label>
            </div>

            <label className="flex items-center gap-2.5">
              <input type="checkbox" checked={form.hsGraduated} onChange={(e) => set("hsGraduated", e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/25 cursor-pointer" />
              <span className="text-sm text-foreground">Graduated high school</span>
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Post-Program Outcome</span>
              <div className="flex flex-wrap gap-2">
                {OUTCOME_OPTIONS.map((o) => {
                  const meta = alumniOutcomeMeta[o];
                  const sel = form.outcome === o;
                  return (
                    <button key={o} type="button" onClick={() => set("outcome", o)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${sel ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                      <meta.Icon className="w-3.5 h-3.5" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">How was this confirmed?</span>
              <div className="flex gap-2">
                {VERIFICATION_OPTIONS.map((v) => {
                  const meta = verificationMeta[v];
                  const sel = form.verification === v;
                  return (
                    <button key={v} type="button" onClick={() => set("verification", v)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${sel ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                      <meta.Icon className="w-3.5 h-3.5" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {isCollegeOrCareer && (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                    {form.outcome.includes("college") ? "Institution" : "Employer"}
                  </span>
                  <input value={form.institution ?? ""} onChange={(e) => set("institution", e.target.value)}
                    placeholder={form.outcome.includes("college") ? "e.g. UC Davis" : "e.g. HEB Digital"}
                    className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                    {form.outcome.includes("college") ? "Major" : "Field"}
                  </span>
                  <input value={form.fieldOfStudy ?? ""} onChange={(e) => set("fieldOfStudy", e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Last Contact</span>
                <input value={form.lastContact} onChange={(e) => set("lastContact", e.target.value)}
                  placeholder="e.g. Jun 18, 2026"
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Follow-up Status</span>
                <select value={form.followUpStatus} onChange={(e) => set("followUpStatus", e.target.value as FollowUpStatus)}
                  className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                  {FOLLOWUP_OPTIONS.map((f) => <option key={f} value={f}>{followUpStatusMeta[f].label}</option>)}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Assigned Staff</span>
              <input value={form.assignedStaff} onChange={(e) => set("assignedStaff", e.target.value)}
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Follow-up Notes</span>
              <textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)}
                placeholder="General notes about this alumnus…" rows={2}
                className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none" />
            </label>

            {/* Check-in history */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Check-In History</span>
              {form.checkIns.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No dated check-ins logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {form.checkIns.map((c, i) => {
                    const meta = alumniOutcomeMeta[c.outcome];
                    const vMeta = verificationMeta[c.verification];
                    return (
                      <div key={i} className="border border-border rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">{c.timeframe} · {c.date}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono inline-flex items-center gap-1 ${meta.cls}`}>
                              <meta.Icon className="w-2.5 h-2.5" />{meta.label}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono inline-flex items-center gap-1 ${vMeta.cls}`}>
                              <vMeta.Icon className="w-2.5 h-2.5" />{vMeta.label}
                            </span>
                          </div>
                        </div>
                        {c.note && <p className="text-xs text-muted-foreground mt-1">{c.note}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Log a new check-in */}
            <div className="border border-dashed border-border rounded-lg px-3 py-3 space-y-2.5">
              <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Log This Update As a Dated Check-In (optional)</p>
              <p className="text-xs text-muted-foreground">Saves the outcome & verification above as a permanent snapshot at this timeframe, so it can be compared over time. Leave blank to just edit details without adding to the history.</p>
              <div className="grid grid-cols-2 gap-3">
                <input value={checkInTimeframe} onChange={(e) => setCheckInTimeframe(e.target.value)}
                  placeholder="e.g. 6 months, 1 year"
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
                <input value={checkInNote} onChange={(e) => setCheckInNote(e.target.value)}
                  placeholder="Check-in note (optional)"
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2">
              <Save className="w-4 h-4" />Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
