import { useState } from "react";
import { Plus, ArrowRight, BookPlus } from "lucide-react";
import { Link } from "react-router";
import ZoomModal from "../../components/ZoomModal";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import StreakCard from "../../components/student/StreakCard";
import AchievementShelf from "../../components/student/AchievementShelf";
import { useStudentAchievements } from "../../hooks/useStudentAchievements";
import {
  studentModules, tutorNameById,
} from "../../data";
import {
  achievements, getCourseIcon, goalProgress, goalLabel,
  chapterAction, courseCompletion, courseSlug,
} from "../../lib/constants";
import { useSessions } from "../../context/SessionsContext";
import { useStudentGoals } from "../../hooks/useStudentGoals";
import { useStudentActivity } from "../../context/StudentActivityContext";
import { useCurrentStudent } from "../../hooks/useCurrentStudent";
import { useEnrollment } from "../../hooks/useEnrollment";
import { useStudentCurriculum } from "../../hooks/useStudentCurriculum";
import { subjectColor, subjectTint } from "../../lib/subject";

function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// The greeting's one line of encouragement: what the student has put in so
// far (modules finished, tutoring sessions), or a fresh-start line if nothing yet.
function effortLine(modules: number, sessions: number) {
  if (modules === 0 && sessions === 0) return <>Your journey starts today. Let's go!</>;
  const parts = [
    modules > 0 && <span key="m" className="font-bold">{plural(modules, "module")}</span>,
    sessions > 0 && <span key="s" className="font-bold">{plural(sessions, "session")}</span>,
  ].filter(Boolean);
  return <>You've finished {parts.length === 2 ? <>{parts[0]} and {parts[1]}</> : parts[0]} so far. Keep going!</>;
}

export default function StudentHome() {
  const student = useCurrentStudent();
  const [modal, setModal] = useState(false);
  const { sessions, updateSession } = useSessions();
  const { goals } = useStudentGoals();
  const { courses: enrolledCourses } = useEnrollment();
  const curriculumCourses = useStudentCurriculum();
  const { streak, studyDaysThisWeek, sessionsThisWeek, logSessionAttended } = useStudentActivity();
  const badges = useStudentAchievements();

  const firstName = student.name.split(" ")[0];

  // "Up next": the first active module (across every enrolled course) that
  // still has an actionable next step, resolved the same way My Courses
  // resolves its own Resume/Start buttons.
  const courseModules = studentModules[student.id] ?? [];
  const nextUp = courseModules
    .map((mod) => {
      const chapter = curriculumCourses.find((c) => c.name === mod.course)?.chapters.find((ch) => ch.title === mod.title);
      const action = chapter ? chapterAction(chapter) : null;
      return chapter && action && action.moduleIndex !== undefined && action.label !== "Completed"
        ? { mod, chapter, action }
        : null;
    })
    .find((x): x is NonNullable<typeof x> => x !== null);

  // My Journey: one progress bar per enrolled course, all shown at once.
  // Each row links to that course's next module (the first one in progress,
  // else the first not started), or to My Courses once it's all done.
  const journeyCourses = enrolledCourses
    .map((name) => curriculumCourses.find((c) => c.name === name))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .map((course) => {
      const stops = course.chapters.flatMap((ch) => ch.modules.map((m, i) => ({ m, chapterId: ch.id, index: i })));
      const done = stops.filter((s) => s.m.status === "completed").length;
      const next = stops.find((s) => s.m.status === "in-progress") ?? stops.find((s) => s.m.status === "not-started");
      return { course, total: stops.length, done, pct: courseCompletion(curriculumCourses, course.name), next };
    });

  const studentSessions = sessions.filter((s) => s.student === student.name);
  const upcomingSessions = studentSessions.filter((s) => s.status !== "completed").slice(0, 3);
  const [activeSession, setActiveSession] = useState<typeof upcomingSessions[number] | null>(null);
  const liveSession = upcomingSessions.find((s) => s.status === "in-progress" && !!s.meetingId);

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Live now: a tutor is waiting, so this beats everything else on the
          page. Only shown while a session is actually live. */}
      {liveSession && (
        <div
          className="flex items-center gap-3 flex-wrap rounded-xl border px-4 py-3 border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-50"
          role="status"
        >
          <span className="relative flex w-3 h-3 flex-shrink-0" aria-hidden>
            <span className="absolute inset-0 rounded-full bg-emerald-500 motion-safe:animate-ping opacity-60" />
            <span className="relative w-3 h-3 rounded-full bg-emerald-500" />
          </span>
          <p className="flex-1 min-w-[200px] text-sm">
            <span className="font-bold">{liveSession.course}</span> with {tutorNameById(liveSession.tutorId)} is <span className="font-bold">live now</span>.
          </p>
          <button
            onClick={() => setActiveSession(liveSession)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300 transition-colors"
          >
            Join now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Left: greeting and Up next. Right: the streak, with badges under it. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-display font-bold text-foreground text-2xl sm:text-3xl leading-tight">
              {greeting()}, {firstName}!
            </h2>
            <p className="text-base text-foreground mt-1.5">
              {effortLine(badges.input.modulesDone, student.sessions)}
            </p>
          </div>

          {/* Up next */}
          {nextUp && (
            <Link
              to={`/student/module/${nextUp.chapter.id}/${nextUp.action.moduleIndex}`}
              // Solid subject colour, so the next step is the boldest thing on the
              // page. Text uses var(--card): white on the light-mode colours, dark
              // on the lighter dark-mode ones, ≥ 4.5:1 either way.
              className="student-card-hover flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 rounded-xl p-5 sm:p-6 group"
              style={{ backgroundColor: subjectColor(nextUp.mod.course), color: "var(--card)", boxShadow: "var(--student-card-shadow)" }}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 [&_svg]:w-8 [&_svg]:h-8"
                  style={{ backgroundColor: "color-mix(in srgb, var(--card) 20%, transparent)" }}
                >
                  {getCourseIcon(nextUp.mod.course)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide">Up next</p>
                  <p className="text-xl font-display font-bold leading-tight line-clamp-2 sm:truncate">{nextUp.action.moduleTitle}</p>
                  <p className="text-sm mt-0.5 line-clamp-2 sm:truncate">
                    {nextUp.mod.course} · {nextUp.chapter.title} · Module {(nextUp.action.moduleIndex ?? 0) + 1} of {nextUp.chapter.modules.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-5 flex-shrink-0">
                <span
                  className="flex items-center gap-2 px-6 py-3 rounded-full text-base font-bold group-hover:brightness-95 motion-safe:transition"
                  style={{ backgroundColor: "var(--card)", color: subjectColor(nextUp.mod.course) }}
                >
                  {nextUp.action.label} <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          )}
        </div>

        <StreakCard
          streak={streak}
          // With no goals, the Goals card is hidden, so point to them here:
          // a weekly goal is what keeps a streak going.
          action={goals.length === 0 && (
            <Link to="/student/goals" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary hover:underline">
              Set a weekly goal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        >
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
            <Link to="/student/goals" className="text-xs font-semibold text-primary hover:underline">
              {badges.earned.length}/{achievements.length} · See all
            </Link>
          </div>
          <AchievementShelf data={badges} variant="icons" />
        </StreakCard>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {/* Course progress: a simple progress bar for every course at once */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-display font-bold text-foreground mb-4">Course progress</h2>
            {journeyCourses.length > 0 ? (
              <ul className="space-y-2">
                {journeyCourses.map(({ course, total, done, pct, next }) => (
                  <li key={course.name}>
                    <Link
                      to={next ? `/student/module/${next.chapterId}/${next.index}` : `/student/learning#${courseSlug(course.name)}`}
                      className="block rounded-xl -mx-2 px-2 py-2.5 hover:bg-muted/50 motion-safe:transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: subjectTint(course.name), color: subjectColor(course.name) }}
                        >
                          {getCourseIcon(course.name)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground">{course.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {next ? `Next: ${next.m.title}` : "All modules done!"} · {done}/{total} modules
                          </p>
                        </div>
                        <span className="text-lg font-display font-bold text-foreground flex-shrink-0">{pct}%</span>
                      </div>
                      <div
                        className="h-3 bg-muted rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${course.name} progress`}
                      >
                        <div className="h-full rounded-full bg-brand-amber motion-safe:transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-3 py-6">
                <BookPlus className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground flex-1">Pick a course to start your journey.</p>
                <Link to="/student/learning" className="text-sm font-semibold text-primary hover:underline">Browse courses</Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Sessions: what's booked, and booking another, in one place.
              Not just today's, so it isn't empty on non-session days; the
              full list lives on My Schedule. */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-semibold text-foreground">Sessions</h2>
              <button
                onClick={() => setModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Request
              </button>
            </div>
            {upcomingSessions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No sessions booked yet. Request one and a tutor will meet you.</p>
            ) : (
              <div className="divide-y divide-border">
                {upcomingSessions.map((s) => {
                  const live = s.status === "in-progress" && !!s.meetingId;
                  return (
                    <div key={s.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: subjectTint(s.course), color: subjectColor(s.course) }}>
                        {getCourseIcon(s.course)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{s.course}</p>
                        {/* When first, so a narrow column trims the tutor's name, not the time */}
                        <p className="text-[11px] font-mono text-muted-foreground truncate">{s.time} · {s.clock} · {tutorNameById(s.tutorId)}</p>
                      </div>
                      {live ? (
                        <button
                          onClick={() => setActiveSession(s)}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
                        >
                          Join
                        </button>
                      ) : (
                        <SessionStatusPill status={s.status} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {/* History lives on My Schedule; one tap away rather than repeated here */}
            <Link to="/student/schedule#past-sessions" className="mt-3 pt-3 border-t border-border flex items-center justify-end gap-1 text-xs font-semibold text-primary hover:underline">
              Past sessions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Goals: only when the student has set some. With none, the
              streak card links to the Goals page instead of an empty card. */}
          {goals.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Goals</h2>
              <div className="space-y-3">
                {goals.slice(0, 3).map((g) => {
                  const { current, target, pct } = goalProgress(g, { studyDaysThisWeek, sessionsThisWeek });
                  return (
                    <div key={g.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] text-foreground">{goalLabel(g)}</span>
                        <span className="text-[11px] font-mono text-muted-foreground">{current}/{target}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all bg-brand-amber" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && <ScheduleModal defaultStudent={student.name} onClose={() => setModal(false)} />}
      {activeSession?.meetingId && (
        <ZoomModal
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
