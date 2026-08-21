import { createContext, useContext, useState, type ReactNode } from "react";
import { GRADE_GROUPS } from "../lib/constants";

const RECURRING_SLOTS_KEY = "menya:recurringSlots";
const RECURRING_DEFAULT_DAYS = ["Monday", "Wednesday"];
const RECURRING_DEFAULT_TIME = "18:00";

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

function defaultRecurringSlots(): RecurringSlot[] {
  return RECURRING_DEFAULT_DAYS.flatMap((day) =>
    GRADE_GROUPS.map((grades) => ({ id: `${day}-${grades.join(",")}`, day, time: RECURRING_DEFAULT_TIME, grades, tutorIds: [] }))
  );
}

function readRecurringSlots(): RecurringSlot[] {
  try {
    const saved = JSON.parse(localStorage.getItem(RECURRING_SLOTS_KEY) ?? "null");
    // Slots saved before the per-slot "time" field existed only had day/grades/tutorIds —
    // backfill a default time so old localStorage data doesn't crash any time-based sort.
    if (Array.isArray(saved) && saved.length > 0) return saved.map((slot) => ({ time: RECURRING_DEFAULT_TIME, ...slot }));
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
