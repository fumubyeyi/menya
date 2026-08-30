import { useState } from "react";
import { Flame, Plus } from "lucide-react";
import { Link } from "react-router";
import ZoomModal from "../../components/ZoomModal";
import ProgressRing from "../../components/ProgressRing";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import {
  sofia, studentCourseDetail, studentSessionHistory, tutorNameById,
} from "../../data";
import { achievements, getCourseIcon, courseColor, goalProgress, goalLabel } from "../../lib/constants";
import { useEnrollment } from "../../hooks/useEnrollment";
import { useSessions } from "../../context/SessionsContext";
import { useStudentGoals } from "../../hooks/useStudentGoals";
import { useStudentActivity } from "../../context/StudentActivityContext";

const courseDetails = studentCourseDetail[sofia.id] ?? [];
const sessionHistory = studentSessionHistory[sofia.id] ?? [];
const studyHours = Math.round(sessionHistory.reduce((sum, h) => sum + h.duration, 0) / 60);

export default function StudentHome() {
  const [modal, setModal] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { courses: enrolledCourses } = useEnrollment();
  const { sessions, updateSession } = useSessions();
  const { goals } = useStudentGoals();
  const { streak, sessionsAttendedTotal, studyDaysThisWeek, sessionsThisWeek, logSessionAttended } = useStudentActivity();

  const sofiaSessions = sessions.filter((s) => s.student === sofia.name);
  const todaySession = sofiaSessions.find((s) => s.time === "Today");
  const earnedAchievements = achievements.filter((a) => a.condition({ streak, progress: sofia.progress, sessions: sofia.sessions, sessionsAttended: sessionsAttendedTotal }));
  const lockedAchievements = achievements.filter((a) => !a.condition({ streak, progress: sofia.progress, sessions: sofia.sessions, sessionsAttended: sessionsAttendedTotal }));

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Greeting Banner */}
      <div
        className="rounded-2xl p-6 flex items-center gap-5"
        style={{ background: "linear-gradient(135deg, #2F4F4F 0%, #1E2B2B 100%)" }}
      >
        <ProgressRing value={sofia.progress} size={72} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-display font-semibold text-white">Good afternoon, Sofia 👋</h1>
          </div>
          <p className="text-white/70 text-sm font-mono">Grade {sofia.grade} · {enrolledCourses.length > 0 ? enrolledCourses.join(" · ") : "No courses yet"}</p>
        </div>
        <div className="flex flex-col items-center gap-1 bg-white/10 rounded-xl px-4 py-3">
          <Flame className="w-5 h-5 text-amber-400" />
          <span className="text-xl font-display font-bold text-white">{streak}</span>
          <span className="text-[10px] font-mono text-white/60">day streak</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Progress", value: `${sofia.progress}%`, color: "#708090" },
          { label: "Sessions", value: sofia.sessions, color: "#5E6B72" },
          { label: "Streak", value: `${streak}d`, color: "#5E6B72" },
          { label: "Study Hours", value: `${studyHours}h`, color: "#5E6B72" },
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
                  style={{ backgroundColor: `${courseColor[todaySession.course] ?? "#5E6B72"}18` }}>
                  <span style={{ color: courseColor[todaySession.course] ?? "#5E6B72" }}>
                    {getCourseIcon(todaySession.course)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{todaySession.course}</p>
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

          {/* Course Progress */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Course Progress</h2>
            <div className="space-y-3">
              {courseDetails.map((sd) => (
                <div key={sd.course}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span style={{ color: courseColor[sd.course] ?? "#5E6B72" }}>{getCourseIcon(sd.course)}</span>
                      <span className="text-sm font-medium text-foreground">{sd.course}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{sd.score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${sd.score}%`, backgroundColor: courseColor[sd.course] ?? "#5E6B72" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="space-y-4">
          <button
            onClick={() => setModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Request a Session
          </button>

          {/* Recent Sessions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Recent Sessions</h2>
            <div className="space-y-2">
              {sessionHistory.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${courseColor[h.course] ?? "#5E6B72"}15` }}>
                    <span style={{ color: courseColor[h.course] ?? "#5E6B72" }}>{getCourseIcon(h.course)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{h.course}</p>
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
            {goals.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No goals yet —{" "}
                <Link to="/student/goals" className="text-primary font-medium hover:underline">set one on the Goals page</Link>.
              </p>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((g) => {
                  const { current, target, pct } = goalProgress(g, { studyDaysThisWeek, sessionsThisWeek });
                  return (
                    <div key={g.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[11px] text-foreground">{goalLabel(g)}</span>
                        <span className="text-[11px] font-mono text-muted-foreground">{current}/{target}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#708090" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
        </div>
      </div>

      {modal && <ScheduleModal defaultStudent={sofia.name} onClose={() => setModal(false)} />}
      {zoomOpen && todaySession?.meetingId && (
        <ZoomModal
          meetingId={todaySession.meetingId}
          password={todaySession.password ?? ""}
          userName={sofia.name}
          course={todaySession.course}
          onClose={() => {
            updateSession({ ...todaySession, status: "completed" });
            logSessionAttended();
            setZoomOpen(false);
          }}
        />
      )}
    </div>
  );
}
