import type { CONTENT_STATUSES, CONTENT_TYPES, LEAD_STATUSES, PLATFORMS } from "@/lib/constants";

export type Platform = (typeof PLATFORMS)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type ContentType = (typeof CONTENT_TYPES)[number];

export interface Lead {
  id: string;
  name: string;
  platform: Platform;
  profileUrl: string;
  category: string;
  status: LeadStatus;
  notes: string;
  /** YYYY-MM-DD, or null when no follow-up is set */
  followUpDate: string | null;
  followUpDone: boolean;
  /** Date added, in milliseconds */
  createdAt: number;
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
  notes: string;
  createdAt: number;
}
export type ContentInput = Omit<ContentItem, "id" | "createdAt">;
