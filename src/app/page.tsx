/* ============================================================
   FILE: app/page.tsx   (REPLACE whole file)   - the Dashboard
   NEW: this week's progress against the weekly limit, a "This week" row
        (added, contacted, response rate), the Pipeline in workflow order,
        leads by state, and a link to the Reports page.
   ============================================================ */

"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import PlatformBreakdown from "@/components/dashboard/PlatformBreakdown";
import PipelineFunnel from "@/components/dashboard/PipelineFunnel";
import StateBreakdown from "@/components/dashboard/StateBreakdown";
import WeeklyProgress from "@/components/dashboard/WeeklyProgress";
import { useLeads } from "@/hooks/useLeads";
import { WEEKLY_LEAD_LIMIT } from "@/lib/constants";
import { followUpBucket, todayISO } from "@/lib/dates";
import { computeReport, rangeFor } from "@/lib/reports";
import type { LeadStatus } from "@/types";

export default function DashboardPage() {
  const { leads, loading, error } = useLeads();

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  const today = todayISO();
  const countStatus = (s: LeadStatus) => leads.filter((l) => l.status === s).length;
  const pending = leads.filter((l) => followUpBucket(l, today) !== null);
  const due = pending.filter((l) => followUpBucket(l, today) !== "upcoming").length;
  const week = computeReport(leads, [], rangeFor("this-week", today), today);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Where your leads stand right now."
        action={
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileText size={16} /> Reports
          </Link>
        }
      />

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          Couldn&apos;t load leads: {error}
        </p>
      )}

      <WeeklyProgress added={week.leadsGathered} limit={WEEKLY_LEAD_LIMIT} />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total leads" value={leads.length} dot="bg-brand-700" />
        <StatCard label="Contacted" value={countStatus("Contacted")} dot="bg-blue-500" />
        <StatCard label="Responded" value={countStatus("Responded")} dot="bg-violet-500" />
        <StatCard label="Qualified" value={countStatus("Qualified")} dot="bg-amber-500" />
        <StatCard label="Follow-ups" value={pending.length} dot="bg-rose-500" hint={`${due} due today or overdue`} />
        <StatCard label="Appointments" value={countStatus("Appointment")} dot="bg-teal-500" />
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">This week</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3" data-testid="this-week">
        <StatCard label="Leads added" value={week.leadsGathered} dot="bg-brand-700" />
        <StatCard label="Prospects contacted" value={week.prospectsContacted} dot="bg-blue-500" />
        <StatCard
          label="Response rate"
          value={week.responseRate === null ? "—" : `${week.responseRate}%`}
          dot="bg-violet-500"
          hint={
            week.responseRate === null
              ? "Nobody contacted yet this week"
              : `${week.respondedOfContacted} of ${week.prospectsContacted} contacted replied`
          }
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <PipelineFunnel leads={leads} />
        <PlatformBreakdown leads={leads} />
        <StateBreakdown leads={leads} />
      </div>

      {leads.length === 0 && !error && (
        <p className="mt-6 text-sm text-slate-600">
          No leads yet.{" "}
          <Link href="/leads" className="font-medium text-brand-700 underline">
            Add your first lead
          </Link>
          .
        </p>
      )}
    </div>
  );
}