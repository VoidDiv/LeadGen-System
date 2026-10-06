/* ============================================================
   FILE: lib/dates.ts   (REPLACE whole file)
   ADDED at the bottom: helpers for weeks and months (used by the
   weekly limit, the Dashboard and the Reports page).
   Everything above is unchanged.
   ============================================================ */

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

/* ───────────────── weeks and months (new) ───────────────── */

/** Midnight (local) at the start of a YYYY-MM-DD date, in milliseconds. */
export function isoToMs(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

/** The date `n` days after (or before, if negative) a YYYY-MM-DD date. */
export function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return msToISO(new Date(y, m - 1, d + n).getTime());
}

/** The Monday of the week that contains the date (weeks start on Monday). */
export function startOfWeekISO(iso: string = todayISO()): string {
  const [y, m, d] = iso.split("-").map(Number);
  const daysSinceMonday = (new Date(y, m - 1, d).getDay() + 6) % 7;
  return addDaysISO(iso, -daysSinceMonday);
}

export const startOfMonthISO = (iso: string): string => `${iso.slice(0, 8)}01`;

export function endOfMonthISO(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}`;
}