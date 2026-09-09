import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, CalendarClock, ClipboardCheck, Clock, HelpCircle, Plus, ChevronRight, Sparkles } from "lucide-react";
import ZoomModal from "../../components/ZoomModal";
import type { Session } from "../../types";
import Avatar from "../../components/Avatar";
import ProgressRing from "../../components/ProgressRing";
import CourseTag from "../../components/CourseTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import { useSessions } from "../../context/SessionsContext";
import { useHelpRequests } from "../../context/HelpRequestsContext";
import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import { useAttendance } from "../../context/AttendanceContext";
import { useRecurringSlots } from "../../context/RecurringSlotsContext";
import { useLibrarySearch } from "../../hooks/useLibrarySearch";
import {
  getTutorStudents, CURRENT_TUTOR_ID, getTutorById, libraryQueries,
} from "../../data";
import { statusMeta, formatTime12h, gradesSummary, attendanceForSession, matchStrengthMeta, PREFERENCE_DAYS } from "../../lib/constants";
import { mondayOf } from "../program/Schedule";
import { WEEKDAYS } from "../program/RecurringSlotModal";

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
  const { tutors } = useTutors();
  const tutorId = user?.tutorId ?? CURRENT_TUTOR_ID;
  const { sessions, removeSession } = useSessions();
  const { attendanceSessions } = useAttendance();
  const { recurringSlots } = useRecurringSlots();
  const { requests: helpRequests, resolveRequest } = useHelpRequests();
  const { queries: recentQueries } = useLibrarySearch(tutorId, libraryQueries);
  const tutorSessions = sessions.filter((s) => s.tutorId === tutorId);
  const todayISO = new Date().toISOString().slice(0, 10);
  // Not just today — a tutor with nothing left today shouldn't hit a dead end;
  // this bridges to whatever's coming up next this week. Excludes sessions whose
  // explicit `date` has already passed — the pre-seeded in-person group sessions
  // are historical (for Attendance history demo data) despite still carrying a
  // "scheduled" status, so status alone isn't enough to tell upcoming from past.
  const upcomingQueue = tutorSessions
    .filter((s) => s.status !== "completed" && (!s.date || s.date >= todayISO))
    .slice(0, 6);

  const mySlots = PREFERENCE_DAYS
    .flatMap((day) => recurringSlots.filter((s) => s.day === day && s.tutorIds.includes(tutorId)))
    .sort((a, b) => PREFERENCE_DAYS.indexOf(a.day) - PREFERENCE_DAYS.indexOf(b.day) || a.time.localeCompare(b.time));

  // This week's actual calendar date for each preference day, so the tutor sees
  // "Wed, Sep 9" rather than just the bare weekday name.
  const weekMonday = mondayOf(new Date());
  const dateForDay = (day: string) => {
    const d = new Date(weekMonday);
    d.setDate(d.getDate() + WEEKDAYS.indexOf(day));
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  // Today's in-person sessions with no roll call logged yet — in-person attendance
  // only makes sense to take same-day, so a session from a prior day is just missed,
  // not something this card should keep nagging about. Same "shared across
  // co-tutors" lookup the Schedule/Attendance pages use.
  const pendingRollCalls = tutorSessions
    .filter((s) => s.location === "in-person" && s.date === todayISO)
    .filter((s) => !attendanceForSession(s, sessions, attendanceSessions))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  const [modal, setModal] = useState(false);
  const [checkInStudent, setCheckInStudent] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const currentTutor = getTutorById(tutors, tutorId);
  const tutorStudents = getTutorStudents(tutorId);

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
      {/* Pending Roll Calls */}
      {pendingRollCalls.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-semibold text-foreground">Pending Roll Calls</h2>
            <span className="text-[11px] font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded-full ml-auto">
              {pendingRollCalls.length} session{pendingRollCalls.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="space-y-2">
            {pendingRollCalls.map((s) => (
              <div key={s.id} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.student}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <CourseTag course={s.course} />
                    <span className="text-[11px] text-muted-foreground font-mono">{s.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/tutor/attendance")}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" /> Take Attendance
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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


      {/* This Week — whether this tutor is actually scheduled on each of the
          program's two recurring days, not just their stated preference. */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" /> This Week
          </h2>
          <button
            onClick={() => navigate("/tutor/schedule")}
            className="flex items-center gap-0.5 text-xs text-primary hover:underline font-mono"
          >
            Schedule <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PREFERENCE_DAYS.map((day) => {
            const daySlots = mySlots.filter((s) => s.day === day);
            const scheduled = daySlots.length > 0;
            return (
              <div key={day} className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${scheduled ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20"}`}>
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <p className="text-sm font-medium text-foreground flex-shrink-0">{day}</p>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">
                    {scheduled ? daySlots.map((s) => `${gradesSummary(s.grades)} · ${formatTime12h(s.time)}`).join(", ") : "Not scheduled"}
                  </p>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground flex-shrink-0">{dateForDay(day)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Sessions — this week, not just today */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Upcoming Sessions</h2>
              <div className="flex items-center gap-3">
               
                <button
                  onClick={() => setModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Session
                </button>
                <button
                  onClick={() => navigate("/tutor/schedule")}
                  className="flex items-center gap-0.5 text-xs text-primary hover:underline font-mono"
                >
                  Schedule <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {upcomingQueue.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming sessions.</p>
            ) : (
              <div className="divide-y divide-border">
                {upcomingQueue.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar name={s.student} size={9} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.student}</p>
                      <CourseTag course={s.course} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Clock className="w-3.5 h-3.5" /> {s.time} · {s.clock}
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
                    {s.status !== "in-progress" && (
                      <button
                        onClick={() => removeSession(s.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 border border-red-300 hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
        {/* Recent Searches — the tutor's own AI-assisted curriculum searches,
            one click closer than digging through Curriculum Search directly. */}
        {recentQueries.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Recent Searches
              </h2>
              <button
                onClick={() => navigate("/tutor/search")}
                className="flex items-center gap-0.5 text-xs text-primary hover:underline font-mono"
              >
                Search <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {recentQueries.slice(0, 3).map((q) => (
                <button
                  key={q.id}
                  onClick={() => navigate("/tutor/search")}
                  className="w-full flex items-start gap-2 text-left p-2 -mx-2 rounded-lg hover:bg-muted/40 transition-colors"
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 mt-0.5 ${matchStrengthMeta[q.result.matchStrength].cls}`}>
                    {matchStrengthMeta[q.result.matchStrength].label}
                  </span>
                  <span className="text-xs text-foreground line-clamp-2 flex-1">{q.promptText}</span>
                </button>
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
