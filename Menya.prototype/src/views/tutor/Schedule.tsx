import { useState } from "react";
import { Clock, Plus, ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";
import ZoomModal from "../../components/ZoomModal";
import type { Session } from "../../types";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import SessionArtifacts from "../../components/SessionArtifacts";
import RollCallModal from "../../components/RollCallModal";
import { useSessions } from "../../context/SessionsContext";
import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";
import { useAttendance } from "../../context/AttendanceContext";
import {
  getTutorStudents, studentSessionHistory, getTutorById, attendanceRate, CURRENT_TUTOR_ID,
} from "../../data";

const MODES = [
  { key: "online",    label: "Online"    },
  { key: "in-person", label: "In-Person" },
] as const;
type Mode = (typeof MODES)[number]["key"];

function scoreCls(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 65) return "text-amber-600";
  return "text-red-600";
}

function rateCls(rate: number) {
  if (rate >= 90) return "text-emerald-700 bg-emerald-50";
  if (rate >= 75) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}

export default function TutorSchedule() {
  const { user } = useAuth();
  const { tutors } = useTutors();
  const tutorId = user?.tutorId ?? CURRENT_TUTOR_ID;
  const { sessions } = useSessions();
  const { attendanceSessions } = useAttendance();
  const tutorSessions = sessions.filter((s) => s.tutorId === tutorId);
  const [mode, setMode] = useState<Mode>("online");
  const [modal, setModal] = useState(false);
  const [rollCallModal, setRollCallModal] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const currentTutor = getTutorById(tutors, tutorId);
  const tutorStudents = getTutorStudents(tutorId);

  const modeSessions = tutorSessions.filter((s) => (mode === "online" ? s.location !== "in-person" : s.location === "in-person"));

  const myRollCalls = attendanceSessions
    .filter((s) => s.tutorId === tutorId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const history = tutorStudents.flatMap((s) =>
    (studentSessionHistory[s.id] ?? []).map((h) => ({ ...h, studentName: s.name }))
  );

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mode === "online" ? `${modeSessions.length} online sessions` : `${modeSessions.length} in-person sessions · ${myRollCalls.length} roll calls logged`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRollCallModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" /> Take Roll Call
          </button>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Schedule Session
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 border-b border-border">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors -mb-px border-b-2 ${
              mode === key
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Upcoming {mode === "online" ? "Online" : "In-Person"} Sessions</h2>
        {modeSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No upcoming {mode === "online" ? "online" : "in-person"} sessions.</p>
        ) : (
          <div className="divide-y divide-border">
            {modeSessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar name={s.student} size={9} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.student}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <CourseTag course={s.course} />
                    <span className="text-[11px] text-muted-foreground font-mono">{s.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Clock className="w-3.5 h-3.5" /> {s.clock}
                </div>
                <span className="text-[11px] font-mono text-muted-foreground hidden sm:block">{s.duration}m</span>
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

      {/* Roll Call Attendance — in-person only */}
      {mode === "in-person" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">My Roll Calls</h2>
          {myRollCalls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No attendance logged yet — take your first roll call above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                    <th className="text-left pb-3 pr-4">Group</th>
                    <th className="text-left pb-3 pr-4">Date</th>
                    <th className="text-left pb-3 pr-4">Present</th>
                    <th className="text-left pb-3 pr-4">Absent</th>
                    <th className="text-left pb-3">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myRollCalls.map((s) => {
                    const rate = attendanceRate(s.entries);
                    const count = (mark: string) => s.entries.filter((e) => e.status === mark).length;
                    return (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 pr-4">
                          {s.scope === "course" ? <CourseTag course={s.course ?? ""} /> : <span className="text-xs font-mono text-foreground">Grade {s.grade}</span>}
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{s.date}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-emerald-700">
                          <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{count("present")}</span>
                        </td>
                        <td className="py-2.5 pr-4 font-mono text-xs text-red-700">
                          <span className="inline-flex items-center gap-1"><XCircle className="w-3 h-3" />{count("absent")}</span>
                        </td>
                        <td className="py-2.5">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${rateCls(rate)}`}>{rate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Session History Table */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Session History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                <th className="text-left pb-3 pr-4">Student</th>
                <th className="text-left pb-3 pr-4">Course</th>
                <th className="text-left pb-3 pr-4">Score</th>
                <th className="text-left pb-3 pr-4">Date</th>
                <th className="text-left pb-3 pr-4">Duration</th>
                <th className="text-left pb-3">Materials</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <Avatar name={h.studentName} size={7} />
                      <span className="font-medium text-foreground text-xs">{h.studentName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <CourseTag course={h.course} />
                  </td>
                  <td className={`py-2.5 pr-4 font-mono font-semibold text-xs ${scoreCls(h.score)}`}>{h.score}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{h.date}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{h.duration}m</td>
                  <td className="py-2.5">
                    <SessionArtifacts artifacts={h.artifacts} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <ScheduleModal onClose={() => setModal(false)} />}
      {rollCallModal && <RollCallModal onClose={() => setRollCallModal(false)} />}
      {activeSession?.meetingId && (
        <ZoomModal
          sessionId={activeSession.id}
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
