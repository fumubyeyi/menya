import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Plus, CalendarClock, Video, MapPin } from "lucide-react";
import ZoomModal from "../../components/ZoomModal";
import type { Session } from "../../types";
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

export default function StudentSchedule() {
  const student = useCurrentStudent();
  const { sessions, updateSession } = useSessions();
  const { logSessionAttended } = useStudentActivity();
  const { recurringSlots } = useRecurringSlots();
  const sessionHistory = studentSessionHistory[student.id] ?? [];
  // Sessions still to come: not completed, and not dated before today
  // (older seed sessions have no ISO date and are kept).
  const todayISO = new Date().toLocaleDateString("en-CA");
  const studentSessions = sessions.filter((s) =>
    s.student === student.name && s.status !== "completed" && !(s.date && s.date < todayISO));
  const [modal, setModal] = useState(false);
  // Past sessions grow every week; show the most recent few until asked.
  const PAST_PREVIEW = 5;
  const [showAllPast, setShowAllPast] = useState(false);
  const visiblePast = showAllPast ? sessionHistory : sessionHistory.slice(0, PAST_PREVIEW);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const location = useLocation();

  // Deep links like /student/schedule#past-sessions (from Home's
  // Sessions card) jump straight to that section.
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  // Same in-person schedule Program plans under Program > Schedule, narrowed
  // to the grade band that actually covers this student.
  const myGradeSlots = WEEKDAYS
    .flatMap((day) => recurringSlots.filter((s) => s.day === day && s.grades.includes(student.grade)))
    .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) || a.time.localeCompare(b.time));

  // The next in-person session from now: the fewest days away, and later
  // today only if its time hasn't passed. WEEKDAYS starts on Monday.
  const nextSlotId = (() => {
    const now = new Date();
    const today = (now.getDay() + 6) % 7;
    const nowHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    let best: { id: string; days: number; time: string } | null = null;
    for (const slot of myGradeSlots) {
      let days = (WEEKDAYS.indexOf(slot.day) - today + 7) % 7;
      if (days === 0 && slot.time <= nowHHMM) days = 7;
      if (!best || days < best.days || (days === best.days && slot.time < best.time)) best = { id: slot.id, days, time: slot.time };
    }
    return best?.id ?? null;
  })();

  return (
    // On wide screens the page breaks out of <main>'s padding (px-6 py-5) so
    // Past sessions can be a full-height panel on the right edge, like the
    // nav sidebar on the left. Phones keep the normal stacked page.
    <div className="p-6 lg:p-0 lg:-mx-6 lg:-my-5 lg:flex lg:min-h-[calc(100%+2.5rem)]">
      <div className="flex-1 min-w-0 space-y-8 lg:px-12 lg:py-11">
        {/* Weekly in-person times — read-only view of the same Recurring Slots
            Program plans under Program > Schedule, narrowed to this student's
            grade band. Kept small: it rarely changes. */}
        {myGradeSlots.length > 0 && (
          // A compact outlined card, only as wide as its tiles: title on the
          // first row, tiles on the second.
          <div className="w-fit max-w-full border border-border rounded-xl px-4 py-3 space-y-2.5">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarClock className="w-4 h-4 text-primary flex-shrink-0" /> In person, every week
            </p>
            {/* One small tile per session, all the same size; the next one is
                tinted and says so on its day line. */}
            <ul className="flex flex-wrap gap-2">
              {myGradeSlots.map((slot) => {
                const isNext = slot.id === nextSlotId;
                const tutors = slot.tutorIds.map((id) => tutorNameById(id).split(" ")[0]).join(", ");
                return (
                  <li
                    key={slot.id}
                    className={`px-3 py-1.5 rounded-lg border text-center ${isNext ? "border-primary bg-primary/10" : "border-border"}`}
                    title={tutors ? `With ${tutors}` : undefined}
                  >
                    <p className={`text-[11px] font-bold uppercase tracking-wide ${isNext ? "text-primary" : "text-muted-foreground"}`}>
                      {slot.day}{isNext && " · Next"}
                    </p>
                    <p className="text-sm font-semibold text-foreground whitespace-nowrap">{formatTime12h(slot.time)}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Tutoring sessions: one-off sessions with a tutor (requested or
            scheduled), as opposed to the weekly in-person group above. Each
            row leads with a date tile like the weekly ones. */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-display font-bold text-foreground">Tutoring sessions</h2>
            <button
              onClick={() => setModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Request Session
            </button>
          </div>
          {studentSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tutoring sessions coming up. Request one when you'd like help.</p>
          ) : (
            <ul className="divide-y divide-border">
              {studentSessions.map((s) => {
                const live = s.status === "in-progress";
                const inPerson = s.location === "in-person";
                return (
                  <li key={s.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className={`w-24 flex-shrink-0 px-2 py-1.5 rounded-lg border text-center ${live ? "border-primary bg-primary/10" : "border-border"}`}>
                      <p className={`text-[11px] font-bold uppercase tracking-wide ${live ? "text-primary" : "text-muted-foreground"}`}>{s.time}</p>
                      <p className="text-sm font-semibold text-foreground whitespace-nowrap">{s.clock}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{s.course}</p>
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {inPerson ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                        <span className="truncate">{inPerson ? "In person" : "Online"} · {tutorNameById(s.tutorId)} · {s.duration} min</span>
                      </p>
                    </div>
                    {live && (
                      <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Live
                      </span>
                    )}
                    {live && s.meetingId && (
                      <button
                        onClick={() => setActiveSession(s)}
                        className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
                      >
                        Join
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Past Sessions */}
      <section id="past-sessions" className="mt-8 lg:mt-0 lg:w-80 xl:w-96 flex-shrink-0 scroll-mt-4 lg:bg-card lg:border-l lg:border-border lg:px-6 lg:py-11">
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
                <p className="text-[11px] font-mono text-muted-foreground self-start mt-0.5">{h.date}</p>
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
