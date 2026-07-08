import { RouterProvider } from "react-router";
import { AuthProvider } from "../context/AuthContext";
import { SessionContentProvider } from "../context/SessionContentContext";
import { router } from "./routes";

export default function App() {
  return (
    <AuthProvider>
      <SessionContentProvider>
        <RouterProvider router={router} />
      </SessionContentProvider>
    </AuthProvider>
  );
}
