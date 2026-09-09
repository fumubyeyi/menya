import { useAuth } from "../context/AuthContext";
import { useStudents } from "../context/StudentsContext";
import { CURRENT_STUDENT_ID, sofia } from "../data";

// Resolves whichever student is actually logged in (set at login via the
// "Select your name" picker, carried as user.studentId) against the live,
// staff-editable roster — not the fixed seed demo student every student-facing
// page used to read directly, which showed Sofia Patel's data to everyone
// regardless of who logged in. Falls back to the seed demo student only if
// nothing matches (e.g. logged out, or a deleted id).
export function useCurrentStudent() {
  const { user } = useAuth();
  const { students } = useStudents();
  const studentId = user?.studentId ?? CURRENT_STUDENT_ID;
  return students.find((s) => s.id === studentId) ?? sofia;
}
