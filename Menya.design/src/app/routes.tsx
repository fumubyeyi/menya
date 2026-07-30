import { createBrowserRouter, Navigate } from "react-router";
import AppShell from "../components/AppShell";
import LoginView from "../views/auth/LoginView";
import SuccessStories from "../views/public/SuccessStories";

// Program views
import ProgramDashboard  from "../views/program/Dashboard";
import ProgramStudents   from "../views/program/Students";
import StudentDetail     from "../views/program/StudentDetail";
import ProgramCurriculum from "../views/program/Curriculum";
import ProgramSessions   from "../views/program/Sessions";
import ProgramAnalytics  from "../views/program/Analytics";
import ProgramAlumni     from "../views/program/AlumniTracking";
import AlumniDetail      from "../views/program/AlumniDetail";

// Tutor views
import TutorHome        from "../views/tutor/Home";
import TutorStudents    from "../views/tutor/MyStudents";
import TutorSchedule    from "../views/tutor/Schedule";
import TutorReview      from "../views/tutor/Review";
import TutorPerformance from "../views/tutor/Performance";

// Student views
import StudentHome       from "../views/student/Home";
import StudentLearning   from "../views/student/Learning";
import StudentSchedule   from "../views/student/Schedule";
import StudentGoals      from "../views/student/Goals";
import ModuleWorkspace   from "../views/student/ModuleWorkspace";

export const router = createBrowserRouter([
  { path: "/login",            Component: LoginView },
  { path: "/success-stories",  Component: SuccessStories },
  { path: "/",                 element: <Navigate to="/login" replace /> },

  // Program Director routes
  {
    path: "/program",
    Component: AppShell,
    children: [
      { index: true,            element: <Navigate to="dashboard" replace /> },
      { path: "dashboard",      Component: ProgramDashboard  },
      { path: "students",       Component: ProgramStudents   },
      { path: "students/:id",   Component: StudentDetail     },
      { path: "curriculum",     Component: ProgramCurriculum },
      { path: "sessions",       Component: ProgramSessions   },
      { path: "analytics",      Component: ProgramAnalytics  },
      { path: "alumni",         Component: ProgramAlumni     },
      { path: "alumni/:id",     Component: AlumniDetail      },
    ],
  },

  // Tutor routes
  {
    path: "/tutor",
    Component: AppShell,
    children: [
      { index: true,        element: <Navigate to="home" replace /> },
      { path: "home",       Component: TutorHome        },
      { path: "students",   Component: TutorStudents    },
      { path: "students/:id", Component: StudentDetail  },
      { path: "schedule",   Component: TutorSchedule    },
      { path: "review",     Component: TutorReview      },
      { path: "performance",Component: TutorPerformance },
    ],
  },

  // Student routes
  {
    path: "/student",
    Component: AppShell,
    children: [
      { index: true,         element: <Navigate to="home" replace /> },
      { path: "home",        Component: StudentHome     },
      { path: "learning",    Component: StudentLearning },
      { path: "schedule",    Component: StudentSchedule },
      { path: "goals",       Component: StudentGoals    },
      { path: "module/:chapterId/:moduleIndex", Component: ModuleWorkspace },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
