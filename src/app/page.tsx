"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import PlatformBreakdown from "@/components/dashboard/PlatformBreakdown";
import { useLeads } from "@/hooks/useLeads";
import { followUpBucket, todayISO } from "@/lib/dates";
import type { LeadStatus } from "@/types";

export default function DashboardPage() {
  const { leads, loading, error } = useLeads();

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  const today = todayISO();
  const countStatus = (s: LeadStatus) => leads.filter((l) => l.status === s).length;
  const pending = leads.filter((l) => followUpBucket(l, today) !== null);
  const due = pending.filter((l) => followUpBucket(l, today) !== "upcoming").length;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Where your leads stand right now." />

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          Couldn&apos;t load leads: {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total leads" value={leads.length} dot="bg-brand-700" />
        <StatCard label="Contacted" value={countStatus("Contacted")} dot="bg-blue-500" />
        <StatCard label="Responded" value={countStatus("Responded")} dot="bg-violet-500" />
        <StatCard label="Qualified" value={countStatus("Qualified")} dot="bg-amber-500" />
        <StatCard label="Follow-ups" value={pending.length} dot="bg-rose-500" hint={`${due} due today or overdue`} />
        <StatCard label="Appointments" value={countStatus("Appointment")} dot="bg-teal-500" />
      </div>

      <div className="mt-6">
        <PlatformBreakdown leads={leads} />
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
