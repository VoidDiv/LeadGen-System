/* ============================================================
   FILE: components/layout/AppShell.tsx   (REPLACE whole file)
   CHANGED (one line): the bottom padding on phones now includes the
   iPhone home-bar space, so the last row is never hidden behind the menu.
   ============================================================ */

"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isFirebaseConfigured } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center p-6 text-center">{children}</div>;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !onLogin) router.replace("/login");
    if (user && isAdmin && onLogin) router.replace("/");
  }, [loading, user, isAdmin, onLogin, router]);

  if (!isFirebaseConfigured) {
    return (
      <Centered>
        <div className="max-w-sm">
          <h1 className="text-lg font-semibold text-slate-900">Firebase isn&apos;t set up yet</h1>
          <p className="mt-2 text-sm text-slate-600">
            Copy <code>.env.local.example</code> to <code>.env.local</code>, fill in your Firebase web app settings, then
            restart the dev server.
          </p>
        </div>
      </Centered>
    );
  }

  if (loading) {
    return (
      <Centered>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
      </Centered>
    );
  }

  if (!user) return onLogin ? <>{children}</> : null;

  if (!isAdmin) {
    return (
      <Centered>
        <div className="max-w-sm">
          <h1 className="text-lg font-semibold text-slate-900">This account isn&apos;t an admin</h1>
          <p className="mt-2 text-sm text-slate-600">
            {user.email} is signed in but doesn&apos;t have admin access. Ask the account owner to add it, then sign in again.
          </p>
          <Button className="mt-4" variant="secondary" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </Centered>
    );
  }

  if (onLogin) return null;

  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="md:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pb-8">
          {children}
        </div>
      </main>
    </>
  );
}