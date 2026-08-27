import { createBrowserRouter, Navigate, Outlet } from "react-router";
import AppShell from "../components/AppShell";
import { AppErrorBoundary, SectionErrorBoundary } from "../components/ErrorBoundary";
import LoginView from "../views/auth/LoginView";
import SuccessStories from "../views/public/SuccessStories";
import About from "../views/public/About";

// Program views
import ProgramDashboard  from "../views/program/Dashboard";
import ProgramStudents   from "../views/program/Students";
import StudentDetail     from "../views/program/StudentDetail";
import ProgramCurriculum from "../views/program/Curriculum";
import ProgramSessions   from "../views/program/Sessions";
import ProgramSchedule   from "../views/program/Schedule";
import ProgramTutors     from "../views/program/Tutors";
import TutorDetail       from "../views/program/TutorDetail";
import ProgramAnalytics  from "../views/program/Analytics";
import ProgramAlumni     from "../views/program/AlumniTracking";
import AlumniDetail      from "../views/program/AlumniDetail";

// Tutor views
import TutorHome        from "../views/tutor/Home";
import TutorStudents    from "../views/tutor/MyStudents";
import TutorSchedule    from "../views/tutor/Schedule";
import TutorAttendance  from "../views/tutor/Attendance";
import TutorSearch      from "../views/tutor/Search";

// Student views
import StudentHome       from "../views/student/Home";
import StudentLearning   from "../views/student/Learning";
import StudentSchedule   from "../views/student/Schedule";
import StudentGoals      from "../views/student/Goals";
import ModuleWorkspace   from "../views/student/ModuleWorkspace";

// Pathless layout that just renders its children — used purely to attach a shared
// errorElement to a group of routes without adding a URL segment.
function Layout() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    Component: Layout,
    errorElement: <AppErrorBoundary />,
    children: [
      { path: "/login",            Component: LoginView },
      { path: "/success-stories",  Component: SuccessStories },
      { path: "/about",            Component: About },
      { path: "/",                 element: <Navigate to="/login" replace /> },

      // Program Director routes
      {
        path: "/program",
        Component: AppShell,
        children: [
          {
            Component: Layout,
            errorElement: <SectionErrorBoundary />,
            children: [
              { index: true,            element: <Navigate to="dashboard" replace /> },
              { path: "dashboard",      Component: ProgramDashboard  },
              { path: "students",       Component: ProgramStudents   },
              { path: "students/:id",   Component: StudentDetail     },
              { path: "curriculum",     Component: ProgramCurriculum },
              { path: "sessions",       Component: ProgramSessions   },
              { path: "attendance",     element: <Navigate to="../sessions" replace /> },
              { path: "schedule",       Component: ProgramSchedule   },
              { path: "tutors",         Component: ProgramTutors     },
              { path: "tutors/:id",     Component: TutorDetail       },
              { path: "analytics",      Component: ProgramAnalytics  },
              { path: "alumni",         Component: ProgramAlumni     },
              { path: "alumni/:id",     Component: AlumniDetail      },
            ],
          },
        ],
      },

      // Tutor routes
      {
        path: "/tutor",
        Component: AppShell,
        children: [
          {
            Component: Layout,
            errorElement: <SectionErrorBoundary />,
            children: [
              { index: true,        element: <Navigate to="home" replace /> },
              { path: "home",       Component: TutorHome        },
              { path: "students",   Component: TutorStudents    },
              { path: "students/:id", Component: StudentDetail  },
              { path: "schedule",   Component: TutorSchedule    },
              { path: "attendance", Component: TutorAttendance  },
              { path: "search",     Component: TutorSearch      },
            ],
          },
        ],
      },

      // Student routes
      {
        path: "/student",
        Component: AppShell,
        children: [
          {
            Component: Layout,
            errorElement: <SectionErrorBoundary />,
            children: [
              { index: true,         element: <Navigate to="home" replace /> },
              { path: "home",        Component: StudentHome     },
              { path: "learning",    Component: StudentLearning },
              { path: "schedule",    Component: StudentSchedule },
              { path: "goals",       Component: StudentGoals    },
              { path: "module/:chapterId/:moduleIndex", Component: ModuleWorkspace },
            ],
          },
        ],
      },

      { path: "*", element: <Navigate to="/login" replace /> },
    ],
  },
]);
