/* ============================================================
   FILE: components/layout/MobileNav.tsx   (REPLACE whole file)
   NEW: the "Install" button in the phone header, and room for the
   iPhone notch (top) and home bar (bottom) when the app is installed.
   ============================================================ */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import InstallButton from "@/components/pwa/InstallButton";
import { NAV_ITEMS, isActive } from "./nav";

export default function MobileNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-brand-900 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-brass-500 text-white">
            <Shield size={15} />
          </div>
          <span className="text-sm font-semibold text-white">GFI Leads</span>
        </div>
        <div className="flex items-center gap-3">
          <InstallButton variant="header" />
          <button onClick={() => signOut()} aria-label="Sign out" className="p-1 text-brand-200 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 border-t-2 py-2.5 text-[11px] font-medium ${
                active ? "border-brass-500 text-brand-800" : "border-transparent text-slate-500"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}