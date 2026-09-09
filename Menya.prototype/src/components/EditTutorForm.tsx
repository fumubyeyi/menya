import { useState } from "react";
import { Save } from "lucide-react";
import TutorFormFields from "./TutorFormFields";
import { useTutors } from "../context/TutorsContext";
import type { Tutor } from "../types";

interface Props {
  tutor: Tutor;
  onCancel: () => void;
  onSaved: () => void;
}

// Inline (in-page) counterpart to AddTutorModal — same fields, same styling,
// used on the Tutor Detail page instead of an overlay.
export default function EditTutorForm({ tutor, onCancel, onSaved }: Props) {
  const { updateTutor } = useTutors();
  const [firstName, setFirstName] = useState(tutor.firstName);
  const [lastName, setLastName] = useState(tutor.lastName);
  const [description, setDescription] = useState(tutor.description);
  const [courses, setCourses] = useState<string[]>(tutor.courses);
  const [grades, setGrades] = useState<number[]>(tutor.grades);
  const [preferredDays, setPreferredDays] = useState<string[]>(tutor.preferredDays ?? []);

  const toggleCourse = (c: string) => setCourses((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const toggleGrade = (g: number) => setGrades((gs) => (gs.includes(g) ? gs.filter((x) => x !== g) : [...gs, g]));
  const toggleDay = (d: string) => setPreferredDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]));

  const canSubmit = firstName.trim() && lastName.trim() && courses.length > 0 && grades.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    updateTutor({
      ...tutor,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      description: description.trim(),
      courses,
      grades: [...grades].sort((a, b) => a - b),
      preferredDays,
    });
    onSaved();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="mb-4">
        <h2 className="font-display font-semibold text-foreground text-lg leading-none">Edit Tutor</h2>
        <p className="text-[11px] font-mono text-muted-foreground mt-1">Update {tutor.firstName} {tutor.lastName}'s details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <TutorFormFields
          firstName={firstName} onFirstNameChange={setFirstName}
          lastName={lastName} onLastNameChange={setLastName}
          description={description} onDescriptionChange={setDescription}
          courses={courses} onToggleCourse={toggleCourse}
          grades={grades} onToggleGrade={toggleGrade}
          preferredDays={preferredDays} onToggleDay={toggleDay}
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
