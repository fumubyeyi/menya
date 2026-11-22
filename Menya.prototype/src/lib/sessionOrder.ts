// Putting sessions in time order. Sessions carry a display label
// ("Today", "Tomorrow", "Nov 24") and a clock ("4:30 PM"); newer ones also
// carry an ISO `date`. Comparing those as text gets it wrong ("10:00 AM"
// before "9:00 AM", "Aug 9" after "Aug 19"), so everything goes through here.

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "4:30 PM" -> 990 (minutes since midnight). Unknown formats sort first.
export function clockMinutes(clock: string): number {
  const match = clock.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + Number(match[2]);
}

// "Today" / "Tomorrow" / "Aug 9" (this year) / "2026-08-09" -> "2026-08-09".
export function labelToISO(label: string, now = new Date()): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) return label;
  if (label === "Today") return iso(now);
  if (label === "Tomorrow") return iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  const parsed = new Date(`${label} ${now.getFullYear()}`);
  return isNaN(parsed.getTime()) ? null : iso(parsed);
}

// The day a session falls on, preferring its ISO date.
export function sessionDayISO(s: { date?: string; time: string }): string | null {
  return s.date ?? labelToISO(s.time);
}

// Soonest first: by day, then start time. Sessions with no known day go last.
export function bySessionStart(a: { date?: string; time: string; clock: string }, b: { date?: string; time: string; clock: string }): number {
  return (sessionDayISO(a) ?? "9999").localeCompare(sessionDayISO(b) ?? "9999") || clockMinutes(a.clock) - clockMinutes(b.clock);
}

// Most recent first, for past sessions.
export function bySessionStartDesc(a: { date?: string; time: string; clock: string }, b: { date?: string; time: string; clock: string }): number {
  return bySessionStart(b, a);
}

// Past session records ({ date: "Aug 19" }): most recent first.
export function byRecordDateDesc(a: { date: string }, b: { date: string }): number {
  return (labelToISO(b.date) ?? "").localeCompare(labelToISO(a.date) ?? "");
}
