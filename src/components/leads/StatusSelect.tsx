import { LEAD_STATUSES, LEAD_STATUS_STYLES } from "@/lib/constants";
import type { LeadStatus } from "@/types";

interface Props {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
}

export default function StatusSelect({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      aria-label="Change status"
      className={`cursor-pointer rounded-full border-0 py-1 pl-2.5 pr-7 text-xs font-medium ${LEAD_STATUS_STYLES[value]}`}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
