import { useState } from "react";
import { ClipboardCheck, Check, ChevronDown, ChevronUp, Users as GroupIcon, ClipboardPlus, MessageSquareText, CalendarClock } from "lucide-react";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import { useAuth } from "../../context/AuthContext";
import { useSessions } from "../../context/SessionsContext";
import { useStudents } from "../../context/StudentsContext";
import { useTutors } from "../../context/TutorsContext";
import { useAttendance } from "../../context/AttendanceContext";
import { useRecurringSlots } from "../../context/RecurringSlotsContext";
import { studentsForAttendanceScope, attendanceRate, getTutorById, CURRENT_TUTOR_ID } from "../../data";
import { parseGroupLabel, gradesSummary, attendanceForSession, formatTime12h, formatSessionTime, shortDate } from "../../lib/constants";
import type { Session, AttendanceMark, AttendanceEntry, AttendanceSession, Student, Tutor } from "../../types";
import { PageHeaderSubtitle } from "../../context/PageHeaderContext";

const sameGrades = (a: number[], b: number[]) =>
  a.length === b.length && [...a].sort().every((g, i) => g === [...b].sort()[i]);

const MODES = [
  { key: "in-person", label: "In-Person" },
  { key: "online",    label: "Online"    },
] as const;
type Mode = (typeof MODES)[number]["key"];

function rateCls(rate: number) {
  if (rate >= 90) return "text-emerald-700 bg-emerald-50";
  if (rate >= 75) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}

// A session's expected attendees — the one named student for an online 1:1, or the
// whole grade band / course roster for an in-person group (reversed from the label
// "Add Session" gave it, same as editing a group re-derives its original target).
function rosterForSession(session: Session, students: Student[]): Student[] {
  if (session.location !== "in-person") {
    const s = students.find((st) => st.name === session.student);
    return s ? [s] : [];
  }
  const parsed = parseGroupLabel(session.student, session.course);
  return parsed.scope === "grade"
    ? studentsForAttendanceScope(students, "grade", parsed.grades.join(","))
    : studentsForAttendanceScope(students, "course", parsed.courseValue);
}

function groupLabel(session: Session): string {
  if (session.location !== "in-person") return session.student;
  const parsed = parseGroupLabel(session.student, session.course);
  return parsed.scope === "grade" ? gradesSummary(parsed.grades) : parsed.courseValue;
}

interface SessionCardProps {
  session: Session;
  roster: Student[];
  existing?: AttendanceSession;
  loggedByTutor?: Tutor;
  onSave: (entries: AttendanceEntry[]) => void;
  defaultExpanded?: boolean;
}

function SessionCard({ session, roster, existing, loggedByTutor, onSave, defaultExpanded }: SessionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const notedCount = existing?.entries.filter((e) => e.notes?.trim()).length ?? 0;
  const [marks, setMarks] = useState<Record<number, AttendanceMark>>(() => {
    const seed: Record<number, AttendanceMark> = {};
    roster.forEach((s) => { seed[s.id] = existing?.entries.find((e) => e.studentId === s.id)?.status ?? "present"; });
    return seed;
  });
  const [notes, setNotes] = useState<Record<number, string>>(() => {
    const seed: Record<number, string> = {};
    roster.forEach((s) => { seed[s.id] = existing?.entries.find((e) => e.studentId === s.id)?.notes ?? ""; });
    return seed;
  });

  const presentCount = roster.filter((s) => (marks[s.id] ?? "present") === "present").length;
  const isGroup = session.location === "in-person";

  const handleSave = () => {
    onSave(roster.map((s) => ({ studentId: s.id, status: marks[s.id] ?? "present", notes: notes[s.id]?.trim() || undefined })));
    setExpanded(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        {isGroup ? (
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <GroupIcon className="w-4 h-4 text-primary" />
          </div>
        ) : (
          <Avatar name={session.student} size={9} />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{groupLabel(session)}{isGroup ? " Group" : ""}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <CourseTag course={session.course} />
            <span className="text-[11px] text-muted-foreground font-mono">{session.time} · {session.clock}</span>
          </div>
        </div>
        <SessionStatusPill status={session.status} />
        {notedCount > 0 && (
          <span title={`${notedCount} student note${notedCount === 1 ? "" : "s"}`} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold text-blue-700 bg-blue-50">
            <MessageSquareText className="w-3 h-3" /> {notedCount}
          </span>
        )}
        {existing ? (
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${rateCls(attendanceRate(existing.entries))}`}>
            {attendanceRate(existing.entries)}% present
          </span>
        ) : (
          <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold text-amber-700 bg-amber-50">Not logged</span>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          disabled={roster.length === 0}
          title={roster.length === 0 ? "No students found for this session" : undefined}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          {!expanded && "Take Attendance"}
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-3">
          {roster.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No students found for this session.</p>
          ) : (
            <>
              {existing && loggedByTutor && loggedByTutor.id !== session.tutorId && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  Logged by {loggedByTutor.firstName} {loggedByTutor.lastName} — visible to every tutor on this session.
                </p>
              )}
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide bg-muted/40">
                      <th className="text-left py-2 pl-2 pr-2">Student</th>
                      <th className="text-left py-2 px-2 w-32">Status</th>
                      <th className="text-left py-2 pl-3 pr-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {roster.map((s) => (
                      <tr key={s.id}>
                        <td className="py-2 pl-3 pr-2">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={s.name} size={7} />
                            <p className="text-sm font-medium text-foreground">{s.name}</p>
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <button
                            type="button"
                            onClick={() => setMarks((m) => ({ ...m, [s.id]: m[s.id] === "absent" ? "present" : "absent" }))}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-colors ${
                              (marks[s.id] ?? "present") === "present"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${(marks[s.id] ?? "present") === "present" ? "bg-emerald-600 border-emerald-600" : "border-current"}`}>
                              {(marks[s.id] ?? "present") === "present" && <Check className="w-2.5 h-2.5 text-white" />}
                            </span>
                            {(marks[s.id] ?? "present") === "present" ? "Present" : "Absent"}
                          </button>
                        </td>
                        <td className="py-2 pl-2 pr-3">
                          <input
                            type="text"
                            value={notes[s.id] ?? ""}
                            onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                            placeholder="Add a note for this student…"
                            className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">{presentCount}/{roster.length} present</span>
                <button onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
                  <ClipboardCheck className="w-3.5 h-3.5" /> {existing ? "Save Changes" : "Save Attendance"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function TutorAttendance() {
  const { user } = useAuth();
  const tutorId = user?.tutorId ?? CURRENT_TUTOR_ID;
  const { sessions, addSession } = useSessions();
  const { students } = useStudents();
  const { tutors } = useTutors();
  const { attendanceSessions, addAttendanceSession, updateAttendanceSession } = useAttendance();
  const { recurringSlots } = useRecurringSlots();

  const [mode, setMode] = useState<Mode>("in-person");
  // Clock of a slot just turned into a real session, so its card can open already
  // expanded instead of making the tutor find and re-click it in the list.
  const [pendingExpandClock, setPendingExpandClock] = useState<string | null>(null);

  // Local calendar date, not toISOString()'s UTC one — otherwise "today" can roll
  // over a day early/late depending on the tutor's timezone, mismatching both the
  // Session `date` values it's compared against and the local weekday below.
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const todayWeekday = now.toLocaleDateString("en-US", { weekday: "long" });

  const modeSessions = sessions.filter((s) => s.tutorId === tutorId && (mode === "online" ? s.location !== "in-person" : s.location === "in-person"));

  // Attendance is for logging what actually happened, so in-person is bound to
  // today's session(s) — not the whole history, which already lives in Schedule's
  // Session History. Online keeps the full list; it isn't recurring-slot driven.
  const tutorSessions = (mode === "in-person" ? modeSessions.filter((s) => s.date === todayISO) : modeSessions)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  // Recurring slots that fall on today but don't yet have a session card above —
  // Program hasn't published a dated Session for this week's occurrence yet. Gives
  // the tutor a one-click way to take attendance for their grade today even when no
  // formal Session record exists for it yet.
  const todaysUncoveredSlots = mode === "in-person"
    ? recurringSlots.filter((slot) => {
        if (slot.day !== todayWeekday || !slot.tutorIds.includes(tutorId)) return false;
        return !tutorSessions.some((s) => {
          const parsed = parseGroupLabel(s.student, s.course);
          return parsed.scope === "grade" && sameGrades(parsed.grades, slot.grades);
        });
      })
    : [];

  const loggedCount = tutorSessions.filter((s) => attendanceForSession(s, sessions, attendanceSessions)).length;

  const saveForSession = (session: Session, entries: AttendanceEntry[]) => {
    const existing = attendanceForSession(session, sessions, attendanceSessions);
    const parsed = session.location === "in-person" ? parseGroupLabel(session.student, session.course) : undefined;
    if (existing) {
      updateAttendanceSession({ ...existing, entries });
    } else {
      addAttendanceSession({
        tutorId,
        scope: parsed ? parsed.scope : "course",
        ...(parsed
          ? (parsed.scope === "grade" ? { grades: parsed.grades } : { course: parsed.courseValue })
          : { course: session.course }),
        date: session.date ?? new Date().toISOString().slice(0, 10),
        sessionId: session.id,
        entries,
      });
    }
  };

  // Turns today's occurrence of a recurring slot into a real, dated Session — the
  // same shape Program's "Notify Tutors" publishes — so it gets a normal session
  // card with its own roster instead of a special-cased, modal-only flow. Once
  // created, it's real: it shows up on Program's Sessions view and this tutor's
  // own Schedule too, not just here.
  const takeAttendanceForSlot = (slot: (typeof recurringSlots)[number]) => {
    const { time, clock } = formatSessionTime(todayISO, slot.time);
    addSession({
      student: `${gradesSummary(slot.grades)} Group`,
      tutorId,
      course: "All Courses",
      date: todayISO,
      time,
      clock,
      duration: 120,
      status: "scheduled",
      type: "tutoring",
      location: "in-person",
    });
    setPendingExpandClock(clock);
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>
        {mode === "in-person" ? "Today" : "All"} · {tutorSessions.length} {mode === "online" ? "online" : "in-person"} sessions · {loggedCount} logged
      </PageHeaderSubtitle>

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

      {/* One card per scheduled session — expand to take or review attendance */}
      <div className="space-y-3">
        {tutorSessions.length === 0 && todaysUncoveredSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10 border border-dashed border-border rounded-xl">
            {mode === "in-person" ? "No in-person sessions today." : "No online sessions on your schedule yet."}
          </p>
        ) : (
          <>
            {tutorSessions.map((session) => {
              const existing = attendanceForSession(session, sessions, attendanceSessions);
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  roster={rosterForSession(session, students)}
                  existing={existing}
                  loggedByTutor={existing ? getTutorById(tutors, existing.tutorId) : undefined}
                  onSave={(entries) => saveForSession(session, entries)}
                  defaultExpanded={session.date === todayISO && session.clock === pendingExpandClock}
                />
              );
            })}

            {/* Today's recurring commitments without a session card above yet — one
                click turns the slot into a real, dated session (below) so it gets a
                normal card, roster, and notes instead of a separate modal flow. */}
            {todaysUncoveredSlots.map((slot) => (
              <div key={slot.id} className="flex items-center gap-3 bg-card border border-dashed border-border rounded-xl px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <GroupIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{gradesSummary(slot.grades)} Group</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground font-mono">
                    <CalendarClock className="w-3 h-3" /> {slot.day}, {shortDate(todayISO)} · {formatTime12h(slot.time)}
                  </div>
                </div>
                <SessionStatusPill status="scheduled" />
                <button
                  onClick={() => takeAttendanceForSlot(slot)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  <ClipboardPlus className="w-3.5 h-3.5" /> Take Attendance
                </button>
              </div>
            ))}
          </>
        )}
      </div>

    </div>
  );
}
