import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, GraduationCap, TrendingUp, AlertTriangle, Pencil, ExternalLink, Download, BadgeCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Avatar from "../../components/Avatar";
import EditAlumniModal from "../../components/EditAlumniModal";
import { alumni as initialAlumni, students } from "../../data";
import { alumniOutcomeMeta, followUpStatusMeta, exitReasonMeta, verificationMeta } from "../../lib/constants";
import type { AlumniRecord, ExitReason, AlumniOutcome, FollowUpStatus } from "../../types";

const EXIT_OPTIONS: { value: string; label: string }[] = [
  { value: "all",           label: "All Exits"           },
  { value: "graduated",     label: "Completed Program"   },
  { value: "left-program",  label: "Left Program"        },
];

const OUTCOME_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Outcomes" },
  ...(Object.keys(alumniOutcomeMeta) as AlumniOutcome[]).map((o) => ({ value: o, label: alumniOutcomeMeta[o].label })),
];

const FOLLOWUP_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Follow-ups" },
  ...(Object.keys(followUpStatusMeta) as FollowUpStatus[]).map((f) => ({ value: f, label: followUpStatusMeta[f].label })),
];

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function AlumniTracking() {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState<AlumniRecord[]>(initialAlumni);
  const [query, setQuery]     = useState("");
  const [exit, setExit]       = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [followUp, setFollowUp] = useState("all");
  const [editing, setEditing] = useState<AlumniRecord | null>(null);

  const filtered = alumni.filter((a) => {
    const matchName     = a.name.toLowerCase().includes(query.toLowerCase());
    const matchExit     = exit === "all" || a.exitReason === exit;
    const matchOutcome  = outcome === "all" || a.outcome === outcome;
    const matchFollowUp = followUp === "all" || a.followUpStatus === followUp;
    return matchName && matchExit && matchOutcome && matchFollowUp;
  });

  const stemCount = alumni.filter((a) => alumniOutcomeMeta[a.outcome].isStem).length;
  const stemRate = alumni.length ? Math.round((stemCount / alumni.length) * 100) : 0;
  const overdueCount = alumni.filter((a) => a.followUpStatus === "overdue").length;
  const verifiedCount = alumni.filter((a) => a.verification === "verified").length;

  // STEM outcome rate by exit cohort — the program-impact view funders care about:
  // is the STEM rate trending up across cohorts, not just where it stands today.
  const cohortTrend = useMemo(() => {
    const years = Array.from(new Set(alumni.map((a) => a.exitYear))).sort();
    return years.map((year) => {
      const cohort = alumni.filter((a) => a.exitYear === year);
      const stem = cohort.filter((a) => alumniOutcomeMeta[a.outcome].isStem).length;
      return { year: String(year), stemRate: Math.round((stem / cohort.length) * 100), count: cohort.length };
    });
  }, [alumni]);

  // Cross-reference outcomes with how each alumnus actually performed in the program,
  // pulling their final progress straight from the live student roster.
  const programLinked = useMemo(
    () => alumni.flatMap((a) => {
      const student = a.studentId ? students.find((s) => s.id === a.studentId) : undefined;
      return student ? [{ alumnus: a, student }] : [];
    }),
    [alumni]
  );
  const avgProgress = (rows: typeof programLinked) =>
    rows.length ? Math.round(rows.reduce((sum, r) => sum + r.student.progress, 0) / rows.length) : null;
  const stemAvgProgress = avgProgress(programLinked.filter((r) => alumniOutcomeMeta[r.alumnus.outcome].isStem));
  const otherAvgProgress = avgProgress(programLinked.filter((r) => !alumniOutcomeMeta[r.alumnus.outcome].isStem));

  const handleSave = (updated: AlumniRecord) => {
    setAlumni((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditing(null);
  };

  const exportCsv = () => {
    const headers = ["Name", "Exit Reason", "Exit Year", "HS Graduated", "Outcome", "Verification", "Institution", "Field", "Last Contact", "Follow-up", "Staff", "Final Progress", "Notes"];
    const rows = filtered.map((a) => {
      const student = a.studentId ? students.find((s) => s.id === a.studentId) : undefined;
      return [
        a.name, exitReasonMeta[a.exitReason].label, a.exitYear, a.hsGraduated ? "Yes" : "No",
        alumniOutcomeMeta[a.outcome].label, verificationMeta[a.verification].label,
        a.institution ?? "", a.fieldOfStudy ?? "", a.lastContact, followUpStatusMeta[a.followUpStatus].label,
        a.assignedStaff, student ? `${student.progress}%` : "", a.notes ?? "",
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alumni-tracking-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Alumni Tracking</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {alumni.length} alumni tracked · students who completed or left the program, followed up on their path after high school
          </p>
        </div>
        <button onClick={exportCsv} className="flex items-center gap-2 border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-mono">STEM Outcome Rate</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{stemRate}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">{stemCount} of {alumni.length} in a STEM major or career</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
            <BadgeCheck className="w-4 h-4" />
            <span className="text-xs font-mono">Verified Outcomes</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{verifiedCount}/{alumni.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">confirmed via transcript or employer, not self-reported</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-mono">Follow-ups Overdue</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{overdueCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">need a check-in call or email</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
            <GraduationCap className="w-4 h-4" />
            <span className="text-xs font-mono">Final Progress: STEM vs Other</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {stemAvgProgress ?? "—"}% <span className="text-muted-foreground text-base font-normal">vs</span> {otherAvgProgress ?? "—"}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">avg program score, linked roster records only</p>
        </div>
      </div>

      {/* Cohort trend chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-1">STEM Outcome Rate by Exit Cohort</h2>
        <p className="text-xs text-muted-foreground mb-4">Share of each cohort in a STEM major or career, so progress across years is visible — not just the current snapshot.</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={cohortTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e5e7eb" }}
              formatter={(value: number, _name, item) => [`${value}% (${item.payload.count} alumni)`, "STEM Rate"]}
            />
            <Bar dataKey="stemRate" fill="#1B5E4F" radius={[4, 4, 0, 0]} name="STEM Rate" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alumni…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select value={exit} onChange={(e) => setExit(e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
          {EXIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={outcome} onChange={(e) => setOutcome(e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
          {OUTCOME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={followUp} onChange={(e) => setFollowUp(e.target.value)}
          className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
          {FOLLOWUP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Search className="w-8 h-8 opacity-40" />
          <p className="text-sm">No alumni match your filters.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Exit</th>
                  <th className="px-4 py-3 font-medium">Outcome</th>
                  <th className="px-4 py-3 font-medium">Institution / Field</th>
                  <th className="px-4 py-3 font-medium">Last Contact</th>
                  <th className="px-4 py-3 font-medium">Follow-up</th>
                  <th className="px-4 py-3 font-medium">Staff</th>
                  <th className="px-4 py-3 font-medium text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((a) => {
                  const outcomeMeta = alumniOutcomeMeta[a.outcome];
                  const followUpMeta = followUpStatusMeta[a.followUpStatus];
                  const exitMeta = exitReasonMeta[a.exitReason as ExitReason];
                  const vMeta = verificationMeta[a.verification];
                  const student = a.studentId ? students.find((s) => s.id === a.studentId) : undefined;
                  return (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={a.name} size={8} />
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-tight">{a.name}</p>
                            <p className="text-xs text-muted-foreground">Grade {a.lastGrade} · {a.location}</p>
                            {student && <p className="text-[10px] font-mono text-primary mt-0.5">Final: {student.progress}% · {student.sessions} sessions</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono inline-block ${exitMeta.cls}`}>{exitMeta.label}</span>
                        <p className="text-[10px] text-muted-foreground mt-1">{a.exitYear}{a.hsGraduated ? " · HS grad" : ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono inline-flex items-center gap-1 ${outcomeMeta.cls}`}>
                          <outcomeMeta.Icon className="w-3 h-3" />
                          {outcomeMeta.label}
                        </span>
                        <div className="mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono inline-flex items-center gap-1 ${vMeta.cls}`}>
                            <vMeta.Icon className="w-2.5 h-2.5" />{vMeta.label}
                          </span>
                          {a.checkIns.length > 0 && <span className="text-[10px] text-muted-foreground ml-1.5">{a.checkIns.length} check-in{a.checkIns.length > 1 ? "s" : ""}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {a.institution ? (
                          <>
                            <p className="text-sm text-foreground leading-tight">{a.institution}</p>
                            {a.fieldOfStudy && <p className="text-xs text-muted-foreground">{a.fieldOfStudy}</p>}
                          </>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{a.lastContact}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono inline-flex items-center gap-1 ${followUpMeta.cls}`}>
                          <followUpMeta.Icon className="w-3 h-3" />
                          {followUpMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{a.assignedStaff}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditing(a)} title="Edit alumni record"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {a.studentId && (
                          <button onClick={() => navigate(`/program/students/${a.studentId}`)} title="View original student profile"
                            className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <EditAlumniModal
          alumnus={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
