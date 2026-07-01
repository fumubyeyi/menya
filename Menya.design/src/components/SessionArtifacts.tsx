import { FileText, PenTool } from "lucide-react";
import type { SessionArtifact } from "../types";

const artifactIcon = {
  notes: FileText,
  whiteboard: PenTool,
};

export default function SessionArtifacts({ artifacts }: { artifacts?: SessionArtifact[] }) {
  if (!artifacts || artifacts.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {artifacts.map((a) => {
        const Icon = artifactIcon[a.type];
        return (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-[11px] font-mono text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors"
          >
            <Icon className="w-3 h-3" /> {a.label}
          </a>
        );
      })}
    </div>
  );
}
