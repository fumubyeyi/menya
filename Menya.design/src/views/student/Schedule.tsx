import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import SubjectTag from "../../components/SubjectTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import {
  sofia, sessions, studentSessionHistory, studentAssignments, CURRENT_STUDENT_ID, aiProjects, tutorNameById,
} from "../../data";
import { getSubjectIcon, subjectColor } from "../../lib/constants";

const sofiaSessions = sessions.filter((s) => s.student === sofia.name);
const sessionHistory = studentSessionHistory[sofia.id] ?? [];

export default function StudentSchedule() {
  const [modal, setModal] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Schedule</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Upcoming sessions &amp; assignments</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Request Session
        </button>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Upcoming Sessions</h2>
        {sofiaSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
        ) : (
          <div className="divide-y divide-border">
            {sofiaSessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${subjectColor[s.subject] ?? "#1B5E4F"}15` }}
                >
                  <span style={{ color: subjectColor[s.subject] ?? "#1B5E4F" }}>
                    {getSubjectIcon(s.subject)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.subject}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{tutorNameById(s.tutorId)} · {s.time}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <Clock className="w-3.5 h-3.5" /> {s.clock}
                </div>
                <span className="text-[11px] font-mono text-muted-foreground hidden sm:block">{s.duration}m</span>
                <SessionStatusPill status={s.status} />
                {s.status === "in-progress" && (
                  <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
                    Join
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Past Sessions</h2>
        <div className="divide-y divide-border">
          {sessionHistory.map((h, i) => (
            <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${subjectColor[h.subject] ?? "#1B5E4F"}15` }}
              >
                <span style={{ color: subjectColor[h.subject] ?? "#1B5E4F" }}>
                  {getSubjectIcon(h.subject)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{h.subject}</p>
                <p className="text-[11px] font-mono text-muted-foreground">{tutorNameById(h.tutorId)} · {h.duration}m</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-mono font-semibold ${h.score >= 80 ? "text-emerald-600" : h.score >= 65 ? "text-amber-600" : "text-red-600"}`}>
                  {h.score}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground">{h.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Assignments</h2>
        <div className="space-y-4">
          {(studentAssignments[CURRENT_STUDENT_ID] ?? []).map((hw) => {
            const project = aiProjects.find((p) => p.id === hw.id);
            const previewTasks = project?.tasks.slice(0, 2) ?? [];

            return (
              <div key={hw.id} className="border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{hw.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <SubjectTag subject={hw.subject} />
                      <span className="text-[11px] font-mono text-muted-foreground">Due {hw.dueDate}</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0">
                    {hw.status === "not-started" ? "Start" : "Continue"}
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${hw.completion}%` }} />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">{hw.completion}%</span>
                </div>

                {previewTasks.length > 0 && (
                  <div className="space-y-1">
                    {previewTasks.map((task, i) => (
                      <div key={i} className="flex gap-2 text-[11px] text-muted-foreground">
                        <span className="font-mono">{i + 1}.</span>
                        <span className="line-clamp-1">{task}</span>
                      </div>
                    ))}
                    {(project?.tasks.length ?? 0) > 2 && (
                      <p className="text-[11px] font-mono text-muted-foreground">+{(project?.tasks.length ?? 0) - 2} more tasks</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {modal && <ScheduleModal defaultStudent={sofia.name} onClose={() => setModal(false)} />}
    </div>
  );
}
