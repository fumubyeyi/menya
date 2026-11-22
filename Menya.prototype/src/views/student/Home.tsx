import { useState } from "react";
import { Plus, ArrowRight, BookPlus, PartyPopper } from "lucide-react";
import { Link } from "react-router";
import ZoomModal from "../../components/ZoomModal";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import StreakCard from "../../components/student/StreakCard";
import AchievementShelf from "../../components/student/AchievementShelf";
import { useStudentAchievements } from "../../hooks/useStudentAchievements";
import {
  studentSessionHistory, studentModules, tutorNameById,
} from "../../data";
import {
  achievements, achievementGapLabel, getCourseIcon, goalProgress, goalLabel,
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

// A small ring for "how far through this chapter", drawn on the solid
// subject-coloured "Up next" card. It uses the card colour (white in light
// mode) rather than the usual amber: amber on the teal/pink fills is under
// 3:1 contrast and hard to see.
function ChapterRing({ pct }: { pct: number }) {
  const size = 72;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${pct}% of this chapter done`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--card) 30%, transparent)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--card)" strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ} strokeLinecap="round"
          className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: "var(--card)" }}>{pct}%</span>
    </div>
  );
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

  const sessionHistory = studentSessionHistory[student.id] ?? [];
  const studyHours = Math.round(sessionHistory.reduce((sum, h) => sum + h.duration, 0) / 60);
  const firstName = student.name.split(" ")[0];

  // Same progress figure the badges use (see useStudentAchievements).
  const computedProgress = badges.progress;

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
  const nextUpChapterPct = nextUp
    ? Math.round((nextUp.chapter.modules.filter((m) => m.status === "completed").length / nextUp.chapter.modules.length) * 100)
    : 0;

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

  const nextBadge = badges.next;

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Greeting + streak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 flex flex-col justify-center gap-4">
          <h2 className="font-display font-bold text-foreground text-2xl sm:text-3xl leading-tight">
            {greeting()}, {firstName}!
          </h2>
          {nextBadge ? (
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${nextBadge.achievement.color}1F` }}
              >
                <nextBadge.achievement.Icon className="w-5 h-5" style={{ color: nextBadge.achievement.color }} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-bold">{achievementGapLabel(nextBadge.achievement.metric, nextBadge.remaining)}</span>
                  {" "}to unlock <span className="font-bold">{nextBadge.achievement.label}</span>
                </p>
                <div className="mt-1.5 h-2 max-w-sm bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-brand-amber motion-safe:transition-all" style={{ width: `${nextBadge.pct}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-sm text-foreground">
              <PartyPopper className="w-5 h-5 text-brand-amber" /> You've earned every badge. Amazing work!
            </p>
          )}
        </div>
        <StreakCard streak={streak} />
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
            <ChapterRing pct={nextUpChapterPct} />
            <span
              className="flex items-center gap-2 px-6 py-3 rounded-full text-base font-bold group-hover:brightness-95 motion-safe:transition"
              style={{ backgroundColor: "var(--card)", color: subjectColor(nextUp.mod.course) }}
            >
              {nextUp.action.label} <ArrowRight className="w-5 h-5" />
            </span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {/* My Journey: a simple progress bar for every course at once */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-display font-bold text-foreground mb-4">My Journey</h2>
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

          {/* Upcoming Sessions — not just today, so this card isn't empty on
              non-session days; the full list still lives on the Schedule page. */}
          {upcomingSessions.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Upcoming Sessions</h2>
              <div className="divide-y divide-border">
                {upcomingSessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: subjectTint(s.course) }}>
                      <span style={{ color: subjectColor(s.course) }}>
                        {getCourseIcon(s.course)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.course}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{tutorNameById(s.tutorId)} · {s.time} · {s.clock}</p>
                    </div>
                    <SessionStatusPill status={s.status} />
                    {s.status === "in-progress" && s.meetingId && (
                      <button
                        onClick={() => setActiveSession(s)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Request a Session
          </button>

          {/* Achievements */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Achievements</h2>
              <Link to="/student/goals" className="text-xs font-semibold text-primary hover:underline">
                {badges.earned.length}/{achievements.length} · See all
              </Link>
            </div>
            <AchievementShelf data={badges} variant="compact" />
          </div>

          {/* Goals Snapshot */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Goals</h2>
            {goals.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No goals yet —{" "}
                <Link to="/student/goals" className="text-primary font-medium hover:underline">set one on the Goals page</Link>.
              </p>
            ) : (
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
            )}
          </div>

          {/* Recent Sessions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Recent Sessions</h2>
            <div className="space-y-2">
              {sessionHistory.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: subjectTint(h.course) }}>
                    <span style={{ color: subjectColor(h.course) }}>{getCourseIcon(h.course)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{h.course}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{h.date}</p>
                  </div>
                  <span className={`text-xs font-mono font-semibold ${h.score >= 80 ? "text-emerald-600" : h.score >= 65 ? "text-amber-600" : "text-red-600"}`}>{h.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats — the streak has its own card at the top. */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Progress", value: `${computedProgress}%` },
              { label: "Sessions", value: student.sessions },
              { label: "Study hrs", value: `${studyHours}h` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-2xl font-display font-bold text-foreground">{value}</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
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
