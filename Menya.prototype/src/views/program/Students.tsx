import { Fragment, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search, UserPlus, ChevronRight, ChevronDown, Upload } from "lucide-react";
import Avatar from "../../components/Avatar";
import ProgressRing from "../../components/ProgressRing";
import AddStudentModal from "../../components/AddStudentModal";
import ImportModal, { type ImportColumn } from "../../components/ImportModal";
import { useStudents } from "../../context/StudentsContext";
import { useCurriculum } from "../../context/CurriculumContext";
import { useAuth } from "../../context/AuthContext";
import { statusMeta, courseCompletion, studentStatus } from "../../lib/constants";
import { getEnrolledCourses } from "../../hooks/useEnrollment";
import type { Student, StudentStatus } from "../../types";
import { PageHeaderSubtitle, PageHeaderActions } from "../../context/PageHeaderContext";

interface StudentImportRow {
  name: string;
  grade: number;
  location: string;
  courses: string[];
}

const splitList = (raw: string) => raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);

const STUDENT_IMPORT_COLUMNS: ImportColumn<StudentImportRow>[] = [
  { key: "name", label: "Name", required: true, aliases: ["full name", "student name", "student"] },
  { key: "grade", label: "Grade", required: true, aliases: ["grade level"], parse: (raw) => Number(raw) },
  { key: "location", label: "Location", required: true, aliases: ["city", "city, state"] },
  { key: "courses", label: "Courses", required: true, aliases: ["course", "enrolled courses"], parse: splitList },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all",           label: "All Statuses"   },
  { value: "exceeding",     label: "Exceeding"      },
  { value: "on-track",      label: "On Track"       },
  { value: "needs-support", label: "Needs Support"  },
  { value: "at-risk",       label: "At Risk"        },
];

export default function Students() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = !!user?.isAdmin;
  const { students, addStudents } = useStudents();
  const { courses } = useCurriculum();
  const [query, setQuery]   = useState("");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  // Accordion, not independent toggles — only one student's course table is
  // open at a time, starting with the first row so the page doesn't open
  // fully collapsed.
  const [expandedId, setExpandedId] = useState<number | null>(() => students[0]?.id ?? null);
  const toggleStudent = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Status lives in the URL (?status=at-risk) rather than local state so links
  // from elsewhere (e.g. the Program Dashboard's outcome pie chart) can land
  // here pre-filtered, and the filter survives back/forward navigation.
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const status = STATUS_OPTIONS.some((o) => o.value === statusParam) ? statusParam! : "all";
  const setStatus = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "all") next.delete("status");
      else next.set("status", value);
      return next;
    });
  };

  const filtered = students.filter((s) => {
    const matchName    = s.name.toLowerCase().includes(query.toLowerCase());
    const matchStatus  = status === "all" || s.status === status;
    return matchName && matchStatus;
  });


  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>{students.length} students enrolled</PageHeaderSubtitle>
      <PageHeaderActions>
        <button onClick={() => setImporting(true)}
          className="flex items-center gap-2 border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors">
          <Upload className="w-4 h-4" />
          Import from Excel
        </button>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          <UserPlus className="w-4 h-4" />
          Add Student
        </button>
      </PageHeaderActions>

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

      {/* Roster, grouped by student — each row expands to the courses that
          student is enrolled in. The chevron toggles that; clicking the rest
          of the row still opens the student's profile, same as before. */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Search className="w-8 h-8 opacity-40" />
          <p className="text-sm">No students match your filters.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px] table-fixed">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col />
            </colgroup>
            <thead>
              <tr className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide bg-muted/40 border-b border-border">
                <th className="text-left py-2 pl-4 pr-2">Student</th>
                <th className="text-left py-2 px-2">Grade</th>
                <th className="text-left py-2 px-2">Status</th>
                <th className="text-left py-2 px-2">Progress</th>
                <th className="text-left py-2 px-2 whitespace-nowrap">Activity</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s: Student) => {
                const meta = statusMeta[s.status as StudentStatus];
                const isCollapsed = expandedId !== s.id;
                const enrolledCourses = getEnrolledCourses(s.id, s.courses);
                return (
                  <Fragment key={s.id}>
                    <tr
                      onClick={() => navigate(`/program/students/${s.id}`)}
                      className="cursor-pointer hover:bg-muted/30 transition-colors group"
                    >
                      <td className="py-2 pl-2 pr-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleStudent(s.id); }}
                            className="p-0.5 rounded hover:bg-muted flex-shrink-0"
                          >
                            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                          </button>
                          <Avatar name={s.name} size={8} />
                          <span className="font-medium text-foreground">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">{s.grade}</td>
                      <td className="py-2 px-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono inline-flex items-center gap-1 ${meta.cls}`}>
                          <meta.Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <ProgressRing value={s.progress} size={32} />
                      </td>
                      <td className="py-2 px-2 text-xs text-muted-foreground font-mono whitespace-nowrap">{s.sessions} sessions · {s.streak}d streak</td>
                      <td className="py-2 pr-4">
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                    {!isCollapsed && (
                      <tr className="bg-muted/10">
                        <td colSpan={6} className="pl-11 pr-4 py-2">
                          <table className="w-full text-xs table-fixed">
                            <colgroup>
                              <col className="w-1/2" />
                              <col className="w-1/2" />
                            </colgroup>
                            <thead>
                              <tr className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                                <th className="text-left font-normal py-1 pr-2 whitespace-nowrap">Enrolled Course</th>
                                <th className="text-left font-normal py-1">Completion Rate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {enrolledCourses.map((course) => {
                                const pct = courseCompletion(courses, course);
                                return (
                                  <tr key={course} className="border-t border-border/60">
                                    <td className="py-1.5 pr-2 text-foreground font-mono whitespace-nowrap">{course}</td>
                                    <td className="py-1.5">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#708090" }} />
                                        </div>
                                        <span className="text-muted-foreground font-mono tabular-nums w-8 text-right shrink-0">{pct}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {adding && <AddStudentModal onClose={() => setAdding(false)} />}
      {importing && (
        <ImportModal<StudentImportRow>
          title="Import Students"
          entityLabelSingular="student"
          entityLabelPlural="students"
          columns={STUDENT_IMPORT_COLUMNS}
          onImport={(rows) => addStudents(rows.map((r) => ({ ...r, status: studentStatus(0) })))}
          onClose={() => setImporting(false)}
        />
      )}
    </div>
  );
}
