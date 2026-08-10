import { RouterProvider } from "react-router";
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
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <SessionContentProvider>
        <CurriculumProvider>
          <AlumniProvider>
            <TutorsProvider>
              <StudentsProvider>
                <SessionsProvider>
                  <AttendanceProvider>
                    <ScheduleNoticesProvider>
                      <HelpRequestsProvider>
                        <RouterProvider router={router} />
                      </HelpRequestsProvider>
                    </ScheduleNoticesProvider>
                  </AttendanceProvider>
                </SessionsProvider>
              </StudentsProvider>
            </TutorsProvider>
          </AlumniProvider>
        </CurriculumProvider>
      </SessionContentProvider>
    </AuthProvider>
  );
}
