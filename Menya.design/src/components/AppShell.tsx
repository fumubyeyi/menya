import { useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, Users, BookOpen, Calendar, BarChart3,
  Bell, Plus, Menu, X, Settings, Atom, Trophy,
  Briefcase, UserCheck, GraduationCap, ClipboardList, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { aiProjects } from "../data";
import type { Role } from "../types";

const NAV: Record<Role, { to: string; label: string; Icon: React.ElementType; badge?: number }[]> = {
  program: [
    { to: "/program/dashboard",  label: "Dashboard",  Icon: LayoutDashboard },
    { to: "/program/students",   label: "Students",   Icon: Users           },
    { to: "/program/curriculum", label: "Curriculum", Icon: BookOpen        },
    { to: "/program/sessions",   label: "Sessions",   Icon: Calendar        },
    { to: "/program/analytics",  label: "Analytics",  Icon: BarChart3       },
  ],
  tutor: [
    { to: "/tutor/home",        label: "My Home",     Icon: LayoutDashboard },
    { to: "/tutor/students",    label: "My Students", Icon: Users           },
    { to: "/tutor/schedule",    label: "My Schedule", Icon: Calendar        },
    { to: "/tutor/review",      label: "Review",      Icon: ClipboardList, badge: aiProjects.filter((p) => p.status === "pending").length },
    { to: "/tutor/performance", label: "Performance", Icon: BarChart3       },
  ],
  student: [
    { to: "/student/home",     label: "My Home",     Icon: LayoutDashboard },
    { to: "/student/learning", label: "My Subjects", Icon: BookOpen        },
    { to: "/student/schedule", label: "My Schedule", Icon: Calendar        },
    { to: "/student/goals",    label: "Goals",       Icon: Trophy          },
  ],
};

const ROLE_META: Record<Role, { Icon: React.ElementType; tagline: string }> = {
  program: { Icon: Briefcase,     tagline: "Program Director" },
  tutor:   { Icon: UserCheck,     tagline: "Tutor" },
  student: { Icon: GraduationCap, tagline: "Student" },
};

const STATS: Record<Role, [string, string][]> = {
  program: [["84","sessions"],["247","students"],["73%","avg"]],
  tutor:   [["20","students"],["25","sessions"]],
  student: [["91%","score"],["8d","streak"],["15","sessions"]],
};

export default function AppShell({ onSchedule }: { onSchedule?: (student?: string) => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role;
  const nav = NAV[role];
  const meta = ROLE_META[role];
  const stats = STATS[role];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const titleMap: Record<string, string> = {
    "/program/dashboard":  "Dashboard",
    "/program/students":   "Students",
    "/program/curriculum": "Curriculum",
    "/program/sessions":   "Sessions",
    "/program/analytics":  "Analytics",
    "/tutor/home":         "My Home",
    "/tutor/students":     "My Students",
    "/tutor/schedule":     "My Schedule",
    "/tutor/review":       "Review",
    "/tutor/performance":  "Performance",
    "/student/home":       "My Home",
    "/student/learning":   "My Subjects",
    "/student/schedule":   "My Schedule",
    "/student/goals":      "Goals",
  };

  const basePath = "/" + location.pathname.split("/").slice(1, 3).join("/");
  const pageTitle = titleMap[basePath] ?? "Dashboard";

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "Manrope, sans-serif" }}>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-30 inset-y-0 left-0 flex flex-col w-60 flex-shrink-0 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ backgroundColor: "var(--sidebar)" }}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b flex items-center justify-between" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Atom className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-base leading-none">StemBridge</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <meta.Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="text-[11px] font-mono text-white/70">{meta.tagline}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, Icon, badge }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`
              }>
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-accent" : ""}`} />
                  {label}
                  {badge && badge > 0 && !isActive
                    ? <span className="ml-auto bg-accent text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">{badge}</span>
                    : isActive ? <div className="ml-auto w-1 h-1 rounded-full bg-accent" /> : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Stats widget */}
        <div className="px-4 py-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="rounded-lg p-3" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <p className="text-[9px] font-mono text-white/40 mb-2 uppercase tracking-widest">
              {role === "program" ? "This Month" : role === "tutor" ? "My Stats" : "My Progress"}
            </p>
            <div className="flex justify-between font-mono">
              {stats.map(([v, l]) => (
                <div key={l} className="text-center">
                  <p className="font-bold text-base leading-none text-white">{v}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User footer */}
        <div className="px-4 py-3 border-t flex items-center gap-3" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: "rgba(240,152,30,0.35)" }}>
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] font-mono text-white/40">{meta.tagline}</p>
          </div>
          <button onClick={handleLogout} title="Sign out"
            className="text-white/30 hover:text-white/70 cursor-pointer transition-colors flex-shrink-0">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-5 lg:px-6 py-4 bg-background border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-semibold text-foreground text-lg leading-none">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
            </button>
            {role !== "student" && onSchedule && (
              <button onClick={() => onSchedule()}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                {role === "tutor" ? "Schedule" : "Quick Add"}
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-5 lg:px-6 py-5 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
