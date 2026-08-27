import { Link } from "react-router";
import { Sparkles, Users, TrendingUp, ClipboardCheck, GraduationCap, HeartHandshake } from "lucide-react";
import PublicHeader from "../../components/PublicHeader";
import { useAlumni } from "../../context/AlumniContext";
import { useStudents } from "../../context/StudentsContext";
import { useTutors } from "../../context/TutorsContext";
import { alumniOutcomeMeta } from "../../lib/constants";

const HOW_IT_WORKS = [
  {
    Icon: Users,
    title: "Small-Group & 1:1 Tutoring",
    body: "Students meet in-person in small groups organized by grade band, or work one-on-one online with a dedicated tutor — whichever fits their course and schedule.",
  },
  {
    Icon: ClipboardCheck,
    title: "Consistency, Tracked",
    body: "Every session — attendance, notes, and progress — is logged, so no student falls through the cracks between one tutor and the next.",
  },
  {
    Icon: GraduationCap,
    title: "Built Around Real Coursework",
    body: "Tutoring is tied directly to what students are studying in school — Algebra through Calculus — with curriculum tutors can pull from session to session.",
  },
  {
    Icon: TrendingUp,
    title: "Outcomes, Followed Long-Term",
    body: "We don't stop tracking a student at graduation — we follow alumni into college and career to see whether the support actually changed their trajectory.",
  },
];

export default function About() {
  const { alumni } = useAlumni();
  const { students } = useStudents();
  const { tutors } = useTutors();

  const stemCount = alumni.filter((a) => alumniOutcomeMeta[a.outcome].isStem).length;
  const stemRate = alumni.length ? Math.round((stemCount / alumni.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F4F3EF]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <PublicHeader />

      {/* Hero */}
      <div
        className="mx-4 sm:mx-10 rounded-2xl overflow-hidden relative"
        style={{ background: "linear-gradient(160deg, #1B5E4F 0%, #0d3b30 60%, #0a2d24 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #4ADE80 0%, transparent 60%), radial-gradient(circle at 80% 80%, #F0981E 0%, transparent 50%)" }}
        />
        <div className="relative z-10 px-6 sm:px-12 py-14 sm:py-16 text-center max-w-3xl mx-auto">
          <h1 className="font-display font-bold text-white text-3xl sm:text-4xl leading-tight mb-4">
            Build learners' confidence toward STEM pathways.
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            Built for tutoring programs supporting underserved K-12 learners, Menya connects students with dedicated tutors, tracks every session, and follows their progress well past graduation.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-14 text-center">
        <h2 className="font-display font-semibold text-foreground text-xl mb-3">Our Mission</h2>
        <p className="text-foreground/70 text-base leading-relaxed">
          Math is one of the biggest gatekeepers to STEM opportunity — and one of the subjects underserved students are least likely to get consistent, personalized help with. Menya exists to close that gap: giving tutoring programs the tools to match students with dedicated tutors, keep every session on record, and make sure that support never quietly lapses.
        </p>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-6">
        <h2 className="font-display font-semibold text-foreground text-xl text-center mb-8">How Menya Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {HOW_IT_WORKS.map(({ Icon, title, body }) => (
            <div key={title} className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <p className="font-display font-semibold text-foreground text-sm">{title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* By the numbers */}
      <div className="mx-4 sm:mx-10 my-14 bg-[#1B5E4F] rounded-2xl px-6 sm:px-12 py-10">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
          {[
            [String(students.length), "Students Served"],
            [String(tutors.length), "Active Tutors"],
            [`${stemRate}%`, "Alumni in STEM"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="font-display font-bold text-white text-2xl sm:text-3xl leading-none">{v}</p>
              <p className="text-white/60 text-xs mt-1.5">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Get involved */}
      <div className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center flex flex-col items-center gap-4">
          <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
            <HeartHandshake className="w-4 h-4" />For Tutoring Programs
          </div>
          <p className="text-foreground/70 text-sm max-w-md leading-relaxed">
            Run a tutoring program supporting underserved students? Menya gives your team the tools to schedule sessions, track attendance and notes, and follow outcomes well past graduation — reach out to see if it's a fit.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/success-stories" className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />See alumni success stories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
