// "Add to calendar": builds a standard .ics file (works with Google, Apple
// and Outlook calendars) and hands it to the browser to save or open.

export interface CalendarEvent {
  title: string;
  start: Date;
  minutes: number;
  location?: string;
  description?: string;
  // Weekly repeat on the start date's weekday (for standing in-person times)
  weekly?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
// Floating local time (no timezone), so 6:00 PM stays 6:00 PM in the
// student's calendar.
const stamp = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/[,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export function buildCalendarFile(events: CalendarEvent[]): string {
  const now = stamp(new Date());
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Menya//Student schedule//EN", "CALSCALE:GREGORIAN"];
  events.forEach((e, i) => {
    const end = new Date(e.start.getTime() + e.minutes * 60_000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${stamp(e.start)}-${i}@menya`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(e.start)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escape(e.title)}`,
    );
    if (e.location) lines.push(`LOCATION:${escape(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${escape(e.description)}`);
    if (e.weekly) lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[e.start.getDay()]}`);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadCalendarFile(filename: string, events: CalendarEvent[]): void {
  const blob = new Blob([buildCalendarFile(events)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// "2026-11-24" + "3:00 PM" -> a local Date.
export function sessionStartDate(dayISO: string, clock: string): Date {
  const [y, m, d] = dayISO.split("-").map(Number);
  const match = clock.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let h = match ? Number(match[1]) % 12 : 0;
  if (match && match[3].toUpperCase() === "PM") h += 12;
  return new Date(y, m - 1, d, h, match ? Number(match[2]) : 0);
}
