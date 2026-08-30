import { useEffect, useMemo, useState } from "react";
import { PlusCircle, Plus, BookOpen, ChevronRight, AlertTriangle, Upload, Wand2, Search } from "lucide-react";
import AddCourseModal from "../../components/AddCourseModal";
import ImportCurriculumModal from "../../components/ImportCurriculumModal";
import BootstrapCurriculumModal from "../../components/BootstrapCurriculumModal";
import AddChapterModal from "../../components/AddChapterModal";
import AddModuleModal from "../../components/AddModuleModal";
import ChapterModulesModal from "../../components/ChapterModulesModal";
import EditModuleModal from "../../components/EditModuleModal";
import EditChapterTestModal from "../../components/EditChapterTestModal";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "../../app/components/ui/carousel";
import { useCurriculum } from "../../context/CurriculumContext";
import { useAuth } from "../../context/AuthContext";
import { diffCls, chapterContentGaps, courseContentGaps } from "../../lib/constants";
import type { CurriculumCourse, CurriculumChapter } from "../../types";
import { PageHeaderSubtitle, PageHeaderActions } from "../../context/PageHeaderContext";

const VISIBLE_MODULES = 5;

const CONTENT_OPTIONS = [
  { value: "all",      label: "All content"    },
  { value: "gaps",     label: "Needs content"  },
  { value: "complete", label: "Fully authored" },
];

const ARROW_RESET = "!static !translate-x-0 !translate-y-0 !top-auto !bottom-auto !left-auto !right-auto";

export default function Curriculum() {
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const { courses, addCourse, importChapters, addChapter, addModule, updateModule, updateChapterTest } = useCurriculum();
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [contentFilter, setContentFilter] = useState("all");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showImportCourse, setShowImportCourse] = useState(false);
  const [showBootstrapCourse, setShowBootstrapCourse] = useState(false);
  const [importChaptersFor, setImportChaptersFor] = useState<CurriculumCourse | null>(null);
  const [addChapterFor, setAddChapterFor] = useState<CurriculumCourse | null>(null);
  const [addModuleFor, setAddModuleFor] = useState<{ course: CurriculumCourse; chapter: CurriculumChapter } | null>(null);
  const [viewModulesFor, setViewModulesFor] = useState<{ course: CurriculumCourse; chapter: CurriculumChapter } | null>(null);
  const [editModuleFor, setEditModuleFor] = useState<{ course: CurriculumCourse; chapter: CurriculumChapter; moduleIndex: number } | null>(null);
  const [editTestFor, setEditTestFor] = useState<{ course: CurriculumCourse; chapter: CurriculumChapter } | null>(null);

  const totalChapters = courses.reduce((sum, c) => sum + c.chapters.length, 0);
  const totalModules = courses.reduce((sum, c) => sum + c.chapters.reduce((s, ch) => s + ch.modules.length, 0), 0);
  const totalContentGaps = courses.reduce((sum, c) => sum + courseContentGaps(c), 0);

  const gradeOptions = useMemo(
    () => Array.from(new Set(courses.map((c) => c.grade))).sort(),
    [courses]
  );

  // Search spans course names, chapter titles, and module titles — a course
  // stays in the carousel if the query hits anywhere inside it.
  const q = query.trim().toLowerCase();
  const courseMatchesQuery = (course: CurriculumCourse) => {
    if (!q) return true;
    if (course.name.toLowerCase().includes(q)) return true;
    return course.chapters.some(
      (ch) => ch.title.toLowerCase().includes(q) || ch.modules.some((m) => m.title.toLowerCase().includes(q))
    );
  };

  const filteredCourses = courses.filter((course) => {
    if (gradeFilter !== "all" && course.grade !== gradeFilter) return false;
    const gaps = courseContentGaps(course);
    if (contentFilter === "gaps" && gaps === 0) return false;
    if (contentFilter === "complete" && gaps > 0) return false;
    return courseMatchesQuery(course);
  });

  const filtersActive = q !== "" || gradeFilter !== "all" || contentFilter !== "all";
  // Remount the carousel whenever the visible set changes so embla re-inits cleanly.
  const carouselKey = filteredCourses.map((c) => c.id).join(",");

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

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
      <PageHeaderSubtitle>
        {totalChapters} chapters · {totalModules} modules across {courses.length} math courses
        {totalContentGaps > 0 && ` · ${totalContentGaps} modules need content`}
      </PageHeaderSubtitle>
      {isAdmin && (
        <PageHeaderActions>
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
        </PageHeaderActions>
      )}

      {/* Search & filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, chapters, modules…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">All grades</option>
          {gradeOptions.map((g) => <option key={g} value={g}>Grade {g}</option>)}
        </select>
        <select
          value={contentFilter}
          onChange={(e) => setContentFilter(e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {CONTENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Course carousel */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <BookOpen className="w-8 h-8 opacity-40" />
          <p className="text-sm">No courses yet.</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Search className="w-8 h-8 opacity-40" />
          <p className="text-sm">No courses match your search or filters.</p>
        </div>
      ) : (
        <Carousel key={carouselKey} setApi={setApi} opts={{ align: "start" }} className="space-y-3">
          {/* Carousel nav */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-muted-foreground">
              {filtersActive && `${filteredCourses.length} of ${courses.length} courses · `}
              Course {Math.min(current, filteredCourses.length - 1) + 1} / {filteredCourses.length}
            </p>
            <div className="flex items-center gap-1.5">
              <CarouselPrevious className={`${ARROW_RESET} size-8`} />
              <CarouselNext className={`${ARROW_RESET} size-8`} />
            </div>
          </div>

          <CarouselContent>
            {filteredCourses.map((course) => {
              const courseGaps = courseContentGaps(course);
              const moduleCount = course.chapters.reduce((s, ch) => s + ch.modules.length, 0);
              return (
                <CarouselItem key={course.id} className="basis-full">
                  <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                    {/* Course header */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-base font-semibold text-foreground truncate">{course.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-muted text-muted-foreground flex-shrink-0">Grade {course.grade}</span>
                        <span className="hidden sm:inline text-xs text-muted-foreground flex-shrink-0">
                          {course.chapters.length} chapters · {moduleCount} modules
                        </span>
                        {courseGaps > 0 && (
                          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-mono text-amber-700 bg-amber-50 flex-shrink-0">
                            <AlertTriangle className="w-3 h-3" />{courseGaps} incomplete
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => setImportChaptersFor(course)} className="flex items-center gap-1.5 border border-border text-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Import Curriculum</span>
                          </button>
                          <button onClick={() => setAddChapterFor(course)} className="flex items-center gap-1.5 border border-border text-foreground text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Add Chapter</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Chapters */}
                    {course.chapters.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-6 px-4 border border-dashed border-border rounded-xl text-center">
                        No chapters yet — add the first one.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {course.chapters.map((chapter) => {
                          const visibleModules = chapter.modules.slice(0, VISIBLE_MODULES);
                          const remaining = chapter.modules.length - visibleModules.length;
                          const gaps = chapterContentGaps(chapter);
                          return (
                            <div key={chapter.id} className="bg-background border border-border rounded-xl h-full hover:shadow-sm hover:border-primary/30 transition-all">
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
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
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
