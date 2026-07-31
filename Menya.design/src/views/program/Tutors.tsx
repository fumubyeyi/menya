import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import AddTutorModal from "../../components/AddTutorModal";
import { useTutors } from "../../context/TutorsContext";

export default function Tutors() {
  const { tutors } = useTutors();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const filtered = tutors.filter((t) => `${t.firstName} ${t.lastName}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Tutors</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tutors.length} tutors on the roster</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
          <UserPlus className="w-4 h-4" /> Add Tutor
        </button>
      </div>

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
          {filtered.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={`${t.firstName} ${t.lastName}`} size={10} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">{t.firstName} {t.lastName}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">Grades {Math.min(...t.grades)}–{Math.max(...t.grades)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {t.courses.map((c) => <CourseTag key={c} course={c} />)}
              </div>

              {t.description && <p className="text-xs text-muted-foreground leading-snug">{t.description}</p>}

              <div className="flex gap-3 text-xs text-muted-foreground font-mono mt-auto pt-1">
                <span>{t.students} students</span>
                <span>·</span>
                <span>{t.sessions} sessions</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && <AddTutorModal onClose={() => setAdding(false)} />}
    </div>
  );
}
