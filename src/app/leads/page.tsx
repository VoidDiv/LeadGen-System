"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import LeadFilters from "@/components/leads/LeadFilters";
import LeadFormModal from "@/components/leads/LeadFormModal";
import LeadTable from "@/components/leads/LeadTable";
import { useLeads } from "@/hooks/useLeads";
import type { Lead, LeadStatus, Platform } from "@/types";

// Change this number to raise or lower the weekly limit.
const WEEKLY_LEAD_LIMIT = 100;

/** Monday 00:00 (your local time) of the current week. The count resets every Monday. */
function startOfWeek(now = new Date()): number {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSinceMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - daysSinceMonday);
  return d.getTime();
}

export default function LeadsPage() {
  const { leads, loading, error, add, update, remove } = useLeads();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [form, setForm] = useState<{ lead: Lead | null } | null>(null);
  const [toDelete, setToDelete] = useState<Lead | null>(null);

  const weekStart = startOfWeek();
  const addedThisWeek = useMemo(() => leads.filter((l) => l.createdAt >= weekStart).length, [leads, weekStart]);
  const limitReached = addedThisWeek >= WEEKLY_LEAD_LIMIT;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (!platform || l.platform === platform) &&
        (!status || l.status === status) &&
        (!q || `${l.name} ${l.category} ${l.notes}`.toLowerCase().includes(q)),
    );
  }, [leads, search, platform, status]);

  async function changeStatus(lead: Lead, next: LeadStatus) {
    try {
      await update(lead.id, { status: next });
    } catch {
      window.alert("Couldn't change the status. Check your connection and try again.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} in total · ${addedThisWeek} of ${WEEKLY_LEAD_LIMIT} added this week`}
        action={
          <Button
            onClick={() => setForm({ lead: null })}
            disabled={limitReached}
            title={limitReached ? "Weekly limit reached" : undefined}
          >
            <Plus size={16} /> Add lead
          </Button>
        }
      />

      {limitReached && (
        <p role="status" className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          You&apos;ve added {WEEKLY_LEAD_LIMIT} leads this week, which is the weekly limit. You can add more starting Monday.
          You can still edit existing leads.
        </p>
      )}

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          Couldn&apos;t load leads: {error}
        </p>
      )}

      <LeadFilters
        search={search}
        onSearch={setSearch}
        platform={platform}
        onPlatform={setPlatform}
        status={status}
        onStatus={setStatus}
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-slate-600">
          {leads.length === 0 ? "No leads yet. Use Add lead to log your first one." : "No leads match these filters."}
        </div>
      ) : (
        <LeadTable
          leads={filtered}
          onEdit={(lead) => setForm({ lead })}
          onDelete={setToDelete}
          onStatusChange={changeStatus}
        />
      )}

      {form && (
        <LeadFormModal
          key={form.lead?.id ?? "new"}
          lead={form.lead}
          onClose={() => setForm(null)}
          onSave={async (input) => {
            if (form.lead) {
              await update(form.lead.id, input);
            } else {
              // Re-check at save time in case the limit was reached while the form was open.
              if (limitReached) {
                setForm(null);
                return;
              }
              await add(input);
            }
            setForm(null);
          }}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete lead"
          message={`Delete ${toDelete.name}? This can't be undone.`}
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            await remove(toDelete.id);
            setToDelete(null);
          }}
        />
      )}
    </div>
  );
}