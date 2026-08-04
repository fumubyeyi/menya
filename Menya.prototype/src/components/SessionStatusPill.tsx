export default function SessionStatusPill({ status }: { status: string }) {
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
      status === "in-progress" ? "bg-emerald-100 text-emerald-700 font-semibold" :
      status === "upcoming"    ? "bg-amber-100 text-amber-700" :
                                 "bg-muted text-muted-foreground"
    }`}>
      {status === "in-progress" ? "● Live" : status}
    </span>
  );
}
