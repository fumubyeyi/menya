import { useState } from "react";
import { X, PenTool, FileText, MonitorUp } from "lucide-react";
import ZoomIFrame from "./ZoomIFrame";
import SessionWhiteboard from "./SessionWhiteboard";
import SessionNotes from "./SessionNotes";
import SessionScreenShare from "./SessionScreenShare";
import { ZoomModalProps } from "../types";

const TABS = [
  { key: "whiteboard", label: "Whiteboard", Icon: PenTool },
  { key: "notes", label: "Notes", Icon: FileText },
  { key: "screenshare", label: "Screen Share", Icon: MonitorUp },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default function ZoomModal({ sessionId, userName, course, onClose }: ZoomModalProps) {
  const [tab, setTab] = useState<Tab>("whiteboard");

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2F4F4F]">
        <span className="text-sm font-mono text-white/80">Live Session · {userName ?? "Menya"}</span>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Leave
        </button>
      </div>

      <div className="flex items-center gap-1 px-4 py-1.5 bg-neutral-950 border-b border-white/10">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === key ? "bg-[#2F4F4F] text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="relative flex-1 overflow-hidden">
        {tab === "whiteboard" && <SessionWhiteboard sessionId={sessionId} />}
        {tab === "notes" && <SessionNotes sessionId={sessionId} studentName={userName} />}
        {tab === "screenshare" && <SessionScreenShare course={course} />}

        <div className="absolute bottom-4 right-4 w-40 h-28 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
          <ZoomIFrame />
        </div>
      </div>
    </div>
  );
}
