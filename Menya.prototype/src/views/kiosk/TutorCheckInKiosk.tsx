import { CheckCircle2 } from "lucide-react";
import Avatar from "../../components/Avatar";
import CourseTag from "../../components/CourseTag";
import Eyebrow from "../../components/Eyebrow";
import KioskBackdrop from "../../components/KioskBackdrop";
import { useSessions } from "../../context/SessionsContext";
import { useTutors } from "../../context/TutorsContext";
import { useKioskCheckIn } from "../../hooks/useKioskCheckIn";
import { getTutorById } from "../../data";
import { sessionGroupLabel, localISODate } from "../../lib/constants";
import { bySessionStart } from "../../lib/sessionOrder";

// Shared front-desk kiosk — one per site, not per group. Tutors tap in here when
// they arrive on site; each group then has its own kiosk (StudentCheckInKiosk) for
// students to self check-in once their tutor is confirmed present.
export default function TutorCheckInKiosk() {
  const { sessions } = useSessions();
  const { tutors } = useTutors();
  const { recordFor, tutorCheckIn } = useKioskCheckIn();

  const todayISO = localISODate();
  const todaysInPerson = sessions
    .filter((s) => s.location === "in-person" && s.date === todayISO)
    .sort(bySessionStart);

  return (
    <KioskBackdrop>
      <div className="max-w-2xl w-full">
        <header className="text-center mb-10">
          <Eyebrow size="lg">Welcome</Eyebrow>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground">Front Desk Check-In</h1>
          <p className="text-muted-foreground text-sm mt-1.5">Tutors — tap your session below when you arrive on site.</p>
        </header>

        <div className="space-y-3">
          {todaysInPerson.length === 0 ? (
            <p className="text-center text-muted-foreground py-16 border border-dashed border-border rounded-2xl bg-white/50">
              No in-person sessions scheduled today.
            </p>
          ) : (
            todaysInPerson.map((session) => {
              const tutor = getTutorById(tutors, session.tutorId);
              const checkedIn = !!recordFor(session)?.tutorCheckedInAt;
              return (
                <div key={session.id} className="bg-white border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar name={tutor ? `${tutor.firstName} ${tutor.lastName}` : "?"} size={11} />
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-lg text-foreground truncate">
                        {tutor ? `${tutor.firstName} ${tutor.lastName}` : "Unassigned tutor"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <CourseTag course={session.course} />
                        <span className="text-xs text-muted-foreground">{sessionGroupLabel(session)}</span>
                        <span className="text-xs text-muted-foreground font-mono">{session.clock}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => tutorCheckIn(session)}
                    disabled={checkedIn}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors flex-shrink-0 ${
                      checkedIn
                        ? "bg-emerald-50 text-emerald-700 cursor-default"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                    }`}
                  >
                    {checkedIn ? <CheckCircle2 className="w-4 h-4" /> : null}
                    {checkedIn ? "Checked in" : "Check In"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </KioskBackdrop>
  );
}
