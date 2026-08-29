import { createContext, useContext, useState, type ReactNode } from "react";
import { GRADE_GROUPS } from "../lib/constants";
import { CURRENT_TUTOR_ID } from "../data";

const RECURRING_SLOTS_KEY = "menya:recurringSlots";
const RECURRING_DEFAULT_DAYS = ["Monday", "Wednesday"];
const RECURRING_DEFAULT_TIME = "18:00";
// Grade band assigned to the default tutor login for today's weekday (see below) —
// [10,11,12] is the band that overlaps her seed `grades: [9,10,11,12]`.
const DEMO_GRADE_BAND = GRADE_GROUPS[GRADE_GROUPS.length - 1];

// Most in-person sessions land on the same recurring weekly slots by grade band.
// This is a standing template of those slots — assigning tutors here just sets
// who's expected; it becomes a real dated Session (and shows on a tutor's own
// Schedule/Roll Call) once Notify Tutors publishes the current week's occurrence.
export interface RecurringSlot {
  id: string;
  day: string;
  time: string;
  grades: number[];
  tutorIds: number[];
}

const todayWeekday = () => new Date().toLocaleDateString("en-US", { weekday: "long" });

// A slot for *today* (computed fresh, not a fixed day) with the default tutor
// pre-assigned, so a first-time visitor to Attendance always has something to
// demo "Take Attendance" with regardless of which day of the week it is —
// distinct from the fixed Monday/Wednesday template below, which stays empty
// until Program actually assigns someone.
function demoSlotForToday(): RecurringSlot {
  const day = todayWeekday();
  return { id: `${day}-${DEMO_GRADE_BAND.join(",")}`, day, time: RECURRING_DEFAULT_TIME, grades: DEMO_GRADE_BAND, tutorIds: [CURRENT_TUTOR_ID] };
}

function defaultRecurringSlots(): RecurringSlot[] {
  const template = RECURRING_DEFAULT_DAYS.flatMap((day) =>
    GRADE_GROUPS.map((grades) => ({ id: `${day}-${grades.join(",")}`, day, time: RECURRING_DEFAULT_TIME, grades, tutorIds: [] }))
  );
  const demo = demoSlotForToday();
  // Today might already be Monday/Wednesday — don't add a duplicate id.
  return template.some((s) => s.id === demo.id) ? template : [...template, demo];
}

function readRecurringSlots(): RecurringSlot[] {
  try {
    const saved = JSON.parse(localStorage.getItem(RECURRING_SLOTS_KEY) ?? "null");
    // Slots saved before the per-slot "time" field existed only had day/grades/tutorIds —
    // backfill a default time so old localStorage data doesn't crash any time-based sort.
    if (Array.isArray(saved) && saved.length > 0) {
      const withTime = saved.map((slot) => ({ time: RECURRING_DEFAULT_TIME, ...slot }));
      // Same idea as the fresh-load case above, but for a browser that already has
      // slots saved from a previous day — inject today's demo slot if this is the
      // first time landing on this particular weekday.
      const demo = demoSlotForToday();
      return withTime.some((s: RecurringSlot) => s.id === demo.id) ? withTime : [...withTime, demo];
    }
  } catch {
    // fall through to defaults
  }
  return defaultRecurringSlots();
}

interface RecurringSlotsContextValue {
  recurringSlots: RecurringSlot[];
  toggleSlotTutor: (slotId: string, tutorId: number) => void;
  saveSlot: (fields: { day: string; time: string; grades: number[] }, editingId?: string) => void;
  deleteSlot: (slotId: string) => void;
}

const RecurringSlotsContext = createContext<RecurringSlotsContextValue | null>(null);

export function RecurringSlotsProvider({ children }: { children: ReactNode }) {
  const [recurringSlots, setRecurringSlots] = useState<RecurringSlot[]>(readRecurringSlots);

  const toggleSlotTutor = (slotId: string, tutorId: number) => {
    setRecurringSlots((prev) => {
      const next = prev.map((slot) =>
        slot.id === slotId
          ? { ...slot, tutorIds: slot.tutorIds.includes(tutorId) ? slot.tutorIds.filter((id) => id !== tutorId) : [...slot.tutorIds, tutorId] }
          : slot
      );
      localStorage.setItem(RECURRING_SLOTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const saveSlot = (fields: { day: string; time: string; grades: number[] }, editingId?: string) => {
    setRecurringSlots((prev) => {
      const next = editingId
        ? prev.map((slot) => (slot.id === editingId ? { ...slot, ...fields } : slot))
        : [...prev, { id: `slot-${Date.now()}`, ...fields, tutorIds: [] }];
      localStorage.setItem(RECURRING_SLOTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const deleteSlot = (slotId: string) => {
    setRecurringSlots((prev) => {
      const next = prev.filter((slot) => slot.id !== slotId);
      localStorage.setItem(RECURRING_SLOTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <RecurringSlotsContext.Provider value={{ recurringSlots, toggleSlotTutor, saveSlot, deleteSlot }}>
      {children}
    </RecurringSlotsContext.Provider>
  );
}

export function useRecurringSlots() {
  const ctx = useContext(RecurringSlotsContext);
  if (!ctx) throw new Error("useRecurringSlots must be used inside RecurringSlotsProvider");
  return ctx;
}
