import { useSessions } from "../context/SessionsContext";
import { useStudents } from "../context/StudentsContext";
import { useAttendance } from "../context/AttendanceContext";
import { attendanceForSession, parseGroupLabel, rosterForSession } from "../lib/constants";
import type { AttendanceSession, Session } from "../types";

// Shared metadata every AttendanceSession needs regardless of how it's created —
// factored out so the kiosk's "first tap creates the record" path (below) builds
// the same shape the tutor's own Attendance page does via saveForSession.
function attendanceFieldsFor(session: Session) {
  const parsed = session.location === "in-person" ? parseGroupLabel(session.student, session.course) : undefined;
  return {
    tutorId: session.tutorId,
    scope: parsed ? parsed.scope : ("course" as const),
    ...(parsed
      ? (parsed.scope === "grade" ? { grades: parsed.grades } : { course: parsed.courseValue })
      : { course: session.course }),
    date: session.date ?? new Date().toISOString().slice(0, 10),
    sessionId: session.id,
  };
}

// Backs both kiosk views (entrance + classroom). Kept as one hook rather than two
// separate ones since both mutate the same AttendanceSession record for a given
// Session, and a student tapping in right after the tutor (or vice versa) needs to
// land on the record the other one just created, not clobber it.
export function useKioskCheckIn() {
  const { sessions } = useSessions();
  const { students } = useStudents();
  const { attendanceSessions, addAttendanceSession, updateAttendanceSession } = useAttendance();

  const recordFor = (session: Session): AttendanceSession | undefined =>
    attendanceForSession(session, sessions, attendanceSessions);

  const tutorCheckIn = (session: Session) => {
    const existing = recordFor(session);
    if (existing?.tutorCheckedInAt) return;
    const now = new Date().toISOString();
    if (existing) {
      updateAttendanceSession({ ...existing, tutorCheckedInAt: now });
      return;
    }
    const roster = rosterForSession(session, students);
    addAttendanceSession({
      ...attendanceFieldsFor(session),
      entries: roster.map((s) => ({ studentId: s.id, status: "absent" })),
      tutorCheckedInAt: now,
    });
  };

  const studentCheckIn = (session: Session, studentId: number) => {
    const existing = recordFor(session);
    if (existing?.entries.some((e) => e.studentId === studentId && e.checkedInAt)) return;
    const now = new Date().toISOString();
    if (existing) {
      const hasEntry = existing.entries.some((e) => e.studentId === studentId);
      const entries = hasEntry
        ? existing.entries.map((e) => (e.studentId === studentId ? { ...e, status: "present" as const, checkedInAt: now } : e))
        : [...existing.entries, { studentId, status: "present" as const, checkedInAt: now }];
      updateAttendanceSession({ ...existing, entries });
      return;
    }
    const roster = rosterForSession(session, students);
    addAttendanceSession({
      ...attendanceFieldsFor(session),
      entries: roster.map((s) => ({
        studentId: s.id,
        status: s.id === studentId ? ("present" as const) : ("absent" as const),
        checkedInAt: s.id === studentId ? now : undefined,
      })),
    });
  };

  return { recordFor, tutorCheckIn, studentCheckIn };
}
