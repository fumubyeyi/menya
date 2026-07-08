import { MonitorUp } from "lucide-react";

export default function SessionScreenShare({ subject }: { subject?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-neutral-900 text-white/60 gap-3">
      <MonitorUp className="w-10 h-10" />
      <p className="text-sm font-mono">
        {subject ? `Sharing "${subject} Worksheet.pdf"` : "No one is sharing their screen"}
      </p>
    </div>
  );
}
