import { useState } from "react";
import { Users, Flame, Calendar } from "lucide-react";
import ProgressRing from "../../components/ProgressRing";
import ScheduleModal from "../../components/ScheduleModal";
import {
  tutorStudents, studentSubjectDetail, studentSessionHistory,
} from "../../data";
import { statusMeta, subjectColor } from "../../lib/constants";

export default function MyStudents() {
  const [modalStudent, setModalStudent] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">My Students</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-mono">{tutorStudents.length} students assigned</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{tutorStudents.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {tutorStudents.map((student) => {
          const meta = statusMeta[student.status];
          const subjects = studentSubjectDetail[student.id] ?? [];
          const history = studentSessionHistory[student.id] ?? [];
          const lastSession = history[0];

          return (
            <div key={student.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <ProgressRing value={student.progress} size={52} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{student.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${meta.cls}`}>{meta.label}</span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">Grade {student.grade}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-amber-600 font-mono">
                      <Flame className="w-3 h-3" />{student.streak}d streak
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{student.sessions} sessions</span>
                  </div>
                </div>
              </div>

              {/* Subject progress bars */}
              <div className="space-y-2">
                {subjects.map((sub) => (
                  <div key={sub.subject}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-mono text-foreground">{sub.subject}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">{sub.score}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${sub.score}%`, backgroundColor: subjectColor[sub.subject] ?? "#1B5E4F" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Last session */}
              {lastSession && (
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Last: {lastSession.subject} · {lastSession.date} · {lastSession.score}pts</span>
                </div>
              )}

              {/* Schedule button */}
              <button
                onClick={() => setModalStudent(student.name)}
                className="w-full py-2 border border-primary/40 text-primary rounded-lg text-xs font-semibold hover:bg-primary/5 transition-colors"
              >
                Schedule Session
              </button>
            </div>
          );
        })}
      </div>

      {modalStudent && (
        <ScheduleModal defaultStudent={modalStudent} onClose={() => setModalStudent(null)} />
      )}
    </div>
  );
}
