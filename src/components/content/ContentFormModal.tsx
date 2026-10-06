/* ============================================================
   FILE: components/content/ContentFormModal.tsx   (REPLACE whole file)
   NEW FIELDS: Caption, Hashtags, Call to action (CTA).
   The hashtags are tidied when you save ("retirement, #Vets" -> "#retirement #Vets").
   ============================================================ */

"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { CONTENT_STATUSES, CONTENT_TYPES, PLATFORMS } from "@/lib/constants";
import { normalizeHashtags } from "@/lib/utils";
import type { ContentInput, ContentItem, ContentStatus, ContentType, Platform } from "@/types";

interface Props {
  /** null means "add new content" */
  item: ContentItem | null;
  onClose: () => void;
  onSave: (input: ContentInput) => Promise<void>;
}

export default function ContentFormModal({ item, onClose, onSave }: Props) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [platform, setPlatform] = useState<Platform>(item?.platform ?? "LinkedIn");
  const [contentType, setContentType] = useState<ContentType>(item?.contentType ?? "Post");
  const [status, setStatus] = useState<ContentStatus>(item?.status ?? "Idea");
  const [scheduledDate, setScheduledDate] = useState(item?.scheduledDate ?? "");
  const [caption, setCaption] = useState(item?.caption ?? "");
  const [hashtags, setHashtags] = useState(item?.hashtags ?? "");
  const [cta, setCta] = useState(item?.cta ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Enter a content title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        platform,
        contentType,
        status,
        scheduledDate: scheduledDate || null,
        caption: caption.trim(),
        hashtags: normalizeHashtags(hashtags),
        cta: cta.trim(),
        notes: notes.trim(),
      });
    } catch {
      setError("Couldn't save. Check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <Modal title={item ? "Edit content" : "Add content"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="c-title" className="label">
            Content title
          </label>
          <input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} className="input" autoFocus />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c-platform" className="label">
              Platform
            </label>
            <select id="c-platform" value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="input">
              {PLATFORMS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="c-type" className="label">
              Content type
            </label>
            <select
              id="c-type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="input"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="c-status" className="label">
              Status
            </label>
            <select
              id="c-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ContentStatus)}
              className="input"
            >
              {CONTENT_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="c-date" className="label">
              Scheduled date
            </label>
            <input
              id="c-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="c-caption" className="label">
            Caption
          </label>
          <textarea id="c-caption" rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} className="input" />
          <p className="mt-1 text-xs text-slate-500" data-testid="caption-count">
            {caption.length} character{caption.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c-cta" className="label">
              Call to action
            </label>
            <input
              id="c-cta"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="e.g. Message me to book a call"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="c-hashtags" className="label">
              Hashtags
            </label>
            <input
              id="c-hashtags"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#retirement #veterans"
              className="input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="c-notes" className="label">
            Notes
          </label>
          <textarea id="c-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="input" />
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
            {saving ? "Saving…" : item ? "Save changes" : "Add content"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}