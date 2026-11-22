import { Link } from "react-router";
import { TrendingUp, Users, Mail } from "lucide-react";
import Avatar from "../../components/Avatar";
import PublicHeader from "../../components/PublicHeader";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../../app/components/ui/carousel";
import { useAlumni } from "../../context/AlumniContext";
import { alumniOutcomeMeta } from "../../lib/constants";

export default function SuccessStories() {
  const { alumni } = useAlumni();

  const stories = alumni.filter((a) => a.isSuccessStory && a.testimonial);
  const stemCount = alumni.filter((a) => alumniOutcomeMeta[a.outcome].isStem).length;
  const stemRate = alumni.length ? Math.round((stemCount / alumni.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F1F4F5]">
      <PublicHeader />

      {/* Stories hero */}
      <section className="border-y border-[#708090]/35 bg-[#F1F4F5]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12 sm:py-16 grid lg:grid-cols-[1fr_0.8fr] gap-10 lg:gap-16 items-center">
          <div className="max-w-xl">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#708090] mb-3">Outcomes worth following</p>
            <h1 className="font-display font-bold text-[#1F2933] text-4xl sm:text-5xl leading-[1.05] mb-5">
              Support that stays with students.
            </h1>
            <p className="text-[#353E43] text-base sm:text-lg leading-relaxed mb-7">
              When sessions, notes, and follow-up stay visible, tutoring programs can help more students keep moving forward.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-[#2F4F4F] text-white px-5 py-2.5 rounded-lg hover:bg-[#2F4F4F]/90 transition-colors">
              <Mail className="w-3.5 h-3.5" />Talk about your program
            </Link>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#708090] mb-5">What Menya helps programs see</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                [String(alumni.length), "Alumni tracked"],
                [`${stemRate}%`, "STEM outcome rate"],
                [String(stories.length), "Featured stories"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-display font-bold text-[#1F2933] text-2xl leading-none">{value}</p>
                  <p className="text-[#353E43]/70 text-xs mt-2 leading-snug">{label}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-6 pt-5 flex items-center gap-2 text-xs text-[#353E43]/75">
              <TrendingUp className="w-4 h-4 text-[#708090]" />
              <span>Progress is easier to understand when the record stays connected.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stories */}
      <div className="max-w-5xl mx-auto px-6 sm:px-16 py-14">
        {stories.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">No success stories flagged yet — check back soon.</p>
        ) : (
          <Carousel opts={{ align: "start" }}>
            <CarouselContent>
              {stories.map((a) => {
                const meta = alumniOutcomeMeta[a.outcome];
                return (
                  <CarouselItem key={a.id} className="sm:basis-1/2">
                    <div className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm h-full">
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
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        )}
      </div>

      {/* Footer callout */}
      <div className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-10 text-center flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
            Want to support students like these?
          </div>
          <Link
            to="/contact"
            className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />Contact Us
          </Link>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{alumni.length} alumni tracked</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />{stemRate}% in STEM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
