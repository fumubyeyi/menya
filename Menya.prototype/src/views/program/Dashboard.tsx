import { useState } from "react";
import { useNavigate } from "react-router";
import { Users, CalendarDays, TrendingUp, GraduationCap, AlertTriangle, ChevronRight, Target } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import SessionStatusPill from "../../components/SessionStatusPill";
import Avatar from "../../components/Avatar";
import StatTile from "../../components/StatTile";
import { useSessions } from "../../context/SessionsContext";
import { useCurriculum } from "../../context/CurriculumContext";
import { courseCompletion } from "../../lib/constants";
import { students, weeklyData, courseBreakdown, tutorNameById } from "../../data";
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

  const kpis = [
    { label: "Students Enrolled", value: "247", delta: "+12 this month", Icon: Users,         color: "#5E6B72" },
    { label: "Sessions This Week", value: "84",  delta: "+7 from last",   Icon: CalendarDays,  color: "#5E6B72" },
    { label: "Avg Progress Score", value: "73%", delta: "+3 pts",         Icon: TrendingUp,    color: "#708090" },
    { label: "Goal Attainment",    value: "68%", delta: "On track overall", Icon: Target,      color: "#5E6B72" },
    { label: "Active Tutors",      value: "18",  delta: "2 onboarding",   Icon: GraduationCap, color: "#5E6B72" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>Summer 2026 · Week 6 of 10</PageHeaderSubtitle>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map(({ label, value, delta, Icon, color }) => (
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
      </div>

      {/* 6-Week Trend */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">6-Week Program Trend</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2F4F4F" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2F4F4F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#708090" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#708090" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
            <Area type="monotone" dataKey="avgScore" stroke="#2F4F4F" strokeWidth={2} fill="url(#scoreGrad)" name="Avg Score" />
            <Area type="monotone" dataKey="sessions"  stroke="#708090" strokeWidth={2} fill="url(#sessGrad)"  name="Sessions" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#2F4F4F] inline-block rounded" />Avg Score</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#708090] inline-block rounded" />Sessions</span>
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
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-foreground">Course Enrollment &amp; Completion</h2>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#2F4F4F] inline-block rounded" />Enrolled</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#708090] inline-block rounded" />Completion</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Students enrolled and share of modules marked complete, per course.</p>

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

      {/* Today's Sessions */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Today's Sessions</h2>
        <div className="divide-y divide-border">
          {todaySessions.map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-2.5 hover:bg-muted/40 rounded-lg px-1 -mx-1 cursor-pointer transition-colors">
              <Avatar name={s.student} size={8} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{s.student}</p>
                <p className="text-xs text-muted-foreground">{s.course} · {tutorNameById(s.tutorId)}</p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{s.clock}</span>
              <SessionStatusPill status={s.status} />
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
