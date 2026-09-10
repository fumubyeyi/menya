import { useState, type ElementType } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarPlus, TrendingUp, TrendingDown, Minus, Activity, History, CalendarClock, Award } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import CourseTag from "../../components/CourseTag";
import ProfileBanner from "../../components/ProfileBanner";
import ScheduleModal from "../../components/ScheduleModal";
import EditStudentForm from "../../components/EditStudentForm";
import { studentCourseDetail, studentSessionHistory, tutorNameById } from "../../data";
import { statusMeta, achievements, nextDateForWeekday, formatSessionTime } from "../../lib/constants";
import { getEnrolledCourses } from "../../hooks/useEnrollment";
import { useRecurringSlots } from "../../context/RecurringSlotsContext";
import { useStudents } from "../../context/StudentsContext";
import type { StudentStatus, SessionRecord } from "../../types";

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Minutes actually logged per weekday, from this student's own session
// history — replaces a fixed mock pattern that looked identical for every
// student regardless of their real schedule.
function weekdayActivity(history: SessionRecord[]) {
  const totals = Object.fromEntries(DAY_ORDER.map((d) => [d, 0])) as Record<string, number>;
  for (const h of history) {
    const day = new Date(`${h.date}, 2026`).toLocaleDateString("en-US", { weekday: "short" });
    if (day in totals) totals[day] += h.duration;
  }
  return DAY_ORDER.map((day) => ({ day, mins: totals[day] }));
}

const TrendIcon = ({ trend }: { trend: string }) =>
  trend === "up"   ? <TrendingUp   className="w-4 h-4 text-emerald-600" /> :
  trend === "down" ? <TrendingDown className="w-4 h-4 text-red-500"     /> :
                     <Minus        className="w-4 h-4 text-muted-foreground" />;

type SectionKey = "progress" | "history" | "weekly" | "upcoming" | "achievements";

const SECTIONS: { key: SectionKey; label: string; Icon: ElementType }[] = [
  { key: "progress",     label: "Course Progress",   Icon: TrendingUp    },
  { key: "history",      label: "Session History",   Icon: History       },
  { key: "weekly",       label: "Weekly Pattern",    Icon: Activity      },
  { key: "upcoming",     label: "Upcoming Sessions", Icon: CalendarClock },
  { key: "achievements", label: "Achievements",      Icon: Award         },
];

export default function StudentDetail() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const [modal, setModal] = useState(false);
  const [section, setSection] = useState<SectionKey>("progress");
  const { recurringSlots } = useRecurringSlots();
  const { students } = useStudents();

  const student = students.find((s) => s.id === Number(id));
  if (!student) return (
    <div className="p-6 text-muted-foreground">Student not found.</div>
  );

  const meta        = statusMeta[student.status as StudentStatus];
  const needsAttention = student.status === "at-risk" || student.status === "needs-support";
  const enrolled    = getEnrolledCourses(student.id, student.courses);
  const courses    = (studentCourseDetail[student.id] ?? []).filter((sd) => enrolled.includes(sd.course));
  const history     = studentSessionHistory[student.id] ?? [];
  const weekActivity = weekdayActivity(history);
  const earned      = achievements.filter((a) => a.condition({ streak: student.streak, progress: student.progress, sessions: student.sessions }));

  // In-person sessions recur weekly on the student's grade-band slots (Monday/
  // Wednesday, see RecurringSlotsContext) — always resolve to whichever of
  // those two comes up next, rather than a fixed placeholder.
  const upcoming = recurringSlots
    .filter((slot) => slot.grades.includes(student.grade) && slot.tutorIds.length > 0)
    .map((slot) => {
      const date = nextDateForWeekday(slot.day);
      const { time, clock } = formatSessionTime(date, slot.time);
      return { course: courses[0]?.course ?? "TBD", tutorId: slot.tutorIds[0], date, time: `${time} · ${clock}` };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Roster
      </button>

      {/* Hero Banner */}
      <ProfileBanner
        name={student.name}
        subtitle={`Grade ${student.grade} · ${student.location}`}
        actions={
          <>
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono flex items-center gap-1 ${meta.cls}`}>
              <meta.Icon className="w-3 h-3" />{meta.label}
            </span>
            <button onClick={() => setModal(true)} className={`flex items-center gap-1.5 text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity ${needsAttention ? "bg-amber-600" : "bg-[#2F4F4F]"}`}>
              <CalendarPlus className="w-4 h-4" /> {needsAttention ? "Schedule Check-in" : "Schedule Session"}
            </button>
          </>
        }
      />

      {/* Editing the student is the primary task on this page; everything
          else (progress, history, weekly pattern, upcoming, achievements)
          is reference info tucked behind the nav on the right. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2">
          <EditStudentForm student={student} onCancel={() => navigate(-1)} onSaved={() => navigate(-1)} />
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-1.5 flex flex-col gap-0.5">
            {SECTIONS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setSection(key)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                  section === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            {section === "progress" && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-foreground">Course Progress</h2>
                {courses.map((sub) => (
                  <div key={sub.course}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CourseTag course={sub.course} />
                        <TrendIcon trend={sub.trend} />
                      </div>
                      <span className="text-lg font-display font-bold text-foreground">{sub.score}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <div className="h-full rounded-full bg-brand-amber transition-all" style={{ width: `${sub.score}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{sub.sessions} sessions · Last: {sub.lastSession}</p>
                  </div>
                ))}
              </div>
            )}

            {section === "history" && (
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Session History</h2>
                <div className="divide-y divide-border -mx-4">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <CourseTag course={h.course} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{tutorNameById(h.tutorId)}</p>
                        <p className="text-xs text-muted-foreground">{h.date} · {h.duration}min</p>
                      </div>
                      <span className="text-sm font-mono font-semibold text-foreground">{h.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === "weekly" && (
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Weekly Pattern</h2>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={weekActivity} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
                    <Bar dataKey="mins" fill="#2F4F4F" radius={[3, 3, 0, 0]} name="mins" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {section === "upcoming" && (
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-3">Upcoming Sessions</h2>
                {upcoming.length === 0 && (
                  <p className="text-xs text-muted-foreground">No upcoming sessions scheduled.</p>
                )}
                <div className="space-y-3">
                  {upcoming.map((u, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-foreground">{u.course} · {tutorNameById(u.tutorId)}</p>
                        <p className="text-xs text-muted-foreground">{u.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === "achievements" && (
              <div>
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
            )}
          </div>
        </div>
      </div>

      {modal && (
        <ScheduleModal onClose={() => setModal(false)} defaultStudent={student.name} defaultType={needsAttention ? "check-in" : undefined} />
      )}
    </div>
  );
}
