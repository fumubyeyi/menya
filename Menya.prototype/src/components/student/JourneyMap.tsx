import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { Check, Play, Flag } from "lucide-react";
import { subjectColor, subjectTint } from "../../lib/subject";
import type { CurriculumCourse, CurriculumModule } from "../../types";

// A course drawn as a winding path: one stop per module, in curriculum order,
// with a flag where each chapter begins. Finished stops are filled with the
// subject colour, the student's current stop is larger and pulses, and stops
// still ahead are outlined. Every stop links straight into that module.
// Text and icons on a subject fill use var(--card), not white: the dark-mode
// subject colours are light, and white on them would fail contrast.

const STEP = 76;        // horizontal distance between stops
const PAD_X = 48;       // room before the first / after the last stop
const HEIGHT = 184;
const CENTER_Y = 96;
const AMPLITUDE = 24;   // how far the path winds up and down

interface Stop {
  module: CurriculumModule;
  chapterId: number;
  chapterIndex: number;
  chapterTitle: string;
  moduleIndex: number;
  chapterStart: boolean;
  x: number;
  y: number;
}

function buildStops(course: CurriculumCourse): Stop[] {
  const stops: Stop[] = [];
  course.chapters.forEach((chapter, chapterIndex) => {
    chapter.modules.forEach((module, moduleIndex) => {
      const i = stops.length;
      stops.push({
        module,
        chapterId: chapter.id,
        chapterIndex,
        chapterTitle: chapter.title,
        moduleIndex,
        chapterStart: moduleIndex === 0,
        x: PAD_X + i * STEP,
        y: CENTER_Y + Math.sin(i * 0.85) * AMPLITUDE,
      });
    });
  });
  return stops;
}

// Smooth curve through the stops (Catmull-Rom converted to cubic Béziers).
function curveThrough(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function JourneyMap({ course }: { course: CurriculumCourse }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stops = buildStops(course);
  const color = subjectColor(course.name);

  // "You are here": the first module in progress, else the first not started.
  const hereIndex = (() => {
    const inProgress = stops.findIndex((s) => s.module.status === "in-progress");
    return inProgress !== -1 ? inProgress : stops.findIndex((s) => s.module.status === "not-started");
  })();
  // The coloured stretch of path runs from the start up to the current stop
  // (or the whole way once everything is done).
  const travelledTo = hereIndex === -1 ? stops.length - 1 : hereIndex;

  const width = PAD_X * 2 + Math.max(0, stops.length - 1) * STEP;

  // Open the map scrolled so the current stop is in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || hereIndex < 0) return;
    el.scrollLeft = Math.max(0, stops[hereIndex].x - el.clientWidth / 2);
  }, [course.name, hereIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (stops.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">This course doesn't have any modules yet.</p>;
  }

  return (
    // The fade on the right edge hints that the path keeps going off-screen.
    <div
      ref={scrollRef}
      className="overflow-x-auto scrollbar-hide -mx-5 px-5"
      style={{ maskImage: "linear-gradient(90deg, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(90deg, #000 88%, transparent)" }}
    >
      <div className="relative" style={{ width, height: HEIGHT }}>
        <svg width={width} height={HEIGHT} className="absolute inset-0" aria-hidden>
          <path d={curveThrough(stops)} fill="none" stroke="var(--muted)" strokeWidth={8} strokeLinecap="round" />
          {travelledTo > 0 && (
            <path d={curveThrough(stops.slice(0, travelledTo + 1))} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" />
          )}
        </svg>

        {/* Chapter flags */}
        {stops.filter((s) => s.chapterStart).map((s) => (
          <div
            key={`flag-${s.chapterId}`}
            className="absolute top-0 flex items-center gap-1.5 max-w-[220px]"
            style={{ left: s.x - 14 }}
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: subjectTint(course.name, 16) }}>
              <Flag className="w-3.5 h-3.5" style={{ color }} />
            </span>
            <span className="text-[11px] font-semibold text-foreground truncate">
              Ch {s.chapterIndex + 1} · {s.chapterTitle}
            </span>
          </div>
        ))}

        {/* Stops */}
        {stops.map((s, i) => {
          const done = s.module.status === "completed";
          const here = i === hereIndex;
          const size = here ? 52 : 40;
          const label = `${s.module.title} (${done ? "done" : here ? "you are here" : "up ahead"})`;
          return (
            <Link
              key={`${s.chapterId}-${s.moduleIndex}`}
              to={`/student/module/${s.chapterId}/${s.moduleIndex}`}
              title={s.module.title}
              aria-label={label}
              className="absolute rounded-full flex items-center justify-center transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
              style={{
                left: s.x - size / 2,
                top: s.y - size / 2,
                width: size,
                height: size,
                backgroundColor: done ? color : "var(--card)",
                border: done ? "none" : `${here ? 4 : 3}px solid ${here ? color : "var(--border)"}`,
                boxShadow: here ? `0 0 0 6px ${subjectTint(course.name, 18)}` : "var(--student-card-shadow)",
                outlineColor: color,
              }}
            >
              {here && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full motion-safe:animate-ping"
                  style={{ backgroundColor: subjectTint(course.name, 30) }}
                />
              )}
              {done ? (
                <Check className="w-5 h-5" strokeWidth={3} style={{ color: "var(--card)" }} />
              ) : here ? (
                <Play className="w-5 h-5 relative" style={{ color, fill: color }} />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
              )}
            </Link>
          );
        })}

        {/* "You are here" tag under the current stop */}
        {hereIndex >= 0 && (
          <span
            className="absolute text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap -translate-x-1/2"
            style={{ left: stops[hereIndex].x, top: stops[hereIndex].y + 34, backgroundColor: color, color: "var(--card)" }}
          >
            You are here
          </span>
        )}
      </div>
    </div>
  );
}
