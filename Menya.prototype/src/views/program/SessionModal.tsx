import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/calendar.css";
import { X, Video, MapPin, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarRange } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "../../app/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "../../app/components/ui/popover";
import { useSessions } from "../../context/SessionsContext";
import { useScheduleNotices } from "../../context/ScheduleNoticesContext";
import { useStudents } from "../../context/StudentsContext";
import { useTutors } from "../../context/TutorsContext";
import { formatSessionTime, scoreTutorMatch, ALL_COURSES, TUTOR_GRADES, gradesSummary, parseGroupLabel } from "../../lib/constants";
import type { Session } from "../../types";

// A row in "This Week's Schedule" — one virtual session, or one or more in-person
// sessions (one per assigned tutor) that share the same group/day/time.
export interface PublishedGroup {
  key: string;
  student: string;
  course: string;
  date?: string;
  time: string;
  clock: string;
  location?: "virtual" | "in-person";
  sessionsInGroup: Session[];
}

// Seeds a fresh "Add Session" form from a recurring-slot table row — day, grades,
// and whichever tutors were already assigned to that slot.
export interface SlotPrefill {
  date: string;
  grades: number[];
  tutorIds: number[];
}

interface Props {
  weekDays: { date: string; label: string }[];
  weekStartBound: Date;
  weekEndBound: Date;
  weekLabel: string;
  weekStartISO: string;
  editing?: PublishedGroup;
  prefill?: SlotPrefill;
  onClose: () => void;
}

// In-person roll-call sessions are always a fixed 2-hour block — no per-session duration picker needed.
const IN_PERSON_DURATION = 120;

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Reverses formatSessionTime's "3:00 PM" clock string back into a 24h "HH:MM" for
// the <input type="time"> — sessions only store the formatted display clock, not
// the raw time-of-day, so editing has to parse it back out.
function clockTo24h(clock: string): string {
  const m = clock.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return "18:00";
  let hour = parseInt(m[1], 10);
  const isPM = /pm/i.test(m[3]);
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${m[2]}`;
}

function matchLabel(score: number): string {
  if (score === 3) return "best match";
  if (score === 2) return "course match";
  if (score === 1) return "grade match";
  return "";
}

export default function SessionModal({ weekDays, weekStartBound, weekEndBound, weekLabel, weekStartISO, editing, prefill, onClose }: Props) {
  const { addSession, addSessions, updateSession, updateSessions, removeSessions } = useSessions();
  const { addScheduleNotices } = useScheduleNotices();
  const { students } = useStudents();
  const { tutors } = useTutors();

  const editingVirtual = editing?.location !== "in-person" ? editing : undefined;
  const editingGroupParsed = editing?.location === "in-person" ? parseGroupLabel(editing.student, editing.course) : undefined;

  const [location, setLocationState] = useState<"virtual" | "in-person">(editing?.location ?? "in-person");
  const [student, setStudent] = useState(editingVirtual?.student ?? "");
  const [tutorId, setTutorId] = useState(editingVirtual ? String(editingVirtual.sessionsInGroup[0].tutorId) : "");
  const [course, setCourse] = useState(editingVirtual?.course ?? "");
  const [duration, setDuration] = useState(editingVirtual ? String(editingVirtual.sessionsInGroup[0].duration) : "60");
  const [groupScope, setGroupScope] = useState<"grade" | "course">(editingGroupParsed?.scope ?? "grade");
  const [groupValue, setGroupValue] = useState(editingGroupParsed?.courseValue ?? "");
  const [selectedGrades, setSelectedGrades] = useState<number[]>(editingGroupParsed?.grades ?? prefill?.grades ?? []);
  const [selectedTutorIds, setSelectedTutorIds] = useState<string[]>(
    editing?.location === "in-person" ? editing.sessionsInGroup.map((s) => String(s.tutorId)) : (prefill?.tutorIds.map(String) ?? [])
  );
  const [date, setDate] = useState(editing?.date ?? prefill?.date ?? weekDays[0].date);
  const [time, setTime] = useState(editing ? clockTo24h(editing.clock) : "18:00");
  const [dayPickerOpen, setDayPickerOpen] = useState(false);

  const pickDay = (value: unknown) => {
    if (value instanceof Date) setDate(toISODate(value));
    setDayPickerOpen(false);
  };

  const setLocation = (loc: "virtual" | "in-person") => {
    setLocationState(loc);
    if (loc === "virtual") {
      setGroupValue("");
      setSelectedGrades([]);
      setSelectedTutorIds([]);
    } else {
      setStudent("");
      setTutorId("");
      setCourse("");
    }
  };

  const toggleTutor = (id: string) => {
    setSelectedTutorIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };
  const toggleGrade = (g: number) => {
    setSelectedGrades((grades) => (grades.includes(g) ? grades.filter((x) => x !== g) : [...grades, g]));
    setSelectedTutorIds([]);
  };

  const studentRecord = students.find((s) => s.name === student);
  const studentCourses = studentRecord?.courses ?? [];
  const matchScore = (t: (typeof tutors)[0]) => scoreTutorMatch(t, course, studentRecord?.grade);
  const sortedTutors = [...tutors].sort((a, b) => matchScore(b) - matchScore(a));

  const groupMatchScore = (t: (typeof tutors)[0]) =>
    groupScope === "course"
      ? scoreTutorMatch(t, groupValue, undefined)
      : (selectedGrades.some((g) => t.grades.includes(g)) ? 1 : 0);
  const sortedGroupTutors = [...tutors].sort((a, b) => groupMatchScore(b) - groupMatchScore(a));

  const groupTutorsSummary = () => {
    if (selectedTutorIds.length === 0) return "";
    if (selectedTutorIds.length === 1) {
      const t = tutors.find((tu) => tu.id === Number(selectedTutorIds[0]));
      return t ? `${t.firstName} ${t.lastName}` : "1 tutor selected";
    }
    return `${selectedTutorIds.length} tutors selected`;
  };

  const hasGroupTarget = groupScope === "grade" ? selectedGrades.length > 0 : !!groupValue;
  const canSaveVirtual = location === "virtual" && !!student && !!tutorId && !!course && !!date && !!time;
  const canSaveGroup = location === "in-person" && hasGroupTarget && selectedTutorIds.length > 0 && !!date && !!time;
  const canSave = canSaveVirtual || canSaveGroup;

  const handleSave = () => {
    if (location === "virtual") {
      if (!canSaveVirtual) return;
      const { time: timeLabel, clock } = formatSessionTime(date, time);
      if (editingVirtual) {
        const original = editingVirtual.sessionsInGroup[0];
        updateSession({ ...original, student, tutorId: Number(tutorId), course, date, time: timeLabel, clock, duration: Number(duration) });
      } else {
        addSession({
          student, tutorId: Number(tutorId), course, date, time: timeLabel, clock,
          duration: Number(duration), status: "scheduled", type: "tutoring", location: "virtual",
          meetingId: "add_real_meeting_id", password: "add_real_passcode",
        });
      }
      onClose();
      return;
    }

    if (!canSaveGroup) return;
    const groupLabel = groupScope === "grade" ? gradesSummary(selectedGrades) : groupValue;
    const groupCourse = groupScope === "course" ? groupValue : "All Courses";
    const { time: timeLabel, clock } = formatSessionTime(date, time);
    const newTutorIds = selectedTutorIds.map(Number);

    if (editing?.location === "in-person") {
      const originalTutorIds = editing.sessionsInGroup.map((s) => s.tutorId);
      const removed = originalTutorIds.filter((id) => !newTutorIds.includes(id));
      const kept = originalTutorIds.filter((id) => newTutorIds.includes(id));
      const added = newTutorIds.filter((id) => !originalTutorIds.includes(id));

      if (removed.length) {
        removeSessions(removed.map((id) => editing.sessionsInGroup.find((ses) => ses.tutorId === id)?.id).filter((id): id is number => id !== undefined));
      }
      if (kept.length) {
        updateSessions(
          kept
            .map((id) => editing.sessionsInGroup.find((ses) => ses.tutorId === id))
            .filter((s): s is Session => s !== undefined)
            .map((s) => ({ ...s, student: `${groupLabel} Group`, course: groupCourse, date, time: timeLabel, clock }))
        );
      }
      if (added.length) {
        addSessions(added.map((tid) => ({
          student: `${groupLabel} Group`, tutorId: tid, course: groupCourse, date, time: timeLabel, clock,
          duration: IN_PERSON_DURATION, status: "scheduled" as const, type: "tutoring" as const, location: "in-person" as const,
        })));
        addScheduleNotices(added.map((tid) => ({ tutorId: tid, weekLabel, weekStart: weekStartISO, sessionCount: 1 })));
      }
    } else {
      addSessions(newTutorIds.map((tid) => ({
        student: `${groupLabel} Group`, tutorId: tid, course: groupCourse, date, time: timeLabel, clock,
        duration: IN_PERSON_DURATION, status: "scheduled" as const, type: "tutoring" as const, location: "in-person" as const,
      })));
      const tutorCounts = new Map<number, number>();
      newTutorIds.forEach((id) => tutorCounts.set(id, (tutorCounts.get(id) ?? 0) + 1));
      addScheduleNotices(Array.from(tutorCounts.entries()).map(([tid, sessionCount]) => ({ tutorId: tid, weekLabel, weekStart: weekStartISO, sessionCount })));
    }

    onClose();
  };

  const dayPicker = (
    <Popover open={dayPickerOpen} onOpenChange={setDayPickerOpen} modal={false}>
      <PopoverTrigger asChild>
        <button type="button"
          className="w-full flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
          <CalendarIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {parseISODate(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2">
        <Calendar
          className="menya-calendar"
          value={parseISODate(date)}
          onChange={pickDay}
          minDate={weekStartBound}
          maxDate={weekEndBound}
          minDetail="month"
          maxDetail="month"
          prev2Label={null}
          next2Label={null}
          prevLabel={<ChevronLeft className="w-4 h-4 mx-auto" />}
          nextLabel={<ChevronRight className="w-4 h-4 mx-auto" />}
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-display font-semibold text-foreground text-lg leading-none">{editing ? "Edit Session" : "Add Session"}</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Week of {weekLabel}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-hide">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Location</span>
            <div className="flex gap-2">
              {([["in-person", "In-Person", MapPin], ["virtual", "Virtual", Video]] as const).map(([v, label, Icon]) => (
                <button key={v} type="button" onClick={() => setLocation(v)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-mono font-medium border transition-colors ${location === v ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </button>
              ))}
            </div>
          </div>

          {location === "virtual" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Student</span>
                  <select value={student} onChange={(e) => setStudent(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                    <option value="">Select student</option>
                    {students.map((s) => <option key={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Course</span>
                  <select value={course} onChange={(e) => setCourse(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                    <option value="">Select course</option>
                    {(studentCourses.length ? studentCourses : Array.from(new Set(tutors.flatMap((t) => t.courses)))).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Tutor</span>
                <select value={tutorId} onChange={(e) => setTutorId(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                  <option value="">Select tutor</option>
                  {sortedTutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}{matchScore(t) >= 2 ? ` — ${matchLabel(matchScore(t))}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Day</span>
                  {dayPicker}
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Time</span>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Duration</span>
                <div className="flex gap-1.5">
                  {["30", "45", "60", "90"].map((d) => (
                    <button key={d} type="button" onClick={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-lg text-xs font-mono font-medium border transition-colors ${duration === d ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Plan By</span>
                <div className="flex gap-1">
                  {(["grade", "course"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => { setGroupScope(s); setGroupValue(""); setSelectedGrades([]); setSelectedTutorIds([]); }}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${groupScope === s ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-foreground hover:bg-muted"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {groupScope === "grade" ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Grades — select one or more, grouped together</span>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button type="button"
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                        <span className={selectedGrades.length ? "text-foreground" : "text-muted-foreground"}>
                          {selectedGrades.length ? gradesSummary(selectedGrades) : "Select grades"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                      {TUTOR_GRADES.map((g) => (
                        <DropdownMenuCheckboxItem key={g} checked={selectedGrades.includes(g)}
                          onSelect={(e) => e.preventDefault()}
                          onCheckedChange={() => toggleGrade(g)}>
                          Grade {g}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Course</span>
                  <select value={groupValue} onChange={(e) => { setGroupValue(e.target.value); setSelectedTutorIds([]); }}
                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                    <option value="">Select course</option>
                    {ALL_COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Day</span>
                {dayPicker}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Tutors — select one or more</span>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button type="button"
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer">
                      <span className={selectedTutorIds.length ? "text-foreground" : "text-muted-foreground"}>
                        {selectedTutorIds.length ? groupTutorsSummary() : "Select tutors"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                    {tutors.length === 0 && <p className="text-xs text-muted-foreground px-2 py-1.5">No tutors available.</p>}
                    {sortedGroupTutors.map((t) => {
                      const score = groupMatchScore(t);
                      const label = matchLabel(score);
                      return (
                        <DropdownMenuCheckboxItem key={t.id} checked={selectedTutorIds.includes(String(t.id))}
                          onSelect={(e) => e.preventDefault()}
                          onCheckedChange={() => toggleTutor(String(t.id))}>
                          <span className="flex-1">{t.firstName} {t.lastName}</span>
                          {label && <span className="text-[10px] font-mono text-muted-foreground">{label}</span>}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Time <span className="normal-case text-muted-foreground/70">— fixed 2-hour block</span></span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25" />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
          <button type="button" onClick={handleSave} disabled={!canSave}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
            <CalendarRange className="w-4 h-4" />
            {editing ? "Save Changes" : "Add Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
