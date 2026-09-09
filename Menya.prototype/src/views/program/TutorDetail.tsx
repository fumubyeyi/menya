import { useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarClock, Clock, GraduationCap } from "lucide-react";
import CourseTag from "../../components/CourseTag";
import ProfileBanner from "../../components/ProfileBanner";
import EditTutorForm from "../../components/EditTutorForm";
import { useTutors } from "../../context/TutorsContext";
import { useSessions } from "../../context/SessionsContext";

export default function TutorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tutors } = useTutors();
  const { sessions } = useSessions();

  const tutor = tutors.find((t) => t.id === Number(id));
  if (!tutor) return (
    <div className="p-6 text-muted-foreground">Tutor not found.</div>
  );

  const upcoming = sessions
    .filter((s) => s.tutorId === tutor.id)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  const preferredDays = tutor.preferredDays ?? [];

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tutors
      </button>

      {/* Hero Banner */}
      <ProfileBanner
        name={`${tutor.firstName} ${tutor.lastName}`}
        subtitle={tutor.profession}
        actions={
          <>
            <span className="text-sm font-mono font-medium text-[#353E43] bg-white/70 border border-[#708090]/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Gr {Math.min(...tutor.grades)}–{Math.max(...tutor.grades)}
            </span>
            <span className="text-sm font-mono font-medium text-[#353E43] bg-white/70 border border-[#708090]/30 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5" />
              {preferredDays.length > 0 ? `Prefers: ${preferredDays.join(", ")}` : "No day preference set"}
            </span>
          </>
        }
      />

      {/* Editing the tutor is the primary task on this page; upcoming
          sessions is reference info alongside it. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2">
          <EditTutorForm tutor={tutor} onCancel={() => navigate(-1)} onSaved={() => navigate(-1)} />
        </div>

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
