import { useState } from "react";
import { Clock, Plus, CalendarClock, Users as GroupIcon, X } from "lucide-react";
import ZoomModal from "../../components/ZoomModal";
import type { Session } from "../../types";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import SessionArtifacts from "../../components/SessionArtifacts";
import { useSessions } from "../../context/SessionsContext";
import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import { useStudents } from "../../context/StudentsContext";
import { useAttendance } from "../../context/AttendanceContext";
import { useRecurringSlots } from "../../context/RecurringSlotsContext";
import { getTutorStudents, studentSessionHistory, getTutorById, CURRENT_TUTOR_ID } from "../../data";
import { formatTime12h, gradesSummary, parseGroupLabel, attendanceForSession, canCancelSession, nextDateForWeekday, formatSessionTime } from "../../lib/constants";
import { WEEKDAYS } from "../program/RecurringSlotModal";
import { mondayOf, toISODate } from "../program/Schedule";
import type { AttendanceSession, Student } from "../../types";

// The grade band or course an in-person group session was booked for — reversed
// from the "Grades 6, 7 Group" / "<Course> Group" label the same way editing one
// (or taking attendance for one) already does.
function groupLabel(session: Session): string {
  const parsed = parseGroupLabel(session.student, session.course);
  return parsed.scope === "grade" ? gradesSummary(parsed.grades) : parsed.courseValue;
}

// The per-student notes logged for a session — shared across every co-tutor on it
// (see attendanceForSession) — as (name, note) pairs for the History table preview
// and the "view all" modal.
function noteEntries(attendance: AttendanceSession | undefined, students: Student[]): { studentId: number; studentName: string; note: string }[] {
  if (!attendance) return [];
  return attendance.entries
    .filter((e) => e.notes?.trim())
    .map((e) => ({ studentId: e.studentId, studentName: students.find((s) => s.id === e.studentId)?.name ?? "Unknown", note: e.notes! }));
}

interface SessionNotesModalProps {
  session: Session;
  attendance: AttendanceSession;
  students: Student[];
  onClose: () => void;
}

function SessionNotesModal({ session, attendance, students, onClose }: SessionNotesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">{groupLabel(session)} Notes</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">{session.date} · {session.clock}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-2 scrollbar-hide">
          {attendance.entries.map((e) => {
            const student = students.find((s) => s.id === e.studentId);
            return (
              <div key={e.studentId} className="flex items-start gap-3 p-2.5 border border-border rounded-lg">
                <Avatar name={student?.name ?? "Unknown"} size={7} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{student?.name ?? "Unknown"}</p>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${e.status === "present" ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}>
                      {e.status === "present" ? "Present" : "Absent"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{e.notes?.trim() || "No note."}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const MODES = [
  { key: "in-person", label: "In-Person" },
  { key: "online",    label: "Online"    },
] as const;
type Mode = (typeof MODES)[number]["key"];

function scoreCls(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 65) return "text-amber-600";
  return "text-red-600";
}

export default function TutorSchedule() {
  const { user } = useAuth();
  const { tutors } = useTutors();
  const tutorId = user?.tutorId ?? CURRENT_TUTOR_ID;
  const { sessions, removeSession } = useSessions();
  const { students } = useStudents();
  const { attendanceSessions } = useAttendance();
  const { recurringSlots } = useRecurringSlots();
  const tutorSessions = sessions.filter((s) => s.tutorId === tutorId);
  const [mode, setMode] = useState<Mode>("in-person");
  const [modal, setModal] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [notesModalSession, setNotesModalSession] = useState<Session | null>(null);
  const currentTutor = getTutorById(tutors, tutorId);
  const tutorStudents = getTutorStudents(tutorId);

  const modeSessions = tutorSessions.filter((s) => (mode === "online" ? s.location !== "in-person" : s.location === "in-person"));

  const mySlots = WEEKDAYS
    .flatMap((day) => recurringSlots.filter((s) => s.day === day && s.tutorIds.includes(tutorId)))
    .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) || a.time.localeCompare(b.time));

  // "Upcoming" is bounded to this week + next week and sorted soonest-first, rather
  // than dumping every session for the mode in whatever order it was created —
  // older/stale ones belong in Session History below, not here. Sessions carry a
  // real `date` once scheduled; the handful of older mock sessions that predate that
  // field fall back to their "Today"/"Tomorrow" label so they still resolve to a
  // real day instead of being silently dropped.
  const todayDate = new Date();
  const todayISOForUpcoming = toISODate(todayDate);
  const tomorrowISO = toISODate(new Date(todayDate.getTime() + 86400000));
  const windowEnd = mondayOf(todayDate);
  windowEnd.setDate(windowEnd.getDate() + 13);
  const windowEndISO = toISODate(windowEnd);

  const effectiveDate = (s: Session): string =>
    s.date ?? (s.time === "Today" ? todayISOForUpcoming : s.time === "Tomorrow" ? tomorrowISO : "");

  const upcomingModeSessions = modeSessions
    .filter((s) => s.status !== "completed")
    .map((s) => ({ session: s, eff: effectiveDate(s) }))
    .filter(({ eff }) => eff !== "" && eff >= todayISOForUpcoming && eff <= windowEndISO)
    .map(({ session, eff }) => ({ session, date: eff }));

  // Project each recurring slot forward to its next one or two calendar occurrences
  // within the same this-week/next-week window — Program may not have "Notified
  // Tutors" (turned the slot into a real dated Session) for a future week yet, but
  // the tutor's standing commitment is still real and worth showing. Skipped for any
  // date that already has a real Session, so a published slot isn't shown twice.
  const bookedInPersonDates = new Set(tutorSessions.filter((s) => s.location === "in-person" && s.date).map((s) => s.date));
  const projectedOccurrences = mode === "in-person"
    ? mySlots.flatMap((slot) => {
        const first = nextDateForWeekday(slot.day, todayDate);
        const [fy, fm, fd] = first.split("-").map(Number);
        const second = toISODate(new Date(fy, fm - 1, fd + 7));
        return [first, second]
          .filter((date) => date <= windowEndISO && !bookedInPersonDates.has(date))
          .map((date) => ({ slot, date }));
      })
    : [];

  const clockMinutes = (clock: string): number => {
    const match = clock.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let hours = Number(match[1]) % 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
    return hours * 60 + Number(match[2]);
  };

  const upcomingRows = [
    ...upcomingModeSessions.map(({ session, date }) => ({ kind: "real" as const, session, date, clock: session.clock })),
    ...projectedOccurrences.map(({ slot, date }) => {
      const { clock } = formatSessionTime(date, slot.time);
      return { kind: "projected" as const, slot, date, clock };
    }),
  ].sort((a, b) => a.date.localeCompare(b.date) || clockMinutes(a.clock) - clockMinutes(b.clock));

  const history = tutorStudents.flatMap((s) =>
    (studentSessionHistory[s.id] ?? []).map((h) => ({ ...h, studentName: s.name }))
  );

  const todayISO = new Date().toISOString().slice(0, 10);
  const inPersonHistory = tutorSessions
    .filter((s) => s.location === "in-person" && !!s.date && s.date <= todayISO)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mode === "online" ? `${modeSessions.length} online sessions` : `${modeSessions.length} in-person sessions`}
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      {/* Recurring slots this tutor is assigned to — a standing weekly reference,
          managed by Program staff under Program > Schedule. */}
      {mySlots.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" /> My Recurring Slots
          </h2>
          <div className="flex flex-wrap gap-2">
            {mySlots.map((slot) => (
              <span key={slot.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-muted text-foreground border border-border">
                {slot.day} · {gradesSummary(slot.grades)} · {formatTime12h(slot.time)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex gap-1 border-b border-border">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors -mb-px border-b-2 ${
              mode === key
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Upcoming {mode === "online" ? "Online" : "In-Person"} Sessions</h2>
        {upcomingRows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No upcoming {mode === "online" ? "online" : "in-person"} sessions this week or next.</p>
        ) : (
          <div className="divide-y divide-border">
            {upcomingRows.map((row) => {
              if (row.kind === "projected") {
                const { time } = formatSessionTime(row.date, row.slot.time);
                return (
                  <div key={`${row.slot.id}-${row.date}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <GroupIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{gradesSummary(row.slot.grades)} Group</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[11px] text-muted-foreground font-mono">{time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Clock className="w-3.5 h-3.5" /> {row.clock}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-full">Recurring · Not yet scheduled</span>
                  </div>
                );
              }

              const s = row.session;
              return (
                <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar name={s.student} size={9} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.student}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <CourseTag course={s.course} />
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
                  {s.status !== "in-progress" && s.status !== "completed" && (
                    canCancelSession(s) ? (
                      <button
                        onClick={() => removeSession(s.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 border border-red-300 hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        disabled
                        title="Sessions can only be canceled at least 24 hours in advance"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground border border-border opacity-50 cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Session History Table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Session History</h2>
        {mode === "in-person" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  <th className="text-left pb-3 pr-4">Grade Group</th>
                  <th className="text-left pb-3 pr-4">Session</th>
                  <th className="text-left pb-3 pr-4">Duration</th>
                  <th className="text-left pb-3 pr-4">Status</th>
                  <th className="text-left pb-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inPersonHistory.map((s) => {
                  const attendance = attendanceForSession(s, sessions, attendanceSessions);
                  const notes = noteEntries(attendance, students);
                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-4 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <GroupIcon className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground text-xs">{groupLabel(s)}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap align-top">{s.date} · {s.clock}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground align-top">{s.duration}m</td>
                      <td className="py-2.5 pr-4 align-top">
                        <SessionStatusPill status={s.status} />
                      </td>
                      <td className="py-2.5 max-w-xs align-top">
                        {!attendance ? (
                          <span className="text-xs text-muted-foreground">Not logged yet</span>
                        ) : notes.length === 0 ? (
                          <span className="text-xs text-muted-foreground">No notes</span>
                        ) : (
                          <div className="space-y-1">
                            {notes.slice(0, 2).map((n) => (
                              <p key={n.studentId} className="text-xs text-muted-foreground truncate">
                                <span className="font-medium text-foreground">{n.studentName}:</span> {n.note}
                              </p>
                            ))}
                            <button type="button" onClick={() => setNotesModalSession(s)}
                              className="text-[11px] font-mono text-primary hover:underline">
                              {notes.length > 2 ? `+${notes.length - 2} more · View all` : "View all"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {inPersonHistory.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No past in-person sessions yet.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  <th className="text-left pb-3 pr-4">Student</th>
                  <th className="text-left pb-3 pr-4">Course</th>
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
                      <CourseTag course={h.course} />
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
        )}
      </div>

      {notesModalSession && (() => {
        const attendance = attendanceForSession(notesModalSession, sessions, attendanceSessions);
        return attendance ? (
          <SessionNotesModal session={notesModalSession} attendance={attendance} students={students} onClose={() => setNotesModalSession(null)} />
        ) : null;
      })()}

      {modal && <ScheduleModal onClose={() => setModal(false)} />}
      {activeSession?.meetingId && (
        <ZoomModal
          sessionId={activeSession.id}
          meetingId={activeSession.meetingId}
          password={activeSession.password ?? ""}
          userName={currentTutor ? `${currentTutor.firstName} ${currentTutor.lastName}` : undefined}
          course={activeSession.course}
          onClose={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}
