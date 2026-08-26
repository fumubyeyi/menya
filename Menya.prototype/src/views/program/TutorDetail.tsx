import { useNavigate, useParams } from "react-router";
import { ArrowLeft, BookOpen, CalendarClock, Clock, GraduationCap } from "lucide-react";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import { useTutors } from "../../context/TutorsContext";
import { useSessions } from "../../context/SessionsContext";
import { useRecurringSlots } from "../../context/RecurringSlotsContext";
import { formatTime12h, gradesSummary } from "../../lib/constants";
import { WEEKDAYS } from "./RecurringSlotModal";

export default function TutorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tutors } = useTutors();
  const { sessions } = useSessions();
  const { recurringSlots } = useRecurringSlots();

  const tutor = tutors.find((t) => t.id === Number(id));
  if (!tutor) return (
    <div className="p-6 text-muted-foreground">Tutor not found.</div>
  );

  const upcoming = sessions
    .filter((s) => s.tutorId === tutor.id)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  const slots = WEEKDAYS
    .flatMap((day) => recurringSlots.filter((s) => s.day === day && s.tutorIds.includes(tutor.id)))
    .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) || a.time.localeCompare(b.time));

  const preferredDays = tutor.preferredDays ?? [];

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tutors
      </button>

      {/* Hero Banner */}
      <div className="rounded-xl overflow-hidden border border-border" style={{ background: "linear-gradient(135deg, #1B5E4F 0%, #0d3b2e 100%)" }}>
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar name={`${tutor.firstName} ${tutor.lastName}`} size={16} />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-white">{tutor.firstName} {tutor.lastName}</h1>
            <p className="text-sm text-white/60 mt-0.5">Grades {Math.min(...tutor.grades)}–{Math.max(...tutor.grades)}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tutor.courses.map((c) => (
                <span key={c} className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-white/15 text-white">{c}</span>
              ))}
            </div>
          </div>
          <span className="text-xs font-mono text-white/70 bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5" />
            {preferredDays.length > 0 ? `Prefers: ${preferredDays.join(", ")}` : "No day preference set"}
          </span>
        </div>

        {/* Stat pillars */}
        <div className="grid grid-cols-2 border-t border-white/10">
          {[
            { label: "Sessions", value: tutor.sessions, Icon: BookOpen },
            { label: "Grade Range", value: `Gr ${Math.min(...tutor.grades)}–${Math.max(...tutor.grades)}`, Icon: GraduationCap },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="flex flex-col items-center py-4 gap-1 border-r border-white/10 last:border-r-0">
              <Icon className="w-4 h-4 text-white/50" />
              <p className="text-xl font-display font-bold text-white">{value}</p>
              <p className="text-[11px] text-white/50 font-mono">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {tutor.description && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-2">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{tutor.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recurring Slots */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary" /> Recurring Slots
          </h2>
          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recurring slots assigned.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <span key={slot.id} className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-muted text-foreground border border-border">
                  {slot.day} · {gradesSummary(slot.grades)} · {formatTime12h(slot.time)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Upcoming Sessions ({upcoming.length})</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions scheduled.</p>
          ) : (
            <div className="divide-y divide-border">
              {upcoming.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5 py-2 first:pt-0 last:pb-0 text-xs">
                  <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground truncate flex-1 min-w-0">{s.student}</span>
                  <CourseTag course={s.course} />
                  <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{s.time} · {s.clock}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
