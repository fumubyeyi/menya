import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, UserPlus, CalendarRange, Clock, Upload } from "lucide-react";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import AddTutorModal from "../../components/AddTutorModal";
import ImportModal, { type ImportColumn } from "../../components/ImportModal";
import { useTutors } from "../../context/TutorsContext";
import { useSessions } from "../../context/SessionsContext";
import { useRecurringSlots } from "../../context/RecurringSlotsContext";
import { PageHeaderSubtitle, PageHeaderActions } from "../../context/PageHeaderContext";

// Mon-first ordering for a tutor's recurring days, so "Mon, Wed" never renders "Wed, Mon".
const WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Today/Tomorrow first, then everything else in the order it appears — the Session
// model only stores display labels ("Today"/"Tomorrow"/"Jun 22"), not sortable dates.
function dayRank(time: string): number {
  if (time === "Today") return 0;
  if (time === "Tomorrow") return 1;
  return 2;
}

interface TutorImportRow {
  firstName: string;
  lastName: string;
  courses: string[];
  grades: number[];
  description: string;
}

const splitList = (raw: string) => raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);

const TUTOR_IMPORT_COLUMNS: ImportColumn<TutorImportRow>[] = [
  { key: "firstName", label: "First Name", required: true, aliases: ["first"] },
  { key: "lastName", label: "Last Name", required: true, aliases: ["last"] },
  { key: "courses", label: "Courses", required: true, aliases: ["preferred courses", "course"], parse: splitList },
  { key: "grades", label: "Grades", required: true, aliases: ["preferred grades", "grade levels", "grade"], parse: (raw) => splitList(raw).map(Number).filter((n) => !Number.isNaN(n)) },
  { key: "description", label: "Description", aliases: ["bio", "notes"] },
];

export default function Tutors() {
  const navigate = useNavigate();
  const { tutors, addTutors } = useTutors();
  const { sessions } = useSessions();
  const { recurringSlots } = useRecurringSlots();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);

  const filtered = tutors.filter((t) => `${t.firstName} ${t.lastName}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <PageHeaderSubtitle>{tutors.length} tutors on the roster</PageHeaderSubtitle>
      <PageHeaderActions>
        <button onClick={() => setImporting(true)}
          className="flex items-center gap-2 border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors">
          <Upload className="w-4 h-4" /> Import from Excel
        </button>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          <UserPlus className="w-4 h-4" /> Add Tutor
        </button>
      </PageHeaderActions>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tutors…"
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <Search className="w-8 h-8 opacity-40" />
          <p className="text-sm">No tutors match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => {
            const upcoming = sessions.filter((s) => s.tutorId === t.id).sort((a, b) => dayRank(a.time) - dayRank(b.time));
            // Preferred days = the recurring weekly slots this tutor is actually
            // assigned to on Program > Schedule, deduped and ordered Mon-first.
            const preferredDays = Array.from(
              new Set(recurringSlots.filter((s) => s.tutorIds.includes(t.id)).map((s) => s.day))
            ).sort((a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b));
            return (
              <div key={t.id} onClick={() => navigate(`/program/tutors/${t.id}`)}
                className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar name={`${t.firstName} ${t.lastName}`} size={10} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight truncate">{t.firstName} {t.lastName}</p>
                    <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <CalendarRange className="w-3 h-3 flex-shrink-0" />
                      {preferredDays.length > 0 ? preferredDays.map((d) => d.slice(0, 3)).join(", ") : "No preferred days"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground">Grades {Math.min(...t.grades)}–{Math.max(...t.grades)}</span>
                  <span className="text-border">·</span>
                  {t.courses.map((c) => <CourseTag key={c} course={c} />)}
                </div>

                {t.description && <p className="text-xs text-muted-foreground leading-snug">{t.description}</p>}

              </div>
            );
          })}
        </div>
      )}

      {adding && <AddTutorModal onClose={() => setAdding(false)} />}
      {importing && (
        <ImportModal<TutorImportRow>
          title="Import Tutors"
          entityLabelSingular="tutor"
          entityLabelPlural="tutors"
          columns={TUTOR_IMPORT_COLUMNS}
          onImport={(rows) => addTutors(rows.map((r) => ({ ...r, description: r.description ?? "" })))}
          onClose={() => setImporting(false)}
        />
      )}
    </div>
  );
}
