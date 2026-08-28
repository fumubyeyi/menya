import type { ElementType, ReactNode } from "react";
import Avatar from "./Avatar";

// Dark-green profile header shared by the Student and Tutor detail pages — avatar +
// identity on the left, a caller-supplied actions slot on the right (status badge,
// schedule button, "prefers" chip…), and an optional row of stat pillars below.
// Keeps the gradient/pillar treatment in one place instead of two hand-rolled copies.
const PROFILE_GRADIENT = "linear-gradient(135deg, #1B5E4F 0%, #0d3b2e 100%)";

export interface ProfileBannerStat {
  label: string;
  value: ReactNode;
  Icon: ElementType;
}

interface ProfileBannerProps {
  name: string;
  subtitle?: ReactNode;
  tags?: string[];
  actions?: ReactNode;
  stats?: ProfileBannerStat[];
}

export default function ProfileBanner({ name, subtitle, tags, actions, stats }: ProfileBannerProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ background: PROFILE_GRADIENT }}>
      <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar name={name} size={16} />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold text-white">{name}</h1>
          {subtitle && <p className="text-sm text-white/60 mt-0.5">{subtitle}</p>}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-white/15 text-white">{t}</span>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="flex flex-col items-start sm:items-end gap-2">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div
          className="grid border-t border-white/10"
          style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
        >
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="flex flex-col items-center py-4 gap-1 border-r border-white/10 last:border-r-0">
              <Icon className="w-4 h-4 text-white/50" />
              <p className="text-xl font-display font-bold text-white">{value}</p>
              <p className="text-[11px] text-white/50 font-mono">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
