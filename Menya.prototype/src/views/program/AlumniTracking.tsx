import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Search, GraduationCap, TrendingUp, AlertTriangle, Pencil, ExternalLink, Download, BadgeCheck, Sparkles, HeartHandshake, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Avatar from "../../components/Avatar";
import EditAlumniModal from "../../components/EditAlumniModal";
import { students } from "../../data";
import { useAlumni } from "../../context/AlumniContext";
import { alumniOutcomeMeta, followUpStatusMeta, exitReasonMeta, verificationMeta } from "../../lib/constants";
import type { AlumniRecord, ExitReason, AlumniOutcome, FollowUpStatus } from "../../types";
import { PageHeaderSubtitle } from "../../context/PageHeaderContext";

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

// Right-side nav targets for the Insights tab — the Directory tab is a single
// view (filters + table) and doesn't need in-page navigation.
const SECTIONS: { id: string; label: string }[] = [
  { id: "overview",   label: "Overview"     },
  { id: "engagement", label: "Engagement"   },
  { id: "cohort",     label: "Cohort Trend" },
  { id: "outcomes",   label: "Outcomes"     },
];

type Tab = "insights" | "directory";

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function AlumniTracking() {
  const navigate = useNavigate();
  const { alumni, updateAlumnus } = useAlumni();
  const [query, setQuery]     = useState("");
  const [exit, setExit]       = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [followUp, setFollowUp] = useState("all");
  const [editing, setEditing] = useState<AlumniRecord | null>(null);
  // Tab lives in the URL (?view=directory) so it's linkable and back-button aware —
  // switched via <Link>, not a button-driven state toggle.
  const [searchParams] = useSearchParams();
  const tab: Tab = searchParams.get("view") === "directory" ? "directory" : "insights";
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  // Scrollspy for the right-side page nav — highlights whichever section is
  // currently near the top of the scroll area as the user moves through the page.
  // Re-runs on tab change since the Insights sections only mount on that tab.
  useEffect(() => {
    if (tab !== "insights") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tab]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

  const successStoryCount = alumni.filter((a) => a.isSuccessStory).length;
  const mentorCount = alumni.filter((a) => a.openToMentoring).length;

  // Full outcome distribution — the cohort chart above only shows the binary STEM
  // split, this shows where every alumnus actually landed, category by category.
  const outcomeBreakdown = useMemo(() => {
    return (Object.keys(alumniOutcomeMeta) as AlumniOutcome[]).map((o) => ({
      outcome: alumniOutcomeMeta[o].label,
      count: alumni.filter((a) => a.outcome === o).length,
    })).filter((row) => row.count > 0);
  }, [alumni]);

  // Where alumni actually end up — useful for spotting partner institutions/employers worth deepening ties with.
  const topInstitutions = useMemo(() => {
    const counts = new Map<string, number>();
    alumni.forEach((a) => {
      if (!a.institution) return;
      counts.set(a.institution, (counts.get(a.institution) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([institution, count]) => ({ institution, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [alumni]);

  const handleSave = (updated: AlumniRecord) => {
    updateAlumnus(updated);
    setEditing(null);
  };

  const exportCsv = () => {
    const headers = ["Name", "Exit Reason", "Exit Year", "HS Graduated", "Outcome", "Verification", "Institution", "Field", "Last Contact", "Follow-up", "Staff", "Final Progress", "Email", "Phone", "LinkedIn", "Success Story", "Open to Mentor", "Notes"];
    const rows = filtered.map((a) => {
      const student = a.studentId ? students.find((s) => s.id === a.studentId) : undefined;
      return [
        a.name, exitReasonMeta[a.exitReason].label, a.exitYear, a.hsGraduated ? "Yes" : "No",
        alumniOutcomeMeta[a.outcome].label, verificationMeta[a.verification].label,
        a.institution ?? "", a.fieldOfStudy ?? "", a.lastContact, followUpStatusMeta[a.followUpStatus].label,
        a.assignedStaff, student ? `${student.progress}%` : "",
        a.email ?? "", a.phone ?? "", a.linkedIn ?? "", a.isSuccessStory ? "Yes" : "No", a.openToMentoring ? "Yes" : "No",
        a.notes ?? "",
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
    <div className="p-6 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>
        {alumni.length} alumni tracked · students who completed or left the program, followed up on their path after high school
      </PageHeaderSubtitle>

      {/* Tabs — navigation, not state: each is a link to ?view=… */}
      <nav className="flex gap-1 border-b border-border mb-5">
        {([["insights", "Insights"], ["directory", "Directory"]] as [Tab, string][]).map(([value, label]) => (
          <Link
            key={value}
            to={`?view=${value}`}
            replace
            aria-current={tab === value ? "page" : undefined}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors -mb-px border-b-2 ${
              tab === value
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {tab === "insights" && (
      <div className="flex gap-8 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-5">

      {/* Summary stats */}
      <div id="overview" className="scroll-mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <p className="text-xs text-muted-foreground mt-0.5">avg program progress, linked roster records only</p>
        </div>
      </div>

      {/* Success stories & mentorship stats */}
      <div id="engagement" className="scroll-mt-4 grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
            <GraduationCap className="w-4 h-4" />
            <span className="text-xs font-mono">Success Stories</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{successStoryCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">flagged for spotlighting to funders & prospective families</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
            <HeartHandshake className="w-4 h-4" />
            <span className="text-xs font-mono">Open to Mentor</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{mentorCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">alumni willing to mentor current students</p>
        </div>
      </div>

      {/* Cohort trend chart */}
      <div id="cohort" className="scroll-mt-4 bg-card border border-border rounded-xl p-4">
        <h2 className="text-sm font-semibold text-foreground mb-1">STEM Outcome Rate by Exit Cohort</h2>
        <p className="text-xs text-muted-foreground mb-4">Share of each cohort in a STEM major or career, so progress across years is visible — not just the current snapshot.</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={cohortTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }}
              formatter={(value: number, _name, item) => [`${value}% (${item.payload.count} alumni)`, "STEM Rate"]}
            />
            <Bar dataKey="stemRate" fill="#2F4F4F" radius={[4, 4, 0, 0]} name="STEM Rate" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div id="outcomes" className="scroll-mt-4 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Full outcome breakdown */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-1">Outcome Breakdown</h2>
          <p className="text-xs text-muted-foreground mb-4">Where every alumnus landed, not just the STEM/non-STEM split above.</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={outcomeBreakdown} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="outcome" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" }} />
              <Bar dataKey="count" fill="#2F4F4F" radius={[0, 4, 4, 0]} name="Alumni" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top institutions & employers */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5"><Building2 className="w-4 h-4" />Top Institutions & Employers</h2>
          <p className="text-xs text-muted-foreground mb-4">Where alumni most often land — worth deepening ties with.</p>
          {topInstitutions.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No institutions or employers on record yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topInstitutions.map((row, i) => (
                <div key={row.institution} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm text-foreground flex-1 truncate">{row.institution}</span>
                  <span className="text-xs font-mono text-muted-foreground">{row.count} alum{row.count > 1 ? "ni" : "nus"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </div>

        {/* Right-side page nav */}
        <nav className="hidden xl:block w-52 flex-shrink-0 sticky top-4 self-start bg-card border border-border rounded-xl p-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 pb-2 mb-2 border-b border-border">On this page</p>
          <div className="flex flex-col gap-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`text-left text-sm px-3 py-1.5 rounded-lg border-l-2 transition-colors ${
                  activeSection === s.id
                    ? "border-primary text-primary font-medium bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
      )}

      {tab === "directory" && (
      <div className="space-y-5">
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
        <button onClick={exportCsv} className="flex items-center gap-2 border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
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
                        <div
                          onClick={() => navigate(`/program/alumni/${a.id}`)}
                          className="flex items-center gap-2.5 cursor-pointer group/name w-fit"
                        >
                          <Avatar name={a.name} size={8} />
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-tight group-hover/name:text-primary transition-colors">
                              {a.name}
                              {a.isSuccessStory && <Sparkles className="inline w-3 h-3 ml-1 mb-0.5 text-amber-500" />}
                            </p>
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
