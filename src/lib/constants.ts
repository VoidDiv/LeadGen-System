import type { ContentStatus, LeadStatus, Platform } from "@/types";

export const PLATFORMS = ["LinkedIn", "Facebook", "Instagram", "TikTok"] as const;

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Responded",
  "Qualified",
  "Appointment",
  "Converted",
  "Not Interested",
] as const;

export const CONTENT_STATUSES = ["Idea", "Draft", "Scheduled", "Published"] as const;
export const CONTENT_TYPES = ["Post", "Reel", "Story", "Video", "Carousel", "Article"] as const;

/** Suggestions only: the Category field accepts any text. */
export const CATEGORIES = ["Active Military", "Veteran", "Military Spouse", "Reservist", "Civilian", "Other"];

export const PLATFORM_STYLES: Record<Platform, string> = {
  LinkedIn: "bg-sky-100 text-sky-800",
  Facebook: "bg-blue-100 text-blue-800",
  Instagram: "bg-pink-100 text-pink-800",
  TikTok: "bg-slate-200 text-slate-800",
};

export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-blue-100 text-blue-800",
  Responded: "bg-violet-100 text-violet-800",
  Qualified: "bg-amber-100 text-amber-800",
  Appointment: "bg-teal-100 text-teal-800",
  Converted: "bg-emerald-100 text-emerald-800",
  "Not Interested": "bg-rose-100 text-rose-700",
};

export const CONTENT_STATUS_STYLES: Record<ContentStatus, string> = {
  Idea: "bg-slate-100 text-slate-700",
  Draft: "bg-amber-100 text-amber-800",
  Scheduled: "bg-blue-100 text-blue-800",
  Published: "bg-emerald-100 text-emerald-800",
};
