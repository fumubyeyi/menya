import Avatar from "../../components/Avatar";
import { CalendarDays, TrendingUp, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  tutorStudents, tutorWeeklyData, tutors, CURRENT_TUTOR_NAME,
} from "../../data";
import { statusMeta, subjectColor } from "../../lib/constants";

const avgProgress = Math.round(
  tutorStudents.reduce((sum, s) => sum + s.progress, 0) / tutorStudents.length
);

const tutorRecord = tutors.find((t) => t.name === CURRENT_TUTOR_NAME);

const outcomeCounts = {
  exceeding: tutorStudents.filter((s) => s.status === "exceeding").length,
  "on-track": tutorStudents.filter((s) => s.status === "on-track").length,
  "needs-support": tutorStudents.filter((s) => s.status === "needs-support").length,
  "at-risk": tutorStudents.filter((s) => s.status === "at-risk").length,
};

const outcomeGrid = [
  { key: "exceeding",      label: "Exceeding",      cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { key: "on-track",       label: "On Track",        cls: "bg-blue-50 text-blue-700 border-blue-100"         },
  { key: "needs-support",  label: "Needs Support",   cls: "bg-amber-50 text-amber-700 border-amber-100"      },
  { key: "at-risk",        label: "At Risk",         cls: "bg-red-50 text-red-700 border-red-100"            },
] as const;

export default function Performance() {
  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Performance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your teaching outcomes · Summer 2026</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Sessions This Month", value: tutorRecord?.sessions ?? 0, Icon: CalendarDays, color: "#3B82F6" },
          { label: "Avg Student Score", value: `${avgProgress}%`, Icon: TrendingUp, color: "#1B5E4F" },
          { label: "Students Assigned", value: tutorRecord?.students ?? 0, Icon: Users, color: "#F0981E" },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-foreground leading-none">{value}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Weekly Sessions & Avg Score</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={tutorWeeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
            <Bar dataKey="sessions" fill="#1B5E4F" radius={[4, 4, 0, 0]} name="Sessions" />
            <Bar dataKey="avgScore" fill="#F0981E" radius={[4, 4, 0, 0]} name="Avg Score" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-2 bg-[#1B5E4F] inline-block rounded" />Sessions</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-2 bg-[#F0981E] inline-block rounded" />Avg Score</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Student Outcomes */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Student Outcomes</h2>
          <div className="grid grid-cols-2 gap-3">
            {outcomeGrid.map(({ key, label, cls }) => (
              <div key={key} className={`rounded-xl border p-4 text-center ${cls}`}>
                <p className="text-3xl font-display font-bold">{outcomeCounts[key]}</p>
                <p className="text-xs font-mono mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Student Progress Summary */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Student Progress</h2>
          <div className="space-y-3">
            {tutorStudents.map((s) => {
              const meta = statusMeta[s.status];
              const barColor = s.progress >= 80 ? "#1B5E4F" : s.progress >= 65 ? "#F0981E" : "#EF4444";
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <Avatar name={s.name} size={8} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground truncate">{s.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${meta.cls}`}>{meta.label}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${s.progress}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground w-8 text-right">{s.progress}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
