import { useMemo, useState } from "react";
import { Pencil, ClipboardCheck, Percent, XCircle, AlertTriangle, Download, CalendarClock } from "lucide-react";
import type { Session, AttendanceScope } from "../../types";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import ReassignTutorModal from "../../components/ReassignTutorModal";
import StatTile from "../../components/StatTile";
import { useSessions } from "../../context/SessionsContext";
import { useTutors } from "../../context/TutorsContext";
import { useAttendance } from "../../context/AttendanceContext";
import { useStudents } from "../../context/StudentsContext";
import { useRecurringSlots } from "../../context/RecurringSlotsContext";
import { attendanceRate, attendanceSessionLabel, getTutorById } from "../../data";
import { ALL_COURSES, GRADE_GROUPS, formatTime12h } from "../../lib/constants";
import { PageHeaderSubtitle } from "../../context/PageHeaderContext";

const MODES = [
  { key: "in-person", label: "In-Person" },
  { key: "online",    label: "Online"    },
] as const;
type Mode = (typeof MODES)[number]["key"];

const STATUS_TABS = [
  { key: "all",       label: "All"       },
  { key: "today",     label: "Today"     },
  { key: "live",      label: "Live"      },
  { key: "scheduled", label: "Scheduled" },
];

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function Sessions() {
  const { sessions } = useSessions();
  const { tutors } = useTutors();
  const { attendanceSessions } = useAttendance();
  const { students } = useStudents();
  const { recurringSlots } = useRecurringSlots();

  const [mode, setMode] = useState<Mode>("in-person");
  const [statusTab, setStatusTab] = useState("all");
  const [reassigning, setReassigning] = useState<Session | null>(null);

  const [scope, setScope] = useState<AttendanceScope>("grade");
  const [value, setValue] = useState("");
  const [datePreset, setDatePreset] = useState<"today" | "yesterday" | "range">("range");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const setScopeAndReset = (next: AttendanceScope) => {
    setScope(next);
    setValue("");
  };

  const isoDate = (d: Date) => d.toISOString().slice(0, 10);
  const todayStr = isoDate(new Date());
  const yesterdayStr = isoDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

  const effectiveFromDate = datePreset === "today" ? todayStr : datePreset === "yesterday" ? yesterdayStr : fromDate;
  const effectiveToDate = datePreset === "today" ? todayStr : datePreset === "yesterday" ? yesterdayStr : toDate;

  // Today's recurring slots that have an assigned tutor but no roll call logged yet —
  // the sync check between what's on the Schedule and what's actually been taken.
  const todayWeekday = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const missingRollCalls = recurringSlots
    .filter((slot) => slot.day === todayWeekday && slot.tutorIds.length > 0)
    .filter((slot) => !attendanceSessions.some((a) =>
      a.date === todayStr && (a.slotId === slot.id || (a.scope === "grade" && (a.grades ?? []).some((g) => slot.grades.includes(g))))
    ));

  const modeSessions = sessions.filter((s) => (mode === "online" ? s.location !== "in-person" : s.location === "in-person"));
  const filtered = modeSessions.filter((s) => {
    if (statusTab === "all")       return true;
    if (statusTab === "today")     return s.time === "Today";
    if (statusTab === "live")      return s.status === "in-progress";
    if (statusTab === "scheduled") return s.status === "scheduled";
    return true;
  });

  const filteredAttendance = attendanceSessions
    .filter((s) => s.scope === scope)
    .filter((s) => !value || (scope === "grade" ? (s.grades ?? []).some((g) => value.split(",").map(Number).includes(g)) : s.course === value))
    .filter((s) => !effectiveFromDate || s.date >= effectiveFromDate)
    .filter((s) => !effectiveToDate || s.date <= effectiveToDate)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalAbsences = filteredAttendance.reduce((sum, s) => sum + s.entries.filter((e) => e.status === "absent").length, 0);
  const avgRate = filteredAttendance.length
    ? Math.round(filteredAttendance.reduce((sum, s) => sum + attendanceRate(s.entries), 0) / filteredAttendance.length)
    : 0;

  const perStudent = useMemo(() => {
    const byStudent = new Map<number, { present: number; total: number }>();
    filteredAttendance.forEach((s) => s.entries.forEach((e) => {
      const cur = byStudent.get(e.studentId) ?? { present: 0, total: 0 };
      cur.total += 1;
      if (e.status === "present") cur.present += 1;
      byStudent.set(e.studentId, cur);
    }));
    return Array.from(byStudent.entries())
      .map(([studentId, { present, total }]) => ({
        student: students.find((s) => s.id === studentId),
        rate: total ? Math.round((present / total) * 100) : 0,
        total,
      }))
      .filter((r): r is { student: NonNullable<typeof r.student>; rate: number; total: number } => !!r.student)
      .sort((a, b) => a.rate - b.rate);
  }, [filteredAttendance, students]);

  const belowThreshold = perStudent.filter((r) => r.rate < 80).length;

  // One row per student per roll call — the granular "was this student present, and
  // when" record, driving both the on-screen log and the CSV export.
  const attendanceLog = useMemo(() => {
    return filteredAttendance
      .flatMap((s) => s.entries.map((e) => {
        const student = students.find((st) => st.id === e.studentId);
        return {
          key: `${s.id}-${e.studentId}`,
          date: s.date,
          group: attendanceSessionLabel(s),
          studentName: student?.name ?? "Unknown",
          grade: student?.grade,
          status: e.status,
        };
      }))
      .sort((a, b) => (a.studentName === b.studentName ? b.date.localeCompare(a.date) : a.studentName.localeCompare(b.studentName)));
  }, [filteredAttendance, students]);

  const exportAttendanceCsv = () => {
    const headers = ["Student", "Date", "Group", "Grade", "Status"];
    const rows = attendanceLog.map((r) => [r.studentName, r.date, r.group, r.grade ?? "", r.status === "present" ? "Present" : "Not Present"]);
    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const range = effectiveFromDate || effectiveToDate ? `${effectiveFromDate || "start"}_to_${effectiveToDate || "now"}` : todayStr;
    link.download = `attendance-${range}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>
        {mode === "online" ? `${modeSessions.length} online sessions` : `${modeSessions.length} in-person sessions · ${attendanceSessions.length} roll calls logged`}
      </PageHeaderSubtitle>

      {/* Mode Tabs */}
      <div className="flex gap-1 border-b border-border">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors -mb-px border-b-2 ${
              mode === key
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "online" && (
        <>
          {/* Status Filter Tabs */}
          <div className="flex gap-1 border-b border-border">
            {STATUS_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusTab(key)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
                  statusTab === key
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sessions Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Student", "Course", "Tutor", "Date", "Time", "Duration", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={s.student} size={7} />
                          <span className="font-medium text-foreground whitespace-nowrap">{s.student}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><CourseTag course={s.course} /></td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {(() => { const t = tutors.find((tu) => tu.id === s.tutorId); return t ? `${t.firstName} ${t.lastName}` : "—"; })()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.time}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.clock}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.duration}min</td>
                      <td className="px-4 py-3"><SessionStatusPill status={s.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setReassigning(s)} title="Reassign tutor"
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">No online sessions match this filter.</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Roll Call Attendance — in-person only */}
      {mode === "in-person" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Roll Call Attendance</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Group roll calls tutors log by grade or course</p>
            </div>
            <button onClick={exportAttendanceCsv} disabled={filteredAttendance.length === 0}
              className="flex items-center gap-2 border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {missingRollCalls.length > 0 && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
              <CalendarClock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <span className="font-semibold">{missingRollCalls.length} session{missingRollCalls.length === 1 ? "" : "s"} scheduled today without a roll call yet:</span>{" "}
                {missingRollCalls.map((slot, i) => (
                  <span key={slot.id}>
                    Grades {slot.grades.join(", ")} · {formatTime12h(slot.time)}
                    {" ("}{slot.tutorIds.map((tid) => getTutorById(tutors, tid)?.firstName).filter(Boolean).join(", ")}{")"}
                    {i < missingRollCalls.length - 1 ? "; " : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="Roll Calls Logged" value={filteredAttendance.length} Icon={ClipboardCheck} color="#5E6B72" />
            <StatTile label="Avg Attendance Rate" value={`${avgRate}%`} Icon={Percent} color="#708090" />
            <StatTile label="Total Absences" value={totalAbsences} Icon={XCircle} color="#DC2626" />
            <StatTile label="Students Below 80%" value={belowThreshold} Icon={AlertTriangle} color="#C9922E" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 border-b border-border">
              {(["grade", "course"] as const).map((s) => (
                <button key={s} onClick={() => setScopeAndReset(s)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 capitalize ${
                    scope === s ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            <select value={value} onChange={(e) => setValue(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
              <option value="">{scope === "grade" ? "All grades" : "All courses"}</option>
              {scope === "grade"
                ? GRADE_GROUPS.map((g) => <option key={g.join(",")} value={g.join(",")}>Grades {g.join(", ")}</option>)
                : ALL_COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-2 ml-auto">
              <select value={datePreset} onChange={(e) => setDatePreset(e.target.value as typeof datePreset)} aria-label="Date filter"
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="range">Date Range</option>
              </select>
              {datePreset === "range" && (
                <>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} max={toDate || undefined} aria-label="From date"
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} min={fromDate || undefined} aria-label="To date"
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
                  {(fromDate || toDate) && (
                    <button onClick={() => { setFromDate(""); setToDate(""); }}
                      className="text-xs text-muted-foreground hover:text-foreground underline">
                      Clear
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Attendance log — was this student present, and when */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Attendance Log</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Every roll call entry, per student</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Student", "Grade", "Date", "Group", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attendanceLog.map((r) => (
                    <tr key={r.key} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.studentName} size={7} />
                          <span className="font-medium text-foreground whitespace-nowrap">{r.studentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{r.grade ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{r.date}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.group}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${r.status === "present" ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}>
                          {r.status === "present" ? "Present" : "Absent"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendanceLog.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">No attendance data yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {reassigning && <ReassignTutorModal session={reassigning} onClose={() => setReassigning(null)} />}
    </div>
  );
}
