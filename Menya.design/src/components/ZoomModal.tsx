import { X } from "lucide-react";
import ZoomIFrame from "./ZoomIFrame";
import { ZoomModalProps } from "../types";

export default function ZoomModal({ meetingId, password, userName, onClose }: ZoomModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1B5E4F]">
        <span className="text-sm font-mono text-white/80">Live Session · {userName ?? "Menya"}</span>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Leave
        </button>
      </div>
      <div className="flex-1">
        <ZoomIFrame meetingId={meetingId} password={password} userName={userName} />
      </div>
    </div>
  );
}
