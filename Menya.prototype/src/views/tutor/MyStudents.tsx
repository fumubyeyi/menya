import { useState } from "react";
import { Users, Flame, Calendar } from "lucide-react";
import ProgressRing from "../../components/ProgressRing";
import ScheduleModal from "../../components/ScheduleModal";
import { useAuth } from "../../context/AuthContext";
import {
  getTutorStudents, studentCourseDetail, studentSessionHistory, CURRENT_TUTOR_ID,
} from "../../data";
import { statusMeta, courseColor } from "../../lib/constants";
import { getEnrolledCourses } from "../../hooks/useEnrollment";
import { PageHeaderSubtitle, PageHeaderActions } from "../../context/PageHeaderContext";

export default function MyStudents() {
  const { user } = useAuth();
  const tutorStudents = getTutorStudents(user?.tutorId ?? CURRENT_TUTOR_ID);
  const [modalStudent, setModalStudent] = useState<{ name: string; needsAttention: boolean } | null>(null);

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>
        <span className="font-mono">{tutorStudents.length} students assigned</span>
      </PageHeaderSubtitle>
      <PageHeaderActions>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{tutorStudents.length}</span>
        </div>
      </PageHeaderActions>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {tutorStudents.map((student) => {
          const meta = statusMeta[student.status];
          const needsAttention = student.status === "at-risk" || student.status === "needs-support";
          const enrolled = getEnrolledCourses(student.id, student.courses);
          const courses = (studentCourseDetail[student.id] ?? []).filter((sd) => enrolled.includes(sd.course));
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

              {/* Course progress bars */}
              <div className="space-y-2">
                {courses.map((sub) => (
                  <div key={sub.course}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-mono text-foreground">{sub.course}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">{sub.score}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${sub.score}%`, backgroundColor: courseColor[sub.course] ?? "#5E6B72" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Last session */}
              {lastSession && (
                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Last: {lastSession.course} · {lastSession.date} · {lastSession.score}pts</span>
                </div>
              )}

              {/* Schedule button */}
              {needsAttention ? (
                <button
                  onClick={() => setModalStudent({ name: student.name, needsAttention: true })}
                  className="w-full py-2 border border-amber-300 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-50 transition-colors"
                >
                  Schedule Check-in
                </button>
              ) : (
                <button
                  onClick={() => setModalStudent({ name: student.name, needsAttention: false })}
                  className="w-full py-2 border border-primary/40 text-primary rounded-lg text-xs font-semibold hover:bg-primary/5 transition-colors"
                >
                  Schedule Session
                </button>
              )}
            </div>
          );
        })}
      </div>

      {modalStudent && (
        <ScheduleModal
          defaultStudent={modalStudent.name}
          defaultType={modalStudent.needsAttention ? "check-in" : undefined}
          onClose={() => setModalStudent(null)}
        />
      )}
    </div>
  );
}
