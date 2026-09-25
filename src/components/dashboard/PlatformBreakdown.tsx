import { PLATFORMS } from "@/lib/constants";
import type { Lead } from "@/types";

export default function PlatformBreakdown({ leads }: { leads: Lead[] }) {
  const total = leads.length;

  return (
    <section className="panel p-5">
      <h2 className="text-base font-semibold text-slate-900">Leads by platform</h2>
      <div className="mt-4 space-y-4">
        {PLATFORMS.map((p) => {
          const n = leads.filter((l) => l.platform === p).length;
          const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <div key={p}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{p}</span>
                <span className="tabular-nums text-slate-500">
                  {n} lead{n === 1 ? "" : "s"} ({pct}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
