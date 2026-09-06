import { Mail, Phone } from "lucide-react";
import PublicHeader from "../../components/PublicHeader";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#F1F4F5]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <PublicHeader />

      <section className="border-y border-[#708090]/35 bg-[#F1F4F5]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12 sm:py-16 grid lg:grid-cols-[1fr_0.8fr] gap-10 lg:gap-16 items-center">
          <div className="max-w-xl">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#708090] mb-3">Start with your workflow</p>
            <h1 className="font-display font-bold text-[#1F2933] text-4xl sm:text-5xl leading-[1.05] mb-5">
              Keep the next student from being missed.
            </h1>
            <p className="text-[#353E43] text-base sm:text-lg leading-relaxed mb-7">
              Tell us how your program tracks tutoring today. We can show you where Menya brings the work together.
            </p>
            <p className="text-sm text-[#353E43]/75 leading-relaxed max-w-md">
              We are especially interested in programs coordinating volunteer tutors, recurring sessions, and student progress across a team.
            </p>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#708090] mb-2">Talk with Menya</p>
              <p className="font-display font-semibold text-foreground">Choose the easiest way to reach us.</p>
            </div>
            <a
              href="mailto:your-email@example.com"
              className="flex items-center gap-3 border border-border rounded-xl p-4 hover:border-[#708090]/60 hover:bg-[#F1F4F5] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#708090]/15 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#2F4F4F]" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground leading-tight">Françoise Umubyeyi</p>
                <p className="text-sm text-muted-foreground">contact@menya.com</p>
              </div>
            </a>
            <a
              href="tel:+10000000000"
              className="flex items-center gap-3 border border-border rounded-xl p-4 hover:border-[#708090]/60 hover:bg-[#F1F4F5] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#708090]/15 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-[#2F4F4F]" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground leading-tight">Phone</p>
                <p className="text-sm text-muted-foreground">(000) 000-0000</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
