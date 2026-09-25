const pad = (n: number) => String(n).padStart(2, "0");

/** Local date as YYYY-MM-DD. Follow-up dates are plain date strings, so timezones never shift them. */
export function msToISO(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const todayISO = () => msToISO(Date.now());

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export type FollowUpBucket = "overdue" | "today" | "upcoming";

/** Which follow-up group a lead belongs to, or null if it has none pending. */
export function followUpBucket(
  lead: { followUpDate: string | null; followUpDone: boolean },
  today: string = todayISO(),
): FollowUpBucket | null {
  if (!lead.followUpDate || lead.followUpDone) return null;
  if (lead.followUpDate < today) return "overdue";
  if (lead.followUpDate === today) return "today";
  return "upcoming";
}
