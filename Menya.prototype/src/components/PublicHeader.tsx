import { Link, useNavigate } from "react-router";
import { Atom, LogIn } from "lucide-react";

// Shared header for every unauthenticated page (Login, About, Success Stories) —
// previously each one duplicated its own version of this, so editing one (like
// adding the About link) meant the others quietly drifted out of sync. The
// authenticated app (AppShell) has its own header for logged-in context
// (page title, notifications) — this one is specifically the public/marketing shell.
export default function PublicHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between gap-3 flex-wrap px-4 sm:px-10 py-4 sm:py-5">
      <Link to="/about" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#1B5E4F] flex items-center justify-center flex-shrink-0">
          <Atom className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-foreground text-lg">MENYA</span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          About
        </Link>
        <Link to="/success-stories" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          Alumni Stories
        </Link>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground border border-border px-4 py-2 rounded-lg hover:bg-white transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />Staff Sign In
        </button>
      </div>
    </header>
  );
}
