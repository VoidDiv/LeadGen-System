/* ============================================================
   FILE: components/content/ContentTable.tsx   (REPLACE whole file)
   NEW: a "Copy" button on every row. It copies the caption, the call to action and the hashtags
   (ready to paste into LinkedIn, Facebook, Instagram or TikTok).
   ============================================================ */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pencil, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { CONTENT_STATUSES, CONTENT_STATUS_STYLES, PLATFORM_STYLES } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { buildPostText } from "@/lib/utils";
import type { ContentItem, ContentStatus } from "@/types";

interface Props {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
  onStatusChange: (item: ContentItem, status: ContentStatus) => void;
}

function StatusSelect({ value, onChange }: { value: ContentStatus; onChange: (s: ContentStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ContentStatus)}
      aria-label="Change status"
      className={`cursor-pointer rounded-full border-0 py-1 pl-2.5 pr-7 text-xs font-medium ${CONTENT_STATUS_STYLES[value]}`}
    >
      {CONTENT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export default function ContentTable({ items, onEdit, onDelete, onStatusChange }: Props) {
  // Soonest scheduled date first; unscheduled items last
  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.scheduledDate ?? "9999-12-31").localeCompare(b.scheduledDate ?? "9999-12-31")),
    [items],
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copyPost(item: ContentItem) {
    try {
      await navigator.clipboard.writeText(buildPostText(item));
      setCopiedId(item.id);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiedId(null), 1800);
    } catch {
      window.alert("Couldn't copy. Open the item and copy the caption from there.");
    }
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[48rem] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            {["Content title", "Platform", "Type", "Status", "Scheduled", "Notes", ""].map((h) => (
              <th key={h || "actions"} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((c) => {
            const hasText = buildPostText(c) !== "";
            return (
              <tr key={c.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-900">{c.title}</td>
                <td className="px-4 py-3">
                  <Badge className={PLATFORM_STYLES[c.platform]}>{c.platform}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.contentType}</td>
                <td className="px-4 py-3">
                  <StatusSelect value={c.status} onChange={(s) => onStatusChange(c, s)} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(c.scheduledDate)}</td>
                <td className="px-4 py-3">
                  <p className="max-w-[14rem] truncate text-slate-600" title={c.notes}>
                    {c.notes || "—"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => copyPost(c)}
                      disabled={!hasText}
                      aria-label={`Copy the post text of ${c.title}`}
                      title={hasText ? "Copy caption, call to action and hashtags" : "Nothing to copy yet: add a caption"}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {copiedId === c.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={() => onEdit(c)}
                      aria-label={`Edit ${c.title}`}
                      className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      aria-label={`Delete ${c.title}`}
                      className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}