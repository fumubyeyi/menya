import { useState } from "react";
import { Plus, ArrowRight, BookPlus } from "lucide-react";
import { Link } from "react-router";
import RequestSessionDialog from "../../components/student/RequestSessionDialog";
import ZoomModal from "../../components/ZoomModal";
import StreakCard from "../../components/student/StreakCard";
import SessionsCalendar from "../../components/student/SessionsCalendar";
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
import { bySessionStart } from "../../lib/sessionOrder";

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
  const [requestOpen, setRequestOpen] = useState(false);
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

  // Home: one progress bar per enrolled course, all shown at once.
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

  const studentSessions = sessions.filter((s) => s.student === student.name).sort(bySessionStart);
  const upcomingSessions = studentSessions.filter((s) => s.status !== "completed").slice(0, 3);
  const [activeSession, setActiveSession] = useState<typeof upcomingSessions[number] | null>(null);
  const liveSession = upcomingSessions.find((s) => s.status === "in-progress" && !!s.meetingId);

  return (
    // On wide screens the page breaks out of <main>'s padding (px-6 py-5) so
    // the right column is a full-height side panel, like the nav sidebar and
    // the Past sessions panel on My Schedule. Phones keep the stacked cards.
    <div className="p-6 lg:p-0 lg:-mx-6 lg:-my-5 lg:flex lg:min-h-[calc(100%+2.5rem)]">
      <div className="flex-1 min-w-0 space-y-4 lg:px-12 lg:py-11">
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
              Join now
            </button>
          </div>
        )}

        {/* Greeting: plain text, no card. Up next is the one card on this
            side, so the thing to do stands out. */}
        <div>
          <h2 className="font-display font-bold text-foreground text-2xl sm:text-3xl leading-tight">
            {greeting()}, {firstName}!
          </h2>
          <p className="text-base text-foreground mt-1.5">
            {effortLine(badges.input.modulesDone, student.sessions)}
          </p>
        </div>

        {/* Up next: the only card here. Accents (stripe, label,
            Resume) use the primary colour; only the course icon keeps its
            course colour. */}
        {nextUp && (
          <Link
            to={`/student/module/${nextUp.chapter.id}/${nextUp.action.moduleIndex}`}
            className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 border border-border hover:border-primary/40 transition-colors rounded-xl p-5 group overflow-hidden relative"
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-primary" />
            <div className="flex items-center gap-4 flex-1 min-w-0 pl-1">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 [&_svg]:w-6 [&_svg]:h-6"
                style={{ backgroundColor: subjectTint(nextUp.mod.course), color: subjectColor(nextUp.mod.course) }}
              >
                {getCourseIcon(nextUp.mod.course)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Up next</p>
                <p className="text-lg font-display font-bold text-foreground leading-tight line-clamp-2 sm:truncate">{nextUp.action.moduleTitle}</p>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 sm:truncate">
                  {nextUp.mod.course} · {nextUp.chapter.title} · Module {(nextUp.action.moduleIndex ?? 0) + 1} of {nextUp.chapter.modules.length}
                </p>
              </div>
            </div>
            <span
              className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold flex-shrink-0 bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors"
            >
              {nextUp.action.label}
            </span>
          </Link>
        )}

        {/* Course progress: a simple progress bar for every course at once
            (a plain section, no card) */}
        <section className="pt-4">
          <h2 className="text-lg font-display font-bold text-foreground mb-3">Course progress</h2>
          {journeyCourses.length > 0 ? (
            <ul className="space-y-1">
              {/* One line per course: name, bar, percentage, module count */}
              {journeyCourses.map(({ course, total, done, pct, next }) => (
                <li key={course.name}>
                  <Link
                    to={next ? `/student/module/${next.chapterId}/${next.index}` : `/student/learning#${courseSlug(course.name)}`}
                    className="flex items-center gap-2 sm:gap-3 rounded-xl -mx-2 px-2 py-2.5 hover:bg-muted/50 motion-safe:transition-colors"
                  >
                    <span
                      // Icon hidden on phones so the bar keeps room
                      className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: subjectTint(course.name), color: subjectColor(course.name) }}
                    >
                      {getCourseIcon(course.name)}
                    </span>
                    <span className="w-[5.5rem] sm:w-28 text-sm font-bold text-foreground truncate flex-shrink-0">{course.name}</span>
                    <span
                      className="flex-1 min-w-[60px] h-3 bg-muted rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${course.name} progress`}
                    >
                      <span className="block h-full rounded-full bg-brand-amber motion-safe:transition-all" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-10 text-right text-sm font-bold text-foreground flex-shrink-0">{pct}%</span>
                    <span className="w-11 sm:w-24 text-right text-xs font-mono text-muted-foreground flex-shrink-0">
                      {done}/{total}<span className="hidden sm:inline"> modules</span>
                    </span>
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
        </section>
      </div>

      {/* Side panel (time and people): streak and badges, sessions, goals.
          Separated by rules inside the panel instead of separate cards. */}
      <aside className="mt-4 lg:mt-0 lg:w-80 xl:w-96 flex-shrink-0 space-y-4 lg:space-y-0 lg:divide-y lg:divide-border lg:bg-card lg:border-l lg:border-border lg:px-6 lg:py-5">
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

        {/* Sessions as a small calendar: dots on session days, the chosen
            day's sessions below, plus Request and Past sessions. */}
        <SessionsCalendar sessions={studentSessions} onJoin={setActiveSession} onRequest={() => setRequestOpen(true)} />
        <RequestSessionDialog open={requestOpen} onOpenChange={setRequestOpen} student={student} />

        {/* Goals: only when the student has set some. With none, the
            streak card links to the Goals page instead of an empty card. */}
        {goals.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 lg:bg-transparent lg:border-0 lg:rounded-none lg:px-0 lg:py-6">
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
      </aside>

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
