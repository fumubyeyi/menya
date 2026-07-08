import { useState, useEffect } from "react";
import {
  Sparkles, ThumbsUp, ThumbsDown, RotateCcw, SendHorizonal,
  FileText, ClipboardList, CheckCircle2,
} from "lucide-react";
import SubjectTag from "../../components/SubjectTag";
import ProgressRing from "../../components/ProgressRing";
import {
  aiProjects, studentSubjectDetail, tutorStudents,
} from "../../data";
import { diffCls, projectStatusCls, projectStatusLabel, subjectColor } from "../../lib/constants";
import type { AIProject } from "../../types";

type Filter = "all" | "pending" | "approved" | "revision" | "rejected";
type Action = "idle" | "approving" | "revising";

export default function Review() {
  const [projects, setProjects] = useState<AIProject[]>(aiProjects);
  const [selectedId, setSelectedId] = useState<number>(aiProjects[0]?.id);
  const [filter, setFilter] = useState<Filter>("all");
  const [action, setAction] = useState<Action>("idle");
  const [dueDate, setDueDate] = useState("");
  const [revisionNote, setRevisionNote] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const visible = projects.filter((p) => filter === "all" || p.status === filter);
  const selected = projects.find((p) => p.id === selectedId) ?? projects[0];

  function handleApprove() {
    setProjects((ps) =>
      ps.map((p) =>
        p.id === selectedId
          ? { ...p, status: "approved", assignedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), dueDate }
          : p
      )
    );
    setAction("idle");
    setToast(`Approved & assigned to ${selected?.student}`);
  }

  function handleRevision() {
    setProjects((ps) =>
      ps.map((p) => p.id === selectedId ? { ...p, status: "revision", tutorNote: revisionNote } : p)
    );
    setAction("idle");
    setToast("Revision feedback sent to AI");
    setRevisionNote("");
  }

  function handleReject() {
    setProjects((ps) => ps.map((p) => p.id === selectedId ? { ...p, status: "rejected" } : p));
    setToast("Assignment rejected");
  }

  const studentObj = selected ? tutorStudents.find((s) => s.name === selected.student) : undefined;
  const subjectDetails = studentObj ? (studentSubjectDetail[studentObj.id] ?? []) : [];

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-display font-semibold text-foreground">AI Curriculum Review</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review AI-generated assignments before assigning to students</p>
      </div>

      <div className="flex gap-5 h-[calc(100vh-180px)]">
        {/* Left panel */}
        <div className="w-72 flex flex-col gap-3 overflow-y-auto flex-shrink-0 scrollbar-hide">
          {/* Stats */}
          <div className="flex gap-2">
            <span className="flex-1 text-center py-1.5 rounded-lg text-xs font-mono bg-amber-100 text-amber-700">
              {projects.filter((p) => p.status === "pending").length} Pending
            </span>
            <span className="flex-1 text-center py-1.5 rounded-lg text-xs font-mono bg-emerald-100 text-emerald-700">
              {projects.filter((p) => p.status === "approved").length} Approved
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            {(["all", "pending", "approved", "revision", "rejected"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Project list */}
          <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hide">
            {visible.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelectedId(p.id); setAction("idle"); }}
                className={`text-left p-3 rounded-xl border transition-all ${selectedId === p.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-1">
                  <SubjectTag subject={p.subject} />
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${projectStatusCls[p.status]}`}>
                    {projectStatusLabel[p.status]}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-2">{p.title}</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-1">{p.student} · {p.generatedAt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        {selected && (
          <div className="flex-1 overflow-y-auto scrollbar-hide bg-card border border-border rounded-xl p-5 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <SubjectTag subject={selected.subject} />
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${projectStatusCls[selected.status]}`}>
                  {projectStatusLabel[selected.status]}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${diffCls[selected.difficulty]}`}>
                  {selected.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                <FileText className="w-3.5 h-3.5" /> ~{selected.estimatedMins}min
              </div>
            </div>

            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">{selected.title}</h2>
              <p className="text-sm text-muted-foreground font-mono mt-0.5">{selected.student} · {selected.module}</p>
            </div>

            {/* AI Note */}
            <div className="flex gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100">
              <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-800">{selected.aiNote}</p>
            </div>

            {/* Revision note */}
            {selected.status === "revision" && selected.tutorNote && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-[11px] font-mono text-blue-500 mb-1">TUTOR FEEDBACK</p>
                <p className="text-sm text-blue-800">{selected.tutorNote}</p>
              </div>
            )}

            {/* Approved banner */}
            {selected.status === "approved" && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="text-sm text-emerald-800">
                  <span className="font-semibold">Approved & assigned to {selected.student}</span>
                  {selected.assignedAt && <span className="font-mono text-emerald-600 ml-2 text-xs">Assigned {selected.assignedAt} · Due {selected.dueDate}</span>}
                </div>
              </div>
            )}

            {/* Task list */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Tasks ({selected.tasks.length})</h3>
              </div>
              <ol className="space-y-2">
                {selected.tasks.map((task, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground">
                    <span className="font-mono text-muted-foreground flex-shrink-0 w-5">{i + 1}.</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Student context */}
            {studentObj && (
              <div className="p-4 bg-muted/30 rounded-xl border border-border">
                <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide mb-3">Student Context</p>
                <div className="flex items-center gap-3 mb-3">
                  <ProgressRing value={studentObj.progress} size={44} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{studentObj.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">Grade {studentObj.grade}</p>
                  </div>
                </div>
                {subjectDetails.map((sd) => (
                  <div key={sd.subject} className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-mono text-foreground">{sd.subject}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">{sd.score}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${sd.score}%`, backgroundColor: subjectColor[sd.subject] ?? "#1B5E4F" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action panel — pending only */}
            {selected.status === "pending" && (
              <div className="border-t border-border pt-4">
                {action === "idle" && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setAction("approving")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4" /> Approve & Assign
                    </button>
                    <button
                      onClick={() => setAction("revising")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Request Revision
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}

                {action === "approving" && (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/25 w-48"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleApprove}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Assign
                      </button>
                      <button onClick={() => setAction("idle")} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {action === "revising" && (
                  <div className="space-y-3">
                    <textarea
                      value={revisionNote}
                      onChange={(e) => setRevisionNote(e.target.value)}
                      placeholder="Describe what needs to change…"
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleRevision}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <SendHorizonal className="w-4 h-4" /> Send Feedback
                      </button>
                      <button onClick={() => setAction("idle")} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-foreground text-background text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
