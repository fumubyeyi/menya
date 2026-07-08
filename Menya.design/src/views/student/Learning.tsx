import { CheckCircle2, Circle } from "lucide-react";
import SubjectTag from "../../components/SubjectTag";
import {
  sofia, studentSubjectDetail, studentModules, curriculum,
} from "../../data";
import { getSubjectIcon, subjectColor } from "../../lib/constants";

const subjectDetails = studentSubjectDetail[sofia.id] ?? [];

export default function Learning() {
  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-semibold text-foreground">Learning</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your subjects, modules, and curriculum progress</p>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {subjectDetails.map((sd) => {
          const color = subjectColor[sd.subject] ?? "#1B5E4F";
          const relatedModules = studentModules.filter((m) => m.subject === sd.subject);

          return (
            <div key={sd.subject} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Colored top bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <span style={{ color }}>{getSubjectIcon(sd.subject)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{sd.subject}</h3>
                      <span className="text-lg font-display font-bold" style={{ color }}>{sd.score}%</span>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">{sd.sessions} sessions · Last: {sd.lastSession}</p>
                  </div>
                </div>

                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full transition-all" style={{ width: `${sd.score}%`, backgroundColor: color }} />
                </div>

                {/* Related modules */}
                {relatedModules.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">Active Modules</p>
                    {relatedModules.map((mod, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/30 border border-border">
                        <div className="flex flex-col gap-1 mt-0.5">
                          {Array.from({ length: Math.min(mod.totalModules, 5) }).map((_, idx) => (
                            idx < mod.currentModule
                              ? <CheckCircle2 key={idx} className="w-3.5 h-3.5 text-emerald-500" />
                              : <Circle key={idx} className="w-3.5 h-3.5 text-muted-foreground" />
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{mod.title}</p>
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            Module {mod.currentModule}/{mod.totalModules} · {mod.completion}% complete
                          </p>
                          <div className="h-1 bg-muted rounded-full overflow-hidden mt-1.5">
                            <div className="h-full rounded-full" style={{ width: `${mod.completion}%`, backgroundColor: color }} />
                          </div>
                        </div>
                        {mod.active && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono flex-shrink-0">Active</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Curriculum */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">All Curriculum</h2>
        <div className="divide-y divide-border">
          {curriculum
            .filter((c) => sofia.subjects.includes(c.subject))
            .map((c) => {
              const color = subjectColor[c.subject] ?? "#1B5E4F";
              return (
                <div key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <span style={{ color }}>{getSubjectIcon(c.subject)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <SubjectTag subject={c.subject} />
                      <span className="text-[10px] font-mono text-muted-foreground">{c.modules} modules</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-32">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.completion}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground w-7 text-right">{c.completion}%</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
