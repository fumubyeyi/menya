import { useState } from "react";
import { Save } from "lucide-react";
import StudentFormFields from "./StudentFormFields";
import { useStudents } from "../context/StudentsContext";
import { studentStatus } from "../lib/constants";
import type { Student } from "../types";

interface Props {
  student: Student;
  onCancel: () => void;
  onSaved: () => void;
}

// Inline (in-page) counterpart to AddStudentModal's fields — used on the
// Student Detail page instead of an overlay, so program staff can edit
// without losing sight of the rest of the profile.
export default function EditStudentForm({ student, onCancel, onSaved }: Props) {
  const { updateStudent } = useStudents();
  const [name, setName] = useState(student.name);
  const [grade, setGrade] = useState<number | "">(student.grade);
  const [location, setLocation] = useState(student.location);
  const [courses, setCourses] = useState<string[]>(student.courses);

  const toggleCourse = (c: string) => setCourses((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const canSubmit = name.trim() && grade !== "" && location.trim() && courses.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // Status isn't user-set — it's recomputed from this student's current
    // progress every save, so it can't drift out of sync (see studentStatus).
    updateStudent({ ...student, name: name.trim(), grade: grade as number, location: location.trim(), status: studentStatus(student.progress), courses });
    onSaved();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="mb-4">
        <h2 className="font-display font-semibold text-foreground text-lg leading-none">Edit Student</h2>
        <p className="text-[11px] font-mono text-muted-foreground mt-1">Update {student.name}'s details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <StudentFormFields
          name={name} onNameChange={setName}
          grade={grade} onGradeChange={setGrade}
          location={location} onLocationChange={setLocation}
          courses={courses} onToggleCourse={toggleCourse}
        />

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
          <button type="button" onClick={onCancel} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
          <button type="submit" disabled={!canSubmit}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
            <Save className="w-4 h-4" />Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
