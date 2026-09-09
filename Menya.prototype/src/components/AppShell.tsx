import { useMemo, useState } from "react";
import { NavLink, Outlet, Navigate, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, Users, BookOpen, Calendar,
  Bell, Plus, Menu, X, Trophy,
  Search, LogOut, Moon, Sun,
  Award, AlertTriangle, UserCog, CalendarRange, ExternalLink, Settings2, UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTutors } from "../context/TutorsContext";
import { useScheduleNotices } from "../context/ScheduleNoticesContext";
import { getAtRiskAlertsForTutor, CURRENT_TUTOR_ID } from "../data";
import { statusMeta } from "../lib/constants";
import Avatar from "./Avatar";
import ScheduleModal from "./ScheduleModal";
import { PageHeaderContext } from "../context/PageHeaderContext";
import type { Role } from "../types";

const NAV: Record<Role, { to: string; label: string; Icon: React.ElementType; badge?: number }[]> = {
  program: [
    { to: "/program/dashboard",  label: "Dashboard",  Icon: LayoutDashboard },
    { to: "/program/students",   label: "Students",   Icon: Users           },
    { to: "/program/curriculum", label: "Curriculum", Icon: BookOpen        },
    { to: "/program/sessions",   label: "Attendance", Icon: Calendar },
    { to: "/program/schedule",   label: "Schedule",   Icon: CalendarRange   },
    { to: "/program/tutors",     label: "Tutors",     Icon: UserCog         },
    { to: "/program/alumni",     label: "Alumni",     Icon: Award           },
  ],
  tutor: [
    { to: "/tutor/home",        label: "My Home",     Icon: LayoutDashboard },
    { to: "/tutor/schedule",    label: "Schedule",    Icon: CalendarRange   },
    { to: "/tutor/attendance",  label: "Attendance",  Icon: Calendar        },
    { to: "/tutor/search",      label: "Curriculum Search", Icon: Search },
  ],
  student: [
    { to: "/student/home",     label: "My Home",     Icon: LayoutDashboard },
    { to: "/student/learning", label: "My Courses", Icon: BookOpen        },
    { to: "/student/schedule", label: "My Schedule", Icon: Calendar        },
    { to: "/student/goals",    label: "Goals",       Icon: Trophy          },
  ],
};

const ROLE_META: Record<Role, { tagline: string }> = {
  program: { tagline: "Program Director" },
  tutor:   { tagline: "Tutor" },
  student: { tagline: "Student" },
};

export default function AppShell({ onSchedule }: { onSchedule?: (student?: string) => void }) {
  const { user, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { tutors } = useTutors();
  const { scheduleNotices, markScheduleNoticeSeen } = useScheduleNotices();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profilePanel, setProfilePanel] = useState<"account" | "preferences" | null>(null);
  const [checkInStudent, setCheckInStudent] = useState<string | null>(null);
  // Slots the shared page header exposes to the active view (subtitle + actions).
  const [subtitleEl, setSubtitleEl] = useState<HTMLElement | null>(null);
  const [actionsEl, setActionsEl] = useState<HTMLElement | null>(null);
  const pageHeaderSlots = useMemo(() => ({ subtitleEl, actionsEl }), [subtitleEl, actionsEl]);

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role;
  const nav = NAV[role];
  const meta = ROLE_META[role];
  const isAdmin = !!user.isAdmin;
  const tagline = role === "program" ? (isAdmin ? "Program Admin" : "Program Staff") : meta.tagline;

  // At-risk students whose grade + course this tutor covers — broader than a tutor's
  // own roster, which only reflects students they've already had a session with.
  const tutorId = user.tutorId ?? CURRENT_TUTOR_ID;
  const atRiskAlerts = role === "tutor" ? getAtRiskAlertsForTutor(tutors, tutorId) : [];
  const alertRows: { student: (typeof atRiskAlerts)[number]["student"]; courses: string[] }[] = [];
  atRiskAlerts.forEach(({ student, course }) => {
    const row = alertRows.find((r) => r.student.id === student.id);
    if (row) row.courses.push(course);
    else alertRows.push({ student, courses: [course] });
  });

  // Weekly schedules program staff publish for this tutor — surfaced here so they
  // notice new sessions without having to stumble onto them in their schedule.
  const myScheduleNotices = role === "tutor" ? scheduleNotices.filter((n) => n.tutorId === tutorId && !n.seen) : [];
  const notificationCount = alertRows.length + myScheduleNotices.length;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const titleMap: Record<string, string> = {
    "/program/dashboard":  "Program Overview",
    "/program/students":   "Student Roster",
    "/program/curriculum": "Curriculum Library",
    "/program/sessions":   "Attendance",
    "/program/schedule":   "Schedule",
    "/program/tutors":     "Tutors",
    "/program/alumni":     "Alumni Tracking",
    "/tutor/home":         "My Home",
    "/tutor/students":     "My Students",
    "/tutor/schedule":     "Schedule",
    "/tutor/attendance":   "Attendance",
    "/tutor/search":       "Curriculum Library Search",
    "/student/home":       "My Home",
    "/student/learning":   "Learning",
    "/student/schedule":   "Schedule",
    "/student/goals":      "Goals & Achievements",
    "/student/module":     "Module Workspace",
  };

  const basePath = "/" + location.pathname.split("/").slice(1, 3).join("/");
  const pageTitle = titleMap[basePath] ?? "Dashboard";

  return (
    <div className={`flex h-screen bg-background overflow-hidden ${theme === "dark" ? "dark" : ""}`} style={{ fontFamily: "Manrope, sans-serif", colorScheme: theme }}>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-30 inset-y-0 left-0 flex flex-col w-60 flex-shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/menya_logo.ico" alt="" className="w-11 h-11 flex-shrink-0" />
            <div className="leading-none">
              <span className="font-display font-bold text-sidebar-foreground text-lg block">Menya</span>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, Icon, badge }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60"}`
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

      </aside>

      {/* Main */}
      <PageHeaderContext.Provider value={pageHeaderSlots}>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Page header */}
        <header className="flex items-center justify-between gap-4 px-5 lg:px-6 py-4 min-h-[81px] bg-background border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-foreground text-xl leading-tight truncate">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 relative flex-shrink-0">
            <div ref={setActionsEl} className="flex items-center gap-2 flex-wrap justify-end empty:hidden" />
            {role !== "student" && (
              <a
                href="/about"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-2 border border-border text-foreground text-sm font-medium px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Public Page
              </a>
            )}
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
                  </div>
                  {notificationCount === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8 px-4">No new notifications.</p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto divide-y divide-border">
                      {myScheduleNotices.map((notice) => (
                        <div key={notice.id} className="p-3.5 flex flex-col gap-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <CalendarRange className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {notice.sessionCount} new session{notice.sessionCount === 1 ? "" : "s"} scheduled
                              </p>
                              <p className="text-[11px] font-mono text-muted-foreground">Week of {notice.weekLabel} · from Program</p>
                            </div>
                          </div>
                          <button
                            onClick={() => { markScheduleNoticeSeen(notice.id); setNotifOpen(false); navigate("/tutor/schedule"); }}
                            className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary border border-primary/30 hover:bg-primary/10 transition-colors"
                          >
                            View Schedule
                          </button>
                        </div>
                      ))}
                      {alertRows.map(({ student, courses }) => {
                        const atRiskMeta = statusMeta["at-risk"];
                        return (
                          <div key={student.id} className="p-3.5 flex flex-col gap-2.5">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={student.name} size={8} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                                <p className="text-[11px] font-mono text-muted-foreground">Grade {student.grade} · {courses.join(", ")}</p>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono inline-flex items-center gap-1 flex-shrink-0 ${atRiskMeta.cls}`}>
                                <AlertTriangle className="w-2.5 h-2.5" />{atRiskMeta.label}
                              </span>
                            </div>
                            <button
                              onClick={() => { setCheckInStudent(student.name); setNotifOpen(false); }}
                              className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 border border-amber-300 hover:bg-amber-100 transition-colors"
                            >
                              Schedule Check-in
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted transition-colors"
                aria-expanded={profileMenuOpen}
                aria-label="Open profile menu"
              >
                <Avatar name={user.name} size={9} />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-card p-1.5 shadow-lg z-50">
                  <button
                    onClick={() => { setProfilePanel("account"); setProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <UserRound className="w-4 h-4 text-muted-foreground" /> Account
                  </button>
                  <button
                    onClick={() => { setProfilePanel("preferences"); setProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <Settings2 className="w-4 h-4 text-muted-foreground" /> Preferences
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-muted-foreground" /> Sign out
                  </button>
                </div>
              )}
            </div>

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
      </PageHeaderContext.Provider>

      {checkInStudent && (
        <ScheduleModal defaultStudent={checkInStudent} defaultType="check-in" onClose={() => setCheckInStudent(null)} />
      )}

      {profilePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setProfilePanel(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  {profilePanel === "account" ? "Account" : "Preferences"}
                </p>
                <h2 className="font-display font-semibold text-foreground text-xl">
                  {profilePanel === "account" ? user.name : "Workspace preferences"}
                </h2>
              </div>
              <button onClick={() => setProfilePanel(null)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            {profilePanel === "account" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                  <Avatar name={user.name} size={12} />
                  <div>
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Your account details and role determine which tutoring workflows and records you can access.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Appearance</p>
                    <p className="text-xs text-muted-foreground mt-1">Choose how Menya looks for you.</p>
                  </div>
                  <button onClick={toggleTheme} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {theme === "dark" ? "Light" : "Dark"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">More notification and profile controls can be added here as the account model grows.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
