import { subjectColor } from "../lib/constants";

export default function SubjectTag({ subject }: { subject: string }) {
  const color = subjectColor[subject] || "#1B5E4F";
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-md font-mono"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {subject}
    </span>
  );
}
