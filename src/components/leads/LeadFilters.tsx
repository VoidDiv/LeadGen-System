/* ============================================================
   FILE: components/leads/LeadFilters.tsx   (REPLACE whole file)
   NEW: filter by state and by category group.
   ============================================================ */

import { Search } from "lucide-react";
import { LEAD_STATUSES, PLATFORMS } from "@/lib/constants";
import { CATEGORY_GROUPS, GROUP_OTHER, STATE_NOT_SET, STATE_OTHER, TARGET_STATES } from "@/lib/targets";
import type { LeadStatus, Platform } from "@/types";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  platform: Platform | "";
  onPlatform: (v: Platform | "") => void;
  status: LeadStatus | "";
  onStatus: (v: LeadStatus | "") => void;
  /** a target state, "Other", "Not set", or "" for all */
  state: string;
  onState: (v: string) => void;
  /** a category group, "Other", or "" for all */
  group: string;
  onGroup: (v: string) => void;
}

export default function LeadFilters({
  search,
  onSearch,
  platform,
  onPlatform,
  status,
  onStatus,
  state,
  onState,
  group,
  onGroup,
}: Props) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <div className="relative min-w-[14rem] flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search name, category, profession, or notes"
          aria-label="Search leads"
          className="input pl-9"
        />
      </div>
      <select
        value={platform}
        onChange={(e) => onPlatform(e.target.value as Platform | "")}
        aria-label="Filter by platform"
        className="input sm:w-40"
      >
        <option value="">All platforms</option>
        {PLATFORMS.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => onStatus(e.target.value as LeadStatus | "")}
        aria-label="Filter by status"
        className="input sm:w-44"
      >
        <option value="">All statuses</option>
        {LEAD_STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select value={state} onChange={(e) => onState(e.target.value)} aria-label="Filter by state" className="input sm:w-40">
        <option value="">All states</option>
        {[...TARGET_STATES, STATE_OTHER, STATE_NOT_SET].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select value={group} onChange={(e) => onGroup(e.target.value)} aria-label="Filter by category group" className="input sm:w-56">
        <option value="">All category groups</option>
        {[...CATEGORY_GROUPS.map((g) => g.group), GROUP_OTHER].map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>
    </div>
  );
}