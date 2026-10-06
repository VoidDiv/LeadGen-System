/* ============================================================
   FILE: components/dashboard/StateBreakdown.tsx   (NEW)
   How many leads you have in each target state.
   ============================================================ */

import { STATE_NOT_SET, STATE_OTHER, TARGET_STATES, stateBucket } from "@/lib/targets";
import type { Lead } from "@/types";

export default function StateBreakdown({ leads }: { leads: Lead[] }) {
  const rows = [...TARGET_STATES, STATE_OTHER, STATE_NOT_SET].map((label) => ({
    label,
    count: leads.filter((l) => stateBucket(l.state) === label).length,
  }));
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <section className="panel p-5">
      <h2 className="text-base font-semibold text-slate-900">Leads by state</h2>
      <ul className="mt-4 space-y-2.5" data-testid="states">
        {rows.map(({ label, count }) => (
          <li key={label} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 font-medium text-slate-700">{label}</span>
            <div className="h-2 flex-1 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.round((count / max) * 100)}%` }} />
            </div>
            <span className="w-6 shrink-0 text-right tabular-nums text-slate-500">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}