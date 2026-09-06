import { CalendarCheck, ClipboardList, TrendingUp } from "lucide-react";

const HERO_SIGNALS = [
  [CalendarCheck, "Visible sessions"],
  [ClipboardList, "Shared notes"],
  [TrendingUp, "Progress tracked"],
] as const;

// Shared problem-led intro for the public pages and sign-in experience.
export default function HeroIntro() {
  return (
    <>
      <div className="text-xs font-mono uppercase tracking-[0.18em] text-primary/70 mb-3">
        For nonprofit tutoring programs
      </div>
      <h1 className="font-display font-bold text-[#1F2933] text-3xl sm:text-4xl leading-tight mb-4">
        Keep every student’s tutoring plan, session, and next step on track.
      </h1>
      <p className="text-[#353E43] text-base leading-relaxed mb-8">
        Menya gives your team one clear place to match students and tutors, track every session, and see who needs follow-up.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
        {HERO_SIGNALS.map(([Icon, label]) => (
          <div key={label} className="flex items-center gap-2 text-xs text-[#353E43]/75">
            <Icon className="w-4 h-4 text-[#708090] flex-shrink-0" />
            <span className="text-xs font-semibold text-[#353E43]">{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
