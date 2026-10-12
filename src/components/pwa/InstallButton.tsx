/* ============================================================
   FILE: components/pwa/InstallButton.tsx   (REPLACE whole file)
   The "Install app" button (phone header + bottom of the sidebar).

   - Android / computer (Chrome, Edge, Samsung Internet): one tap opens the
     phone's own "Install app?" window. No tutorial.
   - iPhone / iPad: Apple doesn't allow websites to install themselves, so
     the button shows one short line: Share > Add to Home Screen.
   - Hidden once the app is installed.

   The browser's "ready to install" signal is caught early by a small script
   in app/layout.tsx (window.__gfiInstall), so the button never misses it.
   ============================================================ */

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Download, Share } from "lucide-react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __gfiInstall?: InstallEvent | null;
  }
}

let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  // In case the early script in layout.tsx is missing, catch it here too
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.__gfiInstall = e as InstallEvent;
    emit();
  });
  window.addEventListener("gfi-install-ready", emit);
  window.addEventListener("appinstalled", () => {
    window.__gfiInstall = null;
    installed = true;
    emit();
  });
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
const noop = () => () => {};
const getPrompt = () => window.__gfiInstall ?? null;
const getInstalled = () => installed;
const getFalse = () => false;
const getNull = () => null;

const getStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches === true ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const getIos = () =>
  /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

interface Props {
  /** "sidebar": full-width row at the bottom of the sidebar. "header": small button in the phone header. */
  variant: "sidebar" | "header";
}

export default function InstallButton({ variant }: Props) {
  const prompt = useSyncExternalStore(subscribe, getPrompt, getNull);
  const justInstalled = useSyncExternalStore(subscribe, getInstalled, getFalse);
  const standalone = useSyncExternalStore(noop, getStandalone, getFalse);
  const ios = useSyncExternalStore(noop, getIos, getFalse);

  const [tipOpen, setTipOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  // Close the iPhone tip when tapping anywhere else
  useEffect(() => {
    if (!tipOpen) return;
    const onDown = (e: Event) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setTipOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [tipOpen]);

  if (standalone || justInstalled) return null; // already installed
  // Android / computer: show the button only when the browser can install in one tap
  if (!prompt && !ios) return null;

  async function onClick() {
    if (prompt) {
      await prompt.prompt(); // the phone's own "Install app?" window
      const { outcome } = await prompt.userChoice;
      window.__gfiInstall = null; // each signal can be used once
      if (outcome === "accepted") installed = true;
      emit();
      return;
    }
    setTipOpen((v) => !v); // iPhone
  }

  const button =
    variant === "sidebar" ? (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-2 rounded-md border border-brass-400/60 px-3 py-2 text-sm font-medium text-brass-400 hover:bg-white/5"
      >
        <Download size={16} /> Install app
      </button>
    ) : (
      <button
        type="button"
        onClick={onClick}
        aria-label="Install app"
        className="flex items-center gap-1.5 rounded-md border border-brass-400/60 px-2.5 py-1 text-xs font-medium text-brass-400"
      >
        <Download size={14} /> Install
      </button>
    );

  return (
    <div ref={wrapper} className="relative">
      {button}
      {tipOpen && (
        <p
          role="status"
          className={`absolute z-40 w-60 rounded-md border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 shadow-lg ${
            variant === "sidebar" ? "bottom-full left-0 mb-2" : "right-0 top-full mt-2"
          }`}
        >
          Tap <Share size={14} className="inline align-[-2px]" aria-label="Share" /> <b className="text-slate-900">Share</b>, then{" "}
          <b className="text-slate-900">Add to Home Screen</b>.
        </p>
      )}
    </div>
  );
}