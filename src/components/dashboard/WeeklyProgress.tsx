/* ============================================================
   FILE: components/dashboard/WeeklyProgress.tsx   (NEW)
   "42 of 100 leads added this week", with a bar. The week starts on Monday.
   ============================================================ */

interface Props {
  added: number;
  limit: number;
}

export default function WeeklyProgress({ added, limit }: Props) {
  const pct = Math.min(100, Math.round((added / limit) * 100));
  const full = added >= limit;

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">This week&apos;s leads</h2>
        <p className="text-sm tabular-nums text-slate-600" data-testid="weekly-count">
          <span className="text-2xl font-semibold text-slate-900">{added}</span> of {limit} added
        </p>
      </div>
      <div className="mt-3 h-2.5 rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.min(added, limit)}>
        <div className={`h-2.5 rounded-full ${full ? "bg-amber-500" : "bg-brand-600"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {full ? "Weekly limit reached. You can add more starting Monday." : `${limit - added} left this week. The count starts again every Monday.`}
      </p>
    </section>
  );
}