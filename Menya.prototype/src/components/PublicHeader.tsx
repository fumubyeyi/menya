import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LogIn, ChevronDown, UserCheck, GraduationCap, Menu, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../app/components/ui/dropdown-menu";
import { GRADE_GROUPS, gradeGroupId } from "../lib/constants";

// Demo grade band the kiosks always have a live session for (see SessionsContext's
// demoTodaySessions) — lets this link work for anyone opening it cold, without first
// needing a real session published for today.
const DEMO_STUDENT_KIOSK_HREF = `/kiosk/students/grade/${gradeGroupId(GRADE_GROUPS[GRADE_GROUPS.length - 1])}`;

// Shared header for every unauthenticated page (Login, About, Success Stories) —
// previously each one duplicated its own version of this, so editing one (like
// adding the About link) meant the others quietly drifted out of sync. The
// authenticated app (AppShell) has its own header for logged-in context
// (page title, notifications) — this one is specifically the public/marketing shell.
export default function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  // Below md the links collapse behind a hamburger, mirroring AppShell's mobile
  // drawer — four inline items plus the Sign In button used to wrap onto a second
  // row and crowd the logo on a phone.
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navigating away (including to the same route from a different link) should
  // always leave the menu closed.
  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const mobileLinkClass = "flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors";

  return (
    <header className="relative z-30 flex items-center justify-between gap-3 px-4 sm:px-10 py-4 sm:py-5">
      <Link to="/about" className="flex items-center gap-2">
        <img src="/logo.svg" alt="" className="w-11 h-11 flex-shrink-0" />
        <span className="font-brand font-bold text-foreground text-2xl leading-none">Menya</span>
      </Link>

      {/* Desktop / tablet nav */}
      <div className="hidden md:flex items-center gap-3 sm:gap-4 flex-wrap">
        <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          About
        </Link>
        <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
          Contact
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors">
              Check-In<ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/kiosk/tutors" className="cursor-pointer">
                <UserCheck />Tutor Check-In
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={DEMO_STUDENT_KIOSK_HREF} className="cursor-pointer">
                <GraduationCap />Student Check-In
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground border border-border px-4 py-2 rounded-lg hover:bg-white transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />Sign In
        </button>
      </div>

      {/* Phone nav */}
      <button
        onClick={() => setMobileOpen((open) => !open)}
        className="md:hidden flex-shrink-0 p-2 -mr-2 text-foreground hover:text-primary transition-colors"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setMobileOpen(false)} />
          <nav className="md:hidden absolute top-full left-4 right-4 z-30 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
            <Link to="/about" className={mobileLinkClass}>About</Link>
            <Link to="/contact" className={mobileLinkClass}>Contact</Link>
            <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Check-In
            </div>
            <Link to="/kiosk/tutors" className={mobileLinkClass}>
              <UserCheck className="w-4 h-4 flex-shrink-0" />Tutor Check-In
            </Link>
            <Link to={DEMO_STUDENT_KIOSK_HREF} className={mobileLinkClass}>
              <GraduationCap className="w-4 h-4 flex-shrink-0" />Student Check-In
            </Link>
            <div className="border-t border-border p-3">
              <button
                onClick={() => { setMobileOpen(false); navigate("/login"); }}
                className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-foreground border border-border px-4 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />Sign In
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
