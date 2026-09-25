import { Search } from "lucide-react";
import { LEAD_STATUSES, PLATFORMS } from "@/lib/constants";
import type { LeadStatus, Platform } from "@/types";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  platform: Platform | "";
  onPlatform: (v: Platform | "") => void;
  status: LeadStatus | "";
  onStatus: (v: LeadStatus | "") => void;
}

export default function LeadFilters({ search, onSearch, platform, onPlatform, status, onStatus }: Props) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search name, category, or notes"
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
    </div>
  );
}
