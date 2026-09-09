import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Pencil, Mail, Phone, Linkedin, ExternalLink, Sparkles, HeartHandshake, TrendingUp, Flame, BookOpen } from "lucide-react";
import Avatar from "../../components/Avatar";
import EditAlumniModal from "../../components/EditAlumniModal";
import { students } from "../../data";
import { useAlumni } from "../../context/AlumniContext";
import { alumniOutcomeMeta, followUpStatusMeta, exitReasonMeta, verificationMeta } from "../../lib/constants";
import type { AlumniRecord, ExitReason } from "../../types";

export default function AlumniDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { alumni, updateAlumnus } = useAlumni();
  const [editing, setEditing] = useState(false);

  const alumnus = alumni.find((a) => a.id === Number(id));
  if (!alumnus) return (
    <div className="p-6 text-muted-foreground">Alumnus not found.</div>
  );

  const outcomeMeta   = alumniOutcomeMeta[alumnus.outcome];
  const exitMeta      = exitReasonMeta[alumnus.exitReason as ExitReason];
  const vMeta         = verificationMeta[alumnus.verification];
  const followUpMeta  = followUpStatusMeta[alumnus.followUpStatus];
  const student       = alumnus.studentId ? students.find((s) => s.id === alumnus.studentId) : undefined;
  const isCollege     = alumnus.outcome.includes("college");

  const handleSave = (updated: AlumniRecord) => {
    updateAlumnus(updated);
    setEditing(false);
  };

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Alumni
      </button>

      {/* Hero Banner */}
      <div className="rounded-xl overflow-hidden border border-border" style={{ background: "linear-gradient(135deg, #2F4F4F 0%, #1E2B2B 100%)" }}>
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar name={alumnus.name} size={16} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-display font-bold text-white">{alumnus.name}</h1>
              {alumnus.isSuccessStory && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-amber-400/20 text-amber-100 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />Success Story
                </span>
              )}
            </div>
            <p className="text-sm text-white/60 mt-0.5">Grade {alumnus.lastGrade} (final) · {alumnus.location}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-mono ${exitMeta.cls}`}>{exitMeta.label} · {alumnus.exitYear}</span>
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-mono inline-flex items-center gap-1 ${outcomeMeta.cls}`}>
                <outcomeMeta.Icon className="w-3 h-3" />{outcomeMeta.label}
              </span>
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-mono inline-flex items-center gap-1 ${vMeta.cls}`}>
                <vMeta.Icon className="w-3 h-3" />{vMeta.label}
              </span>
              {alumnus.openToMentoring && (
                <span className="text-[11px] px-2.5 py-1 rounded-full font-mono bg-white/15 text-white inline-flex items-center gap-1">
                  <HeartHandshake className="w-3 h-3" />Open to Mentor
                </span>
              )}
            </div>
          </div>
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-white text-sm font-medium px-4 py-2 rounded-lg bg-[#2F4F4F] hover:bg-[#2F4F4F]/90 transition-colors">
            <Pencil className="w-4 h-4" /> Edit Record
          </button>
        </div>

        {(alumnus.email || alumnus.phone || alumnus.linkedIn) && (
          <div className="flex flex-wrap gap-4 px-6 py-3 border-t border-white/10">
            {alumnus.email && (
              <a href={`mailto:${alumnus.email}`} className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" />{alumnus.email}
              </a>
            )}
            {alumnus.phone && (
              <a href={`tel:${alumnus.phone}`} className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" />{alumnus.phone}
              </a>
            )}
            {alumnus.linkedIn && (
              <a href={`https://${alumnus.linkedIn.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors">
                <Linkedin className="w-3.5 h-3.5" />{alumnus.linkedIn}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          {alumnus.isSuccessStory && alumnus.testimonial && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-amber-900 mb-1.5 flex items-center gap-1.5"><Sparkles className="w-4 h-4" />In Their Words</h2>
              <p className="text-sm text-amber-900/90 italic">&ldquo;{alumnus.testimonial}&rdquo;</p>
            </div>
          )}

          {/* Check-in timeline */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Check-In Timeline</h2>
            {alumnus.checkIns.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No dated check-ins logged yet.</p>
            ) : (
              <div className="relative pl-5 space-y-5">
                <div className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-border" />
                {alumnus.checkIns.map((c, i) => {
                  const cMeta  = alumniOutcomeMeta[c.outcome];
                  const cvMeta = verificationMeta[c.verification];
                  return (
                    <div key={i} className="relative">
                      <div className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-card" />
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{c.timeframe} · {c.date}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono inline-flex items-center gap-1 ${cMeta.cls}`}>
                            <cMeta.Icon className="w-2.5 h-2.5" />{cMeta.label}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono inline-flex items-center gap-1 ${cvMeta.cls}`}>
                            <cvMeta.Icon className="w-2.5 h-2.5" />{cvMeta.label}
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

          {alumnus.notes && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-sm font-semibold text-foreground mb-1.5">Follow-Up Notes</h2>
              <p className="text-sm text-muted-foreground">{alumnus.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {student && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Program Snapshot</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-foreground"><TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />{student.progress}% final progress</div>
                <div className="flex items-center gap-1.5 text-sm text-foreground"><BookOpen className="w-3.5 h-3.5 text-muted-foreground" />{student.sessions} sessions</div>
                <div className="flex items-center gap-1.5 text-sm text-foreground"><Flame className="w-3.5 h-3.5 text-brand-amber" />{student.streak}d streak</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{student.courses.join(", ")}</p>
              <button onClick={() => navigate(`/program/students/${student.id}`)} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <ExternalLink className="w-3 h-3" />View student profile
              </button>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick Facts</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Follow-up</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono inline-flex items-center gap-1 ${followUpMeta.cls}`}>
                  <followUpMeta.Icon className="w-3 h-3" />{followUpMeta.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Contact</span>
                <span className="text-foreground">{alumnus.lastContact}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Assigned Staff</span>
                <span className="text-foreground">{alumnus.assignedStaff}</span>
              </div>
              {alumnus.institution && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{isCollege ? "Institution" : "Employer"}</span>
                  <span className="text-foreground">{alumnus.institution}</span>
                </div>
              )}
              {alumnus.fieldOfStudy && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{isCollege ? "Major" : "Field"}</span>
                  <span className="text-foreground">{alumnus.fieldOfStudy}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <EditAlumniModal alumnus={alumnus} onClose={() => setEditing(false)} onSave={handleSave} />
      )}
    </div>
  );
}
