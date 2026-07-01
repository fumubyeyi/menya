import { useState } from "react";
import { useNavigate } from "react-router";
import { CalendarDays, Clock, Plus, TrendingUp, Users, ChevronRight } from "lucide-react";
import ZoomModal from "../../components/ZoomModal";
import type { Session } from "../../types";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Avatar from "../../components/Avatar";
import ProgressRing from "../../components/ProgressRing";
import SubjectTag from "../../components/SubjectTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import {
  tutorStudents, tutorSessions, tutorWeeklyData, CURRENT_TUTOR_ID, getTutorById, tutorNameById,
} from "../../data";
import { statusMeta } from "../../lib/constants";

const avgProgress = Math.round(
  tutorStudents.reduce((sum, s) => sum + s.progress, 0) / tutorStudents.length
);
const todayQueue = tutorSessions.filter((s) => s.time === "Today");

export default function TutorHome() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const currentTutor = getTutorById(CURRENT_TUTOR_ID);

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Profile Banner */}
      <div
        className="rounded-2xl p-6 flex items-center gap-5"
        style={{ background: "linear-gradient(135deg, #1B5E4F 0%, #0f3d32 100%)" }}
      >
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold font-display flex-shrink-0">
          {(() => { const t = getTutorById(CURRENT_TUTOR_ID); return t ? t.firstName[0] + t.lastName[0] : ""; })()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-semibold text-white leading-none">{tutorNameById(CURRENT_TUTOR_ID)}</h1>
          <p className="text-sm text-white/70 mt-1 font-mono">Pre-Calculus · Calculus · {tutorStudents.length} students</p>
        </div>
        <span className="text-xs font-mono text-white/60 hidden sm:block">Summer 2026 · Week 6</span>
      </div>

      {/* Stat Pillars */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Assigned Students", value: 20, Icon: Users, color: "#1B5E4F" },
          { label: "Sessions This Week", value: tutorWeeklyData[5].sessions, Icon: CalendarDays, color: "#3B82F6" },
          { label: "Avg Student Score", value: `${avgProgress}%`, Icon: TrendingUp, color: "#F0981E" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Today's Queue</h2>
              <button
                onClick={() => setModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Session
              </button>
            </div>
            {todayQueue.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No sessions today.</p>
            ) : (
              <div className="divide-y divide-border">
                {todayQueue.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar name={s.student} size={9} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.student}</p>
                      <SubjectTag subject={s.subject} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Clock className="w-3.5 h-3.5" /> {s.clock}
                    </div>
                    <SessionStatusPill status={s.status} />
                    {s.status === "in-progress" && s.meetingId && (
                      <button
                        onClick={() => setActiveSession(s)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Start
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Area Chart */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">6-Week Trend</h2>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={tutorWeeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B5E4F" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1B5E4F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tSessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F0981E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F0981E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="avgScore" stroke="#1B5E4F" strokeWidth={2} fill="url(#tScoreGrad)" name="Avg Score" />
                <Area type="monotone" dataKey="sessions" stroke="#F0981E" strokeWidth={2} fill="url(#tSessGrad)" name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#1B5E4F] inline-block rounded" />Avg Score</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#F0981E] inline-block rounded" />Sessions</span>
            </div>
          </div>
        </div>

        {/* My Students sidebar */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">My Students</h2>
            <button
              onClick={() => navigate("/tutor/students")}
              className="flex items-center gap-0.5 text-xs text-primary hover:underline font-mono"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {tutorStudents.map((s) => {
              const meta = statusMeta[s.status];
              return (
                <div
                  key={s.id}
                  onClick={() => navigate("/tutor/students")}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <ProgressRing value={s.progress} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">Gr {s.grade} · {s.sessions} sessions</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${meta.cls}`}>{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {modal && <ScheduleModal onClose={() => setModal(false)} />}
      {activeSession?.meetingId && (
        <ZoomModal
          meetingId={activeSession.meetingId}
          password={activeSession.password ?? ""}
          userName={currentTutor ? `${currentTutor.firstName} ${currentTutor.lastName}` : undefined}
          onClose={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}
