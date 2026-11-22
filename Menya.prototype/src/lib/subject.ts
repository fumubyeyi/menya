import { courseSlug } from "./constants";

// Per-subject colours for the student view only. The values live in
// styles/theme.css under `.student-theme` (light + dark); outside that scope
// the var is undefined and these fall back to the same neutral slate that
// `courseColor` uses, so staff views keep their icon-only, single-colour
// courses unchanged.
//
// Returned as CSS strings (var()/color-mix()) rather than hex, so use them in
// `style={{ color: ... }}` — don't concatenate an alpha suffix onto them the
// way the hex `courseColor` map is used; use subjectTint for that.

export function subjectColor(course: string): string {
  return `var(--subject-${courseSlug(course)}, #5E6B72)`;
}

// A translucent wash of the subject colour, for icon chips and card headers.
export function subjectTint(course: string, percent = 14): string {
  return `color-mix(in srgb, ${subjectColor(course)} ${percent}%, transparent)`;
}
