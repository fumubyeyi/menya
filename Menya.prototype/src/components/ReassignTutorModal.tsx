import { X, CheckCircle2 } from "lucide-react";
import { students } from "../data";
import { scoreTutorMatch } from "../lib/constants";
import { useTutors } from "../context/TutorsContext";
import { useSessions } from "../context/SessionsContext";
import Avatar from "./Avatar";
import type { Session } from "../types";

interface Props {
  session: Session;
  onClose: () => void;
}

export default function ReassignTutorModal({ session, onClose }: Props) {
  const { tutors } = useTutors();
  const { updateSession } = useSessions();
  const studentRecord = students.find((s) => s.name === session.student);
  const sortedTutors = [...tutors].sort(
    (a, b) => scoreTutorMatch(b, session.course, studentRecord?.grade) - scoreTutorMatch(a, session.course, studentRecord?.grade)
  );

  const assign = (tutorId: number) => {
    updateSession({ ...session, tutorId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">Reassign Tutor</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">
              {session.student} · {session.course}{studentRecord ? ` · Grade ${studentRecord.grade}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-2.5 scrollbar-hide">
          {sortedTutors.map((t) => {
            const score = scoreTutorMatch(t, session.course, studentRecord?.grade);
            const current = t.id === session.tutorId;
            return (
              <button key={t.id} type="button" onClick={() => assign(t.id)} disabled={current}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-colors ${current ? "border-primary bg-primary/5 cursor-default" : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"}`}>
                <Avatar name={`${t.firstName} ${t.lastName}`} size={9} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t.firstName} {t.lastName}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    {score === 3 && <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">Best match · course + grade</span>}
                    {score === 2 && <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Course match</span>}
                    {score === 1 && <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Grade match</span>}
                  </div>
                </div>
                {current ? (
                  <span className="text-[10px] font-mono text-primary flex items-center gap-1 flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />Current
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">Assign</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
