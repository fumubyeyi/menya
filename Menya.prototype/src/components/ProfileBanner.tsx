import type { ReactNode } from "react";
import Avatar from "./Avatar";

// Dark-green profile header shared by the Student and Tutor detail pages — avatar +
// identity on the left, a caller-supplied actions slot on the right (status badge,
// schedule button, "prefers" chip…). Keeps the gradient treatment in one place
// instead of two hand-rolled copies.
const PROFILE_GRADIENT = "linear-gradient(135deg, #F5F5F5 0%, #F5F5F5 100%)";

interface ProfileBannerProps {
  name: string;
  subtitle?: ReactNode;
  tags?: string[];
  actions?: ReactNode;
}

export default function ProfileBanner({ name, subtitle, tags, actions }: ProfileBannerProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ background: PROFILE_GRADIENT }}>
      <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar name={name} size={16} />
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-display font-bold text-[#203B3B]">{name}</h1>
          {subtitle && <p className="text-base text-[#353E43] mt-1">{subtitle}</p>}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 rounded-md font-mono bg-white/60 text-[#2F4F4F]">{t}</span>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="flex flex-col items-start sm:items-end gap-2">{actions}</div>}
      </div>
    </div>
  );
}
