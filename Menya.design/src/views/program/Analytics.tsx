import { Users, CalendarDays, TrendingUp, Target } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { weeklyData, subjectBreakdown } from "../../data";

const kpis = [
  { label: "Total Students",    value: "247", delta: "+12 this month", Icon: Users,        color: "#1B5E4F" },
  { label: "Sessions This Week",value: "84",  delta: "+7 vs last week", Icon: CalendarDays, color: "#3B82F6" },
  { label: "Avg Progress Score",value: "73%", delta: "+3 pts this week", Icon: TrendingUp,  color: "#F0981E" },
  { label: "Goal Attainment",   value: "68%", delta: "On track overall",  Icon: Target,     color: "#059669" },
];

const outcomes = [
  { label: "Exceeding",     count: 2, color: "#059669", bg: "bg-emerald-50", text: "text-emerald-700" },
  { label: "On Track",      count: 3, color: "#3B82F6", bg: "bg-blue-50",    text: "text-blue-700"    },
  { label: "Needs Support", count: 2, color: "#F59E0B", bg: "bg-amber-50",   text: "text-amber-700"   },
  { label: "At Risk",       count: 1, color: "#EF4444", bg: "bg-red-50",     text: "text-red-700"     },
];

const maxStudents = Math.max(...subjectBreakdown.map((s) => s.students));

export default function Analytics() {
  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Program performance · Summer 2026</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Session Volume */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Weekly Session Volume</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="sessions" fill="#1B5E4F" radius={[4, 4, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Score Trend */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Avg Score Over Time</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F0981E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F0981E" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 80]} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
              <Area type="monotone" dataKey="avgScore" stroke="#F0981E" strokeWidth={2} fill="url(#analyticsGrad)" name="Avg Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Outcome Distribution */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Student Outcome Distribution</h2>
          <div className="grid grid-cols-2 gap-3">
            {outcomes.map(({ label, count, color, bg, text }) => (
              <div key={label} className={`rounded-xl p-4 ${bg} flex flex-col gap-2`}>
                <p className={`text-3xl font-display font-bold ${text}`}>{count}</p>
                <p className={`text-xs font-mono ${text}`}>{label}</p>
                <div className="h-1 bg-white/60 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(count / 8) * 100}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Enrollment */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">Subject Enrollment</h2>
          <div className="space-y-3">
            {subjectBreakdown.map(({ name, students, color }) => (
              <div key={name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-foreground">{name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{students} students</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(students / maxStudents) * 100}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
