import { Link } from "react-router";
import { CheckCircle2, Circle } from "lucide-react";
import type { CurriculumModule } from "../types";

interface Props {
  module: CurriculumModule;
  chapterId: number;
  index: number;
}

export default function ModuleStatusRow({ module, chapterId, index }: Props) {
  return (
    <Link to={`/student/module/${chapterId}/${index}`} className="flex items-center gap-1.5 py-1.5 group">
      {module.status === "completed" ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
      ) : (
        <Circle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      )}
      <span className={`text-xs truncate group-hover:text-primary group-hover:underline ${module.status === "completed" ? "text-foreground" : "text-muted-foreground"}`}>
        {module.title}
      </span>
      {module.status === "in-progress" && (
        <span className="ml-auto text-[10px] font-mono text-primary flex-shrink-0">In progress</span>
      )}
    </Link>
  );
}
