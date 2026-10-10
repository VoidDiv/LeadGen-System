/* ============================================================
   FILE: components/pwa/InstallButton.tsx   (NEW)
   The "Install app" button (in the sidebar and in the phone header).
   - Android / Chrome / Edge: one tap opens the phone's install window.
   - iPhone / iPad: iOS has no install window, so the button shows the
     "Share > Add to Home Screen" steps instead.
   - Hidden when the app is already installed, or when the browser can't install.
   ============================================================ */

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Download, Share } from "lucide-react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/* The browser announces "this app can be installed" only once per page load,
   so it is kept here (outside React) and survives moving between pages. */
let savedPrompt: InstallEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // show our own button instead of the browser's small bar
    savedPrompt = e as InstallEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    savedPrompt = null;
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
const getPrompt = () => savedPrompt;
const getInstalled = () => installed;
const getFalse = () => false;
const getNull = () => null;

const getStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches === true ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const getIos = () =>
  /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

/** Facebook / Messenger / Instagram browsers can't add apps to the home screen. */
const getInAppBrowser = () => /FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\//i.test(navigator.userAgent);

interface Props {
  /** "sidebar": a full-width row at the bottom of the sidebar (the steps open upward).
      "header": a small button in the phone header (the steps open downward). */
  variant: "sidebar" | "header";
}

export default function InstallButton({ variant }: Props) {
  const prompt = useSyncExternalStore(subscribe, getPrompt, getNull);
  const justInstalled = useSyncExternalStore(subscribe, getInstalled, getFalse);
  const standalone = useSyncExternalStore(noop, getStandalone, getFalse);
  const ios = useSyncExternalStore(noop, getIos, getFalse);
  const inApp = useSyncExternalStore(noop, getInAppBrowser, getFalse);

  const [guideOpen, setGuideOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  // Close the iPhone steps when tapping anywhere else, or with Escape
  useEffect(() => {
    if (!guideOpen) return;
    const onDown = (e: Event) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setGuideOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setGuideOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [guideOpen]);

  if (standalone || justInstalled) return null; // already installed
  if (!prompt && !ios) return null; // this browser can't install

  async function onClick() {
    if (prompt) {
      await prompt.prompt();
      await prompt.userChoice;
      savedPrompt = null; // the browser allows one try per announcement
      emit();
      return;
    }
    setGuideOpen((v) => !v);
  }

  const button =
    variant === "sidebar" ? (
      <button
        type="button"
        onClick={onClick}
        aria-expanded={prompt ? undefined : guideOpen}
        className="flex w-full items-center gap-2 rounded-md border border-brass-400/60 px-3 py-2 text-sm font-medium text-brass-400 hover:bg-white/5"
      >
        <Download size={16} /> Install app
      </button>
    ) : (
      <button
        type="button"
        onClick={onClick}
        aria-label="Install app"
        aria-expanded={prompt ? undefined : guideOpen}
        className="flex items-center gap-1.5 rounded-md border border-brass-400/60 px-2.5 py-1 text-xs font-medium text-brass-400"
      >
        <Download size={14} /> Install
      </button>
    );

  return (
    <div ref={wrapper} className="relative">
      {button}
      {guideOpen && (
        <div
          role="dialog"
          aria-label="How to install the app"
          className={`absolute z-40 w-64 rounded-md border border-slate-200 bg-white p-4 text-left text-sm text-slate-700 shadow-lg ${
            variant === "sidebar" ? "bottom-full left-0 mb-2" : "right-0 top-full mt-2"
          }`}
        >
          <p className="font-semibold text-slate-900">Add to your Home Screen</p>
          {inApp && (
            <p className="mt-2 text-slate-600">This browser can&apos;t install apps. Open this page in Safari first.</p>
          )}
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-slate-600">
            <li>
              Tap <Share size={14} className="inline align-[-2px]" aria-label="Share" /> <b className="text-slate-900">Share</b> in
              Safari.
            </li>
            <li>
              Choose <b className="text-slate-900">Add to Home Screen</b>.
            </li>
            <li>
              Tap <b className="text-slate-900">Add</b>.
            </li>
          </ol>
          <button
            type="button"
            onClick={() => setGuideOpen(false)}
            className="mt-3 w-full rounded-md bg-brand-800 py-1.5 text-xs font-medium text-white hover:bg-brand-900"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}