import { useState } from "react";
import { Link } from "react-router";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/calendar.css";
import { Plus, ArrowRight } from "lucide-react";
import SessionStatusPill from "../SessionStatusPill";
import { tutorNameById } from "../../data";
import { getCourseIcon } from "../../lib/constants";
import { subjectColor, subjectTint } from "../../lib/subject";
import type { Session } from "../../types";

// Home's Sessions card as a small month calendar. Days with a session
// get a primary-coloured dot (grey once it's done). Below it: today's
// sessions, with Join for a live one. Picking another day lists that day
// instead, with a "Today" link back. A day with no sessions shows nothing.

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// Sessions carry an ISO `date` when created through scheduling; older seed
// sessions only have a display label ("Today", "Jun 23"), so read the date
// from that, assuming the current year. Returns null if it can't be read.
export function sessionDate(s: Session, today = new Date()): Date | null {
  if (s.date) {
    const [y, m, d] = s.date.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  if (s.time === "Today") return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const parsed = new Date(`${s.time}, ${today.getFullYear()}`);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default function SessionsCalendar({ sessions, onJoin, onRequest }: {
  sessions: Session[];
  onJoin: (s: Session) => void;
  onRequest: () => void;
}) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const dated = sessions
    .map((s) => ({ s, d: sessionDate(s, today) }))
    .filter((x): x is { s: Session; d: Date } => x.d !== null);
  const byDay = new Map<string, Session[]>();
  dated.forEach(({ s, d }) => byDay.set(dayKey(d), [...(byDay.get(dayKey(d)) ?? []), s]));

  const [selected, setSelected] = useState<Date>(todayStart);
  const [activeStart, setActiveStart] = useState<Date>(new Date(todayStart.getFullYear(), todayStart.getMonth(), 1));
  const goToday = () => {
    setSelected(todayStart);
    setActiveStart(new Date(todayStart.getFullYear(), todayStart.getMonth(), 1));
  };

  const isToday = dayKey(selected) === dayKey(todayStart);
  const onDay = byDay.get(dayKey(selected)) ?? [];
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="bg-card border border-border rounded-xl p-5 lg:bg-transparent lg:border-0 lg:rounded-none lg:px-0 lg:py-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-semibold text-foreground">Sessions</h2>
        <button
          onClick={onRequest}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Request
        </button>
      </div>

      <Calendar
        className="menya-calendar menya-calendar--sessions"
        calendarType="gregory"
        value={selected}
        onChange={(v) => v instanceof Date && setSelected(v)}
        activeStartDate={activeStart}
        onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setActiveStart(activeStartDate)}
        prev2Label={null}
        next2Label={null}
        formatShortWeekday={(_, d) => "SMTWTFS"[d.getDay()]}
        tileContent={({ date, view }) => {
          if (view !== "month") return null;
          const list = byDay.get(dayKey(date));
          if (!list) return null;
          return (
            <span className="flex justify-center gap-0.5 mt-0.5" aria-hidden>
              {list.slice(0, 3).map((s) => (
                <span
                  key={s.id}
                  className="session-dot w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: s.status === "completed" ? "var(--muted-foreground)" : "var(--primary)" }}
                />
              ))}
            </span>
          );
        }}
        tileClassName={({ date, view }) => (view === "month" && byDay.has(dayKey(date)) ? "has-session" : null)}
      />

      {/* Only when the picked day has sessions; an empty day shows nothing. */}
      {onDay.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-foreground">
              {isToday ? "Today's sessions" : fmt(selected)}
            </h3>
            {!isToday && (
              <button type="button" onClick={goToday} className="text-xs font-semibold text-primary hover:underline">Today</button>
            )}
          </div>
          <div className="divide-y divide-border">
            {onDay.map((s) => {
              const live = s.status === "in-progress" && !!s.meetingId;
              return (
                <div key={s.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: subjectTint(s.course), color: subjectColor(s.course) }}
                  >
                    {getCourseIcon(s.course)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.course}</p>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">{s.clock} · {tutorNameById(s.tutorId)}</p>
                  </div>
                  {live ? (
                    <button
                      onClick={() => onJoin(s)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
                    >
                      Join
                    </button>
                  ) : (
                    <SessionStatusPill status={s.status} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History lives on My Schedule; one tap away rather than repeated here */}
      <Link to="/student/schedule#past-sessions" className="mt-3 pt-3 border-t border-border flex items-center justify-end gap-1 text-xs font-semibold text-primary hover:underline">
        Past sessions <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
