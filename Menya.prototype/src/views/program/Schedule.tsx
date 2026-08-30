import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Users, CalendarRange, ChevronDown, BellRing, Pencil, Trash2 } from "lucide-react";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import SessionModal, { type PublishedGroup } from "./SessionModal";
import RecurringSlotModal, { WEEKDAYS } from "./RecurringSlotModal";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "../../app/components/ui/dropdown-menu";
import { useSessions } from "../../context/SessionsContext";
import { useTutors } from "../../context/TutorsContext";
import { useScheduleNotices } from "../../context/ScheduleNoticesContext";
import { useRecurringSlots, type RecurringSlot } from "../../context/RecurringSlotsContext";
import { formatSessionTime, formatTime12h, gradesSummary } from "../../lib/constants";
import type { Session } from "../../types";
import { PageHeaderSubtitle, PageHeaderActions } from "../../context/PageHeaderContext";

export type { RecurringSlot };

export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// The Monday of the week containing `d` — so "this week" always means the week
// today falls in, however far into it we already are. Exported so other tutor-
// facing views (e.g. tutor Home's "In-Person This Week" stat) count published
// in-person sessions against the same week boundary Program uses to publish them.
export function mondayOf(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + diff);
  return monday;
}

type ModalState = { mode: "add"; prefill?: { date: string; grades: number[]; tutorIds: number[] } } | { mode: "edit"; group: PublishedGroup };

export default function Schedule() {
  const { sessions, addSessions, removeSession, removeSessions } = useSessions();
  const { tutors } = useTutors();
  const { addScheduleNotices } = useScheduleNotices();
  const { recurringSlots, toggleSlotTutor, saveSlot: saveSlotToContext, deleteSlot } = useRecurringSlots();

  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(new Date()));
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [slotModal, setSlotModal] = useState<{ mode: "add" } | { mode: "edit"; slot: RecurringSlot } | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const saveSlot = (fields: { day: string; time: string; grades: number[] }) => {
    saveSlotToContext(fields, slotModal?.mode === "edit" ? slotModal.slot.id : undefined);
    setSlotModal(null);
  };

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      date: toISODate(d),
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" }),
    };
  }), [weekStart]);
  const weekLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 4);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(weekStart)} – ${fmt(end)}`;
  }, [weekStart]);
  const isCurrentWeek = toISODate(weekStart) === toISODate(mondayOf(new Date()));

  const slotsByDay = WEEKDAYS
    .map((day) => ({ day, slots: recurringSlots.filter((s) => s.day === day).sort((a, b) => a.time.localeCompare(b.time)) }))
    .filter((g) => g.slots.length > 0);

  const weekStartISO = weekDays[0].date;
  const weekEndISO = weekDays[6].date;
  const weekStartBound = parseISODate(weekStartISO);
  const weekEndBound = parseISODate(weekEndISO);

  // On-demand sessions — anything published via "Add Session" for the viewed week,
  // as opposed to the standing Recurring Slots above. In-person group bookings create
  // one Session per assigned tutor, so merge those back into a single row.
  const publishedSessions = sessions
    .filter((s) => s.date && s.date >= weekStartISO && s.date <= weekEndISO)
    .sort((a, b) => (a.date === b.date ? a.clock.localeCompare(b.clock) : (a.date ?? "").localeCompare(b.date ?? "")));

  const publishedGroups: PublishedGroup[] = (() => {
    const map = new Map<string, PublishedGroup>();
    publishedSessions.forEach((s) => {
      const isGroup = s.location === "in-person";
      const key = isGroup ? `${s.student}|${s.course}|${s.date}|${s.time}` : `single-${s.id}`;
      const existing = map.get(key);
      if (existing) existing.sessionsInGroup.push(s);
      else map.set(key, { key, student: s.student, course: s.course, date: s.date, time: s.time, clock: s.clock, location: s.location, sessionsInGroup: [s] });
    });
    return Array.from(map.values());
  })();

  const publishedGroupsByDay = (() => {
    const map = new Map<string, PublishedGroup[]>();
    publishedGroups.forEach((g) => {
      const key = g.date ?? "unknown";
      const existing = map.get(key);
      if (existing) existing.push(g);
      else map.set(key, [g]);
    });
    return Array.from(map.entries());
  })();

  const dayLabel = (date: string) => weekDays.find((d) => d.date === date)?.label ?? date;

  const goToPrevWeek = () => setWeekStart((d) => { const nd = new Date(d); nd.setDate(nd.getDate() - 7); return nd; });
  const goToNextWeek = () => setWeekStart((d) => { const nd = new Date(d); nd.setDate(nd.getDate() + 7); return nd; });
  const goToThisWeek = () => setWeekStart(mondayOf(new Date()));

  // Recurring slots have no date of their own, so a tutor assigned to one has nothing
  // to see on their own Schedule page until it becomes a real, dated Session. Notifying
  // is what makes that happen: publish this week's occurrence of every assigned slot
  // (skipping ones already published, e.g. from a previous Notify or a manual Add
  // Session), then send the notice for everything — newly published and on-demand alike.
  const notifyTutors = () => {
    const toPublish: Omit<Session, "id">[] = [];
    recurringSlots.forEach((slot) => {
      const date = weekDays[WEEKDAYS.indexOf(slot.day)]?.date;
      if (!date || slot.tutorIds.length === 0) return;
      const { time: timeLabel, clock } = formatSessionTime(date, slot.time);
      const groupLabel = `${gradesSummary(slot.grades)} Group`;
      slot.tutorIds.forEach((tid) => {
        const alreadyPublished = sessions.some((s) => s.tutorId === tid && s.date === date && s.clock === clock);
        if (!alreadyPublished) {
          toPublish.push({
            student: groupLabel, tutorId: tid, course: "All Courses", date, time: timeLabel, clock,
            duration: 120, status: "scheduled", type: "tutoring", location: "in-person",
          });
        }
      });
    });
    if (toPublish.length > 0) addSessions(toPublish);

    const tutorCounts = new Map<number, number>();
    recurringSlots.forEach((slot) => {
      slot.tutorIds.forEach((tid) => tutorCounts.set(tid, (tutorCounts.get(tid) ?? 0) + 1));
    });
    publishedSessions.forEach((s) => tutorCounts.set(s.tutorId, (tutorCounts.get(s.tutorId) ?? 0) + 1));
    if (tutorCounts.size === 0) {
      setToast("Nothing scheduled for this week yet.");
      return;
    }
    addScheduleNotices(Array.from(tutorCounts.entries()).map(([tid, sessionCount]) => ({ tutorId: tid, weekLabel, weekStart: weekStartISO, sessionCount })));
    setToast(`Notified ${tutorCounts.size} tutor${tutorCounts.size === 1 ? "" : "s"} about this week's schedule.`);
  };

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>Schedule, review, and adjust sessions week by week</PageHeaderSubtitle>
      <PageHeaderActions>
        <button onClick={notifyTutors}
          className="flex items-center gap-2 bg-background border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors">
          <BellRing className="w-4 h-4" /> Notify Tutors
        </button>
      </PageHeaderActions>

      {/* Week navigation */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
        <button onClick={goToPrevWeek} title="Previous week"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <CalendarRange className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Week of {weekLabel}</span>
          {!isCurrentWeek && (
            <button onClick={goToThisWeek} className="text-xs font-mono text-primary hover:underline">This Week</button>
          )}
        </div>
        <button onClick={goToNextWeek} title="Next week"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Recurring slot templates — assign default tutors here, publish via the Add action */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Recurring Slots</span>
          <button onClick={() => setSlotModal({ mode: "add" })}
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-primary hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add Slot
          </button>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[110px_90px_290px_1fr_72px] text-sm">
            {["Day", "Time", "Grades", "Tutors", ""].map((h) => (
              <div key={h} className="px-4 py-3 bg-muted/40 border-b border-border text-xs font-mono text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</div>
            ))}
            {slotsByDay.map(({ day, slots }) => (
              <div key={day} style={{ display: "contents" }}>
                <div style={{ gridRow: `span ${slots.length}` }}
                  className="px-4 py-3 bg-muted/20 border-b border-r border-border flex items-center text-foreground font-mono text-xs whitespace-nowrap">
                  {day}
                </div>
                {slots.map((slot, i) => (
                  <div key={slot.id} style={{ display: "contents" }}>
                    <div className={`px-4 py-3 border-b border-border flex items-center text-foreground font-mono text-xs whitespace-nowrap ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                      {formatTime12h(slot.time)}
                    </div>
                    <div className={`px-4 py-3 border-b border-border flex items-center gap-1.5 ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                      {slot.grades.map((g) => (
                        <span key={g} className="px-2 py-1 rounded-md text-xs font-mono font-medium bg-muted text-foreground border border-border whitespace-nowrap">Grade {g}</span>
                      ))}
                    </div>
                    <div className={`px-4 py-3 border-b border-border flex items-center gap-2 flex-wrap ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <button type="button"
                            className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                            <span className="text-muted-foreground">Select tutors</span>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {tutors.length === 0 && <p className="text-xs text-muted-foreground px-2 py-1.5">No tutors available.</p>}
                          {tutors.map((t) => (
                            <DropdownMenuCheckboxItem key={t.id} checked={slot.tutorIds.includes(t.id)}
                              onSelect={(e) => e.preventDefault()}
                              onCheckedChange={() => toggleSlotTutor(slot.id, t.id)}>
                              {t.firstName} {t.lastName}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {slot.tutorIds.map((tid) => {
                        const t = tutors.find((tu) => tu.id === tid);
                        return t ? (
                          <span key={tid} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary whitespace-nowrap">
                            {t.firstName} {t.lastName}
                          </span>
                        ) : null;
                      })}
                    </div>
                    <div className={`px-4 py-3 border-b border-border flex items-center gap-1 ${i % 2 === 1 ? "bg-muted/10" : ""}`}>
                      <button type="button" onClick={() => setSlotModal({ mode: "edit", slot })} title="Edit slot"
                        className="w-7 h-7 flex-shrink-0 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => deleteSlot(slot.id)} title="Delete slot"
                        className="w-7 h-7 flex-shrink-0 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {slotsByDay.length === 0 && (
              <div className="col-span-5 px-4 py-8 text-center text-sm text-muted-foreground">No recurring slots yet. Add one to get started.</div>
            )}
          </div>
        </div>
      </div>

      {/* On-demand sessions — anything added via "Add Session" for the viewed week,
          as distinct from the standing Recurring Slots above. */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            On-Demand Sessions ({publishedGroups.length})
          </span>
          <button onClick={() => setModalState({ mode: "add" })}
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-primary hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add Session
          </button>
        </div>
        {publishedGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
            No sessions added for this week yet.
          </p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-card divide-y divide-border">
            {publishedGroupsByDay.map(([date, groups]) => (
              <div key={date}>
                <div className="px-3 py-2 bg-muted/40">
                  <span className="text-[11px] font-mono font-semibold text-foreground">{date !== "unknown" ? dayLabel(date) : "Unscheduled"}</span>
                </div>
                <div className="divide-y divide-border">
                  {groups.map((g) => {
                    const isGroup = g.location === "in-person";

                    if (!isGroup) {
                      const s = g.sessionsInGroup[0];
                      const t = tutors.find((tu) => tu.id === s.tutorId);
                      return (
                        <div key={g.key} className="flex items-center gap-3 px-3 py-2.5">
                          <Avatar name={s.student} size={8} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{s.student}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <CourseTag course={s.course} />
                              <span className="text-[10px] font-mono text-muted-foreground">{t ? `${t.firstName} ${t.lastName}` : "—"}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{s.clock}</span>
                            </div>
                          </div>
                          <button type="button" onClick={() => setModalState({ mode: "edit", group: g })} title="Edit session"
                            className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => removeSession(s.id)} title="Remove"
                            className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div key={g.key} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{g.student}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <CourseTag course={g.course} />
                            <span className="text-[10px] font-mono text-muted-foreground">{g.clock}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">· In-Person</span>
                          </div>
                          <div className="flex items-center gap-1 mt-2 pl-2 border-l-2 border-border flex-wrap">
                            {g.sessionsInGroup.map((s, i) => {
                              const t = tutors.find((tu) => tu.id === s.tutorId);
                              return (
                                <span key={s.id} className="text-xs text-foreground">
                                  {t ? `${t.firstName} ${t.lastName}` : "—"}{i < g.sessionsInGroup.length - 1 ? "," : ""}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <button type="button" onClick={() => setModalState({ mode: "edit", group: g })} title="Edit session"
                          className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => removeSessions(g.sessionsInGroup.map((s) => s.id))} title="Remove"
                          className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {slotModal && (
        <RecurringSlotModal
          editing={slotModal.mode === "edit" ? slotModal.slot : undefined}
          onSave={saveSlot}
          onClose={() => setSlotModal(null)}
        />
      )}

      {modalState && (
        <SessionModal
          weekDays={weekDays}
          weekStartBound={weekStartBound}
          weekEndBound={weekEndBound}
          weekLabel={weekLabel}
          weekStartISO={weekStartISO}
          editing={modalState.mode === "edit" ? modalState.group : undefined}
          prefill={modalState.mode === "add" ? modalState.prefill : undefined}
          onClose={() => setModalState(null)}
        />
      )}

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-foreground text-background text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
