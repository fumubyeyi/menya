import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Plus, CalendarClock, CalendarPlus, Video, MapPin, XCircle } from "lucide-react";
import ZoomModal from "../../components/ZoomModal";
import type { Session, SessionArtifact } from "../../types";
import RequestSessionDialog from "../../components/student/RequestSessionDialog";
import CancelSessionDialog from "../../components/student/CancelSessionDialog";
import SessionArtifacts from "../../components/SessionArtifacts";
import { nextStop } from "../../components/student/CourseChapters";
import { useSessions } from "../../context/SessionsContext";
import { useStudentActivity } from "../../context/StudentActivityContext";
import { useRecurringSlots } from "../../context/RecurringSlotsContext";
import { useCurrentStudent } from "../../hooks/useCurrentStudent";
import { useStudentCurriculum } from "../../hooks/useStudentCurriculum";
import { studentSessionHistory, tutorNameById } from "../../data";
import { getCourseIcon, formatTime12h, shortDate, courseSlug, nextDateForWeekday, IN_PERSON_LOCATION } from "../../lib/constants";
import { subjectColor, subjectTint } from "../../lib/subject";
import { WEEKDAYS } from "../program/RecurringSlotModal";
import { bySessionStart, labelToISO, sessionDayISO } from "../../lib/sessionOrder";
import { downloadCalendarFile, sessionStartDate } from "../../lib/calendarFile";

// Upcoming sessions are grouped by when they happen.
type Group = "Today" | "This week" | "Later";
const GROUPS: Group[] = ["Today", "This week", "Later"];

// One row in Past sessions: a sample-history record or a session the student
// finished in the app.
interface PastItem {
  key: string;
  course: string;
  tutorId: number;
  dayISO: string;
  label: string;
  duration: number;
  artifacts?: SessionArtifact[];
}

export default function StudentSchedule() {
  const student = useCurrentStudent();
  const { sessions, updateSession, removeSession } = useSessions();
  const { logSessionAttended } = useStudentActivity();
  const { recurringSlots } = useRecurringSlots();
  const curriculum = useStudentCurriculum();
  const location = useLocation();

  const todayISO = new Date().toLocaleDateString("en-CA");
  const mine = sessions.filter((s) => s.student === student.name);

  // Sessions still to come: not completed, and not dated before today
  // (older seed sessions have no ISO date and are kept), soonest first.
  const upcoming = mine
    .filter((s) => s.status !== "completed" && !(s.date && s.date < todayISO))
    .sort(bySessionStart);

  // Today / This week (the next 7 days, so it never shrinks to nothing on a
  // Sunday) / Later
  const weekEndISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toLocaleDateString("en-CA");
  })();
  const groupOf = (s: Session): Group => {
    const day = sessionDayISO(s) ?? "9999";
    return day <= todayISO ? "Today" : day <= weekEndISO ? "This week" : "Later";
  };

  // Past sessions: the sample history plus any session finished in the app,
  // most recent first.
  const past: PastItem[] = [
    ...(studentSessionHistory[student.id] ?? []).map((h, i) => ({
      key: `h-${i}`, course: h.course, tutorId: h.tutorId, dayISO: labelToISO(h.date) ?? "", label: h.date, duration: h.duration, artifacts: h.artifacts,
    })),
    ...mine.filter((s) => s.status === "completed").map((s) => {
      const day = sessionDayISO(s) ?? todayISO;
      return { key: `s-${s.id}`, course: s.course, tutorId: s.tutorId, dayISO: day, label: shortDate(day), duration: s.duration };
    }),
  ].sort((a, b) => b.dayISO.localeCompare(a.dayISO));

  // Past sessions grow every week; show the most recent few until asked.
  const PAST_PREVIEW = 5;
  const [showAllPast, setShowAllPast] = useState(false);
  const visiblePast = showAllPast ? past : past.slice(0, PAST_PREVIEW);

  const [requestOpen, setRequestOpen] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);
  const [cancelling, setCancelling] = useState<Session | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

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

  // Calendar files
  const addWeeklyToCalendar = () =>
    downloadCalendarFile("menya-in-person.ics", myGradeSlots.map((slot) => ({
      title: "Menya in-person tutoring",
      start: sessionStartDate(nextDateForWeekday(slot.day), formatTime12h(slot.time)),
      minutes: 60,
      location: IN_PERSON_LOCATION || undefined,
      weekly: true,
    })));
  const addSessionToCalendar = (s: Session) => {
    const day = sessionDayISO(s);
    if (!day) return;
    downloadCalendarFile(`menya-${s.course.toLowerCase().replace(/\W+/g, "-")}-${day}.ics`, [{
      title: `${s.course} tutoring with ${tutorNameById(s.tutorId)}`,
      start: sessionStartDate(day, s.clock),
      minutes: s.duration,
      location: s.location === "in-person" ? IN_PERSON_LOCATION || "In person" : "Online (join from Menya)",
    }]);
  };

  // Where "Practice this" goes: the module to pick up in that course
  const practiceHref = (course: string) => {
    const c = curriculum.find((x) => x.name === course);
    const stop = c ? nextStop(c) : null;
    return stop ? `/student/module/${stop.chapterId}/${stop.index}` : `/student/learning#${courseSlug(course)}`;
  };

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
          // A compact outlined card, only as wide as its tiles: title and
          // Add to calendar on the first row, tiles on the second, then where.
          <div className="w-fit max-w-full border border-border rounded-xl px-4 py-3 space-y-2.5">
            {/* Title and Add to calendar each stay on one line; on narrow
                phones the link drops below the title */}
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground whitespace-nowrap">
                <CalendarClock className="w-4 h-4 text-primary flex-shrink-0" /> In person, every week
              </p>
              <button type="button" onClick={addWeeklyToCalendar}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline whitespace-nowrap">
                <CalendarPlus className="w-3.5 h-3.5" /> Add to calendar
              </button>
            </div>
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
            {IN_PERSON_LOCATION && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {IN_PERSON_LOCATION}
              </p>
            )}
          </div>
        )}

        {/* Tutoring sessions: one-off sessions with a tutor (requested or
            scheduled), as opposed to the weekly in-person group above.
            A grouped table (Today / This week / Later) with the actions
            always visible. */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-display font-bold text-foreground">Tutoring sessions</h2>
            <button
              onClick={() => { setEditing(null); setRequestOpen(true); }}
              data-request-trigger
              aria-haspopup="dialog"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {/* "Request" alone on phones so the heading keeps one line */}
              <Plus className="w-4 h-4" /> Request<span className="hidden sm:inline"> Session</span>
            </button>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tutoring sessions coming up. Request one when you'd like help.</p>
          ) : (
            // A table on wider screens (actions always visible), one stacked
            // row per session on phones. Both grouped Today / This week / Later.
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm hidden md:table">
                <thead>
                  <tr className="text-left text-xs font-semibold text-muted-foreground border-b border-border">
                    <th scope="col" className="px-4 py-2.5 font-semibold">When</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Course</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Tutor</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Where</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                {GROUPS.map((group) => {
                  const rows = upcoming.filter((s) => groupOf(s) === group);
                  if (rows.length === 0) return null;
                  return (
                    <tbody key={group}>
                      <tr className="bg-muted/50">
                        <th scope="rowgroup" colSpan={6} className="px-4 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{group}</th>
                      </tr>
                      {rows.map((s) => (
                        <tr key={s.id} className="border-t border-border">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-semibold text-foreground">{s.time}</span>
                            <span className="text-muted-foreground"> · {s.clock}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-2 font-semibold text-foreground">
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: subjectTint(s.course), color: subjectColor(s.course) }}>
                                {getCourseIcon(s.course)}
                              </span>
                              {s.course}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-foreground">{tutorNameById(s.tutorId)}</td>
                          <td className="px-4 py-3"><WhereCell session={s} /></td>
                          <td className="px-4 py-3"><StatusBadge session={s} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <SessionActions session={s} onJoin={setActiveSession} onReschedule={(x) => { setEditing(x); setRequestOpen(true); }}
                                onCalendar={addSessionToCalendar} onCancel={setCancelling} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  );
                })}
              </table>

              {/* Phones: one stacked row per session, same actions */}
              <div className="md:hidden">
                {GROUPS.map((group) => {
                  const rows = upcoming.filter((s) => groupOf(s) === group);
                  if (rows.length === 0) return null;
                  return (
                    <div key={group}>
                      <h3 className="px-4 py-1.5 bg-muted/50 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{group}</h3>
                      <ul className="divide-y divide-border">
                        {rows.map((s) => (
                          <li key={s.id} className="px-4 py-3 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground">{s.course} <span className="font-normal text-muted-foreground">with {tutorNameById(s.tutorId)}</span></p>
                                <p className="text-sm text-foreground">{s.time} · {s.clock}</p>
                                <WhereCell session={s} />
                              </div>
                              <StatusBadge session={s} />
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <SessionActions session={s} onJoin={setActiveSession} onReschedule={(x) => { setEditing(x); setRequestOpen(true); }}
                                onCalendar={addSessionToCalendar} onCancel={setCancelling} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <RequestSessionDialog
            open={requestOpen}
            onOpenChange={(o) => { setRequestOpen(o); if (!o) setEditing(null); }}
            student={student}
            editing={editing}
          />
          <CancelSessionDialog
            session={cancelling}
            onOpenChange={(o) => { if (!o) setCancelling(null); }}
            onConfirm={(s) => removeSession(s.id)}
          />
        </section>
      </div>

      {/* Past Sessions: most recent first, each with what to practice next */}
      <section id="past-sessions" className="mt-8 lg:mt-0 lg:w-80 xl:w-96 flex-shrink-0 scroll-mt-4 lg:bg-card lg:border-l lg:border-border lg:px-6 lg:py-11">
        <h2 className="text-lg font-display font-bold text-foreground mb-3">Past sessions</h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">Your finished sessions will show up here.</p>
        ) : (
          <div className="divide-y divide-border">
            {visiblePast.map((h) => (
              <div key={h.key} className="py-3 first:pt-0 last:pb-0 space-y-2">
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
                  <p className="text-[11px] font-mono text-muted-foreground self-start mt-0.5">{h.label}</p>
                </div>
                <div className="pl-12 space-y-2">
                  {h.artifacts && <SessionArtifacts artifacts={h.artifacts} />}
                  <Link to={practiceHref(h.course)} className="inline-block text-xs font-semibold text-primary hover:underline">
                    Practice {h.course}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {past.length > PAST_PREVIEW && (
          <button
            onClick={() => setShowAllPast((v) => !v)}
            className="mt-3 text-sm font-semibold text-primary hover:underline"
          >
            {showAllPast ? "Show less" : `Show all ${past.length}`}
          </button>
        )}
      </section>

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

function WhereCell({ session: s }: { session: Session }) {
  const inPerson = s.location === "in-person";
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
      {inPerson ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
      {inPerson ? "In person" : "Online"} · {s.duration} min
    </span>
  );
}

// Live, Requested (waiting for the tutor) or Confirmed
function StatusBadge({ session: s }: { session: Session }) {
  if (s.status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" aria-hidden /> Live now
      </span>
    );
  }
  return s.requested
    ? <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 whitespace-nowrap">Requested</span>
    : <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary whitespace-nowrap">Confirmed</span>;
}

// Always-visible actions: Join while live; otherwise Reschedule, Add to
// calendar and Cancel.
function SessionActions({ session: s, onJoin, onReschedule, onCalendar, onCancel }: {
  session: Session;
  onJoin: (s: Session) => void;
  onReschedule: (s: Session) => void;
  onCalendar: (s: Session) => void;
  onCancel: (s: Session) => void;
}) {
  const btn = "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap";
  if (s.status === "in-progress") {
    return s.meetingId ? (
      <button type="button" onClick={() => onJoin(s)} className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
        Join
      </button>
    ) : null;
  }
  return (
    <>
      <button type="button" onClick={() => onReschedule(s)} data-session-menu={s.id} className={`${btn} border-border text-foreground hover:bg-muted`}>
        <CalendarClock className="w-3.5 h-3.5" /> Reschedule
      </button>
      <button type="button" onClick={() => onCalendar(s)} aria-label={`Add ${s.course} on ${s.time} to calendar`} title="Add to calendar"
        className={`${btn} border-border text-foreground hover:bg-muted`}>
        <CalendarPlus className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => onCancel(s)} className={`${btn} border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40`}>
        <XCircle className="w-3.5 h-3.5" /> Cancel
      </button>
    </>
  );
}
