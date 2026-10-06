/* ============================================================
   FILE: components/dashboard/PipelineFunnel.tsx   (NEW)
   Where your leads are RIGHT NOW, in the order of your workflow:
   Find -> Qualify -> Engage -> Contact -> Follow up -> Appointment.
   ============================================================ */

import { LEAD_STATUSES } from "@/lib/constants";
import type { Lead, LeadStatus } from "@/types";

const STAGE_LABEL: Record<LeadStatus, string> = {
  New: "New (found)",
  Qualified: "Qualified",
  Engaged: "Engaged",
  Contacted: "Contacted",
  Responded: "Responded",
  Appointment: "Appointment",
  Converted: "Converted",
  "Not Interested": "Not interested",
};

export default function PipelineFunnel({ leads }: { leads: Lead[] }) {
  const total = leads.length;

  return (
    <section className="panel p-5">
      <h2 className="text-base font-semibold text-slate-900">Pipeline</h2>
      <p className="mt-0.5 text-xs text-slate-500">Where your leads are right now, in the order of your workflow.</p>
      <ol className="mt-4 space-y-3" data-testid="pipeline">
        {LEAD_STATUSES.map((s) => {
          const n = leads.filter((l) => l.status === s).length;
          const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <li key={s}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{STAGE_LABEL[s]}</span>
                <span className="tabular-nums text-slate-500">{n}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${s === "Not Interested" ? "bg-rose-400" : "bg-brand-600"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}