import { useState } from "react";
import { Link } from "react-router";
import { Check, CheckCircle2, ChevronDown } from "lucide-react";
import type { CurriculumChapter, CurriculumCourse, CurriculumModule } from "../../types";

// A course's chapters as rows, each opening onto its modules drawn as a trail:
// done stops filled, the current one ringed with Resume/Start, the rest ahead.
// Used on My Courses (current chapter only, windowed) and as the course
// outline beside the Module Workspace (every chapter, every module).

// The module to go to next: the first in progress, else the first not started.
export function nextStop(course: CurriculumCourse) {
  const stops = course.chapters.flatMap((ch) => ch.modules.map((m, index) => ({ m, chapterId: ch.id, index })));
  return stops.find((s) => s.m.status === "in-progress") ?? stops.find((s) => s.m.status === "not-started") ?? null;
}

// At most this many modules show in an open chapter, so a long course doesn't
// stretch its card. The window sits around the current module: a couple of
// done ones behind it, the next few ahead. "Show all" lists the rest.
const VISIBLE_MODULES = 5;

function moduleWindow(count: number, currentIndex: number | null): [number, number] {
  if (count <= VISIBLE_MODULES) return [0, count];
  const start = Math.min(Math.max(0, (currentIndex ?? 0) - 2), count - VISIBLE_MODULES);
  return [start, start + VISIBLE_MODULES];
}

// A stop on the chapter's trail. Done: filled with a check. Current: ringed,
// with a soft pulse behind it. Not started: an empty stop with its number.
function TrailStop({ status, n, current }: { status: CurriculumModule["status"]; n: number; current: boolean }) {
  if (status === "completed") {
    return (
      <span className="relative z-10 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0" aria-label="Done">
        <Check className="w-4 h-4" strokeWidth={3} />
      </span>
    );
  }
  if (current) {
    return (
      <span className="relative z-10 w-7 h-7 flex-shrink-0" aria-label={status === "in-progress" ? "In progress" : "Up next"}>
        <span className="trail-pulse absolute inset-0 rounded-full bg-primary" aria-hidden />
        <span
          className="relative w-7 h-7 rounded-full bg-card text-primary text-xs font-bold flex items-center justify-center"
          style={{ boxShadow: "inset 0 0 0 3px var(--primary)" }}
        >
          {n}
        </span>
      </span>
    );
  }
  return (
    <span
      className="relative z-10 w-7 h-7 rounded-full bg-card text-muted-foreground text-xs font-bold flex items-center justify-center flex-shrink-0"
      style={{ boxShadow: "inset 0 0 0 2px var(--border)" }}
      aria-label="Not started"
    >
      {n}
    </span>
  );
}

// The line from one stop down to the next: solid primary once the module
// above it is done (that bit of the path is walked), dashed grey ahead.
function TrailLink({ walked, outline }: { walked: boolean; outline?: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute ${outline ? "left-[29px]" : "left-[53px]"} top-1/2 h-full w-[3px] rounded-full`}
      style={walked
        ? { backgroundColor: "var(--primary)" }
        : { backgroundImage: "linear-gradient(var(--border) 60%, transparent 0)", backgroundSize: "3px 8px" }}
    />
  );
}

export default function CourseChapters({ course, chapters = course.chapters, windowed = false, collapsible = true, here }: {
  course: CurriculumCourse;
  // The module open in the Module Workspace. Set, this is the workspace's
  // course outline: tighter, that module marked "you're here", and no
  // Resume buttons (the student is already in a module).
  here?: { chapterId: number; index: number };
  // False: chapters are always open, with a plain heading (no chevron)
  collapsible?: boolean;
  chapters?: CurriculumChapter[];
  windowed?: boolean;
}) {
  const next = nextStop(course);
  const outline = !!here;
  const currentChapterId = here?.chapterId ?? next?.chapterId ?? null;
  const rowPad = outline ? "pl-4 pr-3" : "pl-10 pr-5";

  // Chapters the student has opened or closed; anything not listed falls back
  // to "open if it's the current chapter".
  const [toggled, setToggled] = useState<Record<number, boolean>>({});
  const isOpen = (id: number) => toggled[id] ?? id === currentChapterId;

  return (
    <ul className="divide-y divide-border">
      {chapters.map((ch) => {
        const ci = course.chapters.indexOf(ch);
        const open = !collapsible || isOpen(ch.id);
        const chDone = ch.modules.filter((m) => m.status === "completed").length;
        const panelId = `chapter-${ch.id}`;
        return (
          <li key={ch.id}>
            {collapsible ? (
            <button
              type="button"
              onClick={() => setToggled((t) => ({ ...t, [ch.id]: !open }))}
              aria-expanded={open}
              aria-controls={panelId}
              className={`w-full flex items-center gap-2 ${outline ? "px-3" : "px-5"} py-3 text-left hover:bg-muted/50 motion-safe:transition-colors`}
            >
              <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 motion-safe:transition-transform ${open ? "" : "-rotate-90"}`} />
              <span className="flex-1 min-w-0 text-sm text-foreground truncate">
                <span className="font-mono text-muted-foreground">Ch {ci + 1} · </span>
                <span className={ch.id === currentChapterId ? "font-bold" : "font-semibold"}>{ch.title}</span>
              </span>
              <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                {chDone === ch.modules.length && chDone > 0 ? <CheckCircle2 className="w-4 h-4 text-primary inline" aria-label="Chapter done" /> : `${chDone}/${ch.modules.length}`}
              </span>
            </button>
            ) : (
            <div className="px-5 py-3 text-sm text-foreground truncate">
              <span className="font-mono text-muted-foreground">Ch {ci + 1} · </span>
              <span className="font-bold">{ch.title}</span>
            </div>
            )}
            {open && (() => {
              const [from, to] = !windowed
                ? [0, ch.modules.length]
                : moduleWindow(ch.modules.length, next?.chapterId === ch.id ? next.index : null);
              const clipped = to - from < ch.modules.length;
              return (
              <>
              <ul id={panelId} className={clipped ? "" : "pb-2"}>
                {ch.modules.slice(from, to).map((m, k) => {
                  const mi = from + k;
                  const href = `/student/module/${ch.id}/${mi}`;
                  // Outline: the module open right now
                  if (here?.chapterId === ch.id && here.index === mi) {
                    return (
                      <li key={mi} className="relative">
                        {mi < to - 1 && <TrailLink walked={m.status === "completed"} outline />}
                        <Link to={href} aria-current="page" className={`flex items-center gap-3 ${rowPad} py-1.5 bg-primary/10`}>
                          <TrailStop status={m.status === "completed" ? "completed" : "in-progress"} n={mi + 1} current />
                          <span className="flex-1 min-w-0 text-sm font-bold text-foreground leading-snug">{m.title}</span>
                        </Link>
                      </li>
                    );
                  }
                  // The module to pick up: its row carries the Resume/Start button
                  if (!outline && next?.chapterId === ch.id && next.index === mi) {
                    return (
                      <li key={mi} className="relative flex items-center gap-3 pl-10 pr-3 py-1.5 bg-primary/[0.07]">
                        {mi < to - 1 && <TrailLink walked={m.status === "completed"} />}
                        <TrailStop status={m.status} n={mi + 1} current />
                        <Link to={href} className="flex-1 min-w-0 text-sm font-semibold text-foreground leading-snug hover:underline">{m.title}</Link>
                        <Link
                          to={href}
                          aria-label={`${m.status === "in-progress" ? "Resume" : "Start"} ${m.title}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 motion-safe:transition-colors flex-shrink-0"
                        >
                          {m.status === "in-progress" ? "Resume" : "Start"}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={mi} className="relative">
                      {mi < to - 1 && <TrailLink walked={m.status === "completed"} outline={outline} />}
                      <Link to={href} className={`flex items-center gap-3 ${rowPad} py-1.5 group hover:bg-muted/50 motion-safe:transition-colors`}>
                        <TrailStop status={m.status} n={mi + 1} current={false} />
                        <span className={`flex-1 min-w-0 text-sm ${outline ? "leading-snug" : "truncate"} group-hover:underline ${m.status === "not-started" ? "text-muted-foreground" : "text-foreground"}`}>
                          {m.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {/* The full list lives in the Module Workspace's course
                  outline, opened on the module to pick up in this chapter. */}
              {windowed && clipped && (
                <Link
                  to={`/student/module/${ch.id}/${next?.chapterId === ch.id ? next.index : 0}?outline=1`}
                  className="block pl-[88px] pr-5 pt-1 pb-3 text-xs font-semibold text-primary hover:underline"
                >
                  Show all {ch.modules.length} modules
                </Link>
              )}
              </>
              );
            })()}
          </li>
        );
      })}
    </ul>
  );
}
