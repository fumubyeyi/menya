import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Settings2, BookPlus } from "lucide-react";
import EnrollmentModal from "../../components/EnrollmentModal";
import CourseChapters, { nextStop } from "../../components/student/CourseChapters";
import { getCourseIcon, courseSlug } from "../../lib/constants";
import { useEnrollment } from "../../hooks/useEnrollment";
import { useStudentCurriculum } from "../../hooks/useStudentCurriculum";
import { subjectColor, subjectTint } from "../../lib/subject";
import type { CurriculumCourse } from "../../types";
import { PageHeaderSubtitle } from "../../context/PageHeaderContext";

// My Courses: started courses side by side in outlined boxes, then
// a plain list of courses not started yet. Progress lives on Home, so
// each section is about what to do: the chapter the student is working in, with
// Resume on the module that needs it. "All chapters" opens the Module
// Workspace, whose course outline lists every chapter.

// A course counts as "started" once any module has moved off not-started.
const isStarted = (course: CurriculumCourse) =>
  course.chapters.some((ch) => ch.modules.some((m) => m.status !== "not-started"));

const moduleCount = (course: CurriculumCourse) => course.chapters.reduce((n, ch) => n + ch.modules.length, 0);

function CourseSection({ course }: { course: CurriculumCourse }) {
  const next = nextStop(course);
  const current = course.chapters.filter((ch) => ch.id === next?.chapterId);

  return (
    // Outlined only (no fill, so no card shadow): enough to group a course.
    <section id={courseSlug(course.name)} className="scroll-mt-20 min-w-0 border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 flex items-center gap-2.5 border-b border-border">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: subjectTint(course.name), color: subjectColor(course.name) }}
        >
          {getCourseIcon(course.name)}
        </span>
        <h2 className="flex-1 min-w-0 text-lg font-display font-bold text-foreground truncate">{course.name}</h2>
        {!next && <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary flex-shrink-0">Completed</span>}
        <Link
          to={`/student/module/${next?.chapterId ?? course.chapters[0]?.id}/${next?.index ?? 0}?outline=1`}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline flex-shrink-0"
        >
          All {course.chapters.length} chapters
        </Link>
      </div>
      {current.length > 0 && <CourseChapters course={course} chapters={current} windowed collapsible={false} />}
    </section>
  );
}
export default function Learning() {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const { courses: enrolledCourses, updateEnrollment } = useEnrollment();
  const curriculum = useStudentCurriculum();
  const location = useLocation();

  // Deep-link support: Home links here as /student/learning#<course-slug>
  // so a click on a course jumps straight to its card.
  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  const enrolled = enrolledCourses
    .map((name) => curriculum.find((c) => c.name === name))
    .filter((c): c is CurriculumCourse => !!c);
  const started = enrolled.filter(isStarted);
  const notStarted = enrolled.filter((c) => !isStarted(c));

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>Every chapter and module in your courses</PageHeaderSubtitle>

      {/* Changing courses is occasional, so it's a quiet button above the
          courses rather than a header action. */}
      {enrolled.length > 0 && (
        <div className="flex justify-end">
          <button onClick={() => setEnrollOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 border border-border bg-card text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors">
            <Settings2 className="w-4 h-4 text-muted-foreground" /> Manage Enrollment
          </button>
        </div>
      )}

      {enrolled.length === 0 && (
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

      {started.length > 0 && (
        // Two courses side by side on wide screens.
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {started.map((course) => (
            <CourseSection key={course.name} course={course} />
          ))}
        </div>
      )}

      {/* Only when there's an enrolled course the student hasn't begun:
          a plain list, two columns on wide screens. */}
      {notStarted.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-bold text-foreground mb-3">Not started yet</h2>
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 border-t border-border">
            {notStarted.map((course) => {
              const first = nextStop(course);
              return (
                <li key={course.name} id={courseSlug(course.name)} className="flex items-center gap-3 py-3 border-b border-border scroll-mt-20">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: subjectTint(course.name), color: subjectColor(course.name) }}
                  >
                    {getCourseIcon(course.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{course.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{course.chapters.length} chapters · {moduleCount(course)} modules</p>
                  </div>
                  {first && (
                    <Link to={`/student/module/${first.chapterId}/${first.index}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 motion-safe:transition-colors flex-shrink-0">
                      Start
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {enrollOpen && (
        <EnrollmentModal enrolled={enrolledCourses} onSave={updateEnrollment} onClose={() => setEnrollOpen(false)} />
      )}
    </div>
  );
}
