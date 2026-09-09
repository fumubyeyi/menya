import { useState } from "react";
import { X, Save } from "lucide-react";
import Avatar from "./Avatar";
import TutorFormFields from "./TutorFormFields";
import { useTutors } from "../context/TutorsContext";

interface Props {
  onClose: () => void;
}

export default function AddTutorModal({ onClose }: Props) {
  const { addTutor } = useTutors();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [description, setDescription] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [grades, setGrades] = useState<number[]>([]);
  const [preferredDays, setPreferredDays] = useState<string[]>([]);

  const toggleCourse = (c: string) => setCourses((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));
  const toggleGrade = (g: number) => setGrades((gs) => (gs.includes(g) ? gs.filter((x) => x !== g) : [...gs, g]));
  const toggleDay = (d: string) => setPreferredDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]));

  const canSubmit = firstName.trim() && lastName.trim() && courses.length > 0 && grades.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    addTutor({ firstName: firstName.trim(), lastName: lastName.trim(), description: description.trim(), courses, grades: [...grades].sort((a, b) => a - b), preferredDays });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={firstName || lastName ? `${firstName} ${lastName}` : "New Tutor"} size={9} />
            <div>
              <h2 className="font-display font-semibold text-foreground text-lg leading-none">Add Tutor</h2>
              <p className="text-[11px] font-mono text-muted-foreground mt-1">Add a tutor to the roster</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-hide">
            <TutorFormFields
              firstName={firstName} onFirstNameChange={setFirstName}
              lastName={lastName} onLastNameChange={setLastName}
              description={description} onDescriptionChange={setDescription}
              courses={courses} onToggleCourse={toggleCourse}
              grades={grades} onToggleGrade={toggleGrade}
              preferredDays={preferredDays} onToggleDay={toggleDay}
            />
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
            <button type="submit" disabled={!canSubmit}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
              <Save className="w-4 h-4" />Add Tutor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
