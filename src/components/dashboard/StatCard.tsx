/* ============================================================
   FILE: components/dashboard/StatCard.tsx   (REPLACE whole file)
   CHANGED: `value` can also be text (e.g. "67%" or "—").
   ============================================================ */

interface Props {
  label: string;
  value: number | string;
  /** Tailwind background class for the small status dot */
  dot: string;
  hint?: string;
}

export default function StatCard({ label, value, dot, hint }: Props) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}