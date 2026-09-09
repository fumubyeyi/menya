import { useState, type ElementType, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CalendarDays, GraduationCap, ClipboardCheck } from "lucide-react";
import StatTile from "../../components/StatTile";
import { useSessions } from "../../context/SessionsContext";
import { useCurriculum } from "../../context/CurriculumContext";
import { useAttendance } from "../../context/AttendanceContext";
import { courseCompletion } from "../../lib/constants";
import { students, tutors, attendanceRate, attendanceSessionLabel, tutorNameById } from "../../data";
import { PageHeaderSubtitle } from "../../context/PageHeaderContext";

function rateCls(rate: number) {
  if (rate >= 90) return "text-emerald-700 bg-emerald-50";
  if (rate >= 75) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}

// Student outcome mix — computed from the live roster rather than a fixed tuple.
// Flagged statuses lead the list so the card reads "who needs a look" first.
// `bar` maps each outcome to the theme's Critical/Warning/Success/Info semantic
// set (theme.css) so this stays on-brand and dark-mode aware; `textCls` reuses
// the same status text shades statusMeta uses (lib/constants.tsx) for the
// legend, giving At Risk/Needs Support extra emphasis via `flagged`.
const OUTCOME_META = [
  { key: "at-risk",       label: "At Risk",       bar: "var(--destructive)", textCls: "text-red-700",     flagged: true  },
  { key: "needs-support", label: "Needs Support", bar: "var(--warning)",     textCls: "text-amber-700",   flagged: true  },
  { key: "on-track",      label: "On Track",      bar: "var(--info)",        textCls: "text-blue-700",    flagged: false },
  { key: "exceeding",     label: "Exceeding",     bar: "var(--success)",     textCls: "text-emerald-700", flagged: false },
] as const;
const outcomes = OUTCOME_META.map((m) => {
  const count = students.filter((s) => s.status === m.key).length;
  const pct = students.length ? Math.round((count / students.length) * 100) : 0;
  return { ...m, count, pct };
});

// Every card on this page shares the same title/subtitle/action-link header —
// only the body underneath differs, so that's the one piece each caller supplies.
function DashboardCard({ title, subtitle, actionLabel, onAction, children }: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {actionLabel && onAction && (
          <button onClick={onAction} className="text-xs font-medium text-primary hover:underline whitespace-nowrap flex-shrink-0">{actionLabel}</button>
        )}
      </div>
      {children}
    </div>
  );
}

// The row shape both the coverage-gap list and the activity feed use: an icon,
// a title/subtitle pair, and a trailing status badge.
function ListRow({ Icon, iconCls, title, subtitle, badge, badgeCls }: {
  Icon: ElementType;
  iconCls: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeCls: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconCls}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground font-mono">{subtitle}</p>
      </div>
      <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold flex-shrink-0 ${badgeCls}`}>{badge}</span>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{message}</p>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [_tab] = useState("overview");
  const { sessions } = useSessions();
  const { courses } = useCurriculum();
  const { attendanceSessions } = useAttendance();
  const averageCompletion = courses.length
    ? Math.round(courses.reduce((sum, course) => sum + courseCompletion(courses, course.name), 0) / courses.length)
    : 0;

  // Most recently logged roll calls, newest first — a quick "what happened since
  // I last looked" feed rather than the full attendance history.
  const recentActivity = [...attendanceSessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  // Enrollment counted live off each student's own `courses` list rather than a
  // fixed mock tuple, so it can't drift out of sync with the actual roster size.
  const courseStats = courses.map((course) => ({
    course,
    enrolled: students.filter((s) => s.courses.includes(course.name)).length,
    pct: courseCompletion(courses, course.name),
  }));
  const maxEnrolled = Math.max(1, ...courseStats.map((c) => c.enrolled));

  // On Track / At Risk breakdowns live in the Student Engagement pie chart
  // below — kept out of this row so the same numbers aren't shown twice.
  const kpis = [
    { label: "Students Enrolled", value: students.length, delta: "Current roster", Icon: Users, color: "#5E6B72", onClick: () => navigate("/program/students") },
    { label: "Scheduled Sessions", value: sessions.length, delta: "In the program schedule", Icon: CalendarDays, color: "#5E6B72", onClick: () => navigate("/program/sessions") },
    { label: "Active Tutors", value: tutors.length, delta: "In tutor directory", Icon: GraduationCap, color: "#5E6B72", onClick: () => navigate("/program/tutors") },
  ];

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>Summer 2026 · Week 6 of 10</PageHeaderSubtitle>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(({ label, value, delta, Icon, color, onClick }) => (
          <StatTile key={label} label={label} value={value} delta={delta} Icon={Icon} color={color} onClick={onClick} />
        ))}
      </div>

      {/* Operational queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardCard title="Student Engagement" subtitle="How the roster breaks down by outcome." actionLabel="View roster" onAction={() => navigate("/program/students")}>
          {/* Outcome mix — At Risk / Needs Support called out in color and weight
              so the concerning share of the roster reads as the headline. */}
          <div className="flex-1 flex items-center gap-5 py-2">
            <ResponsiveContainer width={190} height={190} className="flex-shrink-0">
              <PieChart>
                {/* CSS vars go through `style`, not the plain `fill`/`stroke` attributes —
                    SVG presentation attributes don't reliably resolve var() in every
                    browser, style-based custom properties always do. */}
                <Pie
                  data={outcomes}
                  dataKey="count"
                  nameKey="label"
                  isAnimationActive={false}
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                  style={{ stroke: "var(--card)" }}
                  strokeWidth={2}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius: ir, outerRadius: or, percent }) => {
                    if (!percent) return null;
                    const RADIAN = Math.PI / 180;
                    const r = ir + (or - ir) / 2;
                    const x = cx + r * Math.cos(-midAngle * RADIAN);
                    const y = cy + r * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="fill-white text-[11px] font-mono font-semibold" style={{ pointerEvents: "none" }}>
                        {Math.round(percent * 100)}%
                      </text>
                    );
                  }}
                >
                  {outcomes.map((o) => (
                    <Cell
                      key={o.key}
                      style={{ fill: o.bar, cursor: "pointer", outline: "none" }}
                      onClick={() => navigate(`/program/students?status=${o.key}`)}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} student${value === 1 ? "" : "s"}`, name]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend carries identity via the swatch, not colored text — flagged
                rows reuse the app's existing status text colors for emphasis
                instead of the raw (lighter, harder-to-read) slice fills. Each
                row is also a click target, same as its pie slice. */}
            <div className="flex-1 min-w-0 space-y-2">
              {outcomes.map(({ key, label, bar, pct, textCls, flagged }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(`/program/students?status=${key}`)}
                  className="w-full flex items-center gap-2 -mx-1 px-1 py-0.5 rounded hover:bg-muted transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: bar }} />
                  <span className={`text-xs font-mono flex-1 truncate text-left ${flagged ? `font-semibold ${textCls}` : "text-muted-foreground"}`}>{label}</span>
                  <span className={`text-xs font-mono tabular-nums flex-shrink-0 ${flagged ? `font-bold ${textCls}` : "text-muted-foreground"}`}>{pct}%</span>
                </button>
              ))}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Activity" subtitle="Latest attendance logged by tutors." actionLabel="View all" onAction={() => navigate("/program/sessions")}>
          {recentActivity.length === 0 ? (
            <EmptyRow message="No attendance logged yet." />
          ) : (
            <div className="divide-y divide-border">
              {recentActivity.map((a) => {
                const rate = attendanceRate(a.entries);
                return (
                  <ListRow
                    key={a.id}
                    Icon={ClipboardCheck}
                    iconCls="bg-primary/10 text-primary"
                    title={`${tutorNameById(a.tutorId)} logged ${attendanceSessionLabel(a)}`}
                    subtitle={a.date}
                    badge={`${rate}%`}
                    badgeCls={rateCls(rate)}
                  />
                );
              })}
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Course Enrollment & Completion */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Course Enrollment &amp; Completion</h2>
            <p className="text-xs text-muted-foreground mt-1">A quick view of where enrollment and learning progress are moving together.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">{courses.length} active courses</span>
            <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">{averageCompletion}% avg completion</span>
          </div>
        </div>
        <div className="flex justify-end gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#2F4F4F] inline-block rounded" />Enrolled</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#708090] inline-block rounded" />Completion</span>
        </div>

        <div className="hidden sm:grid sm:grid-cols-[9rem_1fr_1fr] gap-x-5 text-[10px] font-mono uppercase tracking-wide text-muted-foreground mb-2">
          <span>Course</span><span>Enrolled</span><span>Completion</span>
        </div>
        <div className="space-y-2.5">
          {courseStats.map(({ course, enrolled, pct }) => (
            <div key={course.id} className="grid grid-cols-1 sm:grid-cols-[9rem_1fr_1fr] gap-x-5 gap-y-1.5 sm:items-center">
              <span className="text-xs font-mono text-foreground truncate">{course.name}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(enrolled / maxEnrolled) * 100}%`, backgroundColor: "#2F4F4F" }} />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums w-8 text-right shrink-0">{enrolled}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#708090" }} />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums w-8 text-right shrink-0">{pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
