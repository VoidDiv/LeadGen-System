"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { CATEGORIES, LEAD_STATUSES, PLATFORMS } from "@/lib/constants";
import type { Lead, LeadInput, LeadStatus, Platform } from "@/types";

interface Props {
  /** null means "add a new lead" */
  lead: Lead | null;
  onClose: () => void;
  onSave: (input: LeadInput) => Promise<void>;
}

export default function LeadFormModal({ lead, onClose, onSave }: Props) {
  const [name, setName] = useState(lead?.name ?? "");
  const [platform, setPlatform] = useState<Platform>(lead?.platform ?? "LinkedIn");
  const [profileUrl, setProfileUrl] = useState(lead?.profileUrl ?? "");
  const [category, setCategory] = useState(lead?.category ?? "");
  const [status, setStatus] = useState<LeadStatus>(lead?.status ?? "New");
  const [followUpDate, setFollowUpDate] = useState(lead?.followUpDate ?? "");
  const [notes, setNotes] = useState(lead?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter the lead's name.");
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
        status,
        notes: notes.trim(),
        followUpDate: followUpDate || null,
        // Changing the date brings the follow-up back to pending
        followUpDone: followUpDate !== "" && lead?.followUpDate === followUpDate ? lead.followUpDone : false,
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
