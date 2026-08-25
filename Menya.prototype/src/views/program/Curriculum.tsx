import { useState } from "react";
import { PlusCircle, Plus, BookOpen, Users, ChevronRight, AlertTriangle, Upload, Wand2 } from "lucide-react";
import CourseTag from "../../components/CourseTag";
import AddCourseModal from "../../components/AddCourseModal";
import ImportCurriculumModal from "../../components/ImportCurriculumModal";
import BootstrapCurriculumModal from "../../components/BootstrapCurriculumModal";
import AddChapterModal from "../../components/AddChapterModal";
import AddModuleModal from "../../components/AddModuleModal";
import ChapterModulesModal from "../../components/ChapterModulesModal";
import EditModuleModal from "../../components/EditModuleModal";
import EditChapterTestModal from "../../components/EditChapterTestModal";
import { useCurriculum } from "../../context/CurriculumContext";
import { useAuth } from "../../context/AuthContext";
import { diffCls, courseColor, chapterContentGaps, courseContentGaps } from "../../lib/constants";
import type { CurriculumCourse, CurriculumChapter } from "../../types";

const VISIBLE_MODULES = 5;

export default function Curriculum() {
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const { courses, addCourse, importChapters, addChapter, addModule, updateModule, updateChapterTest } = useCurriculum();
  const [activeTab, setActiveTab] = useState("All");
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showImportCourse, setShowImportCourse] = useState(false);
  const [showBootstrapCourse, setShowBootstrapCourse] = useState(false);
  const [importChaptersFor, setImportChaptersFor] = useState<CurriculumCourse | null>(null);
  const [addChapterFor, setAddChapterFor] = useState<CurriculumCourse | null>(null);
  const [addModuleFor, setAddModuleFor] = useState<{ course: CurriculumCourse; chapter: CurriculumChapter } | null>(null);
  const [viewModulesFor, setViewModulesFor] = useState<{ course: CurriculumCourse; chapter: CurriculumChapter } | null>(null);
  const [editModuleFor, setEditModuleFor] = useState<{ course: CurriculumCourse; chapter: CurriculumChapter; moduleIndex: number } | null>(null);
  const [editTestFor, setEditTestFor] = useState<{ course: CurriculumCourse; chapter: CurriculumChapter } | null>(null);

  const courseTabs = ["All", ...courses.map((c) => c.name)];
  const filteredCourses = activeTab === "All" ? courses : courses.filter((c) => c.name === activeTab);

  const totalChapters = courses.reduce((sum, c) => sum + c.chapters.length, 0);
  const totalModules = courses.reduce((sum, c) => sum + c.chapters.reduce((s, ch) => s + ch.modules.length, 0), 0);
  const totalContentGaps = courses.reduce((sum, c) => sum + courseContentGaps(c), 0);

  // Keep the "see all" modal's chapter data in sync as modules get added/edited.
  const liveViewModulesFor = viewModulesFor
    ? { course: viewModulesFor.course, chapter: courses.find((c) => c.id === viewModulesFor.course.id)?.chapters.find((ch) => ch.id === viewModulesFor.chapter.id) ?? viewModulesFor.chapter }
    : null;

  const liveEditModuleFor = editModuleFor
    ? {
        course: editModuleFor.course,
        chapter: courses.find((c) => c.id === editModuleFor.course.id)?.chapters.find((ch) => ch.id === editModuleFor.chapter.id) ?? editModuleFor.chapter,
        moduleIndex: editModuleFor.moduleIndex,
      }
    : null;

  const liveEditTestFor = editTestFor
    ? { course: editTestFor.course, chapter: courses.find((c) => c.id === editTestFor.course.id)?.chapters.find((ch) => ch.id === editTestFor.chapter.id) ?? editTestFor.chapter }
    : null;

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Curriculum Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalChapters} chapters · {totalModules} modules across {courses.length} math courses
            {totalContentGaps > 0 && ` · ${totalContentGaps} modules need content`}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowImportCourse(true)} className="flex items-center gap-1.5 border border-border text-foreground text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-muted transition-colors">
              <Upload className="w-4 h-4" />
              Import Curriculum
            </button>
            <button onClick={() => setShowBootstrapCourse(true)} className="flex items-center gap-1.5 border border-border text-foreground text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-muted transition-colors">
              <Wand2 className="w-4 h-4" />
              Bootstrap with AI
            </button>
            <button onClick={() => setShowAddCourse(true)} className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              <PlusCircle className="w-4 h-4" />
              Add Course
            </button>
          </div>
        )}
      </div>

      {/* Course Filter Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-border pb-0">
        {courseTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
              activeTab === tab
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Courses */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <BookOpen className="w-8 h-8 opacity-40" />
          <p className="text-sm">No courses yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCourses.map((course) => {
            const color = courseColor[course.name] ?? "#1B5E4F";
            const courseGaps = courseContentGaps(course);
            return (
              <div key={course.id} className="space-y-3">
                {/* Course header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <CourseTag course={course.name} />
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-muted text-muted-foreground">Grade {course.grade}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />{course.students} students
                    </span>
                    {courseGaps > 0 && (
                      <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-mono text-amber-700 bg-amber-50">
                        <AlertTriangle className="w-3 h-3" />{courseGaps} incomplete
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setImportChaptersFor(course)} className="flex items-center gap-1.5 border border-border text-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        Import Curriculum
                      </button>
                      <button onClick={() => setAddChapterFor(course)} className="flex items-center gap-1.5 border border-border text-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                        <PlusCircle className="w-3.5 h-3.5" />
                        Add Chapter
                      </button>
                    </div>
                  )}
                </div>

                {/* Chapter Grid */}
                {course.chapters.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-6 px-4 border border-dashed border-border rounded-xl text-center">
                    No chapters yet — add the first one.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.chapters.map((chapter) => {
                      const visibleModules = chapter.modules.slice(0, VISIBLE_MODULES);
                      const remaining = chapter.modules.length - visibleModules.length;
                      const gaps = chapterContentGaps(chapter);
                      return (
                        <div key={chapter.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm hover:border-primary/30 transition-all">
                          {/* Colored top bar */}
                          <div className="h-1.5" style={{ backgroundColor: color }} />

                          <div className="p-4 space-y-3">
                            {/* Title & Difficulty */}
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-semibold text-foreground leading-snug flex-1">{chapter.title}</h3>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {gaps > 0 && (
                                  <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-mono text-amber-700 bg-amber-50">
                                    <AlertTriangle className="w-3 h-3" />{gaps} incomplete
                                  </span>
                                )}
                                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${diffCls[chapter.difficulty]}`}>
                                  {chapter.difficulty}
                                </span>
                              </div>
                            </div>

                            {/* Module list */}
                            {chapter.modules.length > 0 && (
                              <ul className="space-y-1 pt-1 border-t border-border">
                                {visibleModules.map((m, i) => (
                                  <li key={i} className="text-xs text-muted-foreground truncate">· {m.title}</li>
                                ))}
                              </ul>
                            )}
                            {chapter.modules.length > 0 && (
                              <button onClick={() => setViewModulesFor({ course, chapter })}
                                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                {remaining > 0 ? <>See all {chapter.modules.length} <ChevronRight className="w-3 h-3" /></> : "Manage modules"}
                              </button>
                            )}

                            {/* Stats & actions */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <BookOpen className="w-3.5 h-3.5" />{chapter.modules.length} modules
                              </span>
                              {isAdmin && (
                                <button onClick={() => setAddModuleFor({ course, chapter })}
                                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                  <Plus className="w-3 h-3" />Add Module
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddCourse && <AddCourseModal onClose={() => setShowAddCourse(false)} onAdd={addCourse} />}
      {showImportCourse && <ImportCurriculumModal onClose={() => setShowImportCourse(false)} onAdd={addCourse} onImportChapters={importChapters} />}
      {showBootstrapCourse && <BootstrapCurriculumModal onClose={() => setShowBootstrapCourse(false)} onAdd={addCourse} />}
      {importChaptersFor && (
        <ImportCurriculumModal course={importChaptersFor} onClose={() => setImportChaptersFor(null)} onAdd={addCourse} onImportChapters={importChapters} />
      )}
      {addChapterFor && (
        <AddChapterModal course={addChapterFor} onClose={() => setAddChapterFor(null)}
          onAdd={(title, difficulty) => addChapter(addChapterFor.id, title, difficulty)} />
      )}
      {addModuleFor && (
        <AddModuleModal chapter={addModuleFor.chapter} onClose={() => setAddModuleFor(null)}
          onAdd={(title) => addModule(addModuleFor.course.id, addModuleFor.chapter.id, title)} />
      )}
      {liveViewModulesFor && (
        <ChapterModulesModal course={liveViewModulesFor.course.name} chapter={liveViewModulesFor.chapter}
          isAdmin={isAdmin}
          onClose={() => setViewModulesFor(null)}
          onAddModule={(title) => addModule(liveViewModulesFor.course.id, liveViewModulesFor.chapter.id, title)}
          onEditModule={(moduleIndex) => setEditModuleFor({ course: liveViewModulesFor.course, chapter: liveViewModulesFor.chapter, moduleIndex })}
          onEditTest={() => setEditTestFor({ course: liveViewModulesFor.course, chapter: liveViewModulesFor.chapter })} />
      )}
      {liveEditModuleFor && liveEditModuleFor.chapter.modules[liveEditModuleFor.moduleIndex] && (
        <EditModuleModal
          course={liveEditModuleFor.course.name}
          chapter={liveEditModuleFor.chapter}
          module={liveEditModuleFor.chapter.modules[liveEditModuleFor.moduleIndex]}
          onClose={() => setEditModuleFor(null)}
          onSave={(patch) => updateModule(liveEditModuleFor.course.id, liveEditModuleFor.chapter.id, liveEditModuleFor.moduleIndex, patch)}
        />
      )}
      {liveEditTestFor && (
        <EditChapterTestModal
          course={liveEditTestFor.course.name}
          chapter={liveEditTestFor.chapter}
          onClose={() => setEditTestFor(null)}
          onSave={(test) => updateChapterTest(liveEditTestFor.course.id, liveEditTestFor.chapter.id, test)}
        />
      )}
    </div>
  );
}
