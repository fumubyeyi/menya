import { useState } from "react";
import { useNavigate } from "react-router";
import { Users, CalendarDays, GraduationCap, AlertTriangle, Target } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import SessionStatusPill from "../../components/SessionStatusPill";
import Avatar from "../../components/Avatar";
import StatTile from "../../components/StatTile";
import { useSessions } from "../../context/SessionsContext";
import { useCurriculum } from "../../context/CurriculumContext";
import { courseCompletion, statusMeta } from "../../lib/constants";
import { students, tutors, weeklyData, courseBreakdown, tutorNameById } from "../../data";
import { PageHeaderSubtitle } from "../../context/PageHeaderContext";

const maxStudents = Math.max(...courseBreakdown.map((s) => s.students));
const attentionCount = students.filter((s) => s.status === "at-risk" || s.status === "needs-support").length;

// Student outcome mix — computed from the live roster rather than a fixed tuple.
const OUTCOME_META = [
  { key: "exceeding",     label: "Exceeding",     bar: "#2F4F4F" },
  { key: "on-track",      label: "On Track",      bar: "#708090" },
  { key: "needs-support", label: "Needs Support", bar: "#C9922E" },
  { key: "at-risk",       label: "At Risk",       bar: "#DC2626" },
] as const;
const outcomes = OUTCOME_META.map((m) => ({ ...m, count: students.filter((s) => s.status === m.key).length }));
const maxOutcome = Math.max(...outcomes.map((o) => o.count), 1);

export default function Dashboard() {
  const navigate = useNavigate();
  const [_tab] = useState("overview");
  const { sessions } = useSessions();
  const { courses } = useCurriculum();
  const todaySessions = sessions.slice(0, 5);
  const studentsOnTrack = students.filter((student) => student.status === "exceeding" || student.status === "on-track").length;
  const goalAttainment = students.length ? Math.round((studentsOnTrack / students.length) * 100) : 0;
  const attentionStudents = students.filter((student) => student.status === "at-risk" || student.status === "needs-support").slice(0, 4);
  const averageCompletion = courses.length
    ? Math.round(courses.reduce((sum, course) => sum + courseCompletion(courses, course.name), 0) / courses.length)
    : 0;

  const kpis = [
    { label: "Students Enrolled", value: students.length, delta: "Current roster", Icon: Users,         color: "#5E6B72" },
    { label: "Scheduled Sessions", value: sessions.length, delta: "In the program schedule", Icon: CalendarDays,  color: "#5E6B72" },
    { label: "Students On Track", value: `${goalAttainment}%`, delta: `${studentsOnTrack} of ${students.length} students`, Icon: Target,      color: "#5E6B72" },
    { label: "Active Tutors",      value: tutors.length,  delta: "In tutor directory",   Icon: GraduationCap, color: "#5E6B72" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>Summer 2026 · Week 6 of 10</PageHeaderSubtitle>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.filter(({ label }) => label !== "Active Tutors").map(({ label, value, delta, Icon, color }) => (
          <StatTile key={label} label={label} value={value} delta={delta} Icon={Icon} color={color} />
        ))}
        <StatTile
          label="Needing Attention"
          value={attentionCount}
          delta="At-risk or needs support"
          Icon={AlertTriangle}
          color="#DC2626"
          onClick={() => navigate("/program/students")}
        />
        {kpis.filter(({ label }) => label === "Active Tutors").map(({ label, value, delta, Icon, color }) => (
          <StatTile key={label} label={label} value={value} delta={delta} Icon={Icon} color={color} />
        ))}
      </div>

      {/* Operational queue */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Needs attention</h2>
              <p className="text-xs text-muted-foreground mt-1">Students who may need follow-up.</p>
            </div>
            <button onClick={() => navigate("/program/students")} className="text-xs font-medium text-primary hover:underline">View roster</button>
          </div>
          <div className="divide-y divide-border">
            {attentionStudents.map((student) => (
              <button key={student.id} onClick={() => navigate(`/program/students/${student.id}`)} className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-muted/50 rounded-lg px-1 transition-colors">
                <Avatar name={student.name} size={8} />
                <span className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate block">{student.name}</span>
                  <span className="text-xs text-muted-foreground">Grade {student.grade} · {student.courses[0] ?? "No course"}</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusMeta[student.status].cls}`}>{statusMeta[student.status].label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Today’s sessions</h2>
              <p className="text-xs text-muted-foreground mt-1">The next sessions on the program schedule.</p>
            </div>
            <button onClick={() => navigate("/program/sessions")} className="text-xs font-medium text-primary hover:underline">View attendance</button>
          </div>
          <div className="divide-y divide-border">
            {todaySessions.slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                <Avatar name={s.student} size={8} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.student}</p>
                  <p className="text-xs text-muted-foreground">{s.course} · {tutorNameById(s.tutorId)}</p>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{s.clock}</span>
                <SessionStatusPill status={s.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6-Week Trend */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">6-Week Program Trend</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--chart-1)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--chart-2)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
            <Area type="monotone" dataKey="avgScore" stroke="var(--chart-1)" strokeWidth={2} fill="url(#scoreGrad)" name="Avg Score" />
            <Area type="monotone" dataKey="sessions"  stroke="var(--chart-2)" strokeWidth={2} fill="url(#sessGrad)"  name="Sessions" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-chart-1 inline-block rounded" />Avg Score</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-chart-2 inline-block rounded" />Sessions</span>
        </div>
      </div>

      {/* Student Outcome Distribution */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">Student Outcome Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {outcomes.map(({ key, label, count, bar }) => (
            <div key={key} className="rounded-xl border border-border p-3 flex flex-col gap-2">
              <p className="text-2xl font-display font-bold text-foreground leading-none">{count}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{label}</p>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(count / maxOutcome) * 100}%`, backgroundColor: bar }} />
              </div>
            </div>
          ))}
        </div>
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
          {courses.map((course) => {
            const enrolled = courseBreakdown.find((c) => c.name === course.name)?.students ?? 0;
            const pct = courseCompletion(courses, course.name);
            return (
              <div key={course.id} className="grid grid-cols-1 sm:grid-cols-[9rem_1fr_1fr] gap-x-5 gap-y-1.5 sm:items-center">
                <span className="text-xs font-mono text-foreground truncate">{course.name}</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(enrolled / maxStudents) * 100}%`, backgroundColor: "#2F4F4F" }} />
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
            );
          })}
        </div>
      </div>

    </div>
  );
}
