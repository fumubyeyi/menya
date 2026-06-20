import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarPlus, TrendingUp, TrendingDown, Minus, Clock, Flame, BookOpen, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Avatar from "../../components/Avatar";
import SubjectTag from "../../components/SubjectTag";
import ScheduleModal from "../../components/ScheduleModal";
import { students, studentSubjectDetail, studentSessionHistory } from "../../data";
import { statusMeta, achievements } from "../../lib/constants";
import type { StudentStatus } from "../../types";

const weekActivity = [
  { day: "Mon", mins: 0 }, { day: "Tue", mins: 45 }, { day: "Wed", mins: 0 },
  { day: "Thu", mins: 60 }, { day: "Fri", mins: 45 }, { day: "Sat", mins: 0 }, { day: "Sun", mins: 0 },
];

const TrendIcon = ({ trend }: { trend: string }) =>
  trend === "up"   ? <TrendingUp   className="w-4 h-4 text-emerald-600" /> :
  trend === "down" ? <TrendingDown className="w-4 h-4 text-red-500"     /> :
                     <Minus        className="w-4 h-4 text-muted-foreground" />;

export default function StudentDetail() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const [modal, setModal] = useState(false);

  const student = students.find((s) => s.id === Number(id));
  if (!student) return (
    <div className="p-6 text-muted-foreground">Student not found.</div>
  );

  const meta        = statusMeta[student.status as StudentStatus];
  const subjects    = studentSubjectDetail[student.id] ?? [];
  const history     = studentSessionHistory[student.id] ?? [];
  const earned      = achievements.filter((a) => a.condition({ streak: student.streak, progress: student.progress, sessions: student.sessions }));
  const upcoming    = [{ subject: subjects[0]?.subject ?? "TBD", time: "Tomorrow 3:00 PM", tutor: "Ms. Chen" }];

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Roster
      </button>

      {/* Hero Banner */}
      <div className="rounded-xl overflow-hidden border border-border" style={{ background: "linear-gradient(135deg, #1B5E4F 0%, #0d3b2e 100%)" }}>
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar name={student.name} size={16} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-white">{student.name}</h1>
            <p className="text-sm text-white/60 mt-0.5">Grade {student.grade}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {student.subjects.map((subj) => (
                <span key={subj} className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-white/15 text-white">{subj}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono flex items-center gap-1 ${meta.cls}`}>
              <meta.Icon className="w-3 h-3" />{meta.label}
            </span>
            <button onClick={() => setModal(true)} className="flex items-center gap-1.5 bg-[#F0981E] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              <CalendarPlus className="w-4 h-4" /> Schedule Session
            </button>
          </div>
        </div>

        {/* Stat pillars */}
        <div className="grid grid-cols-4 border-t border-white/10">
          {[
            { label: "Progress",     value: `${student.progress}%`, Icon: TrendingUp },
            { label: "Streak",       value: `${student.streak}d`,   Icon: Flame      },
            { label: "Sessions",     value: student.sessions,        Icon: BookOpen   },
            { label: "Study Hours",  value: `${Math.round(student.sessions * 0.85)}h`, Icon: Clock },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="flex flex-col items-center py-4 gap-1 border-r border-white/10 last:border-r-0">
              <Icon className="w-4 h-4 text-white/50" />
              <p className="text-xl font-display font-bold text-white">{value}</p>
              <p className="text-[11px] text-white/50 font-mono">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Subject Progress */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Subject Progress</h2>
          {subjects.map((sub) => (
            <div key={sub.subject} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <SubjectTag subject={sub.subject} />
                  <TrendIcon trend={sub.trend} />
                </div>
                <span className="text-lg font-display font-bold text-foreground">{sub.score}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${sub.score}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{sub.sessions} sessions · Last: {sub.lastSession}</p>
            </div>
          ))}

          {/* Session History */}
          <h2 className="text-sm font-semibold text-foreground pt-2">Session History</h2>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <SubjectTag subject={h.subject} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{h.tutor}</p>
                  <p className="text-xs text-muted-foreground">{h.date} · {h.duration}min</p>
                </div>
                <span className="text-sm font-mono font-semibold text-foreground">{h.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Weekly Activity */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Activity className="w-4 h-4" />This Week</h2>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={weekActivity} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <Bar dataKey="mins" fill="#1B5E4F" radius={[3, 3, 0, 0]} name="mins" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Upcoming Sessions</h2>
            {upcoming.map((u, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground">{u.subject} · {u.tutor}</p>
                  <p className="text-xs text-muted-foreground">{u.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Achievements</h2>
            <div className="grid grid-cols-3 gap-2">
              {achievements.map((ach) => {
                const unlocked = ach.condition({ streak: student.streak, progress: student.progress, sessions: student.sessions });
                return (
                  <div key={ach.id} title={ach.label} className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${unlocked ? "border-border bg-accent/10" : "border-transparent bg-muted opacity-40"}`}>
                    <ach.Icon className="w-5 h-5" style={{ color: unlocked ? ach.color : "#9ca3af" }} />
                    <span className="text-[10px] text-center text-muted-foreground leading-tight">{ach.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {modal && <ScheduleModal onClose={() => setModal(false)} defaultStudent={student.name} />}
    </div>
  );
}
