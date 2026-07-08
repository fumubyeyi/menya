import { useState } from "react";

export default function SessionNotes({ studentName }: { studentName?: string }) {
  const [notes, setNotes] = useState("");

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      <div className="px-4 py-2 text-xs font-mono text-white/50 border-b border-white/10">
        Session notes{studentName ? ` · ${studentName}` : ""}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Type notes for this session..."
        className="flex-1 w-full resize-none bg-transparent px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none font-mono"
      />
    </div>
  );
}
