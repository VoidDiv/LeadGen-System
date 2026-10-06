/* ============================================================
   FILE: types/index.ts   (REPLACE whole file)
   CHANGED: a lead now also has a state, a profession, the date
   contacted, the response, and the time its status last changed.
   A content item now also has a caption, hashtags and a call to action.
   ============================================================ */

import type { CONTENT_STATUSES, CONTENT_TYPES, LEAD_STATUSES, PLATFORMS, RESPONSES } from "@/lib/constants";

export type Platform = (typeof PLATFORMS)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadResponse = (typeof RESPONSES)[number];
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];

export interface Lead {
  id: string;
  name: string;
  platform: Platform;
  profileUrl: string;
  /** e.g. "Veterans", "CPAs": see lib/targets.ts (any text is allowed) */
  category: string;
  /** One of the target states, "Other", or "" when not set */
  state: string;
  profession: string;
  status: LeadStatus;
  /** YYYY-MM-DD the lead was first contacted, or null */
  dateContacted: string | null;
  /** How the lead replied, or "" when there is no response yet */
  response: LeadResponse | "";
  notes: string;
  /** YYYY-MM-DD, or null when no follow-up is set */
  followUpDate: string | null;
  followUpDone: boolean;
  /** Date added, in milliseconds */
  createdAt: number;
  /** When the status last changed, in milliseconds (null for leads saved before this existed) */
  statusChangedAt: number | null;
}
export type LeadInput = Omit<Lead, "id" | "createdAt">;

export interface ContentItem {
  id: string;
  title: string;
  platform: Platform;
  contentType: ContentType;
  status: ContentStatus;
  /** YYYY-MM-DD, or null */
  scheduledDate: string | null;
  /** The text of the post */
  caption: string;
  /** e.g. "#retirement #veterans" */
  hashtags: string;
  /** The call to action, e.g. "Book a free call" */
  cta: string;
  notes: string;
  createdAt: number;
}
export type ContentInput = Omit<ContentItem, "id" | "createdAt">;