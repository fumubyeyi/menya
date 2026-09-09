import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "../app/components/ui/dropdown-menu";
import { ALL_COURSES, TUTOR_GRADES } from "../lib/constants";

interface Props {
  name: string;
  onNameChange: (v: string) => void;
  grade: number | "";
  onGradeChange: (v: number | "") => void;
  location: string;
  onLocationChange: (v: string) => void;
  courses: string[];
  onToggleCourse: (c: string) => void;
}

// Shared field set for AddStudentModal (create) and EditStudentForm (edit) —
// same fields, same styling, kept in one place so a field change doesn't need
// to be hand-copied between the two. Status isn't here — it's derived from
// progress (see studentStatus in lib/constants), not hand-picked.
export default function StudentFormFields({
  name, onNameChange, grade, onGradeChange, location, onLocationChange, courses, onToggleCourse,
}: Props) {
  return (
    <>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Full Name *</span>
        <input required value={name} onChange={(e) => onNameChange(e.target.value)}
          className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Grade *</span>
          <select required value={grade} onChange={(e) => onGradeChange(e.target.value ? Number(e.target.value) : "")}
            className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25">
            <option value="">Select grade…</option>
            {TUTOR_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Enrolled Courses *</span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button type="button"
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                <span className={`truncate ${courses.length ? "text-foreground" : "text-muted-foreground"}`}>
                  {courses.length ? courses.join(", ") : "Select courses"}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
              {ALL_COURSES.map((c) => (
                <DropdownMenuCheckboxItem key={c} checked={courses.includes(c)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => onToggleCourse(c)}>
                  {c}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Location *</span>
        <input required value={location} onChange={(e) => onLocationChange(e.target.value)}
          placeholder="City, State"
          className="px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
      </label>
    </>
  );
}
