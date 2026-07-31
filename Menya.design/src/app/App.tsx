import { RouterProvider } from "react-router";
import { AuthProvider } from "../context/AuthContext";
import { SessionContentProvider } from "../context/SessionContentContext";
import { CurriculumProvider } from "../context/CurriculumContext";
import { AlumniProvider } from "../context/AlumniContext";
import { SessionsProvider } from "../context/SessionsContext";
import { HelpRequestsProvider } from "../context/HelpRequestsContext";
import { TutorsProvider } from "../context/TutorsContext";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <SessionContentProvider>
        <CurriculumProvider>
          <AlumniProvider>
            <TutorsProvider>
              <SessionsProvider>
                <HelpRequestsProvider>
                  <RouterProvider router={router} />
                </HelpRequestsProvider>
              </SessionsProvider>
            </TutorsProvider>
          </AlumniProvider>
        </CurriculumProvider>
      </SessionContentProvider>
    </AuthProvider>
  );
}
