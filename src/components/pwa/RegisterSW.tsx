/* ============================================================
   FILE: components/pwa/RegisterSW.tsx   (NEW)
   Turns on the service worker (public/sw.js). Draws nothing.
   Only in production: while you run `npm run dev` it removes any old
   service worker instead, so you always see your latest code.
   ============================================================ */

"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  }, []);

  return null;
}