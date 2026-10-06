/* ============================================================
   FILE: app/leads/page.tsx   (REPLACE whole file)
   NEW: filter by state and category group, "Export CSV" (the leads you see),
        the date contacted is filled in when you change a status to Contacted
        (or later), and the weekly limit now comes from lib/constants.ts.
   ============================================================ */

"use client";

import { useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/ui/PageHeader";
import LeadFilters from "@/components/leads/LeadFilters";
import LeadFormModal from "@/components/leads/LeadFormModal";
import LeadTable from "@/components/leads/LeadTable";
import { useLeads } from "@/hooks/useLeads";
import { CONTACTED_STATUSES, WEEKLY_LEAD_LIMIT } from "@/lib/constants";
import { msToISO, todayISO } from "@/lib/dates";
import { downloadTextFile } from "@/lib/download";
import { inRange, leadsToCSV, rangeFor } from "@/lib/reports";
import { groupOfCategory, stateBucket } from "@/lib/targets";
import type { Lead, LeadInput, LeadStatus, Platform } from "@/types";

export default function LeadsPage() {
  const { leads, loading, error, add, update, remove } = useLeads();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [state, setState] = useState("");
  const [group, setGroup] = useState("");
  const [form, setForm] = useState<{ lead: Lead | null } | null>(null);
  const [toDelete, setToDelete] = useState<Lead | null>(null);

  // The count starts again every Monday (your local time): the same "this week" the Dashboard and the Reports use
  const thisWeek = rangeFor("this-week");
  const addedThisWeek = useMemo(
    () => leads.filter((l) => inRange(msToISO(l.createdAt), thisWeek)).length,
    [leads, thisWeek.from, thisWeek.to], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const limitReached = addedThisWeek >= WEEKLY_LEAD_LIMIT;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter(
      (l) =>
        (!platform || l.platform === platform) &&
        (!status || l.status === status) &&
        (!state || stateBucket(l.state) === state) &&
        (!group || groupOfCategory(l.category) === group) &&
        (!q || `${l.name} ${l.category} ${l.profession} ${l.notes}`.toLowerCase().includes(q)),
    );
  }, [leads, search, platform, status, state, group]);

  async function changeStatus(lead: Lead, next: LeadStatus) {
    if (next === lead.status) return;
    // The reports need the time of the change, and the date contacted (from "Contacted" on) is filled in for you
    const patch: Partial<LeadInput> = { status: next, statusChangedAt: Date.now() };
    if (CONTACTED_STATUSES.includes(next) && !lead.dateContacted) patch.dateContacted = todayISO();
    try {
      await update(lead.id, patch);
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
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              disabled={filtered.length === 0}
              onClick={() => downloadTextFile(`leads-${todayISO()}.csv`, leadsToCSV(filtered))}
              title="Download the leads you see as a CSV file (opens in Excel or Google Sheets)"
            >
              <Download size={16} /> Export CSV
            </Button>
            <Button
              onClick={() => setForm({ lead: null })}
              disabled={limitReached}
              title={limitReached ? "Weekly limit reached" : undefined}
            >
              <Plus size={16} /> Add lead
            </Button>
          </div>
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
        state={state}
        onState={setState}
        group={group}
        onGroup={setGroup}
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
          leads={leads}
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