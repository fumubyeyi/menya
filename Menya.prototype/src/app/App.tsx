import { RouterProvider } from "react-router";
import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { SessionContentProvider } from "../context/SessionContentContext";
import { CurriculumProvider } from "../context/CurriculumContext";
import { AlumniProvider } from "../context/AlumniContext";
import { SessionsProvider } from "../context/SessionsContext";
import { HelpRequestsProvider } from "../context/HelpRequestsContext";
import { TutorsProvider } from "../context/TutorsContext";
import { StudentsProvider } from "../context/StudentsContext";
import { AttendanceProvider } from "../context/AttendanceContext";
import { ScheduleNoticesProvider } from "../context/ScheduleNoticesContext";
import { RecurringSlotsProvider } from "../context/RecurringSlotsContext";
import { StudentActivityProvider } from "../context/StudentActivityContext";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <SessionContentProvider>
        <CurriculumProvider>
          <AlumniProvider>
            <TutorsProvider>
              <StudentsProvider>
                <SessionsProvider>
                  <RecurringSlotsProvider>
                    <AttendanceProvider>
                      <ScheduleNoticesProvider>
                        <HelpRequestsProvider>
                          <StudentActivityProvider>
                            <RouterProvider router={router} />
                          </StudentActivityProvider>
                        </HelpRequestsProvider>
                      </ScheduleNoticesProvider>
                    </AttendanceProvider>
                  </RecurringSlotsProvider>
                </SessionsProvider>
              </StudentsProvider>
            </TutorsProvider>
          </AlumniProvider>
        </CurriculumProvider>
      </SessionContentProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
