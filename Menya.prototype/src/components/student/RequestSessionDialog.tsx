import { useEffect, useState } from "react";
import { MapPin, Video, CheckCircle2 } from "lucide-react";
import { useSessions } from "../../context/SessionsContext";
import { useTutors } from "../../context/TutorsContext";
import { formatSessionTime, scoreTutorMatch, getCourseIcon } from "../../lib/constants";
import { subjectColor } from "../../lib/subject";
import { tutorNameById } from "../../data";
import type { Session, Student } from "../../types";
import { clockMinutes, sessionDayISO } from "../../lib/sessionOrder";
import StudentDialog, { DialogActions, Dialog } from "./StudentDialog";
import { Choice, FieldLabel, primaryBtn } from "./InlinePanel";

// Request Session for students, as a small modal. Asks only what a student
// knows: course, day, time, and online or in person. The best-matching tutor
// (course, then grade) is assigned. With `editing`, it reschedules that
// session instead. Either way the session is "requested" until the tutor
// confirms it.
const toHHMM = (clock: string) => {
  const m = clockMinutes(clock);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export default function RequestSessionDialog({ open, onOpenChange, student, editing }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
  editing?: Session | null;
}) {
  const { addSession, updateSession } = useSessions();
  const { tutors } = useTutors();
  const [course, setCourse] = useState(student.courses[0] ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("16:00");
  const [location, setLocation] = useState<"virtual" | "in-person">("virtual");
  const [sentWith, setSentWith] = useState<string | null>(null);

  // Opening to reschedule: start from the session's current details.
  useEffect(() => {
    if (!open || !editing) return;
    setCourse(editing.course);
    setDate(sessionDayISO(editing) ?? "");
    setTime(toHHMM(editing.clock));
    setLocation(editing.location === "in-person" ? "in-person" : "virtual");
  }, [open, editing]);

  const todayISO = new Date().toLocaleDateString("en-CA");
  const ready = !!course && !!date && !!time;

  const change = (next: boolean) => {
    onOpenChange(next);
    if (!next) { setSentWith(null); setDate(""); }
  };

  const submit = () => {
    if (!ready) return;
    // Same course when rescheduling keeps the same tutor
    const tutorId = editing && editing.course === course
      ? editing.tutorId
      : [...tutors].sort((a, b) => scoreTutorMatch(b, course, student.grade) - scoreTutorMatch(a, course, student.grade))[0]?.id;
    if (tutorId === undefined) return;
    const { time: label, clock } = formatSessionTime(date, time);
    const details = {
      tutorId,
      course,
      time: label,
      clock,
      date,
      location,
      requested: true,
      ...(location === "virtual" ? { meetingId: "add_real_meeting_id", password: "add_real_passcode" } : { meetingId: undefined, password: undefined }),
    };
    if (editing) updateSession({ ...editing, ...details });
    else addSession({ student: student.name, duration: 60, status: "scheduled", type: "tutoring", ...details });
    setSentWith(tutorNameById(tutorId));
  };

  return (
    <StudentDialog
      open={open}
      onOpenChange={change}
      title={sentWith ? (editing ? "Change sent" : "Session requested") : (editing ? "Change this session" : "Request a session")}
      description={sentWith ? undefined : editing ? "Your tutor will confirm the new time." : "We'll match you with a tutor for the course."}
      returnFocus="[data-request-trigger]"
    >
      {sentWith ? (
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-foreground">Sent to <span className="font-semibold">{sentWith}</span>. It shows as <span className="font-semibold">Requested</span> in your list until they confirm.</p>
          <Dialog.Close className={`mt-1 ${primaryBtn}`}>Done</Dialog.Close>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            <div>
              <FieldLabel>Which course?</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {student.courses.map((c) => (
                  <Choice key={c} selected={course === c} onClick={() => setCourse(c)}>
                    <span style={{ color: course === c ? undefined : subjectColor(c) }}>{getCourseIcon(c)}</span> {c}
                  </Choice>
                ))}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <FieldLabel>Day</FieldLabel>
                <input type="date" min={todayISO} value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </label>
              <label className="block">
                <FieldLabel>Time</FieldLabel>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </label>
            </div>
            <div>
              <FieldLabel>Where?</FieldLabel>
              <div className="flex flex-wrap gap-2">
                <Choice selected={location === "virtual"} onClick={() => setLocation("virtual")}><Video className="w-4 h-4" /> Online</Choice>
                <Choice selected={location === "in-person"} onClick={() => setLocation("in-person")}><MapPin className="w-4 h-4" /> In person</Choice>
              </div>
            </div>
          </div>
          <DialogActions>
            <button type="button" onClick={submit} disabled={!ready} className={primaryBtn}>{editing ? "Send change" : "Send request"}</button>
          </DialogActions>
        </>
      )}
    </StudentDialog>
  );
}
