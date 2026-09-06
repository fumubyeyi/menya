import { useState, useEffect } from "react";
import {
  Sparkles, ThumbsUp, ThumbsDown, SendHorizonal, Search as SearchIcon,
  AlertTriangle, ClipboardList, CheckCircle2, Info,
} from "lucide-react";
import CourseTag from "../../components/CourseTag";
import { ModuleContentBody } from "../../components/ContentDrawer";
import { useAuth } from "../../context/AuthContext";
import { useCurriculum } from "../../context/CurriculumContext";
import { useLibrarySearch } from "../../hooks/useLibrarySearch";
import { getTutorStudents, CURRENT_TUTOR_ID, libraryQueries } from "../../data";
import { diffCls, searchCurriculumLibrary, matchStrengthMeta, searchDecisionCls, searchDecisionLabel } from "../../lib/constants";
import type { LibrarySearchQuery, SearchDecision } from "../../types";

type Filter = "all" | SearchDecision;

// First/last name pieces of the tutor's own roster — used to nudge a tutor away
// from typing a specific student's name into the search box, per the doc's
// no-identifying-data guidance (Curriculum Library Tutor Search Feature.md, §4–5).
function rosterNameInPrompt(prompt: string, rosterNames: string[]): string | undefined {
  const words = rosterNames.flatMap((n) => n.split(" ")).filter((w) => w.length > 2);
  return words.find((w) => new RegExp(`\\b${w}\\b`, "i").test(prompt));
}

export default function Search() {
  const { user } = useAuth();
  const tutorId = user?.tutorId ?? CURRENT_TUTOR_ID;
  const tutorStudents = getTutorStudents(tutorId);
  const rosterNames = tutorStudents.map((s) => s.name);
  const { courses } = useCurriculum();
  const { queries, addQuery, decideQuery } = useLibrarySearch(tutorId, libraryQueries);

  const [prompt, setPrompt] = useState("");
  const [selectedId, setSelectedId] = useState<number | undefined>(queries[0]?.id);
  const [filter, setFilter] = useState<Filter>("all");
  const [rejecting, setRejecting] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const flaggedName = rosterNameInPrompt(prompt, rosterNames);
  const visible = queries.filter((q) => filter === "all" || q.decision === filter);
  const selected = queries.find((q) => q.id === selectedId);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || flaggedName) return;
    const result = searchCurriculumLibrary(courses, prompt.trim());
    const query: LibrarySearchQuery = {
      id: Date.now(),
      tutorId,
      promptText: prompt.trim(),
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      decision: "pending",
      result,
    };
    addQuery(query);
    setSelectedId(query.id);
    setPrompt("");
    setRejecting(false);
  }

  function handleApprove() {
    if (!selected) return;
    decideQuery(selected.id, "approved");
    setToast("Approved — ready to use live with the student.");
  }

  function handleReject() {
    if (!selected) return;
    decideQuery(selected.id, "rejected", rejectNote.trim() || undefined);
    setRejecting(false);
    setRejectNote("");
    setToast(selected.result.matchStrength !== "strong" ? "Rejected — logged as a potential library gap for program review." : "Rejected — logged for review.");
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
        <p>Search by grade level and topic or learning gap. Review and approve content before using it live with a student, and do not include student names.</p>
      </div>

      <div className="flex gap-5 h-[calc(100vh-180px)]">
        {/* Left panel */}
        <div className="w-72 flex flex-col gap-3 overflow-y-auto flex-shrink-0 scrollbar-hide">
          <div className="flex gap-2">
            <span className="flex-1 text-center py-1.5 rounded-lg text-xs font-mono bg-emerald-100 text-emerald-700">
              {queries.filter((q) => q.decision === "approved").length} Approved
            </span>
            <span className="flex-1 text-center py-1.5 rounded-lg text-xs font-mono bg-red-100 text-red-700">
              {queries.filter((q) => q.decision === "rejected").length} Rejected
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["all", "pending", "approved", "rejected"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hide">
            {visible.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No searches yet — ask below.</p>
            )}
            {visible.map((q) => (
              <button
                key={q.id}
                onClick={() => { setSelectedId(q.id); setRejecting(false); }}
                className={`text-left p-3 rounded-xl border transition-all ${selectedId === q.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${matchStrengthMeta[q.result.matchStrength].cls}`}>
                    {matchStrengthMeta[q.result.matchStrength].label}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${searchDecisionCls[q.decision]}`}>
                    {searchDecisionLabel[q.decision]}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-2">{q.promptText}</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-1">{q.createdAt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-4">
          {/* Compose box */}
          <form onSubmit={handleSearch} className="bg-card border border-border rounded-xl p-4 space-y-2.5 flex-shrink-0">
            <label className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
              <SearchIcon className="w-3.5 h-3.5" /> Ask the library
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "7th grader, struggling with negative exponents, needs a warm-up before we practice"'
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
            />
            {flaggedName ? (
              <p className="flex items-center gap-1.5 text-xs text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                This looks like it names a specific student ("{flaggedName}") — describe the grade level and topic instead.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!prompt.trim() || !!flaggedName}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <SearchIcon className="w-4 h-4" /> Search Library
            </button>
          </form>

          {/* Result */}
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 border border-dashed border-border rounded-xl">
              <ClipboardList className="w-8 h-8 opacity-40" />
              <p className="text-sm">Search above, or pick a past query on the left.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5 space-y-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${matchStrengthMeta[selected.result.matchStrength].cls}`}>
                    {matchStrengthMeta[selected.result.matchStrength].label}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${searchDecisionCls[selected.decision]}`}>
                    {searchDecisionLabel[selected.decision]}
                  </span>
                  {selected.result.difficulty && (
                    <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${diffCls[selected.result.difficulty]}`}>
                      {selected.result.difficulty}
                    </span>
                  )}
                </div>
              </div>

              <div>
                {selected.result.course ? (
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <CourseTag course={selected.result.course} />
                    <span className="text-sm text-muted-foreground">› {selected.result.chapterTitle} › {selected.result.moduleTitle}</span>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-foreground mb-1">No matching library topic</p>
                )}
                <p className="text-sm text-muted-foreground font-mono">"{selected.promptText}"</p>
              </div>

              <div className="flex gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100">
                <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-800">{selected.result.aiNote}</p>
              </div>

              {selected.decision === "rejected" && selected.rejectNote && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-[11px] font-mono text-blue-500 mb-1">REJECTION NOTE</p>
                  <p className="text-sm text-blue-800">{selected.rejectNote}</p>
                </div>
              )}

              {selected.decision === "approved" && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm text-emerald-800 font-semibold">Approved — ready to use live with the student</p>
                </div>
              )}

              <ModuleContentBody
                workspace={{
                  description: selected.result.description,
                  content: selected.result.content.length ? selected.result.content : [selected.result.description],
                  workedExample: selected.result.workedExample,
                  isAuthored: true,
                }}
              />

              {selected.result.exercises.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Practice Questions ({selected.result.exercises.length})</h3>
                  <ol className="space-y-3">
                    {selected.result.exercises.map((ex, i) => (
                      <li key={i} className="flex gap-3 text-sm text-foreground">
                        <span className="font-mono text-muted-foreground flex-shrink-0 w-5">{i + 1}.</span>
                        <div className="flex-1 space-y-1.5">
                          <p>{ex.prompt}</p>
                          <div className="rounded-lg bg-muted/50 border border-border px-3 py-2">
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Answer</p>
                            <p className="text-sm text-foreground leading-relaxed">{ex.answer}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Action panel — pending only */}
              {selected.decision === "pending" && (
                <div className="border-t border-border pt-4">
                  {!rejecting ? (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={handleApprove}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => setRejecting(true)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Optional — why doesn't this work? (helps program staff spot the gap)"
                        rows={2}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleReject}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                        >
                          <SendHorizonal className="w-4 h-4" /> Confirm Reject
                        </button>
                        <button onClick={() => setRejecting(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
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
      </div>

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-foreground text-background text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
