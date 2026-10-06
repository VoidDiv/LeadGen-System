/* ============================================================
   FILE: lib/reports.ts   (NEW)
   Everything the Reports page needs, as plain functions:
   - the date range of "this week", "last week", "this month", "last month" or your own dates,
   - the numbers of a report (leads gathered, prospects contacted, responses, follow-ups,
     appointments, content),
   - the report as plain text (to paste into an email or a message),
   - the leads as a CSV file (opens in Excel / Google Sheets).
   Weeks start on Monday.
   ============================================================ */

import { LEAD_STATUSES, OPPORTUNITY_STATUSES, PLATFORMS } from "./constants";
import { addDaysISO, endOfMonthISO, followUpBucket, formatDate, msToISO, startOfMonthISO, startOfWeekISO, todayISO } from "./dates";
import { TARGET_STATES, STATE_NOT_SET, STATE_OTHER, groupOfCategory, stateBucket } from "./targets";
import type { ContentItem, Lead } from "@/types";

/* ───────────────── date ranges ───────────────── */

export type PeriodId = "this-week" | "last-week" | "this-month" | "last-month" | "custom";

export interface Range {
  /** first day, YYYY-MM-DD (included) */
  from: string;
  /** last day, YYYY-MM-DD (included) */
  to: string;
  label: string;
}

export const PERIODS: { id: Exclude<PeriodId, "custom">; label: string }[] = [
  { id: "this-week", label: "This week" },
  { id: "last-week", label: "Last week" },
  { id: "this-month", label: "This month" },
  { id: "last-month", label: "Last month" },
];

export function rangeFor(id: Exclude<PeriodId, "custom">, today: string = todayISO()): Range {
  switch (id) {
    case "this-week": {
      const from = startOfWeekISO(today);
      return { from, to: addDaysISO(from, 6), label: "This week" };
    }
    case "last-week": {
      const from = addDaysISO(startOfWeekISO(today), -7);
      return { from, to: addDaysISO(from, 6), label: "Last week" };
    }
    case "this-month":
      return { from: startOfMonthISO(today), to: endOfMonthISO(today), label: "This month" };
    case "last-month": {
      const lastDay = addDaysISO(startOfMonthISO(today), -1);
      return { from: startOfMonthISO(lastDay), to: lastDay, label: "Last month" };
    }
  }
}

/** Your own dates (if they are the wrong way round, they are swapped). */
export function customRange(a: string, b: string): Range {
  const [from, to] = a <= b ? [a, b] : [b, a];
  return { from, to, label: "Custom" };
}

export function inRange(iso: string | null | undefined, r: Range): boolean {
  return !!iso && iso >= r.from && iso <= r.to;
}

export function describeRange(r: Range): string {
  return r.from === r.to ? formatDate(r.from) : `${formatDate(r.from)} – ${formatDate(r.to)}`;
}

/* ───────────────── the numbers ───────────────── */

export interface Counted {
  label: string;
  count: number;
}

export interface Report {
  range: Range;
  /** leads ADDED in the period */
  leadsGathered: number;
  /** leads whose "date contacted" is in the period */
  prospectsContacted: number;
  /** of those contacted, how many have a response */
  respondedOfContacted: number;
  /** percent (0 to 100), or null when nobody was contacted */
  responseRate: number | null;
  /** follow-ups whose date is in the period */
  followUps: { scheduled: number; completed: number; open: number };
  /** follow-ups not done and already past, right now (not only in the period) */
  overdueNow: number;
  /** leads that became an appointment / opportunity in the period (the status changed in the period) */
  appointmentsInPeriod: number;
  /** leads in the appointment / opportunity stage right now */
  inAppointmentStageNow: number;
  gatheredByPlatform: Counted[];
  contactedByPlatform: Counted[];
  gatheredByGroup: Counted[];
  gatheredByState: Counted[];
  /** content items whose date is in the period */
  content: { total: number; published: number; scheduled: number; inProgress: number };
}

const byCountThenName = (a: Counted, b: Counted) => b.count - a.count || a.label.localeCompare(b.label);

function tally(values: string[]): Counted[] {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return Array.from(m, ([label, count]) => ({ label, count })).sort(byCountThenName);
}

export function computeReport(leads: Lead[], content: ContentItem[], range: Range, today: string = todayISO()): Report {
  const added = leads.filter((l) => inRange(msToISO(l.createdAt), range));
  const contacted = leads.filter((l) => inRange(l.dateContacted, range));
  const responded = contacted.filter((l) => l.response !== "");
  const scheduled = leads.filter((l) => inRange(l.followUpDate, range));
  const became = leads.filter(
    (l) => OPPORTUNITY_STATUSES.includes(l.status) && l.statusChangedAt !== null && inRange(msToISO(l.statusChangedAt), range),
  );
  const items = content.filter((c) => inRange(c.scheduledDate, range));

  const platformCounts = (list: Lead[]): Counted[] =>
    PLATFORMS.map((p) => ({ label: p, count: list.filter((l) => l.platform === p).length }));

  return {
    range,
    leadsGathered: added.length,
    prospectsContacted: contacted.length,
    respondedOfContacted: responded.length,
    responseRate: contacted.length ? Math.round((responded.length / contacted.length) * 100) : null,
    followUps: {
      scheduled: scheduled.length,
      completed: scheduled.filter((l) => l.followUpDone).length,
      open: scheduled.filter((l) => !l.followUpDone).length,
    },
    overdueNow: leads.filter((l) => followUpBucket(l, today) === "overdue").length,
    appointmentsInPeriod: became.length,
    inAppointmentStageNow: leads.filter((l) => OPPORTUNITY_STATUSES.includes(l.status)).length,
    gatheredByPlatform: platformCounts(added),
    contactedByPlatform: platformCounts(contacted),
    gatheredByGroup: tally(added.map((l) => groupOfCategory(l.category))),
    gatheredByState: tally(added.map((l) => stateBucket(l.state))),
    content: {
      total: items.length,
      published: items.filter((c) => c.status === "Published").length,
      scheduled: items.filter((c) => c.status === "Scheduled").length,
      inProgress: items.filter((c) => c.status === "Idea" || c.status === "Draft").length,
    },
  };
}

/* ───────────────── the report as text ───────────────── */

const line = (label: string, items: Counted[]): string => {
  const shown = items.filter((i) => i.count > 0);
  return `${label}: ${shown.length ? shown.map((i) => `${i.label} ${i.count}`).join(" · ") : "none"}`;
};

export function reportToText(r: Report, observations = ""): string {
  const out: string[] = [];
  out.push(`LEAD REPORT: ${r.range.label} (${describeRange(r.range)})`);
  out.push("");
  out.push("LEADS");
  out.push(`- Leads gathered: ${r.leadsGathered}`);
  out.push(`- Prospects contacted: ${r.prospectsContacted}`);
  out.push(
    `- Responses (of those contacted): ${r.respondedOfContacted}${r.responseRate === null ? "" : ` (${r.responseRate}%)`}`,
  );
  out.push(`- Appointments / opportunities this period: ${r.appointmentsInPeriod} (in that stage now: ${r.inAppointmentStageNow})`);
  out.push("");
  out.push("FOLLOW-UPS");
  out.push(`- Scheduled in this period: ${r.followUps.scheduled} (${r.followUps.completed} completed, ${r.followUps.open} open)`);
  out.push(`- Overdue right now: ${r.overdueNow}`);
  out.push("");
  out.push("CONTENT");
  out.push(`- Published: ${r.content.published} · Scheduled: ${r.content.scheduled} · Ideas / drafts: ${r.content.inProgress}`);
  out.push("");
  out.push(line("Gathered by platform", r.gatheredByPlatform));
  out.push(line("Contacted by platform", r.contactedByPlatform));
  out.push(line("Gathered by category group", r.gatheredByGroup));
  out.push(line("Gathered by state", r.gatheredByState));
  const notes = observations.trim();
  if (notes) {
    out.push("");
    out.push("OBSERVATIONS");
    out.push(notes);
  }
  return out.join("\n");
}

/* ───────────────── the leads as a CSV file ───────────────── */

/** One CSV cell. Quotes and commas are escaped, and a cell that starts with = + - @ cannot run as a spreadsheet formula. */
export function csvCell(value: string | number | null | undefined): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const CSV_HEADERS = [
  "Name",
  "Platform",
  "Profile URL",
  "Category",
  "Category group",
  "State",
  "Profession",
  "Status",
  "Date added",
  "Date contacted",
  "Response",
  "Follow-up date",
  "Follow-up status",
  "Notes",
];

function followUpStatus(l: Lead, today: string): string {
  if (!l.followUpDate) return "";
  if (l.followUpDone) return "Done";
  const b = followUpBucket(l, today);
  return b === "overdue" ? "Overdue" : b === "today" ? "Due today" : "Upcoming";
}

/** Starts with a byte-order mark so Excel reads the accents and symbols correctly. */
export function leadsToCSV(leads: Lead[], today: string = todayISO()): string {
  const rows = leads.map((l) =>
    [
      l.name,
      l.platform,
      l.profileUrl,
      l.category,
      groupOfCategory(l.category),
      l.state,
      l.profession,
      l.status,
      msToISO(l.createdAt),
      l.dateContacted ?? "",
      l.response,
      l.followUpDate ?? "",
      followUpStatus(l, today),
      l.notes,
    ]
      .map(csvCell)
      .join(","),
  );
  return `\uFEFF${[CSV_HEADERS.map(csvCell).join(","), ...rows].join("\r\n")}\r\n`;
}

/* The same lists the Dashboard shows, in workflow order. */
export const PIPELINE_ORDER = LEAD_STATUSES;
export { TARGET_STATES, STATE_NOT_SET, STATE_OTHER };