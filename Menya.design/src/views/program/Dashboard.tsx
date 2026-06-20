import { useState } from "react";
import { Users, CalendarDays, TrendingUp, GraduationCap, ChevronRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import SessionStatusPill from "../../components/SessionStatusPill";
import Avatar from "../../components/Avatar";
import { sessions, weeklyData, subjectBreakdown } from "../../data";

const kpis = [
  { label: "Students Enrolled", value: "247", delta: "+12 this month", Icon: Users,         color: "#1B5E4F" },
  { label: "Sessions This Week", value: "84",  delta: "+7 from last",   Icon: CalendarDays,  color: "#3B82F6" },
  { label: "Avg Progress Score", value: "73%", delta: "+3 pts",         Icon: TrendingUp,    color: "#F0981E" },
  { label: "Active Tutors",      value: "18",  delta: "2 onboarding",   Icon: GraduationCap, color: "#059669" },
];

const maxStudents = Math.max(...subjectBreakdown.map((s) => s.students));

export default function Dashboard() {
  const [_tab] = useState("overview");
  const todaySessions = sessions.slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Program Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Summer 2026 · Week 6 of 10</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, delta, Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-foreground leading-none">{value}</p>
            <p className="text-xs text-muted-foreground">{delta}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 6-Week Trend */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">6-Week Program Trend</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1B5E4F" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1B5E4F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F0981E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F0981E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
              <Area type="monotone" dataKey="avgScore" stroke="#1B5E4F" strokeWidth={2} fill="url(#scoreGrad)" name="Avg Score" />
              <Area type="monotone" dataKey="sessions"  stroke="#F0981E" strokeWidth={2} fill="url(#sessGrad)"  name="Sessions" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#1B5E4F] inline-block rounded" />Avg Score</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#F0981E] inline-block rounded" />Sessions</span>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Subject Enrollment</h2>
          <div className="space-y-3">
            {subjectBreakdown.map(({ name, students, color }) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-foreground">{name}</span>
                  <span className="text-xs text-muted-foreground">{students}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(students / maxStudents) * 100}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
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
                <p className="text-xs text-muted-foreground">{s.subject} · {s.tutor}</p>
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
