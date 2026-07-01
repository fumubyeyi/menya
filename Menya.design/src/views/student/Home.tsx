import { useState } from "react";
import { Flame, Clock, BookOpen, ChevronRight } from "lucide-react";
import ZoomModal from "../../components/ZoomModal";
import ProgressRing from "../../components/ProgressRing";
import SubjectTag from "../../components/SubjectTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import {
  sofia, sessions, studentSubjectDetail, studentSessionHistory,
  studentAssignments, CURRENT_STUDENT_ID, studentGoals, aiProjects, tutorNameById,
} from "../../data";
import { achievements, getSubjectIcon, subjectColor } from "../../lib/constants";

const sofiaSessions = sessions.filter((s) => s.student === sofia.name);
const todaySession = sofiaSessions.find((s) => s.time === "Today");
const subjectDetails = studentSubjectDetail[sofia.id] ?? [];
const sessionHistory = studentSessionHistory[sofia.id] ?? [];
const studyHours = Math.round(sessionHistory.reduce((sum, h) => sum + h.duration, 0) / 60);
const earnedAchievements = achievements.filter((a) => a.condition(sofia));
const lockedAchievements = achievements.filter((a) => !a.condition(sofia));

export default function StudentHome() {
  const [modal, setModal] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Greeting Banner */}
      <div
        className="rounded-2xl p-6 flex items-center gap-5"
        style={{ background: "linear-gradient(135deg, #1B5E4F 0%, #0f3d32 100%)" }}
      >
        <ProgressRing value={sofia.progress} size={72} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-display font-semibold text-white">Good afternoon, Sofia 👋</h1>
          </div>
          <p className="text-white/70 text-sm font-mono">Grade {sofia.grade} · {sofia.subjects.join(" · ")}</p>
        </div>
        <div className="flex flex-col items-center gap-1 bg-white/10 rounded-xl px-4 py-3">
          <Flame className="w-5 h-5 text-amber-400" />
          <span className="text-xl font-display font-bold text-white">{sofia.streak}</span>
          <span className="text-[10px] font-mono text-white/60">day streak</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Progress", value: `${sofia.progress}%`, color: "#1B5E4F" },
          { label: "Sessions", value: sofia.sessions, color: "#3B82F6" },
          { label: "Streak", value: `${sofia.streak}d`, color: "#F59E0B" },
          { label: "Study Hours", value: `${studyHours}h`, color: "#8B5CF6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-display font-bold" style={{ color }}>{value}</p>
            <p className="text-[11px] font-mono text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Today's Focus */}
          {todaySession && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Today's Focus</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${subjectColor[todaySession.subject] ?? "#1B5E4F"}18` }}>
                  <span style={{ color: subjectColor[todaySession.subject] ?? "#1B5E4F" }}>
                    {getSubjectIcon(todaySession.subject)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{todaySession.subject}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{tutorNameById(todaySession.tutorId)} · {todaySession.clock}</p>
                </div>
                <SessionStatusPill status={todaySession.status} />
                {todaySession.status === "in-progress" && todaySession.meetingId && (
                  <button
                    onClick={() => setZoomOpen(true)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Subject Progress */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Subject Progress</h2>
            <div className="space-y-3">
              {subjectDetails.map((sd) => (
                <div key={sd.subject}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span style={{ color: subjectColor[sd.subject] ?? "#1B5E4F" }}>{getSubjectIcon(sd.subject)}</span>
                      <span className="text-sm font-medium text-foreground">{sd.subject}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{sd.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${sd.score}%`, backgroundColor: subjectColor[sd.subject] ?? "#1B5E4F" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Assignments</h2>
            <div className="space-y-3">
              {(studentAssignments[CURRENT_STUDENT_ID] ?? []).map((hw) => (
                <div key={hw.id} className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{hw.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <SubjectTag subject={hw.subject} />
                        <span className="text-[11px] font-mono text-muted-foreground">Due {hw.dueDate}</span>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
                      {hw.status === "not-started" ? "Start" : "Continue"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${hw.completion}%` }} />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground">{hw.completion}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Recent Sessions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Recent Sessions</h2>
            <div className="space-y-2">
              {sessionHistory.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${subjectColor[h.subject] ?? "#1B5E4F"}15` }}>
                    <span style={{ color: subjectColor[h.subject] ?? "#1B5E4F" }}>{getSubjectIcon(h.subject)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{h.subject}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{h.date}</p>
                  </div>
                  <span className={`text-xs font-mono font-semibold ${h.score >= 80 ? "text-emerald-600" : h.score >= 65 ? "text-amber-600" : "text-red-600"}`}>{h.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goals Snapshot */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Goals</h2>
            <div className="space-y-3">
              {studentGoals.slice(0, 3).map((g, i) => {
                const pct = Math.round((g.current / g.target) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-foreground">{g.label}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">{g.current}/{g.target}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Achievements</h2>
            <div className="grid grid-cols-3 gap-2">
              {earnedAchievements.map((a) => (
                <div key={a.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/40">
                  <a.Icon className="w-5 h-5" style={{ color: a.color }} />
                  <span className="text-[9px] font-mono text-center text-foreground leading-tight">{a.label}</span>
                </div>
              ))}
              {lockedAchievements.map((a) => (
                <div key={a.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/20 opacity-40">
                  <a.Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[9px] font-mono text-center text-muted-foreground leading-tight">{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Request a Session
          </button>
        </div>
      </div>

      {modal && <ScheduleModal defaultStudent={sofia.name} onClose={() => setModal(false)} />}
      {zoomOpen && todaySession?.meetingId && (
        <ZoomModal
          meetingId={todaySession.meetingId}
          password={todaySession.password ?? ""}
          userName={sofia.name}
          onClose={() => setZoomOpen(false)}
        />
      )}
    </div>
  );
}
