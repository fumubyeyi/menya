import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import SubjectTag from "../../components/SubjectTag";
import ModuleStatusRow from "../../components/ModuleStatusRow";
import ChapterModulesViewModal from "../../components/ChapterModulesViewModal";
import {
  sofia, studentSubjectDetail, studentModules, curriculum,
} from "../../data";
import { getSubjectIcon, subjectColor, chapterAction, courseCompletion } from "../../lib/constants";
import type { CurriculumChapter } from "../../types";

const VISIBLE_MODULES = 5;
const subjectDetails = studentSubjectDetail[sofia.id] ?? [];

function findChapter(subject: string, chapterTitle: string): CurriculumChapter | undefined {
  const title = chapterTitle.replace(/\s*\(next\)$/, "");
  return curriculum.find((c) => c.subject === subject)?.chapters.find((ch) => ch.title === title);
}

export default function Learning() {
  const [viewModulesFor, setViewModulesFor] = useState<{ subject: string; chapter: CurriculumChapter } | null>(null);

  const notStartedChapters = curriculum
    .filter((course) => sofia.subjects.includes(course.subject))
    .flatMap((course) => course.chapters.map((chapter) => ({ course, chapter })))
    .filter(({ chapter }) => chapter.modules.every((m) => m.status === "not-started"));

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Learning</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your subjects, modules, and curriculum progress</p>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {subjectDetails.map((sd) => {
          const color = subjectColor[sd.subject] ?? "#1B5E4F";
          const relatedModules = studentModules.filter((m) => m.subject === sd.subject);
          const completion = courseCompletion(sd.subject);

          return (
            <div key={sd.subject} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Colored top bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <span style={{ color }}>{getSubjectIcon(sd.subject)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{sd.subject}</h3>
                      <span className="text-lg font-display font-bold" style={{ color }}>{completion}%</span>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">{sd.sessions} sessions · Last: {sd.lastSession}</p>
                  </div>
                </div>

                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full transition-all" style={{ width: `${completion}%`, backgroundColor: color }} />
                </div>

                {/* Related modules */}
                {relatedModules.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">Active Modules</p>
                    {relatedModules.map((mod, i) => {
                      const chapter = findChapter(sd.subject, mod.title);
                      const visibleModules = chapter?.modules.slice(0, VISIBLE_MODULES) ?? [];
                      const remaining = chapter ? chapter.modules.length - visibleModules.length : 0;
                      const action = chapter ? chapterAction(chapter) : null;
                      return (
                        <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${color}15` }}>
                              <span style={{ color }}>{getSubjectIcon(mod.subject)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{mod.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <SubjectTag subject={mod.subject} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                    Module {mod.currentModule}/{mod.totalModules} · {mod.completion}% complete
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
                                <button onClick={() => setViewModulesFor({ subject: sd.subject, chapter })}
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

      {/* All Curriculum */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">All Curriculum</h2>
        {notStartedChapters.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">You've started every chapter in your curriculum — nice work!</p>
        ) : (
          <div className="divide-y divide-border">
            {notStartedChapters.map(({ course, chapter }) => {
              const color = subjectColor[course.subject] ?? "#1B5E4F";
              const visibleModules = chapter.modules.slice(0, VISIBLE_MODULES);
              const remaining = chapter.modules.length - visibleModules.length;
              const action = chapterAction(chapter);
              return (
                <div key={chapter.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}15` }}>
                      <span style={{ color }}>{getSubjectIcon(course.subject)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{chapter.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <SubjectTag subject={course.subject} />
                        <span className="text-[10px] font-mono text-muted-foreground">{chapter.modules.length} modules</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      {action.moduleIndex !== undefined ? (
                        <Link to={`/student/module/${chapter.id}/${action.moduleIndex}`}
                          className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                          {action.label}
                        </Link>
                      ) : (
                        <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">Completed</span>
                      )}
                    </div>
                  </div>

                  <div className="pl-11 mt-1 divide-y divide-border">
                    {visibleModules.map((m, i) => (
                      <ModuleStatusRow key={i} module={m} chapterId={chapter.id} index={i} />
                    ))}
                  </div>
                  {remaining > 0 && (
                    <button onClick={() => setViewModulesFor({ subject: course.subject, chapter })}
                      className="ml-11 mt-1 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      See all {chapter.modules.length} <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewModulesFor && (
        <ChapterModulesViewModal subject={viewModulesFor.subject} chapter={viewModulesFor.chapter}
          onClose={() => setViewModulesFor(null)} />
      )}
    </div>
  );
}
