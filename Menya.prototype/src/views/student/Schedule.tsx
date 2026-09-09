import { useState } from "react";
import { Clock, Plus, CalendarClock } from "lucide-react";
import ZoomModal from "../../components/ZoomModal";
import type { Session } from "../../types";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import SessionArtifacts from "../../components/SessionArtifacts";
import { useSessions } from "../../context/SessionsContext";
import { useStudentActivity } from "../../context/StudentActivityContext";
import { useRecurringSlots } from "../../context/RecurringSlotsContext";
import { useCurrentStudent } from "../../hooks/useCurrentStudent";
import {
  studentSessionHistory, tutorNameById,
} from "../../data";
import { getCourseIcon, courseColor, formatTime12h, gradesSummary, gradeGroupFor } from "../../lib/constants";
import { WEEKDAYS } from "../program/RecurringSlotModal";
import { PageHeaderSubtitle, PageHeaderActions } from "../../context/PageHeaderContext";

export default function StudentSchedule() {
  const student = useCurrentStudent();
  const { sessions, updateSession } = useSessions();
  const { logSessionAttended } = useStudentActivity();
  const { recurringSlots } = useRecurringSlots();
  const sessionHistory = studentSessionHistory[student.id] ?? [];
  const studentSessions = sessions.filter((s) => s.student === student.name);
  const [modal, setModal] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  // Same in-person schedule Program plans under Program > Schedule, narrowed
  // to the grade band that actually covers this student.
  const myGradeSlots = WEEKDAYS
    .flatMap((day) => recurringSlots.filter((s) => s.day === day && s.grades.includes(student.grade)))
    .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) || a.time.localeCompare(b.time));

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>Upcoming sessions</PageHeaderSubtitle>
      <PageHeaderActions>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Request Session
        </button>
      </PageHeaderActions>

      {/* Upcoming Sessions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Upcoming Sessions</h2>
        {studentSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
        ) : (
          <div className="divide-y divide-border">
            {studentSessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${courseColor[s.course] ?? "#5E6B72"}15` }}
                >
                  <span style={{ color: courseColor[s.course] ?? "#5E6B72" }}>
                    {getCourseIcon(s.course)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.course}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{tutorNameById(s.tutorId)} · {s.time}</p>
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
                    Join
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In-Person Schedule — read-only view of the same Recurring Slots
          Program plans under Program > Schedule, narrowed to this student's
          grade band. */}
      {myGradeSlots.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" /> In-Person Schedule
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Standing weekly sessions for {gradesSummary(gradeGroupFor(student.grade))} — set by program staff.</p>
          <div className="flex flex-wrap gap-2">
            {myGradeSlots.map((slot) => (
              <span key={slot.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-muted text-foreground border border-border">
                {slot.day} · {formatTime12h(slot.time)}
                {slot.tutorIds.length > 0 && ` · ${slot.tutorIds.map((id) => tutorNameById(id)).join(", ")}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Past Sessions</h2>
        <div className="divide-y divide-border">
          {sessionHistory.map((h, i) => (
            <div key={i} className="py-3 first:pt-0 last:pb-0 space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${courseColor[h.course] ?? "#5E6B72"}15` }}
                >
                  <span style={{ color: courseColor[h.course] ?? "#5E6B72" }}>
                    {getCourseIcon(h.course)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{h.course}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{tutorNameById(h.tutorId)} · {h.duration}m</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono font-semibold ${h.score >= 80 ? "text-emerald-600" : h.score >= 65 ? "text-amber-600" : "text-red-600"}`}>
                    {h.score}
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground">{h.date}</p>
                </div>
              </div>
              <div className="pl-12">
                <SessionArtifacts artifacts={h.artifacts} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && <ScheduleModal defaultStudent={student.name} onClose={() => setModal(false)} />}
      {activeSession?.meetingId && (
        <ZoomModal
          sessionId={activeSession.id}
          meetingId={activeSession.meetingId}
          password={activeSession.password ?? ""}
          userName={student.name}
          course={activeSession.course}
          onClose={() => {
            updateSession({ ...activeSession, status: "completed" });
            logSessionAttended();
            setActiveSession(null);
          }}
        />
      )}
    </div>
  );
}
