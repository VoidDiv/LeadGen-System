"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ExternalLink, Pencil, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import StatusSelect from "./StatusSelect";
import { LEAD_STATUSES, PLATFORM_STYLES } from "@/lib/constants";
import { followUpBucket, formatDate, msToISO } from "@/lib/dates";
import { safeUrl } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

type SortKey = "name" | "platform" | "status" | "createdAt" | "followUpDate";

function sortValue(l: Lead, key: SortKey): string {
  switch (key) {
    case "createdAt":
      return String(l.createdAt).padStart(15, "0");
    case "followUpDate":
      return l.followUpDate ?? "9999-12-31"; // leads without a date sort last
    case "status":
      return String(LEAD_STATUSES.indexOf(l.status)).padStart(2, "0");
    default:
      return l[key].toLowerCase();
  }
}

const COLUMNS: { key: SortKey | null; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "platform", label: "Platform" },
  { key: null, label: "Profile" },
  { key: null, label: "Category" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Date added" },
  { key: "followUpDate", label: "Follow-up" },
  { key: null, label: "Notes" },
  { key: null, label: "" },
];

function FollowUpText({ lead }: { lead: Lead }) {
  if (!lead.followUpDate) return <span className="text-slate-400">—</span>;
  if (lead.followUpDone) {
    return <span className="text-slate-400">{formatDate(lead.followUpDate)} (done)</span>;
  }
  const bucket = followUpBucket(lead);
  const cls =
    bucket === "overdue" ? "font-medium text-rose-600" : bucket === "today" ? "font-medium text-amber-600" : "text-slate-700";
  return (
    <span className={cls}>
      {formatDate(lead.followUpDate)}
      {bucket === "overdue" && " (overdue)"}
      {bucket === "today" && " (today)"}
    </span>
  );
}

function ProfileLink({ url }: { url: string }) {
  if (!url) return <span className="text-slate-400">—</span>;
  return (
    <a
      href={safeUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-brand-700 hover:underline"
    >
      <ExternalLink size={14} /> Open
    </a>
  );
}

interface Props {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onStatusChange: (lead: Lead, status: LeadStatus) => void;
}

export default function LeadTable({ leads, onEdit, onDelete, onStatusChange }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "createdAt", dir: -1 });

  const sorted = useMemo(
    () =>
      [...leads].sort((a, b) => {
        const av = sortValue(a, sort.key);
        const bv = sortValue(b, sort.key);
        return (av < bv ? -1 : av > bv ? 1 : 0) * sort.dir;
      }),
    [leads, sort],
  );

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  }

  const actions = (l: Lead) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => onEdit(l)}
        aria-label={`Edit ${l.name}`}
        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={() => onDelete(l)}
        aria-label={`Delete ${l.name}`}
        className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop table */}
      <div className="panel hidden overflow-x-auto md:block">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              {COLUMNS.map(({ key, label }) => (
                <th key={label || "actions"} className="px-4 py-3 font-medium">
                  {key ? (
                    <button onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 hover:text-slate-900">
                      {label}
                      <ArrowUpDown size={13} className={sort.key === key ? "text-brand-700" : "text-slate-300"} />
                    </button>
                  ) : (
                    label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((l) => (
              <tr key={l.id} className="align-middle hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-900">{l.name}</td>
                <td className="px-4 py-3">
                  <Badge className={PLATFORM_STYLES[l.platform]}>{l.platform}</Badge>
                </td>
                <td className="px-4 py-3">
                  <ProfileLink url={l.profileUrl} />
                </td>
                <td className="px-4 py-3 text-slate-600">{l.category || "—"}</td>
                <td className="px-4 py-3">
                  <StatusSelect value={l.status} onChange={(s) => onStatusChange(l, s)} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(msToISO(l.createdAt))}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <FollowUpText lead={l} />
                </td>
                <td className="px-4 py-3">
                  <p className="max-w-[14rem] truncate text-slate-600" title={l.notes}>
                    {l.notes || "—"}
                  </p>
                </td>
                <td className="px-4 py-3">{actions(l)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {sorted.map((l) => (
          <li key={l.id} className="panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{l.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {l.category || "No category"} · Added {formatDate(msToISO(l.createdAt))}
                </p>
              </div>
              <Badge className={PLATFORM_STYLES[l.platform]}>{l.platform}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <StatusSelect value={l.status} onChange={(s) => onStatusChange(l, s)} />
              <span className="text-slate-500">
                Follow-up: <FollowUpText lead={l} />
              </span>
            </div>
            {l.notes && <p className="mt-3 line-clamp-3 text-sm text-slate-600">{l.notes}</p>}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
              <ProfileLink url={l.profileUrl} />
              {actions(l)}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
