import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, CalendarDays, CalendarClock, ClipboardCheck, Clock, HelpCircle, Plus, TrendingUp, Users, ChevronRight } from "lucide-react";
import ZoomModal from "../../components/ZoomModal";
import type { Session } from "../../types";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Avatar from "../../components/Avatar";
import ProgressRing from "../../components/ProgressRing";
import CourseTag from "../../components/CourseTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import StatTile from "../../components/StatTile";
import { useSessions } from "../../context/SessionsContext";
import { useHelpRequests } from "../../context/HelpRequestsContext";
import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import { useAttendance } from "../../context/AttendanceContext";
import { useRecurringSlots } from "../../context/RecurringSlotsContext";
import {
  getTutorStudents, tutorWeeklyData, CURRENT_TUTOR_ID, getTutorById,
} from "../../data";
import { statusMeta, formatTime12h, gradesSummary, attendanceForSession, PREFERENCE_DAYS } from "../../lib/constants";
import { WEEKDAYS } from "../program/RecurringSlotModal";
import { mondayOf, toISODate } from "../program/Schedule";

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function TutorHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tutors, updateTutor } = useTutors();
  const tutorId = user?.tutorId ?? CURRENT_TUTOR_ID;
  const { sessions } = useSessions();
  const { attendanceSessions } = useAttendance();
  const { recurringSlots } = useRecurringSlots();
  const { requests: helpRequests, resolveRequest } = useHelpRequests();
  const tutorSessions = sessions.filter((s) => s.tutorId === tutorId);
  const todayQueue = tutorSessions.filter((s) => s.time === "Today");

  const mySlots = WEEKDAYS
    .flatMap((day) => recurringSlots.filter((s) => s.day === day && s.tutorIds.includes(tutorId)))
    .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) || a.time.localeCompare(b.time));

  // In-person sessions published for the current week (see program/Schedule's
  // "Notify Tutors", which turns a Recurring Slot into a dated, in-person Session)
  // — the real weekly in-person volume, not the old static mock figure.
  const weekStartISO = toISODate(mondayOf(new Date()));
  const weekEnd = mondayOf(new Date());
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndISO = toISODate(weekEnd);
  const inPersonThisWeek = tutorSessions.filter(
    (s) => s.location === "in-person" && !!s.date && s.date >= weekStartISO && s.date <= weekEndISO
  );

  // In-person sessions already in the past (or today) with no roll call logged yet —
  // the same "shared across co-tutors" lookup the Schedule/Attendance pages use, so
  // this only flags what's genuinely still outstanding for the whole group.
  const todayISO = new Date().toISOString().slice(0, 10);
  const pendingRollCalls = tutorSessions
    .filter((s) => s.location === "in-person" && !!s.date && s.date <= todayISO)
    .filter((s) => !attendanceForSession(s, sessions, attendanceSessions))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const [modal, setModal] = useState(false);
  const [checkInStudent, setCheckInStudent] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const currentTutor = getTutorById(tutors, tutorId);
  const tutorStudents = getTutorStudents(tutorId);

  const preferredDays = currentTutor?.preferredDays ?? [];
  const togglePreferredDay = (day: string) => {
    if (!currentTutor) return;
    const next = preferredDays.includes(day) ? preferredDays.filter((d) => d !== day) : [...preferredDays, day];
    updateTutor({ ...currentTutor, preferredDays: next });
  };

  const avgProgress = tutorStudents.length
    ? Math.round(tutorStudents.reduce((sum, s) => sum + s.progress, 0) / tutorStudents.length)
    : 0;
  const attentionStudents = tutorStudents.filter((s) => s.status === "at-risk" || s.status === "needs-support");

  // Open help requests from this tutor's own students — merged into the same
  // "Needs Attention" list as at-risk/needs-support status, since both are
  // "look at this student" signals a tutor shouldn't have to cross-reference.
  const openHelpRequests = helpRequests.filter(
    (r) => r.status === "open" && tutorStudents.some((s) => s.id === r.studentId)
  );
  const attentionRows = attentionStudents.map((s) => ({
    student: s,
    request: openHelpRequests.find((r) => r.studentId === s.id),
  }));
  openHelpRequests
    .filter((r) => !attentionStudents.some((s) => s.id === r.studentId))
    .forEach((r) => {
      const student = tutorStudents.find((s) => s.id === r.studentId);
      if (student) attentionRows.push({ student, request: r });
    });

  const scheduleCheckIn = (studentName: string, requestId?: number) => {
    setCheckInStudent(studentName);
    if (requestId) resolveRequest(requestId);
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Profile Banner — same identity card Program sees on a tutor's profile
          (avatar, profession, grade range), plus the day-preference toggle on
          the right since this is the tutor's own, editable copy of it. */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        style={{ background: "linear-gradient(135deg, #2F4F4F 0%, #1E2B2B 100%)" }}
      >
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold font-display flex-shrink-0">
          {currentTutor ? currentTutor.firstName[0] + currentTutor.lastName[0] : ""}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-semibold text-white leading-none">{currentTutor ? `${currentTutor.firstName} ${currentTutor.lastName}` : ""}</h1>
          {currentTutor?.profession && (
            <p className="text-sm text-white/60 mt-1">{currentTutor.profession}</p>
          )}
          {currentTutor && currentTutor.grades.length > 0 && (
            <p className="text-sm text-white/60 mt-1 font-mono">Grades {Math.min(...currentTutor.grades)}–{Math.max(...currentTutor.grades)}</p>
          )}
        </div>

        {/* Tutoring Day Preference */}
        <div className="flex flex-col items-start sm:items-end gap-2">
          <span className="text-[11px] font-mono text-white/50 uppercase tracking-wide">Prefers to tutor:</span>
            {PREFERENCE_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => togglePreferredDay(day)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  preferredDays.includes(day)
                    ? "bg-white text-[#2F4F4F]"
                    : "border border-white/25 text-white/70 hover:bg-white/10"
                }`}
              >
                {day}
              </button>
            ))}
        </div>
      </div>

      {/* Stat Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile label="Assigned Students" value={currentTutor?.students ?? tutorStudents.length} Icon={Users} color="#5E6B72" />
        <StatTile label="In-Person This Week" value={inPersonThisWeek.length} Icon={CalendarDays} color="#5E6B72" />
        <StatTile label="Avg Student Score" value={`${avgProgress}%`} Icon={TrendingUp} color="#708090" />
        <StatTile label="Pending Roll Calls" value={pendingRollCalls.length} Icon={ClipboardCheck} color="#DC2626" />
      </div>

      {/* Needs Attention */}
      {attentionRows.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-foreground">Needs Attention</h2>
            <span className="text-[11px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full ml-auto">
              {attentionRows.length} student{attentionRows.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attentionRows.map(({ student: s, request }) => {
              const meta = statusMeta[s.status];
              const isAttentionStatus = s.status === "at-risk" || s.status === "needs-support";
              return (
                <div key={s.id} className="flex flex-col gap-2.5 bg-card border border-border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} size={9} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {isAttentionStatus && <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${meta.cls}`}>{meta.label}</span>}
                        {request && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono text-blue-700 bg-blue-50 flex items-center gap-1">
                            <HelpCircle className="w-2.5 h-2.5" /> Asked for help · {timeAgo(request.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {request && (
                    <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-2">
                      {request.course} · {request.moduleTitle}
                      {request.note && <span className="block mt-0.5 text-foreground">"{request.note}"</span>}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scheduleCheckIn(s.name, request?.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 border border-amber-300 hover:bg-amber-100 transition-colors"
                    >
                      Schedule Check-in
                    </button>
                    {request && (
                      <button
                        onClick={() => resolveRequest(request.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground border border-border hover:bg-muted transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


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
                      <CourseTag course={s.course} />
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
                    <stop offset="5%" stopColor="#2F4F4F" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2F4F4F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tSessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#708090" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#708090" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="avgScore" stroke="#2F4F4F" strokeWidth={2} fill="url(#tScoreGrad)" name="Avg Score" />
                <Area type="monotone" dataKey="sessions" stroke="#708090" strokeWidth={2} fill="url(#tSessGrad)" name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#2F4F4F] inline-block rounded" />Avg Score</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-0.5 bg-[#708090] inline-block rounded" />Sessions</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
        {/* My Recurring Slots */}
        {mySlots.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" /> My Recurring Slots
              </h2>
              <button
                onClick={() => navigate("/tutor/schedule")}
                className="flex items-center gap-0.5 text-xs text-primary hover:underline font-mono"
              >
                Schedule <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {mySlots.map((slot) => (
                <span key={slot.id} className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-muted text-foreground border border-border">
                  {slot.day} · {gradesSummary(slot.grades)} · {formatTime12h(slot.time)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* My Students */}
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
      </div>

      {modal && <ScheduleModal onClose={() => setModal(false)} />}
      {checkInStudent && (
        <ScheduleModal defaultStudent={checkInStudent} defaultType="check-in" onClose={() => setCheckInStudent(null)} />
      )}
      {activeSession?.meetingId && (
        <ZoomModal
          meetingId={activeSession.meetingId}
          password={activeSession.password ?? ""}
          userName={currentTutor ? `${currentTutor.firstName} ${currentTutor.lastName}` : undefined}
          course={activeSession.course}
          onClose={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}
