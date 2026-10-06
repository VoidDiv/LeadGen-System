/* ============================================================
   FILE: lib/constants.ts   (REPLACE whole file)
   CHANGED: the lead statuses follow your workflow
   (Find -> Qualify -> Engage -> Contact -> Follow up -> Appointment), a new
   "Engaged" status, the new "Response" choices, and the weekly limit now
   lives here (the Leads page and the Dashboard both use it).
   Statuses saved before keep working: nothing was renamed.
   ============================================================ */

import type { ContentStatus, LeadResponse, LeadStatus, Platform } from "@/types";
import { ALL_CATEGORIES } from "./targets";

export const PLATFORMS = ["LinkedIn", "Facebook", "Instagram", "TikTok"] as const;

/** In workflow order: New (found) -> Qualified -> Engaged -> Contacted -> Responded -> Appointment -> Converted. */
export const LEAD_STATUSES = [
  "New",
  "Qualified",
  "Engaged",
  "Contacted",
  "Responded",
  "Appointment",
  "Converted",
  "Not Interested",
] as const;

/** How the lead replied (empty = no response yet). */
export const RESPONSES = ["Replied", "Interested", "Not interested", "Booked a call"] as const;

export const CONTENT_STATUSES = ["Idea", "Draft", "Scheduled", "Published"] as const;
export const CONTENT_TYPES = ["Post", "Reel", "Story", "Video", "Carousel", "Article"] as const;

/** Change this number to raise or lower the weekly limit of new leads. */
export const WEEKLY_LEAD_LIMIT = 100;

/** From "Contacted" on, the lead has been contacted: the date contacted is filled in for you when it is empty. */
export const CONTACTED_STATUSES: readonly LeadStatus[] = ["Contacted", "Responded", "Appointment", "Converted"];

/** Statuses that count as an appointment / opportunity. */
export const OPPORTUNITY_STATUSES: readonly LeadStatus[] = ["Appointment", "Converted"];

/** Suggestions only: the Category field accepts any text. */
export const CATEGORIES = ALL_CATEGORIES;

export const PLATFORM_STYLES: Record<Platform, string> = {
  LinkedIn: "bg-sky-100 text-sky-800",
  Facebook: "bg-blue-100 text-blue-800",
  Instagram: "bg-pink-100 text-pink-800",
  TikTok: "bg-slate-200 text-slate-800",
};

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-slate-100 text-slate-700",
  Qualified: "bg-amber-100 text-amber-800",
  Engaged: "bg-cyan-100 text-cyan-800",
  Contacted: "bg-blue-100 text-blue-800",
  Responded: "bg-violet-100 text-violet-800",
  Appointment: "bg-teal-100 text-teal-800",
  Converted: "bg-emerald-100 text-emerald-800",
  "Not Interested": "bg-rose-100 text-rose-700",
};

export const RESPONSE_STYLES: Record<LeadResponse, string> = {
  Replied: "bg-blue-100 text-blue-800",
  Interested: "bg-emerald-100 text-emerald-800",
  "Not interested": "bg-rose-100 text-rose-700",
  "Booked a call": "bg-teal-100 text-teal-800",
};

export const CONTENT_STATUS_STYLES: Record<ContentStatus, string> = {
  Idea: "bg-slate-100 text-slate-700",
  Draft: "bg-amber-100 text-amber-800",
  Scheduled: "bg-blue-100 text-blue-800",
  Published: "bg-emerald-100 text-emerald-800",
};