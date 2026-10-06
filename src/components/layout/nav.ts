/* ============================================================
   FILE: components/layout/nav.ts   (REPLACE whole file)
   NEW: Reports.
   ============================================================ */

import { CalendarCheck, FileText, LayoutDashboard, PenLine, Users } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/follow-ups", label: "Follow-ups", icon: CalendarCheck },
  { href: "/content", label: "Content", icon: PenLine },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}