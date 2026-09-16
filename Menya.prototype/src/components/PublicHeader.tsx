import { Link, useNavigate } from "react-router";
import { LogIn, ChevronDown, UserCheck, GraduationCap } from "lucide-react";
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

  return (
    <header className="flex items-center justify-between gap-3 flex-wrap px-4 sm:px-10 py-4 sm:py-5">
      <Link to="/about" className="flex items-center gap-2">
        <img src="/logo.svg" alt="" className="w-11 h-11 flex-shrink-0" />
        <span className="font-display font-bold text-foreground text-2xl leading-none">Menya</span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
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
    </header>
  );
}
