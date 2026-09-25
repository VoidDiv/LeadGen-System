"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NAV_ITEMS, isActive } from "./nav";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-brand-900 md:flex">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-brass-500 text-white">
          <Shield size={18} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">GFI Leads</p>
          <p className="text-xs text-brand-300">Armed Forces Division</p>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`mb-1 flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-brass-400 bg-white/10 text-white"
                  : "border-transparent text-brand-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-xs text-brand-300">{user?.email}</p>
        <button onClick={() => signOut()} className="mt-2 flex items-center gap-2 text-sm text-brand-200 hover:text-white">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
