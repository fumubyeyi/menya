interface Props {
  label: string;
  value: string | number;
  Icon: React.ElementType;
  color: string;
  delta?: string;
  onClick?: () => void;
}

// Shared KPI-card shell — previously copy-pasted independently in the Program
// Dashboard and Tutor Home stat rows.
export default function StatTile({ label, value, Icon, color, delta, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-4 flex flex-col gap-2 ${onClick ? "cursor-pointer hover:border-primary/30 transition-colors" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wide">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-display font-bold text-foreground leading-none">{value}</p>
      {delta && <p className="text-xs text-muted-foreground">{delta}</p>}
    </div>
  );
}
