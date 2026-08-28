import { Mail, Phone } from "lucide-react";
import PublicHeader from "../../components/PublicHeader";
import GradientBanner from "../../components/GradientBanner";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#F4F3EF]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <PublicHeader />

      <GradientBanner>
        <h1 className="font-display font-bold text-white text-3xl sm:text-4xl leading-tight mb-4">
          Connect with us
        </h1>
        <p className="text-white/60 text-base leading-relaxed">
          Run a tutoring program, or just have a question about Menya? Reach out — we'd love to hear from you.
        </p>
      </GradientBanner>

      {/* Contact card */}
      <div className="max-w-md mx-auto px-6 py-14 flex flex-col gap-4">
        <a
          href="mailto:your-email@example.com"
          className="flex items-center gap-3 bg-white border border-border rounded-2xl p-6 shadow-sm hover:border-primary/40 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground leading-tight">Françoise Umubyeyi</p>
            <p className="text-sm text-muted-foreground">contact@menya.com</p>
          </div>
        </a>
        <a
          href="tel:+10000000000"
          className="flex items-center gap-3 bg-white border border-border rounded-2xl p-6 shadow-sm hover:border-primary/40 transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground leading-tight">Phone</p>
            <p className="text-sm text-muted-foreground">(000) 000-0000</p>
          </div>
        </a>
      </div>
    </div>
  );
}
