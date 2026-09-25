import { Check, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { LEAD_STATUS_STYLES, PLATFORM_STYLES } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { safeUrl } from "@/lib/utils";
import type { Lead } from "@/types";

const HEADING = {
  overdue: "text-rose-700",
  today: "text-amber-700",
  upcoming: "text-slate-900",
};

interface Props {
  title: string;
  tone: keyof typeof HEADING;
  items: Lead[];
  empty: string;
  onComplete: (lead: Lead) => void;
}

export default function FollowUpList({ title, tone, items, empty, onComplete }: Props) {
  return (
    <section>
      <h2 className={`mb-2 text-base font-semibold ${HEADING[tone]}`}>
        {title} <span className="font-normal text-slate-500">({items.length})</span>
      </h2>

      {items.length === 0 ? (
        <p className="panel p-4 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="panel divide-y divide-slate-100">
          {items.map((l) => (
            <li key={l.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-900">{l.name}</p>
                  <Badge className={PLATFORM_STYLES[l.platform]}>{l.platform}</Badge>
                  <Badge className={LEAD_STATUS_STYLES[l.status]}>{l.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Due {formatDate(l.followUpDate)}
                  {l.category && ` · ${l.category}`}
                </p>
                {l.notes && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{l.notes}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {l.profileUrl && (
                  <a
                    href={safeUrl(l.profileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
                  >
                    <ExternalLink size={14} /> Profile
                  </a>
                )}
                <Button variant="secondary" onClick={() => onComplete(l)}>
                  <Check size={16} /> Mark completed
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
