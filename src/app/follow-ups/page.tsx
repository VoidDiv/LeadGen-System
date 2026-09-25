"use client";

import { useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import FollowUpList from "@/components/followups/FollowUpList";
import { useLeads } from "@/hooks/useLeads";
import { followUpBucket, todayISO } from "@/lib/dates";
import type { Lead } from "@/types";

export default function FollowUpsPage() {
  const { leads, loading, error, update } = useLeads();
  const today = todayISO();

  const groups = useMemo(() => {
    const g: Record<"overdue" | "today" | "upcoming", Lead[]> = { overdue: [], today: [], upcoming: [] };
    for (const l of leads) {
      const bucket = followUpBucket(l, today);
      if (bucket) g[bucket].push(l);
    }
    const byDate = (a: Lead, b: Lead) => (a.followUpDate ?? "").localeCompare(b.followUpDate ?? "");
    g.overdue.sort(byDate);
    g.upcoming.sort(byDate);
    return g;
  }, [leads, today]);

  async function complete(lead: Lead) {
    try {
      await update(lead.id, { followUpDone: true });
    } catch {
      window.alert("Couldn't mark it completed. Check your connection and try again.");
    }
  }

  return (
    <div>
      <PageHeader title="Follow-ups" subtitle="Set follow-up dates from the Leads page." />

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          Couldn&apos;t load follow-ups: {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-8">
          <FollowUpList
            title="Overdue"
            tone="overdue"
            items={groups.overdue}
            empty="Nothing overdue."
            onComplete={complete}
          />
          <FollowUpList
            title="Today"
            tone="today"
            items={groups.today}
            empty="No follow-ups due today."
            onComplete={complete}
          />
          <FollowUpList
            title="Upcoming"
            tone="upcoming"
            items={groups.upcoming}
            empty="No upcoming follow-ups."
            onComplete={complete}
          />
        </div>
      )}
    </div>
  );
}
