import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import confetti from "canvas-confetti";
import {
  ArrowLeft, CheckCircle2, NotebookPen, Dumbbell, ClipboardCheck,
  Lightbulb, RotateCcw, Flame, Trophy, Sparkles, PartyPopper, ChevronRight, Lock,
} from "lucide-react";
import CourseTag from "../../components/CourseTag";
import Diagram from "../../components/diagrams";
import { findChapterById } from "../../data";
import { getCourseIcon, courseColor, diffCls, getModuleContent, getChapterTest } from "../../lib/constants";

const statusMeta = {
  completed:    { label: "Completed",   cls: "text-emerald-700 bg-emerald-50" },
  "in-progress":{ label: "In Progress", cls: "text-primary bg-primary/10" },
  "not-started":{ label: "Not Started", cls: "text-muted-foreground bg-muted" },
};

type Mark = "correct" | "practice" | null;
interface ItemState { attempt: string; revealed: boolean; mark: Mark }
interface PracticeState { exercises: ItemState[] }
interface ChapterTestState { items: ItemState[]; started: boolean; step: number; complete: boolean }

const emptyItem = (): ItemState => ({ attempt: "", revealed: false, mark: null });

// Reads a sibling module's saved exercise progress straight from localStorage so the
// chapter test can tell whether every module in the chapter is actually done, not
// just the one currently open.
function isModuleExercisesDone(chapterId: string | undefined, moduleIndex: number): boolean {
  try {
    const saved = JSON.parse(localStorage.getItem(`menya:practice:${chapterId}:${moduleIndex}`) ?? "null");
    return !!saved && Array.isArray(saved.exercises) && saved.exercises.length > 0 && saved.exercises.every((it: ItemState) => it.mark);
  } catch {
    return false;
  }
}

// One question, attempt box, and self-check reveal — shared by both the exercise
// list and the chapter test stepper so they behave identically.
function PracticeCard({ prompt, answer, item, onAttemptChange, onReveal, onMark, onRetry }: {
  prompt: string;
  answer: string;
  item: ItemState;
  onAttemptChange: (value: string) => void;
  onReveal: () => void;
  onMark: (mark: "correct" | "practice") => void;
  onRetry: () => void;
}) {
  return (
    <div className={`rounded-lg border px-4 py-3.5 space-y-3 transition-colors ${
      item.mark === "correct" ? "border-emerald-200 bg-emerald-50/40" :
      item.mark === "practice" ? "border-amber-200 bg-amber-50/40" :
      "border-border"
    }`}>
      <p className="text-sm text-foreground leading-relaxed">{prompt}</p>

      {!item.revealed ? (
        <>
          <textarea
            value={item.attempt}
            onChange={(e) => onAttemptChange(e.target.value)}
            placeholder="Type your answer or show your work…"
            rows={2}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
          />
          <button type="button" onClick={onReveal} disabled={!item.attempt.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <Lightbulb className="w-3.5 h-3.5" /> Check My Answer
          </button>
        </>
      ) : (
        <>
          <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Model Answer</p>
            <p className="text-sm text-foreground leading-relaxed">{answer}</p>
          </div>
          {item.mark === null ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground mr-1">Did you get it right?</span>
              <button type="button" onClick={() => onMark("correct")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" /> Got it
              </button>
              <button type="button" onClick={() => onMark("practice")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Need Practice
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${item.mark === "correct" ? "text-emerald-700" : "text-amber-700"}`}>
                {item.mark === "correct"
                  ? <><CheckCircle2 className="w-4 h-4" /> Marked correct · +20 XP</>
                  : <><RotateCcw className="w-4 h-4" /> Marked for practice · +10 XP</>}
              </span>
              <button type="button" onClick={onRetry} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Try again</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ModuleWorkspace() {
  const { chapterId, moduleIndex } = useParams();
  const found = findChapterById(Number(chapterId));
  const index = Number(moduleIndex);
  const courseModule = found?.chapter.modules[index];

  const notesKey = `menya:notes:${chapterId}:${moduleIndex}`;
  const practiceKey = `menya:practice:${chapterId}:${moduleIndex}`;
  const chapterTestKey = `menya:chapterTest:${chapterId}`;

  const [notes, setNotes] = useState(() => localStorage.getItem(notesKey) ?? "");
  const workspace = courseModule && found ? getModuleContent(courseModule, found.chapter.title, found.course.name) : null;
  const chapterTestQuestions = found ? getChapterTest(found.chapter) : [];
  const isLastModule = !!found && index === found.chapter.modules.length - 1;

  const [practice, setPractice] = useState<PracticeState>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(practiceKey) ?? "null");
      // Only trust saved state if its item count still matches the current curriculum
      // data — guards against stale localStorage from a since-edited module.
      if (saved && Array.isArray(saved.exercises) && saved.exercises.length === (workspace?.exercises.length ?? 0)) return saved;
    } catch {
      // fall through to defaults
    }
    return { exercises: (workspace?.exercises ?? []).map(emptyItem) };
  });

  const [chapterTest, setChapterTest] = useState<ChapterTestState>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(chapterTestKey) ?? "null");
      if (saved && Array.isArray(saved.items) && saved.items.length === chapterTestQuestions.length) return saved;
    } catch {
      // fall through to defaults
    }
    return { items: chapterTestQuestions.map(emptyItem), started: false, step: 0, complete: false };
  });

  const [combo, setCombo] = useState(0);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    localStorage.setItem(notesKey, value);
  };

  const persistPractice = (next: PracticeState) => {
    localStorage.setItem(practiceKey, JSON.stringify(next));
    setPractice(next);
  };
  const updateItem = (i: number, patch: Partial<ItemState>) =>
    persistPractice({ exercises: practice.exercises.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const markItem = (i: number, mark: "correct" | "practice") => {
    updateItem(i, { mark });
    setCombo((c) => (mark === "correct" ? c + 1 : 0));
  };
  const retryItem = (i: number) => updateItem(i, emptyItem());

  const persistChapterTest = (next: ChapterTestState) => {
    localStorage.setItem(chapterTestKey, JSON.stringify(next));
    setChapterTest(next);
  };
  const patchChapterTest = (patch: Partial<ChapterTestState>) => persistChapterTest({ ...chapterTest, ...patch });
  const updateChapterTestItem = (i: number, patch: Partial<ItemState>) =>
    persistChapterTest({ ...chapterTest, items: chapterTest.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const markChapterTestItem = (i: number, mark: "correct" | "practice") => {
    updateChapterTestItem(i, { mark });
    setCombo((c) => (mark === "correct" ? c + 1 : 0));
  };
  const retryChapterTestItem = (i: number) => updateChapterTestItem(i, emptyItem());

  const xp = practice.exercises.reduce((sum, it) => sum + (it.mark === "correct" ? 20 : it.mark === "practice" ? 10 : 0), 0);
  const maxXp = practice.exercises.length * 20;
  const markedCount = practice.exercises.filter((it) => it.mark).length;
  const correctCount = practice.exercises.filter((it) => it.mark === "correct").length;
  const masteryPct = markedCount ? Math.round((correctCount / markedCount) * 100) : 0;
  const masteryTier =
    markedCount === 0 ? { label: "Not Started",    cls: "text-muted-foreground bg-muted" } :
    masteryPct < 50    ? { label: "Keep Practicing", cls: "text-amber-700 bg-amber-50"     } :
    masteryPct < 90    ? { label: "Solid Grasp",     cls: "text-blue-700 bg-blue-50"        } :
                          { label: "Mastered",        cls: "text-emerald-700 bg-emerald-50"  };

  const exercisesDone = practice.exercises.filter((it) => it.mark).length;
  const allExercisesDone = practice.exercises.length > 0 && exercisesDone === practice.exercises.length;

  const modulesDoneCount = found ? found.chapter.modules.filter((_, i) => isModuleExercisesDone(chapterId, i)).length : 0;
  const chapterExercisesComplete = !!found && modulesDoneCount === found.chapter.modules.length;

  const chapterTestPerfect = chapterTest.items.length > 0 && chapterTest.items.every((it) => it.mark === "correct");

  const exerciseCelebrated = useRef(allExercisesDone);
  useEffect(() => {
    if (allExercisesDone && !exerciseCelebrated.current) {
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.7 } });
    }
    exerciseCelebrated.current = allExercisesDone;
  }, [allExercisesDone]);

  const chapterTestCelebrated = useRef(chapterTest.complete);
  useEffect(() => {
    if (chapterTest.complete && !chapterTestCelebrated.current) {
      confetti({ particleCount: chapterTestPerfect ? 160 : 90, spread: 85, origin: { y: 0.6 } });
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
  const color = courseColor[course.name] ?? "#1B5E4F";
  const status = statusMeta[courseModule.status];

  const chapterTestTotal = chapterTestQuestions.length;
  const currentChapterTestItem = chapterTest.items[chapterTest.step];
  const currentChapterTestQuestion = chapterTestQuestions[chapterTest.step];
  const isLastChapterTestQuestion = chapterTest.step === chapterTestTotal - 1;
  const chapterTestCorrectCount = chapterTest.items.filter((it) => it.mark === "correct").length;

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

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link to="/student/learning" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Courses
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: color }} />
        <div className="p-6">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <CourseTag course={course.name} />
            <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-muted text-muted-foreground">{chapter.title}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${diffCls[chapter.difficulty]}`}>{chapter.difficulty}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${status.cls}`}>{status.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
              <span style={{ color }}>{getCourseIcon(course.name)}</span>
            </div>
            <h1 className="text-xl font-display font-semibold text-foreground">{courseModule.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-3">{workspace.description}</p>
        </div>
      </div>

      {/* Gamified progress strip */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Module XP</span>
              <span className="text-xs font-mono font-semibold text-foreground">{xp}/{maxXp}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${maxXp ? Math.min(100, (xp / maxXp) * 100) : 0}%` }} />
            </div>
          </div>
        </div>
        <span className={`text-[11px] px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5 ${masteryTier.cls}`}>
          <Trophy className="w-3 h-3" />{masteryTier.label}
        </span>
        {combo > 1 && (
          <span className="text-[11px] px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5 text-orange-700 bg-orange-50">
            <Flame className="w-3 h-3" />{combo}x Combo
          </span>
        )}
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Content</h2>
        {workspace.content.map((p, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">{p}</p>
        ))}
        {workspace.diagram && <Diagram spec={workspace.diagram} />}
      </div>

      {/* Notes */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <NotebookPen className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Notes</h2>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">Saved on this device</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          rows={5}
          placeholder="Jot down anything you want to remember about this module…"
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
        />
      </div>

      {/* Exercises */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Exercises</h2>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">{exercisesDone}/{workspace.exercises.length} done</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${workspace.exercises.length ? (exercisesDone / workspace.exercises.length) * 100 : 0}%` }} />
        </div>
        <div className="space-y-2.5">
          {workspace.exercises.map((ex, i) => (
            <PracticeCard
              key={i}
              prompt={ex.prompt}
              answer={ex.answer}
              item={practice.exercises[i]}
              onAttemptChange={(v) => updateItem(i, { attempt: v })}
              onReveal={() => updateItem(i, { revealed: true })}
              onMark={(m) => markItem(i, m)}
              onRetry={() => retryItem(i)}
            />
          ))}
        </div>
        {allExercisesDone && (
          <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <PartyPopper className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">
              {isLastModule ? "All exercises done — nice work!" : "All exercises done — on to the next module."}
            </p>
          </div>
        )}
      </div>

      {/* Chapter Test — only surfaces on the last module of the chapter */}
      {isLastModule && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Chapter Test</h2>
            {chapterTest.started && !chapterTest.complete && (
              <span className="text-[10px] font-mono text-muted-foreground ml-auto">Question {chapterTest.step + 1} of {chapterTestTotal}</span>
            )}
          </div>

          {!chapterExercisesComplete ? (
            <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-muted/40 border border-border">
              <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Complete the exercises in every module of {chapter.title} to unlock this test — {modulesDoneCount}/{found.chapter.modules.length} modules done.
              </p>
            </div>
          ) : !chapterTest.started ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">One test covering all of {chapter.title} — {chapterTestTotal} questions, one at a time. Work through each, check it against the model answer, then mark yourself honestly.</p>
              <button onClick={startChapterTest}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                <ChevronRight className="w-4 h-4" /> Start Chapter Test
              </button>
            </div>
          ) : !chapterTest.complete ? (
            <>
              <div className="flex items-center gap-1.5 flex-wrap">
                {chapterTestQuestions.map((_, i) => {
                  const it = chapterTest.items[i];
                  const done = it?.mark === "correct" ? "bg-emerald-500" : it?.mark === "practice" ? "bg-amber-400" : "bg-border";
                  return <div key={i} className={`h-1.5 rounded-full transition-all ${i === chapterTest.step ? "w-6" : "w-3"} ${i === chapterTest.step ? "bg-primary" : done}`} />;
                })}
              </div>
              <PracticeCard
                prompt={currentChapterTestQuestion.prompt}
                answer={currentChapterTestQuestion.answer}
                item={currentChapterTestItem}
                onAttemptChange={(v) => updateChapterTestItem(chapterTest.step, { attempt: v })}
                onReveal={() => updateChapterTestItem(chapterTest.step, { revealed: true })}
                onMark={(m) => markChapterTestItem(chapterTest.step, m)}
                onRetry={() => retryChapterTestItem(chapterTest.step)}
              />
              {currentChapterTestItem.mark && (
                <button onClick={advanceChapterTest}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {isLastChapterTestQuestion ? "Finish Test" : "Next Question"} <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <PartyPopper className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-emerald-700 font-medium">
                    Chapter test complete — you self-marked {chapterTestCorrectCount}/{chapterTestTotal} correct{chapterTestPerfect ? " · perfect score!" : ""}
                  </p>
                  <p className="text-xs text-emerald-700/80 mt-0.5">Your tutor will still review your reasoning and follow up next session.</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {chapterTestQuestions.map((q, i) => (
                  <div key={i} className="rounded-lg border border-border px-3 py-2.5">
                    <p className="text-sm text-foreground">{q.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-1">{q.answer}</p>
                    <span className={`inline-flex items-center gap-1 mt-1.5 text-[11px] font-mono px-1.5 py-0.5 rounded-full ${chapterTest.items[i].mark === "correct" ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}>
                      {chapterTest.items[i].mark === "correct" ? <CheckCircle2 className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                      {chapterTest.items[i].mark === "correct" ? "Correct" : "Needs practice"}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={retakeChapterTest} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Retake Test
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
