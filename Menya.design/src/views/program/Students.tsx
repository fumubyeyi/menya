import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, UserPlus, ChevronRight } from "lucide-react";
import Avatar from "../../components/Avatar";
import ProgressRing from "../../components/ProgressRing";
import SubjectTag from "../../components/SubjectTag";
import { students } from "../../data";
import { statusMeta } from "../../lib/constants";
import type { StudentStatus } from "../../types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all",           label: "All Statuses"   },
  { value: "exceeding",     label: "Exceeding"      },
  { value: "on-track",      label: "On Track"       },
  { value: "needs-support", label: "Needs Support"  },
  { value: "at-risk",       label: "At Risk"        },
];

export default function Students() {
  const navigate = useNavigate();
  const [query, setQuery]   = useState("");
  const [status, setStatus] = useState("all");

  const filtered = students.filter((s) => {
    const matchName    = s.name.toLowerCase().includes(query.toLowerCase());
    const matchStatus  = status === "all" || s.status === status;
    return matchName && matchStatus;
  });

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Student Roster</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{students.length} students enrolled</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          <UserPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Search className="w-8 h-8 opacity-40" />
          <p className="text-sm">No students match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s) => {
            const meta = statusMeta[s.status as StudentStatus];
            return (
              <div
                key={s.id}
                onClick={() => navigate(`/program/students/${s.id}`)}
                className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} size={10} />
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Grade {s.grade}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <ProgressRing value={s.progress} size={48} />
                  <div className="space-y-1">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono inline-flex items-center gap-1 ${meta.cls}`}>
                      <meta.Icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                    <p className="text-xs text-muted-foreground">{s.sessions} sessions · {s.streak}d streak</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {s.subjects.map((subj) => <SubjectTag key={subj} subject={subj} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
