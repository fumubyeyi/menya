import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import ZoomModal from "../../components/ZoomModal";
import type { Session } from "../../types";
import Avatar from "../../components/Avatar";
import SubjectTag from "../../components/SubjectTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import SessionArtifacts from "../../components/SessionArtifacts";
import {
  tutorSessions, tutorStudents, studentSessionHistory, getTutorById, CURRENT_TUTOR_ID,
} from "../../data";

function scoreCls(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 65) return "text-amber-600";
  return "text-red-600";
}

export default function TutorSchedule() {
  const [modal, setModal] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const currentTutor = getTutorById(CURRENT_TUTOR_ID);

  const history = tutorStudents.flatMap((s) =>
    (studentSessionHistory[s.id] ?? []).map((h) => ({ ...h, studentName: s.name }))
  );

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Upcoming sessions &amp; history</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Upcoming Sessions</h2>
        <div className="divide-y divide-border">
          {tutorSessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar name={s.student} size={9} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{s.student}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <SubjectTag subject={s.subject} />
                  <span className="text-[11px] text-muted-foreground font-mono">{s.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Clock className="w-3.5 h-3.5" /> {s.clock}
              </div>
              <span className="text-[11px] font-mono text-muted-foreground hidden sm:block">{s.duration}m</span>
              <SessionStatusPill status={s.status} />
              {s.status === "in-progress" && s.meetingId && (
                <button
                  onClick={() => setActiveSession(s)}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  Start
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Session History Table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Session History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                <th className="text-left pb-3 pr-4">Student</th>
                <th className="text-left pb-3 pr-4">Subject</th>
                <th className="text-left pb-3 pr-4">Score</th>
                <th className="text-left pb-3 pr-4">Date</th>
                <th className="text-left pb-3 pr-4">Duration</th>
                <th className="text-left pb-3">Materials</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <Avatar name={h.studentName} size={7} />
                      <span className="font-medium text-foreground text-xs">{h.studentName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <SubjectTag subject={h.subject} />
                  </td>
                  <td className={`py-2.5 pr-4 font-mono font-semibold text-xs ${scoreCls(h.score)}`}>{h.score}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{h.date}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{h.duration}m</td>
                  <td className="py-2.5">
                    <SessionArtifacts artifacts={h.artifacts} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <ScheduleModal onClose={() => setModal(false)} />}
      {activeSession?.meetingId && (
        <ZoomModal
          meetingId={activeSession.meetingId}
          password={activeSession.password ?? ""}
          userName={currentTutor ? `${currentTutor.firstName} ${currentTutor.lastName}` : undefined}
          onClose={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}
