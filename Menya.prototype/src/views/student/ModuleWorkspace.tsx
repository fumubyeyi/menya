import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import confetti from "canvas-confetti";
import {
  ArrowLeft, ArrowRight, CheckCircle2, NotebookPen, RotateCcw, Flame, Trophy,
  PartyPopper, ChevronRight, ChevronLeft, Lock, AlertTriangle, HelpCircle, BookOpen, ListTree,
} from "lucide-react";
import CourseChapters from "../../components/student/CourseChapters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../app/components/ui/sheet";
import { useStudentCurriculum } from "../../hooks/useStudentCurriculum";
import ContentDrawer, { ModuleContentBody } from "../../components/ContentDrawer";
import RequestHelpModal from "../../components/RequestHelpModal";
import PracticeCard, { emptyItem, normalizeItem, type ItemState } from "../../components/student/workspace/PracticeCard";
import ModuleStepper, { type Step, type StepId } from "../../components/student/workspace/ModuleStepper";
import ModuleComplete from "../../components/student/workspace/ModuleComplete";
import { useCurriculum } from "../../context/CurriculumContext";
import { useStudentActivity } from "../../context/StudentActivityContext";
import { useStudentAchievements } from "../../hooks/useStudentAchievements";
import { useModuleTime } from "../../hooks/useModuleTime";
import { getCourseIcon, diffCls, getModuleContent, getChapterTest } from "../../lib/constants";
import { subjectColor, subjectTint } from "../../lib/subject";
import { savedPracticeStatus, progressKeys } from "../../lib/studentProgress";
import { useCurrentStudent } from "../../hooks/useCurrentStudent";

interface PracticeState { exercises: ItemState[] }
interface ChapterTestState { items: ItemState[]; started: boolean; step: number; complete: boolean }

// Reads a sibling module's saved exercise progress straight from localStorage so the
// chapter test can tell whether every module in the chapter is actually done, not
// just the one currently open.
function isModuleExercisesDone(studentId: number, chapterId: string | undefined, moduleIndex: number): boolean {
  return chapterId !== undefined && savedPracticeStatus(studentId, chapterId, moduleIndex) === "completed";
}

// Keyed by the route so moving to the next module starts fresh: all of the
// state below is initialised from that module's own saved progress.
export default function ModuleWorkspace() {
  const { chapterId, moduleIndex } = useParams();
  return <ModuleWorkspaceInner key={`${chapterId}:${moduleIndex}`} />;
}

function ModuleWorkspaceInner() {
  const { chapterId, moduleIndex } = useParams();
  const { findChapterById } = useCurriculum();
  const { logStudy } = useStudentActivity();
  const badges = useStudentAchievements();
  const student = useCurrentStudent();
  const found = findChapterById(Number(chapterId));
  const index = Number(moduleIndex);
  const courseModule = found?.chapter.modules[index];

  // All of this module's saved work is per student (lib/studentProgress.ts).
  const notesKey = progressKeys.notes(student.id, chapterId ?? "", moduleIndex ?? "");
  const practiceKey = progressKeys.practice(student.id, chapterId ?? "", moduleIndex ?? "");
  const chapterTestKey = progressKeys.chapterTest(student.id, chapterId ?? "");
  const seconds = useModuleTime(progressKeys.time(student.id, chapterId ?? "", moduleIndex ?? ""));

  const [notes, setNotes] = useState(() => localStorage.getItem(notesKey) ?? "");
  const workspace = courseModule && found ? getModuleContent(courseModule, found.chapter.title, found.course.name) : null;
  const chapterTest_ = found ? getChapterTest(found.chapter) : { questions: [], isAuthored: false };
  const chapterTestQuestions = chapterTest_.questions;
  const chapterTestAuthored = chapterTest_.isAuthored;
  const isLastModule = !!found && index === found.chapter.modules.length - 1;

  const [mode, setMode] = useState<StepId>("learn");
  const [visitedPractice, setVisitedPractice] = useState(false);
  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  // On phones the course outline and the notes each slide in from the side.
  // "All chapters" on My Courses links here with ?outline=1 so the outline
  // opens straight away there.
  const [searchParams] = useSearchParams();
  // (Wide screens already show it beside the module, so it stays shut there.)
  const [outlineOpen, setOutlineOpen] = useState(
    () => searchParams.get("outline") === "1" && !window.matchMedia("(min-width: 1024px)").matches,
  );
  const [notesOpen, setNotesOpen] = useState(false);
  const studentCurriculum = useStudentCurriculum();

  const [practice, setPractice] = useState<PracticeState>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(practiceKey) ?? "null");
      // Only trust saved state if its item count still matches the current curriculum
      // data — guards against stale localStorage from a since-edited module.
      if (saved && Array.isArray(saved.exercises) && saved.exercises.length === (workspace?.exercises.length ?? 0)) {
        return { exercises: saved.exercises.map(normalizeItem) };
      }
    } catch {
      // fall through to defaults
    }
    return { exercises: (workspace?.exercises ?? []).map(emptyItem) };
  });

  const [chapterTest, setChapterTest] = useState<ChapterTestState>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(chapterTestKey) ?? "null");
      if (saved && Array.isArray(saved.items) && saved.items.length === chapterTestQuestions.length) {
        return { ...saved, items: saved.items.map(normalizeItem) };
      }
    } catch {
      // fall through to defaults
    }
    return { items: chapterTestQuestions.map(emptyItem), started: false, step: 0, complete: false };
  });

  const [combo, setCombo] = useState(0);
  // Open practice on the first question still to do, not always the first.
  const [exerciseStep, setExerciseStep] = useState(() => Math.max(0, practice.exercises.findIndex((it) => !it.mark)));

  const handleNotesChange = (value: string) => {
    setNotes(value);
    localStorage.setItem(notesKey, value);
  };

  const persistPractice = (next: PracticeState) => {
    localStorage.setItem(practiceKey, JSON.stringify(next));
    setPractice(next);
    logStudy();
  };
  const updateItem = (i: number, patch: Partial<ItemState>) =>
    persistPractice({ exercises: practice.exercises.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const markItem = (i: number, mark: "correct" | "practice") => {
    updateItem(i, { mark });
    setCombo((c) => (mark === "correct" ? c + 1 : 0));
  };
  const answerItem = (i: number, attempt: string, correct: boolean) => {
    const wrongAttempts = practice.exercises[i].wrongAttempts + (correct ? 0 : 1);
    updateItem(i, { attempt, revealed: true, mark: correct ? "correct" : "practice", wrongAttempts });
    setCombo((c) => (correct ? c + 1 : 0));
  };
  // Resets the attempt so the student can try again, but deliberately leaves
  // wrongAttempts untouched — that's what makes the hint survive a retry.
  const retryItem = (i: number) => updateItem(i, { attempt: "", revealed: false, mark: null });

  const persistChapterTest = (next: ChapterTestState) => {
    localStorage.setItem(chapterTestKey, JSON.stringify(next));
    setChapterTest(next);
    logStudy();
  };
  const patchChapterTest = (patch: Partial<ChapterTestState>) => persistChapterTest({ ...chapterTest, ...patch });
  const updateChapterTestItem = (i: number, patch: Partial<ItemState>) =>
    persistChapterTest({ ...chapterTest, items: chapterTest.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const markChapterTestItem = (i: number, mark: "correct" | "practice") => {
    updateChapterTestItem(i, { mark });
    setCombo((c) => (mark === "correct" ? c + 1 : 0));
  };
  const answerChapterTestItem = (i: number, attempt: string, correct: boolean) => {
    const wrongAttempts = chapterTest.items[i].wrongAttempts + (correct ? 0 : 1);
    updateChapterTestItem(i, { attempt, revealed: true, mark: correct ? "correct" : "practice", wrongAttempts });
    setCombo((c) => (correct ? c + 1 : 0));
  };
  const retryChapterTestItem = (i: number) => updateChapterTestItem(i, { attempt: "", revealed: false, mark: null });

  const xp = practice.exercises.reduce((sum, it) => sum + (it.mark === "correct" ? 20 : it.mark === "practice" ? 10 : 0), 0);
  const maxXp = practice.exercises.length * 20;
  const markedCount = practice.exercises.filter((it) => it.mark).length;
  const correctCount = practice.exercises.filter((it) => it.mark === "correct").length;
  const masteryPct = markedCount ? Math.round((correctCount / markedCount) * 100) : 0;
  const masteryTier =
    markedCount === 0 ? { label: "Not Started",     cls: "text-muted-foreground bg-muted" } :
    masteryPct < 50    ? { label: "Keep Practicing", cls: "text-amber-800 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/40" } :
    masteryPct < 90    ? { label: "Solid Grasp",     cls: "text-sky-800 bg-sky-50 dark:text-sky-200 dark:bg-sky-950/40" } :
                          { label: "Mastered",        cls: "text-emerald-800 bg-emerald-50 dark:text-emerald-200 dark:bg-emerald-950/40" };

  const allExercisesDone = practice.exercises.length > 0 && markedCount === practice.exercises.length;

  const modulesDoneCount = found ? found.chapter.modules.filter((_, i) => isModuleExercisesDone(student.id, chapterId, i)).length : 0;
  const chapterExercisesComplete = !!found && modulesDoneCount === found.chapter.modules.length;

  const chapterTestPerfect = chapterTest.items.length > 0 && chapterTest.items.every((it) => it.mark === "correct");

  const chapterTestCelebrated = useRef(chapterTest.complete);
  useEffect(() => {
    if (chapterTest.complete && !chapterTestCelebrated.current) {
      confetti({ particleCount: chapterTestPerfect ? 160 : 90, spread: 85, origin: { y: 0.6 }, disableForReducedMotion: true });
    }
    chapterTestCelebrated.current = chapterTest.complete;
  }, [chapterTest.complete, chapterTestPerfect]);

  if (!found || !courseModule || !workspace) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 space-y-3">
        <p className="text-sm text-muted-foreground">This module couldn't be found.</p>
        <Link to="/student/learning" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Courses
        </Link>
      </div>
    );
  }

  const { course, chapter } = found;
  const color = subjectColor(course.name);
  const tint = subjectTint(course.name);

  const chapterTestTotal = chapterTestQuestions.length;
  const currentChapterTestItem = chapterTest.items[chapterTest.step];
  const currentChapterTestQuestion = chapterTestQuestions[chapterTest.step];
  const isLastChapterTestQuestion = chapterTest.step === chapterTestTotal - 1;
  const chapterTestCorrectCount = chapterTest.items.filter((it) => it.mark === "correct").length;

  const exerciseCount = workspace.exercises.length;
  const currentExerciseIndex = Math.min(exerciseStep, Math.max(exerciseCount - 1, 0));
  const currentExercise = workspace.exercises[currentExerciseIndex];
  const currentExerciseItem = practice.exercises[currentExerciseIndex];
  const isFirstExercise = currentExerciseIndex === 0;
  const isLastExercise = currentExerciseIndex === exerciseCount - 1;

  // The module's steps. The chapter test only appears on the chapter's last
  // module, and Finish unlocks once practice (and that test) are done.
  const hasTest = isLastModule && chapterTestAuthored;
  const moduleComplete = allExercisesDone && (!hasTest || chapterTest.complete);
  const steps: Step[] = [
    { id: "learn", label: "Learn", done: visitedPractice || markedCount > 0 },
    { id: "practice", label: "Practice", detail: exerciseCount ? `${markedCount}/${exerciseCount}` : undefined, done: allExercisesDone },
    ...(hasTest ? [{ id: "test" as const, label: "Chapter test", done: chapterTest.complete }] : []),
    { id: "finish", label: "Finish", done: false, locked: !moduleComplete },
  ];
  const goTo = (id: StepId) => {
    if (id !== "learn") setVisitedPractice(true);
    setMode(id);
  };

  // Where "Next module" goes: the next module in this chapter, else the
  // first module of the next chapter, else nowhere (back to My Journey).
  const chapterPos = course.chapters.findIndex((c) => c.id === chapter.id);
  const nextChapter = course.chapters[chapterPos + 1];
  const nextTarget =
    index + 1 < chapter.modules.length
      ? { href: `/student/module/${chapter.id}/${index + 1}`, label: "Next module", title: chapter.modules[index + 1].title }
      : nextChapter && nextChapter.modules.length > 0
      ? { href: `/student/module/${nextChapter.id}/0`, label: "Start next chapter", title: `${nextChapter.title}: ${nextChapter.modules[0].title}` }
      : null;

  const startChapterTest = () => patchChapterTest({ started: true });
  const advanceChapterTest = () => {
    if (isLastChapterTestQuestion) patchChapterTest({ complete: true });
    else patchChapterTest({ step: chapterTest.step + 1 });
  };
  const retakeChapterTest = () => patchChapterTest({
    items: chapterTestQuestions.map(() => emptyItem()),
    started: true,
    step: 0,
    complete: false,
  });

  const outlineBody = (
    <>
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-border">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tint, color }}>
          {getCourseIcon(course.name)}
        </span>
        <p className="flex-1 min-w-0 text-sm font-bold text-foreground truncate">{course.name}</p>
        {/* The current chapter's difficulty */}
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono flex-shrink-0 ${diffCls[chapter.difficulty]}`}>{chapter.difficulty}</span>
      </div>
      <CourseChapters
        course={studentCurriculum.find((c) => c.name === course.name) ?? course}
        here={{ chapterId: chapter.id, index }}
      />
    </>
  );

  const primaryBtn = "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold hover:brightness-110 motion-safe:transition";
  // Main actions use the primary colour, like everywhere else in the app.
  const subjectBtn = { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" };

  return (
    <div className="max-w-screen-xl mx-auto pb-24 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:items-start">
      {/* Course outline: always beside the module on wide screens */}
      <aside className="hidden lg:block lg:sticky lg:top-0 max-h-[calc(100vh-7rem)] overflow-y-auto bg-card border border-border rounded-xl">
        {outlineBody}
      </aside>

      <div className="space-y-5 min-w-0">
      <div className="flex items-center gap-2">
        <Link to="/student/learning" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mr-auto whitespace-nowrap">
          <ArrowLeft className="w-3.5 h-3.5" /> <span><span className="hidden sm:inline">Back to </span>My Courses</span>
        </Link>
        <button
          type="button"
          onClick={() => setOutlineOpen(true)}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted whitespace-nowrap"
        >
          <ListTree className="w-4 h-4" /> Outline
        </button>
        {/* On phones Notes sits here with Outline; wider screens show it by the title */}
        <button
          type="button"
          onClick={() => setNotesOpen(true)}
          className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted whitespace-nowrap"
        >
          <NotebookPen className="w-4 h-4" /> Notes{notes.trim() && <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-label="has notes" />}
        </button>
      </div>

      {/* Module title and description as plain text, then its steps */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-foreground">{courseModule.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{workspace.description}</p>
        </div>
        {/* Notes belong to this module, so they sit beside its title */}
        <button
          type="button"
          onClick={() => setNotesOpen(true)}
          className="mt-1 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted whitespace-nowrap flex-shrink-0"
        >
          <NotebookPen className="w-4 h-4" /> Notes{notes.trim() && <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-label="has notes" />}
        </button>
      </div>
      <div className="flex items-center gap-x-5 gap-y-3 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <ModuleStepper steps={steps} current={mode} onSelect={goTo} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 empty:hidden">
          {markedCount > 0 && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 whitespace-nowrap ${masteryTier.cls}`}>
              <Trophy className="w-3 h-3" />{masteryTier.label}
            </span>
          )}
          {combo > 1 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 whitespace-nowrap text-foreground bg-brand-amber/15">
              <Flame className="w-3 h-3 text-brand-amber" />{combo}x
            </span>
          )}
        </div>
      </div>

      {mode === "finish" && moduleComplete ? (
        <ModuleComplete
          course={course.name}
          moduleTitle={courseModule.title}
          correct={correctCount}
          total={exerciseCount}
          xp={xp}
          seconds={seconds}
          nextBadge={badges.next}
          next={nextTarget}
          onReview={() => goTo("practice")}
        />
      ) : (
        <div>
          <div className="space-y-5 min-w-0">
            {mode === "learn" && (
              <>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="sr-only">Learn</h2>
                  <ModuleContentBody workspace={workspace} />
                </div>
                {exerciseCount > 0 && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => goTo("practice")} className={primaryBtn} style={subjectBtn}>
                      Start practising <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {mode === "practice" && (
              <>
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  {/* The step line above names the step; screen readers still get the heading */}
                  <h2 className="sr-only">Practice</h2>
                  <div className="flex items-center justify-between gap-3">
                    {exerciseCount > 0 && (
                      <p className="text-xs font-mono text-muted-foreground">Question {currentExerciseIndex + 1} of {exerciseCount}</p>
                    )}
                    <button type="button" onClick={() => setContentDrawerOpen(true)}
                      className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                      <BookOpen className="w-3.5 h-3.5" /> Review the lesson
                    </button>
                  </div>
                  {exerciseCount === 0 ? (
                    <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-muted/40 border border-border">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">Exercises haven't been added for this module yet.</p>
                    </div>
                  ) : (
                    <>
                      {/* One dot per question; click to jump */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {workspace.exercises.map((_, i) => {
                          const it = practice.exercises[i];
                          const isCur = i === currentExerciseIndex;
                          const bg = isCur ? "var(--primary)"
                            : it?.mark === "correct" ? "#10B981"
                            : it?.mark === "practice" ? "var(--brand-amber)"
                            : "var(--border)";
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setExerciseStep(i)}
                              aria-label={`Question ${i + 1}${it?.mark === "correct" ? ", right" : it?.mark === "practice" ? ", to practise" : ""}`}
                              aria-current={isCur ? "step" : undefined}
                              className={`h-2 rounded-full transition-all ${isCur ? "w-7" : "w-3.5 hover:opacity-70"}`}
                              style={{ backgroundColor: bg }}
                            />
                          );
                        })}
                      </div>
                      <PracticeCard
                        key={currentExerciseIndex}
                        question={currentExercise}
                        item={currentExerciseItem}
                        seed={currentExerciseIndex}
                        combo={combo}
                        onAttemptChange={(v) => updateItem(currentExerciseIndex, { attempt: v })}
                        onReveal={() => updateItem(currentExerciseIndex, { revealed: true })}
                        onMark={(m) => markItem(currentExerciseIndex, m)}
                        onAnswer={(attempt, correct) => answerItem(currentExerciseIndex, attempt, correct)}
                        onRetry={() => retryItem(currentExerciseIndex)}
                      />
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button type="button" onClick={() => setExerciseStep((s) => Math.max(0, s - 1))} disabled={isFirstExercise}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        {allExercisesDone ? (
                          <button type="button" onClick={() => goTo(hasTest && !chapterTest.complete ? "test" : "finish")} className={primaryBtn} style={subjectBtn}>
                            {hasTest && !chapterTest.complete ? "Take the chapter test" : "Finish module"} <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : !isLastExercise ? (
                          <button type="button" onClick={() => setExerciseStep((s) => Math.min(exerciseCount - 1, s + 1))}
                            className={currentExerciseItem?.mark ? primaryBtn : "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-foreground hover:bg-muted transition-colors"}
                            style={currentExerciseItem?.mark ? subjectBtn : undefined}>
                            {currentExerciseItem?.mark ? "Next question" : "Skip for now"} <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button type="button" onClick={() => setExerciseStep(Math.max(0, practice.exercises.findIndex((it) => !it.mark)))}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                            Go to unanswered <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {mode === "test" && hasTest && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="sr-only">Chapter test</h2>
                {chapterTest.started && !chapterTest.complete && (
                  <p className="text-xs font-mono text-muted-foreground text-right">Question {chapterTest.step + 1} of {chapterTestTotal}</p>
                )}

                {!chapterExercisesComplete ? (
                  <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-muted/40 border border-border">
                    <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Finish the practice in every module of {chapter.title} to unlock this test. {modulesDoneCount}/{found.chapter.modules.length} modules done.
                    </p>
                  </div>
                ) : !chapterTest.started ? (
                  <div className="flex flex-col items-start gap-3">
                    <p className="text-sm text-muted-foreground">One test covering all of {chapter.title}: {chapterTestTotal} questions, one at a time.</p>
                    <button onClick={startChapterTest} className={primaryBtn} style={subjectBtn}>
                      Start chapter test <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : !chapterTest.complete ? (
                  <>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {chapterTestQuestions.map((_, i) => {
                        const it = chapterTest.items[i];
                        const bg = i === chapterTest.step ? "var(--primary)"
                          : it?.mark === "correct" ? "#10B981"
                          : it?.mark === "practice" ? "var(--brand-amber)"
                          : "var(--border)";
                        return <div key={i} className={`h-2 rounded-full transition-all ${i === chapterTest.step ? "w-7" : "w-3.5"}`} style={{ backgroundColor: bg }} />;
                      })}
                    </div>
                    <PracticeCard
                      key={`test-${chapterTest.step}`}
                      question={currentChapterTestQuestion}
                      item={currentChapterTestItem}
                      seed={chapterTest.step}
                      combo={combo}
                      onAttemptChange={(v) => updateChapterTestItem(chapterTest.step, { attempt: v })}
                      onReveal={() => updateChapterTestItem(chapterTest.step, { revealed: true })}
                      onMark={(m) => markChapterTestItem(chapterTest.step, m)}
                      onAnswer={(attempt, correct) => answerChapterTestItem(chapterTest.step, attempt, correct)}
                      onRetry={() => retryChapterTestItem(chapterTest.step)}
                    />
                    {currentChapterTestItem.mark && (
                      <div className="flex justify-end">
                        <button onClick={advanceChapterTest} className={primaryBtn} style={subjectBtn}>
                          {isLastChapterTestQuestion ? "Finish test" : "Next question"} <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100">
                      <PartyPopper className="w-4 h-4 flex-shrink-0" />
                      <p className="text-sm font-medium">
                        Chapter test done: {chapterTestCorrectCount}/{chapterTestTotal} right{chapterTestPerfect ? ". Perfect score!" : ""}
                      </p>
                    </div>
                    <div className="space-y-2.5">
                      {chapterTestQuestions.map((q, i) => (
                        <div key={i} className="rounded-lg border border-border px-3 py-2.5">
                          <p className="text-sm text-foreground">{q.prompt}</p>
                          <p className="text-xs text-muted-foreground mt-1">{q.answer}</p>
                          <span className={`inline-flex items-center gap-1 mt-1.5 text-[11px] font-mono px-1.5 py-0.5 rounded-full ${chapterTest.items[i].mark === "correct" ? "text-emerald-800 bg-emerald-50 dark:text-emerald-200 dark:bg-emerald-950/40" : "text-amber-800 bg-amber-50 dark:text-amber-200 dark:bg-amber-950/40"}`}>
                            {chapterTest.items[i].mark === "correct" ? <CheckCircle2 className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                            {chapterTest.items[i].mark === "correct" ? "Right" : "Worth practising"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <button onClick={retakeChapterTest} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> Retake test
                      </button>
                      {moduleComplete && (
                        <button onClick={() => goTo("finish")} className={primaryBtn} style={subjectBtn}>
                          Finish module <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      </div>

      <Sheet open={outlineOpen} onOpenChange={setOutlineOpen}>
        <SheetContent side="left" className="overflow-y-auto p-0 gap-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Course outline</SheetTitle>
            <SheetDescription>Every chapter and module in {course.name}</SheetDescription>
          </SheetHeader>
          {outlineBody}
        </SheetContent>
      </Sheet>

      {/* Notes: kept for every step of the module, one tap away */}
      <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Notes</SheetTitle>
            <SheetDescription>{courseModule.title} · saved on this device</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={14}
              autoFocus
              placeholder="Jot down anything you want to remember about this module…"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* "I'm stuck": always one tap away, floating bottom-right, so asking
          for help feels normal rather than like a last resort. */}
      {mode !== "finish" && (
        <button
          type="button"
          onClick={() => setHelpModalOpen(true)}
          className="fixed bottom-5 right-5 z-30 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:bg-primary/90 motion-safe:transition motion-safe:hover:-translate-y-0.5"
        >
          <HelpCircle className="w-5 h-5" /> I'm stuck
        </button>
      )}

      <ContentDrawer open={contentDrawerOpen} onOpenChange={setContentDrawerOpen} workspace={workspace} moduleTitle={courseModule.title} />

      {helpModalOpen && (
        <RequestHelpModal
          onClose={() => setHelpModalOpen(false)}
          studentId={student.id}
          studentName={student.name}
          course={course.name}
          chapterId={chapter.id}
          chapterTitle={chapter.title}
          moduleIndex={index}
          moduleTitle={courseModule.title}
        />
      )}
    </div>
  );
}
