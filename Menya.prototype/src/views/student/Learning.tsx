import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { CheckCircle2, Circle, ChevronRight, Settings2, BookPlus } from "lucide-react";
import CourseTag from "../../components/CourseTag";
import ModuleStatusRow from "../../components/ModuleStatusRow";
import ChapterModulesViewModal from "../../components/ChapterModulesViewModal";
import EnrollmentModal from "../../components/EnrollmentModal";
import {
  studentCourseDetail, studentModules,
} from "../../data";
import { getCourseIcon, chapterAction, courseCompletion, courseSlug } from "../../lib/constants";
import { useEnrollment } from "../../hooks/useEnrollment";
import { useCurrentStudent } from "../../hooks/useCurrentStudent";
import { useStudentCurriculum } from "../../hooks/useStudentCurriculum";
import { subjectColor, subjectTint } from "../../lib/subject";
import type { CurriculumCourse, CurriculumChapter, CourseDetail } from "../../types";
import { PageHeaderSubtitle, PageHeaderActions } from "../../context/PageHeaderContext";

const VISIBLE_MODULES = 5;

function findChapter(courses: CurriculumCourse[], courseName: string, chapterTitle: string): CurriculumChapter | undefined {
  const title = chapterTitle.replace(/\s*\(next\)$/, "");
  return courses.find((c) => c.name === courseName)?.chapters.find((ch) => ch.title === title);
}

// A course counts as "started" once any module in any of its chapters has
// moved off not-started — otherwise it belongs in the Not Started list below.
function isCourseStarted(courses: CurriculumCourse[], courseName: string): boolean {
  const course = courses.find((c) => c.name === courseName);
  return !!course && course.chapters.some((ch) => ch.modules.some((m) => m.status !== "not-started"));
}

export default function Learning() {
  const [viewModulesFor, setViewModulesFor] = useState<{ course: string; chapter: CurriculumChapter } | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const { courses: enrolledCourses, updateEnrollment } = useEnrollment();
  const courses = useStudentCurriculum();
  const student = useCurrentStudent();
  const location = useLocation();

  // Deep-link support: Course Progress on Home links here as
  // /student/learning#<course-slug> so a click on a course jumps straight to
  // its card instead of just landing on the page.
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  const knownDetails = studentCourseDetail[student.id] ?? [];
  const modules = studentModules[student.id] ?? [];
  const activeCourseDetails: CourseDetail[] = enrolledCourses
    .filter((course) => isCourseStarted(courses, course))
    .map((course) =>
      knownDetails.find((sd) => sd.course === course) ??
      { course, score: 0, sessions: 0, lastSession: "Not started", trend: "flat" }
    );

  const notStartedCourses = enrolledCourses.filter((course) => !isCourseStarted(courses, course));

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>Your courses, modules, and curriculum progress</PageHeaderSubtitle>
      <PageHeaderActions>
        <button onClick={() => setEnrollOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0">
          <Settings2 className="w-4 h-4" /> Manage Enrollment
        </button>
      </PageHeaderActions>

      {enrolledCourses.length === 0 && (
        <div className="bg-card border border-dashed border-border rounded-xl p-10 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookPlus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">You're not enrolled in any courses yet</h3>
            <p className="text-xs text-muted-foreground mt-1">Browse the available courses and pick the ones you want to start learning.</p>
          </div>
          <button onClick={() => setEnrollOpen(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            Browse Courses
          </button>
        </div>
      )}

      {/* Active Courses */}
      {activeCourseDetails.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activeCourseDetails.map((sd) => {
          const color = subjectColor(sd.course);
          const tint = subjectTint(sd.course);
          const relatedModules = modules.filter((m) => m.course === sd.course);
          const completion = courseCompletion(courses, sd.course);

          return (
            <div key={sd.course} id={courseSlug(sd.course)} className="bg-card border border-border rounded-xl overflow-hidden scroll-mt-20">
              {/* Subject-coloured header band */}
              <div className="h-2 w-full" style={{ backgroundColor: color }} />

              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: tint }}
                  >
                    <span style={{ color }}>{getCourseIcon(sd.course)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{sd.course}</h3>
                      <span className="text-lg font-display font-bold" style={{ color }}>{completion}%</span>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">{sd.sessions} sessions · Last: {sd.lastSession}</p>
                  </div>
                </div>

                <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full transition-all" style={{ width: `${completion}%`, backgroundColor: color }} />
                </div>

                {/* Related modules */}
                {relatedModules.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">Active Modules</p>
                    {relatedModules.map((mod, i) => {
                      const chapter = findChapter(courses, sd.course, mod.title);
                      const visibleModules = chapter?.modules.slice(0, VISIBLE_MODULES) ?? [];
                      const remaining = chapter ? chapter.modules.length - visibleModules.length : 0;
                      const action = chapter ? chapterAction(chapter) : null;
                      return (
                        <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: tint }}>
                              <span style={{ color }}>{getCourseIcon(mod.course)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{mod.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <CourseTag course={mod.course} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                    {chapter
                                      ? `Module ${Math.min((action?.moduleIndex ?? chapter.modules.length - 1) + 1, chapter.modules.length)}/${chapter.modules.length} · ${Math.round((chapter.modules.filter((m) => m.status === "completed").length / Math.max(chapter.modules.length, 1)) * 100)}% complete`
                                      : `Module ${mod.currentModule}/${mod.totalModules} · ${mod.completion}% complete`}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                              {action && action.label !== "Completed" && chapter && action.moduleIndex !== undefined ? (
                                <Link to={`/student/module/${chapter.id}/${action.moduleIndex}`}
                                  className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                                  {action.label}
                                </Link>
                              ) : action?.label === "Completed" ? (
                                <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">Completed</span>
                              ) : null}
                            </div>
                          </div>

                          {chapter && (
                            <>
                              <div className="pl-6 pt-1 border-t border-border/60 divide-y divide-border">
                                {visibleModules.map((m, mi) => (
                                  <ModuleStatusRow key={mi} module={m} chapterId={chapter.id} index={mi} />
                                ))}
                              </div>
                              {remaining > 0 && (
                                <button onClick={() => setViewModulesFor({ course: sd.course, chapter })}
                                  className="pl-6 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                  See all {chapter.modules.length} <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Not Started — enrolled courses the student hasn't begun yet */}
      {enrolledCourses.length > 0 && (
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Not Started</h2>
        {notStartedCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">You've started every course you're enrolled in — nice work!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {notStartedCourses.map((courseName) => {
              const course = courses.find((c) => c.name === courseName);
              if (!course) return null;
              const color = subjectColor(courseName);
              const tint = subjectTint(courseName);
              const firstChapter = course.chapters[0];
              const action = firstChapter ? chapterAction(firstChapter) : null;
              const moduleCount = course.chapters.reduce((sum, ch) => sum + ch.modules.length, 0);
              return (
                <div key={courseName} className="student-card-hover flex items-center gap-3 p-4 rounded-xl border border-border bg-background">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tint }}>
                    <span style={{ color }}>{getCourseIcon(courseName)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{courseName}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{course.chapters.length} chapters · {moduleCount} modules</p>
                  </div>
                  {firstChapter && action?.moduleIndex !== undefined && (
                    <Link to={`/student/module/${firstChapter.id}/${action.moduleIndex}`}
                      className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors flex-shrink-0">
                      Start
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {viewModulesFor && (
        <ChapterModulesViewModal course={viewModulesFor.course} chapter={viewModulesFor.chapter}
          onClose={() => setViewModulesFor(null)} />
      )}

      {enrollOpen && (
        <EnrollmentModal enrolled={enrolledCourses} onSave={updateEnrollment} onClose={() => setEnrollOpen(false)} />
      )}
    </div>
  );
}
