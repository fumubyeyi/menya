import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import Avatar from "../../components/Avatar";
import SubjectTag from "../../components/SubjectTag";
import SessionStatusPill from "../../components/SessionStatusPill";
import ScheduleModal from "../../components/ScheduleModal";
import { sessions, tutors } from "../../data";

const FILTER_TABS = [
  { key: "all",       label: "All"       },
  { key: "today",     label: "Today"     },
  { key: "live",      label: "Live"      },
  { key: "scheduled", label: "Scheduled" },
];

export default function Sessions() {
  const [tab,   setTab]   = useState("all");
  const [modal, setModal] = useState(false);

  const filtered = sessions.filter((s) => {
    if (tab === "all")       return true;
    if (tab === "today")     return s.time === "Today";
    if (tab === "live")      return s.status === "in-progress";
    if (tab === "scheduled") return s.status === "scheduled";
    return true;
  });

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Sessions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{sessions.length} total sessions</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <CalendarPlus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-border">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
              tab === key
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sessions Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Student", "Subject", "Tutor", "Date", "Time", "Duration", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.student} size={7} />
                      <span className="font-medium text-foreground whitespace-nowrap">{s.student}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><SubjectTag subject={s.subject} /></td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{s.tutor}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.time}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.clock}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.duration}min</td>
                  <td className="px-4 py-3"><SessionStatusPill status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">No sessions match this filter.</div>
          )}
        </div>
      </div>

      {/* Tutor Cards */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Active Tutors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {tutors.map((t) => (
            <div key={t.name} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={t.name} size={9} />
                <p className="text-sm font-semibold text-foreground leading-tight">{t.name}</p>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {t.subjects.map((s) => <SubjectTag key={s} subject={s} />)}
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground font-mono">
                <span>{t.students} students</span>
                <span>·</span>
                <span>{t.sessions} sessions</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && <ScheduleModal onClose={() => setModal(false)} />}
    </div>
  );
}
