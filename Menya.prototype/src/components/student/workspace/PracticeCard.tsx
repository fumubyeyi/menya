import { useState } from "react";
import { CheckCircle2, Lightbulb, RotateCcw, Flame, Eye } from "lucide-react";
import Diagram from "../../diagrams";
import { isNumericAnswerCorrect } from "../../../lib/constants";
import type { PracticeItem } from "../../../types";

// One question and its feedback, shared by the exercise stepper and the
// chapter test so both behave the same. True/false, multiple-choice and
// numeric questions grade themselves; free-response is self-marked against
// the model answer.
//
// Feedback is meant to feel warm rather than graded:
// - Right: the card does a small bounce, with praise and the current run
//   ("That's 3 in a row!").
// - Wrong: a gentle shake and an encouraging nudge, with Try again / Show a
//   hint / Show answer. The correct answer stays hidden until the student
//   asks for it, so they get another go first. No red crosses.
// With reduced motion the bounce and shake are off; the messages still show.

export type Mark = "correct" | "practice" | null;
// wrongAttempts survives a retry (only attempt/revealed/mark reset); it's
// what brings the hint in automatically after a couple of misses.
export interface ItemState { attempt: string; revealed: boolean; mark: Mark; wrongAttempts: number }

export const emptyItem = (): ItemState => ({ attempt: "", revealed: false, mark: null, wrongAttempts: 0 });
// Pre-upgrade localStorage entries won't have wrongAttempts — coalesce so
// counting resumes at 0 instead of accumulating from `undefined`.
export const normalizeItem = (it: ItemState): ItemState => ({ ...it, wrongAttempts: it.wrongAttempts ?? 0 });

const PRAISE = ["Nice work!", "You got it!", "Spot on!", "Great thinking!", "Nailed it!"];
const NUDGES = [
  "Mistakes are how your brain grows.",
  "So close. Give it another go.",
  "Every try teaches you something.",
  "Tricky one! A hint might help.",
];

// Soft, theme-aware feedback colours (the old ones were light-mode only).
const GOOD = "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100";
const WARM = "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100";
const HINT = "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100";

const smallBtn = "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors";

interface Props {
  question: PracticeItem;
  item: ItemState;
  // Position in the set, so praise and nudges vary from question to question.
  seed: number;
  combo: number;
  onAttemptChange: (value: string) => void;
  onReveal: () => void;
  onMark: (mark: "correct" | "practice") => void;
  onAnswer: (attempt: string, correct: boolean) => void;
  onRetry: () => void;
}

// Parent renders this with a `key` per question, so the local hint/answer
// toggles reset when the student moves on.
export default function PracticeCard({ question, item, seed, combo, onAttemptChange, onReveal, onMark, onAnswer, onRetry }: Props) {
  const type = question.type ?? "free-response";
  const autoGraded = type !== "free-response";
  const selectedIndex = item.attempt ? Number(item.attempt) : null;
  const [hintAsked, setHintAsked] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);

  const missed = autoGraded && item.mark === "practice";
  // The right answer shows once they get it, or once they ask to see it.
  const showSolution = item.mark === "correct" || answerShown || (!autoGraded && item.revealed);

  // Hint: on request, or automatically after two misses (auto-graded) or a
  // "Need practice" self-mark (free-response). Kept through a retry.
  const hintVisible = !!question.hint && (
    hintAsked || (autoGraded ? item.wrongAttempts >= 2 : item.mark === "practice")
  );

  const retry = () => { setAnswerShown(false); onRetry(); };

  const hintBox = hintVisible ? (
    <div className={`rounded-lg border px-3 py-2.5 flex items-start gap-2 ${HINT}`}>
      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed"><span className="font-semibold">Hint: </span>{question.hint}</p>
    </div>
  ) : null;

  const explanationBox = showSolution && question.answer.trim() ? (
    <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
        {type === "free-response" ? "Model Answer" : "Explanation"}
      </p>
      <p className="text-sm text-foreground leading-relaxed">{question.answer}</p>
    </div>
  ) : null;

  const feedback = item.mark === "correct" ? (
    <div className={`answer-bounce rounded-xl border px-4 py-3 flex items-center justify-between gap-3 flex-wrap ${GOOD}`} role="status">
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-bold leading-tight">
            {item.wrongAttempts > 0 ? "You figured it out!" : PRAISE[seed % PRAISE.length]}
          </p>
          {combo >= 2 && (
            <p className="text-sm flex items-center gap-1 mt-0.5">
              <Flame className="w-4 h-4 text-brand-amber" /> That's {combo} in a row!
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold font-mono">+20 XP</span>
        <button type="button" onClick={retry} className="text-xs underline underline-offset-2 opacity-80 hover:opacity-100">Try again</button>
      </div>
    </div>
  ) : item.mark === "practice" ? (
    <div className={`${missed ? "answer-shake" : ""} rounded-xl border px-4 py-3 space-y-2.5 ${WARM}`} role="status">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold leading-tight">{missed ? "Not quite yet" : "Good call"}</p>
          <p className="text-sm mt-0.5">
            {missed ? NUDGES[(seed + item.wrongAttempts) % NUDGES.length] : "Practicing is how it sticks. Have another go when you're ready."}
          </p>
        </div>
        <span className="text-xs font-bold font-mono flex-shrink-0 mt-0.5">+10 XP for trying</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={retry} className={`${smallBtn} bg-primary text-primary-foreground hover:bg-primary/90`}>
          <RotateCcw className="w-3.5 h-3.5" /> Try again
        </button>
        {question.hint && !hintVisible && (
          <button type="button" onClick={() => setHintAsked(true)} className={`${smallBtn} border border-current/30 hover:bg-black/5 dark:hover:bg-white/10`}>
            <Lightbulb className="w-3.5 h-3.5" /> Show a hint
          </button>
        )}
        {missed && !answerShown && (
          <button type="button" onClick={() => setAnswerShown(true)} className={`${smallBtn} hover:bg-black/5 dark:hover:bg-white/10`}>
            <Eye className="w-3.5 h-3.5" /> Show answer
          </button>
        )}
      </div>
    </div>
  ) : null;

  const prompt = <p className="text-[15px] text-foreground leading-relaxed">{question.prompt}</p>;
  const shell = "space-y-3";

  if (type === "true-false" || type === "multiple-choice") {
    const choices = type === "true-false" ? [{ label: "True" }, { label: "False" }] : question.choices ?? [];
    const hasDiagrams = choices.some((c) => c.diagram);

    return (
      <div className={shell}>
        {prompt}
        {hintBox}
        <div className={hasDiagrams ? "grid grid-cols-2 gap-2" : "flex flex-col gap-2"}>
          {choices.map((choice, i) => {
            const isCorrect = i === question.correctIndex;
            const isSelected = i === selectedIndex;
            const state = !item.revealed ? "idle"
              : isCorrect && showSolution ? "correct"
              : isSelected ? (isCorrect ? "correct" : "tried")
              : "rest";
            const stateCls =
              state === "correct" ? GOOD :
              state === "tried" ? WARM :
              state === "rest" ? "border-border opacity-60" :
              "border-border hover:border-primary/40 hover:bg-muted/40";
            return (
              <button key={i} type="button" disabled={item.revealed} onClick={() => onAnswer(String(i), isCorrect)}
                className={`rounded-xl border-2 px-3.5 py-3 text-sm text-foreground transition-colors ${stateCls} ${hasDiagrams ? "flex flex-col items-center gap-1.5" : "flex items-center justify-between gap-2 text-left"}`}>
                <span className={hasDiagrams ? "contents" : "flex items-center gap-2"}>
                  {choice.diagram && <Diagram spec={choice.diagram} />}
                  {choice.label && <span className={hasDiagrams ? "text-xs text-center" : ""}>{choice.label}</span>}
                </span>
                {state === "correct" && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                {state === "tried" && <span className="text-[11px] font-semibold flex-shrink-0">Your pick</span>}
              </button>
            );
          })}
        </div>
        {feedback}
        {explanationBox}
      </div>
    );
  }

  if (type === "numeric") {
    const check = () => onAnswer(item.attempt, isNumericAnswerCorrect(item.attempt, question.numericAnswer ?? ""));
    return (
      <div className={shell}>
        {prompt}
        {hintBox}
        {!item.revealed ? (
          <form className="flex gap-2 flex-wrap" onSubmit={(e) => { e.preventDefault(); if (item.attempt.trim()) check(); }}>
            <input
              value={item.attempt}
              onChange={(e) => onAttemptChange(e.target.value)}
              placeholder="Your answer"
              inputMode="decimal"
              aria-label="Your answer"
              className="flex-1 min-w-[140px] px-3 py-2.5 bg-background border border-border rounded-xl text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
            <button type="submit" disabled={!item.attempt.trim()}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Check
            </button>
          </form>
        ) : (
          <>
            <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5 flex items-center justify-between gap-2 flex-wrap text-sm">
              <span className="text-foreground">Your answer: <strong>{item.attempt}</strong></span>
              {item.mark !== "correct" && showSolution && (
                <span className="text-muted-foreground">Answer: <strong className="text-foreground">{question.numericAnswer}</strong></span>
              )}
            </div>
            {feedback}
            {explanationBox}
          </>
        )}
      </div>
    );
  }

  // Free-response: write an attempt, compare with the model answer, self-mark.
  return (
    <div className={shell}>
      {prompt}
      {hintBox}
      {!item.revealed ? (
        <>
          <textarea
            value={item.attempt}
            onChange={(e) => onAttemptChange(e.target.value)}
            placeholder="Type your answer or show your work…"
            rows={3}
            aria-label="Your answer"
            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
          />
          <button type="button" onClick={onReveal} disabled={!item.attempt.trim()}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Compare with the answer
          </button>
        </>
      ) : (
        <>
          {explanationBox}
          {item.mark === null ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-foreground mr-1">How did you do?</span>
              <button type="button" onClick={() => onMark("correct")} className={`${smallBtn} border ${GOOD}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Got it
              </button>
              <button type="button" onClick={() => onMark("practice")} className={`${smallBtn} border ${WARM}`}>
                <RotateCcw className="w-3.5 h-3.5" /> Need practice
              </button>
            </div>
          ) : feedback}
        </>
      )}
    </div>
  );
}
