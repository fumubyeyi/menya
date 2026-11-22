import { useEffect, useState } from "react";
import { useLocation } from "react-router";
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
import { getCourseIcon, formatTime12h } from "../../lib/constants";
import { subjectColor, subjectTint } from "../../lib/subject";
import { WEEKDAYS } from "../program/RecurringSlotModal";
import { PageHeaderActions } from "../../context/PageHeaderContext";

export default function StudentSchedule() {
  const student = useCurrentStudent();
  const { sessions, updateSession } = useSessions();
  const { logSessionAttended } = useStudentActivity();
  const { recurringSlots } = useRecurringSlots();
  const sessionHistory = studentSessionHistory[student.id] ?? [];
  const studentSessions = sessions.filter((s) => s.student === student.name);
  const [modal, setModal] = useState(false);
  // Past sessions grow every week; show the most recent few until asked.
  const PAST_PREVIEW = 5;
  const [showAllPast, setShowAllPast] = useState(false);
  const visiblePast = showAllPast ? sessionHistory : sessionHistory.slice(0, PAST_PREVIEW);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const location = useLocation();

  // Deep links like /student/schedule#past-sessions (from My Journey's
  // Sessions card) jump straight to that section.
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  // Same in-person schedule Program plans under Program > Schedule, narrowed
  // to the grade band that actually covers this student.
  const myGradeSlots = WEEKDAYS
    .flatMap((day) => recurringSlots.filter((s) => s.day === day && s.grades.includes(student.grade)))
    .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) || a.time.localeCompare(b.time));

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <PageHeaderActions>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Request Session
        </button>
      </PageHeaderActions>

      {/* Wide screens: what's coming on the left, past sessions as a side
          column on the right (divided by a rule, not a card). Phones stack. */}
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-8 min-w-0">
          {/* Weekly in-person times — read-only view of the same Recurring Slots
              Program plans under Program > Schedule, narrowed to this student's
              grade band. One line, not a card: it rarely changes. */}
          {myGradeSlots.length > 0 && (
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <CalendarClock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold text-foreground">Every week in person: </span>
                {myGradeSlots.map((slot) =>
                  `${slot.day} ${formatTime12h(slot.time)}${slot.tutorIds.length > 0 ? ` with ${slot.tutorIds.map((id) => tutorNameById(id)).join(", ")}` : ""}`
                ).join(" · ")}
              </span>
            </p>
          )}

          {/* Upcoming Sessions */}
          <section>
            <h2 className="text-lg font-display font-bold text-foreground mb-3">Upcoming</h2>
            {studentSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
            ) : (
              <div className="divide-y divide-border">
                {studentSessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: subjectTint(s.course) }}
                    >
                      <span style={{ color: subjectColor(s.course) }}>
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
          </section>
        </div>

        {/* Past Sessions */}
        <section id="past-sessions" className="lg:col-span-2 min-w-0 scroll-mt-4 lg:border-l lg:border-border lg:pl-8">
          <h2 className="text-lg font-display font-bold text-foreground mb-3">Past sessions</h2>
          <div className="divide-y divide-border">
            {visiblePast.map((h, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: subjectTint(h.course) }}
                  >
                    <span style={{ color: subjectColor(h.course) }}>
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
          {sessionHistory.length > PAST_PREVIEW && (
            <button
              onClick={() => setShowAllPast((v) => !v)}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              {showAllPast ? "Show less" : `Show all ${sessionHistory.length}`}
            </button>
          )}
        </section>
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
