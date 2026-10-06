/* ============================================================
   FILE: components/leads/LeadFormModal.tsx   (REPLACE whole file)
   NEW FIELDS: State (your 9 target states), Profession, Date contacted, Response.
   NEW: it warns when the same profile is already saved (and refuses to save a copy),
        the date contacted is filled in for you when you set the status to Contacted
        (or later), and the time the status changed is remembered (for the reports).
   ============================================================ */

"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { CATEGORIES, CONTACTED_STATUSES, LEAD_STATUSES, PLATFORMS, RESPONSES } from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import { STATE_OTHER, TARGET_STATES } from "@/lib/targets";
import { normalizeProfileUrl } from "@/lib/utils";
import type { Lead, LeadInput, LeadResponse, LeadStatus, Platform } from "@/types";

interface Props {
  /** null means "add a new lead" */
  lead: Lead | null;
  /** Every saved lead: used to notice a profile that is already saved */
  leads: Lead[];
  onClose: () => void;
  onSave: (input: LeadInput) => Promise<void>;
}

export default function LeadFormModal({ lead, leads, onClose, onSave }: Props) {
  const [name, setName] = useState(lead?.name ?? "");
  const [platform, setPlatform] = useState<Platform>(lead?.platform ?? "LinkedIn");
  const [profileUrl, setProfileUrl] = useState(lead?.profileUrl ?? "");
  const [category, setCategory] = useState(lead?.category ?? "");
  const [state, setState] = useState(lead?.state ?? "");
  const [profession, setProfession] = useState(lead?.profession ?? "");
  const [status, setStatus] = useState<LeadStatus>(lead?.status ?? "New");
  const [dateContacted, setDateContacted] = useState(lead?.dateContacted ?? "");
  const [response, setResponse] = useState<LeadResponse | "">(lead?.response ?? "");
  const [followUpDate, setFollowUpDate] = useState(lead?.followUpDate ?? "");
  const [notes, setNotes] = useState(lead?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // The same profile saved twice is almost always a mistake: say so while typing
  const key = normalizeProfileUrl(profileUrl);
  const duplicate = key ? leads.find((l) => l.id !== lead?.id && normalizeProfileUrl(l.profileUrl) === key) ?? null : null;

  // A state saved earlier that is not in the list stays selectable (nothing is lost)
  const stateOptions: string[] = [...TARGET_STATES, STATE_OTHER];
  if (state && !stateOptions.includes(state)) stateOptions.push(state);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter the lead's name.");
      return;
    }
    if (duplicate) {
      setError(`This profile is already saved as "${duplicate.name}". Open that lead and edit it instead.`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        platform,
        profileUrl: profileUrl.trim(),
        category: category.trim(),
        state,
        profession: profession.trim(),
        status,
        // From "Contacted" on, an empty date contacted becomes today
        dateContacted: dateContacted || (CONTACTED_STATUSES.includes(status) ? todayISO() : null),
        response,
        notes: notes.trim(),
        followUpDate: followUpDate || null,
        // Changing the date brings the follow-up back to pending
        followUpDone: followUpDate !== "" && lead?.followUpDate === followUpDate ? lead.followUpDone : false,
        // The reports need to know WHEN a lead became an appointment, so the time is kept when the status changes
        statusChangedAt: lead && lead.status === status ? lead.statusChangedAt : Date.now(),
      });
    } catch {
      setError("Couldn't save. Check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <Modal title={lead ? "Edit lead" : "Add lead"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="lead-name" className="label">
            Name
          </label>
          <input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} className="input" autoFocus />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lead-platform" className="label">
              Platform
            </label>
            <select
              id="lead-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="input"
            >
              {PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lead-status" className="label">
              Status
            </label>
            <select
              id="lead-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="input"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="lead-url" className="label">
            Profile URL
          </label>
          <input
            id="lead-url"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="linkedin.com/in/…"
            className="input"
          />
          {duplicate && (
            <p role="status" className="mt-1 text-xs font-medium text-amber-700" data-testid="duplicate-warning">
              ⚠ Already saved: {duplicate.name} ({duplicate.platform})
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lead-category" className="label">
              Category
            </label>
            <input
              id="lead-category"
              list="lead-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            />
            <datalist id="lead-categories">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="lead-state" className="label">
              State
            </label>
            <select id="lead-state" value={state} onChange={(e) => setState(e.target.value)} className="input">
              <option value="">Select a state</option>
              {stateOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lead-profession" className="label">
              Profession
            </label>
            <input
              id="lead-profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. Retired Army, Dentist"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="lead-contacted" className="label">
              Date contacted
            </label>
            <input
              id="lead-contacted"
              type="date"
              value={dateContacted}
              onChange={(e) => setDateContacted(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="lead-response" className="label">
              Response
            </label>
            <select
              id="lead-response"
              value={response}
              onChange={(e) => setResponse(e.target.value as LeadResponse | "")}
              className="input"
            >
              <option value="">No response yet</option>
              {RESPONSES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lead-followup" className="label">
              Follow-up date
            </label>
            <input
              id="lead-followup"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="lead-notes" className="label">
            Notes
          </label>
          <textarea id="lead-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
        </div>

        {error && (
          <p role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : lead ? "Save changes" : "Add lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}