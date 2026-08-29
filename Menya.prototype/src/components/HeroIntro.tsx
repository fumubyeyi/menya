// The "Tutoring infrastructure" badge + headline + subtext shown inside
// GradientBanner on both the About and Login pages — kept in one place so
// the pitch stays worded identically everywhere it appears.
export default function HeroIntro() {
  return (
    <>
      <div className="inline-flex items-center gap-1.5 text-white/70 text-xs font-medium bg-white/10 border border-white/15 rounded-full px-3 py-1 mb-5">
        Tutoring infrastructure
      </div>
      <h1 className="font-display font-bold text-white text-3xl sm:text-4xl leading-tight mb-4">
        One shared system of record for nonprofit STEM tutoring.
      </h1>
      <p className="text-white/60 text-base leading-relaxed mb-8">
        Built for tutoring programs supporting underserved K-12 learners, Menya connects students with dedicated tutors, tracks every session, and follows their progress well past graduation.
      </p>
    </>
  );
}
