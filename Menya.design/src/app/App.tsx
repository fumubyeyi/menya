import { RouterProvider } from "react-router";
import { AuthProvider } from "../context/AuthContext";
import { SessionContentProvider } from "../context/SessionContentContext";
import { CurriculumProvider } from "../context/CurriculumContext";
import { AlumniProvider } from "../context/AlumniContext";
import { SessionsProvider } from "../context/SessionsContext";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <SessionContentProvider>
        <CurriculumProvider>
          <AlumniProvider>
            <SessionsProvider>
              <RouterProvider router={router} />
            </SessionsProvider>
          </AlumniProvider>
        </CurriculumProvider>
      </SessionContentProvider>
    </AuthProvider>
  );
}
