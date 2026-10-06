/* ============================================================
   FILE: components/reports/ReportView.tsx   (NEW)
   The report itself: the numbers and the breakdowns. It is what gets printed.
   ============================================================ */

import StatCard from "@/components/dashboard/StatCard";
import { describeRange, type Counted, type Report } from "@/lib/reports";

function CountList({ title, rows, empty }: { title: string; rows: Counted[]; empty: string }) {
  const shown = rows.filter((r) => r.count > 0);
  const max = Math.max(1, ...shown.map((r) => r.count));
  return (
    <section className="panel break-inside-avoid p-5">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {shown.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {shown.map((r) => (
            <li key={r.label} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0 break-words font-medium text-slate-700 sm:w-56" title={r.label}>
                {r.label}
              </span>
              <div className="h-2 flex-1 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.round((r.count / max) * 100)}%` }} />
              </div>
              <span className="w-6 shrink-0 text-right tabular-nums text-slate-500">{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ReportView({ report: r }: { report: Report }) {
  return (
    <div data-testid="report" className="space-y-6">
      <div>
        <p className="text-lg font-semibold text-slate-900" data-testid="report-title">
          {r.range.label}
        </p>
        <p className="text-sm text-slate-500">{describeRange(r.range)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Leads gathered" value={r.leadsGathered} dot="bg-brand-700" hint="Added in this period" />
        <StatCard label="Prospects contacted" value={r.prospectsContacted} dot="bg-blue-500" hint="Date contacted is in this period" />
        <StatCard
          label="Responses"
          value={r.respondedOfContacted}
          dot="bg-violet-500"
          hint={r.responseRate === null ? "Nobody was contacted" : `${r.responseRate}% of the prospects contacted`}
        />
        <StatCard
          label="Appointments / opportunities"
          value={r.appointmentsInPeriod}
          dot="bg-teal-500"
          hint={`Became one in this period · in that stage now: ${r.inAppointmentStageNow}`}
        />
        <StatCard
          label="Follow-ups scheduled"
          value={r.followUps.scheduled}
          dot="bg-amber-500"
          hint={`${r.followUps.completed} completed · ${r.followUps.open} open`}
        />
        <StatCard label="Overdue right now" value={r.overdueNow} dot="bg-rose-500" hint="Not done and already past" />
      </div>

      <section className="panel break-inside-avoid p-5">
        <h3 className="text-base font-semibold text-slate-900">Content</h3>
        <p className="mt-1 text-xs text-slate-500">Items whose scheduled date is in this period</p>
        <dl className="mt-3 grid grid-cols-3 gap-4 text-center">
          {[
            ["Published", r.content.published],
            ["Scheduled", r.content.scheduled],
            ["Ideas / drafts", r.content.inProgress],
          ].map(([label, n]) => (
            <div key={label}>
              <dd className="text-2xl font-semibold tabular-nums text-slate-900">{n}</dd>
              <dt className="text-xs text-slate-500">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel break-inside-avoid overflow-x-auto p-5">
        <h3 className="text-base font-semibold text-slate-900">By platform</h3>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-2 font-medium">Platform</th>
              <th className="pb-2 text-right font-medium">Gathered</th>
              <th className="pb-2 text-right font-medium">Contacted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {r.gatheredByPlatform.map((g, i) => (
              <tr key={g.label}>
                <td className="py-2 font-medium text-slate-700">{g.label}</td>
                <td className="py-2 text-right tabular-nums">{g.count}</td>
                <td className="py-2 text-right tabular-nums">{r.contactedByPlatform[i].count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <CountList title="Gathered by category group" rows={r.gatheredByGroup} empty="No leads were added in this period." />
        <CountList title="Gathered by state" rows={r.gatheredByState} empty="No leads were added in this period." />
      </div>
    </div>
  );
}