import { useParams, Link } from "react-router";
import { CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import Eyebrow from "../../components/Eyebrow";
import KioskBackdrop from "../../components/KioskBackdrop";
import { useSessions } from "../../context/SessionsContext";
import { useStudents } from "../../context/StudentsContext";
import { useTutors } from "../../context/TutorsContext";
import { useKioskCheckIn } from "../../hooks/useKioskCheckIn";
import { getTutorById } from "../../data";
import { rosterForSession, sessionGroupLabel, parseGroupLabel, sameGrades, gradesForGroupId, localISODate } from "../../lib/constants";
import type { Session } from "../../types";

type GroupScope = "grade" | "course";

// A grade band or course, not a room number — a group's kiosk stays keyed to this
// identity even if the room it meets in changes, and even as its underlying Session
// record is re-minted under a new id each day when the week's slots publish.
function matchesGroup(session: Session, scope: GroupScope, value: string): boolean {
  if (session.location !== "in-person") return false;
  const parsed = parseGroupLabel(session.student, session.course);
  if (parsed.scope !== scope) return false;
  if (scope === "course") return parsed.courseValue === value;
  const groupId = Number(value);
  const target = Number.isNaN(groupId) ? undefined : gradesForGroupId(groupId);
  return !!target && sameGrades(parsed.grades, target);
}

// One kiosk per group (grade band or course) — students tap their own name to self
// check-in. Stays locked until the tutor has checked in at the front desk kiosk
// (TutorCheckInKiosk), so a group can't collect student check-ins with no tutor
// confirmed on site.
export default function StudentCheckInKiosk() {
  const { scope, value } = useParams<{ scope: string; value: string }>();
  const { sessions } = useSessions();
  const { students } = useStudents();
  const { tutors } = useTutors();
  const { recordFor, studentCheckIn } = useKioskCheckIn();

  const normalizedScope: GroupScope | null = scope === "grade" || scope === "course" ? scope : null;
  const decodedValue = value ? decodeURIComponent(value) : "";
  const todayISO = localISODate();

  const session = normalizedScope
    ? sessions.find((s) => s.date === todayISO && matchesGroup(s, normalizedScope, decodedValue))
    : undefined;

  if (!normalizedScope || !session) {
    return (
      <KioskBackdrop>
        <div className="max-w-xl w-full text-center mt-16">
          <p className="text-foreground font-display font-semibold text-lg mb-2">No session today</p>
          <p className="text-muted-foreground text-sm mb-5">
            {normalizedScope ? "This group has no in-person session scheduled today." : "This kiosk isn't pointed at a valid group."}
          </p>
          <Link to="/kiosk/tutors" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />Back to front desk
          </Link>
        </div>
      </KioskBackdrop>
    );
  }

  const tutor = getTutorById(tutors, session.tutorId);
  const roster = rosterForSession(session, students);
  const record = recordFor(session);
  const tutorCheckedIn = !!record?.tutorCheckedInAt;
  const checkedInCount = record?.entries.filter((e) => e.checkedInAt).length ?? 0;

  return (
    <KioskBackdrop>
      <div className="max-w-xl w-full">
        <header className="text-center mb-10">
          <Eyebrow size="lg">Welcome</Eyebrow>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">{sessionGroupLabel(session)}</h1>
          <p className="text-muted-foreground text-sm mt-1.5">Tap your name below to check in.</p>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <CourseTag course={session.course} />
            <span className="text-xs text-muted-foreground font-mono">{session.clock}</span>
            {tutor && <span className="text-xs text-muted-foreground">with {tutor.firstName} {tutor.lastName}</span>}
          </div>
        </header>

        {!tutorCheckedIn ? (
          <div className="bg-white border border-dashed border-border rounded-2xl px-6 py-12 text-center">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-display font-semibold text-foreground mb-1">Waiting for your tutor</p>
            <p className="text-sm text-muted-foreground">Ask {tutor ? tutor.firstName : "your tutor"} to check in at the front desk kiosk to unlock student check-in here.</p>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground mb-4">{checkedInCount} of {roster.length} checked in</p>
            <div className="space-y-2.5">
              {roster.map((student) => {
                const entry = record?.entries.find((e) => e.studentId === student.id);
                const checkedIn = !!entry?.checkedInAt;
                return (
                  <div
                    key={student.id}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl border transition-colors ${
                      checkedIn ? "bg-emerald-50 border-emerald-200" : "bg-white border-border"
                    }`}
                  >
                    <Avatar name={student.name} size={10} />
                    <span className="flex-1 min-w-0 font-medium text-foreground text-base truncate">{student.name}</span>
                    <button
                      onClick={() => studentCheckIn(session, student.id)}
                      disabled={checkedIn}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors flex-shrink-0 ${
                        checkedIn
                          ? "bg-emerald-100 text-emerald-700 cursor-default"
                          : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                      }`}
                    >
                      {checkedIn ? <CheckCircle2 className="w-4 h-4" /> : null}
                      {checkedIn ? "Checked in" : "Check In"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </KioskBackdrop>
  );
}
