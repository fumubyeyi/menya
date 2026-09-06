import { Link } from "react-router";
import {
  GraduationCap,
  HeartHandshake,
  Mail,
  UserCheck,
  LayoutDashboard,
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import PublicHeader from "../../components/PublicHeader";
import Avatar from "../../components/Avatar";
import { useAlumni } from "../../context/AlumniContext";
import { alumniOutcomeMeta } from "../../lib/constants";

const KEY_FEATURES = [
  {
    Icon: GraduationCap,
    role: "Students",
    img: "/preview-student.png",
    caption: "The student home — progress, streaks, and today's focus.",
    tags: ["Course progress tracking", "Personal schedule", "Tutor-approved homework", "Badges & practice streaks"],
  },
  {
    Icon: UserCheck,
    role: "Tutors",
    img: "/preview-tutor.png",
    caption: "The tutor home — caseload, sessions, and assignment review.",
    tags: ["Caseload visibility", "Full session history", "Personal scheduling", "AI-assisted assignments (with sign-off)"],
  },
  {
    Icon: LayoutDashboard,
    role: "Programs",
    img: "/preview-program.png",
    caption: "The program dashboard — students, sessions, and outcomes.",
    tags: [
      "Org-wide dashboard",
      "Student roster & status",
      "AI-assisted curriculum library",
      "Analytics for funder reporting",
      "Alumni tracking",
    ],
  },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary/70 mb-3">{children}</p>
  );
}

function BrowserFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-[#F1F4F5]">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
        <span className="w-2.5 h-2.5 rounded-full bg-accent/50" />
        <span className="w-2.5 h-2.5 rounded-full bg-primary/40" />
        <span className="ml-3 text-[11px] text-muted-foreground font-mono">app.menya.org/program/dashboard</span>
      </div>
      <img src={src} alt={alt} className="w-full block" />
    </div>
  );
}

export default function About() {
  const { alumni } = useAlumni();
  const featuredStory = alumni.find((a) => a.isSuccessStory && a.testimonial);

  return (
    <div className="min-h-screen bg-[#F1F4F5]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <PublicHeader />

      {/* About hero */}
      <section className="border-y border-[#708090]/35 bg-[#F1F4F5]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12 sm:py-16 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
          <div className="max-w-xl">
            <Eyebrow>For nonprofit tutoring programs</Eyebrow>
            <h1 className="font-display font-bold text-[#1F2933] text-4xl sm:text-5xl leading-[1.05] mb-5">
              Keep every student’s tutoring plan, session, and next step on track.
            </h1>
            <p className="text-[#353E43] text-base sm:text-lg leading-relaxed mb-7">
              Menya brings students, tutors, sessions, and progress into one clear system so your team knows what happened and what needs attention next.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/contact"
                className="flex items-center gap-1.5 text-sm font-medium bg-[#2F4F4F] text-white px-5 py-2.5 rounded-lg hover:bg-[#2F4F4F]/90 transition-colors">
                Request a pilot<ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/success-stories"
                className="flex items-center gap-1.5 text-sm font-medium text-[#353E43] border border-[#708090]/55 px-5 py-2.5 rounded-lg hover:bg-white/50 transition-colors">
                <GraduationCap className="w-3.5 h-3.5" />Meet our alumni
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
              {[
                [CalendarCheck, "Visible sessions"],
                [ClipboardCheck, "Shared notes"],
                [TrendingUp, "Progress tracked"],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-2 text-xs text-[#353E43]/75">
                  <Icon className="w-4 h-4 text-[#708090] flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <BrowserFrame src="/preview-program.png" alt="Menya program director dashboard" />
            <p className="text-xs text-muted-foreground mt-3">
              The program director's view — every student, session, and outcome in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
          <div>
            <p className="text-2xl font-display font-bold text-[#353E43]">One place</p>
            <p className="text-xs text-muted-foreground mt-1">for students, tutors, sessions, and outcomes</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-[#353E43]">Every session</p>
            <p className="text-xs text-muted-foreground mt-1">captured with notes and next steps</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-[#353E43]">Longitudinal</p>
            <p className="text-xs text-muted-foreground mt-1">support that follows students beyond tutoring</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-20 text-center">
        <Eyebrow>Our mission</Eyebrow>
        <h3 className="font-display font-semibold text-foreground text-2xl sm:text-3xl leading-snug mb-4">
          STEM subjects are some of the biggest gatekeepers to opportunity.
        </h3>
        <p className="text-foreground/70 text-base sm:text-md leading-relaxed">
          Too many underserved students never get the consistent, personalized help they need to get through them. Menya exists to close that gap: giving tutoring programs the tools to match students with tutors who stick with them, keep every session on record, and make sure that support never quietly lapses.
        </p>
      </div>

      {/* How it works — a tailored view per role */}
      <div className="bg-white border-y border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 text-center">
          <Eyebrow>How it works</Eyebrow>
          <h3 className="font-display font-semibold text-foreground text-2xl sm:text-3xl mb-3">One shared system, a tailored view for everyone</h3>
          <p className="text-foreground/60 text-sm sm:text-base max-w-2xl mx-auto mb-12">
            Scheduling, curriculum, progress, and outcomes all live in one place — with the right tools surfaced for each person who logs in.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {KEY_FEATURES.map(({ Icon, role, img, caption, tags }) => (
              <div key={role} className="bg-[#F4F3EF] border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="bg-white border-b border-border p-4">
                  <img
                    src={img}
                    alt={`Menya ${role.toLowerCase()} view`}
                    className="w-full rounded-lg border border-border aspect-[16/10] object-cover object-top"
                  />
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <p className="font-display font-semibold text-foreground text-sm">{role}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{caption}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-foreground/70 bg-white border border-border rounded-full px-2.5 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured story */}
      {featuredStory && (
        <div className="bg-white border-y border-border">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-20 text-center">
            <Eyebrow>In their words</Eyebrow>
            <p className="font-display text-foreground text-xl sm:text-2xl leading-relaxed mb-6">
              &ldquo;{featuredStory.testimonial}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-3">
              <Avatar name={featuredStory.name} size={11} />
              <div className="text-left">
                <p className="text-sm font-display font-semibold text-foreground">{featuredStory.name}</p>
                <p className="text-xs text-muted-foreground">
                  {alumniOutcomeMeta[featuredStory.outcome].label}
                  {featuredStory.institution ? ` · ${featuredStory.institution}` : ""}
                </p>
              </div>
            </div>
            <Link
              to="/success-stories"
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 mt-6">
              <GraduationCap className="w-3 h-3" />Read more alumni stories
            </Link>
          </div>
        </div>
      )}

      {/* Get involved */}
      <div className="max-w-3xl mx-auto px-6 py-20 text-center flex flex-col items-center gap-4">
        <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
          <HeartHandshake className="w-4 h-4" />For Tutoring Programs
        </div>
        <h3 className="font-display font-semibold text-foreground text-2xl sm:text-1xl leading-snug">
          Run a tutoring program supporting underserved students?
        </h3>
        <p className="text-foreground/70 text-sm sm:text-base max-w-md leading-relaxed">
          Menya gives your team the tools to schedule sessions, track attendance and notes, and follow outcomes well past graduation. The pilot is no-cost and low-lift.
        </p>
        <Link
          to="/contact"
          className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors mt-1">
          <Mail className="w-3.5 h-3.5" />Request a pilot
        </Link>
      </div>
    </div>
  );
}
