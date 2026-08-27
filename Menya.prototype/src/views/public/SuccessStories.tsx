import { Sparkles, TrendingUp, Users } from "lucide-react";
import Avatar from "../../components/Avatar";
import PublicHeader from "../../components/PublicHeader";
import { useAlumni } from "../../context/AlumniContext";
import { alumniOutcomeMeta } from "../../lib/constants";

export default function SuccessStories() {
  const { alumni } = useAlumni();

  const stories = alumni.filter((a) => a.isSuccessStory && a.testimonial);
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
            Real Students. Real Outcomes.
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-10">
            Menya connects students to STEM tutoring and follows them well past graduation — here's where some of our alumni landed, in their own words.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              [String(alumni.length), "Alumni Tracked"],
              [`${stemRate}%`, "STEM Outcome Rate"],
              [String(stories.length), "Featured Stories"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-display font-bold text-white text-2xl leading-none">{v}</p>
                <p className="text-white/50 text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-14">
        {stories.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">No success stories flagged yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {stories.map((a) => {
              const meta = alumniOutcomeMeta[a.outcome];
              return (
                <div key={a.id} className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.name} size={11} />
                    <div>
                      <p className="font-display font-semibold text-foreground leading-tight">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.location}</p>
                    </div>
                    <span className={`ml-auto text-[11px] px-2.5 py-1 rounded-full font-mono inline-flex items-center gap-1 ${meta.cls}`}>
                      <meta.Icon className="w-3 h-3" />{meta.label}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 italic leading-relaxed flex-1">&ldquo;{a.testimonial}&rdquo;</p>
                  {(a.institution || a.fieldOfStudy) && (
                    <p className="text-xs text-muted-foreground border-t border-border pt-3">
                      {a.institution}{a.institution && a.fieldOfStudy ? " · " : ""}{a.fieldOfStudy}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer callout */}
      <div className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-10 text-center flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />Want to support students like these?
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{alumni.length} alumni tracked</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />{stemRate}% in STEM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
