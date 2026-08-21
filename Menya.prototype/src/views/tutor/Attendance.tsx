import { useState } from "react";
import { ClipboardCheck, Check, ChevronDown, ChevronUp, Users as GroupIcon, ClipboardPlus, MessageSquareText } from "lucide-react";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import RollCallModal from "../../components/RollCallModal";
import { useAuth } from "../../context/AuthContext";
import { useSessions } from "../../context/SessionsContext";
import { useStudents } from "../../context/StudentsContext";
import { useTutors } from "../../context/TutorsContext";
import { useAttendance } from "../../context/AttendanceContext";
import { studentsForAttendanceScope, attendanceRate, getTutorById, CURRENT_TUTOR_ID } from "../../data";
import { parseGroupLabel, gradesSummary, attendanceForSession } from "../../lib/constants";
import type { Session, AttendanceMark, AttendanceEntry, AttendanceSession, Student, Tutor } from "../../types";

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
}

function SessionCard({ session, roster, existing, loggedByTutor, onSave }: SessionCardProps) {
  const [expanded, setExpanded] = useState(false);
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
          className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
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
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Roster</span>
                <span className="text-[11px] font-mono text-muted-foreground">{presentCount}/{roster.length} present</span>
              </div>
              <div className="space-y-2">
                {roster.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 p-2.5 border border-border rounded-lg">
                    <Avatar name={s.name} size={7} />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <button
                          type="button"
                          onClick={() => setMarks((m) => ({ ...m, [s.id]: m[s.id] === "absent" ? "present" : "absent" }))}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-colors ${
                            (marks[s.id] ?? "present") === "present"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${(marks[s.id] ?? "present") === "present" ? "bg-emerald-600 border-emerald-600" : "border-current"}`}>
                            {(marks[s.id] ?? "present") === "present" && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          {(marks[s.id] ?? "present") === "present" ? "Present" : "Not Present"}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={notes[s.id] ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                        placeholder="Add a note for this student…"
                        className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
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
  const { sessions } = useSessions();
  const { students } = useStudents();
  const { tutors } = useTutors();
  const { attendanceSessions, addAttendanceSession, updateAttendanceSession } = useAttendance();

  const [mode, setMode] = useState<Mode>("in-person");
  const [rollCallModal, setRollCallModal] = useState(false);

  const tutorSessions = sessions
    .filter((s) => s.tutorId === tutorId && (mode === "online" ? s.location !== "in-person" : s.location === "in-person"))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  // Roll calls logged directly against a recurring slot (the "custom roll call"
  // fallback) rather than a specific Session record — kept as a separate reference
  // list below, since they have no session card of their own to attach to.
  const customRollCalls = attendanceSessions
    .filter((s) => s.tutorId === tutorId && !s.sessionId)
    .sort((a, b) => b.date.localeCompare(a.date));

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

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tutorSessions.length} {mode === "online" ? "online" : "in-person"} sessions · {loggedCount} logged
          </p>
        </div>
        <button
          onClick={() => setRollCallModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
        >
          <ClipboardPlus className="w-4 h-4" /> Log Custom Roll Call
        </button>
      </div>

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
        {tutorSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10 border border-dashed border-border rounded-xl">
            No {mode === "online" ? "online" : "in-person"} sessions on your schedule yet.
          </p>
        ) : (
          tutorSessions.map((session) => {
            const existing = attendanceForSession(session, sessions, attendanceSessions);
            return (
              <SessionCard
                key={session.id}
                session={session}
                roster={rosterForSession(session, students)}
                existing={existing}
                loggedByTutor={existing ? getTutorById(tutors, existing.tutorId) : undefined}
                onSave={(entries) => saveForSession(session, entries)}
              />
            );
          })
        )}
      </div>

      {customRollCalls.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Other Roll Calls</h2>
          <p className="text-xs text-muted-foreground mb-4">Logged outside of a specific scheduled session</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                  <th className="text-left pb-3 pr-4">Group</th>
                  <th className="text-left pb-3 pr-4">Date</th>
                  <th className="text-left pb-3">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customRollCalls.map((s) => {
                  const rate = attendanceRate(s.entries);
                  return (
                    <tr key={s.id}>
                      <td className="py-2.5 pr-4">
                        {s.scope === "course" ? <CourseTag course={s.course ?? ""} /> : <span className="text-xs font-mono text-foreground">Grades {(s.grades ?? []).join(", ")}</span>}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{s.date}</td>
                      <td className="py-2.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${rateCls(rate)}`}>{rate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rollCallModal && <RollCallModal onClose={() => setRollCallModal(false)} />}
    </div>
  );
}
