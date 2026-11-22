import { useEffect, useState } from "react";

// Roughly how long a student has spent in a module, for the end-of-module
// screen. Counts in 5-second ticks only while the tab is visible, and keeps
// the total in localStorage (per module, on this device) so it builds up
// across visits. Approximate by design: it's a "you put in 12 minutes"
// encouragement, not a timesheet.
const TICK = 5;

export function useModuleTime(storageKey: string): number {
  const [seconds, setSeconds] = useState(() => {
    try {
      return Number(localStorage.getItem(storageKey)) || 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setSeconds((s) => {
        const next = s + TICK;
        try {
          localStorage.setItem(storageKey, String(next));
        } catch {
          /* storage unavailable: time just won't persist */
        }
        return next;
      });
    }, TICK * 1000);
    return () => clearInterval(id);
  }, [storageKey]);

  return seconds;
}

export function formatMinutes(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
}
