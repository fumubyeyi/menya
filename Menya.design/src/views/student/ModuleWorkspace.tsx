import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, Circle, NotebookPen, Dumbbell, ClipboardCheck } from "lucide-react";
import SubjectTag from "../../components/SubjectTag";
import { findChapterById } from "../../data";
import { getSubjectIcon, subjectColor, diffCls, getModuleContent } from "../../lib/constants";

const statusMeta = {
  completed:    { label: "Completed",   cls: "text-emerald-700 bg-emerald-50" },
  "in-progress":{ label: "In Progress", cls: "text-primary bg-primary/10" },
  "not-started":{ label: "Not Started", cls: "text-muted-foreground bg-muted" },
};

export default function ModuleWorkspace() {
  const { chapterId, moduleIndex } = useParams();
  const found = findChapterById(Number(chapterId));
  const index = Number(moduleIndex);
  const courseModule = found?.chapter.modules[index];

  const notesKey = `menya:notes:${chapterId}:${moduleIndex}`;
  const exercisesKey = `menya:exercises:${chapterId}:${moduleIndex}`;

  const [notes, setNotes] = useState(() => localStorage.getItem(notesKey) ?? "");
  const workspace = courseModule && found ? getModuleContent(courseModule, found.chapter.title, found.course.subject) : null;
  const [exerciseDone, setExerciseDone] = useState<boolean[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(exercisesKey) ?? "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [testSubmitted, setTestSubmitted] = useState(false);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    localStorage.setItem(notesKey, value);
  };

  const toggleExercise = (i: number) => {
    setExerciseDone((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      localStorage.setItem(exercisesKey, JSON.stringify(next));
      return next;
    });
  };

  if (!found || !courseModule || !workspace) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24 space-y-3">
        <p className="text-sm text-muted-foreground">This module couldn't be found.</p>
        <Link to="/student/learning" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Subjects
        </Link>
      </div>
    );
  }

  const { course, chapter } = found;
  const color = subjectColor[course.subject] ?? "#1B5E4F";
  const status = statusMeta[courseModule.status];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link to="/student/learning" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Subjects
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: color }} />
        <div className="p-6">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <SubjectTag subject={course.subject} />
            <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-muted text-muted-foreground">{chapter.title}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${diffCls[chapter.difficulty]}`}>{chapter.difficulty}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${status.cls}`}>{status.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
              <span style={{ color }}>{getSubjectIcon(course.subject)}</span>
            </div>
            <h1 className="text-xl font-display font-semibold text-foreground">{courseModule.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-3">{workspace.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Content</h2>
        {workspace.content.map((p, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">{p}</p>
        ))}
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
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
            {exerciseDone.filter(Boolean).length}/{workspace.exercises.length} done
          </span>
        </div>
        <div className="space-y-1.5">
          {workspace.exercises.map((ex, i) => (
            <button key={i} onClick={() => toggleExercise(i)}
              className="w-full flex items-start gap-2.5 text-left px-3 py-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors">
              {exerciseDone[i]
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                : <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
              <span className={`text-sm ${exerciseDone[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>{ex}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Test */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Test</h2>
        </div>
        {testSubmitted ? (
          <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">Nice work — your tutor will review your test and follow up next session.</p>
          </div>
        ) : (
          <>
            <ol className="space-y-2 list-decimal list-inside">
              {workspace.test.map((q, i) => (
                <li key={i} className="text-sm text-foreground leading-relaxed">{q}</li>
              ))}
            </ol>
            <button onClick={() => setTestSubmitted(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              Submit Test
            </button>
          </>
        )}
      </div>
    </div>
  );
}
